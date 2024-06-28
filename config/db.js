import {MongoClient} from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
const uri = process.env.MONGODB_URI;
let db;
const connectDb=async()=>{
    if(db) return db;
    try {
        const client=new MongoClient(uri);
        await client.connect();
        db=client.db(process.env.DB_NAME);
        console.log("Mongodb connected!");
        // console.log(db);
        return db;
    } catch (error) {
        console.log(error.message);
    }
}
export default connectDb;