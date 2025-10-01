const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const ALLOWED_METHODS = ["현금", "카드", "이체", "기타"];

// 날짜 형식 유효성 검사 및 표준 형식(YYYY-MM-DD)으로 변환
function standardizeDate(dateString) {
  // 1. 유연한 형식 체크 (YYYY-M-D 또는 YYYY-MM-DD 허용)
  if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateString)) {
    return { valid: false, date: null };
  }

  const parts = dateString.split("-");
  const year = parts[0];

  // 2. 월/일을 두 자리로 패딩 (예: '8' -> '08')
  const month = parts[1].padStart(2, "0");
  const day = parts[2].padStart(2, "0");

  const zeroPaddedDate = `${year}-${month}-${day}`;

  // 3. Date 객체 생성을 통해 최종 유효성 확인 (예: 2025-02-30 같은 잘못된 날짜 방지)
  const date = new Date(zeroPaddedDate);
  if (isNaN(date)) {
    return { valid: false, date: null };
  }

  // 4. 표준 형식 문자열 반환
  return { valid: true, date: zeroPaddedDate };
}

async function parseTransactions(filePath) {
  const transactions = [];
  const errors = [];

  // 파일 경로 유효성 검사는 생략 (이전 코드와 동일)
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error("파일을 찾을 수 없습니다.");
  }

  return new Promise((resolve, reject) => {
    fs.createReadStream(fullPath)
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, ""),
        })
      )
      .on("data", (row) => {
        const rowNumber = transactions.length + errors.length + 1;

        const dateString = row["거래일자"] ? row["거래일자"].trim() : "";
        let method = row["결제방법"] ? row["결제방법"].trim() : "";

        const rawIncome = row["입금"] ? row["입금"].replace(/,/g, "") : "0";
        const rawExpense = row["출금"] ? row["출금"].replace(/,/g, "") : "0";
        const incomeValue = Number(rawIncome);
        const expenseValue = Number(rawExpense);

        // --- 1차 유효성 검증 ---
        const validationErrors = [];

        // 날짜 변환 및 유효성 검사 (유연한 형식 허용)
        const dateResult = standardizeDate(dateString);
        if (!dateResult.valid)
          validationErrors.push(
            "거래일자 형식이 유효하지 않거나 유효한 날짜가 아님 (YYYY-MM-DD 또는 YYYY-M-D 필요)"
          );

        // 기타 검증 (이전과 동일)
        if (isNaN(incomeValue) || isNaN(expenseValue))
          validationErrors.push("금액이 유효하지 않음");

        // 기본값 설정
        if (method.includes("카드")) method = "card";
        else if (method.includes("현금")) method = "cash";
        else if (method.includes("이체")) method = "transfer";
        else method = "other";

        if (incomeValue > 0 && expenseValue > 0)
          validationErrors.push("수입과 지출 금액이 동시에 존재");

        if (validationErrors.length > 0) {
          errors.push({
            row: rowNumber,
            errors: validationErrors,
            // data: row
          });
          return;
        }

        // --- 검증 통과 후 데이터 가공 ---
        const amount = incomeValue > 0 ? incomeValue : expenseValue;
        const type = incomeValue > 0 ? "income" : "expense";

        const parsedTransaction = {
          transactionDate: dateResult.date, // 표준 형식(YYYY-MM-DD)으로 저장
          method: method,
          amount: amount,
          type: type,
          description: row["내용"] || "",
        };

        transactions.push(parsedTransaction);
      })
      .on("end", () => {
        console.log(
          `CSV 파일 파싱 완료. 총 ${transactions.length}개 성공, ${errors.length}개 오류`
        );
        resolve({ transactions, errors });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

module.exports = { parseTransactions };
