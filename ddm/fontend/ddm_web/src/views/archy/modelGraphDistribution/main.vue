<template>
  <div class="model-graph-circulation-wrapper" v-loading="loading">
    <datablau-dialog
      title="模型保存"
      :visible.sync="createModelModal"
      :append-to-body="true"
      width="500px"
      height="220px"
      :close-on-click-modal="false"
    >
      <div class="create-model-wrapper">
        <datablau-form
          ref="form"
          label-position="right"
          label-width="90px"
          size="small"
          :model="createModelData"
          :rules="rules"
        >
          <el-form-item label="模型名称" prop="name">
            <datablau-input v-model="createModelData.name" size="mini" style="width: 100%;"></datablau-input>
          </el-form-item>
          <el-form-item class="no-error" label="模型路径" prop="pathId">
            <div class="category-select-wrapper">
              <datablau-select v-model="createModelData.pathId" filterable>
                <el-option
                  v-for="category in categoryOptions"
                  :key="category.value"
                  :label="category.label"
                  :value="category.value"
                ></el-option>
              </datablau-select>
              <datablau-button type="normal" @click="showModelCategorySelector">请选择</datablau-button>
            </div>
          </el-form-item>
        </datablau-form>
      </div>
      <div slot="footer">
<!--        <datablau-checkbox style="float: left;margin-left: 35px;" checkboxType="single" v-model="isAll">将全量对象存为流转图</datablau-checkbox>-->
        <datablau-button @click="cancelCreateModel" type="cancel" size="mini">
        </datablau-button>
        <datablau-button type="important" :disabled="!createModelData.pathId" @click="confirmCreateModel" size="mini">
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
    <ul class="filter-wrapper">
      <li>
        <datablau-tabs style="display: inline-block;margin-right: 16px;" type="card" v-model="type" @tab-click="createDistributionFunc">
          <el-tab-pane label="实体" name="detail">
            <span slot="label">
              <datablau-tooltip placement="bottom" :open-delay="200" effect="dark" content="实体-应用系统">
                <div>实体</div>
              </datablau-tooltip>
            </span>
          </el-tab-pane>
          <el-tab-pane label="业务对象" name="sum">
            <span slot="label">
              <datablau-tooltip placement="bottom" :open-delay="200" effect="dark" content="业务对象-应用域">
                <div>业务对象</div>
              </datablau-tooltip>
            </span>
          </el-tab-pane>
        </datablau-tabs>
      </li>
      <li>
        <datablau-input v-show="type === 'detail'" v-model="searchEntity" @keydown.enter.native="createDistributionFunc" iconfont-state placeholder="搜索实体名称" style="margin-right: 16px;width: 200px;"></datablau-input>
      </li>
      <li>
        <span class="title">业务对象</span>
<!--        <datablau-select-weak
          multiple
          clearable
          filterable
          style="width: 160px;display: inline-block;margin-left:5px;"
          @change="handleChange"
          @selectAll="selectAll"
          v-model="businessSelect"
          :optionsData="{
            data: businessOptions,
            key: 'uuid',
            value: 'uuid',
            label: 'name',
            showAll: true,
            all: all,
          }"
        ></datablau-select-weak>-->
        <datablau-select
          multiple
          clearable
          filterable
          collapse-tags
          style="width: 160px;display: inline-block;margin-left:5px;height: 32px;"
          @change="handleChange"
          v-model="businessSelect"
        >
          <el-option :key="item.uuid" :value="item.uuid" :label="item.name" v-for="item in businessOptions"></el-option>
        </datablau-select>
      </li>
      <li>
        <span class="title" style="margin-left: 16px;">应用域</span>
<!--        <datablau-select-weak
          multiple
          clearable
          filterable
          style="width: 160px;display: inline-block;margin-left:5px;"
          @change="handleSystemChange"
          @selectAll="selectSystemAll"
          v-model="systemSelect"
          :optionsData="{
            data: systemOptions,
            key: 'id',
            value: 'id',
            label: 'name',
            showAll: true,
            all: systemAll,
          }"
        ></datablau-select-weak>-->
        <datablau-select
          multiple
          clearable
          filterable
          collapse-tags
          style="width: 160px;display: inline-block;margin-left:5px;height: 32px;"
          @change="handleSystemChange"
          v-model="systemSelect"
        >
          <el-option :key="item.id" :value="item.id" :label="item.name" v-for="item in systemOptions">
          </el-option>
        </datablau-select>
      </li>
      <li v-show="type=== 'detail'">
        <span class="title" style="margin-left: 16px;">应用系统</span>
<!--        <datablau-select-weak
          multiple
          clearable
          filterable
          style="width: 160px;display: inline-block;margin-left:5px;"
          @change="handleApplicationChange"
          @selectAll="selectApplicationAll"
          v-model="applicationSelect"
          :optionsData="{
            data: applicationOptions,
            key: 'id',
            value: 'id',
            label: 'name',
            showAll: true,
            all: applicationAll,
          }"
        ></datablau-select-weak>-->
        <datablau-select
          multiple
          clearable
          filterable
          collapse-tags
          style="width: 160px;display: inline-block;margin-left:5px;"
          @change="handleApplicationChange"
          v-model="applicationSelect"
        >
          <el-option :key="item.id" :value="item.id" :label="item.name" v-for="item in applicationOptions"></el-option>
        </datablau-select>
      </li>
      <li>
        <datablau-button style="margin-left: 16px;min-width: unset;" type="normal" @click="createDistributionFunc">搜索</datablau-button>
        <datablau-button style="margin-left: 8px;min-width: unset;" type="secondary" @click="resetDistributionFunc">重置</datablau-button>
      </li>
      <li style="float: right">
        <datablau-button style="margin-left: 5px;" type="normal" @click="showCreateModelDialog">存为流转视图</datablau-button>
      </li>
    </ul>

    <ag-grid-vue
      :key="detailTableKey"
      v-show="type === 'detail'"
      ref="aggrid"
      v-if="columnDefs.length > 1"
      class="ag-theme-alpine table1"
      id="myGrid"
      :columnDefs="columnDefs"
      @grid-ready="onGridReady"
      :rowBuffer="50000"
      :tooltipShowDelay="500"
      :defaultColDef="defaultColDef"
      :frameworkComponents="frameworkComponents"
      :rowData="tableTransFormData"
      :suppressRowTransform="true"
    ></ag-grid-vue>

    <ag-grid-vue
      v-show="type === 'sum'"
      v-if="columnDefsSum.length > 1"
      class="ag-theme-alpine table2"
      :columnDefs="columnDefsSum"
      :tooltipShowDelay="500"
      @grid-ready="onGridReady"
      :defaultColDef="defaultColDef"
      :rowData="sumTableTransFormData"
      :suppressRowTransform="true"
    ></ag-grid-vue>
  </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue'
import '@/../node_modules/ag-grid-community/dist/styles/ag-grid.css'
import '@/../node_modules/ag-grid-community/dist/styles/ag-theme-alpine.css'
// import dbTree from '@/views/modelLibrary/tree/DatablauTree.vue'
import sort from '@/resource/utils/sort'
import HTTP from '@/resource/http'
import Vue from 'vue'
import tableImg from '@/assets/images/mxgraphEdit/Table.svg'
export default {
  components: {
    // dbTree,
    AgGridVue
  },
  data () {
    return {
      loading: false,
      tableImg,
      isAll: false,
      categoryOptions: [],
      searchEntity: '',
      modelCategoryMap: new Map(),
      rules: {
        name: [
          { required: true, message: '请输入模型名称', trigger: 'blur' },
          { min: 4, max: 40, message: '长度在 4 到 40 个字符', trigger: 'blur' }
        ],
        pathId: [
          { required: true, message: '请选择模型目录', trigger: ['change', 'blur'] }
        ]
      },
      treeData: null,
      defaultkey: [1],
      moveTreeDefaultProps: {
        label: 'name',
        children: 'children',
        id: 'id'
      },
      treePathSearch: '',
      createModelData: {
        name: '',
        pathId: null,
        pathName: ''
      },
      createModelModal: false,
      detailTableKey: 0,
      applicationOptions: [],
      applicationSelect: [],
      applicationAll: true,
      columnDefsSum: [],
      sumTableTransFormData: [],
      sumTableData: [],
      type: 'detail',
      businessSelect: [],
      all: true,
      businessOptions: [],
      systemSelect: [],
      systemAll: true,
      systemOptions: [],
      frameworkComponents: {
      },
      columnDefs: [],
      defaultColDef: {
        flex: 1,
        // minWidth: 200,
        suppressMovable: true
      },
      tableTransFormData: [],
      tableData: [],
      systems: [],
      categoryDefaultId: null
    }
  },
  mounted () {
    this.getDefaultCategory()
    this.getTrasformTableData(this.getSystemData)
    this.getModelsTree()
  },
  watch: {
    businessSelect () {
      // this.getFilterTableData()
    },
    systemSelect () {
      this.application = false
      // this.setColumnDefs()
      let filterSystem = this.systems.filter(item => this.systemSelect.includes(item.id))
      this.applicationOptions = filterSystem.reduce((pre, cur) => {
        return pre.concat(cur.systems ? cur.systems : [])
      }, [])
      this.applicationSelect = this.applicationOptions.map(item => item.id)
      this.handleApplicationChange()
    },
    applicationSelect () {
      this.application = true
      // this.setColumnDefs(true)
    },
    treePathSearch (val) {
      this.$refs.tree2.filter(val)
    }
  },
  methods: {
    getDefaultCategory () {
      this.$http.get(this.$url + '/categories/buildIn?buildInType=ArchyDiagram').then(res => {
        this.categoryDefaultId = res.data.id
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    initShadow () {
      setTimeout(() => {
        $('.ag-body-horizontal-scroll-viewport').scroll((e) => {
          if (e.target.scrollLeft === 0) {
            $('.ag-theme-alpine .ag-pinned-left-header').removeClass('shadow')
            $('.ag-theme-alpine .ag-pinned-left-cols-container').removeClass('shadow')
          } else {
            $('.ag-theme-alpine .ag-pinned-left-header').addClass('shadow')
            $('.ag-theme-alpine .ag-pinned-left-cols-container').addClass('shadow')
          }
        })
      }, 1000)
    },
    showModelCategorySelector () {
      let callback = (path) => {
        this.createModelData.pathId = path[path.length - 1].id
      }
      this.$showModelCategorySelector({ getModels: false, showModels: false, callback })
    },
    createDistributionFunc () {
      this.getFilterTableData()
      this.setColumnDefs(this.application)
    },
    resetDistributionFunc () {
      this.searchEntity = ''
      this.businessSelect = []
      this.systemSelect = []
      this.applicationSelect = []
      this.createDistributionFunc()
    },
    cancelCreateModel () {
      this.$refs.form.resetFields()
      this.isAll = false
      this.createModelModal = false
    },
    confirmCreateModel () {
      let res = false
      this.$refs['form'].validate((valid) => {
        res = valid
      })
      if (!res) {
        return
      }
      this.$http.post(this.$archyUrl + 'object/diagram/model', {
        modelName: this.createModelData.name,
        categoryId: this.createModelData.pathId,
        type: this.isAll ? 'CUSTOM' : this.type === 'sum' ? 'DOMAIN_OBJECT' : this.type === 'detail' ? 'SYSTEM_TABLE' : '',
        objectIds: this.businessSelect, // 业务对象UUID集合
        systemIds: this.applicationSelect, // 应用系统ID集合
        systemCategoryIds: this.systemSelect // 应用域ID集合
      }).then(res => {
        this.$datablauMessage.success('模型创建成功')
        this.createModelModal = false
        this.isAll = false
        this.$refs.form.resetFields()
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    getModelsTree (callback) {
      let categoryMap = {}
      const sortModelLib = (result, bindDam = false) => {
        // 递归 增加判断 是否已经绑定 dam 系统
        // childrenBindDam: 自身 或者 子目录 绑定了 dam 系统
        result.childrenBindDam = false
        categoryMap[result.id] = result
        if (result.damModelCategoryId) {
          result.childrenBindDam = true
        }
        result.parentBindDam = !!bindDam
        if (result.children) {
          sort.sortConsiderChineseNumber(result.children, 'name')
          result.children.forEach(item => {
            // 排序 并 返回 是否绑定 dam 系统
            if (sortModelLib(item, !!item.damModelCategoryId || result.parentBindDam)) {
              result.childrenBindDam = true
            }
          })
        }

        return !!result.childrenBindDam
      }
      const handler = (result) => {
        this.rootModelId = result.id
        sortModelLib(result)
        this.pushModels(result)
        this.treeData = [result]
        this.treeDataLoaded = true
        this.categoryMap = categoryMap
        setTimeout(() => {
          callback && callback()
        })
      }
      if (this.$store.state.modelsTree) {
        handler(this.$store.state.modelsTree)
      } else {
        HTTP.getModels({
          successCallback: handler
        })
      }
    },
    pushModels (treeData) {
      const forEach = node => {
        if (!node) return
        if (this.modelCategoryMap.has(node.id)) {
          node.models = this.modelCategoryMap.get(node.id)
        }
        if (node.parentId) { // 不是根目录
          this.categoryOptions.push({
            label: node.name,
            value: node.id
          })
        }
        if (node.children) {
          node.children.forEach(item => {
            forEach(item)
          })
        }
      }
      forEach(treeData)
    },
    chooseMoveCategoryNode (data, node) {
      if (data.id === 1) {
        this.$datablauMessage({
          message: '不能选择根目录',
          type: 'error',
          showClose: true
        })
        this.$refs.tree2.setCurrentKey(null)
        this.createModelData.pathId = null
        this.createModelData.pathName = ''
        return
      }
      this.createModelData.pathId = data.id
      this.createModelData.pathName = data.name
    },
    filterNode (value, data, node) {
      let keyword = _.trim(value)
      if (!keyword) {
        return true
      }
      if (!data.name) {
        return false
      }
      let hasValue = false
      let current = node
      do {
        if (this.$MatchKeyword(node.data, keyword, 'name')) {
          hasValue = true
        }
        current = current.parent
      } while (current && !Array.isArray(current.data))
      return hasValue
    },
    dataIconFunction (data, node) {
      if (node.level === 1) {
        return 'tree-icon model'
      }
      if (node.data.damModelCategoryId) {
        if (node.expanded) {
          return 'iconfont icon-openfilebinding'
        } else {
          return 'iconfont icon-filebinding'
        }
      } else {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      }
    },
    showCreateModelDialog () {
      this.createModelModal = true
      this.createModelData.name = `数据流转图-${this.$moment().format('YYYYMMDDHHmmss')}-${this.$store.state.user.name}`
      this.createModelData.pathId = this.categoryDefaultId
    },
    handleApplicationChange () {
      if (this.applicationOptions.length === this.applicationSelect.length) {
        this.applicationAll = true
      } else {
        this.applicationAll = false
      }
    },
    selectApplicationAll (flag) {
      this.applicationAll = flag
      if (flag) {
        this.applicationSelect = this.applicationOptions.map(item => item.id)
      } else {
        this.applicationSelect = []
      }
    },
    handleSystemChange () {
      if (this.systemOptions.length === this.systemSelect.length) {
        this.systemAll = true
      } else {
        this.systemAll = false
      }
    },
    selectSystemAll (flag) {
      this.systemAll = flag
      if (flag) {
        this.systemSelect = this.systemOptions.map(item => item.id)
      } else {
        this.systemSelect = []
      }
    },
    handleChange () {
      if (this.businessOptions.length === this.businessSelect.length) {
        this.all = true
      } else {
        this.all = false
      }
    },
    selectAll (flag) {
      this.all = flag
      if (flag) {
        this.businessSelect = this.businessOptions.map(item => item.uuid)
      } else {
        this.businessSelect = []
      }
    },
    onGridReady (params) {
      this.gridApi = params.api
    },
    getTrasformTableData (callback) {
      this.loading = true
      this.$http.get(this.$archyUrl + 'object/diagram').then(res => {
        console.log(res.data)
        this.tableData = res.data
        this.sumTableData = res.data
        this.businessOptions = this.tableData
        // this.businessOptions = this.tableData.filter(item => item.entities?.length)
        // this.businessSelect = this.tableData.filter(item => item.entities?.length).map(item => item.uuid)
        this.getFilterTableData()
        this.initShadow()
        callback()
      }).catch(err => {
        this.$showFailure(err)
      }).finally(() => {
        this.loading = false
      })
    },
    getFilterTableData () {
      this.tableTransFormData = this.tableData.filter(item => this.businessSelect.length ? this.businessSelect.includes(item.uuid) : true).reduce((pre, cur) => {
        let filterEntity = cur.entities.filter(entity => this.searchEntity ? (entity.alias.toLowerCase().indexOf(this.searchEntity.toLowerCase()) > -1 || entity.name.toLowerCase().indexOf(this.searchEntity.toLowerCase()) > -1) : true)
        let res = []
        if (filterEntity?.length || this.searchEntity) {
          res = filterEntity.map((item, index) => ({
            businessName: cur.name,
            indexFirst: index === 0,
            count: filterEntity.length,
            entityName: item.name,
            alias: item.alias,
            distribution: item.distribution
          }))
        } else {
          res = [{
            businessName: cur.name,
            indexFirst: true,
            count: 1,
            entityName: '',
            alias: '',
            distribution: {},
            noData: true
          }]
        }
        return pre.concat(res)
      }, [])
      this.sumTableTransFormData = this.sumTableData.filter(item => (this.searchEntity ? item.name.toLowerCase().indexOf(this.searchEntity.toLowerCase()) > -1 : true) && (this.businessSelect.length ? this.businessSelect.includes(item.uuid) : true))
    },
    getSystemData () {
      this.$http.get(this.$archyUrl + 'system/category/tree/rough').then(res => {
        console.log(res.data)
        this.systemOptions = res.data
        // this.systemSelect = res.data.map(item => item.id)
        this.systems = res.data
        this.setColumnDefs()
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    setColumnDefs (applicationChanged = false) {
      let arr = [{
        headerName: '业务对象',
        field: 'businessName',
        minWidth: 100,
        headerClass: 'item',
        pinned: 'left',
        tooltipValueGetter: (params) => params.data.businessName,
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
          innerRendererFramework: Vue.extend({
            template: `<div class="item">
                        {{params.data.businessName}}
                          </div>`
          }),
          options: {
            This: this
          }
        },
        rowSpan: (params) => {
          if (params.data.indexFirst) {
            return params.data.count
          }
          return 1
        },
        cellClassRules: {
          // 样式规则
          cellspan_style: ({ rowIndex, colDef }) => {
            const field = colDef['businessName']
            if (
              !!this.tableTransFormData[rowIndex + 1] &&
                this.tableTransFormData[rowIndex + 1][field] ===
                this.tableTransFormData[rowIndex][field]
            ) {
              return true
            } else {
              return false
            }
          }
        }
      }, {
        headerName: '实体',
        headerClass: 'item',
        minWidth: 140,
        pinned: 'left',
        tooltipValueGetter: (params) => params.data.alias || params.data.entityName,
        field: 'entityName',
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
          innerRendererFramework: Vue.extend({
            template: `<div class="item">
                <span v-if="!params.data.noData"><img :src="params.options.This.tableImg" style="width: 16px;height: 16px;margin-right: 8px;" />{{params.data.alias || params.data.entityName}}</span><i v-if="Object.values(params.data.distribution).filter(value => value === 'CRUD').length > 1" class="iconfont icon-tips" style="margin-left: 10px;color:#F2220A;font-size: 12px;"></i>
            </div>`
          }),
          options: {
            This: this
          }
        }
      }]
      let filterSystem = this.systems.filter(item => this.systemSelect.length ? this.systemSelect.includes(item.id) : true)
      if (!applicationChanged) {
        this.applicationOptions = filterSystem.reduce((pre, cur) => {
          return pre.concat(cur.systems ? cur.systems : [])
        }, [])
        // this.applicationSelect = this.applicationOptions.map(item => item.id)
        this.handleApplicationChange()
      }
      this.columnDefs = arr.concat(filterSystem.map(item => {
        let obj = { headerName: item.name,
          headerClass: 'top-header item',
          headerTooltip: item.name,
          children: item.systems?.length ? item.systems?.filter(child => this.applicationSelect.length ? this.applicationSelect.includes(child.id) : true).map(child => ({
            headerName: child.name,
            headerTooltip: child.name,
            headerClass: 'item',
            minWidth: 100,
            field: 'distribution',
            cellRenderer: 'agGroupCellRenderer',
            cellRendererParams: {
              innerRendererFramework: Vue.extend({
                template: `<div class="item" :class="{R: params.data.distribution[params.options.child.id]===  'R', CRUD: params.data.distribution[params.options.child.id]===  'CRUD', 'error': Object.values(params.data.distribution).filter(value => value === 'CRUD').length > 1}">
                             {{params.data.distribution[params.options.child.id]}}
                          </div>`
              }),
              options: {
                child,
                This: this
              }
            }
          })) : [{
            headerName: '',
            headerClass: 'item',
            minWidth: 100,
            field: 'distribution',
            cellRenderer: 'agGroupCellRenderer',
            cellRendererParams: {
              innerRendererFramework: Vue.extend({
                template: `<div class="item"></div>`
              })
            }
          }] }
        return obj
      }))

      let arrSum = [{
        headerName: '业务对象',
        field: 'name',
        minWidth: 100,
        pinned: 'left',
        headerClass: 'item',
        tooltipValueGetter: (params) => params.data.name,
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
          innerRendererFramework: Vue.extend({
            template: `<div class="item business-wrapper">
                        <span>{{params.data.name}}</span><i v-if="params.data.crud.filter(value => value.crud === 'CRUD').length > 1" class="iconfont icon-tips" style="margin-left: 10px;color:#F2220A;font-size: 12px;"></i>
                          </div>`
          }),
          options: {
            This: this
          }
        }
      }]
      this.columnDefsSum = arrSum.concat(filterSystem.map(item => {
        let obj = {
          headerName: item.name,
          headerTooltip: item.name,
          headerClass: 'top-header item',
          minWidth: 100,
          field: 'distribution',
          cellRenderer: 'agGroupCellRenderer',
          cellRendererParams: {
            innerRendererFramework: Vue.extend({
              template: `<div class="item" :class="{R: params.data.crud?.find(i => i.id === params.options.item.id)?.crud ===  'R', CRUD: params.data?.crud.find(i => i.id === params.options.item.id)?.crud ===  'CRUD', 'error': params.data?.crud.filter(value => value?.crud === 'CRUD').length > 1}">
                             {{params.data?.crud.find(i => i.id === params.options.item.id)?.crud}}
                          </div>`
            }),
            options: {
              item,
              This: this
            }
          }
        }
        return obj
      }))
      if (applicationChanged) {
        this.detailTableKey++ // 解决表显示异常
      }
    }
  }
}
</script>

<style scoped lang="scss">
  .el-select-dropdown__item {
    max-width: 500px;
  }
  /deep/ .item {
    & > .ag-header-group-cell-label, & > .ag-cell-label-container {
      padding: 0 10px;
      & .ag-header-cell-label {
        justify-content: flex-start;
      }
    }
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    padding: 0 10px;
  }
  .category-select-wrapper {
    display: flex;
    .datablau-select {
      flex: 1 1 auto;
    }
    .datablau-button {
      flex: 0 0 200px;
    }
  }
  /deep/ {
    .R {
      width: 100%;
      background: #F4F8ED;
      color: #555;
    }
    .CRUD {
      width: 100%;
      background: #F4F7FF;
      color: #555;
      &.error {
        background: #FAF0EE;
        color: #F2220A;
      }
    }
  }
  .el-form-item.no-error.is-error /deep/ .el-input__inner {
    border-color: #ddd;
  }
  //.el-form-item.is-error .category-tree {
  //  border: 1px solid #F56C6C;
  //}
  .model-graph-circulation-wrapper {
    height: 100%;
  }
  .filter-wrapper li {
    display: inline-block;
    vertical-align: top;
  }
  .filter-wrapper /deep/ {
    .el-radio-group {
      margin-left: 5px;
    }
    .el-radio {
      margin-right: 7px;
    }
  }
  .table1, .table2 {
    margin-top: 20px;
    position: absolute;
    top: 50px;
    left: 20px;
    right: 20px;
    bottom: 20px;
  }
  /deep/ .cellspan_style {
    background: #fff;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ddd;
  }
  /deep/ .ag-pinned-left-cols-container .ag-row:first-child .cellspan_style {
    border-bottom: none;
  }
  /deep/ .top-header .ag-header-group-cell-label {
    display: block;
    text-align: center;
    line-height: 48px;
    width: 100%;
  }
</style>
<style lang="scss">
  .model-graph-circulation-wrapper {
    .ag-theme-alpine .ag-cell.ag-cell-last-left-pinned:not(.ag-cell-range-right):not(.ag-cell-range-single-cell) {
      border-right-color: #ddd;
    }
    .ag-theme-alpine .ag-root-wrapper {
      border: none;
      border-color: #ddd;
    }
    .ag-theme-alpine .ag-header {
      border-color: #ddd;
      background: #F8F8F8;
      & .ag-header-row-column-group {
        background: #EBF5FF;
      }
    }
    .ag-cell-value {
      overflow: auto!important;
    }
    .ag-overlay-no-rows-center {
      display: none;
    }
    .ag-theme-alpine .ag-cell {
      padding-left: 0;
      padding-right: 0;
    }
    .ag-theme-alpine .ag-header-cell {
      border-right: 1px solid #ddd;
      border-top-color: #ddd!important;
    }
    .ag-theme-alpine .ag-header-row:not(:first-child) .ag-header-cell {
      border-right: 1px solid #ddd;
    }
    .ag-theme-alpine .ag-header-group-cell:last-child {

    }
    .ag-theme-alpine .ag-pinned-right-header .ag-header-cell {
      border-left: none;
    }
    .ag-theme-alpine .ag-header-group-cell {
      border-right: 1px solid #ddd;
    }
    .ag-theme-alpine .ag-pinned-left-header {
      border-left: 1px solid #ddd;
      border-top: 1px solid #ddd;
      border-right: 1px solid #ddd;
      &.shadow {
        box-shadow: 5px 0 10px -5px rgba(0,0,0,.12);
      }
      z-index: 1;
    }
    .ag-theme-alpine .ag-center-cols-clipper {
      min-height: unset;
      border-right: 1px solid #ddd;
    }
    .ag-theme-alpine .ag-header-viewport {
      border-top: 1px solid #ddd;
      border-right: 1px solid #ddd;
    }
    .ag-theme-alpine .ag-pinned-left-cols-container {
      border-left: 1px solid #ddd;
      &.shadow {
        box-shadow: 5px 0 10px -5px rgba(0,0,0,.12);
      }
      z-index: 1;
    }
    .ag-theme-alpine .ag-row:not(.ag-row-position-absolute) .ag-cell:first-child {
      border-left: 1px solid #ddd;
    }
    .ag-theme-alpine .ag-pinned-left-cols-container .ag-row .ag-cell:first-child {
      background: #F8F8F8;
    }
    .ag-theme-alpine .ag-row {
      & .ag-cell.cellspan_style {
        background: #F8F8F8;;
      }
    }
    .ag-theme-alpine.table1 .ag-cell {
      &[aria-colindex="3"] {
        //border-left: none;
      }
      &[aria-colindex="1"] {
        border-left: none;
      }
    }
    .ag-theme-alpine.table2 .ag-cell {
      &[aria-colindex="2"] {
        border-left: none;
      }
      &[aria-colindex="1"] {
        border-left: none;
      }
    }
    .ag-theme-alpine.table2 .ag-header .ag-header-row {
      background: #EBF5FF;
    }
    .ag-theme-alpine .ag-cell {
      border-left: 1px solid #ddd;
      & .ag-group-value {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: flex-start;
        align-items: center;
      }
    }
    .ag-theme-alpine .ag-header-cell, .ag-theme-alpine .ag-header-group-cell {
      padding-left: 0;
      padding-right: 0;
      box-sizing: content-box;
      & .ag-cell-label-container .ag-header-cell-label {
        justify-content: flex-start;
      }
    }
    .ag-theme-alpine.table1 .ag-header-group-cell:nth-child(2) {
      box-sizing: border-box;
    }
    .ag-theme-alpine.table1 .ag-header-cell:nth-child(2) {
      box-sizing: border-box;
    }
    .ag-theme-alpine.table2 .ag-header-cell:nth-child(1) {
      box-sizing: border-box;
    }
    .ag-body-horizontal-scroll-container {
      width: 99%;
    }
    .ag-center-cols-viewport {
      width: 100%;
    }
    .ag-theme-alpine .ag-ltr .ag-has-focus .ag-cell-focus:not(.ag-cell-range-selected), .ag-theme-alpine .ag-ltr .ag-has-focus .ag-cell-focus.ag-cell-range-single-cell, .ag-theme-alpine .ag-ltr .ag-cell-range-single-cell.ag-cell-range-handle, .ag-theme-alpine .ag-rtl .ag-has-focus .ag-cell-focus:not(.ag-cell-range-selected), .ag-theme-alpine .ag-rtl .ag-has-focus .ag-cell-focus.ag-cell-range-single-cell, .ag-theme-alpine .ag-rtl .ag-cell-range-single-cell.ag-cell-range-handle {
      border-right-color: transparent;
      border-top-color: transparent;
      border-bottom-color: transparent;
      border-left-color: #ddd;
    }
    .ag-theme-alpine .ag-ltr .ag-has-focus .ag-pinned-left-cols-container .ag-cell-focus:not(.ag-cell-range-selected) {
      border-bottom-color: #ddd;
    }
  }
</style>
