import { ruleTypeEnum, AttrsTypeEnum } from '@/view/dataAsset/utils/attrEnum'
import i18n from '@/next/i18n'
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
      result = i18n.t('intelligence.generalRule')
      color = '#0095d9'
      rgba = '(0,149,217,0.1)'
      icon = 'icon-menu-blsx'
      break
    case ruleTypeEnum.CONSANGUINITY_CASCADE:
      result = i18n.t('intelligence.consanguinityRule')
      color = '#4b5cc4'
      rgba = '(75,92,196,0.1)'
      icon = 'icon-lineage'
      break
    case ruleTypeEnum.MACHINE_LEARNING:
      result = i18n.t('intelligence.machineRule')
      color = '#c44ad1'
      rgba = '(196,74,209,0.1)'
      icon = 'icon-Machine'
      break
    default:
      result = i18n.t('intelligence.generalRule')
      color = '#0095d9'
      rgba = '(0,149,217,0.1)'
      icon = 'icon-menu-blsx'
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
  let tipStr = i18n.t('accessStrategy.addUserTip')
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
            tipStr = i18n.t('accessStrategy.ruleTip1', {
              name: getTypeName(name),
            })
          } else {
            flag = true
          }
        }
        return
      } else {
        // 没有添加用户
        tipStr = i18n.t('accessStrategy.addUserTip')
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
      result = i18n.t('accessStrategy.user')
      idName = 'username'
      break
    case 'group':
      result = i18n.t('accessStrategy.userGroups')
      idName = 'id'
      break
    case 'org':
      result = i18n.t('accessStrategy.organization')
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
// 数据源list(安全网关及脱敏规则管理)
export const datasourceList = () => {
  const result = [
    { label: 'Oracle', value: 'ORACLE' },
    { label: 'Hive', value: 'HIVE' },
    { label: 'MySQL', value: 'MYSQL' },
    // { label: 'StarRocks', value: 'STARROCKS' },
    // { label: 'SQL Server', value: 'SQLSERVER' },
    // { label: 'OceanBase', value: 'OCEANBASE' },
    // { label: 'OceanBase-Oracle', value: 'OCEANBASEO' },
    // { label: 'PostgreSQL', value: 'POSTGRESQL' },
    // { label: 'Hologres', value: 'HOLOGRES' },
    // { label: 'Polar-DB', value: 'POLARDB' },
    // { label: 'GaussDB', value: 'GAUSSDB' },
    // { label: 'Greenplum', value: 'GREENPLUM' },
    // { label: 'DB2', value: 'DB2' },
    // { label: 'DB2 for iSeries', value: 'DB2I' },
    // { label: 'GBase', value: 'GBASE' },
    // { label: 'Hana', value: 'HANA' },
    // { label: 'Teradata', value: 'TERADATA' },
    // { label: 'ClickHouse', value: 'CLICKHOUSE' },
    // { label: 'Vertica', value: 'VERTICA' },
    // { label: 'Custom Driver', value: 'CUSTOMIZED' },
    // { label: 'Informix', value: 'INFORMIX' },
    // { label: 'Offline Dump', value: 'OFFLINEDUMP' },
    // { label: 'Offline Dump_ex', value: 'OFFLINEDUMP_RAW' },
  ]
  return result
}

// 获取安全等级属性
export const getAttrList = (http, type = AttrsTypeEnum.LEVEL) => {
  return new Promise((resolve, reject) => {
    http
      .getLevelData()
      .then(res => {
        let data = res.data.data
        let newList = data.filter(k => k.classificationType === type)
        let levelList = newList.map(m => Object.assign({}, m.tag))
        levelList.sort((a, b) => {
          return a.tagId - b.tagId
        })
        resolve(levelList)
      })
      .catch(e => {
        reject(e)
      })
  })
}
// 获取字段敏感信息
export const getSensitive = type => {
  let name = type
  let extClass = ''
  switch (type) {
    case 'Y':
    case '是':
      extClass = ''
      break
    case 'N':
    case '否':
      extClass = 'false-type'
      break
    default:
      extClass = ''
      break
  }
  return extClass
}

// 获取资产类型的图标
export const getAssetIcon = type => {
  let name = ''
  switch (type) {
    case 80000004:
    case 'TABLE':
      name = 'icon-biao'
      break
    case 80500008:
    case 'VIEW':
      name = 'icon-shitu'
      break
    case 80000005:
    case 'COLUMN':
      name = 'icon-ziduan'
      break
    default:
      break
  }
  return name
}
// 一张表，字段只能创建一个脱敏策略和行级访问策略
export const getStrategyExistList = (http, type, objectIds, _this) => {
  return new Promise(resolve => {
    const params = {
      type: type,
      objectIds: objectIds || [],
    }
    http
      .checkStrategyExistApi(params)
      .then(res => {
        resolve(res.data.data || [])
      })
      .catch(e => {
        _this.$showFailure(e)
      })
  })
}
// 删除目录，对象的统一提示
/**
 * @params 全部属性
 * @name: //具体名称
 * @objName: //对象名称
 * @type: //单选删除，批量删除 single, multiple
 * @num: //批量删除时，选择的个数
 */
export const delObjMethod = params => {
  let content = ''
  if (params.type === 'multiple') {
    content = `${params.this.$t('securityModule.multipleDelTip', {
      name: params.objName,
      num: params.num,
    })}`
  } else {
    content = `${params.this.$t('securityModule.delTip', {
      name: params.name,
    })}`
  }
  return new Promise(resolve => {
    params.this
      .$DatablauCofirm(
        content,
        `${params.this.$t('securityModule.delete')}${params.objName}`
      )
      .then(() => {
        resolve()
      })
  })
}
/**
 * @author weifeng shi
 * @description: // 跳转元数据详情页
 * @date 2023-11-30 14:48
 */
export const dumpMetaDetail = (_this, params) => {
  let pageUrl = _this.BaseUtils.RouterUtils.getFullUrl(
    'dataCatalogForDDC',
    params.query
  )
  window.open(pageUrl)
  return
  const bool = hasDataSetAuth(_this)
  if (!bool) {
    _this.$DatablauCofirm('您暂无权限访问')
  } else {
    window.open(pageUrl)
  }
}
/**
 * @author weifeng shi
 * @description: // 跳转元数据详情页(数据集权限),判断当前是否可以跳转
 * @date 2024-01-22 10:36
 */
export const hasDataSetAuth = (_this, isView = false) => {
  if (isView) {
    if (_this.$auth.METADATA_VIEW) {
      return true
    } else {
      return false
    }
  } else {
    if (
      _this.$auth.EXPORT_METADATA ||
      _this.$auth.UPDATA_METADATA ||
      // _this.$auth.METADATA_VIEW ||
      _this.$auth.METADATA_EDIT ||
      _this.$auth.METADATA_EDIT_CURRENT_SYSTEM ||
      _this.$auth.EDIT_DATA_SOURCE
    ) {
      return true
    } else {
      return false
    }
  }
}
