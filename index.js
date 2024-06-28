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

