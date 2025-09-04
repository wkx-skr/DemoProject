<template>
  <div class="column-details">
    <div class="content" v-show="!showLineage">
      <common-top
        ref="commonTop"
        @toLineage="toShowLineage"
        :objectId="objectId"
        :assetId="assetId"
        :catalogId="catalogId"
        objectType="column"
      ></common-top>
    </div>
    <div
      v-if="showLineage"
      style="
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 100%;
        background-color: #fff;
        z-index: 9999;
      "
    >
      <div
        class="head"
        style="height: 48px; display: flex; align-items: center; width: 100%"
      >
        <datablau-button
          type="text"
          class="iconfont icon-leftarrow"
          style="margin-left: 8px; color: #7c89a8"
          @click="goBack"
        >
          {{ $t('assets.marketplace.backText') }}
        </datablau-button>

        <span
          style="
            margin-left: 16px;
            font-size: 16px;
            font-weight: 500;
            width: calc(100% - 100px);
          "
        >
          {{ $t('assets.marketplace.lineageAnalysis') }}：
          <span style="display: inline-block; max-width: calc(100% - 100px)">
            <is-show-tooltip
              :content="name"
              style="height: 24px; display: flex"
            ></is-show-tooltip>
          </span>
        </span>
      </div>
      <lineage
        v-if="rawData && rawData.lines"
        :style="{ top: '48px' }"
        :raw-data="rawData"
        :options="options"
        :object-id="objectId"
      />
      <template v-else>
        <div style="padding-left: 20px; padding-right: 20px">
          <datablau-button type="info" @click="toShowLineage">
            {{ $t('assets.marketplace.parsingAgain') }}
          </datablau-button>
          <div
            style="
              width: 100%;
              background: rgb(247, 247, 247);
              padding: 20px;
              margin-top: 10px;
            "
          >
            {{ $t('assets.marketplace.noResult') }}
          </div>
        </div>
      </template>
    </div>
    <el-backtop
      target=".table-details .content"
      :bottom="10"
      :right="10"
      style="position: fixed"
    >
      <div class="to-top">
        <i class="iconfont icon-uparrow"></i>
      </div>
    </el-backtop>
  </div>
</template>

<script>
import Lineage from '@/next/components/basic/lineage/main/lineageGraph.vue'
import CommonTop from './commonTop.vue'
import api from '../../../utils/api'
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
export default {
  name: 'ColumnDetails',
  components: { CommonTop, Lineage, isShowTooltip },
  data() {
    return {
      objectId: '',
      assetId: '',
      catalogId: '',
      lineageObjectId: null,
      showLineage: false,
      rawData: {},
      options: {
        showColumn: true,
        showMiddleProcess: true,
        showQuestionCount: false,
      },
    }
  },
  beforeMount() {
    // console.log('objectId------', this.$route.query.objectId)
    this.objectId = this.$route.query.objectId
    this.assetId = this.$route.query.id
    this.catalogId = String(this.$route.query.catalogId)
    this.objectType = String(this.$$route.query.type)
  },
  mounted() {},
  methods: {
    toShowLineage(objectId) {
      // console.log(objectId)
      this.lineageObjectId = objectId
      api
        .getObjectLineageData({
          objectId: this.$route.query.objectId,
          type: 'column',
        })
        .then(res => {
          this.rawData = res.data
          this.showLineage = true
        })
    },
    goBack() {
      this.showLineage = false
    },
    pageBack() {
      if (this.$route.query.blank) {
        window.close()
      }
    },
  },
  computed: {
    name() {
      return this.$refs.commonTop.baseInfo.name || ''
    },
  },
}
</script>

<style lang="scss" scoped>
.column-details {
  width: 100%;
  height: 100%;
  background-color: #f7f8fb;
  .content {
    width: 100%;
    height: 100%;
    overflow: scroll;
    .breadcrumb {
      width: 100%;
      height: 40px;
    }
  }
}
.to-top {
  height: 40px;
  width: 40px;
  border-radius: 20px;
  background-color: #fff;
  box-shadow: 0px 4px 20px 0px rgba(67, 102, 225, 0.2);
  text-align: center;
  line-height: 40px;
  color: #3c64f0;
}
</style>
