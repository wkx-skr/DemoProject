<template>
  <datablau-dialog
    :visible.sync="visible"
    width="560px"
    height="560px"
    :title="$t('assets.marketplace.editDataScope')"
    :before-close="close"
    custom-class="scope-dialog"
  >
    <div :class="['scope-' + scopeType.toLowerCase()]">
      <datablau-radio
        v-model="scopeType"
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
        v-if="scopeType === 'TABLE'"
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
      <div class="scope-content">
        <div class="content-left">
          <datablau-input
            v-if="scopeType != 'TABLE'"
            v-model="columnKeyword"
            :iconfont-state="true"
            :placeholder="$t('assets.marketplace.placeholder')"
            style="width: 100%"
          ></datablau-input>
          <div class="column-checkbox">
            <datablau-checkbox
              v-if="!columnKeyword && scopeType !== 'TABLE'"
              :checkboxType="'single'"
              v-model="isAll"
              clearable
              :disabled="scopeType === 'TABLE'"
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
        <div class="content-right">
          <div style="height: 32px; line-height: 32px">
            <span style="float: left">
              已选：{{ selectedColumnsDisplay.length }}
            </span>
            <datablau-button
              style="float: right; color: #3c64f0"
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
                max-width: 92px;
                display: flex;
                align-items: center;
                float: left;
              "
            >
              <span
                style="
                  display: inline-block;
                  max-width: calc(100%);
                  text-align: center;
                  height: 24px;
                "
                :style="{
                  maxWidth:
                    scopeType === 'COLUMN' ? 'calc(100% - 16px)' : 'calc(100%)',
                }"
              >
                <is-show-tooltip
                  :content="c.name"
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  "
                ></is-show-tooltip>
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
      <datablau-button
        type="primary"
        @click="confirm"
        class="confirm-btn"
        :disabled="selectedColumns.length === 0"
      >
        {{ $t('common.button.ok') }}
      </datablau-button>
    </div>
  </datablau-dialog>
</template>

<script>
import api from '../../utils/api'
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
export default {
  name: 'DataScope',
  components: { isShowTooltip },
  props: {
    from: {
      type: String,
      default: '',
    },
    visible: {
      type: Boolean,
      default: false,
    },
    isBatch: {
      type: Boolean,
      default: false,
    },
    currentAsset: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      scopeType: 'COLUMN',
      columnKeyword: '',
      selectedColumns: [],
      optionKeys: JSON.stringify({
        value: 'objectId',
        label: 'name',
      }),
      isAll: false,
      columnOptions: [],
      displayColumnOptions: [],
    }
  },
  methods: {
    confirm() {
      if (this.from !== 'details') {
        api
          .toSetCartColumn([
            {
              shoppingId: this.currentAsset.id,
              tableId: this.currentAsset.objectId,
              objectIds: this.selectedColumns,
              allTable: this.scopeType === 'TABLE',
            },
          ])
          .then(res => {
            if (res.status === 200) {
              this.$emit('confirm')
            }
          })
      } else {
        this.$emit('confirm', {
          allTable: this.scopeType === 'TABLE',
          columnList: this.selectedColumns.map(id =>
            this.columnOptions.find(c => c.objectId == id)
          ),
        })
      }
    },
    close() {
      if (this.from === 'details') {
        this.columnKeyword = ''
        this.$emit('close')
      } else {
        this.selectedColumns = []
        this.columnOptions = []
        this.columnKeyword = ''
        this.$emit('close')
      }
    },
    handleScopeTypeChange() {
      this.columnKeyword = ''
      if (this.scopeType === 'TABLE') {
        this.$nextTick(() => {
          this.isAll = true
          this.displayColumnOptions.forEach(c => {
            c.disabled = true
          })
        })
      } else {
        this.isAll =
          this.displayColumnOptions.length === this.selectedColumns.length
        this.displayColumnOptions.forEach(c => {
          c.disabled = false
        })
      }
    },
    handleIsAllChange() {
      if (this.isAll) {
        this.displayColumnOptions.forEach(c => {
          if (this.selectedColumns.findIndex(s => s === c.objectId) === -1) {
            this.selectedColumns.push(c.objectId)
          }
        })
        this.isAll = true
      } else {
        this.displayColumnOptions.forEach(c => {
          const index = this.selectedColumns.findIndex(s => s === c.objectId)
          console.log(index)
          if (index !== -1) {
            this.selectedColumns.splice(index, 1)
          }
        })
      }
    },
    handleSelectedChange(selected) {
      // console.log(selected)
      this.selectedColumns = selected
      if (selected.length === this.displayColumnOptions.length) {
        this.isAll = true
      } else {
        this.isAll = false
      }
    },
    // 全部清除
    clearSelected() {
      const length = this.selectedColumns.length
      for (let i = 0; i < length; i++) {
        this.selectedColumns.splice(0, 1)
      }
      this.isAll = false
    },
    // 删除单条已选字段
    deleteColumn(objectId) {
      const index = this.selectedColumns.findIndex(s => s == objectId)
      if (index > -1) {
        this.isAll = false
        this.selectedColumns.splice(index, 1)
      }
    },
  },
  computed: {
    selectedColumnsDisplay() {
      if (this.scopeType === 'TABLE') {
        return _.cloneDeep(this.displayColumnOptions)
      } else {
        return this.selectedColumns
          .filter(i => i !== null)
          .map(i => this.columnOptions.find(c => c.objectId === i))
      }
    },
    // displayColumnOptions() {
    //   return this.columnOptions.filter(
    //     c => c.name.indexOf(this.columnKeyword) !== -1
    //   )
    // },
  },
  watch: {
    visible: {
      handler() {
        if (this.from == 'details') {
          this.columnKeyword = ''
          api.getColumnsByTableId([this.currentAsset.objectId]).then(res => {
            this.scopeType = this.currentAsset.allTable ? 'TABLE' : 'COLUMN'

            this.columnOptions = (
              ((res.data.data || [])[0] || {}).columnDtoList || []
            ).map(c => {
              if (
                (this.currentAsset.columnList || []).find(
                  item => item.objectId === c.objectId
                ) ||
                this.currentAsset.allTable
              ) {
                this.selectedColumns.findIndex(s => s == c.objectId) == -1 &&
                  this.selectedColumns.push(c.objectId)
              }
              return {
                disabled: this.currentAsset.allTable,
                name: c.alias ? `${c.alias}(${c.name})` : c.name,
                objectId: c.objectId,
              }
            })
            if (this.selectedColumns.length === this.columnOptions.length) {
              this.isAll = true
            }
            this.displayColumnOptions = _.cloneDeep(
              this.columnOptions.filter(
                c => (c.name || '').indexOf(this.columnKeyword) !== -1
              )
            )
          })
        }
      },
    },
    currentAsset: {
      handler() {
        if (this.from != 'details') {
          this.columnKeyword = ''
          api.getColumnsByTableId([this.currentAsset.objectId]).then(res => {
            this.scopeType = this.currentAsset.allTable ? 'TABLE' : 'COLUMN'

            this.columnOptions = (
              ((res.data.data || [])[0] || {}).columnDtoList || []
            ).map(c => {
              if (
                (this.currentAsset.columnList || []).find(
                  item => item.objectId === c.objectId
                ) ||
                this.currentAsset.allTable
              ) {
                this.selectedColumns.push(c.objectId)
              }
              return {
                disabled: this.currentAsset.allTable,
                name: c.alias ? `${c.alias}(${c.name})` : c.name,
                objectId: c.objectId,
              }
            })
            if (this.selectedColumns.length === this.columnOptions.length) {
              this.isAll = true
            }
            this.displayColumnOptions = _.cloneDeep(
              this.columnOptions.filter(
                c => (c.name || '').indexOf(this.columnKeyword) !== -1
              )
            )
          })
        }
      },
      immediate: true,
    },
    columnKeyword: {
      handler() {
        this.displayColumnOptions = this.columnOptions
          .filter(c => c.name.indexOf(this.columnKeyword) !== -1)
          .map(c => ({
            ...c,
            disabled: false,
          }))
        this.isAll = this.displayColumnOptions.every(
          c => this.selectedColumns.indexOf(c.objectId) !== -1
        )
      },
    },
  },
}
</script>

<style lang="scss">
.scope-dialog {
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
  .scope-content {
    margin-top: 12px;
    width: 100%;
    height: 370px;
    border-radius: 6px;
    border: 1px solid #e6eaf2;
    display: flex;
    .content-left {
      width: 240px;
      padding: 8px 12px;
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
    .content-right {
      width: calc(100% - 240px);
      border-left: 1px solid #e6eaf2;
      padding: 8px 12px;
      color: #3c64f0;
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
  .scope-table {
    .scope-content {
      height: 350px;
      .content-left {
        .column-checkbox {
          height: calc(100% - 8px);
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
  .datablau-checkbox2 .el-checkbox-group {
    width: 100%;
  }
  .confirm-btn {
    box-shadow: 0px 2px 8px 0px rgba(60, 100, 240, 0.4);
    margin-left: 20px;
    background: #3c64f0;
    border-radius: 4px;
    border-color: #3c64f0;
    margin-left: 8px;
    &:hover {
      border-color: transparent;
    }
  }
}
</style>
