export default {
  props: ['preData'],
  data() {
    return {
      content: {},
    }
  },
  mounted() {
    if (this.preData) {
      this.content = _.clone(this.preData)
    }
  },
  methods: {
    confirm() {
      if (this.preData) {
        // update
        const request = this.content
        this.$http
          .put(this.$url + '/service/' + this.preData.id, request)
          .then(res => {
            this.$message.success(self.content.name + '修改成功')
            this.remove()
          })
          .catch(e => {
            self.$message.error(self.content.name + '修改失败')
          })
      } else {
        // add
        this.$http
          .post(this.$url + '/service/', request)
          .then(res => {
            this.$message.success(self.content.name + ' 添加成功')
            this.remove()
          })
          .catch(e => {
            self.$message.error(self.content.name + '添加失败')
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
  },
}
