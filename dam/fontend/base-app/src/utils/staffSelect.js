import store from '../store'
const StaffSelect = {
  openFromOrganization: arr => {
    return StaffSelect.open(arr, false, undefined, undefined, true)
  },
  start(obj = { arr: [] }) {
    let { arr, isOne, type, taskId, showDisabledUser, disabledList, filterIds } = obj
    return StaffSelect.open(
      arr,
      isOne,
      type,
      taskId,
      showDisabledUser,
      filterIds,
      disabledList
    )
  },
  open: (
    arr,
    isOne,
    type,
    taskId,
    showDisabledUser = true,
    filterIds = [],
    disabledList = []
  ) => {
    return new Promise((resolve, reject) => {
      store.commit('changeUserSelectDisabledList', disabledList)
      store.commit('changeUserSelectFilterIds', filterIds)
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
