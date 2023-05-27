const express = require("express");
const connectDb = require("./Connection/Connection");
const app = express();
require("dotenv").config();
const passport = require("passport");
require("./config/passport")(passport);
require("dotenv").config();
const registerRoute = require("./routes/register");

const cookies = require("cookie-parser");
const { socketConnection } = require("./utils/socket");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookies());

app.use("/api/user", registerRoute);
connectDb();

const http = require("http").createServer(app);

const PORT = process.env.PORT || 5000;
const io = require("socket.io")(http, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});
app.use(express.static("client/build"));
app.get("*", (req, res) => {
  res.sendFile(
    path.resolve(__dirname + "/client/build/index.html"),
    function (err) {
      if (err) {
        console.log(err);
      }
    }
  );
});
socketConnection(io);

http.listen(PORT, () => {
  console.log("Server is running at Port ", PORT);
});
