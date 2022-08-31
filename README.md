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

#...

app_client = ApplicationClient(algod_client, App(), signer=signer)
with open("app.json", "w") as f:
  f.write(json.dumps(app_client.application_spec()))

```

## Generate a TypeScript Client

In a node project directory install beaker-ts
```sh
npm install beaker-ts
```

Generate the client using the beaker command

```sh
npx beaker generate  $PATH_TO_APP_SPEC_JSON $PATH_TO_WHERE_CLIENT_SHOULD_BE_WRITTEN 
```

This should create a new file called `${NAME_OF_APP}_client.ts`

The client can now be imported and used to create or call the app methods by name and with expected types.

See the [examples directory](https://github.com/algorand-devrel/beaker-ts/src/examples/) for usage examples.

Please report issues.