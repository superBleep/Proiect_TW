var theme_colors = {
    // Pt. cusotmizarea Bootstrap-ului
    // light, dark, pastel, fire, metal
    primary: ["#6F418F", "#2E2210", "#416CA3", "#5C4F33", "#490349"],
    secondary: ["#DB74BD", "#2B2E0B", "#90BAF0", "#5a948c", "#2a42ad"],
    text: ["#DBCD7F", "#a78144", "#A38752", "#F5B21B", "#792020"]
}

// Pt. customizarea Bootstrap-ului
function hex2rgb(hex) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);

    return [r.toString(), g.toString(), b.toString()].join(", ");
}

// Pt. customizarea Bootstrap-ului
function setBootstrap(theme_id) {
    var accordions = document.querySelectorAll(".accordion");
    var svg_color = theme_colors["text"][theme_id].slice(1, theme_colors["text"][theme_id].length);
    var svg_active_color = theme_colors["secondary"][theme_id].slice(1, theme_colors["secondary"][theme_id].length);
    accordions.forEach(function(e) {
        e.style.setProperty("--bs-accordion-btn-color", theme_colors["text"][theme_id]);
        e.style.setProperty("--bs-accordion-color", theme_colors["text"][theme_id]);
        e.style.setProperty("--bs-accordion-active-color", theme_colors["secondary"][theme_id]);
        e.style.setProperty("--bs-accordion-bg", theme_colors["secondary"][theme_id]);

        e.style.setProperty("--bs-accordion-btn-icon", "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23DBCD7F'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e\")".replace("DBCD7F", svg_color));
        e.style.setProperty("--bs-accordion-btn-active-icon", "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%235d55c5'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e\")".replace("5d55c5", svg_active_color));
    })

    var buttons = document.querySelectorAll(".btn");
    buttons.forEach(function(e) {
        e.style.setProperty("--bs-btn-bg", theme_colors["secondary"][theme_id]);
        e.style.setProperty("--bs-btn-border-color", theme_colors["secondary"][theme_id]);
        e.style.setProperty("--bs-btn-hover-color", theme_colors["text"][theme_id]);
        e.style.setProperty("--bs-btn-hover-bg", "white");
        e.style.setProperty("--bs-btn-hover-border-color", "white");
    })

    var button = document.getElementById("voucher-button");
    if (button) {
        button.style.setProperty("--bs-btn-active-color", theme_colors["text"][theme_id]);
        button.style.setProperty("--bs-btn-active-bg", "white");
        button.style.setProperty("--bs-btn-active-border-color", "white");
        button.style.setProperty("--bs-btn-bg", "");
        button.style.setProperty("--bs-btn-color", "white");
    }

    var form = document.querySelectorAll(".form-range");
    form.forEach(function(e) {
        console.log(e.style)
        e.style.setProperty("form-range-thumb-bg", theme_colors["secondary"][theme_id]);
        e.style.setProperty("-moz-range-track", theme_colors["primary"][theme_id]);
    })

    var root = document.querySelector(":root");
    root.style.setProperty("--bs-primary-rgb", hex2rgb(theme_colors["primary"][theme_id]));
    root.style.setProperty("--bs-secondary-rgb", hex2rgb(theme_colors["secondary"][theme_id]));
}

function setThemes(themes, themes2id) {
    // Ia fiecare buton de tema
    for (let theme of themes) {
        document.getElementById(theme).addEventListener("click", function() {
            let tags = ["body", "nav"];
            let ids = ["link-top", "theme-picker", "tabel_oferte", "product-table", "banner"];

            localStorage.setItem("theme", theme);

            // Pt. customizarea Boostrap-ului; se face numai o data,
            // nu se mai pune si la modificarea id-urilor
            setBootstrap(themes2id[theme]);

            document.getElementById("darkmode-ico").classList.replace("fa-sun", "fa-moon");

            for (let tag of tags) {
                // Daca nu contine tema, adaug-o si sterge-le pe restul
                // Se adauga si in localStorage
                if (!document.getElementsByTagName(tag)[0].classList.contains(theme)) {
                    for(let rTheme of themes) {
                        document.getElementsByTagName(tag)[0].classList.remove(rTheme);
                    }
                    if (document.getElementsByTagName(tag)[0].classList.contains("light")) {
                        document.getElementsByTagName(tag)[0].classList.remove("light");
                    }

                    document.getElementsByTagName(tag)[0].classList.add(theme);
                    continue;
                }
                if (document.getElementsByTagName(tag)[0].classList.contains("dark")) {
                    for(let rTheme of themes) {
                        document.getElementsByTagName(tag)[0].classList.remove(rTheme);
                    }
                    document.getElementsByTagName(tag)[0].classList.add("light");
                    localStorage.setItem("theme", "light");

                    // Chestti generale pe care le facem doar o data
                    // cand se schimba tema in "light"
                    document.getElementById("darkmode-ico").classList.replace("fa-moon", "fa-sun");
                    setBootstrap(0);
                }
            }
            
            for (let id of ids) {
                if(document.getElementById(id)) {
                    if(!document.getElementById(id).classList.contains(theme)) {
                        for(let rTheme of themes) {
                            document.getElementById(id).classList.remove(rTheme);
                        }
                        if (document.getElementById(id).classList.contains("light")) {
                            document.getElementById(id).classList.remove("light");
                        }

                        document.getElementById(id).classList.add(theme);
                        continue;
                    }
                    if (document.getElementById(id).classList.contains("dark")) {
                        for(let rTheme of themes) {
                            document.getElementById(id).classList.remove(rTheme);
                        }
                        document.getElementById(id).classList.add("light");
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
    if(localStorage.getItem("btns_pressed")) {
        console.log(localStorage.getItem("btns_pressed"))
        var pressed = localStorage.getItem("btns_pressed").split(",");
        document.querySelectorAll(".accordion-button").forEach(function(e, idx) {
            if (eval(pressed[idx]) && e.classList.contains("collapsed")) {
                e.classList.remove("collapsed");
                e.parentElement.parentElement.children[1].classList.add("show");
            }
            if (!eval(pressed[idx]) && !e.classList.contains("collapsed")) {
                e.classList.add("collapsed");
                e.parentElement.parentElement.children[1].classList.remove("show");
            }
        })
    }
    
    var elem_count = document.querySelectorAll(".accordion-button").length;
    var btns_pressed = Array(elem_count).fill(false);
    if(localStorage.getItem("btns_pressed")) {
        btns_pressed = localStorage.getItem("btns_pressed").split(",");
    }
    document.querySelectorAll(".accordion-button").forEach(function(e, idx) {
        e.addEventListener("click", function() {
            if(e.classList.contains("collapsed")) {
                btns_pressed[idx] = false;
            }
            else {
                btns_pressed[idx] = true;
            }
            localStorage.setItem("btns_pressed", btns_pressed);
        })
    })
    
    // Ia tema curenta din localStorage si o aplica peste elementele customizabile
    var cur_theme = localStorage.getItem("theme");
    if(cur_theme) {
        document.body.classList.add(cur_theme);
        document.getElementsByTagName("nav")[0].classList.add(cur_theme);
        document.getElementById("link-top").classList.add(cur_theme);
        document.getElementById("theme-picker").classList.add(cur_theme);
        document.getElementById("banner").classList.add(cur_theme);
        if(document.getElementById("tabel_oferte")) {
            document.getElementById("tabel_oferte").classList.add(cur_theme);
        }
        if(document.getElementById("product-table")) {
            document.getElementById("product-table").classList.add(cur_theme);
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
        light: 0,
        dark: 1,
        pastel: 2,
        fire: 3,
        metal: 4
    }
    setBootstrap(themes2id[cur_theme]);
    setThemes(themes, themes2id);

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