import {
  doc,
  DocumentData,
  DocumentSnapshot,
  getDoc,
  getFirestore,
} from "firebase/firestore";
import { UserModel, WalletKeyModel, WalletModel } from "../types";
import { auth } from "../config/firebase";
import { formatDek, getWalletKeyPath, objectToUint8Array } from "../helpers";

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

export const isWalletExist = async (
  UID: string,
  walletKeyFirebase: string = "default"
): Promise<WalletModel[]> => {
  const walletKeyFirebasePath = getWalletKeyPath(
    UID,
    undefined,
    walletKeyFirebase
  );

  const firestore = getFirestore(auth.app);

  let _key = doc(firestore, "users", ...walletKeyFirebasePath);

  const document: DocumentSnapshot<DocumentData> = await getDoc(_key);

  if (document.exists()) {
    const walletsData = document.data();
    const walletList: WalletModel[] = walletsData?.walletList ?? [];
    return walletList;
  }
  return [];
};

export const getUser = async (UID: string): Promise<UserModel | null> => {
  const firestore = getFirestore(auth.app);
  const _key = doc(firestore, "users", UID);
  const document: DocumentSnapshot<DocumentData> = await getDoc(_key);

  return document.exists() ? (document.data() as UserModel) : null;
};

export const getWalletKey = async (
  UID: string,
  walletId: string,
  walletKeyFirebase: string
): Promise<WalletKeyModel | null> => {
  const firestore = getFirestore(auth.app);

  const walletKeyFirebasePath = getWalletKeyPath(
    UID,
    walletId,
    walletKeyFirebase
  );

  const _key = doc(firestore, "users", ...walletKeyFirebasePath);

  const document: DocumentSnapshot<DocumentData> = await getDoc(_key);
  const walletsData = document.data() as any;

  if (!walletsData) return null;

  const walletKey: WalletKeyModel = {
    walletId: document.id,
    dek: formatDek(walletsData),
    encryptedKey: walletsData!.encryptedKey,
    fiUri: walletsData!.fiUri,
  };

  return walletKey;
};
