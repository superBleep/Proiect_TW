function setCookie(name, val, exp) {
    var d = new Date();
    d.setTime(d.getTime() + exp);
    document.cookie = `${name} = ${val}; expires=${d.toUTCString()}`;
}

function getCookie(name) {
    var params = document.cookie.split(";")
    for (let param of params) {
        if (param.trim().startsWith(name + "=")) {
            return param.split("=")[1];
        }
    }

    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=0; expires=${(new Date()).toUTCString()}`;
}

window.addEventListener("DOMContentLoaded", function() {
    if (getCookie("banner_accept")) {
        document.getElementById("banner").style.display = "none";
    }

    if (getCookie("last_page")) {
        var last_page = document.referrer;
        if (document.getElementById("stats")) {
            let a = document.createElement("a");
            let text = document.createTextNode("Link");
            a.appendChild(text);
            a.setAttribute("href", last_page);

            let p = document.createElement("p");
            text = document.createTextNode(" către ultima pagină accesată");
            p.appendChild(a);  
            p.appendChild(text);

            document.getElementById("stats").appendChild(p);
        }
    }

    document.getElementById("banner-cookie").addEventListener("click", function() {
        setCookie("banner_accept", true, 86400000);
        setCookie("last_page", true, 86400000);

        document.getElementById("banner").style.display = "none";
    })
})