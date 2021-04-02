import { Message } from "discord.js";
import { Readable } from "stream";

export interface Meme {
    /**
     * The key of the meme-clip.
     */
    key: string,

    /**
     * The url of the clip that we want to play.
     */
    clip: string
}

// This is the interface of a command object, meaning all the commands must have a action function and a regexp attribute
export interface CommandObject {
    /**
     * Regex for the command
     */
    regexp: string,

    /**
     * This will define the action of the command.
     * This function will process the input of the user.
     *
     * @param message - The Message of the user
     * @param commandParameters - A string that contains the parameters to the command
     * @returns {Promise<Message | Message[]>}
     */
    action(message: Message, commandParameters: string[]): Promise<Message | Message[]>
}

export interface AudioClip {
    /**
     * Contains the audio title.
     */
    audioTitle: string,

    /**
     * Contains the audio url.
     */
    audioUrl: string,

    /**
     * Contains the playable audio.
     */
    audioClip: Readable
}