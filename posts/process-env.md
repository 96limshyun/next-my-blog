---
title: 환경 변수 다루기 (process.env)
date: 2024-04-17
content: 환경 변수를 설정해 개발, 배포 서버를 분리한다!
category: Js, React, All
---

## 환경변수 알기전 하드코딩...
- 개발을 하며 배포는 해본적이 없어 그동안 아래와 같이 서버를 하드코딩 해왔는데, 마스터에게 서버URL 제발 하드코딩 하지말라는 피드백을 받았다...
```ts
export const APIManager = {
    async getNewsData(tableName) {
        const news = await fetch(`http://localhost:3000/${tableName}`);
        const data = await news.json();
        return data;
    },

    async postNewsData(pressInfo) {
        await fetch(`http://localhost:3000/subscribeInfo`, {
            method: "post",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(pressInfo),
        });
    },
    async deleteNewsData(pressName) {
        try {
            await fetch(`http://localhost:3000/subscribeInfo/${pressName}`, {
                method: "DELETE",
            });
        } catch (error) {
            console.error(error);
        }
    },
};
```
- 환경변수라는 것을 알게되어 학습해 적용해보기로 했다.

## 환경 변수 사용 이유?
- 환경변수를 사용하는 이유는 외부로 알려지면 안되는 API KEY나 db 관련 정보 등의 보안을 지켜야하며, 유지 보수를 용이하게 하기 위해 사용한다.

## .evn 파일 생성
- 먼저 루트에 .env파일을 생성한다. .env파일은 항상 프로젝트 최상단에 위치해야한다.
- 환경 변수는 외부에 공개되면 안되기 때문에 .env파일을 .gitignore파일에 올려야한다.
```md
gitIgnore
> .env 
```
- .env파일에 환경 변수를 설정한다. 
`REACT_API_SERVER=http://localhost:4000/`
- CRA는 보안을 위해 REACT_APP_으로 시작하지 않는 변수는 무시하기 때문에 REACT_APP_를 꼭 붙여야한다.

## 환경 변수 가져오기
- 사용하고자 하는 파일에 process.env로 환경 변수를 가져올 수 있다.
`const serverURL = process.env.REACT_API_SERVER;`

## 개발/배포 환경 설정
- CRA로 프로젝트를 시작했다면 개발환경과 배포환경을 분리할 수 있다.
- 최상단에 .env.development, .env.production 파일을 생성하고 개발중에 사용할 환경변수는 .env.development에, 배포할때 사용할 환경변수는 .env.production에 선언한다.
- 명령어를 실행하면 자동으로 개발/배포 환경을 분리해 환경변수를 사용한다.

#### npm run start > .env.development 환경변수를 실행한다.
#### npm run build > .env.production 환경변수를 실행한다.

```md
# development 개발 env실행
$ npm start

# production 배포 env실행
$ npm run build
```

## 적용!
```ts
const serverURL = process.env.REACT_APP_SERVER;

export const APIManager = {
    async getNewsData(tableName) {
        const news = await fetch(serverURL + tableName);
        const data = await news.json();
        return data;
    },

    async postNewsData(pressInfo) {
        await fetch(serverURL + "subscribeInfo", {
            method: "post",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(pressInfo),
        });
    },
    async deleteNewsData(pressName) {
        try {
            await fetch(serverURL + `subscribeInfo/${pressName}`, {
                method: "DELETE",
            });
        } catch (error) {
            console.error(error);
        }
    },
};
```