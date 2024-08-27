---
title: 무한스크롤 API요청이 여러번 되는 문제 해결기
date: 2024-08-26
content: IntersectionObserver API로 무한 스크롤을 구현 시 API 요청 여러번 되는 문제
category: ts, All, React
---

## 문제 상황
- IntersectionObserver API를 사용해 무한 스크롤 기능을 구현했는데, React Query Devtools를 통해 확인해 보니 API 요청이 여러 번 발생하는 문제가 있었습니다. 정상적인 동작이라면, 스크롤이 끝에 도달했을 때 한 번씩만 API 요청이 일어나야 하지만, 아래 사진과 같이 여러 번의 요청이 발생했습니다.

![infinite](/infinite1.png)

## 문제의 원인
- 현재 무한 스크롤 로직은 책을 보여주는 컴포넌트의 최하단에 `<div> `태그를 하나 두고, 이 태그가 화면에 보이는지 여부를 IntersectionObserver로 감지하여 추가 데이터를 로드하는 방식입니다.

```
const BookCard = React.lazy(() => import("./BookCard/BookCard"));

const BooksDisplay = () => {
  const [viewMode, setViewMode] = useState<ViewType>("grid");
  const { booksItem, observerRef, lastPageNum, page, isLoading } = useBooksLogic();

  return (
    <S.BookContainer>
      <ViewSelector viewMode={viewMode} setViewMode={setViewMode} />
      <Suspense fallback={<LoadingFallBack />}>
        <S.BookWrap $viewMode={viewMode}>
          {booksItem.map((book: BookContent, index: number) => (
            <BookCard key={`${book.id}-${index}`} bookData={book} viewMode={viewMode} />
          ))}
        </S.BookWrap>
        {isLoading && <LoadingFallBack />}
      </Suspense>
      {page === lastPageNum ? (
        <S.LastPageView>마지막 페이지 입니다.</S.LastPageView>
      ) : (
        <div ref={observerRef} style={{ height: "1px" }} />
      )}
    </S.BookContainer>
  );
};

export default BooksDisplay;

```

- 스크롤이 끝에 도달하면 observerRef가 할당된 `<div>` 태그가 화면과 교차했는지 감지하고, 이때 handleLoadMore 함수가 호출되어 페이지를 업데이트하면서 새로운 API 요청을 만듭니다.

```
const handleLoadMore = useCallback(() => {
  if (!loadingMore.current && !isFetching && page < lastPageNum) {
    loadingMore.current = true;
    setPage(page + 1); // 페이지 업데이트 
  }
}, [isFetching, page, lastPageNum, setPage]);

const { observe } = useInfiniteScroll(handleLoadMore);

useEffect(() => {
  if (observerRef.current) {
    observe(observerRef.current);
  }
}, [observe]);

```

- 그러나 BookCard를 React.lazy로 레이지 로딩하면서 발생한 문제는, BookCard가 아직 로드되지 않았을 때 `<div ref={observerRef} style={{ height: "1px" }} />`가 먼저 렌더링되면서, IntersectionObserver가 해당 태그를 계속해서 감지하고 교차 이벤트를 발생시켰습니다. 그로 인해 API 요청이 반복해서 발생한 것입니다.

## 해결 1: Suspense 내부로 observer 이동
- `<div ref={observerRef} style={{ height: "1px" }} />` 태그를 Suspense 안으로 넣어 BookCard 컴포넌트가 로드될 때 함께 렌더링되도록 수정했습니다.

```
const BookCard = React.lazy(() => import("./BookCard/BookCard"));

const BooksDisplay = () => {
  const [viewMode, setViewMode] = useState<ViewType>("grid");
  const { booksItem, observerRef, lastPageNum, page, isLoading } = useBooksLogic();

  return (
    <S.BookContainer>
      <ViewSelector viewMode={viewMode} setViewMode={setViewMode} />
      <Suspense fallback={<LoadingFallBack />}>
        <S.BookWrap $viewMode={viewMode}>
          {booksItem.map((book: BookContent, index: number) => (
            <BookCard key={`${book.id}-${index}`} bookData={book} viewMode={viewMode} />
          ))}
        </S.BookWrap>
        {isLoading && <LoadingFallBack />}
        {page === lastPageNum ? (
          <S.LastPageView>마지막 페이지 입니다.</S.LastPageView>
        ) : (
          <div ref={observerRef} style={{ height: "1px" }} /> // 안쪽으로 이동
        )}
      </Suspense>
    </S.BookContainer>
  );
};

export default BooksDisplay;

```

### 결과

![infinite](/infinite2.png)

- 이 변경 후, API 요청은 첫 페이지 로딩 시 위와 같이 한 번만 발생했습니다. 그러나 무한 스크롤 기능이 더 이상 동작하지 않는 문제가 발생했습니다. 이때 최하단을 감지하지 못하는 문제를 파악하기 위해 observerRef.current를 콘솔로 확인했습니다.

- 변경전
![infinite](/infinite3.png)

- 변경 후
![infinite](/infinite4.png)

- 코드를 변경한 후 observerRef에 태그가 할당되지 않는 것을 확인했습니다.

## 에러 이유
- useEffect는 렌더링 이후에 실행되는데, React.lazy로 불러오는 컴포넌트는 비동기적으로 로드되므로 처음 렌더링 시점에 존재하지 않습니다. 이로 인해 Suspense가 fallback을 표시하는 동안 useEffect가 먼저 실행되어 observerRef가 할당되지 않고, 감지를 제대로 하지 못한 것입니다.

### 실행순서
1. Suspense의 LoadingFallBack가 먼저 렌더링: BookCard가 React.lazy로 로드되므로, 첫 번째로 LoadingFallBack이 표시됩니다.
2. useEffect가 실행됨: observerRef가 설정되고 IntersectionObserver가 설정됩니다. 그러나 아직 BookCard는 로드되지 않았습니다.
3. BookCard 로드 완료: 이 시점에서 이미 useEffect가 실행되었으므로, observerRef는 초기값 null을 유지하고 있습니다.

## 해결 2: observerRef 콜백 함수로 처리
- useEffect가 먼저 실행되는 문제를 해결하기 위해, `<div ref={observerRef} style={{ height: "1px" }} />`에 ref를 할당하는 방식 대신 observerRefCallback 콜백 함수를 사용하여 BookCard가 렌더링된 이후에 ref를 할당하도록 수정했습니다.

### 해결 코드
```
// BookDisplay.tsx
const BookCard = React.lazy(() => import("./BookCard/BookCard"));

const BooksDisplay = () => {
  const [viewMode, setViewMode] = useState<ViewType>("grid");
  const { booksItem, observerRefCallback, lastPageNum, page, isLoading } = useBooksLogic();

  return (
    <S.BookContainer>
      <ViewSelector viewMode={viewMode} setViewMode={setViewMode} />
      <Suspense fallback={<LoadingFallBack />}>
        <S.BookWrap $viewMode={viewMode}>
          {booksItem.map((book: BookContent, index: number) => (
            <BookCard key={`${book.id}-${index}`} bookData={book} viewMode={viewMode} />
          ))}
        </S.BookWrap>
        {isLoading && <LoadingFallBack />}
        {page === lastPageNum ? (
          <S.LastPageView>마지막 페이지 입니다.</S.LastPageView>
        ) : (
          <div ref={observerRefCallback} style={{ height: "10px" }} />
        )}
      </Suspense>
    </S.BookContainer>
  );
};

export default BooksDisplay;

// useBooksLogic.tsx
const useBooksLogic = () => {
  const query = useGenerateQuery();
  const { data: books, isLoading, isFetching } = useQueryData(query);
  const { booksItem, setBooksItem, page, setPage } = useQueryStore();
  const [lastPageNum, setLastPageNum] = useState(FIRST_PAGE);
  const loadingMore = useRef(false);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore.current && !isFetching && page < lastPageNum) {
      loadingMore.current = true;
      setPage(page + 1);
    }
  }, [isFetching, page, lastPageNum, setPage]);

  const { observe } = useInfiniteScroll(handleLoadMore);

  const observerRefCallback = useCallback((node: HTMLDivElement) => {
    if (node) observe(node);
  }, [observe]);

  useEffect(() => {
    if (books && books.content) {
      setBooksItem(page === FIRST_PAGE ? books.content : [...booksItem, ...books.content]);
      setLastPageNum(books.totalPages);
      loadingMore.current = false;
    }
  }, [books]);

  return {
    booksItem,
    observerRefCallback,
    lastPageNum,
    page,
    isLoading: isLoading || isFetching,
  };
};

export default useBooksLogic;

```

## 결과
- 이 방법을 적용하니 무한 스크롤이 정상적으로 동작하고, API 요청이 한 번씩만 발생하는 것을 확인했습니다.
- 최근에 스터디에서 useEffect를 주제로 학습했는데, useEffect를 학습했던 것이 이번 에러를 해결하는데 많은 도움이 되었습니다.

## useEffect의 동작 원리와 시점의 중요성
- useEffect는 컴포넌트가 렌더링된 후에 실행되며, 렌더링이 완료된 DOM 요소에 접근하여 그에 따른 로직을 처리합니다. 이번 문제에서 useEffect의 기본 실행 순서를 이해하지 못했더라면, 왜 observerRef가 제대로 할당되지 않는지, 그리고 왜 교차 감지가 제대로 동작하지 않는지를 파악하기 어려웠을 것입니다.

- useEffect가 DOM 요소에 ref를 할당하기 전에, React.lazy로 인해 해당 DOM 요소가 아직 생성되지 않았다는 사실을 인식하는 것이 핵심이었습니다. 이는 useEffect가 언제 실행되는지, 그리고 React의 렌더링 흐름에서 비동기적으로 로드되는 컴포넌트들이 어떻게 처리되는지를 이해하는 데에서 비롯된 인사이트였습니다.

