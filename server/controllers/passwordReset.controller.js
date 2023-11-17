import { Router } from "express";
import User from "../models/user.js";
import Reset from "../models/reset.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import * as config from "../utils/config.js";
import log from "../utils/logger.js";

const pwResetRouter = Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: config.email,
    pass: config.emailPW,
  }
});

async function sendEmail(payload) {
  transporter.sendMail(payload, (err, info) => {
    if (err) {
      log.error(err, "Error sending email");
      return;
    }
    log.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  });
}


// Add a html body to the email.
const htmlForm = (text) => {
  return `<body>
            <div align="center">
              ${text}
            </div>
          </body>`;
};

// Get reset form with id.
pwResetRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const reset = await Reset.findById(id);

    if (!reset) {
      return res.status(404).send(htmlForm("<h2>The link has expired</h2>"));
    }

    res.send(
      htmlForm(`<h1>Changing your password</h1>
            <form action="/api/reset/${id}" method="post">
              New password:
              <br>
              <input type="text" name="password">
              <button type="submit">Update</button>
            </form>`)
    );
  } catch (exception) {
    next(exception);
  }
});

// Update password with id if the reset has not expired.
pwResetRouter.post("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const reset = await Reset.findById(id);

    if (!reset) {
      return res.status(404).send(htmlForm("<h2>The link has expired<h2>"));
    }
    console.log(password);
    console.log(reset.email);

    const user = await User.findOne({ email: reset.email });
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    await User.findByIdAndUpdate(
      user._id,
      { password: passwordHash },
      { new: true }
    );

    await Reset.findByIdAndDelete(reset._id);

    return res
      .status(200)
      .send(htmlForm("<h2>Your password has been updated<h2>"));
  } catch (exception) {
    next(exception);
  }
});

// Create and send a reset link to the users email.
pwResetRouter.post("/", async (req, res, next) => {
  try {
    let { email } = req.body;

    if (!email)
      return res.status(400).json({ error: "No email was provided." });

    email = email.toLowerCase();

    let user = null;

    user = await User.findOne({ email });

    if (!user)
      return res
        .status(400)
        .json({ error: "There is no account with that email." });

    //sendmail email server
    // const transporter = nodemailer.createTransport({
    //   sendmail: true,
    //   newline: 'unix',
    //   path: '/usr/sbin/sendmail'
    // })

    // Generic smtp
    // nodemailer.createTransport({
    //   host: "smtp.example.com",
    //   port: 587,
    //   secure: false, // upgrade later with STARTTLS
    //   auth: {
    //     user: "email",
    //     pass: "password",
    //   },
    // })


    // Create a reset entry.
    const reset = new Reset({
      email: user.email,
    });

    await reset.save();
    const url = `${config.url}/api/reset/${createdReset._id}`;

    await sendEmail({
      to: user.email,
      from: config.email,
      subject: "Password reset request",
      html: `
        <h1> Hello ${user.email}!</h1>
        <p>You can change your password using the link below</p>
        <p>The link is valid for 10 minutes</p>
        <a href="${url}">${url}</a>
      `,
    });




     log.debug(`Password reset email sent to ${email}`)

    return res.status(200).json({ success: "Reset created and email sent." });
  } catch (exception) {
    console.log(exception);

    try {
      if (exception.name.includes("User validation failed")) {
        return res.status(400).json({ error: "email not found" });
      } else {
        next(exception);
      }
    } catch (e) {
      next(e);
    }
  }
});

export { pwResetRouter };
