<template>
  <div
    class="top-base-info-page"
    :class="{ 'top-base-special': isLong, 'max-screen-top-base': maxL }"
    v-resize="domResize"
    ref="topBox"
  >
    <div class="left-part" ref="leftBox">
      <div class="datablauIcon">
        <!-- <datablau-icon
          class="iconBox"
          :data-type="objectType"
          :size="48"
        ></datablau-icon> -->
        <img
          v-if="catalogIcon.length"
          :src="catalogIcon"
          alt=""
          style="width: 48px; max-height: 48px"
        />
        <datablau-icon
          v-else
          class="iconBox"
          data-type="folder"
          :size="48"
        ></datablau-icon>
      </div>
      <div class="name-box" ref="nameBox">
        <div class="name">
          <is-show-tooltip
            :content="baseInfo.name"
            :refName="'name'"
          ></is-show-tooltip>
        </div>
        <div
          class="englishName"
          v-if="baseInfo.englishName"
          style="
            font-size: 12px;
            color: #555;
            max-width: 100px;
            display: inline-block;
          "
        >
          <is-show-tooltip
            :content="`（${baseInfo.englishName}）`"
            :refName="'englishName'"
          ></is-show-tooltip>
        </div>
        <i
          v-if="
            baseInfo.status !== 'PUBLISHED' &&
            baseInfo.status !== 'UNDER_REVIEW' &&
            editable
          "
          class="iconfont icon-bianji info-edit"
          :title="$t('assets.common.edit')"
          @click="editDir"
        ></i>
        <is-show-tooltip
          class="assets-type"
          :content="
            $t('assets.commonHead.catalogType') + '：' + baseInfo.catalogType
          "
          :refName="'catalogType'"
        ></is-show-tooltip>
      </div>
    </div>
    <div class="right-part" ref="rightBox">
      <ul>
        <li class="li-authentication">
          <p>{{ $t('assets.commonHead.releaseStatus') }}</p>
          <div
            class="li-intro"
            :class="baseInfo.status ? baseInfo.status.toLowerCase() : ''"
          >
            <img
              v-if="baseInfo.status === 'UNPUBLISHED'"
              src="/static/images/dataAssets/unpublish.svg"
              style="width: 18px"
              alt=""
            />
            <img
              v-if="baseInfo.status === 'PUBLISHED'"
              src="/static/images/dataAssets/published.svg"
              style="width: 18px"
              alt=""
            />
            <img
              v-if="baseInfo.status === 'UNDER_REVIEW'"
              src="/static/images/dataAssets/checking.svg"
              style="width: 18px"
              alt=""
            />
            <img
              v-if="baseInfo.status === 'OFFLINE'"
              src="/static/images/dataAssets/offline.svg"
              style="width: 18px"
              alt=""
            />
            <span>{{ formatPublishStatus(baseInfo.status) }}</span>
          </div>
        </li>
        <li class="li-progressed">
          <p>
            {{ $t('assets.commonHead.Integrity') }}
            <datablau-tooltip
              :content="
                $t('assets.generalSettings.completionAlgorithmText') +
                baseInfo.completeness
              "
              placement="top"
              effect="dark"
              style="display: inline-block"
            >
              <i class="iconfont icon-tips" style="font-size: 12px"></i>
            </datablau-tooltip>
          </p>
          <datablau-progressed
            :percent="baseInfo.percent"
          ></datablau-progressed>
        </li>
        <li class="li-score">
          <p>{{ $t('assets.commonHead.score') }}</p>
          <div class="partRight-box" style="margin-top: 7px">
            <datablau-rate
              :disabled="true"
              v-model="baseInfo.vote"
              :colors="baseInfo.scoreColors"
            ></datablau-rate>
          </div>
        </li>
        <li class="li-quality">
          <p>{{ $t('assets.commonHead.qualityProblem') }}</p>
          <div class="partRight-box">
            <span>{{ baseInfo.quality }}</span>
            <span class="span-company">{{ $t('assets.commonHead.ge') }}</span>
          </div>
        </li>
        <li class="li-visit">
          <p>{{ $t('assets.commonHead.visit') }}</p>
          <div class="partRight-box">
            <span>{{ baseInfo.visit }}</span>
            <span class="span-company">
              {{ $t('assets.commonHead.times') }}
            </span>
          </div>
        </li>
        <li class="li-collection">
          <p @click="toggleCollecStatus">
            {{
              baseInfo.hasCollected
                ? $t('assets.commonHead.collected')
                : $t('assets.commonHead.notCollected')
            }}
            <img
              v-if="baseInfo.hasCollected"
              src="static/images/meta/collectionTrue.svg"
              alt=""
            />
            <img v-else src="static/images/meta/collectionFalse.svg" alt="" />
          </p>
          <div class="partRight-box">
            <span>
              {{ baseInfo.favoriteCount ? baseInfo.favoriteCount : 0 }}
            </span>
            <span class="span-company">{{ $t('assets.commonHead.ci') }}</span>
          </div>
        </li>
        <li class="li-quote">
          <p>
            {{ $t('assets.commonHead.quote') }}
            <datablau-tooltip
              :content="$t('assets.commonHead.quoteText')"
              placement="bottom"
              effect="dark"
              style="display: inline-block"
            >
              <i class="iconfont icon-tips" style="font-size: 12px"></i>
            </datablau-tooltip>
          </p>
          <div class="partRight-box">
            <span>
              {{ baseInfo.quote ? baseInfo.quote : 0 }}
            </span>
            <span class="span-company">{{ $t('assets.commonHead.ci') }}</span>
          </div>
        </li>
        <li v-if="editable">
          <el-dropdown @command="handleCommand" trigger="click">
            <datablau-button type="normal">
              {{ $t('assets.commonHead.moreActions') }}
              <i
                class="el-icon-arrow-down el-icon--right"
                style="color: #409eff"
              ></i>
            </datablau-button>
            <el-dropdown-menu slot="dropdown" class="menu head-dropdown">
              <el-dropdown-item
                v-if="
                  baseInfo.level < baseInfo.maxLevel && baseInfo.addChildren
                "
                command="newCatalogue"
              >
                <i class="iconfont icon-tianjia"></i>
                {{ $t('assets.commonHead.newAssetCatalog') }}
              </el-dropdown-item>
              <!-- <el-dropdown-item command="assets">
                <i class="iconfont icon-tianjia"></i>
                同步资产清单
              </el-dropdown-item> -->
              <el-dropdown-item
                v-for="item in assetsTypeList"
                :key="item"
                :command="item"
              >
                <i class="iconfont icon-tianjia"></i>
                {{ $t(`assets.commonHead.add${item}`) }}
              </el-dropdown-item>
              <el-dropdown-item
                command="import"
                v-if="assetsTypeList && assetsTypeList.length"
              >
                <i class="iconfont icon-import"></i>
                {{ $t('assets.commonHead.importAssetCatalog') }}
              </el-dropdown-item>
              <el-dropdown-item
                command="export"
                v-if="assetsTypeList && assetsTypeList.length"
              >
                <i class="iconfont icon-export"></i>
                {{ $t('assets.commonHead.exportDataAssets') }}
              </el-dropdown-item>
              <el-dropdown-item
                v-if="baseInfo.status === 'PUBLISHED'"
                command="changeCatalogue"
              >
                <i class="icon iconfont icon-change"></i>
                {{ $t('assets.commonHead.changeAssetCatalog') }}
              </el-dropdown-item>
              <el-dropdown-item
                v-if="baseInfo.hasPermission && baseInfo.status === 'PUBLISHED'"
                command="offline"
              >
                <i class="iconfont icon-Offline"></i>
                {{ $t('assets.commonHead.offlineAssetCatalog') }}
              </el-dropdown-item>
              <el-dropdown-item
                v-if="
                  baseInfo.hasPermission &&
                  (baseInfo.status === 'UNPUBLISHED' ||
                    baseInfo.status === 'OFFLINE')
                "
                command="publish"
              >
                <i class="iconfont icon-publish"></i>
                {{ $t('assets.commonHead.publishAssetCatalog') }}
              </el-dropdown-item>
              <el-dropdown-item
                v-if="
                  baseInfo.hasPermission && baseInfo.status === 'UNDER_REVIEW'
                "
                command="process"
              >
                <i class="iconfont icon-see"></i>
                {{ $t('assets.commonHead.viewProgress') }}
              </el-dropdown-item>
              <!-- <el-dropdown-item command="extend">
                <i class="iconfont icon-expand"></i>
                {{ $t('assets.commonHead.extendedProperties') }}
              </el-dropdown-item> -->
            </el-dropdown-menu>
          </el-dropdown>
        </li>
        <li class="catalogue-attr" v-if="isoverView && !isShowDetail">
          <span @click="handleAttr(curManage)" v-if="getManage(curManage)">
            {{ getManage(curManage) }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import isShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
import api from '../utils/api'
export default {
  components: {
    isShowTooltip,
  },
  props: {
    clickNode: {
      type: Function,
    },
    curManage: {
      type: String,
      default: 'UN_AUTH',
    },
    editable: {
      type: Boolean,
      default: false,
    },
    baseInfo: {
      type: Object,
    },
    isoverView: {
      type: Boolean,
      default: false,
    },
    isShowDetail: {
      type: Boolean,
      default: false,
    },
    managerMap: {
      type: Object,
      default() {
        return {}
      },
    },
    selectedAttr: {
      type: Array,
      default() {
        return []
      },
    },
  },
  watch: {
    baseInfo: {
      handler(val) {
        this.assetsTypeList = []
        if (val.id) {
          val.manager = this.managerMap[val.id]
        }
        if (this.$featureMap.FE_META && val.assetsType) {
          if (
            val.assetsType.includes('DATA_COLLECTION') ||
            val.assetsType.includes('TABLE')
          ) {
            this.assetsTypeList = this.assetsTypeList.concat(['TABLE'])
          }
          const feMeatList = val.assetsType.filter(
            item =>
              item === 'VIEW' ||
              item === 'DATA_OBJECT' ||
              item === 'REPORT' ||
              item === 'FILE'
          )
          this.assetsTypeList = this.assetsTypeList.concat(feMeatList)
        }
        if (this.$featureMap.FE_MEASURE && val.assetsType) {
          const feMeasureList = val.assetsType.filter(item => item === 'INDEX')
          this.assetsTypeList = this.assetsTypeList.concat(feMeasureList)
        }
        if (this.$featureMap.FE_DOMAIN && val.assetsType) {
          const feDomainList = val.assetsType.filter(
            item =>
              item === 'DATA_STANDARD' ||
              item === 'DATA_STANDARD_CODE' ||
              item === 'DOMAIN'
          )
          this.assetsTypeList = this.assetsTypeList.concat(feDomainList)
        }
        if (this.$featureMap.FE_SERVICE && val.assetsType) {
          const feServiceList = val.assetsType.filter(
            item => item === 'DATA_SERVICE'
          )
          this.assetsTypeList = this.assetsTypeList.concat(feServiceList)
        }
        // 二期暂时都显示文件夹
        this.catalogIcon = val.icon
          ? window.setting.restApiPathName +
            '/service/ddc/config/icon/' +
            +val.icon
          : ''
      },
      immediate: true,
    },
  },
  data() {
    return {
      catalogIcon: '',
      isLong: false,
      topH: 0,
      maxL: true,
      assetsTypeList: [], // 当前用户有权限的资产类型
    }
  },
  mounted() {},
  methods: {
    getManage(manager) {
      let name = ''
      switch (manager) {
        case 'AUTH':
          name = this.$t('assets.assetList.properties')
          break
        case 'UN_AUTH':
          name = this.$t('assets.assetList.applyForPermission')
          break
        case 'UNDER_REVIEW':
          name = this.$t('assets.assetList.applying')
          break
        default:
          name = this.$t('assets.assetList.applyForPermission')
          break
      }
      return name
    },
    handleAttr(manager) {
      switch (manager) {
        case 'AUTH':
          this.clickNode('catalogueAttr', this.baseInfo)
          break
        case 'UN_AUTH':
          // 申请权限
          this.baseInfo.catalogId = this.baseInfo.id
          this.baseInfo.catalogApprover = this.baseInfo.approver
          this.baseInfo.assetsName = this.baseInfo.name
          this.clickNode('applyPower', this.baseInfo)
          break
        case 'UNDER_REVIEW':
          // 权限申请中
          this.$datablauMessage({
            message: this.$t('assets.assetList.powerTip'),
            type: 'info',
          })
          break
        default:
          break
      }
    },
    domResize() {
      const topBox = this.$refs.topBox
      const leftBox = this.$refs.leftBox
      const nameBox = this.$refs.nameBox
      const rightBox = this.$refs.rightBox
      const allW = $(topBox).width()
      const minW = 260
      const leftW = 240
      const rightW = $(rightBox).width()
      this.topH = $(topBox).innerHeight()
      this.clickNode('topH', { height: this.topH })
      if (allW > 1200) {
        this.maxL = true
      } else {
        this.maxL = false
      }
      if (leftW + rightW >= allW) {
        this.isLong = true
      } else {
        this.isLong = false
      }
      // if (allW - rightW > minW) {
      //   this.isLong = false
      //   $(leftBox).css('width', allW - rightW - 20 + 'px')
      // } else {
      //   this.isLong = true
      // }
    },
    toggleCollecStatus() {
      const hasCollected = this.baseInfo.hasCollected
      if (hasCollected) {
        api
          .discollectCatalog({
            structureId: this.baseInfo.structureId,
            catalogId: this.baseInfo.id,
            catalogName: this.baseInfo.name,
          })
          .then(res => {
            if (res.status === 200) {
              this.baseInfo.favoriteCount -= 1
            } else {
              this.$showFailure(res.errorMessage)
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        api
          .collectCatalog({
            structureId: this.baseInfo.structureId,
            catalogId: this.baseInfo.id,
            catalogName: this.baseInfo.name,
          })
          .then(res => {
            if (res.status === 200) {
              this.baseInfo.favoriteCount += 1
            } else {
              this.$showFailure(res.errorMessage)
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
      this.baseInfo.hasCollected = !hasCollected
    },
    handleCommand(command) {
      if (command === 'newCatalogue') {
        this.clickNode('catalogue', { type: 'add' })
      } else if (command === 'changeCatalogue') {
        this.clickNode('catalogue', {
          type: 'change',
        })
      } else {
        if (command === 'export') {
          this.clickNode(command, this.baseInfo)
        } else {
          this.clickNode(command)
        }
      }
    },
    editDir() {
      this.clickNode('catalogue', {
        type: 'edit',
        data: this.baseInfo,
      })
    },
    formatPublishStatus(status) {
      let statusText = ''
      switch (status) {
        case 'UNPUBLISHED':
          statusText = this.$t('assets.common.unpublishText')
          break
        case 'UNDER_REVIEW':
          statusText = this.$t('assets.common.reviewText')
          break
        case 'PUBLISHED':
          statusText = this.$t('assets.common.publishedText')
          break
        case 'OFFLINE':
          statusText = this.$t('assets.common.offlineText')
          break
      }
      return statusText
    },
  },
}
</script>
<style lang="scss">
.el-popover {
  text-align: center;
}
</style>
<style scoped lang="scss">
@import './color.scss';
.info-edit {
  margin-left: 10px;
  cursor: pointer;
  font-size: 14px;
  color: $primary-color;
  &:hover {
    color: $primary-color;
  }
}
.top-base-info-page {
  padding: 20px 0;
  position: relative;
  width: 100%;
  &.top-base-special {
    padding-bottom: 10px;
    .left-part {
      float: none;
      overflow: hidden;
      width: 500px;
      .name-box {
        width: 430px;
        .name {
          /deep/ .text-tooltip {
            max-width: 300px;
          }
        }
        .englishName {
          /deep/ .text-tooltip {
            max-width: 100px;
          }
        }
      }
    }
    .right-part {
      margin-top: 20px;
      float: left;
      transition: all 0.3s;
      opacity: 1;
      ul {
        li {
          &:first-child {
            padding-left: 0;
          }
          &:last-child {
            padding-right: 20px;
          }
        }
      }
    }
  }
  &.max-screen-top-base {
    .left-part {
      width: 350px;
      .name-box {
        width: 280px;
        .name {
          /deep/ .text-tooltip {
            max-width: 170px;
          }
        }
        .englishName {
          /deep/ .text-tooltip {
            max-width: 80px;
          }
        }
      }
    }
  }
  &.top-base-animation {
    .right-part {
      opacity: 0;
    }
  }
  &:after {
    content: '';
    clear: both;
    display: block;
  }
  .left-part {
    width: 240px;
    height: 48px;
    float: left;
    &:after {
      content: '';
      display: block;
      clear: both;
    }
    /deep/ .datablauIcon {
      float: left;
      height: 48px;
    }
    .name-box {
      float: left;
      margin-left: 16px;
      width: 176px;
      .name {
        line-height: 24px;
        color: #555555;
        font-size: 16px;
        font-weight: 500;
        display: inline-block;
        /deep/ .text-tooltip {
          max-width: 110px;
          vertical-align: middle;
          span {
            line-height: 24px;
          }
        }
      }
      .englishName {
        font-size: 12px;
        color: #555;
        /deep/ .text-tooltip {
          max-width: 40px;
          vertical-align: middle;
        }
      }
      .icon-bianji {
        vertical-align: middle;
        line-height: 24px;
      }
      .assets-type {
        font-size: 14px;
        line-height: 20px;
        color: #777;
        display: block;
      }
    }
  }
  .right-part {
    float: right;
    margin-top: 4px;
    height: 40px;
    // min-width: 850px;
    &:after {
      content: '';
      display: block;
      clear: both;
    }

    ul {
      li {
        float: left;
        position: relative;
        padding: 0 20px;
        &:after {
          content: '';
          position: absolute;
          height: 40px;
          width: 1px;
          background: #ddd;
          top: 0;
          right: 0px;
        }
        &:last-child {
          padding-right: 0;
          &:after {
            width: 0;
          }
        }
        &.li-authentication {
          .li-intro {
            width: 59px;
            height: auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 2px 2px 2px 0;
            // height: 14px;
            border-radius: 7px;
            &.published {
              color: #66bf16;
              background-color: rgba(102, 191, 22, 0.1);
            }
            &.checking {
              color: #409eff;
              background-color: rgba(64, 158, 255, 0.1);
            }
            &.unpublished {
              color: #5dc4c0;
              background-color: rgba(93, 196, 192, 0.1);
            }
            &.offline {
              color: #999;
              background-color: rgba(153, 153, 153, 0.1);
            }
            span {
              transform: scale(0.9);
            }
          }
        }
        &.li-progressed {
          /deep/ .el-progress {
            margin-top: 7px;
            .el-progress-bar {
              width: 100px;
              .el-progress-bar__outer {
                height: 6px !important;
              }
            }
            .el-progress__text {
              font-size: 12px !important;
            }
          }
        }
        &.li-collection {
          p {
            cursor: pointer;
            img {
              margin-left: 10px;
            }
          }
        }
        p {
          line-height: 14px;
          font-size: 12px;
          color: $text-default;
        }
        .li-intro {
          margin-top: 5px;

          img {
            display: block;
            width: 100%;
            height: auto;
          }
        }
        &.catalogue-attr {
          padding-top: 4px;
          span {
            height: 32px;
            line-height: 32px;
            padding: 0 10px;
            background: #409eff;
            border-radius: 2px;
            display: inline-block;
            color: #fff;
            cursor: pointer;
          }
        }
        .partRight-box {
          margin-top: 6px;
          span {
            font-size: 16px;
            color: $text-default;
            &.span-company {
              padding-left: 4px;
              font-size: 12px;
              color: $text-message;
            }
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
@import './color.scss';
.el-dropdown-menu__item {
  line-height: 30px;
  color: #555;
  &:hover {
    color: #409eff;
    i {
      color: #409eff;
    }
  }
  i {
    font-size: 14px;
    color: #999;
  }
}
.el-dropdown-menu.head-dropdown.menu {
  width: auto;
}
</style>
