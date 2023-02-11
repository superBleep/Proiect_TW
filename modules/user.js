const {dbAccess} = require('./dbaccess.js');
const {RoleFactory} = require("./roles.js");
const nodemailer = require("nodemailer");
const {generateToken} = require("./passtokens.js");
const crypto = require("crypto");

/**
 * Clasa respectiva utilizatorului
 */
class User {
    static connectionType = "local";
    static table = "users";
    static encryptionPass = generateToken(100);
    static codeLength = 64;
    static emailServer = "allmuzicatw@gmail.com";
    static domainName = "localhost:8080";
    #eroare = "";

    /**
     * Constructorul clasei User
     * @constructor
     * @param {{id: number, username: String, surname: String, name: String, email: String, password: String, date_of_birth: String, register_date: String, chat_color: String, role: String, phone: String, profile_img: String, token: String, confirmed: boolean}} Object - Parametrii constructorului 
     */
    constructor({id, username, surname, name, email, password, date_of_birth, register_date, chat_color, role="common", phone, profile_img, token, confirmed='FALSE', saltstring=User.encryptionPass} = {}) {
        this.id = id;

        try {
            if(this.checkUsername(username)) this.username = username;
            if(this.checkNames(surname)) this.surname = surname;
            if(this.checkNames(name)) this.name = name;
            if(this.checkEmail(email)) this.email = email;
            if(this.checkPassword(password)) this.password = password;
            if(this.checkPhone(phone)) this.phone = phone;
        } catch(e) {
            this.#eroare = e.message;
            console.log(this.#eroare);
        }

        this.date_of_birth = date_of_birth
        this.register_date = register_date;
        this.chat_color = chat_color;
        if(typeof(role) == "string") {
            this.role = RoleFactory.createRole(role);
        } else {
            this.role = RoleFactory.createRole(role["code"]);
        }
        this.profile_img = profile_img;
        this.token = token;
        this.confirmed = confirmed;
        this.saltstring = saltstring;
    }

    /**
     * Valideaza username-ul dat ca parametru
     * @param {String} username - Username-ul de verificat 
     * @returns {Boolean}
     */
    checkUsername(username) {
        return username != "" && username.match(new RegExp("[A-Za-z0-9]+"));
    }
    /**
     * Valideaza numele dat ca parametru
     * @param {String} names - Numele de verificat 
     * @returns {Boolean}
     */
    checkNames(names) {
        return names != "" && names.match(new RegExp("^[A-Z][a-z]+$"));
    }
    /**
     * Valideaza email-ul dat ca parametru
     * @param {String} email - Email-ul de verificat 
     * @returns {Boolean}
     */
    checkEmail(email) {
        return email != "" && email.match(new RegExp("[A-Za-z0-9]+@[A-Za-z]+.[a-z]+"));
    }
    /**
     * Valideaza parola data ca parametru
     * @param {String} password - Parola de verificat 
     * @returns {Boolean}
     */
    checkPassword(password) {
        return password != "";
    }
    /**
     * Valideaza numarul de telefon dat ca parametru
     * @param {String} phone - Numarul de verificat 
     * @returns {Boolean}
     */
    checkPhone(phone) {
        if(phone) {
            return phone.match(new RegExp("\\+?0[0-9]{9,}"));
        }
        else
            return null
    }

    /**
     * Functie de modificare a datelor utilizatorului
     * @param {Object} params - Parametrii modificarii
     */
    update (updateParams) {
        let user = this;
        let dbAcc = dbAccess.getInstance(User.connectionType);
        
        let values = [];
        for (const key in updateParams) {
            values.push(`${updateParams[key]}`);
        }

        dbAcc.update({
            table: User.table,
            fields: Object.keys(updateParams), 
            values: values,
            andConds: [`id = ${user.id}`]
        }, function(err, res) {
            if (err) {
                console.log(err);
            }
        });
    }

    /**
     * Functie de criptare a parolei
     * @param {String} password - Parola de criptat
     * @returns {Buffer}
     */
    static encryptPass (password) {
        return crypto.scryptSync(password, User.encryptionPass, User.codeLength).toString("hex");
    }

    /**
     * Functie de trimitere a unui mail catre serverul de mail-uri
     * @param {String} subject  - Linia de subiect a email-ului
     * @param {String} textMessage - Mesajul in format text al email-ului
     * @param {String} htmlMessage - Mesajul in format HTML al email-ului
     * @param {Array} attach - Atasamentele email-ului
     */
    async emailSender (subject, textMessage, htmlMessage, attach=[]) {
        var transp = nodemailer.createTransport({
            service: "gmail",
            secure: false,
            auth: {
                user: User.emailServer,
                pass: "lqqhbpxdqmyzbxsh"
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        await transp.sendMail({
            from: User.emailServer,
            to: this.email,
            subject: subject,
            text: textMessage,
            html: htmlMessage,
            attachments: attach
        })
    }
    
    /**
     * Functie de inregistrare a utilizatorului
     */
    saveUser() {
        let encryptedPass = User.encryptPass(this.password);
        let token = generateToken(50);
        let user = this;
        let dbAcc = dbAccess.getInstance(User.connectionType);

        let valuesArr = [`'${this.username}'`, `'${this.surname}'`, `'${this.name}'`, `'${this.email}'`, `'${encryptedPass}'`, 'CURRENT_DATE', `'${this.chat_color}'`, `'${this.role["code"]}'`, `'${token}'`, `'${this.confirmed}'`, `'${this.saltstring}'`]
        let fieldsArr = ["username", "surname", "name", "email", "password", "register_date", "chat_color", "role", "token", "confirmed", "saltstring"]

        if(this.date_of_birth != undefined) {
            valuesArr.push(`TO_DATE('${this.date_of_birth}', 'YYYY-MM-DD')`);
            fieldsArr.push("date_of_birth");
        }
        if(this.phone != undefined) {
            valuesArr.push(`'${this.phone}'`);
            fieldsArr.push("phone");
        }
        if(this.profile_img != undefined) {
            valuesArr.push(`'${this.profile_img}'`);
            fieldsArr.push("profile_img");
        }
        
        dbAcc.insert({
            table: User.table, 
            fields: fieldsArr, 
            values: valuesArr
        }, function(err, res) {
            if (err) {
                console.log(err);
            }
            user.emailSender("Salut, stimate " + user.surname, "Username-ul tău este " + user.username + "pe site-ul www.allmuzica.ro", `
            <h1>Hello!</h1>
            <p>
                Username-ul tău este ${user.username} pe site-ul <a href='http://${User.domainName}/index' style='font-weight: bold; font-style: italic; text-decoration-line: underline;'>www.allmuzica.ro</a>.
            </p> 
            <p>
                <a href='http://${User.domainName}/cod_mail/${token}-${Date.now()}/${user.username.toUpperCase()}'>Click aici pentru confirmare</a>
            </p>`)
        })
    }

    /**
     * Functie de stergere a utilizatorului
     */
    delete() {
        let user = this;
        let dbAcc = dbAccess.getInstance(User.connectionType);

        dbAcc.delete({
            table: User.table,
            andConds: [`id = ${user.id}`]
        }, function(err, res) {
            if (err) {
                console.log(err);
            }
        })
    }

    /**
     * Cauta utilizatorul dupa username
     * @param {String} username - Username-ul pentru care se face cautarea 
     * @param {Object} obParam - O lista de campuri pentru functia de callback a interogarii 
     * @param {Function} procUser - Functia de callback a interogarii
     */
    static getUserByUsername (username, obParam, procUser) {
        let error = null;
        let dbAcc = dbAccess.getInstance(User.connectionType);

        dbAcc.select({
            table: "users",
            fields: ['*'],
            andConds: [`username='${username}'`]
        }, function (err, res) {
            if (err) {
                error = -2;
            }
            else if (res.rowCount == 0) {
                error = -1;
            }

            let u = new User(res.rows[0]);
            procUser(u, obParam, error);
        })
    }

    /**
     * Functie asincrona de cautare a utilizatorului dupa username
     * @param {String} username - Username-ul pentru care se face cautarea 
     * @returns {User}
     */
    static async getUserByUsernameAsync(username) {
        if (!username) {
            return null;
        }

        try {
            let dbAcc = dbAccess.getInstance(User.connectionType);
            let res = await dbAcc.selectAsync({
                table: "users",
                fields: ["*"],
                andConds: [`username='${username}'`]
            });

            if (res.rowCount != 0) {
                return new User(res.rows[0]);
            }
            else {
                console.log("User.getUserByUsernameAsync: user not found");
                return null;
            }
        }
        catch (e) {
            console.log(e);
            return null;
        }
    }

    /**
     * Functie de cautare a utilizatorilor dupa parametrii dati
     * @param {Object} obParam - Lista de parametri pentru care se face cautarea
     * @param {Function} callback - Functia de callback a interogarii 
     */
    static search(obParam, callback) {
        let userList = [];
        let conds = [];
        let error = null;
        let dbAcc = dbAccess.getInstance(User.connectionType);

        for (let prop in obParam) {
            if (obParam[prop]) {
                conds.push(`${prop}=${obParam[prop]}`);
            }
        }

        dbAcc.select({
            table: "users",
            fields: ["*"],
            andConds: conds
        }, function (err, res) {
            if (err) {
                error = "User.search: " + err;
            }
            else if (res.rowCount == 0) {
                error = "User.search: users not found";
            }

            for(let user of res.rows) {
                userList.push(new User(user));
            }

            callback(error, userList);
        })
    }

    /**
     * Functie asincrona de cautare a utilizatorilor dupa parametrii dati
     * @param {Object} obparam - Lista de parametri dupa care se face cautarea 
     * @returns {Object}
     */
    static async searchAsync(obparam) {
        let userList = [];
        let conds = [];
        let dbAcc = dbAccess.getInstance(User.connectionType);

        for (let prop in obparam) {
            if (obparam[prop]) {
                conds.push(`${prop}=${obparam[prop]}`);
            }
        }

        let selectRes = await dbAcc.selectAsync({
            table: "users",
            fields: ["*"],
            andConds: conds
        });

        for(let user of selectRes.rows) {
            userList.push(new User(user));
        }

        return userList;
    }

    /**
     * Verifica daca utilizatorul are dreptul dat ca parametru
     * @param {String} prvilege - Dreptul dupa care se face verificarea
     * @returns {Boolean}
     */
    hasPrivilege(prvilege) {
        return this.role.hasPrivilege(prvilege);
    }
}

module.exports = {User: User}