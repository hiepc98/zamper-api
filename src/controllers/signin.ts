import { Request, Response } from "express";
import {
  getWalletKey,
  isWalletExist,
  PARTNER_KEY
} from "../services/user";

export const signIn = async (req: Request, res: Response): Promise<any> => {
  const uid = req.body.user.user_id;
  const partner = (req.query.partner as string) || "";

  // validate payload
  if (!Object.values(PARTNER_KEY).includes(partner)) {
    res.status(400).json({
      success: false,
      message: "Partner invalid",
    });
    return;
  }

  const wallets = await isWalletExist(uid, partner);

  if (!wallets || wallets.length === 0) {
    res.status(403).json({
      success: false,
      message: "Wallet not found",
    });
    return;
  }

  const response = await getWalletKey(uid, wallets[0].walletId, partner);

  res.status(200).json({
    success: !!response,
    user: response || {},
  });
};
