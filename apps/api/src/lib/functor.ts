type Functor<T> = Identity<T> | Option<T> | Array<T>;
type Identity<T> = T;
type Option<T> = T | undefined;

// Identity
export function fmap<T, U>(f: (x: T) => U): (x: T) => U;

// Option
export function fmap<T, U>(
  f: (x: Exclude<T, undefined>) => U,
): (x: T) => T extends undefined ? undefined : U;

// Array
export function fmap<T, U>(f: (x: T) => U): (x: T[]) => U[];

export function fmap<T, U>(f: (x: T) => U) {
  return (x: Functor<T>) => {
    // Array
    if (Array.isArray(x)) {
      return x.map(f);
    }

    // Option & Identity
    return x === undefined ? undefined : f(x);
  };
}
