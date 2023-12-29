require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const util = require("util");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
const nodemailer = require("nodemailer");
const Docker = require("dockerode");
require("./database/conn.js");

const app = express();
const docker = new Docker();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function generateOTP(length) {
  const chars = "0123456789";
  let otp = "";

  for (let i = 0; i < length; i++) {
    otp += chars[Math.floor(Math.random() * chars.length)];
  }
  return otp;
}

async function sendEmailWithOTP(email, otp) {
  // Create a Nodemailer transporter
  // pass: 't@Ki{*W@8aE(=rorTcXf2FK)C5&H]8'
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "cpp.online.compiler@gmail.com",
      pass: process.env.password,
    },
  });

  // Define email options
  const mailOptions = {
    from: "cpp.online.compiler@gmail.com",
    to: email,
    subject: "OTP for Verification",
    text: `Your OTP for verification is: ${otp}`,
  };

  // Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

const client = new MongoClient(process.env.DB, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = client.db();
    const usersCollection = db.collection("users");
    const otpCollection = db.collection("otp");

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const generatedOtp = generateOTP(6);
    const otpExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    const existingUserotp = await otpCollection.findOne({ email });
    if (existingUserotp) {
      await otpCollection.deleteMany({ email });
    }
    await otpCollection.insertOne({
      email,
      otp: generatedOtp,
      expiry: otpExpiry,
    });

    await sendEmailWithOTP(email, generatedOtp);

    res.json({
      message: "OTP sent successfully. Please verify your email address.",
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
});

app.post("/verify-otp", async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    const db = client.db(); // Access the database from the connected client
    const otpCollection = db.collection("otp");
    const usersCollection = db.collection("users");

    // Check if OTP exists and is within 30 minutes
    const otpRecord = await otpCollection.findOne({
      email,
      otp,
      expiry: { $gt: new Date() },
    });
    if (!otpRecord) {
      await otpCollection.deleteMany({ email });
      return res.status(400).json({ message: "Invalid OTP or OTP expired" });
    }

    // Hash the password using bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Store user data in the database
    const user = {
      email,
      passwordHash,
    };

    await usersCollection.insertOne(user);

    // Delete OTP record from the collection
    await otpCollection.deleteMany({ email });

    res.json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const db = client.db(); // Access the database from the connected client
    const usersCollection = db.collection("users");

    // Find user by email
    const user = await usersCollection.findOne({ email });
    console.log(
      password,
      user.passwordHash,
      bcrypt.compare(password, user.passwordHash)
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // compare passwords using bcrypt
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    console.log("Password matched");

    jwt.sign(
      { id: user._id, email: user.email },
      process.env.SECRET_KEY,
      {
        algorithm: "HS512",
      },
      (err, token) => {
        if (err) {
          console.error("Error signing JWT token:", err);
          return res.status(500).json({ message: "Error logging in" });
        }

        // console.log(`Token is ${token}`);
        res.json({ token });
      }
    );
    // const tokener = async function () {
    //   try {
    //     const token = jwt.sign(
    //       { _id: this._id.toString() },
    //       process.env.secretKey
    //     );
    //     this.tokens = this.tokens.concat({ token: token });
    //     await this.save();
    //     return token;
    //   } catch (e) {
    //     res.send("error in signing jwt ", e);
    //   }
    // };
    // const token = await tokener();
    // console.log(`token is ${token}`);
    // res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
});

function verifyToken(req, res, next) {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(403).json({ message: "Please Sign in" }); // 'Unauthorized: Token missing'
  }
  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.SECRET_KEY,
      {
        algorithms: ["HS512"],
      }
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Please Sign in" });
  }
}

app.get("/protected", verifyToken, (req, res) => {
  console.log("user is ", req.user);
  res.json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

app.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

app.use(express.static(path.join(__dirname, "public")));

app.post("/compile", verifyToken, async (req, res) => {
  const { code, input } = req.body;
  // console.log(code);
  const codePath = path.join(process.cwd(), "temp.cpp");
  // console.log(`codePath: ${codePath}`);
  // Write the C++ code to a file
  fs.writeFileSync(codePath, code);

  try {
    // const compileCommand = `docker run --rm -v "${__dirname}":/app -w /app gcc:latest g++ -DONLINE_JUDGE -std=c++20 -o temp_exec temp.cpp`;
    const compileCommand = `docker run --rm -v "%cd%:/app" -w /app gcc:latest g++ -DONLINE_JUDGE -std=c++20 -o temp_exec temp.cpp`;
    await util.promisify(exec)(compileCommand);

    // const executionCommand = `docker run --rm -v "${__dirname}":/app -w /app --ulimit cpu=30 -m 1024M gcc:latest bash -c 'echo "${input}" | ./temp_exec'`;
    const executionCommand = `docker run --rm -v "%cd%:/app" -w /app --ulimit cpu=30 -m 1024M ./temp_exec < "${input}"`;
    const { stdout, stderr } = await util.promisify(exec)(executionCommand);
    // docker run -it --rm --name my-running-script -v "%cd%":/usr/src/myapp -w /usr/src/myapp python:2 python test.py
    // Clean up files
    fs.unlinkSync(codePath);
    fs.unlinkSync(path.join(process.cwd(), "temp_exec"));

    if (stdout) {
      res.send(stdout);
    } else {
      res.send("No output.");
    }
  } catch (error) {
    res.status(500).send(error.stderr || error.stdout || "Error running file");
  } finally {
    try {
      // Clean up files even in case of an error
      fs.unlinkSync(codePath);
      fs.unlinkSync(path.join(process.cwd(), "temp_exec"));
    } catch (error) {
      // to handle any potential error while deleting temp_exec (e.g., if it doesn't exist)
      // and here do nothing
    }
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
