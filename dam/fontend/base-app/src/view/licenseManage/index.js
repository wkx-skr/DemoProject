import moment from 'moment'
export default {
  components: {},
  data() {
    return {
      uploadUrl: this.$url + '/license/uploadLicenseFile',
      proList: [],
      licenseData: null,
      licenseInfo: {},
      moment: moment,
    }
  },
  created() {
    this.getLicenseDetail()
    this.getLicenseList()
  },
  beforeDestroy() {},
  methods: {
    deleteLicense(id) {
      this.$http
        .post(`${this.$url}/license/deleteLicenseFile?id=${id}`)
        .then(res => {
          this.getLicenseList()
          this.getLicenseDetail()
        })
        .catch(e => {
          this.licenseData = []
          this.$showFailure(e)
        })
    },
    getLicenseList() {
      this.$http
        .post(this.$url + '/license/getLicenseList')
        .then(res => {
          if (Array.isArray(res.data)) {
            this.licenseData = res.data
          } else {
            this.licenseData = []
          }
        })
        .catch(e => {
          this.licenseData = []
          this.$showFailure(e)
        })
    },
    getLicenseDetail() {
      this.$http
        .post(this.$url + '/license/getLicenseDetail')
        .then(res => {
          this.licenseInfo = res.data.licenseInfo
          this.judgeStatus()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    judgeStatus() {
      let tempData = this.licenseInfo.featureInfos
      if (!tempData || tempData.length === 0) {
        this.proList = []
        return
      }
      tempData.forEach(pro => {
        if (pro.status === 'EXPIRED') {
          pro.status = 'error'
          pro.iconType = 'icon-gaojing'
          pro.iconColor = '#F2220A'
        } else {
          pro.status = 'success'
          pro.iconType = 'icon-chenggong'
          pro.iconColor = '#66BF16'
        }
      })
      this.proList = tempData
    },
    handleBeforeUpload(file) {
      if (!file.name.toLowerCase().includes('.lic')) {
        this.$message.error(this.$t('system.licenseManageCatlog.fileTypeError'))
        return false
      }
      let imgSize = Number(file.size / 1024 / 1024)
      if (imgSize > 1) {
        this.$message.info(this.$t('system.licenseManageCatlog.uploadTipAgain'))
        return false
      }
    },
    handleUploadSuccess(res, file, type) {
      this.$message.success(this.$t('meta.DS.message.uploadSucceed'))
      if (Array.isArray(res.licenses)) {
        this.licenseData = res.licenses
      } else {
        this.licenseData = []
      }
      this.licenseInfo = res.licenseInfo
      this.judgeStatus()
    },
    handleUploadError(e) {
      this.$showUploadFailure(e)
    },
  },
  watch: {},
}
