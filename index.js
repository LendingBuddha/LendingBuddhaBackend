import express from "express";
import AuthRoute from "./routes/auth.js";
import ChatSession from "./routes/message.js";
import connectDb from "./config/db.js";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { lenderData } from "./data/lender.js";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
app.use(
  cors({
    origin:[ "*","http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
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
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    app.use("/api/auth", AuthRoute);
    app.use("/chatroom", ChatSession);

    
    app.get("/api/lender/data", async(req,res)=>{
      try {
        const data = lenderData
        res.status(200).json(data)
      }
      catch (error) {
        res.status(500).json({ message: error.message });
        }
    });

    // send hello world
    app.get("/", (req, res) => {
      res.send("Hello, World!");
    });
    io.on("connection", (socket) => {
      console.log("New client connected!");
      socket.on("sendMessage", (message) => {
        io.emit("receiveMessage", message);
      });
      socket.on("disconnect", () => {
        console.log("Client Disconnected!");
      });
    });
  })
  .catch((error) => {
    console.log("MongoDb Connection Error");
    console.log(error);
  });
