const express = require("express");
const fs = require("fs");
const sharp = require("sharp");
const sass = require("sass");
const formidable = require("formidable");
const {User} = require("./modules/user.js");
const {dbAccess} = require("./modules/dbaccess.js");
const session = require(`express-session`);
const crypto = require("crypto");

var dbInstance = dbAccess.getInstance({init: "local"});
var client = dbInstance.getClient();

app = express();

app.use(session({
    secret: 'abcdef',
    resave: true,
    saveUninitialized: false
}))

app.set("view engine", "ejs");
console.log("Path: " + __dirname);
app.use("/resources", express.static(__dirname + "/resources"));
app.use("/node_modules", express.static(__dirname + "/node_modules"));

globalObj = {
    scss_files: null,
    images: null,
    galery_path: null,
    CC_BY: null,
    errors: null,
    prod_categs: null
}

app.use("/*", function(req, res, next) {
    res.locals.utilizator = req.session.utilizator;
    res.locals.galery_path = globalObj.galery_path
    res.locals.prod_categs = globalObj.prod_categs
    res.locals.images = globalObj.images

    next();
})

function generateSCSS() {
    console.log("Compiling SCSS files...")
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

function createProdCategs() {
    console.log("Getting product categories...")
    client.query("SELECT * FROM UNNEST(enum_range(null::prod_category)) AS categ", function(err, categs) {
        globalObj.prod_categs = categs.rows.map(function(e) {e = e.categ; return e})
    })
}
createProdCategs()

function renderError(res, id, title, text, img) {
    var error = globalObj.errors.error_info.find(function(elem) {
        return elem.id == id;
    });

    title = title || (error && error.title) || globalObj.errors.default_error.title;
    text = text || (error && error.text) || globalObj.errors.default_error.text;
    img = img || (error && globalObj.errors.path + "/" + error.img) || globalObj.errors.path + "/" + globalObj.errors.default_error.img;

    if (error && error.status) {
        res.status(id).render("pages/error", {title:title, text:text, img:img, prod_categs: globalObj.prod_categs})
    }
    else {
        res.render("pages/error", {title:title, text:text, img:img, prod_categs: globalObj.prod_categs})   
    }
}

app.get(["/", "/index", "/home", "/login"], function(req, res) {
    console.log("Requesting homepage...");
    res.render("pages/index", {ip: req.ip, images: globalObj.images, galery_path: globalObj.galery_path, CC_BY: globalObj.CC_BY, prod_categs: globalObj.prod_categs});
});
app.get("/galery_pg", function(req, res) {
    console.log("Requesting", req.url, "...");
    res.render("pages/galery_pg", {images: globalObj.images, galery_path: globalObj.galery_path, CC_BY: globalObj.CC_BY, prod_categs: globalObj.prod_categs})
});

app.get("/products", function(req, res) {
    distinctVals = {
        colors: null,
        dates: null
    }
    client.query("SELECT DISTINCT TO_CHAR(add_date, 'fmDD/TMMonth/YYYY') AS date FROM products", function(err, dates) {
        distinctVals.dates = dates.rows.map(function(e) {e = e.date; return e})
    })
    client.query("SELECT DISTINCT color FROM products", function(err, colors) {
        distinctVals.colors = colors.rows.map(function(e) {e = e.color; return e})
    })
    
    queryAdd = ""
    if (req.query.t) {
        queryAdd += ` AND LOWER(category::text) = '${req.query.t}'`
    }
    client.query("SELECT * FROM products WHERE 1=1" + queryAdd, function(err, products) {
        if(err) {
            console.log(err)
            renderError(res, 2)
        }
        else {
            if (req.query.t) {
                console.log("Requesting /products/" + req.query.t)
            }
            else {
                console.log("Requesting /products")
            }
            res.render("pages/products", {products: products.rows, prod_categs: globalObj.prod_categs, distinctVals: distinctVals})
        }
    })
})
app.get("/product/:id", function(req, res) {
    client.query("SELECT * FROM products WHERE id = " + req.params.id, function(err, rez) {
        if(err) {
            console.log(err);
            renderError(res, 2);
        }
        else {
            res.render("pages/product", {prod: rez.rows[0], prod_categs: globalObj.prod_categs});
        }
    });
});

app.get("/*.ejs", function(req, res) {
    renderError(res, 403);
});

app.post("/signup", function(req, res) {
    var form = new formidable.IncomingForm();

    form.parse(req, async function(err, textFields, fileFields) {
        try {
            var newUser = new User({username: textFields.username, surname: textFields.surname, name: textFields.name, email: textFields.email, password: textFields.pass, chat_color: textFields.chat_color});

            if(textFields.date_of_birth != '') {
                newUser.date_of_birth = textFields.date_of_birth;
            }
            if(textFields.phone != '') {
                newUser.phone = textFields.phone;
            }

            let userPromise = await User.getUserByUsernameAsync(textFields.username);
            if(userPromise != null) {
                throw new Error("User-ul exista deja!");
            }

            if (fileFields.profile_img) {
                var old_path = fileFields.profile_img.filepath;
                var new_path = __dirname + "/resources/img/users/" + textFields.username + "." + fileFields.profile_img.originalFilename.split(".")[1].toLowerCase();
                var img_data = fs.readFileSync(old_path);
                
                fs.writeFile(new_path, img_data, function(err) {
                    if (err) {
                        console.log(err);
                    }
                })

                newUser.profile_img = "/resources/img/users/" + textFields.username + "." + fileFields.profile_img.originalFilename.split(".")[1].toLowerCase();
            }

            newUser.saveUser();

            res.render("pages/signup", {raspuns: "Inregistrare cu succes!", prod_categs: globalObj.prod_categs})
        } catch(e) {
            console.log("Signup form: " + e.message)
            res.render("pages/signup", {err: "Eroare: " + e.message, prod_categs: globalObj.prod_categs});
        }
    });
});

app.get("/cod_mail/:token1-:token2/:username", function(req, res) {
    try {
        User.getUserByUsername(req.params.username, {res: res, token: req.params.token1}, function(u, obparam) {
            dbAccess.getInstance().update({
                table: "users", 
                fields: ["confirmed"], 
                values: ["TRUE"],
                andConds: [`token='${obparam.token}'`]},
                function (err, updateRes) {
                    if (err || updateRes.rowCount == 0) {
                        console.log("Code error: ", err);
                        renderError(res, 3);
                    }
                    else {
                        res.render("pages/confirmed.ejs", {prod_categs: globalObj.prod_categs});
                    }
                })
        })
    } catch (e) {
        console.log("Index error:", e)
        renderError(res, 1);
    }
})

app.get("/logout", function(req, res){
    req.session.destroy();

    res.locals.utilizator = null;
    res.render("pages/index");
})

app.get("/*", function(req, res) {
    console.log("Requesting", req.url, "...");
    res.render("pages" + req.url, {prod_categs: globalObj.prod_categs}, function(err=null, render_res) {
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

app.post("/login", function(req, res) {
    var form = new formidable.IncomingForm()

    form.parse(req, function(err, textFields, fileFields) {
        User.getUserByUsername(textFields.username, {
            req: req,
            res: res,
            password: textFields.password
        }, function(u, obparam) {            
            if(u.confirmed == false) {
                obparam.res.render("pages/index", {eroareLogin: "Ultiziatorul nu este confirmat!"});
                return
            }

            let encryptedLoginPass = crypto.scryptSync(
                obparam.password,
                u.saltstring,
                User.codeLength
            ).toString("hex");
            if (encryptedLoginPass == u.password) {
                obparam.req.session.utilizator = u;
                obparam.res.redirect("/index");
            }
            else {
                obparam.res.render("pages/index", {eroareLogin: "Date de logare incorecte!"});
            }
        })
    })
})

app.listen(8080);
console.log("Server started\n----------------");