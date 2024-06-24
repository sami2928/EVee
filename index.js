const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const app = express();

app.use(morgan("dev"));
app.use(cors());

// to store data
app.use(express.json({}));
app.use(
  express.json({
    extended: true,
  })
);

// use dotenv files
dotenv.config({
  path: "./config/config.env",
});

connectDB();

app.use("/profile/auth", require("./routes/user"));
app.use("/vehicle", require("./routes/vehicle"));

const PORT = process.env.PORT || 8000;

app.listen(
  PORT,
  console.log(`Server running on port: ${PORT}`.red.underline.bold)
);
