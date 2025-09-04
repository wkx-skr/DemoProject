<template>
  <div class="modelRules-page">
    <!--<div class="tab-container" :class="{'hide-tab-top': !showTabs}" v-if="false">-->
    <!--  <div class="modelRules-card-tabs citic-card-tabs new-style">-->
    <!--    <el-tabs-->
    <!--      type="card"-->
    <!--      v-model="currentTab"-->
    <!--      @tab-remove="removeTab"-->
    <!--      class="detail-wrapper"-->
    <!--      :class="{'hide-tab':!showTabs, 'hideTab': !showTabs}"-->
    <!--    >-->
    <!--      <el-tab-pane :label="pageName" name="baseTab" :key="1">-->
    <!--        <modelRulesList-->
    <!--          ref="modelRulesList"-->
    <!--          @addModel="addModel"-->
    <!--          :databaseTypeListPromise="databaseTypeListPromise"-->
    <!--          :databaseTypeMap="databaseTypeMap"-->
    <!--        ></modelRulesList>-->
    <!--      </el-tab-pane>-->

    <!--      &lt;!&ndash; edit tab&ndash;&gt;-->
    <!--      <el-tab-pane-->
    <!--        v-for="item in tabsArr"-->
    <!--        :key="item.name"-->
    <!--        :label="item.label"-->
    <!--        :name="item.name"-->
    <!--        closable-->
    <!--      >-->
    <!--        <addModelRules-->
    <!--          :typeState="typeState"-->
    <!--          :rulesData="rulesData"-->
    <!--          @editSuccesed="editSuccesed(item.name)"-->
    <!--          :databaseTypeListPromise="databaseTypeListPromise"-->
    <!--          :databaseTypeMap="databaseTypeMap"-->
    <!--        ></addModelRules>-->
    <!--      </el-tab-pane>-->
    <!--    </el-tabs>-->
    <!--  </div>-->
    <!--</div>-->

    <modelRulesList
      ref="modelRulesList"
      @addModel="addModel"
      :databaseTypeListPromise="databaseTypeListPromise"
      :databaseTypeMap="databaseTypeMap"
    ></modelRulesList>

    <div class="edit-container" v-if="currentTab">
      <div class="top-line">
        <datablau-breadcrumb
          class="top-bread"
          :node-data="breadcrumbData"
          :couldClick=" false"
          @back="goBack"
        ></datablau-breadcrumb>
      </div>
      <div class="content-line">
        <addModelRules
          :typeState="typeState"
          :rulesData="rulesData"
          @editSuccesed="editSuccesed"
          :databaseTypeListPromise="databaseTypeListPromise"
          :databaseTypeMap="databaseTypeMap"
        ></addModelRules>
      </div>

    </div>
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>

<style scoped lang="scss">
@import '~@/assets/style/const.scss';

$breadcrumb-height: 40px;

.edit-container {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;

  .top-line {
    height: $breadcrumb-height;
    background-color: #fff;
    border-bottom: 1px solid #ebeef5;
    padding: 8px 0 0 20px;
  }

  .content-line {
    position: absolute;
    top: $breadcrumb-height;
    bottom: 0;
    left: 0;
    right: 0;
    border-top: none;
  }
}

//  .modelRules-page {
//    @include absPos();
//    .datablau-tabs /deep/ .el-tabs .el-tabs__item.is-closable {
//      position: relative;
//    height: 32px !important;
//    line-height: 32px !important;
//}
//    /deep/  .el-tabs__content {
//    position: absolute;
//    top: 32px;
//    bottom: 0;
//    left: 0;
//    right: 0;
//    border-top: none;
//}
//
//  }
</style>
