// const http = require('http');

// const hostname = '127.0.0.1';
// const port = 8080;

// const server = http.createServer((req, res) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     res.end('Hello, World!\n');
// });

// server.listen(port, hostname, () => {
//     console.log(`Server running at http://${hostname}:${port}/`);
// });

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
