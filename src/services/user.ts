import { doc, DocumentData, DocumentSnapshot, getDoc, getFirestore } from "firebase/firestore";
import { UserModel } from "../types";
import { auth } from "../config/firebase";

export const WALLET_PARTNER_KEY = {
  V0: "default",
  V1: "default",
  V2: "ramper",
};

export const PARTNER_KEY = {
  RAMPER_V1: WALLET_PARTNER_KEY.V1,
  RAMPER: WALLET_PARTNER_KEY.V2,
  COIN98: "coin98",
  OTHER: "other",
};

export const getUser = async (UID: string): Promise<UserModel | null> => {
  const firestore = getFirestore(auth.app);
  const _key = doc(firestore, "users", UID);
  const document: DocumentSnapshot<DocumentData> = await getDoc(_key);

  return document.exists() ? (document.data() as UserModel) : null;
};

export const getWalletKeyPath = (
  UID: string | undefined,
  walletId: string | undefined,
  walletKeyFirebase = "default"
): Array<string> => {
  if (walletKeyFirebase === "[DEFAULT]") {
    walletKeyFirebase = "default";
  }

  if (!UID) {
    if (!Object.values(PARTNER_KEY).includes(walletKeyFirebase)) {
      return [walletKeyFirebase];
    } else {
      return [walletKeyFirebase];
    }
  }

  // check if walletKeyFirebase is not in PARTNER_KEY
  if (!Object.values(PARTNER_KEY).includes(walletKeyFirebase)) {
    if (!walletId) {
      return [UID, "walletList", walletKeyFirebase];
    }

    return [UID, "walletList", walletKeyFirebase, "walletkey", walletId];
  } else {
    if (!walletId) {
      return [UID, "walletList", walletKeyFirebase];
    }

    return [UID, "walletList", walletKeyFirebase, "walletkey", walletId];
  }
};