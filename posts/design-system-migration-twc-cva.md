---
title: 디자인 시스템 마이그레이션 – styled-components -> twc + cva
date: 2025-06-13
content: 기존 테마 기반 styled-components 시스템을 cva + twc 기반으로 개선하며 느낀 점과 구현 방법 공유
category: React, All
---

최근 프로젝트에서 **기존 styled-components 기반의 디자인 시스템**을 **Tailwind CSS + twc + cva 기반**으로 마이그레이션했습니다. 
그 이유와 방법, 그리고 적용 결과를 간단히 정리해봅니다.

## 마이그레이션을 하게 된 계기
기존 프로젝트에서는 `styled-components`와 내부 `theme` 객체를 사용해 UI 컴포넌트를 구축하고 있었습니다. 그러나 다음과 같은 문제점이 있었습니다:

- 테마 의존도가 높아 외부에서 재사용하거나 커스터마이징하기 어려움
- 스타일 props가 많아질수록 컴포넌트가 점점 비대해짐
- TailwindCSS 기반 유틸리티 클래스와의 혼용이 불편
- styled-components는 사실상 레거시 기술이 되었다고 판단

이러한 한계점들을 해결하고, 유지보수성과 확장성을 개선하기 위해 
**Tailwind CSS + twc(tailwind-styled-components) + cva(class-variance-authority)** 기반의 새로운 디자인 시스템으로 마이그레이션을 결심하게 되었습니다.

---

## 마이그레이션 전

기존 `Text` 컴포넌트는 `styled-components`와 `theme.ts` 의존성이 강한 구조였습니다.

```tsx
import { ReactNode } from "react";
import styled from "styled-components";
import theme from "@/styles/theme";

// Text 컴포넌트에서 사용할 props 인터페이스 정의
interface TextProps {
  fontSize?: keyof typeof theme.fontSize; // 테마의 fontSize 키 중 하나 (예: "sm", "md", "lg")
  fontWeight?: keyof typeof theme.fontWeight; // 테마의 fontWeight 키 중 하나 (예: "normal", "bold")
  lineHeight?: keyof typeof theme.lineHeight; // 테마의 lineHeight 키 중 하나
  color?: keyof typeof theme.fontColor; // 테마의 fontColor 키 중 하나
  margin?: string; // 마진 직접 입력 가능 (예: "8px 0")
  children: ReactNode; // 자식 요소
  className?: string; // 외부에서 전달 가능한 className (styled-components 확장성 용도)
}

// 실제 Text 컴포넌트 구현
const Text = ({
  fontSize = "md",
  fontWeight = "normal",
  lineHeight = "normal",
  color = "black",
  margin = "0",
  children,
  className,
}: TextProps) => {
  return (
    <CustomText
      className={className}
      $fontSize={fontSize}
      $fontWeight={fontWeight}
      $lineHeight={lineHeight}
      $margin={margin}
      $color={color}
    >
      {children}
    </CustomText>
  );
};

// styled-components 로 스타일 정의
// theme 객체를 참조하여 props 기반으로 동적 스타일을 생성
const CustomText = styled.p<{
  $fontSize: keyof typeof theme.fontSize;
  $fontWeight: keyof typeof theme.fontWeight;
  $lineHeight: keyof typeof theme.lineHeight;
  $margin: string;
  $color: keyof typeof theme.fontColor;
}>`
  font-size: ${({ $fontSize }) => theme.fontSize[$fontSize]};
  font-weight: ${({ $fontWeight }) => theme.fontWeight[$fontWeight]};
  line-height: ${({ $lineHeight }) => theme.lineHeight[$lineHeight]};
  margin: ${({ $margin }) => $margin};
  color: ${({ $color }) => theme.fontColor[$color]};
`;

export default Text;
```

이 컴포넌트는 theme 객체와의 강한 결합을 기반으로 만들어진 구조로, 일관된 디자인 시스템을 따르기에는 좋지만 Tailwind 같은 유틸리티 기반 방식으로 전환하고 싶을 때 확장성에 제약이 생기곤 합니다.

이런 구조를 cva와 twc 기반으로 바꾸면 보다 재사용성과 커스터마이징이 쉬워지고, 전역 테마 종속성 없이 독립적인 컴포넌트 작성이 가능해지는 장점이 있었습니다.

## 마이그레이션 후
styled-components + theme를 사용하던 기존 방식 대신, cva + tailwind-styled-components (twc) 기반으로 Text 컴포넌트를 재작성했습니다.
다음은 마이그레이션 후 코드입니다

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { ReactNode, HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import twc from "tailwind-styled-components";

// tailwind 유틸리티 클래스 기반 variant 설정
const textVariants = cva("text-black", {
  variants: {
    fontSize: {
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
    },
    fontWeight: {
      thin: "font-thin",
      normal: "font-normal",
      medium: "font-medium",
      bold: "font-bold",
      extraBold: "font-extrabold",
    },
    lineHeight: {
      normal: "leading-normal",
      xs: "leading-none",
      sm: "leading-tight",
      md: "leading-snug",
      lg: "leading-relaxed",
      xl: "leading-loose",
    },
    color: {
      black: "text-black",
      darkGray: "text-neutral-800",
      gray: "text-neutral-600",
      lightGray: "text-neutral-400",
      white: "text-white",
    },
  },
  defaultVariants: {
    fontSize: "md",
    fontWeight: "normal",
    lineHeight: "normal",
    color: "black",
  },
});
// textVariants에 정의된 variant들을 props로 받을 수 있도록 타입 설정
interface TextProps
  extends VariantProps<typeof textVariants>,
    Omit<HTMLAttributes<HTMLParagraphElement>, "color"> {
  children?: ReactNode;
}

const BaseText = twc.p<TextProps>`
  ${({ fontSize, fontWeight, lineHeight, color, className }) =>
    twMerge(textVariants({ fontSize, fontWeight, lineHeight, color }), className)}
`;

export default BaseText;
```

### 사용
```tsx
<Text
  fontSize="lg"
  fontWeight="bold"
  lineHeight="relaxed"
  color="gray"
>
  Text
</Text>
```

## twc의 장점 – asChild 및 ref 자동 지원
- 기존 React 컴포넌트는 forwardRef나 asChild 패턴을 직접 구현해야 했지만, twc는 이를 자동 지원합니다.

### 예시 1: 기존 방식 (forwardRef 필요)
```tsx
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("rounded-lg border bg-slate-100 text-white shadow-sm", className)}
    {...props}
  />
));
```

### twc 사용 시 (forwardRef 자동, 클래스 병합 포함)
```tsx
import { twc } from "react-twc";

const Card = twc.div`rounded-lg border bg-slate-100 text-white shadow-sm`;
```

### twc의 확장성 – asChild를 통한 slot 렌더링과 외부 라이브러리 호환성
twc는 Radix UI의 Slot 컴포넌트처럼 **slot 기반 렌더링(asChild)**을 지원하여, 다양한 HTML 태그나 외부 컴포넌트를 원하는 방식으로 감싸지 않고 스타일만 입히는 폴리모픽 구조를 쉽게 구현할 수 있습니다.

이는 다음과 같은 상황에서 유용합니다
- 버튼 컴포넌트를 `<a>` 태그로 렌더링해야 할 때
- 외부 UI 라이브러리의 컴포넌트(Radix UI, React Aria 등)에 Tailwind 기반 스타일을 적용하고 싶을 때
- 직접 만든 headless UI 컴포넌트에 스타일만 덧입혀 재사용하고자 할 때

예를 들어, Radix UI의 Dialog.Trigger나 Dropdown.MenuItem 같은 headless 구성 요소는 내부 구조만 제공하고 스타일은 직접 입혀야 하는데, 이때 twc를 사용하면 다음처럼 선언적으로 스타일링할 수 있습니다:

```tsx
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { twc } from "tailwind-styled-components";

const MenuItem = twc(DropdownMenu.Item)`px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer`;
```

- 또는 React Aria의 `<Button>`과 같은 구성 요소에도 동일하게 적용 가능합니다.

이러한 방식은 기존 컴포넌트 구조를 해치지 않으면서도 스타일 일관성과 재사용성을 유지할 수 있게 해주며, 실제 디자인 시스템에서 다양한 UI 생태계를 통합하는 데 큰 도움이 됩니다.

## 마이그레이션의 장점
- Tailwind 기반 클래스 선언으로 가독성 향상
- cva를 통한 variant 추상화 → 컴포넌트 다형성(Polymorphism) 실현
- twMerge로 외부 className과 병합 처리
- IDE 자동완성 및 타입 안정성 확보
- 불필요한 스타일 조건 분기 제거
- forwardRef 및 asChild 지원 → 재사용성과 확장성 확보

## 단점
- 초반 러닝커브: cva, twc, twMerge에 대한 개념 학습 필요
- Tailwind에 강하게 종속되기 때문에 다른 스타일 시스템과 혼용이 어려움
- 복잡한 스타일 구조에서는 twc만으로 표현하기 어려운 경우도 있음 → 필요 시 CSS module, className 조건 분기 병행

## 마이그레이션을 하면 얻은 팁
- 기존 theme.ts에서 정의된 스타일 키들을 그대로 cva의 variant 키로 옮기면 매우 편하다
- twc는 styled-components 사용 경험이 있다면 적용하기 쉬우며, JSX 내부 스타일 커스터마이징에 유리하다
- cva는 Atomic한 컴포넌트 스타일링에 적합하지만, 복잡한 스타일의 경우 twc 단독이나 CSS module 병행도 고려 가능

## 마치며
이번 마이그레이션을 통해 컴포넌트 재사용성과 스타일 일관성이 크게 향상되었습니다.
단순히 스타일링을 빠르게 하기 위한 Tailwind가 아닌, 디자인 시스템 단위로 구조화하는 데 있어
cva와 twc는 꽤 강력하고 유연한 도구라는 걸 느낄 수 있었습니다.

특히, cva를 통해 **스타일 다형성(Polymorphism)**을 타입 안전하게 선언할 수 있고, twc를 통해 forwardRef + slot-like 구성 + 선언형 스타일 관리까지 한 번에 해결할 수 있었습니다.

그중에서도 cva 기반의 variant 설계는 **다형성(polymorphism)**을 유연하게 구현할 수 있어, 하나의 컴포넌트를 다양한 상황에 맞게 재사용할 수 있는 폴리몰픽 컴포넌트 구성에 매우 적합하다고 느꼈습니다.

참고 자료:
[twc](https://react-twc.vercel.app/)
[as-child-prop](https://react-twc.vercel.app/docs/guides/as-child-prop)
[refs](https://react-twc.vercel.app/docs/guides/refs)
[styling-any-component](https://react-twc.vercel.app/docs/guides/styling-any-component)
[adapting-based-on-props](https://react-twc.vercel.app/docs/guides/adapting-based-on-props)

[cva variants](https://cva.style/docs/getting-started/variants)

