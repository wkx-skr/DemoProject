<template>
  <div class="search-result">
    <tag-selector
      ref="tagDialog"
      @selected="updateTags"
    ></tag-selector>
    <div class="top-tags-line">
      <div class="left-middle-contain">
        <span class="type-label">
          {{$v.gSearch.typeFilter}}：
        </span>
        <el-checkbox-group
          v-model="selectTypeIds"
          class="type-select-group"
          @change="filterChange"
        >
          <el-checkbox v-for="type in allTypeIds" :label="type.value" :key="type.value">{{type.label}}</el-checkbox>
        </el-checkbox-group>

        <div class="tag-select-outer">
          <span class="tag-label">
            {{$v.gSearch.filterTag}}：
          </span>
          <div class="tag-container">
            <el-tag
              v-for="tag in tagSelected"
              :key="tag.id"
              size="mini"
              closable
              class="tag-item"
              @close="closeTag(tag)"
            >{{tag.name}}</el-tag>
          </div>
          <el-button
            icon="el-icon-plus"
            size="mini"
            class="add-tag-btn"
            @click="showTagDialog"
          >{{$v.gSearch.addTag}}</el-button>
        </div>
      </div>
    </div>
    <datablau-form-submit class="list-outer-container">
      <datablau-table
        :data="tableData"
        height="100%"
      >
        <el-table-column
          prop="verId"
          width="30"
          align="left"
        >
          <template slot-scope="scope">
            <datablau-icon
              :data-type="scope.row.elementType"
              :size="16"
            ></datablau-icon>
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          label="类型"
          prop="typeId"
          width="130"
          :formatter="formatterType"
        >
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          label="名称"
          prop="name"
          min-width="150"
        >
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          label="中文名"
          prop="alias"
          min-width="150"
        >
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          label="模型名称"
          prop="modelName"
          width="150"
        >
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          label="模型类型"
          prop="modelType"
          min-width="250"
        >
          <template slot-scope="scope">
            <Database-Type
              :key="scope.row.modelType"
              :value="scope.row.modelType"
              :size="24"
            ></Database-Type>
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          label="路径"
          prop="path"
          min-width="250"
        >
        </el-table-column>
        <!--<el-table-column-->
        <!--  width="140"-->
        <!--  :label="$store.state.$v.modelDetail.commitTime"-->
        <!--  show-overflow-tooltip-->
        <!--  :formatter="$timeFormatter"-->
        <!--  prop="timestamp"-->
        <!--&gt;-->
        <!--</el-table-column>-->
        <el-table-column
          label="操作"
          width="80"
          fixed="right"
          header-align="center"
          align="center"
        >
          <template slot-scope="scope">
            <datablau-button
              type="icon"
              class="iconfont icon-see"
              @click.stop="checkItem({data: scope.row})"
              tooltipContent="查看"
              :disabled="ifCheckDisabled({modelId: scope.row.modelId})"
            >
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <!--<tab-with-table-->
      <!--  class="table-tab-container"-->
      <!--  ref="globalSearchResult"-->
      <!--  :totalShow="totalShow"-->
      <!--  :columnDefs="columnDefs"-->
      <!--  :getShowData="getShowData"-->
      <!--  :hideTopLine="true"-->
      <!--  :hideBottomLine="false"-->
      <!--  :tableOption="tableOption"-->
      <!--  :tableHidePagination="tableHidePagination"-->
      <!--  :defaultParaData="defaultParaData"-->
      <!--  @cellClicked="cellClicked"-->
      <!--&gt;-->
      <!--  <div class="right-btn-container" slot="header">-->
      <!--    <el-button-->
      <!--      size="mini"-->
      <!--      @click="refreshTable"-->
      <!--    >{{$v.gSearch.refresh}}</el-button>-->
      <!--  </div>-->
      <!--</tab-with-table>-->
      <template slot="buttons">
        <div class="pagination-container">
          <datablau-pagination
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :page-size="pageSize"
            :page-sizes="[20, 50, 100]"
            :current-page.sync="currentPage"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          ></datablau-pagination>
        </div>
      </template>
    </datablau-form-submit>

  </div>
</template>

<script>
import HTTP from '@/resource/http'
import tagSelector from '@/components/selector/TagSelector.vue'
import paginationMixin from '@/components/common/mixin/paginationMixin'
import DatabaseType from '@/components/common/DatabaseType'

export default {
  data () {
    return {
      showList: false,
      showPage: false,
      masterMap: null,

      // *** tab with table ***
      totalShow: 0,
      columnDefs: [],
      tableOption: {
        rowSelection: 'single'
      },
      tableHidePagination: false,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20
      },
      selectTypeIds: [80000004, 80000005],
      allTypeIds: [
        { label: '表', value: 80000004, name: 'table' },
        { label: '字段', value: 80000005, name: 'attribute' },
        { label: '视图', value: 80500008, name: 'view' },
        { label: '主题域', value: 80000006, name: 'diagram' }
      ],
      allTags: [],
      tagMap: {},
      tagSelected: []
    }
  },
  props: {
    keywordProp: {
      type: [String, Number],
      default: ''
    }
  },
  components: {
    DatabaseType,
    tagSelector
  },
  mixins: [paginationMixin],
  beforeMount () {
    const discard = false
    if (this.$route.query.sst && discard) {
      // 废弃
      const keyword = this.$route.query.sst
      HTTP.globalStrictDiagramSearch({
        name: keyword,
        successCallback: data => {
          let uniqueResult = null
          if (data.content && Array.isArray(data.content)) {
            uniqueResult = data.content.filter(item => {
              return item.name === keyword
            })
            if (!uniqueResult || uniqueResult.length === 0) {
              this.$message.error(`模型库中没有找到名为“keyword”的主题`)
              this.$router.push({
                name: 'home'
              })
            } else {
              if (uniqueResult.length > 1) {
                this.$message.warning(`模型库中有${uniqueResult.length}个名为“keyword”的主题,将自动为您打开第1个`)
              }
              {
                let data = uniqueResult[0]
                let typeId = data.typeId
                let elementId = data.elementId
                let parentId = data.parentId
                let modelId = data.modelId
                this.$router.push({
                  name: 'list',
                  query: {
                    id: modelId,
                    typeId: typeId,
                    elementId: elementId,
                    parentId: parentId
                  }
                })
              }
            }
          }
        }
      })
    } else {
      this.showPage = true
      this.getAllModelsmap()
      HTTP.getTags({
        successCallback: (tags) => {
          if (tags && Array.isArray(tags)) {
            let map = {}
            this.allTags = tags
            tags.forEach(item => {
              map[item.id] = item
            })
            this.tagMap = map
          }
        }
      })
      let formatterTime = (data) => {
        let t = this.$timeFormatter(data.value)
        return t
      }
      // let formatterType = (data) => {
      //   let t = this.allTypeIds.find(item => data.value === item.value)
      //   return t.label
      // }
      // let columnDefs = [
      //   // {
      //   //   type: ['firstEmptyColumn']
      //   // },
      //   {
      //     headerName: '',
      //     type: ['iconCol'],
      //     cellRendererParams: {
      //       tabComponent: this,
      //       classStr: '',
      //       typeProp: 'elementType'
      //     }
      //   },
      //   {
      //     headerName: '类型',
      //     field: 'typeId',
      //     suppressSizeToFit: true,
      //     // tooltipField: 'typeId',
      //     valueFormatter: formatterType,
      //     tooltipValueGetter: formatterType,
      //     width: 100
      //     // type: ['customSortCol'],
      //   },
      //   // {
      //   //   headerName: '任务名称',
      //   //   field: 'taskName',
      //   //   tooltipField: 'taskName',
      //   //   width: 150,
      //   //   // type: ['customSortCol'],
      //   // },
      //   {
      //     headerName: '名称',
      //     field: 'name',
      //     tooltipField: 'name',
      //     width: 150
      //     // type: ['customSortCol'],
      //   },
      //   {
      //     headerName: '中文名',
      //     field: 'alias',
      //     tooltipField: 'alias',
      //     width: 150
      //     // type: ['customSortCol'],
      //   },
      //   {
      //     headerName: '模型名称',
      //     field: 'modelName',
      //     tooltipField: 'modelName',
      //     width: 150
      //     // type: ['customSortCol'],
      //   },
      //   {
      //     headerName: '模型类型',
      //     suppressSizeToFit: true,
      //     field: 'modelType',
      //     tooltipField: 'modelType',
      //     width: 120
      //     // type: ['customSortCol'],
      //     // },
      //     // {
      //     //   headerName: '开始时间',
      //     //   field: 'startTime',
      //     //   // tooltipField: 'createTime',
      //     //   valueFormatter: formatterTime,
      //     //   tooltipValueGetter: formatterTime,
      //     //   width: 150
      //     //   // type: ['customSortCol'],
      //     // },
      //     // {
      //     //   headerName: '结束时间',
      //     //   field: 'endTime',
      //     //   // tooltipField: 'modifyTime',
      //     //   valueFormatter: formatterTime,
      //     //   tooltipValueGetter: formatterTime,
      //     //   width: 150
      //     //   // type: ['customSortCol'],
      //   },
      //   {
      //     headerName: '路径',
      //     field: 'path',
      //     tooltipField: 'path',
      //     width: 150
      //   },
      //   {
      //     headerName: '操作',
      //     width: 100,
      //     type: ['optionsWithContent'],
      //     cellRendererParams: {
      //       tabComponent: this,
      //       options: [
      //         // {name: 'edit', text: '编辑', method: 'showEditDialog'},
      //         // {name: 'remove', text: '删除', method: 'deleteSynonymsItem'},
      //         { name: 'edit', text: '查看', method: 'checkItem', ifBtnDisabled: this.ifCheckDisabled }
      //       ]
      //     }
      //   }
      // ]
      // let columnDefsEng = [
      //   // {
      //   //   type: ['firstEmptyColumn']
      //   // },
      //   {
      //     headerName: '',
      //     type: ['iconCol'],
      //     cellRendererParams: {
      //       tabComponent: this,
      //       classStr: '',
      //       typeProp: 'elementType'
      //     }
      //   },
      //   {
      //     headerName: 'Type',
      //     field: 'typeId',
      //     suppressSizeToFit: true,
      //     // tooltipField: 'typeId',
      //     valueFormatter: formatterType,
      //     tooltipValueGetter: formatterType,
      //     width: 100
      //     // type: ['customSortCol'],
      //   },
      //   // {
      //   //   headerName: '任务名称',
      //   //   field: 'taskName',
      //   //   tooltipField: 'taskName',
      //   //   width: 150,
      //   //   // type: ['customSortCol'],
      //   // },
      //   {
      //     headerName: 'Name',
      //     field: 'name',
      //     tooltipField: 'name',
      //     width: 150
      //     // type: ['customSortCol'],
      //   },
      //   {
      //     headerName: 'Alias',
      //     field: 'alias',
      //     tooltipField: 'alias',
      //     width: 150
      //     // type: ['customSortCol'],
      //   },
      //   {
      //     headerName: 'ModelName',
      //     field: 'modelName',
      //     tooltipField: 'modelName',
      //     width: 150
      //     // type: ['customSortCol'],
      //   },
      //   {
      //     headerName: 'ModelType',
      //     suppressSizeToFit: true,
      //     field: 'modelType',
      //     tooltipField: 'modelType',
      //     width: 120
      //     // type: ['customSortCol'],
      //     // },
      //     // {
      //     //   headerName: '开始时间',
      //     //   field: 'startTime',
      //     //   // tooltipField: 'createTime',
      //     //   valueFormatter: formatterTime,
      //     //   tooltipValueGetter: formatterTime,
      //     //   width: 150
      //     //   // type: ['customSortCol'],
      //     // },
      //     // {
      //     //   headerName: '结束时间',
      //     //   field: 'endTime',
      //     //   // tooltipField: 'modifyTime',
      //     //   valueFormatter: formatterTime,
      //     //   tooltipValueGetter: formatterTime,
      //     //   width: 150
      //     //   // type: ['customSortCol'],
      //   },
      //   {
      //     headerName: 'Path',
      //     field: 'path',
      //     tooltipField: 'path',
      //     width: 150
      //   },
      //   {
      //     headerName: 'EditTable',
      //     width: 100,
      //     type: ['optionsWithContent'],
      //     cellRendererParams: {
      //       tabComponent: this,
      //       options: [
      //         // {name: 'edit', text: '编辑', method: 'showEditDialog'},
      //         // {name: 'remove', text: '删除', method: 'deleteSynonymsItem'},
      //         { name: 'edit', text: 'View', method: 'checkItem', ifBtnDisabled: this.ifCheckDisabled }
      //       ]
      //     }
      //   }
      // ]
      // if (this.$isEng) {
      //   this.columnDefs = columnDefsEng
      // } else {
      //   this.columnDefs = columnDefs
      // }
    }
  },
  computed: {
    editBottomItemConfirm () {
      let bool = false
      bool = !!(this.editSynonymsData && this.editSynonymsData.synonyms)
      return bool
    }
  },
  mounted () {
    this.allTypeIds = [
      { label: '表', value: 80000004, name: 'table' },
      { label: '字段', value: 80000005, name: 'attribute' },
      { label: '视图', value: 80500008, name: 'view' },
      { label: '主题域', value: 80000006, name: 'diagram' }
    ]
    if (this.$isEng) {
      this.allTypeIds = [
        { label: 'Table', value: 80000004, name: 'table' },
        { label: 'Column', value: 80000005, name: 'attribute' },
        { label: 'View', value: 80500008, name: 'view' },
        { label: 'Category', value: 80000006, name: 'diagram' }
      ]
    }
  },
  methods: {
    getAllData () {
      let keyword = this.keywordProp || ''
      keyword = _.trim(keyword)
      // if (!keyword) {
      //   this.allData = []
      //   return
      // }
      HTTP.globalSearch({
        requestBody: {
          currentPage: 0,
          pageSize: 200,
          keyword: keyword,
          typeIds: this.selectTypeIds,
          tagIds: this.tagSelected.map(item => item.id)
        },
        successCallback: data => {
          let content = data.content
          let resultArr = []
          content.forEach(item => {
            let type = this.allTypeIds.filter(type => type.value === item.typeId)
            type = type[0]
            let typeName = type.name
            if (type.value === 80000005) {
              typeName = 'column'
            }
            let obj = {
              elementType: typeName
            }
            obj = _.merge(obj, item)
            resultArr.push(obj)
          })
          this.totalShow = data.totalElements
          this.allData = resultArr
          this.keyword = ''
          this.currentPage = 1
          this.fetchData()
        },
        failureCallback: (e) => {
          this.allData = []
          this.$showFailure(e)
        }
      })
    },
    getAllModelsmap () {
      const handler = data => {
        this.$store.state.modelsList = data
        const masterMap = new Map()
        if (data) {
          data.forEach(item => {
            if (!item.branch) {
              masterMap.set(item.id, item.name)
            }
          })
        }
        this.masterMap = masterMap
        this.showList = true
      }
      if (this.$store.state.modelsList) {
        handler(this.$store.state.modelsList)
      } else {
        HTTP.getModelsList({
          successCallback: handler
        })
      }
    },
    cellClicked (para) {
      // let data = para.data
      // let modelId = data.modelId || ''
      // this.getPermession(modelId)
    },
    checkItem (para) {
      let modelId = para.data.modelId
      this.getPermession({ modelId, data: para.data })
    },
    ifCheckDisabled (para) {
      let bool = true
      let modelId = para.modelId
      if (modelId && this.masterMap && this.masterMap.has(modelId)) {
        bool = false
      }
      return bool
    },
    getPermession ({ modelId, data }) {
      if (modelId && this.masterMap && this.masterMap.has(modelId)) {
        this.skip2Model(data)
      } else {
        this.$message.closeAll()
        this.$message.info('您没有该模型的权限, 请联系管理员获取权限')
      }
    },
    skip2Model (data) {
      let typeId = data.typeId
      let elementId = data.elementId
      let parentId = data.parentId
      let modelId = data.modelId
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      let url = `${baseUrl}main/list?id=${modelId}&typeId=${typeId}&elementId=${elementId}&parentId=${parentId}`
      window.open(url, '_blank')
    },
    showTagDialog () {
      // this.$refs.tagDialog
      // openDialog
      if (this.$refs.tagDialog && this.$refs.tagDialog.openDialog) {
        this.$refs.tagDialog.openDialog()
        this.$nextTick(() => {
          this.$refs.tagDialog.setKeys(this.tagSelected)
        })
      }
    },
    updateTags (para) {
      this.tagSelected = para
      this.filterChange()
    },
    closeTag (para) {
      this.tagSelected = this.tagSelected.filter(tag => tag.id !== para.id)
      this.filterChange()
    },
    filterChange () {
      this.getAllData()
    },

    refreshTable () {
      this.getAllData()
    },
    getData () {
      this.getDataFromAll()
    },
    formatterType (row, column, cellValue, index) {
      let t = this.allTypeIds.find(item => row.typeId === item.value)
      return t.label
    }
    // tableLayout () {
    //   if (this.$refs.globalSearchResult && this.$refs.globalSearchResult.resetTableStyle) {
    //     this.$refs.globalSearchResult.resetTableStyle()
    //   }
    // }
  },
  watch: {
    keywordProp: {
      immediate: true,
      handler: function (newVal) {
        this.getAllData()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$topHeight: 60px;
@mixin absPos() {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.search-result {
  @include absPos();
  overflow: hidden;

  .top-tags-line {
    @include absPos();
    bottom: auto;
    height: $topHeight;
    .left-middle-contain {
      position: relative;
      top: 50%;
      transform: translateY(-50%);
      padding-left: 20px;
      // border: 1px solid red;
      .type-select-group {
        display: inline-block;
      }
    }
  }
  .list-outer-container {
    //@include absPos();
    top: $topHeight;
  }
  .delete-btn {
    margin-left: 20px;
  }
  //.pagination-container {
  //  @include absPos();
  //  top: auto;
  //  height: 60px;
  //}
}

</style>

<style lang="scss">
.search-result {
  .left-middle-contain {
    white-space:nowrap;
    .el-checkbox__input.is-disabled+span.el-checkbox__label {
      color: #409EFF;
    }
    .tag-select-outer {
      display: inline-block;
      .tag-label {
        margin-left: 30px;
      }
      .tag-container {
        // border: 1px solid red;
        display: inline-block;
        // padding-right: 90px;
        // max-width: calc(100% - 400px);

        // overflow: hidden;
        // text-overflow: ellipsis;
        // white-space:nowrap;

        .tag-item {
          margin-right: 10px;
        }
      }
      .add-tag-btn {
        padding: 4px 5px;
        height: auto;
        // margin-left: -90px;
      }
    }
  }
  .ag-row {
    // cursor: pointer;
  }
}
.edit-synonyms-dia {
  .synonyms-dialog-body {
    .el-textarea {
      max-width: 400px;
    }
  }
}
</style>
