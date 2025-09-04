<template>
    <div class="list-content" :class="{'hide-info': categoryLevel === 1}">
      <datablau-dialog
        size="xl"
        :title="$t('domain.common.upd')"
        :visible.sync="udpDialogVisible"
        append-to-body
        :height="560"
      >
        <udps
          v-if="udpDialogVisible"
          @getUdps="getUdps"
          @closeUdpDialog="udpDialogVisible = false"
        ></udps>
      </datablau-dialog>
      <div class="top-detail" v-if="currentCategory.parentId!==0">
        <img :src="bg" class="bg"/>
        <div class="left-info">
          <div class="icon-container">
            <datablau-icon v-if="categoryLevel === 2" :data-type="'yingyongyu'" icon-type="svg" :size="40" ></datablau-icon>
            <datablau-icon v-else :data-type="'menugzgl'" icon-type="svg" :size="40" ></datablau-icon>
          </div>
          <div class="info-container">
            <p class="title">{{currentCategory.name}}</p>
            <p class="define-text">英文简称：{{ currentCategory.abbreviation }}</p>
          </div>
        </div>
        <div class="right-button">
          <datablau-dropdown style="display: inline-block;" @command="handleMoreActionCommand">
            <datablau-button
              type="secondary"
              class=""
              @command="handleMoreActionCommand"
            >
              更多操作
              <i class="el-icon-arrow-down el-icon--right"></i>
            </datablau-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="downloadTemplate" icon="iconfont icon-download">下载模板</el-dropdown-item>
              <el-dropdown-item command="importBusinessObject" icon="iconfont icon-import">导入</el-dropdown-item>
              <el-dropdown-item command="exportBusinessObject" icon="iconfont icon-export">导出</el-dropdown-item>
              <el-dropdown-item command="udpManage" icon="iconfont icon-expand">扩展属性</el-dropdown-item>
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
            <el-form-item>
              <datablau-input
                v-model="keyword"
                :iconfont-state="true"
                :placeholder="$store.state.$v.common.placeholder"
                @keydown.enter.native="searchSystemList"
                style="width: 264px;"
              ></datablau-input>
            </el-form-item>
            <el-form-item >
                <datablau-button type="normal" @click="searchSystemList">搜索</datablau-button>
            </el-form-item>
            <el-form-item >
                <datablau-button type="secondary" @click="resetting()">重置</datablau-button>
            </el-form-item>

          </datablau-form>
        </div>
        <div class="right-button">
          <datablau-button
            type="important"
            class="iconfont icon-tianjia"
            @click="handleAdd"
            style="display: inline-block;"
            v-if="currentCategory.parentId!==0"
          > 新建应用系统
          </datablau-button>
          <datablau-dropdown @command="handleMoreActionCommand" style="display: inline-block;" v-if="currentCategory.parentId===0">
            <datablau-button
              type="secondary"
              style="margin-left: 10px;"
            >
              更多操作
              <i class="el-icon-arrow-down el-icon--right"></i>
            </datablau-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="downloadTemplate" icon="iconfont icon-download">下载模板</el-dropdown-item>
              <el-dropdown-item command="importBusinessObject" icon="iconfont icon-import">导入</el-dropdown-item>
              <el-dropdown-item command="exportBusinessObject" icon="iconfont icon-export">导出</el-dropdown-item>
              <el-dropdown-item command="udpManage" icon="iconfont icon-expand">扩展属性</el-dropdown-item>
            </el-dropdown-menu>
          </datablau-dropdown>
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
            <template >
              <datablau-icon style="vertical-align: text-top;" :data-type="'modelcategory'" icon-type="svg" :size="18" ></datablau-icon>
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            label="名称"
            prop="name"
            min-width="90"
          >
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            label="简称"
            prop="abbreviation"
            min-width="90"
          >
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            label="业务域"
            prop="zone"
            min-width="90"
          >
          </el-table-column>
          <el-table-column
            width="140"
            label="技术部门"
            show-overflow-tooltip
          >
            <template slot="header">
              技术部门<datablau-table-tree-filter
              showOverflowTooltip
              v-model="itDepartment"
              ref="itDepartment"
              :data="businessDepartmentData"
              :props="defaultProps"
              :filter-node-method="filterNode"
              @confirmSelected="handleTreeSelect2"
            ></datablau-table-tree-filter>
            </template>
            <template slot-scope="scope">
              {{allDepartmentMap[scope.row.itDepartment].fullName}}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            label="业务部门"
            min-width="110"
          >
            <template slot="header">
              业务部门<datablau-table-tree-filter
              v-model="businessDepartment"
              showOverflowTooltip
              ref="businessDepartment"
              :data="businessDepartmentData"
              :props="defaultProps"
              :filter-node-method="filterNode"
              @confirmSelected="handleTreeSelect"
            ></datablau-table-tree-filter>
            </template>
            <template slot-scope="scope">
              {{allDepartmentMap[scope.row.businessDepartment].fullName}}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            label="模型数量"
            prop="modelCount"
            min-width="90"
          >
          </el-table-column>
          <el-table-column
            width="180"
            label="创建时间"
            show-overflow-tooltip
            :formatter="$timeFormatter"
            prop="createTime"
          >
          <template slot="header">
            创建时间<datablau-table-date-range-filter
            ref="timeDate"
            v-model="timeDate"
            @confirmSelected="handleDateRangeSelect"></datablau-table-date-range-filter>
          </template>
          </el-table-column>
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
                class="iconfont icon-see"
                @click.stop="handleCheck({data: scope.row})"
                tooltipContent="查看"
              >
              </datablau-button>
              <datablau-button
                type="icon"
                class="iconfont icon-bianji"
                @click.stop="handleEdit({data: scope.row})"
              >
              </datablau-button>
              <datablau-button
                type="icon"
                class="iconfont icon-delete"
                @click.stop="handleDelete({data: scope.row})"
              >
              </datablau-button>
            </template>
          </el-table-column>
        </datablau-table>
        <template slot="buttons">
          <div class="left-buttons">
            <!-- <div slot="footer" class="footer-tool" style="z-index: 2;" v-show="selection.length > 0">
              <div class="disc-text" style="display: inline-block;margin-right: 8px;">
                当前选中“{{ selection.length }}条”信息，是否
              </div>
              <datablau-button
                type="normal"
                class="iconfont icon-export"
                @click="exportList"
                style="display: inline-block;"
              >
                导出
              </datablau-button>
              <datablau-button
                @click="deleteList"
                type="danger"
                class="el-icon-delete"
                :disabled="disabledShowDel"
                style="display: inline-block;"
              >
                删除
              </datablau-button>
            </div> -->
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
      <datablau-upload
          :action="actionUrl"
          :show-file-list="false"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          style="display: inline-block;vertical-align: top;margin-right: 8px;"
          :multiple="false"
          :isEdit="true"
          v-show="false"
          :headers="$headers"
        >
          <input type="text" class="business-obj-upload">
      </datablau-upload>
    </div>
  </template>

<script>
import HTTP from '@/resource/http'
import DatablauButton from '@/next/components/basic/button/DatablauButton.vue'
import udps from './udps.vue'
// import setUdp from '@/dataWarehouse/views/dataIndex/indexManagement/dimensionDefinition/setUdp.vue'

export default {
  name: 'rightlist',
  data () {
    return {
      loading: false,
      tableData: [],
      // table组件结束
      themeList: [],
      total: 0,
      pageSize: 20,
      currentPage: 1,
      keyword: '',
      bg: require('@/assets/images/bg/bg33.png'),
      udpDialogVisible: false,
      defaultProps: {
        children: 'children',
        label: 'fullName'
      },
      businessDepartmentData: [],
      businessDepartment: null,
      itDepartment: null,
      timeDate: null,
      timeDateArr: [],
      actionUrl: `${HTTP.$archyServerUrl}system/systems/import`
    }
  },
  props: {
    allDepartmentMap: {
      required: true
    },
    currentCategory: {
      required: true
    },
    objectId: {
      type: String
    },
    categoryLevel: { // 目录层级
      type: Number,
      default: 0
    }
  },
  components: {
    udps
  },
  mounted () {
    this.getSystemsList()
    this.getUdps()
    this.getOrgDetailByBm()
    this.$route.query?.name && (this.keyword = this.$route.query.name)
  },
  computed: {
  },
  created () {
    this.clearFilter()
  },
  methods: {
    clearFilter () {
      this.$refs.timeDate?.resetState()
      this.$refs.itDepartment?.resetState()
      this.$refs.businessDepartment?.resetState()
      this.$refs.timeDate?.close()
      this.$refs.itDepartment?.close()
      this.$refs.businessDepartment?.close()
      if (this.timeDateArr || this.itDepartment || this.businessDepartment) {
        // 清空过滤条件，自动触发刷新
        this.timeDate = null
        this.itDepartment = null
        this.businessDepartment = null
        this.timeDateArr = ['', '']
      } else {
        // 过滤条件不变，手动触发刷新
        this.getSystemsList()
      }
    },
    handleUploadSuccess (msg) {
      this.loading = false
      this.$blauShowSuccess(msg)
      this.getSystemsList()
      this.$emit('getTree')
    },
    handleUploadError (e) {
      this.loading = false
      this.$showUploadFailure(e)
    },
    handleDateRangeSelect (val) {
      this.timeDateArr = val
      this.getSystemsList()
    },
    getOrgDetailByBm () {
      HTTP.getOrgTreeBy().then(res => {
        console.log(res, 'res')
        if (res.data !== '') {
          this.businessDepartmentData.push(res.data)
        } else {
          this.businessDepartmentData = []
        }
      })
    },
    filterNode (value, data, node) {
      if (!value) return true
      return data.fullName.toLowerCase().indexOf(value.toLowerCase()) > -1
    },
    handleTreeSelect (val) {
      this.businessDepartment = val.bm
      this.getSystemsList()
    },
    handleTreeSelect2 (val) {
      this.itDepartment = val.bm
      this.getSystemsList()
    },
    getUdps () {
      this.$http.get(`${HTTP.$archyServerUrl}system/category/udps`)
        .then(res => {
          this.$emit('setUdps', res.data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleMoreActionCommand (command) {
      if (command === 'downloadTemplate') {
        const url = `${HTTP.$archyServerUrl}system/systems/export/template`
        this.$downloadFilePost(
          url,
          this.idArr
        )
      } else if (command === 'importBusinessObject') {
        this.$el.querySelector('.business-obj-upload').click()
      } else if (command === 'exportBusinessObject') {
        const url = `${HTTP.$archyServerUrl}system/systems/export`
        this.$downloadFilePost(
          url,
          this.idArr
        )
      } else if (command === 'udpManage') {
        this.udpDialogVisible = true
      }
    },
    closeSetUp () {
      this.udpDialogVisible = false
    },
    searchSystemList () {
      this.currentPage = 1
      this.getSystemsList()
    },
    getSystemsList () {
      let obj = {
        categoryId: this.currentCategory.id,
        name: this.keyword,
        businessDepartment: this.businessDepartment,
        itDepartment: this.itDepartment,
        createStartDate: this.timeDateArr ? this.timeDateArr[0] : null,
        createEndDate: this.timeDateArr ? this.timeDateArr[1] : null
      }

      this.$http.post(`${HTTP.$archyServerUrl}system/systems?pageSize=${this.pageSize}&currentPage=${this.currentPage}`, obj)
        .then(res => {
          this.tableData = res.data.content
          if (this.$route.query?.name) {
            let obj = this.tableData.find(item => String(item.id) === this.$route.query.id)
            console.log(obj)
            obj && this.$emit('openViewDetail', 'view', obj)
            this.keyword = ''
          }
          this.total = res.data.totalElements
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    resetting () {
      this.keyword = ''
      this.clearFilter()
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.currentPage = 1
      this.getSystemsList()
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this.getSystemsList()
    },
    handleCheck (data) {
      this.$emit('openViewDetail', 'view', data.data)
    },
    handleEdit (data) {
      this.$emit('openDetail', 'edit', data.data)
    },
    handleDelete (row) {
      this.$DatablauCofirm(`确定删除对象 ${row.data.name} ？`)
        .then(res => {
          this.$http.delete(`${HTTP.$archyServerUrl}system/system/${row.data.id}`)
            .then(res => {
              this.$blauShowSuccess('删除成功')
              this.getSystemsList()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
    },
    handleAdd () {
      this.$emit('openDetail', 'add')
    }
  },
  watch: {
    currentCategory: {
      handler (val) {
        if (val) {
          this.clearFilter()
        }
      },
      deep: true,
      immediate: true
    }
  }
}
</script>

  <style lang="scss" scoped>
  @mixin absPos() {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }

  .list-content {
    @include absPos();
    //border: 1px solid red;
    overflow: hidden;

    .top-detail {
      height: 70px;
      background: #F6F8FF;
      padding: 0 20px;
      position: relative;
      .bg {
        position: absolute;
        top: 11px;
        right: 0;
      }
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
        }

        .info-container {
          display: inline-block;
          //border: 1px solid red;
          color: #555;
          width: 80%;

          .title {
            font-size: 16px;
            padding-bottom: 5px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .define-text {
            line-height: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
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
  </style>
