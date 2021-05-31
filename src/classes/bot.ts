import { Client, Message } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { CommandHandler } from "../services/commands/command-handler";

@injectable()
export class Bot {
    /**
     * Discord Client
     * 
     * @var client
     */
    private client: Client;

    /**
     * Discord bot token
     * 
     * @var token
     */
    private readonly token: string;

    /**
     * Function to process the command
     * 
     * @var messageResponder
     */
    private commandHandler: CommandHandler;

    /**
     * Instantiate the bot
     *
     * @param client - The client
     * @param token
     * @param commandHandler
     */
    constructor(
        @inject(TYPES.Client) client: Client,
        @inject(TYPES.Token) token: string,
        @inject(TYPES.CommandHandler) commandHandler: CommandHandler) {
        this.client = client;
        this.token = token;
        this.commandHandler = commandHandler;
    }

    /**
     * Listen for incoming commands
     */
    public listen(): Promise<string> {
        this.client.on('message', (message: Message) => {
            // Ignore the bot and message without the command prefix
            if (message.author.bot || !message.content.startsWith(process.env.BOT_COMMAND_PREFIX || '~')) {
                return;
            }

            // Process the command
            this.commandHandler.handle(message).then(() => {
                // Do any action after the message
            }).catch(() => {
                // @todo: catch errors and do something about it!
            })
        });

        // Connect the bot
        return this.client.login(this.token);
    }
}