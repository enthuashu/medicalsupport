const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    "No of Cylinders": String,
    "Cylinder Size(in Liters)": String,
    "Oxygen Level": String,
    "Working pressure": String,
    "Current status": String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("oxygen", userSchema);
