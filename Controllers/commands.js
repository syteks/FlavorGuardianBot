// Get the environment variables
require('dotenv').config();

module.exports = {
    /**
     * Get the sent message and process it, to check if it a valid bot command
     * @param msg
     */
    'manageCommand' : function (msg) {
        // If the message doesn't start with the prefixed command defined in the .env, the default value is the '~'
        if (
            !msg.content.startsWith(process.env.BOT_COMMAND_PREFIX || '~', 0) ||
            (msg.content.substr(1).trim().length === 0)
        ) {
            return;
        }

        // Separate the user command and the command parameters.
        let userInput = msg.content.substr(1).split(" ");

        // The command given by the user
        let command = userInput[0] || '';

        // If the next character is empty, that means that was not an intended bot command
        if (!command) {
            return;
        }

        // Everything that is after the first index, is considered as a parameter and we can have multiple parameters
        let commandParameters = userInput.splice(1);

        // Get the command function associated with the given command
        let availableCommand = require('../Helpers/availableCommands')[command];

        if (availableCommand) {
            // Call the object function, every Command must have a function with the same 'fileName'
            availableCommand[command](msg, commandParameters);
        } else {
            // This bot by default will look into the memes command to execute straight up a clip or a command clip
            availableCommand = require('../Helpers/availableCommands')['memes'];

            // By default we will play the memes command and taking the first parameter as the clip that we want to play
            let memes = availableCommand['memes'];

            memes(msg, command)
        }
    }
}
