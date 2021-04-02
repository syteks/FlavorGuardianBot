import { inject, injectable } from "inversify";
import { CommandObject } from "../../../interfaces";
import { Message } from "discord.js";
import { MemeService } from "../../meme-service";
import { TYPES } from "../../../types";
import { Meme } from "../../../models/meme";

@injectable()
export class UpdateMeme implements CommandObject {
    /**
     * Regex for this command.
     */
    public readonly regexp = 'updateMeme|updatememe';

    /**
     * Contains the database service that we will use in order to apply CRUD logic to our memes.
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
    action(message: Message, commandParameters: string[]): Promise<Message | Message[]> {
        if (commandParameters.length != 3 || !commandParameters[0] || !commandParameters[1] || !commandParameters[2]) {
            return message.reply(`Expected 2 parameter, ${commandParameters.length} parameters given. The structure is "updateMeme [key|name] [url]"`)
        }

        let meme: Meme;

        // This is our new meme object, with the new [url]
        if (commandParameters.length == 3) {
            meme = new Meme(commandParameters[1], commandParameters[2]);
        } else {
            meme = new Meme(commandParameters[0], commandParameters[1]);
        }

        // Check if the given parameter the meme exists
        return this.memeService.getMemeByKey(commandParameters[0]).then((existentMeme: Meme) => {
            // The meme that we want to delete doesn't exist
            if (!existentMeme) {
                return message.reply(`There is no meme associated with the given key "${commandParameters[0]}"`);
            }

            // Assign the id found for the meme to the new model
            meme._id = existentMeme._id;

            this.memeService.updateMeme(existentMeme._id ?? '', meme);

            return Promise.resolve(message);
        });
    }

}