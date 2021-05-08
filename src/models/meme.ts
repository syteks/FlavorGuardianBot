import { injectable } from 'inversify';

export interface IMeme {
    key: string,
    clip: string
}

@injectable()
export class Meme implements IMeme {
    constructor(
        public key: string,
        public clip: string,
        public _id?: string
    ) { }
}