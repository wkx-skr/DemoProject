<template>
  <div style="position: absolute; bottom: 0; top: 72px; left: 0; right: 0">
    <!-- 脱敏规则弹框 -->
    <desensitize-dia
      :showRule="showRule"
      :clickRule="clickRule"
    ></desensitize-dia>
    <!-- 选择表、视图、字段 -->
    <add-table
      v-if="showTableDialog"
      :visible="showTableDialog"
      :clickTable="clickTable"
      :assetType="assetType"
    ></add-table>
    <template v-if="assetInfo.assetId">
      <asset-Info :assetInfo="assetInfo" :clickAsset="clickAsset"></asset-Info>
      <div class="content-table-box">
        <datablau-form-submit ref="formSubmit">
          <datablau-table
            v-loading="tableLoading"
            :loading="tableLoading"
            height="100%"
            ref="table"
            :data="tableData"
          >
            <el-table-column width="28">
              <template slot-scope="scope">
                <datablau-icon
                  :data-type="'column'"
                  :size="20"
                  style="position: relative; top: 3px; left: -3px"
                ></datablau-icon>
              </template>
            </el-table-column>
            <el-table-column
              :label="'字段名称'"
              prop="name"
              :min-width="120"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span>{{ getName(scope.row) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              :label="'脱敏规则'"
              prop="rule"
              :min-width="120"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <div class="rule-box">
                  <i
                    class="iconfont icon-tianjia"
                    @click="openRule(scope.row)"
                  ></i>
                  <el-tag
                    closable
                    @close="handleClose(scope.row)"
                    v-if="
                      secondData.maskRuleMap &&
                      secondData.maskRuleMap[scope.row.objectId]
                    "
                  >
                    <is-show-tooltip
                      :content="secondData.maskRuleMap[scope.row.objectId].name"
                      :open-delay="200"
                      placement="top"
                    ></is-show-tooltip>
                  </el-tag>
                </div>
              </template>
            </el-table-column>
          </datablau-table>
          <template slot="buttons">
            <div>
              <datablau-button type="normal" @click="prev">
                上一步
              </datablau-button>
              <datablau-button type="normal" @click="next">
                下一步
              </datablau-button>
              <datablau-button
                class="cut-apart-btn"
                type="secondary"
                @click="back"
              >
                取消
              </datablau-button>
            </div>
          </template>
        </datablau-form-submit>
      </div>
    </template>
    <add-asset
      :clickAsset="clickAsset"
      :assetType="assetType"
      v-else
    ></add-asset>
  </div>
</template>

<script>
import API from '@/view/dataSecurity/util/api'
import AssetInfo from '../assetInfo.vue'
import AddAsset from '../addAssets.vue'
import addTable from '../addTable.vue'
import DesensitizeDia from './desensitizeDia.vue'
import isShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
export default {
  components: { DesensitizeDia, isShowTooltip, AssetInfo, AddAsset, addTable },
  props: {
    clickChild: {
      type: Function,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    assetInfo: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      // 正文数据
      tableData: [],
      curColumnId: '',
      maskRuleMap: {},
      secondData: {}, // 第二部的数据
      tableLoading: false,
      // 选择脱敏弹框数据
      showRule: false,
      ruleList: [],
      showTableDialog: false,
      assetType: 'TABLE',
    }
  },
  mounted() {
    if (this.assetInfo.assetId) {
      this.getList()
    }
  },
  watch: {
    keyword(val) {
      if (!val) {
        this.searchRuleList()
      }
    },
    assetInfo: {
      handler(val) {
        if (val.assetId) {
          this.getList()
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    back() {
      this.clickChild('cancel')
    },
    clickTable(name, options) {
      switch (name) {
        case 'close':
          this.showTableDialog = false
          break
        case 'sureTable':
          this.showTableDialog = false
          this.clickChild('asset', options)
          break
        default:
          break
      }
    },
    clickAsset(name, options) {
      switch (name) {
        case 'assetInfo':
          this.showTableDialog = true
          break
        default:
          break
      }
    },
    showIcon(row) {
      let result = true
      if (
        this.secondData.maskRuleMap &&
        this.secondData.maskRuleMap[row.objectId]
      ) {
        result = false
      } else {
        result = true
      }
      return result
    },
    clearRule() {
      this.maskRuleMap = {}
      this.secondData.maskRuleMap = this.maskRuleMap
    },
    handlerData() {
      this.ruleList.map(item => {
        this.tableData.map(o => {
          let ruleMap = {}
          if (o.objectId === item.objectId && item.ruleId) {
            ruleMap.name = item.maskRule
            ruleMap.id = item.ruleId
            this.maskRuleMap[o.objectId] = ruleMap
          }
        })
      })
      this.secondData.maskRuleMap = _.cloneDeep(this.maskRuleMap)
    },
    handleClose(tag) {
      delete this.maskRuleMap[tag.objectId]
      this.secondData.maskRuleMap = this.maskRuleMap
      this.secondData = _.cloneDeep(this.secondData)
    },
    getRuleList() {
      // 第二步数据详情
      const reqParams = {
        accessId: this.$parent.initData.accessControlId,
        scopeType: 'PERSON', // PERSON, GROUP, ORGANIZATION
      }
      API.getTableMaskDetail(reqParams)
        .then(res => {
          this.ruleList = res.data.data || []
          this.handlerData()
        })
        .catch(e => {
          this.ruleList = []
          this.$showFailure(e)
        })
    },
    getList() {
      this.tableLoading = true
      API.getcolumns(this.assetInfo.assetId)
        .then(res => {
          this.tableLoading = false
          this.tableData = res.data || []
          if (this.isEdit) {
            this.getRuleList()
          }
        })
        .catch(e => {
          this.tableData = []
          this.tableLoading = false
          this.$showFailure(e)
        })
    },
    getName(row) {
      const result =
        row.physicalName + (row.logicalName ? `(${row.logicalName})` : '')
      return result
    },
    prev() {
      this.clickChild('step', { step: 1, prevStep: 2 })
    },
    next() {
      this.clickChild('step', { step: 3, prevStep: 2 })
    },
    openRule(row) {
      this.showRule = true
      this.curColumnId = row.objectId
    },
    /**
     * =================================  选择脱敏弹框数据  =====================================
     */
    clickRule(name, option) {
      switch (name) {
        case 'close':
          this.showRule = false
          break
        case 'add':
          this.tableData.map(item => {
            if (item.objectId === this.curColumnId) {
              this.maskRuleMap[this.curColumnId] = option
            }
          })
          this.secondData.maskRuleMap = this.maskRuleMap
          this.secondData = _.cloneDeep(this.secondData)
          this.showRule = false
          break
        default:
          break
      }
    },
  },
}
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.content-table-box {
  position: absolute;
  left: 0;
  top: 64px;
  right: 0;
  bottom: 0;
  .rule-box {
    width: 232px;
    i.iconfont {
      vertical-align: middle;
      display: inline-block;
      line-height: 24px;
      font-size: 16px;
      color: $primary-color;
      cursor: pointer;
      margin-right: 4px;
    }
    /deep/ .el-tag {
      vertical-align: middle;
      width: auto;
      max-width: 232px;
      box-sizing: border-box;
      display: inline-block;
      height: 24px;
      line-height: 24px;
      padding: 0px 8px;
      padding-right: 24px;
      background: transparentize($color: #6f54eb, $amount: 0.9);
      color: #6f54eb;
      border-radius: 2px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      position: relative;
      i {
        position: absolute;
        right: 4px;
        top: 4px;
        color: #6f54eb;
        background: transparentize($color: #6f54eb, $amount: 0.8);
        &:hover {
          color: #fff;
          background: #6f54eb;
        }
      }
    }
  }
}
</style>
