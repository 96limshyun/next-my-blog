---
title: JavaScript 이벤트 델리게이션
date: 2023-10-09
content: tic-tac-toe게임에 이벤트 위임을 적용시켜보자!
category: JS, All
---

Html, Css를 조작하는 웹에서 사용자의 '클릭', '호버' 등과 같은 동적인 이벤트를 관리하기 위해서 DOM에 이벤트를 작성하는 '**이벤트 리스너(Event Listener)**'가 있다. 이벤트 델리게이션 패턴은 이 이벤트 리스너를 보다 더 효율적으로 관리하기 위한 디자인 패턴이다.

## 이벤트가 전달

이벤트가 전달되는 과정은 크게 세 가지로 나눌 수 있다.

1. 이벤트 캡처링
- window 객체에서 타깃을 찾아가기 위해 대상 객체까지 이벤트가 전파되는 단계를 뜻한다.
1. 이벤트 버블링
- 타깃으로부터 이벤트가 부모로 전파되어 이벤트가 window 객체로 전달되는 단계를 뜻한다.
1. 타깃
- 이벤트가 타깃에 전파되는 단계이다.
- 만약 이벤트 타깃에 핸들러를 등록했다면, 이 시점에 핸들러가 실행되게 된다.

```jsx
<!DOCTYPE HTML>
<html>
  <head>
  </head>
  </head>
  <body>
    <div id="div1" class="div1">
      <div id="div2" class="div2">
        <div id="div3" class="div3">
        </div>
      </div>
    </div>
  <script>
    document.getElementById('div1', (e) => {
      console.log('div1 click')
    })
    document.getElementById('div2', (e) => {
      console.log('div2 click')
    })
    document.getElementById('div3', (e) => {
      console.log('div3 click')
    })
  </script>
  </body>
</html>
```

여기서 div3를 클릭했을 때를 가정하고 이번트의 전파 과정을 살펴보면,

먼저 window 객체를 통해 자식으로 이벤트가 전달된다. 이러한 이벤트 캡쳐링 과정을 통해 target에 이벤트가 전파되면, 타깃에 등록한 (여기서는 div3) 핸들러가 실행이되고, div3 click이 먼저 출력된다.

그 다음 버블링 과정을 통해 div2로 전파가 되고, 이때 div2에 등록한 핸들러가 실행된다. 마지막으로 같은 과정을 통해 div1에 등록한 핸들러가 실행되어 최종적으로 div3 → div2 → div1 순서로 출력이 될 것이다.

만약 div3가 아닌 div2, div1을 클릭했다면, 하위 컴포넌트에 등록한 메서드는 실행되지 않을 것이다.

## 이벤트 델리게이션 패턴

이벤트 델리게이션 패턴은, 이벤트 버블링이 일어나는 특성을 이용하여 현재 컴포넌트보다 상위 컴포넌트에 이벤트 핸들러를 걸어두고 상위 요소에서 하위 요소의 이벤트를 제어하는 패턴을 말한다.

이벤트 버블링에 의하여 하위 컴포넌트를 클릭하면 상위 컴포넌트로 이벤트가 전파되고 핸들러를 등록하여 이를 감지할 수 있다.

이를 통해 기존에 만들었던 TIC-TAC-TOE 게임의 코드를 변경해 보았다.

```jsx
<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="index.css">
    <title>Document</title>
</head>

<body>
    <div>
        <h1 id="message-el">tic-tac-toe</h1>
        <div id="main-contain">
            <div class="contain c0" id="0"></div>
            <div class="contain c1" id="1"></div>
            <div class="contain c2" id="2"></div>
            <div class="contain c3" id="3"></div>
            <div class="contain c4" id="4"></div>
            <div class="contain c5" id="5"></div>
            <div class="contain c6" id="6"></div>
            <div class="contain c7" id="7"></div>
            <div class="contain c8" id="8"></div>
        </div>
        <div id="button-el">
            <button id="reset-el">Reset</button>
        </div>
    </div>
    <div id="modal-el">
        <button id="start-btn">START</button>
    </div>
    <div id="end-modal">
        <div id="winner">O win!</div>
    </div>
    
    <script src="index.js"></script>
</body>

</html>
```

```jsx
const boxes = Array.from(document.getElementsByClassName('contain'));
const modalEl = document.getElementById("modal-el");

modalEl.addEventListener("click", startGame);
function startGame() {
    for(let i = 0; i < boxes.length; i++) {
        **boxes[i].addEventListener("click", addText);**
    }
    modalEl.style.display = "none";
    endEl.style.display = "none";
}
```

기존에 작성했던 코드는 contain 박스를 하나하나 가져와 모두 이벤트리스너를 등록하였는데, 이러면 브러우저의 메모리를 많이 사용하게 될 것이고 곧 퍼포먼스 저하로 이어지게 될 것이다.

아래는 이벤트 델리게이션으로 변경한 코드이다.

```jsx
<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="index.css">
    <title>Document</title>
</head>

<body>
    <div>
        <h1 id="message">tic-tac-toe</h1>
        <div id="main-contain">
            <div class="contain container0" id="0"></div>
            <div class="contain container1" id="1"></div>
            <div class="contain container2" id="2"></div>
            <div class="contain container3" id="3"></div>
            <div class="contain container4" id="4"></div>
            <div class="contain container5" id="5"></div>
            <div class="contain container6" id="6"></div>
            <div class="contain container7" id="7"></div>
            <div class="contain container8" id="8"></div>
        </div>
        <div id="button-contain">
            <button id="reset">Reset</button>
        </div>
    </div>
    <div id="start-modal">
        <button id="start-btn">START</button>
    </div>
    <div id="end-modal">
        <div id="winner">O win!</div>
    </div>
    <script src="index.js"></script>
</body>

</html>
```

```jsx
const boxes = document.querySelector('#main-contain');
const startModal = document.querySelector("#start-modal");
const PLAYER_O = "O";
const PLAYER_X = "X";
let currntPlayer = PLAYER_O;
let playerSelect = Array(9).fill(false);

startModal.addEventListener("click", startGame);

function startGame() {
    **boxes.addEventListener("click", addText)**
    startModal.style.display = "none";
    endModal.style.display = "none";
}

function addText(event) {
    const id = event.target.id;
    if (!playerSelect[id]) {
        playerSelect[id] = currntPlayer;
        event.target.textContent = currntPlayer;
        if (checkWinner() !== false) {
            winner.textContent = `${playerSelect[id]} win!`;
            endModal.style.display = "flex";
        }
    } else if (event.target.textContent === "O" || "x") {
        return addText();
    }
    
    if (currntPlayer === PLAYER_O) {
        currntPlayer = PLAYER_X;
    } else {
        currntPlayer =PLAYER_O;
    }
}
```

변경된 코드에는 contain에 일일이 이벤트 리스너를 등록하지 않고 contain을 감싸고 있는 상위 엘리먼트인 main-contain에 이벤트 리스너를 등록해서 이벤트의 target값을 이용해 클릭 이벤트를 등록해봤다. 

## e.target, e.currentTarget의 차이점

- [e.target](http://e.target) : 실제 이벤트가 발생한 객체
- e.currentTarget : 실제 이벤트가 발생한 객체가 아닌, 사용자가 핸들러를 등록한 객체

## 이벤트 델리게이션 패턴을 사용하는 이유

이벤트 위임은 특히 리스트에 이벤트를 등록할 때 유용하다. 만약 리스트 각 요소에 이벤트를 등록한다면, 100개의 리스트 요소가 있을 때 100개의 이벤트 리스너가 존재하게 되고 이는 퍼포먼스에 부정적인 영향을 준다. 만약 상위 컴포넌트에 이벤트를 등록하고 이벤트 버블링을 통해 핸들러를 실행하게 된다면, 하나의 이벤트 리스너만으로 하위 컴포넌트의 이벤트를 모두 제어할 수 있기 때문에 자주 사용한다.