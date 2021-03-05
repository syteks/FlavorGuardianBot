import { Message, StreamDispatcher, VoiceConnection } from "discord.js";
import { inject, injectable } from "inversify";
import memes from "../../storage/audio.json";
import { AudioClip, Meme } from "../../interfaces";
import { AudioPlayer } from "../../class/audio-player";
import { TYPES } from "../../types";

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
     * Access the jukebox in order to play and process the memes clips
     */
    private audioPlayer: AudioPlayer;

    /**
     * Initialize the command class, that will process your mom before outputing it into a soundtrack, sike she was too fat to process!
     *
     * @param audioPlayer - This is the bot jukebox, used to process the url's and contains an array of our audio playlist.
     */
    constructor(@inject(TYPES.AudioPlayer) audioPlayer: AudioPlayer) {
        this.audioPlayer = audioPlayer;
        this.memes = memes;
    }

    /**
     * This will find the clip that we want to play for the user.
     * If it doesn't find the given clip name in the list, it will warn the user.
     *
     * @param message - The Message of the user
     * @param parameters - A string that contains the parameters to the command
     * @returns {Promise<Message | Message[]>}
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

        let clipUrl: string;

        clipUrl = meme || '';

        // This is where the clip will be played
        if (!message.guild.voiceConnection) {
            // Checks the validity of the url and the content, before making the bot join the channel.
            this.audioPlayer.processAudioUrl(clipUrl)
                .then((audioClip: AudioClip) => {
                    if (audioClip.audioTitle) {
                        message.member.voiceChannel.join()
                            .then((connection: VoiceConnection) => {
                                // The dispatcher that will play the audio and close the connection when it done
                                let dispatcher: StreamDispatcher;

                                // Do nothing with the .then, it only useful to suppress the ts lint. Displays the current audio title.
                                message.reply(`Now playing : ${audioClip.audioTitle}`).then();

                                // Keep the connection in a dispatcher to know when the bot is done outputting stream
                                dispatcher = connection.playStream(audioClip.audioClip, {volume: 0.25});

                                // When the audio is done playing we want to disconnect the bot
                                dispatcher.on("end", function () {
                                    connection.disconnect();
                                });
                            })
                            .catch((_error: string) => {
                                // @todo: catch errors and do something about it!
                            });
                    }
                })
                .catch((err: string) => {
                    return message.reply(err);
                });
        }

        return Promise.resolve(message);
    }

    /**
     * This function will return the clip associated with the given meme name.
     * If the clip is not found in the list, returns empty string.
     *
     * @param key - A string
     *
     * @returns Returns the string or a null if the clip is not found
     */
    public findClip(key: string): string | null {
        return this.memes.find(meme => meme.key === key)?.clip || null;
    }

    /**
     * This function should never return empty, unless somebody played with the randomizer and outputs numbers that are outside the list range.
     *
     * @returns Returns a random clip as a string found in the list
     */
    private randomClip(): string {
        // Get a random number between 0 and the amount of clip found in the .json file
        let randomClipNumber: number = Math.floor(Math.random() * memes.length);

        // Output the random clip
        return this.memes[randomClipNumber].clip;
    }
}