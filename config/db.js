// import { MongoClient } from 'mongodb';
// import dotenv from 'dotenv';

// dotenv.config();

// const uri = process.env.MONGODB_URI;
// let db;

// const connectDb = async () => {
//   if (db) return db;
  
//   try {
//     const client = new MongoClient(uri, {
//       serverSelectionTimeoutMS: 30000,
//     });

//     await client.connect();
//     db = client.db(process.env.DB_NAME);
//     console.log("MongoDB connected!");
    
//     return db;
//   } catch (error) {
//     console.error("Failed to connect to MongoDB:", error.message);
//   }
// };

// export default connectDb;


import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_DB_URL}/${process.env.DB_NAME}`
    );
    console.log(
      `\n MongoDB Connected !! DB HOST : ${connectionInstance.connection.host} \n`,
      // `MongoDB Connected !!`
    );
  } catch (error) {
    console.log("MONGO_DB CONNECTION ERROR ", error);
    process.exit(1);
  }
};

export default connectDb;