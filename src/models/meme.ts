import { injectable } from 'inversify';
import { Meme as IMeme } from "../interfaces/meme";

@injectable()
export class Meme implements IMeme {
    /**
     * Build the Meme model.
     * @param key - The meme key.
     * @param clip - The meme clip.
     * @param _id - The meme _id.
     */
    constructor(
        public key: string,
        public clip: string,
        public _id?: string
    ) {}
}