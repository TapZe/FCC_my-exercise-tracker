const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
require("dotenv").config();

// ===Middleware===
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("public"));

// ===Connect DB===
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "db_exercise",
});

// ===Try Connection===
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// ===Import Schema and Model===
const User = require("./models/user");
const Exercise = require("./models/exercise");

// ===Routes===
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async (req, res) => {
  try {
    const { username } = req.body;
    const newUser = new User({ username });
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (error) {
    console.error(error);
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().lean();
    res.json(users);
  } catch (error) {
    console.error(error);
  }
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  try {
    const userId = req.params._id;
    const { description, duration, exerciseDate } = req.body;
    const date = exerciseDate ? new Date(exerciseDate) : new Date();

    const user = await User.findById(userId);
    const exercise = new Exercise({ userId, description, duration, date });
    await exercise.save();

    const responseJson = {
      _id: user._id,
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: new Date(exercise.date).toDateString(),
    };
    console.log(responseJson);

    res.json(responseJson);
  } catch (error) {
    console.error(error);
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  try {
    const userId = req.params._id;
    const { from, to, limit } = req.query;

    // Date filter
    let dateFilter = {};
    if (from) {
      dateFilter.$gte = new Date(from);
    }
    if (to) {
      dateFilter.$lte = new Date(to);
    }

    // Construct the query
    let query = { userId };
    if (from || to) {
      query.date = dateFilter;
    }

    const user = await User.findById(userId);
    const exercises = await Exercise.find(query).limit(+limit ?? 500);
    const count = exercises.length;

    const responseJson = {
      username: user.username,
      count: count,
      _id: user._id,
      log: exercises.map((exercise) => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString(),
      })),
    };
    console.log(responseJson);

    res.json(responseJson);
  } catch (error) {
    console.error(error);
  }
});

// ===Listener===
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
