window.addEventListener("DOMContentLoaded", function() {
    /*var path = window.location.pathname.replace("/", "");
    console.log(path);

    document.querySelectorAll("ul.menu > li > ul > li > a").forEach(function (link) {
        if (link.getAttribute("href").includes(path)) {
            console.log(link.parentElement.parentElement.parentElement.firstChild)
        }
    })*/

    window.addEventListener("resize", function() {
        if (window.innerWidth > 700) {
            document.getElementById("ch-menu").checked = false;
            /*let submenus = document.querySelectorAll("ul.menu > li > ul")
            for (let submenu of submenus) {
                submenu.style.display = "none";
            }*/
        }
    })
})