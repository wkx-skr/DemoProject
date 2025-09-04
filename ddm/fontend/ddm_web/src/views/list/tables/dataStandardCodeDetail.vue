<template>
  <div :style="outerStyle" v-loading="loading">
    <div>
      <span class="label">代码编号：</span>
      <span>{{data.code}}</span>
    </div>
    <div>
      <span class="label">代码名称：</span>
      <span>{{data.name}}</span>
    </div><br>
    <el-table class="stripe-table" :data="data.values" :max-height="400" border>
      <el-table-column prop="value" sortable label="编码取值" show-overflow-tooltip></el-table-column>
      <el-table-column prop="name" sortable label="编码名称" show-overflow-tooltip></el-table-column>
      <el-table-column prop="definition" label="编码含义" show-overflow-tooltip></el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  props: ['code'],
  data () {
    return {
      outerStyle: {
        padding: '20px',
        minHeight: '60px'
      },
      name: '',
      loading: true,
      data: {}
    }
  },
  methods: {
    getData (code) {
      this.loading = true
      if (!code || this.data.code) {
        this.$nextTick(() => {
          this.loading = false
        })
        return
      }
      this.$http.get(this.$url + '/service/domains/codes/' + code).then(res => {
        this.loading = false
        this.data = res.data
      }).catch(e => {
        this.$showFailure(e)
        this.loading = false
      })
    }
  },
  mounted () {
    this.$bus.$on('callCodeDetail', code => {
      if (code === this.code) {
        this.getData(code)
      }
    })
  },
  beforeDestroy () {
    this.$bus.$off('callCodeDetail')
  }
}
</script>
<style lang="scss" scoped>
  .label {
    font-weight:bold;
  }
</style>
