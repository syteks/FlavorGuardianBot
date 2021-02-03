import { Message } from "discord.js";
import youtubePlayer from "ytdl-core";
import { injectable } from "inversify";
import memes from "../../storage/audio.json";
import { Meme } from "../../interfaces";

@injectable()
export class Memes {
    /**
     * Regex for this command
     * 
     * @todo: Change regex to take one param (ex: ~memes meat)
     */
    private regexp = 'memes';

    /**
     * All the memes !
     */
    private memes: Meme[];

    /**
     * Instantiate the message responder
     * 
     * @param pingFinder 
     */
    constructor() {
        this.memes = memes;
    }

    /**
     * Is this a ping command ?
     * 
     * @param stringToSearch 
     * @return boolean
     */
    public isMeme(stringToSearch: string): boolean {
        return stringToSearch.search(this.regexp) >= 0;
    }

    /**
     * Ping action
     * 
     * @param message
     * @return Promise<Message | Message[]> 
     */
    public action(message: Message): Promise<Message | Message[]> {
        // Make sure the user is in a channel
        if (!message.member.voiceChannel) {
            return message.reply("You must be in a channel.");
        }

        // Try to find the clip
        // @todo: 
        const meme = this.findClip(this.memes, 'meat');

        // Make sure the clip is found
        if (!meme) {
            return message.reply("The given clip was not found.");
        }

        // This is where the clip will be played
        if (!message.guild.voiceConnection) {
            message.member.voiceChannel.join().then((connection: any) => {
                // Keep the connection in a dispatcher to know when the bot is done outputting stream
                let dispatcher = connection.playStream(youtubePlayer(meme.clip, {filter: "audioonly", quality: "highestaudio"}), {volume: 0.25});

                // When the audio is done playing we want to disconnect the bot
                dispatcher.on("end", function () {
                    connection.disconnect();
                });

            })
            .catch((_error: any) => {
                // @todo: catch errors and do something about it!
            });
        }

        return message.reply('Could not join channel.');
    }

    /**
     * This function will return the clip associated with the given meme name.
     * If the clip is not found in the list, returns empty string.
     * @param clip
     * @returns string If the string is empty it means that the clip was not found in the lsit
     */
    private findClip = (memes: Meme[], key: string) => {
        return memes.find(meme => meme.key === key);
    }

    /**
     * This function should never return empty, unless somebody played with the randomizer and outputs numbers that are outside the list range.
     * @returns string Returns a random clip found in the list
     */
    // private randomClip = (memes: Meme[]) => {
    //     // Get a random number between 0 and the amount of clip found in the .json file
    //     let randomClipNumber: number = Math.floor(Math.random() * memes.length);

    //     // Output the random clip
    //     return memes[randomClipNumber].clip;
    // }
}