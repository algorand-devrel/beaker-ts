# Beaker Typescript Client Generator

EXPERIMENTAL

> :warning: **zero tests, please report issues**

## Generate a client Spec

Use [beaker-pyteal](https://github.com/algorand-devrel/beaker) to create an Application and write the app spec to json

```py
import json
from beaker import Application
from beaker.client import ApplicationClient

class App(Application):
    #...

with open("app.json", "w") as f:
  f.write(json.dumps(App.application_spec()))
```

## Generate a TypeScript Client

In a node project directory install beaker-ts
```sh
npm install beaker-ts
```

Generate the client using the `beaker generate` command

```sh
$ beaker help generate

Usage: beaker generate [options] <path-to-spec> <path-to-write>

Generates an application client given an application spec

Options:
  -l, --local  whether or not to use local import
  -h, --help   display help for command

```

Example:
```sh
npx beaker generate app-spec.json src/client/ 
```

This should create a new file called `${NAME_OF_APP}_client.ts`

The client can now be imported and used to create or call the app methods by name and with expected types.

See the [examples directory](https://github.com/algorand-devrel/beaker-ts/tree/master/examples) for usage examples.

Please report issues.
