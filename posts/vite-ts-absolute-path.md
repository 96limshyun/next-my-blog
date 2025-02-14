---
title: Vite, Ts 절대경로 설정
date: 2024-12-30
content: Vite, Ts 환경에서 절대경로 설정하기
category: React, All
---

- Vite, Typescript 환경에서 프로젝트를 시작할 때 절대경로와 임포트 순서를 설정하고 있습니다.
- 매번 프로젝트를 할때마다 찾아보고 적용은 하지만, 적용 후 잊어버리고 다시 프로젝트를 하면 또 찾아보는 일이 반복되다보니, 이번 기회에 제대로 학습하고 블로그에 기록으로 남겨두려 합니다.
- 이번 포스트에서는 절대경로 설정하는 것만 다루고 다음 포스트에 임포트 순서를 설정하는 것을 다루겠습니다.

## 절대경로 설정
- Vite, Javascript 환경에서는 vite.config.js 파일에만 옵션을 설정해주면 되지만, 저는 Typescript를 사용하기 때문에 Typescript 기준으로 작성하겠습니다.
- Vite, Typescript 환경에서는 vite.config.js와 tsconfig.app.json 파일 둘다 설정을 해줘야합니다.
- [vite resolve.alias](https://ko.vitejs.dev/config/shared-options.html#resolve-alias)

### vite.config.js 설정
-  vite에서는 resolve.alias 설정을 사용해 경로를 지정할 수 있습니다.
-  alias 배열안에 객체 형태로 find, replacement를 입력하면 됩니다.
   -  find: 대체할 문자열
   -  replacement: 실제 경로(절대 경로를 입력해야함)
- 이때 replacement에는 절대 경로를 입력해야 하는데 절대 경로를 쉽게 추출하기 위해 path를 사용합니다.

#### path, __dirname
- path는 운영체제에 맞는 경로를 자동으로 생성해줍니다.
- 운영체제마다 파일 경로 표기 방식이 다르기 때문에 path를 사용해 운영체제에 맞는 절대경로를 생성합니다.
  - Windows → C:\Users\myuser\project\src
  - macOS/Linux → /Users/myuser/project/src
- path.resolve(...paths)는 여러 개의 경로를 인자로 받아 절대경로를 생성합니다.
- __dirname은 현재 위치한 디렉토리 경로를 가리킵니다.
- path.resolve(__dirname, "src") 이렇게 하면 현재 위치한 디렉토리 경로의 src 파일을 가리키게 됩니다.
- 저는 아래와 같이 설정했습니다.

#### 설정
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "src") },
      { find: "@components", replacement: path.resolve(__dirname, "src/components") },
      { find: "@pages", replacement: path.resolve(__dirname, "src/pages") },
      { find: "@utils", replacement: path.resolve(__dirname, "src/utils") }
    ]
  }
});
```

### tsconfig.app.json 설정
- tsconfig.node.json과 tsconfig.app.json이 있는데, 브라우저에서 실행될 src 파일만 절대경로를 설정할거기 때문에 tsconfig.app.json에 설정을 합니다.
- tsconfig.app.json에서 paths 옵션을 설정하면 vite.config.js에서 설정한 alias를 Typescript가 인식할 수 있도록 할 수 있습니다.
- 아래와 같이 설정합니다.

```json
{
  "compilerOptions": {
    ...
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@pages/*": ["src/pages/*"],
      "@utils/*": ["src/utils/*"]
    }
  },
  ...
}
```

- baseUrl은 경로를 해석할 때 기준이 되는 루트 디렉토리를 설정합니다.
  - "./"로 설정하면 루트 디렉토리를 기준으로 경로 해석
  - "src"로 설정하면 src 디렉토리를 기준으로 경로 해석
- paths에는 절대 경로를 지정하고 싶은 경로들을 **별칭:경로** 순으로 입력하면 됩니다.
- 이렇게 하면 아래와 같이 결과가 나옵니다.

```tsx
import Component1 from "@components/Component1";
import Page1 from "@pages/Page1";
import util1 from "@utils/util1";

function App() {
    util1();
    return (
        <>
            <Component1/>
            <Page1/>
        </>
    );
}

export default App;

```




