---
title: CRA없이 React 앱 구성하기.4
date: 2024-07-11
content: webpack의 development, production 모드와 Plugin
category: All, React
---

## webpack의 두 가지 모드
- 저번 post에서 WARNING은 webpack 모드를 설정하지 않아 생긴 경고 입니다.
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

## Plugin 설치
