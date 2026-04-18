document.addEventListener("DOMContentLoaded", function() {
    createTask();
});

function createTask() {
    const createTaskButton = document.getElementById('addTask');
    const closeTaskButton = document.getElementById('cancelBtn');
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
            executors: formData.get('executors') || '',
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