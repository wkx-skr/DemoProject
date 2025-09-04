<template>
  <div class="structure-list">
    <div class="top" style="float: left; width: 100%">
      <div style="float: left; display: flex; align-items: center">
        <p>{{ $t('assets.marketplace.structure') }}</p>
        <div class="str-names">
          <span v-for="(str, i) in structureList" :key="str.id">
            <span
              class="name"
              :style="{
                color:
                  currentStructure.name === str.name ? '#3C64F0' : '#7C89A8',
              }"
              @click="changeStructure(str)"
            >
              <is-show-tooltip :content="str.name"></is-show-tooltip>
            </span>

            <el-divider
              v-if="i < structureList.length - 1"
              direction="vertical"
            ></el-divider>
          </span>
        </div>
      </div>
      <datablau-button
        type="primary"
        class="more-btn"
        style="float: right"
        @click="toSupermarket({ sort: 'score' })"
      >
        {{ $t('assets.marketplace.moreText') }}
        <i class="iconfont icon-goto"></i>
      </datablau-button>
    </div>
    <div class="bottom">
      <datablau-skeleton :loading="loading" animated class="structure-skeleton">
        <div slot="template" class="catalog" v-for="i in 10" :key="i">
          <el-skeleton-item variant="h3" style="width: 80px" />
          <div class="catalog-desc">
            <el-skeleton-item variant="text" style="width: 200px" />
            <el-skeleton-item variant="text" style="width: 200px" />
            <el-skeleton-item variant="text" style="width: 100px" />
          </div>
          <div class="img"></div>
        </div>
        <template>
          <template v-if="catalogList.length">
            <div
              class="catalog"
              v-for="(catalog, i) in catalogList.length > 10
                ? catalogList.slice(0, 9)
                : catalogList"
              :key="catalog.catalogId"
              :class="['nth-' + (i % 5)]"
              @click="
                toSupermarket({
                  structure: currentStructure.id,
                  catalog: catalog.catalogId,
                })
              "
            >
              <p class="catalog-name">
                <is-show-tooltip
                  :content="catalog.catalogName"
                ></is-show-tooltip>
              </p>

              <el-tooltip
                v-if="catalog.description"
                :content="catalog.description"
                :disabled="
                  !(catalog.description && catalog.description.length > 40)
                "
              >
                <div class="catalog-desc">
                  {{
                    catalog.description && catalog.description.length > 40
                      ? catalog.description.slice(0, 38) + '...'
                      : catalog.description
                  }}
                </div>
              </el-tooltip>
              <span
                v-else
                class="catalog-desc"
                style="color: #7c89a8; margin-top: 6px; display: inline-block"
              >
                {{ $t('assets.marketplace.noDesc') }}
              </span>

              <div class="img"></div>
            </div>
            <div
              class="more-catalog"
              v-if="catalogList.length > 9"
              @click="
                toSupermarket({ structure: currentStructure.id, sort: 'score' })
              "
            >
              {{ $t('assets.marketplace.seeMore') }}
            </div>
          </template>
          <template v-else-if="!loading">
            <div
              style="
                width: 100%;
                height: 210px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background-color: #fff;
                margin-top: 16px;
              "
            >
              <img
                src="../../../../assets/images/dataAssets/portal/noData.png"
                alt=""
              />
              <span style="margin-top: 10px; color: #7c89a8">
                {{ $t('assets.marketplace.noCatalogs') }}
              </span>
              <br />
              <span style="color: #7c89a8">
                {{ $t('assets.marketplace.toNewStructure') }}
              </span>
            </div>
          </template>
        </template>
      </datablau-skeleton>
    </div>
  </div>
</template>

<script>
import IsShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
import api from '../../utils/api'
export default {
  name: 'StructureList',
  props: {},
  components: { IsShowTooltip },
  data() {
    return {
      currentStructure: null,
      catalogList: [],
      loading: true,
      structureList: [],
    }
  },
  mounted() {
    this.getStructureList()
  },
  methods: {
    getStructureList() {
      api.getCatalogInstructureList().then(res => {
        const structures = res.data.data || []
        this.structureList = structures.slice(0, 3).map(s => ({
          id: s.structureId,
          name: s.structureName,
        }))
        this.loading = false
      })
    },
    getCatalogList(structureId) {
      this.loading = true
      this.catalogList = []
      api.getCatalogList(1, structureId, 0).then(res => {
        this.loading = false
        const catalogs = res.data || []
        this.catalogList = catalogs.map(c => ({
          catalogId: c.id,
          catalogName: c.name,
          description: c.comment,
        }))
      })
    },
    goCatalgDetails(catalog) {},
    changeStructure(str) {
      this.currentStructure = str
    },
    toSupermarket(params) {
      this.$router.push({
        name: 'assetSupermarket',
        query: params,
      })
    },
  },
  watch: {
    structureList: {
      immediate: true,
      handler() {
        if (this.structureList && this.structureList.length) {
          this.currentStructure = this.structureList[0]
        }
      },
    },
    currentStructure: {
      handler() {
        this.getCatalogList(this.currentStructure.id)
      },
    },
  },
}
</script>

<style lang="scss" scoped>
.structure-list {
  width: 100%;
  height: 360px;
  margin-top: 40px;
  float: left;
  position: relative;
  .top {
    float: left;
    width: 100%;
    .str-names {
      margin-left: 16px;
      .name {
        display: inline-block;
        max-width: 140px;
        font-size: 14px;
        cursor: pointer;
        /deep/.text-tooltip .datablau-tooltip {
          float: left;
          margin-top: 4px;
        }
      }
      /deep/.el-divider--vertical {
        margin-top: -14px;
      }
    }
    p {
      font-size: 24px;
      color: #354f7b;
      font-weight: 600;
    }
    .more-btn {
      border-radius: 4px;
      background-color: transparent;
      border: none;
      float: right;
      height: 24px;
      line-height: 22.5px;
      color: #3c64f0;
      float: right;

      &:hover {
        background-color: rgba(60, 100, 240, 0.1);
      }
    }
  }
  .bottom {
    // float: left;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin-right: -8px;
    margin-left: -8px;

    .structure-skeleton {
      width: 100%;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      /deep/.el-skeleton {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
      }
    }

    .catalog {
      background-color: #f9faff;
      box-sizing: border-box;
      margin-left: 8px;
      margin-right: 8px;
      position: relative;
      width: 243px;
      height: 144px;
      border-radius: 8px;
      padding: 14px;
      margin-top: 16px;
      border: 2px solid #f9faff;
      transition: border 0.3s ease-in-out;
      cursor: pointer;

      .img {
        position: absolute;
        bottom: 0;
        right: 20px;
        width: 56px;
        height: 56px;
      }

      &.nth-0 {
        background: linear-gradient(180deg, #ecf1ff, #ffffff);
        .img {
          background: url(../../../../assets/images/dataAssets/portal/illustration.svg);
        }
      }
      &.nth-1 {
        background: linear-gradient(180deg, #ffecf0, #ffffff);
        .img {
          background: url(../../../../assets/images/dataAssets/portal/illustration2.svg);
        }
      }
      &.nth-2 {
        background: linear-gradient(180deg, #e4f6f7, #ffffff);
        .img {
          background: url(../../../../assets/images/dataAssets/portal/illustration3.svg);
        }
      }
      &.nth-3 {
        background: linear-gradient(180deg, #e4f6f7, #ffffff);
        .img {
          background: url(../../../../assets/images/dataAssets/portal/illustration4.svg);
        }
      }
      &.nth-4 {
        background: linear-gradient(180deg, #fff5ec, #ffffff);
        .img {
          background: url(../../../../assets/images/dataAssets/portal/illustration5.svg);
        }
      }

      .catalog-name {
        font-size: 16px;
        color: #354f7b;
      }

      .catalog-desc {
        margin-top: 6px;
        color: #7c89a8;
        font-size: 14px;
        word-break: break-all;
      }
      &:hover {
        border: 2px solid #3c64f0;
      }

      &.more {
        font-size: 16px;
        border: 1px solid #ebebf1;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #354f7b;
        &:hover {
          color: #3c64f0;
          border: 1px solid #3c64f0;
          background-color: rgba(60, 100, 240, 0.1);
        }
      }
    }
    .more {
      background-color: #f9faff;
      box-sizing: border-box;
      margin-left: 8px;
      margin-right: 8px;
      position: relative;
      width: 243px;
      height: 144px;
      border-radius: 8px;
      padding: 14px;
      margin-top: 16px;
      border: 2px solid #f9faff;
      transition: border 0.3s ease-in-out;
      cursor: pointer;
    }
  }
}
</style>
<style lang="scss">
.more-catalog {
  width: 243px;
  height: 144px;
  font-size: 16px;
  color: rgb(53, 79, 123);
  cursor: pointer;
  background-color: rgb(255, 255, 255);
  margin-top: 16px;
  margin-left: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  &:hover {
    background: rgba(60, 100, 240, 0.1);
    border: 2px solid #3c64f0;
    color: #3c64f0;
  }
}
</style>
