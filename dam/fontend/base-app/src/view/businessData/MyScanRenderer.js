import vue from 'vue'
export default vue.extend({
  template: `
<div>
    <el-button type="text" size="mini" @click="scan" v-show="!params.data.model">移除</el-button> 
</div>
    
  `,
  mounted() {},
  methods: {
    scan() {
      this.$bus.$emit('unbindDamReference', this.params.data)
    },
  },
})
