import { Router } from "express";
const router = Router();
import * as controller from "../controller/appController.js";
import auth, { localVariables } from "../middleware/auth.js";
import { registerMail } from "../controller/mailer.js";

// ######### HTTP REQUESTS...

// ####### POST #######
router.route("/register").post(controller.register); // TO REGISTER USER
router.route("/registermail").post(registerMail); // TO SEND THE EMAIL
router
  .route("/authenticate")
  .post(controller.verifyUser, (req, res) => res.end()); // TO AUTHENTICATE USER
router.route("/login").post(controller.verifyUser, controller.login); // TO LOGIN USER IN THE APP

// ####### GET #######
router.route("/user/:username").get(controller.getUser); // TO READ USER WITH USERNAME
router
  .route("/generateOTP")
  .get(controller.verifyUser, localVariables, controller.generateOTP); // TO GENERATE OTP
router.route("/verifyOTP").get(controller.verifyUser, controller.verifyOTP); // TO VERIFY GENERATED OTP
router.route("/createResetSession").get(controller.createResetSession); // TO RESET ALL THE VARIABLES

// ####### PUT #######
router.route("/updateuser").put(auth, controller.updateuser); // TO UPDATE THE USER PROFILE
router
  .route("/resetpassword")
  .put(controller.verifyUser, controller.resetpassword); // TO RESET THE PASSWORD

export default router;
