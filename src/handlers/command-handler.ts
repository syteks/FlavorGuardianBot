import { Message } from "discord.js";
import { Memes } from "../commands/memes/memes";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { AddMeme } from "../commands/memes/add-meme";
import { UpdateMeme } from "../commands/memes/update-meme";
import { DeleteMeme } from "../commands/memes/delete-meme";
import { CommandHandler as CommandHandlerInterface } from "../interfaces/command-handler";
import { GetMeme } from "../commands/memes/get-meme";
import { Commands } from "../commands/commands";

@injectable()
export class CommandHandler {
    /**
     * We will use this array to go and dynamically fetch our commands.
     * We need an object that has a regexp variable and a action function.
     * A command is defined with a regexp attribute and a action function.
     *
     * @var {Array<Commands>}
     */
    private availableCommands: Array<CommandHandlerInterface>;

    /**
     * This variable will be used to check if the command given is a valid clip found in the storage.
     *
     * @var {Memes}
     */
    private memes: Memes

    /**
     * Instantiate the message responder.
     *
     * @param memes - Plays a meme audio.
     * @param addMeme - Add a meme to the database.
     * @param updateMeme - Update a meme from the database.
     * @param deleteMeme - Delete a meme from the database.
     * @param getMeme - Get a meme or memes from the database.
     * @param commands - Get a list of all available commands.
     */
    constructor(
        @inject(TYPES.Memes) memes: Memes,
        @inject(TYPES.AddMeme) addMeme: AddMeme,
        @inject(TYPES.UpdateMeme) updateMeme: UpdateMeme,
        @inject(TYPES.DeleteMeme) deleteMeme: DeleteMeme,
        @inject(TYPES.GetMeme) getMeme: GetMeme,
        @inject(TYPES.Commands) commands: Commands
    ) {
        this.availableCommands = [
            memes,
            addMeme,
            updateMeme,
            deleteMeme,
            getMeme,
            commands
        ];

        // The meme's list
        this.memes = memes;
    }

    /**
     * Is this the intended command.
     *
     * @param stringToSearch - We check if it was the intended command given by the user.
     * @param regexp - The command regex that identifies the commands and a way to check for the intended command.
     *
     * @return {boolean}
     */
    private static isIntendedCommand(stringToSearch: string, regexp: string): boolean {
        return stringToSearch.search(regexp) >= 0;
    }

    /**
     * Try to execute the command.
     * 
     * @param message - The users message, that we will check if it was a intended bot command.
     *
     * @return {Promise<Message | Message[]>}
     */
    public handle(message: Message): Promise<Message | Message[]> {
        // Separate the command from the parameters
        let userInput: string[],
            originalCommand: string,
            commandParameters: string[],
            command: CommandHandlerInterface|null;

        // User input, it contains the command and the associated parameters.
        userInput = message.content.substr(1).split(" ");

        // Get the command prefix
        originalCommand = userInput[0] || '';
        commandParameters = userInput.splice(1);

        // If the original command is empty, it not an intended command
        if (!originalCommand) {
            return Promise.resolve(message);
        }

        command = this.availableCommands.find(availableCommand => CommandHandler.isIntendedCommand(originalCommand, availableCommand.regexp)) || null;

        // If the originalCommand is not found, try to check that the command is maybe a clip key
        if (command) {
            return command.action(message, commandParameters);
        }

        return this.memes.findClip(originalCommand).then((commandClip: string | null) => {
            return commandClip ? this.memes.action(message, commandClip) : message.channel.send('Command has not been found.');
        });
    }
}