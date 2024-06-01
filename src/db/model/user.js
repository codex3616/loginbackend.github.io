import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ENV from "../../config.js";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide unique Username."],
    unique: [true, "Username already exists."],
  },
  password: {
    type: String,
    required: [true, "Please provide a password."],
    unique: false,
  },
  email: {
    type: String,
    required: [true, "Please provide a email."],
    unique: true,
  },
  firstname: { type: String },
  lastname: { type: String },
  mobile: { type: String },
  address: { type: String },
  profile: { type: String },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

//generation tokens and storing in db using methods as dealing with instance...

userSchema.methods.generateToken = async function () {
  try {
    const token = jwt.sign(
      { _id: this._id.toString(), username: this.username },
      ENV.SECRET_KEY,
      {
        expiresIn: "2h",
      }
    );

    this.tokens = this.tokens.concat({ token: token }); // storing token in db
    await this.save();
    return token;
  } catch (error) {
    res.send(error, "can't generate token");
  }
};

//  ########## HASHING THE PASSWORD BEFORE STORE IN DB #########
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// creating model ...
const UserData =
  mongoose.model.UserDatas || mongoose.model("UserData", userSchema);
export default UserData;
