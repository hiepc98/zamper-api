import { Router } from "express";
import { signIn } from "../controllers/signin";
import { signUp } from "../controllers/signup";
import { authenticateFirebase } from "../middleware/index";

const router = Router();

router.get("/get-profile", authenticateFirebase, signIn);
router.post("/signup", authenticateFirebase, signUp);

export default router;
