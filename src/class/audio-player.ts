import { injectable } from "inversify";
import { Readable } from "stream";
import { AudioClip } from "../interfaces";
import youtubePlayer, { videoInfo } from "ytdl-core";
import { Message, StreamDispatcher, VoiceConnection } from "discord.js";

@injectable()
export class AudioPlayer {
    /**
     * The audio clip that will be returned, to play.
     *
     * @var AudioClip|null
     */
    private currentAudioClip: AudioClip|null;

    /**
     * This is the audio clip list that we can use as a Jukebox.
     *
     * @var Array<AudioClip>|null
     */
    private listAudioClip: Array<string>;

    /**
     * Defines if the juke box is currently playing a song
     *
     * @var Boolean
     */
    public isPlaying: boolean;

    /**
     * Setup the audio clip
     */
    constructor() {
        this.currentAudioClip = null;
        this.isPlaying = false;
        this.listAudioClip = [];
    }

    /**
     * We process the given url and transform it into a AudioClip that we can check if the audio is valid before making the bot join.
     *
     * @param audioUrl - The audio url that we want to process
     *
     * @returns {Promise<AudioClip>}
     */
    public async processAudioUrl(audioUrl: string): Promise<AudioClip> {
        try {
            // The audio information
            let audioBasicInfo: videoInfo,
                audioClip: AudioClip;

            // Get the audio information from the api
            audioBasicInfo = await youtubePlayer.getInfo(audioUrl);

            if (audioBasicInfo && audioBasicInfo.player_response.playabilityStatus.status) {
                audioClip = {
                    audioTitle: audioBasicInfo.player_response.videoDetails.title,
                    audioUrl: audioUrl,
                    audioClip: youtubePlayer.downloadFromInfo(audioBasicInfo, {filter: "audioonly", quality: "highestaudio"})
                };

                audioClip.audioClip.on('error', function (_err: any) {
                    return Promise.reject('The audio URL is not valid or doesn\'t exists.');
                });

                this.currentAudioClip = audioClip;

                return Promise.resolve(audioClip);
            }

            return Promise.reject('The audio URL is not valid or doesn\'t exists.')
        } catch (err) {
            return Promise.reject('The audio URL is not valid or doesn\'t exists.')
        }
    }

    /**
     * We get the audioTitle from the audioClip.
     *
     * @returns {string|null}
     */
    public getAudioTitle(): string | null {
        return this.currentAudioClip?.audioTitle || null;
    }

    /**
     * Get the audioClip
     *
     * @returns {Readable|null}
     */
    public getAudioClip(): Readable | null {
        return this.currentAudioClip?.audioClip || null;
    }

    /**
     * Get the AudioClips in the list
     * 
     * @returns {Array<AudioClip>|null}
     */
    public getAudioClipList(): Array<string> | null {
        return this.listAudioClip;
    }

    /**
     * This will make the bot join the user channel
     *
     * @param message - The message sent by the user, that we will use to redirect our bot to the user channel
     * @param clipUrl - The clip that we want to play
     */
    public playAudio(message: Message, clipUrl: string) {
        this.processAudioUrl(clipUrl).then((audioClip: AudioClip) => {
            if (audioClip.audioTitle) {
                message.member.voiceChannel.join().then((connection: VoiceConnection) => {
                    this.isPlaying = true;

                    // The dispatcher that will play the audio and close the connection when it done
                    let dispatcher: StreamDispatcher;

                    // Do nothing with the .then, it only useful to suppress the ts lint. Displays the current audio title.
                    message.reply(`Now playing : ${audioClip.audioTitle}`).then();

                    // Keep the connection in a dispatcher to know when the bot is done outputting stream
                    dispatcher = connection.playStream(audioClip.audioClip, {volume: 0.25});

                    // Look into the list for the next audio to play
                    this.dispatchNextAudio(message, dispatcher);
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

    /**
     * When the bot is done singing a video it sets the status to currently playing at false and will play the next url in the list
     *
     * @param message - We will use this to play audio if the list is not empty
     * @param dispatcher - We listen to the play stream dispatcher on end we go and fetch the next audio in the list
     */
    public dispatchNextAudio(message: Message, dispatcher: StreamDispatcher) {
        dispatcher.stream.once("end", () => {
            // Set the jukebox is currently playing to false
            this.isPlaying = false;

            // Get the next video to play from the list
            let nextAudio = this.listAudioClip.pop();

            // If the nextAudio is not undefined or empty play it
            if (nextAudio) {
                this.playAudio(message, nextAudio);
            }

            // Destroy the stream/dispatcher, so we do not use ressource for nothing
            dispatcher.stream.destroy();
        });
    }

    /**
     * Adds a url or a youtube clip to the list and will try to play it, it is the jukebox q:list
     *
     * @param audioClip - It is the url that we want to add to the list
     */
    public addAudioToList(audioClip: string) {
        if (audioClip) {
            this.listAudioClip.push(audioClip);
        }
    }
}