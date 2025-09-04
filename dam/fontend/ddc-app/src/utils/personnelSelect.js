import store from '../store'
let interval = null
export default {
  open: obj => {
    return new Promise(resolve => {
      store.commit('changePersonnelData', null)
      store.commit('changePersonnelProp', obj)
      store.commit('changeShowPersonnelSelect', true)
      interval = setInterval(() => {
        if (store.state.personnelData !== null) {
          resolve(store.state.personnelData)
          clearInterval(interval)
        }
      }, 200)
    })
  },
  close: fromCancel => {
    if (fromCancel) {
      clearInterval(interval)
      interval = null
    }
    store.commit('changeShowPersonnelSelect', false)
  },
}
