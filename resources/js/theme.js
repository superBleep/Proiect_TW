window.addEventListener("DOMContentLoaded", function() {
    var cur_theme = localStorage.getItem("theme");

    if(cur_theme) {
        document.body.classList.add(cur_theme);
        document.getElementsByTagName("nav")[0].classList.add(cur_theme);
    }

    document.getElementById("theme").addEventListener("click", function() {
        if (document.body.classList.contains("dark")) {
            document.body.classList.remove("dark");
            document.getElementById("theme-ico").classList.add("fa-moon");
            document.getElementById("theme-ico").classList.remove("fa-sun");
            localStorage.removeItem("theme");
        }
        else {
            document.body.classList.add("dark");
            document.getElementById("theme-ico").classList.remove("fa-moon");
            document.getElementById("theme-ico").classList.add("fa-sun");
            localStorage.setItem("theme", "dark");
        }

        if (document.getElementsByTagName("nav")[0].classList.contains("dark")) {
            document.getElementsByTagName("nav")[0].classList.remove("dark");
        }
        else {
            document.getElementsByTagName("nav")[0].classList.add("dark");
        }

        if (document.getElementById("link-top").classList.contains("dark")) {
            document.getElementById("link-top").classList.remove("dark");
        }
        else {
            document.getElementById("link-top").classList.add("dark");
        }
    })
})