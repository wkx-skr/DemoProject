<template>
    <div class="database-cont">
        <datablau-filter-row>
            <div class="row-inner" style="min-width: 700px">
                <datablau-input
                    clearable
                    v-model="keyword"
                    style="width: 240px; display: inline-block"
                    :iconfont-state="true"
                    placeholder="输入关键字"
                ></datablau-input>
            </div>
            <div class="right-top" style="right: 30px">
                <datablau-button
                type="important"
                @click="addDataBase"
                >
                新建
                </datablau-button>
            </div>
        </datablau-filter-row>
        <datablau-form-submit style="margin-top: 44px">
            <datablau-table
                ref="dsTable"
                :data="dataBaseList"
                :key="dsDataKey"
                height="100%"
                @selection-change="handleSelectionChange"
                @sort-change="handleSortChange"
                :data-selectable="option.selectable"
                :auto-hide-selection="option.autoHideSelectable"
                :show-column-selection="option.showColumnSelection"
                :column-selection="option.columnSelection"
                :border="option.columnResizable"
            >
                <el-table-column
                label="名称"
                min-width="150"
                show-overflow-tooltip
                align="left"
                sortable="custom"
                >
                    <template slot-scope="scope">
                        <datablau-button type="text" @click.stop="goToMeta(scope.row)" :disabled="scope.row.notLoaded === true || scope.row.notLoaded === undefined">
                            {{ scope.row.sourceName }}
                        </datablau-button>
                    </template>
                </el-table-column>
                <el-table-column
                label="类型"
                min-width="120"
                show-overflow-tooltip
                >
                <template slot-scope="scope">
                    <database-type
                    :key="scope.row.type"
                    :value="scope.row.type"
                    :size="24"
                    ></database-type>
                </template>
                </el-table-column>
                <el-table-column
                min-width="150"
                label="所属系统"
                show-overflow-tooltip
                sortable="custom"
                >
                <template slot-scope="scope">
                  {{$modelCategoriesMap[scope.row.categoryId]}}
                </template>
              </el-table-column>
                <el-table-column
                prop="owner"
                label="创建人"
                min-width="80"
                show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                prop="createTime"
                label="创建时间"
                min-width="130"
                :formatter="$timeFormatter"
                show-overflow-tooltip
                sortable="custom"
                ></el-table-column>
                <el-table-column
                label="操作"
                width="180"
                header-align="center"
                align="center"
                fixed="right"
                >
                <template slot-scope="scope">
                  <datablau-tooltip
                    content="编辑"
                    placement="bottom"
                    effect="dark"
                  >
                    <datablau-button
                          type="icon"
                          class="btn-in-table-info"
                          @click="handleEdit(scope.$index, scope.row)"
                      >
                          <i class="iconfont icon-bianji"></i>
                      </datablau-button>
                  </datablau-tooltip>
                  <datablau-tooltip
                    content="删除"
                    placement="bottom"
                    effect="dark"
                  >
                    <datablau-button
                        type="icon"
                        class="btn-in-table-info"
                        @click="handleDelete(scope.$index,scope.row)"
                    >
                        <i class="iconfont icon-delete"></i>
                    </datablau-button>
                  </datablau-tooltip>
                  <!-- <datablau-tooltip
                    :content="'更新任务'"
                    placement="bottom"
                    effect="dark"
                  >
                    <datablau-button
                      v-if="jobStatus[scope.row.modelId]"
                      type="icon"
                        style="
                          overflow: hidden;
                          white-space: nowrap;
                          text-overflow: ellipsis;
                          display: inline-block;
                          vertical-align: middle;
                          overflow: hidden;
                        "
                      >
                        <i
                          style="top: 2px; padding: 0; font-size: 16px"
                          class="el-icon-refresh-right animation"
                        ></i>
                      </datablau-button>
                      <datablau-button
                          type="icon"
                          class="btn-in-table-info"
                          @click="runJob(scope.row)"
                      >
                          <i class="iconfont icon-tancha"></i>
                      </datablau-button>
                  </datablau-tooltip> -->
                  <datablau-tooltip
                    content="绑定"
                    placement="bottom"
                    effect="dark"
                  >
                    <datablau-button
                    v-show="seniorBind"
                        type="icon"
                        class="btn-in-table-info"
                        @click="getDsList(scope.row)"
                    >
                        <i class="iconfont icon-binding"></i>
                    </datablau-button>
                  </datablau-tooltip>
                  <datablau-tooltip
                    content="Bottom center"
                    placement="bottom"
                    effect="dark"
                  ></datablau-tooltip>

                </template>
                </el-table-column>
            </datablau-table>
            <template slot="buttons">
                <!-- <div class="left-button" v-show="mutipleLength">
                    <span class="check-info"></span>
                    <span class="footer-row-info">
                        当前选中“{{mutipleLength}}条”信息，是否
                    </span>
                    <datablau-button
                    type="danger"
                    size="small"
                    class="el-icon-delete"
                    @click="deleteRow"
                    >
                    {{ $t('common.button.delete') }}
                    </datablau-button>
                </div> -->
                <datablau-pagination
                    style="float: right; margin-right: 20px"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page.sync="currentPage"
                    :page-sizes="[20, 50, 100]"
                    :page-size="pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total"
                ></datablau-pagination>
                </template>
        </datablau-form-submit>
        <div v-if="type === 'add' || type === 'edit'" style="position: absolute;top: 0;bottom: 0;left: 0;right: 0;background: #fff;">
          <datablau-breadcrumb
            :node-data="nodeData"
            @back="backClick"
            :couldClick="false"
            style=" position: absolute;top: 0;
            left: 20px;
            right: 20px;
            z-index: 99;"
          ></datablau-breadcrumb>
          <addDataBase @closeDetail="closeDetail" v-if="type === 'add'" @setJobStatus="setJobStatus" @enableJob="enableJob"></addDataBase>
          <addDataBase @closeDetail="closeDetail" v-if="type === 'edit'" :edit="true" :editDetail="editDetail" @setJobStatus="setJobStatus" @enableJob="enableJob"></addDataBase>
        </div>
        <datablau-dialog
          :visible.sync="bindingDsVisible"
          title="绑定映射关系"
          size="m"
          append-to-body
        >
          <div class="content">
            <datablau-form
              :model="request"
              ref="form"
              size="small"
              label-width="75px"
            >
              <el-form-item label="ds数据源" prop="dsDsId">
                <datablau-select
                  v-model="request.dsDsId"
                  style="width: 100%"
                  clearable
                  placeholder="请选择ds数据源"
                  @change="requestDsChange()"
                >
                  <el-option
                    v-for="key in dsSelectList"
                    :key="key.id"
                    :label="key.name"
                    :value="key.id + '/' + key.name"
                  ></el-option>
                </datablau-select>
              </el-form-item>
              <el-form-item label="环境" prop="user">
                <datablau-input
                  style="width: 100%"
                  placeholder="请输入环境名称"
                  v-model="request.env"
                ></datablau-input>
              </el-form-item>
            </datablau-form>
          </div>
          <span slot="footer">
            <datablau-button type="primary" :disabled="request.dsDsId===''||request.env===''" @click="bindingSave">
              保存
            </datablau-button>
          </span>
        </datablau-dialog>
    </div>
  </template>

<script>
import HTTP from '@/resource/http.js'
import databaseType from '@/components/common/DatabaseType.vue'
import addDataBase from './addDataBase.vue'
// import iframeContainer from '@/components/common/iframeContainer/iframeContainer.vue'

export default {
  components: {
    databaseType,
    addDataBase
    // iframeContainer

  },
  beforeCreate () {
  },
  mounted () {
    this.getDataSource()
    this.$bus.$on('iframe-dialog-visible-change', show => {
      this.showDialogMask = show
    })
    $(document).on('keydown', this.advancedSetting)
  },
  beforeDestroy () {
    clearInterval(this.jobLogFresh.interval1)
    $(document).off('keydown')
  },
  data () {
    return {
      keyword: '',
      dataBaseList: undefined,
      option: {
        selectable: false,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true
      },
      currentPage: 1,
      pageSize: 20,
      total: 0,
      allData: [],
      keywordFilterProps: ['sourceName', 'type', 'categoryName'],
      sortData: {
        prop: '',
        order: 'ascending'
      },
      dsDataKey: 0,
      mutipleLength: 0,
      selection: [],
      type: '',
      editDetail: null,
      showDialogMask: false,
      dataCatalogDdmOpen: false,
      nodeData: [
        {
          name: '数据源',
          couldClick: false
        }
      ],
      runningState: false,
      jobStatus: {},
      jobLog: [],
      jobLogFresh: {},
      seniorBind: false,
      dsSelectList: [],
      request: {
        dsDsId: '',
        env: ''
      },
      bindingDsVisible: false,
      valueOfrules: {}

    }
  },
  methods: {
    bindingSave () {
      console.log(this.request, '999')
      let params = {
        damDsId: this.request.damDsId.split('/')[0],
        damDsName: this.request.damDsId.split('/')[1],
        dsDsId: this.request.dsDsId.split('/')[0],
        dsDsName: this.request.dsDsId.split('/')[1],
        type: this.request.type,
        env: this.request.env
      }
      this.$http
        .post(`${HTTP.$dddServerUrl}datasource/bind`, params)
        .then(res => {
          this.$datablauMessage.success('映射成功')
          this.bindingDsVisible = false
          this.request = {}
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDsList (row) {
      console.log(row, 'row')
      this.request = {
        damDsId: row.id + '/' + row.sourceName,
        damDsName: row.sourceName,
        type: row.type,
        dsDsId: '',
        env: 'dev'
      }
      this.$http
        .post(`${this.$dddUrl}/service/workflow/datasource/${row.type}`)
        .then(res => {
          this.bindingDsVisible = true
          this.dsSelectList = res.data
          this.$http
            .get(`${this.$dddUrl}/datasource/getMapping/${row.id}`)
            .then(res => {
              if (res.data.dsDsId) {
                this.$set(this.request, 'dsDsId', res.data.dsDsId + '/' + res.data.dsDsName)
              }
            })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    requestDsChange () {
      let lineObj = this.dsSelectList.filter(
        item => item.id.toString() === this.request.dsDsId.split('/')[0]
      )
      this.request.dsDsId = lineObj[0].id + '/' + lineObj[0].name
    },
    advancedSetting (e) {
      if (e.keyCode === 77 && e.ctrlKey) {
        this.seniorBind = true
      }
    },
    runJob (row) {
      this.$router.push(`/main/databaseManagement/jobManagement?dataSourceId=${row.modelId}&jobType=1&update=true`)
      // this.$set(this.jobStatus, row.modelId, true)

      // this.$http
      //   .get(`${HTTP.$damServerUrl}datablau_jobs/resources/${row.modelId}/types/1/detail?types=MetadataSyncJobDescriptor`)
      //   .then(res => {
      //     const self = this
      //     let jobId = res.data[0].jobId
      //     this.enableJob(jobId, row)
      //   })
      //   .catch(e => {
      //     this.$showFailure(e)
      //   })
    },
    setJobStatus (modelId) {
      console.log(modelId, 'modelId')
      this.$set(this.jobStatus, modelId, true)
    },
    enableJob (obj) {
      console.log(obj, 'obj')
      let objJob = JSON.parse(obj)
      this.$http
        .put(
          `${HTTP.$damServerUrl}` +
            'datablau_jobs/' +
            objJob.jobId + '/enable'
        )
        .then(res => {
          const self = this
          const run = () => {
            this.$http
              .put(
                `${HTTP.$damServerUrl}` +
              'datablau_jobs/' +
              objJob.jobId +
              '/run'
              )
              .then(res => {
                if (this.jobStatus[objJob.damDatasourceId] === true) {
                  this.jobLogFresh[objJob.damDatasourceId] = null
                  this.jobLogFresh[objJob.damDatasourceId] = setInterval(() => {
                    self.loadCurrentJob(objJob.jobId, objJob.damDatasourceId)
                  }, 3000)
                } else {
                  clearInterval(this.jobLogFresh[objJob.damDatasourceId])
                }
              })
              .catch(e => {
                this.jobStatus[objJob.damDatasourceId] = false
                clearInterval(this.jobLogFresh[objJob.damDatasourceId])
                this.$showFailure(e)
              })
          }
          const check = () => {
            this.$http
              .post(
                `${HTTP.$damServerUrl}` +
              `datablau_jobs/canExecuteToday?jobId=${objJob.jobId}`
              )
              .then(res => {
                const canExecute = !!res.data
                if (canExecute) {
                  run()
                } else {
                  this.$confirm(
                    '当前操作不在系统时间模版允许范围内执行，是否继续执行？'
                  )
                    .then(() => {
                      run()
                    })
                    .catch(() => {})
                }
              })
              .catch(e => {
                run()
                this.$showFailure(e)
              })
          }
          check()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    loadCurrentJob (jobId, modelId) {
      if (!jobId) return
      const self = this
      self.jobLog = []
      self.$http
        .get(`${HTTP.$damServerUrl}` + 'datablau_jobs/' + jobId)
        .then(res => {
          this.$bus.$emit('getInfication')
          if (res.data.length !== 0) {
            const data = res.data
            self.jobLog.push(data)
          }
          if (
            self.jobLog.length > 0 &&
            self.jobLog[0].status !== 'FINISHED' &&
            self.jobLog[0].status !== 'STOPPED' &&
            self.jobLog[0].status !== 'FAILED' &&
            self.jobLog[0].status !== 'SKIPPED' &&
            self.jobLog[0].status !== 'NOT_RUN'
          ) {
            this.$set(this.jobStatus, modelId, true)
          } else {
            this.$set(this.jobStatus, modelId, false)
            clearInterval(this.jobLogFresh[modelId])
            this.getDataSource()
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    handleDelete (index, row) {
      this.$DatablauCofirm(`确定要删除该条数据库吗？`).then(() => {
        this.$http
          .delete(`${HTTP.$dddServerUrl}dataSourceSync/${row.id}?env=test`)
          .then(res => {
            if (res.data.status === 200) {
              // this.allData.forEach((element, ind) => {
              //   if (element.modelId === row.modelId) {
              //     this.allData.splice(ind, 1)
              //     this.changeDSDisplay({
              //       keyword: this.keyword,
              //       currentPage: this.currentPage,
              //       pageSize: this.pageSize,
              //       sortData: this.sortData
              //     })
              //   }
              // })
              this.$message.success('删除成功')
              this.getDataSource()
              // this.total = this.allData.length
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
        .catch(() => {})
    },
    backClick () {
      this.closeDetail()
    },
    typeList () {
      this.type = ''
    },
    handleEdit (index, row) {
      this.editDetail = row
      this.type = 'edit'
      this.nodeData = [
        {
          name: '数据源',
          couldClick: false
        },
        {
          name: row.sourceName,
          couldClick: false
        }
      ]
    },
    closeDetail () {
      this.type = ''
      this.getDataSource()
      this.$router.push({
        path: '/main/databaseManagement'
      })
    },
    addDataBase () {
      this.type = 'add'
      this.nodeData = [
        {
          name: '数据源',
          couldClick: false
        },
        {
          name: '添加数据源',
          couldClick: false
        }
      ]
    },
    goToMeta (row) {
      // this.$router.push({
      //   path: '/main/meta',
      //   query: {
      //     metaModelId: row.modelId
      //   }
      // })
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      window.open(baseUrl + `main/meta?metaModelId=${row.id}`)
    },
    handleSelectionChange (val) {
      this.selection = val
      this.mutipleLength = val.length
    },
    /** 响应事件 */
    // 分页 设置
    handleSizeChange (size) {
      const obj = {
        keyword: this.keyword,
        currentPage: 1,
        sortData: this.sortData,
        pageSize: size
      }
      this.currentPage = 1
      this.pageSize = size
      this.changeDSDisplay(obj)
    },
    handleCurrentChange (currentPage) {
      const obj = {
        keyword: this.keyword,
        currentPage: currentPage,
        sortData: this.sortData,
        pageSize: this.pageSize
      }
      this.changeDSDisplay(obj)
    },
    handleSortChange (sortData) {
      this.sortData = sortData
      const obj = {
        sortData: {
          prop: sortData.prop,
          order: sortData.order
        },
        keyword: this.keyword,
        currentPage: 1,
        pageSize: this.pageSize
      }
      this.currentPage = 1
      this.changeDSDisplay(obj)
    },
    deleteRow () {
      const self = this
      const deletSucces = () => {
        this.showSuccess(this.$t('meta.dataSource.datasourceRemoveSucceed'))
        this.innerLoadDataSources()
        this.loadingDS = false
      }
      self
        .$DatablauCofirm(
          this.$t('meta.dataSource.delTips'),
          this.$t('common.button.delete'),
          {
            confirmButtonText: this.$t('common.button.ok'),
            cancelButtonText: this.$t('common.button.cancel'),
            type: 'warning'
          }
        )
        .then(() => {
          this.loadingDS = true
          const deletNext = callback => {
            if (this.selection.length > 0) {
              this.delmodel()
              this.selection.shift()
            } else {
              deletSucces()
            }
          }
          deletNext()
        })
        .catch(e => {
          console.log(e)
        })
    },
    changeDSDisplay (para, allData) {
      allData = allData || this.allData
      let arr = []
      if (!para) {
        para = _.clone(this.emptyPara)
        para.pageSize = this.pageSize
        para.keyword = this.keyword
        this.currentPage = para.currentPage
      }
      para.keyword = para.keyword || this.keyword
      const keyword = para.keyword.trim().toLowerCase()
      allData.forEach(item => {
        let bool = false
        this.keywordFilterProps.forEach(prop => {
          if (item[prop] && item[prop].toLowerCase().indexOf(keyword) !== -1) {
            bool = true
          }
        })
        if (bool) {
          arr.push(item)
        }
      })
      this.total = arr.length

      if (para.sortData && para.sortData.prop) {
        const order =
          para.sortData.order !== 'descending' ? 'ascending' : 'descending'
        this.$utils.sort.sortConsiderChineseNumber(
          arr,
          para.sortData.prop,
          order
        )
      }

      const currentPage = para.currentPage || 1 // 任意其它条件改变, currentPage 变为 1
      const pageSize = para.pageSize || this.pageSize
      this.dataBaseList = arr.slice(
        pageSize * (currentPage - 1),
        pageSize * currentPage
      )
    },
    getDataSource () {
      this.$http.post(`${HTTP.$damBase}datasources/findDatasources`, { 'keyword': '' })
        .then(res => {
          if (!res.data || !Array.isArray(res.data)) {
            return
          }
          // this.$utils.sort.sortConsiderChineseNumber(res.data, 'creationTime', 'definition')
          if (this.$route.query.databaseId) {
            res.data.forEach(element => {
              if (element.modelId === Number(this.$route.query.databaseId)) {
                this.handleEdit('', element)
              }
            })
          }
          this.allData = res.data
          this.changeDSDisplay({
            keyword: this.keyword,
            currentPage: this.currentPage,
            pageSize: this.pageSize,
            sortData: this.sortData
          })
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    dialogMaskClick () {
      this.$refs.iframeContainer.dialogMaskClick()
    }
  },
  watch: {
    keyword (newVal) {
      const obj = {
        keyword: newVal,
        currentPage: 1,
        sortData: this.sortData,
        pageSize: this.pageSize
      }
      this.currentPage = 1
      this.changeDSDisplay(obj)
    }
  }
}
</script>
<style lang="scss" scoped>
.database-cont{
    position: absolute;
    top: 10px;
    left: 0px;
    right: 0px;
    bottom: 0;
    .right-top{
        right: 30px;
        position: absolute;
        top: 0;
    }
    .left-button {
        position: absolute;
        top: 50%;
        left: 20px;
        -webkit-transform: translateY(-50%);
        transform: translateY(-50%);
    .check-info {
        display: inline-block;
        width: 14px;
        height: 14px;
        margin-right: -13px;
        vertical-align: middle;
        background: #409eff;;
    }
    .footer-row-info {
        height: 50px;
        margin-right: 10px;
        &::before {
            margin-right: 5px;
            font-family: 'element-icons';
            font-size: 12px;
            font-weight: 200;
            line-height: 13px;
            color: white;
            vertical-align: middle;
            content: '\e6da';
        }
    }
    }
    .el-icon-refresh-right.animation {
      animation: rotating 2s linear infinite;
    }
}
</style>
<style lang="scss">
</style>
