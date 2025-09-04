import Vue from 'vue'
export default Vue.extend({
  template: `
    <el-button type="text" size="mini" @click.stop="handleClick">操作</el-button>
    `,
  data() {
    return {
      value: null,
    }
  },
  methods: {
    handleClick() {
      console.log(this.params.data)
      this.$bus.$emit('')
    },
  },
  mounted() {
    this.value = this.params.value
  },
})
