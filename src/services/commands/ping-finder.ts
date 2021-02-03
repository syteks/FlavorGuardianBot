import { Message } from "discord.js";
import { injectable } from "inversify";

@injectable()
export class PingFinder {
    /**
     * Regex for this command
     */
    private regexp = 'ping';

    /**
     * Is this a ping command ?
     * 
     * @param stringToSearch 
     * @return boolean
     */
    public isPing(stringToSearch: string): boolean {
        return stringToSearch.search(this.regexp) >= 0;
    }

    /**
     * Ping action
     * 
     * @param message
     * @return Promise<Message | Message[]> 
     */
    public action(message: Message): Promise<Message | Message[]> {
        return message.reply('pong!');
    }
}