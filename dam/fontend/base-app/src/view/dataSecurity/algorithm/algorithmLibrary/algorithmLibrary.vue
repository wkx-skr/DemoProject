<template>
  <div class="algorithm-library-page">
    <!-- 删除结果提示 -->
    <datablau-dialog
      title="提示"
      size="s"
      :visible.sync="showTip"
      v-if="showTip"
    >
      <div class="tip-content">
        <div class="item" v-for="(item, index) in showMap.mapList" :key="index">
          <template>
            <div class="title" v-if="item.type === 'number'">
              <i class="el-icon-success success-icon"></i>
              {{ item.name }}：{{ item.num }}条
            </div>
            <template v-if="item.type === 'array' && item.list.length > 0">
              <div class="title">
                <i class="el-icon-error fail-icon"></i>
                {{ item.name }}：{{ item.list.length }}条
                <span class="span-error-tip">（{{ item.tip }}）</span>
                <div class="copy" v-copy="item.list.join('；')">复制</div>
              </div>
              <div class="list">
                {{ item.list.join(',') }}
              </div>
            </template>
          </template>
        </div>
      </div>
      <span slot="footer">
        <datablau-button type="secondary" @click="showTip = false">
          关闭
        </datablau-button>
      </span>
    </datablau-dialog>
    <!-- 导入算法 -->
    <datablau-dialog
      :size="'m'"
      append-to-body
      :title="`导入算法`"
      :close-on-click-modal="false"
      :visible.sync="uploadShow"
      v-if="uploadShow"
    >
      <div class="uploadContent">
        <p class="uploadtip">仅支持上传单个文件，支持上传文件格式为：xlsx</p>
        <datablau-button
          style="float: right; margin-right: -25px; line-height: 32px"
          type="text"
          @click="modelDownload"
        >
          下载模板
        </datablau-button>
        <datablau-upload
          :action="$url + '/service/datasecurity/algorithm/import'"
          :before-upload="beforeUpload"
          :on-error="handleUploadError"
          :on-change="handleChange"
          :before-remove="handleRemove"
          :show-file-list="true"
          accept=".xlsx"
          :headers="$headers"
          ref="algorithmUpload"
          :isEdit="true"
          :auto-upload="false"
          class="standardImport-upload"
          :name="'file'"
        >
          <slot>
            <datablau-button type="secondary">
              <i class="iconfont icon-upload" style="margin-right: 6px"></i>
              <span>上传文件</span>
            </datablau-button>
          </slot>
          <div slot="tip" class="el-upload__tip"></div>
        </datablau-upload>
      </div>
      <div slot="footer">
        <datablau-button type="secondary" @click="uploadShow = false">
          取消
        </datablau-button>
        <datablau-button
          :disabled="fileList.length === 0"
          type="primary"
          @click="uploadSure"
        >
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
    <div class="breadcrumb-box" v-if="newShow">
      <div class="datablau-breadcrumb-header" style="padding: 8px 20px 0">
        <div>
          <datablau-breadcrumb
            :nodeData="breadcrumbNodes"
            :couldClick="false"
            @back="goBack"
          ></datablau-breadcrumb>
        </div>
      </div>
    </div>
    <template v-if="newShow">
      <detail v-if="isView" :id="algorithmId"></detail>
      <new-algorithm
        v-else
        :isEdit="isEdit"
        :id="algorithmId"
        :algorithmClick="algorithmClick"
      ></new-algorithm>
    </template>
    <template v-else>
      <datablau-list-search style="padding: 10px 20px 0">
        <datablau-input
          :iconfont-state="true"
          clearable
          v-model="keyword"
          @keyup.native.enter="search"
          :placeholder="'搜索算法名称、描述'"
        ></datablau-input>
        <template
          slot="buttons"
          v-if="$auth.DATA_SECURITY_DISCERN_ALGORITHM_MANAGE"
        >
          <datablau-button
            type="important"
            @click="addAlgorithm"
            class="iconfont icon-tianjia"
          >
            新建算法
          </datablau-button>
          <el-dropdown
            trigger="click"
            @command="moreHandle"
            class="more-fun-btn"
            style="margin-left: 10px"
          >
            <datablau-button type="secondary" icon="el-icon-plus">
              更多操作
              <i class="el-icon-arrow-down el-icon--right"></i>
            </datablau-button>
            <el-dropdown-menu class="more-drop-box" slot="dropdown">
              <el-dropdown-item icon="iconfont icon-import" command="import">
                导入算法
              </el-dropdown-item>
              <el-dropdown-item icon="iconfont icon-export" command="export">
                导出全部
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </datablau-list-search>
      <div class="table-box">
        <datablau-form-submit>
          <datablau-table
            v-loading="tableLoading"
            :data-selectable="$auth.DATA_SECURITY_DISCERN_ALGORITHM_MANAGE"
            :show-column-selection="false"
            height="100%"
            ref="table"
            @selection-change="handleTableChange"
            :data="tableData"
            :default-sort="{ prop: orderBy, order: sort }"
            @sort-change="sortChange"
          >
            <el-table-column
              :label="'算法名称'"
              prop="algorithmName"
              :min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="'识别算法类型'"
              prop="type"
              :min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="'算法库类型'"
              prop="algorithmLibType"
              :min-width="100"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span>{{ getType(scope.row.algorithmLibType) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              :label="'父级算法名称'"
              prop="parentName"
              :min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="'描述'"
              prop="algorithmDescription"
              :min-width="250"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="'创建时间'"
              sortable="custom"
              prop="createTime"
              :min-width="120"
              :formatter="$timeFormatter"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              v-if="$auth.DATA_SECURITY_DISCERN_ALGORITHM_MANAGE"
              :label="'操作'"
              :width="120"
              align="center"
              fixed="right"
              prop="operation"
            >
              <template slot-scope="scope">
                <datablau-button
                  :tooltip-content="'查看'"
                  type="icon"
                  class="iconfont icon-see"
                  @click="handleView(scope.row)"
                ></datablau-button>
                <datablau-button
                  :tooltip-content="'编辑'"
                  type="icon"
                  class="iconfont icon-bianji"
                  @click="handleEdit(scope.row)"
                ></datablau-button>
                <datablau-button
                  :tooltip-content="'删除'"
                  type="icon"
                  class="iconfont icon-delete"
                  @click="handleDel(scope.row)"
                ></datablau-button>
              </template>
            </el-table-column>
          </datablau-table>
          <template slot="buttons">
            <div class="bottom">
              <template v-if="selections.length > 0">
                <span class="check-info"></span>
                <span class="footer-row-info">
                  当前选中“{{ selections.length }}条”信息，是否
                </span>
                <datablau-button
                  type="danger"
                  class="el-icon-delete"
                  @click="handleDelete"
                >
                  删除
                </datablau-button>
                <datablau-button @click="exportAlgorithm(false)">
                  导出
                </datablau-button>
              </template>
              <datablau-pagination
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
                :current-page.sync="page"
                :page-sizes="[20, 50, 100, 200]"
                :page-size="size"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                class="page"
              ></datablau-pagination>
            </div>
          </template>
        </datablau-form-submit>
      </div>
    </template>
  </div>
</template>

<script>
import newAlgorithm from './components/newAlgorithm.vue'
import detail from './components/detail.vue'
import API from '@/view/dataSecurity/util/api'
export default {
  components: {
    newAlgorithm,
    detail,
  },
  data() {
    return {
      showMap: {},
      showTip: false,
      uploadShow: false,
      ruleTipList: [],
      fileList: [],
      tableLoading: false,
      keyword: '',
      tableData: null,
      selections: [],
      page: 1,
      size: 20,
      total: 0,
      sort: '',
      orderBy: 'createTime',
      newShow: false,
      isView: false,
      breadcrumbNodes: [],
      algorithmId: '',
      isEdit: false,
      typeList: [
        {
          type: 'USER_DEFINED',
          value: '自定义',
        },
        {
          type: 'BUILT_IN',
          value: '内置',
        },
      ], // 算法库类型
    }
  },
  watch: {
    keyword(val) {
      if (!val) {
        this.page = 1
        this.getList()
      }
    },
  },
  mounted() {
    this.breadcrumbNodes = [
      {
        level: 1,
        name: '智能分类分级-算法库',
      },
      {
        level: 2,
        name: '新建算法',
      },
    ]
    this.getList()
  },
  methods: {
    moreHandle(command) {
      switch (command) {
        case 'import':
          this.uploadShow = true
          break
        case 'export':
          this.exportAlgorithm(true)
          break
        default:
          break
      }
    },
    exportAlgorithm(isAll = false) {
      if (this.tableData.length > 0) {
        let params
        if (isAll) {
          params = {}
          API.exportAllAlgorithm(params).then(res => {
            this.$bus.$emit('getTaskJobResult', res.data, 'export')
          })
        } else {
          params = this.selections.map(item => item.algorithmId)
          API.exportSelectedAlgorithm(params).then(res => {
            this.$bus.$emit('getTaskJobResult', res.data, 'export')
          })
        }
      } else {
        this.$datablauMessage.warning(`算法为空，不允许导出`)
      }
    },
    uploadSure() {
      this.$refs.algorithmUpload.$refs.upload.submit()
    },
    // 下载算法模板
    modelDownload() {
      const url = this.$url + `/service/datasecurity/algorithm/download`
      this.$downloadFilePost(url, {}, '算法模板')
    },
    checkFileValidation(file, supported) {
      const fileName = file.name
      const splitedName = fileName.split('.')
      const puffix = splitedName[splitedName.length - 1]
      return supported.indexOf(puffix) !== -1
    },
    beforeUpload(file) {
      if (!this.checkFileValidation(file, ['xlsx'])) {
        this.$blauShowFailure('请选择xlsx或csv格式文件')
        return false
      }
    },
    // 导入文件上传失败
    handleUploadError(e) {
      this.uploadShow = false
      this.$showUploadFailure(e)
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    // 上传时，文件变化的回调
    handleChange(file, fileList) {
      for (let i = 0; i < fileList.length; i++) {
        if (!this.checkFileValidation(fileList[i], ['xlsx'])) {
          this.$blauShowFailure('请选择xlsx格式文件')
          this.fileList = []
          this.$refs.algorithmUpload.showList = []
          this.$refs.algorithmUpload.$refs.upload.uploadFiles = []
          return false
        }
      }
      this.fileList = fileList
      if (fileList && fileList.length >= 2) {
        this.$DatablauCofirm('仅支持上传一个文件，是否覆盖？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(() => {
            fileList.shift()
            this.fileList = fileList
          })
          .catch(e => {
            fileList.pop()
            this.fileList = fileList
          })
      }
      if (file.status === 'success') {
        this.uploadShow = false
        this.$bus.$emit('getTaskJobResult', file.response, 'import')
      }
    },
    sortChange(data) {
      this.orderBy = data.prop
      this.sort = data.order
      this.page = 1
      this.getList()
    },
    getType(type) {
      if (type) {
        const resuleList = this.typeList.filter(item => item.type === type)
        const result = resuleList[0].value
        return result
      } else {
        return ''
      }
    },
    search() {
      this.page = 1
      this.getList()
    },
    goBack() {
      this.newShow = false
    },
    getList() {
      this.tableLoading = true
      const params = {
        pageNum: this.page,
        pageSize: this.size,
        searchStr: this.keyword,
        sort: this.sort === 'ascending' ? 'ASC' : 'DESC', // ASC/DESC
        orderBy: this.orderBy,
      }
      API.getAlgorithmList(params)
        .then(res => {
          this.tableLoading = false
          this.total = res.data.data.total
          this.tableData = res.data.data.algorithms || []
        })
        .catch(e => {
          this.tableLoading = false
          this.$showFailure(e)
        })
    },
    addAlgorithm() {
      this.selections = []
      this.breadcrumbNodes = [
        {
          level: 1,
          name: '智能分类分级-算法库',
        },
        {
          level: 2,
          name: '新建算法',
        },
      ]
      this.isEdit = false
      this.isView = false
      this.newShow = true
    },
    handleTableChange(data) {
      this.selections = data
    },
    editAlgorithm(row) {
      this.selections = []
      this.breadcrumbNodes = [
        {
          level: 1,
          name: '智能分类分级-算法库',
        },
        {
          level: 2,
          name: '编辑算法',
        },
      ]
      this.isEdit = true
      this.algorithmId = row.algorithmId
      this.isView = false
      this.newShow = true
    },
    handleEdit(row) {
      const params = {
        type: 'algorithmId',
        id: row.algorithmId,
      }
      API.judgeTaskRun(params)
        .then(res => {
          API.judgeAlgorithm(row.algorithmId)
            .then(res => {
              if (res.data.data) {
                this.editAlgorithm(row)
              } else {
                this.$DatablauCofirm(
                  '当前算法被规则所引用，确认是否修改？',
                  '提示',
                  {
                    type: 'warning',
                    cancelButtonText: '取消',
                    confirmButtonText: '确定',
                  }
                )
                  .then(() => {
                    this.editAlgorithm(row)
                  })
                  .catch(() => {})
              }
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleView(row) {
      this.selections = []
      this.breadcrumbNodes = [
        {
          level: 1,
          name: '智能分类分级-算法库',
        },
        {
          level: 2,
          name: row.algorithmName + '的详情',
        },
      ]
      this.algorithmId = row.algorithmId
      this.isView = true
      this.newShow = true
    },
    handleDel(row) {
      this.$DatablauCofirm(`确认要删除吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        const idList = [row.algorithmId]
        this.delAlgorithm(idList)
      })
    },
    handleDelete() {
      this.$DatablauCofirm(
        `已选择“${this.selections.length}条”数据，确认要删除吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        let idList = []
        this.selections.map(item => {
          idList.push(item.algorithmId)
        })
        this.delAlgorithm(idList)
      })
    },
    handleData(data) {
      const tipMap = data.tipMap
      data.mapList.map(item => {
        if (item.type === 'array') {
          let list = []
          Object.keys(tipMap[item.prop]).map(m => {
            list.push(tipMap[item.prop][m])
          })
          item.list = list
        }
        if (item.type === 'number') {
          if (tipMap[item.prop]) {
            item.num = tipMap[item.prop]
          } else {
            item.num = 0
          }
        }
      })
      const flag = data.mapList.some(
        item => item.type === 'array' && item.list.length > 0
      )
      this.showMap = data
      if (flag) {
        this.showTip = true
      }
    },
    delAlgorithm(ids) {
      API.delAlgorithm(ids)
        .then(async res => {
          this.showMap = {}
          let mapList = [
            {
              tip: '',
              name: '成功删除',
              icon: 'error',
              type: 'number',
              prop: 'sucNums',
            },
            {
              tip: '父算法下有子算法，不允许删除父算法',
              type: 'array',
              name: '失败删除',
              icon: 'error',
              prop: 'hasChildren',
            },
            {
              tip: '算法已被识别规则引用，不允许被删除',
              type: 'array',
              icon: 'error',
              name: '失败删除',
              prop: 'ref',
            },
          ]
          this.showMap.mapList = mapList
          this.showMap.tipMap = res.data.data
          await this.handleData(this.showMap)
          // this.$blauShowSuccess('删除成功')
          this.getList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handlePageChange(val) {
      this.page = val
      this.getList()
    },
    handleSizeChange(val) {
      this.size = val
      this.page = 1
      this.getList()
    },
    algorithmClick(name, params) {
      this.getList()
      switch (name) {
        case 'new':
          if (params.type === 'cancel') {
            this.newShow = false
          }
          break
        default:
          break
      }
    },
  },
}
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.tip-content {
  .title {
    line-height: 30px;
    color: #555555;
    font-weight: 600;
    i {
      font-size: 24px;
      vertical-align: middle;
      margin-right: 6px;
      margin-left: 0;
      &.success-icon {
        color: #66bf16;
      }
      &.same-icon {
        color: #e6ad00;
      }
      &.fail-icon {
        color: #ff4b53;
      }
    }
    .copy {
      float: right;
      padding: 5px 10px;
      color: #409eff;
      cursor: pointer;
      font-weight: normal;
      height: 30px;
      line-height: 30px;
    }
  }
  .list {
    margin-bottom: 6px;
    margin-top: 6px;
    height: 120px;
    padding: 8px 10px;
    box-sizing: border-box;
    background: #f5f5f5;
    color: #555555;
    overflow-y: auto;
    p {
      line-height: 24px;
    }
    span {
      // margin-right: 10px;
    }
  }
}
.uploadContent {
  clear: both;
  border-radius: 4px;
  padding: 16px;
  .uploadtip {
    font-size: 12px;
    color: $text-message;
    padding-bottom: 16px;
    display: inline-block;
  }
  .autoCode {
    padding-top: 16px;
  }
}
.algorithm-library-page {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  .breadcrumb-box {
    position: absolute;
    top: -48px;
    left: 0;
    right: 0;
    height: 40px;
    background: #fff;
    z-index: 9;
  }
  .table-box {
    position: absolute;
    top: 50px;
    left: 0;
    right: 0;
    bottom: 0;

    .bottom {
      box-sizing: border-box;
      padding: 10px 20px 0;
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 50px;

      .check-info {
        width: 14px;
        height: 14px;
        display: inline-block;
        background: $primary-color;
        margin-right: -13px;
        vertical-align: middle;
      }

      .footer-row-info {
        height: 50px;
        margin-right: 10px;
        &:before {
          content: '\e6da';
          font-family: 'element-icons';
          font-size: 12px;
          font-weight: 200;
          margin-right: 5px;
          vertical-align: middle;
          line-height: 13px;
          color: white;
        }
      }
      .page {
        float: right;
      }
    }
  }
}
</style>
