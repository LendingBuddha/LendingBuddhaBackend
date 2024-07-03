import express from "express";
import AuthRoute from "./routes/auth.js";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.static("public"));
app.use(cookieParser()); 


await connectDb()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    app.use("/api/auth", AuthRoute);

    // send hello world
    app.get("/", (req, res) => {
      res.send("Hello, World!");
    });
  })
  .catch((error) => {
    console.log("MongoDb Connection Error");
    console.log(error);
  });
