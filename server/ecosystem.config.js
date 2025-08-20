module.exports = {
  apps: [
    {
      name: "sseumsseum", // 애플리케이션 이름
      script: "server.js", // 애플리케이션의 진입점 파일명
      instances: 1, // 실행할 프로세스의 인스턴스 수
      autorestart: true, // 애플리케이션의 자동 재시작 여부

      // 환경 변수
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
