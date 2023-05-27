const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    "Blood Type": String,
    "Blood Units": String,
    "Haemoglobin level": String,
    "White Blood Cell (WBC)": String,
    "Red Blood Cell (RBC)": String,
    "Current status": String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("blood", userSchema);
