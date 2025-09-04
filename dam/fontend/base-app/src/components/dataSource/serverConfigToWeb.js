import owebConfig from './webConf.json'
import owebConfigEn from './webConf_en.json'

import { cloneDeep } from 'lodash'
const vThis = window.vueThis
export default {
  handleAddDatabaseName(serverConfig) {
    for (let i = 0; i < serverConfig.options.length; i++) {
      if (serverConfig.options[i].code === 'connectMode') {
        serverConfig.options.splice(i + 1, 0, {
          code: 'DatabaseName',
          defaultValue: '',
          required: true,
          requiredOnSave: true,
        })
        break
      }
    }
  },
  isHas(serverConfig, target) {
    return serverConfig.options.some(o => {
      return o.code === target
    })
  },
  convert(config) {
    let originWebConfig = cloneDeep(
      vThis.$mainVue.$i18n.locale === 'en' ? owebConfigEn : owebConfig
    )
    // 仅IMPALA 要求 KeyTabPath 必填
    if (config.dbType === 'IMPALA') {
      originWebConfig.KeyTabPath.required = true
      originWebConfig.KeyTabPath.requiredOnSave = true
    } else {
      originWebConfig.KeyTabPath.required = false
      originWebConfig.KeyTabPath.requiredOnSave = false
    }
    let serverConfig = cloneDeep(config)

    // 判断testBtn位置
    let onlySchema = false
    const hasSchema = this.isHas(serverConfig, 'SelectedSchemas')
    const hasDatabase = this.isHas(serverConfig, 'DatabaseName')
    if (hasSchema && serverConfig.dbType !== 'ORACLE' && !hasDatabase) {
      onlySchema = true
    }
    let webConfig = {
      options: [],
    }
    webConfig.dbType = serverConfig.dbType
    webConfig.dbLabel = serverConfig.dbLabel
    webConfig.icon = serverConfig.icon
    if (webConfig.dbType !== 'OFFLINEDUMP') {
      webConfig.options.push(originWebConfig.connUrl)
    } else {
      if (
        serverConfig.options.length &&
        serverConfig.dbType === 'OFFLINEDUMP'
      ) {
        this.handleAddDatabaseName(serverConfig)
      }
    }
    if (serverConfig.dbType === 'ORACLE') {
      this.handleAddDatabaseName(serverConfig)
    }
    serverConfig.options.forEach(sc => {
      let tempObj = _.cloneDeep(originWebConfig[sc.code])
      // tempObj.candidate = sc.candidate
      // 后端没传用户名密码连接串的时候前端需要直接push前端的配置
      if (!tempObj) {
        // 新元素
        let obj = {
          code: sc.code,
          label: sc.label || '',
          required: sc.required,
          requiredOnSave: sc.requiredOnSave,
          type: sc.candidate
            ? 'select'
            : sc.accept
            ? 'upload'
            : sc.type
            ? sc.type
            : 'input',
          maxlength:
            sc.type === 'input'
              ? sc.maxlength
                ? sc.maxlength + ''
                : '255'
              : sc.maxlength || null,
          multiple: `${sc.multiple}` === 'true',
          candidate: sc.candidate || '',
          subLabel: sc.subLabel || '', // 用于展示 checkbox 的label
          defaultValue: sc.defaultValue || '',
          clearable: sc.clearable || false,
          placeholder: sc.candidate
            ? vThis.$mainVue.$t('el.select.placeholder')
            : vThis.$mainVue.$t('common.placeholder.prefix'),
          accept: sc.accept || null,
          if: sc.if || null,
        }
        webConfig.options.push(obj)
      } else if (Array.isArray(tempObj)) {
        let def = undefined
        let noDbtype = true
        let setDefVal = i => {
          tempObj[i].type =
            sc.code === 'DatabaseName' && sc.candidate
              ? 'select'
              : sc.code === 'DatabaseName' && !sc.candidate
              ? 'input'
              : tempObj[i].type

          tempObj[i].multiple = `${sc.multiple}` === 'true'
          tempObj[i].required =
            typeof tempObj[i].required === 'boolean'
              ? sc.required
              : tempObj.required
          tempObj[i].requiredOnSave = sc.requiredOnSave || false
          tempObj[i].label = sc.label || tempObj[i].label
          tempObj[i].candidate = sc.candidate || ''
          tempObj[i].defaultValue = sc.defaultValue || ''
        }
        for (let i = 0; i < tempObj.length; i++) {
          if (!tempObj[i].dbtype && !def) {
            setDefVal(i)
            def = tempObj[i]
          }
          if (tempObj[i].dbtype && tempObj[i].dbtype === serverConfig.dbType) {
            setDefVal(i)
            if (
              serverConfig.dbType === 'OFFLINEDUMP' &&
              serverConfig.options.filter(o => {
                return o.code === 'OfflineDumpSourceDriverType'
              })[0].defaultValue !== 'ORACLE'
            ) {
              noDbtype = true
            } else {
              webConfig.options.push(tempObj[i])
              noDbtype = false
            }
          }
        }
        if (noDbtype) {
          webConfig.options.push(def)
        }
        if (!this.isHas(serverConfig, 'TestBtn')) {
          if (!onlySchema && sc.code === 'DatabaseName') {
            webConfig.options.push(originWebConfig.TestBtn)
          } else if (onlySchema && sc.code === 'SelectedSchemas') {
            webConfig.options.push(originWebConfig.TestBtn)
          }
        }
      } else {
        if (sc.code === 'AuthenticationType') {
          originWebConfig.AuthenticationType.candidate = []
          let candidate = sc.candidate
          if (candidate.includes('password')) {
            originWebConfig.AuthenticationType.candidate.push({
              label: vThis.$mainVue.$t(
                'meta.dataSource.edit.usernameOrPassword'
              ),
              value: '0',
            })
          }
          if (candidate.includes('kerberos')) {
            originWebConfig.AuthenticationType.candidate.push({
              label: 'Kerberos',
              value: '1',
            })
          }
          webConfig.options.push(originWebConfig.AuthenticationType)
          if (sc.candidate.includes('password')) {
            let getWebDefVal = key => {
              let res = null
              for (let i = 0; i < originWebConfig[key].length; i++) {
                let confItem = originWebConfig[key][i]
                if (!confItem.dbtype && !res) {
                  confItem.defaultValue = ''
                  res = confItem
                }
                if (
                  confItem.dbtype &&
                  confItem.dbtype === serverConfig.dbType
                ) {
                  confItem.defaultValue = ''
                  res = confItem
                  return res
                }
              }
              return res
            }
            let user = getWebDefVal('user')
            let password = getWebDefVal('password')
            webConfig.options.push(...[user, password])
          }
          if (sc.candidate.includes('kerberos')) {
            if (serverConfig.dbType === 'HBASE') {
              originWebConfig.ServicePrincipal.required = false
              originWebConfig.ServicePrincipal.requiredOnSave = false
            }
            webConfig.options.push(
              ...[
                originWebConfig.ServicePrincipal,
                originWebConfig.UserPrincipal,
                originWebConfig.KeyTabPath,
                originWebConfig.Krb5Path,
              ]
            )
          }
          if (serverConfig.dbType === 'CUSTOMIZED') {
            webConfig.options.push(originWebConfig.useCustomedDbTyeTarget)
          }
        } else {
          tempObj.required =
            typeof tempObj.required === 'boolean'
              ? sc.required
              : tempObj.required
          tempObj.requiredOnSave = sc.requiredOnSave || false
          tempObj.defaultValue = sc.defaultValue || ''
          tempObj.type = sc.type || tempObj.type
          tempObj.multiple = `${sc.multiple}` === 'true'
          tempObj.label = sc.label || tempObj.label
          webConfig.options.push(tempObj)
        }
      }
    })
    return webConfig
  },
}
