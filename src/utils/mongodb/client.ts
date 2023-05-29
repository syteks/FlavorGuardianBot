import { Db } from 'mongodb';
import { injectable } from 'inversify';
import { MongoDBConnection } from './connection';

@injectable()
export class MongoDBClient {
    /**
     * This is a data base instance to access the database and do action on it.
     * @avr Db
     */
    public db!: Db;

    /**
     * Get the database connection and save it in a variable.
     */
    constructor() {
        MongoDBConnection.getConnection((connection) => {
            this.db = connection;
        });
    }
}