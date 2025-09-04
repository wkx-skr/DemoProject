<template>
  <div class="recognition-rules-page">
    <datablau-list-search>
      <el-form ref="ruleForm" class="form-search">
        <el-form-item label="">
          <datablau-input
            style="width: 250px"
            iconfont-state
            clearable
            type="text"
            v-model="ruleForm.name"
            placeholder="搜索规则名称、描述"
          ></datablau-input>
        </el-form-item>
        <el-form-item :label="'识别类型'">
          <datablau-select
            style="width: 240px"
            v-model="ruleForm.type"
            filterable
            placeholder="请选择识别类型"
          >
            <el-option
              v-for="item in discernList"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item class="btn">
          <datablau-button type="important" @click="ruleSearch">
            查询
          </datablau-button>
        </el-form-item>
      </el-form>
    </datablau-list-search>
    <div class="rule-content">
      <datablau-form-submit>
        <datablau-table
          :data-selectable="true"
          :show-column-selection="false"
          height="100%"
          :default-sort="{ prop: 'publishTime', order: 'ascending' }"
          ref="ruleTable"
          @selection-change="handleRuleChange"
          @sort-change="ruleSortChange"
          :data="ruleData"
        >
          <el-table-column
            :label="'规则名称'"
            prop="name"
            :min-width="minScreen ? 80 : 120"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="'识别类型'"
            prop="type"
            :min-width="minScreen ? 80 : 120"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="'关联信息项名称'"
            prop="standard"
            :min-width="minScreen ? 250 : 280"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="'描述'"
            prop="describe"
            :min-width="minScreen ? 250 : 280"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="'创建时间'"
            prop="publishTime"
            sortable="custom"
            :min-width="140"
            :formatter="$timeFormatter"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="'操作'"
            :width="100"
            align="center"
            fixed="right"
            prop="operation"
          >
            <template slot-scope="scope">
              <datablau-button
                type="text"
                :tooltip-content="'查看'"
                class="iconfont icon-see"
                @click="toDetail(scope.row)"
              ></datablau-button>
            </template>
          </el-table-column>
        </datablau-table>
        <template slot="buttons">
          <div class="bottom">
            <!-- <template>
                  <span class="check-info"  v-if="ruleSelections.length > 0"></span>
                  <span class="footer-row-info">
                    当前选中“{{ ruleSelections.length }}条”信息，是否
                  </span>
                  <datablau-button
                    type="danger"
                    class="el-icon-delete"
                    @click="handleDelete"
                  >
                    删除
                  </datablau-button>
                </template> -->
            <datablau-pagination
              @current-change="handleRulePageChange"
              @size-change="handleRuleSizeChange"
              :current-page.sync="ruleForm.page"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="ruleForm.size"
              layout="total, sizes, prev, pager, next, jumper"
              :total="ruleTotal"
              class="page"
            ></datablau-pagination>
          </div>
        </template>
      </datablau-form-submit>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    minScreen: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      ruleForm: {
        name: '',
        type: '',
        page: 1,
        size: 20,
        sort: 'ascending',
      },
      discernList: [
        {
          id: 1,
          name: '识别1',
        },
        {
          id: 2,
          name: '识别2',
        },
      ],
      ruleData: null,
      ruleTotal: 0,
      ruleSelections: [],
    }
  },
  mounted() {
    this.getRuleList()
  },
  methods: {
    getRuleList() {
      this.ruleData = [
        {
          name: '信息名称',
          type: '元数据识别',
          standard: 'L2-公司公开',
          describe: '--',
          publishTime: '2022-04-07 15:31:31',
        },
      ]
    },
    ruleSearch() {
      console.log(this.ruleForm)
    },
    handleRuleChange(selection) {
      this.ruleSelections = selection
    },
    ruleSortChange(data) {
      this.ruleForm.sort = data.order
      this.ruleForm.page = 1
      this.getRuleList()
    },
    toDetail(row) {},
    handleRulePageChange(val) {
      this.ruleForm.page = val
      this.getRuleList()
    },
    handleRuleSizeChange(val) {
      this.ruleForm.size = val
      this.ruleForm.page = 1
      this.getRuleList()
    },
  },
}
</script>

<style scoped lang="scss">
.recognition-rules-page {
  .rule-content {
    position: absolute;
    top: 54px;
    bottom: 0;
    left: 0;
    right: 0;
  }
}
</style>
