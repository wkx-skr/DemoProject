<template>
    <div id="processControl">
        <div class="citic-card-tabs new-style">
            <el-tabs
              type="card"
              :class="{hideTab:!showTabs}"
              v-model="currentTab"
            >
                <el-tab-pane
                  label="流程中心"
                  name="processCenter"
                  :lazy='true'
                >
                <process-center>
                </process-center>
                </el-tab-pane>
                <el-tab-pane
                  label="表单中心"
                  name="formCenter"
                  :lazy='true'
                >
                <form-center>
                </form-center>
                </el-tab-pane>
                <el-tab-pane
                  label="流程监控"
                  name="allApply"
                  :lazy='true'
                >
                <all-apply>
                </all-apply>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>
<script>
import processCenter from './modelCenter.vue'
import formCenter from './formCenter.vue'
import allApply from './allApply.vue'

export default {
  components: { processCenter, formCenter, allApply },
  data () {
    return {
      currentTab: 'processCenter',
      showTabs: true
    }
  }
}
</script>
<style lang="scss" scoped>

</style>
<style lang="scss">
#processControl {
    .citic-card-tabs.new-style > .el-tabs {
        top: 0;
    }
}
</style>
