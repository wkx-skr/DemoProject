export default {
  props: ['detail'],
  components: {},
  data() {
    return {
      activeCollapse: ['0'],
      innerDetail: {
        flowId: this.$parent.$parent.detail.id,
        busiName: '',
        busiCode: '',
        inputObj: '',
        outputObj: '',
        dataLevel: '',
        subjectArea: '',
        crossAreas: '',
        isRecommend: '',
        departments: '',
        srcTable: '',
        srcSys: '',
      },
      editMode: true,
      container: $('.content-area')[0],
    }
  },
  mounted() {
    if (this.detail) {
      //      this.preInnerDetail = _.clone(this.detail);
      const innerDetail = _.clone(this.detail)
      if (innerDetail.departments) {
        innerDetail.departments = innerDetail.departments.join(';')
      } else {
        innerDetail.departments = ''
      }
      if (innerDetail.srcTable) {
        innerDetail.srcTable = innerDetail.srcTable.join(';')
      } else {
        innerDetail.srcTable = ''
      }

      this.innerDetail = innerDetail
    } else {
    }
  },
  beforeDestroy() {},
  methods: {
    beforeUpdateDetail() {
      this.$refs.form0.validate(valid => {
        if (valid) {
          this.updateDetail()
        } else {
          this.$message.error('有必填项未填写,无法保存')
        }
      })
    },
    updateDetail() {
      const requestBody = _.clone(this.innerDetail)
      requestBody.departments = requestBody.departments.split(/;|；/)
      requestBody.srcTable = requestBody.srcTable.split(/;|；/)
      if (this.detail) {
        // update
        this.$http
          .put(
            this.$url + `/service/busiObjects/objects/${this.detail.objId}`,
            requestBody
          )
          .then(res => {
            this.$message.success('修改成功')
            this.$emit('saveAndClose')
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        // create
        this.$http
          .post(this.$url + '/service/busiObjects/objects/', requestBody)
          .then(res => {
            this.$message.success('创建成功')
            this.$emit('saveAndClose')
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    cancel() {
      this.$emit('close')
    },
  },
  computed: {},
  watch: {},
}
