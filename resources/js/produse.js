window.onload = function() {
    document.getElementById("filtrare").onclick = function() {
        var inpNume = document.getElementById("inp-nume").value.toLowerCase().trim();
        var inpCategorie = document.getElementById("inp-categorie").value;
        var produse = document.getElementsByClassName("produse");

        for (let produs of produse) {
            var cond1 = false, cond2 = false;
            produs.style.display = "none";

            let nume = produs.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase().trim();
            if(nume.includes(inpNume)) {
                cond1 = true;
            }
            let categorie = produs.getElementsByClassName("val-categorie")[0].innerHTML;
            if(inpCategorie == "toate" || nume.includes(categorie)) {
                cond2 = true;
            }
            if(cond1 && cond2) {
                produs.style.display = "block";
            }
        }
    };
}