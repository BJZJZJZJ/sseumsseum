const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 업로드 디렉토리 설정
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer 스토리지 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
});

const upload = multer({ storage });

module.exports = upload;
