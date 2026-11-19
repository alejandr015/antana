const REACT_ELEMENT_TYPE = Symbol.for('react.element');
const REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
const REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
const REACT_MEMO_TYPE = Symbol.for('react.memo');

export const Fragment = REACT_FRAGMENT_TYPE;

export const typeOf = (object) => {
  if (typeof object === 'object' && object !== null) {
    const $$typeof = object.$$typeof;
    if ($$typeof === REACT_ELEMENT_TYPE) {
      const type = object.type;
      if (type === REACT_FRAGMENT_TYPE) return REACT_FRAGMENT_TYPE;
      return $$typeof;
    }
    return $$typeof;
  }
  return undefined;
};

export const isFragment = (object) =>
  Boolean(object && (object.$$typeof === REACT_FRAGMENT_TYPE || object.type === REACT_FRAGMENT_TYPE));

export const isElement = (object) =>
  typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;

export const isValidElementType = (type) =>
  typeof type === 'string' ||
  typeof type === 'function' ||
  type === REACT_FRAGMENT_TYPE ||
  (typeof type === 'object' &&
    type !== null &&
    (type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_MEMO_TYPE));

export default { Fragment, typeOf, isFragment, isElement, isValidElementType };
