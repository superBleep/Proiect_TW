window.addEventListener("DOMContentLoaded", function() {
    window.addEventListener("resize", function() {
        if (window.innerWidth > 700) {
            document.getElementById("ch-menu").checked = false;
        }
    })
})