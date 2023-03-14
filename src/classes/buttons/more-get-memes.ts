import { inject, injectable } from "inversify";
import { MessageButtonHandler } from "../../interfaces/message-button-handler";
import { TYPES } from "../../types";
import { MemeService } from "../../services/memes/meme-service";
import { EmbedMessage } from "../embeds/embed-message";
import { MessageComponent } from "discord-buttons";
import { Meme } from "../../models/meme";
import { EmbedRichMessage } from "../embeds/embed-rich-message";
import { Message } from "discord.js";

@injectable()
export class MoreGetMemes implements MessageButtonHandler {
    /**
     * The button that is currently linked to the this handler
     *
     * @var {string}
     */
    public readonly buttonLabel = "get_more_memes";
    /**
     * This will contain our bridge action to our database.
     *
     * @var {MemeService}
     */
    private memeService: MemeService;

    /**
     * This will contain some of the options of the generated embed message.
     *
     * @var {EmbedMessage}
     */
    private embedMessage: EmbedMessage;

    /**
     * The more get meme handler.
     *
     * @param memeService - Meme service used to perform action on the meme data.
     * @param embedMessage - The embed message generated with the get-meme command.
     */
    constructor(
        @inject(TYPES.MemeService) memeService: MemeService,
        @inject(TYPES.EmbedMessage) embedMessage: EmbedMessage
    ) {
        this.memeService = memeService;
        this.embedMessage = embedMessage;
    }

    /**
     * Handle the get more memes button, it will go fetch the next 6 memes.
     *
     * @param button - The object returned by the hook.
     * @return {boolean}
     */
    public handle(button: MessageComponent): boolean {
        let offset: number;

        offset = this.embedMessage.getEmbedReactiveMessage('get-memes', button.guild.id, button.message.id)?.options.offset || 0;

        offset += 6;

        // Get the memes from the database and output them in an embed message.
        this.memeService.getMemes({}, 6, offset).then((memes: Meme[]) => {
            let richEmbed = new EmbedRichMessage();

            richEmbed.setColor("LUMINOUS_VIVID_PINK");

            richEmbed.setTitle("A list of saved memes");

            memes.forEach((meme: Meme) => {
                richEmbed.addField(meme.key, meme.clip, false);
            });

            if (memes.length !== 0) {
                richEmbed.addButton({
                    type: 2,
                    label: "Next",
                    style: 1,
                    custom_id: "get_more_memes",
                });
            } else {
                richEmbed.addField('End of the list', 'You have reached the end of the list you nerd.', false);
            }

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