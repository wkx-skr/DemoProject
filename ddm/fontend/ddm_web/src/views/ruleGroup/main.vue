<template>
    <div class="rule-group">
      <datablau-dialog
        v-loading="loading2"
        :visible.sync="dialogVisible"
        v-if="dialogVisible"
        title="添加自定义规则"
        width="1000px"
        height="600px"
        append-to-body
        :table="true"
      >
        <div class="dialog-content-container" style="">
          <div class="filter-line">
            <datablau-input
              v-model="keyword2"
              :iconfont-state="true"
              placeholder="搜索编码"
              @input="handleSearch2"
              clearable
            ></datablau-input>
          </div>
          <div class="table-line" style="position: absolute;top: 40px;bottom:0;left: 20px;right:20px;">
            <datablau-table
              height="100%"
              @selection-change="handleSelectionChange"
              :data="ruleList"
              row-key="id"
              :reserve-selection="true"
              data-selectable
            >
              <el-table-column
                width="140"
                prop="code"
                label="编码"
                show-overflow-tooltip
              >
              </el-table-column>
              <el-table-column
                width="100"
                prop=""
                label="对象"
                align="center"
              >
                <template slot-scope="scope">
                  <span class="type-box " :class="'a' + scope.row.typeId">{{ typeIdArr[scope.row.typeId] }}</span>
                </template>
              </el-table-column>

              <el-table-column
                width="90"
                prop="severity"
                label="严重程度"
              >
                <template slot-scope="scope">
                  <div class="severity">
                    <div class="dot" :class="scope.row.severity"></div>
                    {{ scope.row.severity }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="200"
                prop="message"
                label="描述"
                show-overflow-tooltip
              >
              </el-table-column>
              <el-table-column
                min-width="140"
                prop=""
                label="模型类型"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                              <span v-for="(type, index) in scope.row.dbTypes" :key="index">
                                <Database-Type
                                  style="display:inline-block"
                                  :key="type"
                                  :value="type"
                                  :size="24"
                                  :hideIcon="true"
                                ></Database-Type>
                                <i v-if="(index+1) !== scope.row.dbTypes.length">、</i></span>
                  <!--{{ scope.row.dbTypes.map(item => databaseTypeMap[item]).join(', ') }}-->
                  </template>
                </el-table-column>

              </datablau-table>
            </div>

          </div>
          <span slot="footer">
            <datablau-pagination
              @size-change="handleSizeChange2"
              @current-change="handleCurrentChange2"
              :current-page="currentPage2"
              :page-sizes="[20, 50, 100, 200]"
              :page-size="pageSize2"
              :total="total2"
              :layout="'total, sizes, prev, pager, next, jumper'"
            ></datablau-pagination>
            <datablau-button type="secondary" @click="dialogVisible = false">取 消</datablau-button>
            <datablau-button type="primary" @click="addRlue">
              确 定
            </datablau-button>
          </span>
      </datablau-dialog>
      <datablau-dialog
        v-loading="loading2"
        :visible.sync="showBuildin"
        v-if="showBuildin"
        title="添加内置规则"
        width="1000px"
        height="600px"
        append-to-body
        :custom-class="'build-in-rules-dialog'"
        :table="true"
      >
        <div class="dialog-content">
          <datablau-input
            v-model.trim="keyword3"
            placeholder="搜索编码"
            size="normal"
            @input="search"
            :iconfont-state="true"
            clearable
          ></datablau-input>

          <div class="build-in-rules-list">
            <datablau-table
              @selection-change="handleSelectionChange2"
              :data="defaultRulesDisplay"
              row-key="id"
              :reserve-selection="true"
              data-selectable
              height="100%"
            >
              <el-table-column
                width="150"
                prop="ruleNum"
                label="编码"
                show-overflow-tooltip
              >
              </el-table-column>
              <el-table-column
                width="100"
                prop="ruleSeverity"
                label="严重程度"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  <div class="severity">
                    <div class="dot" :class="scope.row.ruleSeverity"></div>
                    {{ scope.row.ruleSeverity }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                prop="displayMessage"
                label="描述"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  <span v-html="scope.row.displayMessage"></span>
                </template>
              </el-table-column>
            </datablau-table>
          </div>
        </div>
        <span slot="footer">
          <datablau-button type="secondary" @click="showBuildin = false">取 消</datablau-button>
          <datablau-button type="primary" @click="addRlue2">
            确 定
          </datablau-button>
        </span>
      </datablau-dialog>
      <div class="top-header-info-panel-wrapper" style="margin:0px"><b>检查策略管理</b></div>
      <div class="title-line" style="height: 40px;"></div>
      <div class="tool">
        <datablau-input
          v-model="keyword"
          :iconfont-state="true"
          placeholder="搜索策略名称、编码、描述"
          @input="handleSearch"
          style="width: 215px;"
          clearable
        ></datablau-input>
        <datablau-button
          class="iconfont icon-tianjia"
          type="important"
          @click="createNewGroup"
        >新建策略
        </datablau-button>
      </div>
      <div class="table-box" v-loading="loading">
        <datablau-table
          height="100%"
          :data="tableList">
          <el-table-column
            prop="name"
            label="策略名称"
            min-width="150"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <datablau-list-icon :dataType="'icon-menu-gzgl'"></datablau-list-icon>
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column
            prop="code"
            label="策略编码"
            min-width="150"
            show-overflow-tooltip
          >
          </el-table-column>
          <el-table-column
            label="包含规则数"
            min-width="150"
            align="center"
          >
            <template slot-scope="scope">
              <span class="circle"> {{ getTotal(scope.row) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="creator"
            label="创建人"
            min-width="150"
            show-overflow-tooltip
          >
          </el-table-column>
          <el-table-column
            prop="description"
            label="描述"
            min-width="450"
            show-overflow-tooltip
          >
          </el-table-column>
          <el-table-column
            prop="updateTime"
            label="最近更新时间"
            width="100"
          >
            <template slot-scope="scope">
              {{ moment(scope.row.updateTime).format('YYYY-MM-DD') }}
            </template>
          </el-table-column>
          <el-table-column
            fixed="right"
            prop="enable"
            label="操作"
            header-align="left"
            align="left"
            width="100"
          >
            <template slot-scope="scope">
              <datablau-button
                type="text"
                @click="handleEdit(scope.row)"
              ><i class="iconfont icon-bianji"></i></datablau-button>
              <datablau-button
                type="text"
                @click="deleteGroup(scope.row)"
              ><i class="iconfont icon-delete"></i></datablau-button>
              <!-- <datablau-button @click="handleEdit(scope.row)" type="text">{{ $t('common.button.edit') }}</datablau-button> -->
              <!-- <datablau-button @click="deleteGroup(scope.row)" type="text" size="mini">{{ $t('common.button.delete') }}</datablau-button> -->
            </template>
          </el-table-column>
        </datablau-table>
      </div>
      <datablau-pagination
        :class="{'shadow':isTableOverflow}"
        style="position:absolute;bottom: -20px;right:-20px;left: -20px;padding: 12px 20px;border-top: 1px solid #ddd;background:#fff"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[20, 50, 100, 200]"
        :page-size="pageSize"
        :total="total"
        :layout="'total, sizes, prev, pager, next, jumper'"
      ></datablau-pagination>

      <div class="detail" v-if="showDetail" v-loading='loading2'>
        <datablau-breadcrumb
          :couldClick="false"
          :node-data="editModel ? nodeData : nodeData2"
          :separator="'/'"
          @back="closeDetail()"
        ></datablau-breadcrumb>
        <div class="box">
          <datablau-form
            label-width="180px"
            style="padding-top:4px"
            :model="createForm"
            ref="createForm"
            :rules="rules">
            <el-form-item label="策略名称" prop="name">
              <datablau-input v-model="createForm.name" placeholder="请输入" clearable maxlength="20"
                              show-word-limit></datablau-input>
            </el-form-item>
            <el-form-item label="编码" prop="code">
              <datablau-input v-model="createForm.code" placeholder="请输入" clearable maxlength="20"
                              show-word-limit></datablau-input>
            </el-form-item>
            <el-form-item label="描述" prop="description" style="margin-top:12px">
              <datablau-input
                style="800px"
                type="textarea"
                v-model="createForm.description"
                placeholder="请输入"
                clearable
                maxlength="200"
                show-word-limit
                class="textarea-no-resize"
              ></datablau-input>
            </el-form-item>
            <br>
          </datablau-form>
          <div>
            <datablau-detail-subtitle title="内置规则" mt="0"></datablau-detail-subtitle>
            <datablau-button class="iconfont icon-tianjia" style="float:right;" type="" size="default"
                             @click="showAdd2">添加内置规则
            </datablau-button>
          </div>
          <datablau-table
            class="reset"
            :svgSize="100"
            :data="display2"
            key="table2"
          >
            <el-table-column
              prop="code"
              label="编码"
              min-width="80"
              show-overflow-tooltip
            >
            </el-table-column>
            <el-table-column
              min-width="80"
              prop="severity"
              label="严重程度"
            >
              <template slot-scope="scope">
                <div class="severity">
                  <div class="dot" :class="scope.row.severity || scope.row.ruleSeverity"></div>
                  {{ scope.row.severity || scope.row.ruleSeverity }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              min-width="800"
              show-overflow-tooltip
              prop="displayMessage"
              label="描述"
            >
              <template slot-scope="scope">
                <span v-html="scope.row.displayMessage"></span>
              </template>
            </el-table-column>
            <el-table-column
              fixed="right"
              prop="enable"
              label="操作"
              header-align="left"
              align="left"
              width="60"
            >
              <template slot-scope="scope">
                <datablau-button
                  type="text"
                  @click="deletRule2(scope)"
                ><i class="iconfont icon-delete"></i></datablau-button>
              </template>
            </el-table-column>
          </datablau-table>
          <div class="page-box">
            <datablau-pagination
              v-show="total4 > 10"
              @current-change="handleCurrentChange4"
              @size-change="handleSizeChange4"
              :current-page="currentPage4"
              :page-size="pageSize4"
              :total="total4"
              :layout="'total, sizes, prev, pager, next, jumper'"
            ></datablau-pagination>
          </div>
          <div>
            <datablau-detail-subtitle title="自定义规则" mt="0"></datablau-detail-subtitle>
            <datablau-button
              class="iconfont icon-tianjia"
              style="float: right;"
              @click="showAdd"
            >添加自定义规则
            </datablau-button>
          </div>
          <datablau-table
            class="reset"
            :svgSize="100"
            :data="display1"
            key="table1"
          >
            <el-table-column
              min-width="80"
              prop="code"
              label="编码"
              show-overflow-tooltip
            >
            </el-table-column>
            <el-table-column
              min-width="60"
              align="center"
              prop=""
              label="对象"
            >
              <template slot-scope="scope">
                <span class="type-box" :class="'a' + scope.row.typeId">{{ typeIdArr[scope.row.typeId] }}</span>
              </template>
            </el-table-column>

            <el-table-column
              min-width="70"
              prop="severity"
              label="严重程度"
            >
              <template slot-scope="scope">
                <div class="severity">
                  <div class="dot" :class="scope.row.severity"></div>
                  {{ scope.row.severity }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              min-width="290"
              show-overflow-tooltip
              prop="message"
              label="描述"
            >
            </el-table-column>
            <el-table-column
              min-width="150"
              show-overflow-tooltip
                prop=""
                label="模型类型"
              >
                <template slot-scope="scope">
                          <span v-for="(type, index) in scope.row.dbTypes" :key="index">
                            <Database-Type
                              style="display:inline-block"
                              :key="type"
                              :value="type"
                              :size="24"
                              :hideIcon="true"
                            ></Database-Type>
                            <i v-if="(index+1) !== scope.row.dbTypes.length">、</i></span>
                </template>
              </el-table-column>

              <el-table-column
                fixed="right"
                prop="enable"
                label="操作"
                header-align="left"
                align="left"
                width="60"
              >
                <template slot-scope="scope">
                  <datablau-button
                    type="text"
                    @click="deletRule(scope)"
                  ><i class="iconfont icon-delete"></i></datablau-button>
                  <!-- <datablau-button type="text" size="mini" @click="deletRule(scope)">{{ $t('common.button.delete') }}</datablau-button> -->
                </template>
              </el-table-column>
            </datablau-table>
                <div class="page-box" style="padding-bottom:60px;">
                   <datablau-pagination
                   v-show="total3 > 10"
                    @current-change="handleCurrentChange3"
                   @size-change="handleSizeChange3"
                    :current-page="currentPage3"
                    :page-size="pageSize3"
                    :total="total3"
                    :layout="'total, sizes, prev, pager, next, jumper'"
                  ></datablau-pagination>
                </div>

            <!-- <div class="rule-table" >
              <div style="height:50%">
                <datablau-table
                height="100%"
                :data="ruleArr">
                    <el-table-column
                        prop="code"
                        label="编码"
                        >
                    </el-table-column>
                    <el-table-column
                        prop=""
                        label="对象"
                        >
                        <template slot-scope="scope">
                          {{typeIdArr[scope.row.typeId]}}
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="message"
                        label="描述"
                        >
                    </el-table-column>
                    <el-table-column
                        prop="severity"
                        label="严重程度"
                        >
                    </el-table-column>
                    <el-table-column
                        prop=""
                        label="数据库类型"
                        >
                        <template slot-scope="scope">
                          <span v-for="(type, index) in scope.row.dbTypes" :key="index">{{type}}<i v-if="(index+1) !== scope.row.dbTypes.length">、</i></span>
                        </template>
                    </el-table-column>
                    <el-table-column
                        fixed="right"
                        prop="enable"
                        label="操作"
                        header-align="left"
                        align="left"
                        width="60"
                        >
                        <template slot-scope="scope">
                            <datablau-button
                              type="text"
                              @click="deletRule(scope)"
                            ><i class="iconfont icon-delete"></i></datablau-button>
                        </template>
                    </el-table-column>
                </datablau-table>
                </div>
                <div style="height:32px;">
                  <datablau-button type="important" size="default"  style="float: right;" @click="showAdd2">添加内置规则</datablau-button>
                </div>
                <div style="height:40%">
                <datablau-table
                height="100%"
                :data="buildinRuleArr">
                    <el-table-column
                        prop="code"
                        label="编码"
                        >
                    </el-table-column>

                    <el-table-column
                        prop="message"
                        label="描述"
                        >
                    </el-table-column>
                    <el-table-column
                        prop="severity"
                        label="严重程度"
                        >
                    </el-table-column>

                    <el-table-column
                        fixed="right"
                        prop="enable"
                        label="操作"
                        header-align="left"
                        align="left"
                        width="60"
                        >
                        <template slot-scope="scope">
                            <datablau-button
                              type="text"
                              @click="deletRule2(scope)"
                            ><i class="iconfont icon-delete"></i></datablau-button>
                        </template>
                    </el-table-column>
                </datablau-table>
              </div>
            </div> -->
          </div>
          <div class="bottom-row" :class="{'shadow':isDetailOverflow}">
              <datablau-button type="primary" @click="submit(false)" style="z-index: 9;" :disabled="createForm.name.trim() === '' || createForm.code.trim() === ''">
                确 定
              </datablau-button>
              <datablau-button type="secondary" @click="closeDetail()">取 消</datablau-button>
          </div>
        </div>
    </div>
</template>
<script>
import HTTP from '@/resource/http'
import moment from 'moment'
import DatabaseType from '@/components/common/DatabaseType.vue'
import LDMTypes from '@constant/LDMTypes'
export default {
  components: { DatabaseType },
  data () {
    return {
      keyword3: '',
      nodeData: [
        '检查策略管理',
        '编辑策略'
      ],
      nodeData2: [
        '检查策略管理',
        '新建策略'
      ],
      typeIdArr: {
        [LDMTypes.ModelSource]: '模型', // '键值'
        [LDMTypes.BusinessObject]: '业务对象', // '键值'
        '80000004': this.$v.RuleChecking.table, // '表',
        '80500008': this.$v.RuleChecking.view, // '视图',
        '80000005': this.$v.RuleChecking.column, // '字段',
        '80000093': this.$v.RuleChecking.keyValue, // '键值'
        [LDMTypes.Diagram]: '主题域' // '主题域'
      },
      ruleList: [],
      createForm: {
        name: '',
        code: ''
      },
      showDetail: false,
      editModel: false,
      dialogVisible: false,
      loading: false,
      loading2: false,
      moment,
      keyword: '',
      currentPage: 1,
      pageSize: 20,
      tableList: [],
      total: 0,
      keyword2: '',
      currentPage2: 1,
      pageSize2: 20,
      total2: 0,
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入编码', trigger: 'blur' }
        ]
      },
      currentGroup: {
        children: []
      },
      ruleArr: [],
      buildinRuleArr: [],
      currentCheckedRules: [],

      showBuildin: false,
      defaultRules: [],
      checkedBuildinRules: [],

      currentPage3: 1,
      pageSize3: 10,
      total3: 0,
      display1: [],

      currentPage4: 1,
      pageSize4: 10,
      total4: 0,
      display2: null,
      isDetailOverflow: false,
      isTableOverflow: false,
      defaultRulesDisplay: []
    }
  },
  mounted () {
    this.getRuleGroupList()
    this.getEntriesSearch()
    this.getDefaultRules()
  },
  inject: ['refresh'],
  methods: {
    search (val) {
      val = _.trim(val)
      if (!val) {
        this.defaultRulesDisplay = this.defaultRules
        return
      }
      this.defaultRulesDisplay = this.defaultRules.filter(v => {
        if (v.ruleNum) {
          return v.ruleNum.indexOf(val) > -1
        }
        return v.code.indexOf(val) > -1
      })
    },
    checkTableOverflow () {
      let table = document.querySelector('.rule-group .table-box .el-table__body')
      let tableBox = document.querySelector('.rule-group .table-box .el-table__body-wrapper')
      let tableHeight = table && table.clientHeight
      let tableBoxHeight = tableBox && tableBox.clientHeight
      this.isTableOverflow = tableHeight > tableBoxHeight
    },
    handleCurrentChange3 (page) {
      this.currentPage3 = page
      this.display1 = this.ruleArr.slice((page - 1) * this.pageSize3, page * this.pageSize3)
      this.$nextTick(() => {
        this.checkDetailOverflow()
      })
    },
    handleSizeChange3 (pageSize) {
      this.pageSize3 = pageSize
      this.handleCurrentChange4(1)
    },
    handleCurrentChange4 (page) {
      this.currentPage4 = page
      this.display2 = this.buildinRuleArr.slice((page - 1) * this.pageSize4, page * this.pageSize4)
      this.$nextTick(() => {
        this.checkDetailOverflow()
      })
    },
    handleSizeChange4 (pageSize) {
      this.pageSize4 = pageSize
      this.handleCurrentChange4(1)
    },
    getTotal (row) {
      let buildIn = row.buildInRuleNums ? row.buildInRuleNums.length : 0
      let rules = row.ruleIds ? row.ruleIds.length : 0
      return buildIn + rules
    },
    createNewGroup () {
      this.ruleArr = []
      this.buildinRuleArr = []

      this.total3 = 0
      this.total4 = 0
      this.createForm = {
        name: '',
        code: ''
      }
      this.currentPage4 = 1
      this.pageSize4 = 10
      this.currentPage3 = 1
      this.pageSize3 = 10
      this.showDetail = true
      this.editModel = false
      this.$nextTick(() => {
        this.display1 = []
        this.display2 = []
        this.checkDetailOverflow()
      })
    },
    messageFormatter (v) {
      let rowMessage = v.message.replace(/\{(.+?)\}/g, '$')
      let rowArr = rowMessage.split('$')
      v.rowArr = _.cloneDeep(rowArr)
      for (let index in v.parameter) {
        rowArr[index - 1] = rowArr[index - 1] + ` <b>${v.parameter[index]}</b> `
      }
      v.displayMessage = rowArr.join('')
    },
    getDefaultRules () {
      this.loading2 = true
      HTTP.getDefaultRules()
        .then(res => {
          this.loading2 = false
          this.defaultRules = res
          this.defaultRulesDisplay = res
          res.sort((a, b) => a.id - b.id)
          res.forEach(v => {
            this.messageFormatter(v)
          })
        })
        .catch(err => {
          this.loading2 = false
          this.$showFailure(err)
        })
    },
    showAdd () {
      this.dialogVisible = true
      this.keyword2 = ''
      this.getEntriesSearch()
    },
    showAdd2 () {
      this.keyword3 = ''
      this.showBuildin = true
      this.getDefaultRules()
    },
    addRlue () {
      let arr = this.ruleArr.concat(this.currentCheckedRules)
      let obj = {}
      let result = []
      arr.forEach(v => {
        if (!obj[v.id]) {
          result.push(v)
          obj[v.id] = 1
        }
      })
      this.dialogVisible = false
      this.ruleArr = result.map((v, i) => { v.index = i; return v })
      this.handleCurrentChange3(this.currentPage3)
      this.$nextTick(() => {
        this.checkDetailOverflow()
      })
      this.total3 = result.length
    },
    addRlue2 () {
      let arr = _.cloneDeep(this.buildinRuleArr.concat(this.checkedBuildinRules))
      let obj = {}
      let result = []
      arr.forEach(v => {
        v.code = v.code || v.ruleNum
        if (!obj[v.code]) {
          result.push(v)
          obj[v.code] = 1
        }
      })
      this.showBuildin = false
      this.buildinRuleArr = result.map((v, i) => { v.index = i; return v })
      result.forEach(v => {
        this.messageFormatter(v)
      })
      this.handleCurrentChange4(this.currentPage4)
      this.$nextTick(() => {
        this.checkDetailOverflow()
      })
      this.total4 = result.length
    },
    deleteGroup (row) {
      this.$DatablauCofirm(`策略 “${row.name}”，是否确认删除？`, 'error')
        .then(res => {
          HTTP.delGroup(row.id)
            .then(res => {
              this.$blauShowSuccess('删除成功')
              this.getRuleGroupList()
            })
        })
    },
    deletRule (scope) {
      // this.$DatablauCofirm(`规则 “${scope.row.code}”，是否确认删除？`, 'error')
      //   .then(res => {
      this.ruleArr.splice(scope.row.index, 1)
      this.ruleArr = this.ruleArr.map((v, i) => { v.index = i; return v })
      this.handleCurrentChange3(this.currentPage3)
      if (this.display1.length === 0 && this.currentPage3 !== 1) {
        // 跳转到最后一页
        this.handleCurrentChange3(this.currentPage3 - 1)
      }
      this.$nextTick(() => {
        this.checkDetailOverflow()
      })
      this.total3 = this.ruleArr.length
      // })
    },
    deletRule2 (scope) {
      // this.$DatablauCofirm(`规则 “${scope.row.code}”，是否确认删除？`, 'error')
      //   .then(res => {
      this.buildinRuleArr.splice(scope.row.index, 1)
      this.buildinRuleArr = this.buildinRuleArr.map((v, i) => { v.index = i; return v })
      this.display2 = this.buildinRuleArr.slice((this.currentPage4 - 1) * 10, this.currentPage4 * 10)
      this.handleCurrentChange4(this.currentPage4)
      if (this.display2.length === 0 && this.currentPage4 !== 1) {
        // 跳转到最后一页
        this.handleCurrentChange4(this.currentPage4 - 1)
      }
      this.$nextTick(() => {
        this.checkDetailOverflow()
      })
      this.total4 = this.buildinRuleArr.length
      // })
    },
    handleEdit (row) {
      this.currentPage4 = 1
      this.pageSize4 = 10
      this.currentPage3 = 1
      this.pageSize3 = 10
      this.editModel = true
      this.createForm = {
        name: row.name,
        code: row.code,
        description: row.description
      }
      HTTP.getRuleGroupDetails(row.id)
        .then(res => {
          this.currentGroup = res
          let ruleArr = []
          let buildinRuleArr = []
          this.currentGroup.children.forEach(v => {
            if (v.buildIn) {
              buildinRuleArr.push(v)
            } else {
              ruleArr.push(v)
            }
          })
          this.ruleArr = ruleArr.map((v, i) => { v.index = i; return v })
          this.display1 = this.ruleArr.slice((1 - 1) * 10, 1 * 10)
          this.total3 = ruleArr.length
          this.buildinRuleArr = buildinRuleArr.map((v, i) => { v.index = i; return v })
          buildinRuleArr.forEach(v => {
            this.messageFormatter(v)
          })
          this.display2 = this.buildinRuleArr.slice((1 - 1) * 10, 1 * 10)
          this.total4 = buildinRuleArr.length
          this.showDetail = true
          this.$nextTick(() => {
            this.checkDetailOverflow()
          })
        })
    },
    closeDetail () {
      this.createForm = {
        name: '',
        code: ''
      }
      this.currentGroup = {
        children: []
      }
      this.currentCheckedRules = []
      this.getRuleGroupList()
      this.showDetail = false
    },
    submit (bool) {
      this.createGroup(bool)
    },
    createGroup (closeDialog) {
      this.loading2 = true
      let requestBody = {
        name: this.createForm.name,
        code: this.createForm.code,
        description: this.createForm.description,
        ruleIds: this.ruleArr.map(v => v.id),
        buildInRuleNums: this.buildinRuleArr.map(v => v.code)
      }
      let request = null
      if (!this.editModel || closeDialog) {
        request = HTTP.createGroup
      } else {
        request = HTTP.updateGroup
        requestBody.id = this.currentGroup.id
      }
      request(requestBody)
        .then(res => {
          if (closeDialog) {
            this.$blauShowSuccess('添加规则成功')
            this.dialogVisible = false
            this.currentGroup.children = res.children
            let ruleArr = []
            let buildinRuleArr = []
            if (v.buildIn) {
              buildinRuleArr.push(v)
            } else {
              ruleArr.push(v)
            }
            this.ruleArr = ruleArr.map((v, i) => { v.index = i; return v })
            this.buildinRuleArr = buildinRuleArr.map((v, i) => { v.index = i; return v })
            buildinRuleArr.forEach(v => {
              this.messageFormatter(v)
            })
            this.display1 = this.ruleArr.slice((1 - 1) * 10, 1 * 10)
            this.total3 = ruleArr.length
            this.display2 = this.buildinRuleArr.slice((1 - 1) * 10, 1 * 10)
            this.total4 = buildinRuleArr.length
            this.$nextTick(() => {
              this.checkDetailOverflow()
            })
          } else {
            this.$blauShowSuccess('策略保存成功')
            this.closeDetail()
          }
          this.loading2 = false
        })
        .catch(e => {
          this.loading2 = false
          this.$showFailure(e)
        })
    },
    handleSelectionChange (val) {
      this.currentCheckedRules = val
    },
    handleSelectionChange2 (val) {
      this.checkedBuildinRules = val
    },
    getEntriesSearch () {
      this.loading2 = true
      let requestBody = {
        size: this.pageSize2,
        page: this.currentPage2,
        keyword: _.trim(this.keyword2)
      }
      HTTP.getEntriesSearch({
        requestBody: requestBody,
        successCallback: (data) => {
          this.loading2 = false
          this.ruleList = data.content
          this.total2 = data.totalElements
        },
        failureCallback: (e) => {
          this.loading2 = false
          this.$showFailure(e)
        }
      })
    },
    handleSizeChange (val) {
      this.currentPage = 1
      this.pageSize = val
      this.getRuleGroupList()
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this.getRuleGroupList()
    },
    handleSizeChange2 (val) {
      this.currentPage2 = 1
      this.pageSize2 = val
      this.getEntriesSearch()
    },
    handleCurrentChange2 (val) {
      this.currentPage2 = val
      this.getEntriesSearch()
    },
    checkDetailOverflow () {
      let box = document.querySelector('.rule-group .detail .box')
      let scrollHeight = box.scrollHeight
      let boxHeight = box && box.clientHeight
      // console.log(box.scrollHeight, boxHeight, 'top')
      this.isDetailOverflow = scrollHeight > boxHeight
    },
    getRuleGroupList () {
      this.loading = true
      let { keyword, currentPage, pageSize } = this
      HTTP.getRuleGroupList({
        keyword,
        currentPage,
        pageSize
      })
        .then(res => {
          this.loading = false
          this.tableList = res.content
          this.total = res.totalElements
          const maxPage = Math.ceil(this.total / this.pageSize) || 1

          // 判断是否超出最大页数
          if (this.currentPage > maxPage) {
            this.currentPage = maxPage
            this.getRuleGroupList()
          }

          this.$nextTick(() => {
            this.checkTableOverflow()
          })
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
    handleSearch () {
      this.currentPage = 1
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.getRuleGroupList()
      }, 300)
    },
    handleSearch2 () {
      this.currentPage2 = 1
      clearTimeout(this.timer2)
      this.timer2 = setTimeout(() => {
        this.getEntriesSearch()
      }, 300)
    }
  }
  // watch: {
  //   total (val) {
  //     console.log(val, 11)
  //   },
  //   total2 (val) {
  //     console.log(val, 12)
  //   },
  //   total3 (val) {
  //     console.log(val, 13)
  //   },
  //   total4 (val) {
  //     console.log(val, 14)
  //   }
  // }

}
</script>
<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';

.rule-group {
  position: absolute;
  left: 20px;
  right: 20px;
  top: 0;
  bottom: 20px;

  .top-header-info-panel-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    padding-left: 0px;
    line-height: 40px;
    height: 40px;
  }
}

.box {
  position: absolute;
  top: 52px;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
  padding: 0 20px;
}

.rule-group /deep/ .is-block {
  padding-left: 10px;
  padding-right: 10px;
}

.rule-group /deep/ .text.is-block {
  padding-left: 4px;
  padding-right: 4px;
}

/deep/ .el-form-item__error {
  padding-top: 0;
  top: 90%;
}

.datablau-input /deep/ textarea {
  font-size: 12px;
}

.el-form.db-form .el-form-item {
  margin-bottom: 5px;
}

/deep/ .el-form-item__label {
  font-size: 12px;
}

.iconfont.important {
  /deep/ &::before {
    margin-right: 6px;
  }
}

.iconfont.normal {
  /deep/ &::before {
    margin-right: 6px;
  }
}

.shadow {
  border-top: unset;
  box-shadow: 0px -3px 4px 0px rgba(85, 85, 85, 0.1);
}

.circle {
  display: inline-block;
  min-width: 22px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  background: rgba(245, 245, 245, 1);
  color: #555;
  border-radius: 11px;
}

.db-breadcrumb {
  position: absolute;
  top: 0px;
  left: 20px;
  right: 20px;
  background: #fff;
  z-index: 9;
}

.type-box {
  display: inline-block;
  width: 60px;
  height: 22px;
  border-radius: 2px;
  background: rgba(0, 136, 153, .1);
  color: #008899;
  text-align: center;
  line-height: 22px;

  &.a80000004, &.a80500008 {
    background: rgba(0, 149, 217, .1);
    color: #0095D9;
  }

  &.a80000006 {
    background: rgba(75, 92, 196, .1);
    color: #4B5CC4;
  }

  &.a80000005 {
    background: rgba(180, 76, 151, .1);
    color: #B44C97;
  }

  // 业务对象, 模型
  &.a80100073, &.a80010001 {
    background: rgba(64, 158, 255, .1);
    color: $primary-color;
  }
}
    .severity {
      .dot {
        display: inline-block;
        margin-right: 6px;
        width: 10px;
        height: 10px;
        &.WARN {
          background: #FF8632;
        }
        &.ERROR {
          background: #FF2E2E;
        }
        &.INFO {
          background: #FFC009;
        }
      }
    }
    /deep/ .el-textarea .el-input__count {
      line-height: 14px;
      height: 14px;
    }
    .reset {
      height: unset;
    }
    .page-box {
      padding: 8px 0px;
    position: relative;
    // border-top: 1px solid #ddd;
    z-index: 9;
    background-color: #fff;
    }

    .db-breadcrumb {
      padding-top: 8px;
      height: 42px;
      border-bottom: 1px solid #ddd;
    }
    /deep/ .is-block {
      padding-left: 4px;
      padding-right: 4px;
    }
    /deep/ .el-table__fixed-right::before {
      display: none;
    }
    .detail {
      position: absolute;
      top: 0px;
      right: -20px;
      bottom: -20px;
      left: -20px;
      background-color: #fff;
      z-index: 9;

      /deep/ .datablau-input[type='textarea'] {
        width: 800px;
        height: 68px;
      }

      .el-form .is-block {
        position: absolute;
        top: 158px;
        right: 0;
      }

      .rule-table {
        // position: absolute;
        // top: 200px;
        // right: 0;
        // bottom: 30px;
        // left: 0;
      }
    }

//.rule-group {
//    position: relative;
//    height: 100%;
//}
.tool {
  height: 34px;

  .is-block {
    float: right;
  }
}

.table-box {
  position: absolute;
  top: 73px;
  right: 0;
  left: 0;
  bottom: 40px;
  // .db-table {
  //   height: 100%;
  // }
}

.rule-group /deep/ {
  .el-pagination {
    text-align: right;
  }

  // .el-pagination__total {
  //   float: left;
  // }
}

.el-dialog__footer .datablau-pagination {
  position: absolute;
  left: 20px;
  bottom: 20px;
}

.table-box2 {
  position: absolute;
  top: 44px;
  right: 20px;
  bottom: 30px;
  left: 20px;
}

.rule-group-content {
  .datablau-pagination {
    position: absolute;
    right: 20px;
    bottom: 10px;
  }
}

.bottom-row {
  position: absolute;
  bottom: 0px;
  left: 0px;
  right: 8px;
  z-index: 9;
  border-top: 1px solid #ddd;
  padding: 10px 20px;
  background: #fff;

  &.shadow {
    border-top: unset;
    box-shadow: 0px -3px 4px 0px rgba(85, 85, 85, 0.1);
  }
}

.textarea-no-resize /deep/ .el-textarea .el-textarea__inner {
  resize: none;
  height: 92px;
}
</style>
<style lang="scss">
.datablau-dialog-content {
  position: relative;
}

.build-in-rules-dialog {
  .dialog-content {
    //overflow: auto;
    position: relative;
    height: 469px;

    .build-in-rules-list {
      position: absolute;
      left: 0;
      right: 0;
      top: 40px;
      bottom: 0px;
    }
  }
}
</style>
