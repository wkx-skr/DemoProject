import HTTP from '@/http/main.js'

export default {
  props: ['hasAccess'],
  data() {
    return {
      dataTime: [],
      searchWord: '',
      selectWord: null,
      options: [],
      tableData: null,
      tableAllData: [],
      tableAllData2: [],
      multipleSelection: [],
      deleteDisabled: true,
      loading: false,
      currentPage: 1,
      manyEachPage: 20,
      idArr: [],
      templateId: null,
      nameList: [],
      selection: [],
      showUpload: true,
      nameMapping: {},
      total: 0,
      classTypeMapping: {},
      tableHeight: null,
      ruleDelete: ['options', 'tableData', 'classTypeMapping'],
      option: {
        selectable: true,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      checkDisabledObj: {
        builtIn: '1',
      },
      uploadDialogVisible: false,
      formFile: [],
      exportType: false,
    }
  },
  created() {
    this.getClassType()
  },
  mounted() {
    this.initData()
  },
  beforeDestroy() {
    setTimeout(() => {
      this.ruleDelete.forEach(item => {
        if (typeof this[item] === 'object' && this[item]) {
          Object.keys(this[item]).forEach(o => {
            this[item][o] = null
          })
        }
        this[item] = null
      })
      if (window.CollectGarbage) {
        window.CollectGarbage()
      }
    }, 3000)
  },
  methods: {
    onChange(e) {
      this.formFile.push(e)
    },
    beforeRemove(e) {
      this.formFile = []
    },

    standardImportAction() {
      this.uploadDialogVisible = false
      this.$refs.standardImport.$refs.upload.submit()
    },
    getClassType() {
      HTTP.getSelectionOptions({
        requestBody: {
          category: 'TR',
          names: ['规则大类'],
        },
      })
        .then(res => {
          let data = res.data
          if (!data || !Array.isArray(data)) {
            data = []
          }
          this.options = [
            {
              id: null,
              optionValue: this.$t('quality.page.ruleTemplate.type.all'),
            },
            ...data,
          ]
          if (data.length) {
            let map = {}
            data.forEach(d => {
              map[d.id] = d.optionValue
            })
            this.classTypeMapping = map
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getUserByIds(idList) {
      if (!idList) {
        return
      }
      return new Promise(resolve => {
        this.$http
          .post(`${this.$url}/service/staffs/ids?isTuAcct=true`, idList)
          .then(res => {
            const obj = {}
            res.data.forEach(e => {
              obj[e.tuAcct] = e.tuCname
            })
            this.nameMapping = obj
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    getPeopleName(list) {
      return list.map(e => this.nameMapping[e]).toString()
    },
    handleSelectionChange(val) {
      if (val.length && this.$auth.QUALITY_RULE_TEMPLATE_DELETE) {
        this.deleteDisabled = false
        this.idArr = []
        this.selection = []
        val.forEach(e => {
          this.idArr.push(e.id)
          this.selection.push(e)
        })
      } else {
        this.idArr = []
        this.deleteDisabled = true
      }
    },
    query() {
      this.currentPage = 1
      this.initData()
    },
    initData() {
      this.loading = true
      const obj = {
        currentPage: this.currentPage,
        pageSize: this.manyEachPage,
        keyword: this.searchWord,
        ruleClass: this.selectWord,
        startTime:
          Array.isArray(this.dataTime) && this.dataTime.length > 0
            ? this.dataTime[0]
            : '',
        endTime:
          Array.isArray(this.dataTime) && this.dataTime.length > 0
            ? this.dataTime[1]
            : '',
      }
      this.$http
        .post(`${this.$quality_url}/template/query/page`, obj)
        .then(res => {
          this.loading = false
          // this.tableAllData = res.data.reverse();
          this.tableData = res.data.templateList
          this.tableData.forEach(element => {
            element.templateName = element.templateName.slice(0, 40)
          })
          setTimeout(() => {
            this.tableHeight = document.documentElement.clientHeight - 210
          })
          this.total = res.data.total
          let arr2 = this.tableData.map(e => e.creator)
          arr2 = [...new Set(arr2)]
          // this.getUserByIds(arr2)
          // this.tableAllData2 = this.tableAllData;
          // this.handleCurrentChange(1);
          const arr = []
          res.data.templateList.forEach(e => {
            arr.push(e.templateName)
          })
          this.nameList = arr
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
    // convertDate (time) {
    //   const y = new Date(time).getFullYear();
    //   const m = (new Date(time).getMonth() + 1).toString().padStart(2, '0');
    //   const d = (new Date(time).getDate()).toString().padStart(2, '0');
    //   return y + '-' + m + '-' + d;
    // },
    filter() {
      // if (!this.searchWord.length){
      //   this.tableAllData2 = this.tableAllData;
      // } else {
      //   const newArr = [];
      //   this.tableAllData.forEach(e => {
      //     if (e.templateName.includes(this.searchWord) || this.getPeopleName([e.creator]).includes(this.searchWord)) {
      //       newArr.push(e);
      //     }
      //   });
      //   this.tableAllData2 = newArr;
      // }
      // this.classChange()
      // this.handleCurrentChange(1);
    },
    classChange() {
      // if (this.selectWord !== 0) {
      //   const newArr = [];
      //   this.tableAllData2.forEach(e => {
      //     if (e.ruleClass === this.convertClass(this.selectWord)) {
      //       newArr.push(e);
      //     }
      //   });
      //   this.tableAllData2 = newArr;
      //   // this.handleCurrentChange(1);
      // } else {
      //   // this.tableAllData2 = this.tableAllData;
      //   // this.handleCurrentChange(1);
      // }
    },
    convertClass(value) {
      let result
      const standard = [
        { number: 1, word: this.$version.ruleTemplate.name.integrity },
        { number: 2, word: this.$version.ruleTemplate.name.consistent },
        { number: 3, word: this.$version.ruleTemplate.name.veracity },
        { number: 4, word: '唯一性' },
        { number: 5, word: this.$version.ruleTemplate.name.promptness },
        { number: 6, word: '规范性' },
        { number: 7, word: '有效性' },
      ]
      if (typeof value === 'number') {
        standard.forEach(e => {
          if (e.number === value) {
            result = e.word
          }
        })
      } else {
        standard.forEach(e => {
          if (e.word === value) {
            result = e.number
          }
        })
      }
      return result
    },
    importTemplate() {
      // const ref = this.$refs.updateTemplate
      // ref.$el.click()
      this.formFile = []
      this.exportType = false
      this.uploadDialogVisible = true
    },
    addTab() {
      this.$bus.$emit('addTab', this.nameList)
    },
    addEdit(index, data) {
      const obj = data
      // try {
      //   obj.ruleClass = this.convertClass(data.ruleClass).toString();
      // } catch (e) {
      // }
      this.$bus.$emit('addEdit', obj, this.nameList)
    },
    handleRowClick(row) {
      if (row.builtIn === 1) {
        // return
      }
      const obj = row
      // try {
      //   obj.ruleClass = this.convertClass(row.ruleClass).toString();
      // } catch (e) {
      // }
      this.$bus.$emit('addDetail', obj)
    },
    exportTemplates() {
      const url = `${this.$quality_url}/template/export`
      this.$downloadFilePost(
        url,
        this.idArr,
        this.$t('common.page.ruleTemplate')
      )
    },
    exportTemplate(row) {
      const url = `${this.$quality_url}/template/export`
      this.$downloadFilePost(url, [row.id], this.$t('common.page.ruleTemplate'))
    },
    deleteThis(row) {
      // if (row && row.builtIn) {
      //   this.$message.warning(`${row.templateName}是内置模板不能被删除`)
      //   return
      // }
      const name = []
      let text = ''
      if (row.id || this.idArr.length === 1) {
        const name = row.templateName || this.selection[0].templateName
        text = this.$t('quality.page.ruleTemplate.deleteTips1', {
          name: name,
        })
      } else {
        text = this.$t('quality.page.ruleTemplate.deleteTips2', {
          selection: this.selection.length,
        })
      }
      this.idArr.forEach(items => {
        this.selection.forEach(e => {
          if (items === e.id && e.builtIn) {
            name.push(e.templateName)
          }
        })
      })
      // if (name.length) {
      //   this.$message.warning(`${name.toString()}是内置模板不能被删除`)
      //   return
      // }
      this.$DatablauCofirm(text, this.$t('quality.page.ruleTemplate.delTemp'), {
        confirmButtonText: this.$version.ruleTemplate.name.confirm,
        cancelButtonText: this.$version.ruleTemplate.name.cancel,
        type: 'warning',
      }).then(() => {
        const option = row.id ? [row.id] : this.idArr
        this.$http
          .post(`${this.$quality_url}/template/delete`, option)
          .then(res => {
            if (res) {
              this.$message({
                message: '删除成功',
                type: 'success',
              })
            }
            this.currentPage = 1
            this.initData()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    handleSizeChange(val) {
      this.manyEachPage = val
      // this.handleCurrentChange(1)
      this.currentPage = 1
      this.initData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.initData()
      // try {
      //   this.tableData = this.tableAllData2.slice((val - 1) * this.manyEachPage, (val - 1) * this.manyEachPage + this.manyEachPage);
      // } catch (e) {
      //   this.tableData = this.tableAllData2.slice(val * this.manyEachPage);
      // }
    },
    showBegain() {
      this.$bus.$emit('showUploadProgress', {
        name: '导入规则模板',
        time: 10,
      })
    },
    handleUpdateMetadataSuccess(res) {
      this.$bus.$emit('changeUploadProgress', true)
      this.$bus.$emit('getTaskJobResult', res, 'import')
      // this.initData()
      this.showUpload = false
      setTimeout(() => {
        this.showUpload = true
      }, 100)
    },
    handleUpdateMetadataError(err, file, fileList) {
      this.$bus.$emit('changeUploadProgress', false)
      this.$showUploadFailure(err)
      this.showUpload = false
      setTimeout(() => {
        this.showUpload = true
      }, 100)
    },
    checkboxT(row, index) {
      if (row.builtIn) {
        return 0
      } else {
        return 1
      }
    },
    nameSort(a, b) {
      return a.templateName.localeCompare(b.templateName, 'zh-Hans-CN', {
        sensitivity: 'accent',
      })
    },
  },
  computed: {
    standardUploadUrl() {
      let url =
        this.$quality_url + `/template/import?ignoreError=${this.exportType}`
      return url
    },
    // total () {
    //   return this.tableAllData2.length;
    // }
  },
  watch: {
    uploadDialogVisible(value) {
      if (value === true && this.$refs.standardImport) {
        this.$refs.standardImport.$refs.upload.clearFiles()
        // console.log(this.$refs.standardImport, 'this.$refs.standardImport')
      }
    },
    //   searchWord(){
    //     this.searchWordChange();
    //   },
    //   selectWord(){
    //     this.classChange();
    //   }
  },
}
