document.addEventListener("DOMContentLoaded", function() {
    initRemoveTask();
    initChangeStatus();
    initAddExecutor();
    initRemoveExecutor();
    initChangeDeadline();
    initChangePriority();
});

function initRemoveTask() {
    const removeTaskButton = document.getElementById('removeTask');
    
    if (!removeTaskButton) return;
    
    removeTaskButton.addEventListener('click', async function(e) {
        e.stopPropagation();
        const taskId = this.dataset.task || window.location.pathname.split('/').filter(Boolean).pop();
        
        if (!confirm('Вы уверены, что хотите удалить эту задачу? Это действие нельзя отменить.')) {
            return;
        }
        
        try {
            const response = await fetch(`/tasks/remove/${taskId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });
            
            if (response.ok) {
                showNotification('success', 'Задача успешно удалена!');
                setTimeout(() => {
                    window.location.href = '/tasks/';
                }, 1000);
            } else {
                const data = await response.json();
                showNotification('error', data.error || 'Произошла ошибка при удалении задачи.');
            }
        } catch (error) {
            console.error('Error removing task:', error);
            showNotification('error', 'Произошла ошибка при удалении задачи.');
        }
    });
}

function initChangeStatus() {
    const changeStatusButton = document.getElementById('changeStatus');
    const statusMenu = document.getElementById('statusMenu');
    
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
    const statusOptions = statusMenu.querySelectorAll('.status-option');
    statusOptions.forEach(option => {
        option.addEventListener('click', async function(e) {
            e.stopPropagation();
            const taskId = changeStatusButton.dataset.task || window.location.pathname.split('/').filter(Boolean).pop();
            const newStatus = this.dataset.status;

            try {
                const response = await fetch(`/tasks/change_status/${taskId}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({ status: newStatus })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    showNotification('success', `Статус изменён на: ${data.new_status}`);
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    const data = await response.json();
                    showNotification('error', data.error || 'Произошла ошибка при изменении статуса.');
                }
            } catch (error) {
                console.error('Error changing status:', error);
                showNotification('error', 'Произошла ошибка при изменении статуса.');
            }
        });
    });
}

function initAddExecutor() {
    const addExecutorButton = document.getElementById('addExecutor');
    const executorModal = document.getElementById('executorModal');
    const cancelBtn = document.getElementById('cancelBtn-executor');
    const executorForm = document.getElementById('executorForm');
    const errorContainer = document.getElementById('executorFormErrors');
    const executorInput = document.getElementById('executorUsername');
    
    if (!addExecutorButton || !executorModal || !executorInput) return;
    
    // Открытие модального окна
    addExecutorButton.addEventListener('click', function(e) {
        e.stopPropagation();
        executorModal.showModal();
        executorInput.focus();
        hideExecutorErrors();
    });

    // Закрытие модального окна
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            executorModal.close();
            executorForm.reset();
            hideExecutorErrors();
        });
    }

    // Закрытие при клике на backdrop
    executorModal.addEventListener('click', function(e) {
        const rect = executorModal.getBoundingClientRect();
        const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
        if (!isInDialog) {
            executorModal.close();
            executorForm.reset();
            hideExecutorErrors();
        }
    });

    // Обработка отправки формы
    if (executorForm) {
        executorForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            hideExecutorErrors();
            
            const taskId = window.location.pathname.split('/').filter(Boolean).pop();
            const username = executorInput ? executorInput.value.trim() : '';
            
            if (!username) {
                showExecutorErrors({
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
                    showExecutorErrors({
                        'username': ['Пользователь не найден']
                    });
                    return;
                }
                
                const user = userData.users[0];
                
                const response = await fetch(`/tasks/add_executor/${taskId}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({ user_id: user.id })
                });
                
                if (response.ok) {
                    executorModal.close();
                    executorForm.reset();
                    showNotification('success', 'Исполнитель успешно добавлен!');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    const data = await response.json();
                    showExecutorErrors({
                        'username': [data.error || 'Произошла ошибка при добавлении исполнителя']
                    });
                }
            } catch (error) {
                console.error('Error adding executor:', error);
                showExecutorErrors({
                    'username': ['Произошла ошибка при добавлении исполнителя']
                });
            }
        });
    }
}

function showExecutorErrors(errors) {
    const errorContainer = document.getElementById('executorFormErrors');
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

function hideExecutorErrors() {
    const errorContainer = document.getElementById('executorFormErrors');
    if (errorContainer) {
        errorContainer.classList.add('hidden');
        errorContainer.innerHTML = '';
    }
}

function initRemoveExecutor() {
    const removeButtons = document.querySelectorAll('.remove-executor');
    
    removeButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.stopPropagation();
            const taskId = this.dataset.task;
            const userId = this.dataset.user;
            
            if (!confirm('Удалить этого исполнителя из задачи?')) {
                return;
            }
            
            try {
                const response = await fetch(`/tasks/remove_executor/${taskId}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({ user_id: userId })
                });
                
                if (response.ok) {
                    showNotification('success', 'Исполнитель удалён из задачи!');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    const data = await response.json();
                    showNotification('error', data.error || 'Произошла ошибка при удалении исполнителя.');
                }
            } catch (error) {
                console.error('Error removing executor:', error);
                showNotification('error', 'Произошла ошибка при удалении исполнителя.');
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

function initChangeDeadline() {
    const changeDeadlineButton = document.getElementById('changeDeadline');
    const deadlineModal = document.getElementById('deadlineModal');
    const cancelBtn = document.getElementById('cancelBtn-deadline');
    const deadlineForm = document.getElementById('deadlineForm');
    const deadlineInput = document.getElementById('deadlineInput');
    const errorContainer = document.getElementById('deadlineFormErrors');
    const deadlineDisplay = document.getElementById('deadlineDisplay');
    
    if (!changeDeadlineButton || !deadlineModal || !deadlineInput) return;
    
    // Открытие модального окна
    changeDeadlineButton.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Устанавливаем минимальную дату (текущее время + 1 минута)
        if (deadlineInput) {
            const now = new Date();
            now.setMinutes(now.getMinutes() + 1);
            // Корректируем на часовой пояс (datetime-local использует локальное время)
            deadlineInput.min = now.toISOString().slice(0, 16);
            
            // Устанавливаем текущее значение, если дедлайн уже установлен
            const currentDeadline = deadlineDisplay?.textContent.trim();
            if (currentDeadline && currentDeadline !== 'Не установлен') {
                // Парсим дату из формата DD.MM.YYYY, HH:MM
                const parts = currentDeadline.split(/[\s,]+/);
                if (parts.length >= 2) {
                    const dateParts = parts[0].split('.');
                    const timeParts = parts[1].split(':');
                    const isoString = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${timeParts[0]}:${timeParts[1]}`;
                    deadlineInput.value = isoString;
                }
            }
        }
        
        deadlineModal.showModal();
        deadlineInput.focus();
        hideDeadlineErrors();
    });

    // Закрытие модального окна
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            deadlineModal.close();
            deadlineForm.reset();
            hideDeadlineErrors();
        });
    }

    // Закрытие при клике на backdrop
    deadlineModal.addEventListener('click', function(e) {
        const rect = deadlineModal.getBoundingClientRect();
        const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
        if (!isInDialog) {
            deadlineModal.close();
            deadlineForm.reset();
            hideDeadlineErrors();
        }
    });

    // Обработка отправки формы
    if (deadlineForm) {
        deadlineForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            hideDeadlineErrors();
            
            const taskId = changeDeadlineButton.dataset.task || window.location.pathname.split('/').filter(Boolean).pop();
            const deadlineValue = deadlineInput ? deadlineInput.value : '';
            
            if (!deadlineValue) {
                showDeadlineErrors({
                    'deadline': ['Выберите дату и время']
                });
                return;
            }
            
            try {
                const response = await fetch(`/tasks/change_deadline/${taskId}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({ deadline: deadlineValue })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    deadlineModal.close();
                    deadlineForm.reset();
                    showNotification('success', `Дедлайн изменён на: ${data.deadline}`);
                } else {
                    const data = await response.json();
                    showDeadlineErrors({
                        'deadline': [data.error || 'Произошла ошибка при изменении дедлайна']
                    });
                }
            } catch (error) {
                console.error('Error changing deadline:', error);
                showDeadlineErrors({
                    'deadline': ['Произошла ошибка при изменении дедлайна']
                });
            }
        });
    }
}

function showDeadlineErrors(errors) {
    const errorContainer = document.getElementById('deadlineFormErrors');
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

function hideDeadlineErrors() {
    const errorContainer = document.getElementById('deadlineFormErrors');
    if (errorContainer) {
        errorContainer.classList.add('hidden');
        errorContainer.innerHTML = '';
    }
}

function initChangePriority() {
    const changePriorityButton = document.getElementById('changePriority');
    const priorityModal = document.getElementById('priorityModal');
    const cancelBtn = document.getElementById('cancelBtn-priority');
    const priorityForm = document.getElementById('priorityForm');
    const priorityInput = document.getElementById('priorityInput');
    const errorContainer = document.getElementById('priorityFormErrors');
    const priorityDisplay = document.getElementById('priorityDisplay');
    
    if (!changePriorityButton || !priorityModal || !priorityInput) return;
    
    // Открытие модального окна
    changePriorityButton.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Устанавливаем текущее значение, если приоритет уже установлен
        const currentPriority = priorityDisplay?.textContent.trim();
        if (currentPriority && currentPriority !== 'Не указан' && !isNaN(currentPriority)) {
            priorityInput.value = parseInt(currentPriority);
        } else {
            priorityInput.value = '';
        }
        
        priorityModal.showModal();
        priorityInput.focus();
        hidePriorityErrors();
    });

    // Закрытие модального окна
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            priorityModal.close();
            priorityForm.reset();
            hidePriorityErrors();
        });
    }

    // Закрытие при клике на backdrop
    priorityModal.addEventListener('click', function(e) {
        const rect = priorityModal.getBoundingClientRect();
        const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
        if (!isInDialog) {
            priorityModal.close();
            priorityForm.reset();
            hidePriorityErrors();
        }
    });

    // Обработка отправки формы
    if (priorityForm) {
        priorityForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            hidePriorityErrors();
            
            const taskId = changePriorityButton.dataset.task || window.location.pathname.split('/').filter(Boolean).pop();
            const priorityValue = priorityInput ? priorityInput.value : '';
            
            if (!priorityValue) {
                showPriorityErrors({
                    'priority': ['Введите значение приоритета']
                });
                return;
            }
            
            try {
                const response = await fetch(`/tasks/change_priority/${taskId}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({ priority: parseInt(priorityValue) })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    priorityModal.close();
                    priorityForm.reset();
                    showNotification('success', `Приоритет изменён на: ${data.priority}`);
                } else {
                    const data = await response.json();
                    showPriorityErrors({
                        'priority': [data.error || 'Произошла ошибка при изменении приоритета']
                    });
                }
            } catch (error) {
                console.error('Error changing priority:', error);
                showPriorityErrors({
                    'priority': ['Произошла ошибка при изменении приоритета']
                });
            }
        });
    }
}

function showPriorityErrors(errors) {
    const errorContainer = document.getElementById('priorityFormErrors');
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

function hidePriorityErrors() {
    const errorContainer = document.getElementById('priorityFormErrors');
    if (errorContainer) {
        errorContainer.classList.add('hidden');
        errorContainer.innerHTML = '';
    }
}
