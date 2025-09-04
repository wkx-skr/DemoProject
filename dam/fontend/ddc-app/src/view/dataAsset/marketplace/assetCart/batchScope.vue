<template>
  <datablau-dialog
    :visible="visible"
    width="800px"
    height="560px"
    :title="$t('assets.marketplace.editDataScope')"
    :before-close="close"
    custom-class="batch-scope-dialog"
  >
    <div
      style="
        border: 1px solid #e6eaf2;
        margin-top: 8px;
        border-radius: 6px;
        display: flex;
        height: 100%;
      "
      v-loading="!Boolean(currentTable.assetId)"
    >
      <div class="table-list">
        <div
          v-for="(table, index) in tableData"
          :key="'table' + table.objectId + index"
          @click="changeCurrentTable(table)"
          class="table-item"
          :class="{ active: currentTable.assetId === table.assetId }"
        >
          <div
            v-if="currentTable.assetId === table.assetId"
            class="table-flag"
          ></div>
          <p class="table-name">
            <is-show-tooltip
              :content="
                table.logicalName
                  ? `${table.logicalName}(${table.name})`
                  : table.name
              "
            ></is-show-tooltip>
          </p>
          <p>
            <span style="color: #7c89a8">
              {{ $t('assets.marketplace.dataButlerText') }}：
              <span
                style="display: inline-block; max-width: 90px; color: #7c89a8"
              >
                <is-show-tooltip
                  :content="table.managerList.join('、') || '--'"
                  style="height: 20px; display: flex"
                ></is-show-tooltip>
              </span>
            </span>
            <span :class="[table.scopeType.toLowerCase()]">
              <is-show-tooltip
                :content="
                  table.scopeType === 'TABLE'
                    ? $t('assets.marketplace.allTable')
                    : `${$t('assets.marketplace.column')}：${
                        currentTable.assetId === table.assetId
                          ? selectedColumns.length
                          : table.columnList && table.columnList.length
                      }`
                "
              ></is-show-tooltip>
            </span>
          </p>
        </div>
      </div>

      <div
        class="column-list"
        :class="['scope-' + currentTable.scopeType.toLowerCase()]"
        :style="{
          width:
            currentTable.scopeType === 'TABLE' ? 'calc(100% - 240px)' : '240px',
        }"
      >
        <datablau-radio
          v-model="currentTable.scopeType"
          :radioTitle="$t('assets.marketplace.dataScope')"
          @change="handleScopeTypeChange"
        >
          <el-radio label="TABLE" value="TABLE" style="margin-left: 8px">
            {{ $t('assets.marketplace.allTable') }}
          </el-radio>
          <el-radio label="COLUMN" value="COLUMN">
            {{ $t('assets.marketplace.column') }}
          </el-radio>
        </datablau-radio>
        <div
          v-if="currentTable.scopeType === 'TABLE'"
          style="
            height: 32px;
            line-height: 32px;
            border-radius: 4px;
            background: rgba(60, 100, 240, 0.1);
            color: #354f7b;
            padding: 0 4px;
          "
        >
          <i class="iconfont icon-tips"></i>
          {{ $t('assets.marketplace.allTableTips') }}
        </div>
        <div class="content-left">
          <datablau-input
            v-if="currentTable.scopeType !== 'TABLE'"
            v-model="columnKeyword"
            :iconfont-state="true"
            :placeholder="$t('assets.marketplace.placeholder')"
            clearable
            style="width: 100%"
          ></datablau-input>
          <div class="column-checkbox" style="">
            <datablau-checkbox
              v-if="!columnKeyword && currentTable.scopeType !== 'TABLE'"
              :checkboxType="'single'"
              v-model="isAll"
              :disabled="currentTable.scopeType === 'TABLE'"
              @change="handleIsAllChange"
            >
              {{ $t('assets.marketplace.allPlaceholder') }}
            </datablau-checkbox>
            <datablau-checkbox2
              :disabled="true"
              v-model="selectedColumns"
              :options="JSON.stringify(displayColumnOptions)"
              :option-keys="optionKeys"
              @change="handleSelectedChange"
              :portraitStyle="{
                display: 'block',
                margin: '10px 0',
              }"
            ></datablau-checkbox2>
          </div>
        </div>
      </div>

      <div class="selected-list" v-if="currentTable.scopeType !== 'TABLE'">
        <div class="content-right">
          <div style="height: 32px; line-height: 32px">
            <span style="float: left">
              {{ $t('assets.marketplace.simpleSelected') }}：{{
                selectedColumnsDisplay.length
              }}
            </span>
            <datablau-button
              style="float: right"
              type="text"
              @click="clearSelected"
              v-if="scopeType === 'COLUMN'"
            >
              {{ $t('assets.marketplace.clearAll') }}
            </datablau-button>
          </div>
          <div
            style="
              width: 100%;
              height: calc(100% - 36px);
              margin-top: 4px;
              overflow: auto;
            "
          >
            <el-tag
              v-for="c in selectedColumnsDisplay"
              :key="'selected' + c.objectId"
              :closable="scopeType === 'COLUMN'"
              @close="deleteColumn(c.objectId)"
              disable-transitions
              style="
                margin-right: 4px;
                margin-bottom: 4px;
                max-width: calc(100% - 4px);
                display: flex;
                align-items: center;
                float: left;
              "
            >
              <span
                style="
                  display: inline-block;
                  max-width: calc(100% - 16px);
                  height: 24px;
                "
              >
                <is-show-tooltip :content="c.name"></is-show-tooltip>
              </span>
            </el-tag>
          </div>
        </div>
      </div>
    </div>
    <div slot="footer">
      <datablau-button
        type="text"
        @click="close"
        style="
          line-height: 32px !important;
          height: 32px !important;
          min-width: 65px;
          color: #7c89a8;
        "
      >
        {{ $t('common.button.cancel') }}
      </datablau-button>
      <datablau-button type="primary" @click="confirm">
        {{ $t('common.button.ok') }}
      </datablau-button>
    </div>
  </datablau-dialog>
</template>

<script>
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
import api from '../../utils/api'
export default {
  name: 'BatchScope',
  components: { isShowTooltip },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    isBatch: {
      type: Boolean,
      default: false,
    },
    assetsList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      tableData: [],
      currentTable: {
        objectId: 1,
        name: '',
        bulter: '',
        scopeType: '',
        selectedColumns: [],
      },
      columnOptions: [],
      displayColumnOptions: [],
      columnMap: {},
      isAll: false,
      scopeType: 'COLUMN',
      columnKeyword: '',
      selectedColumns: [],
      optionKeys: JSON.stringify({
        value: 'objectId',
        label: 'name',
      }),
    }
  },
  methods: {
    confirm() {
      this.setCurrentTableAttr()
      // console.log(this.tableData)
      if (this.validateScope()) {
        api
          .toSetCartColumn(
            this.tableData.map(table => ({
              shoppingId: table.id,
              tableId: table.objectId,
              objectIds: table.columnList,
              allTable: table.scopeType === 'TABLE',
            }))
          )
          .then(res => {
            if (res.status === 200) {
              this.$emit('confirm')
            }
          })
      } else {
        this.$blauShowFailure(this.$t('assets.marketplace.dataScopeError'))
      }
    },
    validateScope() {
      if (
        this.tableData.find(
          table => table.scopeType === 'COLUMN' && table.columnList.length === 0
        )
      ) {
        return false
      } else {
        return true
      }
    },
    close() {
      this.$emit('close')
    },
    setCurrentTableAttr() {
      if (this.currentTable && this.currentTable.assetId) {
        const preTable = this.tableData.find(
          t => t.assetId === this.currentTable.assetId
        )
        if (preTable) {
          preTable.columnList = _.cloneDeep(this.selectedColumns)
          preTable.scopeType = this.currentTable.scopeType
          preTable.allTable = this.currentTable.scopeType === 'TABLE'
        }
      }
    },
    changeCurrentTable(table) {
      this.setCurrentTableAttr()
      // 根据表ID查询字段选项
      this.columnKeyword = ''
      this.columnOptions = this.columnMap[table.assetId] || []
      this.displayColumnOptions = this.columnMap[table.assetId] || []
      this.currentTable = table
      this.handleScopeTypeChange()
    },
    handleScopeTypeChange() {
      this.tableData.find(
        item => item.assetId === this.currentTable.assetId
      ).scopeType = this.currentTable.scopeType
      if (this.currentTable.scopeType === 'TABLE') {
        this.columnKeyword = ''
      } else {
        this.columnKeyword = ''
        if (
          this.currentTable.columnList &&
          this.currentTable.columnList.length
        ) {
          this.selectedColumns = this.currentTable.columnList
        } else {
          this.currentTable.columnList = this.columnOptions.map(c => c.objectId)
          this.selectedColumns = this.columnOptions.map(c => c.objectId)
        }

        this.isAll = this.selectedColumns.length === this.columnOptions.length
        this.displayColumnOptions.forEach(c => {
          c.disabled = false
        })
      }
    },
    handleIsAllChange(isAll) {
      if (this.isAll) {
        this.clearSelected()
        this.columnOptions.forEach(c => {
          const selectedIndex = this.selectedColumns.findIndex(
            s => s == c.objectId
          )
          if (selectedIndex === -1) {
            this.selectedColumns.push(c.objectId)
            this.currentTable.columnList.push(c.objectId)
          }
        })
        this.isAll = true
      } else {
        this.clearSelected()
      }
    },
    handleSelectedChange(selected) {
      console.log(selected)
      this.currentTable.columnList = selected
      this.selectedColumns = selected
      if (selected.length === this.columnOptions.length) {
        this.isAll = true
      } else {
        this.isAll = false
      }
    },
    // 全部清除
    clearSelected() {
      if (this.currentTable && this.currentTable.columnList) {
        this.currentTable.columnList = []
        const length = this.selectedColumns.length
        this.isAll = false
        for (let i = 0; i < length; i++) {
          this.selectedColumns.splice(0, 1)
        }
        this.currentTable.columnList = []
      }
    },
    // 删除单条已选字段
    deleteColumn(objectId) {
      this.isAll = false
      const selectedIndex = this.selectedColumns.findIndex(s => s == objectId)
      if (selectedIndex > -1) {
        this.selectedColumns.splice(selectedIndex, 1)
      }
      this.currentTable.columnList = _.cloneDeep(this.selectedColumns)
    },
  },
  computed: {
    selectedColumnsDisplay() {
      if (
        this.currentTable &&
        this.currentTable.scopeType !== 'TABLE' &&
        this.columnOptions &&
        this.columnOptions.length
      ) {
        return this.selectedColumns
          .filter(i => !!i)
          .map(i => this.columnOptions.find(c => c.objectId == i))
      } else {
        return []
      }
    },
  },
  watch: {
    assetsList: {
      handler() {
        this.tableData = _.cloneDeep(this.assetsList)
        api
          .getColumnsByTableId(this.assetsList.map(a => a.objectId))
          .then(res => {
            const resData = res.data.data || []
            const columnMap = {}
            resData.forEach(data => {
              this.assetsList
                .filter(asset => asset.objectId == data.tableId)
                .forEach(table => {
                  columnMap[table.assetId] = (data.columnDtoList || []).map(
                    c => ({
                      name: c.alias ? `${c.alias}(${c.name})` : c.name,
                      objectId: c.objectId,
                      disabled: false,
                    })
                  )
                })
            })
            this.columnMap = columnMap
            this.changeCurrentTable(this.tableData[0])
            this.handleScopeTypeChange()
          })
      },
      immediate: true,
      deep: true,
    },
    columnKeyword: {
      handler() {
        this.displayColumnOptions = this.columnOptions
          .filter(c => c.name.indexOf(this.columnKeyword) !== -1)
          .map(column => ({
            ...column,
            disabled: false,
          }))
      },
    },
  },
}
</script>

<style lang="scss">
.batch-scope-dialog {
  .content-inner {
    height: calc(100% - 8px);
  }
  .table-list {
    width: 240px;
    height: 100%;
    padding: 10px 0;
    overflow: auto;
    .table-item {
      height: 56px;
      padding: 0 12px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      &:hover {
        background: rgba(230, 234, 242, 0.4);
      }
      &.active {
        background: rgba(230, 234, 242, 0.4);
        .table-name {
          color: #3c64f0;
        }
      }
      .table {
        float: right;
        margin-top: 1px;
        width: 30px;
        height: 18px;
        background: rgba($color: #2cbed2, $alpha: 0.1);
        color: #2cbed2;
        text-align: center;
        border-radius: 6px;
        font-size: 11px;
        padding-top: 1px;
      }
      .column {
        float: right;
        height: 18px;
        max-width: 60px;
        background: rgba($color: #b44c97, $alpha: 0.1);
        padding: 0px 4px;
        border-radius: 6px;
        color: #b44c97;
      }
      .table-flag {
        position: absolute;
        top: 10px;
        left: 0;
        height: 14px;
        width: 3px;
        background: #3c64f0;
        border-radius: 2px;
      }
      .table-name {
        font-size: 13px;
        color: #354f7b;
        font-weight: 500;
      }
    }
  }
  .column-list {
    width: 240px;
    height: 100%;
    border-left: 1px solid #e6eaf2;
    padding: 10px 12px;
    .datablau-radio {
      height: 32px;
      line-height: 32px;
      .radioTitle {
        color: #7c89a8;
        font-size: 13px;
      }
      .el-radio {
        margin-right: 16px;
      }
      .el-radio__label {
        padding-left: 2px;
      }
      .el-radio__input.is-checked .el-radio__inner {
        border: #3c64f0;
        background: #3c64f0;
      }
      /deep/.datablau-radio .el-radio__inner:hover {
        border-color: #3c64f0;
      }
      .el-radio__input.is-checked + .el-radio__label {
        color: #3c64f0;
      }
    }
    .content-left {
      width: 100%;
      height: calc(100% - 22px);
      padding: 8px 0;
      .column-checkbox {
        width: 100%;
        height: calc(100% - 36px);
        overflow: auto;
        margin-top: 4px;
      }
      .datablau-checkbox2 .el-checkbox__inner {
        border-color: #d6dcea;
      }
      .el-checkbox {
        color: #354f7b;
        cursor: pointer;
      }
      .el-checkbox__input.is-checked + .el-checkbox__label {
        color: #3c64f0;
      }
      .el-checkbox__input.is-checked .el-checkbox__inner {
        background-color: #3c64f0;
      }
    }
    &.scope-table {
      .content-left {
        height: calc(100% - 53px);
        padding-top: 0;
        margin-top: 0;
        .column-checkbox {
          height: calc(100% - 8px);
          margin-top: 0;
          .el-checkbox {
            cursor: default;
          }
          .el-checkbox__input {
            display: none;
          }
          .el-checkbox__label {
            color: #354f7b;
          }
        }
      }
    }
  }
  .selected-list {
    width: calc(100% - 480px);
    height: 100%;
    .content-right {
      width: 100%;
      height: 100%;
      border-left: 1px solid #e6eaf2;
      padding: 8px 12px;
      .el-tag {
        color: #3c64f0;
        background-color: rgba(60, 100, 240, 0.1);
      }
      .el-tag .el-tag__close {
        color: #3c64f0;
        &:hover {
          color: #fff;
          background-color: #3c64f0;
        }
      }
    }
  }
}
.datablau-checkbox2 .el-checkbox-group {
  width: 100%;
}
.datablau-dialog-footer .is-block.important {
  background: #3c64f0;
  border-radius: 4px;
  box-shadow: 0px 2px 8px 0px rgba(60, 100, 240, 0.4);
  border-color: #3c64f0;

  &:hover {
    border-color: transparent;
  }
}
</style>
