# jp

> A tiny commandline tool for parsing JSON from any source.

Based on the idea behind [jq](https://github.com/stedolan/jq) without the need for compiling. 
Supports [Lodash .get()](https://lodash.com/docs/4.17.2#get) and [JSONPath](https://github.com/dchester/jsonpath) syntax.

```
npm install -g jp-cli
```

## Usage

```
Pipe jp onto a JSON source from the commandline to parse the output:
  cat data.json | jp [options] [query]

Options:
  -k, --keys  print object keys instead of value                       [boolean]
  -p, --path  use JSON Path notation (https://github.com/dchester/jsonpath)
  --help      Show help                                                [boolean]

Queries are done using Lodash .get() method by default.
For more information, see https://github.com/therealklanni/jp
```

### Examples

```
$ cat user-response.json | jp data.user
{
  "name": "Gazorpazorpfield"
  "color": "orange"
}

$ cat user-response.json | jp data.user | jp --keys
[
  "name",
  "color"
]

$ cat user-response.json | jp data.user.name
"Gazorpazorpfield"
```
