document.addEventListener('DOMContentLoaded', function() {
    updateTime();
});

function updateTime () {
    let timeElement = document.getElementById('currentTime');
    timeElement.innerText = "⟳"
    setInterval(function () {
        let currentTime = new Date();
        timeElement.innerText = currentTime.toLocaleTimeString();
    }, 1000);
}

