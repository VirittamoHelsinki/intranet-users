import { config } from "dotenv";

config();

const port = process.env.PORT;

// Email used for sending password reset links.
const email = process.env.SERVICE_EMAIL;
const emailPW = process.env.SERVICE_EMAIL_APP_KEY;

// URL of this service.
const url = process.env.URL;

const environment = process.env.NODE_ENV;

// Development mode is default.
let mongoUrl = process.env.MONGODB_URI;

if (environment === "test") mongoUrl = process.env.TEST_MONGODB_URI;
else if (environment === "production")
  mongoUrl = process.env.PRODUCTION_MONGODB_URI;

const secret = process.env.SECRET;

export { mongoUrl, port, email, emailPW, url, environment, secret };
