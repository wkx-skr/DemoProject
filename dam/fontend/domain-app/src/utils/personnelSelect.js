import store from '../store'
let interval = null
export default {
  open: obj => {
    store.commit('changeShowPersonnelSelect', true)
    return new Promise(resolve => {
      store.commit('changePersonnelData', null)
      store.commit('changePersonnelProp', obj)
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
