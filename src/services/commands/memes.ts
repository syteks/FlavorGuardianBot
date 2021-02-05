import {Message, VoiceConnection} from "discord.js";
import youtubePlayer from "ytdl-core";
import { injectable } from "inversify";
import memes from "../../storage/audio.json";
import { Meme } from "../../interfaces";

@injectable()
export class Memes {
    /**
     * Regex for this command
     */
    public readonly regexp = 'memes';

    /**
     * All the memes !
     */
    private memes: Meme[];

    /**
     * Instantiate the message responder
     */
    constructor() {
        this.memes = memes;
    }

    /**
     * This will find the clip that we want to play for the user.
     * If it doesn't find the given clip name in the list, it will warn the user.
     *
     * @param message
     * @param parameters
     * @return Promise<Message | Message[]>
     */
    public action(message: Message, parameters: string | string[]): Promise<Message | Message[]> {
        // Make sure the user is in a channel
        if (!message.member.voiceChannel) {
            return message.reply("You must be in a channel.");
        }

        // Declare a variable that will be used to play the clip by given keys or a random clip.
        let meme: string | null;

        if (!Array.isArray(parameters)) {
            meme = parameters;
        } else {
            if (parameters.length === 0) {
                meme = this.randomClip();
            } else {
                meme = this.findClip(parameters[0] || '');
            }
        }

        // Make sure the clip is found
        if (!meme) {
            return message.reply("The given clip was not found.");
        }

        // This is where the clip will be played
        if (!message.guild.voiceConnection) {
            message.member.voiceChannel.join().then((connection: VoiceConnection) => {
                // Keep the connection in a dispatcher to know when the bot is done outputting stream
                let dispatcher = connection.playStream(youtubePlayer(meme || '', {filter: "audioonly", quality: "highestaudio"}), {volume: 0.25});

                // When the audio is done playing we want to disconnect the bot
                dispatcher.on("end", function () {
                    connection.disconnect();
                });
            })
            .catch((_error: any) => {
                // @todo: catch errors and do something about it!
            });
        }

        return Promise.resolve(message);
    }

    /**
     * This function will return the clip associated with the given meme name.
     * If the clip is not found in the list, returns empty string.
     *
     * @param key
     * @private
     */
    public findClip(key: string): string | null {
        return this.memes.find(meme => meme.key === key)?.clip || null;
    }

    /**
     * This function should never return empty, unless somebody played with the randomizer and outputs numbers that are outside the list range.
     * @returns string Returns a random clip found in the list
     */
    private randomClip(): string {
        // Get a random number between 0 and the amount of clip found in the .json file
        let randomClipNumber: number = Math.floor(Math.random() * memes.length);

        // Output the random clip
        return this.memes[randomClipNumber].clip;
    }
}