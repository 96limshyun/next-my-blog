---
title: CRA없이 React 앱 구성하기.1
date: 2024-06-28
content: CRA없이 React 앱을 구성해보자
category: All, React
---

## CRA란?
- React 앱 개발에 필요한 webpack과 babel, 개발 서버 등 복잡한 설정들을 명령어 하나로 자동화하기 위해 페이스북에서 개발한 CLI도구입니다.
- 복잡한 설정들을 명령어 하나로 모두 수행할 수 있는 간편한 도구를 왜 지양해야 할까요?

## 왜 CRA 사용을 지양해야할까?
1. 커스터마이징의 한계
- CRA의 가장 큰 단점 중 하나는 내부 설정의 커스터마이징이 어렵다는 점입니다. CRA가 제공하는 기본 설정은 대부분의 경우에는 충분할 수 있지만, 프로젝트가 커지고 요구 사항이 복잡해지면 더 세밀한 설정이 필요해집니다.

- 예를 들어, 특정 플러그인을 추가하거나 webpack 설정을 세밀하게 변경해야 할 때는 eject 명령어를 사용해야 하는데, 이 명령어를 실행하면 CRA가 관리하던 설정 파일들이 공개되면서 프로젝트 구조가 복잡해집니다. eject를 실행한 후에는 더 이상 CRA의 업데이트를 받을 수 없고, 직접 모든 설정을 관리해야 합니다.

- 또한, react-app-rewired와 같은 라이브러리로 CRA 설정을 수정할 수 있지만, 이러한 라이브러리도 결국에는 제한적인 범위 내에서만 설정을 변경할 수 있다는 한계가 있습니다.

2. 웹 개발에 대한 이해도를 높일 수 있음
- CRA를 사용하면 개발자는 편리하게 프로젝트를 시작할 수 있지만, 정작 중요한 설정 파일이나 빌드 과정에 대한 이해는 부족하게 될 수 있습니다. 직접 webpack이나 babel 설정을 다뤄보지 않으면, 다음과 같은 중요한 개념을 놓치기 쉽습니다:

  - webpack: 모듈 번들러로서 다양한 자바스크립트 파일, 이미지, 스타일시트 등을 하나의 번들 파일로 묶는 역할을 합니다. 이를 통해 더 빠르고 효율적인 웹 사이트 로딩을 가능하게 합니다.
  - babel: 최신 자바스크립트 문법을 구형 브라우저에서도 실행할 수 있게 트랜스파일링(transpiling) 해주는 도구입니다. 또한 JSX 문법을 자바스크립트로 변환하는 데 필수적입니다.
  - JSX의 변환 과정: JSX는 실제로는 자바스크립트로 변환되는데, 이를 babel이 처리합니다. 직접 설정을 하다 보면 이 변환 과정에 대한 깊은 이해를 얻을 수 있습니다.
- 직접 webpack과 babel을 설정해보면, 단순히 도구에 의존하는 것이 아니라 개발 과정의 근본적인 부분을 이해하게 되어, 전반적인 웹 개발 실력을 향상시킬 수 있습니다.

# CRA 없이 React 앱 구성하기
## 초기 index.html 파일 구성
- 먼저 html의 기본적인 구조를 잡아줍니다.
```
<!DOCTYPE html>
<html lang="en">
<head>
    <title>React App Without CRA</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>
```

## React 앱 구성에 필요한 패키지 설치(React, ReactDOM)
- 가장 최소한의 형태로 React앱을 구성하기 위해 React / ReactDOM 패키지를 CDN을 통해 로드해줍니다.
- 이 방식을 통해, 내 Local에 따로 설치하지 않고도 패키지 사용이 가능합니다.
- unpkg.com 사이트를 이용해 npm에 등록된 거의 모든 패키지를 CDN으로 이용 가능합니다.
- 여기서 18버전의 React와 ReactDOM 패키지를 가져오도록 하겠습니다.
  - React: "https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  - ReactDOM: "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"

```
<!DOCTYPE html>
<html lang="en">
<head>
    <title>React App Without CRA</title>
    <script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
</head>
<body>
    <div id="root"></div>
</body>
</html>
```
- 위와 같이 구성 후 index.html 파일을 실행한 후 개발자 도구를 통해 React, ReactDOM이 정상적으로 로드되었는지 확인해 봅시다.

![cra](/CRA1.png)

![cra](/CRA2.png)

## 스크립트 태그 안에 React 코드를 넣어보자
- CRA로 React앱을 처음 만들면 index.js파일이 다음과 같이 생긴 것을 확인할 수 있습니다.

![cra](/CRA3.png)

- 이걸 그대로 스크립트 태그에 정의하고 다시 실행해 보겠습니다.
```
<!DOCTYPE html>
<html lang="en">
<head>
    <title>React App Without CRA</title>
    <script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script>
        const App = () => {
            return <h1>HELLO REACT</h1>
        }
        const root = ReactDOM.createRoot(document.getElementById("root"))
        root.render(
            <React.StricMode>
                <APP/>
            </React.StricMode>
        )
    </script>
</body>
</html>
```

![cra](/CRA4.png)

- 다음과 같이 스크립트에 문법적인 오류가 있다는 Syntax Error가 발생합니다.

## 왜 이런 에러가 날까요?
- React를 많이 다뤄보신 분들이라면 스크립트 중간에 아래와 같은 태그가 들어가는 것이 이상한 모습이 아닐겁니다.
```
<h1>HELLO REACT</h1>
<React.StricMode>
    <APP/>
</React.StricMode>
```

- 사실 이것은 전통적인 자바스크립트 문법이 아닌 JSX문법입니다.
- 현재로써는 JSX 문법을 사용할 수 있는 방법이 없어 JSX없이 컴포넌트를 생성해야는데 다행이도 React에서 createElement(태그, props, children)를 통해 이를 지원하고 있습니다.

```
<!DOCTYPE html>
<html lang="en">
<head>
    <title>React App Without CRA</title>
    <script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script>
        const App = () => React.createElement("h1", null, "HELLO REACT")
        const root = ReactDOM.createRoot(document.getElementById("root"))
        ReactDOM.render(
            // App이라는 컴포넌트를
            React.createElement(App),
            // root라는 id를 가진 태그 안에 rendering 한다.
            document.getElementById("root")
        )
    </script>
</body>
</html>
```
- 위와 같이 createElement를 사용하면 다음과 같이 "HELLO REACT"가 잘 나옵니다.

![cra](/CRA5.png)

- 이렇게 JSX 없이도 앱을 만들수 있지만 이런 방식의 컴포넌트 정의는 굉장히 불편합니다.

## 그럼 어떻게 JSX문법을 사용할 수 있을까?
- 이때 사용하는것이 트랜스파일러(Bable 등) 입니다.
- 쉽게 말하면 최신 문법의 자바스크립트를 구버전의 문법으로 바꿔주는 역할을 합니다.
- 여기서 말하는 최신 문법에는 JSX같은 확장 문법이 포함됩니다.

- 다음 post에서 Babel을 적용하고 createElement가 아닌 JSX로 React앱을 바꿔보도록 하겠습니다.