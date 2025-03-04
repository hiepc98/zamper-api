import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import { firebaseConfig } from "../config/firebase";

const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
const FIREBASE_PUBLIC_KEYS_URL = `https://www.googleapis.com/service_accounts/v1/metadata/x509/securetoken@system.gserviceaccount.com`;
const secretKey = "ramper_verify";

//   const verifyToken = jwt.sign(
//   {
//     id: '3MB5fKm7u9XTPM1mXha2Gq1yK0m1',
//     iss: 'https://ramper.xyz',
//     aud: 'ramper',
//     sub: '3MB5fKm7u9XTPM1mXha2Gq1yK0m1'
//   },
//   "ramper_verify",
//   {
//     header: {
//       alg: 'HS256',
//       typ: undefined
//     },
//     expiresIn: '60m'
//   }
// )
// console.log('verifyToken', verifyToken)

export const authenticateFirebase = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  const verifycode: any = req.headers?.verifycode;

  if (!verifycode || !token) {
    res.status(401).json({ message: "Unauthenticated" });
    return;
  }

  let verified: any = ''
  try {
    verified = jwt.verify(verifycode, secretKey);
  } catch (error) {
    res.status(403).json({ message: "verifyCode invalid" });
    return
  }

  try {
    // Fetch Firebase public keys from Google
    const { data: publicKeys } = await axios.get(FIREBASE_PUBLIC_KEYS_URL);

    // Decode the token header to get the key ID
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader || !decodedHeader.header.kid) {
      res.status(403).json({ message: "Invalid token" });
      return;
    }

    if (verified?.sub !== decodedHeader.payload.sub) {
      res.status(403).json({ message: "Invalid verify code" });
      return;
    }

    const publicKey = publicKeys[decodedHeader.header.kid];
    if (!publicKey) {
      res.status(403).json({ message: "Public key not found" });
      return;
    }

    // Verify token using public key
    const decodedToken = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });

    req.body.user = decodedToken; // Attach user info to request
    next();
  } catch (error) {
    res.status(403).json({ message: "Unauthenticated error", error });
  }
};
