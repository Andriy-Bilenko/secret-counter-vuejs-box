# setting up the secret counter vue.js box

from https://github.com/secretuniversity/secret-counter-vuejs-box/blob/main/docs/setting-up-your-environment.md

```bash
git clone https://github.com/secretuniversity/secret-counter-vuejs-box.git
cd secret-counter-vuejs-box

npm install -D ts-node # for TS integration tests in Vue

# launching localsecret
make localsecret # if nothing's preconfigured
docker start localsecret # if container is already there

# dont forget to configure secretcli just to be sure
secretcli config node http://localhost:26657
secretcli config chain-id secretdev-1
secretcli config keyring-backend test
secretcli config output json

# build and test
make build && make test

# deploy
sudo pacman -S expect
./scripts/create_secret_box.sh # a big fix to the code was needed here

cd tests
npm install
cd ..

# to run Vue frontend on http://localhost:5173/
cd app
yarn install
yarn dev
```

# > optional, trying to put vue.js app to the ipfs

```bash
# generated dist/ in app/
npm run build

# pinata asks for a paid plan, so go to the app/
ipfs init
ipfs daemon
ipfs add -r dist

# or optionally https://app.fleek.xyz

```

# running the smart contract from cli

```bash
./scripts/create_secret_box.sh
# do not foget to source .env and have a localsecret
docker exec localsecret secretd query compute query $SECRET_BOX_ADDRESS '{"get_count": {}}' | jq
```

# tests

## unit

```bash
# to run tests in `contract.rs`
make build && make test
```

## integration

```bash
# dont forget to deploy
./scripts/create_secret_box.sh

cd tests
source .env.fish
npx ts-node secretbox.ts # I'm not sure, there's some error with TS code

secretcli keys delete a

```

# solving problems

## secretcli and localsecret have different keys

```bash
rm -rf ~/.secretd
docker rm # remove containers and maybe images

docker run -it -p 9091:9091 -p 26657:26657 -p 1317:1317 -p 5000:5000 \
  --name localsecret -v ~/.secretd:/root/.secretd ghcr.io/scrtlabs/localsecret:latest

secretcli config node http://localhost:26657
secretcli config chain-id secretdev-1
secretcli config keyring-backend test
secretcli config output json

# verify it worked
secretcli keys list
docker exec -it localsecret secretcli keys list

# deploy
./scripts/create_secret_box.sh
# test
cd tests && npx ts-node secretbox.ts

#### and everything should ve fine
```

## to fix dotenv in vite

simply use `import.meta.env` instead of `process.env`

I did

```bash
cd app
yarn add dotenv
yarn remove dotenv
```
