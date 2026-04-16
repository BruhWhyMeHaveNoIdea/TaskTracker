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

    createProjectButton.addEventListener('click', function() {
        initProjectForm();
    })
}

function initProjectForm() {
    const mainContainer = document.getElementById("mainContainer")
    console.log(mainContainer)


    mainContainer.classList.add("sidelined")
}