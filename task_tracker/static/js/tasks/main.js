document.addEventListener("DOMContentLoaded", function() {
    createTask();
    initTaskActionsMenu();
    initAddExecutor();
});

function initTaskActionsMenu() {
    const actionButtons = document.querySelectorAll('[id^="actions-btn-"]');

    actionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const taskId = this.dataset.task;
            const menu = document.getElementById(`actions-menu-${taskId}`);
            
            // Закрываем все открытые меню
            document.querySelectorAll('[id^="actions-menu-"]').forEach(m => {
                if (m !== menu) m.classList.add('hidden');
            });
            
            menu.classList.toggle('hidden');
        });
    });

    document.addEventListener('click', function() {
        document.querySelectorAll('[id^="actions-menu-"]').forEach(menu => {
            menu.classList.add('hidden');
        });
    });

    const actionItems = document.querySelectorAll('.action-item');
    actionItems.forEach(item => {
        item.addEventListener('click', function() {
            const action = this.dataset.action;
            console.log(action)
            const container = this.closest('[id^="actions-container-"]');
            const taskId = container?.querySelector('[id^="actions-btn-"]')?.dataset.task;

            switch(action) {
                case 'add-executor':
                    console.log('Добавить исполнителя:', taskId);
                    // Открываем модальное окно для добавления исполнителя
                    openExecutorModal(taskId);
                    break;
                case 'delete':
                    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
                        fetch(`/api/task/remove/${taskId}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': getCookie('csrftoken')
                            },
                        }).then(response => {
                            if (response.ok) {
                                showNotification('success', 'Задача успешно удалена!');
                            } else {
                                showNotification('error', 'Произошла ошибка при удалении задачи.');
                            }
                        })
                    }
                    break;
            }
        });
    });

    const statusOptions = document.querySelectorAll('.status-option');
    statusOptions.forEach(option => {
        option.addEventListener('click', function() {
            const actionsContainer = this.closest('[id^="actions-container-"]');
            const taskId = actionsContainer?.querySelector('[id^="actions-btn-"]')?.dataset.task;
            const newStatus = this.dataset.status;

            console.log('Сменить статус задачи:', taskId, 'на', newStatus);
            fetch(`/api/task/update/${taskId}`, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    "status": newStatus
                })
            }).then(response => {
                if (response.ok) {
                    showNotification('success', 'Статус задачи успешно изменён!');
                } else {
                    showNotification('error', 'Произошла ошибка при изменении статуса.');
                }
            })

            document.querySelectorAll('[id^="status-menu-"]').forEach(m => m.classList.add('hidden'));
            document.querySelectorAll('[id^="actions-menu-"]').forEach(m => m.classList.add('hidden'));
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

function createTask() {
    const createTaskButton = document.getElementById('addTask');
    const closeTaskButton = document.getElementById('cancelBtn-task');
    const dialogForm = document.getElementById('taskModal');
    const taskForm = document.getElementById('taskForm');
    const errorContainer = document.getElementById('formErrors');

    closeTaskButton?.addEventListener('click', () => {
        dialogForm.close();
        hideErrors();
    });
    
    createTaskButton?.addEventListener('click', function() {
        dialogForm.showModal();
        hideErrors();
    });

    taskForm?.addEventListener('submit', async(e) => {
        e.preventDefault();
        hideErrors();
        
        const formData = new FormData(taskForm);
        const data = {
            name: formData.get('name'),
            description: formData.get('description') || '',
            priority: formData.get('priority') || 10000,
            executors: formData.get('executors').split(' ') || '',
            deadline: formData.get('deadline'),
            project: formData.get('project')
        };

        console.log(data);
        
        const response = await fetch('/api/task/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            dialogForm.close();
            taskForm.reset();
            window.location.reload();
        } else {
            const errors = await response.json();
            console.error(errors)
            showErrors(errors);
        }
    });

    function showErrors(errors) {
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

    function hideErrors() {
        errorContainer.classList.add('hidden');
        errorContainer.innerHTML = '';
    }
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

let currentTaskId = null;

function openExecutorModal(taskId) {
    currentTaskId = taskId;
    const executorModal = document.getElementById('executorModal');
    const executorInput = document.getElementById('executorUsername');
    
    if (!executorModal || !executorInput) return;
    
    executorModal.showModal();
    executorInput.focus();
    hideExecutorErrors();
}

function initAddExecutor() {
    const executorModal = document.getElementById('executorModal');
    const cancelBtn = document.getElementById('cancelBtn-executor');
    const executorForm = document.getElementById('executorForm');
    const executorInput = document.getElementById('executorUsername');
    
    if (!executorModal || !executorInput) return;
    
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
            
            if (!currentTaskId) {
                showExecutorErrors({
                    'username': ['Ошибка: ID задачи не найден']
                });
                return;
            }
            
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
                
                const response = await fetch(`/tasks/add_executor/${currentTaskId}/`, {
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

function reloadPage() {
    setTimeout(() => {
        window.location.reload()
    }, 3000)
}