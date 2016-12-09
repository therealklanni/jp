#!/usr/bin/env node
'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _jsonpath = require('jsonpath');

var _jsonpath2 = _interopRequireDefault(_jsonpath);

var _utf8Stream = require('utf8-stream');

var _utf8Stream2 = _interopRequireDefault(_utf8Stream);

var _mapStream = require('map-stream');

var _mapStream2 = _interopRequireDefault(_mapStream);

var _concatStream = require('concat-stream');

var _concatStream2 = _interopRequireDefault(_concatStream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var argv = _yargs2.default.usage('Pipe $0 onto a JSON source from the commandline to parse the output:\n  cat data.json | $0 [options] [query]').options({
  k: {
    alias: 'keys',
    describe: 'print object keys instead of value',
    type: 'boolean'
  },
  p: {
    alias: 'path',
    describe: 'use JSON Path notation (https://github.com/dchester/jsonpath)'
  }
}).help().epilogue('Queries are done using Lodash .get() method by default.\nFor more information, see https://github.com/therealklanni/jp').argv;

if (!process.stdin.isTTY) {
  process.stdin.pipe((0, _utf8Stream2.default)()).pipe((0, _mapStream2.default)(function (buf, cb) {
    return cb(null, buf.toString());
  })).pipe((0, _concatStream2.default)(function (buf) {
    var obj = JSON.parse(buf.toString());

    if (argv.keys) {
      console.log(JSON.stringify(Object.keys(obj), null, 2));
    } else if (argv.path) {
      console.log(JSON.stringify(_jsonpath2.default.query(obj, argv._[0] || argv.path), null, 2));
    } else {
      console.log(JSON.stringify(_lodash2.default.get(obj, argv._[0]), null, 2));
    }
  }));
} else {
  _yargs2.default.showHelp();
}

