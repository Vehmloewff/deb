export const makeArray = <T>(val: T | T[]) => (Array.isArray(val) ? val : [val])
