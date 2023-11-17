import jwt from 'jsonwebtoken';

/**
  * Signs a JWT token.
  * @param {object} object - The object to be signed.
  * @param {string} keyName - accessTokenPrivateKey or refreshTokenPrivateKey.
  * @param {object} options - sign options for the token are optional.
  * @returns {string} The signed token.
  */
export function signJwt(object, keyName, options) {
  const signingKey = Buffer.from(keyName, 'base64').toString('ascii');
  return jwt.sign(object, signingKey, { ...options, algorithm: 'HS256' });
}

/**
  * Verifies a JWT token.
  * @param {string} token - The JWT token to verify.
  * @param {string} keyName - accessTokenPublicKey or refreshTokenPublicKey.
  * @returns {object} The decoded token or null.
  */
export function verifyJwt(token, keyName) {
  const publicKey = Buffer.from(keyName, 'base64').toString('ascii');
  try {
    const decode = jwt.verify(token, publicKey);
  } catch (error) {
    return null;
  }
}

