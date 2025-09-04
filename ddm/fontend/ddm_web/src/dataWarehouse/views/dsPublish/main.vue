<template>
  <div class="dsPublish-content">
      <datablau-tabs class="dsPublish-tabs"  v-model="activeName" @tab-click="handleClick">
        <el-tab-pane  label="调度环境配置" name="test" v-if="auth['DDD_DATAREPO_SCHEDULE']">
          <testPublish ref="testPublish"></testPublish>
        </el-tab-pane>
        <el-tab-pane label="数据库映射" name="dev" v-if="auth['DDD_DATAREPO_DATAMAPPING']">
          <devPublish ref="devPublish"></devPublish>
        </el-tab-pane>
      </datablau-tabs>
    </div>
</template>

<script>
import testPublish from './testPublish.vue'
import devPublish from './devPublish.vue'
export default {
  components: {
    testPublish,
    devPublish
  },
  data () {
    return {
      auth: this.$store.state.$auth,
      activeName: this.$store.state.$auth['DDD_DATAREPO_SCHEDULE'] ? 'test' : 'dev'
    }
  },
  mounted () {
  },
  methods: {
    handleClick () {
      if (this.activeName === 'test') {
        this.$refs.testPublish.getProjects()
      } else {
        this.$refs.devPublish.getProjects()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dsPublish-content{
    position: absolute;
    top: 0;
    left: 20px;
    right: 20px;
    bottom: 0;
    z-index: 4;
}
  </style>
<style lang="scss">
.dsPublish-tabs{
    .el-tabs__content{
        position: absolute;
        top: 0;
        left: 0px;
        right: 0px;
        bottom: 0;
    }
}
</style>
