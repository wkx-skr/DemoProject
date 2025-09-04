<template>
  <div class="business-obj-list" :class="{ 'hide-info': categoryLevel === 1 }">
    <div class="top-detail" v-if="categoryLevel !== 1">
      <div class="left-info">
        <div
          class="icon-container"
          :class="{ 'theme-area': categoryLevel === 3 }"
        ></div>
        <div class="info-container">
          <p class="title">{{ currentCategory.name }}</p>
          <p class="define-text">定义：{{ currentCategory.definition }}</p>
        </div>
      </div>
      <div class="right-button">
        <datablau-dropdown
          style="display: inline-block"
          @command="handleMoreActionCommand"
          trigger="click"
          @visible-change="moreActionVisibleChange"
        >
          <datablau-button type="secondary" class="more-action-button">
            更多操作
            <i class="el-icon-arrow-down el-icon--right"></i>
          </datablau-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              command="downloadTemplate"
              icon="iconfont icon-download"
              >下载逻辑数据实体和业务属性模板</el-dropdown-item
            >
            <el-dropdown-item
              command="importBusinessObject"
              icon="iconfont icon-import"
              >导入逻辑数据实体和业务属性</el-dropdown-item
            >
            <el-dropdown-item
              command="exportBusinessObject"
              icon="iconfont icon-export"
              >导出逻辑数据实体和业务属性</el-dropdown-item
            >
            <!--<el-dropdown-item command="importEntry" icon="iconfont icon-import">导入实体和属性</el-dropdown-item>-->
            <!--<el-dropdown-item command="exportEntry" icon="iconfont icon-export">导出实体和属性</el-dropdown-item>-->
            <el-dropdown-item command="udpManage" icon="iconfont icon-expand"
              >扩展属性</el-dropdown-item
            >
          </el-dropdown-menu>
        </datablau-dropdown>
      </div>
    </div>
    <div class="filter-line">
      <div class="left-filter">
        <datablau-form
          @submit.native.prevent
          label-width="100"
          :inline="true"
          class="search-form"
          style="display: inline-block"
        >
          <!--<el-form-item label="" label-width="0">-->
          <!--  <datablau-input-->
          <!--    prefix-icon="el-icon-search"-->
          <!--    size="small"-->
          <!--    v-model="modelKeyword"-->
          <!--    :iconfont-state="true"-->
          <!--    placeholder="搜索名称、提交人"-->
          <!--    clearable-->
          <!--    style="width: 240px"-->
          <!--  ></datablau-input>-->
          <!--</el-form-item>-->
          <el-form-item>
            <datablau-input
              v-model="keyword"
              placeholder="搜索名称、编码"
              size="small"
              class="normal-width-input"
              clearable
              prefix-icon="el-icon-search"
              style="width: 240px"
              @keydown.enter.native="search"
              :iconfont-state="true"
            ></datablau-input>
          </el-form-item>
          <el-form-item>
            <datablau-button type="normal" @click="search" size="mini"
              >搜索
            </datablau-button>
            <!--<datablau-button-->
            <!--  type="secondary"-->
            <!--  @click="clearFilter"-->
            <!--&gt;重置-->
            <!--</datablau-button>-->
          </el-form-item>

          <!--<el-form-item label="数据概念">-->
          <!--  <datablau-select-->
          <!--    v-model="filterObj.filterTheme"-->
          <!--    style="width: 80px"-->
          <!--  >-->
          <!--    <el-option-->
          <!--      key="all"-->
          <!--      label="全部"-->
          <!--      value="all"-->
          <!--    ></el-option>-->
          <!--    <el-option-->
          <!--      v-for="item in themeList"-->
          <!--      :key="item.value"-->
          <!--      :label="item.value"-->
          <!--      :value="item.value"-->
          <!--    ></el-option>-->
          <!--  </datablau-select>-->
          <!--</el-form-item>-->
          <!--<el-form-item label="状态">-->
          <!--  <datablau-select-->
          <!--    v-model="filterObj.filterStatus"-->
          <!--    style="width: 80px"-->
          <!--  >-->
          <!--    <el-option-->
          <!--      key="all"-->
          <!--      label="全部"-->
          <!--      value="all"-->
          <!--    ></el-option>-->
          <!--    <el-option-->
          <!--      v-for="item in statusList"-->
          <!--      :key="item.value"-->
          <!--      :label="item.label"-->
          <!--      :value="item.value"-->
          <!--    ></el-option>-->
          <!--  </datablau-select>-->
          <!--</el-form-item>-->
          <!--<el-form-item label="发布时间">-->
          <!--  <datablau-dateRange-->
          <!--    v-model="filterObj.filterTime"-->
          <!--    :placeholder="'选择日期'"-->
          <!--    ref="eventStartTime"-->
          <!--    :timeType="'datetimerange'"-->
          <!--    class="choose-time"-->
          <!--  ></datablau-dateRange>-->
          <!--</el-form-item>-->
        </datablau-form>
      </div>
      <div class="right-button">
        <!-- <datablau-button
          type="important"
          class="iconfont icon-tianjia add-theme"
          @click="handleAdd"
          style="display: inline-block"
        >
          新建业务对象
        </datablau-button> -->
        <datablau-dropdown
          style="display: inline-block"
          @command="handleMoreActionCommand"
          trigger="click"
          v-if="categoryLevel === 1"
          @visible-change="moreActionVisibleChange"
        >
          <datablau-button type="secondary" class="more-action-button">
            更多操作
            <i class="el-icon-arrow-down el-icon--right"></i>
          </datablau-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              command="downloadTemplate"
              icon="iconfont icon-download"
              >下载逻辑数据实体和业务属性模板</el-dropdown-item
            >
            <el-dropdown-item
              command="importBusinessObject"
              icon="iconfont icon-import"
              >导入逻辑数据实体和业务属性</el-dropdown-item
            >
            <el-dropdown-item
              command="exportBusinessObject"
              icon="iconfont icon-export"
              >导出逻辑数据实体和业务属性</el-dropdown-item
            >
            <!--<el-dropdown-item command="importEntry" icon="iconfont icon-import">导入实体和属性</el-dropdown-item>-->
            <!--<el-dropdown-item command="exportEntry" icon="iconfont icon-export">导出实体和属性</el-dropdown-item>-->
            <!-- <el-dropdown-item command="udpManage" icon="iconfont icon-expand"
              >扩展属性</el-dropdown-item
            > -->
          </el-dropdown-menu>
        </datablau-dropdown>

        <datablau-upload
          :action="actionUrl"
          :show-file-list="false"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          style="display: inline-block; vertical-align: top; margin-right: 8px"
          :multiple="false"
          :isEdit="true"
          v-show="false"
          :headers="$headers"
        >
          <!--<datablau-button-->
          <!--  class="iconfont icon-upload"-->
          <!--  type="secondary"-->
          <!--  ref="businessObjectUpload"-->
          <!--&gt;导入-->
          <!--</datablau-button>-->
          <input type="text" class="business-obj-upload" />
        </datablau-upload>
        <datablau-download
          v-show="false"
          ref="businessObjectDownload"
          class="type-export"
          style="display: inline-block"
          :type="'secondary'"
          :url="downLoadUrl"
        ></datablau-download>
      </div>
    </div>
    <datablau-form-submit class="list-outer-container">
      <datablau-table
        :data="tableData"
        height="100%"
        :data-selectable="true"
        ref="staffTable"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          show-overflow-tooltip
          label="所属对象名称"
          prop="name"
          min-width="120"
        >
          <template slot-scope="scope">
            <datablau-list-icon
              iconType="svg"
              :dataType="'business_object'"
            ></datablau-list-icon>
            <span
              @click.stop="handleCheck({ data: scope.row })"
              class="list-table-link"
            >
              {{ scope.row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          label="业务对象编码"
          prop="code"
          min-width="120"
        >
        </el-table-column>
        <!--<el-table-column-->
        <!--  show-overflow-tooltip-->
        <!--  label="英文名称"-->
        <!--  prop="alias"-->
        <!--  min-width="90"-->
        <!--&gt;-->
        <!--</el-table-column>-->
        <!-- <el-table-column
          show-overflow-tooltip
          label="路径"
          prop="path"
          min-width="180"
        >
        </el-table-column> -->
        <!-- <el-table-column
          show-overflow-tooltip
          label="数据概念"
          prop="subjectTag"
          min-width="100"
        >
          <template slot="header">
            数据概念
            <datablau-table-checkbox-filter
              v-model="filterObj.filterTheme"
              key="subjectTag"
              ref="themeFilter"
              :data="themeList"
              :props="{
                key: 'value',
                value: 'value',
                label: 'label',
                showAll: true
              }"
              @confirmChecked="handleCheckboxConfirm"
            ></datablau-table-checkbox-filter>
          </template>
        </el-table-column> -->
        <el-table-column
          show-overflow-tooltip
          label="所属对象状态"
          prop="catalogState"
          min-width="120"
        >
          <template slot-scope="scope">
            {{ transState(scope.row.catalogState) }}
          </template>
        </el-table-column>
        <el-table-column
          width="190"
          label="业务对象创建时间"
          show-overflow-tooltip
          :formatter="$timeFormatter"
          prop="createTime"
        >
          <template slot="header">
            业务对象创建时间
            <datablau-table-date-range-filter
              v-model="filterObj.createTime"
              ref="createTimeFilter"
              @confirmSelected="handleCheckboxConfirm"
            ></datablau-table-date-range-filter>
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          label="模型发布状态"
          prop="state"
          min-width="150"
        >
          <template slot="header">
            模型发布状态
            <datablau-table-checkbox-filter
              v-model="filterObj.filterStatus"
              key="filterStatus"
              :data="statusList"
              ref="statusFilter"
              :props="{
                key: 'value',
                value: 'value',
                label: 'label',
                showAll: true,
              }"
              @confirmChecked="handleCheckboxConfirm"
            ></datablau-table-checkbox-filter>
          </template>
          <template slot-scope="scope">
            <!--<span :class="`status ${scope.row.state}`">-->
            <!--  {{ getStatusName(scope.row.state) }}-->
            <!--</span>-->
            <status :type="scope.row.state"></status>
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          label="已发布模型版本"
          prop="modelVersionName"
          min-width="120"
        >
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          label="模型最新版本"
          prop="modelVersionCurrentName"
          min-width="120"
        >
        </el-table-column>
        <!-- <el-table-column
          width="190"
          label="发布时间"
          show-overflow-tooltip
          :formatter="$timeFormatter"
          prop="releaseTime"
        >
          <template slot="header">
            发布时间
            <datablau-table-date-range-filter
              ref="releaseTimeFilter"
              v-model="filterObj.releaseTime"
              @confirmSelected="handleCheckboxConfirm"
            ></datablau-table-date-range-filter>
          </template>
        </el-table-column> -->
        <el-table-column
          label="操作"
          width="180"
          fixed="right"
          header-align="center"
          align="center"
        >
          <template slot-scope="scope">
            <datablau-button
              type="icon"
              class="iconfont icon-publish"
              @click.stop="handlePublish({ data: scope.row })"
              :disabled="(scope.row.authInfo !== 'MANAGER' && scope.row.authInfo !== 'EDIT') || !(scope.row.state === 'D') || !(scope.row.catalogState === 'PUBLISHED')"
            >
            </datablau-button>
            <datablau-button
              type="icon"
              class="iconfont icon-see"
              @click.stop="handleCheck({ data: scope.row })"
              tooltipContent="查看"
            >
            </datablau-button>
            <datablau-button
              type="icon"
              class="iconfont icon-bianji"
              @click.stop="handleEditModel({ data: scope.row })"
              tooltipContent="模型设计"
              :disabled="scope.row.authInfo !== 'MANAGER' && scope.row.authInfo !== 'EDIT'"
            >
            </datablau-button>
            <!-- <datablau-button
              type="icon"
              class="iconfont icon-bianji"
              @click.stop="handleEdit({data: scope.row})"
              :tooltipContent="(scope.row.state === 'C' || scope.row.state === 'X')
                ? (scope.row.state === 'C' ? '审核中不可编辑' : '已废弃不可编辑')
                :
                '编辑'"
              :disabled="scope.row.state === 'C' || scope.row.state === 'X'"
            >
            </datablau-button>
            <datablau-button
              type="icon"
              class="iconfont icon-delete"
              @click.stop="handleDelete2({data: scope.row})"
              :disabled="scope.row.state !== 'D'"
              :tooltipContent="scope.row.state !== 'D' ? '已发布不可删除' : '删除'"
            >
            </datablau-button> -->
            <!-- <datablau-button
              type="icon"
              class="iconfont icon-abandon"
              @click.stop="handleDelete({data: scope.row})"
              :disabled="scope.row.state !== 'A'"
              :tooltipContent="(scope.row.state !== 'A') ? '未发布不可废弃' : '废弃'"
            >
            </datablau-button> -->
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">
        <div class="left-buttons">
          <div
            slot="footer"
            class="footer-tool"
            style="z-index: 2"
            v-show="selection.length > 0"
          >
            <div
              class="disc-text"
              style="display: inline-block; margin-right: 8px"
            >
              当前选中“{{ selection.length }}条”信息，是否
            </div>
            <datablau-button
              @click="deleteList"
              type="danger"
              class="el-icon-delete"
              :disabled="disabledDeleteBusinessObject"
              style="display: inline-block"
              :tooltipContent="
                !disabledDeleteBusinessObject
                  ? '删除'
                  : '只有待审核的业务对象可以删除'
              "
            >
              删除
            </datablau-button>
            <datablau-button
              type="normal"
              class="iconfont icon-export"
              @click="exportList"
              style="display: inline-block"
            >
              导出业务对象
            </datablau-button>
            <datablau-button
              type="normal"
              class="iconfont icon-export"
              @click="exportList"
              style="display: inline-block"
              v-if="false"
            >
              导出实体和属性
            </datablau-button>
            <datablau-button
              type="normal"
              class="iconfont icon-publish"
              @click="batchPublish"
              style="display: inline-block"
              :disabled="batchPublishDisabled"
              :tooltipContent="
                !batchPublishDisabled ? '发布' : '只有待审核且所属对象状态已发布的业务对象可以发布'
              "
            >
              发布
            </datablau-button>
            <!--<datablau-button-->
            <!--  type="normal"-->
            <!--  class="iconfont icon-abandon"-->
            <!--  @click="batchDiscard"-->
            <!--  style="display: inline-block;"-->
            <!--  :disabled="disabledDiscardBusinessObject"-->
            <!--  :tooltipContent="!disabledDiscardBusinessObject ? '废弃' : '只有已发布的业务对象可以废弃'"-->
            <!--&gt;-->
            <!--  申请废弃-->
            <!--</datablau-button>-->
          </div>
        </div>
        <div class="bottom-pagination-container">
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
import paginationMixin from '@/components/common/mixin/paginationMixin'
import moment from 'moment'
import status from './Status.vue'

export default {
  name: 'businessObjectList',
  data () {
    return {
      subjectTag: '',
      showType: '',
      statusList: [
        {
          value: 'A',
          label: '已发布'
        },
        {
          value: 'C',
          label: '审核中'
        },
        {
          value: 'D',
          label: '待审核'
        },
        {
          value: 'X',
          label: '已废弃'
        }
      ],
      filterObj: {
        filterStatus: [],
        filterTheme: [],
        createTime: [],
        releaseTime: []
      },
      autoSearch: false,
      selection: [],
      currentObject: {},
      loading: false,
      defaultParaData: {
        keyword: '',
        currentPage: 1,
        pageSize: 20
      },
      getData: null,
      // table组件结束
      themeList: [],
      dialogLoading: true,
      actionUrl: `${HTTP.$archyServerUrl}object/L4L5/import`,
      downLoadUrl: `${HTTP.$archyServerUrl}object/L4L5/export`
    }
  },
  mixins: [paginationMixin],
  props: {
    currentCategory: {
      required: true
    },
    categoryLevel: { // 目录层级
      type: Number,
      default: 0
    },
    objectId: {
      type: String
    }
  },
  components: {
    status
    // editBusinessObj
  },
  created () {
    this.getData = _.debounce(this.getDataInner, 300)
    this.clearFilter()
  },
  mounted () {
    this.getAllModelTheme()
  },
  computed: {
    // themeName () {
    //   let res = this.themeList.find(i => i.id === +this.objectId)
    //   return res && res.name
    // },
    disabledDeleteBusinessObject () {
      return this.selection.some(v => v.state !== 'D')
    },
    disabledDiscardBusinessObject () {
      return this.selection.some(v => v.state !== 'A')
    },
    batchPublishDisabled () {
      return this.selection.some(v => v.state !== 'D') || this.selection.some(v => v.catalogState !== 'PUBLISHED') || this.selection.some(v => v.authInfo !== 'MANAGER' && v.authInfo !== 'EDIT')
    }
  },
  methods: {
    transState (type) {
      if (type === 'UNPUBLISHED') {
        return '未发布'
      } else if (type === 'UNDER_REVIEW') {
        return '审核中'
      } else if (type === 'PUBLISHED') {
        return '已发布'
      } else if (type === 'OFFLINE') {
        return '已下线'
      } else {
        return '未发布'
      }
    },
    getStatusName (state) {
      let result = ''
      switch (state) {
        case 'A':
          result = '已发布'
          break
        case 'C':
          result = '审核中'
          break
        case 'D':
          result = '待审核'
          break
        case 'X':
          result = '已废弃'
          break
        case 'O':
          result = '过时的'
          break
      }
      return result
    },
    deleteList () {
      this.$DatablauCofirm(`确定批量删除对象？`)
        .then(res => {
          HTTP.deleteBusinessObjList(this.selection.map(v => v.id))
            .then(res => {
              this.refreshData()
              this.$blauShowSuccess('删除成功')
            })
            .catch(err => {
              this.$showFailure(err)
              console.error(err)
            })
        })
    },
    exportList () {
      this.$datablauDownload(`${HTTP.$archyServerUrl}object/objects/export/selected`, this.selection.map(v => v.id), '业务对象')
    },
    batchPublish () {
      this.$http.post(`${HTTP.$archyServerUrl}object/objects/process/apply`, this.selection.map(v => v.id))
        .then(res => {
          this.$datablauMessage.success('申请发布成功')
          this.refreshData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    batchDiscard () {
      HTTP.deleteBusinessObjList(this.selection.map(v => v.id))
        .then(res => {
          this.refreshData()
          this.$blauShowSuccess('申请废弃成功')
        })
        .catch(err => {
          this.$showFailure(err)
          console.error(err)
        })
    },
    // changeEventStartTime (val) {
    //   this.refreshData()
    // },

    selectionChange (arr) {
      this.selection = arr
    },
    getAllModelTheme () {
      this.themeList = []
      // this.dialogLoading = true
      HTTP.getAllSubTagList()
        .then(res => {
          let a = (res || []).filter(item => !!item)
          this.dialogLoading = false
          // console.log(res, 'res')
          let arr = a.map(item => {
            return {
              value: item,
              label: item
            }
          })
          this.themeList.push(...arr)
          // console.log(arr, 'arr')
          // this.themeList = arr
          // this.themeList = [{ label: 'aa', value: 'bb' }]
          // console.log(this.themeList, 'this.themeList')
        })
        .catch(err => {
          this.dialogLoading = false
          this.$showFailure(err)
          console.error(err)
        })
    },
    handleCheckboxConfirm () {
    },
    handleUploadSuccess (msg) {
      this.loading = false
      // if (msg && Object.keys(msg).length > 0) {
      //   let errMsg = `<span style="line-height: 24px;">导入数据完成，下列条目失败：</span><br>`
      //   Object.keys(msg).forEach(key => {
      //     errMsg += `<span style="line-height: 24px;"><span>${key}：</span><span>${msg[key]}</span></span><br>`
      //   })
      //   this.$datablauMessage({
      //     dangerouslyUseHTMLString: true,
      //     message: errMsg,
      //     showClose: true,
      //     duration: 30000,
      //     type: 'info'
      //   })
      // } else {
      //   this.$blauShowSuccess('数据导入完成')
      // }
      this.$datablauMessage.success(`数据导入完成${msg.successSize ? `，成功新增${msg.successSize}条数据` : ''}${msg.modifySize ? `，变更${msg.modifySize}条数据` : ''}`)
      this.refreshTreeData()
      this.refreshData()
    },

    handleUploadError (err) {
      this.loading = false
      this.$showFailure(err)
    },
    clearFilter () {
      this.keyword = ''
      this.$refs.themeFilter?.resetState()
      this.$refs.statusFilter?.resetState()
      this.$refs.createTimeFilter?.resetState()
      this.$refs.releaseTimeFilter?.resetState()
      this.$refs.themeFilter?.close()
      this.$refs.statusFilter?.close()
      this.$refs.createTimeFilter?.close()
      this.$refs.releaseTimeFilter?.close()
      let { filterStatus, filterTheme, createTime, releaseTime } = this.filterObj
      if (filterStatus.length || filterTheme.length || createTime.length || releaseTime.length) {
        // 清空过滤条件，自动触发刷新
        this.filterObj = {
          filterStatus: [],
          filterTheme: [],
          createTime: ['', ''],
          releaseTime: ['', '']
        }
      } else {
        // 过滤条件不变，手动触发刷新
        this.fetchData()
      }
    },
    refreshTreeData () {
      this.$emit('refreshTreeData')
    },
    refreshData () {
      // console.log('refreshData')
      let para = {
        keyword: this.keyword,
        currentPage: this.currentPage,
        pageSize: this.pageSize
      }
      this.getData(para)
    },
    handleMoreActionCommand (command) {
      if (command === 'downloadTemplate') {
        this.downloadBusinessTemplate()
      } else if (command === 'importBusinessObject') {
        this.$el.querySelector('.business-obj-upload').click()
      } else if (command === 'exportBusinessObject') {
        this.$refs.businessObjectDownload.handleClick()
      } else if (command === 'importEntry') {
        this.$el.querySelector('.business-obj-upload').click()
      } else if (command === 'exportEntry') {
        this.$refs.businessObjectDownload.handleClick()
      } else if (command === 'udpManage') {
        // console.log('udpManage')
        this.$emit('udp-manage')
      }
    },
    moreActionVisibleChange (visible) {
      // if (visible) {
      //   $('.more-action-button .el-icon-arrow-down').addClass('hide-arrow-icon')
      // } else {
      //   $('.more-action-button .el-icon-arrow-down').removeClass('hide-arrow-icon')
      // }
    },
    downloadBusinessTemplate () {
      // this.$datablauDownload(`${HTTP.$archyServerUrl}object/objects/export/template`, null, '对象模板')
      this.$datablauDownload(`${HTTP.$archyServerUrl}object/L4L5/export/template`)
    },
    handleSelectionChange (val) {
      this.selection = val
    },
    handleAdd () {
      this.$emit('add-business-obj')
    },
    handleEdit (row) {
      this.$emit('edit-business-obj', row.data)
    },
    handleDelete (row) {
      // this.$DatablauCofirm(`确定删除对象 ${row.data.name} ？`)
      //   .then(res => {
      //     // this.deleteThemeDetail(row.data.id)
      //   })
      this.loading = true
      HTTP.delBusinessObject(row.data.id)
        .then(res => {
          this.$blauShowSuccess('申请废弃成功')
          this.refreshData()
        })
        .catch(err => {
          console.error(err)
          this.$showFailure(err)
        })
    },
    handleDelete2 (row) {
      this.$DatablauCofirm(`确定删除对象 ${row.data.name} ？`)
        .then(res => {
          HTTP.delBusinessObject(row.data.id)
            .then(res => {
              this.$blauShowSuccess('申请删除成功')
              this.refreshData()
            })
            .catch(err => {
              console.error(err)
              this.$showFailure(err)
            })
        })
    },
    handleEditModel (row) {
      window.open(`${window.baseUrl}#/main/modeledit?id=${row.data.logicalModelId}&currentVersion=${row.data.modelEndVer}&modelType=LogicalBusinessObject`, '_blank')
    },
    handleCheck (row) {
      this.$emit('showObjectDetail', row.data.id, row.data.logicalModelId)
      // this.$router.push({ path: `/main/businessObj/detail/${row.data.id}?showHistory=true` })
      // setTimeout(() => {
      //   if (this.showType === 'theme') {
      //     this.$bus.$emit('refeshBreadcrumbData', [{
      //       name: '主题',
      //       operate: '/main/modelTheme'
      //     }, {
      //       name: '业务对象',
      //       operate: `/main/modelTheme/detail/${this.objectId}`
      //     }])
      //   }
      // })
    },
    handlePublish (row) {
      this.loading = true
      HTTP.applyPublishBusinessObject(row.data.id)
        .then(res => {
          this.$blauShowSuccess('申请发布成功')
          this.refreshData()
        })
        .catch(err => {
          // console.log(err)
          this.$showFailure(err)
        })
    },
    search () {
      this.fetchData()
    },
    getDataInner (para) {
      // getData (para) {
      // console.log('currentCategory', this.currentCategory)
      // let para = {}
      this.loading = true
      let createTime = this.filterObj.createTime
      let releaseTime = this.filterObj.releaseTime
      para.name = para.keyword || ''
      if (this.objectId) {
        para.subjectId = this.objectId
      }
      // 数据概念
      // if (this.filterObj.filterTheme?.length) {
      //   para.subjectTag = this.filterObj.filterTheme[0] || ''
      // }
      para.subjectTag = this.filterObj.filterTheme
      // 左侧目录
      para.subjectId = this.currentCategory.id
      // if (this.filterObj.filterStatus?.length) {
      //   para.state = this.filterObj.filterStatus[0] || ''
      // }
      para.state = this.filterObj.filterStatus
      // console.log(para.state, 'para.state')
      // console.log(para.subjectTag, 'para.subjectTag')

      // para.state = ''
      // para.subjectTag = ''
      if (createTime && createTime.length === 2) {
        para.createStartDate = createTime[0]
        para.createEndDate = createTime[1]
      }
      if (releaseTime && releaseTime.length === 2) {
        para.releasedStartDate = releaseTime[0]
        para.releasedEndDate = releaseTime[1]
      }
      let obj = {
        pageSize: para.pageSize,
        currentPage: para.currentPage
      }
      obj.requestBody = {
        name: para.name || null,
        subjectTag: para.subjectTag || null,
        subjectId: para.subjectId || null,
        state: para.state || null,
        releasedStartDate: para.releasedStartDate || null,
        releasedEndDate: para.releasedEndDate || null,
        createStartDate: para.createStartDate || null,
        createEndDate: para.createEndDate || null
      };
      ['releasedStartDate', 'releasedEndDate', 'createStartDate', 'createEndDate'].forEach(key => {
        // timeFormatter
        if (obj.requestBody[key]) {
          obj.requestBody[key] = moment(obj.requestBody[key]).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
        }
      })
      this.tableData = null
      HTTP.getBusinessObjList(obj)
        .then(res => {
          this.loading = false
          this.total = res.totalElements
          // 遍历每条数据，获取权限信息
          const getAuthPromises = (res.content || []).map(item => {
            return this.$http.get(`/assets/auth/list/${item.catalogId}/PERSON`).then(authRes => {
              // 假设接口返回权限信息，挂载到item.authInfo
              item.authInfo = authRes.data.userAuthDtos.find(v => v.username === this.$user.username).authType
              return item
            }).catch(() => {
              // 获取失败时也返回原item
              item.authInfo = null
              return item
            })
          })
          Promise.all(getAuthPromises).then(listWithAuth => {
            this.tableData = listWithAuth
          })
        })
        .catch(e => {
          this.$showFailure(e)
          this.loading = false
        })
    }
  },
  watch: {
    // currentCategory: {
    //   deep: true,
    //   immediate: true,
    //   handler: function () {
    //     this.clearFilter()
    //   }
    // },
    currentCategory () {
      this.clearFilter()
    },
    filterObj: {
      deep: true,
      handler: function () {
        this.fetchData()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/next/components/basic/color.sass";
@mixin absPos() {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.business-obj-list {
  @include absPos();
  //border: 1px solid red;
  overflow: hidden;

  .left-buttons {
    display: inline-block;
  }

  .bottom-pagination-container {
    display: inline-block;
    float: right;
  }

  .top-detail {
    height: 70px;
    background: #F6F8FF;
    padding: 0 20px;
    position: relative;

    .left-info {
      display: flex;
      //border: 1px solid red;
      @include absPos();
      right: 130px;
      left: 20px;
      flex-wrap: nowrap;
      justify-content: flex-start;
      align-items: center;

      .icon-container {
        //border: 1px solid red;
        display: inline-block;
        width: 40px;
        height: 40px;
        margin-right: 8px;
        background: transparent url("../../../assets/images/search/business_area.svg") no-repeat center/contain;

        &.theme-area {
          background-image: url("../../../assets/images/search/theme-area.svg");
        }
      }

      .info-container {
        display: inline-block;
        //border: 1px solid red;
        color: #555;

        .title {
          font-size: 16px;
        }

        .define-text {
          line-height: 14px;
        }
      }
    }

    .right-button {
      float: right;
      height: 100%;
      line-height: 70px;
    }
  }

  .filter-line {
    position: absolute;
    box-sizing: border-box;
    z-index: 4;
    //border: 1px solid red;
    left: 0px;
    padding: 8px 20px;
    height: 48px;
    right: 0;
    top: 70px;

    .left-filter {
      display: inline-block;
    }

    .right-button {
      display: inline-block;
      float: right;
      //width: 300px;

      .add-theme {
        margin-right: 10px;
      }
    }
  }

  .list-outer-container {
    @include absPos();
    top: 118px;
    //border: 1px solid red;
    .list-table-link {
      cursor: pointer;

      &:hover {
        color: $primary-color
      }
    }
  }

  &.hide-info {
    .filter-line {
      top: 0;
    }

    .list-outer-container {
      top: 48px;
    }
  }

}

.more-action-button {
  i.el-icon-arrow-down {
    opacity: 1;
    transition: opacity 0.4s;

    &.hide-arrow-icon {
      opacity: 0;
    }
  }
}
</style>
