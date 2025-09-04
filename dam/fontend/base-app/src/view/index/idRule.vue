<template>
  <div>
    <el-form label-width="6em" label-position="right" size="small">
      <el-tabs v-model="currentTab">
        <el-tab-pane label="原子指标" name="baseCode">
          <el-form-item label="前缀">
            <el-input v-model="rule.basePrefix"></el-input>
          </el-form-item>
          <el-form-item label="后缀">
            <el-input v-model="rule.basePostfix"></el-input>
          </el-form-item>
          <el-form-item label="自增值位数">
            <el-input-number
              v-model="rule.baseLength"
              :min="4"
              :max="10"
            ></el-input-number>
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="指标" name="code">
          <el-form-item label="前缀">
            <el-input v-model="rule.prefix"></el-input>
          </el-form-item>
          <el-form-item label="后缀">
            <el-input v-model="rule.postfix"></el-input>
          </el-form-item>
          <el-form-item label="自增值位数">
            <el-input-number
              v-model="rule.length"
              :min="4"
              :max="10"
            ></el-input-number>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </div>
</template>
<script>
export default {
  mounted() {
    this.getData()
    this.$bus.$on('submitIdRule', this.postData)
  },
  beforeDestroy() {
    this.$bus.$off('submitIdRule')
  },
  data() {
    this.BASE_URL = this.$url + '/service/me/codes/pattern/'
    return {
      currentTab: 'baseCode',
      rule: {
        length: 5,
        postfix: '',
        prefix: '',
      },
    }
  },
  methods: {
    getData() {
      this.$http
        .get(this.BASE_URL)
        .then(res => {
          this.rule = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    postData() {
      this.$http
        .post(this.BASE_URL, this.rule)
        .then(res => {
          this.$emit('close')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
</script>
