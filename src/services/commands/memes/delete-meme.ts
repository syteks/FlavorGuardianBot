import { inject, injectable } from "inversify";
import { CommandObject } from "../../../interfaces";
import { Message } from "discord.js";
import { TYPES } from "../../../types";
import { MemeService } from "../../meme-service";
import { Meme } from "../../../models/meme";

@injectable()
export class DeleteMeme implements CommandObject {
    /**
     * Regex for this command
     */
    public readonly regexp = 'deleteMeme|deletememe';

    /**
     * Contains the database service
     *
     * @private MemeService
     */
    private memeService: MemeService;

    /**
     * Initialize the command class, that will process your mom before outputting it into a soundtrack, sike she was too fat to process!
     *
     * @param memeService - This will contain our connection to our data base that we can use to make action to the database.
     */
    constructor(@inject(TYPES.MemeService) memeService: MemeService) {
        this.memeService = memeService;
    }

    /**
     * This will define the action of the command.
     * This function will process the input of the user.
     *
     * @param message - The Message of the user
     * @param commandParameters - A string that contains the parameters to the command
     * @returns {Promise<Message | Message[]>}
     */
    public action(message: Message, commandParameters: string[]): Promise<Message | Message[]> {
        // Return a message to indicate that the parameters doesn't pass the validator
        if (commandParameters.length > 1 || !commandParameters[0]) {
            return message.reply(`Expected 1 parameter, ${commandParameters.length} parameters given`);
        }

        // Check if the meme exists and delete it, if the meme doesn't exist outputs a error message
        return this.memeService.getMemeByKey(commandParameters[0]).then((existentMeme: Meme) => {
            // The meme that we want to delete doesn't exist
            if (!existentMeme) {
                return message.reply(`There is no meme associated with the given key "${commandParameters[0]}"`);
            }

            this.memeService.deleteMeme(existentMeme._id || '');

            return Promise.resolve(message);
        });
    }
}