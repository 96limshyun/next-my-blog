---
title: Typescript type, interface 차이점 이해하기
date: 2024-09-19
content: Typescript type, interface의 차이점과 올바른 사용법
category: ts, All
---

- 타입스크립에서 명명된 타입을 정의하는 방법은 두 가지가 있습니다. 다음처럼 타입을 사용할 수 있습니다.

```ts
type TState = {
    name: string;
    capital: string;
}
```

```ts
interface IState {
    name: string;
    capital: string;
}
```

## type과 interface의 사용
- 대부분의 경우 type과 interface는 상호 교환적으로 사용할 수 있습니다.
- 많은 개발자들이 두 키워드의 차이점을 정확히 알지 못한 채 사용하고 있고, 저 또한 둘의 차이점을 알지 못한채 사용하고 있었습니다.
- 그러나 두 키워드 간에는 중요한 차이점이 존재합니다.
- 이번 글에서는 둘의 차이점에 대해 명확히 이해하고 예제를 보며 이해해 보겠습니다.

## 주요 차이점
- type과 interface는 많은 공통점이 있지만, 다음과 같은 키워드에서 중요한 차이점이 있습니다.
1. 유니온 타입 (Union Types)
2. 튜플 타입 (Tuple Types)
3. 선언 병합 (Declaration Merging)
4. 확장 (Extending/Inheritance)
5. 복잡한 타입 연산 (Complex Type Operations)

- 각 키워드가 타입과 인터페이스에서 어떻게 다르게 사용되는지 알아봅시다.

### 유니온 타입
- 타입은 유니온 타입을 직접 정의할 수 있지만, 인터페이스는 불가능합니다.
```ts
// 타입
type ID = number | string;

// 인터페이스
// 직접적인 유니온 정의 불가능
```

### 튜플 타입
- 타입은 튜플을 정확히 표현할 수 있지만, 인터페이스로는 완벽한 튜플 표현이 어렵습니다.
```ts
// 타입
type Point = [number, number];

// 인터페이스
interface IPoint {
  0: number;
  1: number;
  length: 2;
}
// 이는 튜플과 유사하지만 정확히 같지 않음
```

- 여기서 `튜플과 유서하지만 정확히 같지 않다`는 말이 무엇일까요?
- 위의 말은 인터페이스로 튜플과 유사한 구조를 정의 할 수는 있지만, 실제 튜플의 모든 특성을 완벽하게 캡처하기는 어렵다는 것 입니다. 그 이유는 아래와 같습니다.
1. 배열 메서드 부재
   - 튜플은 기본적으로 배열이므로 push, pop, concat 등의 배열 메서드를 사용할 수 있습니다. 하지만 인터페이스로 정의한 구조에는 이러한 메서드가 포함되지 않아 사용할 수 없습니다.
2. 고정 길이 보장의 어려움 
   - 위에서 length: 2로 정의했지만, 이는 단순히 length 속석이 2라는 것만 명시할 뿐, 실제로 추가 요소를 방지하지는 않습니다.
3. 인덱스 접근의 차이 
   - 튜플은 정의된 인데스 외의 접근을 막습니다. 하지만 인터페이스는 이를 완벽히 제어하기 어렵습니다.

```ts
type TuplePoint = [number, number];
interface IPoint { 0: number; 1: number; length: 2; }

const tuplePoint: TuplePoint = [1, 2];
const interfacePoint: IPoint = [1, 2];

// 배열 메서드 사용
tuplePoint.push(3); // 컴파일러 경고: 길이가 2를 초과합니다.
interfacePoint.push(3); // 오류: 'push' 속성이 'IPoint' 타입에 없습니다.

// 인덱스 접근
console.log(tuplePoint[2]); // undefined, 하지만 컴파일러 경고
console.log(interfacePoint[2]); // undefined, 경고 없음

```

### 선언 병합: 인터페이스는 선언 병합이 가능하지만, 타입은 불가능 합니다.
```ts
// 인터페이스
interface User {
  name: string;
}
interface User {
  age: number;
}
// User는 name과 age 속성을 모두 가짐

// 타입
// 동일한 이름으로 재선언 불가능
```

### 확장
- 인터페이스는 extends 키워드를 사용하여 확장하지만, 타입은 교차 인터섹션(&)을 사용합니다.
```ts
// 인터페이스
interface Animal {
  name: string;
}
interface Dog extends Animal {
  bark(): void;
}

// 타입
type Animal = {
  name: string;
};
type Dog = Animal & {
  bark(): void;
};
```

### 복잡한 타입 연산
- 타입은 매핑된 타입, 조건부 타입 등 복잡한 타입 연산을 수행할 수 있지만, 인터페이스는 제한적입니다.

```ts
// 타입
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type ConditionalType<T> = T extends string ? 'string' : 'not string';

// 인터페이스
// 이런 복잡한 타입 연산 불가능
```

## 결론
- 타입과 인터페이스는 TypeScript에서 타입을 정의하는 두 가지 주요 방법입니다.
- 대부분의 간단한 사용 사례에서는 둘 다 사용 가능하며, 개인이나 팀의 선호도에 따라 선택할 수 있습니다.
- 그러나 특정 상황에서는 한 가지 방법이 더 적합할 수 있습니다:
    - 유니온 타입, 튜플, 복잡한 타입 연산이 필요한 경우 type을 사용하세요.
    - 선언 병합이 필요하거나 확장성이 중요한 경우 interface를 사용하세요.
- 그러나 타입과 인터페이스의 사이의 존재하는 차이를 분명하게 아는것이 중요합니다.
- 또한, 프로젝트 내에서 동일한 방법으로 명명된 타입을 정의해 일관성을 유지하는게 좋습니다.
- 프로젝트의 일관성을 위해 팀 내에서 사용 규칙을 정하는 것이 중요하다고 생각합니다.