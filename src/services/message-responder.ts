import { Message } from "discord.js";
import { PingFinder } from "./commands/ping-finder";
import { Memes } from "./commands/memes";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";

@injectable()
export class MessageResponder {
    /**
     * We will use this array to go and dynamically fetch our commands
     *
     * @private Array<Commands>
     */
    private availableCommands: Array<any>;

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
        let userInput = message.content.substr(1).split(" ");

        // Get the command prefix
        let originalCommand = userInput[0] || '',
            commandParameters = userInput.splice(1);

        // If the original command is empty, it not an intended command
        if (!originalCommand) {
            return Promise.resolve(message);
        }

        let command = this.availableCommands.find(x => MessageResponder.isIntendedCommand(originalCommand, x.regexp));

        // If the originalCommand is not found, try to check that the command is maybe a clip key
        if (command) {
            return command.action(message, commandParameters);
        }

        // Check if the command clip is available
        let commandClip = this.memes.findClip(originalCommand);

        return commandClip ? this.memes.action(message, commandClip.clip) : message.reply('Command has not been found.');
    }
}