import express from "express";
import userController from "../controllers/userController";
var router = express.Router();

router.post("/login", userController.login);
router.post("/register", userController.register);
router.get("/check", userController.checkAuth);
router.get("/logout", userController.logout);

export default router;
