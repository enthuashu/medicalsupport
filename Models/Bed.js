const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    "No of Beds": Number,
    "Ward Type": String,
    "Bed Size": String,
    "ICU Facility": String,
    "Current status": String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("bed", userSchema);
