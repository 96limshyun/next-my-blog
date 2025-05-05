---
title: CRA없이 React 앱 구성하기.2
date: 2024-07-02
content: Babel을 적용해 JSX 문법을 사용해보자
category: All, React
---

## 트랜스파일러란?
- 저번 post에서 트랜스파일러란 문법을 변환하는 도구라고 정의하였습니다.
- 엄밀히 말하면, 트랜스파일러는 단순히 문법 변환만 하는것이 아니라 다른 언어로 변경해주는 역할도 수행합니다.
- 예를 들면, Typescript언어를 Javascript언어로 변경해줍니다. Javascript엔진 만으로 Typescript의 실행이 불가능 하기 때문입니다.
- JSX는 Javascript의 확장 문법에 가까운데 이 역시 Javascript 엔진으로 실행하려면 순수 Javascript 문법으로 변경해야 합니다.
- 이때 사용되는것이 트랜스파일러입니다.

## Babel을 적용해 JSX 문법을 사용해보자
- 저번 post와 마찬가지로 CDN을 이용해 Bable 패키지를 사용해 보겠습니다.
- Babel: "https://unpkg.com/@babel/standalone@7.25.5/babel.min.js"
- script 태그로 Babel CDN 링크를 정의해주고, Babel 패키지가 정상적으로 로드되었으면 이제 스크립트를 JSX 문법으로 바꿔줍니다.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>React App Without CRA</title>
    <script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone@7.25.5/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script>
        // const App = () => React.createElement("h1", null, "HELLO REACT")
        // const root = ReactDOM.createRoot(document.getElementById("root"))
        // ReactDOM.render(
        //     React.createElement(App),
        //     document.getElementById("root")
        // )
        const App = () => <h1>HELLO REACT</h1>
        ReactDOM.render(<App/>, document.getElementById("root"))
    </script>
</body>
</html>
```

![cra](/CRA6.png)

- 예상과는 달리 Babel을 적용했는데도 여전히 동일한 에러가 발생합니다. 왜 그럴까요?
- 브라우저에게 어떤 스크립트를 Babel로 변환하고 싶은지 알려주지 않았기 때문입니다.
- `<script type="text/babel"></script>` 옵션을 주면 해결됩니다.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>React App Without CRA</title>
    <script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone@7.25.5/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    // 이 스크립트는 Babel로 트랜스파일한 다음 실행시켜줘
    <script type="text/babel">
        // const App = () => React.createElement("h1", null, "HELLO REACT")
        // const root = ReactDOM.createRoot(document.getElementById("root"))
        // ReactDOM.render(
        //     React.createElement(App),
        //     document.getElementById("root")
        // )
        const App = () => <h1>HELLO REACT</h1>
        ReactDOM.render(<App/>, document.getElementById("root"))
    </script>
</body>
</html> 
```

- 다시 실행하면 정상적으로 동작 되지만 콘솔창에 한가지 에러가 발생합니다.

![cra](/CRA7.png)

- 브라우저에서 스크립트를 실시간으로 트랜스파일링하지 말고 미리 트랜스파일된 스크립트를 실행시키라는 것입니다.
- 이제 여기에 적용할 수 있는 도구가 바로 Webpack과 같은 번들러입니다.

## 빌드 타임에서 트랜스파일 할 수 있도록 수정해보자
- 먼저 npm을 이용해 라이브러리 3개를 설치해줍니다.
1. @babel/cli: script 명령을 통해 Babel을 실행하기 위한 패키지
2. @babel/core: 바벨 설치
3. @babel/preset-react: react문법을 javascript로 트랜스파일 하기 위한 패키지

```bash
npm install --save-dev @babel/cli @babel/core @babel/preset-react 
```

- 설치가 끝나면 package.json, package.lock.json, node_modules가 생긴것을 볼 수 있습니다.

## Babel 설정하기
- Babel은 실행될때 내부적으로 .babelrc라는 파일명을 찾아 설정 정보를 읽기 때문에, 루트 디렉토리에 .babelrc 파일을 만든 후, 위 preset 정보를 넣어줍니다.
- presets는 Babel에게 어떤 규칙을 기반으로 코드를 변환할지를 지시하는 설정이다
```json
{
    // Babel에게 React 코드를 컴파일하는 데 필요한 설정을 적용하라고 지시합니다.
    "presets": ["@babel/preset-react"]
}

// 말고도 다양한 설정을 할수 있습니다.
// @babel/preset-env: 최신 JavaScript 문법(ES6, ES7 등)을 변환해주는 프리셋. 환경에 맞게 필요한 변환만 적용하는 기능도 있습니다.
// @babel/preset-typescript: TypeScript 코드를 JavaScript로 변환하는 프리셋입니다.
```

## 빌드를 위한 폴더구조 및 빌드 스크립트 작성
- 루트에 src 폴더를 만들고 app.js 파일을 만들어 html script에 작성했던 JSX스크립트를 옮겨줍니다.

![cra](/CRA8.png)

- package.json에 다음과 같이 작성해줍니다.

```json
{
  "name": "react-app-without-cra",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "directories": {
    "test": "test"
  },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    // src에 있는 모든 파일을 트랜스파일하여 dist라는 폴더로 옮겨줘
    // src와 dist말고도 다른 폴더명을 정할 수 있지만 관행적으로 src와 dist라는 이름을 사용합니다.
    "build": "babel src --out-dir dist"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@babel/cli": "^7.24.8",
    "@babel/core": "^7.25.2",
    "@babel/preset-react": "^7.24.7"
  }
}
```

- 이제 npm run build를 실행하면 다음과 같이 dist 폴더에 app.js라는 스크립트 파일이 생성된걸 볼 수 있습니다.

![cra](/CRA9.png)

- 파일을 열어보니 src에 있는 JSX 스크립트가 Javascript로 변환된 것을 볼 수 있습니다.

## index.html에서 빌드된 dist 폴더의 스크립트를 실행하도록 수정
- npm으로 Babel 패키지를 다운 받았으니 Babel CDN은 지워주고 index.html 파일을 다음과 같이 수정합니다.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>React App Without CRA</title>
    <script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
</head>
<body>
    <div id="root"></div>
    // 빌드된 dist폴더 안에 있는 app.js를 실행시켜줘
    <script src="dist/app.js"></script>
</body>
</html>
```
- 이렇게 하면 저번 포스트에서 발생했던 에러가 해결됩니다.

![cra](/CRA10.png)

## webpack과 통합하기
- 이런 트랜스파일 작업은 일반적으로 webpack과 같은 번들러와 통합하여 운영합니다.
- 다음 post에서 webpack과 통합해 보도록 하겠습니다.