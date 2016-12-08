import _ from 'lodash'
import yargs from 'yargs'
import jsonpath from 'jsonpath'
import utf8 from 'utf8-stream'
import map from 'map-stream'
import concat from 'concat-stream'

const argv = yargs
  .usage(`Pipe $0 onto a JSON source from the commandline to parse the output:
  cat data.json | $0 [options] [query]`)
  .options({
    k: {
      alias: 'keys',
      describe: 'print object keys instead of value',
      type: 'boolean'
    },
    p: {
      alias: 'path',
      describe: 'use JSON Path notation (https://github.com/dchester/jsonpath)'
    }
  })
  .help()
  .epilogue(`Queries are done using Lodash .get() method by default.
For more information, see https://github.com/therealklanni/jp`)
  .argv

if (!process.stdin.isTTY) {
  process.stdin
    .pipe(utf8())
    .pipe(map((buf, cb) => cb(null, buf.toString())))
    .pipe(concat((buf) => {
      const obj = JSON.parse(buf.toString())

      if (argv.keys) {
        console.log(JSON.stringify(Object.keys(obj), null, 2))
      } else if (argv.path) {
        console.log(JSON.stringify(jsonpath.value(obj, argv._[0] || argv.path), null, 2))
      } else {
        console.log(JSON.stringify(_.get(obj, argv._[0]), null, 2))
      }
    }))
} else {
  yargs.showHelp()
}
