import { inject, injectable } from 'inversify';
import { MongoDBClient } from '../utils/mongodb/client';
import { Meme } from '../models/meme';
import { TYPES } from '../types';

@injectable()
export class MemeService {
    private mongoClient: MongoDBClient;

    constructor(
        @inject(TYPES.MongoDBClient) mongoClient: MongoDBClient
    ) {
        this.mongoClient = mongoClient;
    }

    public getMemes(): Promise<Meme[]> {
        return new Promise<Meme[]>((resolve, _reject) => {
            this.mongoClient.find('meme', {}, (_error, data: Meme[]) => {
                resolve(data);
            });
        });
    }

    public getMeme(id: string): Promise<Meme> {
        return new Promise<Meme>((resolve, _reject) => {
            this.mongoClient.findOneById('meme', id, (_error, data: Meme) => {
                resolve(data);
            });
        });
    }

    public createMeme(meme: Meme): Promise<Meme> {
        return new Promise<Meme>((resolve, _reject) => {
            this.mongoClient.insert('meme', meme, (_error, data: Meme) => {
                resolve(data);
            });
        });
    }

    public updateMeme(id: string, meme: Meme): Promise<Meme> {
        return new Promise<Meme>((resolve, _reject) => {
            this.mongoClient.update('meme', id, meme, (_error, data: Meme) => {
                resolve(data);
            });
        });
    }

    public deleteMeme(id: string): Promise<any> {
        return new Promise<any>((resolve, _reject) => {
            this.mongoClient.remove('meme', id, (_error, data: any) => {
                resolve(data);
            });
        });
    }
}