<template>
  <div class="data-dynamics">
    <p>{{ $t('assets.marketplace.dynamic') }}</p>
    <div class="theme-content">
      <div class="hot-catalogs">
        <div class="block-title">
          <div class="title-icon hot" style="">
            <img
              src="../../../../assets/images/dataAssets/portal/hot_catalogs.png"
              alt=""
              style="width: 24px"
            />
          </div>
          <span class="title-text">
            {{ $t('assets.marketplace.hotCatalog') }}
          </span>
          <datablau-button
            class="title-btn"
            v-if="hotCatalogs && hotCatalogs.length"
            @click="toMoreCatalog"
          >
            {{ $t('assets.marketplace.moreText') }}
            <i
              class="iconfont icon-goto"
              style="float: right; margin-top: 3px"
            ></i>
          </datablau-button>
        </div>
        <div class="block-content">
          <datablau-skeleton
            :loading="hotLoading"
            animated
            :count="4"
            style="height: 100%; display: flex"
          >
            <template slot="template">
              <div class="skeleton-item" style="display: flex">
                <div class="info">
                  <datablau-skeleton-item variant="h1" style="width: 60%" />
                  <div
                    style="
                      display: flex;
                      align-items: center;
                      margin-top: 6px;
                      line-height: 20px;
                    "
                  >
                    <datablau-skeleton-item variant="text" style="width: 45%" />
                    <datablau-skeleton-item
                      variant="text"
                      style="width: 45%; margin-left: 8px"
                    />
                  </div>
                </div>
                <el-divider
                  direction="vertical"
                  style="height: 100%"
                ></el-divider>
                <div class="info">
                  <datablau-skeleton-item variant="h1" style="width: 60%" />
                  <div
                    style="
                      display: flex;
                      align-items: center;
                      margin-top: 6px;
                      line-height: 20px;
                    "
                  >
                    <datablau-skeleton-item variant="text" style="width: 45%" />
                    <datablau-skeleton-item
                      variant="text"
                      style="width: 45%; margin-left: 8px"
                    />
                  </div>
                </div>
              </div>
            </template>
            <template>
              <template v-if="hotCatalogs && hotCatalogs.length">
                <div style="width: calc(50% - 8px); height: 100%">
                  <div
                    class="catalog"
                    v-for="catalog in hotCatalogs.slice(0, 4)"
                    :key="catalog.catalogId"
                    @click="goCatalgDetails(catalog)"
                  >
                    <div class="info">
                      <p class="name">
                        <is-show-tooltip
                          :content="catalog.catalogName"
                          style="
                            display: flex;
                            align-items: center;
                            width: calc(100% - 24px);
                            float: left;
                          "
                        ></is-show-tooltip>
                        <i
                          :class="['iconfont', catalog.auth ? '' : 'icon-lock']"
                          style="color: #ff7519"
                        ></i>
                      </p>
                      <div class="attrs">
                        <span class="dept">
                          <span style="display: inline-block">
                            {{ $t('assets.marketplace.ownerShip') }}：
                          </span>
                          <is-show-tooltip
                            :content="catalog.deptName"
                            style="width: calc(100% - 60px); float: right"
                          ></is-show-tooltip>
                        </span>
                        <span style="margin-left: 16px" class="statistics">
                          {{ $t('assets.marketplace.statistics') }}：{{
                            catalog.assetsNum
                          }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <el-divider
                  direction="vertical"
                  style="height: 100%"
                ></el-divider>
                <div style="width: calc(50% - 8px); height: 100%">
                  <div
                    class="catalog"
                    v-for="catalog in hotCatalogs.slice(4)"
                    :key="catalog.catalogId"
                    @click="goCatalgDetails(catalog)"
                  >
                    <div class="info">
                      <p class="name">
                        <is-show-tooltip
                          :content="catalog.catalogName"
                          style="
                            display: flex;
                            align-items: center;
                            width: calc(100% - 24px);
                            float: left;
                          "
                        ></is-show-tooltip>
                        <i
                          :class="['iconfont', catalog.auth ? '' : 'icon-lock']"
                          style="color: #ff7519"
                        ></i>
                      </p>
                      <div class="attrs">
                        <span class="dept">
                          <span style="display: inline-block">
                            {{ $t('assets.marketplace.ownerShip') }}：
                          </span>
                          <is-show-tooltip
                            :content="catalog.deptName"
                            style="width: calc(100% - 60px); float: right"
                          ></is-show-tooltip>
                        </span>
                        <span style="margin-left: 16px" class="statistics">
                          {{ $t('assets.marketplace.statistics') }}：{{
                            catalog.assetsNum
                          }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div
                  style="
                    width: 100%;
                    height: 210px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                  "
                >
                  <img
                    src="../../../../assets/images/dataAssets/portal/noData.png"
                    alt=""
                  />
                  <span style="margin-top: 10px; color: #7c89a8">
                    {{ $t('assets.marketplace.noData') }}
                  </span>
                </div>
              </template>
            </template>
          </datablau-skeleton>
        </div>
      </div>
      <div class="suggestions" style="margin-left: 16px">
        <div class="block-title">
          <div class="title-icon suggest" style="">
            <img
              src="../../../../assets/images/dataAssets/portal/suggest_data.png"
              alt=""
              style="width: 24px"
            />
          </div>
          <span class="title-text">
            {{ $t('assets.marketplace.recommend') }}
          </span>
          <datablau-button
            class="title-btn"
            v-if="suggestData && suggestData.length"
            @click="toMoreAssets"
          >
            {{ $t('assets.marketplace.moreText') }}
            <i
              class="iconfont icon-goto"
              style="float: right; margin-top: 3px"
            ></i>
          </datablau-button>
        </div>
        <div class="block-content">
          <datablau-skeleton
            :loading="suggestLoading"
            animated
            :count="4"
            style="height: 100%; display: flex"
          >
            <template slot="template">
              <div class="skeleton-item" style="display: flex">
                <div class="info">
                  <datablau-skeleton-item variant="h1" style="width: 60%" />
                  <div
                    style="
                      display: flex;
                      align-items: center;
                      margin-top: 6px;
                      line-height: 20px;
                    "
                  >
                    <datablau-skeleton-item variant="text" style="width: 45%" />
                    <datablau-skeleton-item
                      variant="text"
                      style="width: 45%; margin-left: 8px"
                    />
                  </div>
                </div>
                <el-divider
                  direction="vertical"
                  style="height: 100%"
                ></el-divider>
                <div class="info">
                  <datablau-skeleton-item variant="h1" style="width: 60%" />
                  <div
                    style="
                      display: flex;
                      align-items: center;
                      margin-top: 6px;
                      line-height: 20px;
                    "
                  >
                    <datablau-skeleton-item variant="text" style="width: 45%" />
                    <datablau-skeleton-item
                      variant="text"
                      style="width: 45%; margin-left: 8px"
                    />
                  </div>
                </div>
              </div>
            </template>
            <template>
              <template v-if="suggestData && suggestData.length">
                <div style="width: calc(50% - 8px); height: 100%">
                  <div
                    class="asset"
                    v-for="asset in suggestData.slice(0, 4)"
                    :key="asset.assetsId"
                    @click="goAssetDetails(asset)"
                  >
                    <div class="info">
                      <p class="name">
                        <is-show-tooltip
                          :content="
                            asset.type === 'FILE' || asset.type === 'REPORT'
                              ? asset.assetCnName || '--'
                              : `${
                                  asset.assetCnName
                                    ? asset.assetCnName +
                                      '(' +
                                      asset.assetName +
                                      ')'
                                    : asset.assetName
                                }` || '--'
                          "
                          style="
                            display: flex;
                            align-items: center;
                            width: calc(100% - 24px);
                            float: left;
                          "
                        ></is-show-tooltip>
                        <i
                          :class="['iconfont', asset.auth ? '' : 'icon-lock']"
                          style="color: #ff7519"
                        ></i>
                      </p>
                      <div class="attrs">
                        <span class="type" :class="[asset.type.toLowerCase()]">
                          <!-- {{ assetTypeMap(asset.type) }} -->
                          <datablau-icon
                            :data-type="assetTypeMap(asset.type, asset)"
                            icon-type="svg"
                            :size="14"
                          ></datablau-icon>
                        </span>
                        <span class="dept" style="width: calc(50% - 32px)">
                          <span style="display: inline-block">
                            {{ $t('assets.marketplace.ownerShip') }}：
                          </span>
                          <is-show-tooltip
                            :content="asset.deptName"
                            style="width: calc(100% - 60px); float: right"
                          ></is-show-tooltip>
                        </span>
                        <span style="margin-left: 16px">
                          <template v-if="asset.type === 'CATALOG'">
                            {{ $t('assets.marketplace.statistics') }}：{{
                              asset.assetsNum
                            }}
                          </template>
                          <template
                            v-if="
                              asset.type === 'TABLE' || asset.type === 'VIEW'
                            "
                          >
                            {{ $t('assets.marketplace.columnStatistics') }}：{{
                              asset.columnNum
                            }}
                          </template>
                          <template
                            v-if="
                              asset.type === 'FILE' ||
                              asset.type === 'OBJECT' ||
                              asset.type === 'DATA_OBJECT'
                            "
                          >
                            {{ $t('assets.marketplace.modifyTime') }}：{{
                              asset.updateTime
                            }}
                          </template>
                          <template v-if="asset.type === 'REPORT'">
                            {{ $t('assets.marketplace.itemStatistics') }}：{{
                              asset.columnNum
                            }}
                          </template>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <el-divider
                  direction="vertical"
                  style="height: 100%"
                ></el-divider>
                <div style="width: calc(50% - 8px); height: 100%">
                  <div
                    class="asset"
                    v-for="asset in suggestData.slice(4)"
                    :key="asset.assetsId"
                    @click="goAssetDetails(asset)"
                  >
                    <div class="info">
                      <p class="name">
                        <is-show-tooltip
                          :content="
                            asset.type === 'FILE' || asset.type === 'REPORT'
                              ? asset.assetCnName || '--'
                              : `${
                                  asset.assetCnName
                                    ? asset.assetCnName +
                                      '(' +
                                      asset.assetName +
                                      ')'
                                    : asset.assetName
                                }` || '--'
                          "
                          style="
                            display: flex;
                            align-items: center;
                            width: calc(100% - 24px);
                            float: left;
                          "
                        ></is-show-tooltip>
                        <i
                          :class="['iconfont', asset.auth ? '' : 'icon-lock']"
                          style="color: #ff7519"
                        ></i>
                      </p>
                      <div class="attrs">
                        <span class="type" :class="[asset.type.toLowerCase()]">
                          <!-- {{ assetTypeMap(asset.type) }} -->
                          <datablau-icon
                            :data-type="assetTypeMap(asset.type, asset)"
                            icon-type="svg"
                            :size="14"
                          ></datablau-icon>
                        </span>
                        <span class="dept" style="width: calc(50% - 32px)">
                          <span style="display: inline-block">
                            {{ $t('assets.marketplace.ownerShip') }}：
                          </span>
                          <is-show-tooltip
                            :content="asset.deptName"
                            style="width: calc(100% - 60px); float: right"
                          ></is-show-tooltip>
                        </span>
                        <span
                          v-if="asset.type === 'CATALOG'"
                          style="margin-left: 12px; line-height: 20px"
                        >
                          {{ $t('assets.marketplace.statistics') }}：{{
                            asset.assetsNum
                          }}
                        </span>
                        <span
                          v-if="asset.type === 'TABLE' || asset.type === 'VIEW'"
                          style="margin-left: 12px; line-height: 20px"
                        >
                          {{ $t('assets.marketplace.columnStatistics') }}：{{
                            asset.columnNum
                          }}
                        </span>
                        <span
                          v-if="
                            asset.type === 'FILE' ||
                            asset.type === 'OBJECT' ||
                            asset.type === 'DATA_OBJECT'
                          "
                          style="margin-left: 12px; line-height: 20px"
                        >
                          {{ $t('assets.marketplace.modifyTime') }}：{{
                            asset.updateTime
                          }}
                        </span>
                        <span
                          v-if="asset.type === 'REPORT'"
                          style="margin-left: 12px; line-height: 20px"
                        >
                          {{ $t('assets.marketplace.itemStatistics') }}：{{
                            asset.columnNum
                          }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div
                  style="
                    width: 100%;
                    height: 210px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                  "
                >
                  <img
                    src="../../../../assets/images/dataAssets/portal/noData.png"
                    alt=""
                  />
                  <span style="margin-top: 10px; color: #7c89a8">
                    {{ $t('assets.marketplace.noData') }}
                  </span>
                </div>
              </template>
            </template>
          </datablau-skeleton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import IsShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
import api from '../../utils/api'
export default {
  name: 'DataDynamics',
  props: {},
  components: { IsShowTooltip },
  data() {
    return {
      newsLoading: true,
      hotLoading: true,
      suggestLoading: true,
      hotCatalogs: [],
      suggestData: [],
      newsData: [],
    }
  },
  mounted() {
    this.getNews()
    this.getHotCatalogs()
    this.getSuggestData()
  },
  methods: {
    toMoreCatalog() {
      console.log('more')
      this.$router.push({
        name: 'assetSupermarket',
        query: {
          types: 'CATALOG',
          sort: 'visitCount',
        },
      })
    },
    toMoreAssets() {
      this.$router.push({
        name: 'assetSupermarket',
        query: {
          sort: 'visitCount',
        },
      })
    },
    getImgUrl(id) {
      let url = ''
      url = `${this.$base_url}/files/download?fileId=${id}`
      return url
    },
    getNews() {
      api.getNews().then(res => {
        this.newsData = res.data.data
        // this.newsData = []
        this.newsLoading = false
      })
    },
    getHotCatalogs() {
      api.getHotCatalogs().then(res => {
        if (res.status === 200) {
          this.hotLoading = false
          const hotCatalogs = (res.data.data || []).slice(0, 8)
          this.hotCatalogs = hotCatalogs.map(catalog => {
            return {
              auth: catalog.auth,
              catalogId: catalog.catalogId,
              structureId: catalog.catalogStructureId,
              catalogName: catalog.catalogName,
              deptName: catalog.deptName,
              assetsNum: catalog.assetCount,
            }
          })
        }
      })
    },
    getSuggestData() {
      api
        .getSuggestData()
        .then(res => {
          if (res.status === 200) {
            this.suggestLoading = false
            const suggestions = (res.data.data || []).slice(0, 8)
            this.suggestData = suggestions.map(suggest => {
              return {
                auth: suggest.auth,
                logical: suggest.logical || suggest.isLogical,
                assetCnName: suggest.assetCnName,
                assetsId: suggest.assetId,
                objectId: suggest.itemId || suggest.objectId,
                assetName: suggest.assetName,
                type: suggest.assetType,
                deptName: suggest.deptName,
                assetsNum: suggest.assetsNum,
                columnNum: suggest.assetCount,
                updateTime: suggest.lastModifyTime
                  ? this.$timeFormatter(
                      new Date(suggest.lastModifyTime).getTime(),
                      'MM-DD hh:mm'
                    )
                  : '',
                catalogId: suggest.catalogId,
                fileType: suggest.fileType,
              }
            })
          } else {
            this.suggestLoading = false
            this.suggestData = []
            this.$blauShowFailure(res)
          }
        })
        .catch(error => {
          this.suggestLoading = false
          this.suggestData = []
          this.$blauShowFailure(error)
        })
    },
    goNewsDetails(item) {
      // console.log(item)
      window.open(
        window.location.href.split('#')[0] +
          '#/main/dataAsset/news?id=' +
          item.id
      )
    },
    goCatalgDetails(catalog) {
      if (catalog.auth) {
        console.log(catalog)
        const url = this.BaseUtils.RouterUtils.getFullUrl('catalogDetails', {
          structureId: catalog.structureId,
          id: catalog.catalogId,
          blank: true,
        })
        window.open(url)
      } else {
        this.$blauShowFailure(this.$t('assets.marketplace.noCatalogAuth'))
      }
    },
    async goAssetDetails(asset) {
      if (asset.auth) {
        let url = ''
        switch (asset.type) {
          case 'FILE':
            url = this.BaseUtils.RouterUtils.getFullUrl('fileDetails', {
              objectId: asset.objectId,
              catalogId: asset.catalogId,
              id: asset.assetsId,
              blank: true,
            })
            break
          case 'REPORT':
            url = this.BaseUtils.RouterUtils.getFullUrl('reportDetails', {
              objectId: asset.objectId,
              catalogId: asset.catalogId,
              id: asset.assetsId,
              blank: true,
            })
            break
          case 'TABLE':
            url = this.BaseUtils.RouterUtils.getFullUrl('tableDetails', {
              objectId: asset.objectId,
              catalogId: asset.catalogId,
              id: asset.assetsId,
              type: 'table',
              blank: true,
              from: 'market',
            })
            break
          case 'VIEW':
            url = this.BaseUtils.RouterUtils.getFullUrl('viewDetails', {
              objectId: asset.objectId,
              catalogId: asset.catalogId,
              id: asset.assetsId,
              type: 'view',
              blank: true,
              from: 'market',
            })
            break
          case 'DATA_OBJECT':
            url = this.BaseUtils.RouterUtils.getFullUrl('columnDetails', {
              objectId: asset.objectId,
              catalogId: asset.catalogId,
              id: asset.assetsId,
              blank: true,
            })
            break
          case 'DATA_STANDARD':
            url = this.BaseUtils.RouterUtils.getFullUrl('dataStandard', {
              domainId: asset.objectId,
              blank: true,
              isAssets: true,
            })
            break
          case 'INDEX':
            let nameRouter = await this.getName(asset)
            url = this.BaseUtils.RouterUtils.getFullUrl(nameRouter, {
              domainId: asset.objectId,
              id: asset.objectId,
              blank: true,
              isAssets: true,
            })
            break
          case 'DATA_STANDARD_CODE':
            url = this.BaseUtils.RouterUtils.getFullUrl('code', {
              code: asset.objectId,
              blank: true,
              isAssets: true,
            })
            break
        }
        if (
          asset.type === 'DATA_STANDARD' ||
          asset.type === 'DATA_STANDARD_CODE' ||
          asset.type === 'INDEX'
        ) {
          api.toVisitAsset({
            catalogId: asset.catalogId,
            assetType: asset.type,
            itemId: asset.objectId,
            assetId: asset.assetsId,
          })
        }
        window.open(url)
      } else {
        this.$blauShowFailure(this.$t('assets.marketplace.noAssetsAuth'))
      }
    },
    async getName(row) {
      let metric = localStorage.getItem('allServers')
        ? JSON.parse(localStorage.getItem('allServers')).includes('METRIC')
        : false
      let name = 'index'
      if (metric) {
        await api
          .getDomainById({ domainId: row.objectId })
          .then(res => {
            name =
              res.data.categoryId === 5
                ? 'indexDefinitionNew'
                : 'forkIndexDefinitionNew'
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
      return name
    },
    assetTypeMap(type, asset) {
      // console.log(asset)
      switch (type) {
        case 'CATALOG':
          return this.$t('assets.marketplace.catalog')
        case 'TABLE':
          return asset.logical || asset.isLogical ? 'logicaltable' : 'table'
        case 'VIEW':
          return 'view'
        case 'FILE':
          return asset.fileType
            ? this.$fileTypeFormatter(asset.fileType)
            : 'file'

        case 'REPORT':
          return 'report'
        case 'OBJECT':
        case 'DATA_OBJECT':
          return asset.logical || asset.isLogical ? 'logicalcolumn' : 'COLUMN'
        case 'DATA_STANDARD':
          return 'datastandard'
        case 'DATA_STANDARD_CODE':
          return 'daima'
        case 'INDEX':
          return 'index'
        default:
          return ''
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.data-dynamics {
  width: 100%;
  height: 370px;
  float: left;
  position: relative;

  p {
    font-size: 24px;
    color: #354f7b;
    font-weight: 600;
  }
  .theme-content {
    margin-top: 16px;
    .news {
      width: 416px;
      height: 288px;
      background: linear-gradient(135deg, #c0ceff 2%, #2f51c7 99%);
      border-radius: 8px;
      float: left;
      &:hover {
        background: rgba(21, 42, 77, 0.6);
      }

      /deep/.el-carousel__item {
        padding: 0;
        margin: 0;
        width: 416px;
        height: 288px;
        border-radius: 8px;
        cursor: pointer;

        &.no-data {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 24px;
          .mask {
            background: rgba(15, 23, 97, 0.8);
          }
        }

        .mask {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          // z-index: 99;
          background: rgba(15, 23, 97, 0.4);
        }
        .news-title {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 110px;
          font-size: 22px;
          color: #fff;
          padding-left: 24px;
          padding-right: 24px;
        }

        img {
          position: absolute;
          top: 0;
          left: 0;
          height: 288px;
          width: 416px;
        }
        &:hover {
          .mask {
            background: rgba(15, 23, 97, 0.6);
          }
        }
      }
      /deep/.el-carousel__container {
        height: 288px;
      }
    }

    .hot-catalogs,
    .suggestions {
      width: calc(50% - 8px);
      height: 320px;
      background-color: #fff;
      border-radius: 8px;
      float: left;
      transition: all 0.5s ease-out;
      padding: 16px;
      &:hover {
        box-shadow: 0px 2px 14px 0px rgba(118, 174, 231, 0.15);
      }

      .block-title {
        height: 24px;
        .title-icon {
          float: left;
          width: 24px;
          height: 24px;
          border-radius: 8px;
          box-shadow: 0px 4px 6px 0px rgba(60, 100, 240, 0.3);
          text-align: center;
          // &.suggest {
          //   background-color: rgba(3, 195, 196, 0.1);
          // }
        }
        .title-text {
          font-size: 16px;
          font-weight: 600;
          color: #354f7b;
          line-height: 24px;
          margin-left: 8px;
          float: left;
        }
        .title-btn {
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
      .block-content {
        height: calc(100% - 24px);
        .skeleton-item,
        .catalog,
        .asset {
          float: left;
          cursor: pointer;
          width: 100%;
          &:hover {
            .info .name {
              color: #3c64f0;
            }
          }
          .dot {
            float: left;
            margin-top: 15px;
            width: 4px;
            height: 4px;
            border-radius: 2px;
            background-color: #d6dcea;
          }
          .info {
            float: left;
            width: 100%;
            margin-top: 10px;
            :first {
              margin-top: 0;
            }
            .name {
              font-size: 16px;
              color: #354f7b;
              line-height: 34px;
            }
            .attrs {
              font-size: 12px;
              color: #7c89a8;
              line-height: 16px;
              margin-top: 2px;
              display: flex;
              width: 100%;

              .type {
                width: 20px;
                height: 20px;
                text-align: center;
                display: inline-block;
                margin-right: 8px;
                border-radius: 4px;
                line-height: 20px;
                padding: 3px;
                margin-top: -2px;
                &.catalog {
                  margin-top: 0;
                  background-color: rgba(136, 128, 132, 0.1);
                  color: #888084;
                }
                &.table {
                  background-color: rgba(0, 149, 217, 0.1);
                  color: #0095d9;
                }
                &.view {
                  background-color: rgba(75, 92, 196, 0.1);
                  color: #4b5cc4;
                }
                &.file {
                  background-color: rgba(60, 100, 240, 0.1);
                  color: #3c64f0;
                }
                &.report {
                  background-color: rgba(86, 167, 178, 0.1);
                  color: #56a7b2;
                }
                &.object {
                  background-color: rgba(180, 76, 151, 0.1);
                  color: #b44c97;
                }
              }
              .dept {
                display: inline-block;
                width: calc(50% - 8px);
              }
            }
          }
        }

        .skeleton-item {
          padding-top: 5px;
          padding-bottom: 5px;
        }
        /deep/.el-divider--vertical {
          height: 100%;
          background-color: #e6eaf2;
          margin: 0 15px;
        }
      }
    }
  }
  .noData {
    display: none;
  }
}
</style>
