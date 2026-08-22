"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { TransitionRouter } from "next-transition-router";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { dispatchMenuClose } from "@/utils/menuClose";
import { scrollToTop } from "@/utils/scrollToTop";

const ROWS = 2;
const COLS = 5;
const ease = "power4.inOut";

gsap.registerPlugin(ScrollTrigger);

export default function TransitionProvider({ children }) {
  const pathname = usePathname();
  const lenis = useLenis();
  const row1Ref = useRef(null);
  const row2Ref = useRef(null);
  const gridRef = useRef(null);
  const isTransitioningRef = useRef(false);

  // toggle pointer-events blocking on the transition grid
  const setTransitionBlocking = (blocking) => {
    gridRef.current?.classList.toggle("is-blocking", blocking);
  };

  // collect all transition block elements from both rows
  const getBlocks = () => [
    ...Array.from(row1Ref.current?.querySelectorAll(".transition-block") || []),
    ...Array.from(row2Ref.current?.querySelectorAll(".transition-block") || []),
  ];

  // hide all blocks on mount
  useEffect(() => {
    const blocks = getBlocks();
    gsap.set(blocks, { scaleY: 0, visibility: "hidden" });
  }, []);

  // scroll to top on non-transition route changes (hash, same-route, etc.)
  useLayoutEffect(() => {
    if (isTransitioningRef.current) return;

    scrollToTop(lenis);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
  }, [pathname, lenis]);

  return (
    <TransitionRouter
      auto
      leave={(next) => {
        isTransitioningRef.current = true;
        setTransitionBlocking(true);

        const blocks = getBlocks();
        gsap.set(blocks, { visibility: "visible", scaleY: 0 });
        const tween = gsap.to(blocks, {
          scaleY: 1,
          duration: 1,
          stagger: {
            each: 0.1,
            from: "start",
            grid: [ROWS, COLS],
            axis: "x",
          },
          ease,
          onComplete: next,
        });
        return () => tween.kill();
      }}
      enter={(next) => {
        dispatchMenuClose();

        // new page is mounted behind overlay — reset scroll here, not on leave
        scrollToTop(lenis);

        const blocks = getBlocks();
        gsap.set(blocks, { visibility: "visible", scaleY: 1 });
        const tween = gsap.to(blocks, {
          scaleY: 0,
          duration: 1,
          stagger: {
            each: 0.1,
            from: "start",
            grid: [ROWS, COLS],
            axis: "x",
          },
          ease,
          onComplete: () => {
            gsap.set(blocks, { visibility: "hidden" });
            setTransitionBlocking(false);
            isTransitioningRef.current = false;
            next();
          },
        });
        return () => tween.kill();
      }}
    >
      <div className="transition-grid" ref={gridRef}>
        <div className="transition-row row-1" ref={row1Ref}>
          {Array.from({ length: COLS }).map((_, i) => (
            <div key={i} className="transition-block" />
          ))}
        </div>
        <div className="transition-row row-2" ref={row2Ref}>
          {Array.from({ length: COLS }).map((_, i) => (
            <div key={i} className="transition-block" />
          ))}
        </div>
      </div>
      {children}
    </TransitionRouter>
  );
}
