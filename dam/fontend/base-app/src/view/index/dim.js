export default {
  props: ['dimType'],
  data() {
    return {
      rawData: {},
      timesData: {},
      displayTable: [],
      catalogs: [],
      values: [],
      tableHeight: 300,
      dialogVisible: false,
      dialogKey: '',
      dialogValue: '',
      standardCodeDialogVisible: false,
      defaultProps: {
        label: 'name',
        id: 'code',
      },
      treeData: [],
      keyword: '',
      selectedCode: null,
      selectBtnEnable: false,
      tableKey: 0,
    }
  },
  mounted() {
    if (this.dimType === 'time') {
      this.$bus.$on('timesReceived', data => {
        this.rawData = data
        this.displayTable = []
        for (const k in this.rawData) {
          const v = this.rawData[k]
          let values = ''
          Array.isArray(v.values) &&
            v.values.forEach(item => {
              if (values) {
                values += '；'
              }
              values += item.value
            })
          this.displayTable.push({
            catalogName: v.catalog,
            catalogId: v.catalogId,
            values: values,
          })
        }
      })
    } else {
      this.getCatalogs()
      this.$bus.$on('getDimCatalogs', () => {
        this.getCatalogs()
      })
    }
    this.initTableHeight()
  },
  beforeDestroy() {
    if (this.dimType === 'time') {
      this.$bus.$off('timesReceived')
    } else {
      this.$bus.$off('getDimCatalogs')
    }
  },
  computed: {
    TYPE() {
      return this.dimType === 'time' ? 'TIME' : 'NORMAL'
    },
    isTime() {
      return this.dimType === 'time'
    },
  },
  methods: {
    initTableHeight() {
      setTimeout(() => {
        const height = $('.content-area')[0].offsetHeight
        this.tableHeight = height - 130
      })
    },
    getCatalogs() {
      this.$http
        .get(this.$url + '/service/me/dims/catalogs')
        .then(res => {
          this.rawData = {}
          res.data.forEach(item => {
            this.rawData[item.catalogId] = item
          })
          this.$bus.$emit('gotDims', this.rawData)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    addDim() {
      this.dialogKey = ''
      this.dialogValue = ''
      this.dialogVisible = true
    },
    submitDim() {
      const requestBody = {
        catalogId: 'DC-' + this.$getUniqueId(),
        catalog: this.dialogKey,
        dimensionType: this.TYPE,
      }
      this.$http
        .post(this.$url + '/service/me/dims/catalogs', requestBody)
        .then(res => {
          const lastChar = this.dialogValue[this.dialogValue.length - 1]
          if (lastChar === ';' || lastChar === '；') {
            this.dialogValue = this.dialogValue.slice(0, -1)
          }
          const tmpArr = this.dialogValue.split(';')
          let valueArr = []
          tmpArr.forEach(item => {
            valueArr = valueArr.concat(item.split('；'))
          })
          const length = valueArr.length
          let r_cnt = 0 // request count
          let cnt = 0 // response count
          valueArr.forEach(item => {
            this.$http
              .post(this.$url + '/service/me/dims', {
                catalog: requestBody,
                dimId: 'D-' + this.$getUniqueId() + '-' + r_cnt++,
                value: item,
              })
              .then(res => {
                cnt++
                if (cnt === length) {
                  this.dialogVisible = false
                  this.$bus.$emit('getDimCatalogs')
                }
              })
              .catch(e => {
                cnt++
                this.$showFailure(e)
              })
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    deleteDims(row) {
      const catalogId = row.catalogId
      const values = this.rawData[catalogId].values
      const length = values.length
      let cnt = 0
      //      console.log(this.rawData[catalogId])
      if (values.length === 0) {
        this.deleteDimCatalog(catalogId)
      }
      values.forEach(dim => {
        this.$http
          .delete(this.$url + '/service/me/dims/' + dim.dimId)
          .then(res => {
            cnt++
            if (cnt === length) {
              this.deleteDimCatalog(catalogId)
            }
          })
          .catch(e => {
            this.$showFailure(e)
            this.$bus.$emit('getDimCatalogs')
          })
      })
    },
    deleteDimCatalog(catalogId) {
      this.$http
        .delete(this.$url + '/service/me/dims/catalogs/' + catalogId)
        .then(res => {
          this.$message.success('删除成功')
          this.$bus.$emit('getDimCatalogs')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    exportFromStandardCode() {
      this.standardCodeDialogVisible = true
      this.getStandardCodes()
    },
    getStandardCodes() {
      this.$http
        .get(this.$url + '/service/domains/codes')
        .then(res => {
          if (Array.isArray(res.data)) {
            this.handleCodesList(res.data)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleCodesList(list) {
      this.treeData = []
      const codesMap = {}
      list.forEach(item => {
        if (codesMap.hasOwnProperty(item.datasetName)) {
        } else {
          codesMap[item.datasetName] = []
        }
        codesMap[item.datasetName].push(item)
      })
      for (const i in codesMap) {
        const codes = codesMap[i]
        this.treeData.push({
          name: i,
          children: codes,
        })
      }
    },
    renderContent(h, { node, data, store }) {
      if (data.code) {
        return (
          <span
            style="flex: 1; display: flex;align-items: center;"
            data-code={data.code}
          >
            <span class="tree-icon dim"></span>
            <span>{node.label}</span>
          </span>
        )
      } else {
        return (
          <span style="flex: 1; display: flex;align-items: center;">
            <span class="icon-i-folder">
              <span class="path1"></span>
              <span class="path2"></span>
            </span>
            <span>{node.label}</span>
          </span>
        )
      }
    },
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    handleNodeClick(data) {
      this.selectedCode = data
      this.selectBtnEnable = !!data.code
    },
    codeSelected() {
      const name = this.selectedCode.name
      const code = this.selectedCode.code
      const requestBody = {
        catalogId: 'DC-' + this.$getUniqueId(),
        catalog: name,
        dimensionType: 'NORMAL',
      }
      let values = []
      this.$http
        .post(this.$url + '/service/me/dims/catalogs', requestBody)
        .then(res => {
          this.$http
            .get(
              this.$url + '/service/domains/codes/content?codeNumber=' + code
            )
            .then(res => {
              values = res.data.values
              const length = values.length
              const r_cnt = 0 // request count
              let cnt = 0 // response count
              values.forEach(item => {
                this.$http
                  .post(this.$url + '/service/me/dims', {
                    catalog: requestBody,
                    //              dimId:'D-' + this.$getUniqueId() + '-' + r_cnt++,
                    dimId: item.value,
                    value: item.name,
                  })
                  .then(res => {
                    cnt++
                    if (cnt === length) {
                      this.standardCodeDialogVisible = false
                      this.$message.success('导入成功')
                      this.getCatalogs()
                    }
                  })
                  .catch(e => {
                    cnt++
                    this.$showFailure(e)
                  })
              })
            })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
  watch: {
    keyword(val) {
      this.$refs.tree.filter(val)
    },
  },
}
