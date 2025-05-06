---
title: React는 어떻게 JSX를 구분할까?
date: 2025-05-06
content: React는 $$typeof로 모든 걸 구분한다.
category: React, All
---

- React를 사용할 때 우리는 JSX 문법으로 작성된 컴포넌트를 아래와 같이 자연스럽게 사용하고 있습니다.

```jsx
const App = () => {
  return <div>Hello React</div>;
};
```

- 하지만 이처럼 작성된 JSX는 브라우저에서 직접 해석될 수 없습니다.
- JSX는 문법 설탕(syntactic sugar)일 뿐이며, 실제로는 React.createElement()로 변환되어 JavaScript 객체가 만들어집니다.
- 그렇다면 `provider`, `forward_ref`, `Portal`, `suspense`과 같은 고급 기능들은 JSX로 작성했을 때 어떻게 내부적으로 JSX를 구분할까요?
- 이번 글에서는 React 내부의 Symbol 시스템을 통해 JSX가 어떻게 구분되는지 알아보겠습니다.

## JSX는 결국 React.createElements로 변환된다.
- JSX는 Babel등을 통해 컴파일되면 다음과 같이 변환됩니다.

```tsx
const element = React.createElement('div', null, 'Hello React');
```

- React의 공식 문서를 보면 createElement는 다음과 같은 객체를 반환합니다.

```bash
- 반환값
createElement는 아래 프로퍼티를 가지는 React 엘리먼트 객체를 반환합니다.

type: 전달받은 type.
props: ref와 key를 제외한 전달받은 props.
ref: 전달받은 ref. 누락된 경우 null.
key: 전달받은 key를 강제 변환한 문자열. 누락된 경우 null.
```

## 직접 확인해보자.
- 실제로 React.createElement()가 어떤 객체를 반환하는지 직접 확인해보았습니다.
- 아래와 같은 테스트 코드를 작성했습니다.

```tsx
import { createElement } from "react";

function Component() {
  return createElement("h1", { className: "greeting" }, "Hello");
}

const App = () => {

  console.log(<Component/>)
  return (
    <>
      <Component/>
    </>
  );
};

export default App;
```

- 여기서 <Component />는 내부적으로 createElement(Component, null)로 변환됩니다.
- 이 함수(createElement)의 원본 정의를 따라가보면 다음과 같은 구현을 확인할 수 있습니다

```ts
exports.createElement = function (type, config, children) {
  // ... 중략 ...
  return ReactElement(type, key, void 0, void 0, null, props);
};
```

- 내부에서 어떤 동작이 이루어지는 보지않고 저는 반환값만 확인하겠습니다.
- ReactElement를 반환하는군요. ReactElement로 이동하겠습니다.

## ReactElement의 정체는?
- ReactElement 함수는 다음과 같은 객체를 반환합니다.

```js
function ReactElement(type, key, self, source, owner, props) {
  self = props.ref;
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    key: key,
    ref: void 0 !== self ? self : null,
    props: props
  };
}
```
- 바로 여기서 우리가 주목해야 할 핵심 속성이 등장합니다.
- 그것은 바로 $$typeof입니다.
- 위에서 createElement는 전달받은 `{ type, props, ref, key }`를 반환한다 했는데, `$$typeof: REACT_ELEMENT_TYPE`이라는 값이 존재합니다.
- `$$typeof`가 뭘 의미하는 걸까요?

## JSX 타입은 $$typeof로 구분된다.
- `$$typeof`는 React 내부에서 사용하는 특수한 식별자입니다.
- 이 값은 Symbol로 정의되어 있으며, React 요소가 어떤 종류의 요소인지를 구분하는 데 사용됩니다.
- 이 심볼 값 덕분에 React는 이 객체가 일반 DOM 요소인지, 포탈인지, 프래그먼트인지 등을 정확히 구분할 수 있습니다.
- 실제로 다음과 같은 타입으로 JSX를 구분합니다.
- 이 타입들이 궁금해 React GitHub에 들어가 소스코드를 탐색해 보았습니다.

[React GitHub](https://github.dev/facebook/react/tree/main/fixtures/legacy-jsx-runtimes/react-14/cjs/react-jsx-dev-runtime.development.js)

```js
// ATTENTION
// When adding new symbols to this file,
// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
// The Symbol used to tag the ReactElement-like types. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.
var REACT_ELEMENT_TYPE = 0xeac7;
var REACT_PORTAL_TYPE = 0xeaca;
exports.Fragment = 0xeacb;
var REACT_STRICT_MODE_TYPE = 0xeacc;
var REACT_PROFILER_TYPE = 0xead2;
var REACT_PROVIDER_TYPE = 0xeacd;
var REACT_CONTEXT_TYPE = 0xeace;
var REACT_FORWARD_REF_TYPE = 0xead0;
var REACT_SUSPENSE_TYPE = 0xead1;
var REACT_SUSPENSE_LIST_TYPE = 0xead8;
var REACT_MEMO_TYPE = 0xead3;
var REACT_LAZY_TYPE = 0xead4;
var REACT_BLOCK_TYPE = 0xead9;
var REACT_SERVER_BLOCK_TYPE = 0xeada;
var REACT_FUNDAMENTAL_TYPE = 0xead5;
var REACT_SCOPE_TYPE = 0xead7;
var REACT_OPAQUE_ID_TYPE = 0xeae0;
var REACT_DEBUG_TRACING_MODE_TYPE = 0xeae1;
var REACT_OFFSCREEN_TYPE = 0xeae2;
var REACT_LEGACY_HIDDEN_TYPE = 0xeae3;

if (typeof Symbol === 'function' && Symbol.for) {
  var symbolFor = Symbol.for;
  REACT_ELEMENT_TYPE = symbolFor('react.element');
  REACT_PORTAL_TYPE = symbolFor('react.portal');
  exports.Fragment = symbolFor('react.fragment');
  REACT_STRICT_MODE_TYPE = symbolFor('react.strict_mode');
  REACT_PROFILER_TYPE = symbolFor('react.profiler');
  REACT_PROVIDER_TYPE = symbolFor('react.provider');
  REACT_CONTEXT_TYPE = symbolFor('react.context');
  REACT_FORWARD_REF_TYPE = symbolFor('react.forward_ref');
  REACT_SUSPENSE_TYPE = symbolFor('react.suspense');
  REACT_SUSPENSE_LIST_TYPE = symbolFor('react.suspense_list');
  REACT_MEMO_TYPE = symbolFor('react.memo');
  REACT_LAZY_TYPE = symbolFor('react.lazy');
  REACT_BLOCK_TYPE = symbolFor('react.block');
  REACT_SERVER_BLOCK_TYPE = symbolFor('react.server.block');
  REACT_FUNDAMENTAL_TYPE = symbolFor('react.fundamental');
  REACT_SCOPE_TYPE = symbolFor('react.scope');
  REACT_OPAQUE_ID_TYPE = symbolFor('react.opaque.id');
  REACT_DEBUG_TRACING_MODE_TYPE = symbolFor('react.debug_trace_mode');
  REACT_OFFSCREEN_TYPE = symbolFor('react.offscreen');
  REACT_LEGACY_HIDDEN_TYPE = symbolFor('react.legacy_hidden');
}
```

- 이처럼 React는 초기에는 숫자를 기본값으로 설정하고, 환경이 Symbol을 지원하면 런타임에 Symbol을 덮어씌워 사용합니다.
- React는 JSX를 단순히 문자열이나 DOM 노드처럼 취급하지 않습니다.
- JSX는 이처럼 내부에 있는 $$typeof를 기준으로 철저하게 타입을 구분합니다.
- 이를 통해 다양한 구조의 React 요소들—컴포넌트, 포탈, 프래그먼트, 서스펜스 등—을 유연하게 처리할 수 있는 것이죠.

## createPortal과 같은 훅도 직접 만들 수 있다?
- 위의 심볼 타입을 활용하면 ReactDOM.createPortal을 사용하지 않고도, 다음과 같이 포탈 객체를 수동으로 생성할 수 있습니다.

```tsx
import { ReactNode } from "react";

import { createPortal } from "@/createPortal";

const App = () => {
  return (
    <div style={{ border: '2px solid black' }}>
      <p>This child is placed in the parent div.</p>
      {createPortal(
        <p>This child is placed in the document body.</p>,
        document.body
      ) as unknown as PortalNode}
    </div>
  );
};

export default App;
```

```tsx
import { ReactNode } from "react";

import { isValidContainer } from "@/utils";

export interface PortalLike {
  $$typeof: symbol | number;
  key: string | null;
  children: ReactNode;
  containerInfo: Element | DocumentFragment;
};

export const createPortal = (
  children: ReactNode,
  container: Element | DocumentFragment,
  key?: string | number
): PortalLike => {

  if (!isValidContainer(container)) {
    throw Error("Target container is not a DOM element.");
  }

  return {
    $$typeof: Symbol.for('react.portal'), // 포탈 타입을 반환
    key: key === null ? null : String(key),
    children,
    containerInfo: container,
  };
};
```

```tsx
export const isValidContainer = (container: Element | DocumentFragment) => {
  if(!container) return false;
  return container.nodeType === 1 || // Element
         container.nodeType === 9 || // Document
         container.nodeType === 11 // DocumentFragment
};
```

- 이 객체를 반환하는 컴포넌트를 JSX에서 사용하면, React는 실제 포탈로 인식하고 document.body에 해당 내용을 렌더링합니다.

## 마무리
- React는 우리가 작성한 JSX를 단순히 “HTML처럼 생긴 무언가”로 해석하지 않습니다.
- 모든 JSX는 결국 React.createElement()를 통해 객체화된 구조로 변환되며,
- 이 객체는 내부의 `$$typeof`를 통해 자신이 어떤 종류의 요소인지를 명확히 표현합니다.
- 이를 통해 다양한 구조의 요소(컴포넌트, 포탈, 프래그먼트 등)를 유연하게 처리할 수 있는 것이죠.

- 만약 직접 포탈 객체를 생성하거나 커스텀 렌더러를 만들 계획이 있다면, 이 Symbol 기반 시스템을 이해하는 것이 매우 큰 도움이 될 것입니다.