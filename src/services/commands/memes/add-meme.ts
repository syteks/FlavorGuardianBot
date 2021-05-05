import { inject, injectable } from "inversify";
import { CommandObject } from "../../../interfaces";
import { Message } from "discord.js";
import { TYPES } from "../../../types";
import { MemeService } from "../../meme-service";
import { Meme } from "../../../models/meme";

@injectable()
export class AddMeme implements CommandObject {
    /**
     * Regex for the command
     */
    public readonly regexp = 'addMeme|addmeme';

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
    public action(message: Message, commandParameters: string[]): Promise<Message | Message[]> {
        // Check if the name and the clip was passed as parameters
        if (commandParameters.length != 2 || !commandParameters[0] || !commandParameters[1]) {
            return message.reply(`Expected 2 parameters, ${commandParameters.length} parameter(s) given. The structure is "addMeme [key|name] [url]"`)
        }

        // @todo Check if the given url is valid
        let meme: Meme;

        // Declare ourselves a new meme object to be inserted into the database
        meme = new Meme(commandParameters[0], commandParameters[1]);

        // Check if there is already a clip associated with the given clip
        return this.memeService.getMemeByKey(meme.key).then((existingMeme: Meme) => {
            // Return a polite message that says the meme exists
            if (existingMeme) {
                return message.reply(`There is already a clip associated with the given key "${meme.key}"`)
            }

            this.memeService.createMeme(meme);

            return Promise.resolve(message);
        });
    }

}