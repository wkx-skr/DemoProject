<template>
  <div v-if="statisticsInfo">
    <div class="group">
      <datablau-detail-subtitle
        :title="$t('assets.summaryInfo.descriptionTitle')"
        mt="10px"
        mb="10px"
        class="title"
      ></datablau-detail-subtitle>
      <p class="content">
        <template v-if="statisticsInfo.descInfo">
          {{ statisticsInfo.descInfo }}
        </template>
        <template v-else>
          <img
            src="/static/images/dataAssets/noresult.svg"
            style="width: 42px"
            alt=""
          />
          <span style="font-size: 12px; color: #999999">
            {{ $t('assets.common.noInfo') }}
          </span>
        </template>
      </p>
    </div>
    <div class="group">
      <datablau-detail-subtitle
        :title="$t('assets.summaryInfo.dataAssets')"
        mt="10px"
        mb="10px"
        class="title"
      ></datablau-detail-subtitle>
      <div class="content" style="display: flex; flex-wrap: wrap">
        <template
          v-if="
            statisticsInfo.assetsStatisticsDtoList &&
            statisticsInfo.assetsStatisticsDtoList.filter(
              item => item.count !== 0
            ).length > 0
          "
        >
          <asset-card
            v-for="item in statisticsInfo.assetsStatisticsDtoList"
            :key="item.name"
            :assetData="item"
          ></asset-card>
        </template>
        <template v-else>
          <img
            src="/static/images/dataAssets/noresult.svg"
            style="width: 42px"
            alt=""
          />
          <span style="font-size: 12px; color: #999999; line-height: 42px">
            {{
              editable
                ? $t('assets.common.noAssetsInfo.manage')
                : $t('assets.common.noAssetsInfo.view')
            }}
          </span>
        </template>
      </div>
    </div>
    <div v-if="statisticsInfo.superior" class="group">
      <datablau-detail-subtitle
        :title="$t('assets.summaryInfo.parentTitle')"
        mt="10px"
        mb="10px"
        class="title"
      ></datablau-detail-subtitle>
      <div class="content" style="display: flex; flex-wrap: wrap">
        <dir-card
          v-bind="$attrs"
          :dirData="statisticsInfo.superior || {}"
        ></dir-card>
      </div>
    </div>
    <!-- 当前目录的目录类型含目录时才能展示下一级 -->
    <div
      v-if="
        (editable && statisticsInfo.canAddChildren) ||
        (statisticsInfo.subDirectory && statisticsInfo.subDirectory.totalPages)
      "
      class="group"
      style="margin-top: 0"
      v-loading="loading"
    >
      <datablau-detail-subtitle
        :title="$t('assets.summaryInfo.childrenTitle')"
        mt="10px"
        mb="10px"
        class="title"
      ></datablau-detail-subtitle>
      <div class="content" style="display: flex; flex-wrap: wrap">
        <template v-for="item in subCatalogs">
          <dir-card
            v-if="item"
            :key="item.id"
            v-bind="$attrs"
            :dirData="item"
          ></dir-card>
        </template>
        <dir-card
          v-if="editable && statisticsInfo.canAddChildren"
          :isAdd="true"
          @clickCard="addChild"
        ></dir-card>
      </div>
      <div style="text-align: center">
        <datablau-button
          v-if="subPagination.pageNum < subPagination.totalPages"
          type="text"
          @click="showMoreSub"
        >
          显示更多...
        </datablau-button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../utils/api'
import AssetCard from './assetCard.vue'
import DirCard from './dirCard.vue'
export default {
  name: 'statisticsInfo',
  props: {
    editable: { type: Boolean, default: true },
    clickNode: {
      type: Function,
      default: null,
    },
    statisticsInfo: {},
    currentNode: {},
    pageId: { type: Number, default: 0 },
  },
  components: { AssetCard, DirCard },
  data() {
    return {
      subCatalogs: [],
      subPagination: {
        total: 0,
        pageNum: 1,
        pageSize: 20,
        totalPages: 0,
      },
      loading: false,
    }
  },
  methods: {
    addChild() {
      this.clickNode('catalogue', { type: 'add' })
    },
    showMoreSub() {
      const currentPage = this.subPagination.pageNum
      this.loading = true
      api
        .getSubCatalogStatistics({
          catalogId: this.currentNode.id,
          status: this.pageId
            ? ['PUBLISHED']
            : ['PUBLISHED', 'UNPUBLISHED', 'OFFLINE', 'UNDER_REVIEW'],
          pageSize: 20,
          pageNum: currentPage + 1,
        })
        .then(res => {
          this.loading = false
          this.subCatalogs = this.subCatalogs.concat(res.data.data.content)
          this.subPagination.pageNum = currentPage + 1
        })
        .catch(error => {
          this.loading = false
          this.$blauShowFailure(error)
        })
    },
  },
  watch: {
    statisticsInfo: {
      handler() {
        this.subCatalogs = this.statisticsInfo.subDirectory
          ? this.statisticsInfo.subDirectory.data
          : []
        const totalPages = this.statisticsInfo.subDirectory
          ? this.statisticsInfo.subDirectory.totalPages
          : 0
        this.subPagination = {
          pageSize: 20,
          pageNum: 1,
          totalPages,
        }
      },
      deep: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.group {
  margin-top: 5px;
  margin-bottom: 5px;
  color: #555;
  .title {
    font-size: 13px;
    color: #555;
  }
  .content {
    padding: 0 10px;
  }
  .dir-add {
    width: 60px;
    height: 90px;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    &:hover {
      border: 1px solid #409eff;
    }
  }
}
</style>

<style>
.dir-add .el-card__body {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  /* border: 1px dashed; */
  width: 40px;
  height: 70px;
  border: 1px dashed #ddd;
  background: #f5f5f5;
}
</style>
