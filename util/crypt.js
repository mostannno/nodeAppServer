const Crypto = require('crypto');

//加密
function encrypt(str, key){
  const iv = Crypto.randomBytes(16); 
  const cipher = Crypto.createCipheriv('aes-128-cbc', key, iv); 
  const encrypted = cipher.update(str); 
  const finalBuffer = Buffer.concat([encrypted, cipher.final()]); 
  const encryptedHex = iv.toString('hex') + ':' + finalBuffer.toString('hex') 
  return encryptedHex;
}

//解密
function decrypt(str, key){
  const encryptedArray = str.split(':'); 
  console.log('first', encryptedArray[0]);
  const iv = Buffer.from(encryptedArray[0], 'hex'); 
  const encrypted = Buffer.from(encryptedArray[1], 'hex'); 
  const decipher = Crypto.createDecipheriv('aes-128-cbc', key, iv); 
  const decrypted = decipher.update(encrypted); 
  const clearText = Buffer.concat([decrypted, decipher.final()]).toString(); 
  return clearText;
}

module.exports = {
  encrypt,
  decrypt
}