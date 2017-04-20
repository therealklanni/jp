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

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var argv = _yargs2.default
  .usage(
    'Pipe $0 onto a JSON source from the commandline to parse the output:\n  cat data.json | $0 [options] query'
  )
  .options({
    p: {
      alias: 'path',
      describe: 'Use JSON Path notation (https://github.com/dchester/jsonpath)',
      type: 'boolean'
    },
    k: {
      alias: 'keys',
      describe: 'Print object keys only',
      type: 'boolean'
    },
    f: {
      alias: 'file',
      describe: 'Read input from file',
      requiresArg: true,
      type: 'string'
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
  })
  .help()
  .epilogue(
    'Queries use the Lodash get method by default.\nFor more information, see https://github.com/therealklanni/jp'
  ).argv;

var format = argv.human
  ? function(x) {
      return x;
    }
  : _lodash2.default.partialRight(JSON.stringify, null, argv.indent || 2);

var log = argv.human
  ? _lodash2.default.partialRight(console.dir.bind(console), {
      colors: !argv.noColor,
      breakLength: argv.break || null,
      depth: argv.depth >= 0 ? argv.depth : null
    })
  : console.log.bind(console);

var print = _lodash2.default.flow(format, log);

var query = argv._[0];

var parse = function parse(stream) {
  stream.pipe((0, _utf8Stream2.default)()).pipe(
    (0, _concatStream2.default)(function(buf) {
      var obj = JSON.parse(buf.toString());
      var output = void 0;

      if (argv.path) {
        output = query ? _jsonpath2.default.query(obj, query) : obj;
      } else {
        output = query ? _lodash2.default.get(obj, query) : obj;
      }

      print(argv.keys ? Object.keys(output) : output);
    })
  );
};

if (!process.stdin.isTTY) {
  parse(process.stdin);
} else if (argv.file) {
  parse(
    _fs2.default.createReadStream(_path2.default.resolve(argv.file), 'utf8')
  );
} else {
  _yargs2.default.showHelp();
}
