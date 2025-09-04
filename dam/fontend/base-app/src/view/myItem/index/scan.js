export default {
  props: ['type', 'detail', 'baseCodeObj', 'msgFromParent'],
  data() {
    return {
      hasAccess: this.$auth.DATA_STANDARD_DIM_CATALOG_VIEW,
      baseCode: false,
      container: $('.content-area')[0],
      documents: [],
      quotes: [],
    }
  },
  mounted() {
    /* setTimeout(()=>{
      Ps.initialize(this.container,{
        suppressScrollX:true
      });
      this.container.scrollTop = 0;
    }); */
    if (this.type === 'BASE_CODE') {
      this.baseCode = true
    }
    this.getDocumentsDetail()
    this.getQuote()
  },
  beforeDestroy() {
    // Ps.destroy(this.container);
  },
  methods: {
    changeToEditMode() {
      this.$bus.$emit('changeMode', 'edit')
    },
    addCode() {
      this.$bus.$emit('addCode', {
        type: this.type,
        detail: this.detail,
      })
    },
    getDocumentsDetail() {
      let fileIds = ''
      if (Array.isArray(this.detail.documents)) {
        this.detail.documents.forEach(doc => {
          if (fileIds === '') {
            fileIds += doc.uuid
          } else {
            fileIds += ',' + doc.uuid
          }
        })
      }
      this.$http
        .get(this.$url + '/service/files/?fileIds=' + fileIds)
        .then(res => {
          this.documents = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getQuote() {
      this.$http
        .get(this.$url + '/service/dataReport/related/me/' + this.detail.codeId)
        .then(res => {
          this.quotes = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    downloadDoc(fileId) {
      const url = this.$url + '/service/files/' + fileId + '/download'
      this.$downloadFile(url)
    },
    jumpToCode(codeId) {
      this.$bus.$emit('jumpToCode', codeId)
    },
    n2br(str) {
      if (typeof str === 'string') {
        return str.replace(/\n/g, '<br>')
      } else {
        return ''
      }
    },
    queryRequirement(row) {
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      window.open(
        baseUrl + 'main/dataDemand?requirementid=' + row.dataRequirementCode,
        '_blank'
      )
    },
    queryApplication(row) {
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      window.open(
        baseUrl + 'main/reportFormManage?reportCode=' + row.code,
        '_blank'
      )
    },
  },
}
