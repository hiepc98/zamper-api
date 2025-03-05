import { Request, Response } from "express";
import { Bytes, doc, getFirestore, writeBatch } from "firebase/firestore";
import { auth } from "../config/firebase";
import {
  getUser,
  WALLET_PARTNER_KEY,
} from "../services/user";
import { UserModel, WalletKeyModel, WalletModel } from "../types";
import { decrypt, getWalletKeyPath, objectToUint8Array } from "../helpers";

export const signUp = async (req: Request, res: Response): Promise<any> => {
  const start = Date.now(); // Start time
  const {
    user: { user_id: uid },
    walletKey,
    wallets,
    partner: partnerKey,
    userInfo,
  } = req.body;

  // validate payload
  if (!wallets || !walletKey || !partnerKey || !userInfo) {
    res.status(400).json({
      success: false,
      message: "Bad request",
    });
    return;
  }

  const verifyCode = req.headers?.verifycode as string;
  const decodeWalletKey = decrypt(walletKey, verifyCode);
  const decodeWalletKeyObj = JSON.parse(decodeWalletKey);

  // validate user exists
  const userModel = await getUser(uid);
  if (userModel) {
    res.status(400).json({
      success: false,
      message: "User already exists",
    });
    return;
  }

  // create user
  await insertNewUser({...userInfo, UID: uid}, partnerKey, wallets, {
    ...decodeWalletKeyObj,
    dek:
      typeof decodeWalletKeyObj.dek === "object"
        ? objectToUint8Array(decodeWalletKeyObj.dek)
        : decodeWalletKeyObj.dek,
  });

  const end = Date.now(); // End time
  console.log(`Execution time: ${end - start} ms`);

  res.status(201).json({
    success: true,
    message: "Signup success",
  });
};

const insertNewUser = async (
  newUser: UserModel,
  partnerKey: "coin98" | "ramper",
  wallets?: WalletModel[],
  walletKey?: WalletKeyModel
) => {
  const firestore = getFirestore(auth.app);
  const batch = writeBatch(firestore);

  const _key = doc(firestore, "users", newUser.UID);
  batch.set(_key, newUser);

  // if partnerKey is coin98, then save coin98 only
  if (partnerKey && partnerKey !== "ramper" && walletKey) {
    const walletKeyFirebasePath = getWalletKeyPath(
      newUser.UID,
      walletKey.walletId,
      partnerKey
    );
    const _walletKeyKey = doc(firestore, "users", ...walletKeyFirebasePath);

    batch.set(_walletKeyKey, {
      ...walletKey,
      dek: Bytes.fromUint8Array(walletKey.dek),
    });

    // remove the last two elements from the path
    const path = walletKeyFirebasePath.slice(0, -2);
    const _walletListKey = doc(firestore, "users", ...path);

    batch.set(_walletListKey, { walletList: wallets });
    await batch.commit();
    return newUser;
  }

  // Should save the wallet as well.
  if (walletKey) {
    console.log("walletKey", Bytes.fromUint8Array(walletKey.dek));
    Object.values(WALLET_PARTNER_KEY).forEach((version) => {
      const _walletKeyKey = doc(
        // @ts-ignore
        firestore,
        "users",
        newUser.UID,
        "walletList",
        version,
        "walletkey",
        walletKey.walletId
      );

      batch.set(_walletKeyKey, {
        ...walletKey,
        dek: Bytes.fromUint8Array(walletKey.dek),
      });

      // @ts-ignore
      const _walletListKey = doc(
        firestore,
        "users",
        newUser.UID,
        "walletList",
        version
      );
      batch.set(_walletListKey, { walletList: wallets });
    });
  }
  await batch.commit();
  return newUser;
};
