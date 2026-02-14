const {  CareerEncrypt } = require('../crypto');

class ApiResponse {
  constructor(statusCode, data = null, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400; // true if status < 400
  }


}

module.exports = ApiResponse;
