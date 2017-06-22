#!/usr/bin/env node

const _ = require(`lodash`)
const yargs = require(`yargs`)
const jsonpath = require(`jsonpath`)
const utf8 = require(`utf8-stream`)
const map = require(`map-stream`)
const split = require(`split`)
const concat = require(`concat-stream`)
const fs = require(`fs`)
const path = require(`path`)

const version = require(`./package.json`).version

const argv = yargs
  .usage(
    `Pipe $0 onto a JSON source from the commandline to parse the output:
  cat data.json | $0 [options] query`
  )
  .options({
    p: {
      alias: `path`,
      describe: `Use JSON Path notation (https://github.com/dchester/jsonpath)`,
      type: `boolean`
    },
    k: {
      alias: `keys`,
      describe: `Print object keys only`,
      type: `boolean`
    },
    f: {
      alias: `file`,
      describe: `Read input from file`,
      requiresArg: true,
      type: `string`
    },
    i: {
      alias: `indent`,
      describe: `Number of spaces for indentation (ignored by --human)`,
      requiresArg: true,
      default: 2,
      type: `number`,
      coerce: x => (!isNaN(parseFloat(x)) && isFinite(x) ? Number(x) : x)
    },
    h: {
      alias: `human`,
      describe: `Print human-readable (non-JSON) format`,
      type: `boolean`
    },
    b: {
      alias: `break`,
      describe: `Set break length of object/array for human format`,
      requiresArg: true,
      type: `number`
    },
    c: {
      alias: `no-color`,
      describe: `Disable color for human format`,
      type: `boolean`
    },
    d: {
      alias: `depth`,
      describe: `Depth for human format`,
      requiresArg: true,
      type: `number`
    },
    L: {
      alias: `line-by-line`,
      describe: `Parse each line as a separate input`,
      type: `boolean`
    },
    v: {
      alias: `version`,
      describe: `Print the version`,
      type: `boolean`
    }
  })
  .help()
  .epilogue(
    `Queries use the Lodash get method by default.
For more information, see https://github.com/therealklanni/jp`
  ).argv

const format = argv.human ? x => x : _.partialRight(JSON.stringify, null, argv.indent || 2)

const logOpts = {
  colors: !argv.noColor,
  breakLength: argv.break || null,
  depth: argv.depth >= 0 ? argv.depth : null
}

/* eslint-disable no-console */
const log = argv.human
  ? _.partialRight(console.dir.bind(console), logOpts)
  : console.log.bind(console)
/* eslint-enable no-console */

const print = _.flow(format, log)

const query = argv._[0]

const parseBuf = buf => {
  const obj = JSON.parse(buf.toString())
  let output

  if (argv.path) {
    output = query ? jsonpath.query(obj, query) : obj
  } else {
    output = query ? _.get(obj, query) : obj
  }

  print(argv.keys ? Object.keys(output) : output)
}

const parse = stream =>
  stream
    .pipe(utf8())
    // Use utf8 effectively as a noop
    .pipe(argv.L ? split() : utf8())
    .pipe(argv.L ? map(parseBuf) : concat(parseBuf))

if (argv.v) {
  /* eslint-disable no-console */
  console.log(`v${version}`)
  /* eslint-enable no-console */
} else if (!process.stdin.isTTY) {
  parse(process.stdin)
} else if (argv.file) {
  parse(fs.createReadStream(path.resolve(argv.file), `utf8`))
} else {
  yargs.showHelp()
}
