import { inject, injectable } from "inversify";
import { Message } from "discord.js";
import { MemeService } from "../../services/memes/meme-service";
import { TYPES } from "../../types";
import { CommandHandler } from "../../interfaces/command-handler";
import { Meme } from "../../models/meme";

@injectable()
export class UpdateMeme implements CommandHandler {
    /**
     * Regex for this command.
     */
    public readonly regexp = 'updateMeme|updatememe';

    /**
     * Contains the database service that we will use in order to apply CRUD logic to our memes.
     *
     * @var {MemeService}
     */
    private memeService: MemeService;

    /**
     * Initialize the command classes, that will process your mom before outputting it into a soundtrack, sike she was too fat to process!
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
     * @return {Promise<Message | Message[]>}
     */
    action(message: Message, commandParameters: string[]): Promise<Message | Message[]> {
        if (commandParameters.length != 3 || !commandParameters[0] || !commandParameters[1] || !commandParameters[2]) {
            return message.channel.send(`Expected 2 parameter, ${commandParameters.length} parameters given. The structure is "updateMeme [key|name] [url]"`)
        }

        let meme: Meme;

        // This is our new meme object, with the new [url]
        if (commandParameters.length == 3) {
            meme = new Meme(commandParameters[1], commandParameters[2]);
        } else {
            meme = new Meme(commandParameters[0], commandParameters[1]);
        }

        // Check if the given parameter the meme exists
        return this.memeService.getMemeByKey(commandParameters[0]).then((existingMeme: Meme) => {
            // The meme that we want to delete doesn't exist
            if (!existingMeme) {
                return message.channel.send(`There is no meme associated with the given key "${commandParameters[0]}"`);
            }

            // Assign the id found for the meme to the new model
            meme._id = existingMeme._id;

            this.memeService.updateMeme(existingMeme._id ?? '', meme);

            return Promise.resolve(message);
        });
    }

}