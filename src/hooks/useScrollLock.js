import { useEffect } from 'react';

// Locks page scroll via position:fixed on <body> rather than plain
// overflow:hidden — overflow:hidden alone still lets mobile Safari's
// touchmove rubber-band the page and briefly reveal whatever's below the
// fold; position:fixed removes the body from the scrollable flow
// entirely, so there's nothing to bounce. Restores the exact prior scroll
// position on unlock.
export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const scrollY = window.scrollY;
    const { style } = document.body;
    const prev = {
      position: style.position,
      top: style.top,
      left: style.left,
      right: style.right,
      width: style.width,
    };
    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.left = '0';
    style.right = '0';
    style.width = '100%';
    return () => {
      style.position = prev.position;
      style.top = prev.top;
      style.left = prev.left;
      style.right = prev.right;
      style.width = prev.width;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}
