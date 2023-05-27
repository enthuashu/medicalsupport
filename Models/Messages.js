/** @format */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = require("mongodb");

// Create Schema
const MessagesSchema = new Schema(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    connectID: {
      type: Schema.Types.ObjectId,
      ref: "chatrooms",
    },
    message: {
      type: String,
      required: false,
    },

    filelink: {
      type: String,
    },
    filename: {
      type: String,
    },
    type: {
      type: String,
      enum: ["text", "attachment", "image", "video", "meet-link"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("message", MessagesSchema);
