import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { Message } from "discord.js";
import { CommandHandler } from "../../interfaces/command-handler";
import { MemeService } from "../../services/memes/meme-service";
import { Meme } from "../../models/meme";
import { EmbedRichMessage } from "../../classes/embeds/embed-rich-message";
import { EmbedMessage } from "../../classes/embeds/embed-message";

@injectable()
export class GetMeme implements CommandHandler {
    /**
     * Regex for the command label.
     */
    public readonly regexp = 'getMeme|getmeme';

    /**
     * Contains the database service that we will use in order to apply CRUD logic to our memes.
     *
     * @var {MemeService}
     */
    private memeService: MemeService;

    /**
     * Contains an access to a local kept embed messages, that we can hook reaction to them.
     *
     * @var {EmbedMessage}
     */
    private embedMessage: EmbedMessage;

    /**
     * Initialize the get meme command.
     *
     * @param memeService - This will contain our connection to our data base that we can use to make action to the database.
     * @param embedMessage - This will contain our local storage of message that we should listen to reactions.
     */
    constructor(
        @inject(TYPES.MemeService) memeService: MemeService,
        @inject(TYPES.EmbedMessage) embedMessage: EmbedMessage
    ) {
        this.memeService = memeService;
        this.embedMessage = embedMessage;
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
        if (commandParameters.length > 0) {
            return message.channel.send(`Expected 0 parameter, ${commandParameters.length} parameter(s) given. The structure is "getMeme [key|name]"`);
        }

        // Get the memes from the database and output them in an embed message.
        this.memeService.getMemes({}, 6, 0).then((memes: Meme[]) => {
            let richEmbed = new EmbedRichMessage();

            richEmbed.setColor("LUMINOUS_VIVID_PINK");

            richEmbed.setTitle("A list of saved memes");

            memes.forEach((meme: Meme) => {
                richEmbed.addField(meme.key, meme.clip, false);
            });

            richEmbed.addButton({
                type: 2,
                label: "Next",
                style: 1,
                custom_id: "get_more_memes",
            });

            message.channel.send(richEmbed.toObject()).then((embedMessageSent: Message) => {
                // The message that is sent back as a reply.
                if (embedMessageSent.guild) {
                    this.embedMessage.setEmbedReactiveMessageByServerID('get-memes', embedMessageSent.guild?.id, embedMessageSent.id, {offset: 0, limit: 6});
                }
            });
        });

        return Promise.resolve(message);
    }
}