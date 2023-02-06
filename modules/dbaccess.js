const {Client} = require("pg");

/**
 * Clasa de acces de tip singleton la baza de date
 */
class dbAccess{
    static #instance = null;
    static #initialized = false;

    /**
     * Constructorul clasei dbAccess
     * @constructor
     */
    constructor() {
        if(dbAccess.#instance){
            throw new Error("dbAccess already instanced");
        }
        else if(!dbAccess.#initialized){
            throw new Error("Must initialize with getInstance()");
        }
    }

    /**
     * Functie de initializare a conexinunii
     * la baza de date
     */
    initLocal() {
        this.client = new Client({
            user: "client_allmuzica", 
            password: "#281products", 
            database: "allmuzica",
            host: "localhost", 
            port: 5432
        });
        this.client.connect();
    }

    /**
     * Getterul pentru obiectul de tip client
     * @returns {Client} client - obiectul de tip client
     */
    getClient() {
        if(!dbAccess.#instance) {
            throw new Error("dbAccess not instanced");
        }
        return this.client;
    }

    /**
     * Getter pentru instanta clasei
     * @param {{init: String}} obiect - contine tipul de initializare a bazei de date
     * @returns {dbAccess}
     */
    static getInstance ({init="local"} = {}) {
        if(!this.#instance) {
            this.#initialized = true;
            this.#instance = new dbAccess();

            try{
                switch(init) {
                    case "local": this.#instance.initLocal();
                }                
            }
            catch (e) {
                console.error("Database initialization error!");
            }
        }
        return this.#instance;
    }

    /**
     * Functie de interogare in baza de date
     * @param {{table: string, fields: String[], andConds: String[]}} Object - Parametrii interogarii 
     * @param {Function} callback - functie de callback apelata de interogare
     */
    select ({table="", fields=[], andConds=[]} = {}, callback) {
        let whereConds = "";
        if(andConds.length > 0)
            whereConds = `WHERE ${andConds.join(" AND ")}`;
        
        let qry = `SELECT ${fields.join(",")} FROM ${table} ${whereConds}`;
        console.log(qry);

        this.client.query(qry, callback)
    }

    /**
     * Functie asincrona de interogare in baza de date
     * @param {{table: string, fields: String[], andConds: String[]}} Object - Parametrii interogarii
     * @returns {Client.query} obiect de tip querry al clientului conectat la baza de date
     */
    async selectAsync ({table="", fields=[], andConds=[]}) {
        let whereConds = "";
        if(andConds.length > 0)
            whereConds = `WHERE ${andConds.join(" AND ")}`;
        
        let qry = `SELECT ${fields.join(",")} FROM ${table} ${whereConds}`;
        console.log(qry);

        return this.client.query(qry);
    }

    /**
     * Functie de mdoficare a datelor in baza de date
     * @param {{table: String, fields: String[], andConds: String[]}} Object - Parametrii modificarii 
     * @param {Function} callback - functie de callback apelata de modificare
     */
    update ({table="", fields=[], values=[], andConds=[]} = {}, callback) {
        if (fields.length != values.length)
            throw new Error("UPDATE: nr. of fields differs from nr. of values");
        
        let updatedFields = [];
        for (let i=0; i<fields.length; i++)
            updatedFields.push(`${fields[i]}='${values[i]}'`);

        let whereConds = "";
        if(andConds.length > 0)
            whereConds = `WHERE ${andConds.join(" AND ")}`;

        let qry = `UPDATE ${table} SET ${updatedFields.join(", ")}  ${whereConds}`;
        console.log(qry);

        this.client.query(qry, callback)
    }

    /**
     * Functie de inserare in baza de date
     * @param {{table: String, fields: String[], values: String{}}} Object - Parametrii inserarii 
     * @param {Function} callback - functie de callback apelata de inserare 
     */
    insert ({table="", fields=[], values=[]} = {}, callback) {
        if(fields.length != values.length)
            throw new Error("INSERT: nr. of fields differs from nr. of values");
        
        let qry = `INSERT INTO ${table} (${fields.join(",")}) VALUES (${values.join(",")})`;
        console.log(qry);

        this.client.query(qry, callback)
    }

    /**
     * Functie de stergere in baza de date
     * @param {{table: String, andConds: String[]}} Object - Parametrii stergerii 
     * @param {Function} callback - functie de callback apelata de stergere 
     */
    delete ({table="", andConds=[]} = {}, callback) {
        let whereConds = "";
        if(andConds.length > 0)
            whereConds = `WHERE ${andConds.join(" AND ")}`;
        
        let qry = `DELETE FROM ${table} ${whereConds}`;
        console.log(qry);

        this.client.query(qry, callback)
    }
}

module.exports = {dbAccess: dbAccess};