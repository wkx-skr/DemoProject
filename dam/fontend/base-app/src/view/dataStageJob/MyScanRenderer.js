import vue from 'vue'
export default vue.extend({
  template: `
    <el-button type="text" size="mini" @click="scan">查看</el-button> 
  `,
  mounted() {},
  methods: {
    scan() {
      if (this.$parent.$parent.$parent) {
        this.$parent.$parent.$parent.scan(this.params)
      }
    },
  },
})
