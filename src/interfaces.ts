import { Message } from "discord.js";
import { Readable } from "stream";

export interface Meme {
    key: string,
    clip: string
}

// This is the interface of a command object, meaning all the commands must have a action function and a regexp attribute
export interface CommandObject {
    regexp: string,
    action(message: Message, commandParameters: string[]): Promise<Message | Message[]>
}

export interface AudioClip {
    audioTitle: string,
    audioUrl: string,
    audioClip: Readable
}