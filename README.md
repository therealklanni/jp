[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/therealklanni/jp-cli/master/LICENSE)
[![Build Status](https://img.shields.io/travis/therealklanni/jp-cli.svg)](https://travis-ci.org/therealklanni/jp-cli)
[![npm](https://img.shields.io/npm/v/jp-cli.svg)](https://www.npmjs.com/package/jp-cli)
[![Prettier](https://img.shields.io/badge/style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

# jp

> Simply parse JSON from any input source.

_Inspired by_ [jq](https://github.com/stedolan/jq); not a replacement.
Supports [Lodash .get() path syntax](https://lodash.com/docs/#get) and [JSONPath syntax](https://github.com/dchester/jsonpath).
Also supports stdin streaming (see last example), i.e. line-by-line.

```
yarn global add jp-cli || npm install -g jp-cli
```

## Usage

```
Pipe jp onto a JSON source from the commandline to parse the output:
  cat data.json | jp [options] query

Options:
  -p, --path      Use JSON Path notation (https://github.com/dchester/jsonpath)
  -k, --keys      Print object keys only                               [boolean]
  -f, --file      Read input from file                                  [string]
  -i, --indent    Number of spaces for indentation (ignored by --human)
                                                           [number] [default: 2]
  -h, --human     Print human-readable (non-JSON) format               [boolean]
  -b, --break     Set break length of object/array for human format     [number]
  -c, --no-color  Disable color for human format                       [boolean]
  -d, --depth     Depth for human format                                [number]
  -L, --line-by-line  Parse each line as a separate input              [boolean]
  --help          Show help                                            [boolean]

Queries use the Lodash get method by default.
For more information, see https://github.com/therealklanni/jp
```

### Examples


> $ cat user-response.json | jp data.user

```js
{
  "name": "Gazorpazorpfield"
  "color": "orange"
}
```

> $ cat user-response.json | jp data.user | jp --keys

```js
[
  "name",
  "color"
]
```

> $ cat user-response.json | jp data.user.name

```js
"Gazorpazorpfield"
```

`jp` can also parse JSON line-by-line from a stdin stream.

> $ [ipfs](https://github.com/ipfs/ipfs) log tail | jp -L event | jq -r

```js
updatePeer
handleFindPeerBegin
handleFindPeer
updatePeer
handleFindPeerBegin
handleFindPeer
Bitswap.Rebroadcast.active
Bitswap.Rebroadcast.idle
... until you ^C
```

#### License

MIT © [therealklanni](https://github.com/therealklanni)
