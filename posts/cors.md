---
title: CORS 개념과 해결방법
date: 2024-12-27
content: 브라우저의 보안 정책, CORS 에러 발생 원인과 해결 방법
category: All
---

### CORS란?
- CORS는 Cross-Origin Resource Sharing의 약자로, 직역하면 **“교차 출처 리소스 공유”**를 의미합니다.
- 여기서 교차 출처라고 하는 것은 다른 출처를 의미하는 것 입니다.
- 여기서 **출처**란 무엇일까요?

### 출처(Origin)란?
- 우리가 어떤 사이트를 접속할때 인터넷 주소창에 우리는 URL이라는 문자열을 통해 접근하게 됩니다.
- 이처럼 URL은 **https://domain.com:3000/user?queryname&page=1**과 같이 하나의 문자열 같지만, 사실은 다음과 같이 여러개의 구성 요소로 이루어져 있습니다.

![cors1](/cors1.png)

1. Protocol(Scheme) : http, https
2. Host : 사이트 도메인
3. Port : 포트 번호
4. Path : 사이트 내부 경로
5. Query string : 요청의 key와 value값
6. Fragment : 해시 태크

- 여기서 출처(Origin)이라는 것은 Protocol과 Host 그리고 Port까지 모두 합친 URL을 의미합니다.

**Origin : Protocol + Host + Port**

### 출처(Origin) 구분 기준
- 두 출처가 서로 다른지 판단하는 기준을 알아보겠습니다.
- 출처(Origin)의 동일함은 두 URL의 구성 요소 중 Protocol, Host, Port 이 3가지만 동일하다면 동일 출처로 판단합니다.
- 예로 https://www.domain.com:3000 출처에 대해, 다양한 URL이 동일 출처(Same-Origin)인지 여부를 비교한 표입니다.

| URL                              | 동일 출처? | 이유                               |
|----------------------------------|-----------|----------------------------------|
| https://www.domain.com:3000/about | O         | 프로토콜, 호스트, 포트 번호 동일 |
| https://www.domain.com:3000/about?username=inpa | O         | 프로토콜, 호스트, 포트 번호 동일 |
| http://www.domain.com:3000        | X         | 프로토콜 다름 (http ≠ https)     |
| https://www.another.co.kr:3000    | X         | 호스트 다름                      |
| https://www.domain.com:8888       | X         | 포트 번호 다름                   |
| https://www.domain.com            | X         | 포트 번호 다름 (443 ≠ 3000)     |

- 마지막은 URL은 URL에서 포트 번호를 따로 지정하지 않으면 기본값이 적용됩니다.
  - HTTPS(보안 프로토콜) → 기본 포트 443
	- HTTP(일반 프로토콜) → 기본 포트 80

### 출처 비교와 차단은 브라우저가 한다.
- 출처 구분을 서버가 하는 것으로 오해하는 분들이 많은데, 출처를 비교하는 로직은 서버에 구현된 스펙이 아닌 브라우저에 **구현된 스펙**입니다.
- 서버는 리소스 요청에 의한 응답을 해주었지만, 브라우저가 이 응답을 분석해 동일 출처가 아니면 에러를 보내는 것입니다.
- 즉, 응답 데이터는 멀쩡하지만 브라우저 단에서 받을수 없도록 차단을 한 것입니다.


### 브라우저 CORS 기본 동작
1. 클라이언트에서 HTTP 요청 헤더에 Origin을 담아 전달

![cors2](/cors2.png)

2. 서버는 응답헤더에 Access-Control-Allow-Origin을 담아 클라이언트로 전달

![cors3](/cors3.png)

3. 클라이언트에서 Origin과 서버가 보내준 Access-Control-Allow-Origin을 비교


### 해결책
#### 서버에서 Access-Control-Allow-Origin 세팅
- 서버에서 Access-Control-Allow-Origin 헤더에 허용할 출처를 기재해서 클라이언트에 응답하면 됩니다.
- 하지만, 이 방법은 서버를 따로 구축하지 않고 외부 서버에 리소스를 요청하고 있을 때는 사용할 수 없는 방법입니다.

```ts
import express from "express";
const app = express();

app.get("api", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "https://www.domain.com");
    res.send(data)
});
```

#### CORS 미들웨어 사용

```ts
import cors from "cors"
import express from "express";

const app = express();

const corsMiddleware = cors({
    origin: ["https://www.domain.com"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
})

app.use(corsMiddleware);
```

#### 프록시 우회(vite 환경)
- 프록시란 클라이언트와 서버 사이의 중간 대리점 역할을 합니다.
- 서버에서 따로 설정을 안 해서 CORS 에러가 발생하는 것이라면, 모든 출처를 허용한 프록시 서버를 통해 요청을 우회할 수 있습니다.
- 즉, 클라이언트 → 프록시 서버(모든 출처 허용) → 백엔드 서버의 흐름으로 요청이 전달됩니다.
- CORS는 브라우저에서 적용되는 정책이므로, 서버 간의 통신은 제한 없이 가능합니다.

```ts
// vite.config.ts

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            // "/api"로 시작하는 요청을 백엔드 서버로 프록시
            "/api": {
                target: "https://www.domain.com", // 동일 출처 주소
                changeOrigin: true, // CORS 우회
                secure: false, // https에서도 동작하도록 설정
                rewrite: (path) => path.replace(/^\/api/, ""), // 경로 재작성 https://www.domain.com/api/something -> https://www.domain.com/something
            },
        },
    },
});
```

- CRA는 지원이 종료되었기 때문에 다루지 않겠습니다.[GeekNews](https://news.hada.io/topic?id=19242)

#### Chrome 확장 프로그램

[Allow CORS](https://chromewebstore.google.com/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf)

- 설치 후 브라우저에서 활성화시키면, 로컬 환경에서 API를 테스트 시 CORS 문제를 해결할 수 있습니다.
- 실제 운영 환경에서는 Access-Control-Allow-Origin 헤더를 설정해 CORS 문제를 해야합니다.

출처: [출처](https://inpa.tistory.com/entry/WEB-%F0%9F%93%9A-CORS-%F0%9F%92%AF-%EC%A0%95%EB%A6%AC-%ED%95%B4%EA%B2%B0-%EB%B0%A9%EB%B2%95-%F0%9F%91%8F)

----- 