const getDataAppliObj = attr => {
  const str = localStorage.getItem(attr)
  let result = null

  try {
    result = JSON.parse(str)
    if (typeof result === 'object' && result) {
    } else {
      result = {}
    }
  } catch (e) {
    result = {}
  }
  return result
}
export default {
  /**
   * 将数据申请的 table objectId 保存到本地
   * 注意: 数组项内不能包含 ';'
   */
  saveDataApplication({ attr, data, type, userName }) {
    attr = attr || 'dataApply'
    userName = userName || ''
    type = type || 'Object'

    let result = ''
    if (type === 'Array') {
      const arr = str ? str.split(';') : []
      if (arr.length > 0) {
        const index = arr.findIndex(item2 => {
          return item2 == data
        })
        if (index === -1) {
          arr.push(data)
        }
      } else {
        arr.push(data)
      }
      str = arr.join(';')
    } else if (type === 'Object') {
      const obj = getDataAppliObj(attr)
      //   dataApply(obj): {
      //     username1: [objectId1, objectId2],
      //     username2: [],
      //   }

      let objIdArr = obj[userName] || []
      if (objIdArr && Array.isArray(objIdArr)) {
        const index = objIdArr.findIndex(item => {
          return item == data
        })
        if (index === -1) {
          objIdArr.push(data)
        }
      } else {
        objIdArr = [data]
      }
      obj[userName] = objIdArr
      result = JSON.stringify(obj)
    }
    localStorage.setItem(attr, result)
  },
  getDataApplication({ attr, type, userName }) {
    userName = userName || ''
    type = type || 'Object'
    attr = attr || 'dataApply'

    const str = localStorage.getItem(attr)
    let result = null
    if (type === 'Object') {
      const obj = getDataAppliObj(attr)
      result = obj[userName] || []
    }

    return result
  },
  removeDataApplication({ attr, data, type, userName }) {
    attr = attr || 'dataApply'
    userName = userName || ''
    type = type || 'Object'

    let result = ''
    if (type === 'Object') {
      const obj = getDataAppliObj(attr)

      let objIdArr = obj[userName] || []
      if (objIdArr && Array.isArray(objIdArr)) {
        const index = objIdArr.findIndex(item => {
          return item == data
        })
        if (index !== -1) {
          objIdArr.splice(index, 1)
        }
      } else {
        objIdArr = []
      }
      obj[userName] = objIdArr
      result = JSON.stringify(obj)
    }
    localStorage.setItem(attr, result)
  },
}
