const Privileges = require("./privileges.js");

/**
 * Clasa respectiva rolului utilizatorului
 */
class Role {
    /**
     * Getter pentru tipul implicit al rolului
     * @returns {string} "generic"
     */
    static get type() {return "generic"}
    /**
     * Getter pentru privilegiile implicite ale clasei
     * @returns {Symbol[]}
     */
    static get privileges() {return []}

    /**
     * Constructorul clasei Role
     * @constructor
     */
    constructor() {
        this.code = this.constructor.type;
    }

    /**
     * Verifica daca utilizatorul are privilegiul dat ca parametru
     * @param {string} privilege - privilegiul de verificat 
     * @returns {Boolean}
     */
    hasPrivilege (privilege) {
        return this.constructor.privileges.includes(privilege);
    }
}

/**
 * Clasa respectiva rolului de client
 * @extends Role
 */
class ClientRole extends Role {
    /**
     * Getter pentru tipul rolului
     * @returns {string} "common"
     */
    static get type() {return "common"}
    /**
     * Getter pentru privilegiile implicite ale clasei
     * @returns {Symbol[]}
     */
    static get privileges() {
        return [
            Privileges.buyProducts
        ];
    }

    /**
     * Constructorul clasei ClientRole
     * @constructor
     */
    constructor() {
        super();
    }
}

/**
 * Clasa respectiva rolului de administrator
 * @extends Role
 */
class AdminRole extends Role {
    /**
     * Getter pentru tipul rolului
     * @returns {string} "admin"
     */
    static get type() {return "admin"}
    
    /**
     * Constructorul clasei AdminRole
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Administratorii au toate privilegiile
     * @param {string} privilege - privilegiul de verificat 
     * @returns {Boolean} True
     */
    hasPrivilege(privilege) {
        return true;
    }
}

/**
 * Clasa respectiva rolului de moderator
 * @extends Role
 */
class ModRole extends Role {
    /**
     * Getterul pentru tipul rolului
     * @returns {String} "mod"
     */
    static get type() {return "mod"}
    /**
     * Returneaza privilegiile asociate clasei ModRole
     * @returns {Symbol[]}
     */
    static get privileges() {
        return [
            Privileges.viewUsers,
            Privileges.updateUsers,
            Privileges.deleteUsers,
            Privileges.viewGraphs
        ]
    }
}

/**
 * Clasa de tip factory care genereaza obiecte de tipul claselor
 * pentru roluri
 */
class RoleFactory {
    /**
     * Creeaza obiectul de tip rol pe baza tipului dat ca parametru
     * @param {string} type - tipul rolului 
     * @returns {Role}
     */
    static createRole(type) {
        switch(type) {
            case ClientRole.type: return new ClientRole();
            case AdminRole.type: return new AdminRole();
            case ModRole.type: return new ModRole();
        }
    }
}

module.exports = {
    RoleFactory: RoleFactory
}