const express = require("express");

app = express();

app.set("view engine", "ejs");
console.log("Cale proiect: " + __dirname);
app.use("/resources", express.static(__dirname + "/resources"));

app.get("/*", function(req, res) {
    console.log("Requesting ", req.url, "...");
    res.render("pages" + req.url);
})

app.listen(8080);
console.log("Server started");