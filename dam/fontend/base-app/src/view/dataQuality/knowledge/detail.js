import chooseQualityRules from '../../../components/quality/qualityJob/chooseQualityRules.vue'
import knowledgeHistory from './knowledgeHistory.vue'
export default {
  props: ['preData', 'hasAccess'],
  components: { chooseQualityRules, knowledgeHistory },
  data() {
    return {
      activeIndex: 'rule',
      chooseRulesDialogVisible: false,
      chooseKnowledgeDialogVisible: false,
      content: {
        title: '',
        description: '',
        cause: '',
        solution: '',
        //        creator:null,
        //        createTime:null,
        techRules: [],
        refKnowledgeDocs: [],
        documents: [], // just save id.
      },
      documents: [],
      validateRules: {
        title: [
          {
            required: true,
            message:
              this.$t('common.placeholder.prefix') +
              this.$t('quality.page.knowledgebase.form.title'),
            trigger: 'blur',
          },
          //          {max: 128, message: '不能超过128个字符', trigger: 'change'}
        ],
        cause: [
          {
            required: true,
            message:
              this.$t('common.placeholder.prefix') +
              this.$t('quality.page.knowledgebase.form.cause'),
            trigger: 'blur',
          },
        ],
        solution: [
          {
            required: true,
            message:
              this.$t('common.placeholder.prefix') +
              this.$t('quality.page.knowledgebase.form.solution'),
            trigger: 'blur',
          },
        ],
      },
      nameMapping: {},
      deleteArr: ['content', 'documents', 'nameMapping'],
      option: {
        selectable: false,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      documentOption: {
        selectable: false,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      typeArr: {
        SQL: this.$t('quality.page.knowledgebase.typeArr.SQL'),
        Regex: this.$t('quality.page.knowledgebase.typeArr.Regex'),
        Function: this.$t('quality.page.knowledgebase.typeArr.Function'),
        Compare: this.$t('quality.page.knowledgebase.typeArr.Compare'),
      },
      bigClassList: [],
    }
  },
  beforeDestroy() {
    setTimeout(() => {
      this.deleteArr.forEach(item => {
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
  filters: {
    bigClassFilter(value, bigClassList) {
      let result = ''
      bigClassList.forEach(e => {
        if (e.value === value) {
          result = e.label
        }
      })
      return result
    },
  },
  created() {
    this.getBigClassList()
  },
  mounted() {
    if (this.preData) {
      const kdId = this.preData.kdId
      this.getDetail(kdId)
    }
    // this.$bus.$on('qualityRulesSelected',data=>{
    //   this.content.techRules = this.content.techRules.concat(_.cloneDeep(data));
    // });
    // this.$bus.$on('closeDialog',()=>{
    //   this.chooseRulesDialogVisible = false;
    // });
  },
  // beforeDestroy(){
  //   this.$bus.$off('qualityRulesSelected');
  //   this.$bus.$off('closeDialog');
  // },
  methods: {
    getBigClassList() {
      this.$http
        .post(`${this.$url}/select/option/get`, {
          category: 'TR',
          names: ['规则大类'],
        })
        .then(res => {
          const classList = res.data.filter(e => e.optionName === '规则大类')
          classList.forEach(e => {
            const classObj = {
              id: e.id,
              label: e.optionValue,
              value: e.ruleCode,
            }
            this.bigClassList.push(classObj)
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    jumpTotechRuleName(row) {
      this.$http
        .post(this.$quality_url + '/quality/rule/tech/' + row.id + '/check')
        .then(res => {
          window.open(
            this.BaseUtils.RouterUtils.getFullUrl('qualityRule', {
              id: row.id,
              blank: true,
            })
          )
        })
        .catch(err => {
          this.$message.error('您暂无权限访问')
        })
    },
    qualityRulesSelected(data) {
      // 去重
      // this.content.techRules = this.content.techRules.concat(_.cloneDeep(data));
      const newArr = []
      data.forEach(v1 => {
        if (this.content.techRules.every(v2 => v1.id !== v2.id)) {
          newArr.push(v1)
        }
      })
      this.content.techRules = this.content.techRules.concat(newArr)
    },
    getDetail(id) {
      this.$http
        .get(this.$quality_url + '/knowledge/kd/' + id)
        .then(res => {
          this.content = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleActiveIndexChange(tab, event) {
      this.activeIndex = tab.name
    },
    handleSelect() {},
    confirm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return false
        } else {
          this.executeConfirm()
        }
      })
    },
    executeConfirm() {
      const request = this.content
      if (this.preData) {
        // update
        this.$http
          .post(this.$quality_url + '/knowledge/kd/', request)
          .then(res => {
            this.$message.success(
              this.content.title +
                this.$t('quality.page.knowledgebase.successfullyModified')
            )
            this.$bus.$emit('reload')
            this.remove()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        // add
        this.$http
          .post(this.$quality_url + '/knowledge/kd/', request)
          .then(res => {
            this.$message.success(
              this.content.title +
                this.$t('quality.page.knowledgebase.successfullyAdded')
            )
            this.$bus.$emit('reload')
            this.remove()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    remove() {
      if (this.preData) {
        this.$bus.$emit('removeTab', this.preData.name)
      } else {
        this.$bus.$emit('removeTab')
      }
    },
    deleteRule(index) {
      this.content.techRules.splice(index, 1)
    },
    beforeUpload(file) {
      let imgSize = Number(file.size / 1024 / 1024)
      if (imgSize > 8) {
        this.$confirm(
          this.$t('quality.page.knowledgebase.fileUpSize'),
          this.$t('common.info.title'),
          {
            confirmButtonText: this.$t('common.button.ok'),
            cancelButtonText: this.$t('common.button.cancel'),
            type: 'warning',
            showCancelButton: false,
          }
        )
          .then(() => {})
          .catch(() => {})
        return false
      } else {
        this.$fullScreenLoading.open()
      }
    },
    handleUploadError(e) {
      this.$showUploadFailure()
      this.$fullScreenLoading.close()
    },
    handleUploadSuccess(response) {
      const documents = this.content.documents
      if (!this.content.documents) {
        this.content.documents = []
      }
      this.content.documents.push({
        uuid: response.fileId,
        docName: response.fileName,
      })
      this.$http
        .post(this.$url + '/files/commitFile?fileIds=' + response.fileId)
        .then(res => {
          this.$fullScreenLoading.close()
          this.getDocumentsDetail()
        })
        .catch(e => {
          this.$fullScreenLoading.close()
          this.$showFailure(e)
        })
    },
    getDocumentsDetail() {
      let fileIds = ''
      if (Array.isArray(this.content.documents)) {
        this.content.documents.forEach(doc => {
          if (fileIds === '') {
            fileIds += doc.uuid
          } else {
            fileIds += ',' + doc.uuid
          }
        })
      }
      if (fileIds) {
        this.$http
          .post(this.$url + '/files/getFilesInfo?fileIds=' + fileIds)
          .then(res => {
            this.documents = res.data
            let arr = this.documents.map(e => e.uploader)
            arr = [...new Set(arr)]
            // this.getUserByIds(arr)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.documents = []
      }
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
    downloadDoc(fileId) {
      const url = this.$url + '/files/download?fileId=' + fileId
      this.$downloadFilePost(url)
    },
    handleDocumentRemove(fileId) {
      const index = this.content.documents.findIndex(
        item => item.uuid === fileId
      )
      this.content.documents.splice(index, 1)
      this.getDocumentsDetail()
    },
    ruleFormatter() {
      const content = arguments[0][arguments[1].property]
      return content.toString()
    },
  },
  watch: {
    activeIndex(newIndex) {
      if (newIndex === 'document') {
        this.getDocumentsDetail()
      }
    },
  },
}
