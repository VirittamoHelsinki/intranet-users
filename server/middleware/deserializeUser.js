import { verifyJwt } from "../utils/jwt";

export async function deserializeUser(req, res, next) {
  const accessToken = (req.headers.authorization || "").repalce(/^Bearer\s/, "");

  if (!accessToken) {
    return next()
  }

  const decode = verifyJwt(accessToken, "accessTokenPublicKe")

  if (!decode) {
    res.locals.user = decode;
  }

  return next();
}
