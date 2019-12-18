'use strict';
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = http.createServer();
server.on('request', safe(staticFilesHandler, errorHandler));

function safe(fn, eh) {
  return function() {
    try {
      return fn.apply(null, arguments);
    } catch (e) {
      eh.apply(null, arguments)(e);
    }
  };
}

function staticFilesHandler(req, res) {
  console.log(req.url);
  try {
    const fileName = path.resolve(__dirname, getFilePathFromUrl(req.url));
    console.log(fileName);
    const fileContent = fs.readFileSync(fileName);
    console.log(fileContent);
    console.log(getContentType(fileName));
    res
      .writeHead(200, { 'Content-Type': getContentType(fileName) })
      .end(fileContent);
  } catch (e) {
    if (e.code === 'ENOENT') {
      throw new NotFoundError(e.message);
    }
    throw new InternalServerError(e.message);
  }
}

function getFilePathFromUrl(url) {
  const trimmedUrl = url.slice(1);
  if (url.slice(-1)[0] === '/') {
    return trimmedUrl + 'index.html';
  }
  return trimmedUrl;
}

function getContentType(fileName) {
  switch (path.extname(fileName)) {
    case '.js':
      return 'text/javascript';
    case '.html':
      return 'text/html';
    case '.ico':
      return 'img/icon';
  }
}

function BaseError(message) {
  Error.call(this);
  this.name = this.constructor.name;
  this.message = message;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }
}

BaseError.prototype = Object.create(Error.prototype);
BaseError.prototype.constructor = BaseError;

function NotFoundError(requestedPath) {
  BaseError.call(this, requestedPath);
  this.statusCode = 404;
}

NotFoundError.prototype = Object.create(BaseError.prototype);
NotFoundError.prototype.constructor = NotFoundError;

function InternalServerError(message) {
  BaseError.call(this, message);
  this.statusCode = 500;
}

InternalServerError.prototype = Object.create(BaseError.prototype);
InternalServerError.prototype.constructor = InternalServerError;

function errorHandler(req, res) {
  return function(err) {
    res.statusCode = err.statusCode || 500;
    return res.end(`not found ${err.message}`);
  };
}

server.listen(8080);
