<template>
  <div class="structure-details">
    <datablau-dialog
      :visible.sync="extendDialogVisible"
      :title="$t('assets.common.extendAttr')"
      size="s"
    >
      <template v-if="extendProps.length">
        <div v-for="udp in extendProps" :key="udp.propName" class="udp-item">
          <img
            src="/static/images/dataAssets/udp.svg"
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
          :tip="$t('assets.common.noExtendAttr')"
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
      <!-- <img
        src="../../../assets/images/search/folder.svg"
        alt=""
        height="42px"
        class="structure-img"&#xe60e;
      /> -->
      <span class="icon iconfont icon-menu-ztml structure-img"></span>
      <div class="base-info">
        <p class="structure-name">{{ structureInfo.name }}</p>
        <p class="structure-attr">
          <span>
            {{ $t('assets.common.createdBy') }}：
            <template v-if="ellipsis">
              <datablau-tooltip
                :content="
                  structureInfo.creator
                    ? `${structureInfo.creatorDto.fullUserName}（${structureInfo.creatorDto.username}）`
                    : $t('assets.common.system')
                "
                placement="top"
              >
                <span>...</span>
              </datablau-tooltip>
            </template>
            <template v-else>
              {{
                structureInfo.creator
                  ? `${structureInfo.creatorDto.fullUserName}（${structureInfo.creatorDto.username}）`
                  : $t('assets.common.system')
              }}
            </template>
          </span>
          <span class="divider"></span>
          <span>
            {{ $t('assets.common.createdTime') }}：
            <template v-if="ellipsis">
              <datablau-tooltip
                :content="structureInfo.createTime"
                placement="top"
              >
                <span>...</span>
              </datablau-tooltip>
            </template>
            <template v-else>{{ structureInfo.createTime }}</template>
          </span>
          <span class="divider"></span>
          <span>
            {{ $t('assets.common.approver') }}：
            <template v-if="ellipsis">
              <datablau-tooltip
                :content="`${structureInfo.approverDto.fullUserName}（${structureInfo.approverDto.username}）`"
                placement="top"
              >
                <span>...</span>
              </datablau-tooltip>
            </template>
            <template v-else>
              {{
                `${structureInfo.approverDto.fullUserName}（${structureInfo.approverDto.username}）`
              }}
            </template>
          </span>
          <span class="divider"></span>
          <span v-if="structureInfo.structureManagerDto">
            {{ $t('assets.directoryStructure.directoryManager') }}：
            <template v-if="ellipsis">
              <datablau-tooltip
                :content="
                  structureInfo.structureManagerDto
                    .map(manager => `${manager.firstName}`)
                    .join('，')
                "
                placement="top"
              >
                <span>...</span>
              </datablau-tooltip>
            </template>
            <template v-else>
              <template v-if="structureInfo.structureManagerDto.length < 4">
                {{
                  structureInfo.structureManagerDto
                    .map(manager => manager.firstName)
                    .join('，')
                }}
              </template>
              <template v-else>
                {{
                  structureInfo.structureManagerDto
                    .slice(0, 3)
                    .map(manager => `${manager.firstName}`)
                    .join('，')
                }}
                <datablau-tooltip
                  :content="
                    structureInfo.structureManagerDto
                      .map(manager => `${manager.firstName}`)
                      .join('，')
                  "
                  placement="top"
                >
                  <!-- <datablau-button type="text"> -->
                  <span
                    style="font-size: 12px; color: #409eff; cursor: pointer"
                  >
                    {{
                      $t('assets.common.totalPeople', {
                        total: structureInfo.structureManagerDto.length,
                      })
                    }}
                  </span>
                  <!-- </datablau-button> -->
                </datablau-tooltip>
              </template>
            </template>
          </span>
        </p>
      </div>
      <div class="new-catalog" v-if="isManager">
        <datablau-button
          type="important"
          class="el-icon-circle-plus-outline"
          @click="addNewCatalog"
        >
          {{ $t('assets.commonHead.newAssetCatalog') }}
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
              ? $t('assets.common.open')
              : $t('assets.common.disable')
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
              ? $t('assets.common.open')
              : $t('assets.common.disable')
          }}
        </div>
      </div>
    </div>
    <div class="content-bottom">
      <datablau-detail-subtitle
        :title="$t('assets.common.structureDes')"
        mt="0px"
        mb="10px"
      ></datablau-detail-subtitle>
      <p style="color: #555; margin-left: 10px">
        <template v-if="structureInfo.description">
          {{ structureInfo.description }}
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
      <datablau-detail-subtitle
        :title="$t('assets.common.catalogLevelStructure')"
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
            :label="$t('assets.common.assetCatalogType')"
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
            :label="$t('assets.common.supportDataAssets')"
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
          <el-table-column :label="$t('assets.common.setting')" min-width="75">
            <template slot-scope="scope">
              <el-popover
                placement="left"
                effect="light"
                popper-class="tooltipBox"
                style="border: none"
                trigger="hover"
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
                    :title="$t('assets.generalSettings.extended')"
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
                  {{ $t('assets.common.degreeOfCompletion') }} /
                  {{ $t('assets.common.extendAttr') }}
                </datablau-button>
              </el-popover>
              <!-- <datablau-button type="text" @click="showExtendProps(scope.row)">
                {{ $t('assets.common.extendAttr') }}
              </datablau-button> -->
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
        DATA_SERVICE: this.$t('assets.generalSettings.service'),
        CATALOG: this.$t('assets.generalSettings.none'),
        DATA_STANDARD: this.$t('assets.summaryInfo.basicStandard'),
        DATA_STANDARD_CODE: this.$t('assets.summaryInfo.standardCode'),
      },
      udpTypeMap: {
        STRING: this.$t('assets.generalSettings.character'),
        ENUM: this.$t('assets.generalSettings.enum'),
        NUM: this.$t('assets.generalSettings.num'),
      },
      extendProps: [],
      imgPreUrl: window.setting.restApiPathName + '/service/ddc/config/icon/',
      ellipsis: false,
    }
  },
  mounted() {
    this.toggleEllipsis()
    window.onresize = this.toggleEllipsis
  },
  methods: {
    toggleEllipsis() {
      // console.log('toggle')
      this.ellipsis = false
      this.$nextTick(() => {
        $('.structure-attr').height() > 30
          ? (this.ellipsis = true)
          : (this.ellipsis = false)
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
        span {
          padding-right: 10px;
          padding-left: 10px;
          &:first-child {
            padding-left: 0;
          }
          &:last-child {
            padding-right: 0;
            border-right: none;
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
        margin-top: 3px;
        border-radius: 13px;
        background-color: #efefef;
        color: #777;
        text-align: center;
        line-height: 22px;
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
