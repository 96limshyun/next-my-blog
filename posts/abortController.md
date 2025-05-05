---
title: AbortController 비동기 호출 취소
date: 2024-04-14
content: AbortController 인터페이스로 비동기 웹 요청을 취소해보자.
category: JS, All
---

## 들어가며
 - 그동안 fetch, promise, async, await로 비동기 요청을 하며 웹 api에서 처리하는 비동기 작업은 취소, 중단할 수 없는지 궁금했다. 이번 미션에서 `fetch요청 취소`라는 요구사항이 있어 학습을 하던 중 AbortController로 비동기 요청 취소를 할 수 있다는 것을 알게되어 개념을 정리하며 블로그에 기록하고자 한다.

## AbortController
### MDN 웹 문서에서는 AbortController를 다음과 같이 설명하고 있다.
 - AbortController인터페이스는 하나 이상의 웹 요청을 취소할 수 있게 해준다.
 - AbortController.AbortController() 생성자를 사용해 새로운 AbortController 를 생성한다. AbortSignal 객체를 사용해 DOM 요청과의 통신이 완료된다.

### 생성자
 - `AbortController()`

### 프로퍼티
 - `AbortController.signal`
   - DOM 요청과 통신하거나 취소하는데 사용되는 `AbortSignal` 객체 인터페이스를 반환한다.

### 메소드
 - `AbortController.abort()`
   - DOM 요청이 완료되기 전에 취소한다. 이를 통해 fetch요청, 모든 응답 Body소비, 스트림을 취소할 수 있다.


## 적용사례
 - 이번 미션에서는 뉴스 title을 click하면 선택한 기사의 content 데이터를 api로 요청해 가져와 화면에 보여주는 간단한 미션이였다. 
 - 하지만 요구사항에 fetch요청 시에 의도적으로 5초를 지연시키고, 데이터를 가져오는 5초 동안 사용자가 다른 기사를 클릭하면, 전 fetch요청을 취소하고 새로운 fetch를 요청해야하는 까다로운 미션이였다.

### fetch 요청 적용
```js
const REQUEST_DELAY = 5000
let controller = null;

const getNewsContent = async (selectTitle: string) => {
    if (controller) controller.abort();

    controller = new AbortController();

    try {
        const response = await fetch(api, { signal: controller.signal });
        await delay(REQUEST_DELAY);
        const json = await response.json();
        const selectNewsContent = json.find(curContent => curContent.title === selectTitle);
        return selectNewsContent;
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    } finally {
        controller = null;
    }
};

const delay = (ms:number) => new Promise((resolve) => setTimeout(resolve, ms))
```

 - 처음 getNewsContent함수가 실행되면 controller변수에 new AbortController() 생성자를 저장한다.
 - `const response = await fetch(api, { signal: controller.signal });` fetch 요청을한다.
 - fetch의 두번째 파라미터로 `controller.signal`을 전달하면 비동기 요청을 취소할 수 있는 상태가 된다.
 - delay함수로 5초를 의도적으로 지연시키고 find로 사용자가 선택한 title과 같은 객체를 반환한다.
 - 5초가 지나기 전 getNewsContent함수가 다시 불리면 Controller 변수에 AbortController 객체가 있는지 확인하고 객체가 있다면 abort로 전 요청을 취소하고 새로운 fetch요청을 한다.

----
## 마치며
- AbortController를 사용해 비동기요청을 어떻게 취소 할 수 있고, 어떠한 식으로 사용하는지 학습할 수 있었다. request를 했을때 응답이 오래걸리거나, 티켓팅과 같이 동일한 요청을 지속적으로 반복하는 상황 등 다양한 방면에서 사용할 수 있을것 같다.
