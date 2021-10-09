import { inject, injectable } from "inversify";
import { Message } from "discord.js";
import { TYPES } from "../../types";
import { MemeService } from "../../services/memes/meme-service";
import { CommandHandler } from "../../interfaces/command-handler";
import { Meme } from "../../models/meme";
import { validateURL } from "ytdl-core";

@injectable()
export class AddMeme implements CommandHandler {
    /**
     * Regex for the command label.
     *
     * @var string
     */
    public readonly regexp = 'addMeme|addmeme';

    /**
     * Contains the database service that we will use in order to apply CRUD logic to our memes.
     *
     * @var MemeService
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
    public action(message: Message, commandParameters: string[]): Promise<Message | Message[]> {
        // Check if the name and the clip was passed as parameters
        if (commandParameters.length != 2 || !commandParameters[0] || !commandParameters[1]) {
            return message.channel.send(`Expected 2 parameters, ${commandParameters.length} parameter(s) given. The structure is "addMeme [key|name] [url]"`)
        }

        // Validate the url of the last parameter, which should always be the new URL.
        if (!validateURL(commandParameters[commandParameters.length - 1] ?? '')) {
            return message.channel.send(`The given URL was not valid, please check if the URL is a valid sound/video/song, if it still doesn't work start crying, because the creator will do nothing about it.`);
        }

        let meme: Meme;

        // Declare ourselves a new meme object to be inserted into the database
        meme = new Meme(commandParameters[0], commandParameters[1]);

        // Check if there is already a clip associated with the given clip
        return this.memeService.getMemeByKey(meme.key).then((existingMeme: Meme) => {
            // Return a polite message that says the meme exists
            if (existingMeme) {
                return message.channel.send(`There is already a clip associated with the given key "${meme.key}"`)
            }

            this.memeService.createMeme(meme).then(() => {
                return message.channel.send(`The meme was successfully added with the key name "${meme.key}".`)
            })
                .catch(() => {
                    return message.channel.send("There was an error adding your meme, please try again later or don't, I do not really care #NotPaidForThis.")
                });

            return Promise.resolve(message);
        });
    }

}