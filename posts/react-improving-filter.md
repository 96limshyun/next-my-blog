---
title: 필터 컴포넌트 성능 문제와 최적화 
date: 2024-09-23
content: meet your book 프로젝트 중 필터링 과정에서 생긴 성능 문제와 최적화
category: React, All
---

- 팀 프로젝트로 진행중인 Meet Your Book 사이트에서 라이브러리 필터 컴포넌트에서 마주친 성능 문제와 그 해결 방안에 대해 이야기해보려 합니다.

## 문제 상황

- 먼저, 제가 구현한 LibraryFilter 컴포넌트의 초기 코드를 간단히 살펴보겠습니다.

```tsx
import { useLibraryFilter } from "@/hooks/useLibraryFilter";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import * as S from "@/styles/LibraryFilterStyle";
import LibraryList from "../LibraryList/LibraryList";
import LoadingFallBack from "@/components/LoadingFallBack/LoadingFallBack";
import { LibrariesType } from "@/types/Libraries";

const LibraryFilter = () => {
    const {
        isOpen,
        searchValue,
        librariesFilter,
        handleSelectLibrary,
        toggleFilter,
        handleSearch,
        isLoading,
        getDisplayLibraries,
        observerRef
    } = useLibraryFilter();
    
    return (
        <S.Container>
            <S.Header onClick={toggleFilter}>
                <S.Title>도서관 필터</S.Title>
                {isOpen ? <UpOutlined /> : <DownOutlined />}
            </S.Header>
            <S.ListWrap $isOpen={isOpen}>
                <S.Input
                    value={searchValue}
                    onChange={handleSearch}
                    placeholder="도서관 검색..."
                />
                {isLoading && <LoadingFallBack/>}
                <LibraryList
                    libraries={getDisplayLibraries as LibrariesType[]}
                    librariesFilter={librariesFilter}
                    handleSelectLibrary={handleSelectLibrary}
                    />
                <div ref={observerRef} style={{ height: "10px" }} />
            </S.ListWrap>
        </S.Container>
    );
};

export default LibraryFilter;

```
- 이 컴포넌트는 도서관 목록을 필터링하고 검색하는 기능을 제공합니다. 처음에는 잘 작동하는 것처럼 보였지만, 실제 사용 중에 성능 문제가 발생했습니다.
- 주목할 점음 다음과 같습니다.
1. 모든 로직(검색, 필터링, 무한 스크롤 등)이 단일 컴포넌트에 집중되어 있습니다.
2. useLibraryFilter 훅에서 초기에 모든 도서관 데이터를 가져옵니다.
3. 초기 데이터는 약 5000개의 도서관 정보로, 132KB의 용량을 차지합니다.
4. 사용자가 도서관을 검색할 때마다 이 대량의 데이터를 필터링합니다.

- 이러한 구조는 초기 로딩 시간을 늘리고, 검색 및 필터링 작업 시 불필요한 리소스를 소모하게 만듭니다. 결과적으로 사용자 경험을 저하시키는 성능 문제로 이어졌습니다.

## 초기 최적화 시도와 한계
- 성능 문제를 해결하기 위해 처음에는 렌더링 최적화에 초점을 맞췄습니다:

1. 데이터 분할: 5000개의 도서관 데이터를 한 번에 렌더링하는 대신, 20개씩 나누어 보여주도록 구현했습니다.
2. 무한 스크롤: 사용자가 스크롤을 내릴 때마다 추가 데이터를 로드하는 무한 스크롤 기능을 구현했습니다.

- 이러한 최적화를 통해 초기 렌더링 속도는 개선되었습니다. 하지만 여전히 사용자 입력에 대한 반응이 느렸고, 특히 검색 기능을 사용할 때 현저한 지연이 발생했습니다.
- 실제로 이 문제는 React의 성능 경고를 통해 명확히 드러났습니다. 검색 작업을 수행할 때마다 React DevTools에서 다음과 같은 경고 메시지가 나타났습니다.

![improveFilter](/improveFilter1.gif)

- 이 경고 메시지는 컴포넌트의 렌더링 시간이 비정상적으로 길어지고 있음을 나타냅니다. 구체적으로

  - 일부 렌더링 작업에 200ms가 소요됨
  - 다른 경우에는 300ms, 500ms, 심지어 900ms까지 걸리는 경우도 있었습니다

- 이는 사용자 인터페이스의 반응성에 심각한 영향을 미칠 수 있는 수준입니다. 
- 일반적으로 사용자가 지연을 느끼지 않는 반응 시간은 100ms 이하로 알려져 있습니다. 
- 따라서 이러한 긴 렌더링 시간은 사용자 경험을 크게 저하시킬 수 있습니다.

## 트러블 슈팅
- 성능 문제의 실제 원인은 다음과 같았습니다:

1. 대량의 데이터 로딩: 132KB 크기의 데이터를 한 번에 모두 메모리에 불러왔습니다. 이 데이터에는 5000개의 도서관 정보가 포함되어 있었습니다. 이 데이터는 백엔트 크롤링에 따라 추가 될 수도 있습니다.
2. 전체 데이터에 대한 필터링 연산: 사용자가 검색창에 입력할 때마다 5000개의 도서관 데이터 전체에 대해 필터링 연산을 수행했습니다.

- 초기에 구현한 렌더링 최적화(20개씩 나누어 보여주기, 무한 스크롤)로 화면에 표시되는 항목의 수를 즐여줬는데 이는 단순히 초기 렌더링에만 효과적이였고, 근본적인 문제를 해결하지 못했습니다. 
- 실제로 사용자가 검색어를 입력할 때마다 백그라운드에서는 여전히 5000개의 전체 데이터를 대상으로 필터링 연산이 수행되고 있었던 것입니다.

## 최종 해결 방안
- 문제의 근본적인 원인을 파악한 후, 백엔드 팀과 협의하여 다음과 같이 로직을 변경하기로 했습니다.
  - 5000개의 데이터를 한번에 응답하는 대신, 사용자가 검색한 도서관 명을 서버로 전송합니다.
  - 서버에서 전체 데이터를 필터링한 후, 20개씩 페이징하여 응답을 보내줍니다.

### 1. 검색 컴포넌트 분리 및 디바운스 적용
- 검색 기능의 성능을 개선하기 위해 다음과 같은 변경을 수행했습니다.
1. 검색 입력 컴포넌트를 별도로 분리했습니다.
2. 디바운스 기능을 추가하여, 사용자가 타이핑을 멈춘 후 일정 시간(300ms)이 지난 후에만 검색 쿼리를 서버로 전송하도록 구현했습니다.

#### input 분리

```tsx
import { useLibraryFilter } from "@/hooks/useLibraryFilter";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import * as S from "@/styles/LibraryFilterStyle";
import LibraryList from "../LibraryList/LibraryList";
import LoadingFallBack from "@/components/LoadingFallBack/LoadingFallBack";
import { LibrariesType } from "@/types/Libraries";
import FilterInput from "../FilterInput/FilterInput";
const LibraryFilter = () => {
    const {
        isOpen,
        setDebounceValue,
        toggleFilter,
    } = useLibraryFilter();
    
    return (
        <S.Container>
            <S.Header onClick={toggleFilter}>
                <S.Title>도서관 필터</S.Title>
                {isOpen ? <UpOutlined /> : <DownOutlined />}
            </S.Header>
            <S.ListWrap $isOpen={isOpen}>
                <FilterInput setDebounceValue={setDebounceValue}/>
                // 인풋 로직을 분리, useLibraryFilter에서 setDebounceValue를 준다.
                {isLoading && <LoadingFallBack/>}
                <LibraryList
                    libraries={getDisplayLibraries as LibrariesType[]}
                    librariesFilter={librariesFilter}
                    handleSelectLibrary={handleSelectLibrary}
                    />
                <div ref={observerRef} style={{ height: "10px" }} />
            </S.ListWrap>
        </S.Container>
    );
};

export default LibraryFilter;

```

#### 분리한 인풋에 디바운스 적용
```tsx
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import styled from "styled-components";
import { DEBOUNCE_TIME } from "@/constants";

interface FilterInputProps {
    setDebounceValue: Dispatch<SetStateAction<string>>;
}
const FilterInput = ({ setDebounceValue }: FilterInputProps) => {
    const [searchValue, setSearchValue] = useState("");

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) =>
        setSearchValue(e.target.value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounceValue(searchValue), DEBOUNCE_TIME); 
        // 0.3초뒤에 debounceValue를 변경해 debounceValue이 변경될때만 서버에 데이터 전송
        
        return () => clearTimeout(timer);
    }, [searchValue, setDebounceValue]);

    return (
        <Input
            value={searchValue}
            onChange={handleSearch}
            placeholder="도서관 검색..."
        />
    );
};


export default FilterInput;

const Input = styled.input`
    width: 90%;
    height: 2rem;
    border: ${({ theme }) => theme.border};
    border-radius: 8px;
    margin: 0px auto 1rem;
    padding: 0 0.6rem;
    outline: none;
    background-color: ${({ theme }) => theme.input};
    color: ${({ theme }) => theme.text};
`;

```
- 다음과 같이 잘 적용되는 모습입니다.

![improveFilter](/ImproveFilter2.gif)

### 2. 서버 사이드 필터링 구현
- 서버 사이드 필터링을 구현하기 위해 다음과 같은 변경사항을 적용했습니다:

1. 쿼리 파라미터 생성:
    - 사용자의 검색어(debounceValue)와 현재 페이지(libraryPage)를 기반으로 쿼리 파라미터를 동적으로 생성합니다.
    - 이를 통해 서버에 필요한 데이터만 요청할 수 있습니다.

```tsx
useEffect(() => {
    const queryParams = { 
        name: debounceValue === "" ? "서울" : debounceValue, 
        page: libraryPage, 
        size: LIBRARIES_PAGE_SIZE
    }
    const queryString = Object.entries(queryParams)
        .map(([key, value]) => `${key}=${value}`)
        .join("&")
    setQuery(`?${queryString}`)
}, [debounceValue, libraryPage])
```

2. 서버 요청 로직
    - useLibrariesQuery 훅을 사용하여 생성된 쿼리로 서버에 데이터를 요청합니다.
```tsx
const { data: libraries, isLoading } = useLibrariesQuery(query);
```

3. 데이터 관리:
    - 서버로부터 받은 데이터를 librariesItem 상태에 저장합니다.
    - 첫 페이지 요청인 경우 데이터를 새로 설정하고, 그 외의 경우 기존 데이터에 새 데이터를 추가합니다.
```tsx
useEffect(() => {
    if(libraries && libraries.content) 
        setLibrariesItem(libraryPage === FIRST_PAGE 
            ? libraries.content 
            : [...librariesItem, ...libraries.content])
}, [libraries, libraryPage])
```

4. 페이지네이션 처리:
    - 기존에 구현했던 useInfiniteScroll을 사용해 무한 스크롤을 적용하여 사용자가 목록의 끝에 도달했을 때 자동으로 다음 페이지를 로드합니다.
  
```tsx
const handleLoadMore = () => setLibraryPage(prev => prev + 1);
const { observe } = useInfiniteScroll(handleLoadMore);

useEffect(() => {
    if (observerRef.current) {
        observe(observerRef.current);
    }
}, [observe]);
```

## 결과
- 위와 같은 변경을 통해 클라이언트 측에서 전체 데이터를 로드하고 필터링하는 대신, 필요한 데이터만 서버에서 가져오도록 개선했습니다. 
- 이는 초기 로딩 시간을 크게 줄이고, 메모리 사용량을 개선하며, 전반적인 애플리케이션 성능을 향상시킵니다.

### 데이터량:
#### 초기 데이터량: 5000개의 데이터 (132KB)
#### 개선 후 데이터량: 페이지당 20개의 데이터 (약 1.4KB)
- 초기 5000개의 데이터 132KB에서 1.5KB씩 요청해 초기 페이지 로드 시 네트워크 부하를 크게 줄이고, 클라이언트의 메모리 사용량을 대폭 감소시켰습니다.

![improveFilter](/ImproveFilter3.png)

### 서버 응답시간 개선: 
#### 초기 서버 응답 시간: 300ms (5000개 데이터 요청 시)
#### 개선 후 서버 응답 시간: 57ms (20개 데이터 요청 시)
- 이는 서버에 데이터를 요청하고 응답을 받는 시간이 크게 단축되었습니다. 
- 결과적으로 사용자는 검색 결과를 더 빠르게 볼 수 있게 되었습니다.

![improveFilter](/ImproveFilter4.png)


## 동작

![improveFilter](/ImproveFilter5.gif)
