// filepath: e:\GYWS\GYWS 2025\Admin-Backend\utils\errorResponse.js
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default ErrorResponse;