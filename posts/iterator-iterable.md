---
title: iterable, iterator
date: 2025-03-20
content: iterable, iterator과 for..of..
category: Js, All
---

## 같은 객체인데 왜 어떤것은 for...of..가 동작하고 어떤 것은 안될까?
- 자바스크립트에서 객체를 다루며, 같은 객체인데 어떤것은 for..of..가 동작하고 어떤것은 안되는 것을 경험한 적이 있을것 입니다.
- [mdn](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Statements/for...of)에서는 for..of..는 iterable object(반복 가능한 객체)에 대해서 반복문을 수행한다고 되어 있습니다.
- 이번 포스트에서는 여기서 설명하는 iterable이 무엇인지 알아보겠습니다. 

## Iterator
- iterable을 이해하기 위해서 먼저 iterator을 알아봐야합니다.
- Iterator는 next() 메서드를 가지며, next의 반환값으로 value와 done 프로퍼티를 가진 객체를 반환하는 객체를 Iterator라고 합니다.
- next() 에서 반환하는 메서드는 다음과 같은 프로퍼티를 갖습니다.
    - `done`
        - Boolean 값으로, Iterator가 다음 값을 생성할 수 있는 경우엔 false입니다.
        - 다음 값을 생성할 수 없을 때는 true입니다.
    - `value`
        - Iterator가 반환하는 값으로, done이 true면 생략할 수 있습니다.
- 무슨 말인지 이해하기 어려우니 공식 문서에 나와있는 예제를 보겠습니다.

```js
function makeIterator(array) {
  let nextIndex = 0;
  return {
    next() { // next() 메서드를 반환
      return nextIndex < array.length
        ? {
            value: array[nextIndex++],
            done: false,
          }
        : {
            done: true,
          };
    }, // { value: any, done: boolean } 객체를 반환
  };
} 
```
- 위처럼 next() 메서드를 가지고 있으며, 호출할 때 { value, done } 형식의 객체를 반환하는 객체가 바로 Iterator입니다.

## Iterable
- iterable한 속성을 가진 타입은 for..of..로 순회할 수 있습니다.
- iterable이 되려면 객체가 `[Symbol.iterator]() 메서드`를 갖고 있어야 합니다.
- 객체 또는 프로토타입 체인에 있는 객체 중 하나가 [Symbol.iterator] 키가 있는 속성을 가지고 있어야 합니다. [Symbol.iterator]()
- Symbol.iterator 메서드는 반환값으로 iterator(next() 메서드를 가지며, next의 반환값으로 value와 done 프로퍼티를 가진 객체를 반환하는 객체)을 반환합니다.
- `Symbol.iterator` 메서드를 가진 객체를 Iterable한 객체라고 합니다.

## [Symbol.iterator]가 있는지 어떻게 확인할까?
- __proto__를 통해 해당 객체의 프로토 타입을 확인할 수 있습니다.
- 아래의 nums는 Array.Prototype에 Symbol.iterator를 상속박기 때문에 for...of..를 사용할 수 있습니다.

![iterator](/iterator-iterable.png)

```js
const nums = [1,2,3]

for (let value of nums) {
    console.log(value) // 1, 2, 3 을 출력합니다.
}
```
- Symbol.iterator를 없애면 동작하지 않습니다.

```js
const nums = [1,2,3]
nums[Symbol.iterator] = null;

for (let value of nums) {
    console.log(value)
}
// TypeError: nums is not iterable
```

## Symbol.iterator 직접 사용하기
- for...of 문을 사용하지 않고, 직접 Symbol.iterator를 호출하여 iterable 객체를 순회할 수 있습니다.
```jsx
const nums = [1, 2, 3];
const iterator = nums[Symbol.iterator]()
console.log(iterator.next()) // {value: 1, done: false}
console.log(iterator.next()) // {value: 2, done: false}
console.log(iterator.next()) // {value: 3, done: false}
console.log(iterator.next()) // {value: undefined, done: true}
```
- 이렇게 next() 메서드를 호출할 때마다, 배열의 각 요소가 차례대로 반환되며 마지막에 done: true가 되어 반복이 종료됩니다.

## next() 는 어떻게 동작할까?
- 위의 iterator.next() 호출이 내부적으로 어떻게 동작하는지 직접 구현해 보겠습니다.
```js
const makeIterator = (arr) => {
    let index = 0;

    const next = () => {
        return index >= arr.length 
            ? {value: undefined, done: true} 
            : {value: arr[index++], done: false}
    }
    
    return { next }
}

const iterator = makeIterator([1,2,3])
console.log(iterator.next()) // {value: 1, done: false}
console.log(iterator.next()) // {value: 2, done: false}
console.log(iterator.next()) // {value: 3, done: false}
console.log(iterator.next()) // {value: undefined, done: true}
```
- makeIterator 함수는 배열을 받아 내부적으로 next() 메서드를 가진 객체(Iterator)를 반환합니다.
- next()가 호출될 때마다 현재 index 위치의 값을 반환하고 index를 증가시킵니다.
- 배열의 끝에 도달하면 done: true가 되어 반복이 종료됩니다.

### 반복 가능한 객체와 반복이 불가능 한 객체
1. iterable(반복 가능한 객체)
- iterable한 객체 즉, `Symbol.iterator` 메서드를 갖고 있는 객체는 반복이 가능합니다.
- iterable한 객체에는 Array, String, TypeArray, Map, Set, NodeList, arguments 가 있고 프로토 타입 체인을 통해 확인할 수 있습니다.

2. non-iterable(반복이 불가능한 객체)
- Symbol.iterator를 구현하지 않은 일반 객체는 for...of로 순회할 수 없습니다.

```js
const obj = {a: 1, b: 2};

console.log(typeof obj[Symbol.iterator]); // undefined
```

## for..of.. 없이 사용해보기
- for…of.. 없이는 다음과 같이 사용 할 수 있습니다.
- iterator.next()를 호출하여 { value, done } 객체를 반환받고 done이 true가 될 때까지 루프를 계속 실행합니다.
```jsx
const nums = [1, 2, 3];
const iterator = nums[Symbol.iterator]()

while (true) {
    const {value, done} = iterator.next()
    if(done) break;
    console.log(value, done)
}
```