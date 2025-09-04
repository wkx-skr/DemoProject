<template>
  <div class="model-list model-list-inner-component" ref="modelList" :class="{'show-top': currentCategory.parentId}">
    <create-branch
      ref="createBranch"
      @branchCreated="branchCreated"
    ></create-branch>
    <publish-model
        v-if="publishData && publishData.currentModel"
        ref="publishModel"
        :currentType="publishData.currentType"
        :currentModel="publishData.currentModel"
    ></publish-model>
    <div class="search-line" ref="searchLine">
      <datablau-form
        label-width="100"
        :inline="true"
        :model="tableFilterObj"
        class="search-form"
        style="display: inline-block"
        :themeBlack="sqlEditor"
        :class="{sqlEditorform: sqlEditor}"
      >
        <el-form-item label="" label-width="0">
          <datablau-input
            :themeBlack="sqlEditor"
            prefix-icon="el-icon-search"
            size="small"
            v-model="modelKeyword"
            :iconfont-state="true"
            placeholder="搜索名称、提交人"
            clearable
            :style="sqlEditor?'width: 180px':'width: 240px'"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="状态" v-if="!sqlEditor">
          <datablau-select
              v-model="tableFilterObj.modelStatus"
              placeholder="请选择"
              style="width: 128px"
          >
            <el-option
                v-for="item in statusFilters"
                :key="item.value"
                :label="item.text"
                :value="item.value"
            >
            </el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="模型类型">
          <!--<datablau-select-->
          <!--    v-model="tableFilterObj.databaseType"-->
          <!--    placeholder="请选择"-->
          <!--    style="width: 128px"-->
          <!--&gt;-->
          <!--  <el-option-->
          <!--      v-for="item in modelFilters"-->
          <!--      :key="item.value"-->
          <!--      :label="item.text"-->
          <!--      :value="item.value"-->
          <!--  >-->
          <!--  </el-option>-->
          <!--</datablau-select>-->
          <datablau-select
            size="small"
            style="display:inline-block;width: 140px"
            v-model="tableFilterObj.databaseType"
            clearable
            filterable
            placeholder="请选择"
            :themeBlack="sqlEditor"
          >
            <el-option-group
              v-for="group in modelFilters"
              :key="group.type"
              :label="isEN ? group.type : group.name">
              <el-option
                v-for="item in group.dataSourceTypeList"
                :value="item.second"
                :label="item.text2 || item.text"
                :key="item.second"
              >
                <database-type :key="item.second" :value="item.second"></database-type>
              </el-option>
            </el-option-group>
          </datablau-select>
        </el-form-item>
        <el-form-item label="标签">
          <datablau-select
              v-model="tableFilterObj.tag"
              placeholder="请选择"
              style="width: 128px"
              :disabled="!tagFilterEnabled"
              :themeBlack="sqlEditor"
          >
            <el-option
                v-for="item in tagFilters"
                :key="item.value"
                :label="item.text"
                :value="item.value"
            >
            </el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="" label-width="0">
          <datablau-checkbox
            v-if="currentCategory.parentId"
            v-model="showCurrentCat"
            @change="showCatChange"
            :class="needBind?'needBind':''"
            class="show-current-category"
            :themeBlack="sqlEditor"
          >
            <el-checkbox label="仅显示当前目录的模型"></el-checkbox>
          </datablau-checkbox>
        </el-form-item>
      </datablau-form>

      <recycle-bin
          style="position: absolute;top: 15px; right: 20px;"
          v-if="!currentCategory.parentId && needBind === false"
      ></recycle-bin>
    </div>
    <datablau-form-submit class="model-table-container"  v-loading="!tagFilterEnabled || tableLoading" :element-loading-background="needBind && 'rgba(0,0,0,0.4)'">
        <datablau-table
          ref="modelListTable"
          class="expand-table"
          :class="needBind?'needBind':''"
          :single-select="needBind"
          :reserveSelection="needBind"
          :autoHideSelection="!needBind"
          :data="tableData"
          :row-key="getKey"
          :resetHoverHandle="true"
          :tree-props="{children: 'childrenNo', hasChildren: 'hasChildren'}"
          @sort-change="handleSortChange"
          @selection-change="handleSelectionChange"
          height="100%"
          :themeBlack="sqlEditor"
        >
          <el-table-column
            type="expand"
            fixed="left"
            width="24"
          >
            <template slot="header">
              <datablau-button
                type="icon"
                @click="autoToggleTableExpansion"
                low-key
                class="iconfont expand-icon"
                style="position: relative;left: -10px;"
                :class="{
                  'icon-shouqi': !toggleTable,
                  'icon-zhankai': toggleTable,
                }"
              >
              </datablau-button>
            </template>
            <template slot-scope="scope">
              <sub-table
                :ref="`subTree_${scope.row.id}`"
                :needBind="needBind"
                :getKey="getKey"
                :modelToTagMap="modelToTagMap"
                :inElectron="inElectron"
                :editImg="editImg"
                :couldPublishModel="couldPublishModel"
                :currentData="scope.row"
                :key="scope.row.id + 'subTable'"
                :showOperator="showOperator"
                :dialogOpen="dialogOpen"
                @handleRowClick="handleRowClick"
                @editModel="editModel"
                @deleteBranchConfirm="deleteBranchConfirm"
                @showMoreAction="showMoreAction"
                @createBranch="createBranch"
                @exportDictionary="exportDictionary"
                @handleSelectionChange="(val) => {subTreeSelectionChange(val, scope.row)}"
                :themeBlack="sqlEditor"
              ></sub-table>
            </template>
          </el-table-column>
          <el-table-column
              prop="modelName"
              :label="$store.state.$v.modelList.modelName"
              width="200"
              show-overflow-tooltip
              sortable="custom"
            fixed="left"
          >
            <template slot="header">
              <span style="margin-left: 21px;">{{$store.state.$v.modelList.modelName}}</span>
            </template>
            <template slot-scope="scope">
              <datablau-icon
                  v-if="!scope.row.dwModel"
                  data-type="model"
                  :size="16"
                  style="margin: 0 6px 0 -1px; vertical-align: middle;"
              ></datablau-icon>
              <datablau-icon
                  v-else
                  data-type="data-warehouse"
                  :size="16"
                  style="margin: 0 6px 0 -1px; vertical-align: middle;"
              ></datablau-icon>
              <b style="cursor: pointer;" class="model-name-content" @click.stop="handleRowClick(scope.row)">{{ scope.row.modelName }}</b>
            </template>
          </el-table-column>
          <el-table-column
              :label="$store.state.$v.modelList.modelStatus"
              header-align="left"
              align="left"
              width="100"
              prop="phase"
              sortable="custom"
              column-key="modelStatus"
              v-if="$store.state.featureMap.ddm_CustomStatus"
          >
            <template slot-scope="scope">
              <Status
                  style="margin-left: 0;text-align: left;"
                  :type="scope.row.phase"
                  :key="scope.row.id"
              ></Status>
            </template>
          </el-table-column>
          <el-table-column
            prop="lastModifier"
            :label="$store.state.$v.modelList.owner"
            show-overflow-tooltip
            sortable="custom"
          ></el-table-column>
          <el-table-column
            :label="$store.state.$v.modelList.databaseType"
            :min-width="180"
            prop="modelType"
            sortable="custom"
            column-key="databaseType"
          >
            <template slot-scope="scope">
              <Database-Type
                v-show="scope.row.root"
                :key="scope.row.modelType"
                :value="scope.row.modelType"
                :size="16"
              ></Database-Type>
            </template>
          </el-table-column>
          <el-table-column
              prop="lastModificationTimestamp"
              :formatter="$timeFormatter"
              width="140"
              :label="$store.state.$v.modelList.lastModification"
              sortable="custom"
          ></el-table-column>
          <el-table-column
              :width="100"
              :label="$store.state.$v.modelList.score"
              header-align="left"
              prop="rate"
              v-if="$store.state.featureMap.ddm_WebModelAdvancedAttribute"
              align="left"
          >
            <template slot-scope="scope">
              <rate-in-table
                  :rate="Number(scope.row.rate || 0)"
              ></rate-in-table>
            </template>
          </el-table-column>
          <el-table-column
            :label="$store.state.$v.modelList.tag"
            header-align="left"
            :width="230"
            column-key="tag"
          >
            <template slot-scope="scope">
              <tag-container
                  v-if="modelToTagMap.has(scope.row.id)"
                  :modelId="scope.row.id"
                  :modelToTagMap="modelToTagMap"
              ></tag-container>
            </template>
          </el-table-column>
          <el-table-column
            prop="description"
            :label="$store.state.$v.modelList.description"
            :min-width="140"
            show-overflow-tooltip
          >
          </el-table-column>
          <!--<el-table-column-->
          <!--    label="操作"-->
          <!--    :min-width="100"-->
          <!--    fixed="right"-->
          <!--    v-if="inElectron"-->
          <!--&gt;-->
          <!--  <template slot-scope="scope">-->
          <!--    <div class="edit-model-btn" @click.stop="editModel(scope)">-->
          <!--      <img :src="editImg"/>-->
          <!--      <span>编辑</span>-->
          <!--    </div>-->
          <!--  </template>-->
          <!--</el-table-column>-->
          <el-table-column
            label="操作"
            width="180"
            fixed="right"
            header-align="center"
            v-if="showOperator"
          >
            <template slot-scope="scope">
              <datablau-button
                type="icon"
                class="iconfont icon-see"
                @click.stop="handleRowClick(scope.row)"
                tooltipContent="查看"
                :disabled="!scope.row.permissions.viewer"
              >
              </datablau-button>
              <datablau-button
                  v-if="$store.state.lic.editor"
                  type="icon"
                  class="iconfont icon-bianji"
                  @click.stop="editModel(scope)"
                  tooltipContent="编辑"
                  :disabled="!scope.row.permissions.editor"
              >
              </datablau-button>
              <datablau-button
                  type="icon"
                  class="iconfont icon-Recycle"
                  @click.stop="deleteBranchConfirm(scope)"
                  tooltipContent="删除"
                  :disabled="!scope.row.permissions.admin"
              >
              </datablau-button>
              <datablau-button
                  type="icon"
                  class="iconfont icon-branch"
                  @click.stop="createBranch(scope)"
                  tooltipContent="创建分支"
                  :disabled="!scope.row.permissions.editor"
                  v-if="!couldPublishModel(scope)"
              >
              </datablau-button>
              <datablau-button
                  type="icon"
                  class="el-icon-more"
                  v-if="couldPublishModel(scope) && scope.row.permissions.editor"
                  @click.stop="(e) => showMoreAction(e, scope)"
              >
              </datablau-button>
              <datablau-button
                  type="icon"
                  class="iconfont icon-export"
                  @click.stop="exportDictionary(scope.row)"
                  tooltipContent="导出数据字典"
              >
              </datablau-button>
            </template>
          </el-table-column>
        </datablau-table>
      <template slot="buttons">
          <datablau-pagination
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              :page-size="pageSize"
              :page-sizes="[20, 50, 100]"
              :current-page.sync="currentPage"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :themeBlack="sqlEditor"
          ></datablau-pagination>
      </template>
    </datablau-form-submit>
    <datablau-dialog
      title="导出数据字典"
      :visible.sync="exportDialogVisible"
      :close-on-click-modal="false"
      append-to-body
      size="s"
      height="600px"
    >
    <div style="margin-bottom: 10px;">
      <span style="    display: inline-block;
    font-size: 14px;
    margin-right: 20px;">类型过滤</span>
      <el-checkbox v-model="checkedOptionAll" @change="checkedOptionAllChange">全选</el-checkbox>
    </div>
    <div style="height: 445px;
    overflow: auto;border: 1px solid #ddd;
    padding: 4px;
    border-radius: 7px;">
      <div style="margin-bottom: 10px">
        <el-checkbox :indeterminate="tableOption.isIndeterminate" v-model="tableOption.checkAll" @change="handleCheckAllChange(tableOption.checkAll, 'tableOption')">{{tableOption.first}}</el-checkbox>
        <div style="margin: 4px 0;"></div>
        <el-checkbox-group style="margin-left: 16px;" v-model="tableOption.checkedExport" @change="handleCheckedChange(tableOption.checkedExport,'tableOption')">
          <el-checkbox style="display: block;" v-for="name in Object.entries(tableOption.second)" :label="name[0]" :key="name[0]" :disabled="name[0]==='80100005'||name[0]==='90000003'">{{name[1]}}</el-checkbox>
        </el-checkbox-group>
      </div>
      <div style="margin-bottom: 10px" v-if="viewOption.first">
        <el-checkbox :indeterminate="viewOption.isIndeterminate" v-model="viewOption.checkAll" @change="handleCheckAllChange(viewOption.checkAll, 'viewOption')">{{viewOption.first}}</el-checkbox>
        <div style="margin: 4px 0;"></div>
        <el-checkbox-group style="margin-left: 16px;" v-model="viewOption.checkedExport" @change="handleCheckedChange(viewOption.checkedExport,'viewOption')">
          <el-checkbox style="display: block;" v-for="name in Object.entries(viewOption.second)" :label="name[0]" :key="name[0]" >{{name[1]}} </el-checkbox>
        </el-checkbox-group>
      </div>
      <div style="margin-bottom: 10px">
        <el-checkbox :indeterminate="columnOption.isIndeterminate" v-model="columnOption.checkAll" @change="handleCheckAllChange(columnOption.checkAll, 'columnOption')">{{columnOption.first}}</el-checkbox>
        <div style="margin: 4px 0;"></div>
        <el-checkbox-group style="margin-left: 16px;" v-model="columnOption.checkedExport" @change="handleCheckedChange(columnOption.checkedExport,'columnOption')">
          <el-checkbox style="display: block;" v-for="name in Object.entries(columnOption.second)" :label="name[0]" :key="name[0]" :disabled="name[0]==='80100005'||name[0]==='90000003'">{{name[1]}}</el-checkbox>
        </el-checkbox-group>
      </div>
      <div style="margin-bottom: 10px" v-if="businessObjectOption.first">
        <el-checkbox :indeterminate="businessObjectOption.isIndeterminate" v-model="businessObjectOption.checkAll" @change="handleCheckAllChange(businessObjectOption.checkAll, 'businessObjectOption')">{{businessObjectOption.first}}</el-checkbox>
        <div style="margin: 4px 0;"></div>
        <el-checkbox-group style="margin-left: 16px;" v-model="businessObjectOption.checkedExport" @change="handleCheckedChange(businessObjectOption.checkedExport,'businessObjectOption')">
          <el-checkbox style="display: block;" v-for="name in Object.entries(businessObjectOption.second)" :label="name[0]" :key="name[0]" :disabled="name[0]==='80100005'||name[0]==='90000003'">{{name[1]}}</el-checkbox>
        </el-checkbox-group>
      </div>
      <div>
        <el-checkbox :indeterminate="indexOption.isIndeterminate" v-model="indexOption.checkAll" @change="handleCheckAllChange(indexOption.checkAll, 'indexOption')">{{indexOption.first}}</el-checkbox>
        <div style="margin: 4px 0;"></div>
        <el-checkbox-group style="margin-left: 16px;" v-model="indexOption.checkedExport" @change="handleCheckedChange(indexOption.checkedExport,'indexOption')">
          <el-checkbox style="display: block;" v-for="name in Object.entries(indexOption.second)" :label="name[0]" :key="name[0]">{{name[1]}}</el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
      <span slot="footer">
        <datablau-button type="secondary" @click="cancelExportDialog">
          取消
        </datablau-button>
        <datablau-button @click="submitExort">确定</datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import recycleBin from './recycleBin/recycleBin.vue'
import createBranch from './createBranch.vue'
import string from '@/resource/utils/string'
import _ from 'lodash'
import { mapGetters, mapState } from 'vuex'
import HTTP from '@/resource/http'
import sort from '@/resource/utils/sort'
import inElectron from '@/resource/utils/environment'
import dbType from '@/components/dataSource/databaseType'
import moment from 'moment'
import rateInTable from '@/views/modelLibrary/rateInTable.vue'
import Status from '@/views/list/Status'
import tagContainer from '@/views/modelLibrary/tagContainer'
import DatabaseType from '@/components/common/DatabaseType'
import subTable from './subTable.vue'
import editImg from '@/assets/images/mxgraphEdit/Edit.svg'
import publishModel from '@/views/list/publishModel.vue'

export default {
  name: 'modelList',
  data () {
    return {
      isEN: window.lang === 'English',
      dataInitFinish: false,
      debouncedFilter: null, // 搜索防抖
      tableFilterObj: {
        modelStatus: '@@全部@@',
        databaseType: '',
        tag: '@@全部@@'
      },
      modelKeyword: '',
      inElectron,
      modelFilters: [],
      allText: '@@全部@@',
      filteredData: null,
      tagFilteredData: null,
      phaseFilteredData: null,
      sortedData: null, // 排序后的数据
      sortProps: { // 排序方式
        prop: 'modelName',
        order: ''
      },
      tableData: null,
      tableLoading: false,
      currentPage: 1,
      allData: null,
      total: 0,
      pageSize: 20,
      toggleTable: false,
      tagFilters: [],
      firstQuery: true,
      modelToTagMap: new Map(),
      tagToModelMap: new Map(),
      phases: [],
      tagFilterEnabled: false,
      rateKey: 0,
      showCurrentCat: false,
      multipleSelection: [],
      tags: [],
      getTagsOfModels: null,
      // wholeLoading: false,
      expandModel: null,
      publishData: {
        currentType: '',
        currentModel: ''
      },
      editImg,
      exportDialogVisible: false,
      optionExportList: [],
      tableOption: {
        isIndeterminate: false,
        first: '',
        second: {},
        checkAll: true,
        checkedExport: []
      },
      businessObjectOption: {
        isIndeterminate: false,
        first: '',
        second: {},
        checkAll: true,
        checkedExport: []
      },
      viewOption: {
        isIndeterminate: false,
        first: '',
        second: {},
        checkAll: true,
        checkedExport: []
      },
      columnOption: {
        isIndeterminate: false,
        first: '',
        second: {},
        checkAll: true,
        checkedExport: []
      },
      indexOption: {
        isIndeterminate: false,
        first: '',
        second: {},
        checkAll: true,
        checkedExport: []
      },
      checkedOptionAll: true,
      exportId: null
    }
  },
  props: {
    currentCategory: {
      default: () => {
        return {}
      }
    },
    needBind: {
      default: false
    },
    showOperator: {
      default: false
    },
    dialogOpen: {
      default: false
    },
    permissionsMap: {
      required: true
    },
    // getTagsOfModels: {
    //   required: true
    // },
    sqlEditor: {
      default: false
    }
  },
  components: {
    createBranch,
    recycleBin,
    subTable,
    rateInTable,
    Status,
    tagContainer,
    publishModel,
    DatabaseType
  },
  computed: {
    statusFilters () {
      let statusFilters = [{ value: this.allText, text: '全部' }]
      for (const [key, value] of Object.entries(this.allPhase)) {
        let obj = { text: value, value: key }
        statusFilters.push(obj)
      }
      return statusFilters
    },
    ...mapGetters({ allPhase: 'status' }),
    ...mapState(['showEREdit'])
  },
  beforeMount () {
    this.refreshTagsOfModels()
    // dbType.DB_TYPE_TREE.subTree
    let subTree = _.cloneDeep(dbType.DB_TYPE_TREE.subTree)
    // this.modelFilters = [{ value: this.allText, text: '全部' }].concat(dbType.modelTypeList)
    this.modelFilters = subTree
    // 防抖改为节流
    this.debouncedFilter = _.throttle(this.filterData, 500)
  },
  mounted () {
    this.tableData = []
    this.tagInit()
    this.$bus.$on('updateListRate', this.updateListRate)
    this.$bus.$on('updateTagsMap', () => {
      this.refreshTagsOfModels()
      this.getTagsByModels()
    })
    this.$bus.$on('updateRateForList', () => {
      this.rateKey++
    })
    this.dataInit()
  },
  beforeDestroy () {
    this.$bus.$off('updateTagsMap')
    this.$bus.$off('updateRateForList')
    this.$bus.$off('updateListRate')
  },
  methods: {
    checkedOptionAllChange (value) {
      if (value) {
        this.tableOption.checkedExport = this.tableOption.checkedExport2
        this.tableOption.checkAll = true
        this.tableOption.isIndeterminate = false
        this.viewOption.checkedExport = this.viewOption.checkedExport2
        this.viewOption.checkAll = true
        this.viewOption.isIndeterminate = false
        this.columnOption.checkedExport = this.columnOption.checkedExport2
        this.columnOption.checkAll = true
        this.columnOption.isIndeterminate = false
        this.indexOption.checkedExport = this.indexOption.checkedExport2
        this.indexOption.checkAll = true
        this.indexOption.isIndeterminate = false
        this.businessObjectOption.checkedExport = this.businessObjectOption.checkedExport2
        this.businessObjectOption.checkAll = true
        this.businessObjectOption.isIndeterminate = false
      } else {
        this.tableOption.checkedExport = value ? this.tableOption.checkedExport2 : ['80100005', '90000003']
        this.tableOption.isIndeterminate = !value
        this.viewOption.checkedExport = value ? this.viewOption.checkedExport2 : []
        this.viewOption.isIndeterminate = false
        this.viewOption.checkAll = false
        this.columnOption.checkedExport = value ? this.columnOption.checkedExport2 : ['80100005', '90000003']
        this.columnOption.isIndeterminate = !value
        this.indexOption.checkedExport = value ? this.indexOption.checkedExport2 : []
        this.indexOption.isIndeterminate = false
        this.indexOption.checkAll = false
        this.businessObjectOption.checkedExport = value ? this.businessObjectOption.checkedExport2 : []
        this.businessObjectOption.isIndeterminate = false
        this.businessObjectOption.checkAll = false
      }
    },
    handleCheckAllChange (value, type) {
      if (type === 'tableOption') {
        this.tableOption.checkedExport = value ? this.tableOption.checkedExport2 : ['80100005', '90000003']
        this.tableOption.isIndeterminate = !value
      } else if (type === 'viewOption') {
        this.viewOption.checkedExport = value ? this.viewOption.checkedExport2 : []
        this.viewOption.isIndeterminate = false
      } else if (type === 'columnOption') {
        this.columnOption.checkedExport = value ? this.columnOption.checkedExport2 : ['80100005', '90000003']
        this.columnOption.isIndeterminate = !value
      } else if (type === 'indexOption') {
        this.indexOption.checkedExport = value ? this.indexOption.checkedExport2 : []
        this.indexOption.isIndeterminate = false
      } else if (type === 'businessObjectOption') {
        this.businessObjectOption.checkedExport = value ? this.businessObjectOption.checkedExport2 : ['80100005', '90000003']
        this.businessObjectOption.isIndeterminate = false
      }
    },
    handleCheckedChange (value, type) {
      if (type === 'tableOption') {
        let checkedCount = value.length
        this.tableOption.checkAll = checkedCount === this.tableOption.checkedExport2.length
        this.tableOption.isIndeterminate = checkedCount > 0 && checkedCount < this.tableOption.checkedExport2.length
      } else if (type === 'viewOption') {
        let checkedCount = value.length
        this.viewOption.checkAll = checkedCount === this.viewOption.checkedExport2.length
        this.viewOption.isIndeterminate = checkedCount > 0 && checkedCount < this.viewOption.checkedExport2.length
      } else if (type === 'columnOption') {
        let checkedCount = value.length
        this.columnOption.checkAll = checkedCount === this.columnOption.checkedExport2.length
        this.columnOption.isIndeterminate = checkedCount > 0 && checkedCount < this.columnOption.checkedExport2.length
      } else if (type === 'indexOption') {
        let checkedCount = value.length
        this.indexOption.checkAll = checkedCount === this.indexOption.checkedExport2.length
        this.indexOption.isIndeterminate = checkedCount > 0 && checkedCount < this.indexOption.checkedExport2.length
      } else if (type === 'businessObjectOption') {
        let checkedCount = value.length
        this.businessObjectOption.checkAll = checkedCount === this.businessObjectOption.checkedExport2.length
        this.businessObjectOption.isIndeterminate = checkedCount > 0 && checkedCount < this.businessObjectOption.checkedExport2.length
      }
    },
    cancelExportDialog () {
      this.exportDialogVisible = false
    },
    submitExort () {
      // 检查是否所有选项都未选中
      if (
        this.tableOption.checkedExport.length === 0 &&
        this.viewOption.checkedExport.length === 0 &&
        this.columnOption.checkedExport.length === 0 &&
        this.indexOption.checkedExport.length === 0 &&
        this.businessObjectOption.checkedExport.length === 0
      ) {
        this.$datablauMessage.warning('请至少选择一项导出内容')
        return
      }

      let obj = {
        tableOption: {
          first: this.tableOption.first,
          second: _.cloneDeep(this.tableOption.second)
        },
        viewOption: {
          first: this.viewOption.first,
          second: _.cloneDeep(this.viewOption.second)
        },
        columnOption: {
          first: this.columnOption.first,
          second: _.cloneDeep(this.columnOption.second)
        },
        indexOption: {
          first: this.indexOption.first,
          second: _.cloneDeep(this.indexOption.second)
        },
        businessObjectOption: {
          first: this.businessObjectOption.first,
          second: _.cloneDeep(this.businessObjectOption.second)
        }
      }

      // 如果某个选项全部未选中，则不传该选项
      if (this.tableOption.checkedExport.length === 0) {
        delete obj.tableOption
      } else {
        this.tableOption.checkedExport.forEach(key => {
          delete obj.tableOption.second[key]
        })
      }

      if (this.viewOption.checkedExport.length === 0) {
        delete obj.viewOption
      } else {
        this.viewOption.checkedExport.forEach(key => {
          delete obj.viewOption.second[key]
        })
      }

      if (this.columnOption.checkedExport.length === 0) {
        delete obj.columnOption
      } else {
        this.columnOption.checkedExport.forEach(key => {
          delete obj.columnOption.second[key]
        })
      }

      if (this.indexOption.checkedExport.length === 0) {
        delete obj.indexOption
      } else {
        this.indexOption.checkedExport.forEach(key => {
          delete obj.indexOption.second[key]
        })
      }
      if (this.businessObjectOption.checkedExport.length === 0) {
        delete obj.businessObjectOption
      } else {
        this.businessObjectOption.checkedExport.forEach(key => {
          delete obj.businessObjectOption.second[key]
        })
      }

      const url = `${this.$url}/layer/export/${this.exportId}`
      this.$downloadFilePost(url, obj)
    },
    getOptionExport (id) {
      this.$http
        .get(`${this.$url}/layer/option/export/${id}`)
        .then(res => {
          this.tableOption = {
            isIndeterminate: false,
            first: res.data.tableOption?.first,
            second: res.data.tableOption?.second,
            checkAll: true,
            checkedExport: [],
            checkedExport2: []
          }
          this.viewOption = {
            isIndeterminate: false,
            first: res.data.viewOption?.first,
            second: res.data.viewOption?.second,
            checkAll: true,
            checkedExport: [],
            checkedExport2: []
          }
          this.columnOption = {
            isIndeterminate: false,
            first: res.data.columnOption?.first,
            second: res.data.columnOption?.second,
            checkAll: true,
            checkedExport: [],
            checkedExport2: []
          }
          this.indexOption = {
            isIndeterminate: false,
            first: res.data.indexOption?.first,
            second: res.data.indexOption?.second,
            checkAll: true,
            checkedExport: [],
            checkedExport2: []
          }
          this.businessObjectOption = {
            isIndeterminate: false,
            first: res.data.businessObjectOption?.first,
            second: res.data.businessObjectOption?.second,
            checkAll: true,
            checkedExport: [],
            checkedExport2: []
          }
          for (const key in res.data.tableOption?.second) {
            this.tableOption.checkedExport.push(key)
            this.tableOption.checkedExport2.push(key)
          }
          for (const key in res.data.viewOption?.second) {
            this.viewOption.checkedExport.push(key)
            this.viewOption.checkedExport2.push(key)
          }
          for (const key in res.data.columnOption?.second) {
            this.columnOption.checkedExport.push(key)
            this.columnOption.checkedExport2.push(key)
          }
          for (const key in res.data.indexOption?.second) {
            this.indexOption.checkedExport.push(key)
            this.indexOption.checkedExport2.push(key)
          }
          for (const key in res.data.businessObjectOption?.second) {
            this.businessObjectOption.checkedExport.push(key)
            this.businessObjectOption.checkedExport2.push(key)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    exportDictionary (row) {
      this.checkedOptionAll = true
      this.exportDialogVisible = true
      this.exportId = row.id
      this.getOptionExport(row.id)
    },
    dataInit () {
      if (!this.dataInitFinish) {
        this.dataInitFinish = true
        this.getTableData(this.currentCategory)
      }
    },
    tagInit () {
      // 初始化 标签与模型关联
      HTTP.getTags({
        successCallback: (data) => {
          this.tagFilters = (data || []).map((item) => {
            item.text = item.name
            item.value = item.id
            return item
          })
          this.tagFilters.unshift({ value: this.allText, text: '全部' })
        }
      })
    },
    refreshTagsOfModels () {
      const modelList = this.$store.state.modelsList
      this.getTagsOfModels = HTTP.getTagsOfModels({
        modelIds: (modelList || []).map(item => item.id)
      })
    },
    getTagsByModels () {
      this.tagFilterEnabled = false
      // 由于需要根据标签过滤模型，所以这里需要获取所有模型的 标签
      this.getTagsOfModels
        .then(data => {
          if (data) {
            this.modelToTagMap.clear()
            this.tagToModelMap.clear()
            for (let modelId in data) {
              if (data.hasOwnProperty(modelId)) {
                this.modelToTagMap.set(Number.parseInt(modelId), data[modelId])
                data[modelId].forEach((item) => {
                  let tagId = item.id
                  if (!this.tagToModelMap.has(tagId)) {
                    this.tagToModelMap.set(tagId, [modelId])
                  } else {
                    this.tagToModelMap.get(tagId).push(modelId)
                  }
                })
              }
            }
          }
          this.tagFilterEnabled = true
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getKey (row) {
      let id = row.root ? 'r' + row.id : row.id
      return id
    },
    dateFormatter (row, col) {
      if (row[col.property] === '') {
        return ''
      }
      let time = row[col.property]
      return moment(time).format('YYYY-MM-DD HH:mm')
    },
    // 分页获取 table 数据
    refreshTableData () {
      this.debouncedFilter()
    },
    updateRateAndPermission () {
      this.getCurrentPageData()
    },
    updateListRate ({ rate, modelId }) {
      let model = this.tableData.find((model) => model.id === modelId)
      if (model) {
        model.rate = rate
      }
    },

    handleSizeChange (size) {
      this.currentPage = 1
      this.pageSize = size
      this.getCurrentPageData()
    },
    handleCurrentChange () {
      this.getCurrentPageData()
    },
    handleSortChange ({ column, prop, order }) {
      this.sortProps = {
        prop,
        order
      }
      this.currentPage = 1
      this.handleSortData()
    },
    handleSortData () {
      let { prop, order } = this.sortProps
      this.sortedData = _.clone(this.filteredData)
      if (order) {
        sort.sortConsiderChineseNumber(this.sortedData, prop, order)
      } else {
        sort.sortConsiderChineseNumber(this.sortedData, 'modelName')
      }
      this.getCurrentPageData()
    },
    getCurrentPageData () {
      this.tableLoading = true
      let result = this.sortedData.slice(
        (this.currentPage - 1) * this.pageSize,
        this.currentPage * this.pageSize
      )
      result.forEach((v) => {
        v.expanded = false
      })
      this.getModelsPermission(result)
    },
    getModelsPermission (models = []) {
      this.tableData = []
      this.tableResize()
      if (!models || models.length === 0) {
        this.tableLoading = false
        return
      }
      let ids = []
      let modelMap = {}
      let modelBranchMap = {}
      let idsMap = {}
      models.forEach(item => {
        modelMap[item.id] = item
        idsMap[item.id] = true
        if (item.showChildren) {
          item.showChildren.forEach(child => {
            modelBranchMap[child.id] = child
            idsMap[child.id] = true
            child.branchName = child.branch ? child.name : 'master'
          })
        }
      })
      ids = Object.keys(idsMap)
      ids.forEach(id => {
        let item = modelBranchMap[id] || modelMap[id] || {}
        let permissions = this.permissionsMap[item.id] || {}
        permissions = {
          viewer: permissions.admin || permissions.editor || permissions.viewer,
          editor: permissions.admin || permissions.editor,
          admin: !!permissions.admin
        }
        item.permissions = permissions
        if (modelMap[id]) {
          modelMap[id].permissions = permissions
        }
      })
      let promiseGetRates = HTTP.getRates({ ids })
      promiseGetRates
        .then(res => {
          ids.forEach(id => {
            let item = modelBranchMap[id] || modelMap[id] || {}
            item.rate = res[id] || 0
            if (modelMap[id]) {
              modelMap[id].rate = res[id] || 0
            }
          })
          this.tableData = models
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .finally(() => {

        })
      this.$nextTick(() => {
        // 根据过滤条件, 判断是否展开 table
        let bool = false
        let modelKeyword = _.trim(this.modelKeyword)
        if (modelKeyword) {
          bool = true
        }
        if (
          (this.tableFilterObj?.modelStatus && this.tableFilterObj?.modelStatus !== this.allText) ||
              (this.tableFilterObj?.tag && this.tableFilterObj?.tag !== this.allText) ||
              this.tableFilterObj?.databaseType !== ''
        ) {
          bool = true
        }
        if (bool) {
          this.resetExpandIcon(!!bool)
        } else {
          // 新增分支时，自动展开
          if (this.expandModel) {
            let row = this.expandModel
            if (this.expandModel.branch) {
              let modelId = this.expandModel.referredModelId
              row = this.tableData.find(item => item.id === modelId)
            } else {
              let modelId = this.expandModel.id
              row = this.tableData.find(item => item.id === modelId)
            }
            row && this.$refs.modelListTable?.toggleRowExpansion(row, true)
            setTimeout(() => {
              this.expandModel = null
            }, 1000)
          }
        }
        this.tableLoading = false
      })
    },
    handleSelectionChange (val) {
      if (val) {
        this.clearSelection()
        this.$emit('handleSelectionChange', val)
      }
    },
    subTreeSelectionChange (val, row) {
      if (val) {
        this.clearSelection(row)
        this.$emit('handleSelectionChange', val)
      }
    },
    clearSelection (row) {
      // row 有值，表示从 subTree 点击
      for (let key in this.$refs) {
        if (key.indexOf('subTree_') === 0) {
          if (!row || key !== `subTree_${row.id}`) {
            this.$refs[key]?.clearSingleSelect()
          }
        }
      }
      if (row) {
        this.$refs.modelListTable?.clearSingleSelect()
      }
    },
    // 父组件点击tree 节点时，也会触发，更新 table 数据
    getTableData (data) {
      // data 为当前目录下所有模型的数据
      // 重置过滤条件, 过滤全部数据
      if (!this.expandModel) {
        // 新增分支时，不清除过滤条件
        this.clearFilterData()
      }
      this.gatherAllModel(data)
    },
    gatherAllModel (data) {
      // this.wholeLoading = true
      const models = []
      const forEach = (node) => {
        if (!node) return
        if (node.models) {
          node.models.forEach((item) => {
            models.push(item)
          })
        }
        if (
          node.children &&
          (!this.showCurrentCat || !this.currentCategory.parentId)
        ) {
          node.children.forEach((item) => {
            forEach(item)
          })
        }
      }

      forEach(data)
      this.getModelData(models)
    },
    getModelData (models) {
      let childrenMap = {}
      let childrenToParent = {}
      let newModels = []
      models.forEach((v) => {
        v.rate = 0
        if (v.referredModelId || !v.root) {
          let refId = v.referredModelId || v.id
          childrenMap[refId]
            ? childrenMap[refId].push(v)
            : (childrenMap[refId] = [v])
          v.parent = childrenToParent[refId]
        } else {
          if (!childrenMap[v.id]) {
            childrenMap[v.id] = []
          }
          v.children = childrenMap[v.id]
          childrenToParent[v.id] = v
          newModels.push(v)
        }
      })
      let branchIdToAllRelatedBranchList = {}
      newModels.forEach((model) => {
        let relatedBranchList = model.children.map((m) => {
          if (m.branch) {
            return {
              id: m.id,
              name: m.name
            }
          } else {
            return {
              id: m.id,
              name: 'master'
            }
          }
        })
        relatedBranchList.forEach((branch) => {
          branchIdToAllRelatedBranchList[branch.id] = relatedBranchList
        })
      })
      this.$store.commit('setBranchMap', branchIdToAllRelatedBranchList)
      sort.sortConsiderChineseNumber(newModels, 'modelName')
      this.allData = newModels

      this.getTagsByModels()
      this.refreshTableData()
      if (this.$route.query.id) {
        // TODO 初始化时打开 query 传入的 模型
        this.$nextTick(() => {
          if (this.firstQuery) {
            this.$emit('openModelByQuery', this.filteredData)
            this.firstQuery = false
          }
        })
      }
    },
    filterData () {
      // 根据条件过滤全量模型
      this.filteredData = this.allData?.filter(this.simplyFilterData) || []
      this.total = this.filteredData.length
      this.handleSortData()
    },
    clearFilterData () {
      this.currentPage = 1
      this.modelKeyword = ''
      this.showCurrentCat = false
      this.sortProps = {
        prop: 'modelName',
        order: ''
      }
      if (this.tableFilterObj) {
        this.tableFilterObj.modelStatus = this.allText
        this.tableFilterObj.databaseType = ''
        this.tableFilterObj.tag = this.allText
      } else {
        this.tableFilterObj = {
          modelStatus: this.allText,
          databaseType: '',
          tag: this.allText
        }
      }
    },
    simplyFilterData (obj) {
      // 根据条件过滤全量模型
      if (this.showCurrentCat && obj.categoryId !== this.currentCategory.id) {
        // 是否仅显示当前目录下的模型
        return false
      }
      let keyword = _.trim(this.modelKeyword)
      // 过滤条件: 模型类型, keyword, tag, 模型状态
      let bool = keyword ? string.matchKeyword(obj, keyword, 'name', 'lastModifier') : true
      if (bool && this.tableFilterObj.databaseType && this.tableFilterObj.databaseType !== this.allText) {
        bool = obj.modelType.toLowerCase() === this.tableFilterObj.databaseType.toLowerCase()
      }
      if (bool && this.tableFilterObj.modelStatus && this.tableFilterObj.modelStatus !== this.allText) {
        bool = String(obj.phase) === String(this.tableFilterObj.modelStatus)
      }
      if (bool && this.tableFilterObj.tag && this.tableFilterObj.tag !== this.allText) {
        let modelTags = this.modelToTagMap.get(obj.id) || []
        bool = !!modelTags.find(item => item.id === this.tableFilterObj.tag)
      }
      if (obj.children?.length > 0) {
        obj.showChildren = []
        obj.children.forEach((child) => {
          let subBool = this.simplyFilterData(child)
          if (subBool) {
            bool = true
            obj.showChildren.push(child)
          }
        })
      }
      return bool
    },
    toggleTableExpansion (bool) {
      this.tableData.forEach((v) => {
        v.expanded = bool
        this.$refs.modelListTable?.toggleRowExpansion(v, bool)
      })
    },
    autoToggleTableExpansion () {
      this.toggleTable = !this.toggleTable
      this.resetExpandIcon(this.toggleTable)
    },
    resetExpandIcon (bool = false) {
      this.toggleTable = bool
      this.$nextTick(() => {
        this.toggleTableExpansion(this.toggleTable)
        let $dom = $('.iconfont.expand-icon')
        if (this.toggleTable) {
          $dom.addClass('icon-zhankai')
          $dom.removeClass('icon-shouqi')
        } else {
          $dom.addClass('icon-shouqi')
          $dom.removeClass('icon-zhankai')
        }
      })
    },

    showCatChange (val) {
      this.currentPage = 1
      this.debouncedFilter()
    },

    editModel (scope) {
      this.$http
        .put(`${this.$url}/service/editor/${scope.row.id}/lock`)
        .then((res) => {
          if (res.data) {
            if (inElectron) {
              // window.open(`./index.html#/main/modeledit?id=${scope.row.id}&currentVersion=${scope.row.currentVersion}&modelType=${scope.row.modelType}&phase=${scope.row.phase ? scope.row.phase : 0}`, '', 'width=1300,height=800,contextIsolation=no,nodeIntegration=yes,autoHideMenuBar=true')
              const { ipcRenderer } = window.require('electron')
              ipcRenderer &&
              ipcRenderer.send('newTab', JSON.stringify(scope.row))
            } else {
              window.open(
                `${window.baseUrl}#/main/modeledit?id=${
                  scope.row.id
                }&currentVersion=${scope.row.currentVersion}&modelType=${
                  scope.row.modelType
                }&phase=${scope.row.phase ? scope.row.phase : 0}`
              )
            }
          }
        })
        .catch((err) => {
          this.$showFailure(err)
        })
    },
    couldPublishModel (scope) {
      let bool = false
      const typeArr = [
        // 'LogicalBusinessDomain',
        'ConceptualBusinessDomain',
        'LogicalBusinessObject'
      ].map(item => item.toLowerCase())
      if (this.showEREdit && typeArr.includes(scope.row.modelType.toLowerCase()) && this.$store.state.lic.editor && scope.row.permissions.editor) {
        bool = true
      }
      return bool
    },
    showMoreAction (evt, scope) {
      evt.stopPropagation()
      let options = []
      if (scope.row.permissions.editor) {
        options.push({
          label: '创建分支',
          icon: 'iconfont icon-branch',
          callback: () => this.createBranch(scope)
        })
      }
      if (this.couldPublishModel(scope)) {
        options.push({
          label: '模型发布',
          icon: 'iconfont icon-publish',
          callback: () => {
            this.publishModel(scope.row)
          }
        })
      }
      let target = $(evt.target).offset()
      const x = target.left
      const y = target.top + 20
      if (options.length > 0) {
        let yOfResult = y
        let bottomMargin = 30 * options.length + 15
        if (window.innerHeight - y < bottomMargin) {
          yOfResult = window.innerHeight - bottomMargin
        }
        this.$bus.$emit('callContextMenu', {
          x: x + 44,
          y: yOfResult,
          options: options,
          placement: 'left'
        })
      }
    },
    createBranch (scope) {
      this.$refs.createBranch.dataInit(scope.row)
      this.expandModel = scope.row
    },
    branchCreated () {
      this.refreshModels()
    },
    publishModel (currentModel) {
      let currentType = ''
      switch (currentModel.modelType) {
        case 'LogicalBusinessDomain':
        case 'ConceptualBusinessDomain':
          currentType = 'domain'
          break
        case 'LogicalBusinessObject':
          currentType = 'object'
          break
      }
      this.publishData = {
        currentType: currentType,
        currentModel: currentModel
      }
      this.$nextTick(() => {
        this.$refs.publishModel?.dataInit()
      })
    },
    deleteBranchConfirm (scope) {
      this.$DatablauCofirm('确定要删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.deleteBranch(scope.row)
      }).catch((e) => {
        console.log(e, 'e')
        console.log('cancel')
      })
    },
    deleteBranch (model) {
      let deletePromise = null
      if (model.referredModelId) {
        let params = {
          modelId: model.referredModelId,
          baselineId: model.id
        }
        deletePromise = HTTP.deleteBranch(params)
      } else {
        let params = {
          modelId: model.id
        }
        deletePromise = HTTP.deleteModel(params)
      }
      deletePromise
        .then(res => {
          this.$datablauMessage.success('删除成功，已添加到回收站！')
          this.refreshModels()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleRowClick (row) {
      if (row.permissions.viewer) {
        this.$emit('handleRowClick', row)
      } else {
        this.$datablauMessage.error(this.$t('common.info.noModelPermission'))
      }
    },
    refreshModels () {
      // 刷新后台数据
      this.$bus.$emit('updateModelList')
    },
    tableResize () {
      let $searchLint = $(this.$refs.searchLine)
      let $tableCom = $('.form-submit.model-table-container')
      let top = this.needBind ? 50 : 58
      if ($searchLint.height() > 70) {
        if (this.needBind === true) {
          top += 10
        } else {
          top += 60
        }
      }
      $tableCom.css('top', top + 'px')
    }

  },
  watch: {
    modelKeyword (value) {
      this.currentPage = 1
      this.debouncedFilter()
    },
    tableFilterObj: {
      deep: true,
      handler: function () {
        this.currentPage = 1
        this.debouncedFilter()
      }
    },
    // 切换目录时, 判断 search line 高度
    'currentCategory.parentId' () {
      this.$nextTick(() => {
        this.tableResize()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.model-name-content {
  position: relative;
  &:before {
    content: '';
    position: absolute;
    top: -10px;
    left: -25px;
    right: -30px;
    bottom: -10px;
  }
}
.model-list {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  .search-line {
    margin-top: 10px;
    margin-left: 20px;
    .search-form {
      margin-right: 120px;
      &.sqlEditorform{
        margin-right: 0;
      }
    }
    //border: 1px solid red;
  }
  .scroll-container {

  }

  &.show-top {
    .search-line {
      //margin-top: 0;
      .show-current-category {
        display: inline-block;
        margin-left: 0px;
        //padding-top: 10px;
        height: 48px;
        vertical-align: bottom;
        &.needBind{
          position: absolute;
          // top: 77px;
          // left: 182px;
        }
      }
      .search-form {
        margin-right: 10px;
      }
    }
  }

  .model-table-container {
    //top: 139px;

    /deep/ .el-table__expand-icon:hover {
      color: #409eff;
    }

    /deep/ {
      .db-table .el-table--border td:first-child .cell,
      .db-table .el-table--border th:first-child .cell,
      .db-table .selection-column .cell {
        padding-left: 10px;
        padding-right: 10px;
      }
    }

    .tag {
      margin: unset;
      margin-left: 8px;
      height: 22px;
      line-height: 22px;
      border-radius: 2px;
    }
  }
  .bottom-container {
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
    height: 50px;
    text-align: right;
    padding-right: 30px;
    font-size: 12px;
    line-height: 16px;
  }

  /deep/ .el-table__fixed-right::before {
    background-color: transparent;
  }

  //// fix bug: table hover 错误，但是嵌套时不适用，资料：https://juejin.cn/post/7026650178765455374
  ///deep/ .el-table__body-wrapper {
  //  .el-table__expanded-cell {
  //    z-index: 100;
  //    padding: 0;
  //  }
  //}
  //
  ///deep/ .el-table__fixed,
  ///deep/ .el-table__fixed-right {
  //  .el-table__expanded-cell {
  //    visibility: hidden;
  //    padding: 0;
  //  }
  //}
  //
  //.sub-table {
  //  border: 1px solid #ebeef5;
  //  width: 100%; //calc(100vw - 200px);// 适合自己项目的宽度就行了
  //  background: #fff; //盖住fixed产生的阴影
  //  border-bottom: none;
  //
  //  ::v-deep .is-leaf {
  //    height: 40px;
  //    color: #1b2e3b;
  //    background: #ebeef5;
  //  }
  //}
}
</style>
<style lang="scss">
  // .expand-table{
  //   &.needBind{
  //     .el-table--enable-row-hover
  //     .el-table__body
  //     tr:hover
  //     > td.el-table__cell {
  //       background: #2F3234 !important;
  //     }
  //   }
  // }
</style>
