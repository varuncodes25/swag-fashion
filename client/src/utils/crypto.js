import CryptoJS from 'crypto-js';

function randomString(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// ✅ NAMED EXPORTS - ES6 syntax
export const CareerDecrypt = async (cipherData) => {
  if (!cipherData) {
    console.log('cipherData', cipherData);
    throw new Error('something went wrong !!');
  }

  var key = CryptoJS.enc.Utf8.parse('$k@m0u$0172@0r!k');
  var iv = CryptoJS.enc.Utf8.parse(cipherData.slice(cipherData.length - 16));
  cipherData = cipherData.slice(0, cipherData.length - 16);
  var decrypted = CryptoJS.AES.decrypt(cipherData, key, {
    keySize: 128 / 8,
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  
  let Jsondata = JSON.parse(`${decrypted.toString(CryptoJS.enc.Utf8)}`);
  return Jsondata;
};

// ✅ NAMED EXPORTS
export const CareerEncrypt = async (plain) => {
  let randomIV = await randomString(16);
  var key = CryptoJS.enc.Utf8.parse('$k@m0u$0172@0r!k');
  var iv = CryptoJS.enc.Utf8.parse(randomIV);
  
  var encrypted = CryptoJS.AES.encrypt(JSON.stringify(plain), key, {
    keySize: 128 / 8,
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  let encrypt = encrypted.toString() + randomIV;
  return encrypt.replace(/\\/g, '/');
};

// ✅ OPTIONAL: Default export
// export default { CareerDecrypt, CareerEncrypt };