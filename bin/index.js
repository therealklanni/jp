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
  p: {
    alias: 'path',
    describe: 'Use JSON Path notation (https://github.com/dchester/jsonpath)'
  },
  k: {
    alias: 'keys',
    describe: 'Print object keys only',
    type: 'boolean'
  },
  i: {
    alias: 'indent',
    describe: 'Number of spaces for indentation (ignored by --human)',
    requiresArg: true,
    default: 2,
    type: 'number',
    coerce: function coerce(x) {
      return !isNaN(parseFloat(x)) && isFinite(x) ? +x : x;
    }
  },
  h: {
    alias: 'human',
    describe: 'Print human-readable (non-JSON) format',
    type: 'boolean'
  },
  b: {
    alias: 'break',
    describe: 'Set break length of object/array for human format',
    requiresArg: true,
    type: 'number'
  },
  c: {
    alias: 'no-color',
    describe: 'Disable color for human format',
    type: 'boolean'
  },
  d: {
    alias: 'depth',
    describe: 'Depth for human format',
    requiresArg: true,
    type: 'number'
  }
}).help().epilogue('Queries use the Lodash get method by default.\nFor more information, see https://github.com/therealklanni/jp').argv;

var format = argv.human ? function (x) {
  return x;
} : _lodash2.default.partialRight(JSON.stringify, null, argv.indent || 2);
var log = argv.human ? _lodash2.default.partialRight(console.dir.bind(console), {
  colors: !argv.noColor,
  breakLength: argv.break || null,
  depth: argv.depth >= 0 ? argv.depth : null
}) : console.log.bind(console);

if (!process.stdin.isTTY) {
  process.stdin.pipe((0, _utf8Stream2.default)()).pipe((0, _mapStream2.default)(function (buf, cb) {
    return cb(null, buf.toString());
  })).pipe((0, _concatStream2.default)(function (buf) {
    var obj = JSON.parse(buf.toString());

    if (argv.keys) {
      log(format(Object.keys(obj)));
    } else if (argv.path) {
      log(format(_jsonpath2.default.query(obj, argv._[0] || argv.path)));
    } else {
      log(format(_lodash2.default.get(obj, argv._[0])));
    }
  }));
} else {
  _yargs2.default.showHelp();
}

