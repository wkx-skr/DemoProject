import vue from 'vue'

export default vue.extend({
  template: `
    <div>
      <el-button type="text" size="mini" @click="jump">查看</el-button>
      <el-button type="text" size="mini" @click="scan">取消订阅</el-button>
  </div>`,
  mounted() {},
  methods: {
    jump() {
      const data = this.params.data
      if (this.params.data.typeId === 80010001 && this.params.data.flag === 1) {
        this.$router.push({
          name: 'ddm',
          query: {
            modelId: data.objId,
            path: data.objectName,
          },
        })
      } else if (data.typeId === 80010001 && data.flag === 0) {
        this.$router.push({
          name: 'dataSource',
          query: { id: data.objId },
        })
      } else if (data.typeId === 80010066) {
        this.$router.push({
          name: 'dataStandard',
          query: { domain: data.objId },
        })
      }
    },
    scan() {
      this.$confirm('确定要取消订阅吗?', '取消订阅', {
        confirmButtonText: this.$t('common.button.ok'),
        cancelButtonText: this.$t('common.button.cancel'),
        type: 'warning',
      })
        .then(() => {
          this.$http
            .delete(this.$url + '/service/subscribe/' + this.params.data.id)
            .then(res => {
              this.$getSubscribe(() => {
                this.$bus.$emit('removeDisSubscribe')
              })
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {})
    },
  },
})
