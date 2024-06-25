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
import  auth from './routes/auth.js';
const app = express();
app.use(express.json());
// send hello world
app.use("/api/auth",auth);
const PORT = process.env.PORT || 3000;
 app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

