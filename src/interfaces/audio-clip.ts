import { Readable } from "stream";

export default interface AudioClip {
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