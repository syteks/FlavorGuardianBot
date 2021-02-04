import { Message } from "discord.js";
import { injectable } from "inversify";

@injectable()
export class PingFinder {
    /**
     * Regex for this command
     */
    public readonly regexp = 'ping';

    /**
     * Ping action
     *
     * @param message
     * @param parameters
     * @return Promise<Message | Message[]>
     */
    public action(message: Message, parameters?: string | string[]): Promise<Message | Message[]> {
        console.log(parameters);
        return message.reply('pong!');
    }
}