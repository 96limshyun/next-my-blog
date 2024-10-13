---
title: HTTP 상태코드에 따라 ErrorBoundary의 Fallback UI 구성하기
date: 2024-10-13
content: 상태코드에 따라 Fallback UI로 에러 핸들링을 해보자
category: All, React
---

- React 애플리케이션을 개발하다 보면 다양한 에러 상황에 마주치게 됩니다. 
- 특히 API 통신 과정에서 발생하는 HTTP 에러는 사용자 경험에 큰 영향을 미칠 수 있습니다. 
- 이러한 에러를 효과적으로 처리하고 사용자에게 적절한 피드백을 제공하는 것이 중요합니다. 
- 이번 포스트에서는 React의 ErrorBoundary를 활용하여 HTTP 상태 코드에 따라 다른 Fallback UI를 구성하는 방법에 대해 알아보겠습니다.

## ErrorBoundary란?
- 리엑트 공식 홈페이지에서는 다음과 같이 ErrorBoundary를 설명하고 있습니다.
```
UI의 일부분에 존재하는 자바스크립트 에러가 전체 애플리케이션을 중단시켜서는 안 됩니다. React 사용자들이 겪는 이 문제를 해결하기 위해 React 16에서는 에러 경계(“error boundary”)라는 새로운 개념이 도입되었습니다.

에러 경계는 하위 컴포넌트 트리의 어디에서든 자바스크립트 에러를 기록하며 깨진 컴포넌트 트리 대신 폴백 UI를 보여주는 React 컴포넌트입니다. 에러 경계는 렌더링 도중 생명주기 메서드 및 그 아래에 있는 전체 트리에서 에러를 잡아냅니다.
```
- 즉, 하위 컴포넌트에서 발생한 에러를 잡아내 fallback UI를 보여주는것 입니다.

## ErrorBoundary를 클래스 컴포넌트로 구현해야 하는 이유
- ErrorBoundary를 구현할 때는 클래스 컴포넌트를 사용해야 합니다. 이에 대한 중요한 이유와 구현 방법을 살펴보겠습니다

  - React 공식 가이드라인: React 공식 문서에서는 명확하게 "현재 오류 경계를 함수 구성 요소로 작성할 방법은 없습니다"라고 명시하고 있습니다.
  - 필요한 생명주기 메서드: ErrorBoundary 구현에는 클래스 컴포넌트의 특정 생명주기 메서드가 필요합니다.
  1. getDerivedStateFromError: 이 메서드는 하위 컴포넌트에서 오류가 발생했을 때 호출됩니다. 주로 오류가 발생한 후 폴백 UI를 렌더링하는 데 사용됩니다.
  2. componentDidCatch: 이 메서드는 오류 정보를 기록하는 데 사용됩니다.
  3. 함수형 컴포넌트의 한계: 현재 함수형 컴포넌트에서는 위의 생명주기 메서드와 동일한 기능을 제공하는 훅(Hook)이 없습니다. 따라서 함수형 컴포넌트로는 ErrorBoundary의 핵심 기능을 구현할 수 없습니다.

- 공식문서에 나와있는 예제를 보면 아래와 같습니다.
```tsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Example "componentStack":
    //   in ComponentThatThrows (created by App)
    //   in ErrorBoundary (created by App)
    //   in div (created by App)
    //   in App
    logErrorToMyService(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback;
    }

    return this.props.children;
  }
}
```

## ErrorBoundary의 한계
- ErrorBoundary는 강력한 에러 처리 메커니즘을 제공하지만, 모든 종류의 에러를 포착할 수 있는 것은 아닙니다. 
- 공식 홈페이지에서는 다음과 같은 에러는 포착하지 못 한다고 명시하고 있습니다.

![errorBoundary](/errorboundary1.png)

- 이 중에서 특히 주목해야 할 점은 비동기적 코드에서 발생하는 에러입니다. 
- API 호출과 같은 비동기 작업에서 발생하는 HTTP 에러는 ErrorBoundary로 직접 잡을 수 없습니다.

## 2. 비동기 오류 잡기위한 unhandledrejection 사용
- 공식문서에 나와있는 것처럼 ErrorBoundary에서는 비동기 오류를 처리할 수 없습니다.
- ErrorBoundary에서 비동기 오류를 잡아내기 위해서는 [unhandledrejection](https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event)이라는 이벤트를 사용할 수 있습니다.
- MDN을 보면 알 수 있지만, "unhandledrejection"이벤트는 프로미스가 reject상태가 되었을 때 중간 rejection이 없을 때 발생하는 이벤트입니다.
- "unhandledrejection" 이벤트를 사용해 위의 에러바운더리 코드를 수정하고 타입을 정의해 봅시다.

```
import React, { ReactNode } from "react";

interface ErrorBoundaryProps {
    fallback?: ReactNode;
    children?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false};
        this.captureReject = this.captureReject.bind(this);
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true };
    }

    componentDidMount() {
        window.addEventListener("unhandledrejection", this.captureReject);
    }

    componentWillUnmount() {
        window.removeEventListener("unhandledrejection", this.captureReject);
    }

    captureReject(e: PromiseRejectionEvent) {
        e.preventDefault();
        console.log(e.reason)
        this.setState({ hasError: true });
    }

    render() {
        if (this.state.hasError) {
            return <div>에러바운더리</div>
        }

        return this.props.children;
    }
}

export default ErrorBoundary
```

1. componentDidMount():
   - 컴포넌트가 마운트될 때 unhandledrejection 이벤트 리스너를 추가합니다.
   - 이 이벤트는 처리되지 않은 Promise 거부가 발생할 때 트리거됩니다.

2. componentWillUnmount():
   - 컴포넌트가 언마운트될 때 이벤트 리스너를 제거합니다.
   - 메모리 누수를 방지

- 이제 하위 컴포넌트에서 비동기 에러가 발생했을때 throw한 에러를 에러바운더리에서 잡을 수 있습니다.
- 간단하게 msw로 api를 만들어 상태코드 400을 던져보겠습니다.

```
// App.tsx
<ErrorBoundary >
    <ApiComponent />
</ErrorBoundary>

// ApiComponent.tsx
import { useEffect } from "react";

const DEFAULT_STATUS_CODE = "400"

const ApiComponent = () => {
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("errorAPI");
                if (!response.ok) {
                    throw new Error(`${response.status}`);
                }
            } catch (error) {
                if (error instanceof Error) {
                    throw error;
                } else {
                    throw new Error(DEFAULT_STATUS_CODE);
                }
            }
        };

        fetchData();
    }, []);

    return <div>ApiComponent</div>;
};

export default ApiComponent;

// errorHandler.tsx
import { http, HttpResponse } from 'msw';

const errorHandlers = [
    http.get('errorAPI', () => {
        return HttpResponse.json(
            { message: 'Bad Request' }, 
            { status: 400 }
        );
    }),
];

export default errorHandlers;
```

![errorBoundary](/errorboundary2.png)

- 이제 위처럼 비동기 오류를 잡아낼 수 있게 되었습니다.

## HTTP 상태코드에 따른 ErrorBoundary의 Fallback UI 보여주기
- 이제 throw한 상태코드를 받아 코드에 따라 선언적으로 fallback UI 보여주도록 해봅시다.
- 간단한 예시로 400, 404, 500에 대한 처리를 해보겠습니다.

```
// ErrorFallback.tsx
export interface ErrorProps {
    statusCode?: number;
    resetError?: () => void;
}

export interface ErrorProps {
    statusCode?: number;
    resetError?: () => void;
}

export const HTTP_ERROR_MESSAGE = {
    404: {
        HEADING: "404",
        BODY: "요청하신 페이지를 찾을 수 없습니다.",
        BUTTON: "홈으로 돌아가기",
    },
    500: {
        HEADING: "서버 오류가 발생했습니다",
        BODY: "잠시 후 다시 요청해주세요.",
        BUTTON: "새로고침",
    },
    400: {
        HEADING: "잘못된 요청입니다.",
        BODY: "확인 후 다시 시도해주세요.",
        BUTTON: "홈으로 돌아가기",
    },
} as const;

const ErrorFallback = ({ statusCode = 404, resetError }: ErrorProps) => {
    const currentStatusCode = statusCode as keyof typeof HTTP_ERROR_MESSAGE;
    return (
        <div>
            <h1>{HTTP_ERROR_MESSAGE[currentStatusCode].HEADING}</h1>
            <p>{HTTP_ERROR_MESSAGE[currentStatusCode].BODY}</p>
            <button onClick={resetError}>
                {HTTP_ERROR_MESSAGE[currentStatusCode].BUTTON}
            </button>
        </div>
    );
};

export default ErrorFallback;
```

1. ErrorProps 인터페이스:
   - statusCode: 오류의 HTTP 상태 코드를 나타냅니다.
   - resetError: 오류 상태를 리셋하는 함수입니다.

2. HTTP_ERROR_MESSAGE:
   - 각 HTTP 상태 코드에 대한 메시지를 정의한 객체입니다.
   - 각 상태 코드마다 제목(HEADING), 본문(BODY), 버튼 텍스트(BUTTON)을 정의했습니다.
   - as const를 사용하여 객체를 읽기 전용으로 만들어 타입 안정성을 높였습니다.

3. ErrorFallback 컴포넌트:
   - statusCodeprop을 받아 해당하는 에러 메시지를 표시합니다.
   - 기본값으로 404를 사용합니다.
   - currentStatusCode를 keyof typeof HTTP_ERROR_MESSAGE로 타입 단언하여 타입 안정성을 확보합니다.

- 이제 ErrorBoundary에 fallback, onReset을 props로 넘겨봅시다.
```
function AppContent() {
  const navigate = useNavigate()
  return (
    <ErrorBoundary 
      fallback={ErrorFallback} 
      onReset={()=>{ navigate('/') }}
    >
      <ApiComponent />
    </ErrorBoundary>
  )
}
```

- ErrorBoundary에서 error를 선언해 에러가 발생했을때 fallback에 error에 있는 statusCode를 넘겨줍니다.
```
this.state = { hasError: false, error: null };
```

- 에러가 발생했을때 throw한 에러를 state에 업데이트 해줍니다.
```
captureReject(e: PromiseRejectionEvent) {
    e.preventDefault();
    const error = e.reason instanceof Error ? e.reason : new Error(String(e.reason));
    this.setState({ hasError: true, error });
}
```

- state가 업데이트 되면 statusCode를 fallback에 넘겨줍니다.
```
render(): ReactNode {
    const { fallback: Fallback, children } = this.props;
    if (this.state.hasError) {
        const status = this.state.error?.message ? parseInt(this.state.error.message) : undefined

        return <Fallback 
            statusCode={status}
            resetError={this.resetError}
        />;
    }

    return children;
}
```

### 전체코드
```
import React, { ComponentType, ReactNode } from "react";
import { ErrorProps } from "./ErrorFallback"; 

interface ErrorBoundaryProps {
    fallback: ComponentType<ErrorProps>;
    onReset: () => void;
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
        this.captureReject = this.captureReject.bind(this);
        this.resetError = this.resetError.bind(this);
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidMount() {
        window.addEventListener("unhandledrejection", this.captureReject);
    }

    componentWillUnmount() {
        window.removeEventListener("unhandledrejection", this.captureReject);
    }

    captureReject(e: PromiseRejectionEvent) {
        e.preventDefault();
        const error = e.reason instanceof Error ? e.reason : new Error(String(e.reason));
        this.setState({ hasError: true, error });
    }

    resetError() {
        this.props.onReset()
        this.setState({ hasError: false, error: null });
    }

    render(): ReactNode {
        const { fallback: Fallback, children } = this.props;
        if (this.state.hasError) {
            const status = this.state.error?.message ? parseInt(this.state.error.message) : undefined

            return <Fallback 
                statusCode={status}
                resetError={this.resetError}
            />;
        }

        return children;
    }
}

export default ErrorBoundary;
```

## 결과
- 이제 비동기 에러를 발생시켜 상태코드에 따라 업데이트 되는지 확인해봅시다.
```
import { http, HttpResponse } from 'msw';

const errorHandlers = [
    http.get('errorAPI', () => {
        return HttpResponse.json(
            { message: 'Bad Request' }, 
            { status: 400 }
            // { status: 404 }
            // { status: 500 }
        );
    }),
];

export default errorHandlers;

```

![errorBoundary](/errorboundary3.png)
![errorBoundary](/errorboundary4.png)
![errorBoundary](/errorboundary5.png)










