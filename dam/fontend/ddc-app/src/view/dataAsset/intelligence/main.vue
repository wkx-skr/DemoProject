<template>
  <div class="intelligence-classification-page">
    <div class="tabs-box">
      <div class="tabs-content">
        <datablau-tabs
          v-model="currentTab"
          @tab-click="tabClick"
          :hasContent="false"
        >
          <el-tab-pane
            v-if="$auth.RECOMMEND_RESULT_MANAGE || $auth.RECOMMEND_RESULT_VIEW"
            :label="$t('intelligence.idResult')"
            name="third"
          >
            {{ $t('intelligence.idResult') }}
          </el-tab-pane>
          <el-tab-pane
            v-if="
              $auth.IDENTIFY_TASK_MANAGE ||
              $auth.IDENTIFY_TASK_CATALOG_VIEW ||
              $auth.IDENTIFY_TASK_CATALOG_MANAGE ||
              $auth.IDENTIFY_TASK_VIEW
            "
            :label="$t('intelligence.idTask')"
            name="second"
          >
            {{ $t('intelligence.idTask') }}
          </el-tab-pane>
          <el-tab-pane
            v-if="
              $auth.IDENTIFY_RULE_IMPORT ||
              $auth.IDENTIFY_RULE_VIEW ||
              $auth.IDENTIFY_RULE_CATALOG_VIEW ||
              $auth.IDENTIFY_RULE_MANAGE ||
              $auth.IDENTIFY_RULE_CATALOG_MANAGE ||
              $auth.IDENTIFY_RULE_EXPORT
            "
            :label="$t('intelligence.idRules')"
            name="first"
          >
            {{ $t('intelligence.idRules') }}
          </el-tab-pane>
        </datablau-tabs>
      </div>
    </div>
    <div class="classification-content">
      <div v-if="currentTab === 'first'">
        <rule-list :hasMachine="hasMachine"></rule-list>
      </div>
      <div v-if="currentTab === 'second'">
        <task-management :hasMachine="hasMachine"></task-management>
      </div>
      <div v-if="currentTab === 'third'">
        <identify-result></identify-result>
      </div>
    </div>
  </div>
</template>

<script>
import Main from './main.js'
export default Main
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.intelligence-classification-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  .tabs-box {
    padding: 0 10px;
    box-sizing: border-box;
    height: 44px;
    border-bottom: 1px solid #ddd;
    line-height: 44px;
    .tabs-content {
      float: left;
      /deep/ .datablau-tabs {
        .el-tabs {
          .el-tabs__header {
            .el-tabs__nav-wrap {
              &:after {
                background-color: transparent;
              }
              .el-tabs__item {
                height: 39px;
                font-size: 14px;
              }
            }
          }
        }
      }
    }
  }
  .classification-content {
    position: absolute;
    top: 44px;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>
