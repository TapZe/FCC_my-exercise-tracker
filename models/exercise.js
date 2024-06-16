const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  description: { type: String, required: true },
  duration: { type: Number, required: true, min: 0 },
  date: { type: Date, required: true },
});
const exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = exercise;
