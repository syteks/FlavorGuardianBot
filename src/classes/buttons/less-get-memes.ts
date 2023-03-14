import { MemeService } from "../../services/memes/meme-service";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { MessageButtonHandler } from "../../interfaces/message-button-handler";
import { Meme } from "../../models/meme";
import { EmbedRichMessage } from "../embeds/embed-rich-message";
import { Message } from "discord.js";
import { EmbedMessage } from "../embeds/embed-message";
import { MessageComponent } from "discord-buttons";

@injectable()
export class LessGetMemes implements MessageButtonHandler {
    /**
     * The button that is currently linked to the this handler
     *
     * @var {string}
     */
    public readonly buttonLabel = "get_less_memes";

    /**
     * This will contain our bridge action to our database.
     *
     * @var {MemeService}
     */
    private memeService: MemeService;

    /**
     *
      * @var {EmbedMessage}
     */
    private embedMessage: EmbedMessage;

    /**
     * The constructor that will go fetch the last 6 memes from the data base.
     *
     * @param memeService - Bridge to access our meme table data.
     * @param embedMessage - The embed sent messages.
     */
    constructor(
        @inject(TYPES.MemeService) memeService: MemeService,
        @inject(TYPES.EmbedMessage) embedMessage: EmbedMessage
    ) {
        this.memeService = memeService;
        this.embedMessage = embedMessage;
    }

    /**
     * Handle the button hook information.
     *
     * @param button - The object that is given webhook.
     */
    public handle(button: MessageComponent): boolean {
        let offset: number;

        offset = this.embedMessage.getEmbedReactiveMessage('get-memes', button.guild.id, button.message.id)?.options.offset || 0;

        offset -= 6;

        // Get the memes from the database and output them in an embed message.
        this.memeService.getMemes({}, 6, offset).then((memes: Meme[]) => {
            let richEmbed = new EmbedRichMessage();

            richEmbed.setColor("LUMINOUS_VIVID_PINK");

            richEmbed.setTitle("A list of saved memes");

            richEmbed.addButton({
                type: 2,
                label: "Next",
                style: 1,
                custom_id: "get_more_memes",
            });

            memes.forEach((meme: Meme) => {
                richEmbed.addField(meme.key, meme.clip, false);
            });

            // If we are not at the first page we show less button.
            if (offset !== 0) {
                richEmbed.addButton({
                    type: 2,
                    label: "Previous",
                    style: 1,
                    custom_id: "get_less_memes",
                });
            }

            button.message.edit(richEmbed.toObject()).then((embedMessageSent: Message) => {
                // The message that is sent back as a reply.
                if (embedMessageSent.guild) {
                    this.embedMessage.setEmbedReactiveMessageByServerID('get-memes', embedMessageSent.guild?.id, embedMessageSent.id, {offset: offset, limit: 6});
                }
            });
        });

        return true;
    }

}