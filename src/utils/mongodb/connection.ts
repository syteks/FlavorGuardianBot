import { Db, MongoClient } from 'mongodb';

const database = process.env.MONGO_DATABASE;

const buildConnectionStr = () => {
    return `mongodb://memory:${process.env.MONGO_DATABASE_PORT}`;
}

export class MongoDBConnection {
    private static isConnected: boolean = false;
    private static db: Db;

    public static getConnection(result: (connection: any) => void) {
        if (this.isConnected) {
            return result(this.db);
        } else {
            this.connect((_error, _db: Db) => {
                return result(this.db);
            });
        }
    }

    private static connect(result: (error: any, db: Db) => void) {
        MongoClient.connect(buildConnectionStr(), { useUnifiedTopology: true }, (err, client) => {
            this.db = client.db(database);
            this.isConnected = true;
            return result(err, this.db);
        });
    }
}