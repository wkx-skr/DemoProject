import store from '../store'
export default {
  open: (arr, isOne, type, taskId) => {
    return new Promise((resolve, reject) => {
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
        }
        if (store.state.staffData.length) {
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
