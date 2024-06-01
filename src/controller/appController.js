import UserData from "../db/model/user.js";
import bcrypt from "bcryptjs";
import otpGenerator from "otp-generator";

//middleware for veerify the user...
export async function verifyUser(req, res, next) {
  try {
    const { username } = req.method == "GET" ? req.query : req.body;

    //check the user existence...
    const userDetail = await UserData.findOne({ username });
    // console.log(userDetail);
    if (!userDetail)
      return req.status(404).send({ error: "Can't find user..." });
    next();
  } catch (error) {
    return res.status(404).send({ error: "Authentication error..." });
  }
} // this function means if user exists in the db only then we move to check the password using post method...

//    ########################## POST #######################

// POST : http://localhost:8000/api/register
// @param :{
//     "username" : "example123",
//     "password" : "admin123@",
//     "email" : "test1@gmail.com",
//     "firstname" : "akash",
//     "lastname" : "singh",
//     "mobile" :"9999888666",
//     "address":" H block sangam vihar ",
//     "profile" : ""

// }

export async function register(req, res) {
  try {
    const { username, password, email, profile } = req.body;

    const usernameExists = await UserData.findOne({ username });
    const emailExists = await UserData.findOne({ email });

    if (!usernameExists && !emailExists) {
      const data = new UserData({
        username,
        password,
        email,
        profile: profile || "",
      });

      const registered = await data.save();

      res.status(201).send({ msg: "User Registered Successfully.." });
    } else {
      if (usernameExists) {
        res.status(406).send({ msg: "please provide unique Username " });
      } else {
        res.status(406).send({ msg: "This email already Exists" });
      }
    }
    // ##################### WITH PROMISE ##################

    // // <!--  CHECK THE EXISTING USERNAME -->

    // const existUsername = new Promise((resolve, reject) => {
    //   UserData.findOne({ username }, function (err, user) {
    //     if (err) reject(new Error(err));
    //     if (user) reject({ error: "please use unique Username." });

    //     resolve(); // if username is empty means no exists that username then resolve promise.
    //   });
    // });

    // // <!--  CHECK THE EXISTING EMAIL -->
    // const existEmail = new Promise((resolve, reject) => {
    //   UserData.findOne({ email }, function (err, email) {
    //     if (err) reject(new Error(err));
    //     if (email) reject({ error: "please use unique Email." });

    //     resolve(); // if email is empty means no exists that email then resolve promise.
    //   });
    // });

    // Promise.all([existUsername, existEmail])
    //   .then(() => {
    //     if (password) {
    //       bcrypt
    //         .hash(password, 10)
    //         .then((hashedPassword) => {
    //           const data = new UserData({
    //             username,
    //             password: hashedPassword,
    //             email,
    //             profile: profile || "",
    //           });

    //           data
    //             .save()
    //             .then(() => {
    //               res.status(201).send({ msg: "User Registerd successfully." });
    //             })
    //             .catch((e) => res.status(500).send(`error is ${e}`));
    //         })
    //         .catch((err) => {
    //           res.status(500).send({ error: "Enable to hash password." });
    //         });
    //     }
    //   })
    //   .catch((err) => {
    //     res.status(402).send(`promise fail ${err}`);
    //   });
    // ############## DONE ##############
  } catch (error) {
    res.status(500).send(error);
  }
}

// POST : http://localhost:8000/api/login
// @param :{
//     "username" : "example123",
//     "password" : "admin123@",
// }
export async function login(req, res) {
  try {
    const { username, password } = req.body;

    const userDetail = await UserData.findOne({ username });
    const isMatch = await bcrypt.compare(password, userDetail.password);
    if (isMatch) {
      //generating token//
      const token = await userDetail.generateToken(); //middleware
      res.status(201).send({ msg: "Login Successfully..", token });
    } else {
      res.status(401).send({ msg: "Wrong Password..." });
    }
  } catch (error) {
    res.status(401).send({ msg: "Invalid login details...", error: error });
  }
}

//    ########################## GET #######################

// GET : http://localhost:8000/api/user/example123
export async function getUser(req, res) {
  const { username } = req.params;
  // console.log(`username is ${username}`);
  try {
    if (!username) return res.status(501).send({ error: "Invalid username" });

    const user = await UserData.findOne({ username });
    // console.log(`user is ${user}`);

    if (!user) {
      return res.status(501).send({ error: "Couldn't Find the User..." });
    }
    //remove password from uses and also remve the unneccessary data that return by mongoose using Object to convert it into JSON
    const { password, ...rest } = Object.assign({}, user.toJSON());
    // const { password, ...rest } = user;
    // console.log(`rest is ${rest}`);
    // console.log(user);
    res.status(201).send(rest);
  } catch (error) {
    // console.log(`err is ${error}`);
    res.status(404).send({ Error: "Cannot find Data.." });
  }
}

// GET : http://localhost:8000/api/generateOTP
export async function generateOTP(req, res) {
  req.app.locals.OTP = await otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  res.status(201).send({ code: req.app.locals.OTP });
}

// GET : http://localhost:8000/api/verifyOTP
export async function verifyOTP(req, res) {
  const { code } = req.query;
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null; //reset the OTP
    req.app.locals.resetSession = true; // starting the reset session...
    return res.status(201).send("Verify Successfully...");
  } else {
    return res.status(400).send({ error: "Invalid OTP." });
  }
}

//  REDIRECT USER WHEN OTP IS VALID.....
// GET : http://localhost:8000/api/createResetSession
export async function createResetSession(req, res) {
  if (req.app.locals.resetSession) {
    return res.status(201).send({ flag: req.app.locals.resetSession });
  } else {
    return res.status(440).send({ error: "Session Expired ..." });
  }
}

//    ########################## PUT #######################
// PUT : http://localhost:8000/api/updateuser
// @param :{
//     "id":"userid"
// }
// body:{
//     firstname:"",
//     address :"",
//     profile :"",
// }
export async function updateuser(req, res) {
  try {
    const _id = req.decodedUserId; //fetched id while authentication ..from auth.js

    if (_id) {
      const body = req.body;
      const result = await UserData.updateOne({ _id: _id }, body);
      res.status(201).send({ msg: "Record Updated..." });
    } else {
      return res.status(401).send({ error: "User Not Found... !" });
    }
  } catch (error) {
    res.status(401).send({ error });
  }
}

// PUT : http://localhost:8000/api/resetpassword
// @param :{
//     "id":"userid"
// }
// body:{
//     password:"",
// }
export async function resetpassword(req, res) {
  try {
    if (!req.app.locals.resetSession) {
      //if reset session is not open then
      return res.status(440).send({ error: "Session Expired ..." });
    }
    const { username, password } = req.body;

    try {
      const exists = await UserData.findOne({ username });
      if (exists) {
        const result = await UserData.updateOne(
          { username: exists.username },
          { password: password }
        );
        req.app.locals.resetSession = false;
        return res
          .status(201)
          .send({ msg: "Password Updated Successsfully..." });
      } else {
        return res.status(401).send({ error: "Username not Found..." });
      }
    } catch (error) {
      return res.status(401).send({ error });
    }
  } catch (error) {
    // console.log(error);
    return res.status(401).send({ error });
  }
}
