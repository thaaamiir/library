import {
  ComponentPropsWithoutRef,
  ElementType,
  Fragment,
  ReactNode,
  RefObject,
  createElement,
  useEffect,
  useState,
} from 'react';

type MotionProps = {
  initial?: unknown;
  animate?: unknown;
  exit?: unknown;
  variants?: unknown;
  transition?: unknown;
  whileInView?: unknown;
  viewport?: unknown;
  layout?: unknown;
  children?: ReactNode;
};

type MotionComponent<T extends ElementType> = (
  props: ComponentPropsWithoutRef<T> & MotionProps,
) => JSX.Element;

function createMotionComponent<T extends ElementType>(tag: T): MotionComponent<T> {
  return function MotionElement({
    initial,
    animate,
    exit,
    variants,
    transition,
    whileInView,
    viewport,
    layout,
    style,
    ...props
  }: ComponentPropsWithoutRef<T> & MotionProps) {
    const motionStyle = {
      transition: 'opacity 500ms ease, transform 500ms ease, background-color 220ms ease',
      ...style,
    };

    return createElement(tag, { ...props, style: motionStyle });
  };
}

export const motion = {
  a: createMotionComponent('a'),
  article: createMotionComponent('article'),
  div: createMotionComponent('div'),
  form: createMotionComponent('form'),
  h1: createMotionComponent('h1'),
  p: createMotionComponent('p'),
  tr: createMotionComponent('tr'),
};

export function AnimatePresence({ children }: { children: ReactNode; initial?: boolean }) {
  return <>{children}</>;
}

export function useInView(
  ref: RefObject<Element>,
  options: { once?: boolean; amount?: number } = {},
) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);

          if (options.once) {
            observer.disconnect();
          }
        } else if (!options.once) {
          setInView(false);
        }
      },
      { threshold: options.amount ?? 0 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [options.amount, options.once, ref]);

  return inView;
}

export { Fragment };
