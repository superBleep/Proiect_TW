/**
 * Privilegiile posibile pentru un utilizator
 * @typedef Privileges
 * @type {Object}
 * @property {Symbol} viewUsers - Dreptul de a vizualiza tabelul cu utilizatori
 * @property {Symbol} updateUsers - Dreptul de a modifica datele utilizatorilor
 * @property {Symbol} deleteUsers - Dreptul de a sterge utilizatorii
 * @property {Symbol} buyProducts - Dreptul de a cumpara produse
 * @property {Symbol} insertProduct - Dreptul de a insera un produs in tabel
 * @property {Symbol} deleteProducts - Dreptul de a sterge produse din tabel
 * @property {Symbol} viewGraphs - Dreptul de a vizualiza graficele
 */
const Privileges = {
    viewUsers: Symbol("viewUsers"),
    updateUsers: Symbol("updateUsers"),
    deleteUsers: Symbol("deleteUsers"),
    buyProducts: Symbol("buyProducts"),
    insertProduct: Symbol("insertProducts"),
    deleteProducts: Symbol("deleteProducts"),
    viewGraphs: Symbol("viewGraphs")
}

module.exports = Privileges;