class HttpError extends Error {
  constructor(message, errorCode) {
    super(message);
    this.code = errorCode;
    this.msg = message
  }
}

module.exports = HttpError;
