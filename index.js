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
import chatroomRoute from "./routes/chatroomRoute.js"


dotenv.config();
// for development purpose only
const allowedOrigins=["https://master.d3vv5xmzi33jqy.amplifyapp.com"];
const app = express();
app.use(
  cors({
    origin:allowedOrigins ,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});
app.use(
  cors({
    origin: ["https://master.d3vv5xmzi33jqy.amplifyapp.com"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
}); 
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
    app.use('/api', chatroomRoute);

    
    app.get("/api/lender/data", async(req,res)=>{
      try {
        const data = lenderData;
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // send hello world
    app.get("/", (req, res) => {
      res.send("Hello, World!");
    });
    io.on("connection", (socket) => {
      console.log("New client connected!");
      socket.on("join-room", (roomId) => socket.join(roomId));
      socket.on("sendMessage", (message) => {
        io.to(message.members[0])
          .to(message.members[1])
          .emit("receiveMessage", message);
          console.log(message.members)
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
