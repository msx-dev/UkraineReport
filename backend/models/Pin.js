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
  createdAt: { type: Date, expires: 259200, default: Date.now },
});

module.exports = mongoose.model("Pin", PinSchema);
