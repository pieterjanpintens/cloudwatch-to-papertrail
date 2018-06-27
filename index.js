var zlib = require('zlib');
var winston = require('winston');

var papertrailTransport = require('winston-papertrail').Papertrail;

var host = process.env.PAPERTAIL_HOST;
var port = process.env.PAPERTAIL_PORT;
var program = process.env.PAPERTAIL_PROGRAM;
var hostname = process.env.PAPERTAIL_HOSTNAME;

// CloudWatch logs encoding
var encoding = process.env.ENCODING || 'utf-8';  // default is utf-8

exports.handler = function (event, context, cb) {
  if (host === null) {
      context.fail('Invalid PAPERTAIL_HOST environment variable: ' + host);
  }
  if (host === port) {
    context.fail('Invalid PAPERTAIL_PORT environment variable: ' + port);
  }
  if (host === program) {
    context.fail('Invalid PAPERTAIL_PROGRAM environment variable: ' + program);
  }
  if (host === hostname) {
    context.fail('Invalid PAPERTAIL_HOSTNAME environment variable: ' + hostname);
  }

  var payload = new Buffer(event.awslogs.data, 'base64');

  zlib.gunzip(payload, function (err, result) {
    if (err) {
      return cb(err);
    }

    var log = new (winston.Logger)({
      transports: []
    });

    log.add(papertrailTransport, {
      host: host,
      port: port,
      program: program,
      hostname: hostname,
      flushOnClose: true,
      logFormat: function (level, message) {
        return message;
      }
    });

    var data = JSON.parse(result.toString(encoding));
    data.logEvents.forEach(function (line) {
      log.info(line.message.replace(/\n$/, ''));
    });

    log.close();
    return cb();
  });
}