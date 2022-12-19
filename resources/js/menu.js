window.addEventListener("DOMContentLoaded", function() {
    window.addEventListener("resize", function() {
        if (window.innerWidth > 700) {
            document.getElementById("ch-menu").checked = false;
            let submenus = document.querySelectorAll("ul.menu > li > ul")
            for (let submenu of submenus) {
                submenu.style.display = "none";
            }
        }
    })
})