import { Message } from "discord.js";
import { injectable } from "inversify";
import { CommandHandler } from "../../interfaces/command-handler";

@injectable()
export class Clear implements CommandHandler {
    public readonly regexp = 'clear|wipe|c';

    action(message: Message, commandParameters: string[]): Promise<Message | Message[]> {
        console.log(message);
        console.log(commandParameters);

        return Promise.resolve(message);
    }
}