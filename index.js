import express from "express";

const app = express();

const PORT = process.env.PORT || 3000;
 app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// send hello world
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/login",(req,res)=>{
    res.send("login page");
})
