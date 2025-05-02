/**
 * 개발 원칙
 * 1. 함수 합성 : 작은 순수함수들을 조합해서 복잡한 동작을 구현해요
 * 2. 불변성 유지 : 데이터 변경 없이 항상 새로운 객체를 반환해요
 * 3. 재사용성 : 범용적이고 조합 가능한 함수를 만들도록 설계해요
 * 4. 타입 안정성 : 명확한 인터페이스로 오류 가능성을 최소화 해요
 * 
 * 함수 조작 : compose, pipe, curry, partial
 * 데이터 조작 : updateObject, updateArray
 * 로직 구성 : ifElse, both, either
 * 성능 최적화 : memoize
 *

/**
 * identity 함수 - 입력값을 그대로 반환
 */
const identity = x => x;

/**
 * 함수 합성 - 오른쪽에서 왼쪽 방향으로 함수들을 조합
 * compose(f, g, h)(x) = f(g(h(x)))
 */
const compose = (...fns) => 
  fns.length === 0 
    ? identity 
    : fns.reduce((f, g) => (...args) => f(g(...args)));

/**
 * 파이프 - 왼쪽에서 오른쪽 방향으로 함수들을 조합
 * pipe(f, g, h)(x) = h(g(f(x)))
 */
const pipe = (...fns) => 
  fns.length === 0 
    ? identity 
    : fns.reduce((f, g) => (...args) => g(f(...args)));

/**
 * 객체 불변 업데이트 - 기존 객체에 변경사항 적용해 새 객체 반환
 */
const updateObject = (obj, updates) => ({
  ...obj,
  ...updates
});

/**
 * 배열 불변 업데이트 - 특정 인덱스의 요소를 새 값으로 대체한 새 배열 반환
 */
const updateArray = (arr, index, newValue) => [
  ...arr.slice(0, index),
  newValue,
  ...arr.slice(index + 1)
];

/**
 * 커링 - 다중 인자 함수를 단일 인자 함수들의 체인으로 변환
 */
const curry = (fn) => {
  const arity = fn.length;
  return function curried(...args) {
    if (args.length >= arity) {
      return fn(...args);
    }
    return (...moreArgs) => curried(...args, ...moreArgs);
  };
};

/**
 * 부분 적용 - 함수의 일부 인자를 미리 적용
 */
const partial = (fn, ...presetArgs) => 
  (...laterArgs) => fn(...presetArgs, ...laterArgs);

/**
 * 디버깅용 tap 함수 - 값을 변경하지 않고 사이드 이펙트(로깅 등) 수행
 */
const tap = (fn) => (value) => {
  fn(value);
  return value;
};

/**
 * 속성 접근자 - 객체에서 특정 속성 추출
 */
const prop = curry((key, obj) => obj[key]);

/**
 * 메모이제이션 - 함수 호출 결과 캐싱
 */
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * 조건부 함수 적용 - 조건에 따라 두 함수 중 하나 적용
 */
const ifElse = curry((condition, onTrue, onFalse, value) => 
  condition(value) ? onTrue(value) : onFalse(value)
);

/**
 * 배열 반복 처리 without 방식의 forEach
 * 원본 배열 반환 (체이닝 가능)
 */
const forEach = curry((fn, arr) => {
  arr.forEach(fn);
  return arr;
});

/**
 * 함수 조합을 통한 논리 연산
 */
const both = curry((f, g) => x => f(x) && g(x));
const either = curry((f, g) => x => f(x) || g(x));
const not = (f) => x => !f(x);

export {
  identity,
  compose,
  pipe,
  updateObject,
  updateArray,
  curry,
  partial,
  tap,
  prop,
  memoize,
  ifElse,
  forEach,
  both,
  either,
  not
};