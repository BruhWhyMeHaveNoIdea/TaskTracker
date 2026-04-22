document.addEventListener('DOMContentLoaded', function() {
    console.log('Projects main script loaded!');
    initTasks();
    createProject();
    initProjectActions();
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



function createProject() {
    const createProjectButton = document.getElementById('addProject')
    const closeProjectButton = document.getElementById('cancelBtn-project')
    const dialogModal = document.getElementById('projectModal')
    const projectForm = document.getElementById('projectForm')
    const errorContainer = document.getElementById('formErrors')

    closeProjectButton?.addEventListener('click', () => {
        dialogModal.close()
        hideErrors()
    });
    
    createProjectButton.addEventListener('click', function() {
        dialogModal.showModal()
        hideErrors()
    })

    projectForm.addEventListener('submit', async(e) => {
        e.preventDefault();
        hideErrors()
        
        const formData = new FormData(projectForm)
        const data = {
            name: formData.get('name'),
            description: formData.get('description'),
            participants: formData.get('members').split(' ') || ''
        }

        console.log(data)
        
        const response = await fetch('/api/project/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        })

        if (response.ok) {
            dialogModal.close()
            projectForm.reset()
            window.location.reload()
        } else {
            const errors = await response.json()
            showErrors(errors)
        }
    })

    function showErrors(errors) {
        errorContainer.innerHTML = ''
        for (const [field, messages] of Object.entries(errors)) {
            if (Array.isArray(messages)) {
                messages.forEach(msg => {
                    const p = document.createElement('p')
                    p.textContent = msg
                    errorContainer.appendChild(p)
                })
            }
        }
        errorContainer.classList.remove('hidden')
    }

    function hideErrors() {
        errorContainer.classList.add('hidden')
        errorContainer.innerHTML = ''
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

function initProjectActions() {
    const actionButtons = document.querySelectorAll('[id^="actions-btn-"]');

    actionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const projectId = this.dataset.project;
            const menu = document.getElementById(`actions-menu-${projectId}`);
            
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
            const container = this.closest('[id^="actions-container-"]');
            const projectId = container?.querySelector('[id^="actions-btn-"]')?.dataset.project;


            switch(action) {
                case 'add-participant':
                    console.log('Добавить участника:', projectId);
                    const memberForm = document.getElementById('memberForm')
                    const memberModal = document.getElementById('addMember')
                    const closeModal = document.getElementById('cancelBtn-member')
                    const errorContainer = document.getElementById('memberFormErrors')

                    memberModal.showModal();
                    hideMemberErrors();

                    closeModal.addEventListener('click', () => {
                        memberModal.close();
                        memberForm.reset();
                        hideMemberErrors();
                    })

                    function showMemberErrors(errors) {
                        errorContainer.innerHTML = ''
                        for (const [field, messages] of Object.entries(errors)) {
                            if (Array.isArray(messages)) {
                                messages.forEach(msg => {
                                    const p = document.createElement('p')
                                    p.textContent = msg
                                    errorContainer.appendChild(p)
                                })
                            }
                        }
                        errorContainer.classList.remove('hidden')
                    }

                    function hideMemberErrors() {
                        errorContainer.classList.add('hidden')
                        errorContainer.innerHTML = ''
                    }

                    memberForm.addEventListener('submit', async(e) => {
                        e.preventDefault()
                        hideMemberErrors()

                        const formData = new FormData(memberForm)
                        const usernames = formData.get('usernames')
                        
                        if (!usernames || usernames.trim() === '') {
                            showMemberErrors({
                                'usernames': ['Введите username участника']
                            })
                            return
                        }
                        
                        const data = {
                            participants: usernames.split(' ')
                        }
                        console.log(data)
                        await fetch(`/api/project/update/${projectId}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': getCookie('csrftoken')
                            },
                            body: JSON.stringify(data)
                        }).then(response => {
                            console.log(response)
                            if (response.ok) {
                                memberModal.close();
                                memberForm.reset();
                                showNotification('success', 'Участник успешно добавлен!');
                            } else {
                                response.json().then(errors => {
                                    showMemberErrors(errors)
                                })
                                memberModal.close();
                                memberForm.reset();
                                showNotification('error', 'Произошла ошибка при добавлении участника.');
                            }
                        })
                    })

                    break;
                case 'delete':
                    if (confirm('Вы уверены, что хотите удалить этот проект и все задачи, связанные с ним?')) {
                        fetch(`/api/project/remove/${projectId}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': getCookie('csrftoken')
                            },
                        }).then(response => {
                            if (response.ok) {
                                showNotification('success');
                            } else {
                                showNotification('error');
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
            const projectId = actionsContainer?.querySelector('[id^="actions-btn-"]')?.dataset.project;
            const newStatus = this.dataset.status;

            console.log('Сменить статус проекта:', projectId, 'на', newStatus);
            fetch(`/api/project/update/${projectId}`,{
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
                    showNotification('success');
                } else {
                    showNotification('error')
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


function reloadPage() {
    setTimeout(() => {
        window.location.reload()
    }, 3000)
}