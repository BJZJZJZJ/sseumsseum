const router = require("express").Router();

const userRouter = require("./userRouter");
const authRouter = require("./authRouter");
const categoryRouter = require("./categoryRouter");

// const assetRouter = require("./assetRouter");

router.use("/auth", authRouter); // 인증 관련 라우터 설정
router.use("/users", userRouter); // 유저 관련 라우터 설정
router.use("/categories", categoryRouter); // 카테고리 관련 라우터 설정
// router.use("/assets", assetRouter); // 자산 관련 라우터 설정

module.exports = router;
