import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import ENV from "../config.js";

let nodeConfig = {
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: ENV.EMAIL,
    pass: ENV.PASS,
  },
};

let transporter = nodemailer.createTransport(nodeConfig); // creating transporter to send mail

let mailGenerator = new Mailgen({
  // creating mail generator  to generate  mail
  theme: "default",
  product: {
    name: "Mailgen",
    link: "https://mailgen.js/",
  },
});

export const registerMail = async (req, res) => {
  // registerMail POST method funtion...
  const { username, userEmail, text, subject } = req.body;

  var email = {
    body: {
      name: username,
      intro:
        text ||
        "'Welcome to My Mern Register app! We're very excited to have you on board.'",
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };

  var emailBody = mailGenerator.generate(email);

  let message = {
    from: ENV.EMAIL,
    to: userEmail,
    subject: subject || "SignUp Successfully...",
    html: emailBody,
  };

  const info = await transporter.sendMail(message);
  res.status(200).json(info);
  //   transporter
  //     .sendMail(message)
  //     .then(() => {
  //       return res
  //         .status(200)
  //         .send({ msg: "You should receive an email from us." });
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       res.status(500).send(`error is ${err}`);
  //     });
};
