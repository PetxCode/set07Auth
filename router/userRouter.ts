import express from "express";
import {
  changePassword,
  createUser,
  deleteUser,
  readUserOne,
  readUsers,
  resetUser,
  signUser,
  updateUserAvatar,
  updateUserInfo,
  verifiedUser,
} from "../controller/authController";
import { upload } from "../utils/multer";
import validatorHandler from "../utils/validatorHandler";
import { createUserValidator } from "../utils/validators";
import { verification } from "../utils/verification";

const router = express.Router();

router
  .route("/register")
  .post(validatorHandler(createUserValidator), createUser);
router.route("/sign-in").post(signUser);
router.route("/read-users").get(verification, readUsers);
router.route("/:userID/read-users").get(readUserOne);
router.route("/:userID/update-user-info").patch(updateUserInfo);
router.route("/:userID/update-user-avatar").patch(upload, updateUserAvatar);
router.route("/:userID/delete").delete(deleteUser);
router.route("/:userID/verify").get(verifiedUser);
router.route("/reset").patch(resetUser);
router.route("/:userID/change").patch(changePassword);

export default router;
