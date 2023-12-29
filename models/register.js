const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  password: {
    type: String,
  },
  otp: {
    type: String,
  },
  expiry: {
    type: String,
  },
});

const userReg = new mongoose.model("users", userSchema);

module.export = userReg;
