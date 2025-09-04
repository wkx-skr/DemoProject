<template>
  <div class="udp-page">
    <udp-list
      ref="udpList"
      @addUdpTab=addUdpTab
      @showHistory="showHistory"
      :refreshUdpCategories="refreshUdpCategories"
      :valueTypeArr="valueTypeArr"
      :targetTypeArr="targetTypeArr"
      :dataByType="dataByType"
      @removeTab="removeTab"
      @closeDialog="$emit('closeDialog')"
      :Changes="Changes"
      :LayerEdit="LayerEdit"
      :graph="graph"
      v-if="udpCategoriesReady"
    ></udp-list>

    <div class="edit-container" v-if="currentTabData">
      <div class="top-line">
        <datablau-breadcrumb
          class="top-bread"
          :node-data="breadcrumbData"
          :couldClick=" false"
          @back="goBack"
        ></datablau-breadcrumb>
      </div>
      <div class="content-line">
        <edit-udp
          v-if="currentTabData.type === 'addUdp' || currentTabData.type === 'editUdp'"
          :valueTypeArr="valueTypeArr"
          :targetTypeArr="targetTypeArr"
          :orginData="currentTabData.orginData"
          :tabPageArr="tabPageArr"
          :udpObjArr="udpObjArr"
          :udpMap="udpMap"
          :defaultObjectType="defaultObjectType"
          @closeEditTab="removeTab(currentTabData.name)"
          @editSuccesed="editSuccesed(currentTabData.name)"
        ></edit-udp>
      </div>

    </div>
  </div>
</template>

<script>
import udp from './udp.js'
export default udp
</script>

<style scoped lang="scss">
@import '~@/assets/style/const.scss';

.udp-page {
  @include absPos();
}

$breadcrumb-height: 40px;

.edit-container {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  z-index: 1;

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

//.udp-page /deep/ {
//  .tab-with-table {
//    .datablau-tab-top-line {
//      right: 20px;
//    }
//
//      .tab-bottom-line {
//        right: 0;
//
//        .pagination-container {
//          padding-right: 0;
//          left: auto;
//        }
//
//        .left-btn-container {
//          left: 20px;
//        }
//      }
//    }
//  }
</style>
