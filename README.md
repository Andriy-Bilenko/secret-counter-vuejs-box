## Secret Counter Box
<br/>

[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/secretuniversity/secret-counter-vuejs-box)

The Secret Counter Box is a Gitpod-enabled quickstart for dapp development on [Secret Network](https://scrt.network).
It consists of a frontend (Vue + Vite + Typescript) and a secret contract (Rust + Secret CosmWasm), based on the [secret counter template](https://github.com/secretuniversity/secret-template-cw1).

This is a beginner-level box and is for developers new to secret contract development. It illustrates the basics
of instantiating a secret contract, and handling queries and transactions that modify state data.

The counter contract is made up of three "entry points" or where different types of messages are sent to the secret contract.

![](docs/secret-counter-app.png)

The `instantiate` entry point is complete, but the methods called to hande the `Increment`, `Reset` and `GetCount`
methods are meant to be completed during the Secret Box [tutorial](app/tutorial/guide.md). For reference, the
fully-implemented contract and application code are under the `app/tutorial/solution` directory.

| Entry point  | Message(s)     | JSON                   |
|--------------|----------------|------------------------|
| instantiate  | InstantiateMsg | `{"count": 16876}`     |
| execute      | Increment      | `increment {}`         |
|              | Reset          | `reset {}`             |
| query        | GetCount       | `get_count {}`         |

<br/>

## Getting Started

To get started, use the "Open in Gitpod" button below to launch the Secret Counter app. 

When the workspace is launched, you'll notice that a local version of the Secret Network blockchain is started 
for you.

Use this [guide](/app/tutorial/guide.md) to view the tutorial and complete the Secret Box code.

<br/>

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/secretuniversity/secret-counter-vuejs-box)

<br/>

## Setup Your Local Developer Environment

If you're interested in working with this Secret Box locally, use the
[Setting Up Your Environment](https://docs.scrt.network/secret-network-documentation/development/getting-started/setting-up-your-environment) guide to install the tools and libraries needed to develop secret contracts.

In addition to the Secret Contract setup, you will also need to install `Nodejs`, `yarn`, and `ts-node` for the 
integration tests and frontend app.

### Install Nodejs

Use the installer for your environment [here](https://nodejs.dev/en/download).

### Install Yarn

You can find information on installing `yarn`, getting started, advanced topics and more [here](https://yarnpkg.com).

### Install ts-node

`ts-node` is a TypeScript engine for node.js and is used for the integration tests which are written in Typescript.

```
npm install -D ts-node
```

## Commands & Usage

### Secret Contract

The following commands are run from the root of the project, from a terminal and apply to the secret contracts:

| Command                | Action                                                    |
|:---------------------  |:--------------------------------------------------------  |
| `make build`           | Compiles the secret contract                              |
| `make schema`          | Generates the JSON schema for messages and state files    |
| `make test`            | Runs the secret contract unit tests                       |
| `make localsecret`     | Launches the dockerized `localsecret` developer instance  |
| `make deploy`          | Stores the compiled/optimized contract on `localsecret`   |

### Integration Tests

The integration tests are located under the `tests` directory and uses `secret.js` to interact with the
deployed secret contract. These are great examples of interacting with the Secret Network and can be used
to bootstrap frontend development.

```
npx ts-node integration.ts
```

### Frontend App

These commands apply to the frontend of the Secret Box and are run from the `app` directory:


| Command           | Action                                       |
|:----------------  |:-------------------------------------------- |
| `yarn`         | Installs dependencies                        |
| `yarn dev`     | Starts local Vite dev server at `http://localhost:5173`  |
| `yarn build`   | Build your production site to `./dist/`      |
| `yarn preview` | Preview your build locally, before deploying |

## LocalSecret LCD

`LocalSecret` implements an LCD (REST API), available on port 1317, that communicates with the Remote 
Procedure Call (RPC) endpoint and allows you to use HTTP to communicate with the node.

### Local Developer Environment

From within a local development environment, you can query and post transactions using: http://localhost:1317.

Checkout the http://localhost:1317/swagger/ UI which makes it easy to interact with the node. Or use 
http://localhost:1317/openapi/ to view the queries, transactions and parameters that are available.

### Gitpod Workspace

When using the Gitpod workspace, prepend the port number to the gitpod url. If the workspace is at
`https://secretunive-secretboxvi-zyc1kppqbvk.ws-us69.gitpod.io`, then you can connect to the LCD service at
`https://1317-secretunive-secretboxvi-zyc1kppqbvk.ws-us69.gitpod.io`.

To use the Swagger or OpenAPI interaces append `/swagger/` or `/openapi/` to the Gitpod URL:

`https://1317-secretunive-secretboxvi-zyc1kppqbvk.ws-us69.gitpod.io/swagger/`

![](docs/swagger-interface.png)

# Resources
- [Secret Network](https://docs.scrt.network) - official Secret Network documentation and guides
- [Secret IDE](https://www.digiline.io/) - an integration development environment specific to secret contracts
- [Gitpod](https://www.gitpod.io/docs) - Gitpod documentation
- [Vite](https://vitejs.dev/guide) - Guide on using Vite, a lean and fast development server
- [Vue](https://vuejs.org) - Progressive javascript framework

# Contributors
- Laura SecretChainGirl [Github](https://github.com/secetchaingirl) - secret contract development
- Alex Sinplea [Github](https://github.com/sinplea) - frontend development
- Jeff Puttstrife - UI/UX and graphic design
- Kate Unakatu - UI/UX and graphic design
