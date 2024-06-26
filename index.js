import express from "express";
import AuthRoute from "./routes/auth.js";
import connectDb from "./config/db.js";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.static("public"));
// app.use(cookieparser()); // We need Cookie-parser package for that


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
