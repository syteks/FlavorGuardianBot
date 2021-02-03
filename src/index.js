// Access our .env file
require('dotenv').config();

// Get our commands controller
const Command = require('./Controllers/commands');

// Used to connect and call the Discord API
const Discord = require('discord.js');

// This is a instance of the library, were we can use the Discord API premade calls
const FlavorGuardianBot = new Discord.Client();

// The AUTHENTICATION  TOKEN for the bot without this, the login will fail
const TOKEN = process.env.BOT_TOKEN;

// For testing purposes, have a third bot to test the new feature while the main FlavorGuardian Bot is running
FlavorGuardianBot.login(TOKEN);

FlavorGuardianBot.on('ready', () => {
  console.info('FlavorGuardian successfully connected to the server!')
});

FlavorGuardianBot.on('message', Command.manageCommand);
