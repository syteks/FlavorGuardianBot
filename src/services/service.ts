import { MongoDBClient } from "../utils/mongodb/client";
import { Cursor, MongoError, ObjectID } from "mongodb";

export class Service extends MongoDBClient {
    /**
     * This will keep our cursor so we can use it and chain other filter to our query.
     *
     * @var {Cursor}
     */
    private cursor?: Cursor;

    /**
     * The collection we want to retrieve our data from.
     *
     * @var {string}
     */
    protected collection: string = '';

    /**
     * Find data in the database for a given collection
     *
     * @param filter - Contains our filter object that we will use to filter our database data.
     *
     * @return {Cursor}
     */
    protected find(filter: Object = {}): Cursor {
        // Assign the cursor as our current query for the database.
        this.cursor = this.db.collection(this.collection).find(filter);

        return this.cursor;
    }

    /**
     * Find the data in the database and limit it to one data/one instance.
     *
     * @param filter - Contains our filter object that we will use to filter our database data.
     *
     * @return {Cursor}
     */
    protected findOne(filter: Object = {}): Cursor {
        // Assign the cursor as our current query for the database.
        this.cursor = this.db.collection(this.collection).find(filter).limit(1);

        return this.cursor;
    }

    /**
     * Find all the data from a specified collection.
     *
     * @param objectId - The data id.
     * @param result - The result of our search.
     *
     * @return {void}
     */
    protected findOneById(objectId: string, result: (error: any, data: any) => void) {
        return this.findOne({_id: new ObjectID(objectId)}).toArray((error: MongoError, find) => {
            return result(error, find[0]);
        });
    }

    /**
     * Insert data into a given collection.
     *
     * @param model - The model that we want to insert.
     * @param result - The result of the inserting into the db.
     *
     * @return {void}
     */
    public insert(model: Object, result: (error: any, data: any) => void): void {
        this.db.collection(this.collection).insertOne(model, (error, insert) => {
            return result(error, insert.ops[0]);
        });
    }

    /**
     * Update a specified data for a given collection.
     *
     * @param objectId - The data that we want to update.
     * @param model - The new values to insert for the data.
     * @param result - The result of the update, was it successful.
     *
     * @return {void}
     */
    public update(objectId: string, model: Object, result: (error: any, data: any) => void): void {
        this.db.collection(this.collection).updateOne(
            { _id: new ObjectID(objectId) },
            { $set: model },
            (error, _update) => result(error, model)
        );
    }

    /**
     * Remove a specified data from a collection.
     *
     * @param objectId - The data that we want to remove from the collection.
     * @param result - Result of the removal.
     *
     * @return {void}
     */
    public remove(objectId: string, result: (error: any, data: any) => void): void {
        this.db.collection(this.collection).deleteOne({ _id: new ObjectID(objectId) }, (error, remove) => {
            return result(error, remove);
        });
    }

    /**
     * We set the limit of the data we want to fetch from the database.
     *
     * @param limit - It is a number between 0 to n.
     *
     * @return {void}
     */
    protected limit(limit: number): void {
        this.cursor?.limit(limit);
    }

    /**
     * Skip, will take a offset, index data that we want to skip data from.
     *
     * @param offset - The data offset we want to start fetching our data from.
     *
     * @return {void}
     */
    protected skip(offset: number): void {
        this.cursor?.skip(offset);
    }
}