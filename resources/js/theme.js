var theme_colors = {
    // Pt. cusotmizarea Bootstrap-ului
    // light, dark, pastel, fire, metal
    primary: ["#6F418", "#2E2210", "#416CA3", "#5C4F33", "#490349"],
    secondary: ["#DB74BD", "#2B2E0B", "#90BAF0", "#5a948c", "#2a42ad"]
}

// Pt. customizarea Bootstrap-ului
function hex2rgb(hex) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);

    return [r.toString(), g.toString(), b.toString()].join(", ");
}

function setThemes(themes, themes2id) {
    // Pt. customizarea Bootstrap-ului
    var root = document.querySelector(":root");

    // Ia fiecare buton de tema
    for (let theme of themes) {
        document.getElementById(theme).addEventListener("click", function() {
            let tags = ["body", "nav"];
            let ids = ["link-top", "theme-picker", "tabel_oferte"];

            for (let tag of tags) {
                // Daca nu contine tema, adaug-o si sterge-le pe restul
                // Se adauga si in localStorage
                if (!document.getElementsByTagName(tag)[0].classList.contains(theme)) {
                    document.getElementsByTagName(tag)[0].classList.add(theme);
                    localStorage.setItem("theme", theme);

                    // Pt. customizarea Boostrap-ului; se face numai o data,
                    // nu se mai pune si la modificarea id-urilor
                    root.style.setProperty("--bs-primary-rgb", hex2rgb(theme_colors["primary"][themes2id[theme]]));
                    root.style.setProperty("--bs-secondary-rgb", hex2rgb(theme_colors["secondary"][themes2id[theme]]));

                    // Pt. darkmode, modifica icon-ul din buton
                    document.getElementById("darkmode-ico").classList.add("fa-moon");
                    document.getElementById("darkmode-ico").classList.remove("fa-sun");

                    for(let rTheme of themes) {
                        if (rTheme != theme && document.body.classList.contains(theme)) {
                            document.getElementsByTagName(tag)[0].classList.remove(rTheme);
                        }
                    }
                }
                
                // Pt. lightmode; practic o revenire la default si schimbarea
                // icoanelor
                if (document.getElementsByTagName(tag)[0].classList.contains(theme) && theme == "dark") {
                    document.getElementsByTagName(tag)[0].classList.remove("dark");
                    localStorage.clear();

                    document.getElementById("darkmode-ico").classList.remove("fa-moon");
                    document.getElementById("darkmode-ico").classList.add("fa-sun");

                    // "Resetam" Bootstrap-ul
                    root.style.setProperty("--bs-primary-rgb", hex2rgb(theme_colors["primary"][0]));
                    root.style.setProperty("--bs-secondary-rgb", hex2rgb(theme_colors["secondary"][0]));

                    // Scoate toate temele (sa "ramana" doar cea default)
                    for(let rTheme of themes) {
                        document.getElementsByTagName(tag)[0].classList.remove(rTheme);
                    }
                }
            }
            
            for (let id of ids) {
                if(document.getElementById(id)) {
                    if(!document.getElementById(id).classList.contains(theme)) {
                        document.getElementById(id).classList.add(theme);

                        for(let rTheme of themes) {
                            if (rTheme != theme && document.body.classList.contains(theme)) {
                                document.getElementById(id).classList.remove(rTheme);
                            }
                        }
                    }
                }

                if (document.getElementById(id).classList.contains(theme) && theme == "dark") {
                    document.getElementById(id).classList.remove("dark");
                    localStorage.clear();

                    document.getElementById("darkmode-ico").classList.remove("fa-moon");
                    document.getElementById("darkmode-ico").classList.add("fa-sun");

                    // "Resetam" Bootstrap-ul
                    root.style.setProperty("--bs-primary-rgb", hex2rgb(theme_colors["primary"][0]));
                    root.style.setProperty("--bs-secondary-rgb", hex2rgb(theme_colors["secondary"][0]));

                    for(let rTheme of themes) {
                        document.getElementById(id).classList.remove(rTheme);
                    }
                }
            }

            // Pt. icon-urile FontAwesome din titlu
            if(theme == "metal") {
                for(let span of document.getElementsByTagName("h1")[0].children) {
                    span.classList.replace(span.classList[1], "fa-crow");
                }
            }
            else {
                for(let span of document.getElementsByTagName("h1")[0].children) {
                    span.classList.replace(span.classList[1], "fa-compact-disc");
                }
            }
        })
    }
}

window.addEventListener("DOMContentLoaded", function() {
    // Ia tema curenta din localStorage si o aplica peste elementele customizabile
    var cur_theme = localStorage.getItem("theme");

    if(cur_theme) {
        document.body.classList.add(cur_theme);
        document.getElementsByTagName("nav")[0].classList.add(cur_theme);
        document.getElementById("link-top").classList.add(cur_theme);
        document.getElementById("theme-picker").classList.add(cur_theme);
        if(document.getElementById("tabel_oferte")) {
            document.getElementById("tabel_oferte").classList.add(cur_theme);
        }

        // Schimbarea icon-urilor din titlu
        if(cur_theme == "metal") {
            for(let span of document.getElementsByTagName("h1")[0].children) {
                span.classList.replace(span.classList[1], "fa-crow");
            }
        }
        else {
            for(let span of document.getElementsByTagName("h1")[0].children) {
                span.classList.replace(span.classList[1], "fa-compact-disc");
            }  
        }
    }

    var themes = ["dark", "pastel", "fire", "metal"];
    // Pt. customizarea Bootstrap-ului
    var themes2id = {
        dark: 1,
        pastel: 2,
        fire: 3,
        metal: 4
    }
    setThemes(themes, themes2id);

    /*document.getElementById("dark").addEventListener("click", function() {
        let tags = ["body", "nav"];
        let ids = ["link-top", "theme-picker", "tabel_oferte"];

        for (let tag of tags) {
            if(!document.getElementsByTagName(tag)[0].classList.contains("dark")) {
                document.getElementsByTagName(tag)[0].classList.add("dark");
                localStorage.setItem("theme", "dark");

                for(let rTheme of themes) {
                    if (rTheme != "dark" && document.body.classList.contains("dark")) {
                        document.getElementsByTagName(tag)[0].classList.remove(rTheme);
                    }
                }

                document.getElementById("darkmode-ico").classList.add("fa-moon");
                document.getElementById("darkmode-ico").classList.remove("fa-sun");
            }
            else {
                document.getElementsByTagName(tag)[0].classList.remove("dark");
                localStorage.clear();

                document.getElementById("darkmode-ico").classList.remove("fa-moon");
                document.getElementById("darkmode-ico").classList.add("fa-sun");
            }
        }

        for (let id of ids) {
            if(document.getElementById(id)) {
                if(!document.getElementById(id).classList.contains("dark")) {
                    document.getElementById(id).classList.add("dark");
                    localStorage.setItem("theme", "dark");
    
                    for(let rTheme of themes) {
                        if (rTheme != "dark" && document.body.classList.contains("dark")) {
                            document.getElementById(id).classList.remove(rTheme);
                        }
                    }
                }
                else {
                    document.getElementById(id).classList.remove("dark");
                    localStorage.clear();
                }
            }
        }
    })*/



    document.getElementById("theme-picker-ico").addEventListener("click", function() {
        document.getElementById("theme-picker").classList.remove("collapsePicker");
        document.getElementById("theme-picker").classList.add("expandPicker");

        document.getElementById("theme-picker").addEventListener("mouseleave", function () {
            if (document.getElementById("theme-picker").classList.contains("expandPicker")) {
                document.getElementById("theme-picker").classList.remove("expandPicker");
                document.getElementById("theme-picker").classList.add("collapsePicker");
            }
        })
    })
})