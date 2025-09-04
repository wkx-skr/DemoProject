<template>
  <div class="datatype-mapping-wrapper">
    <datablau-dialog
      title="选择模型类型"
      width="400px"
      :visible.sync="modelTypeVisible"
      :close-on-click-modal="false"
      append-to-body
    >
      <!--<datablau-select
        size="small" v-model="modelType" clearable
        multiple
        filterable
        placeholder="请选择模型类型"
      >
        <el-option
          v-for="item in dbType.modelTypeList"
          :disabled="dbHeaders.map(i => i.toUpperCase()).includes(item.value.toUpperCase())"
          :value="item.value.toUpperCase()"
          :label="item.text"
          :key="item.value"
        >
          <database-type :value="item.value"></database-type>
        </el-option>
      </datablau-select>-->
      <datablau-select
        size="small" v-model="modelType" clearable
        multiple
        filterable
        placeholder="请选择模型类型"
      >
        <el-option-group
          v-for="group in dbType.DB_TYPE_TREE.subTree"
          :key="group.type"
          :label="isEN ? group.type : group.name">
          <el-option
            :disabled="dbHeaders.map(i => i.toUpperCase()).includes(item.second)"
            v-for="item in group.dataSourceTypeList"
            :value="item.second"
            :label="item.text2 || item.text"
            :key="item.second"
          ></el-option>
        </el-option-group>
      </datablau-select>
      <div slot="footer">
        <datablau-button @click="modelTypeVisible=false,modelType = []">取消</datablau-button>
        <datablau-button type="important" @click="createColumn">确定</datablau-button>
      </div>
    </datablau-dialog>
    <div class="header clearfixed">
      <div>数据类型转换设置</div>
    </div>
    <div class="top-title">
      <div class="search-box">
        <!--请输入关键字-->
        <datablau-input
          class="search-input"
          v-model="keyword"
          placeholder="搜索"
          size="small"
          @input="filter"
          :clearable="true"
          prefix-icon="el-icon-search"
          :iconfont-state="true"
          style="line-height: 32px;"
        ></datablau-input>
      </div>
    </div>
    <div class="table-content">
      <datablau-form-submit>
        <datablau-table
          ref="projectTable"
          class="project-data-list"
          :data="databaseTypeListShow"
          @sort-change="handleSortChange"
          :default-sort = "{prop: 'listUpdateTime', order: 'descending'}"
          height="100%"
          row-key="modelType">
          <el-table-column
            label="模型类型"
            prop="modelType"
            sortable="custom"
          >
            <template slot-scope="scope">
              <database-type :value="scope.row.modelType"></database-type>
            </template>
          </el-table-column>
          <el-table-column
            label="更新人"
            prop="listUpdater"
            sortable="custom"
          >
            <template slot-scope="scope">
              {{scope.row.listUpdater ? scope.row.listUpdater : '--'}}
            </template>
          </el-table-column>
          <el-table-column
            label="更新时间"
            prop="listUpdateTime"
            sortable="custom"
          >
            <template slot-scope="scope">
              {{scope.row.listUpdateTime ? $timeFormatter(scope.row.listUpdateTime) : '--'}}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="80"
            fixed="right"
            header-align="center"
            align="center"
          >
            <template slot-scope="scope">
              <datablau-button type="icon" @click="editDbType(scope.row)" class="iconfont icon-bianji"></datablau-button>
            </template>
          </el-table-column>
        </datablau-table>
        <template slot="buttons">
          <datablau-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            :total="total"
            :layout="'total, sizes, prev, pager, next, jumper'"
          ></datablau-pagination>
        </template>
      </datablau-form-submit>
    </div>
    <div class="database-detail-setting-wrapper" v-if="showDetail" v-loading="detailLoading">
      <div class="title">
        <datablau-breadcrumb
          :node-data="nodeData"
          :separator="'/'"
          :couldClick="false"
          @back="backClick"
        ></datablau-breadcrumb>
        <div v-if="currentDb.listUpdateTime" class="update">最近更新：{{$timeFormatter(currentDb.listUpdateTime)}}</div>
      </div>
      <div class="search-panel">
        <datablau-input
          class="search-input"
          v-model="sqlSearch"
          placeholder="搜索表头"
          size="small"
          @input="sqlSearchChanged"
          :clearable="true"
          prefix-icon="el-icon-search"
          :iconfont-state="true"
        ></datablau-input>
        <datablau-input
          style="margin-left: 6px;"
          class="search-input"
          v-model="sqlSearch1"
          placeholder="搜索第一列"
          size="small"
          @input="sqlSearchChanged1"
          :clearable="true"
          prefix-icon="el-icon-search"
          :iconfont-state="true"
        ></datablau-input>
        <div class="btn-operator">
          <el-popover
            placement="bottom"
            trigger="hover"
            popper-class="datatype-mapping-wrapper-popover">
            <div class="write-hint-wrapper">
              <div class="wrapper">
                <div class="title">表头：模型的类型</div>
                <div class="content">
                  <div class="left">首列：<br/>当前要设置<br/>的模型类型</div>
                  <div class="right">后续列为首列模型转换为<br/>某类型时对应的数据类型</div>
                </div>
              </div>
            </div>
            <datablau-button style="margin-right: 6px;" slot="reference" type="text" class="iconfont icon-wenti">
              填写说明
            </datablau-button>
          </el-popover>
          <datablau-button @click="addRow">新建行</datablau-button>
          <datablau-button @click="addColumn">新建列</datablau-button>
          <datablau-dropdown @command="handleCommand" style="display: inline-block;margin-left: 6px;">
            <datablau-button type="secondary">更多操作<i class="el-icon-arrow-down el-icon--right"></i></datablau-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item icon="iconfont icon-import" command="import">
                <datablau-upload
                  :headers="$headers"
                  style="display: inline-block"
                  :mini="true"
                  :isEdit="true"
                  :drag="true"
                  :action="`${this.$url}/service/datatype/upload/${this.currentDb.modelType && this.currentDb.modelType.toUpperCase()}`"
                  :show-file-list="false"
                  list-type="text"
                  accept=".xlsx"
                  :on-success="handleUploadSuccess"
                  :on-error="handleUploadError"
                >
                  导入数据
                </datablau-upload>
              </el-dropdown-item>
              <el-dropdown-item command="export" icon="iconfont icon-export">导出数据</el-dropdown-item>
            </el-dropdown-menu>
          </datablau-dropdown>
        </div>
      </div>
      <div class="content-detail table-box1">
        <ag-grid-vue
          :key="tableKey"
          v-if="columnDefs.length > 1"
          ref="aggrid"
          style="width: 100%; height: 100%"
          class="ag-theme-balham finder-table"
          id="myGrid"
          :columnDefs="columnDefs"
          @grid-ready="onGridReady"
          :defaultColDef="defaultColDef"
          :frameworkComponents="frameworkComponents"
          :rowData="mappingTableData"
        ></ag-grid-vue>
        <datablau-table
          v-if="false"
          style="user-select: none;"
          class="datablau-table"
          :data="mappingTableData"
          @sort-change="handleSortChange"
          :cell-style="{height: '30px'}"
          :border="true"
          height="100%"
          @focusin.native="handleFocusIn"
          @focusout.native="handleFocusOut"
          @cell-mouse-enter="handleCellMouseEnter"
          @cell-mouse-leave="handleCellMouseLeave"
          @mousedown.native="handleTableMouseDown"
          @mouseup.native="handleTableMouseUp"
          :cell-class-name="tableCellClassName"
          @paste.native="handleTablePaste"
          @copy.native="handleTableCopy">
          <!--<el-table-column fixed label="" width="50">
            <template slot-scope="scope">{{scope.$index+1}}</template>
          </el-table-column>-->
          <template v-for="(headerName, index) in dbHeaders">
            <el-table-column
              :key="headerName"
              width="190"
              :fixed="!index"
            >
              <div slot="header">
                <database-type style="display: inline-block" :value="headerName"></database-type>
                <datablau-button @click="deleteColumn(index)" v-if="index" style="display: inline-block;margin-left: 5px;" type="icon" class="iconfont icon-delete"></datablau-button>
              </div>
              <template slot-scope="scope">
                <el-form
                  label-position="right"
                  :model="mappingTableData[scope.$index]"
                  :key="headerName"
                  :ref='`name-form${scope.$index}`'
                  size="mini">
                  <el-form-item
                    class="input-content-box"
                    :prop="headerName"
                    style="margin-bottom:1px;"
                    :rules="!index ?rules : {}"
                  >
<!--                    <datablau-input :class="caculateBorderClass(scope)" @change="changed=true" v-model="scope.row[headerName]"></datablau-input>-->
                    <el-input :class="caculateBorderClass(scope)" @change="changed=true" type="text" v-model="scope.row[headerName]"></el-input>
                  </el-form-item>
                </el-form>
              </template>
            </el-table-column>
          </template>
          <el-table-column
            min-width="50"
            show-overflow-tooltip
            fixed="right"
            label="操作">
            <template slot-scope="scope">
              <datablau-button style="margin-left: 10px;vertical-align:middle;" @click="deleteRow(scope.$index)" type="icon" class="iconfont icon-delete"></datablau-button>
            </template>
          </el-table-column>
        </datablau-table>
      </div>
      <div class="button-wrapper">
        <datablau-button type="secondary" @click="resetTableData">重置</datablau-button>
        <datablau-button type="important" @click="saveTableData">保存</datablau-button>
      </div>
    </div>
  </div>
</template>

<script>
import dbType from '@/components/dataSource/databaseType.js'
import DatabaseType from '@/components/common/DatabaseType.vue'
import sort from '@/resource/utils/sort'
import $ from 'jquery'
import { AgGridVue } from 'ag-grid-vue'
import '@/../node_modules/ag-grid-community/dist/styles/ag-grid.css'
import '@/../node_modules/ag-grid-community/dist/styles/ag-theme-balham.css'
import Vue from 'vue'
import headerCom from './headerCom'
export default {
  data () {
    return {
      currentI: -1, // 表头
      currentJ: -1, // 第一列
      isEN: window.lang === 'English',
      sqlSearch: '',
      sqlSearch1: '',
      tableKey: 0,
      defaultColDef: {
        flex: 1,
        // minWidth: 200,
        suppressMovable: true
      },
      frameworkComponents: {
        agColumnHeader: headerCom
      },
      columnDefs: [],
      drag: false,
      dragStart: {
        row: -1,
        column: -1
      },
      tempRow: -1,
      tempColumn: -1,
      tempFocusRow: -1,
      tempFocusColumn: -1,
      isFocusArea: false,
      isFocusOnly: false,
      changed: false,
      detailLoading: false,
      modelType: [],
      modelTypeVisible: false,
      mapping: {},
      mappingTableData: [],
      mappingTableDataBak: [],
      rowTemplate: {},
      currentDb: {},
      dbHeaders: [],
      dbHeadersBak: [],
      nodeData: [`数据类型转换`, `编辑${this.currentDb?.name}模型`],
      showDetail: false,
      keyword: '',
      databaseTypeList: [],
      databaseTypeListShow: [],
      total: 0,
      pageSize: 20,
      currentPage: 1,
      dbType,
      rules: {
        validator: this.firstColumnValidate,
        trigger: ['change']
      }
    }
  },
  components: {
    DatabaseType,
    AgGridVue
  },
  mounted () {
    console.log(dbType)
    setTimeout(() => {
      this.getMappingList()
    }, 500)
    document.addEventListener('keydown', this.escKeydown)
  },
  beforeDestroy () {
    document.removeEventListener('keydown', this.escKeydown)
  },
  watch: {
    showDetail (val) {
      if (val) {
        this.getDbMapping()
      }
    }
  },
  methods: {
    sqlSearchChanged () {
      let query = this.sqlSearch
      if (!query) {
        this.currentI = -1
        return
      }
      let sqlArr = this.databaseTypeList.filter(type => this.dbHeaders.includes(type.modelType.toUpperCase()))
      let type = _.cloneDeep(sqlArr).sort((a, b) => this.dbHeaders.indexOf(a.modelType.toUpperCase()) - this.dbHeaders.indexOf(b.modelType.toUpperCase())).find(type => type.name?.toUpperCase().indexOf(query.toUpperCase()) > -1)
      if (type) {
        let index = this.dbHeaders.findIndex(head => head === type.modelType.toUpperCase())
        this.currentI = index
        $('.ag-body-horizontal-scroll-viewport').scrollLeft(index * 200 - 200)
      } else {
        this.currentI = -1
      }
    },
    sqlSearchChanged1 () {
      let query = this.sqlSearch1
      if (!query) {
        this.currentJ = -1
        return
      }
      let indexj = this.mappingTableData.findIndex(data => data[this.currentDb.modelType.toUpperCase()].toUpperCase().indexOf(query.toUpperCase()) > -1)
      if (indexj !== -1) {
        $('.ag-body-viewport.ag-layout-normal').scrollTop(indexj * 25)
      }
      this.currentJ = indexj
    },
    onGridReady (params) {
      this.gridApi = params.api
    },
    escKeydown (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        let activeEle = document.activeElement
        if (activeEle.tagName === 'INPUT') {
          let $newInput = null
          let $input = $(document.activeElement)
          let text = $input.val()
          if (e.key === 'ArrowRight' && activeEle.selectionEnd === text.length) { // 下一个
            $newInput = $input.closest('td').next('td').find('input')
            $newInput.focus()
          } else if (e.key === 'ArrowLeft' && activeEle.selectionStart === 0) { // 上一个
            $newInput = $input.closest('td').prev('td').find('input')
            $newInput.focus()
          }
        }
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        let activeEle = document.activeElement
        if (activeEle.tagName === 'INPUT') {
          let $input = $(document.activeElement)
          let index = $input.closest('tr').children('td').index($input.closest('td'))
          let $newInput = null
          if (e.key === 'ArrowUp') { // 上一个
            $newInput = $($input.closest('tr').prev('tr').children('td')[index]).find('input')
            $newInput.focus()
          } else if (e.key === 'ArrowDown') { // 下一个
            $newInput = $($input.closest('tr').next('tr').children('td')[index]).find('input')
            $newInput.focus()
          }
          const mousedownEvent = new MouseEvent('mousedown', {
            bubbles: true, // 是否冒泡
            cancelable: true, // 是否可取消
            view: window // 事件所属的窗口对象
          })
          const mouseupEvent = new MouseEvent('mouseup', {
            bubbles: true, // 是否冒泡
            cancelable: true, // 是否可取消
            view: window // 事件所属的窗口对象
          })
          $newInput[0]?.dispatchEvent(mousedownEvent)
          $newInput?.click()
          $newInput[0]?.dispatchEvent(mouseupEvent)
        }
      }
    },
    async handleTableCopy (e) {
      if (this.isFocusArea) {
        e.preventDefault()
        let str = ''
        for (let i = this.startRow; i <= this.endRow; i++) {
          for (let j = this.startColumn; j <= this.endColumn; j++) {
            let item = this.mappingTableData[i]
            str += (item[this.dbHeaders[j]] || '') + '\t'
          }
          str = str.substr(0, str.length - 1)
          str += '\r\n'
        }
        str = str.substr(0, str.length - 2)
        e.clipboardData.setData('text/plain', str)
      }
    },
    isFocusAreaText (str) {
      let arr = str.split('\r\n')
      if (arr.length > 1) {
        return true
      }
      for (let i = 0; i < arr.length; i++) {
        let item = arr[i].split('\t')
        if (item.length > 1) {
          return true
        }
      }
      return false
    },
    async handleTablePaste (evt) {
      let paste = (evt.clipboardData || window.clipboardData).getData('text')
      console.log(paste)
      if (this.isFocusArea || this.isFocusAreaText(paste)) {
        evt.preventDefault()
        let rows = paste.split(/\r\n/)
        if (!rows.length) {
          return
        }
        let rowStart = this.isFocusArea ? this.startRow : this.tempFocusRow
        let firstI = this.isFocusArea ? this.startColumn : this.tempFocusColumn
        if (rows.length > this.mappingTableData.length - rowStart) {
          try {
            await this.$confirm(`是否创建新映射类型？`, '', {
              type: 'warning'
            })
            for (let i = 0; i <= rows.length - (this.mappingTableData.length - rowStart); i++) {
              this.addRow()
            }
          } catch (e) {
            rows.splice(this.mappingTableData.length - rowStart + 1)
          }
        }
        for (let i = 0; i < rows.length; i++) {
          if (rows[i]) {
            let rowsArr = rows[i].split(/\t/)
            let item = this.mappingTableData[rowStart + i]
            for (let j = firstI; j < Math.min(firstI + rowsArr.length, this.dbHeaders.length); j++) {
              item[this.dbHeaders[j]] = rowsArr[j - firstI]
            }
          }
        }
      }
    },
    caculateBorderClass (scope) {
      let i = scope.$index
      let j = scope.column.columnIndex
      let borderClass = ''
      if (scope.row.focusArea && scope.row.focusArea[this.dbHeaders[j]]) { // 需要边框
        if (i === 0 || !this.mappingTableData[i - 1].focusArea[this.dbHeaders[j]]) {
          borderClass += 'top '
        }
        if (i === this.mappingTableData.length - 1 || !this.mappingTableData[i + 1].focusArea[this.dbHeaders[j]]) { // 需要上边框
          borderClass += 'bottom '
        }
        if (!scope.row.focusArea[this.dbHeaders[j - 1]]) {
          borderClass += 'left '
        }
        if (!scope.row.focusArea[this.dbHeaders[j + 1]]) {
          borderClass += 'right '
        }
        return borderClass
      } else {
        return ''
      }
    },
    handleTableMouseDown (e) {
      if (e.target.className.indexOf('el-table__body-wrapper') !== -1) {
        return
      }
      this.drag = true
      this.dragStart.row = this.tempRow
      this.dragStart.column = this.tempColumn
      this.tempFocusRow = this.tempRow
      this.tempFocusColumn = this.tempColumn
      // if (!$(evt.target).parents('td').hasClass('focus')) {
      this.mappingTableData = this.mappingTableData.map(obj => ({
        ...obj,
        focusArea: Object.keys(obj).reduce((pre, cur) => {
          return {
            ...pre,
            [cur]: false
          }
        }, {})
      }))
      // }
      // this.allCols[this.tempFocusRow].focusArea.splice(this.tempFocusColumn, 1, true)
      this.isFocusArea = false
    },
    handleTableMouseUp (evt) {
      this.drag = false
      this.dragStart.row = -1
      this.dragStart.column = -1
    },
    handleCellMouseLeave (row, column, cell, event) {
      if (this.drag) {

      }
    },
    handleCellMouseEnter (row, column, cell, event) {
      this.tempRow = row.rowIndex
      this.tempColumn = column.columnIndex
      if (this.drag) {
        if (this.dragStart.row !== -1) {
          let tempRow = row.rowIndex
          let tempColumn = column.columnIndex
          this.drawArea(this.dragStart.row, this.dragStart.column, tempRow, tempColumn)
        }
      }
    },
    drawArea (startRow, startColumn, endRow, endColumn) {
      if (startRow > endRow) {
        this.drawArea(endRow, startColumn, startRow, endColumn)
        return
      }
      if (startColumn > endColumn) {
        this.drawArea(startRow, endColumn, endRow, startColumn)
        return
      }
      this.startRow = startRow
      this.endRow = endRow
      this.startColumn = startColumn
      this.endColumn = endColumn
      this.mappingTableData.forEach((item, index) => {
        for (let k in item.focusArea) {
          item.focusArea[k] = false
        }
        if (index >= startRow && index <= endRow) {
          for (let i = startColumn; i <= endColumn; i++) {
            item.focusArea[this.dbHeaders[i]] = true
          }
        }
      })
      this.isFocusArea = true
    },
    tableCellClassName ({ row, column, rowIndex, columnIndex }) {
      row.rowIndex = rowIndex
      column.columnIndex = columnIndex
      if (row.focusArea && row.focusArea[this.dbHeaders[columnIndex]]) {
        return 'focus'
      } else {
        return ''
      }
    },
    handleFocusIn (event) {
      clearTimeout(this.focusTimeout)
      this.isFocusOnly = true
    },
    handleFocusOut (event) {
      this.focusTimeout = setTimeout(() => {
        this.isFocusOnly = false
      }, 500)
    },
    firstColumnValidate (rule, value, callback) {
      if (!(value?.trim())) {
        callback(new Error('类型名是必填的'))
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.$showFailure('类型名是必填的')
        }, 200)
      } else {
        if (this.checkDuplicate(value)) {
          callback(new Error(`类型名 ${value}重名`))
          clearTimeout(this.timer)
          this.timer = setTimeout(() => {
            this.$showFailure(`类型名 ${value} 重名`)
          }, 200)
        } else {
          callback()
        }
      }
    },
    checkDuplicate (value) {
      let idx = 0
      this.mappingTableData.forEach(v => {
        if (v[this.currentDb.modelType.toUpperCase()].toUpperCase() === value.toUpperCase()) { // 类型不区分大小写
          idx++
        }
      })
      if (idx > 1) {
        return true
      } else {
        return false
      }
    },
    saveTableData () {
      console.log(this.$refs.aggrid)
      if (this.dbHeaders.length <= 1 && this.mappingTableData.length) {
        this.$datablauMessage.error('至少添加一个转换列才可以保存！')
        return
      }
      let v = this.$refs.aggrid.$children.every(children => {
        let tValid = true
        children.$refs['name-form']?.validate((valid) => {
          tValid = valid
        })
        return tValid
      })
      if (!v) {
        return
      }
      let res = {}
      for (let i = 1; i < this.dbHeaders.length; i++) {
        let header = this.dbHeaders[i]
        res[header.toUpperCase() === 'GAUSSDBA' ? 'GAUSSA' : header.toUpperCase()] = {}
        this.mappingTableData.forEach(item => {
          res[header.toUpperCase() === 'GAUSSDBA' ? 'GAUSSA' : header.toUpperCase()][item[this.currentDb.modelType.toUpperCase()]] = item[header]
        })
      }
      this.$http.post(this.$url + '/service/datatype/' + (this.currentDb.modelType.toUpperCase() === 'GAUSSA' ? 'GAUSSDBA' : this.currentDb.modelType.toUpperCase()), {
        datatypeMap: res
      }).then(res => {
        this.$datablauMessage.success('保存成功！')
        this.changed = false
        this.getDbMapping()
        this.currentDb.listUpdateTime = Date.now()
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    deleteRow (index) {
      this.$DatablauCofirm(`确定要删除这一行映射吗`, 'warning').then(() => {
        this.mappingTableData.splice(index, 1)
        this.sqlSearchChanged1()
        this.changed = true
      }).catch()
    },
    deleteColumn (index) {
      let headerName = this.dbHeaders[index]
      let name = this.dbType.dbMapObj[headerName.toUpperCase() === 'GAUSSA' ? 'GAUSSDBA' : headerName.toUpperCase()].text2 || this.dbType.dbMapObj[headerName.toUpperCase() === 'GAUSSA' ? 'GAUSSDBA' : headerName.toUpperCase()].text
      this.$DatablauCofirm(`确定要删除${name}映射吗`, 'warning').then(() => {
        this.dbHeaders.splice(index, 1)
        this.mappingTableData.forEach(item => {
          delete item[headerName]
        })
        this.getColumnDefs()
        this.sqlSearchChanged()
        this.changed = true
      }).catch()
    },
    resetTableData () {
      this.dbHeaders = _.cloneDeep(this.dbHeadersBak)
      this.getColumnDefs()
      this.mappingTableData = _.cloneDeep(this.mappingTableDataBak)
      this.tableKey++
    },
    createColumn () {
      if (!this.modelType.length) {
        this.$datablauMessage.error('请选择模型类型')
        return
      }
      this.modelType.forEach(modelType => {
        this.dbHeaders.push(modelType)
        this.$set(this.rowTemplate, modelType, '')
        this.mappingTableData.forEach(item => {
          this.$set(item, modelType, '')
        })
      })
      this.modelType = []
      this.modelTypeVisible = false
      this.getColumnDefs()
      this.tableKey++
      clearTimeout(this.scrollTimer)
      this.scrollTimer = setTimeout(() => {
        this.$nextTick(() => {
          $('.el-table__body-wrapper').scrollLeft(10000000)
          $('.ag-body-horizontal-scroll-viewport').scrollLeft(10000000)
          // $('.el-table__body-wrapper tr:first-child td:last-child input')[0].focus()
        })
      }, 100)
      this.changed = true
    },
    handleUploadSuccess (response) {
      console.log(response)
      let arr = response.split('\n')
      let resData = []
      this.mappingTableData = []
      arr.slice(1).forEach((line, i) => {
        let item = line.split('\t')
        resData.push(item)
        this.mappingTableData.push({})
      })
      this.dbHeaders = []
      this.rowTemplate = {}
      let existDbType = new Set()
      let sameDb = new Set()
      arr[0]?.split('\t').forEach((header, j) => {
        if (!existDbType.has(header.toUpperCase())) {
          if (header && this.dbType.dbMap[header.toUpperCase()]) {
            existDbType.add(header.toUpperCase())
            this.dbHeaders.push(header.toUpperCase())
            this.rowTemplate[header.toUpperCase()] = ''
            resData.forEach((line, i) => {
              if (line[j] !== undefined) {
                this.$set(this.mappingTableData[i], header.toUpperCase(), line[j])
              } else {
                this.$set(this.mappingTableData[i], header.toUpperCase(), '')
              }
              // this.mappingTableData[i][header] = line[j]
            })
          }
        } else {
          sameDb.add(header.toUpperCase())
        }
      })
      this.getColumnDefs()
      // this.getDbMapping()
      if (sameDb.size) {
        this.$blauShowSuccess(`已有${[...sameDb].join(',')}数据类型，无需重复录入，请及时保存您的数据`)
      } else {
        this.$blauShowSuccess('导入成功，请及时保存您的数据')
      }
    },
    handleUploadError (err) {
      this.$showFailure(err)
    },
    handleCommand (command) {
      if (command === 'import') {

      } else if (command === 'export') {
        if (this.changed) {
          this.$DatablauCofirm(`当前编辑未保存，确定导出上一次保存的数据吗？`, 'warning').then(() => {
            this.$datablauDownload(this.$url + `/service/datatype/export/${this.currentDb.modelType.toUpperCase()}`)
          }).catch()
        } else {
          this.$datablauDownload(this.$url + `/service/datatype/export/${this.currentDb.modelType.toUpperCase()}`)
        }
      }
    },
    addRow () {
      this.mappingTableData.push(_.cloneDeep(this.rowTemplate))
      clearTimeout(this.scrollTimer)
      this.scrollTimer = setTimeout(() => {
        this.$nextTick(() => {
          $('.el-table__body-wrapper').scrollTop(10000000)
          $('.ag-body-viewport.ag-layout-normal.ag-row-no-animation').scrollTop(10000000)
          // $('.el-table__fixed-body-wrapper tr:last-child input')[0].focus()
        })
      }, 100)
      this.changed = true
    },
    addColumn () {
      this.modelTypeVisible = true
    },
    getDbMapping () {
      this.changed = false
      this.nodeData = [`数据类型转换`, `编辑${this.currentDb?.name}模型`]
      this.detailLoading = true
      this.dbHeaders = [this.currentDb.modelType.toUpperCase()]
      this.$http.get(this.$url + '/service/datatype/' + (this.currentDb.modelType.toUpperCase() === 'GAUSSA' ? 'GAUSSDBA' : this.currentDb.modelType.toUpperCase())).then(res => {
        console.log(res.data)
        this.mapping = res.data.datatypeMap
        if (this.mapping) {
          this.dbHeaders = this.dbHeaders.concat(Object.keys(this.mapping))
          this.typeSet = new Set()
          for (let key in this.mapping) {
            for (let type in this.mapping[key]) {
              this.typeSet.add(type)
            }
          }
          this.rowTemplate = {}
          this.rowTemplate[this.currentDb.modelType.toUpperCase()] = ''
          for (let key in this.mapping) {
            this.rowTemplate[key.toUpperCase()] = ''
          }
          this.mappingTableData = Array.from(this.typeSet).map((type, index) => {
            let res = {
              [this.currentDb.modelType.toUpperCase()]: type
            }
            for (let key in this.mapping) {
              if (this.mapping[key][type]) {
                res[key.toUpperCase()] = this.mapping[key][type]
              } else {
                res[key.toUpperCase()] = ''
              }
            }
            return res
          })
          this.mappingTableData = this.mappingTableData.map(obj => ({
            ...obj,
            focusArea: Object.keys(obj).reduce((pre, cur) => {
              return {
                ...pre,
                [cur]: false
              }
            }, {})
          }))
          this.mappingTableDataBak = _.cloneDeep(this.mappingTableData)
          this.dbHeadersBak = _.cloneDeep(this.dbHeaders)
        } else {
          this.rowTemplate[this.currentDb.modelType.toUpperCase()] = ''
          this.mappingTableData = []
          this.mappingTableDataBak = []
          this.dbHeadersBak = _.cloneDeep(this.dbHeaders)
        }
        this.getColumnDefs()
        this.detailLoading = false
      }).catch((err) => {
        this.$showFailure(err)
        this.detailLoading = false
      }).finally(() => {
        this.detailLoading = false
      })
    },
    getColumnDefs () {
      this.columnDefs = [
        ...this.dbHeaders.map((headerName, index) => {
          return {
            // headerName: headerName,
            field: headerName,
            minWidth: 200,
            cellRenderer: 'agGroupCellRenderer',
            pinned: !index ? 'left' : '',
            headerComponentParams: {
              options: {
                headerName,
                index,
                This: this
              }
            },
            cellRendererParams: {
              innerRendererFramework: Vue.extend({
                template: `<el-form
                              label-position="right"
                              :model="params.options.This.mappingTableData[params.rowIndex]"
                              :key="params.options.headerName"
                              ref="name-form"
                              size="mini">
                              <el-form-item
                                class="input-content-box"
                                :prop="params.options.headerName"
                                style="margin-bottom:1px;"
                                :rules="!params.options.index ?params.options.This.rules : {}"
                              >
                                  <el-input :class="{focus: params.options.This.currentJ === params.rowIndex && params.options.index === 0}" @change="params.options.This.changed=true" type="text" v-model="params.data[params.options.headerName]"></el-input>
                              </el-form-item>
                            </el-form>`
              }),
              options: {
                headerName,
                index,
                This: this
              }
            }
          }
        }),
        {
          headerName: '操作',
          field: this.dbHeaders[0],
          width: 70,
          pinned: 'right',
          cellRenderer: 'agGroupCellRenderer',
          cellRendererParams: {
            innerRendererFramework: Vue.extend({
              template: `<datablau-button style="margin-left: 23px;vertical-align:top;" @click="params.options.This.deleteRow(params.rowIndex)" type="icon" class="iconfont icon-delete"></datablau-button>`
            }),
            options: {
              This: this
            }
          }
        }
      ]
    },
    backClick () {
      if (this.changed) {
        this.$DatablauCofirm('当前编辑还未保存确定要返回？', '提示', {
          type: 'warning',
          cancelButtonText: '取消',
          confirmButtonText: '返回'
        }).then(() => {
          this.showDetail = false
          this.getMappingList()
        }).catch(() => {

        })
      } else {
        this.showDetail = false
        this.getMappingList()
      }
    },
    filter () {
      this.getPageShowData()
    },
    handleSizeChange (size) {
      this.pageSize = size
      this.getPageShowData()
    },
    handleCurrentChange (current) {
      this.currentPage = current
      this.getPageShowData()
    },
    getPageShowData () {
      if (this.keyword) {
        let tempArr = this.databaseTypeList.filter(item => item.name?.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1 || item.listUpdater?.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1)
        this.total = tempArr.length
        this.currentPage = 1
        this.databaseTypeListShow = tempArr.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
      } else {
        this.total = this.databaseTypeList.length
        this.databaseTypeListShow = this.databaseTypeList.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
      }
    },
    handleSortChange ({ prop, order }) {
      sort.sort(this.databaseTypeList, prop, order)
      this.getPageShowData()
    },
    editDbType (dbType) {
      this.currentDb = dbType
      this.showDetail = true
    },
    getMappingList () {
      this.sqlSearch = ''
      this.$http.get(this.$url + '/service/datatype/list').then(res => {
        this.databaseTypeList = res.data
        let dbMapCopy = _.cloneDeep(dbType.dbMapObj)
        res.data.forEach(item => {
          item.name = dbMapCopy[item.modelType.toUpperCase()]?.text2 || dbMapCopy[item.modelType.toUpperCase()]?.text
          delete dbMapCopy[item.modelType.toUpperCase()]
        })
        this.databaseTypeList = this.databaseTypeList.concat(Object.keys(dbMapCopy).map(type => ({
          listUpdateTime: 0,
          listUpdater: '',
          modelType: dbMapCopy[type].second,
          name: dbMapCopy[type].text2 || dbMapCopy[type].text
        })))
        this.currentPage = 1
        this.total = this.databaseTypeList.length
        // this.getPageShowData()
        if (this.$refs.projectTable?.$refs?.table?.defaultSort) {
          this.handleSortChange(this.$refs.projectTable?.$refs?.table?.defaultSort)
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    }
  }
}
</script>

<style scoped lang="scss">
  .el-select-dropdown__item.is-disabled:before {
    background: #f5f5f5;
  }
  .search-panel {
    margin-top: 10px;
  }
  .table-box1 /deep/ input {
    position: absolute;
    top: 0;
    left: 0;
    width: auto!important;
    right: 1px;
    bottom: 0;
    height: 24px!important;
    line-height: 24px!important;
    box-sizing: border-box;
  }
  .table-box1 /deep/ .is-error input {
    border: 1px solid #F56C6C;
  }
  .table-box1 /deep/ input:focus {
    background-color: rgba(64, 158, 255, 0.1) !important;
    border: 1px solid rgb(64, 158, 255);
    border-radius: 0px;
  }
  /deep/ .ag-theme-balham .ag-ltr .ag-has-focus .ag-cell-focus:not(.ag-cell-range-selected) {
    border-color: transparent!important;
  }
  .table-box1 /deep/ .focus input {
    background-color: rgba(64, 158, 255, 0.1) !important;
    border: 1px solid rgb(64, 158, 255);
    border-radius: 0px;
  }
  .table-box1 /deep/ {
    .el-table__row td:last-child .cell {
      border-right: 1px solid #ddd;
    }
    .table-header-class {
      th {
        background-color: #F5F5F5;
      }
    }
    .el-table--border th.is-leaf {
      border-right: 2px solid #EBEEF5;
    }
    .el-table--border th.is-leaf.is-hidden {
      border: none;
    }
    .el-table__fixed-header-wrapper tr:first-child th:first-child {
      border-right: 5px solid #EBEEF5;
    }
    .el-table__body {
      .el-select {
        vertical-align: top;
      }
      .el-checkbox {
        line-height: 30px;
        height: 30px;
      }
      i.el-icon-check {
        height: 30px;
        line-height: 30px;
      }
      tr > td .is-error input {
        color: #F56C6C;
      }
      tr > td.focus .top input {
        border-top: 1px solid rgb(64, 158, 255)
      }
      tr > td.focus .left input {
        border-left: 1px solid rgb(64, 158, 255)
      }
      tr > td.focus .right input {
        border-right: 1px solid rgb(64, 158, 255)
      }
      tr > td.focus .bottom input {
        border-bottom: 1px solid rgb(64, 158, 255)
      }
      tr > td input:focus {
        background-color: rgba(64, 158, 255, 0.1) !important;
        border: 1px solid rgb(64, 158, 255)
      }
      tr td.focus input {
        position: relative;
        background-color: rgba(64, 158, 255, 0.1) !important;
        border: none;
      }
      .cell {
        position: absolute;
        top: 0;
        left: 1px;
        right: 1px;
        bottom: -1px;
      }
    }
    .el-input {
      vertical-align: top;
    }
    td {
      vertical-align: top;
    }
    input {
      padding: 0 5px;
      width: 100%;
      height: 30px;
      line-height: 30px;
      vertical-align: inherit;
      border: none;
      background-color: unset;
      outline: unset;
    }
    button {
      padding: 0;
      height: 30px!important;
      vertical-align: inherit;
      border: none;
      background-color: unset;
    }
    .el-table__body, .el-table__footer, .el-table__header {
      border-collapse: collapse;
    }
    .el-table--border {
      border: none;
    }
    .el-table__header-wrapper {
      table {
        border-right: 1px solid #EBEEF5;
        /*border-top: 1px solid #EBEEF5;*/
      }
    }
    .el-table__fixed-header-wrapper {
      table {
        border-left: 1px solid #EBEEF5;
        /*border-top: 1px solid #EBEEF5;*/
      }
    }
    .el-table__body-wrapper {
      table {
        border: 1px solid #EBEEF5;
        border-top: none;
        .cell {
          padding-left: 0;
          padding-right: 0;
        }
      }
    }
    .el-table__fixed-body-wrapper {
      table {
        border: 1px solid #EBEEF5;
        border-top: none;
        .cell {
          padding-left: 0;
          padding-right: 0;
        }
      }
    }
  }
  /deep/ .el-upload-dragger {
    border: none!important;
    background: unset!important;
    padding: 0!important;
    text-align: left;
  }
.datatype-mapping-wrapper {
  .header {
    height: 40px;
    font-size: 16px;
    line-height: 40px;
    margin-top: -20px;

    div {
      float: left;
      margin-right: 5px;
      font-weight: bold;

    }

    i {
      float: left;
      padding-top: 5px;
      cursor: pointer;
      color: #7D8493;
    }
  }
  .table-content {
    position: absolute;
    top: 75px;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .database-detail-setting-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: #fff;
    padding: 12px 20px;
    z-index: 10;
    .title {
      padding-bottom: 12px;
      border-bottom: 1px solid #E0E0E0;
      .db-breadcrumb {
        display: inline-block;
      }
      .update {
        margin-left: 5px;
        color: #777;
        display: inline-block;
      }
    }
    .btn-operator {
      float: right;
      display: inline-block;
    }
    .content-detail {
      position: absolute;
      top: 100px;
      left: 20px;
      right: 20px;
      bottom: 70px;
    }
    .button-wrapper {
      position: absolute;
      bottom: 0;
      left: 20px;
      right: 20px;
      height: 50px;
      text-align: right;
    }
  }
}
</style>
<style lang="scss">
  .datatype-mapping-wrapper {
    .ag-cell-value {
      overflow: auto!important;
    }
    .ag-overlay-no-rows-center {
      display: none;
    }
    .ag-theme-balham .ag-ltr .ag-cell {
      border-right-color: #ddd;
    }
    .ag-theme-balham .ag-cell {
      padding-left: 0;
      padding-right: 0;
    }
    .ag-theme-balham .ag-root-wrapper {
      border: none;
      border-top: 1px solid #ddd;
    }
    .ag-theme-balham .ag-row  {
      border-left: 1px solid #ddd;
    }
    .ag-theme-balham .ag-pinned-right-cols-container .ag-row {
      border-left: none;
      border-right: 1px solid #ddd;
    }
    .ag-theme-balham .ag-header-cell {
      border-left: 1px solid #ddd;
    }
    .ag-theme-balham .ag-pinned-right-header .ag-header-cell {
      border-left: none;
    }
    .ag-theme-balham .ag-pinned-right-header {
      border-right: 1px solid #ddd;
    }
    .ag-theme-balham .ag-pinned-left-header {
      border-right: none;
    }
    .ag-theme-balham .ag-header-cell::after {
      display: none;
    }
    .ag-theme-balham .ag-cell {
      & .ag-group-value {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
    }
    .ag-theme-balham .ag-cell:last-child {
      border-right: none!important;
    }
    .ag-theme-balham .ag-cell:first-child {
      border-right: 2px solid #ddd!important;
    }
    .ag-theme-balham .ag-header-cell:first-child {
      border-right: 1px solid #ddd!important;
    }
    .ag-body-horizontal-scroll-container {
      width: 99%;
    }
    .ag-center-cols-viewport {
      width: 100%;
    }
  }
  .datatype-mapping-wrapper-popover {
    .write-hint-wrapper {
      width: 296px;
      height: 200px;
      border-radius: 8px;
      padding: 16px;
      .wrapper {
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 12px;
        .title {
          display: table-cell;
          width: 264px;
          background: #EBF5FF;
          vertical-align: middle;
          text-align: center;
          color: #409EFF;
          height: 42px;
        }
        .left {
          display: table-cell;
          width: 88px;
          background: #EFF8E6;
          color: #66BF16;
          text-align: center;
          vertical-align: middle;
          height: 126px;
        }
        .right {
          display: table-cell;
          width: 171px;
          color: #777;
          text-align: center;
          vertical-align: middle;
          height: 126px;
        }
      }
    }
  }
</style>
