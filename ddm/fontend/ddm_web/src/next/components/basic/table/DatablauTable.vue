<template>
  <div
    style="position: relative"
    class="db-table"
    :class="{'db-table-black-theme': themeBlack, 'show-right-shadow': showRightShadow}"
  >
    <el-table
      ref="table"
      v-bind="$attrs"
      v-on="$listeners"
      @selection-change="handleSelectionChange"
      class="datablau-table datablau-table-5dot9"
      :class="{ 'header-class': hasHeaderStyle,'black-theme': themeBlack ,'themeBlackHeader': themeBlackHeader}"
      v-loading="vLoading"
      :key="tableKey"
      :height="height"
      :border="border"
      :row-key="rowKey"
      empty-text=" "
    >
      <el-table-column
        v-if="dataSelectable"
        :class-name="selectionClassName"
        type="selection"
        :width="26"
        :reserve-selection="reserveSelection"
        align="center"
        header-align="center"
        :selectable="checkSelect"
      ></el-table-column>

      <el-table-column
        v-if="singleSelect"
        :class-name="selectionClassName"
        :width="47"
        align="center"
        header-align="center"
        :selectable="checkSelect"
      >
        <template slot-scope="scope">
          <el-radio
              class="radioSel"
              :class="{'black-theme': themeBlack}"
              :label="rowKey ? getRowIdentity(scope.row, rowKey) : scope.$index"
              v-model="scopeRadio"
              @change.native="singleSelectChange(scope.$index, scope.row)"
              :disabled="!checkSelect(scope.row, scope.$index)"
          ></el-radio>
        </template>
      </el-table-column>
      <slot v-show="!hasComponentCaseName"></slot>
      <el-table-column
        v-if="hasComponentCaseName && columns.length"
        v-for="c in columns"
        :key="c.props"
        :prop="c.prop"
        :label="c.label"
        :show-overflow-tooltip="c['show-overflow-tooltip']"
        :min-width="c['min-width']"
        :width="c['width']"
        :sortable="c['sortable']"
        :type="c['type']"
        :index="c['index']"
        :column-key="c['column-key']"
        :fixed="c['fixed']"
        :align="c['align']"
        :header-align="c['header-align']"
      >
        <template slot-scope="scope">
          <template v-if="c.type && c.type === 'dataSource'">
            <database-type
              :value="scope.row[c.prop]"
              :size="24"
            ></database-type>
          </template>
          <template v-else>
            <span v-if="c.slotName">
              <slot :name="c.slotName" :scope="scope" />
            </span>
            <span v-else>{{ scope.row[c.prop] }}</span>
          </template>
        </template>
      </el-table-column>
      <el-table-column
        v-if="showColumnSelection && $slots.header"
        :width="35"
        header-align="left"
        class-name="column-selection-column"
      >
        <template slot="header"></template>
      </el-table-column>
      <template
        slot="empty"
        v-if="!$attrs || ($attrs.data && $attrs.data.length == 0)"
      >
        <slot v-if="$slots.empty" name="empty"></slot>
        <datablau-null
          v-else-if="$attrs.data && $attrs.data.length == 0 && showEmpty"
          :tip="$attrs['empty-text']"
          :size="themeBlack?84:svgSize"
          :type="themeBlack?'noResultBlack':svgType"
        ></datablau-null>
      </template>
    </el-table>
    <el-dropdown
      v-if="showColumnSelection && hasComponentCaseName"
      :hide-on-click="false"
      trigger="click"
      style="position: absolute; right: 1px; top: 7px; z-index: 1"
    >
      <span class="el-dropdown-link">
        <datablau-button type="icon" low-key>
          <i class="iconfont icon-setlist"></i>
        </datablau-button>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item v-for="o in allColumns" :key="o.prop">
          <el-checkbox-group
            v-model="columnSelected"
            @change="handleSelectedChange"
            :key="o.prop"
          >
            <el-checkbox :label="o.prop" :key="o.prop" :disabled="o.noconfig">
              {{ o.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <div class="table-shadow" v-if="showRightShadow && rightShadowVisible"></div>
  </div>
</template>

<script>
import DatablauTable from './DatablauTable.js'

export default DatablauTable
</script>

<style lang="scss" scoped>
.table-shadow {
  position: absolute;
  right: -10px;
  left: auto;
  top: 0;
  bottom: 0;
  width: 10px;
  z-index: 5;
  box-shadow: 0 0 10px rgba(0, 0, 0, .12);
}

.db-table {
  /deep/ {
    .el-checkbox__input.is-disabled .el-checkbox__inner {
      background-color: #EFEFEF;
    }
  }

  &.db-table-black-theme {
    /deep/ .el-loading-mask {
      background-color: rgba(0, 0, 0, .5) !important;
      color: #bbb;
    }
  }

  &.show-right-shadow {
    overflow: hidden;
  }
}
</style>

<style lang="scss">
@import '../color';

$table-border-color: #d8d8d8;
$header-bottom: 1px solid $table-border-color;
body .el-tooltip__popper {
  max-width: 560px !important;
  line-height: 20px;
}

.el-table.datablau-table.datablau-table-5dot9,
.el-table.datablau-table.datablau-table-5dot9.el-table--border {
  color: $text-default;

  &::before {
    height: 0 !important;
    background-color: $border-color;
  }

  th {
    height: 40px;
    //border-bottom: $header-bottom;
  }

  td {
    border-top-color: $border-color;
  }

  th .cell {
    color: $text-default;
  }

  // 排序按钮颜色
  .descending.sort-caret {
    border-top-color: $text-disabled;
  }

  .ascending.sort-caret {
    border-bottom-color: $text-disabled;
  }

  .descending .sort-caret.descending {
    border-top-color: $primary-color;
  }

  .ascending .sort-caret.ascending {
    border-bottom-color: $primary-color;
  }

  .el-table-column--selection .cell {
    padding-left: 0;
    padding-right: 0;
  }

  .selection-column {
    &.always {
      .cell {
        display: block;
      }
    }

    .cell {
      display: none;
    }
  }
  .el-table__body tr.hover-row > td {
    background-color: rgba(64, 158, 255, 0.1);
  }

  tr:hover {
    .selection-column .cell {
      display: block;
    }
  }

  td,
  th {
    border-right: none;
  }

  border-bottom: none;
  border-right: none;
  border-left: none;
  border-top: none;

  th {
    border-right: 2px solid transparent;
  }

  &::after {
    width: 0;
  }
}
.header-class {
  thead th {
    background: #f5f5f5;
    color: #555;
    font-size: 12px;
    font-weight: 500;
  }
  .el-table__fixed-right-patch {
    background: #f5f5f5;
  }
}

.el-table.datablau-table.datablau-table-5dot9.el-table--border {
  th.need-border:not(.selection-column) {
    border-right: 2px solid $primary-color;
    transition: border-right-color ease-in-out 0.4s;
  }
}

.db-table {
  height: 100%;
  .el-table__header-wrapper {
    border-bottom: $header-bottom;
  }

  .el-table.datablau-table.datablau-table-5dot9,
  .el-table.datablau-table.datablau-table-5dot9.el-table--border {
    th {
      border-bottom: none;
    }

    th.selection-column + th,
    td.selection-column + td {
      //border: 1px solid red;

      & > div {
        padding-left: 0;
      }
    }
  }

  .el-table--border td:first-child .cell,
  .el-table--border th:first-child .cell,
  .selection-column .cell {
    padding-left: 5px;
    padding-right: 5px;
  }
  .el-table {
    .el-table__row {
      .el-radio.radioSel {
        .el-radio__label {
          display: none;
        }
      }
    }
    .caret-wrapper {
      height: 18px;
    }
    .sort-caret {
      &.ascending {
        top: -3px;
      }
      &.descending {
        bottom: -1px;
      }
    }
    .el-table__empty-block {
      line-height: inherit;
      width: auto !important;
    }
  }
  .el-table{
    .el-table__fixed-right::before, .el-table__fixed::before {
      background: transparent;
    }

    &.black-theme {
      background: #222222 !important;

      th.el-table__cell {
        background-color: #222222 !important;
      }

      .cell {
        color: #BBBBBB !important;
      }

      tr {
        background-color: #222222 !important;
      }
      td{
        border-top-color: #4D4D4D !important;
      }
      td.el-table__cell{
        border-bottom:1px solid #4D4D4D
      }
      .el-table__header-wrapper{
        border-bottom: 1px solid #4D4D4D;
      }
      .el-table__body-wrapper::-webkit-scrollbar-thumb {
        border-radius: 15px;
        background-color: #666666 !important;
      }

      .expand-table.dialogOpen .el-table th.el-table__cell {
        background-color: #222222;
      }

      .expand-table.dialogOpen .el-table tr {
        background-color: #222222;
      }

      .el-table__body tr:hover > td.el-table__cell {
        background-color: rgba(24, 127, 255, .2) !important;
      }

      .el-table__fixed-right::before, .el-table__fixed::before {
        background: transparent;
      }

      .el-table__fixed-right::before {
        background: transparent;
      }

      .el-checkbox__inner {
        background-color: transparent;
        border: 1px solid #888888;
      }

      tr.current-row td {
        background-color: rgba(24, 127, 255, .2) !important;
      }

      .el-checkbox__input.is-checked .el-checkbox__inner {
        border: 1px solid #187FFF;
      }
      .el-checkbox__inner::after{
        border-color:#187FFF;
      }
      .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner{
        background-color:#666;
        border-color: #666;;
      }
      .el-table__fixed-right-patch{
        background: #222222;
        border-color: #666;
      }
      .el-table, .el-table__expanded-cell{
        background-color: #222222;
      }
      .el-loading-mask{
        background-color: rgba(0, 0, 0, .5);
        color: #BBBBBB;
      }
      .el-checkbox__input.is-disabled .el-checkbox__inner{
        background-color: rgba(77, 77, 77, 0.4);
      }
    }
    &.themeBlackHeader{
      th.el-table__cell{
        background-color: #333333;
      }
      .el-table__header-wrapper{
        border-bottom: 1px solid transparent;
      }
    }
  }
  .radioSel{
    &.black-theme{
      .el-radio__inner{
        background-color: transparent;
        border-color: #888888;
      }
      .el-radio__input.is-checked .el-radio__inner{
        background: #187FFF !important;
        border-color: #187FFF;
      }
      .el-radio__input.is-checked .el-radio__inner::after{
        background-color: #333;
      }
      .el-radio__inner::after{
        background-color: transparent;
      }
    }
  }
}
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
  .db-table .el-table .el-table__row .el-table__cell .is-block {
    display: inline !important;
    padding: 0 2px;
  }
}

.el-table__empty-text {
  line-height: inherit;
}

.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell {
  background-color: $light-color-1;
}

.el-table__expand-icon:hover {
  color: $primary-color;
}
</style>
