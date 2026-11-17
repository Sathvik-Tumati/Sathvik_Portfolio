import { Children, cloneElement, isValidElement, useEffect, useRef, useState } from 'react';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Runs `onEnter` once, the first time the element scrolls into view.
function useInView(onEnter) {
  const ref = useRef(null);
  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        onEnter(entry.target);
      },
      { rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(ref.current);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}

// Rises into place the first time it scrolls into view. `delay` (ms) staggers siblings.
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useInView((el) => el.classList.add('is-in'));
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ '--d': `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

// Counts from 0 to `to` the first time it scrolls into view.
export function CountUp({ to }) {
  const [n, setN] = useState(0);
  const ref = useInView(() => {
    if (reducedMotion()) return setN(to);
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 1400);
      setN(Math.round(to * (1 - Math.pow(1 - t, 4))));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  return <span ref={ref}>{n}</span>;
}

// Current time in Hyderabad.
export function Clock() {
  const fmt = () =>
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }).format(new Date());
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 20000);
    return () => clearInterval(id);
  }, []);
  return <>{time} IST</>;
}

// Wraps every word in a mask so a headline can rise word by word once its
// parent <Reveal> scrolls in. Elements such as <em> keep their styling.
export function Words({ children }) {
  let i = 0;
  const split = (node) => {
    if (typeof node === 'string') {
      return node.split(/(\s+)/).map((part, k) =>
        !part || /^\s+$/.test(part) ? part : (
          <span className="w" key={k}>
            <span style={{ '--i': i++ }}>{part}</span>
          </span>
        )
      );
    }
    return isValidElement(node) ? cloneElement(node, {}, Children.map(node.props.children, split)) : node;
  };
  return Children.map(children, split);
}
