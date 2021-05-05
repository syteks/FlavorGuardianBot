import { Message, StreamDispatcher, VoiceConnection } from "discord.js";
import { inject, injectable } from "inversify";
import memes from "../../../storage/audio.json";
import { AudioClip, Meme, CommandObject } from "../../../interfaces";
import { AudioPlayer } from "../../../class/audio-player";
import { TYPES } from "../../../types";
import { MemeService } from "../../meme-service";

@injectable()
export class Memes implements CommandObject {
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
     * Contains the database service that we will use in order to apply CRUD logic to our memes.
     *
     * @private MemeService
     */
    private memeService: MemeService;

    /**
     * Initialize the command class, that will process your mom before outputing it into a soundtrack, sike she was too fat to process!
     *
     * @param memeService - This is the bot DB service
     * @param audioPlayer - This is the bot jukebox, used to process the url's and contains an array of our audio playlist.
     */
    constructor(
        @inject(TYPES.MemeService) memeService: MemeService,
        @inject(TYPES.AudioPlayer) audioPlayer: AudioPlayer
    ) {
        this.memeService = memeService;
        this.audioPlayer = audioPlayer;
        this.memes = memes;
    }

    /**
     * This will find the clip that we want to play for the user.
     * If it doesn't find the given clip name in the list, it will warn the user.
     *
     * @param message - The Message of the user
     * @param commandParameters - A string that contains the parameters to the command
     * @returns {Promise<Message | Message[]>}
     */
    public action(message: Message, commandParameters: string | string[]): Promise<Message | Message[]> {
        // Make sure the user is in a channel.
        if (!message.member.voiceChannel) {
            return message.reply("You must be in a channel.");
        }

        // This is where the clip will be played.
        if (!message.guild.voiceConnection) {
            return this.playMeme(message, commandParameters);
        }

        return Promise.resolve(message);
    }

    /**
     * This function will return the clip associated with the given meme name.
     * If the clip is not found in the list, returns empty string.
     *
     * @param key - A string
     *
     * @returns {Promise<string | null>}
     */
    public findClip(key: string): Promise<string|null> {
        return this.memeService.getMemeByKey(key).then((dbMeme: Meme) => {
           if (!dbMeme) {
               return this.memes.find(meme => meme.key === key)?.clip || null;
           }

           return dbMeme.clip;
        });
    }

    /**
     * This function will find the wanted clip and returns it.
     *
     * @param params - This will contain our meme key, that we can use to retrieve the url.
     *
     * @returns {Promise<string>}
     */
    private getClipByParams(params: string | string[]): Promise<string> {
        return this.findClip(params[0] || '').then((clipUrl: string|null) => {
            // If we didn't find the clip in the database, process the param.
            if (!clipUrl) {
                if (!Array.isArray(params)) {
                    clipUrl = params;
                } else if (params.length === 0) {
                    clipUrl = this.randomClip();
                }
            }

            return clipUrl || '';
        });
    }

    /**
     * This function should never return empty, unless somebody played with the randomizer and outputs numbers that are outside the list range.
     *
     * @returns {string}
     */
    private randomClip(): string {
        // We should include the clips in the database + we should import them when we create the docker container.
        let randomClipNumber: number = Math.floor(Math.random() * memes.length);

        // Output the random clip.
        return this.memes[randomClipNumber].clip;
    }

    /**
     *
     * @param message - The user sent message
     * @param params - The parameters sent with the user message
     * @private {Promise<Message | Message[]>}
     */
    private playMeme(message: Message, params: string | string[]): Promise<Message | Message[]> {
        return this.getClipByParams(params).then((clipUrl: string) => {
            // Make sure the clip is found.
            if (!clipUrl) {
                return message.reply("The given clip was not found.");
            }

            // Checks the validity of the url and the content, before making the bot join the channel.
            this.audioPlayer.processAudioUrl(clipUrl).then((audioClip: AudioClip) => {
                if (audioClip.audioTitle) {
                    message.member.voiceChannel.join().then((connection: VoiceConnection) => {
                        // The dispatcher that will play the audio and close the connection when it done.
                        let dispatcher: StreamDispatcher;

                        // Do nothing with the .then, it only useful to suppress the ts lint. Displays the current audio title.
                        message.reply(`Now playing : ${audioClip.audioTitle}`).then();

                        // Keep the connection in a dispatcher to know when the bot is done outputting stream.
                        dispatcher = connection.playStream(audioClip.audioClip, {volume: 0.25});

                        // When the audio is done playing we want to disconnect the bot.
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

            return Promise.resolve(message);
        });
    }
}