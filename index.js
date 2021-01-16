// Access our .env file
require('dotenv').config();

// Used to connect and call the Discord API
const Discord = require('discord.js');

// This is a instance of the library, were we can use the Discord API premade calls
const FlavorGuardianBot = new Discord.Client();

// The AUTHENTICATION  TOKEN for the bot without this, the login will fail
const TOKEN = process.env.BOT_TOKEN;

// FlavorGuardianBot.login(TOKEN);

FlavorGuardianBot.login(process.env.BOT_TOKEN_TEST);

FlavorGuardianBot.on('ready', () => {
  console.info('FlavorGuardian successfully connected to the server!')
});

/**
 * This is an example of how to create a command that the bot will listen to.
 * Here is a documentation for more examples and all the available Discord API.
 * DiscordJS => https://discord.js.org/#/docs/main/stable/general/welcome

FlavorGuardianBot.on('message', msg => {
  if (msg.content === 'hello') {
    msg.reply('world');
    msg.channel.send('world');
  } else if (msg.content.startsWith('!yeet')) {
    if (msg.mentions.users.size) {
      const taggedUser = msg.mentions.users.first();
      msg.channel.send(`You wanted to yeet  ${taggedUser.username}`);
    } else {
      msg.reply('Please tag a valid user!');
    }
  }
});

 */
