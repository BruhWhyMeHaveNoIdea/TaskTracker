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
    const mainText = document.getElementById("mainText")

    const textElements = [accountText, projectText, taskText, mainText]

    const savedState = localStorage.getItem('menuCollapsed');
    const isCollapsed = savedState === 'true';

    textElements.forEach(el => {
        el.style.transition = 'none'
        el.style.opacity = isCollapsed ? '0' : '1'
    })
    // Возвращаем transition для последующих кликов
    requestAnimationFrame(() => {
        textElements.forEach(el => el.style.transition = '')
    })

    if (isCollapsed) {
        menu.classList.add("closed");
        menu.style.width = '60px';
    } else {
        menu.classList.remove("closed");
        menu.style.width = '200px';
    }

    menuButton.addEventListener("click", function() {
        const isNowCollapsed = menu.classList.contains("closed");
        if (isNowCollapsed) {
            // Разворачивание: меню расширяется, текст плавно появляется
            menu.classList.remove("closed")
            menu.style.width = '200px'

            setTimeout(() => {
                textElements.forEach(el => el.style.opacity = '1')
            }, 150)

            localStorage.setItem('menuCollapsed', 'false');
        } else {
            // Сворачивание: текст плавно гаснет одновременно с сужением меню
            textElements.forEach(el => el.style.opacity = '0')
            menu.style.width = '60px'
            menu.classList.add("closed")

            localStorage.setItem('menuCollapsed', 'true');
        }
    })

    // Клик по "Task Tracker" — переход на главную, без toggle меню
    mainText.addEventListener("click", function(e) {
        e.stopPropagation();
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