"use client";

import { useInView } from "motion/react";
import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * Plays an exact tqXxx CSS keyframe once an element scrolls into view.
 * Mirrors the source site's IntersectionObserver(threshold:0.25, rootMargin:'0px 0px -8% 0px')
 * reveal, but driven by Motion's useInView instead of a hand-rolled observer.
 */
export function RevealOnScroll({
  animation,
  as: Tag = "div",
  className,
  style,
  children,
  ...rest
}: {
  animation: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [key: string]: unknown;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.25,
    margin: "0px 0px -8% 0px",
  });

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: inView ? undefined : 0,
        animation: inView ? animation : undefined,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
