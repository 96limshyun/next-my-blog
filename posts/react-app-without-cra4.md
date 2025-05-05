---
title: CRA없이 React 앱 구성하기.4
date: 2024-07-11
content: Plugin 적용하기
category: All, React
---

## Plugin 적용해보기
- Plugin은 프로그램에서 기능을 확장하거나 추가할 수 있게 해주는 작은 소프트웨어 모듈 또는 컴포넌트입니다.
- Plugin을 왜 사용해야 하는지 직접 보며 적용해보겠습니다.
- 먼저 저번에 빌드 했던 dist폴더를 삭제한 후 webpack.config.js파일을 다음과 같이 수정합니다.
```js
const path =require("path");
module.exports = {
    entry: "./src/app.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.[hash].js",
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
- webpack에서는 파일명에 이렇게 [hash]값을 붙이면, 번들 파일에 해쉬값이 자동으로 붙습니다.
- 이제 빌드를 하면 다음과 같이 hash값이 붙습니다.

![cra](/CRA23.png)

- 이제 index.html 파일을 실행하면 실행되지 않습니다. 
- 당연히 되지 않습니다. 왜냐하면, 저희는 index.html 파일에서 해쉬값이 붙지 않은 bundle.js파일을 로드하고 있기 때문입니다.
```html
<script src="dist/bundle.js" type="module"></script>
```
- 파일명이 변경되었으니 변경된 bundle 파일을 스크립트 태그에 적용하면 정상적으로 실행됩니다.
```html
<script src="dist/bundle.f27563c305c6f77adbc5.js" type="module"></script>
```

- 하지만, hash값은 소스코드가 변경되면 빌드 할때마다 변경됩니다. 소스코드가 변경될 때마다 새로 생성된 bundle.[hash].js 파일을 매번 index.html 파일에 적용해 주어야 합니다. 이는 굉장히 번거롭고 불편합니다.
- 이럴때 사용하는 것이 html-webpack-plugin 입니다.

## html-webpack-plugin
- html-webpack-plugin을 적용해 봅시다. 먼저 설치를 합니다.
```bash
npm install --save-dev html-webpack-plugin
```
- webpack.config.js 파일을 수정해줍니다.
```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
    entry: "./src/app.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.[hash].js",
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
    mode: "development",
    plugins: [
        new HtmlWebpackPlugin({
            template: "./index.html",
            filename: "index.html",
        })
    ]
};
```
- 이제 빌드를 해보면 dist 폴더 안에 html 파일이 하나 생성된 것을 볼 수 있고, bundle.[hash].js 파일 경로가 잘 설정되어 있는것을 볼 수 있습니다.
- 파일을 실행해보면 빌드된 Js 코드가 잘 실행되는 것을 볼 수 있습니다.
![cra](/CRA24.png)

## Plugin이란?
- 앞에서 적용해본것 처럼 Plugin이란, **빌드 프로세스의 특정 시점에 후킹되어 추가 기능을 수행하는 확장 모듈**입니다.

- 앞으로 빌드 환경을 구성하는 과정에서 뭔가 불편한 점이 느껴진다면, 적절한 Plugin을 찾아 plugins 배열에 전달해주면 됩니다.
- 유용한 Plugin은 다음 사이트에서 찾아보며 학습하면 될 것 같습니다.
- awesome webpack: "https://webpack.js.org/awesome-webpack/"
- webpack plugins API: "https://webpack.js.org/api/plugins/"

## clean-webpack-plugin
- 지금까지는 빌드하기 전, 이전 빌드의 결과물이 남아있지 않도록 dist 폴더를 일일이 제거해주었습니다.
- clean webpack plugin를 적용하면, 이 작업을 자동화 할 수 있습니다.
- 먼저 clean webpack plugin를 설치 줍니다.
```bash
npm install clean-webpack-plugin
```

- webpack.config.js 파일을 수정해줍니다.
```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
module.exports = {
    entry: "./src/app.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.[hash].js",
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
        ],
    },
    mode: "development",
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: "./index.html",
            filename: "index.html",
        }),
    ],
};
```
- 이제 빌드를 해보면 전에 있던 빌드 결과물이 남아있지 않는 것을 볼 수 있습니다.
![cra](/CRA25.png)

## 개발서버 webpack-dev-server
- CRA, vite으로 시작하는 프로젝트는 npm start, npm run dev 명령어를 입력하면 개발 서버가 시작되는 것을 볼 수 있습니다.
- 이번에는 개발서버를 적용해 보겠습니다.
- 먼저 webpack-dev-server를 설치해줍니다.
```bash
npm install --save-dev webpack-dev-server
```

- webpack.config.js와 package.json 파일을 다음과 같이 수정해줍니다.
```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
module.exports = {
    entry: "./src/app.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.[hash].js",
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
        ],
    },
    mode: "development",
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: "./index.html",
            filename: "index.html",
        }),
    ],
    // devServer는 기본적으로 빌드 폴더의 index.html파일을 찾아 실행하기 때문에, 
    // 이럭식으로 빌드 폴더 경로만 설정해주면 됩니다.
    devServer: {
        static: {
            directory: path.join(__dirname, "dist"),
        },
        port: 9000,
        open: true,
    }
};
```
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
    "start": "webpack serve",
    "build": "webpack"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@babel/cli": "^7.24.8",
    "@babel/core": "^7.25.2",
    "@babel/preset-react": "^7.24.7",
    "babel-loader": "^9.1.3",
    "html-webpack-plugin": "^5.6.0",
    "webpack": "^5.94.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^5.0.4"
  },
  "dependencies": {
    "clean-webpack-plugin": "^4.0.0"
  }
}
```

- 이제 npm start를 실행하면 개발서버가 잘 실행되는 것을 볼 수 있습니다.
- 또한, 코드가 변경되어도 개발 서버에 실시간으로 잘 반영되는 것을 볼 수 있습니다.

## 환경변수 관리 dotenv-webpack
- 보통 API 호출을 위한 도메인 관리를 환경 변수로 하는 것이 일반적입니다.
- webpack에서 이런 환경 변수를 관리할 수 있는 패키지가 바로 dotenv-webpack 이라는 플러그인 입니다.
- 설치를 해줍니다.
```bash
npm install --save-dev dotenv-webpack
```
- 환경 변수 파일은 보통 .env라는 파일명 뒤에 어떤 환경에 대한 파일인지를 접미사로 나타냅니다.
- 다음과 같이 개발, 배포 환경의 .env 파일을 만들고 환경변수를 넣어 줍니다.

![cra](/CRA26.png)

- 환경 변수를 출력하기 위해 app.js에 환경 변수를 불러옵니다.
```js
import { addNumber } from "./utils/add.js";
import { subtractNumber } from "./utils/subtract.js";
import { multiplyNumber } from "./utils/multiply.js";
import { divideNumber } from "./utils/divide.js";

console.log(addNumber(1, 1));
console.log(subtractNumber(1, 1));
console.log(multiplyNumber(1, 1));
console.log(divideNumber(1, 1));
// 환경 변수 불러오기
const App = () => <h1>HELLO REACT {process.env.TEST_API_URL}</h1>;
ReactDOM.render(<App />, document.getElementById("root"));
```
- webpack이 빌드를 시작하면서, 어떤 환경 변수 파일을 사용해야 하는지는 webpack에게 명시적으로 알려줘야 합니다. 이를 위해서 NODE_ENV라는 환경변수를 사용할 수 있습니다.
- webpack.config.js와 package.json 파일을 수정해줍니다.
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
    // NODE_ENV라는 환경 변수값을 각 환경에 맞게 넣어주면,
    // webpack에게 어떤 환경에 대한 빌드 프로세스인지를 알려줄 수 있습니다.
    "start": "NODE_ENV=prd webpack serve",
    "build": "webpack"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@babel/cli": "^7.24.8",
    "@babel/core": "^7.25.2",
    "@babel/preset-react": "^7.24.7",
    "babel-loader": "^9.1.3",
    "dotenv-webpack": "^8.1.0",
    "html-webpack-plugin": "^5.6.0",
    "webpack": "^5.94.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^5.0.4"
  },
  "dependencies": {
    "clean-webpack-plugin": "^4.0.0"
  }
}
```
```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const DotenvWebpack = require("dotenv-webpack")

const buildMode =  process.env.NODE_ENV === "dev" ? "development" : "production"
module.exports = {
    entry: "./src/app.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.[hash].js",
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
        ],
    },
    // NODE_ENV 값이 dev일 때만  development mode로 동작하도록 설정
    mode: buildMode,
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: "./index.html",
            filename: "index.html",
        }),
        new DotenvWebpack({
            // 각 환경에 맞는 파일을 찾아 빌드할 수 있도록 전달한다.
            path: `./.env.${process.env.NODE_ENV || "dev"}`,
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, "dist"),
        },
        port: 9000,
        open: true,
    }
};
```

- 이제 npm start를 하면 각 환경에 맞는 환경변수가 잘 불러와지는 것을 볼 수 있습니다.
- 참고로, 환경 변수값의 변화는 반드시 실행 환경을 종료한 다음, 재실행해야 정상적으로 반영됩니다.

![cra](/CRA27.png)

![cra](/CRA28.png)

## 마무리
- 지금까지 Create React App (CRA) 없이 React 프로젝트를 구성해 보았습니다. 단순히 기본적인 Webpack 설정부터 시작해, 다양한 플러그인을 사용하여 개발 환경을 개선하고 자동화하는 방법을 알아보았습니다. 이 과정을 통해 우리는 React 프로젝트를 더 깊이 이해하고, CRA가 제공하는 자동화된 도구들 없이도 프로젝트를 직접 설정할 수 있는 역량을 키웠습니다.

## 주요 학습 내용 정리:
### Webpack 기본 설정:
- Webpack을 사용하여 React 프로젝트의 번들링을 설정하는 방법을 배웠습니다. entry와 output 옵션을 통해 애플리케이션의 진입점과 번들 파일의 위치를 지정했습니다.

## 플러그인 적용
- html-webpack-plugin을 사용하여 HTML 파일에 번들된 JS 파일을 자동으로 연결하고, clean-webpack-plugin을 사용해 빌드 시 이전 결과물을 자동으로 삭제하는 방법을 적용보았습니다. 이러한 플러그인을 통해 개발 작업을 보다 효율적으로 관리할 수 있습니다.

## 개발 서버 구성
- webpack-dev-server를 사용하여 빠르게 개발 서버를 구축하고, 코드 변경 사항을 실시간으로 반영할 수 있는 환경을 마련했습니다.

## 환경 변수 관리
- dotenv-webpack 플러그인을 사용하여 환경 변수 파일을 관리하고, 각기 다른 환경(개발, 프로덕션)에 따라 다른 설정을 적용하는 방법을 익혔습니다.

## 결론
- 이번 시리즈를 통해 CRA 없이도 충분히 강력한 React 개발 환경을 구축할 수 있음을 확인했습니다. 직접 설정을 하면서 Webpack과 다양한 플러그인들의 동작 방식을 이해할 수 있었고, 이러한 경험은 앞으로의 프로젝트에서 더 유연하고 맞춤화된 환경을 구성하는 데 큰 도움이 될 것입니다.

- 이제 여러분도 자신만의 React 개발 환경을 설정해 보세요. 직접 설정하는 과정을 통해 더 깊은 이해와 자신감을 얻을 수 있을 것입니다.

- 지금까지 읽어주셔서 감사합니다. Happy Coding! 🎉

- 지금까지 다룬 내용은 프론트맨님의 [CRA없이 react 앱 구성하기](https://www.youtube.com/watch?v=V4j-207Umco&list=PLBh_4TgylO6DZ3i77JBPALhHRRh2efOr0&index=7)를 참고하여 작성되었습니다. 더욱 자세한 내용은 해당 영상을 통해 확인하실 수 있습니다. 