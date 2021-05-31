import { injectable } from 'inversify';
import Service from "../service";
import { Meme } from "../../models/meme";
import { MongoError } from "mongodb";

@injectable()
export class MemeService extends Service {
    /**
     * The collection that we want our data from.
     * @var {string}
     */
    protected collection: string = 'meme';

    /**
     * Get all the database registered meme.
     *
     * @param filters - This is optional, filter our data or the memes in the database.
     * @param limit
     * @param skip
     * @return {Promise<Meme[]>}
     */
    public getMemes(filters: Object = {}, limit: number = 0, skip: number = 0): Promise<Meme[]> {
        return new Promise<Meme[]>((resolve, _reject) => {
            this.find(filters).limit(limit).skip(skip).toArray( (_error, data: Meme[]) => {
                resolve(data);
            });
        });
    }

    /**
     * Get a meme by it id.
     * @param id - Id of the meme that we want to look for.
     * @return {Promise<Meme>}
     */
    public getMeme(id: string): Promise<Meme> {
        return new Promise<Meme>((resolve, _reject) => {
            this.findOneById(id, (_error, data: Meme) => {
                resolve(data);
            });
        });
    }

    /**
     * Returns a single value from the database that matches the given key.
     * @param key - The key of the clip, usually this will be the command related key, to identify a playable clip.
     * @return {Promise<Meme>}
     */
    public getMemeByKey(key: string): Promise<Meme> {
        return new Promise<Meme>((resolve, _reject) => {
            this.findOne({key: key}).toArray( (_error: MongoError, data: Meme[]) => {
                resolve(data[0]);
            });
        });
    }

    /**
     * Save a meme in the db table meme.
     * @param meme - A new meme object that we will save in the data base.
     * @return {Promise<Meme>}
     */
    public createMeme(meme: Meme): Promise<Meme> {
        return new Promise<Meme>((resolve, _reject) => {
            this.insert(meme, (_error, data: Meme) => {
                resolve(data);
            });
        });
    }

    /**
     * Update a meme.
     * @param id - The id of the meme that we want to update.
     * @param meme - The update meme object that we will use to update the meme  for the given id.
     * @return {Promise<Meme>}
     */
    public updateMeme(id: string, meme: Meme): Promise<Meme> {
        return new Promise<Meme>((resolve, _reject) => {
            this.update(id, meme, (_error, data: Meme) => {
                resolve(data);
            });
        });
    }

    /**
     * Delete a meme.
     * @param id - The meme id that we want to delete.
     * @return {Promise<any>}
     */
    public deleteMeme(id: string): Promise<any> {
        return new Promise<any>((resolve, _reject) => {
            this.remove(id, (_error, data: any) => {
                resolve(data);
            });
        });
    }
}