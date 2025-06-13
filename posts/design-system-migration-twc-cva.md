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
// 실제 variant 조합을 받아 className string으로 반환하는 헬퍼 함수
const text = (variants: VariantProps<typeof textVariants>) =>
  twMerge(textVariants(variants));

const BaseText = twc.p``;
// 최종 Text 컴포넌트 정의
const Text = ({
  fontSize,
  fontWeight,
  lineHeight,
  color,
  className,
  children,
  ...props
}: TextProps) => {
  return (
    <BaseText
      {...props}
      className={twMerge(
        text({ fontSize, fontWeight, lineHeight, color }),
        className
      )}
    >
      {children}
    </BaseText>
  );
};

export default Text;
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

## 장점
- 가독성 향상
  - Tailwind 클래스 기반으로 어떤 스타일이 적용되는지 한눈에 파악 가능
- 재사용성 강화
  - cva를 통한 variant 선언으로 다형성 구현 가능
- 유지보수 쉬움
  - 스타일 충돌 없이 컴포넌트 단위 수정 가능
- className 병합 가능
  - twMerge를 통해 props 스타일과 외부 클래스 병합 가능
- 자동완성 지원
  - VariantProps를 통해 fontSize="lg" 같은 입력 시 IDE 자동완성 가능 → 생산성과 실수 방지에 모두 효과적

## 단점
- 초기 학습 비용
  - cva, twc, twMerge 각각의 개념과 용법을 익혀야 함
- Tailwind 종속
- Tailwind를 사용하는 팀/프로젝트에서만 유용(SC, Emotion 등 다른 방식과 병행 사용은 비추천)

## 마이그레이션을 하면 얻은 팁
- 기존 theme.ts에서 정의된 스타일 키들을 그대로 cva의 variant 키로 옮기면 매우 편하다
- twc는 styled-components 사용 경험이 있다면 적용하기 쉬우며, JSX 내부 스타일 커스터마이징에 유리하다
- cva는 Atomic한 컴포넌트 스타일링에 적합하지만, 복잡한 스타일의 경우 twc 단독이나 CSS module 병행도 고려 가능

## 마치며
이번 마이그레이션을 통해 컴포넌트 재사용성과 스타일 일관성이 크게 향상되었습니다.
단순히 스타일링을 빠르게 하기 위한 Tailwind가 아닌, 디자인 시스템 단위로 구조화하는 데 있어
cva와 twc는 꽤 강력하고 유연한 도구라는 걸 느낄 수 있었습니다.

특히, styled-components는 개발이 중단되어 점점 레거시 기술로 간주되는 추세이며,
앞으로는 tailwindcss와 cva 기반의 유틸리티/variant 기반 컴포넌트 설계가 점점 더 많아질 것으로 보입니다.

그중에서도 cva 기반의 variant 설계는 **다형성(polymorphism)**을 유연하게 구현할 수 있어, 하나의 컴포넌트를 다양한 상황에 맞게 재사용할 수 있는 폴리몰픽 컴포넌트 구성에 매우 적합하다고 느꼈습니다.
