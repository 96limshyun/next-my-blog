---
title: React state 업데이트 큐
date: 2024-07-26
content: state 업데이트 큐를 알아보고 이를 구현해보자
category: React, All
---

- state 변수를 설정하면 다음 렌더링 큐에 들어갑니다. 이번 post에서는 "batching"이란 무엇이며, React가 여러 state 업데이트를 처리하는 방법에 대해 알아보겠습니다.

## React state batches 업데이트
- 다음 코드에서 setNumber(number + 1)를 세 번 호출하므로 “+3” 버튼을 클릭하면 세 번 증가할 것으로 예상할 수 있습니다.

```
import { useState } from 'react';

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setNumber(number + 1);
        setNumber(number + 1);
        setNumber(number + 1);
      }}>+3</button>
    </>
  )
}
```
- 하지만 버튼을 클릭하면 세 번 증가하는 것이 아니라 한 번만 증가하는 것을 확인할 수 있습니다.
- 이는 이벤트 트리거 당시 그 시점의 스냅샷을 찍어 렌더링 당시의 state를 사용해 계산되기 때문입니다.[스탭샷으로서의 State](https://ko.react.dev/learn/state-as-a-snapshot#rendering-takes-a-snapshot-in-time)
- 첫 번째 렌더링의 이벤트 핸들러의 number 값은 setNumber(1)을 몇 번 호출하든 항상 0입니다.
```
setNumber(0 + 1);
setNumber(0 + 1);
setNumber(0 + 1);
```

- React는 state 업데이트를 하기 전에 이벤트 핸들러의 모든 코드가 실행될 때까지 기다립니다. 이 때문에 리렌더링은 모든 setNumber() 호출이 완료된 이후에만 일어납니다.
- 이렇게 하면 너무 많은 리렌더링이 발생하지 않고도 여러 컴포넌트에서 나온 다수의 state 변수를 업데이트할 수 있습니다. 하지만 이는 이벤트 핸들러와 그 안에 있는 코드가 완료될 때까지 UI가 업데이트되지 않는다는 의미이기도 합니다.
- batching라고도 하는 이 동작은 React 앱을 훨씬 빠르게 실행할 수 있게 해줍니다. 또한 일부 변수만 업데이트된 “반쯤 완성된” 혼란스러운 렌더링을 처리하지 않아도 됩니다.
- React는 클릭과 같은 여러 의도적인 이벤트에 대해 batch를 수행하지 않으며, 각 클릭은 개별적으로 처리됩니다. React는 안전한 경우에만 batch를 수행하니 안심하세요. 예를 들어 첫 번째 버튼 클릭으로 양식이 비활성화되면 두 번째 클릭으로 양식이 다시 제출되지 않도록 보장합니다.

## 렌더링 전에 동일한 state 변수를 여러 번 업데이트 하려면?
- 흔한 사례는 아니지만, 다음 렌더링 전에 동일한 state 변수를 여러 번 업데이트 하고 싶다면 setNumber(number + 1) 와 같은 다음 state 값을 전달하는 대신, setNumber(n => n + 1) 와 같이 이전 큐의 state를 기반으로 다음 state를 계산하는 함수를 전달할 수 있습니다. 이는 단순히 state 값을 대체하는 것이 아니라 React에 “state 값으로 무언가를 하라”고 지시하는 방법입니다.

```
import { useState } from 'react';

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setNumber(n => n + 1);
        setNumber(n => n + 1);
        setNumber(n => n + 1);
      }}>+3</button>
    </>
  )
}
```
- 이제 세 번씩 state가 업데이트 됩니다.

## 어떻게 동작되는 걸까?
1. React는 이벤트 핸들러의 다른 코드가 모두 실행된 후에 이 함수가 처리되도록 큐에 넣습니다.
2. 다음 렌더링 중에 React는 큐를 순회하여 최종 업데이트된 state를 제공합니다.
- React가 이벤트 핸들러를 수행하는 동안 여러 코드를 통해 작동하는 방식은 다음과 같습니다
1. setNumber(n => n + 1): n => n + 1 함수를 큐에 추가합니다.
2. setNumber(n => n + 1): n => n + 1 함수를 큐에 추가합니다.
3. setNumber(n => n + 1): n => n + 1 함수를 큐에 추가합니다.

- 다음 렌더링 중에 useState 를 호출하면 React는 큐를 순회합니다. 이전 number state는 0이었으므로 React는 이를 첫 번째 업데이터 함수에 n 인수로 전달합니다. 그런 다음 React는 이전 업데이터 함수의 반환 값을 가져와서 다음 업데이터 함수에 n으로 전달하는 식으로 반복합니다.

## 업데이트 후 state를 바꾸면 어떻게 될까?
- 한 가지 예를 더 들어보겠습니다. 다음 렌더링에서 number가 어떻게 될까요?

```
<button onClick={() => {
  setNumber(number + 5);
  setNumber(n => n + 1);
  setNumber(42);
}}>
```
- 위 코드는 state는 42로 업데이트 됩니다.
- 이 이벤트 핸들러를 실행하는 동안 React가 이 코드를 통해 작동하는 방식은 다음과 같습니다.
1. setNumber(number + 5): number 는 0 이므로 setNumber(0 + 5)입니다. React는 “5로 바꾸기” 를 큐에 추가합니다.
2. setNumber(n => n + 1): n => n + 1 는 업데이터 함수입니다. React는 이 함수를 큐에 추가합니다.
3. setNumber(42): React는 “42로 바꾸기” 를 큐에 추가합니다.

- 이벤트 핸들러가 완료되면 React는 리렌더링을 실행합니다. 리렌더링하는 동안 React는 큐를 처리합니다. 업데이터 함수는 렌더링 중에 실행되므로, 업데이터 함수는 순수해야 하며 결과만 반환 해야 합니다. 업데이터 함수 내부에서 state를 변경하거나 다른 사이드 이팩트를 실행하려고 하면 안됩니다. Strict 모드에서 React는 각 업데이터 함수를 두 번 실행(두 번째 결과는 버림)하여 실수를 찾을 수 있도록 도와줍니다.

## state 큐를 구현해보자.
- React에서 state를 업데이트할 때, 즉시 반영되는 것이 아니라 큐에 쌓입니다. 이 큐는 다음과 같은 특징을 가집니다:

1. 업데이트는 순차적으로 처리됩니다.
2. 업데이트는 새로운 값이나 이전 state를 기반으로 새 state를 계산하는 함수일 수 있습니다.
3. 마지막 업데이트가 최종 state가 됩니다.

```
export function getFinalState(baseState, queue) {
  return queue.reduce(
        (acc, update) => (typeof update === "function" ? update(acc) : update),
        baseState
    );
}

```
- baseState는 초기 state입니다.
- queue는 적용할 업데이트들의 배열입니다.
- reduce 함수를 사용해 큐의 각 업데이트를 순차적으로 적용합니다.
- 각 업데이트에 대해:
  - 함수라면 현재 누적된 state(acc)를 인자로 호출합니다.
  - 그렇지 않다면 해당 값을 새로운 state로 사용합니다.
- 최종적으로 계산된 state를 반환합니다.

```
import { getFinalState } from './processQueue.js';

function increment(n) {
  return n + 1;
}
increment.toString = () => 'n => n+1';

export default function App() {
  return (
    <>
      <TestCase
        baseState={0}
        queue={[1, 1, 1]}
        expected={1}
      />
      <hr />
      <TestCase
        baseState={0}
        queue={[
          increment,
          increment,
          increment
        ]}
        expected={3}
      />
      <hr />
      <TestCase
        baseState={0}
        queue={[
          5,
          increment,
        ]}
        expected={6}
      />
      <hr />
      <TestCase
        baseState={0}
        queue={[
          5,
          increment,
          42,
        ]}
        expected={42}
      />
    </>
  );
}

function TestCase({
  baseState,
  queue,
  expected
}) {
  const actual = getFinalState(baseState, queue);
  return (
    <>
      <p>Base state: <b>{baseState}</b></p>
      <p>Queue: <b>[{queue.join(', ')}]</b></p>
      <p>Expected result: <b>{expected}</b></p>
      <p style={{
        color: actual === expected ?
          'green' :
          'red'
      }}>
        Your result: <b>{actual}</b>
        {' '}
        ({actual === expected ?
          'correct' :
          'wrong'
        })
      </p>
    </>
  );
}
```

## 결론
- 구현을 통해 우리는 React의 state 업데이트 메커니즘의 핵심 아이디어를 이해할 수 있습니다. 실제 React에서는 이보다 훨씬 복잡한 최적화와 배치 처리가 이루어지지만, 이 간단한 모델을 통해 기본적인 동작 방식을 파악할 수 있습니다.
- 이해를 돕기 위해 제공된 TestCase 컴포넌트를 활용하면, 다양한 시나리오에서 우리의 구현이 어떻게 동작하는지 시각적으로 확인할 수 있습니다. 이를 통해 state 업데이트의 동작을 더욱 명확히 이해할 수 있을 것입니다.

출처: [state 업데이트 큐]([https://www.youtube.com/watch?v=V4j-207Umco&list=PLBh_4TgylO6DZ3i77JBPALhHRRh2efOr0&index=7](https://ko.react.dev/learn/queueing-a-series-of-state-updates))
