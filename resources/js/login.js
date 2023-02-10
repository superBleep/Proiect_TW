function realign() {
    if(window.innerWidth <= 862 && window.innerWidth > 700 && document.getElementById("login_form")) {
        document.getElementsByTagName("header")[0].style.marginBottom = "1.5em";
        document.getElementsByTagName("h1")[0].style.position = "absolute";
        document.getElementsByTagName("h1")[0].style.right = "1em";
    } else {
        document.getElementsByTagName("header")[0].style.removeProperty("margin-bottom");
        document.getElementsByTagName("h1")[0].style.removeProperty("position");
        document.getElementsByTagName("h1")[0].style.removeProperty("right");
    }
}

window.addEventListener("DOMContentLoaded", function() {
    realign();

    window.addEventListener("resize", function() {
        if (window.innerWidth > 700) {
            document.getElementById("ch-menu").checked = false;
        }

        realign();
    })

    let p = document.getElementById("eroareLogin");
    if(p && p.innerText != "") {
        header = document.getElementsByTagName("header")[0];
        
        if(window.innerWidth <= 862 && window.innerWidth > 700) {
            header.style.marginBottom = "3em";
        }
        else {
            header.style.marginBottom = "2em";
        }

        setTimeout(function() {
            document.getElementsByTagName("header")[0].style.removeProperty("margin-bottom");
            p.style.display = "none";

            realign();
        }, 4000)
    }
})