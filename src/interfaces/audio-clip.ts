import { Readable } from "stream";

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
    audio: Readable,

    /**
     * Contains the timestamp of the video.
     */
    duration: string,
}