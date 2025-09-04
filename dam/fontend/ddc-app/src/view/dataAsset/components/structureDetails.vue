<template>
  <div class="structure-details">
    <datablau-dialog
      :visible.sync="extendDialogVisible"
      :title="$t('assets.directoryStructure.extendAttr')"
      size="s"
    >
      <template v-if="extendProps.length">
        <div v-for="udp in extendProps" :key="udp.propName" class="udp-item">
          <img
            src="@/assets/images/dataAssets/udp.svg"
            alt=""
            height="24px"
            width="auto"
          />
          <span class="udp-name">{{ udp.propName }}</span>
          <span class="udp-type">{{ udpTypeMap[udp.type] }}</span>
          <span v-if="udp.type === 'ENUM'" class="udp-options">
            {{ udp.typeDataList.join(';') }}
          </span>
        </div>
      </template>
      <template v-else>
        <datablau-null
          :tip="$t('assets.directoryStructure.noExtendAttr')"
          style="width: 160px; margin-left: calc(50% - 80px)"
        ></datablau-null>
      </template>
      <span slot="footer">
        <datablau-button type="secondary" @click="extendDialogVisible = false">
          {{ $t('common.button.close') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <div class="content-top" v-if="structureInfo.id">
      <span class="icon iconfont icon-menu-ztml structure-img"></span>
      <div class="base-info">
        <p class="structure-name">
          <is-show-tooltip :content="structureInfo.name"></is-show-tooltip>
        </p>
        <p class="structure-attr">
          <span class="attr-list">
            <is-show-tooltip
              :content="
                structureInfo.creator
                  ? `${structureInfo.creatorDto.fullUserName}（${structureInfo.creatorDto.username}）`
                  : $t('assets.directoryStructure.system')
              "
            >
              <span>
                {{ $t('assets.directoryStructure.createdBy') }}：{{
                  structureInfo.creator
                    ? `${structureInfo.creatorDto.fullUserName}（${structureInfo.creatorDto.username}）`
                    : $t('assets.directoryStructure.system')
                }}
              </span>
            </is-show-tooltip>
          </span>
          <span class="attr-list">
            <is-show-tooltip :content="structureInfo.createTime">
              <span>
                {{ $t('assets.directoryStructure.createdTime') }}：{{
                  structureInfo.createTime
                }}
              </span>
            </is-show-tooltip>
          </span>
          <span class="attr-list">
            <is-show-tooltip
              :content="`${structureInfo.approverDto.fullUserName}（${structureInfo.approverDto.username}）`"
            >
              <span>
                {{ $t('assets.directoryStructure.approval') }}：{{
                  `${structureInfo.approverDto.fullUserName}（${structureInfo.approverDto.username}）`
                }}
              </span>
            </is-show-tooltip>
          </span>
          <span class="attr-list" v-if="structureInfo.structureManagerDto">
            <is-show-tooltip
              :content="
                structureInfo.structureManagerDto
                  .map(manager => `${manager.firstName}（${manager.username}）`)
                  .join('，')
              "
            >
              <span>
                {{ $t('assets.directoryStructure.directoryManager') }}：{{
                  structureInfo.structureManagerDto
                    .map(
                      manager => `${manager.firstName}（${manager.username}）`
                    )
                    .join('，')
                }}
              </span>
            </is-show-tooltip>
          </span>
        </p>
      </div>
      <div class="new-catalog" v-if="isManager">
        <datablau-button
          type="important"
          class="el-icon-circle-plus-outline"
          @click="addNewCatalog"
        >
          {{ $t('assets.directoryStructure.newAssetCatalog') }}
        </datablau-button>
      </div>
      <div class="asset-process">
        <p>{{ $t('assets.directoryStructure.dataAsset') }}</p>
        <div
          class="process-status"
          :class="{ open: structureInfo.assetsStraightPublish }"
        >
          {{
            structureInfo.assetsStraightPublish
              ? $t('assets.directoryStructure.open')
              : $t('assets.directoryStructure.disable')
          }}
        </div>
      </div>

      <div class="catalog-process">
        <p>{{ $t('assets.directoryStructure.approvalProcess') }}</p>
        <div
          class="process-status"
          :class="{ open: structureInfo.catalogStraightPublish }"
        >
          {{
            structureInfo.catalogStraightPublish
              ? $t('assets.directoryStructure.open')
              : $t('assets.directoryStructure.disable')
          }}
        </div>
      </div>
    </div>
    <div class="content-bottom">
      <datablau-detail-subtitle
        :title="$t('assets.directoryStructure.structureDes')"
        mt="0px"
        mb="10px"
      ></datablau-detail-subtitle>
      <p style="color: #555; margin-left: 10px">
        <template v-if="structureInfo.description">
          {{ structureInfo.description }}
        </template>
        <template v-else>
          <img
            src="@/assets/images/dataAssets/noresult.svg"
            style="width: 42px"
            alt=""
          />
          <span style="font-size: 12px; color: #999999">
            {{ $t('assets.directoryStructure.noInfo') }}
          </span>
        </template>
      </p>
      <datablau-detail-subtitle
        :title="$t('assets.directoryStructure.catalogLevelStructure')"
        mt="10px"
        mb="10px"
      ></datablau-detail-subtitle>
      <template v-if="structureInfo.detailDtos">
        <datablau-table
          :data="structureInfo.detailDtos || []"
          style="width: 100%; padding-left: 10px"
          :show-column-selection="false"
        >
          <el-table-column width="30">
            <template slot-scope="scope">
              <template v-if="scope.row.icon">
                <img
                  :src="imgPreUrl + scope.row.icon"
                  alt=""
                  style="width: 20px; max-height: 20px"
                />
              </template>
              <template v-else>
                <img
                  src="../../../assets/images/search/folder.svg"
                  alt=""
                  style="width: 20px; max-height: 20px"
                />
              </template>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('assets.directoryStructure.assetCatalogType')"
            min-width="155"
          >
            <template slot-scope="scope">
              <span style="margin-left: 10px">
                <span style="line-height: 20px">
                  {{ scope.row.catalogTypeName }}
                </span>
              </span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('assets.directoryStructure.supportDataAssets')"
            min-width="300"
          >
            <template slot-scope="scope">
              <span style="margin-left: 10px">
                {{
                  scope.row.assetsTypes
                    .map(item => assetsTypeMap[item])
                    .join('，')
                }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('assets.directoryStructure.setting')"
            min-width="75"
          >
            <template slot-scope="scope">
              <el-popover
                placement="left"
                effect="light"
                popper-class="tooltipBox"
                style="border: none"
                trigger="hover"
                width="600"
                @show="showProps(scope.row)"
              >
                <div>
                  <datablau-detail-subtitle
                    :title="$t('assets.directoryStructure.properties')"
                    mt="10px"
                    mb="10px"
                  ></datablau-detail-subtitle>
                  <div>
                    <el-tag type="info">
                      {{ $t('assets.directoryStructure.catalogCode') }}
                    </el-tag>
                    <el-tag type="info">
                      {{ $t('assets.directoryStructure.directory') }}
                    </el-tag>
                    <el-tag type="info">
                      {{ $t('assets.directoryStructure.abbreviation') }}
                    </el-tag>
                    <el-tag type="info">
                      {{ $t('assets.directoryStructure.ownership') }}
                    </el-tag>
                    <el-tag type="info">
                      {{ $t('assets.directoryStructure.approver') }}
                    </el-tag>
                    <el-tag type="info">
                      {{ $t('assets.directoryStructure.keywords') }}
                    </el-tag>
                    <el-tag type="info">
                      {{ $t('assets.directoryStructure.describe') }}
                    </el-tag>
                  </div>
                  <datablau-detail-subtitle
                    :title="$t('assets.directoryStructure.extendAttr')"
                    mt="10px"
                    mb="10px"
                  ></datablau-detail-subtitle>
                  <div>
                    <template v-if="extendProps.length">
                      <div
                        v-for="udp in extendProps"
                        :key="udp.propName"
                        class="udp-item"
                      >
                        <span class="udp-name">{{ udp.propName }}</span>
                        <span class="udp-type">{{ udpTypeMap[udp.type] }}</span>
                        <span v-if="udp.type === 'ENUM'" class="udp-options">
                          {{ udp.typeDataList.join(';') }}
                        </span>
                      </div>
                    </template>
                    <template v-else class="directory-content">
                      <span style="width: 160px">
                        {{ $t('assets.common.noExtendAttr') }}
                      </span>
                    </template>
                  </div>
                  <datablau-detail-subtitle
                    :title="$t('assets.directoryStructure.completion')"
                    mt="10px"
                    mb="10px"
                  ></datablau-detail-subtitle>
                  <div style="margin-bottom: 10px">
                    {{ getCompleteness(scope.row.algorithmDto) }}
                  </div>
                </div>
                <datablau-button type="text" slot="reference">
                  {{ $t('assets.directoryStructure.degreeOfCompletion') }} /
                  {{ $t('assets.directoryStructure.extendAttr') }}
                </datablau-button>
              </el-popover>
            </template>
          </el-table-column>
        </datablau-table>
      </template>
    </div>
  </div>
</template>

<script>
import api from '../utils/api'
import { toCompletionStr } from '../utils/methods'
import $ from 'jquery'
import IsShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
export default {
  name: 'StructureDetails',
  props: {
    structureInfo: {
      type: Object,
      default() {
        return {}
      },
    },
    isManager: {
      type: Boolean,
      default: false,
    },
    structureIndex: {
      type: Number,
    },
    clickNode: {
      type: Function,
    },
  },
  components: { IsShowTooltip },
  data() {
    return {
      extendDialogVisible: false,
      levelMap: [
        this.$t('assets.directoryStructure.firstLevel'),
        this.$t('assets.directoryStructure.twoLevel'),
        this.$t('assets.directoryStructure.threeLevel'),
        this.$t('assets.directoryStructure.fourLevel'),
        this.$t('assets.directoryStructure.fiveLevel'),
      ],
      wordMap: {
        DEPT: this.$t('assets.generalSettings.dept'),
        ASSETS_LIST: this.$t('assets.generalSettings.assetList'),
        DATA_BUTLER: this.$t('assets.generalSettings.butler'),
        KEYWORDS: this.$t('assets.generalSettings.keywords'),
        DESCRIPTION: this.$t('assets.generalSettings.description'),
        ENGLISH_ABBREVIATION: this.$t('assets.generalSettings.english'),
      },
      assetsTypeMap: {
        DATA_OBJECT: this.$t('assets.generalSettings.object'),
        TABLE: this.$t('assets.generalSettings.table'),
        VIEW: this.$t('assets.generalSettings.view'),
        DATA_STANDARD: this.$t('assets.generalSettings.basicStandard'),
        DATA_STANDARD_CODE: this.$t('assets.generalSettings.standardCode'),
        INDEX: this.$t('assets.generalSettings.index'),
        REPORT: this.$t('assets.generalSettings.report'),
        FILE: this.$t('assets.generalSettings.file'),
        CATALOG: this.$t('assets.generalSettings.none'),
      },
      udpTypeMap: {
        STRING: this.$t('assets.generalSettings.character'),
        ENUM: this.$t('assets.generalSettings.enum'),
        NUM: this.$t('assets.generalSettings.num'),
      },
      extendProps: [],
      imgPreUrl: window.setting.products.dam.assetsUrl + '/config/icon/',
    }
  },
  mounted() {
    this.toggleEllipsis()
    window.onresize = this.toggleEllipsis
    // assetsTypeMap
    this.getMetaModelTypes()
  },
  methods: {
    getMetaModelTypes() {
      api
        .getMetaModelTypes()
        .then(res => {
          let metaModelTypes = {}
          let data = res.data || []
          data.forEach(item => {
            // metaModelTypes[item.assetKey] = item.name
            this.$set(this.assetsTypeMap, item.assetKey, item.name)
          })
          this.metaModelTypes = metaModelTypes
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    toggleEllipsis() {
      this.$nextTick(() => {
        const w = $('.structure-attr').width()
        $('.structure-attr .attr-list').css('maxWidth', w / 4 + 'px')
      })
    },
    // 完成度的字符串
    getCompleteness(data) {
      return toCompletionStr(data, this)
    },
    // 扩展属性
    showProps(row) {
      api.getUdps(row.catalogTypeId).then(res => {
        this.extendProps = res.data
      })
    },

    // 新建资产目录
    addNewCatalog() {
      this.clickNode &&
        this.clickNode('catalogue', {
          type: 'add',
          data: {
            structureIndex: this.structureIndex,
          },
        })
    },
  },
  destroyed() {
    window.onresize = null
  },
  watch: {
    structureIndex() {
      this.toggleEllipsis()
    },
  },
}
</script>

<style lang="scss" scoped>
.structure-details {
  width: 100%;
  height: 100%;
  padding: 0 16px;
  box-sizing: border-box;
  min-width: 1000px;
  .content-top {
    width: 100%;
    height: 90px;
    padding-top: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #ddd;
    overflow: hidden;

    .structure-img {
      float: left;
      box-sizing: content-box;
      padding-top: 4px;
      padding-bottom: 4px;
      font-size: 42px;
      line-height: 42px;
      color: #409eff;
    }
    .base-info {
      float: left;
      width: calc(100% - 450px);
      height: 100%;
      padding-left: 16px;
      .structure-name {
        font-size: 16px;
        font-weight: 500;
        color: #555;
      }
      .structure-attr {
        margin-top: 5px;
        font-size: 14px;
        font-weight: 400;
        color: #555;
        .attr-list {
          position: relative;
          padding-right: 10px;
          padding-left: 10px;
          min-width: 120px;
          display: inline-block;
          height: 20px;
          line-height: 20px;
          &:first-child {
            padding-left: 0;
          }
          &:last-child {
            padding-right: 0;
            border-right: none;
            &:after {
              height: 0;
            }
          }
          &:after {
            content: '';
            position: absolute;
            right: 0;
            top: 3.5px;
            height: 13px;
            width: 1px;
            background-color: #999;
            padding: 0;
          }
          /deep/ .text-tooltip {
            height: 22px;
            vertical-align: middle;
            // max-width: 120px;
            .datablau-tooltip {
              height: 22px;
              .el-tooltip {
                height: 22px;
              }
            }
          }
        }
        .divider {
          display: inline-block;
          height: 13px;
          width: 1px;
          line-height: 20px;
          background-color: #999;
          padding: 0;
          margin-bottom: -1px;
        }
      }
    }

    .catalog-process,
    .asset-process,
    .new-catalog {
      float: right;
      height: 40px;
      line-height: 40px;
      padding-left: 20px;
      padding-right: 20px;
      border-left: 1px solid #ddd;
      margin-top: 5px;
      p {
        font-size: 12px;
        line-height: 14px;
        color: #555;
      }

      .process-status {
        width: 58px;
        height: 24px;
        margin: 0 auto;
        margin-top: 3px;
        border-radius: 13px;
        background-color: #efefef;
        color: #777;
        text-align: center;
        line-height: 24px;
        &.open {
          background-color: #66bf16;
          color: #fff;
        }
      }
    }
    .new-catalog {
      padding-right: 0;
    }
  }
  .content-bottom {
    padding-top: 20px;
    /deep/ .message-title {
      font-size: 12px;
      font-weight: 500;
      color: #555;
    }
  }
}

/deep/ .is-block.text {
  height: 24px;
  line-height: 24px;
}

/deep/ .db-detail-subtitle .message-title {
  font-size: 12px;
  color: #555;
  font-weight: 500;
}
/deep/ .el-table tbody .cell {
  padding-left: 0;
}
</style>
<style lang="scss">
.tooltipBox {
  width: 473px;
  text-align: left;
  border: none !important;
  box-shadow: 0 0 6px #ccc;
  font-size: 12px;
  padding: 6px 14px;
  .popper__arrow {
    border: 0 !important;
    box-shadow: 0 0 6px #ccc;
  }
  .el-tag {
    margin-right: 10px;
    // margin-bottom: 10px;
    font-size: 12px;
  }
}
.tooltipBox.el-tooltip__popper.is-light {
  border: none !important;
  box-shadow: 0 0 6px #ccc;
}
.udp-item {
  margin-bottom: 20px;
  span {
    font-size: 12px;
    color: #555;
  }
  .udp-name {
    display: inline-block;
    width: 120px;
  }
  .udp-type {
    display: inline-block;
    width: 80px;
  }
  .udp-options {
    display: inline-block;
    width: calc(100% - 225px);
  }
}
</style>
