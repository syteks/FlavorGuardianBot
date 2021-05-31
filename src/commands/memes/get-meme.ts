import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { Message } from "discord.js";
import Command from "../../interfaces/command";
import { MemeService } from "../../services/memes/meme-service";
import { Meme } from "../../models/meme";

@injectable()
export class GetMeme implements Command {
    /**
     * Regex for the command label.
     */
    public readonly regexp = 'getMeme|getmeme';

    /**
     * Contains the database service that we will use in order to apply CRUD logic to our memes.
     *
     * @private MemeService
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
     * @returns {Promise<Message | Message[]>}
     */
    action(message: Message, commandParameters: string[]): Promise<Message | Message[]> {
        if (commandParameters.length > 1) {
            return message.reply(`Expected 0 or 1 parameter, ${commandParameters.length} parameter(s) given. The structure is "getMeme [key|name]"`);
        }
        //
        if (commandParameters.length === 1) {
            this.memeService.getMemes();
        } else {
            this.memeService.getMemes({}, 6, 0).then((meme: Meme[]) => {
                console.log(meme);
            });
        }


        return Promise.resolve(message);
    }
}