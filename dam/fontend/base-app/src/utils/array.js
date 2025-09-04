export default {
  filterVFor(array, condition) {
    const result = {}
    array.forEach((val, index) => {
      if (condition(val)) {
        result[index] = val
      }
    })
    return result
  },
}
