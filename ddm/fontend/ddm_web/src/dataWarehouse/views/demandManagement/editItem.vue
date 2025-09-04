<template>
  <div style="padding: 0 20px">
    <datablau-dialog
      :title="messageTitle"
      :visible.sync="showMessage"
      :close-on-click-modal="true"
      append-to-body
      width="1000px"
      height="486px"
    >
      <add-message
        v-if="showMessage"
        :readOnly="readOnly"
        @submitMessage="submitMessage"
        @close="closeMessage"
        :message="message"
      ></add-message>
    </datablau-dialog>
    <div class="row-header">
      <datablau-breadcrumb
        @back="back"
        :node-data="nodeData"
        separator="/"
      ></datablau-breadcrumb>
    </div>
    <datablau-form-submit
      style="position: absolute; top: 50px; left: 0; right: 0; bottom: 0"
    >
      <div style="padding: 10px 20px">
        <el-form
          class="page-form multiple-column"
          inline
          label-position="right"
          label-width="10em"
          :rules="formRules"
          ref="form"
          :model="formData"
        >
          <div class="part-title" style="margin-bottom: 20px">
            需求信息
          </div>
          <div>
            <el-form-item
              :label="$t('system.systemSetting.dir')"
              prop="categorys"
            >
              <el-cascader
                clearable
                v-model="formData.categorys"
                :options="options"
                filterable
                :props="{ checkStrictly: true }"
                @change="categoryChange"
                ref="cascader"
                :disabled="!iscreate?!auth['DDD_DEMAND_BUSINESS_EDIT']:false"
              ></el-cascader>
              <!-- <datablau-cascader
                expand-trigger="click"
                :options="options ? options : []"
                :change-on-select="true"
                :emit-path="false"
                :props="defaultProps2"
                v-model="formData.categorys"
              ></datablau-cascader> -->
            </el-form-item>
            <el-form-item
              :label="$t('indicator.demand.code')"
              prop="requirementCode"
              v-if="!iscreate"
            >
              {{ formData.requirementCode }}
            </el-form-item>
            <br />
            <el-form-item :label="$t('indicator.demand.name')" prop="name">
              <datablau-input
                maxlength="200"
                v-model="formData.name"
                :disabled="!iscreate?!auth['DDD_DEMAND_BUSINESS_EDIT']:false"
              ></datablau-input>
            </el-form-item>
            <el-form-item
              label="优先级别"
              prop="requirementPriority"
            >
              <datablau-select v-model="formData.requirementPriority"  :disabled="!iscreate?!auth['DDD_DEMAND_BUSINESS_EDIT']:false">
                <el-option
                  v-for="item in priorityOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item label="类型" prop="module">
              <datablau-select v-model="formData.module" :disabled="!iscreate?!auth['DDD_DEMAND_BUSINESS_EDIT']:false">
                <el-option
                  label="D3"
                  value="D3"
                ></el-option>
                <!-- <el-option
                  :label="$t('indicator.demand.维度')"
                  value="维度"
                ></el-option>
                <el-option
                  :label="$t('indicator.demand.指标')"
                  value="指标"
                ></el-option> -->
              </datablau-select>
            </el-form-item>
            <!-- <el-form-item
              label="负责人"
              prop="requirementLeader"
            >
              <datablau-input
                v-model="formData.requirementLeader"
                :disabled="!iscreate?!auth['DEMAND_BUSINESS_EDIT']:false"
                readonly
              ></datablau-input>
              <datablau-button
                type="text"
                @click="setOwner('requirementLeader')"
                :disabled="!iscreate?!auth['DEMAND_BUSINESS_EDIT']:false"
              >
                {{ $t('meta.DS.tableDetail.security.set') }}
              </datablau-button>
            </el-form-item> -->
            <br />
            <el-form-item label="日期" >
              <datablau-datePicker
                @changeDateTime="changeEventStartTime"
                v-model="formData.requirementDate"
                :placeholder="'选择日期'"
                value-format="timestamp"
                type="date"
                ref="eventStartTime"
                :disabled="!iscreate?!auth['DDD_DEMAND_BUSINESS_EDIT']:false"
              ></datablau-datePicker>
            </el-form-item>
            <br />
            <el-form-item
              :label="$t('indicator.demand.description')"
              prop="requirementDescription"
            >
              <mavon-editor
              v-if="iscreate ? true : auth['DDD_DEMAND_BUSINESS_EDIT']"
                style="height: 300px; width: 100%"
                :toolbars="toolbars"
                :subfield="false"
                v-model="formData.requirementDescription"
              />
              <mavon-editor
                v-else
                :defaultOpen="'preview'"
                :toolbarsFlag="false"
                :editable="false"
                :scrollStyle="true"
                :subfield="false"
                :toolbars="toolbars"
                style="height: 300px; width:100%"
                v-model="formData.requirementDescription"
              />
              <!-- <datablau-input
                v-model="formData.requirementDescription"
                type="textarea"
                :rows="4"
              ></datablau-input> -->
            </el-form-item>
            <!-- <el-form-item label="附件" prop="enclosureId" class="width">
              <documents
                :content="jobDetails"
                :key="documentKey"
                v-if="haveDocument"
              ></documents>
            </el-form-item> -->
            <div
              class="part-title"
              style="margin-bottom: 20px; margin-top: 20px"
            >
              {{ $t('quality.page.dataQualityRepairJob.table.enclosure') }}
            </div>
            <documents
              :content="jobDetails"
              :key="documentKey"
              :iscreate="iscreate"
              v-if="haveDocument"
            ></documents>
          </div>
          <div v-if="!iscreate">
            <div class="part-title" style="margin-bottom: 20px">
              技术信息
            </div>
            <el-form-item label="预计完成" prop="doneTime" :rules="auth['DDD_DEMAND_TECH_EDIT'] ? formRules.doneTime: [{required: false}]">
                <datablau-datePicker
                :disabled="!auth['DDD_DEMAND_TECH_EDIT']"
                :now-before-state="true"
                  @changeDateTime="changedoneTime"
                  v-model="formData.doneTime"
                  :placeholder="'选择日期'"
                  value-format="timestamp"
                  type="date"
                  ref="doneTime"
                ></datablau-datePicker>
            </el-form-item>
            <el-form-item
                label="负责人"
                prop="techDirector"
                :rules="auth['DDD_DEMAND_TECH_EDIT'] ? formRules.techDirector: [{required: false}]"
              >
                <datablau-input
                :disabled="true"
                  v-model="formData.techDirector"
                  readonly
                ></datablau-input>
                <!-- <datablau-button
                  type="text"
                  @click="setOwner('techDirector')"
                  :disabled="!auth['DEMAND_TECH_EDIT']"
                >
                  {{ $t('meta.DS.tableDetail.security.set') }}
                </datablau-button> -->
            </el-form-item>
              <br />
              <el-form-item
                label="技术描述"
                prop="techDescription"
              >
                <mavon-editor
                v-if="auth['DDD_DEMAND_TECH_EDIT']"
                  style="height: 300px; width: 100%"
                  :toolbars="toolbars"
                  :subfield="false"
                  v-model="formData.techDescription"
                />
                <mavon-editor
                v-else
                :defaultOpen="'preview'"
                :toolbarsFlag="false"
                :editable="false"
                :scrollStyle="true"
                :subfield="false"
                :toolbars="toolbars"
                style="height: 300px; width: 100%"
                v-model="formData.techDescription"
              />
                <!-- <datablau-input
                  v-model="formData.requirementDescription"
                  type="textarea"
                  :rows="4"
                ></datablau-input> -->
              </el-form-item>
          </div>
        </el-form>

        <div v-if="!iscreate">
          <meta-selector
            ref="metaSelector"
            :dialog-title="$t('indicator.demand.select')"
            type="column"
            @select="handleMetaSelect"
            :key="selectKey"
          ></meta-selector>
          <div class="part-title" style="margin-top: 20px">
            关联数据项
            <datablau-button
              type="important"
              class="iconfont icon-tianjia"
              style="float: right; margin-bottom: 10px"
              @click="addMessage"
              :disabled="!auth['DDD_DEMAND_TECH_EDIT']"
            >
              {{ $t('indicator.demand.addItem') }}
            </datablau-button>
          </div>
          <div class="table-area">
            <datablau-table :data="tableData">
              <el-table-column
                min-width="120"
                :label="$t('assets.generalSettings.object')"
                prop="dataItem"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.dataItem }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                :label="$t('indicator.demand.analysisProps.description')"
                prop="businessDescription"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.businessDescription }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                :label="$t('common.page.modelCategory')"
                prop="systemName"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.systemName }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                :label="$t('meta.report.dbs')"
                prop="dataDatabase"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.dataDatabase }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="140"
                label="SCHEMA"
                prop="dataSchema"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.dataSchema }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                :label="$t('meta.report.table')"
                prop="dataTable"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.dataTable }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                :label="
                  $t('quality.page.qualityExamineJob.displayRules.columnName')
                "
                prop="dataColumnName"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.dataColumnName }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                :label="$t('domain.code.fieldCName')"
                prop="dataColumnChName"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.dataColumnChName }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                :label="$t('meta.DS.treeSubOperation.columnType')"
                prop="columnType"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.columnType }}
                </template>
              </el-table-column>
              <!-- <el-table-column
                min-width="120"
                label="是否必填"
                prop="dataRequired"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.dataRequired ? '是' : '否' }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                label="字段描述"
                prop="columnDescription"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.columnDescription }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                label="对应类型"
                prop="columnType"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.columnType }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                label="对应编码"
                prop="columnCode"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.columnCode }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                label="对应标准项"
                prop="columnStandard"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.columnStandard }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                label="推荐标准/指标"
                prop="recommendedStandards"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.recommendedStandards }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                label="是否执行"
                prop="columnExecute"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.columnExecute ? '是' : '否' }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                label="不执行原因"
                prop="noExecuteReason"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.noExecuteReason }}
                </template>
              </el-table-column> -->
              <el-table-column
                :label="$t('quality.page.qualityRule.table.operation')"
                min-width="180"
                fixed="right"
                align="center"
              >
                <template slot-scope="scope">
                  <!-- <datablau-button type="text" @click="itemClick(scope.row)">
                    <span>查看</span>
                  </datablau-button> -->
                  <datablau-button type="text" @click="editClick(scope.row)"  :disabled="!auth['DDD_DEMAND_TECH_EDIT']">
                    <span>{{ $t('common.button.edit') }}</span>
                  </datablau-button>
                  <datablau-button type="text" @click="deleteClick(scope.row)"  :disabled="!auth['DDD_DEMAND_TECH_EDIT']">
                    <span>{{ $t('common.button.delete') }}</span>
                  </datablau-button>
                </template>
              </el-table-column>
            </datablau-table>
          </div>
          <div class="part-title" style="margin-top: 20px" v-if="formData.module === 'D3'">
            关联工作流
          </div>
          <div style="position: relative;" v-if="formData.module === 'D3'">
            <div class="table-area" style="position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              height: 300px;">
              <datablau-table ref="workflowTable" :data="workflowTableData" height="100%" data-selectable  @selection-change="handleSelectionWorkflow">
                <el-table-column
                  type="index"
                  width="50">
                </el-table-column>
                <el-table-column
                  label="工作流名称"
                  prop="name"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ scope.row.name }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="状态"
                  prop="releaseState"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ scope.row.releaseState === 'ONLINE' ? '上线' : '下线' }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="创建时间"
                  prop="createTime"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ scope.row.createTime }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="更新时间"
                  prop="updateTime"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ scope.row.updateTime }}
                  </template>
                </el-table-column>
              </datablau-table>
            </div>
          </div>
        </div>
      </div>
      <div style="height: 100px"></div>
      <div slot="buttons" class="page-btn-group left-bottom" style="margin: 0">
        <datablau-button type="important" @click="onSubmit">
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button type="secondary" @click="back">
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </div>
    </datablau-form-submit>
  </div>
</template>
<script>
import HTTP from '@/resource/http'
import documents from './documents.vue'
import addMessage from './addMessage.vue'
import axios from 'axios'
import MetaSelector from './metaSelector.vue'
export default {
  components: {
    documents,
    addMessage,
    MetaSelector
  },
  props: {
    iscreate: {
      type: Boolean,
      required: false
    },
    id: {
      type: [Number, String],
      required: false
    },
    categoryId: {
      type: Number,
      required: false
    }
  },
  data () {
    return {
      defaultProps2: {
        value: 'id',
        children: 'subNodes',
        label: 'name'
      },
      nodeData: [
        {
          name: this.$t('common.page.requireManage'),
          couldClick: false
        },
        {
          name: this.$t('indicator.demand.addDemand')
        }
      ],
      haveDocument: false,
      documentKey: 1,
      showMessage: false,
      showSelect: false,
      messageTitle: this.$t('indicator.demand.scanItem'),
      formData: {
        requirementLeader: '',
        categorys: [],
        requirementPriority: 3,
        requirementStauts: 'A',
        // module:'维度',
        dmndType: this.$t('indicator.demand.type.新增'),
        // name:'djw测试需要，请先不要改动'
        requirementDescription: `业务场景描述
--------------------------------------
1.
2.
3.
数据需求描述
--------------------------------------
1.
2.
3.
验收标准描述
--------------------------------------
1.
2.
3.`,
        requirementDate: '',
        techDirector: '',
        doneTime: '',
        techDescription: `技术方案描述
--------------------------------------
1.
2.
3.
计划输出描述
--------------------------------------
1.
2.
3.`
      },
      formRules: {
        categorys: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull')
        },
        name: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull')
        },
        requirementPriority: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull')
        },
        dmndType: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull')
        },
        requirementLeader: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull')
        },
        requirementStauts: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull')
        },
        module: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull')
        },
        doneTime: {
          required: true,
          trigger: 'blur',
          message: this.$t('indicator.demand.notNull')
        },
        techDirector: {
          required: true,
          trigger: 'blur',
          message: this.$t('indicator.demand.notNull')
        }
      },
      // tableData: [
      //   {
      //     columnCode: '对应编码',
      //     columnDescription: '字段描述',
      //     columnExecute: true,
      //     columnStandard: '对应标准项',
      //     columnType: '对应类型',
      //     dataColumnName: '字段名称',
      //     dataDatabase: '数据库',
      //     dataDelete: '是否被删除',
      //     dataRequired: true,
      //     dataSchema: 'SCHEMA',
      //     dataTable: '表',
      //     id: 1,
      //     noExecuteReason: '不执行原因',
      //     recommendedStandards: '推荐标准/指标',
      //     systemName: '系统名称',
      //   },
      // ],
      tableData: [],
      jobDetails: {},
      message: {},
      readOnly: false,
      toolbars: {
        bold: true, // 粗体
        italic: true, // 斜体
        header: true, // 标题
        underline: true, // 下划线
        strikethrough: true, // 中划线
        mark: true, // 标记
        superscript: true, // 上角标
        subscript: true, // 下角标
        quote: true, // 引用
        ol: true, // 有序列表
        ul: true, // 无序列表
        link: false, // 链接
        imagelink: false, // 图片链接
        code: true, // code
        table: true, // 表格
        fullscreen: false, // 全屏编辑
        readmodel: true, // 沉浸式阅读
        htmlcode: true, // 展示html源码
        help: false, // 帮助
        /* 1.3.5 */
        undo: true, // 上一步
        redo: true, // 下一步
        trash: true, // 清空
        save: false, // 保存（触发events中的save事件）
        /* 1.4.2 */
        navigation: true, // 导航目录
        /* 2.1.8 */
        alignleft: true, // 左对齐
        aligncenter: true, // 居中
        alignright: true, // 右对齐
        /* 2.2.1 */
        subfield: false, // 单双栏模式
        preview: true // 预览
      },
      // 需求状态
      stautsOptions: [
        {
          value: 'A',
          label: this.$t('indicator.demand.stateOption.A')
        },
        {
          value: 'R',
          label: this.$t('indicator.demand.stateOption.R')
        },
        {
          value: 'C',
          label: this.$t('indicator.demand.stateOption.C')
        },
        {
          value: 'D',
          label: this.$t('indicator.demand.stateOption.D')
        }
        // {
        //   value: 'E',
        //   label: '已拒绝',
        // },
      ],
      // 需求优先级
      priorityOptions: [
        {
          value: 0,
          label: 'p1'
        },
        {
          value: 1,
          label: 'p2'
        },
        {
          value: 3,
          label: 'p3'
        }
      ],
      // 所属目录
      options: [
        {
          value: '0',
          label: '目录1',
          children: [
            {
              value: '1',
              label: '目录2',
              children: [
                {
                  value: '2',
                  label: '目录3'
                }
              ]
            }
          ]
        }
      ],
      // 目录列表
      treeList: [],
      categoryArr: [],
      createMessage: true,
      messageId: 1,
      details: null,
      tableLabelArray: ['', ''],
      formRules2: {},
      selectKey: 1,
      auth: this.$store.state.$auth,
      workflowTableData: [],
      workflowCodeList: []
    }
  },
  beforeMount () {},
  mounted () {
    this.init()
  },
  computed: {
    tableLabel () {
      return this.tableLabelArray.filter(i => i).join(' / ')
    }
  },
  methods: {
    handleSelectionWorkflow (val) {
      // val.forEach(element => {
      //   this.workflowCode.push(element.code)
      // })
      this.workflowCodeList = val
    },
    getWorkflowList (projectId) {
      this.$http
        .post(this.$dddUrl + `/service/workflow/${projectId}/list?isPublish=1`)
        .then(res => {
          this.workflowTableData = res.data.data
          this.$nextTick(() => {
            if (this.formData.workflowCode && this.formData.workflowCode.length > 0) {
              this.workflowTableData.forEach(row => {
                this.formData.workflowCode.forEach(selected => {
                  if (selected === row.code) {
                    this.$refs.workflowTable.toggleRowSelection(row, true)
                  }
                })
              })
            }
          })
        }).catch(e => {
          this.$showFailure(e)
        })
    },
    changedoneTime (val) {
      this.formData.doneTime = val
    },
    changeEventStartTime (val) {
      this.formData.requirementDate = val
    },
    init () {
      this.getTreeData()
      if (this.id) {
        this.getTreeList()
        setTimeout(() => {
          this.getFormData()
        }, 200)
        // this.getFormData()
        this.getTableData()
      } else {
        this.haveDocument = true
        if (this.categoryId && this.categoryId != null) {
          this.getTreeList()
          setTimeout(() => {
            let categorys = this.sortCategory(this.categoryId).splice(1)
            this.$set(this.formData, 'categorys', categorys)
          }, 400)
        }
      }
    },
    back () {
      this.$emit('back')
    },
    // 设置数据源
    setTable () {
      this.$refs.metaSelector.init()
    },
    handleMetaSelect ({ model, table, column }) {
      // this.tableId = table.objectId
      // this.tableName = table.name
      // this.modelName = model.name
      this.tableLabelArray = [model.name, table.physicalName]
      this.message = {
        businessDescription: '',
        columnType: column.type,
        dataColumnChName: column.logicalName,
        dataColumnName: column.physicalName,
        dataDatabase: model.name,
        dataItem: '',
        dataSchema: table.schema,
        dataTable: table.physicalName,
        systemName: model.categoryName
      }
      this.showMessage = true
    },
    goMessage () {
      this.showSelect = false
      this.showMessage = true
    },
    //
    categoryChange (val) {
      this.formData.categorys = val
    },
    treeSort (root) {
      let t = root.subNodes
      if (t) {
        t.forEach(item => {
          item.value = item.id
          item.label = item.name
          if (item.subNodes) {
            item.children = item.subNodes
            this.treeSort(item)
          }
        })
      }
      return t
    },
    // 获取目录树
    getTreeData () {
      let url = `${HTTP.$domains}categories/tree?type=82800021`
      this.$http
        .post(url)
        .then(res => {
          console.log(res.data, 'res.data')
          if (res.data.subNodes[0] && res.data.subNodes[0].subNodes) {
            this.options = this.treeSort(res.data.subNodes[0])
          } else {
            this.options = []
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
      // setTimeout(() => {
      //   this.treeData = this.TREE_DATA
      // }, 1000)
    },
    // 获取目录列表
    getTreeList () {
      let url = `${HTTP.$domains}categories/get?type=82800021`
      this.$http
        .post(url)
        .then(res => {
          this.treeList = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 筛选目录
    sortCategory (id) {
      this.categoryArr.unshift(id)
      if (Array.isArray(this.treeList)) {
        let c = this.treeList.filter(item => item.categoryId === id)[0]
        if (c.parentId) {
          this.sortCategory(c.parentId)
        }
      }
      return this.categoryArr
    },
    // 获取详情
    getFormData () {
      let url = `${HTTP.$domains}requirementmanagement/get?id=${this.id}`
      this.$http
        .post(url)
        .then(res => {
          if (res.data.projectId) {
            this.getWorkflowList(res.data.projectId)
          }
          this.formData = res.data
          this.nodeData = [
            {
              name: this.$t('common.page.requireManage'),
              couldClick: false
            },
            {
              name: this.formData.name
            }
          ]
          let categorys = this.sortCategory(res.data.categoryId).splice(1)
          this.$set(this.formData, 'categorys', categorys)
          // 处理附件信息
          if (
            Array.isArray(this.formData.enclosureId) &&
            this.formData.enclosureId.length > 0
          ) {
            let documents = []
            this.formData.enclosureId.forEach(item => {
              documents.push({ uuid: item })
            })
            this.jobDetails.documents = documents
            this.haveDocument = true
          } else {
            this.haveDocument = true
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 获取信息分析的信息
    getTableData () {
      if (this.id) {
        let url = `${HTTP.$domains}requirementmanagement/requirementdataobject/get/list`
        const request = axios.create({
          headers: {
            'Content-Type': 'application/json'
          }
        })
        request.post(url, this.id).then(res => {
          this.tableData = res.data
        })
      }
    },
    // 提交需求（创建修改）
    onSubmit () {
      // return
      this.$refs.form.validate(valid => {
        if (!valid) {
          this.$blauShowFailure(this.$t('domain.common.requiredIsNull'))
          return false
        } else {
          // 添加附件id
          if (
            this.jobDetails.documents &&
            this.jobDetails.documents.length > 0
          ) {
            this.formData.enclosureId = this.jobDetails.documents.map(
              item => item.uuid
            )
          } else {
            this.formData.enclosureId = []
          }
          // 提取选择的目录ID
          this.formData.categoryId =
            this.formData.categorys[this.formData.categorys.length - 1]
          // this.formData.category='/'+this.$refs['cascader'].getCheckedNodes()[0].pathLabels.join('/');
          let url = ''
          let body = this.formData
          this.formData.requirementLeader = this.$store.state.user.name
          if (this.iscreate) {
            // 新建需求
            url = `${HTTP.$domains}requirementmanagement/create`
            body.requirementEditor = this.$store.state.user.name
            body.requirementCreatTime = new Date().getTime()
          } else {
            if (this.$route.query.applyChange) {
              url = `${HTTP.$domains}requirementmanagement/apply/change`
            } else {
              url = `${HTTP.$domains}requirementmanagement/update`
            }
            // 修改需求
            if (this.formData.module === 'D3') {
              body.workflowCode = []
              this.workflowCodeList.forEach(element => {
                body.workflowCode.push(element.code)
              })
            }
          }
          this.$http
            .post(url, body)
            .then(res => {
              this.details = res.data
              // 提交需求分析
              let requirementId = res.data.id
              let url = `${HTTP.$domains}requirementmanagement/requirementdataobject/maintain?requirementId=${requirementId}`
              let body = []
              if (Array.isArray(this.tableData) && this.tableData.length > 0) {
                body = this.tableData.map(item => {
                  item.requirementId = requirementId
                  return item
                })
              }
              return this.$http.post(url, body)
            })
            .then(res => {
              this.back()
              let data = { id: this.categoryId }
              this.$bus.$emit('updateRequirementItem2', data)
              this.$emit('goDetails', this.details)
              this.$message.success(
                this.$t('quality.page.qualityExamineJob.operationSucceed')
                // this.iscreate ? '新建需求成功' : '修改需求成功'
              )
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      })
    },
    // 点击添加信息项
    addMessage () {
      // this.showMessage=true;
      this.messageTitle = this.$t('indicator.demand.addItemBasic')
      this.message = ''
      // this.showMessage = true
      // this.showSelect = true
      this.readOnly = false
      this.createMessage = true
      this.tableLabelArray = []
      this.selectKey++
      setTimeout(() => {
        this.setTable()
      }, 200)
    },
    // 提交信息项
    submitMessage (message) {
      // 新增信息项
      if (this.createMessage) {
        message.messageId = '虚拟Id:' + this.messageId
        this.messageId++
        this.tableData.unshift(message)
        this.$message.success(
          this.$t('quality.page.qualityExamineJob.operationSucceed')
        )
      } else {
        // 修改信息项
        if (Array.isArray(this.tableData) && this.tableData.length > 0) {
          if (message.messageId) {
            this.tableData = this.tableData.filter(
              item => item.messageId !== message.messageId
            )
          } else {
            this.tableData = this.tableData.filter(
              item => item.id !== message.id
            )
          }
          this.tableData.unshift(message)
          this.$message.success(
            this.$t('quality.page.qualityExamineJob.operationSucceed')
          )
        }
      }
    },
    // 关闭
    closeMessage () {
      this.showMessage = false
    },
    // 查看
    itemClick (row) {
      this.showMessage = true
      this.readOnly = true
      this.messageTitle = this.$t('indicator.demand.scanItem')
      this.message = row
    },
    // 编辑
    editClick (row) {
      this.showMessage = true
      this.readOnly = false
      this.message = row
      this.messageTitle = this.$t('indicator.demand.editItem')
      this.createMessage = false
    },
    // 删除
    deleteClick (row) {
      this.$DatablauCofirm(
        this.$t('assets.permissionSettings.confirmDelete'),
        this.$t('assets.permissionSettings.hint'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok')
        }
      )
        .then(() => {
          if (row.messageId) {
            this.tableData = this.tableData.filter(
              item => item.messageId !== row.messageId
            )
          } else {
            this.tableData = this.tableData.filter(item => item.id !== row.id)
          }
          this.$message.success(this.$t('assets.permissionSettings.delSuccess'))
        })
        .catch(e => {
          // this.$showFailure(e)
        })
    },
    setOwner (property) {
      this.$utils.staffSelect.open([], true).then(res => {
        this.$set(this.formData, property, res[0].username)
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.row-header {
  padding: 10px 0 8px;
  border-bottom: 1px solid $border-color;
}
.part-title {
  // border-left: 4px solid $primary-color;
  // margin-bottom: 12px;
  // margin-top: 10px;
  // padding-left: 6px;
  // color: $text-default;
  // font-size: 14px;
  position: relative;
  padding-left: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  &::before {
    position: absolute;
    top: 4px;
    left: 0;
    width: 4px;
    height: 14px;
    content: '';
    background: #409eff;
    border-radius: 1px;
  }
}
</style>
<style lang="scss">
// .dropdown{

// }
.op-icon.dropdown-wrapper.dropdown{
  overflow: visible !important;
}
.el-form.page-form {
  // overflow-x: hidden;

  .el-select,
  .el-cascader,
  .el-input {
    width: 300px;
  }

  textarea {
    width: 900px;
  }

  &.thin-textarea {
    padding: 1px;
    margin-top: 0;
    overflow-y: hidden;

    textarea {
      width: 530px;
    }

    @media (min-width: 1366px) {
      textarea {
        width: 700px;
      }
    }

    @media (min-width: 1666px) {
      textarea {
        width: 1000px;
      }
    }
  }

  .el-form-item__label {
    padding: 0 10px 0 0;
    font-size: 12px;
  }

  .el-input__inner {
    height: 34px;
    border-radius: 2px;
  }

  textarea {
    border-radius: 2px;
  }
}
.multiple-column {
  .el-form-item {
    min-width: 532px;
    margin-bottom: 15px;
    &:nth-of-type(odd) {
      margin-right: 100px;
      /*outline: 1px solid indianred;*/
    }
    margin-right: 100px;
  }
  .el-form-item__error {
    padding-top: 0;
  }
  .width {
    width: 80%;
    .el-form-item__content {
      width: 80%;
    }
  }
}
</style>
