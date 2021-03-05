# FlavorGuardianBot
The ultimate Flavor Guardian

## Setup
- __.env__
> #### The bot token to use
> BOT_TOKEN='the_bot_token'
> #### The bot command prefix (**optional** since there is a default prefix '~')
> BOT_COMMAND_PREFIX=~ 
- __environment__
> #### To install the dependecies and the libraries
> ``npm install`` or ``npm i``
> #### Build Dev
> ``webpack --mode development``
> #### Run dev
> ``webpack --watch``
> #### Build prod
> ``webpack --mode production``
> #### Run prod
> ``node ./dist/index.js``
> #### Docker set up the environnement with one command and build it
> ``docker-compose up --build``
> #### Docker shutdown
> ``docker-compose down``


## Technologies Used
- __NodeJS__
- __TypeScript__
- __Docker__

## Libraries Used
- __DiscordJS__ => https://discord.js.org/#/docs/
- __DotEnv__ => https://www.npmjs.com/package/dotenv
- __Nodemon__ => https://www.npmjs.com/package/nodemon
- __OpusScript__ => https://www.npmjs.com/package/opusscript
- __Ytdl-Core__ => https://www.npmjs.com/package/ytdl-core

