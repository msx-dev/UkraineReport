const mongoose = require("mongoose");

const PinSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  type: {
    type: String,
    require: true,
  },
  number: {
    type: Number,
    require: true,
  },
  lat: {
    type: Number,
    require: true,
  },
  long: {
    type: Number,
    require: true,
  },
  expireAt: {
    type: Date,
    default: Date.now,
    index: { expires: "259200" },
  },
});

module.exports = mongoose.model("Pin", PinSchema);
