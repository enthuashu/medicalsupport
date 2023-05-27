const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("chatroom", userSchema);
