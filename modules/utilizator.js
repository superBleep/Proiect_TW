const {AccesBD} = require('./accesbd.js');
const parole = require("./parole.js");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

class Utilizator{
    static tipConexiune = "local";
    static tabel = "utilizatori";
    static parolaCriptare = "tehniciweb";
    static emailServer = "allmuzicatw@gmail.com";
    static lungimeCod = 64;
    static numeDomeniu = "localhost:8080";
    #eroare;

    constructor({id, username, nume, prenume, email, parola, rol, culoare_chat="black", poza} = {}) {
        this.id = id;

        //optional sa facem asta in constructor
        /*try {
            if(this.checkUsername(username)) this.username = username;
        } catch(e) {this.#eroare = e.message}*/

        this.nume = nume;
        this.prenume = prenume;
        this.email = email;
        this.parola = parola;
        this.rol = rol; //TO DO clasa Rol
        this.culoare_chat = culoare_chat;
        this.poza = poza;

        this.#eroare = "";
    }

    checkName(nume) {
        return nume != "" && nume.match(new RegExp(/^[A-Z][a-z]+$/));
    }

    set setareNume(nume) {
        if (this.checkName(nume)) this.nume = nume
        else {
            throw new Error("Nume gresit");
        };
    }

    checkUsername(username) {
        return username != "" && username.match(new RegExp("^[A-Za-z0-9]+$"));
    }

    set setareUsernume(username) {
        if (this.checkUsername(username)) this.username = username
        else {
            throw new Error("Username gresit");
        };
    }

    static criptareParola (parola) {
        return crypto.scryptSync(parola, Utilizator.parolaCriptare, Utilizator.lungimeCod).toString("hex");
    }
    
    salvareUtilizator() {
        let parolaCriptata = Utilizator.criptareParola(this.parola);
        let utiliz = this;
        console.log(Object.keys(AccesBD))
        let token = parole.genereazaToken(100);
        let accbd = AccesBD.getInstanta(Utilizator.tipConexiune);
        accbd.insert({tabel: Utilizator.tabel, campuri: ["username", "nume", "prenume", "parola", "email", "culoare_chat", "cod"], valori: [`'${utiliz.username}'`, `'${this.nume}'`, `'${this.prenume}'`, `'${parolaCriptata}'`, `'${this.email}'`, `'${this.culoare_chat}'`, `'${token}'`]}, function(err, rez) {
            if (err) {
                console.log(err);
            }
            utiliz.trimiteMail("Te-ai inregistrat cu succes", "Username-ul tau este " + utiliz.user, `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${utiliz.username}.</p> <p><a href='http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}'>Click aici pentru confirmare</a></p>`)
        })
    }

    async trimiteMail(subiect, mesajText, mesajHtml, atasamente=[]){
        var transp= nodemailer.createTransport({
            service: "gmail",
            secure: false,
            auth:{//date login 
                user:Utilizator.emailServer,
                pass:"yjzxyxbzvakboqwk"
            },
            tls:{
                rejectUnauthorized:false
            }
        });
        //genereaza html
        await transp.sendMail({
            from:Utilizator.emailServer,
            to:this.email, //TO DO
            subject:subiect,//"Te-ai inregistrat cu succes",
            text:mesajText, //"Username-ul tau este "+username
            html: mesajHtml,// `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${username}.</p> <p><a href='http://${numeDomeniu}/cod/${username}/${token}'>Click aici pentru confirmare</a></p>`,
            attachments: atasamente
        })
        console.log("trimis mail");
    }

    static getUtilizDupaUsername (username, obparam, proceseazaUtiliz) {
        AccesBD.getInstanta(Utilizator.tipConexiune).select({tabel:"utilizatori", campuri:['*'], conditiiAnd:[`username='${username}'`]}, function (err, rezSelect) {
            if (err || rezSelect.rows.length==0) {
                console.error("Utilizator", err);

                if(rezSelect)
                    console.log("Utilizator", rezSelect.rows.length);
                throw new Error()
            }
            let u = new Utilizator({id: rezSelect.rows[0].id,
                username: rezSelect.rows[0].username, 
                nume: rezSelect.rows[0].nume, 
                prenume: rezSelect.rows[0].nume, 
                email: rezSelect.rows[0].email, 
                parola: rezSelect.rows[0].parola,
                rol: rezSelect.rows[0].rol, 
                culoare_chat: rezSelect.rows[0].culoare_chat, 
                poza: rezSelect.rows[0].poza})
            proceseazaUtiliz(u, obparam);
        })
    }
}

module.exports = {Utilizator: Utilizator}