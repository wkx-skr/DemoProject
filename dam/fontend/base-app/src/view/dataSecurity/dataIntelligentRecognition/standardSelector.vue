<template>
  <div>
    <el-dialog
      :title="`选择${typeFullName}`"
      :visible.sync="visible"
      width="1000px"
      :close-on-click-modal="false"
      append-to-body
    >
      <div style="position: relative; height: 450px; overflow: auto">
        <el-form
          class="st-page-form"
          label-position="right"
          label-width="85px"
          ref="searchForm"
          :inline="true"
          :model="searchFormData"
          style="margin-top: 5px"
        >
          <el-form-item :label="`${typeName}名称`" prop="domainName">
            <el-input
              style="width: 135px"
              clearable
              maxlength="100"
              type="text"
              size="mini"
              v-model="searchFormData.domainName"
            ></el-input>
          </el-form-item>
          <el-form-item :label="`${typeName}编码`" prop="domainCode">
            <el-input
              style="width: 135px"
              type="text"
              clearable
              maxlength="100"
              size="mini"
              v-model="searchFormData.domainCode"
            ></el-input>
          </el-form-item>
          <el-form-item label="所有者" prop="department">
            <el-input
              style="width: 135px"
              clearable
              size="mini"
              type="text"
              maxlength="100"
              @focus="selectSubmitter()"
              v-model="searchFormData.submitter"
            ></el-input>
          </el-form-item>
          <el-form-item label="标准类型" prop="endTime" v-show="!hideFilter">
            <el-select
              style="width: 135px"
              v-model="folderValue"
              placeholder="请选择标准类型"
              size="mini"
            >
              <el-option
                v-for="item in folderIdArr"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="发布起始时间" prop="startTime">
            <el-date-picker
              type="date"
              size="mini"
              style="width: 135px"
              value-format="timestamp"
              v-model="searchFormData.startTime"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="发布结束时间" prop="endTime">
            <el-date-picker
              type="date"
              size="mini"
              style="width: 135px"
              value-format="timestamp"
              v-model="searchFormData.endTime"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button
              style="margin-left: 85px"
              size="mini"
              type="primary"
              @click="handleCurrentChange(1)"
            >
              查询
            </el-button>
            <el-button size="mini" type="primary" @click="resetQuery()">
              重置
            </el-button>
          </el-form-item>
        </el-form>
        <div
          style="
            position: absolute;
            top: 105px;
            bottom: 40px;
            width: 100%;
            border-bottom: 1px solid #e6e6e6;
          "
        >
          <div style="height: 100%; width: 100%; overflow: auto">
            <el-table
              class="datablau-table"
              height="100%"
              ref="selectDomainTable"
              id="selectDomainTable"
              :data="tableData"
              v-loading="tableLoading"
              @selection-change="tableSelectionChanged"
            >
              <el-table-column type="selection" width="50"></el-table-column>
              <el-table-column
                min-width="120px"
                :label="`${typeName}名称`"
                prop="chineseName"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  <span>
                    <i
                      class="tree-icon"
                      :class="{
                        domain: categoryTypeId === 1,
                        index: categoryTypeId === 2,
                        system: categoryTypeId === 3,
                      }"
                    ></i>
                    {{ scope.row.chineseName }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                :label="$version.tableHeader.enName"
                prop="englishName"
                min-width="120px"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                width="100px"
                :label="`${typeName}编码`"
                prop="domainCode"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
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
              ></el-table-column>
            </el-table>
          </div>
        </div>
        <div style="position: absolute; bottom: 5px; left: 20px">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            :pager-count="5"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></el-pagination>
        </div>
        <el-button
          @click="visible = false"
          style="position: absolute; bottom: 5px; right: 30px"
          size="small"
        >
          关闭
        </el-button>
        <el-button
          @click="handleSelect"
          size="mini"
          style="position: absolute; bottom: 5px; right: 110px"
          :disabled="selection.length < 1"
          type="primary"
        >
          选定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      multiple: false, // 是否可以多选
      visible: false,
      keyword: '',
      treeLoading: false,
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
      treeData: [],
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
      },
      currentPage: 1,
      pageSize: 20,
      total: 0,
      stateOptions: [
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
      ],
      selection: [],
      tableData: [],
      folderIdArr: [
        {
          value: 'null',
          label: '全部',
        },
        {
          value: '1',
          label: '基础标准',
        },
        {
          value: '3',
          label: '数据字典',
        },
        {
          value: '2',
          label: '指标标准',
        },
      ],
      folderValue: 'null',
      typeName: '标准',
      typeFullName: '数据标准',
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
  },
  mounted() {
    if (this.categoryTypeId === 1) {
      this.typeName = '标准'
      this.typeFullName = '数据标准'
    } else if (this.categoryTypeId === 2) {
      this.typeName = '指标'
      this.typeFullName = '指标'
    } else {
      this.typeName = '字典'
      this.typeFullName = '数据字典'
    }
    this.$bus.$on('callDomainSelector', (para = {}) => {
      if (para && para.multiple === true) {
        this.multiple = true
      }
      this.visible = true
      this.timeout = setTimeout(() => {
        this.innerLoadStandard()
      })
    })
    this.$bus.$on('callDomainSelector2', (para = {}) => {
      if (para && para.multiple === true) {
        this.multiple = true
      }
      this.visible = true
      this.timeout = setTimeout(() => {
        this.innerLoadStandard()
      })
    })
  },
  beforeDestroy() {
    clearTimeout(this.timeout)
    this.$bus.$off('callDomainSelector')
    this.$bus.$off('callDomainSelector2')
  },
  methods: {
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
      const obj = {
        domainCode: this.searchFormData.domainCode,
        chineseName: this.searchFormData.domainName,
        domainState: 'A',
        folderId: this.hideFilter ? this.categoryTypeId : this.folderValue,
        firstPublishStart: this.searchFormData.startTime,
        firstPublishEnd: this.searchFormData.endTime,
        orderColumn: ['createTime'],
        ascOrder: [false],
        submitter: this.searchFormData.submitter,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
      }
      this.tableLoading = true
      this.$http
        .post(`${this.$url}/service/domains/latest/page`, obj)
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
    selectSubmitter() {
      this.$utils.staffSelect.open([], true).then(res => {
        this.searchFormData.submitter = res[0].username
      })
    },
    statusFormatter(status) {
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
    },
    tableSelectionChanged(selection) {
      this.selection = selection
      if (selection.length > 1) {
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
      }
      this.folderValue = 'null'
      this.handleCurrentChange(1)
    },
  },
  computed: {
    nowDomain() {
      return this.selection[0] || {}
    },
  },
  // watch: {
  //   searchFormData: {
  //     handler () {
  //       clearTimeout(this.timer)
  //       this.timer = setTimeout(() => {
  //         this.innerLoadStandard()
  //       }, 800)
  //     },
  //     deep: true
  //   }
  // }
}
</script>
<style lang="scss">
.el-select > .el-input {
  font-size: 12px;
}
</style>
