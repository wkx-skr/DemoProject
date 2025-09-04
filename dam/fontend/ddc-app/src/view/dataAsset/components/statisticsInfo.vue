<template>
  <div v-if="statisticsInfo">
    <div class="group">
      <datablau-detail-subtitle
        :title="$t('assets.summaryInfo.catalogCode')"
        mt="10px"
        mb="10px"
        class="title"
      ></datablau-detail-subtitle>
      <p class="content">
        <template v-if="!editingCode">
          <template v-if="statisticsInfo.catalogCode">
            <span class="code-icon">No.</span>
            <span class="code-value">
              <is-show-tooltip :content="statisticsInfo.catalogCode">
                <span>
                  {{ $t('assets.summaryInfo.code') }}：{{
                    statisticsInfo.catalogCode
                  }}
                </span>
              </is-show-tooltip>
            </span>
          </template>
          <span
            class="edit-icon"
            v-if="
              !statisticsInfo.autoCode &&
              editable &&
              (currentNode.status === 'UNPUBLISHED' ||
                currentNode.status === 'OFFLINE')
            "
            style=""
          >
            <i class="iconfont icon-bianji" @click="editCode"></i>
          </span>
          <span
            style="color: #999"
            v-if="
              !statisticsInfo.catalogCode &&
              (currentNode.status === 'PUBLISHED' ||
                currentNode.status === 'UNDER_REVIEW')
            "
          >
            {{ $t('assets.summaryInfo.noCatalogCode') }}
          </span>
        </template>

        <span v-if="editingCode">
          <datablau-input
            v-model="customCatalogCode"
            maxlength="70"
            :placeholder="$t('assets.summaryInfo.codePlaceholder')"
            clearable
          ></datablau-input>
          <datablau-button
            type="text"
            class="save"
            @click="saveCustomCatalogCode"
          >
            {{ $t('common.button.save') }}
          </datablau-button>
          <datablau-button type="text" class="cancel" @click="cancelEditCode">
            {{ $t('common.button.cancel') }}
          </datablau-button>
        </span>
      </p>
    </div>
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
            src="@/assets/images/dataAssets/noresult.svg"
            style="width: 42px"
            alt=""
          />
          <span style="font-size: 12px; color: #999999">
            {{ $t('assets.summaryInfo.noInfo') }}
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
            src="@/assets/images/dataAssets/noresult.svg"
            style="width: 42px"
            alt=""
          />
          <span style="font-size: 12px; color: #999999; line-height: 42px">
            {{ $t('assets.summaryInfo.noData') }}
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
        (subCatalogs && subCatalogs.length)
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
          {{ $t('assets.summaryInfo.showMore') }}
        </datablau-button>
      </div>
    </div>
  </div>
</template>

<script>
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
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
  components: { AssetCard, DirCard, isShowTooltip },
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
      editingCode: false,
      customCatalogCode: '',
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
          isManagement: !this.pageId, // 是否是管理页面
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
    editCode() {
      this.customCatalogCode = this.statisticsInfo.catalogCode
      this.editingCode = true
    },
    saveCustomCatalogCode() {
      // 调接口，保存目录编号
      api
        .updateCatalog({
          id: this.currentNode.id,
          name: this.currentNode.name,
          catalogTypeId: this.currentNode.catalogTypeId,
          englishName: this.currentNode.englishName,
          approver: this.currentNode.approver,
          bm: this.currentNode.bm,
          keyword: this.currentNode.keyword,
          comment: this.currentNode.comment,
          structureId: this.currentNode.structureId,
          parentId: this.currentNode.parentId,
          code: this.customCatalogCode,
        })
        .then(res => {
          if (res.status === 200) {
            this.$parent.$parent.updateDirBaseInfo()
            this.editingCode = false
          }
        })
        .catch(error => {
          this.$blauShowFailure(error)
        })
    },
    cancelEditCode() {
      this.customCatalogCode = this.statisticsInfo.catalogCode
      this.editingCode = false
    },
  },
  watch: {
    statisticsInfo: {
      handler() {
        this.customCatalogCode = this.statisticsInfo.catalogCode
        this.subCatalogs = this.statisticsInfo.subDirectory
          ? this.statisticsInfo.subDirectory.data
          : []
        // const totalPages = this.statisticsInfo.subDirectory
        //   ? this.statisticsInfo.subDirectory.totalPages
        //   : 0
        this.subPagination = {
          pageSize: 20,
          pageNum: 1,
          totalPages: 1,
        }
        this.editingCode = false
      },
      deep: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.group {
  clear: both;
  margin-top: 5px;
  margin-bottom: 5px;
  color: #555;
  .title {
    font-size: 13px;
    color: #555;
  }
  .content {
    padding: 0 10px;
    word-break: break-all;
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
  .code-icon {
    // display: inline-block;
    width: 24px;
    height: 24px;
    background-color: #6a6bec;
    border-radius: 2px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    float: left;
  }
  .code-value {
    // display: inline-block;
    height: 24px;
    padding-right: 8px;
    padding-left: 8px;
    line-height: 24px;
    color: #6a6bec;
    background-color: rgba(106, 107, 236, 0.1);
    border-radius: 2px;
    max-width: calc(100% - 50px);
    float: left;
  }
  .edit-icon {
    float: left;
    margin-left: 8px;
    color: #409eff;
    cursor: pointer;
    line-height: 24px;
  }
  .save {
    padding: 0 4px;
    margin-left: 4px;
  }
  .cancel {
    padding: 0 4px;
    color: #999;
    &:hover {
      background-color: #f5f5f5;
      color: #999;
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
