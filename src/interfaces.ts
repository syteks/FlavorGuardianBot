import { Message } from "discord.js";

export interface CommandObject {
    regexp: string;
    action(message: Message, commandParameters: string[]): Promise<Message | Message[]>;
}