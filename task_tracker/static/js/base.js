document.addEventListener("DOMContentLoaded", function() {
    InitMenu();
})


function InitMenu() {
    showMenu();
    activePath();
    redirectLink();
}

function showMenu() {
    const menu = document.getElementById("menu")
    const menuButton = document.getElementById("menuButton")

    const accountText = document.getElementById("accountText")
    const projectText = document.getElementById("projectText")
    const taskText = document.getElementById("taskText")

    const savedState = localStorage.getItem('menuCollapsed');
    const isCollapsed = savedState === 'true';

    if (isCollapsed) {
        menu.classList.add("closed");
        menu.style.width = '60px';
        accountText.innerText = "";
        projectText.innerText = "";
        taskText.innerText = "";
    } else {
        menu.classList.remove("closed");
        menu.style.width = '200px';
        accountText.innerText = "Аккаунт";
        projectText.innerText = "Проекты";
        taskText.innerText = "Задачи";
    }

    menuButton.addEventListener("click", function() {
        const isNowCollapsed = menu.classList.contains("closed");
        if (isNowCollapsed) {
            menu.classList.remove("closed")

            menu.style.width = '200px'
            accountText.innerText = "Аккаунт"
            projectText.innerText = "Проекты"
            taskText.innerText = "Задачи"

            localStorage.setItem('menuCollapsed', 'false');
        } else {
            menu.classList.add("closed")

            menu.style.width = '60px'
            accountText.innerText = ""
            projectText.innerText = ""
            taskText.innerText = ""

            localStorage.setItem('menuCollapsed', 'true');
        }
    })
}

function activePath() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll(".link");
    
    links.forEach(function(link) {
        const url = link.getAttribute("data-url");
        
        let basePath = url;
        const parts = url.replace(/^\/|\/$/g, '').split('/');
        if (parts.length > 0) {
            basePath = '/' + parts[0];
        }
        

        if (currentPath.startsWith(basePath)) {
            link.classList.add(
                "bg-white/20", 
                "border-l-4", 
                "border-blue-400", 
                "text-blue-400"
            );
        } else {
            link.classList.remove(
                "bg-white/20", 
                "border-l-4", 
                "border-blue-400", 
                "text-blue-400"
            );
        }
    });
}

function redirectLink() {
    document.querySelectorAll(".link").forEach(link => {
        link.addEventListener("click", (e) => {
            const url = link.dataset.url;
            if (url) window.location.href = url;
        });
    });
}