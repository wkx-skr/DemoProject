export default {
  props: ['detail', 'isAdd'],
  components: {},
  data() {
    return {
      activeCollapse: ['0'],
      preInnerDetail: null,
      innerDetail: {
        name: '',
        flowCode: '',
        path0: '',
        path1: '',
        path3: '',
        confirmedBusiObj: '',
      },
      editMode: true,
      container: $('.content-area')[0],
      baseCode: true,

      showOperation: true,
    }
  },
  mounted() {
    if (this.detail) {
      //      this.preInnerDetail = _.clone(this.detail);
      this.innerDetail = _.clone(this.detail)
    } else {
    }
    setTimeout(() => {
      Ps.initialize(this.container)
      this.container.scrollTop = 0
    })
  },
  beforeDestroy() {
    Ps.destroy(this.container)
  },
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
      let path = []
      if (this.innerDetail.path1) {
        path.push(this.innerDetail.path1)
      }
      if (this.innerDetail.path2) {
        path.push(this.innerDetail.path2)
      }
      if (this.innerDetail.path3) {
        path.push(this.innerDetail.path3)
      }
      if (this.innerDetail.pathMore) {
        path = path.concat(this.innerDetail.pathMore.split(/;|；/))
      }
      const requestBody = {
        confirmedBusiObj: this.innerDetail.confirmedBusiObj,
        flowCode: this.innerDetail.flowCode,
        flowName: this.innerDetail.name,
        busiArea: this.innerDetail.path0,
        path: path,
      }

      if (this.detail) {
        // update
        this.$http
          .put(
            this.$url + `/service/busiObjects/flows/${this.detail.id}`,
            requestBody
          )
          .then(res => {
            let detail = res.data
            let detailData = {
              flowCode: detail.flowCode,
              id: detail.flowId,
              name: detail.flowName,
              path0: detail.busiArea,
              path1: detail.path[0],
              path2: detail.path[1],
              path3: detail.path[2],
              pathMore: detail.path[3],
            }
            this.$emit('changeBreadcrumb', detail.flowName)
            this.$message.success('修改成功')
            this.$bus.$emit('changeCurrentDetail', detailData)
            this.$bus.$emit('changeMode', 'scan')
            this.$bus.$emit('reloadTree')
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        // create
        this.$http
          .post(this.$url + '/service/busiObjects/flows/', requestBody)
          .then(res => {
            this.$message.success('创建成功')
            this.$bus.$emit('changeMode', null)
            this.$bus.$emit('reloadTree')
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    cancel() {
      if (this.isAdd) {
        this.$bus.$emit('changeMode', null)
      } else {
        this.$bus.$emit('changeMode', 'scan')
      }
    },
  },
  computed: {},
  watch: {},
}
