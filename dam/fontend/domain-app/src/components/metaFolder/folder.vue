/ ** 内容：元数据=》元数据=》文件 created by: zxm time: 2022/1/5 **/

<template>
  <div id="meta-folder">
    <datablau-dialog
      :title="$t('meta.DS.udp.udp')"
      :visible.sync="showFileUpd"
      :close-on-click-modal="true"
      append-to-body
      width="720px"
    >
      <share-file-udp @close="closeFileUpd"></share-file-udp>
    </datablau-dialog>
    <!-- 左侧树形结构 -->
    <div class="folder-left-tree">
      <datablau-input
        style="
          width: 260px;
          margin: 10px 10px;
          height: 52px;
          border-radius: 2px;
        "
        :iconfont-state="true"
        v-model="filterText"
        clearable
        :placeholder="$t('meta.file.tree_placeholder')"
      ></datablau-input>
      <div
        :class="{ 'left-two': true, hightShow: treeObj.hightShow }"
        @click="allClick"
      >
        <i class="iconfont icon-allfile"></i>
        <span>{{ treeObj.name }}</span>
      </div>
      <datablau-tree
        :class="{
          'grey-tree': true,
          'tree-content': true,
          noHight: treeObj.hightShow,
        }"
        ref="folderTree"
        :data-supervise="true"
        :data-icon-function="dataIconFunction"
        :data-options-function="dataOptionsFunction"
        @node-click="handleNodeClick"
        node-key="id"
        :props="defaultProps"
        :default-expanded-keys="expandedKeys"
        auto-expand-parent
        :data="treeData"
        :expand-on-click-node="false"
        :filter-node-method="filterNode"
        :allow-drag="allowDrag"
        draggable
      ></datablau-tree>
    </div>
    <div class="folder-line"></div>
    <!-- 设置右边表格的内容展示 -->
    <div class="folder-right-content">
      <div class="folder-header">
        <datablau-input
          class="folder-content-input"
          :iconfont-state="true"
          v-model="keyword"
          clearable
          @keydown.enter.native="handleCurrentChange(1)"
          :placeholder="$t('meta.file.fileName')"
        ></datablau-input>
        <datablau-button
          type="normal"
          class="iconfont icon-expand"
          @click="showExpProp"
          v-if="$auth['BUSINESS_ATTR']"
        >
          {{ $t('meta.DS.udp.udp') }}
        </datablau-button>
      </div>

      <!-- 表格内容部分 -->
      <div class="folder-table-box">
        <datablau-table
          ref="folderTable"
          class="datablau-table datablau-table-5dot9 content-table"
          :data="tableData"
          show-overflow-tooltip
          height="100%"
          @sort-change="handleSortChange"
          @selection-change="selectChange"
          @select-all="selectAll"
          :data-selectable="true"
        >
          <el-table-column width="30" align="left">
            <template slot-scope="scope">
              <!-- 公用的图标组件 -->
              <!-- :data-type="
                  iconArr.indexOf(scope.row.type) !== -1
                    ? scope.row.type
                    : 'normal'
                " -->
              <datablau-icon
                :data-type="$fileTypeFormatter(scope.row.type)"
                :key="scope.row.id"
                :size="24"
                style="
                  position: absolute;
                  left: 2px;
                  top: 10px;
                  width: 17px;
                  height: 20px;
                "
              ></datablau-icon>
              <i></i>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('meta.file.fileName')"
            prop="fileName"
            sortable="custom"
            align="left"
            min-width="180"
            show-overflow-tooltip
          >
            <!-- <template slot-scope="scope">
                    <span>{{scope.row.fileName + (scope.row.type ? '.' : '') + scope.row.type}}</span>
                </template> -->
          </el-table-column>
          <el-table-column
            min-width="80"
            :label="$t('meta.file.fileType')"
            prop="type"
            class="folder-type"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span
                :class="[
                  'folder-type-cell',
                  scope.row.type
                    ? iconArr.indexOf(scope.row.type) !== -1
                      ? `${scope.row.type}`
                      : 'normal'
                    : '',
                ]"
              >
                {{ scope.row.type }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            min-width="100"
            :label="$t('meta.file.fileSize')"
            prop="size"
            sortable="custom"
            align="left"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>{{ $fileSizeFormatter(scope.row.size) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('meta.file.filePath')"
            prop="filePath"
            align="left"
            :min-width="250"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <!-- <span>{{ getFileFullPath(scope.row) }}</span> -->
              <span>{{ scope.row.filePath }}</span>
            </template>
          </el-table-column>
          <el-table-column
            min-width="140"
            :label="$t('meta.file.modifyTime')"
            prop="lastModifyTime"
            align="center"
            sortable="custom"
            :formatter="$timeFormatter"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="$t('meta.file.operation')"
            :width="$i18n.locale === 'zh' ? 50 : 80"
            align="center"
            fixed="right"
          >
            <template slot-scope="scope">
              <datablau-button type="icon" @click="handleCheckItem(scope.row)">
                <i
                  class="iconfont icon-see"
                  :title="$t('common.button.scan')"
                ></i>
              </datablau-button>
            </template>
          </el-table-column>
        </datablau-table>
      </div>
      <!-- 分页部分 -->
      <div class="row-page">
        <div class="row-page-footer" v-show="checkArray.length > 0">
          <!-- <el-checkbox
            v-model="showCheckTable"
            @change="pageCheckChange"
          ></el-checkbox> -->
          <span v-show="showCheckTable" class="check-info"></span>
          <span class="footer-span">
            {{ $t('common.deleteMessage', { selection: checkArray.length }) }}
          </span>
          <datablau-button
            class="footer-button iconfont icon-export"
            type="primary"
            @click="showExportTable"
          >
            {{ $t('common.button.export') }}
          </datablau-button>
        </div>
        <div></div>
        <datablau-pagination
          class="row-pagination"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100, 500]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalItems"
        />
      </div>
    </div>
    <!-- 表格详情页面的内容组件 -->
    <div class="folder-details" v-if="currentObjectType && currentObjectId">
      <table-details
        :key="currentObjectId"
        :objectId="currentObjectId"
        :objectTypeMaybe="currentObjectType"
        :object="currentObject"
        :isFloder="true"
        :expand="true"
        class="details"
        :loadedTagsBefore="loadedTags"
        @close="goBack"
      ></table-details>
    </div>
  </div>
</template>
<script>
import shareFileUdp from '@/view/dataProperty/meta/shareFileUdp.vue'
import tableDetails from '@/view/dataProperty/meta/tableDetails.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import HTTP from '@/http/main.js'
export default {
  components: {
    shareFileUdp,
    tableDetails,
  },
  data() {
    return {
      showFileUpd: false, // 设置展示扩展属性的弹窗
      filterText: '', // 树形结构中input输入框中的输入内容
      expandedKeys: [], // 默认展开节点的key的数组
      defaultProps: {
        children: 'nodes',
        label: 'nodeName',
      },
      treeObj: {
        name: this.$t('meta.file.allFile'),
        id: 'ALL',
        type: 'ALL',
        hightShow: true,
      },
      treeData: [], // 树形结构的数组
      treeLoading: true, // 左侧树形结构的加载
      keyword: '', // 右边表格输入框中的搜索内容
      tableData: null, // 存储表格的数据
      loading: true, // 表格内容的加载
      currentPage: 1,
      pageSize: 20,
      totalItems: 0,
      checkArray: [], // 存储勾选中的数据
      showCheckTable: true,
      fileName: '', // 点击树形结构节点的文件名称
      treeId: '', // 点击树形结构的节点id
      // 排序用到的参数
      sortField: 'lastModifyTime', // 设置表格中传入排序的参数
      sortDesc: false, // 表格内容排序，默认是倒序
      iconArr: ['png', 'pdf', 'PDF'], // 这个设置不在这个范围内，样式就设置为默认的颜色

      // 这个是进入详情页需要的数据
      currentObjectId: null,
      currentObject: null,
      currentObjectType: null,
      currentObjectKey: 0,
      loadedTags: [],
    }
  },
  methods: {
    closeFileUpd() {
      this.showFileUpd = false
    },
    // 设置表格中文件地址的展示内容
    getFileFullPath(data) {
      const path = data.filePath
      let sharePath = data.sharePath || ''
      sharePath = sharePath.split('\\')
      const ip = sharePath[2]
      const result = `//${ip}/${path}`
      return result
    },
    // 控制左右两边的拖拽
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.folder-left-tree'),
          middleDom: $('.folder-line'),
          rightDom: $('.folder-right-content'),
          noCrack: true,
          minWith: { leftMinWidth: 280 },
        })
      }, 1000)
    },
    allowDrag() {
      return true
    },
    // 点击全部文件类资产事件
    allClick() {
      this.treeObj.hightShow = true
      this.totalItems = 0
      this.handleCurrentChange(1)
    },
    dataIconFunction(data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    dataOptionsFunction(data) {
      const options = []
      let label = ''
      if (data.name) {
        label =
          data.name.length < 10 ? data.name : data.name.slice(0, 8) + '...'
      }
      options.push({
        icon: 'iconfont icon-download',
        label: this.$t('meta.file.exportAll'),
        callback: () => {
          this.exportFolder(data)
        },
        args: 'folder',
      })
      return options
    },
    // 导出全部文件资产
    exportFolder(data) {
      const url = this.$url + `/service/filetree/${data.id}/export`
      this.$downloadFilePost(url, this.checkArray, this.$t('meta.file.file'))
    },
    // 节点被点击时的回调
    handleNodeClick(data) {
      this.treeObj.hightShow = false // 设置全部的文件资产类取消高亮效果
      this.fileName = data.nodeName
      this.treeId = data.id
      this.totalItems = 0
      this.handleCurrentChange(1)
    },
    // 对节点进行筛选时执行的
    filterNode(value, data, node) {
      if (!value) return true
      if (data.type === 'ALL') {
        return true
      }
      let current = node
      do {
        if (this.$MatchKeyword(current.data, value, 'nodeName')) {
          return true
        }
        current = current.parent
      } while (current && current.data.nodeName)
      return false
    },
    // 获取到树形结构的数据
    getFolderTree() {
      this.treeLoading = true
      this.treeData = []
      this.$http
        .get(this.$url + '/service/filetree/tree')
        .then(res => {
          // 过滤根目录root
          this.treeData = res.data[0].nodes
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {
          this.treeLoading = false
        })
    },
    // 点击扩展属性按钮
    showExpProp() {
      this.showFileUpd = true
    },
    // 表格中的排序方法
    handleSortChange(sortData) {
      this.sortField = sortData.prop == 'fileName' ? 'name' : sortData.prop
      // true是正序，false是倒叙，默认是倒叙
      this.sortDesc = sortData.order === 'ascending'
      this.getTableData()
    },
    // 表格中的查看按钮
    handleCheckItem(basicInfo, callback) {
      basicInfo = _.cloneDeep(basicInfo)
      basicInfo.fileType = basicInfo.type
      basicInfo.objectId = basicInfo.id
      basicInfo.type = 'FILE'
      let objectId = Number.parseInt(basicInfo.objectId)
      this.currentObjectId = objectId
      const query = this.$route.query
      if (query.blank) {
        this.$router.push({
          query: {
            objectId: objectId,
            type: 'FILE',
            blank: 'true',
            isAssets: this.$route.query.isAssets,
          },
        })
      } else {
        this.$router.push({
          query: {
            objectId: objectId,
            type: 'FILE',
            isAssets: this.$route.query.isAssets,
          },
        })
      }

      if (!callback) {
        // 用户正常点击页面导致的跳转，而非导航导致
        if (this.currentObject) {
          if (
            this.history.length === 0 ||
            this.currentObject.objectId !==
              this.history[this.history.length - 1].objectId
          ) {
            this.history.push(this.currentObject)
          }
        } else {
          const query = this.$route.query
          if (query.type === 'FILE') {
          }
        }
      } else {
        callback(basicInfo)
      }

      // 获取到值，传给组件
      this.currentObject = basicInfo
      this.currentObjectType = basicInfo.type
      this.currentObjectKey++
    },
    // 页面数改变的方法
    handleSizeChange(val) {
      this.pageSize = val
      this.handleCurrentChange(1)
    },
    // 当前页码数改变的方法和输入框中的内容的搜索
    handleCurrentChange(val) {
      this.currentPage = val
      this.getTableData()
    },
    // 下栏中当前选中的值，不可勾选
    pageCheckChange() {
      this.showCheckTable = true
    },
    // 设置导出表格部分的信息的方法
    showExportTable() {
      const param = {
        fileList: this.checkArray,
      }
      const url = this.$url + `/service/filetree/export`
      this.$downloadFilePost(url, this.checkArray, this.$t('meta.file.file'))
    },
    // 勾选选择框时的事件
    selectChange(val) {
      this.showCheckTable = val.length > 0
      this.checkArray = val.map(item => {
        return item.id
      })
    },
    // 表格中的select的全选事件
    selectAll(val) {
      this.checkArray = []
      if (val.length > 0) {
        this.checkArray = val.map(item => {
          return item.id
        })
      }
      // else {
      // this.$refs.folderTable.clearSelection();
      // }
    },
    // 获取到表格数据的接口
    getTableData() {
      this.tableData = null
      this.loading = true
      const requestBody = {
        currentPage: this.currentPage, // 页码数
        pageSize: this.pageSize, // 每页多少条
        fileName: _.trim(this.keyword) ? _.trim(this.keyword) : null, // 输入框中的文件的名称
        treeId: this.treeObj.hightShow ? null : this.treeId, // 节点中的id值
        sortField: this.sortField, // 表格中的排序名称
        desc: this.sortDesc, // 表格中的排序顺序
      }
      this.$http
        .post(this.$url + '/service/shareFile/folder/page', requestBody)
        .then(res => {
          this.tableData = res.data.content
          this.totalItems = res.data.totalItems
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {
          this.loading = false
        })
    },
    // 返回到本页面
    goBack() {
      if (this.$route.query.blank) {
        window.close()
      } else {
        this.currentObject = null
        this.currentObjectId = null
        this.$router.push({}) // 回退到上个页面,使得路径保持一致
      }
    },
    loadTags() {
      var self = this
      self.$http
        .get(self.$url + '/service/tags/')
        .then(res => {
          if (res.data && res.data.length) {
            var map = {}
            res.data.forEach(item => {
              map[item.tagId] = item
            })
            var treeData = []
            res.data.forEach(item => {
              if (item.parentId) {
                var parent = map[item.parentId]
                if (!parent.children) {
                  parent.children = []
                }
                parent.children.push(item)
              } else {
                treeData.push(item)
              }
            })
            self.loadedTags = treeData
            self.tagMap = map
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {})
    },
    // 处理路径含有参数的时候,刷新页面还在当前页
    handleRouteQuery() {
      if (Object.keys(this.$route.query).length > 0) {
        const query = this.$route.query
        let id = query.objectId ? query.objectId : null
        let type = query.type ? query.type : null
        this.handleCheckItem({ type, id })
      }
    },
    // 初始化数据时
    pageInit() {
      this.initResizeHorizontal()
      this.getFolderTree()
      this.getTableData()
      this.handleRouteQuery()
      this.loadTags()
    },
  },
  create() {},
  mounted() {
    const query = this.$route.query
    if (query.blank) {
      $('#main-content').css({
        left: 0,
      })
    }
    this.pageInit()
  },
  watch: {
    filterText(val) {
      this.$refs.folderTree.filter(val)
    },
    keyword() {
      this.currentPage = 1
      this.getTableData()
    },
  },
}
</script>
<style scoped lang="scss">
@import './folder.scss';
</style>
