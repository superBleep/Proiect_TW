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
    prod_categs: null,
    online_users: null
}

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
        res.status(id).render("pages/error", {title:title, text:text, img:img})
    }
    else {
        res.render("pages/error", {title:title, text:text, img:img})   
    }
}

function getIp(req) {
    var ip = req.headers["x-forwarded-for"];
    if(ip) {
        let v = ip.split(",");
        return v[v.length - 1];
    } else if (req.ip) {
        return req.ip;
    } else {
        return req.connection.remoteAddress;
    }
}

function deleteAccess(){
    dbInstance.delete({
        table: "access",
        andConds: ["now() - access_date >= interval '1 day'"]
    }, function(err, rez){
        if(err) {
            console.log(err);
        }
    })
}
deleteAccess();
setInterval(deleteAccess, 60*60*1000);

app.use("/*", function(req, res, next) {
    res.locals.utilizator = req.session.utilizator;
    res.locals.galery_path = globalObj.galery_path
    res.locals.prod_categs = globalObj.prod_categs
    res.locals.images = globalObj.images
    res.locals.online_users = globalObj.online_users

    next();
})

app.all("/*", function(req, res, next) {
    let id_user = req.session.utilizator ? req.session.utilizator.id : null;

    if(id_user != null) {
        dbInstance.insert({
            table: "access",
            fields: ["ip", "user_id", "page"],
            values: [`'${getIp(req)}'`, `${id_user}`, `'${req.url}'`]
        }, function(err, rezQuery) {
            console.log(err);
        });
    }

    next();
})

app.get(["/", "/index", "/home", "/login"], function(req, res) {
    console.log("Requesting homepage...");

    let sql = `
        SELECT username, surname, name, chat_color, (
            SELECT access_date
            FROM users u1 JOIN access a ON(u1.id = a.user_id)
            WHERE u1.id = u.id 
            AND now() - access_date <= interval '8 minutes'
            ORDER BY access_date DESC
            LIMIT 1
        ) access_date
        FROM users u
        ORDER BY access_date ASC
    `;

    client.query(sql, function(err, queryRes) {
        let online_users = [];
        if(!err && queryRes.rowCount != 0) {
            online_users = queryRes.rows;
        }

        globalObj.online_users = online_users;

        res.render("pages/index", {ip: req.ip, images: globalObj.images, galery_path: globalObj.galery_path, CC_BY: globalObj.CC_BY});
    });
});

app.get("/galery_pg", function(req, res) {
    console.log("Requesting", req.url, "...");
    res.render("pages/galery_pg", {images: globalObj.images, galery_path: globalObj.galery_path, CC_BY: globalObj.CC_BY})
});

app.get("/contact", function(req, res) {
    console.log("Requesting", req.url, "...");
    res.render("pages/contact", {CC_BY: "Stock footage provided by <a class=\"link author-link-popup\" target=\"_blank\" href=\"https://www.videvo.net/profile/videvo\">Videvo</a>, downloaded from <a class=\"videvo-redirect\" target=\"_blank\" href=\"https://www.videvo.net\">videvo.net</a>"})
})

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
            res.render("pages/products", {products: products.rows, distinctVals: distinctVals})
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
            res.render("pages/product", {prod: rez.rows[0]});
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

            if(textFields["pass"] != textFields["r-pass"]) {
                throw new Error("Parola reintrodusă nu coincide cu cea dinainte!");
            }

            if (fileFields.profile_img.originalFilename) {
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

            res.render("pages/signup", {raspuns: "Inregistrare cu succes!"})
        } catch(e) {
            console.log("Signup form: " + e.message);
            res.render("pages/signup", {err: "Eroare: " + e.message});
        }
    });
});

app.post("/profile", function(req, res) {
    var form = new formidable.IncomingForm();

    form.parse(req , async function(err, textFields, fileFields) {
        try {
            let u = await User.getUserByUsernameAsync(textFields.username);
            let updateParams = {};
            
            if(textFields["new-pass"] != '') {
                if(textFields["r-new-pass"] == '') {
                    throw new Error("Parola nouă trebuie reintrodusă!");
                }
                else if(textFields["r-new-pass"] != textFields["new-pass"]) {
                    throw new Error("Parolele introduse nu coincid!");
                }

                updateParams["password"] = crypto.scryptSync(
                    textFields["new-pass"],
                    u.saltstring,
                    User.codeLength
                ).toString("hex");
            }

            if(textFields["email"] != u.email) {
                updateParams["email"] = textFields["email"];
            }

            for(const key in textFields) {
                if(key == "password" || key == "new-pass" || key == "r-new-pass" || key == "email") {
                    continue;
                }
                else if(textFields[key] != '') {
                    updateParams[key] = textFields[key];
                }
            }

            if (fileFields.profile_img.originalFilename != '') {
                if(u.profile_img && fs.existsSync(__dirname + u.profile_img)) {
                    fs.unlinkSync(__dirname + u.profile_img);
                }

                var old_path = fileFields.profile_img.filepath;
                var new_path = __dirname + "/resources/img/users/" + textFields.username + "." + fileFields.profile_img.originalFilename.split(".")[1].toLowerCase();
                var img_data = fs.readFileSync(old_path);
                
                fs.writeFile(new_path, img_data, function(err) {
                    if (err) {
                        console.log(err);
                    }
                })

                updateParams["profile_img"] = "/resources/img/users/" + textFields.username + "." + fileFields.profile_img.originalFilename.split(".")[1].toLowerCase();
            }

            let encryptedProfilePass = crypto.scryptSync(
                textFields.password,
                u.saltstring,
                User.codeLength
            ).toString("hex");
            if(encryptedProfilePass == u.password) {
                u.update(updateParams);
                u = await User.getUserByUsernameAsync(textFields.username);
    
                req.session.utilizator = u;
                res.locals.utilizator = req.session.utilizator;
    
                res.render("pages/profile", {resp: "Date modificate cu succes!"});

                date_modif = "";
                att = {};
                for(const key in updateParams) {
                    if(key == "surname") date_modif += "<p>Nume: " + updateParams[key] + "</p>"
                    if(key == "name") date_modif += "<p>Prenume: " + updateParams[key] + "</p>"
                    if(key == "password") date_modif += "<p>Parolă: " + textFields["new-pass"] + "</p>"
                    if(key == "email") date_modif += "<p>E-mail: " + updateParams[key] + "</p>"
                    if(key == "date_of_birth") date_modif += "<p>Data nașterii: " + updateParams[key] + "</p>"
                    if(key == "chat_color") date_modif += "<p>Culoare text chat: " + updateParams[key] + "</p>"
                    if(key == "phone") date_modif += "<p>Telefon: " + updateParams[key] + "</p>"
                    if(key == "profile_img") {
                        date_modif += "<p>Imagine profil</p> <img src=\"cid:prof_pic\" alt=\"Imagine profil\" width=\"100\" height=\"100\">"
                        att["filename"] = updateParams[key].split("/")[3];
                        att["path"] = __dirname + updateParams[key];
                        att["cid"] = "prof_pic";
                    } 
                }

                u.emailSender(
                    "Modificare date",
                    "Datele tale de pe site-ul www.allmuzica.ro au fost modificate",
                    `   <h1>Salut!</h1>
                        <p>Datele tale de pe site-ul <a href="http://${User.domainName}/index" style='font-weight: bold; font-style: italic; text-decoration-line: underline;'>www.allmuzica.ro</a> au fost modificate:</p>
                    ` + date_modif,
                    [att]
                )
            }
            else {
                throw new Error("Nu ai introdus parola corectă!");
            }
        } catch(e) {
            console.log("Profile form: " + e.message);
            res.render("pages/profile", {err: "Eroare: " + e.message});
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

app.post("/login", function(req, res) {
    var form = new formidable.IncomingForm()
    let referer = "pages/" + req.get("referer").split("/")[3];
    if(referer.includes("products") || referer.includes("login")) {
        referer = "pages/index";
    }

    form.parse(req, function(err, textFields, fileFields) {
        User.getUserByUsername(textFields.username, {
            req: req,
            res: res,
            password: textFields.password
        }, function(u, obparam) {            
            if(u.confirmed == false) {
                obparam.res.render(referer, {eroareLogin: "Ultiziatorul nu este confirmat!"});
                return
            }

            let encryptedLoginPass = crypto.scryptSync(
                obparam.password,
                u.saltstring,
                User.codeLength
            ).toString("hex");
            if (encryptedLoginPass == u.password) {
                obparam.req.session.utilizator = u;
                obparam.res.redirect(referer.split("/")[1]);
            }
            else {
                obparam.res.render(referer, {eroareLogin: "Date de logare incorecte!"});
            }
        })
    })
})

app.get("/logout", function(req, res){
    req.session.destroy();

    res.locals.utilizator = null;
    res.redirect("/index");
})

app.get("/users", async function(req, res) {
    columns = await dbInstance.selectAsync({
        table: "INFORMATION_SCHEMA.COLUMNS",
        fields: ["column_name"],
        andConds: ["TABLE_SCHEMA='public'", "TABLE_NAME='users'"]
    });

    users = await dbInstance.selectAsync({
        table: "users",
        fields: ["*"]
    });

    res.render("pages/users", {columns: columns.rows.map(x => x["column_name"]), users: users.rows});
})

app.post("/users", function(req, res) {
    var form = new formidable.IncomingForm();

    form.parse(req, async function(err, textFields, fileFields) {
        let u = (await User.searchAsync({id: `${textFields["id-user"]}`}))[0];
        let mess = "", mess_title = "", rol = "";

        if(u["role"] == "common") {
            u.update({role: "admin"});
            mess = "promovat";
            mess_title = "Promovare";
            rol = "admin";
        }
        else if(u["role"] == "admin") {
            u.update({role: "common"});
            mess = "retrogradat";
            mess_title = "Retrogradare";
            rol = "common";
        }

        u.emailSender(
            `${mess_title} rol`,
            `<p>Ai fost ${mess} la rolul ${rol}.</p>`,
            `<h1>Dragă ${u["name"]},</h1> 
            <p>Ai fost ${mess} la rolul ${rol} (username: ${u["username"]}).</p>
            <br><p>Echipa AllMuzica.</p> 
            <a href="http://${User.domainName}/index">www.allmuzica.ro</a>`
        );

        users = await dbInstance.selectAsync({
            table: "users",
            fields: ["*"]
        });

        res.render("pages/users", {columns: columns.rows.map(x => x["column_name"]), users: users.rows, status: "Modificare reușită!"});
    });
})

app.post("/deleteuser", function(req, res) {
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, textFields, fileFields) {
        try {
            let u = new User(req.session.utilizator);

            let encryptedLoginPass = crypto.scryptSync(
                textFields.password,
                u.saltstring,
                User.codeLength
            ).toString("hex");
            if(encryptedLoginPass == u.password) {
                u.emailSender(
                    "Ștergerea contului",
                    "Ne pare rău că ai plecat de la noi! :(",
                    `<h1>Salut ${u.name},</h1>
                    <p>Tocmai ți-ai șters contul de pe site-ul nostru. Ne pare rău că ai plecat de la noi :(.</p>
                    <br><p>Echipa AllMuzica.</p> 
                    <a href="http://${User.domainName}/index">www.allmuzica.ro</a>`
                );

                u.delete();
                req.session.destroy();
                res.locals.utilizator = null;

                res.redirect("/index");
            } else {
                throw new Error("Nu ai introdus parola corectă!");
            }
        } catch(e) {
            res.render("pages/deleteuser", {err: "Eroare: " + e.message});
        }
    });
})

app.get("/*", function(req, res) {
    console.log("Requesting", req.url, "...");
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
console.log("Server started\n----------------");