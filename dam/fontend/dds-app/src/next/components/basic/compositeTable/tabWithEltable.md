# 组件功能

部分属性原本用于 aggrid 组件, 新组件会尽可能支持原本属性, 但不推荐使用

1. 可以监听的事件

    * cellClick: 单元格被点击 (新, eltable)
    * selectionChange: 选中行改变 (新, eltable)
    * // cellClicked: 单元格被点击 (aggrid, 不推荐)
    * // gridSelectionChanged: 选中行改变 (aggrid, 不推荐)

2. 常用方法

    * refreshData
    * setCurrentPara

3. 常用配置属性

    * columnDefs 字段定义, 类型数组, 每一项中常用的属性:

        * 表头: label (eltable) 或 headerName (aggrid, 不推荐) 
        * 属性: prop 或者 field
        * formatter 函数: formatter (eltable), valueFormatter (aggrid, 不推荐)
        * customColName: 使用的插槽名称, 自定义列使用
        * type: 数组, ['firstEmptyColumn', 'selectionCheckboxColumn', 'iconCol', 'customSortCol', 'optionsWithContent'], 当type 有值时, 会将字段属性用type 中的默认值覆盖, 'customFilter' 不推荐使用

           * firstEmptyColumn 表格第一列 空行
           * selectionCheckboxColumn 表格第一列 复选框
           * iconCol 图标列
           * customSortCol 自定义排序的列
           * optionsWithContent 操作列
           * customCol 自定义列, 可以使用 el table column 的scope, customColName: 字段 slot name, 例如
           
```vue
    <datablau-tab-with-eltable
      class="table-tab-container"
      ref="glossaryTable"
      :totalShow="totalShow"
      :columnDefs="columnDefs"
      :getShowData="getShowData"
      :hideTopLine="hideTopLine"
      :hideBottomLine="hideBottomLine"
      :tableOption="tableOption"
      :tableHidePagination="tableHidePagination"
      :defaultParaData="defaultParaData"
      @gridSelectionChanged="gridSelectionChanged"
    >
      <div v-if="hasAccess" class="right-top" slot="header">
        <el-button size="mini" class="" icon="el-icon-download" @click="downloadFile">下载模板</el-button>
      </div>
      <div class="bottom-line" slot="footer">
        <el-button
          icon="el-icon-delete"
          size="small"  @click="deleteRow" :disabled="deleteDisabled">删除</el-button>
      </div>
      <template class="option-col" slot-scope="scope" slot="optionCol">
        <el-tooltip content="查看词汇" placement="bottom" effect="light">
          <el-button type="text" @click="editGlossary(scope.row)" :icon="hasAccess ? 'fa fa-edit' : 'fa fa-newspaper-o'"></el-button>
        </el-tooltip>
      </template>
    </datablau-tab-with-eltable>
```

```js
    {
        headerName: '操作',
        width: 80,
        type: ['customCol'],
        cellRendererParams: {
            riginComponent: this
        },
        customColName: 'optionCol'
    }
```

