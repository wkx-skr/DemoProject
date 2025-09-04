export default (name, This) => {
  This.$theme = name
  window.localStorage.setItem('theme', name)
  // window.location.reload()
}
