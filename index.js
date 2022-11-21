const express = require("express");
const fs = require("fs");
const sharp = require("sharp");

app = express();

app.set("view engine", "ejs");
console.log("Path: " + __dirname);
app.use("/resources", express.static(__dirname + "/resources"));

globalObj = {
    errors: null,
    images: null
}

function createImages() {
    var fileContent = fs.readFileSync(__dirname + "/resources/json/galerie.json").toString("utf-8");
    var obj = JSON.parse(fileContent);
    var med_dim = 200;
    var small_dim = 100;

    globalObj.images = obj.images;
    
    globalObj.images.forEach(function (elem) {
        [fileName, extension] = elem.file.split(".")
        if(!fs.existsSync(obj.galery_path + "/med/")) {
            fs.mkdirSync(obj.galery_path + "/med/");
        }
        if(!fs.existsSync(obj.galery_path + "/small/")) {
            fs.mkdirSync(obj.galery_path + "/small/");
        }
        elem.med_file = obj.galery_path + "/med/" + fileName + ".webp";
        elem.small_file = obj.galery_path + "/small/" + fileName + ".webp";
        elem.file = obj.galery_path + "/" + elem.file;
        sharp(__dirname + "/" + elem.file).resize(med_dim).toFile(__dirname + "/" + elem.med_file);
        sharp(__dirname + "/" + elem.file).resize(small_dim).toFile(__dirname + "/" + elem.small_file);
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
    res.render("pages/index", {ip: req.ip, images: globalObj.images});
})

app.get("/*.ejs", function(req, res) {
    renderError(res, 403);
})

app.get("/*", function(req, res) {
    console.log("Requesting ", req.url, "...");
    res.render("pages" + req.url, function(err=null, render_res) {
        if(err) {
            if(err.message.includes("Failed to lookup view"))
                renderError(res, 404);
            else
                renderError(res);
        }
        else {
            res.send(render_res);
        }
    });
})

app.listen(8080);
console.log("Server started");