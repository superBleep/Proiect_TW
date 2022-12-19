function setCookie(name, val, exp) {
    d = new Date();
    d.setTime(d.getTime() + exp);
    document.cookie = `${name} = ${val}; expires=${d.toUTCString()}`;
}

function getCookie(name) {
    params = document.cookie.split(";")
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

window.addEventListener("load", function() {
    if (getCookie("banner_accept")) {
        document.getElementById("banner").style.display = "none";
    }

    document.getElementById("banner-cookie").addEventListener("click", function() {
        setCookie("banner_accept", true, 86400000);
        document.getElementById("banner").style.display = "none";
    })
})