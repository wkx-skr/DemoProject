<template>
  <div>
    <datablau-list-search style="margin: 0 20px">
      <datablau-input
        style="width: 180px"
        v-model="keyword"
        clearable
        :iconfont-state="true"
        :placeholder="'搜索名字'"
      ></datablau-input>
      <div
        v-if="dataSecurity"
        class="name"
        style="display: inline-block; margin-left: 20px"
      >
        数据源：
      </div>
      <datablau-input
        style="width: 180px"
        v-if="dataSecurity"
        v-model="modelName"
        clearable
        :placeholder="'搜索数据源'"
      ></datablau-input>
      <div
        class="name"
        style="display: inline-block; margin-left: 20px"
        v-if="isSecurity"
      >
        安全级别：
      </div>
      <datablau-select
        v-if="dataSecurity"
        v-model="accessLevelId"
        style="display: inline-block; width: 180px"
      >
        <el-option label="所有级别" :value="-1"></el-option>
        <el-option
          :key="val.id"
          :label="val.name"
          :value="val.name"
          v-for="val in levelOption"
        ></el-option>
      </datablau-select>
      <template slot="buttons" v-if="isSecurity">
        <datablau-button
          v-if="$auth['MAIN_CATALOG_MANAGE']"
          type="important"
          class="title-btn iconfont icon-menu-blsx"
          @click="skipBussCatelog"
        >
          目录管理
        </datablau-button>
      </template>
    </datablau-list-search>
    <div
      class="row-items"
      v-loading="loading"
      :class="!dataSecurity ? 'data-asset-item' : ''"
    >
      <datablau-form-submit>
        <div
          v-show="!loading && searchResult && searchResult.length === 0"
          style="
            position: absolute;
            left: calc(50% - 112px);
            top: calc(50% - 112px);
            height: 223px;
          "
        >
          <datablau-null :tip="'暂无结果'"></datablau-null>
        </div>
        <search-item
          v-for="(v, index) in searchResult"
          @itemClick="handleItemClick"
          @unbindTable="unbindTable"
          :expand="expand"
          :key="v.objectId + '' + v.id + index"
          :item="v"
          :writable="writable"
          :dataSecurity="dataSecurity"
        ></search-item>
        <template slot="buttons">
          <datablau-pagination
            style="float: right"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[20, 50, 100, 500]"
            :page-size="pageSize"
            :pager-count="5"
            layout="total,  sizes,prev, pager, next, jumper"
            :total="totalItems"
          ></datablau-pagination>
        </template>
      </datablau-form-submit>
    </div>
  </div>
</template>
<script>
import items from './businessItems'
export default items
</script>
<style scoped lang="scss">
/deep/ .row-content {
  > div {
    min-width: 1000px;
  }
}
.row-items {
  position: absolute;
  top: 44px;
  bottom: 0px;
  left: 20px;
  right: 20px;
  overflow: auto;
  &.data-asset-item {
    margin-top: 54px;
  }
}
</style>
