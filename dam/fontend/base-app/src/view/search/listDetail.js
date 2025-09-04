import HTTP from '../../http/main'
import reportImage from './reportImage.vue'
import { encodeHtml } from '@/next/utils/XssUtils'

export default {
  components: {
    reportImage,
  },
  props: {
    data: {
      type: Object,
    },
    catalogPath: {
      type: Array,
      default() {
        return []
      },
    },
    keyword: {
      type: String,
      default: '',
    },
    newAsset: {
      type: Boolean,
      default: false,
    },
  },
  name: 'listDetail',
  data() {
    const { greyBorder } = this.$style
    return {
      style: {
        container: {
          borderBottom: greyBorder,
          position: 'relative',
          padding: '10px 20px 2px 42px',
        },
      },
      paths: null,
      summary: '',
      summaryLoaded: false,
      vote: 4,
      tableList: [],
      defaultRate: 0,
    }
  },
  computed: {
    summaryXss() {
      if (this.summary) {
        return encodeHtml(this.summary)
      } else {
        return ''
      }
    },
  },
  methods: {
    showDetail(data) {
      if (this.newAsset) {
        const pos = location.href.indexOf('#/')
        const baseUrl = location.href.slice(0, pos + 2)
        if (data.assetsType === 'FILE') {
          // 文件
          const url = `${baseUrl}myShareFile?id=${data.objectId}`
          window.open(url)
        } else if (data.assetsType === 'TABLE') {
          // 表、视图
          window.open(baseUrl + `myItem?objectId=${data.objectId}&type=TABLE`)
        } else if (data.assetsType === 'DATA_OBJECT') {
          // 字段
          window.open(
            baseUrl + `main/meta?objectId=${data.objectId}&blank=true`
          )
        } else if (data.assetsType === 'REPORT') {
          // 报表
          window.open(baseUrl + `reportForm?reportId=${data.objectId}`)
        } else if (data.assetsType === 'DATA_STANDARD') {
          // 基础标准
          window.open(baseUrl + `domain?domainId=${data.domainId}`)
        } else if (data.assetsType === 'DATA_STANDARD_CODE') {
          // 标准代码
          window.open(
            baseUrl + `main/dataStandard/code?code=${data.datasetName}`
          )
        } else if (data.assetsType === 'INDEX') {
          // 基础指标
          window.open(baseUrl + `domain?domainId=${data.domainId}`)
        } else if (data.assetsType === 'DATA_SERVICE') {
          // 数据服务
          window.open(baseUrl + `main/apiOverview?apiId=${data.api}`)
        }
      } else {
        const ifOpenNewPage = true
        if (data.type === 'shareFile' || data.assetsType === 'FILE') {
          data.id = data.objectId
          const pos = location.href.indexOf('#/')
          const baseUrl = location.href.slice(0, pos + 1)
          const url = `${baseUrl}myShareFile?id=${data.id}&catalogPath=${this.catalogPath}&keyword=${this.keyword}`
          window.open(url)
        }
        const query = {
          objectId: this.data.objectId,
          keyword: this.keyword,
          catalogPath: this.catalogPath,
          type: this.data.type,
          typeId: String(this.data.typeId),
        }
        if (!this.data.typeId && data.api) {
          query.typeId = this.$commentPreCode.API
        }
        if (query.typeId === this.$commentPreCode.Entity) {
          const pos = location.href.indexOf('#/')
          const baseUrl = location.href.slice(0, pos + 2)
          window.open(
            baseUrl +
              `myItem?objectId=${this.data.objectId}&keyword=${this.keyword}&catalogPath=${this.catalogPath}&type=TABLE`
          )
        }
        if (query.typeId === this.$commentPreCode.View) {
          const pos = location.href.indexOf('#/')
          const baseUrl = location.href.slice(0, pos + 2)
          window.open(
            baseUrl +
              `myItem?objectId=${this.data.objectId}&keyword=${this.keyword}&catalogPath=${this.catalogPath}&type=VIEW`
          )
        }
        if (query.typeId === this.$commentPreCode.Domain) {
          const pos = location.href.indexOf('#/')
          const baseUrl = location.href.slice(0, pos + 2)
          window.open(
            baseUrl +
              `domain?domainId=${this.data.domainId}&keyword=${this.keyword}&vote=${this.data.vote}`
          )
        }
        if (query.typeId === this.$commentPreCode.Index) {
          const pos = location.href.indexOf('#/')
          const baseUrl = location.href.slice(0, pos + 2)
          window.open(
            baseUrl +
              `indexForDdc?code=${this.data.code}&vote=${this.data.vote}`
          )
        }
        if (query.typeId === this.$commentPreCode.CODE) {
          const pos = location.href.indexOf('#/')
          const baseUrl = location.href.slice(0, pos + 2)
          window.open(baseUrl + `main/dataStandard/code?code=${this.data.code}`)
        }
        if (query.typeId === this.$commentPreCode.Report) {
          if (ifOpenNewPage) {
            const pos = location.href.indexOf('#/')
            const baseUrl = location.href.slice(0, pos + 2)
            window.open(
              baseUrl + `reportForm?reportId=${data.id}&keyword=${this.keyword}`
            )
          } else {
            const query = {
              reportId: data.id,
              type: 'Report',
              keyword: this.keyword,
            }
            this.$router.push({
              name: 'reportForm',
              query: query,
            })
          }
        }

        if (query.typeId === this.$commentPreCode.API) {
          const pos = location.href.indexOf('#/')
          const baseUrl = location.href.slice(0, pos + 2)
          window.open(baseUrl + `main/apiOverview?apiId=${this.data.id || ''}`)
        }
      }
    },
    formatPaths() {
      const map = this.$globalData.catalogsMap
      let currentCatalog = ''
      for (let len = this.catalogPath.length, i = len - 1; i >= 0; i--) {
        if (!currentCatalog && this.catalogPath[i]) {
          currentCatalog = this.catalogPath[i]
        }
      }
      Array.isArray(this.data.path) &&
        this.data.path.forEach(item => {
          const ids = item.split('/0/')[1].split('/')
          const labels = []
          if (ids.some(item => Number.parseInt(item) === currentCatalog)) {
            ids.forEach(id => {
              const catalog = map.get(Number.parseInt(id))
              if (catalog && catalog.name) {
                labels.push(catalog.name)
              }
            })
          }
          if (!this.paths) {
            this.paths = []
          }
          if (labels.join('/') && this.paths.length === 0) {
            this.paths.push(labels.join('/'))
          }
        })
    },
    formatAlias(data) {
      let returnAlias
      if (
        data.typeId === Number.parseInt(this.$commentPreCode.Entity) ||
        data.typeId === Number.parseInt(this.$commentPreCode.View)
      ) {
        if (data.alias) {
          returnAlias = data.alias
        } else {
          if (this.newAsset) {
            returnAlias = data.assetsName
          } else {
            returnAlias = data.name
          }
        }
      } else {
        if (this.newAsset) {
          returnAlias = data.assetsName
        } else {
          returnAlias = data.name
        }
      }
      return encodeHtml(returnAlias)
    },
    formatName(data) {
      let name = ''
      if (
        data.typeId === Number.parseInt(this.$commentPreCode.Entity) ||
        data.typeId === Number.parseInt(this.$commentPreCode.View)
      ) {
        if (data.alias) {
          name = data.name
        }
      } else if (data.typeId !== 82800008) {
        name = data.code
      } else {
        name = ''
      }
      if (name) {
        return `(${encodeHtml(name)})`
      } else {
        return ''
      }
    },
    handleWrongHighlightCausedByES(obj) {
      Object.keys(obj).forEach(i => {
        const item = obj[i]
        if (Array.isArray(item)) {
          item.forEach((str, idx, array) => {
            if (
              typeof str === 'string' &&
              str.startsWith('<em>') &&
              str.endsWith('</em>')
            ) {
              if (this.keyword) {
                array[idx] = str
                  .slice(4, -5)
                  .replace(this.keyword, `<em>${this.keyword}</em>`)
              } else {
                array[idx] = str.slice(4, -5)
              }
            }
          })
        }
      })
    },
    handleHighlightRaw(obj) {
      Object.keys(obj).filter(i => {
        if (i.includes('.raw')) {
          obj[i.slice(0, -4)] = obj[i]
        }
      })
    },
    formatSummary() {
      const data = this.data
      console.log(this.data)
      this.vote = this.data.vote
      const highlight = this.data.highlight
      let summary = ''

      if (highlight) {
        this.handleWrongHighlightCausedByES(highlight)
        this.handleHighlightRaw(highlight)
        if (highlight.name) {
          data.name = highlight.name[0]
        }
        if (highlight.alias) {
          data.alias = highlight.alias[0]
        } else if (data.alias && data.alias !== data.name) {
        } else {
          data.alias = ''
        }
        if (highlight.modelName) {
          this.data.modelName = highlight.modelName[0]
        }

        if (highlight.description) {
          summary += highlight.description[0]
        }
        if (
          highlight['columns.name'] ||
          highlight['columns.alias'] ||
          highlight['columns.description']
        ) {
          const columns = data.columns
          columns.forEach(column => {
            if (highlight['columns.name']) {
              highlight['columns.name'].forEach(item => {
                if ($(`<span>${item}</span>`).text() === column.name) {
                  column.name = item
                  column.blur = true
                }
              })
            }
            if (highlight['columns.alias']) {
              highlight['columns.alias'].forEach(item => {
                if ($(`<span>${item}</span>`).text() === column.alias) {
                  column.alias = item
                  column.blur = true
                }
              })
            }
            if (highlight['columns.description']) {
              highlight['columns.description'].forEach(item => {
                if ($(`<span>${item}</span>`).text() === column.description) {
                  column.description = item
                  column.blur = true
                  column.descriptionBlur = true
                }
              })
            }
          })
          columns.sort((a, b) => {
            if (a.blur) {
              return -1
            } else if (b.blur) {
              return 1
            }
          })

          summary += '  '
          const columnNames = []
          data.columns.forEach(item => {
            let name = item.name || item.tableName
            if (item.alias && item.alias !== item.name) {
              name = item.name + '(' + item.alias + ')'
            }
            if (item.descriptionBlur) {
              name += ':' + item.description
            }
            columnNames.push(name)
          })
          summary += columnNames.join(', ') + ' '
        }

        // add normal summary
        if (!highlight.description && data.description) {
          summary += data.description
        }
        if (
          !(
            highlight['columns.name'] ||
            highlight['columns.alias'] ||
            highlight['columns.description']
          ) &&
          Array.isArray(data.columns) &&
          data.columns.length > 0
        ) {
          summary += '  '
          const columnNames = []
          data.columns.forEach(item => {
            let name = item.name || item.tableName
            if (item.alias && item.alias !== item.name) {
              name = item.name + '(' + item.alias + ')'
            }
            columnNames.push(name)
          })
          summary += columnNames.join(', ')
        }
      } else {
        if (data.description) {
          summary += data.description
        }
        if (Array.isArray(data.columns) && data.columns.length > 0) {
          summary += '  '
          const columnNames = []
          data.columns.forEach(item => {
            let name = item.name
            if (item.alias && item.alias !== item.name) {
              name = item.name + '(' + item.alias + ')'
            }
            columnNames.push(name)
          })
          summary += columnNames.join(', ')
        }
        if (Array.isArray(data.metrics) && data.metrics.length > 0) {
          summary += ' '
          const columnNames = []
          data.metrics.forEach(item => {
            let name = item.cnFullName
            name = item.name + '(' + item.code + ')'
            columnNames.push(name)
          })
          summary += columnNames.join(', ')
        }
      }
      this.summary = summary
      this.summaryLoaded = true
    },
    handleSetMyRate(value) {
      const typeId = 80000004
      const para = {
        objId: this.objectId,
        typeId: typeId,
        value: value,
      }
      HTTP.setMyRate({
        succesedCallback: data => {
          this.getMyRate()
          this.$message.success(this.$t('meta.DS.tableDetail.submitScore'))
          this.$emit('rateSubmitSuccess')
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
        para: para,
      })
    },
    dataTypeMap(data) {
      if (this.newAsset) {
        // 新资产清单newAsset
        if (data.assetsType) {
          let result = ''
          switch (data.assetsType) {
            case 'TABLE':
            case 'DATA_COLLECTION':
              result = 'table'
              break
            case 'DATA_OBJECT':
              result = 'column'
              break
            case 'REPORT':
              result = 'report'
              break
            case 'DATA_STANDARD':
              result = 'datastandard'
              break
            case 'DATA_STANDARD_CODE':
              result = 'daima'
              break
            case 'INDEX':
              result = 'index'
              break
            case 'DATA_SERVICE':
              result = 'service'
              break
            case 'FILE':
              result = 'file'
              break
          }
          return result
        }
      } else {
        if (data.typeId) {
          if (data.typeId == this.$commentPreCode.Entity) {
            return 'table'
          } else if (data.typeId == this.$commentPreCode.View) {
            return 'view'
          } else if (data.typeId == this.$commentPreCode.ShareFile) {
            return this.$fileTypeFormatter(data.fileType)
          }
        }
        if (data.dataReportType) {
          return 'report'
        } else if (data.domainId) {
          if (data.categoryId === 1) {
            return 'datastandard'
          } else {
            return 'index'
          }
        } else if (data.datasetName) {
          return 'daima'
        } else if (data.hasOwnProperty('code')) {
          return 'index'
        } else if (data.api) {
          return 'api'
        } else {
        }
      }
    },
    dataTypeTable(data) {
      if (data.typeId) {
        if (data.typeId == this.$commentPreCode.Entity) {
          this.tableList = [
            {
              label: '业务系统',
              value: 'displayName',
              src: '/static/images/metadataIcon/metadataBusiness.svg',
              name: data.systemName ? data.systemName : '无',
            },
            {
              label: '数据源',
              value: 'modelName',
              src: '/static/images/metadataIcon/metadataDataBase.svg',
              name: data.modelName ? data.modelName : '无',
            },
            {
              label: 'Schema',
              value: 'schema',
              src: '/static/images/metadataIcon/schema.svg',
              name: data.schema ? data.schema : '无',
            },
            {
              label: '技术部门',
              value: 'itDepartment',
              src: '/static/images/metadataIcon/technicalDepartment.svg',
              name: data.deptName ? data.deptName : '无',
            },
          ]
        } else if (data.typeId == this.$commentPreCode.View) {
          this.tableList = [
            {
              label: '业务系统',
              value: 'displayName',
              src: '/static/images/metadataIcon/metadataBusiness.svg',
            },
            {
              label: '数据源',
              value: 'modelName',
              src: '/static/images/metadataIcon/metadataDataBase.svg',
            },
            {
              label: 'Schema',
              value: 'schema',
              src: '/static/images/metadataIcon/schema.svg',
            },
            {
              label: '技术部门',
              value: 'itDepartment',
              src: '/static/images/metadataIcon/technicalDepartment.svg',
            },
          ]
        } else if (data.typeId == this.$commentPreCode.ShareFile) {
          this.tableList = [
            {
              label: '文件类型',
              value: 'fileType',
              src: '/static/img/metadataBusiness.8191a66e.svg',
              name: data.fileType ? data.fileType : '无',
            },
            {
              label: '文件地址',
              value: 'filePath',
              src: '/static/img/metadataDataBase.962630fb.svg',
              name: data.sourcePath ? data.sourcePath : '无',
            },
            {
              label: '业务部门',
              value: 'businessDepartment',
              src: '/static/img/schema.fedd58af.svg',
              name: data.deptName ? data.deptName : '无',
            },
            {
              label: '技术部门',
              value: 'itDepartment',
              src: '/static/img/technicalDepartment.7268e0ce.svg',
              name: data.deptName ? data.deptName : '无',
            },
          ]
          return this.$fileTypeFormatter(data.fileType)
        } else if (data.typeId == this.$commentPreCode.Report) {
          // 报表
          this.tableList = [
            {
              label: 'url',
              value: 'url',
              src: '/static/img/schema.fedd58af.svg',
              name: data.reportUrl ? data.reportUrl : '无',
            },
          ]
        } else if (data.typeId == this.$commentPreCode.CODE) {
          // 标准代码   domainCode
          this.tableList = [
            {
              label: '标准主体',
              value: 'datasetName',
              src: '/static/img/schema.fedd58af.svg',
              name: data.datasetName ? data.datasetName : '无',
            },
          ]
        }
      }
      if (data.dataReportType) {
        this.tableList = [
          {
            label: 'url',
            value: 'url',
            src: '/static/images/metadataIcon/schema.svg',
          },
        ]
      } else if (data.domainId) {
        this.tableList = [
          {
            label: '业务部门',
            value: 'businessDepartment',
            src: '/static/img/schema.fedd58af.svg',
            name: data.systemName ? data.systemName : '无',
          },
          {
            label: '技术部门',
            value: 'itDepartment',
            src: '/static/img/technicalDepartment.7268e0ce.svg',
            name: data.deptName ? data.deptName : '无',
          },
          {
            label: '指标定义',
            value: 'description',
            src: '/static/img/metadataDataBase.962630fb.svg',
            name: data.description ? data.description : '无',
          },
        ]
      } else if (data.api) {
        this.tableList = [
          {
            label: '分类',
            value: 'apiCatalog',
            src: '/static/img/schema.fedd58af.svg',
            name: data.apiCatalog ? data.apiCatalog : '无',
          },
          {
            label: '创建人',
            value: 'creator',
            src: '/static/img/technicalDepartment.7268e0ce.svg',
            name: data.apiCreator ? data.apiCreator : '无',
          },
        ]
      } else if (data.datasetName) {
        this.tableList = [
          {
            label: '标准主体',
            value: 'datasetName',
            src: '/static/img/schema.fedd58af.svg',
            name: data.datasetName ? data.datasetName : '无',
          },
        ]
      } else {
      }
    },
  },
  mounted() {
    // console.log(this.catalogPath)
    this.dataTypeTable(this.data)
    this.formatPaths()
    this.formatSummary()
  },
}
