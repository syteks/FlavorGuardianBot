import { Message } from "discord.js";
import { inject, injectable } from "inversify";
import memes from "../../../storage/audio.json";
import { Meme, CommandObject } from "../../../interfaces";
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
        // Make sure the user is in a channel
        if (!message.member.voiceChannel) {
            return message.reply("You must be in a channel.");
        }

        // This is where the clip will be played
        return this.playMeme(message, commandParameters);
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
            // If we didn't find the clip in the database, process the param
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
        // Get a random number between 0 and the amount of clip found in the .json file
        let randomClipNumber: number = Math.floor(Math.random() * memes.length);

        // Output the random clip
        return this.memes[randomClipNumber].clip;
    }

    /**
     * Play the meme audio in the discord channel
     *
     * @param message - The user sent message
     * @param params - The parameters sent with the user message
     * @private {Promise<Message | Message[]>}
     */
    private playMeme(message: Message, params: string | string[]): Promise<Message | Message[]> {
        return this.getClipByParams(params).then((clipUrl: string) => {
            // Make sure the clip is found
            if (!clipUrl) {
                return message.reply("The given clip was not found.");
            }

            // If the bot is already playing, we just add the clip url to the list
            if (this.audioPlayer.isPlaying) {
                this.audioPlayer.addAudioToList(clipUrl);
            } else {
                // Force the jukebox into submission like a lil bitch to play the meme clip
                this.audioPlayer.playAudio(message, clipUrl);
            }

            return Promise.resolve(message);
        });
    }
}