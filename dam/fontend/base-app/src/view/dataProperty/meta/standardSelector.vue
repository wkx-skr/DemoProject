<template>
  <div>
    <!-- 选择标准弹窗 -->
    <datablau-dialog
      :title="`${$t('common.button.select')}${$t(
        'domain.common.spacing'
      )}${typeFullName}`"
      :visible.sync="visible"
      size="xl"
      :close-on-click-modal="false"
      @close="handleClose"
      append-to-body
      :height="606"
    >
      <div style="height: 450px; overflow: auto">
        <el-form
          class="st-page-form"
          label-position="right"
          label-width="65px"
          ref="searchForm"
          :inline="true"
          :model="searchFormData"
          style="margin-top: 0"
          :class="{ typeIndex: single }"
        >
          <!-- <el-form-item :label="`${typeName}名称`" prop="domainName">
            <datablau-input
              style="width: 135px"
              clearable
              maxlength="100"
              type="text"
              v-model="searchFormData.domainName"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="`${typeName}编码`" prop="domainCode">
            <datablau-input
              style="width: 135px"
              type="text"
              clearable
              maxlength="100"
              v-model="searchFormData.domainCode"
            ></datablau-input>
          </el-form-item> -->
          <!-- <el-form-item label="所有者" prop="department">
            <datablau-input
              style="width: 135px"
              clearable
              type="text"
              maxlength="100"
              @focus="selectSubmitter()"
              v-model="searchFormData.submitter"
            ></datablau-input>
          </el-form-item> -->
          <!-- <el-form-item label="标准类型" prop="endTime" v-show="!hideFilter">
            <datablau-select
              style="width: 135px; display: inline-block"
              v-model="folderValue"
              placeholder="请选择标准类型"
            >
              <el-option
                v-for="item in folderIdArr"
                v-if="!(!isColumn && item.value === '领域')"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </datablau-select>
          </el-form-item> -->
          <!-- <el-form-item label="发布起始时间" prop="startTime">
            <datablau-datePicker
              type="date"
              style="width: 135px"
              value-format="timestamp"
              v-model="searchFormData.startTime"
            ></datablau-datePicker>
          </el-form-item>
          <el-form-item label="发布结束时间" prop="endTime">
            <datablau-datePicker
              type="date"
              style="width: 135px"
              value-format="timestamp"
              v-model="searchFormData.endTime"
            ></datablau-datePicker>
          </el-form-item> -->
          <datablau-tabs
            style="
              padding-bottom: 10px;
              display: inline-block;
              margin-right: 20px;
              width: 240px;
            "
            type="card"
            class="folderCard"
            v-model="folderValue"
            v-show="!hideFilter"
          >
            <el-tab-pane
              style="padding: 0"
              :label="$t('meta.DS.standardDialog.basicDataStandard')"
              name="1"
            ></el-tab-pane>
            <el-tab-pane
              style="padding: 0"
              :label="$t('meta.DS.standardDialog.indexStandard')"
              name="2"
            ></el-tab-pane>
          </datablau-tabs>
          <el-form-item>
            <datablau-input
              :style="`width: ${$i18n.locale === 'en' ? 300 : 275}px`"
              type="text"
              clearable
              maxlength="100"
              :iconfont-state="true"
              :placeholder="keywordPlaceholder"
              v-model="searchFormData.keyword"
            ></datablau-input>
          </el-form-item>
          <el-form-item>
            <datablau-select
              class="selectTree"
              :style="`width: ${$i18n.locale === 'en' ? 250 : 200}px`"
              ref="selectTree"
              :popper-append-to-body="false"
              popper-class="select-tree"
              v-model="searchFormData.descriptionDepartment"
              :placeholder="$t('meta.DS.standardDialog.selBusDefinitionDep')"
              clearable
              :filterable="true"
              :remote="true"
              :remote-method="remoteMethod"
              @focus="loadTreeData"
            >
              <el-option
                :value="searchFormData.bm"
                style="height: auto"
                :label="searchFormData.descriptionDepartment"
              >
                <div class="tree">
                  <datablau-tree
                    :data="descriptionDepartmentTree"
                    node-key="bm"
                    ref="branchTree"
                    class="grey-tree branchTree"
                    :default-expanded-keys="defaultExpandList"
                    :expand-on-click-node="false"
                    :filter-node-method="filterNode2"
                    @node-click="nodeClick"
                    :props="defaultProps2"
                    :data-icon-function="dataIconFunction2"
                    show-overflow-tooltip
                    tooltip-placement="top-start"
                  >
                    <span
                      slot-scope="{ data }"
                      :title="data[defaultProps2.label]"
                      class="ellipsis"
                    >
                      {{ data[defaultProps2.label] }}
                    </span>
                  </datablau-tree>
                </div>
              </el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item>
            <datablau-button type="normal" @click="getSearch()">
              {{ $t('meta.DS.standardDialog.query') }}
            </datablau-button>
            <!-- <datablau-button type="secondary" @click="resetQuery()">
              重置
            </datablau-button> -->
          </el-form-item>
        </el-form>
        <div class="typeTable" :class="{ typeIndexTable: single }">
          <datablau-input
            style="width: 100%; padding: 0 10px; padding-top: 10px"
            :placeholder="$t('meta.DS.standardDialog.directory')"
            v-model="keyword"
            clearable
            :iconfont-state="true"
          ></datablau-input>

          <div
            style="
              position: absolute;
              top: 50px;
              left: 10px;
              right: 10px;
              bottom: 10px;
              overflow: auto;
            "
          >
            <datablau-tree
              ref="mainTree"
              class="grey-tree"
              :data="treeData"
              :props="defaultProps"
              :show-checkbox="false"
              node-key="foldId"
              :key="treeKey"
              :default-expanded-keys="expandedKeys"
              :default-expand-all="defaultExpandAll"
              :expand-on-click-node="false"
              :highlight-current="true"
              auto-expand-parent
              :check-strictly="false"
              :filter-node-method="filterNode"
              :data-icon-function="dataIconFunction"
              :data-supervise="false"
              :current-node-key="defaultCurrentNode"
              @node-click="handleItemClicked"
            ></datablau-tree>
          </div>
        </div>

        <div
          style="
            position: absolute;
            top: 44px;
            bottom: 50px;
            right: 20px;
            left: 280px;
            border-bottom: 1px solid #e6e6e6;
          "
        >
          <div style="height: 100%; width: 100%; overflow: auto">
            <datablau-table
              height="100%"
              ref="selectDomainTable"
              id="selectDomainTable"
              :data="tableData"
              v-loading="tableLoading"
              @selection-change="tableSelectionChanged"
              :data-selectable="true"
            >
              <!-- <el-table-column type="selection" width="50"></el-table-column> -->
              <el-table-column width="20px">
                <template slot-scope="scope">
                  <span style="display: flex; align-items: center">
                    <datablau-icon
                      :key="
                        scope.row.domainId + '-icon-' + scope.row.categoryId
                      "
                      style="margin-right: 5px; flex-shrink: 0"
                      v-if="[2, 5, 6].includes(scope.row.categoryId)"
                      :data-type="'index'"
                      :icon-type="'svg'"
                      :size="16"
                    ></datablau-icon>
                    <datablau-icon
                      :key="
                        scope.row.domainId + '-icon-' + scope.row.categoryId
                      "
                      style="margin-right: 5px; flex-shrink: 0"
                      v-else-if="
                        scope.row.categoryId === 1 || scope.row.categoryId > 3
                      "
                      :data-type="'datastandard'"
                      :icon-type="'svg'"
                      :size="16"
                    ></datablau-icon>
                    <datablau-icon
                      :key="
                        scope.row.domainId + '-icon-' + scope.row.categoryId
                      "
                      style="margin-right: 5px; flex-shrink: 0"
                      v-if="scope.row.categoryId === 3"
                      :data-type="'system'"
                      :icon-type="'png'"
                      :size="16"
                    ></datablau-icon>
                    <!-- <i
                      class="tree-icon"
                      :class="{
                        domain: categoryTypeId === 1,
                        index: categoryTypeId === 2,
                        system: categoryTypeId === 3,
                      }"
                    ></i> -->
                  </span>
                </template>
              </el-table-column>

              <el-table-column
                :width="`${$i18n.locale === 'en' ? 165 : 140}px`"
                :label="
                  $t('meta.DS.standardDialog.name', { typeName: typeName })
                "
                prop="chineseName"
                show-overflow-tooltip
              ></el-table-column>
              <!-- <el-table-column
                :label="$version.tableHeader.enName"
                prop="englishName"
                min-width="120px"
                show-overflow-tooltip
              ></el-table-column> -->
              <el-table-column
                :width="`${$i18n.locale === 'en' ? 165 : 140}px`"
                :label="
                  $t('meta.DS.standardDialog.code', { typeCode: typeName })
                "
                prop="domainCode"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :label="$t('meta.DS.standardDialog.theme')"
                show-overflow-tooltip
                :min-width="`${$i18n.locale === 'en' ? 65 : 80}px`"
              >
                <template slot-scope="scope">
                  {{ scope.row.path[1] }}
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('meta.DS.standardDialog.busDefinitionDep')"
                prop="descriptionDepartmentName"
                show-overflow-tooltip
                :width="`${$i18n.locale === 'en' ? 200 : 150}px`"
              ></el-table-column>
              <!-- <el-table-column
                :label="$version.tableHeader.status"
                prop="state"
                :min-width="80"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ statusFormatter(scope.row.state) }}
                </template>
              </el-table-column>
              <el-table-column
                :label="$version.tableHeader.owner"
                prop="submitter"
                :min-width="80"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :label="$version.tableHeader.publishTime"
                :min-width="140"
                column-key="publish"
                prop="firstPublish"
                :formatter="$timeFormatter"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :label="$version.tableHeader.lastModificationTime"
                :min-width="140"
                column-key="last"
                prop="lastModification"
                :formatter="$timeFormatter"
                show-overflow-tooltip
              ></el-table-column> -->
            </datablau-table>
          </div>
        </div>
      </div>
      <div class="dialog-bottom">
        <div style="position: absolute; left: 20px">
          <datablau-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            :pager-count="5"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></datablau-pagination>
        </div>
        <datablau-button @click="handleClose" type="secondary" style="">
          {{ $t('common.button.close') }}
        </datablau-button>
        <datablau-button
          @click="handleSelect"
          style=""
          :disabled="selection.length < 1"
          type="important"
        >
          {{ $t('common.button.sel') }}
        </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>
<script>
import HTTP from '@/http/main'
export default {
  data() {
    return {
      multiple: false, // 是否可以多选
      visible: false,
      keyword: '',
      tableLoading: false,
      keywordSetTimeout: null,
      treeBox: undefined,
      defaultProps: {
        children: 'nodes',
        label: 'name',
        id: 'id',
      },
      expandedKeys: [],
      state: 'A',
      defaultExpandAll: false,
      enableSelect: false,
      // nowDomain:null,
      searchFormData: {
        // themeCategory: '全部',
        // theme: '',
        stateValue: null,
        // department: '',
        // departmentId: '',
        domainName: '',
        bigVersionId: '',
        startTime: null,
        endTime: null,
        domainCode: '',
        submitter: '',
        keyword: '',
        descriptionDepartment: '',
      },
      currentPage: 1,
      pageSize: 20,
      total: 0,
      /* stateOptions: [
        {
          label: '审核中',
          value: 'C',
        },
        {
          label: '待审核',
          value: 'D',
        },
        {
          label: '已发布',
          value: 'A',
        },
        {
          label: '已废弃',
          value: 'X',
        },
      ], */
      selection: [],
      tableData: [],
      /* folderIdArr: [
        // {
        //   value: 'null',
        //   label: '全部',
        // },
        {
          value: '1',
          label: '基础标准',
        },
        // {
        //   value: '3',
        //   label: '数据字典'
        // },
        {
          value: '2',
          label: '指标标准',
        },
        // {
        //   value: '领域',
        //   label: '领域数据标准',
        // },
      ], */
      folderValue: '1',
      typeName: this.$t('meta.DS.standardDialog.standard'),
      typeFullName: this.$t('meta.DS.standardDialog.dataStandard'),
      keywordPlaceholder: this.$t('meta.DS.standardDialog.nameOrCode'),
      treeKey: 0,
      defaultCurrentNode: '',
      treeData: [],
      folderId: '1',
      descriptionDepartmentTree: [],
      defaultExpandList: [],
      defaultProps2: {
        children: 'children',
        label: 'fullName',
      },
      treeLoading: false,
      timer: null,
      branchTree2: false,
      filterText: '',
    }
  },
  props: {
    categoryTypeId: {
      type: Number,
      default: 1,
    },
    hideFilter: {
      type: Boolean,
      default: false,
    },
    isColumn: {
      type: Boolean,
      default: false,
    },
    single: {
      // 区分是否单独使用基础标准或指标标准所生成的样式
      type: Boolean,
      default: false,
    },
  },
  mounted() {
    this.branchTree2 = false
    // this.initData()
    if ([2, 5].includes(this.categoryTypeId)) {
      this.typeName = this.$t('meta.DS.standardDialog.index')
      this.typeFullName = this.$t('meta.DS.standardDialog.index')
      this.keywordPlaceholder = '指标名称、英文名称、指标编码'
    } else if (this.categoryTypeId === 3) {
      this.typeName = this.$t('meta.DS.standardDialog.dictionary')
      this.typeFullName = this.$t('meta.DS.standardDialog.dataDictionary')
    } else {
      this.typeName = this.$t('meta.DS.standardDialog.standard')
      this.typeFullName = this.$t('meta.DS.standardDialog.dataStandard')
    }
    this.$bus.$on('callDomainSelector', (para = {}) => {
      if (para && para.multiple === true) {
        this.multiple = true
      }
      this.visible = true
      this.timeout = setTimeout(() => {
        this.innerLoadStandardTree()
      })
    })
    this.$bus.$on('callDomainSelector2', (para = {}) => {
      if (para && para.multiple === true) {
        this.multiple = true
      }
      this.visible = true
      this.timeout = setTimeout(() => {
        this.innerLoadStandardTree()
        if (para.length > 0) {
          setTimeout(() => {
            this.tableData.forEach(element => {
              if (element.domainId === para[0].domainId) {
                this.$refs.selectDomainTable.toggleRowSelection(element, true)
              }
            })
          }, 200)
        }
      })
    })
    if (this.categoryTypeId === 2) {
      this.folderValue = '2'
      this.folderId = '2'
    }
    if (this.categoryTypeId > 4) {
      this.folderValue = this.categoryTypeId.toString()
      this.folderId = this.categoryTypeId.toString()
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout)
    this.$bus.$off('callDomainSelector')
    this.$bus.$off('callDomainSelector2')
  },
  methods: {
    handleClose() {
      this.visible = false
      this.searchFormData.keyword = ''
      this.searchFormData.descriptionDepartment = ''
      this.keyword = ''
      this.currentPage = 1
      this.pageSize = 20
      if (this.categoryTypeId === 1) {
        this.folderValue = '1'
        this.folderId = '1'
      } else if (this.categoryTypeId === 2) {
        this.folderValue = '2'
        this.folderId = '2'
      } else {
        this.folderValue = this.categoryTypeId.toString()
        this.folderId = this.categoryTypeId.toString()
      }
      this.$nextTick(() => {
        this.$refs.mainTree.setCurrentKey(this.treeData.foldId)
      })
    },
    loadTreeData() {
      this.initData()
    },
    initData() {
      this.treeLoading = true
      HTTP.getOrgTree()
        .then(res => {
          this.treeLoading = false
          this.descriptionDepartmentTree = [res.data]
          this.defaultExpandList = res.data.children.map(e => e.pbm)
        })
        .catch(e => {
          this.treeLoading = false
          this.$showFailure(e)
        })
    },
    filterNode2(value, data, node) {
      if (!value) return true
      return data[this.defaultProps2.label].indexOf(value) !== -1
    },
    visibleChange() {
      this.filterText = ''
    },
    remoteMethod(query) {
      setTimeout(() => {
        this.filterText = query
      }, 100)
    },
    dataIconFunction2(data, node) {
      if (data.pbm) {
        return 'iconfont icon-bumen'
      } else {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      }
    },
    nodeClick(data) {
      this.searchFormData.descriptionDepartment = data.fullName
      this.searchFormData.bm = data.bm
      this.branchTree2 = false
      this.$refs.selectTree.$refs.dataSelect.blur() // 使el-select失去焦点，关闭下拉框
      //  this.form.name = data.name
      //  this.form.code = data.code
    },
    closeDialog() {
      this.folderId = '1'
      this.folderValue = '1'
      this.visible = false
    },
    innerLoadStandardTree() {
      if (!this.$route.query.domain || this.$route.query.domainId) {
        this.contentStatus = 'folder'
      }
      return new Promise(resolve => {
        this.treeLoading = true
        // const url = `${this.$url}/service/domains/tree?onlyFolder=true&categoryId=${this.typeIds}`
        let obj = {
          onlyFolder: true,
          categoryId: this.folderValue,
        }
        // this.$http.post(this.$meta_url + '/service/domains/tree/getTree', obj)
        HTTP.getDomainTreeDetailService(obj)
          .then(res => {
            this.treeLoading = false
            this.options = [res.data]
            this.treeData = [res.data]
            // this.treeData.unshift({
            //   name: '所有数据标准',
            //   foldId: 0
            // })
            this.innerLoadStandard()
            this.expandedKeys = [res.data.foldId]
            if (!this.$route.query.domain || this.$route.query.domainId) {
              if (this.nowFolder && !this.nowFolder.data) {
                this.$nextTick(() => {
                  this.$refs.mainTree.setCurrentKey(this.nowFolder.foldId)
                })
              } else {
                this.$nextTick(() => {
                  this.$refs.mainTree &&
                    this.$refs.mainTree.setCurrentKey(res.data.foldId)
                })
                this.nowFolder = {
                  data: res.data,
                }
              }
            }
            resolve()
          })
          .catch(e => {
            this.treeLoading = false
            this.$showFailure(e)
          })
      })
    },
    filterNode(value, data, node) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    dataIconFunction(data, node) {
      let className = ''
      // console.log(data, 'data')
      if (data.code) {
        className = 'tree-icon domain'
        if (data.updatingId) {
          className += ' is-updating'
        }
      } else {
        if (node.expanded) {
          className = 'iconfont icon-openfile'
        } else {
          className = 'iconfont icon-file'
        }
      }
      return className
    },
    handleItemClicked(data, node) {
      this.folderId = data.foldId
      this.innerLoadStandard()
      if (data.parentId === 0) {
        this.showShareFile = false
      } else {
        this.showShareFile = true
      }
    },
    // filterNode(value, data,node) {
    //   if (!value) return true;
    //   let current = node;
    //   do{
    //     if(this.$MatchKeyword(current.data, value, 'name')){
    //       return true;
    //     }
    //     current = current.parent;
    //   }while(current && current.data.name);
    //   return false;
    // },
    innerLoadStandard() {
      // let folderId = this.hideFilter ? this.categoryTypeId : this.folderValue
      // if (folderId === '领域') {
      //   folderId = 'null'
      // }
      // const obj = {
      //   categoryId: this.folderValue,
      //   domainCode: this.searchFormData.domainCode,
      //   chineseName: this.searchFormData.domainName,
      //   domainState: 'A',
      //   folderId: this.folderId,
      //   firstPublishStart: this.searchFormData.startTime,
      //   firstPublishEnd: this.searchFormData.endTime,
      //   orderColumn: ['createTime'],
      //   ascOrder: [false],
      //   submitter: this.searchFormData.submitter,
      //   currentPage: this.currentPage,
      //   pageSize: this.pageSize,
      //   onlyFiledDomain: this.folderValue === '领域',
      //   exceptFiledDomain: !this.isColumn,
      // }
      if (this.searchFormData.descriptionDepartment === '') {
        this.searchFormData.bm = ''
      }
      const obj = {
        keyword: this.searchFormData.keyword,
        folderId: this.folderId,
        categoryId: this.folderValue,
        descriptionDepartment: this.searchFormData.bm,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
      }
      this.tableLoading = true
      // this.$http.post(this.$meta_url + '/service/domains/domain/getPublicPage', obj)
      HTTP.getPublicPage(obj)
        .then(res => {
          this.tableLoading = false
          this.tableData = res.data.content
          this.total = res.data.totalItems
        })
        .catch(e => {
          this.tableLoading = false
          this.$showFailure(e)
        })
      setTimeout(() => {
        $('#selectDomainTable table th .el-checkbox').css({ display: 'none' })
      }, 10)
    },
    // modifyArrKey(obj){
    //   const self = this
    //   if(obj.nodes != null){
    //     this.$utils.sort.sortConsiderChineseNumber(obj.nodes);
    //     obj.nodes.forEach(item=>{
    //       self.modifyArrKey(item)
    //     })
    //   }
    //   if(obj.domains != null && obj.domains.length>0){
    //     this.$utils.sort.sortConsiderChineseNumber(obj.domains);
    //     obj.domains.forEach(item=>{
    //       if(obj.nodes == null){
    //         obj.nodes = []
    //       }
    //       obj.nodes.push(item)
    //     })
    //   }
    // },
    // stateChange(){
    //   this.treeData = [];
    //   if(arguments[0] != true){
    //     this.nowDomainId = null;
    //   }
    //   if(this.keyword){
    //     this.loadStandardByKeyword(arguments[0]);
    //   }else{
    //     clearTimeout(this.keywordSetTimeout);
    //     this.innerLoadStandard(arguments[0]);
    //   }
    // },
    // handleItemClicked(data, node) {
    //   if(data.id){
    //     this.nowDomainId = data.id;
    //     this.nowDomain = data;
    //     this.enableSelect = true;
    //   }else{
    //     this.nowDomainId = null;
    //     this.enableSelect = false;
    //   }
    // },
    // renderContent(h, { node,data,store }) {
    //   if(data.code){
    //     return(
    //       <span style="flex: 1; display: flex;align-items: center;" data-code={data.code}>
    //             <span class="tree-icon domain"></span>
    //             <span>{node.label}</span>
    //         </span>
    //     );
    //   }else{
    //     return(
    //       <span style="flex: 1; display: flex;align-items: center;">
    //           <span class="icon-i-folder">
    //             <span class="path1"></span>
    //             <span class="path2"></span>
    //           </span>
    //           <span>{node.label}</span>
    //         </span>
    //     );
    //   }
    // },
    handleSelect() {
      this.$bus.$emit(
        'domainSelected',
        this.multiple ? this.selection : this.selection[0]
      )
      this.visible = false
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.handleCurrentChange(1)
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.innerLoadStandard()
    },
    getSearch() {
      this.innerLoadStandardTree()
      if (this.folderValue === '1') {
        this.folderId = '1'
      } else if (['5', '6'].includes(this.folderValue)) {
        this.folderId = this.folderValue
      } else {
        this.folderId = '2'
      }
    },
    selectSubmitter() {
      this.$utils.staffSelect.open([], true).then(res => {
        this.searchFormData.submitter = res[0].username
      })
    },
    /* statusFormatter(status) {
      const param = {
        value: status,
      }
      switch (param.value) {
        case 'X':
          return this.$version.domain.status.deprecated
        case 'D':
          return '待审核'
        case 'C':
          return '审核中'
        case 'A':
          return this.$version.domain.status.adopted
      }
      return param.value
    }, */
    tableSelectionChanged(selection) {
      this.selection = selection
      if (!this.multiple && selection.length > 1) {
        const del_row = selection.shift()
        this.$refs.selectDomainTable.toggleRowSelection(del_row, false)
      }
    },
    resetQuery() {
      this.searchFormData = {
        stateValue: null,
        domainName: '',
        bigVersionId: '',
        startTime: null,
        endTime: null,
        domainCode: '',
        submitter: '',
        keyword: '',
        descriptionDepartment: '',
      }
      this.folderValue = '1'
      this.handleCurrentChange(1)
    },
  },
  computed: {
    nowDomain() {
      return this.selection[0] || {}
    },
  },
  watch: {
    filterText(val) {
      this.$refs.branchTree.filter(val)
    },
    keyword(value) {
      clearTimeout(this.keywordSetTimeout)
      setTimeout(() => {
        this.keywordSetTimeout = setTimeout(() => {
          this.$refs.mainTree.filter(value)
        }, 800)
      })
    },
    'searchFormData.descriptionDepartment'(val) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.$refs.branchTree.filter(val)
      }, 800)
    },
    folderValue(value) {
      if (value === '1') {
        this.folderId = '1'
      } else if (value === '2') {
        this.folderId = '2'
      }
      this.innerLoadStandardTree()
    },
  },
}
</script>
<style lang="scss">
.el-select > .el-input {
  font-size: 12px;
}
.selectTree {
  .el-select-dropdown__item.hover,
  .el-select-dropdown__item:hover {
    background: none;
  }
  .el-select-dropdown__item {
    padding: 0;
  }
}
.folderCard {
  .el-tabs--top.el-tabs--card > .el-tabs__header .el-tabs__item:last-child {
    padding-right: 35px;
  }
  .el-tabs--top.el-tabs--card > .el-tabs__header .el-tabs__item:nth-child(2) {
    padding-left: 35px;
  }
  .el-tabs__item {
    padding: 0 35px !important;
  }
}
</style>
<style scoped lang="scss">
/deep/ .datablau-datapicker {
  .el-date-editor {
    width: 100%;
  }
}
.tree-icon {
  margin: 0;
}
.branchTreeDiv {
  position: absolute;
  z-index: 111;
  width: 200px;
  background: #fff;
  height: 0;
  top: 40px;
  // overflow: auto;
  &.branchTreeDiv2 {
    height: 200px;
    border: 1px solid #dddddd;
    transition: height 0.2s;
  }
}
.typeIndex {
  margin-left: 260px;
}
.typeTable {
  position: absolute;
  top: 44px;
  bottom: 50px;
  left: 20px;
  right: 700px;
  padding: 0;
  border: 1px solid #dddddd;
  border-top: none;
  &.typeIndexTable {
    top: 11px;
    border-top: 1px solid #dddddd;
  }
}
</style>
