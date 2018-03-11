const {
  SEC_WS_KEY,
  SEC_WS_VERSION, } = require('./constants');
const EventEmitter = require('events');

class Request {
  constructor(socket) {
    this.socket = socket;

    this._body = null;
    this._frames = [];
    this._buffer = null;

    this.headers = {};
    this.method = null;
    this.url = null;
    this.httpVersion = null;
  }

  get host() {
    return this.headers.host;
  }

  get secWSKey() {
    return this.headers[SEC_WS_KEY];
  }

  get secWSVersion() {
    return this.headers[SEC_WS_VERSION];
  }

  get connection() {
    return this.headers.connection;
  }

  get upgrade() {
    return this.headers.upgrade;
  }

  get message() {
    if (!this._body) {
      try {
        this._body = JSON.parse(this.buffer.toString());
      } catch (e) {
        this._body = this.buffer.toString();
      }
    }

    return this._body;
  }

  get buffer() {
    if (!this._buffer) {
      this._buffer = Buffer.concat(this._frames.map(frame => frame.payload));
    }

    return this._buffer;
  }

  get lastFrame() {
    return this._frames[this._frames.length - 1];
  }

  addFrame(frame) {
    this._frames.push(frame);
  }

  concatToLastFrame(buf) {
    this.lastFrame.concat(buf);
  }

  isNewRequest() {
    return this._frames.length === 0;
  }

  isFramingDone() {
    if (this.isNewRequest())
      return false;

    return this.lastFrame.isComplete();
  }
}

module.exports = Request;
