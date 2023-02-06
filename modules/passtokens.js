var intervals = [[48,57], [65,90], [97,122]]
let sirAlphaNum = "";
for (let interval of intervals) {
    for(let i=interval[0]; i<=interval[1]; i++)
        sirAlphaNum += String.fromCharCode(i)
}

/**
 * Functie de generare a token-ului pentru utilizator
 * @param {number} n - numar folosit in compunerea token-ului  
 * @returns {number} token - Token-ul utilizatorului
 */
function generateToken (n) {
    let token = ""
    for (let i=0; i<n; i++){
        token += sirAlphaNum[Math.floor(Math.random() * sirAlphaNum.length)]
    }

    return token;
}

module.exports = {generateToken: generateToken};