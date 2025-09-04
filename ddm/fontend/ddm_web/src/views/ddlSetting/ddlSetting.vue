<template>
  <div class="ddl-setting">
    <db-board
      ref="dbList"
      class="list-com"
      @editDdlSetting="editDdlSetting"
    ></db-board>

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
        <edit-ddl-setting
          :dbType="currentTabData.name"
          v-if="currentTabData && currentTabData.name"
          @closeEditTab="goBack"
        ></edit-ddl-setting>
      </div>

    </div>
  </div>
</template>

<script>
import ddlSetting from './ddlSetting.js'

export default ddlSetting
</script>

<style scoped lang="scss">
@import '~@/assets/style/const.scss';

.ddl-setting, .list-com {
  @include absPos();
}

$breadcrumb-height: 40px;

.list-com {
  z-index: 1;
}

.ddl-setting {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  //z-index: 1;

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

  .edit-container {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    z-index: 2;

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
}

</style>
