// Firebase Functions v2 구문에 맞게 import 방식을 수정합니다.
import {onRequest} from "firebase-functions/v2/https";
// 'express'와 'cors'를 default import 방식으로 변경합니다.
import express from "express";
import cors from "cors";
import axios from "axios";

// 실제 백엔드 API 서버의 주소입니다.
const API_TARGET = "http://158.180.84.232:44445";

const app = express();

// CORS를 허용하여 다른 도메인에서의 요청을 처리할 수 있게 합니다.
app.use(cors({origin: true}));

// '/api/v1'으로 시작하는 모든 요청을 처리합니다.
app.all("/api/v1/*", (req: express.Request, res: express.Response) => {
  // 클라이언트가 요청한 경로 (예: /api/v1/users/me)
  const path = req.originalUrl;

  // 실제 API 서버로 보낼 주소를 만듭니다.
  const targetUrl = `${API_TARGET}${path}`;

  console.log(`Forwarding request to: ${targetUrl}`);

  // axios를 사용하여 클라이언트의 요청을 그대로 실제 API 서버에 전달합니다.
  axios({
    method: req.method,
    url: targetUrl,
    data: req.body,
    headers: {
      // 클라이언트가 보낸 헤더 중 필요한 것들을 전달합니다.
      "Authorization": req.headers["authorization"],
      "X-Password-Token": req.headers["x-password-token"],
      "Content-Type": req.headers["content-type"],
      "Cookie": req.headers["cookie"],
    },
    // 쿠키를 주고받기 위해 필요합니다.
    withCredentials: true,
  })
    .then((response) => {
      // API 서버의 응답 헤더 중 필요한 것을 클라이언트에 다시 전달합니다.
      if (response.headers["x-password-token"]) {
        res.setHeader("X-Password-Token", response.headers["x-password-token"]);
      }

      // ✅ [수정] 백엔드가 보낸 Set-Cookie 헤더를 클라이언트로 전달합니다.
      const cookies = response.headers['set-cookie'];
      if (cookies) {
        res.setHeader('Set-Cookie', cookies);
      }

      // API 서버의 응답을 클라이언트에 그대로 전달합니다.
      res.status(response.status).send(response.data);
    })
    .catch((error) => {
      // 오류가 발생하면, API 서버가 보낸 오류 메시지를 그대로 클라이언트에 전달합니다.
      if (error.response) {
        // 백엔드에서 받은 Set-Cookie 헤더가 오류 응답에도 있을 수 있으므로 전달합니다.
        const cookies = error.response.headers['set-cookie'];
        if (cookies) {
            res.setHeader('Set-Cookie', cookies);
        }
        res.status(error.response.status).send(error.response.data);
      } else {
        res.status(500).send("Proxy server error");
      }
    });
});

// Express 앱을 'api'라는 이름의 Cloud Function으로 내보냅니다. (v2 구문)
export const api = onRequest({region: "asia-northeast3"}, app);