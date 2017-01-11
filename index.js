import _ from 'lodash'
import yargs from 'yargs'
import jsonpath from 'jsonpath'
import utf8 from 'utf8-stream'
import map from 'map-stream'
import concat from 'concat-stream'
import path from 'path'

const argv = yargs
  .usage(`Pipe $0 onto a JSON source from the commandline to parse the output:
  cat data.json | $0 [options] query`)
  .options({
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
      coerce: (x) => !isNaN(parseFloat(x)) && isFinite(x) ? +x : x
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
  .epilogue(`Queries use the Lodash get method by default.
For more information, see https://github.com/therealklanni/jp`)
  .argv

const format = argv.human ? (x) => x : _.partialRight(JSON.stringify, null, argv.indent || 2)

const log = argv.human ? _.partialRight(console.dir.bind(console), {
  colors: !argv.noColor,
  breakLength: argv.break || null,
  depth: argv.depth >= 0 ? argv.depth : null
}) : console.log.bind(console)

const parse = (stream) => {
  stream
    .pipe(utf8())
    .pipe(concat((buf) => {
      const obj = JSON.parse(buf.toString())

      if (argv.keys) {
        log(format(Object.keys(obj)))
      } else if (argv.path) {
        log(format(jsonpath.query(obj, argv._[0] || argv.path)))
      } else {
        log(format(_.get(obj, argv._[0])))
      }
    }))
}

const exitWithError = () => {
  console.error(`ERROR: ${process.argv[1].split(path.sep).pop()} requires query argument`)
  process.exit(1)
}

if (!argv._[0]) {
  if (!process.stdin.isTTY) {
    // hook into process.stdin so process won't exit prematurely
    process.stdin.pipe(utf8())
    process.stdin.on('end', exitWithError)
  } else {
    exitWithError()
  }
} else if (!process.stdin.isTTY) {
  parse(process.stdin)
} else {
  yargs.showHelp()
}
