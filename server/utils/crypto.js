const CryptoJS = require('crypto-js');
function randomString(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  // var key = text + navigator.sayswho + $(window).width();
  var key = text;

  return key;
}


//career maggit
exports.CareerDecrypt = async cipherData => {
  if (!cipherData) {
    console.log('cipherData', cipherData);
    throw Error('somthing went wrong !!');
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
  // console.log("here",decrypted.toString(CryptoJS.enc.Utf8))
  let Jsondata = JSON.parse(`${decrypted.toString(CryptoJS.enc.Utf8)}`);

  return Jsondata;
};
//maggit
exports.CareerEncrypt = async plain => {
  let randomIV = await randomString(16);
  var key = CryptoJS.enc.Utf8.parse('$k@m0u$0172@0r!k');
  var iv = CryptoJS.enc.Utf8.parse(randomIV);
  // var iv = CryptoJS.enc.Utf8.parse("@1O2j3D4e5F6g7P8");
  // console.log(iv, randomIV);
  var encrypted = CryptoJS.AES.encrypt(JSON.stringify(plain), key, {
    keySize: 128 / 8,
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  let encrypt = encrypted.toString() + randomIV;
  return encrypt.replace(/\\/g, '/');
  // return encrypted.toString();
};





