let store = {
  namespaced: true,
  state: {
    currentFileType: {
      type: 0,
      id: null
    },
    auth: {
      isAdmin: false
    },
    openTableData: [],
    sqlSetting: {},
    serverList: []
  },
  getters: {

  },
  mutations: {
    setCurrentFileType (state, value) {
      state.currentFileType = value
    },
    setAuth (state, value) {
      state.auth = value
    },
    setOpenTableData (state, value) {
      state.openTableData.push(value)
    },
    setSetting (state, value) {
      state.sqlSetting[value.id] = {
        timeout: value.timeout || 1800,
        sqlNum: value.sqlNum || 10
      }
    },
    delSetting (state, id) {
      delete state.sqlSetting[id]
    },
    setServerList (state, value) {
      state.serverList = value
    }
  },
  actions: {

  }
}

export default store
