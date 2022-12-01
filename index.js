const express = require("express");
const fs = require("fs");
const sharp = require("sharp");
//const {Client} = require("pg");
const sass = require("sass");
/*var client = new Client({
    database: "postgres",
    user: "luca",
    password: "luca",
    host: "localhost",
    port: 5432
});
client.connect();

client.query("SELECT * FROM enum_range(null::categ_prajitura)", function(err, rez) {
    if(err)
        console.log(err);
    else
        console.log(rez.rows);
});*/

app = express();

app.set("view engine", "ejs");
console.log("Path: " + __dirname);
app.use("/resources", express.static(__dirname + "/resources"));
app.use("/node_modules", express.static(__dirname + "/node_modules"));

globalObj = {
    errors: null,
    images: null,
    galery_path: null,
    CC_BY: null,
    scss_files: null
}

function generateSCSS() {
    console.log("Compiling SCSS files...");
    var fileContent = fs.readFileSync(__dirname + "/resources/json/scss-files.json").toString("utf-8");
    var obj = JSON.parse(fileContent);
    globalObj.scss_files = obj.filenames;
    
    globalObj.scss_files.forEach(function (elem) {
        var scss_comp = sass.compile(__dirname + "/resources/scss/" + elem + ".scss", {sourceMap:true});
        fs.writeFileSync(__dirname + "/resources/css/" + elem + ".css", scss_comp.css);
    });
}
generateSCSS();

function createImages() {
    console.log("Generating galery images...");
    var fileContent = fs.readFileSync(__dirname + "/resources/json/galery.json").toString("utf-8");
    var obj = JSON.parse(fileContent);
    var med_dim = 200;
    var small_dim = 100;

    globalObj.images = obj.images;
    globalObj.galery_path = obj.galery_path;
    globalObj.CC_BY = obj.CC_BY;

    globalObj.images.forEach(function (elem) {
        [fileName, extension] = elem.file_path.split(".")
        if(!fs.existsSync(obj.galery_path + "/med/")) {
            fs.mkdirSync(obj.galery_path + "/med/");
        }
        if(!fs.existsSync(obj.galery_path + "/small/")) {
            fs.mkdirSync(obj.galery_path + "/small/");
        }

        var file_path = obj.galery_path + "/" + elem.file_path;
        var med_file = obj.galery_path + "/med/" + fileName + ".webp";
        var small_file = obj.galery_path + "/small/" + fileName + ".webp";
        sharp(__dirname + "/" + file_path).resize(med_dim).toFile(__dirname + "/" + med_file);
        sharp(__dirname + "/" + file_path).resize(small_dim).toFile(__dirname + "/" + small_file);
    });
}
createImages()

function createErrors() {
    var fileContent = fs.readFileSync(__dirname + "/resources/json/errors.json").toString("utf-8");
    globalObj.errors = JSON.parse(fileContent);
}
createErrors()

function renderError(res, id, title, text, img) {
    var error = globalObj.errors.error_info.find(function(elem) {
        return elem.id == id;
    });

    title = title || (error && error.title) || globalObj.errors.default_error.title;
    text = text || (error && error.text) || globalObj.errors.default_error.text;
    img = img || (error && globalObj.errors.path + "/" + error.img) || globalObj.errors.path + "/" + globalObj.errors.default_error.img;

    if (error && error.status) {
        res.status(id).render("pages/error", {title:title, text:text, img:img})
    }
    else {
        res.render("pages/error", {title:title, text:text, img:img})   
    }
}

app.get(["/", "/index", "/home"], function(req, res) {
    console.log("Requesting homepage...");
    res.render("pages/index", {ip: req.ip, images: globalObj.images, galery_path: globalObj.galery_path, CC_BY: globalObj.CC_BY});
});
app.get("/galery_pg", function(req, res) {
    console.log("Requesting ", req.url, "...");
    res.render("pages/galery_pg", {images: globalObj.images, galery_path: globalObj.galery_path, CC_BY: globalObj.CC_BY})
});

/*app.get("/produse", function(req, res) {
    console.log(req.query);
    client.query("SELECT * FROM unnset(enum_range(null:categ_prajitura))", function(err, rezCateg) {
        console.log(200)
        continuareQuery = "and "
        if(req.query.tip)
            continuareQuery += `tip = '${req.query.tip}'`
        client.query("SELECT * FROM prajituri", function(err, rez) {
            if(err) {
                console.log(err);
                renderError(res, 2);
            }
            else {
                res.render("pages/produse", {produse: rez.rows, optiuni: rezCateg.rows});
            }
        });
    });
});
app.get("/produs/:id", function(req, res) {
    client.query("SELECT * FROM prajituri WHERE id = " + req.params.id, function(err, rez) {
        if(err) {
            console.log(err);
            renderError(res, 2);
        }
        else {
            res.render("pages/produs", {produ: rez.rows[0]});
        }
    });
});*/

app.get("/*.ejs", function(req, res) {
    renderError(res, 403);
});

app.get("/*", function(req, res) {
    console.log("Requesting ", req.url, "...");
    res.render("pages" + req.url, function(err=null, render_res) {
        if(err) {
            console.log(err)
            if(err.message.includes("Failed to lookup view"))
                renderError(res, 404);
            else
                renderError(res);
        }
        else {
            res.send(render_res);
        }
    });
});

app.listen(8080);
console.log("Server started");