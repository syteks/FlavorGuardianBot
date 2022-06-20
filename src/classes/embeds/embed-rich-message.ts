import { EmbedField, MessageEmbed } from "discord.js";
import { MessageButton } from "../../interfaces/message-button";

export class EmbedRichMessage extends MessageEmbed {
    /**
     * This will contain the rich embed message buttons, that will be sent in the channel.
     *
     * @var {MessageButton[]}
     */
    private buttons: Array<MessageButton> = [];

    /**
     * This function will add information about the bot prefix.
     *
     * @param {boolean} atBeginning - Should we add the information at the beginning of our embed message or at the end?
     */
    public addBotPrefixField(atBeginning: boolean = true): void {
        if (atBeginning) {
            this.fields?.unshift({
                "name": `The bot's prefix (${process.env.BOT_COMMAND_PREFIX})`,
                "value": "To use the listed command, you need to prefix them with the bot prefix.",
                "inline": false
            });
        } else {
            this.fields?.push({
                "name": `The bot's prefix (${process.env.BOT_COMMAND_PREFIX})`,
                "value": "To use the listed command, you need to prefix them with the bot prefix.",
                "inline": false
            });
        }
    }

    /**
     * Add a button to the message that we are sending.
     *
     * @param embedMessageButton - This will contain the information about the button.
     */
    public addButton(embedMessageButton: MessageButton): void {
        if (embedMessageButton.custom_id && embedMessageButton.label) {
            this.buttons.push(embedMessageButton);
        }
    }

    /**
     * Add a custom embed field with a given color.
     *
     * @param {Array<EmbedField>} richEmbedFields
     * @param {string} color
     * @return {void}
     */
    public addCustomEmbedField(richEmbedFields: Array<EmbedField>, color: string = 'RANDOM'): void {
        this.setColor(color);
        this.addFields(richEmbedFields);
    }

    /**
     * We will be using this function in order to send a message with the buttons or a custom component.
     */
    public toObject() {
        if (! this.buttons.length) {
            return {
                embed: this
            }
        }

        return {
            embed: this,
            components: [
                {
                    "components": this.buttons
                }
            ]
        }
    }
}