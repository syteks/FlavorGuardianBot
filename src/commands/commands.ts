import { inject, injectable } from "inversify";
import { CommandHandler } from "../interfaces/command-handler";
import { TYPES } from "../types";
import { EmbedMessage } from "../classes/embeds/embed-message";
import { EmbedFieldData, Message } from "discord.js";
import { EmbedRichMessage } from "../classes/embeds/embed-rich-message";
import commandsField from "../storage/field/commands-field.json";

@injectable()
export class Commands implements CommandHandler {
    /**
     * Regex for this command.
     *
     * @var {string}
     */
    public readonly regexp = 'commands|help';

    /**
     * The embed messages, that will be saved in a singleton class.
     * Used to access the embed message that we want to put hook reactive to it.
     *
     * @var {EmbedMessage}
     */
    private readonly embedMessage: EmbedMessage;

    /**
     * Contains the field of the rich embed message that we should show to the user.
     *
     * @var {EmbedMessage}
     */
    private readonly embedMessageFields: EmbedFieldData[];

    /**
     * Initialize the shitty ass class.
     *
     * @param embedMessage - This embed message object can be accessed across all Bot borders, in order to hook action or manipulate the generated embed message.
     */
    constructor(
        @inject(TYPES.EmbedMessage) embedMessage: EmbedMessage,
    ) {
        this.embedMessage = embedMessage;
        this.embedMessageFields = commandsField;
    }

    /**
     * This action will trigger a bunch of random action that I honestly don't know how or what is going on with this shit but it currently 22:41pm.
     * All I can say is that it does stuff that nobody will never know.
     * #Returns a embed message with all the available command for the bot.
     *
     * @param message - The user message that triggered the command.
     * @param _commandParameters - The command parameters are not mandatory for this command.
     *
     * @return {Message | Message[]}
     */
    public action(message: Message, _commandParameters: string[]): Promise<Message | Message[]> {
        // This will contain our embed message that will display all of the available commands.
        let richEmbed = new EmbedRichMessage();

        // Set the embed message title.
        richEmbed.setTitle('Available commands');

        // Set the color for the embed message.
        richEmbed.setColor('AQUA');

        // Add bot prefix field information to the rich embed.
        richEmbed.addBotPrefixField();

        // Add the commands embed fields.
        richEmbed.addFields(this.embedMessageFields);

        // Send the message back to channel that the user first used to trigger the action.
        message.channel.send(richEmbed).then((embedMessageSent: Message) => {
            if (embedMessageSent.guild) {
                this.embedMessage.setEmbedReactiveMessageByServerID('available-commands', embedMessageSent.guild.id, embedMessageSent.id, {offset: 0, limit: 0})
            }
        });

        return Promise.resolve(message);
    }
}