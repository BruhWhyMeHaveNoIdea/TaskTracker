document.addEventListener('DOMContentLoaded', function() {
    console.log('Projects details script loaded!');
    initTasks();
    initAddParticipant();
    initRemoveParticipant();
    initRemoveProject();
    initChangeProjectStatus();
})

function initTasks() {
    const taskButtons = document.querySelectorAll('.task-button');

    taskButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const taskId = this.dataset.task;
            if (taskId) {
                window.location.href=`/tasks/detail/${taskId}/`
            }
        });
    })
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function initAddParticipant() {
    const addParticipantButton = document.getElementById('addParticipant');
    const participantModal = document.getElementById('participantModal');
    const cancelBtn = document.getElementById('cancelBtn-participant');
    const participantForm = document.getElementById('participantForm');
    const errorContainer = document.getElementById('participantFormErrors');
    const participantInput = document.getElementById('participantUsername');
    
    if (!addParticipantButton || !participantModal) return;
    
    // Открытие модального окна
    addParticipantButton.addEventListener('click', function(e) {
        e.stopPropagation();
        participantModal.showModal();
        participantInput.focus();
        hideParticipantErrors();
    });

    // Закрытие модального окна
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            participantModal.close();
            participantForm.reset();
            hideParticipantErrors();
        });
    }

    // Закрытие при клике на backdrop
    participantModal.addEventListener('click', function(e) {
        const rect = participantModal.getBoundingClientRect();
        const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
        if (!isInDialog) {
            participantModal.close();
            participantForm.reset();
            hideParticipantErrors();
        }
    });

    // Обработка отправки формы
    if (participantForm) {
        participantForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            hideParticipantErrors();
            
            const projectId = window.location.pathname.split('/').filter(Boolean).pop();
            const username = participantInput ? participantInput.value.trim() : '';
            
            if (!username) {
                showParticipantErrors({
                    'username': ['Введите username пользователя']
                });
                return;
            }
            
            try {
                // Поиск пользователя по username
                const userSearchResponse = await fetch(`/api/user/search/?username=${encodeURIComponent(username)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    }
                });
                
                if (!userSearchResponse.ok) {
                    throw new Error('Ошибка поиска пользователя');
                }
                
                const userData = await userSearchResponse.json();
                
                if (!userData.users || userData.users.length === 0) {
                    showParticipantErrors({
                        'username': ['Пользователь не найден']
                    });
                    return;
                }
                
                const user = userData.users[0];
                
                const response = await fetch(`/projects/add_participant/${projectId}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({ user_id: user.id })
                });
                
                if (response.ok) {
                    participantModal.close();
                    participantForm.reset();
                    showNotification('success', 'Участник успешно добавлен!');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    const data = await response.json();
                    showParticipantErrors({
                        'username': [data.error || 'Произошла ошибка при добавлении участника']
                    });
                }
            } catch (error) {
                console.error('Error adding participant:', error);
                showParticipantErrors({
                    'username': ['Произошла ошибка при добавлении участника']
                });
            }
        });
    }
}

function initRemoveParticipant() {
    const removeButtons = document.querySelectorAll('.remove-participant');
    
    removeButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.stopPropagation();
            const projectId = this.dataset.project;
            const userId = this.dataset.user;
            
            if (!confirm('Удалить этого участника из проекта?')) {
                return;
            }
            
            try {
                const response = await fetch(`/projects/remove_participant/${projectId}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({ user_id: userId })
                });
                
                if (response.ok) {
                    showNotification('success', 'Участник удалён из проекта!');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    const data = await response.json();
                    showNotification('error', data.error || 'Произошла ошибка при удалении участника.');
                }
            } catch (error) {
                console.error('Error removing participant:', error);
                showNotification('error', 'Произошла ошибка при удалении участника.');
            }
        });
    });
}

function showParticipantErrors(errors) {
    const errorContainer = document.getElementById('participantFormErrors');
    if (!errorContainer) return;
    
    errorContainer.innerHTML = '';
    for (const [field, messages] of Object.entries(errors)) {
        if (Array.isArray(messages)) {
            messages.forEach(msg => {
                const p = document.createElement('p');
                p.textContent = msg;
                errorContainer.appendChild(p);
            });
        }
    }
    errorContainer.classList.remove('hidden');
}

function hideParticipantErrors() {
    const errorContainer = document.getElementById('participantFormErrors');
    if (errorContainer) {
        errorContainer.classList.add('hidden');
        errorContainer.innerHTML = '';
    }
}

function initRemoveProject() {
    const removeProjectButton = document.getElementById('removeProject');
    
    if (!removeProjectButton) return;
    
    removeProjectButton.addEventListener('click', async function(e) {
        e.stopPropagation();
        console.log('start remove project');
        const projectId = this.dataset.project || window.location.pathname.split('/').filter(Boolean).pop();
        
        if (!confirm('Вы уверены, что хотите удалить этот проект? Это действие нельзя отменить.')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/project/remove/${projectId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });
            
            if (response.ok) {
                showNotification('success', 'Проект успешно удалён!');
                setTimeout(() => {
                    window.location.href = '/projects/';
                }, 1000);
            } else {
                const data = await response.json();
                showNotification('error', data.error || 'Произошла ошибка при удалении проекта.');
            }
        } catch (error) {
            console.error('Error removing project:', error);
            showNotification('error', 'Произошла ошибка при удалении проекта.');
        }
    });
}

function initChangeProjectStatus() {
    const changeStatusButton = document.getElementById('changeProjectStatus');
    const statusMenu = document.getElementById('projectStatusMenu');
    
    if (!changeStatusButton || !statusMenu) return;
    
    // Открытие/закрытие меню
    changeStatusButton.addEventListener('click', function(e) {
        e.stopPropagation();
        statusMenu.classList.toggle('hidden');
    });
    
    // Закрытие меню при клике вне его
    document.addEventListener('click', function(e) {
        if (!changeStatusButton.contains(e.target) && !statusMenu.contains(e.target)) {
            statusMenu.classList.add('hidden');
        }
    });
    
    // Обработка выбора статуса
    const statusOptions = statusMenu.querySelectorAll('.project-status-option');
    statusOptions.forEach(option => {
        option.addEventListener('click', async function(e) {
            e.stopPropagation();
            const projectId = changeStatusButton.dataset.project || window.location.pathname.split('/').filter(Boolean).pop();
            const newStatus = this.dataset.status;

            try {
                const response = await fetch(`/api/project/update/${projectId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({ status: newStatus })
                });
                
                if (response.ok) {
                    showNotification('success', `Статус проекта изменён на: ${this.textContent.trim()}`);
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    const data = await response.json();
                    showNotification('error', data.error || 'Произошла ошибка при изменении статуса.');
                }
            } catch (error) {
                console.error('Error changing project status:', error);
                showNotification('error', 'Произошла ошибка при изменении статуса.');
            }
        });
    });
}

function showNotification(type, message = null) {
    const notificationWindow = document.getElementById("notificationWindow")
    const notificationText = document.getElementById("notificationText")

    if (!notificationWindow) {
        console.error('Уведомление не найдено в DOM!')
        return
    }

    notificationText.innerText = message || (type === 'success' ? "Успешно!" : "Произошла ошибка!")

    // Устанавливаем цвет
    notificationWindow.classList.remove('bg-green-500', 'bg-red-500')
    notificationWindow.classList.add(type === 'success' ? 'bg-green-500' : 'bg-red-500')

    // Убираем все классы скрытия
    notificationWindow.classList.remove('opacity-0', 'invisible', 'pointer-events-none', 'hidden')
    
    // Добавляем z-index чтобы быть поверх всего
    notificationWindow.classList.add('z-[9999]')


    requestAnimationFrame(() => {
        notificationWindow.classList.remove('opacity-0')
        notificationWindow.classList.add('opacity-100')
    })



    setTimeout(() => {
        notificationWindow.classList.remove('opacity-100', 'z-[9999]')
        notificationWindow.classList.add('opacity-0', 'invisible', 'pointer-events-none')
        console.log('Уведомление скрыто')
    }, 3000)
    reloadPage()
}

function reloadPage() {
    setTimeout(() => {
        window.location.reload()
    }, 3000)
}