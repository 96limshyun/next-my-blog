---
title: MVC (Model-View-Controller) 패턴
date: 2024-04-08
content: MVC 패턴으로 관심사 분리
category: Js, Ts, All
---

# MVC 패턴이란?

![MVC 패턴 Image](/MVCimg.png)

- MVC 패턴은 소프트웨어 아키텍처 디자인 패턴으로, 
소프트웨어를 세 가지 주요 부분으로 분리하여 설계하는 방법을 제공하는 것이다.
이 패턴은 Model-View-Controller의 약어로, 각 부분이 특정 역할을 수행하도록 설계한다.

1. Model
- 변경이 되는 state 구조를 정의한다.
- state를 변경할 수 있는 메서드들을 제공한다.
- 파일, 서버와 통신 할 수도 있다.
- 모델은 주로 데이터의 상태를 관리하고 업데이트하는데 사용된다.

2. View
- 화면에 대한 렌더링을 담당한다.
- 비지니스 로직은 배제한다.
- 뷰는 일반적으로 모델의 상태를 표시하고 사용자 입력을 받아들이는데 사용된다.

3. Controller
- 이벤트 핸들러를 처리한다.
- M-V간의 데이터 흐름을 전달한다.
- 사용자의 입력을 받아 모델에게 데이터 업데이트를 요청하거나 모델로부터 데이터를 검색하여 뷰에 전달합니다.

### 특징
- M,V 를 분리
- 입력을 Controller에서 받음 (이벤트 핸들러)
- M 순수해야 함.(V,C 모두 모름)
- C 중재자 역할
- V는 M의존성이 있어도 되고, C는 잘 모름.

## MVC 패턴을 적용해보자!
- 먼저 스캘레톤 코드로 각 역할을 분리해봤다.

#### newsModel.ts
- Model에서는 전체 뉴스 데이터, 선택한 뉴스 데이터, 다음 뉴스 데이터를 가져오고 업데이트를 하면 setTitleList로 list를 업데이트 할 수 있도록 했다.
```ts
interface NewsItem {
    id: number;
    title: string;
}

export class NewsModel {
    newsTitleList: NewsItem[];
    currentIndex: number;

    constructor() {
        this.newsTitleList = [];
        this.currentIndex = 0;
    }

    getNewsData() {}

    getNextNews() {}
    
    updateNewsIndex(selectTiTle: string) {}

    setTitleList(list: NewsItem[]) {
    }
}
```

#### viewRenderer.ts
- View에서는 Controller에서 전달한 데이터 값으로 웹에 직접 그리도록 분리하였다.
```ts
interface NewsItem {
    id: number;
    title: string;
}

const renderTimer = (time: number): void => {};

const renderNewsList = (list: NewsItem[]) => {}

const renderNewsContent = (selectContent) => {}

const renderLoading = () => {}

export { renderTimer, renderNewsList, renderNewsContent, renderLoading }
```

#### eventController.ts
- eventController에서는 사용자의 입력을 받아 모델에게 데이터 업데이트를 요청하거나 모델로부터 데이터를 가져와 뷰에 전달하도록 했다.

```ts
import { renderTimer, renderNewsList, renderNewsContent, renderLoading } from "../view/viewRenderer.js"
import { getNewsTitles, getNewsContent } from "../model/newsAPI.js";
import { NewsModel } from "../model/newsModel.js";

const TIMER_INITIAL = 10
const TIME_INTERVAL = 1000
const TIMER_END_VALUE = 1

const newsModel = new NewsModel();
const timer = Timer();

function Timer() {
    let increase = null;
    let timer = TIMER_INITIAL;

    const startTimer = () => { // 10초가 지나면 전체 뉴스데이터를 업데이트한다.
        renderTimer(timer);
        increase = setInterval(() => {
            timer--;
            renderTimer(timer);
            if (timer < TIMER_END_VALUE) {
                clearInterval(increase);
                initData()
            } 
        }, TIME_INTERVAL);
    }

    const stopTimer = () => {
        clearInterval(increase);
        renderLoading()
        timer = TIMER_INITIAL;
    }

    return { startTimer, stopTimer };
}

export const initData = async() => { // Model에서 데이터를 가져와 Views에 전달해 웹에 그려준다.
    const titleList = await getNewsTitles();
    newsModel.setTitleList(titleList.sort(() => Math.random() - 0.5))
    renderNewsList(titleList)
    await showSelectNews(newsModel.getNewsData())
}

const showSelectNews = async(select: string) => { // 사용자가 선택한 뉴스데이터를 Model로부터 가져와 View에 전달해 웹에 그려준다.
    timer.stopTimer()

    try {
        newsModel.updateNewsIndex(select)
        const selectContent = await getNewsContent(select)
        renderNewsContent(selectContent)
        timer.startTimer()
    } catch(error) {
        console.log("getContent error", error)
    }
}

// 사용자 입력 처리
export const setEventHandler = (): void => {
    const updateBtn: HTMLButtonElement = document.querySelector(".update-button")
    updateBtn.addEventListener("click", async () => {
        updateBtn.disabled = true;
        try {
            await initData();
        } catch (error) {
            console.log("initData error", error);
        } finally {
            updateBtn.disabled = false;
        }
    });

    const newsCategory: Element = document.querySelector(".category-list");
    newsCategory.addEventListener("click", async(e) => {
        const selectTitle = (e.target as Element).textContent;
        if ((e.target as Element).className !== "category-list") showSelectNews(selectTitle)
    });
}
```

## 느낀점

### 장점
- 기존에는 컴포넌트별로 파일을 분리해 각 컴포넌트파일에서 Model, View, Controller를 한번에 처리했는데 MVC모델로 분리하니 각 역할이 분리되어 유지보수성이 좋아진것 같다.
- 관심사를 분리하니 테스트를 용이하게 할 수 있을것 같다.
- 각 역할을 분리하니 버그가 나도 코드를 더 쉽게 관리할 수 있었다.

### 단점
- 작은 프로젝틀르 할 때에는 용이하게 사용할 수 있지만, 큰 프로젝트를 하게되어 파일이 늘어나면 과도하게 파일이 분리되지 않을까 생각한다.

