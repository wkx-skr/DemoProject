const basicFormatter = (id: number, categories: any) => {
  let result: string = categories[id] ? categories[id].categoryName : ''
  if (categories[id] && categories[id].categoryAbbreviation) {
    result += ' (' + categories[id].categoryAbbreviation + ')'
  }
  return result
}
export { basicFormatter }
