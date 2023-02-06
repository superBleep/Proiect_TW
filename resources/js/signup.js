window.onload = function() {
    var form = document.getElementById("form_inreg");
    
    if (form) {
        form.addEventListener("submit", function() {
            if(document.getElementById("inp-pass").value != document.getElementById("inp-r-pass").value) {
                alert("Nu ati introdus acelasi sir pentru campurile \"parola\" si \"reintroducere parola\".");
                return false;
            }

            return true;
        })
    }
 }