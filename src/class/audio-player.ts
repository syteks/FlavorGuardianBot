import {injectable} from "inversify";
import {Readable} from "stream";
import {AudioClip} from "../interfaces";
import youtubePlayer, {videoInfo} from "ytdl-core";

@injectable()
export class AudioPlayer {
    private static instance: AudioPlayer;
    /**
     * The audio clip that will be returned, to play.
     *
     * @var AudioClip|null
     */
    private currentAudioClip: AudioClip | null;

    /**
     * This is the audio clip q that we can add a audio clip too.
     *
     * @var Array<AudioClip>|null
     */
    private listAudioClip: Array<AudioClip> | null;

    /**
     * Setup the audio clip
     */
    constructor() {
        this.currentAudioClip = null;
        this.listAudioClip = null;
    }

    /**
     * This is the class function to get the class.
     * Since the class is a singleton we want
     *
     * @returns AudioPlayer
     */
    public static getAudioPlayer(): AudioPlayer {
        if (!AudioPlayer.instance) {
            AudioPlayer.instance = new AudioPlayer();
        }

        return AudioPlayer.instance;
    }

    /**
     * We process the given url and transform it into a AudioClip that we can
     *
     * @param {string} audioUrl
     *
     * @returns {Promise<AudioClip>}
     */
    public async processAudioUrl(audioUrl: string): Promise<AudioClip> {
        try {
            let audioBasicInfo: videoInfo,
            audioClip: AudioClip;
            audioBasicInfo = await youtubePlayer.getInfo(audioUrl);

            if (audioBasicInfo && audioBasicInfo.player_response.playabilityStatus.status) {
                audioClip = {
                    audioTitle: audioBasicInfo.player_response.videoDetails.title,
                    audioUrl: audioUrl,
                    audioClip: youtubePlayer.downloadFromInfo(audioBasicInfo, {filter: "audioonly", quality: "highestaudio"})
                };

                audioClip.audioClip.on('error', function (_err: any) {
                    return Promise.reject('The audio URL is not valid or doesn\'t');
                });

                this.currentAudioClip = audioClip;

                return Promise.resolve(audioClip);
            } else {
                return Promise.reject('The audio URL is not valid or doesn\'t')
            }
        } catch (err) {
            return Promise.reject('The audio URL is not valid or doesn\'t')
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
     * @returns Array<AudioClip>|null
     */
    public getAudioClipList(): Array<AudioClip> | null {
        return this.listAudioClip;
    }
}