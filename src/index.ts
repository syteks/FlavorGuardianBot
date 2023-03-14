require('dotenv').config(); // Recommended way of loading dotenv

import container from "./config/inversify.config";
import { TYPES } from "./types";
import { Bot } from "./classes/bot";

/**
 * This container represents the bot
 */
let bot = container.get<Bot>(TYPES.Bot);

bot.listen().then(() => {
    // any additional action or settings we would like to set after the bot
}).catch((_error) => {
    // @todo: catch errors and do something about it!
});

process.on('uncaughtException', (err) => {
  console.log('There was an error on the process');
  console.log(err);
});
