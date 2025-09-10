// file-parser.js
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");


async function parseTransactions(filePath) {
  const transactions = [];

  // 파일 경로 유효성 검사
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error("파일을 찾을 수 없습니다.");
  }

  return new Promise((resolve, reject) => {
    // 엑셀(CSV) 파일을 스트림으로 읽어서 파싱 시작
    fs.createReadStream(fullPath)
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, ""),
        })
      )
      .on("data", (row) => {
        // 각 행(row)을 객체 형태로 받아와서 데이터 가공
        // 예시: 은행에서 받은 파일의 열 이름이 '거래일자', '내용', '금액'일 경우
        const parsedTransaction = {
          date: row["거래일자"],
          time: row["거래시간"],
          method: row["적요"],
          income: row["입금(원)"]
            ? Number(row["입금(원)"].replace(",", ""))
            : 0,
          expense: row["출금(원)"]
            ? Number(row["출금(원)"].replace(",", ""))
            : 0,
          description: row["내용"],
          amount: Number(row["잔액(원)"].replace(",", "")) || 0,
        };
        transactions.push(parsedTransaction);
      })
      .on("end", () => {
        // 파일 파싱이 끝났을 때 resolve
        console.log("CSV 파일 파싱 완료");
        resolve(transactions);
      })
      .on("error", (err) => {
        // 오류 발생 시 reject
        reject(err);
      });
  });
}

module.exports = { parseTransactions };
