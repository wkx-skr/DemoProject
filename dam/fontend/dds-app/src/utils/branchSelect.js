import store from '../store'
let interval = null
export default {
  open: branchIsCheckBox => {
    return new Promise(resolve => {
      store.commit('changeBranchData', {})
      store.commit('changeShowBranchSelect', true)
      if (branchIsCheckBox) {
        store.commit('changeBranchIsCheckBox', true)
      } else {
        store.commit('changeBranchIsCheckBox', false)
      }
      interval = setInterval(() => {
        if (JSON.stringify(store.state.branchData) !== '{}') {
          clearInterval(interval)
          resolve(store.state.branchData)
        }
      }, 200)
    })
  },
  close: fromCancel => {
    if (fromCancel) {
      clearInterval(interval)
      interval = null
    }
    store.commit('changeShowBranchSelect', false)
  },
}
