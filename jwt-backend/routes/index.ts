import express from "express";
var router = express.Router();
import path from "path";

/* GET home page. */
router.get("/", function (req, res, next) {
  res.sendFile(path.join(process.cwd(), "index.html"));
});

export default router;
