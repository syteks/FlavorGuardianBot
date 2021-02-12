import {injectable} from "inversify";
import {Readable} from "stream";
import {AudioClip} from "../interfaces";
import youtubePlayer, {videoInfo} from "ytdl-core";


@injectable()
export class AudioPlayer {
    /**
     * The audio clip that will be returned, to play.
     *
     * @var audioClip
     */
    private audioClip: AudioClip | null;

    /**
     * Setup
     *
     * @param audioUrl
     */
    constructor() {
        this.audioClip = null;
    }

    public async processAudioUrl(audioUrl: string): Promise<AudioClip> {
        try{
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

                this.audioClip = audioClip;

                return Promise.resolve(audioClip);
            } else {
                return Promise.reject('The audio URL is not valid or doesn\'t')
            }
        } catch (err) {
            return Promise.reject('The audio URL is not valid or doesn\'t')
        }
    }

    public getAudioTitle(): string | null {
        return this.audioClip?.audioTitle || null;
    }

    public getAudioClip(): Readable | null {
        return this.audioClip?.audioClip || null;
    }
}