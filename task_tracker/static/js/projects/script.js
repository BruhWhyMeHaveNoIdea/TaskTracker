document.addEventListener('DOMContentLoaded', function() {
    initTasks();
    createProject();
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
    const closeProjectButton = document.getElementById('cancelBtn')
    const dialogForm = document.getElementById('projectModal')
    const projectForm = document.getElementById('projectForm')
    const errorContainer = document.getElementById('formErrors')

    closeProjectButton?.addEventListener('click', () => {
        dialogForm.close()
        hideErrors()
    });
    
    createProjectButton.addEventListener('click', function() {
        dialogForm.showModal()
        hideErrors()
    })

    projectForm.addEventListener('submit', async(e) => {
        e.preventDefault();
        hideErrors()
        
        const formData = new FormData(projectForm)
        const data = {
            name: formData.get('name'),
            description: formData.get('description'),
            participants: formData.get('members') || ''
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
            dialogForm.close()
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