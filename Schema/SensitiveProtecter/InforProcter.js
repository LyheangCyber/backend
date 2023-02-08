const Protecter = require("crypto");
const algorism = process.env.ALGORITHSM;
const key= Protecter.randomBytes(32);
const iv = Protecter.randomBytes(16);

// Encryption 
function encrypt(Plain_text) {
    let cypher = Protecter.createCipheriv(algorism,Buffer.from(key),iv);
    let encrypted = cypher.update(Plain_text);
    encrypted = Buffer.concat([encrypted, cypher.final()]);
    return { iv: iv.toString('hex'),encryptedData: encrypted.toString('hex') };
}

// Decription 
function decrypt(cipherText) {
    let iv = Buffer.from(cipherText.iv, 'hex');
    let encryptedText = Buffer.from(cipherText.encryptedData, 'hex');
    let decipher = Protecter.createDecipheriv(algorism, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
// export these two function
module.exports={encrypt,decrypt};