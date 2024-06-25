import express from "express";
import AuthRoute from "./routes/auth.js";

const app = express();



app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.static("public"));
// app.use(cookieparser()); // We need Cookie-parser package for that

const PORT = process.env.PORT || 3000;
 app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


app.use("/api/auth",AuthRoute)

// send hello world
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/login",(req,res)=>{
    res.send("login page");
})
