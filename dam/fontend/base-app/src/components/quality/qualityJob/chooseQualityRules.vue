<template>
  <div class="chooseQualityRules">
    <!-- <el-input clearable maxlength="100"
	    placeholder="模糊搜索"
	    v-model="keyword"
	    size="small"></el-input> -->
    <el-form
      inline
      ref="searchForm"
      :model="searchFormData"
      :label-width="'60px'"
    >
      <el-form-item
        :label="$t('quality.page.qualityRule.index.bigClass')"
        prop="bigClassSelectOption"
      >
        <datablau-select
          v-model="searchFormData.bigClassSelectOption"
          style="width: 100px"
          @change="getSmallClassList()"
          clearable
        >
          <el-option
            v-for="item in $bigClassList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </datablau-select>
      </el-form-item>
      <el-form-item
        :label="$t('quality.page.qualityRule.index.ruleSubclass')"
        prop="smallClassSelectOption"
      >
        <datablau-select
          v-model="searchFormData.smallClassSelectOption"
          style="width: 120px"
          clearable
        >
          <el-option
            v-for="item in smallClassList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </datablau-select>
      </el-form-item>
      <el-form-item
        :label="$t('quality.page.qualityRule.index.businessType')"
        prop="bizTypeSelectOption"
        :label-width="$i18n.locale === 'zh' ? '60px' : '90px'"
      >
        <datablau-select
          v-model="searchFormData.bizTypeSelectOption"
          style="width: 120px"
          clearable
        >
          <el-option
            v-for="item in $typeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </datablau-select>
      </el-form-item>
      <el-form-item
        :label="$t('quality.page.qualityRule.index.keyword')"
        prop="ruleName"
      >
        <datablau-input
          clearable
          type="text"
          style="width: 120px"
          v-model="searchFormData.ruleName"
        ></datablau-input>
      </el-form-item>
      <el-form-item style="float: right; margin-right: 20px">
        <datablau-button type="important" @click="showSearch">
          {{ $t('common.button.query') }}
        </datablau-button>
        &nbsp;
        <datablau-button type="important" @click="reset">
          {{ $t('common.button.reset') }}
        </datablau-button>
      </el-form-item>
    </el-form>
    <datablau-table
      :class="{ 'no-select-table': types === 'redio' }"
      :data="displayRules"
      ref="multipleTable"
      max-height="352px"
      style="height: 352px"
      v-loading="tableLoading"
      @selection-change="handleSelectionChange"
      :data-selectable="option.selectable"
      :auto-hide-selection="option.autoHideSelectable"
      :show-column-selection="option.showColumnSelection"
      :column-selection="option.columnSelection"
      :border="option.columnResizable"
    >
      <el-table-column
        prop="name"
        :label="$t('quality.page.qualityRule.table.name')"
        min-width="200"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="modelCategoryName"
        :label="$t('quality.page.qualityRule.table.modelCategory')"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="bigClassSelectOption"
        :label="$t('quality.page.qualityRule.table.bigClassSelectOption')"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <span>
            {{ scope.row.bigClassSelectOption | bigClassFilter($bigClassList) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="smallClassSelectOption"
        :label="$t('quality.page.qualityRule.table.smallClassSelectOption')"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <span>
            {{
              scope.row.smallClassSelectOption
                | smallClassFilter($smallClassListAll)
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="bizTypeSelectOption"
        :label="$t('quality.page.qualityRule.table.bizTypeSelectOption')"
        show-overflow-tooltip
        :width="$i18n.locale === 'zh' ? '90px' : '120px'"
      >
        <!--					<template slot-scope="scope">-->
        <!--						<span>{{typeFormatter(displayRules[scope.$index].bizTypeSelectOption)}}</span>-->
        <!--					</template>-->
      </el-table-column>
      <!--				<el-table-column prop="state" label="规则类型" show-overflow-tooltip>-->
      <!--					<template slot-scope="scope">-->
      <!--						<span>{{stateFormatter(displayRules[scope.$index].state)}}</span>-->
      <!--					</template>-->
      <!--				</el-table-column>-->
      <el-table-column
        prop="creator"
        :label="$t('quality.page.qualityRule.table.creator')"
        width="130"
      >
        <template slot-scope="scope">
          <span>
            {{
              getPeopleName([scope.row.creator])
                ? getPeopleName([scope.row.creator])
                : scope.row.creator
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        :label="$t('quality.page.qualityRule.table.createTime')"
        width="190"
        :formatter="$timeFormatter"
      ></el-table-column>
    </datablau-table>
    <div class="dialog-bottom">
      <el-checkbox
        v-model="notUsedByJob"
        @change="handleUsedByJobChange"
        style="float: left; margin-top: 13px; margin-right: 20px"
        v-if="from !== 'repairJob'"
      >
        {{ $t('quality.page.dataQualityRules.ruleTable.checkboxMsg') }}
      </el-checkbox>
      <datablau-pagination
        style="margin-top: 10px; float: left"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[10, 20, 100, 500]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :style="{ display: 'inline-block' }"
      ></datablau-pagination>
      <div style="float: right; margin-right: 20px; margin-top: 10px">
        <datablau-button
          type="important"
          @click="selected"
          :disabled="multipleSelection.length === 0"
        >
          {{ $t('quality.page.qualityRule.add') }}
        </datablau-button>
        <!-- <el-button @click="selected('close')" type="primary" size="small" :disabled="multipleSelection.length === 0">添加并关闭</el-button> -->
        &nbsp;
        <datablau-button type="secondary" @click="close">
          {{ $t('common.button.close') }}
        </datablau-button>
      </div>
    </div>
  </div>
</template>

<script>
import RuleImpl from '../../../view/dataQuality/techRules/ruleImpl.vue'
export default {
  components: {
    RuleImpl,
  },
  data() {
    return {
      multipleSelection: [],
      rules: [],
      filteredRules: [],
      allDisplay: [],
      keyword: '',
      pageSize: 10,
      displayRules: [],
      currentPage: 1,
      notUsedByJob: false,
      total: 0,
      smallClassList: [],
      dataTime: '',
      tableLoading: false,
      searchFormData: {
        ruleName: '',
        smallClassSelectOption: '',
        searchFormData: '',
        bizTypeSelectOption: '',
      },
      nameMapping: {},
      option: {
        selectable: true,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
    }
  },
  props: [
    'selectedRules',
    'categoryId',
    'types',
    'isMutiple',
    'permissionLevel',
    'from',
  ],
  filters: {
    bigClassFilter(value, bigClassList) {
      let result = ''
      bigClassList.forEach(e => {
        if (e.value === value) {
          result = e.label
        }
      })
      return result
    },
    smallClassFilter(value, smallClassList) {
      let result = ''
      smallClassList.forEach(e => {
        if (e.value === value) {
          result = e.label
        }
      })
      return result
    },
  },
  created() {
    this.$bus.$emit('getRuleType')
  },
  mounted() {
    this.getBigClassListAndBusinessTypeList()
    // this.loadAllRules();
  },
  watch: {
    keyword() {
      this.handleKeywordChange()
    },
  },
  methods: {
    getBigClassListAndBusinessTypeList() {
      const obj = {
        processing: false,
        keyword: this.searchFormData.ruleName,
        modelCategoryId: this.categoryId,
        state: '',
        bigClassSelectOption: this.searchFormData.bigClassSelectOption,
        smallClassSelectOption: this.searchFormData.smallClassSelectOption,
        bizTypeSelectOption: this.searchFormData.bizTypeSelectOption,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        notUsedByJob: this.notUsedByJob,
        startTime:
          Array.isArray(this.dataTime) && this.dataTime.length > 0
            ? this.dataTime[0]
            : '',
        endTime:
          Array.isArray(this.dataTime) && this.dataTime.length > 0
            ? this.dataTime[1]
            : '',
        publicState: 'A',
      }
      if (this.permissionLevel) {
        obj.permissionLevel = this.permissionLevel
      }
      if (this.from && this.from === 'repairJob') {
        delete obj.publicState
        obj.hasProblem = true
      }
      this.$http
        .post(`${this.$quality_url}/quality/rules/tech/page`, obj)
        .then(res => {
          this.displayRules = res.data.ruleList
          this.total = res.data.total

          //
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getSmallClassList() {
      this.$set(this.searchFormData, 'smallClassSelectOption', '')
      this.smallClassList = []
      if (!this.searchFormData.bigClassSelectOption) return
      const pId = this.$bigClassList.filter(
        e => e.value === this.searchFormData.bigClassSelectOption
      )[0].id
      this.$http
        .post(`${this.$url}/select/option/getByParentId?parentId=${pId}`)
        .then(res => {
          res.data.forEach(e => {
            const obj = {
              label: e.optionValue,
              value: e.ruleCode,
            }
            this.smallClassList.push(obj)
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getUserByIds(idList) {
      if (!idList) {
        return
      }
      return new Promise(resolve => {
        this.$http
          .post(`${this.$url}/service/staffs/ids?isTuAcct=true`, idList)
          .then(res => {
            const obj = {}
            res.data.forEach(e => {
              obj[e.tuAcct] = e.tuCname
            })
            this.nameMapping = obj
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    handleSizeChange(val) {
      this.currentPage = 1
      this.pageSize = val
      this.getBigClassListAndBusinessTypeList()
    },
    handleUsedByJobChange() {
      this.currentPage = 1
      this.getBigClassListAndBusinessTypeList()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getBigClassListAndBusinessTypeList()
    },
    changeDisplay() {
      this.displayRules = this.filteredRules.slice(
        (this.currentPage - 1) * this.pageSize,
        this.pageSize * this.currentPage
      )
    },
    getPeopleName(list) {
      return list.map(e => this.nameMapping[e]).toString()
    },
    handleKeywordChange() {
      this.filteredRules = []
      if (this.keyword) {
        this.rules.forEach(item => {
          if (
            item.name.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1 ||
            (item.catalog &&
              item.catalog.toLowerCase().indexOf(this.keyword.toLowerCase()) >
                -1)
          ) {
            this.filteredRules.push(item)
          }
        })
      } else {
        this.filteredRules = _.cloneDeep(this.rules)
      }
      this.displayRules = this.filteredRules.slice(
        (this.currentPage - 1) * this.pageSize,
        this.pageSize * this.currentPage
      )
      this.total = this.filteredRules.length
    },
    filterHandler(value, row, column) {
      const property = column.property
      return row[property] === value
    },
    toggleSelection() {
      const rulesIds = []
      this.rules.forEach(rule => {
        rulesIds.push(rule.id)
      })
      const rows = this.selectedRules
      if (rows) {
        rows.forEach(row => {
          // let index = rulesIds.indexOf(row.id)
          // if(index != -1){
          // 	// this.rules[index] = null;
          // 	this.rules.splice(index, 1);
          // }
          Object.keys(this.rules).forEach((item, index) => {
            if (
              this.rules[index] !== undefined &&
              this.rules[index].id === row.id
            ) {
              this.rules.splice(index, 1)
            }
          })
        })
        this.rules = _.compact(this.rules)
      } else {
      }
      this.filteredRules = this.rules
      this.displayRules = this.filteredRules.slice(
        (this.currentPage - 1) * this.pageSize,
        this.pageSize * this.currentPage
      )
      this.allDisplay = _.cloneDeep(this.rules)
      this.total = this.filteredRules.length
    },
    handleSelectionChange(val) {
      if (this.types === 'redio') {
        if (val.length > 1) {
          // val = [] // 禁止多选
          this.$refs.multipleTable.clearSelection() // 清空列表的选中
          this.$refs.multipleTable.toggleRowSelection(val[val.length - 1]) // 只显示选中最后一个 这时val还是多选的列表(就是你选中的几个数据)
          val = val.slice(-1)
        } else if (val.length === 1) {
          // this.multipleSelection = val[val.length - 1]
          val = val.slice(-1)
        }
      }
      val.forEach(v => {
        this.$bigClassList.forEach(e => {
          if (e.value === v.bigClassSelectOption) {
            v.levelOneName = e.label
          }
        })
        this.$smallClassListAll.forEach(e => {
          if (e.value === v.smallClassSelectOption) {
            v.levelTwoName = e.label
          }
        })
      })
      this.multipleSelection = val
    },
    selected() {
      const rulesIds = []
      this.rules.forEach(rule => {
        rulesIds.push(rule.id)
      })
      let rows = this.multipleSelection
      this.rules.forEach(rule => {
        rulesIds.push(rule.id)
      })
      if (rows) {
        rows.forEach(row => {
          // let index = rulesIds.indexOf(row.id)
          // if(index != -1){
          // this.rules.splice(index, 1);
          Object.keys(this.rules).forEach((item, index) => {
            if (
              this.rules[index] !== undefined &&
              this.rules[index].id === row.id
            ) {
              this.rules.splice(index, 1)
            }
          })
          // }
        })
        this.rules = _.compact(this.rules)
        this.allDisplay = _.cloneDeep(this.rules)
      } else {
      }
      this.showSearch()
      this.$emit('qualityRulesSelected', this.multipleSelection)
      if (arguments[0] === 'close') {
        this.close()
      }
      this.close()
    },
    close() {
      // this.$bus.$emit('closeDialog');
      this.$emit('closeDialog')
    },
    loadAllRules() {
      var self = this

      if (this.allRules) {
        this.rules = _.cloneDeep(this.allRules)
        setTimeout(() => {
          self.toggleSelection()
        })
      } else {
        this.tableLoading = true
        let requestUrl = this.$quality_url + '/quality/rules/tech/report'
        if (this.categoryId) {
          requestUrl += '/' + this.categoryId
        }
        self.$http
          .get(requestUrl)
          .then(res => {
            // self.rules = [];
            this.tableLoading = false
            self.rules = res.data.reverse()
            // res.data.reverse().forEach(item=>{
            // 	if(item.state === 1){
            // 		self.rules.push(item);
            // 	}
            // });

            let arr2 = self.rules.map(e => e.creator)
            arr2 = [...new Set(arr2)]
            // self.getUserByIds(arr2)
            setTimeout(() => {
              self.toggleSelection()
            })
          })
          .catch(e => {
            this.tableLoading = false
            self.$notify.error({
              title: self.$version.common.error,
              message: self.$version.quality.failLoad,
            })
          })
      }
    },
    filterDatasources(value, row) {
      return row.modelId === value
    },
    filterDisable(value, row) {
      return row.disabled == value
    },
    disableFormat(row, column) {
      var disabled = row[column.property]
      if (disabled == undefined) {
        return ''
      } else if (disabled == 0) {
        return '有效'
      } else if (disabled == 1) {
        return '无效'
      }
    },
    datasourceFormat(row, column) {
      var self = this
      var datasourceId = row[column.property]
      if (datasourceId == undefined) {
        return ''
      }
      if (
        self.$parent.datasourcesMap != null &&
        self.$parent.datasourcesMap.hasOwnProperty(datasourceId)
      ) {
        return self.$parent.datasourcesMap[datasourceId].displayName
      }
      return ''
    },
    showSearch() {
      // console.log(this.searchFormData.ruleName);
      // 修复 第二页搜索关键词无结果的bug 默认按第一页搜索
      this.currentPage = 1
      this.getBigClassListAndBusinessTypeList()
      // let firstData = [];
      // let secondData = [];
      // let thirdData = [];
      // let forthData = [];
      // this.allDisplay.forEach(item => {
      // 	if(item.name.includes(this.searchFormData.ruleName)) {
      // 		firstData.push(item)
      // 	} else if (this.searchFormData.ruleName === "") {
      // 		firstData = this.allDisplay
      // 	}
      // });
      // firstData.forEach(item => {
      // 	if(item.bigClassSelectOption === this.searchFormData.bigClassSelectOption) {
      // 		secondData.push(item)
      // 	} else if (this.searchFormData.bigClassSelectOption === "") {
      // 		secondData = firstData
      // 	}
      // });
      // secondData.forEach(item => {
      // 	if(item.smallClassSelectOption === this.searchFormData.smallClassSelectOption) {
      // 		thirdData.push(item)
      // 	} else if (this.searchFormData.smallClassSelectOption === "") {
      // 		thirdData = secondData
      // 	}
      // });
      // thirdData.forEach(item => {
      // 	if(item.bizTypeSelectOption === this.searchFormData.bizTypeSelectOption) {
      // 		forthData.push(item)
      // 	} else if(this.searchFormData.bizTypeSelectOption === "") {
      // 		forthData = thirdData
      // 	}
      // });
      // this.filteredRules = forthData;
      // this.displayRules = this.filteredRules.slice((this.currentPage-1)*this.pageSize,this.pageSize*this.currentPage);
      // this.total = this.filteredRules.length;
    },
    reset() {
      this.$refs.searchForm.resetFields()
      this.getBigClassListAndBusinessTypeList()
      // this.filteredRules = this.allDisplay;
      // this.displayRules = this.filteredRules.slice((this.currentPage-1)*this.pageSize,this.pageSize*this.currentPage);
      // this.total = this.filteredRules.length;
    },
    stateFormatter(val) {
      if (val === 1) {
        return '业务规则'
      } else {
        return '技术规则'
      }
    },
    typeFormatter(val) {
      if (val === 2) {
        return '标准映射'
      } else {
        return '监管报送'
      }
    },
    smallRuleFormatter(val) {
      switch (val) {
        case 1:
          return '空值检查'
        case 2:
          return '一致性检查'
        case 3:
          return '主外键关联检查'
        case 4:
          return '唯一性检查'
        case 6:
          return '长度检查'
        case 7:
          return '值域检查'
      }
    },
    bigRuleFormatter(val) {
      switch (val) {
        case 1:
          return this.$version.ruleTemplate.name.integrity
        case 2:
          return this.$version.ruleTemplate.name.consistent
        case 3:
          return this.$version.ruleTemplate.name.veracity
        case 4:
          return '唯一性'
        case 6:
          return '规范性'
        case 7:
          return '有效性'
      }
    },
  },
}
</script>

<style scoped lang="scss">
.no-select-table {
  /deep/ .el-table {
    thead {
      tr {
        th.selection-column {
          .el-checkbox {
            display: none;
          }
        }
      }
    }
  }
}
.table-part {
  /*height: 400px;*/
  /*overflow: auto;*/
}
.bottom-btn {
  /*position: absolute;*/
  /*bottom: 10px;*/
  /*display: inline-block;*/
  /*left: 270px;*/
}
.table {
  /*position: absolute;*/
  /*top: 30px;*/
  /*left: 0;*/
}
</style>
<style lang="scss">
.chooseQualityRules {
  .el-form-item__label {
    padding-right: 6px;
  }
  .el-form--inline .el-form-item {
    margin-right: 20px;
  }
}
</style>
