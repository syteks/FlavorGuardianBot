import { inject, injectable } from "inversify";
import { Message } from "discord.js";
import { MemeService } from "../../services/memes/meme-service";
import { TYPES } from "../../types";
import { CommandHandler } from "../../interfaces/command-handler";
import { Meme } from "../../models/meme";
import { validateURL } from "ytdl-core";

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
        // Validate the amount of parameters given, we only accept 2 or 3.
        if (commandParameters.length < 2 || commandParameters.length > 3) {
            return message.channel.send(`Expected minimum 2 parameters or a maximum of 3 parameters, ${commandParameters.length} parameters given. The structure is "updateMeme [key|name] [new_key|new_name](optional) [url]"`)
        }

        // Validate the url of the last parameter, which should always be the new URL.
        if (!validateURL(commandParameters[commandParameters.length - 1] ?? '')) {
            return message.channel.send(`The given URL was not valid, please check if the URL is a valid sound/video/song, if it still doesn't work start crying, because the creator will do nothing about it.`);
        }

        let meme: Meme;

        // This is our new meme object, with the new [url].
        if (commandParameters.length === 3) {
            meme = new Meme(commandParameters[1], commandParameters[2]);
        } else {
            meme = new Meme(commandParameters[0], commandParameters[1]);
        }

        // Check if the given parameter the meme exists.
        return this.memeService.getMemeByKey(commandParameters[0]).then((existingMeme: Meme) => {
            // The meme that we want to delete doesn't exist.
            if (!existingMeme) {
                return message.channel.send(`There is no meme associated with the given key "${commandParameters[0]}"`);
            }

            // Assign the id found for the meme to the new model.
            meme._id = existingMeme._id;

            this.memeService.updateMeme(existingMeme._id ?? '', meme).then(() => {
                return message.channel.send('The meme was successfully updated.')
            }).catch((error: Error) => {
                console.log(error);

                return message.channel.send('There was a error while processing the command. Please call for help.');
            });

            return Promise.resolve(message);
        });
    }
}