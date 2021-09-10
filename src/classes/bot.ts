import { Client, Message } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { CommandHandler } from "../handlers/command-handler";
import { ButtonHandler } from "../handlers/button-handler";
import { MessageComponent } from "discord-buttons";

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
     * This will handle and disperse the handle actions across the available button handler.
     *
     * @var {ButtonHandler}
     */
    private buttonHandler: ButtonHandler;

    /**
     * Instantiate the bot
     *
     * @param client - The client.
     * @param token - The client token.
     * @param commandHandler - The command handler that will handle the user command.
     * @param buttonHandler - The button handler that will handle the user button action for a specific message.
     */
    constructor(
        @inject(TYPES.Client) client: Client,
        @inject(TYPES.Token) token: string,
        @inject(TYPES.CommandHandler) commandHandler: CommandHandler,
        @inject(TYPES.ButtonHandler) buttonHandler: ButtonHandler
    ) {
        this.client = client;
        this.token = token;
        this.commandHandler = commandHandler;
        this.buttonHandler = buttonHandler;
    }

    /**
     * Listen for incoming commands
     */
    public listen(): Promise<string> {
        // Handle the user message.
        this.handleMessage();

        // Add a hook to the button reaction;
        this.handleMessageButtonReaction();

        // Handle the api errors.
        this.handleErrors();

        // Connect the bot
        return this.client.login(this.token);
    }

    /**
     * This will handle the user input.
     *
     * @return {void}
     */
    private handleMessage(): void {
        this.client.on('message', (message: Message) => {
            // Ignore the bot and message without the command prefix
            if (message.author.bot || !message.content.startsWith(process.env.BOT_COMMAND_PREFIX || '~')) {
                return;
            }

            // Process the command
            this.commandHandler.handle(message).then(() => {
                // Do any action after the message
            }).catch((error) => {
                console.log(error);
            })
        });
    }

    /**
     * This will be the webhook to the click button listeners.
     * Take the button id and apply the appropriate actions.
     *
     * @return void
     */
    private handleMessageButtonReaction(): void {
        this.client.on("clickButton", async (button: MessageComponent) => {
            let handled: boolean = false;

            handled = this.buttonHandler.handle(button);

            if (!handled) {
                await button.reply.send('Something went wrong try again later or contact the daddy.', [])
            }
        });
    }

    /**
     * Handle the errors throw by the api, for now ignore them.
     *
     * @return void
     */
    private handleErrors(): void {
        this.client.on('error', (error: Error) => {
            console.log(error);
        });
    }
}