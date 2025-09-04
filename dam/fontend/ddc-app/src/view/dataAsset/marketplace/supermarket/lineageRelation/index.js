import tableInView from './tableInView.vue'
import 'prismjs/themes/prism.css'
import Prism from 'prismjs'
import consanguinityGraph from './consanguinityGraph.vue'
import HTTP from '@/http/main'
export default {
  name: '',
  props: {
    objectId: {
      type: String,
      default: '',
    },
    lineageData: {
      type: Object,
      default: () => {},
    },
  },
  components: { tableInView, consanguinityGraph },

  created() {
    this.$getUserModelCategory(this.$user.username, this.handleCategory)
  },
  mounted() {
    this.getSummary()
  },
  data() {
    return {
      summaryLoaded: false,
      summary: null,
      apiTablesLoaded: true,
      lineageFromApiTables: null,
      apiTablesLoaded: false,
      objectType: '',
      currentUserCategory: [],
    }
  },
  methods: {
    handleCategory(res) {
      this.currentUserCategory = res
    },
    getNode() {
      if (this.isAnquan) {
        this.nodeData = [
          {
            name: this.$t('common.page.accessControl'),
            couldClick: false,
          },
          {
            name: this.summary.physicalName || this.summary.name,
            couldClick: false,
          },
        ]
      } else if (this.isZichan) {
        if (this.isFloder) {
          this.nodeData1 = [
            {
              name: this.$t('common.page.businessCatalog'),
              couldClick: false,
            },
            { name: this.summary.name, couldClick: false },
          ]
        }
        this.nodeData = [
          {
            name: this.$t('common.page.businessCatalog'),
            couldClick: false,
          },
          {
            name: this.summary.physicalName || this.summary.name,
            couldClick: false,
          },
        ]
      } else {
        if (this.isFloder) {
          this.nodeData1 = [
            {
              name: this.$t('meta.file.file'),
              couldClick: false,
            },
            { name: this.summary.name, couldClick: false },
          ]
        } else if (this.objectType === 'COLUMN') {
          this.nodeData = [
            {
              name: this.summary.modelName,
              couldClick: false,
            },
            this.summary.tableName,
            { name: this.summary.physicalName, couldClick: false },
          ]
        } else if (this.objectType === 'REPORT') {
          if (this.summary.path && this.summary.path.length > 1) {
            this.nodeData = [
              {
                name: this.summary.path[0],
                couldClick: false,
              },
              { name: this.summary.path[1], couldClick: false },
            ]
          } else {
            this.nodeData = [
              {
                name: this.$t('meta.report.report'),
                couldClick: false,
              },
              { name: this.summary.name, couldClick: false },
            ]
          }
        } else {
          this.nodeData = [
            {
              name: this.summary.modelName,
              couldClick: false,
            },
            { name: this.summary.physicalName, couldClick: false },
          ]
        }
      }
    },
    getSummary(type) {
      const callback = res => {
        this.$utils.sort.sortConsiderChineseNumber(res.data.tags, 'name')
        this.summary = res.data
        localStorage.setItem('summary', JSON.stringify(this.summary))
        if (type && type === 'updateDomainCode' && res.data) {
          this.$refs.domainCodeRef.updateDomainCode(res.data.domainCode, false)
        }
        this.typeId = this.summary.properties.TypeId
        this.logicalName = res.data.logicalName
        this.definition = res.data.definition
        if (this.objectTypeMaybe !== 'unknown') {
          this.objectType = this.objectTypeMaybe
        }
        if (res.data.properties) {
          switch (`${res.data.properties.TypeId}`) {
            case '80500008':
              this.objectType = 'VIEW'
              break
            case '80000004':
              this.objectType = 'TABLE'
              break
            case '80000005':
              this.objectType = 'COLUMN'
              break
            case '80010119':
              this.objectType = 'FUNCTION'
              break
            case '80010118':
              this.objectType = 'STORED_PROCEDURE'
              break
            case '82800024':
              this.objectType = 'PACKAGE'
              break
            default:
              console.error(res.data.properties.TypeId)
              break
          }
        }
        if (
          this.objectType === 'VIEW' ||
          this.objectType === 'STORED_PROCEDURE' ||
          this.objectType === 'FUNCTION' ||
          this.objectType === 'PACKAGE'
        ) {
          if (res.data.properties) {
            this.initSql(
              res.data.properties.SQL,
              res.data.properties.PackageBody
            )
          }
        }
        this.ownerWritable =
          this.summary.owner === this.$user.username || this.$isAdmin
        this.favoPara = {
          typeId: this.summary.properties.TypeId,
          objId: this.objectId,
          objectName: this.summary.logicalName || this.summary.physicalName,
        }
        if (res.data.length !== 0 && this.activeName !== 'ninth') {
          this.getProp()
          this.getCollectionNum()
          if (!this.isAnquan) {
            this.getDataTop()
          }
        }
        this.checkIfCollected()

        this.getNode()
      }
      const requestUrl = `/metadata/entities/${this.objectId}/summary`
      this.$http
        .get(requestUrl)
        .then(res => {
          if (callback) {
            callback(res)
          }
        })
        .catch(e => {
          this.$showFailure(e)
          this.loading = false
        })
        .then(() => {
          this.loading = false
          this.summaryLoaded = true
        })
    },
    checkIfCollected() {
      const para = this.favoPara
      HTTP.getIfCollected({
        succesedCallback: data => {
          this.hasCollected = !!data
          if (data) {
            this.favId = data.id
          }
        },
        failureCallback: e => {
          this.$showFailure(e)
          this.hasCollected = false
        },
        para: para,
      })
    },
    getDataTop(typeId) {
      // 当为文件时，传入typeID
      let obj = {
        objectId: `${this.objectId}`,
        typeId: typeId || this.summary.typeId,
        topNumber: 5,
      }
      this.$http
        .post(`/base/objectVisit/getTopUser`, obj)
        .then(res => {
          this.tableDataTop = res.data.sort(
            (a, b) => b.visitCount - a.visitCount
          )
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 查询收藏次数
    getCollectionNum() {
      const params = {
        objId:
          this.$route.query.type === 'FILE'
            ? this.summary.id
            : this.summary.objectId, // 报表的id
        typeId:
          this.$route.query.type === 'FILE'
            ? '82800008'
            : this.summary.properties.TypeId, // 资产类型
      }
      this.$http.post('/base/favor/count', params).then(res => {
        this.favoriteCount = res.data
        if (res.data === 0) {
          this.hasCollected = false
        }
      })
    },
    getProp() {
      // SHARE_FILE  资产管理模块，点击文件进入的
      // console.log(this.object.type);
      if (
        this.isFloder ||
        this.objectType === 'SHARE_FILE' ||
        this.objectType === 'FILE'
      ) {
        this.$http
          .get(this.$meta_url + `/entities/${this.objectId}/file/prop`)
          .then(res => {
            this.propArr = res.data
            if (this.$route.query.isAssets) {
              this.getAuth(this.objectId)
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$http
          .get(this.$meta_url + `/entities/${this.objectId}/summary/prop`)
          .then(res => {
            this.propArr = res.data
            if (this.$route.query.isAssets) {
              this.getAuth(this.objectId)
            }
            const val = res.data.databaseType.split('_').join('').toUpperCase()
            if (
              val === 'DATADICTIONARY' ||
              val === 'LOGICALDATADICTIONARY' ||
              // val === 'EXCEL' ||
              // val === 'CSV' ||
              val === 'TABLEAU'
            ) {
              this.isFile = true
            } else {
              this.isFile = false
            }
            // 逻辑数据源
            if (val === 'DATADICTIONARYLOGICAL') {
              this.isLogical = true
              this.detailColumnLable = this.$t(
                'meta.DS.tableDetail.column.propTitle'
              )
            } else {
              this.isLogical = false
            }
            // 判断所属系统
            let inSystem = this.currentUserCategory.some(item => {
              return `${item}` === `${res.data.category}`
            })
            if (inSystem) {
              this.inSystem = true
            } else {
              this.inSystem = false
            }
            if (
              !this.dataSecurity &&
              (this.objectType === 'TABLE' || this.objectType === 'VIEW')
            ) {
              this.getColumns()
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    getColumns() {
      this.$http
        .get(this.$meta_url + '/entities/' + this.objectId + '/columns')
        .then(res => {
          res.data.forEach((col, i) => {
            col.key = (function () {
              let ret = ''
              col.keys.forEach(function (val) {
                switch (val.type) {
                  case 'PrimaryKey':
                    ret += ',PK'
                    break
                  case 'ForeignKey':
                    ret += ',FK'
                    break
                  case 'NonUniqueKey':
                    ret += ',NK'
                    break
                  case 'UniqueKey':
                    ret += ',UK'
                    break
                  default:
                    ret += this.$t('meta.DS.treeSubOperation.unknow')
                    break
                }
              })
              return ret.slice(1)
            })()
            this.$utils.sort.sortConsiderChineseNumber(col.tags, 'name')
          })
          this.data = res.data
          this.colsNameMap = {}
          this.data.forEach(element => {
            element.typeName = element.type
            this.colsNameMap[element.objectId] = element.physicalName
          })
          this.data.sort((x1, x2) => {
            if (x1.ordinal && x2.ordinal) {
              return x1.ordinal - x2.ordinal
            }
          })
          // this.getAccessibleList(this.data)
          this.tableData = this.data.slice(0, 10)
          this.loadingColumns = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {
          this.$emit('loaded')
        })
    },
    initSql(sql, bodysql) {
      const sqlContent = _.trim(sql)
      const packageBody = _.trim(bodysql)
      // this.sqlContent = sqlFormatter.format(sqlContent);
      this.sqlContent = sqlContent
      this.packageBody = packageBody
      this.$nextTick(() => {
        setTimeout(() => {
          Prism.highlightAll()
        })
      })
    },
    handleLineageFromApiTables(lineageData) {
      this.apiTablesLoaded = false
      this.lineageFromApiTables = lineageData
      setTimeout(() => {
        this.apiTablesLoaded = true
      })
    },
  },
  watch: {
    lineageData: {
      handler() {
        this.lineageFromApiTables = this.lineageData
      },
    },
  },
}
