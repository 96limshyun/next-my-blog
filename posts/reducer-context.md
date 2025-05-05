---
title: Reducer, Context API를 적용해보자!
date: 2024-04-22
content: 복잡한 상태를 Reducer, Context API를 적용해 관리해보자!
category: React, All
---


# news-Stand 상태관리

- news-Stand SPA 미션을 하며 복잡한 상태를 좀 더 효율적으로 관리하기 위해 Reducer, Context API를 사용하기로 했다.

## News-Stand의 4가지 상태
![News Stand Image](/newsStand.png)

    1. 전체 언론사 보기(전체 언론사를 클릭하면 그리드보기가 기본으로 보여진다.)
    2. 구독한 언론사 보기(구독한 언론사를 클릭하면 리스트보기가 기본으로 보여진다.)
    3. 리스트 보기
    4. 그리드 보기

- 제일 상위 컴포넌트에서 이 4가지 상태를 useState로 관리하여 자식 컴포넌트로 전달하는 방법도 있지만, 대부분의 컴포넌트에서 모두 이 상태를 공유하고 있기 때문에 props를 너무 많이 내려줘야 하고 props Drilling이 일어났다.

- props Drilling은 content API로 해결하고 상태관리는 reducer로 해결하기로 했다.

## Reducer, Context API 적용!

```tsx
const initialState = {
    isSubscribeView: false,
    isListView: false,
};
```

- 먼저 view의 상태를 boolean으로 관리하기 위해 초기값을 설정해준다.
- 버튼을 누를때마다 이 상태값을 변경한다.


- 버튼을 누를때 action을 정의해 각 action 마다 initialState의 값을 어떻게 바꿀 것인지 설정한다.

```tsx
function ViewReducer(state, { type }) {
    switch (type) {
        case "SET_SUBSCRIBE_VIEW":
            return {...state, isSubscribeView: true, isListView: true}
        case "SET_UNSUBSCRIBE_VIEW":
            return {...state, isSubscribeView: false, isListView: false}
        case "SET_LIST_VIEW":
            return {...state, isListView: true}
        case "SET_GRID_VIEW":
            return {...state, isListView: false}
            default:
            throw new Error();
    }
}
```

### ViewsProvider 전체 코드
```tsx
import React, { useReducer } from "react";

export const ViewContext = React.createContext();

const initialState = {
    isSubscribeView: false,
    isListView: false,
};

function ViewReducer(state, { type }) {
    switch (type) {
        case "SET_SUBSCRIBE_VIEW":
            return {...state, isSubscribeView: true, isListView: true}
        case "SET_UNSUBSCRIBE_VIEW":
            return {...state, isSubscribeView: false, isListView: false}
        case "SET_LIST_VIEW":
            return {...state, isListView: true}
        case "SET_GRID_VIEW":
            return {...state, isListView: false}
            default:
            throw new Error();
    }
}

export const ViewProvider = (props) => {
    const [ViewState, ViewDispatch] = useReducer(ViewReducer, initialState)

    return (
        <ViewContext.Provider value={[ViewState, ViewDispatch]}>
            {props.children}
        </ViewContext.Provider>
    )
}
```

## 상위 컴포넌트에 provider 적용

- View상태를 공유하는 제일 상위 컴포넌트에 ViewsProvider를 감싸 하위 컴포넌트에서 사용 할 수 있도록 해준다.
- 이제 MainView 컴포넌트의 하위 컴포넌트는 useContext로 ViewState의 상태를 관리할 수 있다.
```tsx
import React from "react";
import PressViewSelector from "./PressViewSelector/PressViewSelector";
import NewsFeed from "./NewsFeed/NewsFeed";
import { SubscribeProvider } from "./SubscribeStore";
import { ViewProvider } from "./ViewStore";

const MainView = () => {
    return (
        <ViewProvider>
            <Main>
                <PressViewSelector/>
                <NewsFeed/>
            </Main>
        </ViewProvider>
    );
};
```

## useContext, reducer action 적용
- 각 버튼마다 어떤 action을 취할 것인지 정의해 ViewState의 상태 값을 바꿔준다.
```tsx
import React, { useContext } from 'react'
import { ViewContext } from '../ViewStore'

const PressViewSelector = () => {
    const [ViewState, ViewDispatch] = useContext(ViewContext)

    return (
        <div>
            <MainNav>
                <SubscribePressView>
                    <Button className={` ${ViewState.isSubscribeView ? ``: `active`}` } onClick={() => ViewDispatch({ type: "SET_UNSUBSCRIBE_VIEW"})} >전체 언론사</Button>
                    <Button className={` ${ViewState.isSubscribeView ? `active`: ``} `} onClick={() => ViewDispatch({ type: "SET_SUBSCRIBE_VIEW"})}>구독한 언론사</Button>
                </SubscribePressView>
                <SortView>
                    <img src={ViewState.isListView ? listOnIcon : listOffIcon} alt="List View" onClick={() => ViewDispatch({ type: "SET_LIST_VIEW"})}></img>
                    <img src={ViewState.isListView ? gridOffIcon : gridOnIcon} alt="grid View" onClick={() => ViewDispatch({ type: "SET_GRID_VIEW"})}></img>
                </SortView>
            </MainNav>
        </div>
    )
}
```

- ViewDispatch를 부르면 ViewReducer가 실행된다. 파라미터로 action type을 전달해주면 switch문에서 case를 판별해 ViewState의 값을 바꾼다.
- ViewState의 값이 바뀌면 MainView가 리랜더링된다.

## ViewState값에 따라 하위 컴포넌트 상태 변경

```tsx
import { ViewContext } from "../ViewStore";

const NewsFeed = () => {
    const [ViewState] = useContext(ViewContext);

    return (
        <FeedContainer>
            {ViewState.isListView ? (
                <ListView/>
            ) : (
                <GridView/>
            )}
        </FeedContainer>
    );
};
```

# 느낀점
- reducer와 Context API를 학습하기 전에는 상태를 useState로 관리하고 props로 내려주니 코드가 복잡해지고 가독성도 안좋아졌었다. 
reducer를 사용하니 상태관리가 편해지고 어떤 상태로 변경되는지 한눈에 보여 가독성이 좋아진게 보였다. 
또한, context API를 사용해 불필요한 Drilling없이 상태값을 사용할 곳에서 사용하니 마치 전역변수를 사용하는 느낌이 들기도했고 props를 타고타고 들어갈 필요가 없어져 한 층 편해진걸 느낄 수 있었다.





