Number.isFinite = Number.isFinite || function (value) {
  return typeof value === 'number' && isFinite(value)
}

Number.isInteger = Number.isInteger || function (val) {
  return typeof val === 'number' &&
  isFinite(val) &&
  Math.floor(val) === val
}

Number.parseFloat = Number.parseFloat || parseFloat

Number.isNaN = Number.isNaN || function (value) {
  return value !== value // eslint-disable-line
}

/**
 * a reduce function for calculating custom cluster properties
 *
 * @example
 * function (accumulated, props) { accumulated.sum += props.sum; }
 */
reduce?: (accumulated: any, props: any) => void;

/**
 * initial properties of a cluster (before running the reducer)
 *
 * @example
 * function () { return {sum: 0}; }
 */
initial?: () => any;

/**
 * properties to use for individual points when running the reducer
 *
 * @example
 * function (props) { return {sum: props.my_value}; }
 */
map?: (props: any) => any;