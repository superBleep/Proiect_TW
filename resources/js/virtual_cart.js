window.addEventListener("DOMContentLoaded", function() {
	prod_ids = localStorage.getItem("virtual_cart");
	prod_quants = localStorage.getItem("v_cart_quants");

	if(prod_ids && prod_quants) {
		var v_ids = prod_ids.split(",");
		var v_qs = prod_quants.split(",");

		fetch("/cart_products", {
			method: "POST",
			headers: {'Content-Type': 'application/json'},
			mode: 'cors',		
			cache: 'default',
			body: JSON.stringify({
				ids_prod: v_ids
			})
		})
		.then(function(res) {
            return res.json();
        })
		.then(function(jsonObj) {
			let main = document.getElementsByTagName("main")[0];
			let btn = document.getElementById("buy");

			for(let prod of jsonObj) {
				for(let quant in v_qs) {
					if(Number(quant) > Number(prod.stoc)) {
						let p = document.createElement("p");
						p.innerHTML = "Stocul unor produse din coș a fost modificat! Comanda ta actuala nu va fi procestă...";
						main.appendChild(p);
					
						btn.hidden = true;

						return;
					}
				}
			}

			for(let prod of jsonObj) {
				let article = document.createElement("article");
				article.classList.add("virtual_cart");

				let h3 = document.createElement("h3");
				h3.innerHTML = "Nume: " + prod.name;
				article.appendChild(h3);

				let price = document.createElement("p");
				price.innerHTML = "Preț: " + prod.price;
				article.appendChild(price);
				
				let quantity = document.createElement("p");
				quantity.innerHTML = "Cantitate: " + v_qs[v_ids.indexOf(prod.id.toString())] + " buc.";
				article.appendChild(quantity);

				let description = document.createElement("p");
				description.innerHTML = "Descriere: " + prod.description;
				article.appendChild(description);

				let exp_type = document.createElement("p");
				exp_type.innerHTML = "Tip expediere: " + prod.exp_type;
				article.appendChild(exp_type);

				let color = document.createElement("p");
				color.innerHTML = "Culoare: " + prod.color;
				article.appendChild(color);

				main.insertBefore(article, btn);
			}
		})
        .catch(function(err) {
            console.log(err)
        });

		document.getElementById("buy").addEventListener("click", function() {
			prod_ids = localStorage.getItem("virtual_cart");
			prod_quants = localStorage.getItem("v_cart_quants");

			if(prod_ids && prod_quants) {
				let v_ids = prod_ids.split(",");
				let v_qs = prod_quants.split(",");

				fetch("/buy", {
					method: "POST",
					headers: {'Content-Type': 'application/json'},
					mode: 'cors',		
					cache: 'default',
					body: JSON.stringify({
						ids_prod: v_ids,
						prod_quants: v_qs
					})
				})
				.then(function(res) {
                    return res.text();
                })
				.then(function(resText) {
					if(resText) {
						localStorage.removeItem("virtual_cart");
						localStorage.removeItem("v_cart_quants");

						let p = document.createElement("p");
						p.innerHTML = resText;
						document.getElementsByTagName("main")[0].innerHTML = "";
						document.getElementsByTagName("main")[0].appendChild(p)
					}
				})
                .catch(function(err) {
                    console.log(err)
                });
			}
        });
	}
	else{
		document.getElementsByTagName("main")[0].innerHTML = "<p>Coșul virtual este gol!</p>";
	}
});