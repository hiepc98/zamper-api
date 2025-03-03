export type UserModel = {
  UID: string;
  signupSource: string;
  notificationPreference?: string;
  email?: string;
  preferredCommunicationMethod?: string;
  region?: string;
};

export interface WalletFragment {
  fragment: string;
  index: number;
}

export type WalletModel = {
  chain: string;
  walletId: string;
  publicKey: string;
  creationDate: number;
  privateKey?: string;
};

export type WalletKeyModel = {
  walletId: string;
  dek: Uint8Array;
  encryptedKey: string;
  version?: number;
  fiUri?: string;
};

export type Wallet = {
  getAddress: () => string;
} & WalletModel;

export const Wallet = (wallet: WalletModel): Wallet => {
  return {
    ...wallet,
    getAddress: () => wallet.publicKey,
  };
};
