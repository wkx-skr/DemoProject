const encodeHtml = (html: string): string => {
  if (html) {
    return html.replace(/<img/g, '&lt;img').replace(/<script/g, '&lt;script')
  } else {
    return ''
  }
  
}
export { encodeHtml }
