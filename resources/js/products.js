function getPrices() {
    var min_price = document.getElementById("inp-min-range")
    var max_price = document.getElementById("inp-max-range")

    const prices = []
    var products_nr = document.getElementsByTagName("article").length
    for (let i = 0; i < products_nr; i++) {
        prices[i] = +(document.getElementById("prod-price-" + i).innerText).match(/\d+.\d+/)
    }
    prices.sort(function(a, b) {return a - b});

    min_price.min = 0
    document.getElementById("min-price-min").innerText = `${min_price.min} RON`
    min_price.max = prices[0] + 0.01
    document.getElementById("min-price-max").innerText = `${min_price.max} RON` 
    max_price.min = min_price.max
    document.getElementById("max-price-min").innerText = `${max_price.min} RON`
    max_price.max = prices[products_nr - 1] + 0.01
    document.getElementById("max-price-max").innerText = `${max_price.max} RON`

    min_price.value = min_price.max / 2
    document.getElementById("min-price-value").innerText = `(${min_price.value} RON)`
    min_price.onchange = function() {
        document.getElementById("min-price-value").innerText = `(${min_price.value} RON)`
    }

    max_price.value = max_price.max / 2
    document.getElementById("max-price-value").innerText = `(${max_price.value} RON)`
    max_price.onchange = function() {
        document.getElementById("max-price-value").innerText = `(${max_price.value} RON)`
    }

    var products = document.getElementsByClassName("prod");
    for (let prod of products) {
        prod.style.display = "block";
    }
}

function appendFilterError(errInputs) {
    s = "Eroare la ";
    if(errInputs.length == 1) {
        s += "input-ul ";
        s += errInputs[0];
    }
    else {
        s += "input-urile ";
        for (let [i, input] of errInputs.entries()) {
            if (i == errInputs.length - 1) {
                s += input;
            }
            else {
                s += input + ", ";
            }
        }
    }

    document.getElementById("filter-error").innerText = s;
}

function verifyInputs(inputs) {
    var filterError = document.getElementById("filter-error"), errFlag = false, errFlag2, errArray = [], fErrcolor = window.getComputedStyle(filterError).getPropertyValue("color");

    if (inputs.inp_name.split("*").length > 2) {
        errFlag = true;
        errArray = errArray.concat(["nume"]);
        document.getElementById("inp-name").parentNode.style.color = fErrcolor;
        document.getElementById("inp-name").classList.add("is-invalid");
    }
    else {
        document.getElementById("inp-name").parentNode.style.color = "inherit";
        document.getElementById("inp-name").classList.remove("is-invalid");
    }

    var date_pattern = /\d{1,2}\/\w+\/\d\d\d\d/
    if (inputs.inp_date && !date_pattern.test(inputs.inp_date)) {
        errFlag = true;
        errArray = errArray.concat(["data adăugării"]);
        document.getElementById("inp-date").parentNode.style.color = fErrcolor;
    }
    else {
        document.getElementById("inp-date").parentNode.style.color = "inherit";
    }

    errFlag2 = true;
    for (let tip of inputs.inp_exp) {
        if(tip.checked) {
            errFlag2 = false;
            break;
        }
    }
    if (errFlag2) {
        errFlag = true;
        errArray = errArray.concat(["tip expediere"]);
        document.getElementById("inp-exp-node").style.color = fErrcolor;
    }
    else {
        document.getElementById("inp-exp-node").style.color = "inherit";
    }

    errFlag2 = true;
    for (let weight of inputs.inp_weight) {
        if(weight.selected) {
            errFlag2 = false;
            break;
        }
    }
    if (errFlag2) {
        errFlag = true;
        errArray = errArray.concat(["categorie gramaj"]);
        document.getElementById("inp-weight").parentNode.style.color = fErrcolor;
    }
    else {
        document.getElementById("inp-weight").parentNode.style.color = "inherit";
    }

    if (errFlag) {
        appendFilterError(errArray);
        filterError.style.display = "block";
        return false;
    }
    else {
        filterError.style.display = "none";
    }

    return true;
}

function filter() {
    if(document.getElementById("no_prods")) {
        document.getElementById("no_prods").remove();
    }

    var products = document.getElementsByClassName("prod");
    var inputs = {
        inp_name: document.getElementById("inp-name").value.toLowerCase().trim(),
        inp_date: document.getElementById("inp-date").value.trim(),
        inp_exp: document.getElementsByName("inp-exp"),
        inp_vouch: document.getElementById("inp-voucher"),
        inp_descr: document.getElementById("inp-descr").value.toLowerCase().trim(),
        inp_weight: document.getElementById("inp-weight"),
        inp_color: document.getElementById("inp-color").value.toLowerCase()
    }
    var min_price = document.getElementById("inp-min-range")
    var max_price = document.getElementById("inp-max-range")
    var products_nr = 0;

    if (!verifyInputs(inputs)) {
        return;
    }

    for (let prod of products) {
        prod.style.display = "none";
        
        for (let i = 1; i <= 8; i++) {
            eval("cond" + i + " = false");
        }
        
        var values = {
            name: prod.getElementsByClassName("val-name")[0].innerHTML.toLowerCase().trim(),
            price: parseFloat(prod.getElementsByClassName("val-price")[0].innerHTML) + 0.01,
            date: prod.getElementsByClassName("val-date")[0].innerHTML,
            exp: prod.getElementsByClassName("val-exp")[0].innerHTML,
            voucher: prod.getElementsByClassName("val-vouch")[0].innerHTML.toLowerCase().trim(),
            descr: prod.getElementsByClassName("val-descr")[0].textContent.toLowerCase().trim(),
            weight: prod.getElementsByClassName("val-weight")[0].innerHTML,
            color: prod.getElementsByClassName("val-color")[0].innerHTML.toLowerCase()
        }

        if(inputs.inp_name.indexOf("*") > -1) {
            let first = inputs.inp_name.substring(0, inputs.inp_name.indexOf("*"));
            let last = inputs.inp_name.substring(inputs.inp_name.indexOf("*")+1);
            let re = new RegExp(`^(${first}).*(${last})$`);
            
            let words = values.name.split(" ");
            for (let word of words) {
                if (re.test(word)) {
                    cond1 = true;
                    break;
                }
            }
        }
        else {
            if(values.name.includes(inputs.inp_name)) {
                cond1 = true;
            }
        }

        if(values.price >= min_price.value && values.price <= max_price.value) {
            cond2 = true;
        }

        if (values.date.includes(inputs.inp_date)) {
            cond3 = true;
        }

        for (let tip of inputs.inp_exp) {
            if(tip.checked && tip.value == "Orice") {
                cond4 = true;
            }
            if (tip.checked && tip.value == values.exp) {
                cond4 = true;
            }
        }

        if(inputs.inp_vouch.checked && values.voucher == "da") {
            cond5 = true;
        }
        if(!inputs.inp_vouch.checked && values.voucher == "nu") {
            cond5 = true;
        }

        if(values.descr.includes(inputs.inp_descr)) {
            cond6 = true;
        }

        for (let w of inputs.inp_weight) {
            if(w.selected) {
                range = w.value.split(":");
                if(parseFloat(range[0]) <= values.weight && values.weight <= parseFloat(range[1])) {
                    cond7 = true;
                }
            }
        }

        if(inputs.inp_color == "toate" || inputs.inp_color == values.color) {
            cond8 = true;
        }

        if(cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7 && cond8) {
            products_nr += 1;
            prod.style.display = "block";
        }
    }

    if(!products_nr) {
        var title = document.getElementById("prods").firstElementChild;
        var no_prods = document.createElement("h3");
        no_prods.setAttribute("id", "no_prods");
        no_prods.innerText = "Nu există produse care să se potrivească filtrelor selectate " + String.fromCodePoint(0x1F641);
        no_prods.style.textAlign = "center";
        title.insertAdjacentElement("afterend", no_prods);
    }
}

function resetInputs() {
    if(document.getElementById("no_prods")) {
        document.getElementById("no_prods").remove();
    }

    var min_price = document.getElementById("inp-min-range")
    var max_price = document.getElementById("inp-max-range")
    var products = document.getElementsByClassName("prod");

    document.getElementById("filter-error").style.display = "none";
    document.getElementById("inp-name").parentNode.style.color = "inherit";
    document.getElementById("inp-name").classList.remove("is-invalid");
    document.getElementById("inp-date").parentNode.style.color = "inherit";
    document.getElementById("inp-exp-node").style.color = "inherit";
    document.getElementById("inp-weight").parentNode.style.color = "inherit";

    document.getElementById("inp-name").value = "";

    min_price.value = min_price.max / 2;
    max_price.value = max_price.max / 2;

    document.getElementById("inp-date").value = "";

    for (let tip of document.getElementsByName("inp-exp")) {
        if(tip.checked) {
            tip.checked = false;
        }
    }

    document.getElementById("inp-voucher").checked = true;
    document.getElementById("voucher-button").classList.replace("btn-outline-primary", "btn-primary");
    document.getElementById("voucher-button").classList.add("active");

    document.getElementById("inp-descr").value = "";

    document.getElementById("inp-color").value = "Toate";

    for (let weight of document.getElementById("inp-weight")) {
        if(weight.selected) {
            weight.selected = false;
        }
    }

    for (let prod of products) {
        prod.style.display = "block";
    }
}

function psort(sign) {
    var products = document.getElementsByClassName("prod");
    var prod_array = Array.from(products);

    prod_array.sort(function(a, b) {
        var a_name = a.getElementsByClassName("val-name")[0].innerHTML.toLowerCase().trim();
        var b_name = b.getElementsByClassName("val-name")[0].innerHTML.toLowerCase().trim();

        if(a_name == b_name) {
            var a_descr = a.getElementsByClassName("val-descr")[0].textContent.toLowerCase().trim().length();
            var b_descr = b.getElementsByClassName("val-descr")[0].textContent.toLowerCase().trim().length();
            
            return (a_descr - b_descr) * sign;
        }

        return sign * a_name.localeCompare(b_name);
    })

    for(let prod of prod_array) {
        prod.parentNode.appendChild(prod);
    }
}

function getSum() {
    var products = document.getElementsByClassName("prod");

    var s = 0;
    for (let prod of products) {
        if(prod.style.display == "block") {
            s += parseFloat(prod.getElementsByClassName("val-price")[0].innerHTML);
        }
    }

    var s_div = document.createElement("div");
    s_div.innerText = Math.round(s).toFixed(2) + " RON";
    document.getElementById("reset").insertAdjacentElement("afterend", s_div);

    setTimeout(function() {
        s_div.parentElement.removeChild(s_div);
    }, 2000)
}


function getVirtualCart() {
    let prod_ids = localStorage.getItem("virtual_cart");
    let prod_quants = localStorage.getItem("v_cart_quants"); 

    prod_ids = prod_ids ? prod_ids.split(",") : [];
    prod_quants = prod_quants ? prod_quants.split(",") : [];

    let i = 0
    for(let id of prod_ids) {
        let ch = document.querySelector(`[value='${id}'].c_select`);
        let quant = document.querySelector(`[id='quant${id}'].c_quantity`);

        if(ch) {
            ch.checked = true;
            quant.value = prod_quants[i];
        } else {
            console.log("Virtual cart id not found: ", id);
        }

        i++;
    }
}

function putVirtualCart() {
    let checkboxes = document.getElementsByClassName("c_select");
    
    for(let ch of checkboxes) {
        ch.onchange = function() {
            let prod_ids = localStorage.getItem("virtual_cart");
            let prod_quants = localStorage.getItem("v_cart_quants");

            prod_ids = prod_ids ? prod_ids.split(",") : [];
            prod_quants = prod_quants ? prod_quants.split(",") : [];

            let quant = document.getElementById("quant" + this.value);
            let stock = document.getElementById("stoc" + this.value);
            if(quant && !quant.value.match("^[1-9][0-9]*$")) {
                quant.value = "";
                quant.placeholder = "Introdu nr. întreg!";
            }
            console.log(quant.value, "?", stock.value, Number(quant.value) > Number(stock.value))
            if(quant && Number(quant.value) > Number(stock.value)) {
                quant.value = "";
                quant.placeholder = "Nr. prea mare!";
            }
            
            if(this.checked && quant.value.match("^[1-9][0-9]*$")) {
                prod_ids.push(this.value);
                prod_quants.push(quant.value);
            } else {
                let pos = prod_ids.indexOf(this.value);

                if(pos != -1) {
                    prod_ids.splice(pos, 1);
                    prod_quants.splice(pos, 1);
                }
            }

            localStorage.setItem("virtual_cart", prod_ids.join(","));
            localStorage.setItem("v_cart_quants", prod_quants.join(","));
        }
    }
}

window.addEventListener("DOMContentLoaded", function() {
    getVirtualCart();
    putVirtualCart();

    getPrices();

    document.getElementById("filter").addEventListener("click", filter);
    document.getElementById("sort1").addEventListener("click", function() {psort(1)});
    document.getElementById("sort-1").addEventListener("click", function() {psort(-1)});
    document.getElementById("sum").addEventListener("click", getSum);
    document.getElementById("reset").addEventListener("click", resetInputs);

    document.getElementById("inp-voucher").addEventListener("change", function() {
        if (document.getElementById("inp-voucher").checked) {
            document.getElementById("voucher-button").classList.replace("btn-primary", "btn-outline-primary");
            document.getElementById("voucher-button").classList.remove("active");
        }
        else {
            document.getElementById("voucher-button").classList.replace("btn-outline-primary", "btn-primary");
            document.getElementById("voucher-button").classList.add("active");
        }
    })
})