const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    Medicine: String,
    "Preferred for": String,
    "No of Units": String,
    Price: String,
    "Current status": String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("medicine", userSchema);
