<template>
  <div class="dialog-mask" @click="hideDialog" v-loading="loading">
    <div
      class="tabs-container"
      @click.stop="stopPropagation"
      :class="{ 'show-dialog': showDialog }"
    >
      <div class="top-btn-line">
        <i class="close-btn el-icon-close" @click="hideDialog"></i>
      </div>
      <div class="tabs-outer table-lineage-info">
        <el-tabs v-model="activeName">
          <el-tab-pane
            :label="$t('meta.DS.tableDetail.lineage.detailAna')"
            name="read"
          >
            <div class="tab-inner">
              <div class="info-item-outer tab-item-outer">
                <div class="table-info">
                  <div class="title">
                    <span class="left-border">
                      <span class="table-title">
                        {{ tableDetail.objectName }}
                      </span>
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">
                      {{ $t('meta.DS.tableDetail.lineage.assetTypes') }}：
                    </span>
                    <span class="info-value">
                      {{
                        tableDetail.dateType === 80000004
                          ? $t('meta.DS.tableDetail.lineage.dataTable')
                          : $t('meta.DS.tableDetail.lineage.view')
                      }}
                    </span>
                  </div>
                  <div class="info-item" v-if="$route.query.isAssets">
                    <span class="info-label">
                      {{ $t('meta.DS.tableDetail.lineage.assetState') }}：
                    </span>
                    <span class="info-value">
                      {{
                        tableDetail.status + '' === '1'
                          ? $t('meta.DS.tableDetail.rightBox.authTrue')
                          : $t('meta.DS.tableDetail.rightBox.authFalse')
                      }}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">
                      {{ $t('meta.DS.tableDetail.lineage.assetClassify') }}：
                    </span>
                    <span
                      class="info-value"
                      :title="(tableDetail.categoryNames || []).join(',')"
                    >
                      {{ (tableDetail.categoryNames || []).join(',') }}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">
                      {{ $t('meta.DS.tableDetail.lineage.relIndex') }}：
                    </span>
                    <span
                      class="info-value"
                      :title="(tableDetail.domains || []).join(',')"
                    >
                      {{ (tableDetail.domains || []).join(',') }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="info-item-outer tab-item-outer">
                <div class="table-info">
                  <div class="title">
                    <span class="left-border">
                      <span class="table-title">
                        {{ $t('meta.DS.tableDetail.lineage.label1') }}
                      </span>
                      <span class="info-tooltip">
                        <datablau-tooltip
                          :content="
                            $t('meta.DS.tableDetail.lineage.currentLineage')
                          "
                          placement="top"
                        >
                          <i class="iconfont icon-tips"></i>
                        </datablau-tooltip>
                      </span>
                      <datablau-button
                        class="download-btn"
                        type="text"
                        @click="downloadLineage(1)"
                      >
                        <i class="iconfont icon-download"></i>
                        {{ $t('meta.DS.treeSubOperation.downloadDetail') }}
                      </datablau-button>
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">
                      {{ $t('meta.DS.tableDetail.lineage.sourceSys') }}：
                    </span>
                    <span class="info-value">
                      {{
                        $t('meta.DS.tableDetail.lineage.many', {
                          num:
                            (tableDetail.lineageFrom || {}).systemCounts || 0,
                        })
                      }}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">
                      {{ $t('meta.DS.tableDetail.lineage.sourceEntity') }}：
                    </span>
                    <span class="info-value">
                      {{
                        $t('meta.DS.tableDetail.lineage.tableNum', {
                          num:
                            (tableDetail.lineageFrom || {}).entityCounts || 0,
                        })
                      }}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">
                      {{ $t('meta.DS.tableDetail.lineage.recentChanged') }}：
                    </span>
                    <span class="info-value">
                      {{
                        $t('meta.DS.tableDetail.lineage.manyTimes', {
                          num:
                            (tableDetail.lineageFrom || {}).modifyCounts || '0',
                        })
                      }}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">
                      {{ $t('meta.DS.tableDetail.lineage.qualityPro') }}：
                    </span>
                    <span class="info-value">
                      {{
                        $t('meta.DS.tableDetail.lineage.many', {
                          num:
                            (tableDetail.lineageFrom || {}).qualityCounts ||
                            '0',
                        })
                      }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="info-item-outer tab-item-outer">
                <div class="table-info">
                  <div class="title">
                    <span class="left-border">
                      <span class="table-title">
                        {{ $t('meta.DS.tableDetail.lineage.impactAna') }}
                      </span>
                      <span class="info-tooltip">
                        <datablau-tooltip
                          :content="
                            $t('meta.DS.tableDetail.lineage.impactTips')
                          "
                          placement="top"
                        >
                          <i class="iconfont icon-tips"></i>
                        </datablau-tooltip>
                      </span>
                      <datablau-button
                        class="download-btn"
                        type="text"
                        @click="downloadLineage(2)"
                      >
                        <i class="iconfont icon-download"></i>
                        {{ $t('meta.DS.treeSubOperation.downloadDetail') }}
                      </datablau-button>
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">
                      {{ $t('meta.DS.tableDetail.lineage.subSys') }}：
                    </span>
                    <span class="info-value">
                      {{
                        $t('meta.DS.tableDetail.lineage.many', {
                          num:
                            (tableDetail.lineageEffect || {}).systemCounts || 0,
                        })
                      }}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">
                      {{ $t('meta.DS.tableDetail.lineage.impoctEntity') }}：
                    </span>
                    <span class="info-value">
                      {{
                        $t('meta.DS.tableDetail.lineage.tableNum', {
                          num:
                            (tableDetail.lineageEffect || {}).entityCounts || 0,
                        })
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane
            v-if="$featureMap.FE_QUALITY"
            :label="$t('meta.DS.tableDetail.lineage.dataQuality')"
            name="problem"
          >
            <div
              class="tab-inner sub-tabs-outer"
              v-if="activeName === 'problem'"
              style="left: 20px"
            >
              <span
                class="info-tooltip lineage-problem-title"
                :style="{ left: $i18n.locale === 'zh' ? '165px' : '210px' }"
              >
                <datablau-tooltip
                  :content="$t('meta.DS.tableDetail.lineage.faQuality')"
                  placement="top"
                >
                  <i class="iconfont icon-tips"></i>
                </datablau-tooltip>
              </span>
              <datablau-subtab
                v-if="subTabs"
                :tabs="subTabs"
                :show-name="'name'"
                @change="subTabChange"
                :current="0"
                class="sub-tabs-com"
              ></datablau-subtab>
              <div
                class="quality-info-item tab-item-outer"
                v-if="subTabName === tableDetail.objectName"
              >
                <!--<div class="title">-->
                <!--  <span class="left-border">-->
                <!--    <span class="table-title">-->
                <!--      {{ tableDetail.objectName }}-->
                <!--    </span>-->
                <!--  </span>-->
                <!--</div>-->
                <div
                  class="list-outer"
                  v-if="problemsList && problemsList.length"
                >
                  <p
                    class="lineage-change-item table-quest-list-item"
                    v-for="item in problemsList"
                    :key="'table_question' + item.questId"
                    @click="skip2Problem(item)"
                  >
                    <span class="count-span">{{ item.questCounts }}</span>
                    <span class="quest-name">{{ item.questName }}</span>
                  </p>
                </div>
                <div class="list-outer" v-else>
                  {{ $t('el.table.emptyText') }}
                </div>
              </div>
              <div
                class="quality-info-item tab-item-outer"
                v-if="subTabName === $t('meta.DS.tableDetail.lineage.label1')"
              >
                <!--<div class="title">-->
                <!--  <span class="left-border">-->
                <!--    <span class="table-title">血缘分析</span>-->
                <!--    <span class="info-tooltip">-->
                <!--      <datablau-tooltip-->
                <!--        content="上游表的质量问题情况"-->
                <!--        placement="top"-->
                <!--      >-->
                <!--        <i class="iconfont icon-tips"></i>-->
                <!--      </datablau-tooltip>-->
                <!--    </span>-->
                <!--  </span>-->
                <!--</div>-->
                <div
                  class="list-outer"
                  v-if="lineageProblemsList && lineageProblemsList.length"
                >
                  <p
                    class="lineage-change-item"
                    v-for="item in lineageProblemsList"
                    :key="'lineage_question_' + item.questId"
                  >
                    <span class="count-span">{{ item.questCounts }}</span>
                    <span class="quest-name">{{ item.questName }}</span>
                  </p>
                </div>
                <div class="list-outer" v-else>
                  {{ $t('el.table.emptyText') }}
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane
            :label="$t('meta.DS.tableDetail.lineage.qualityProblem.changeInfo')"
            name="change"
            class="change-info-tab"
          >
            <div class="tab-inner change-info-tab">
              <div class="quality-info-item tab-item-outer">
                <div class="title">
                  <span class="left-border">
                    <span class="table-title">
                      {{ tableDetail.objectName }}
                    </span>
                  </span>
                </div>
                <div
                  class="list-outer table-change-list"
                  v-if="tableChangeList && tableChangeList.length"
                >
                  <p
                    class="lineage-change-item"
                    v-for="(item, index) in showLastThree
                      ? tableChangeList.slice(0, 3)
                      : tableChangeList"
                    :key="`table_change_${item.modifyId}_${item.version}_${index}`"
                  >
                    <span class="modify-time">
                      <span class="el-icon-location time-location-icon"></span>
                      <span class="name-text">{{ item.versionName }}</span>
                      <span class="time-text">{{ item.modifyTime }}</span>
                    </span>
                    <span class="modify-label">
                      {{ $t('meta.DS.tableDetail.lineage.changeColumn') }}：
                    </span>
                    <span class="change-cols">{{ item.modifyInfo }}</span>
                  </p>
                  <datablau-button
                    v-if="
                      showLastThree &&
                      tableChangeList &&
                      tableChangeList.length > 3
                    "
                    type="text"
                    @click="showLastThree = false"
                  >
                    <i class="el-icon-arrow-down"></i>
                    {{ $t('meta.DS.tableDetail.lineage.showAll') }}
                  </datablau-button>
                </div>
                <div class="list-outer" v-else>
                  {{ $t('el.table.emptyText') }}
                </div>
              </div>
              <div class="quality-info-item tab-item-outer">
                <div class="title">
                  <span class="left-border">
                    <span class="table-title">
                      {{
                        $t('meta.DS.tableDetail.lineage.lineageModRecentMonth')
                      }}
                    </span>
                  </span>
                </div>
                <div class="lineage-change-list">
                  <div
                    class="list-outer"
                    v-if="lineageChangeList && lineageChangeList.length"
                  >
                    <p
                      class="lineage-change-item"
                      v-for="item in lineageChangeList"
                      :key="`lineage_${item.modifyId}_${item.version}`"
                    >
                      <span class="change-count count-span">
                        {{ item.modifyCounts }}
                      </span>
                      <span class="quest-name">
                        <span class="en-name">{{ item.objectName }}</span>
                        <span class="cn-name" v-if="item.chineseName">
                          ({{ item.chineseName }})
                        </span>
                      </span>
                    </p>
                  </div>
                  <div class="list-outer" v-else>
                    {{ $t('el.table.emptyText') }}
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import HTTP from '@/http/main'

export default {
  name: 'detailTabs',
  data() {
    return {
      activeName: 'read',
      showDialog: false,
      tableDetail: {
        name: this.$t('meta.DS.tableDetail.lineage.tableName'),
      },
      showLastThree: true,
      subTabs: null,
      subTabName: '',
      loading: false,
    }
  },
  props: {
    objectId: {
      type: [String, Number],
      required: true,
    },
  },
  computed: {
    tableChangeList() {
      if (!this.tableDetail) return []
      let arr = this.tableDetail.modifyList || []
      arr = arr.filter(item => item.type === 1)
      return arr
    },
    lineageChangeList() {
      if (!this.tableDetail) return []
      let arr = this.tableDetail.modifyList || []
      arr = arr.filter(item => item.type === 2)
      return arr
    },
    problemsList() {
      if (!this.tableDetail) return []
      let arr = this.tableDetail.questList || []
      arr = arr.filter(item => item.type === 1)
      return arr
    },
    lineageProblemsList() {
      if (!this.tableDetail) return []
      let arr = this.tableDetail.questList || []
      arr = arr.filter(item => item.type === 2)
      return arr
    },
    lineageAnalysisInfo() {},

    // 近一个月变更
    currentModifyTimes() {
      let modifyList = (this.tableDetail || {}).modifyList || []
      let monthAgoTime = moment().subtract(1, 'M')
      modifyList = modifyList.filter(item => {
        return monthAgoTime.isBefore(item.modifyTime)
      })
      return modifyList.length || 0
    },
  },
  methods: {
    secondTab() {
      this.activeName = 'problem'
    },
    stopPropagation() {
      return false
    },
    hideDialog() {
      this.showDialog = false
      this.$emit('hideDialog')
    },
    dataInit() {
      // console.log(this.objectId, 'this.objectId')
      this.loading = true
      HTTP.getQualityInfo({ objectId: this.objectId })
        .then(res => {
          // console.log(res, 'res')
          this.tableDetail = res.data || {}
          let objectName = this.tableDetail.objectName
          this.subTabName = objectName
          this.subTabs = [
            { name: objectName },
            { name: this.$t('meta.DS.tableDetail.lineage.label1') },
          ]
          this.loading = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    setTabNameTitle() {
      setTimeout(() => {
        let title = this.subTabs[0]?.name
        $('.sub-tabs-com div:first-child.subtab-item').attr('title', title)
      }, 300)
    },
    skip2Problem(problem) {
      // this.$router.push({
      //   name: 'dataQualityRepairJob',
      //   query: {
      //     id: problem.questId,
      //     name: problem.questName,
      //   },
      // })
      this.$skip2({
        name: 'dataQualityRepairJob',
        query: {
          id: problem.questId,
          name: problem.questName,
        },
      })
    },
    downloadLineage(type) {
      if (type === 1) {
        if (
          !this.tableDetail ||
          !this.tableDetail.lineageFrom ||
          !this.tableDetail.lineageFrom.systemCounts
        ) {
          this.$message.info(this.$t('el.table.emptyText'))
          return
        }
      } else {
        if (
          !this.tableDetail ||
          !this.tableDetail.lineageEffect ||
          !this.tableDetail.lineageEffect.systemCounts
        ) {
          this.$message.info(this.$t('el.table.emptyText'))
          return
        }
      }
      let url = `${this.$meta_url}/lineage/object/${this.objectId}/download/${type}`
      this.$downloadFile(url)
    },
    subTabChange(item, index) {
      this.subTabName = item.name
    },
  },
  watch: {
    objectId: {
      immediate: true,
      handler: function () {
        this.activeName = 'read'
        // console.log('watch')
        this.dataInit()
      },
    },
    activeName(newValue) {
      if (newValue === 'problem') {
        this.setTabNameTitle()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';

@mixin absPos() {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.dialog-mask {
  //border: 1px solid yellow;
  position: absolute;
  //left: 0;
  width: 330px;
  top: 2px;
  right: 0;
  bottom: 0;
  background-color: transparent;
  z-index: 1;
  //border: 1px solid red;

  .tabs-container {
    position: absolute;
    right: 2px;
    top: 0;
    bottom: 2px;
    background-color: #fff;
    box-shadow: -4px 0px 8px 0px rgba(0, 51, 140, 0.1);
    width: 320px;
    overflow: auto;

    $title-height: 25px;

    .top-btn-line {
      height: $title-height;

      .close-btn {
        position: absolute;
        right: 10px;
        top: 10px;
        width: 20px;
        height: 20px;
        line-height: 20px;
        text-align: center;
        cursor: pointer;
        background: #f5f5f5;
        border-radius: 50%;
      }
    }

    .tabs-outer {
      position: absolute;
      left: 0px;
      top: $title-height;
      bottom: 20px;
      right: 20px;
      //border: 1px solid red;

      &.table-lineage-info /deep/ .el-tabs {
        .el-tabs__header .el-tabs__item {
          padding: 0 10px;
        }

        .el-tabs__item:nth-child(2) {
          padding-left: 0;
        }
      }

      &.table-lineage-info /deep/ .el-tabs__content {
        //overflow: visible;
        overflow: auto;
      }

      .tab-inner {
        .info-item-outer,
        .tab-item-outer {
          position: relative;
          //border: 1px solid red;
          margin-top: 20px;
          padding: 30px 0 20px 11px;
          border-bottom: 1px solid #dddddd;

          .info-item {
            margin-bottom: 4px;
            //border: 1px solid red;
          }

          &:last-child {
            border-bottom: none;
          }

          .count-span {
            display: inline-block;
            //min-width: 27px;
            height: 18px;
            background: #fde8e6;
            border-radius: 2px;
            line-height: 18px;
            padding: 0 4px;
            min-width: 25px;
            //float: right;
            vertical-align: top;
            text-align: center;

            color: #f2220a;
            margin-top: 6px;
          }

          .quest-name {
            display: inline-block;
            width: 200px;
            padding-left: 10px;
            line-height: 24px;
            word-break: break-all;
          }
        }

        .left-border {
          position: absolute;
          height: 14px;
          left: 0px;
          top: 0px;
          right: 0;
          border-left: 4px solid $primary-color;
          vertical-align: top;

          .table-title {
            display: inline-block;
            margin-left: 9px;
            font-size: 14px;
            color: #555555;
            line-height: 14px;
            margin-top: -2px;
            vertical-align: top;
            //position: absolute;
            //left: 20px;
            //right: 10px;
            //top: 30px;
          }

          .info-tooltip {
            display: inline-block;
            font-size: 12px;
            margin: -3px 0 0 6px;
            vertical-align: top;
          }

          .download-btn {
            position: absolute;
            right: 0;
            top: -4px;

            i {
              font-size: 14px;
            }
          }
        }

        .table-quest-list-item {
          cursor: pointer;
          transition: all 0.4s;

          &:hover {
            color: $primary-color;
          }
        }

        &.change-info-tab {
          .list-outer.table-change-list {
            border-left: 1px dashed #c1c1c1;

            .lineage-change-item {
              position: relative;
              padding: 24px 0 0 12px;
              word-break: break-all;
              margin-bottom: 10px;

              .time-location-icon {
                color: $primary-color;
              }

              .modify-time {
                position: absolute;
                left: -6px;
                top: 0;
                right: 0;

                .name-text {
                  text-indent: 5px;
                }

                .time-text {
                  float: right;
                }
              }

              .modify-label,
              .change-cols {
                word-break: break-all;
              }
            }
          }
        }

        &.sub-tabs-outer {
          //border: 1px solid red;
          @include absPos();

          .sub-tabs-com {
            margin-top: 10px;

            /deep/ {
              div:first-child.subtab-item {
                display: inline-block;
                width: 100px;
                text-align: center;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .subtab-item + .subtab-item {
                display: inline-block;
                width: auto;
              }
            }
          }

          .quality-info-item {
            @include absPos();
            //border: 1px solid red;
            overflow: auto;
            top: 55px;
            margin-top: 0;
            padding-top: 10px;
          }

          .lineage-problem-title {
            position: absolute;
            top: 18px;
            left: 165px;
            z-index: 3;
            //border: 1px solid red;
          }
        }
      }
    }
  }
}
</style>
