import jwt from "jsonwebtoken";
// import UserData from "../db/model/user.js";
import ENV from "../config.js";

const auth = async (req, res, next) => {
  try {
    var token = req.headers.authorization.split(" ")[1];
    let decodedToken = await jwt.verify(token, ENV.SECRET_KEY);
    req.decodedUserId = decodedToken._id;
    // console.log(`decoded userid = ${req.decodedUserId}`);
    // res.status(201).send({ msg: "Authenticated successfull..." });
    next();
  } catch (error) {
    console.log(`auth failed... and error is ${error}`);
    res.status(401).send({ error: "Authentication Failed...!" });
  }
};

//genrate local variable for OTP when getOTP called then OTP gonna generated..
export function localVariables(req, res, next) {
  req.app.locals = {
    OTP: null,
    resetSession: false,
  };
  next();
}

export default auth;
