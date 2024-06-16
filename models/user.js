const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
});
const user = mongoose.model("User", userSchema);

module.exports = user;
