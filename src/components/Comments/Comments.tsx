'use client';
import { useEffect, useRef } from 'react';

export default function Comment() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || ref.current.hasChildNodes()) return;

    const scriptEl = document.createElement('script');
    scriptEl.src = 'https://giscus.app/client.js';
    scriptEl.async = true;
    scriptEl.crossOrigin = 'anonymous';
    scriptEl.setAttribute('data-repo', '96limshyun/next-my-blog');
    scriptEl.setAttribute('data-repo-id', 'R_kgDOL0yKTA');
    scriptEl.setAttribute('data-category', 'Comments');
    scriptEl.setAttribute('data-category-id', 'DIC_kwDOL0yKTM4CfD-B');
    scriptEl.setAttribute('data-mapping', 'pathname');
    scriptEl.setAttribute('data-strict', '0');
    scriptEl.setAttribute('data-reactions-enabled', '1');
    scriptEl.setAttribute('data-emit-metadata', '0');
    scriptEl.setAttribute('data-input-position', 'bottom');
    scriptEl.setAttribute('data-theme', 'noborder_light');
    scriptEl.setAttribute('data-lang', 'ko');
    scriptEl.setAttribute('crossorigin', 'anonymous');

    ref.current.appendChild(scriptEl);
  }, []);

  return <section ref={ref} />;
}