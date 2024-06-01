import express from "express";
import morgan from "morgan";
import cors from "cors";
import connectDB from "./db/conn.js";
// import connect from "./db/conn.js";
import router from "./routers/router.js";
const app = express();
const port = process.env.PORT || 8000;
import dotenv from "dotenv";
connectDB();
dotenv.config();

// ######## MIDDLEWARE ############

app.use(express.json());
// app.use()
app.use(cors());
app.use(morgan("tiny"));
app.disable("x-powered-by"); // LESS HACKERS KNOW ABOUT OUR STACK

// HTTP REQUEST...
app.get("/", (req, res) => {
  res.status(201).send("home page of express...");
});

// ############## API ROUTES ########
app.use("/api", router); // also define endpoints for api

app.listen(port, () => {
  console.log(`Server connected to http:localhost:${port}`);
});
// ############## IF CONNECTED TO DB THEN ONLY LISTEN ON PORT
// connect()
//   .then(() => {
//     try {
//       app.listen(port, () => {
//         console.log(`Server connected to http:localhost:${port}`);
//       });
//     } catch (error) {
//       console.log("Connot connect to the server.. ");
//     }
//   })
//   .catch((err) => {
//     console.log(`Db not connected as ${err}`);
//   });
