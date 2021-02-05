import {Message} from "discord.js";

export interface Meme {
    key: string,
    clip: string
}

export interface CommandObject {
    regexp: string;
    action(message: Message, commandParameters: string[]): Promise<Message | Message[]>;
}