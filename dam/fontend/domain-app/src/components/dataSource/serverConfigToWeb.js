import owebConfig from './webConf.json'
import { cloneDeep } from 'lodash'
export default {
  handleMutipleOption(option, dbType, sc) {
    let def = undefined
    let noDbtype = true
    for (let i = 0; i < option.length; i++) {
      if (!option[i].dbtype && !def) {
        option[i].defaultValue = sc.defaultValue || '' // 默认值处理
        // 必填处理
        option[i].required =
          typeof option[i].required === 'boolean'
            ? sc.required
            : option[i].required
        def = option[i]
      }
      if (option[i].dbtype && option[i].dbtype === dbType) {
        option[i].defaultValue = sc.defaultValue || ''
        option[i].required =
          typeof option[i].required === 'boolean'
            ? sc.required
            : option[i].required
        webConfig.options.push(tempObj[i])
        noDbtype = false
      }
    }
  },
  /* handleOracleDataBase() {
    if (serverConfig.dbType === 'ORACLE') {
      for (let i = 0; i < serverConfig.options.length; i++) {
        if (serverConfig.options[i].code === 'connectMode') {
          serverConfig.options.splice(i + 1, 0, {
            code: 'DatabaseName',
            defaultValue: '',
            required: true,
          })
          break
        }
      }
    }
  }, */
  convert(config) {
    console.log('config', config)
    const originWebConfig = cloneDeep(owebConfig)
    let serverConfig = cloneDeep(config)
    let webConfig = {
      options: [],
    }
    webConfig.dbType = serverConfig.dbType
    webConfig.dbLabel = serverConfig.dbLabel
    webConfig.icon = serverConfig.icon
    if (webConfig.dbType !== 'OFFLINEDUMP') {
      /* webConfig.options.push(
        ...[originWebConfig.HostServer, originWebConfig.connUrl]
      ) */
      webConfig.options.push(originWebConfig.connUrl)
    } else {
      if (
        serverConfig.options.length &&
        serverConfig.dbType === 'OFFLINEDUMP'
      ) {
        for (let i = 0; i < serverConfig.options.length; i++) {
          if (serverConfig.options[i].code === 'connectMode') {
            serverConfig.options.splice(i + 1, 0, {
              code: 'DatabaseName',
              defaultValue: '',
              required: true,
            })
            break
          }
        }
      }
    }
    if (serverConfig.dbType === 'ORACLE') {
      for (let i = 0; i < serverConfig.options.length; i++) {
        if (serverConfig.options[i].code === 'connectMode') {
          serverConfig.options.splice(i + 1, 0, {
            code: 'DatabaseName',
            defaultValue: '',
            required: true,
          })
          break
        }
      }
    }
    serverConfig.options.forEach(sc => {
      let tempObj = originWebConfig[sc.code]
      // tempObj.candidate = sc.candidate
      // 后端没传用户名密码连接串的时候前端需要直接push前端的配置
      if (!tempObj) {
        // 新元素
        let obj = {
          code: sc.code,
          label: sc.label || '',
          required: sc.required,
          type: sc.candidate
            ? 'select'
            : sc.accept
            ? 'upload'
            : sc.type
            ? sc.type
            : 'input',
          multiple: `${sc.multiple}` === 'true',
          candidate: sc.candidate || '',
          defaultValue: sc.defaultValue || '',
          placeholder: sc.candidate ? '请选择' : '请输入',
          accept: sc.accept || null,
        }
        webConfig.options.push(obj)
      } else if (Array.isArray(tempObj)) {
        // this.handleMutipleOption(tempObj, serverConfig.dbType, sc)
        let def = undefined
        let noDbtype = true
        // console.log('sc', sc, tempObj[i],serverConfig.dbType === 'OFFLINEDUMP')
        console.log('sc', sc, tempObj, serverConfig)
        // todo ------

        for (let i = 0; i < tempObj.length; i++) {
          if (!tempObj[i].dbtype && !def) {
            tempObj[i].defaultValue = sc.defaultValue || ''
            // tempObj[i].type = sc.type || tempObj[i].type
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
            tempObj[i].label = sc.label || tempObj[i].label
            tempObj[i].candidate = sc.candidate || ''
            def = tempObj[i]
          }
          if (tempObj[i].dbtype && tempObj[i].dbtype === serverConfig.dbType) {
            tempObj[i].defaultValue = sc.defaultValue || ''
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
            tempObj[i].label = sc.label || tempObj[i].label
            tempObj[i].candidate = sc.candidate || ''
            if (
              serverConfig.dbType === 'OFFLINEDUMP' &&
              serverConfig.options.filter(o => {
                return o.code === 'OfflineDumpSourceDriverType'
              })[0].defaultValue !== 'ORACLE'
            ) {
              // webConfig.options.push(def)
            } else {
              webConfig.options.push(tempObj[i])
              noDbtype = false
            }
          }
        }
        if (noDbtype) {
          webConfig.options.push(def)
        }
        if (sc.code === 'DatabaseName') {
          webConfig.options.push(originWebConfig.TestBtn)
        }
      } else {
        if (sc.code === 'AuthenticationType') {
          originWebConfig.AuthenticationType.candidate = []
          let candidate = sc.candidate
          if (candidate.includes('password')) {
            originWebConfig.AuthenticationType.candidate.push({
              label: '用户名/密码',
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
            let user = undefined
            let password = undefined
            for (let i = 0; i < originWebConfig.user.length; i++) {
              if (!originWebConfig.user[i].dbtype && !user) {
                originWebConfig.user[i].defaultValue = ''
                user = originWebConfig.user[i]
              }
              if (
                originWebConfig.user[i].dbtype &&
                originWebConfig.user[i].dbtype === serverConfig.dbType
              ) {
                originWebConfig.user[i].defaultValue = ''
                user = originWebConfig.user[i]
              }
            }
            for (let i = 0; i < originWebConfig.password.length; i++) {
              if (!originWebConfig.password[i].dbtype && !password) {
                originWebConfig.password[i].defaultValue = ''
                password = originWebConfig.password[i]
              }
              if (
                originWebConfig.password[i].dbtype &&
                originWebConfig.password[i].dbtype === serverConfig.dbType
              ) {
                originWebConfig.password[i].defaultValue = ''
                password = originWebConfig.password[i]
              }
            }
            webConfig.options.push(...[user, password])
          }
          if (sc.candidate.includes('kerberos')) {
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
            webConfig.options.push(originWebConfig.useCustomedDbTye)
          }
        } else {
          /*
          if (sc.code === 'HostServer' && webConfig.dbType !== 'OFFLINEDUMP') {
            console.log(11, sc.code, webConfig.dbType)
          } else { */
          tempObj.required =
            typeof tempObj.required === 'boolean'
              ? sc.required
              : tempObj.required
          tempObj.defaultValue = sc.defaultValue || ''
          tempObj.type = sc.type || tempObj.type
          tempObj.multiple = `${sc.multiple}` === 'true'
          tempObj.label = sc.label || tempObj.label
          webConfig.options.push(tempObj)
        }
        // }
      }
    })
    console.log('webConfigConvert', webConfig)
    return webConfig
  },
}
