/**
 * Created by baobao on 2017/6/30.
 */
// import dataSourceTab from './dataSourceTab.vue'
import dataSourceTab from './dataSourceList.vue'
import ediDataSource from './editDs.vue'
import downloadTab from './downloadTab.vue'
import HTTP from '@/http/main'
import _ from 'lodash'
;('use strict')
const moment = require('moment')
export default {
  beforeDestroy() {
    this.jdbcDs = {}
  },
  mounted() {
    this.$getUserModelCategory()
    // this.getTags()
    // 获取系统
    this.$getModelCategories()
  },
  components: {
    dataSourceTab,
    ediDataSource,
    downloadTab,
  },
  methods: {
    addDs() {
      this.$bus.$emit('callDataSourceTabToAddDs')
    },
    closeEidTab(id) {
      this.editTabData = null
      // if (id) {
      //   this.removeTab(id)
      // } else {
      //   this.removeTab('ediDataSource')
      // }
      // this.$refs.dataSourceList.innerLoadDataSources()
    },
    removeTab(name) {
      // const index = this.editTabsArray.findIndex(item => {
      //   return item.id == name
      // })
      if (name === 'downloadTab') {
        this.ifShowDownloadTab = false
      } else {
        this.closeEidTab()
        // this.editTabsArray.splice(index, 1)
      }
      this.currentTab = 'dataSourceTab'
    },
    reportDsCreated() {
      if (
        this.$refs.dataSourceList &&
        this.$refs.dataSourceList.innerLoadDataSources
      ) {
        this.$refs.dataSourceList.innerLoadDataSources()
      }
    },
    showtab(isEdi, dsform, para) {
      this.isJDBC = dsform.jdbc
      let item = {}
      if (isEdi === false) {
        item = {
          id: 'add',
          name: this.$t('meta.dataSource.add'),
          supdsform: dsform,
          suppara: para,
          isEdit: false,
        }
      } else {
        item = {
          id: dsform.id,
          name: dsform.sourceName,
          supdsform: dsform,
          suppara: para,
          isEdit: true,
        }
      }
      this.editTabData = item
      this.jdbcDs = {}
      this.jdbcDs = _.cloneDeep(dsform)
      // const index = this.editTabsArray.findIndex(tabdata => {
      //   return tabdata.id === item.id
      // })
      // index < 0 && this.editTabsArray.push(item)
      // this.currentTab = item.id + ''
    },
    showDownloadTab(modelId) {
      this.ifShowDownloadTab = true
      this.modelId = modelId
      this.currentTab = 'downloadTab'
    },

    showCompareDialog(data) {
      this.dialogCompareVisible = true
      this.dialogCompareData = data
    },
    showAddModelJobDialog(mapping) {
      this.dialogAddJobVisible = true
      this.addModelMapping = mapping
    },

    handleBind(index, row) {
      this.dialogBindVisible = true
      this.dialogBindModelId = row.modelId
    },

    downloadMetadata(row) {
      this.dialogMetadataVisible = true
      this.dialogModelId = row.modelId
    },
    handleIEMetaUpload() {
      this.dialogIEUploadVisible = false
      setTimeout(() => {
        this.handleUpdateMetadataSuccess()
      }, 2000)
    },
    handleRefreshIEMeta(url) {
      this.dialogIEUploadVisible = true
      this.baseIEUploadUrl = url
    },
    /**
     *
     * @param {ds 对象} ds
     * @param 是否测试连接
     * @param {参数对象} param1
     */
    formatDataSource(
      ds,
      isTest,
      {
        isFileData,
        isOracle,
        isEditing,
        schemaSelected,
        AuthenticationType,
        requireDbport,
        dbNameRequ,
        userPasswordRequ,
        ESwithSsl,
        requireDataZone,
        // hasFunction,
        testPw,
        // useOfflineDs,
        // OfflineDumpTargetSchemaName,
        // OfflineDumpTargetDBName,
        // OfflineProSchema,
        typeSelectWraper,
        ExcelAutoCollect,
        userPassword,
      }
    ) {
      /**
       * AuthenticationType: 连接方式
       * requireDbport: 是否需要填写端口
       * dbNameRequ: 是否需要填写数据库名称
       * userPasswordRequ: 是否需要用户名密码
       * requireDataZone: 是否需要填数据区域
       * useCusDb: 是否使用连接串
       */
      const useCusDb = ds.dbtype === 'CUSTOMIZED'
      let returnFalure = false
      if (userPasswordRequ !== false) {
        userPasswordRequ = true
      }
      AuthenticationType = parseInt(AuthenticationType)
      let json = {}
      /* if (isTest) {
        json.name = ds.name
      } */
      json.sourceName = ds.sourceName || ds.displayName
      json.id = ds.id
      json['@class'] = 'com.datablau.dam.data.dto.DatasourceProperties'
      json.type = ds.dbtype
      json.versioning = ds.versioning
      const currentdate = new Date()
      // json.createTime = moment(currentdate).format('YYYY-MM-DD HH:mm:ss')
      json.connectType = ds.connectType
      if (ds.dbtype === 'SMBSHAREFILE') {
        if (ds.connectType === 'JDBC') {
          json.connectType = 'SMB'
        } else {
          json.connectType = ds.connectType
        }
      }
      json.parameterMap = {}
      json.categoryId = ds.categoryId
      /* if (ds.TagIds || (Array.isArray(ds.TagIds) && ds.TagIds.length === 0)) {
        json.parameterMap.TagIds = ds.TagIds.join(',')
      } */
      /* json.categoryId = ds.categoryId
      json.categoryName = ds.categoryName
      json.modelCategoryId = ds.modelCategoryId
      json.latestVersion = 'version_1'
      json.parameterMap.CommentToLogicalName = ds.CommentToLogicalName
      json.parameterMap.Zone = ds.Zone
      json.parameterMap.Deploy = ds.Deploy
      json.parameterMap.State = ds.State
      json.parameterMap.Description = ds.Description */
      /* if (
        ds.original &&
        ds.original.connectionInfo &&
        ds.original.connectionInfo.parameterMap
      ) {
        json.parameterMap.BlackListAppliedTypeIds =
          ds.original.connectionInfo.parameterMap.BlackListAppliedTypeIds
        json.parameterMap.SelectedBlackList =
          ds.original.connectionInfo.parameterMap.SelectedBlackList
      } */
      if (ds.dbtype === 'ES' && ESwithSsl) {
        json.parameterMap.KeyStorePath = ds.KeyStorePath
        json.parameterMap.KeyStorePass = ds.KeyStorePass
        json.parameterMap.HttpType = 'https'
      } else if (ds.dbtype === 'ES') {
        json.parameterMap.HttpType = 'http'
      }
      if (ds.dbtype === 'HBASE') {
        json.parameterMap.HBaseMasterPort = ds.HBaseMasterPort
        json.parameterMap.HBaseRegionserverPort = ds.HBaseRegionserverPort

        userPasswordRequ = false
        if (!ds.ServicePrincipal) {
          // AuthenticationType = 2
        }
      }
      // 选择表
      /* if (ds.SelectedTables) {
        json.parameterMap.SelectedTables = ds.SelectedTables
      } */
      json.credentialInfo = {}
      if (isFileData) {
        /* json.parameterMap.FileNames = ds.fileName || ''
        json.parameterMap.ShareFilePath =
          ExcelAutoCollect === 'true' ? ds.ShareFilePath : ds.filePath
        json.parameterMap.FilePath =
          ExcelAutoCollect === 'true' ? ds.ShareFilePath : ds.filePath
        json.parameterMap.Delimiter = ','
        if (ds.delimiter) {
          json.parameterMap.Delimiter = ds.delimiter
        }
        if (ds.IsFirstRowColumnName) {
          json.parameterMap.IsFirstRowColumnName =
            ds.IsFirstRowColumnName === 't'
        } */
        /* if (ExcelAutoCollect) {
          json.parameterMap.ExcelAutoCollect = ExcelAutoCollect === 'true'
          if (userPassword) {
            json.credentialInfo.user = ds.username
            json.credentialInfo.password = ds.password
          } else {
            json.credentialInfo = null
          }
        } */
      } else {
        if (ds.connectType == 'WebLogic') {
          json.parameterMap.JNDIName = ds.JNDIName
        } else {
          json.parameterMap.HostServer = ds.hostname
          json.parameterMap.PortNumber = ds.dbport
          json.parameterMap.AuthenticationType = AuthenticationType - 0
          /* if (AuthenticationType === 2) {
            delete json.parameterMap.AuthenticationType
          } */
          if (isOracle) {
            json.parameterMap.DatabaseName = ds.extraDbPara + ':' + ds.dbname
            // json.parameterMap.PackageFiltered = ds.PackageFiltered
          } else {
            json.parameterMap.DatabaseName = ds.dbname
          }
        }
      }
      // if (!ExcelAutoCollect || ExcelAutoCollect === 'false') {
      if (AuthenticationType === 0) {
        json.credentialInfo = {}
        json.credentialInfo.user = ds.username
        json.credentialInfo.password = this.$pwEncrypt(ds.password)
      } else {
        json.parameterMap.ServicePrincipal = ds.ServicePrincipal
        json.parameterMap.UserPrincipal = ds.UserPrincipal
        json.parameterMap.KeyTabPath = ds.KeyTabPath
        json.parameterMap.Krb5Path = ds.Krb5Path
      }
      // }

      const c = json.credentialInfo
      const p = json.parameterMap
      const showErrMsg = item => {
        // showFailure 需要在外面调用, 这里只需要在console输出哪些没有填
        // this.$message.error({
        //   title: "创建失败",
        //   message: "信息填写不完整",
        // });
        // json = null;
        returnFalure = true
      }
      if (!isFileData && isEditing && !isTest && !testPw) {
        json.credentialInfo = null
      }
      /* if (!isTest && useOfflineDs) {
        if (!OfflineDumpTargetDBName) {
          showErrMsg('实例名称')
        }
        if (
          (ds.dbtype === 'ORACLE' || ds.dbtype === 'OCEANBASE-ORACLE') &&
          !OfflineDumpTargetSchemaName
        ) {
          showErrMsg('schema')
        }
      } */
      /* // 必选项 数据区域
      if (requireDataZone && !json.parameterMap.TagIds) {
        showErrMsg('数据区域')
      } */
      // 必选项 名称,系统
      if (isEditing && !json.sourceName) {
        showErrMsg('名称')
      }
      if (!isFileData && ds.connectType !== 'WebLogic') {
        // 数据库名称
        if (dbNameRequ) {
          if (!p.DatabaseName) {
            showErrMsg('数据库名称')
          } else if (isOracle && !ds.dbname) {
            showErrMsg('数据库名称')
          }
        }

        // 服务器与端口
        if (!useCusDb && (!p.HostServer || (requireDbport && !p.PortNumber))) {
          showErrMsg('服务器与端口')
        }

        if (AuthenticationType == 1) {
          // kerberos
          if (!p.ServicePrincipal) {
            showErrMsg('kerberos')
          }
        } else if (
          AuthenticationType == 0 &&
          (!c.user || !c.password) &&
          userPasswordRequ
        ) {
          // 用户名密码
          showErrMsg('用户名密码')
        }
      }
      /* if (useOfflineDs) {
        // console.log(JSON.stringify(json), 'old json')
        const newObj = _.cloneDeep(json)
        newObj.type = 'OFFLINEDUMP'
        delete newObj.parameterMap.ViewFiltered
        delete newObj.parameterMap.ProceduresFiltered
        delete newObj.parameterMap.FunctionFiltered
        newObj.parameterMap.OfflineDumpTargetSchemaName =
          OfflineDumpTargetSchemaName
        newObj.parameterMap.OfflineDumpSourceDriverType = json.type
        newObj.parameterMap.OfflineDumpTargetDBName = OfflineDumpTargetDBName
        if (typeSelectWraper === 'OFFLINEDUMP_RAW') {
          newObj.type = 'OFFLINEDUMP_RAW'
          newObj.realType = 'MYSQL'
          newObj.hostServer = ds.hostname
          newObj.parameterMap.OfflineDumpRealDBType =
            ds.OfflineDumpRealDBType || ''
          if (OfflineProSchema && Array.isArray(OfflineProSchema)) {
            newObj.parameterMap.OfflineDumpTargetSchemaName =
              OfflineProSchema.join(';') || ''
          }
        }
        json = newObj
      } */

      if (useCusDb) {
        json.driverClassname = ds.driverClassname
        json.connUrl = ds.connUrl
        json.jarName = ds.jarName
      }
      if (ds.dbtype === 'HBASE') {
        json.credentialInfo = null
      }
      return returnFalure ? null : json
    },

    // 关于 tag
    /* getTags(callback) {
      this.$http
        .get(this.$url + '/service/tags/')
        .then(res => {
          const tagTree = []
          const map = {}
          let datazoneTag = {}
          if (res.data && Array.isArray(res.data)) {
            res.data.forEach(item => {
              map[item.tagId] = item
              if (item.name === '数据区域') {
                datazoneTag = item
              }
            })
            res.data.forEach(item => {
              if (item.parentId && map[item.parentId]) {
                var parent = map[item.parentId]
                if (!parent.children) {
                  parent.children = []
                }
                parent.children.push(item)
              } else {
                tagTree.push(item)
              }
            })
            this.tagMap = map
            this.tagTree = tagTree
          }
          this.dataZoneTags = datazoneTag.children || []
          callback && callback()
        })
        .catch(e => {
          this.$showFailure(e)
          callback && callback()
        })
    }, */
  },
  computed: {
    showTabs() {
      return (
        this.ifShowDownloadTab ||
        (Array.isArray(this.editTabsArray) && this.editTabsArray.length > 0)
      )
    },
  },

  watch: {
    currentTab(newVal) {
      this.$nextTick(() => {
        if (newVal === 'dataSourceTab') {
          this.$bus.$emit('dataSourceTabOntop')
        } else {
          this.$bus.$emit('downloadOntop')
        }
      })
    },
  },

  data() {
    return {
      baseIEUploadUrl: '',
      dialogBindVisible: false,
      dialogBindModelId: -1,
      dialogBindConnector: false,
      dialogCompareVisible: false,
      dialogCompareData: undefined,
      dialogMailVisible: false,
      dialogAddJobVisible: false,
      dialogMetadataVisible: false,
      dialogIEUploadVisible: false,
      dialogShowDifferenceVisible: false,
      dialogModelId: -1,
      addModelMappingId: -1,
      defaultProps: {},
      currentTab: 'dataSourceTab',
      ifShowDownloadTab: false,
      editTabsArray: [],
      dsformConstant: {
        // name: 'connection-1',
        displayName: '',
        dbtype: 'MYSQL',
        connectType: 'JDBC',
        hostname: 'localhost',
        dbname: '',
        dbport: '3306',
        username: '',
        password: '',
        files: '',
        createTime: '',
        versioning: true,
        // CommentToLogicalName: true,
        /* Zone: '',
        owner: '',
        Deploy: '',
        State: '', */
        Description: '',
        extraDbPara: 'SID',
        /* TagIds: [],
        ViewFiltered: false,
        ProceduresFiltered: false,
        FunctionFiltered: false, */
      },
      dataZoneTags: [],
      tagMap: {},
      tagTree: [],
      editTabData: null,
      jdbcDs: {},
      // 元数据
      isJDBC: true,
      appName: HTTP.$appName,
    }
  },
}
