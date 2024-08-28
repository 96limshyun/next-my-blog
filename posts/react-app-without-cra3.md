---
title: CRA없이 React 앱 구성하기.3
date: 2024-07-06
content: webpack 적용하기
category: All, React
---

- 저번 post에서 Babel을 적용해 보았습니다.
- 그런데, Babel 공식 문서에 따르면, Babel은 이렇게 독립적으로 사용하지 않고, 보통 번들러와 통합하여 운영한다고 합니다.

## 번들링이란?
- 저번 post에서 src/app.js라는 파일 하나만 정의했습니다.
- 하지만, 보통 실제 개발할때 이런 식으로 하나의 파일 안에 모든 로직을 몰아서 넣지는 않습니다.
- 개발 단계일때는 유지보수성을 위해 파일을 분리하고, 배포 단계에서는 파일 수를 최소화하는 것이 유리합니다.

- 직접 계산기를 만들어보며 예시를 보겠습니다.
- 다음과 같이 덧셈, 뺄셈, 곱셈, 나눗셈 함수를 각각 utils폴더에 생성한 후, app.js에서 모두 불러옵니다.

![cra](/CRA11.png)

- 위와 같이 모두 console로 실행시킨뒤 npm run build로 빌드하면 다음과 같이 dist폴더 안에 트랜스파일이 되었습니다.

![cra](/CRA12.png)

- 그런데 index.html 을 실행해보니 다음과 같이 에러가 납니다.

![cra](/CRA13.png)

- 위 에러는 ES모듈이 아닌 곳에서 import 문법을 사용할 수 없다는 것입니다.
- html 파일 script 태그에 type="module"이라고 명시해주면 해결됩니다.

![cra](/CRA14.png)

- 이제 잘 동작합니다. 하지만 문제가 있습니다.
- 네트워크 탭을 보면 다음과 같이 스크립트 파일이 여러개 로드된 것을 볼 수 있습니다.

![cra](/CRA15.png)

- app.js에서 import 했던 모든 파일이 로드되고 있습니다. 무엇이 문제일까요?
- 스크립트가 로드 되었다는 것은 HTTP 요청을 통해 서버로부터 스크립트를 응답받았다는 것 입니다.
- 즉, 10개의 스트립트를 로드했다면, 10번의 HTTP요청이 있었다는 것입니다.
- 한번의 요청에는 하나의 HTTP 요청과 응답에 걸리는 시간 뿐 아니라, 브라우저는 한 도메인 당 한번에 요청 할 수 있는 connection을 최대 6개로 제한하고 있습니다.
- 10개를 요청했다면 먼저 요청된 6개의 스크립트가 완전히 로드될때까지 나머지 4개는 waiting 상태에 걸린다는 것입니다.
- 따라서, HTTP 요청은 가급적 최소화 해야 합니다.
- 하지만, 지금은 계산 결과 출력을 위해 불필요하게 많은 모듈들을 로드하고 있습니다.
- 따라서 HTTP요청을 최소화하기 위해, 분리된 모듈을 다시 통합하는 과정이 필요합니다.
- 이 과정을 **번들링** 이라고 하며, webpack, Rollup과 같은 번들러들이 담당하는 주요 기능입니다.

## webpack 설정하기
- 빌드 타임에서 webpack을 실행하기 위한 패키지 2개를 설치해줍니다.
```
npm install --save-dev webpack webpack-cli
```
- Babel과 통합하기 위한 babel-loader도 같이 설치해 줍니다.
```
npm install --save-dev babel-loader  
```

- package.json에 설치된 패키지가 devDependencies에 추가된 것을 확인하고 .webpack.config.js파일을 만들어 webpack 설정을 해줍니다.
- webpack은 build 환경인 Node.js 환경에서 실행되기 때문에 CommonJS문법을 사용해야합니다.

```
const path =require("path");
module.exports = {
    // 번들링의 시작점을 지정해준다.
    entry: "./src/app.js",
    // 번들링 결과물을 어디에 저장할 것인지.
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
    },
    // 모듈 옵션, 다양한 파일 형식을 어떻게 처리할 것인지 지정(.js, .jsx, .ts, .tsx, .css, .scss 등)
    module: {
        // 어떤 확장자를 babel-loader로 처리할 것인지.
        rules: [
            {
                test: /\.js$/,
                // node_modules는 이미 실행 가능한 형태로 build되어 있기 때문에, 번들링에서 제외 시켜준다.
                exclude: /node_modules/,
                use: {
                    // js 파일에 babel-loader를 사용하도록 설정
                    loader: "babel-loader",
                }
            }
        ]
    },
};
```
- 마지막으로, package.json에 build명령어를 webpack으로 변경해줍니다.
```
"build": "webpack"
```

- 이제 npm run build 하면 다음과 같이 dist 폴더안에 bundle.js라는 이름의 파일이 생성된 것을 볼 수 있습니다.

![cra](/CRA16.png)

- bundle.js 파일을 보면 webpack으로 통합된 것을 볼 수 있습니다.

- 이제 html 파일에서 스크립트에 bundle.js 파일을 실행하도록 수정하고 실행해봅니다.

![cra](/CRA17.png)

- 전과 달리 add.js, subtract.js, multiply.js, divide.js 파일을 여러개 불러오는 것이 아닌 통합된 bundle.js 파일 하나만 불러오는 것을 확인할 수 있습니다.(react.production.min.js, react-dom.production.min.js파일은 html에 CDN으로 불러온 패키지 파일이고, contentscript.js는 브라우저 확장 프로그램에 사용되는 스크립트 파일입니다.)

- 하지만 빌드 과정에서 아래와 같은 WARNING이 발생합니다.
![cra](/CRA18.png)

- 번들러 실행 모드를 따로 설정해주지 않았다는 것인데, webpack의 두 가지 모드에 대해 알아보겠습니다.

## webpack의 두 가지 모드
- WARNING은 webpack 모드를 설정하지 않아 생긴 경고 입니다.
- webpack의 mode속성은 development(개발), production(배포), 두 가지 값을 가질 수 있습니다.
- 두 옵션의 차이는 크게 빌드 속도와 코드 최적화 여부에 있습니다.
- 두 옵션으로 빌드하고 결과를 보겠습니다.

1. development(개발)
![cra](/CRA19.png)

2. production(배포)
![cra](/CRA20.png)

- development은 277ms, production는 340으로, 프로젝트 규모가 작아 차이는 별로 안나지만 production 모드가 더 오래 걸리는 것을 볼 수 있습니다.

## 왜 production모드가 더 오래 걸릴까?
- 빌드된 bundle.js 파일을 보면 왜 그런지 알 수 있습니다.

1. development(개발)
![cra](/CRA21.png)

- 우리가 사용했던 addNumber 같은 함수명이 그대로 코드 상에 남아 있습니다.
  
2. production(배포)
![cra](/CRA22.png)

- 반면 production으로 빌드한 bundle은 addNumber함수명을 찾을 수 없고 코드 자체가 훨씬 적어졌습니다.

## 왜 두 모드의 빌드 결과가 다를까?
- 그 이유는 production 모드로 빌드 시 상수 폴딩, 트리 쉐이킹, 코드 스플리팅, 코드 난독화 등과 같은 최적화 기법이 자동으로 적용되기 때문입니다.
- production 모드에서는 위와 같은 최적화가 적용되기 때문에 상대적으로 빌드 속도가 느린 것 입니다.

1. 상수 폴딩
   -  상수 폴딩(Constant Folding)은 컴파일러 최적화 기술 중 하나로, 컴파일 시점에 계산이 가능한 상수 표현식을 미리 계산하여 최적화하는 방법입니다. 즉, 프로그램이 실행되기 전에 컴파일러가 수학적 계산을 미리 수행해 코드 효율성을 높이는 기법입니다.
   -  production으로 빌드된 bundle.js를 보면 addNumber같은 함수가 없고 console 되어 있는것이 상수 폴딩이 적용되었기 때문입니다.
2. 트리 쉐이킹
   - 트리 쉐이킹은 사용하지 않는 코드를 제거하는 최적화 기술입니다. 주로 ES6 모듈 시스템을 사용한 코드에서 불필요한 모듈을 번들링에서 제거하는 데 사용됩니다. 애플리케이션에서 사용되지 않는 함수나 모듈을 자동으로 감지하여 번들에서 제외함으로써 파일 크기를 줄입니다.

3. 코드 스플리팅
   - 코드 스플리팅은 애플리케이션을 여러 개의 작은 청크(chunk)로 나누어 필요한 시점에만 로드할 수 있도록 하는 기술입니다. 이를 통해 초기 로딩 시간을 단축하고, 불필요한 코드가 한꺼번에 로드되지 않도록 최적화할 수 있습니다.

4. 코드 난독화
   - 코드 난독화는 코드를 읽기 어렵게 변환하여 소스 코드를 보호하는 기술입니다. 이를 통해 코드의 가독성을 낮추고, 리버스 엔지니어링이나 코드 도용을 어렵게 만듭니다. 주로 상업용 애플리케이션에서 소스 코드 보호를 위해 사용됩니다.

- 실행 속도보다 빌드 속도가 더 중요한 개발 단계, 즉, development 모드에서는 이과정을 의도적으로 생략하기 때문에 빌드 속도가 빠른 것입니다.
- 저희는 개발단계이기 때문에 development로 설정하겠습니다.
```
// webpack.config.js
const path =require("path");
module.exports = {
    entry: "./src/app.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                }
            }
        ]
    },
    mode: "development"
};
```