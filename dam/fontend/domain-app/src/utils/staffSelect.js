import store from '../store'
const StaffSelect = {
  openFromOrganization: arr => {
    return StaffSelect.open(arr, false, undefined, undefined, true)
  },
  open: (arr, isOne, type, taskId, showDisabledUser = true) => {
    return new Promise((resolve, reject) => {
      store.commit('changeShowDisabledUser', showDisabledUser)
      if (type) {
        store.commit('changeShowStaffSelectType', type)
        store.commit('changeTaskId', taskId)
      }
      store.commit('changeStaffData', [])
      store.commit('changeShowStaffSelect', true)
      if (isOne) {
        store.commit('changeStaffIsOne', true)
      } else {
        store.commit('changeStaffIsOne', false)
      }
      if (arr && arr.length) {
        store.commit('changeCheckedStaffData', arr)
      } else {
        store.commit('changeCheckedStaffData', [])
      }
      let isOver = false
      const repeat = (func, ms) => {
        setTimeout(() => {
          func()
          if (!isOver) {
            repeat(func, ms)
          }
        }, ms)
      }
      repeat(() => {
        if (!store.state.staffData) {
          reject()
          isOver = true
        } else if (store.state.staffData.length) {
          resolve(store.state.staffData)
          isOver = true
        }
      }, 1000)
    })
  },
  close: () => {
    store.commit('changeShowStaffSelect', false)
    store.commit('changeShowStaffSelectType', 1)
  },
}
export default StaffSelect
