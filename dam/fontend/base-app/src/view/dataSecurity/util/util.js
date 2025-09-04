import { ruleTypeEnum } from '@/view/dataSecurity/util/attrEnum'
import i18n from '@/next/i18n'
// console.log(i18n.t('accessStrategy.title'))
// 智能识别获取优先级
export const getPriorityType = type => {
  let result = ''
  switch (parseFloat(type)) {
    case 1:
      result = 'P1'
      break
    case 2:
      result = 'P2'
      break
    case 3:
      result = 'P3'
      break
    default:
      result = 'P1'
      break
  }
  return result
}
// 智能识别：规则类型 === num
export const methodRuleType = (type, num = 1) => {
  let result = ''
  let color = ''
  let rgba = ''
  let icon = ''
  switch (type) {
    case ruleTypeEnum.GENERAL_RULE:
      result = '一般规则'
      color = '#0095d9'
      rgba = '(0,149,217,0.1)'
      icon = 'icon-xinxi'
      break
    case ruleTypeEnum.CONSANGUINITY_CASCADE:
      result = '血缘级联规则'
      color = '#4b5cc4'
      rgba = '(75,92,196,0.1)'
      icon = 'icon-lineage'
      break
    case ruleTypeEnum.MACHINE_LEARNING:
      result = '机器学习规则'
      color = '#c44ad1'
      rgba = '(196,74,209,0.1)'
      icon = 'icon-Machine'
      break
    default:
      result = '一般规则'
      color = '#0095d9'
      rgba = '(0,149,217,0.1)'
      icon = 'icon-xinxi'
      break
  }
  if (num === 1) {
    return result
  }
  if (num === 2) {
    const style = {
      color: color,
      background: 'rgba' + rgba,
    }
    return style
  }
  if (num === 3) {
    return icon
  }
}
// 脱敏策略，判断第三步是否填写完成
export const stepCanSave = (type = 'ACCESS_DATAMASK_TABLE', data) => {
  const newList = ['user', 'group', 'org']
  let lenList = []
  let flagList = []
  let flag = false
  let tipStr = '请添加生效用户'
  if (type === 'ACCESS_DATAMASK_TABLE') {
    newList.map(item => {
      lenList.push(data[item].length)
    })
    flag = lenList.some(item => item > 0)
  } else {
    newList.map(item => {
      lenList.push(data[item].length)
      const result1 = lenList.some(item => item > 0)
      if (result1) {
        // 添加用户,判断每个用户是否绑定脱敏规则
        if (data[item].length > 0) {
          const bool = data[item].every(o => o.ruleMap && o.ruleMap.id)
          const newMap = {
            bool,
            name: item,
          }
          flagList.push(newMap)
          if (flagList.some(k => !k.bool)) {
            flag = false
            const name = flagList.find(item => !item.bool).name
            tipStr = `请添加${getTypeName(name)}所应用的脱敏规则`
          } else {
            flag = true
          }
        }
        return
      } else {
        // 没有添加用户
        tipStr = '请添加生效用户'
        flag = false
      }
    })
  }
  const newMap = {
    flag,
    tip: tipStr,
  }
  return newMap
}
// 数组根据某字段去重
export const listDuplicate = (arr, id) => {
  let result = []
  arr.map(item => {
    const flag = result.some(m => m[id] === item[id])
    if (!flag) {
      result.push(item)
    }
  })
  return result
}
// 访问策略，获取当前步数的ref  name
export const getStepName = type => {
  let name = ''
  switch (type) {
    case 1:
      name = 'first'
      break
    case 2:
      name = 'second'
      break
    case 3:
      name = 'third'
      break
    default:
      break
  }
  return name
}
// 访问策略,获取当前用户类型,当前用户类型的唯一属性
export const getTypeName = (type, num = 0) => {
  let result = ''
  let idName = ''
  switch (type) {
    case 'user':
      result = '用户'
      idName = 'username'
      break
    case 'group':
      result = '用户组'
      idName = 'id'
      break
    case 'org':
      result = '机构'
      idName = 'bm'
      break
    default:
      break
  }
  if (num === 1) {
    return idName
  } else {
    return result
  }
}
