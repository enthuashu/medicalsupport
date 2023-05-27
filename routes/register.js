const router = require("express").Router();
const USER_MODEL = require("../Models/User");
const BED_MODEL = require("../Models/Bed");
const BLOOD_MODEL = require("../Models/Blood");
const MEDICINE_MODEL = require("../Models/Medicine");
const OXYGEN_MODEL = require("../Models/Oxygen");
const CHAT_ROOM = require("../Models/ChatRoom");
const { encryptPassword, verifyPassword } = require("../utils/passwordUtil");
const { signJWT, setCookie, clearCookie } = require("../utils/tokenUtil");
const passport = require("passport");
const Messages = require("../Models/Messages");
const accountSid = "AC765019efba0756abd6504a605814b2ec";
const authToken = "04c476a66c6f8a4adce320480f428144";
const client = require("twilio")(accountSid, authToken);

router.post("/register", async (req, res) => {
  try {
    const userExist = await USER_MODEL.findOne({ email: req.body.email });
    if (userExist) {
      return res
        .status(400)
        .json({ success: false, error: "Email already exists" });
    }

    const user = new USER_MODEL(req.body);
    user.password = await encryptPassword(req.body.password);
    const saved = await user.save();
    if (user.type === "doctor") {
      const oldusers = await USER_MODEL.find({ type: "patient" });
      for (const s of oldusers) {
        const room = new CHAT_ROOM({ doctor: saved._id, patient: s._id });
        await room.save();
      }
    } else if (user.type === "patient") {
      const oldusers = await USER_MODEL.find({ type: "doctor" });
      for (const s of oldusers) {
        const room = new CHAT_ROOM({ doctor: s._id, patient: saved._id });
        await room.save();
      }
    }
    return res
      .status(201)
      .json({ success: true, message: "User Registerd Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/signin", async (req, res) => {
  try {
    let token;
    const { email, password } = req.body;

    const userlogin = await USER_MODEL.findOne({ email });
    if (userlogin) {
      // Decrypt
      const isPasswordMatch = await verifyPassword(
        password,
        userlogin.password
      );

      if (!isPasswordMatch) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid password" });
      } else {
        const payloaduser = {
          id: userlogin._id,
          name: userlogin.name,
        };
        const token = await signJWT(payloaduser);
        setCookie(res, token);
        return res
          .status(201)
          .json({ success: true, message: "User Signedin Successfully" });
      }
    } else {
      res.status(400).json({ error: "User not found" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

router.get(
  "/private",
  passport.authenticate("user", { session: false }),
  async (req, res) => {
    try {
      return res.json({ success: true, message: "Heelo From private" });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
);
router.get(
  "/current",
  passport.authenticate("user", {
    session: false,
  }),
  async (req, res) => {
    try {
      const profile = await USER_MODEL.findById(req.user.id, { password: 0 });
      res.status(200).json(profile);
    } catch {
      res.status(400).json({
        success: false,
      });
    }
  }
);

router.post(
  "/Bed",
  passport.authenticate("user", {
    session: false,
  }),
  async (req, res) => {
    try {
      const user = new BED_MODEL(req.body);
      user.id = req.user.id;
      await user.save();
      client.messages
        .create({
          body: `Hello Patient, A Bed has just been vacant in hospital ${req.user.hospital}!`,
          from: "+13158873680",
          to: `+918957885798`,
        })
        .then((message) => console.log(message.sid));
      return res
        .status(201)
        .json({ success: true, message: "Data updated Successfully" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }
);
router.post(
  "/Oxygen",
  passport.authenticate("user", {
    session: false,
  }),
  async (req, res) => {
    try {
      const user = new OXYGEN_MODEL(req.body);
      user.id = req.user.id;
      await user.save();
      return res
        .status(201)
        .json({ success: true, message: "Data updated Successfully" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }
);
router.post(
  "/Blood",
  passport.authenticate("user", {
    session: false,
  }),
  async (req, res) => {
    try {
      const user = new BLOOD_MODEL(req.body);
      user.id = req.user.id;
      await user.save();
      return res
        .status(201)
        .json({ success: true, message: "Data updated Successfully" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }
);
router.post(
  "/Medicine",
  passport.authenticate("user", {
    session: false,
  }),
  async (req, res) => {
    try {
      const user = new MEDICINE_MODEL(req.body);
      user.id = req.user.id;
      await user.save();
      return res
        .status(201)
        .json({ success: true, message: "Data updated Successfully" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }
);
router.get(
  "/Bed/:term",
  passport.authenticate("user", {
    session: false,
  }),
  async (req, res) => {
    try {
      if (req.user.type === "patient") {
        const data = await BED_MODEL.find()
          .populate(
            "id",
            "name doctorPic hPic hospital specialization phone haddress"
          )
          .sort({ "No of Beds": -1 });
        return res.json({ success: true, data });
      } else {
        const data = await BED_MODEL.find({ id: req.user.id })
          .populate(
            "id",
            "name doctorPic hPic hospital specialization phone haddress"
          )
          .sort({
            updatedAt: -1,
          });
        return res.json({ success: true, data });
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }
);
router.get(
  "/Oxygen/:term",
  passport.authenticate("user", {
    session: false,
  }),
  async (req, res) => {
    try {
      if (req.user.type === "patient") {
        const data = await OXYGEN_MODEL.find()
          .populate(
            "id",
            "name doctorPic hPic hospital specialization phone haddress"
          )
          .sort({ updatedAt: -1 });
        return res.json({ success: true, data });
      } else {
        const data = await OXYGEN_MODEL.find({ id: req.user.id })
          .populate(
            "id",
            "name doctorPic hPic hospital specialization phone haddress"
          )
          .sort({
            updatedAt: -1,
          });
        return res.json({ success: true, data });
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }
);
router.get(
  "/Blood/:term",
  passport.authenticate("user", {
    session: false,
  }),
  async (req, res) => {
    try {
      if (req.user.type === "patient") {
        const data = await BLOOD_MODEL.find()
          .populate(
            "id",
            "name doctorPic hPic hospital specialization phone haddress"
          )
          .sort({ updatedAt: -1 });
        return res.json({ success: true, data });
      } else {
        const data = await BLOOD_MODEL.find({ id: req.user.id })
          .populate(
            "id",
            "name doctorPic hPic hospital specialization phone haddress"
          )
          .sort({
            updatedAt: -1,
          });
        return res.json({ success: true, data });
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }
);
router.get(
  "/Medicine/:term",
  passport.authenticate("user", {
    session: false,
  }),
  async (req, res) => {
    try {
      if (req.user.type === "patient") {
        const data = await MEDICINE_MODEL.find()
          .populate(
            "id",
            "name doctorPic hPic hospital specialization phone haddress"
          )
          .sort({ updatedAt: -1 });
        return res.json({ success: true, data });
      } else {
        const data = await MEDICINE_MODEL.find({ id: req.user.id })
          .populate(
            "id",
            "name doctorPic hPic hospital specialization phone haddress"
          )
          .sort({
            updatedAt: -1,
          });
        return res.json({ success: true, data });
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }
);

router.get(
  "/getchatrooms",
  passport.authenticate("user", { session: false }),
  async (req, res) => {
    try {
      if (req.user.type === "doctor") {
        const chatrooms = await CHAT_ROOM.find({ doctor: req.user.id })
          .populate("patient", "type name pPic disease")
          .sort({ createdAt: -1 });
        return res.json({ success: true, chatrooms });
      } else if (req.user.type === "patient") {
        const chatrooms = await CHAT_ROOM.find({ patient: req.user.id })
          .populate("doctor", "type name doctorPic specialization hospital")
          .sort({ createdAt: -1 });
        return res.json({ success: true, chatrooms });
      }
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
);

router.get(
  "/getchat/:chatid",
  passport.authenticate("user", { session: false }),
  async (req, res) => {
    try {
      const messages = await Messages.find({
        connectID: req.params.chatid,
      }).populate("from", "name");
      return res.json({ success: true, data: messages });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
);
router.post(
  "/sendmessage",
  passport.authenticate("user", { session: false }),
  async (req, res) => {
    try {
      const messages = new Messages(req.body);
      await messages.save();
      return res.json({ success: true, data: messages });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
);

router.get(
  "/bookbed/:id",
  passport.authenticate("user", { session: false }),
  async (req, res) => {
    try {
      const bookbed = await BED_MODEL.findById(req.params.id).populate(
        "id",
        "name phone"
      );
      if (bookbed) {
        await BED_MODEL.findByIdAndUpdate(req.params.id, {
          "No of Beds": bookbed["No of Beds"] - 1,
        });
        client.messages
          .create({
            body: `Hello ${bookbed.id.name}, A Bed has been booked by ${req.user.name} in your hospital!`,
            from: "+13158873680",
            to: `+918957885798`,
          })
          .then((message) => console.log(message.sid));

        return res.json({ success: true });
      }
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
);
router.get("/logout", function (req, res) {
  clearCookie(res);
  return res.json({
    success: true,
  });
});

module.exports = router;
