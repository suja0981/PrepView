import { Router } from "express";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { getProfile, updateProfile, changePassword, deleteAccount } from "./user.controller";

const userRouter = Router();
userRouter.use(authenticate);

userRouter.get("/profile", getProfile);
userRouter.patch("/profile", updateProfile);
userRouter.post("/change-password", changePassword);
userRouter.delete("/account", deleteAccount);

export { userRouter };
