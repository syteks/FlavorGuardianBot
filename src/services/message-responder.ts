import { Message } from "discord.js";
import { PingFinder } from "./commands/ping-finder";
import { Memes } from "./commands/memes";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { CommandObject } from "../interfaces";

@injectable()
export class MessageResponder {
    /**
     * We will use this array to go and dynamically fetch our commands
     * We need an object that has a regexp variable and a action function.
     * A command is defined with a regexp attribute and a action function
     *
     * @private Array<Commands>
     */
    private availableCommands: Array<CommandObject>;

    /**
     * This variable will be used to check if the command given is a valid clip found in the storage
     *
     * @private Memes
     */
    private memes: Memes

    /**
     * Instantiate the message responder
     *
     * @param pingFinder
     * @param memes
     */
    constructor(
        @inject(TYPES.PingFinder) pingFinder: PingFinder,
        @inject(TYPES.Memes) memes: Memes
    ) {
        this.availableCommands = [
            pingFinder,
            memes
        ];

        // The meme's list
        this.memes = memes;
    }

    /**
     * Is this the intended command
     *
     * @param stringToSearch
     * @param regexp
     * @return boolean
     */
    private static isIntendedCommand(stringToSearch: string, regexp: string): boolean {
        return stringToSearch.search(regexp) >= 0;
    }

    /**
     * Try to execute the command
     * 
     * @param message 
     * @return Promise<Message | Message[]>
     */
    handle(message: Message): Promise<Message | Message[]> {
        // Separate the command from the parameters
        let userInput: string[],
            originalCommand: string,
            commandParameters: string[],
            command: CommandObject | null;

        // User input, it contains the command and the associated parameters.
        userInput = message.content.substr(1).split(" ");

        // Get the command prefix
        originalCommand = userInput[0] || '';
        commandParameters = userInput.splice(1);

        // If the original command is empty, it not an intended command
        if (!originalCommand) {
            return Promise.resolve(message);
        }

        command = this.availableCommands.find(availableCommand => MessageResponder.isIntendedCommand(originalCommand, availableCommand.regexp)) || null;

        // If the originalCommand is not found, try to check that the command is maybe a clip key
        if (command) {
            return command.action(message, commandParameters);
        }

        // Check if the command clip is available
        let commandClip = this.memes.findClip(originalCommand);

        return commandClip ? this.memes.action(message, commandClip) : message.reply('Command has not been found.');
    }
}