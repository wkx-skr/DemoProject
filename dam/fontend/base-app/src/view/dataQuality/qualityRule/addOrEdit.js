// import standardCode from '../../newDataStandard/standardCode.vue'
import HTTP from '@/http/main.js'
import listInRule from '@/components/systemManagement/systemSetting/listInRule.vue'
import standardSelector from '../../dataProperty/meta/standardSelector.vue'
import _, { forEach, lowerCase } from 'lodash'
export default {
  name: 'addOrEdit',
  props: {
    nameList: {},
    ruleDataObj: {},
    isSee: {},
    hasUnclosedTask: {},
    auth: {},
    currentBusinessRule: {
      required: false,
    },
  },
  components: {
    // standardCode,
    listInRule,
    standardSelector,
  },
  data() {
    var self = this
    const VALUE_TYPE = {
      value: '常量',
      expression: '参数',
    }
    return {
      systemList: [],
      dataSourceList: [],
      tableList: [],
      tableListTemplate: [],
      columnList: [],
      bigClassList: [],
      businessTypeList: [],
      importanceList: [
        {
          label: this.$t('quality.page.qualityRule.detail.importanceList.p1'),
          value: 1,
        },
        {
          label: this.$t('quality.page.qualityRule.detail.importanceList.p2'),
          value: 2,
        },
        {
          label: this.$t('quality.page.qualityRule.detail.importanceList.p3'),
          value: 3,
        },
      ],
      template: '',
      templateList: [],
      valueRangeList: [
        {
          label: this.$t(
            'quality.page.qualityRule.detail.valueRangeList.label1'
          ),
          value: '>',
        },
        {
          label: this.$t(
            'quality.page.qualityRule.detail.valueRangeList.label2'
          ),
          value: '=',
        },
        {
          label: this.$t(
            'quality.page.qualityRule.detail.valueRangeList.label3'
          ),
          value: '<',
        },
        {
          label: this.$t(
            'quality.page.qualityRule.detail.valueRangeList.label4'
          ),
          value: '>=',
        },
        {
          label: this.$t(
            'quality.page.qualityRule.detail.valueRangeList.label5'
          ),
          value: '<=',
        },
        {
          label: this.$t(
            'quality.page.qualityRule.detail.valueRangeList.label6'
          ),
          value: 'BETWEEN',
        },
      ],
      standardCodes: [],
      standardCodeList: [],
      tableName2: '',
      columnName2: '',
      sqlPksList: [],
      pksList: [],
      form: {
        name: '',
        targetDB: '',
        type: '',
        modelId: null,
        binddb: null,
        tableId: null,
        tableName: '',
        columnId: null,
        columnName: '',
        autoGeneratePk: false,
        resultTablePks: [],
        formattedContent: '',
        content: '',
        countTotalSql: '',
        countTotalSqlB: '',
        countProblemSql: '',
        preScript: '',
        postScript: '',
        failOnPreScriptFailure: false,
        failOnPostScriptFailure: false,
        bigClassSelectOption: null,
        smallClassSelectOption: null,
        bizTypeSelectOption: null,
        importance: null,
        // state: '',
        maxErrorRow: 10000,
        checkMode: 'RegexMatch',
        checkRowMount: null,
        category: 1,
        modelCategoryId: null,
        sqlPks: [],
        buRuleId: null,
        modelIdB: null,
        tableIdB: null,
        columnIdB: null,
        formattedContentB: '',
        sqlPksB: [],
        chooseModelCategoryId: '',
        schemaName: null,
        taskOwner: null,
      },
      taskOwnerOption: [],
      rules: {
        name: [
          {
            required: true,
            message: this.$t('quality.page.qualityRule.detail.rules.name'),
            trigger: 'blur',
          },
        ],
        targetDB: [
          {
            required: true,
            message: this.$t('quality.page.qualityRule.detail.rules.targetDB'),
            trigger: 'change',
          },
        ],
        type: [
          {
            required: true,
            message: this.$t('quality.page.qualityRule.detail.rules.type'),
            trigger: 'change',
          },
        ],
        modelId: [
          {
            required: true,
            message: this.$t('quality.page.qualityRule.detail.rules.modelId'),
            trigger: 'blur',
          },
        ],
        modelIdB: [
          {
            required: true,
            message: this.$t('quality.page.qualityRule.detail.rules.modelId'),
            trigger: 'blur',
          },
        ],
        resultTablePks: [
          {
            required: true,
            message: this.$t(
              'quality.page.qualityRule.detail.rules.resultTablePks'
            ),
            trigger: 'blur',
          },
        ],
        sqlPks: [
          {
            required: true,
            message: this.$t('quality.page.qualityRule.detail.rules.sqlPks'),
            trigger: 'blur',
          },
        ],
        sqlPksB: [
          {
            required: true,
            message: this.$t('quality.page.qualityRule.detail.rules.sqlPks'),
            trigger: 'blur',
          },
        ],
        content: [
          {
            required: true,
            message: this.$t('quality.page.qualityRule.detail.rules.content'),
            trigger: 'blur',
          },
        ],
        binddb: [
          {
            required: false,
            message: '请选完必选项',
            trigger: 'blur',
          },
        ],
        formattedContentB: [
          {
            required: true,
            message: this.$t('quality.page.qualityRule.detail.rules.content'),
            trigger: 'blur',
          },
        ],
        bigClassSelectOption: [
          {
            required: true,
            message: this.$t(
              'quality.page.qualityRule.detail.rules.bigClassSelectOption'
            ),
            trigger: 'change',
          },
        ],
        smallClassSelectOption: [
          {
            required: true,
            message: this.$t(
              'quality.page.qualityRule.detail.rules.smallClassSelectOption'
            ),
            trigger: 'change',
          },
        ],
        bizTypeSelectOption: [
          {
            required: true,
            message: this.$t(
              'quality.page.qualityRule.detail.rules.bizTypeSelectOption'
            ),
            trigger: 'change',
          },
        ],
        buRuleId: [
          { required: true, message: '请选择业务规则', trigger: 'change' },
        ],
        taskOwner: [
          {
            required: true,
            message: '请选择负责人',
            trigger: ['blur', 'change'],
          },
        ],
        state: [
          {
            required: true,
            message: this.$t(
              'quality.page.qualityRule.detail.rules.bigClassSelectOption'
            ),
            trigger: 'change',
          },
        ],
        countTotalSql: [
          {
            required: true,
            message: this.$t(
              'quality.page.qualityRule.detail.rules.countTotalSql'
            ),
            trigger: 'blur',
          },
        ],
        countTotalSqlB: [
          {
            required: true,
            message: this.$t(
              'quality.page.qualityRule.detail.rules.countTotalSql'
            ),
            trigger: 'blur',
          },
        ],
        countProblemSql: [
          {
            required: true,
            message: this.$t(
              'quality.page.qualityRule.detail.rules.countTotalSql'
            ),
            trigger: 'blur',
          },
        ],
      },
      showDialog: false,
      showBeforeBox: false,
      showAfterBox: false,
      showCountTotalSql: false,
      showCountProblemSql: false,
      isSuccess: false,
      isShowTable2: false,
      isShowColumn2: false,
      allSystemDataSource: [],
      oldSqlPksList: [],
      columnList1: [],
      columnList2: [],
      boxLoading: false,
      smallClassList: [],
      selectCode: false,
      // showTableList: false,
      // showcolumnList: false,
      // showTableList1: false,
      // showcolumnList1: false,
      // showTableList2: false,
      // showcolumnList2: false,
      pksLoading: false,
      modelList: [],
      schemaArr: [],
      testLoading: false,
      submitLoading: false,
      businessRules: [],
      templateTC: {
        tableName1: '',
        tableId1: '',
        viewName1: '',
        viewId1: '',
        viewId2: '',
        viewName2: '',
        columnName1: '',
        columnId1: '',
        tableName2: '',
        tableId2: '',
        columnName2: '',
        columnLength: null,
        dataRange: '',
        valueRange: '',
        min: null,
        max: null,
        sql: '',
        isFirst: false,
        preRawValue: '',
      },
      deleteArr: [
        'systemList',
        'dataSourceList',
        'tableList',
        'columnList',
        'form',
      ],
      parameterIds: null,
      dataCompare: '',
      VALUE_TYPE: VALUE_TYPE,
      currentFunction: {
        enabled: true,
        funcBody: {},
        funcName: '',
        funcId: null,
        funcReturnType: null,
        functionModel: null,
        params: [],
      },
      rules2: {
        functionModel: [
          {
            required: true,
            message: this.$t(
              'quality.page.qualityRule.detail.rules.functionModel'
            ),
            trigger: 'change',
          },
        ],
      },
      rules3: {
        modelId: [
          {
            required: true,
            message: this.$t('quality.page.qualityRule.detail.rules.modelId'),
            trigger: 'blur',
          },
        ],
        associationStandard: [
          {
            required: true,
            message: this.$t('quality.page.qualityRule.detail.rules.modelId'),
            trigger: 'blur',
          },
        ],
        chooseModelCategoryId: [
          {
            required: true,
            message: this.$t(
              'quality.page.qualityRule.detail.rules.chooseModelCategoryId'
            ),
            trigger: 'change',
          },
        ],
      },
      expression: '',
      editMode: false,
      params: [],
      allParameters: [],
      registered: null,
      funcsNewArr: null,
      domainArr: [],
      fieldArr: [
        {
          modelId: null,
          tableId: null,
          columnId: null,
          addFieldId: 0,
          tableList: [],
          columnList: [],
          modelList: [],
          delete: false,
          targetDB: null,
          schemaArr: [],
          schema: null,
        },
      ],
      addFieldId: 1,
      tipsData: false,
      funParameterValue: '',
      funParameterDialog: false,
      funParameterName: '',
      tipsDataFun: false,
      compareType: 'A_CONTAINS_B',

      tableDialog: false,
      tableDialogB: false,
      tableDialog2: false,
      cols: [],
      colsA: [],
      colsB: [],
      dataSourceName: '',
      dataSourceNameA: '',
      dataSourceNameB: '',
      tableLoading: false,

      rowDialogShow: false,
      currentRow: {},
      rowForm: {
        tableId: '',
        columnId: '',
        output: '',
      },
      currentSchema: '',
      schemaList: [],
      schemaListB: [],
      columnList3: [],
      allTableList: [],
      currentSqlLineageErrMsg: '',
      isDataB: false,
      classOptions: [],
      bigsmallValue: [],
      otherJump: true,
      preRawData: [],
      templateId: null,
      buRuleName: '',
      tableCategoryMapping: null,
      columnAxiosController: null,
      tableAxiosController: null,
      currentBuRule: null,
    }
  },
  mounted() {
    // 获取所有系统
    this.$getModelCategories()
    this.getRegistered()
    this.$bus.$on('domainSelected', domain => {
      this.domainArr = []
      this.domainArr.push(domain)
    })
    if (this.form.type !== 'Function') {
      this.getModelList()
    }
    if (this.$route.query.id) {
      this.otherJump = false
    }
  },
  methods: {
    autoCountSQL() {
      const handleSql = this.form.content
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
      let config = {
        headers: { 'Content-Type': 'text/plain' },
      }
      this.$http
        .post(
          `${this.$quality_url}/quality/rule/tech/parseWhere`,
          handleSql,
          config
        )
        .then(res => {
          if (
            (res.data.start === 0 && res.end === 0) ||
            (res.data.start === -1 && res.end === -1)
          ) {
            this.$set(this.form, 'countTotalSql', handleSql)
          } else {
            const resSql =
              handleSql.slice(0, res.data.start) +
              handleSql.slice(res.data.end + 1) +
              't'
            this.$set(this.form, 'countTotalSql', resSql)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    autoProblemSQL() {
      const sql = 'select count(*) from (' + this.form.content + ') t'
      this.$set(this.form, 'countProblemSql', sql)
    },
    getRuleDataObj() {
      if (this.ruleDataObj) {
        // this.ruleDataObj  有值时为编辑，否则为新建
        this.bigsmallValue = []
        this.boxLoading = true
        if (this.ruleDataObj.buRuleId) {
          this.$http
            .get(
              `${this.$quality_url}/quality/rule/bu/getRuleById?ruleId=${this.ruleDataObj.buRuleId}`
            )
            .then(res => {
              this.buRuleName = res.data.name
              this.currentBuRule = res.data
              this.getBusinessRulesList('', res.data.id)
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
        if (this.ruleDataObj.id) {
          if (this.ruleDataObj.level === 1 && !this.$route.query.copy) {
            this.$http
              .get(
                `${this.$quality_url}/quality/rule/tech/${this.ruleDataObj.id}`
              )
              .then(res => {
                // 查询完整数据
                this.boxLoading = false
                res.data.level = this.ruleDataObj.level
                try {
                  res.data.targetDB = this.$modelCategories.filter(
                    e => e.categoryId === res.data.modelCategoryId
                  )[0].categoryName
                } catch (e) {
                  console.error(e)
                }
                this.form = res.data
                if (res.data.type === 'Compare') {
                  const formattedContentArr = JSON.parse(
                    res.data.formattedContent
                  )
                  this.compareType = formattedContentArr.compareType
                  this.form.content = formattedContentArr.sql
                  this.form.modelIdB = formattedContentArr.compare.modelId
                  this.$set(
                    this.form,
                    'formattedContentB',
                    formattedContentArr.compare.sql
                  )
                  this.$set(
                    this.form,
                    'countTotalSqlB',
                    formattedContentArr.compare.countTotalSql
                  )
                  // this.formattedContentB = formattedContentArr.compare.sql
                  this.$set(this.form, 'sqlPksB', [])
                  formattedContentArr.compare.sqlPks.forEach(element => {
                    this.form.sqlPksB.push(element)
                  })
                }
                if (res.data.type === 'Function') {
                  const formattedContentArr = JSON.parse(
                    res.data.formattedContent
                  )
                  this.getFunctions(formattedContentArr.funcId)
                  for (const arr in formattedContentArr.domains) {
                    let arrObj = JSON.parse(formattedContentArr.domains[arr])
                    arrObj.domainId = arr
                    this.domainArr.push(arrObj)
                  }
                  this.fieldArr = []
                  let tempFieldArr = []
                  for (const arr in formattedContentArr.columnObject) {
                    tempFieldArr.push(
                      JSON.parse(formattedContentArr.columnObject[arr])
                    )
                  }
                  tempFieldArr.forEach(element => {
                    tempFieldArr[0].delete = false
                    element.tableList = []
                    element.columnList = []
                    element.modelList = []
                    element.schemaArr = []
                    element.de = false
                    // schema: null,
                    element.modelList.push({
                      definition: element.definitionModelId,
                      modelId: element.modelId,
                    })
                    element.schemaArr.push({
                      name: element.schema,
                      id: 0,
                    })
                    element.tableList.push({
                      physicalName: element.physicalNameTableId,
                      objectId: element.tableId,
                    })
                    element.columnList.push({
                      physicalName: element.physicalNameColumnId,
                      objectId: element.columnId,
                    })
                    this.addFieldId = element.addFieldId
                  })
                  this.fieldArr = tempFieldArr.sort(this.compare('addFieldId'))
                } else {
                  if (this.form.modelId) {
                    this.getTableList(this.form.modelId)
                  }
                  if (this.form.tableId) {
                    this.getColumnList()
                  }
                }
                this.getBigClassListAndBusinessTypeList().then(() => {
                  let bigClassSelectOption = res.data.bigClassSelectOption
                  let smallClassSelectOption = res.data.smallClassSelectOption
                  this.bigsmallValue.push(bigClassSelectOption)
                  if (smallClassSelectOption) {
                    this.bigsmallValue.push(smallClassSelectOption)
                  }
                  this.getSmallClassList(bigClassSelectOption)
                })
                this.isFirst = true
                this.getSystemIdAndSourceList()
                this.rules.sqlPks[0].required = !this.form.autoGeneratePk
                this.rules.resultTablePks[0].required =
                  !this.form.autoGeneratePk
                this.getSqlresult()
              })
              .catch(e => {
                this.boxLoading = false
                this.$showFailure(e)
              })
          } else {
            let techRuleCopyId = null
            if (this.$route.query.copyId) {
              techRuleCopyId = this.$route.query.copyId
            } else {
              techRuleCopyId = this.ruleDataObj.copyId
            }
            this.$http
              .post(
                `${this.$quality_url}/quality/rule/tech/getCopyDetail?techRuleCopyId=${techRuleCopyId}`
              )
              .then(res => {
                // 查询完整数据
                this.boxLoading = false
                res.data.copyId = techRuleCopyId
                try {
                  res.data.targetDB = this.$modelCategories.filter(
                    e => e.categoryId === res.data.modelCategoryId
                  )[0].categoryName
                } catch (e) {
                  console.error(e)
                }
                this.form = res.data
                if (res.data.type === 'Compare') {
                  const formattedContentArr = JSON.parse(
                    res.data.formattedContent
                  )
                  this.compareType = formattedContentArr.compareType
                  this.form.content = formattedContentArr.sql
                  this.form.modelIdB = formattedContentArr.compare.modelId
                  this.$set(
                    this.form,
                    'formattedContentB',
                    formattedContentArr.compare.sql
                  )
                  this.$set(
                    this.form,
                    'countTotalSqlB',
                    formattedContentArr.compare.countTotalSql
                  )
                  // this.formattedContentB = formattedContentArr.compare.sql
                  this.$set(this.form, 'sqlPksB', [])
                  formattedContentArr.compare.sqlPks.forEach(element => {
                    this.form.sqlPksB.push(element)
                  })
                }
                if (res.data.type === 'Function') {
                  const formattedContentArr = JSON.parse(
                    res.data.formattedContent
                  )
                  this.getFunctions(formattedContentArr.funcId)
                  for (const arr in formattedContentArr.domains) {
                    let arrObj = JSON.parse(formattedContentArr.domains[arr])
                    arrObj.domainId = arr
                    this.domainArr.push(arrObj)
                  }
                  this.fieldArr = []
                  for (const arr in formattedContentArr.columnObject) {
                    this.fieldArr.push(
                      JSON.parse(formattedContentArr.columnObject[arr])
                    )
                  }
                  this.fieldArr.forEach(element => {
                    this.fieldArr[0].delete = false
                    element.tableList = []
                    element.columnList = []
                    element.modelList = []
                    element.schemaArr = []
                    element.de = false
                    // schema: null,
                    element.modelList.push({
                      definition: element.definitionModelId,
                      modelId: element.modelId,
                    })
                    element.schemaArr.push({
                      name: element.schema,
                      id: 0,
                    })
                    element.tableList.push({
                      physicalName: element.physicalNameTableId,
                      objectId: element.tableId,
                    })
                    element.columnList.push({
                      physicalName: element.physicalNameColumnId,
                      objectId: element.columnId,
                    })
                    this.addFieldId = element.addFieldId
                  })
                  this.fieldArr = this.fieldArr.sort(this.compare('addFieldId'))
                } else {
                  if (this.form.modelId) {
                    this.getTableList(this.form.modelId)
                  }
                  if (this.form.tableId) {
                    this.getColumnList()
                  }
                }
                this.getBigClassListAndBusinessTypeList().then(() => {
                  let bigClassSelectOption = res.data.bigClassSelectOption
                  let smallClassSelectOption = res.data.smallClassSelectOption
                  this.bigsmallValue.push(bigClassSelectOption)
                  if (smallClassSelectOption) {
                    this.bigsmallValue.push(smallClassSelectOption)
                  }
                  this.getSmallClassList(bigClassSelectOption)
                })
                this.isFirst = true
                this.getSystemIdAndSourceList()
                this.rules.sqlPks[0].required = !this.form.autoGeneratePk
                this.rules.resultTablePks[0].required =
                  !this.form.autoGeneratePk
                this.getSqlresult()
              })
              .catch(e => {
                this.boxLoading = false
                this.$showFailure(e)
              })
          }
          this.getSelectedOwner(this.ruleDataObj.buRuleId)
        }
      } else {
        this.form.type = 'SQL'
        this.getBigClassListAndBusinessTypeList()
        this.getBusinessRulesList()
      }
    },
    countTotalSql() {
      this.showCountTotalSql = true
      this.$nextTick(() => {
        this.$refs.countTotalSqlInput.focus()
      })
    },
    countProblemSql() {
      this.showCountProblemSql = true
      this.$nextTick(() => {
        this.$refs.countProblemSqlInput.focus()
      })
    },
    beforeFocus() {
      this.showBeforeBox = true
      this.$nextTick(() => {
        this.$refs.beforeInput.focus()
      })
    },
    afterFocus() {
      this.showAfterBox = true
      this.$nextTick(() => {
        this.$refs.afterInput.focus()
      })
    },
    handlePreModelIdChange(value) {
      if (this.form.binddb) {
        // 如果已有元数据绑定数据源，则不在修改执行数据源时进行更新操作
      } else {
        this.form.binddb = value
        this.handleModelIdChange(value)
      }
    },
    handleModelIdChange(value) {
      this.schemaArr = []
      this.form.schemaName = null
      this.form.tableId = null
      this.form.columnId = null
      this.form.tableName = null
      this.form.columnName = null
      this.modelList.forEach(element => {
        if (element.modelId === value) {
          // if (element.connectionInfo.schemas) {
          if (element.reverseOptions?.SELECT_SCHEMA) {
            let arr = element.reverseOptions.SELECT_SCHEMA.split(';')
            arr.forEach((item, index) => {
              this.schemaArr.push({
                name: item,
                id: index,
              })
            })
          } else {
            let arr = element.reverseOptions.DATABASE_NAME.split(';')
            arr.forEach((item, index) => {
              this.schemaArr.push({
                name: item,
                id: index,
              })
            })
          }
        }
      })
    },
    clearSchemaName() {
      this.form.tableId = null
      this.form.columnId = null
      this.form.tableName = null
      this.form.columnName = null
      this.tableList = []
      this.columnList = []
    },
    buRuleIdChange(value) {
      if (!value) return
      let categoryId = this.businessRules.filter(item => value === item.id)[0]
        .uniCategoryId
      this.$http
        .post(
          this.$quality_url +
            `/quality/category/getCategoryOwner?categoryId=${categoryId}`
        )
        .then(res => {
          this.getSelectedOwner(value)
          this.form.taskOwner = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getSelectedOwner(id) {
      if (!id) return
      this.$http
        .post(
          this.$quality_url +
            `/quality/category/getSelectedOwner?buRuleId=${id}`
        )
        .then(res => {
          this.taskOwnerOption = []
          res.data.forEach(element => {
            this.taskOwnerOption.push({
              label: element,
              value: element,
            })
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    valueTypeChange(value, index) {
      this.currentFunction.params[index].value = ''
      this.updateParameters()
    },
    goEdit(id) {
      this.form.hasUnclosedTask = this.hasUnclosedTask
      this.$emit('showAddOrEdit', this.nameList, this.form, false)
    },
    compareTypeChange(type, isSee) {
      if (isSee) {
        return false
      } else {
        this.compareType = type
      }
    },
    compare(prop) {
      return function (obj1, obj2) {
        var val1 = obj1[prop]
        var val2 = obj2[prop]
        if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
          val1 = Number(val1)
          val2 = Number(val2)
        }
        if (val1 < val2) {
          return -1
        } else if (val1 > val2) {
          return 1
        } else {
          return 0
        }
      }
    },
    openFunParameterValue(row) {
      if (this.isSee) {
        return // 如果是浏览模式，不应该出现编辑框
      }
      this.funParameterName = row.name
      if (row.value !== '') {
        this.funParameterValue = row.value
      } else {
        this.funParameterValue = ''
      }
      this.funParameterDialog = true
      const focusInput = () => {
        // 当打开弹框的时候，自动高亮输入框，便于用户输入
        const el = this.$refs['input-of-funParameterDialog']
        el.focus()
      }
      setTimeout(focusInput)
    },
    saveFunParameterValue() {
      this.currentFunction.params.forEach((element, index) => {
        if (element.name === this.funParameterName) {
          this.$set(
            this.currentFunction.params[index],
            'value',
            this.funParameterValue
          )
        }
      })
      this.funParameterDialog = false
    },
    modelCatButton(field) {
      this.fieldArr.forEach(element => {
        if (element.addFieldId === field.addFieldId) {
          element.tableId = ''
          element.tableList = []
          element.columnId = ''
          element.columnList = []
          element.modelId = ''
          element.modelList = []
          element.schemaArr = []
          element.schema = ''
        }
      })
    },
    getColumnLists($event, field) {
      if (
        $event === true &&
        field.modelId !== null &&
        field.modelId !== '' &&
        field.tableId !== null &&
        field.tableId !== ''
      ) {
        this.getColumnList('', field.tableId)
      } else {
        this.fieldArr.forEach(element => {
          element.de = false
        })
        return false
      }
    },
    getTableLists(field, e) {
      if (e !== false) {
        if (field.modelId !== null && field.modelId !== '') {
          this.getTableList('', field.modelId, field.schema)
        } else {
          this.fieldArr.forEach(element => {
            element.de = false
          })
          return false
        }
      }
    },
    schemaFunction(value, row) {
      if (value !== '') {
        this.fieldArr.forEach(element => {
          if (element.addFieldId === row.addFieldId) {
            element.tableId = ''
            element.tableList = []
            element.columnId = ''
            element.columnList = []
          }
        })
        this.getTableLists(row)
      }
    },
    schemaFunctionClear(row) {
      this.fieldArr.forEach(element => {
        if (element.addFieldId === row.addFieldId) {
          element.tableId = ''
          element.tableList = []
          element.columnId = ''
          element.columnList = []
        }
      })
    },
    getModelLists($event, field) {
      if ($event === true) {
        this.getModelList(this.form.chooseModelCategoryId, field)
      } else {
        this.fieldArr.forEach(element => {
          element.de = false
        })
        return false
      }
    },
    getFunctions(id) {
      this.$http.get(this.$quality_url + `/funcs/${id}`).then(res => {
        if (res.data.funcId === id) {
          this.currentFunction.functionModel = res.data.funcBody.funcTypeId
          this.currentFunction.funcReturnType = res.data.funcReturnType
          this.currentFunction.funcBody = res.data.funcBody
          const editMode = true
          this.decodeParams(editMode)
        }
      })
    },
    addDataStandard() {
      this.$bus.$emit('callDomainSelector2', this.domainArr)
    },
    deleteFieldObject(data) {
      this.fieldArr = this.fieldArr.filter(
        item => item.addFieldId !== data.addFieldId
      )
    },
    deleteDomainArr() {
      this.domainArr = []
    },
    addField() {
      this.addFieldId++
      this.fieldArr.push({
        modelId: null,
        tableId: null,
        columnId: null,
        addFieldId: this.addFieldId,
        tableList: [],
        columnList: [],
        modelList: [],
        delete: true,
        targetDB: null,
        schemaArr: [],
        schema: null,
      })
    },
    getRegistered() {
      this.$http
        .get(this.$quality_url + '/funcs/registered')
        .then(res => {
          const registered = {}
          Object.values(res.data).forEach(item => {
            if (!item.ignore && item.returnType === 'BOOLEAN') {
              registered[item.uuid] = item
            }
          })
          this.registered = registered
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getParameters() {
      this.$http
        .get(this.$quality_url + '/parameters/')
        .then(res => {
          this.allParameters = res.data
          res.data.sort((a, b) => b.paramId - a.paramId)
          this.preRawData = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    parameterOptions(row) {
      const typeEqual = (leftVal, rightVal) => {
        return leftVal === rightVal
        // if (leftVal === 'STRING' && ['STRING'].includes(rightVal)) {
        //   return true
        // } else if (leftVal === 'LONG' && [''].includes(rightVal)) {
        //   return true
        // } else if (leftVal === 'DOUBLE' && [''].includes(rightVal)) {
        //   return true
        // } else {
        //   return false
        // }
      }
      const globalParameters = this.allParameters.filter(item => {
        return item.level === 'GLOBAL_LEVEL'
      })
      const filtered = globalParameters.filter(item => {
        return typeEqual(item.valueType, row.type)
      })
      return filtered
    },
    handleFunctionModelChange(val) {
      const model = this.registered[val]
      this.currentFunction.funcReturnType = model.returnType
      this.decodeParams()
      this.updateParameters()
    },
    decodeParams(editMode) {
      const model = this.registered[this.currentFunction.functionModel]
      if (model) {
        const params = []
        Object.values(model.params).forEach(item => {
          const param = {
            bindName: item.bindName,
            description: item.description,
            name: item.name,
            required: item.required,
            type: item.type,
            valueType: 'value',
            value: '',
          }
          if (editMode) {
            const parameter =
              this.currentFunction.funcBody.parameters[item.bindName]
            if (parameter != null) {
              if (parameter.expression) {
                param.valueType = 'expression'
                param.value = parameter.expression
              } else if (parameter.value) {
                param.valueType = 'value'
                param.value = parameter.value
              }
            }
          }
          params.push(param)
        })
        this.currentFunction.params = params
      } else {
        this.currentFunction.params = []
      }
    },
    encodeParams() {
      const parameters = {}
      this.currentFunction.params.forEach(item => {
        const o = {
          name: item.bindName,
        }
        if (item.valueType === 'expression') {
          o.expression = item.value
        } else if (item.valueType === 'value') {
          o.value = item.value
        }
        parameters[item.bindName] = o
      })
      return parameters
    },
    handleActiveClassOptions(val) {
      this.getSmallClassList(val[0])
    },
    handleChangeClassOptions(val) {
      this.form.bigClassSelectOption = val[0]
      this.form.smallClassSelectOption = val[1] || null
    },
    getBigClassListAndBusinessTypeList() {
      return new Promise(resolve => {
        this.$http
          .post(`${this.$url}/select/option/get`, {
            category: 'TR',
            names: ['业务类型', '规则大类'],
          })
          .then(res => {
            let tempList = []
            const classList = res.data.filter(e => e.optionName === '规则大类')
            const typeList = res.data.filter(e => e.optionName === '业务类型')
            if (!classList.length) {
              this.$message.warning({
                message: this.$t(
                  'quality.page.dataQualityRules.rules.noTypeTips'
                ),
                showClose: true,
                duration: 0,
              })
            }
            classList.forEach(e => {
              const classObj = {
                id: e.id,
                label: e.optionValue,
                value: e.ruleCode,
                children: [],
              }
              this.bigClassList.push(classObj)
              this.classOptions.push(classObj)
            })
            typeList.forEach(e => {
              const typeObj = {
                lable: e.optionValue,
                value: e.optionValue,
              }
              tempList.push(typeObj)
            })
            this.businessTypeList = tempList
            resolve()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    getSmallClassList(val) {
      this.smallClassList = []
      // const pId = this.bigClassList.filter(
      //   e => e.value === this.form.bigClassSelectOption
      // )[0].id
      const pId = this.bigClassList.filter(e => e.value === val)[0].id
      this.$http
        .post(`${this.$url}/select/option/getByParentId?parentId=${pId}`)
        .then(res => {
          let temp = []
          if (res.data.length === 0) {
            this.bigClassList.forEach((element, i) => {
              if (element.id === pId) {
                this.$set(this.bigClassList[i], 'children', null)
              }
            })
          } else {
            res.data.forEach(e => {
              const obj = {
                id: e.id,
                label: e.optionValue,
                value: e.ruleCode,
              }
              if (e.parentId === pId) {
                temp.push(obj)
              }
              this.bigClassList.forEach((element, i) => {
                if (element.id === pId) {
                  this.$set(this.bigClassList[i], 'children', temp)
                }
              })
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // getSystemList () {
    //   return new Promise(resolve => {
    //     this.$http.get(`${this.$url}/service/datadict/categories`).then(res => {
    //       this.systemList = res.data
    //       this.systemList.sort((a, b) => {
    //         return a.categoryName.localeCompare(b.categoryName)
    //       })
    //       resolve()
    //     }).catch(e => {
    //       this.$showFailure(e)
    //     })
    //   })
    // },
    getModelList(categoryId, row) {
      let urlName = this.isSee
        ? '/models/fromreunsafe/?onlyJdbc=true'
        : '/models/fromre/?onlyJdbc=true'
      if (this.form.type !== 'Function') {
        this.$http
          .get(`${this.$meta_url}${urlName}`)
          .then(res => {
            this.modelList = res.data
            this.schemaArr = []
            this.modelList.forEach(element => {
              if (element.modelId === this.form.modelId) {
                if (element.reverseOptions.SELECT_SCHEMA) {
                  let arr = element.reverseOptions.SELECT_SCHEMA.split(';')
                  arr.forEach((item, index) => {
                    this.schemaArr.push({
                      name: item,
                      id: index,
                    })
                  })
                } else {
                  let arr = element.reverseOptions.DATABASE_NAME.split(';')
                  arr.forEach((item, index) => {
                    this.schemaArr.push({
                      name: item,
                      id: index,
                    })
                  })
                }
              }
            })
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$http
          .get(`${this.$meta_url}${urlName}`)
          .then(res => {
            const models = []
            res.data.forEach(item => {
              if (item.categoryId === categoryId) {
                const type = item.type
                const index = this.$fileDataSource.indexOf(type)
                if (
                  // item.connectionInfo.connectType === 'JDBC' &&
                  item.jdbcModel &&
                  item.type !== 'OFFLINEDUMP' &&
                  index === -1
                ) {
                  models.push({
                    modelId: item.modelId,
                    definition: item.definition,
                    // connectionInfo: item.connectionInfo,
                    connectionInfo: item.reverseOptions,
                  })
                }
              }
            })
            for (const arr in this.fieldArr) {
              if (this.fieldArr[arr].addFieldId === row.addFieldId) {
                this.$delete(this.fieldArr[arr], 'de')
                // this.fieldArr[arr].modelList = []
                this.$set(this.fieldArr[arr], 'modelList', models)
                this.$forceUpdate()
              }
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    clearableBuRuleId() {
      this.getBusinessRulesList()
    },
    getBusinessRulesList(name, id) {
      // if (!this.form.modelCategoryId) return
      let response = {
        ruleName: name || '',
        state: 'A',
        // ruleId: id || '',
        // modelCategoryId: this.form.modelCategoryId,
        processing: false,
        currentPage: 1,
        pageSize: 50,
      }
      if (this.isSee === true) {
        response.uniCategoryAuth = 'READ'
      } else {
        response.uniCategoryAuth = 'WRITE'
      }
      this.$http
        .post(`${this.$quality_url}/quality/rules/bu/report/page`, response)
        .then(res => {
          this.businessRules = res.data.content
          if (Array.isArray(res.data.content) && res.data.content.length > 0) {
            if (
              res.data.content.filter(re => re.id === this.currentBuRule.id)
                .length
            ) {
            } else {
              if (this.currentBuRule) {
                this.businessRules.unshift(this.currentBuRule)
              }
            }
          } else {
            if (this.currentBuRule) {
              this.businessRules.unshift(this.currentBuRule)
            }
          }
          this.form.buRuleId = id || ''
          this.isFirst = false
          let _this = this
          let buRuleIdFind = res.data.content.find(function (obj) {
            return obj.id === _this.form.buRuleId
          })
          if (buRuleIdFind === undefined) {
            this.form.buRuleId = null
          }
          this.buRuleIdChange(this.form.buRuleId)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getTableListTemplate(tableName, id, schemaName, type) {
      if (!this.form.modelId) {
        this.tableListTemplate = []
        return
      }
      return new Promise(resolve => {
        const obj = {
          currentPage: 1,
          keyword: tableName === this.form.modelId ? '' : tableName,
          modelIds: this.form.modelId ? [this.form.modelId] : null,
          pageSize: 1000,
          tagIds: null,
          // types: ['TABLE', 'VIEW'],
          schema: this.form.schemaName,
        }
        if (type && type === 'table') {
          // obj.types = ['TABLE']
          obj.typeIds = [80000004]
        } else if (type && type === 'view') {
          // obj.types = ['VIEW']
          obj.typeIds = [80500008]
        } else {
          // obj.types = ['TABLE', 'VIEW']
          obj.typeIds = [80000004, 80500008]
        }
        this.$http
          // .post(`${this.$url}/service/entities/search`, obj)
          .post(`${this.$meta_url}/entities/searchMetadata`, obj)
          .then(res => {
            let _this = this
            if (this.form.tableId !== null && typeof tableName === 'number') {
              let findtableId = res.data.content.find(function (obj) {
                return obj.objectId === _this.form.tableId
              })
              if (findtableId === undefined) {
                this.getTableListTemplate(this.form.tableName)
                // res.data.content.push({
                //   objectId: this.form.tableId,
                //   splicingName: this.form.tableName,
                // })
              }
            }
            res.data.content.forEach(element => {
              if (element.logicalName !== null && element.logicalName !== '') {
                element.splicingName =
                  element.physicalName + '(' + element.logicalName + ')'
              } else {
                element.splicingName = element.physicalName
              }
            })
            this.tableListTemplate = res.data.content
            resolve()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    // 表/视图
    getTableList(tableName, id, schemaName) {
      if (this.form.type !== 'Function') {
        if (!this.form.binddb) {
          this.tableList = []
          return
        }
        return new Promise(resolve => {
          const obj = {
            currentPage: 1,
            keyword: tableName === this.form.binddb ? '' : tableName,
            modelIds: this.form.binddb ? [this.form.binddb] : null,
            pageSize: 100,
            tagIds: null,
            // types: ['TABLE', 'VIEW'],
            typeIds: [80000004, 80500008],
            schema: this.form.schemaName,
          }
          if (this.tableAxiosController) {
            this.tableAxiosController.abort()
          }
          this.tableAxiosController = new AbortController()
          const signal = this.tableAxiosController.signal
          this.$http
            // .post(`${this.$url}/service/entities/search`, obj)
            .post(`${this.$meta_url}/entities/searchMetadata`, obj, {
              signal: signal,
            })
            .then(res => {
              let _this = this
              if (this.form.tableId !== null && typeof tableName === 'number') {
                let findtableId = res.data.content.find(function (obj) {
                  return obj.objectId === _this.form.tableId
                })
                if (findtableId === undefined) {
                  this.getTableList(this.form.tableName)
                  // res.data.content.push({
                  //   objectId: this.form.tableId,
                  //   splicingName: this.form.tableName,
                  // })
                }
              }
              res.data.content.forEach(element => {
                if (
                  element.logicalName !== null &&
                  element.logicalName !== ''
                ) {
                  element.splicingName =
                    element.physicalName + '(' + element.logicalName + ')'
                } else {
                  element.splicingName = element.physicalName
                }
              })
              this.tableList = res.data.content
              resolve()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
      } else {
        return new Promise(resolve => {
          const obj = {
            currentPage: 1,
            keyword: tableName,
            modelIds: id ? [id] : null,
            pageSize: 1000,
            tagIds: null,
            // types: ['TABLE', 'VIEW'],
            typeIds: [80000004, 80500008],
            schema: schemaName,
          }
          if (this.tableAxiosController) {
            this.tableAxiosController.abort()
          }
          this.tableAxiosController = new AbortController()
          const signal = this.tableAxiosController.signal
          this.$http
            .post(`${this.$meta_url}/entities/searchMetadata`, obj, {
              signal: signal,
            })
            .then(res => {
              res.data.content.forEach(element => {
                if (
                  element.logicalName !== null &&
                  element.logicalName !== ''
                ) {
                  element.splicingName =
                    element.physicalName + '(' + element.logicalName + ')'
                } else {
                  element.splicingName = element.physicalName
                }
              })
              let tempFieldArr = _.cloneDeep(this.fieldArr)
              for (const arr in tempFieldArr) {
                if (tempFieldArr[arr].modelId === id) {
                  this.$delete(tempFieldArr[arr], 'de')
                  tempFieldArr[arr].tableList = res.data.content
                }
              }
              this.fieldArr = tempFieldArr
              this.$forceUpdate()

              resolve()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
      }
    },
    // getAllSchemaTableList () {
    //   //找出所有的schema表
    //   this.schemaList.forEach(v => {

    //   })
    // },
    // getTableListBySchema(tableName, id, schema) {

    //   return
    // },
    getAllTableList(tableName, schema) {
      if (this.form.type !== 'Function') {
        if (!this.form.binddb) {
          this.allTableList = []
          return
        }
        if (this.isDataB && !this.form.modelIdB) {
          this.allTableList = []
          return
        }
        let modelId = this.isDataB ? this.form.modelIdB : this.form.modelId
        return new Promise(resolve => {
          const obj = {
            currentPage: 1,
            keyword: tableName === modelId ? '' : tableName,
            modelIds: modelId ? [modelId] : null,
            pageSize: 1000,
            tagIds: null,
            schema: schema || this.currentSchema,
            // types: ['TABLE', 'VIEW'],
            typeIds: [80000004, 80500008],
          }
          this.$http
            // .post(`${this.$url}/service/entities/search`, obj)
            .post(`${this.$meta_url}/entities/searchMetadata`, obj)
            .then(res => {
              let list = res.data.content
              this.allTableList = list
              // console.log(_.cloneDeep(list), 'tables')
              // this.allTableMap = {}
              // list.forEach(v => {
              //   if (!this.allTableMap[v.schema]) {
              //     this.allTableMap[v.schema] = {}
              //   }
              //   this.allTableMap[v.schema][v.name] = v.objectId
              // })
              resolve()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
      } else {
        // return new Promise(resolve => {
        //   const obj = {
        //     currentPage: 1,
        //     keyword: tableName,
        //     modelId: id,
        //     pageSize: 50,
        //     tagIds: null,
        //     types: ['TABLE'],
        //   }
        //   this.$http
        //     .post(`${this.$url}/service/entities/search`, obj)
        //     .then(res => {
        //       for (const arr in this.fieldArr) {
        //         if (this.fieldArr[arr].modelId === id) {
        //           this.$delete(this.fieldArr[arr], 'de')
        //           this.$set(this.fieldArr[arr], 'tableList', res.data.content)
        //           this.$forceUpdate()
        //         }
        //       }
        //       resolve()
        //     })
        //     .catch(e => {
        //       this.$showFailure(e)
        //     })
        // })
      }
    },
    // 字段列表
    getColumnList(columnName, id) {
      if (this.form.type !== 'Function') {
        if (!this.form.tableId) {
          this.columnList = []
          return
        }
        return new Promise(resolve => {
          const obj = {
            name: columnName || '',
          }
          if (this.columnAxiosController) {
            this.columnAxiosController.abort()
          }
          this.columnAxiosController = new AbortController()
          const signal = this.columnAxiosController.signal
          this.$http
            .post(
              `${this.$quality_url}/quality/rules/tech/${this.form.tableId}/fields`,
              obj,
              { signal: signal }
            )
            .then(res => {
              res.data.forEach(element => {
                if (element.logicalName && element.logicalName !== null) {
                  element.splicingName =
                    element.physicalName + '(' + element.logicalName + ')'
                } else {
                  element.splicingName = element.physicalName
                }
              })
              this.columnList = res.data
              this.pksList = _.cloneDeep(res.data)
              this.pksList.forEach(e => {
                e.objectId = JSON.stringify(e.objectId)
              })
              resolve()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
      } else {
        return new Promise(resolve => {
          const obj = {
            name: columnName || '',
          }
          if (this.columnAxiosController) {
            this.columnAxiosController.abort()
          }
          this.columnAxiosController = new AbortController()
          const signal = this.columnAxiosController.signal
          this.$http
            .post(`${this.$quality_url}/quality/rules/tech/${id}/fields`, obj, {
              signal: signal,
            })
            .then(res => {
              res.data.forEach(element => {
                if (element.logicalName && element.logicalName !== null) {
                  element.splicingName =
                    element.physicalName + '(' + element.logicalName + ')'
                } else {
                  element.splicingName = element.physicalName
                }
              })
              for (const arr in this.fieldArr) {
                if (this.fieldArr[arr].tableId === id) {
                  this.$delete(this.fieldArr[arr], 'de')
                  this.$set(this.fieldArr[arr], 'columnList', res.data)
                }
              }
              // this.columnList = res.data
              // this.pksList = _.cloneDeep(res.data)
              // this.pksList.forEach(e => {
              //   e.objectId = JSON.stringify(e.objectId)
              // })
              resolve()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
      }
    },
    getColumnList2(columnName, id) {
      if (this.form.type !== 'Function') {
        if (!this.rowForm.tableId) {
          this.columnList3 = []
          return
        }
        return new Promise(resolve => {
          const obj = {
            name: columnName || '',
          }
          this.$http
            .post(
              `${this.$quality_url}/quality/rules/tech/${this.rowForm.tableId}/fields`,
              obj
            )
            .then(res => {
              this.columnList3 = res.data
              this.pksList = _.cloneDeep(res.data)
              this.pksList.forEach(e => {
                e.objectId = JSON.stringify(e.objectId)
              })
              resolve()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
      } else {
        return new Promise(resolve => {
          const obj = {
            name: columnName || '',
          }
          this.$http
            .post(`${this.$quality_url}/quality/rules/tech/${id}/fields`, obj)
            .then(res => {
              for (const arr in this.fieldArr) {
                if (this.fieldArr[arr].tableId === id) {
                  this.$delete(this.fieldArr[arr], 'de')
                  this.$set(this.fieldArr[arr], 'columnList', res.data)
                }
              }
              // this.columnList = res.data
              // this.pksList = _.cloneDeep(res.data)
              // this.pksList.forEach(e => {
              //   e.objectId = JSON.stringify(e.objectId)
              // })
              resolve()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
      }
    },
    // tableFocus1 () {
    //   this.showTableList1 = true
    //   this.showTableList2 = false
    //   this.getTableList(this.form.modelId, this.form.tableName)
    // },
    // columnFocus1 () {
    //   this.showcolumnList1 = true
    //   this.showcolumnList2 = false
    //   this.getColumnList(this.form.columnName)
    // },
    // tableFocus2 () {
    //   this.showTableList2 = true
    //   this.showTableList1 = false
    //   this.getTableList(this.form.modelId, this.tableName2)
    // },
    // columnFocus2 () {
    //   this.showcolumnList2 = true
    //   this.showcolumnList1 = false
    //   this.getColumnList(this.columnName2)
    // },
    // tableBlur (index) {
    //   if (index === 1) {
    //     setTimeout(() => {
    //       this.form.tableName = this.tableList.map(e => e.physicalName).includes(this.form.tableName) ? this.form.tableName : ''
    //       try {
    //         this.form.tableId = this.tableList.filter(e => e.physicalName === this.form.tableName)[0].objectId
    //       } catch (e) {
    //       }
    //       this.tableList = []
    //     }, 300)
    //   } else if (index === 2) {
    //     setTimeout(() => {
    //       this.tableName2 = this.tableList.map(e => e.physicalName).includes(this.tableName2) ? this.tableName2 : ''
    //       this.tableList = []
    //     }, 300)
    //   }
    // },
    // columnBlur (index) {
    //   if (index === 1) {
    //     setTimeout(() => {
    //       this.form.columnName = this.columnList.map(e => e.physicalName).includes(this.form.columnName) ? this.form.columnName : ''
    //       try {
    //         this.form.columnId = this.columnList.filter(e => e.physicalName === this.form.columnName)[0].objectId
    //       } catch (e) {
    //       }
    //       this.columnList = []
    //     }, 300)
    //   } else if (index === 2) {
    //     setTimeout(() => {
    //       this.columnName2 = this.columnList.map(e => e.physicalName).includes(this.columnName2) ? this.columnName2 : ''
    //       this.columnList = []
    //     }, 300)
    //   }
    // },
    initTemplateColumn(name, type) {
      let searchname = ''
      if (typeof name === 'string') {
        searchname = name
      }
      if (type === 'table1') {
        this.templateTC.tableId1 = name
      } else if (type === 'view1') {
        this.templateTC.viewId1 = name
      }
      if (this.templateTC.tableId1 || this.templateTC.viewId1) {
        this.$http
          .post(
            `${this.$quality_url}/quality/rules/tech/${
              type === 'table1' || this.template.includes('table1')
                ? this.templateTC.tableId1
                : this.templateTC.viewId1
            }/fields`,
            {
              name: searchname,
            }
          )
          .then(res => {
            res.data.forEach(element => {
              if (element.logicalName && element.logicalName !== null) {
                element.splicingName =
                  element.physicalName + '(' + element.logicalName + ')'
              } else {
                element.splicingName = element.physicalName
              }
            })
            this.columnList1 = res.data
            if (!this.templateTC.tableId2) {
              this.columnList2 = res.data
            }
            // if (which === 1) {
            //   this.templateTC.columnName1 = ''
            //   this.columnList1 = res.data.sort((a, b) => {
            //     return a.physicalName.localeCompare(b.physicalName)
            //   })
            //   if (
            //     this.template.includes('column2') &&
            //     !this.template.includes('table2')
            //   ) {
            //     this.initTemplateColumn(2, tableId)
            //   }
            // } else if (which === 2) {
            //   this.templateTC.columnName2 = ''
            //   this.columnList2 = res.data.sort((a, b) => {
            //     return a.physicalName.localeCompare(b.physicalName)
            //   })
            // }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    initTemplateColumn2(name, type) {
      let searchname = ''
      if (typeof name === 'string') {
        searchname = name
      }
      if (type === 'table2') {
        this.templateTC.tableId2 = name
      } else if (type === 'view2') {
        this.templateTC.viewId2 = name
      }
      if (this.templateTC.tableId2 || this.templateTC.viewId2) {
        this.$http
          .post(
            `${this.$quality_url}/quality/rules/tech/${
              type === 'table2' || this.template.includes('table2')
                ? this.templateTC.tableId2
                : this.templateTC.viewId2
            }/fields`,
            {
              name: searchname,
            }
          )
          .then(res => {
            this.columnList2 = res.data
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    getTemplateList(name) {
      const obj = {
        currentPage: 1,
        pageSize: 50,
        keyword: name,
        ruleClass: '',
        startTime: '',
        endTime: '',
      }
      this.$http
        .post(`${this.$quality_url}/template/query/page`, obj)
        .then(res => {
          this.templateList = res.data.templateList
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getStandardCodeList() {
      this.$http
        .get(`${this.$url}/domains/codes`)
        .then(res => {
          this.standardCodeList = res.data.sort((a, b) => {
            return a.name.localeCompare(b.name)
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    quoteCode(val) {
      this.standardCodes = val
    },
    checkName() {
      this.nameList.forEach(e => {
        if (this.ruleDataObj) {
          if (
            this.form.name === e &&
            this.form.name !== this.ruleDataObj.name
          ) {
            this.$message.warning(
              this.$t('quality.page.qualityRule.detail.nameExists')
            )
            this.form.name = ''
          }
        } else {
          if (this.form.name === e) {
            this.$message.warning(
              this.$t('quality.page.qualityRule.detail.nameExists')
            )
            this.form.name = ''
          }
        }
      })
    },
    handleOk() {
      if (this.dataCompare === 'A') {
        this.form.content = this.templateTC.sql
      } else if (this.dataCompare === 'B') {
        this.$set(this.form, 'formattedContentB', this.templateTC.sql)
      } else {
        this.form.content = this.templateTC.sql
      }
      // this.sqlChange()
      this.showDialog = false
      this.$refs.ruleForm.validateField('content')
    },
    openDialog(value) {
      if (!this.form.targetDB) {
        this.$message.warning(
          this.$t('quality.page.qualityRule.detail.pleaseSelect') +
            this.$t('quality.page.qualityRule.detail.chooseModelCategoryId')
        )
        return
      }
      if (!this.form.modelId) {
        this.$message.warning(
          this.$t('quality.page.qualityRule.detail.pleaseSelect') +
            this.$t('quality.page.qualityRule.detail.targetModelId')
        )
        return
      }
      if (!this.form.schemaName) {
        this.$message.warning(
          this.$t('quality.page.qualityRule.detail.pleaseSelect') +
            this.$t('quality.page.qualityRule.detail.schemaPlaceholder')
        )
        return
      }
      if (value === 'dataB') {
        if (!this.form.modelIdB) {
          this.$message.warning(
            this.$t('quality.page.qualityRule.detail.pleaseSelect') +
              this.$t('quality.page.qualityRule.detail.targetModelId')
          )
          return
        }
      }
      if (value === 'dataA') {
        this.dataCompare = 'A'
      } else if (value === 'dataB') {
        this.dataCompare = 'B'
      } else {
        this.dataCompare = ''
      }
      this.getTemplateList()
      this.showDialog = true
      this.template = ''
      this.templateId = null
      this.initTemplateObj()
    },
    initTemplateObj(sql) {
      // this.standardCodes = []
      // this.isShowTable2 = sql.includes('table2')
      // this.isShowColumn2 = sql.includes('column2')
      this.templateTC = {
        tableName1: '',
        tableId1: '',
        viewName1: '',
        viewId1: '',
        viewId2: '',
        viewName2: '',
        columnName1: '',
        columnId1: '',
        tableName2: '',
        columnName2: '',
        columnLength: null,
        valueRange: '',
        dataRange: '',
        min: null,
        max: null,
        sql: '',
        preRawValue: '',
      }
      this.templateTC.tableName1 = this.form.tableName
      this.templateTC.viewName1 = this.form.tableName
      this.templateTC.tableId1 = this.form.tableId
      this.templateTC.columnName1 = this.form.columnName
      this.templateTC.columnId1 = this.form.columnId
      this.columnList1 = []
      this.columnList2 = []
      this.getParameters()
    },
    templateChange(value) {
      this.templateList.forEach(element => {
        if (element.id === value) {
          this.template = element.sql
        }
      })
    },
    toSql() {
      let sql = this.template
      sql = sql.replace(/\[\[table1]]/g, this.templateTC.tableName1)
      sql = sql.replace(/\[\[column1]]/g, this.templateTC.columnName1)
      if (this.templateTC.viewName1) {
        sql = sql.replace(/\[\[view1]]/g, this.templateTC.viewName1)
      }
      if (this.templateTC.viewName2) {
        sql = sql.replace(/\[\[view2]]/g, this.templateTC.viewName2)
      }
      if (this.templateTC.tableName2) {
        sql = sql.replace(/\[\[table2]]/g, this.templateTC.tableName2)
      }
      if (this.templateTC.columnName2) {
        sql = sql.replace(/\[\[column2]]/g, this.templateTC.columnName2)
      }
      if (this.template.includes('[[num]]')) {
        sql = sql.replace(/\[\[num]]/g, this.templateTC.columnLength)
      }
      if (this.template.includes('[[comp]]')) {
        sql = sql.replace(/\[\[comp]]/g, this.templateTC.valueRange)
        sql =
          this.templateTC.valueRange !== 'BETWEEN'
            ? sql.replace(/\[\[value]]/g, this.templateTC.dataRange)
            : sql.replace(
                /\[\[value]]/g,
                `${this.templateTC.min} AND ${this.templateTC.max}`
              )
      }
      if (this.template.includes('[[presetParameter]]')) {
        sql = sql.replace(
          /\[\[presetParameter]]/g,
          '[[' + this.templateTC.preRawValue + ']]'
        )
      }
      // if (this.template === 6) {
      //   sql = sql.replace(/\(\)/g, `(${JSON.stringify(this.standardCodes)})`)
      //   sql = sql.replace(/\[/g, '')
      //   sql = sql.replace(/\]/g, '')
      // }
      // sql = sql.replace(/\[\[/g, '')
      // sql = sql.replace(/]]/g, '')
      this.templateTC.sql = sql
      // this.templateTC.sql = this.templateTC.sql.replace(/\{\{/g, '[[')
      // this.templateTC.sql = this.templateTC.sql.replace(/}}/g, ']]')
    },
    getTableName(id) {
      if (!id) {
        return
      }
      // this.tableList.forEach(e => {
      //   if (e.objectId === id) {
      //     this.form.tableName = e.physicalName
      //   }
      // })
      this.columnList = []
      this.form.tableName = this.tableList.filter(
        e => e.objectId === id
      )[0].physicalName
      this.getColumnList().then(() => {
        this.getColumnName(this.form.columnId)
      })
    },
    getTableName2(id) {
      if (!id) {
        return
      }
      // this.form.tableName = this.tableList.filter(e => e.objectId === id)[0].physicalName
      this.getColumnList2().then(() => {
        // this.getColumnName(this.rowForm.columnId)
      })
    },
    getFieldArrTableName(id) {
      if (!id) {
        return
      }
      this.fieldArr.forEach(element => {
        if (id.addFieldId === element.addFieldId) {
          element.columnId = ''
          element.columnList = []
        }
      })
    },
    openSelectCode() {
      this.selectCode = true
    },
    getFieldArrColumnName(id) {
      if (!id) {
      }
    },
    getColumnName(id) {
      // this.columnList.forEach(e => {
      //   if (e.objectId === id) {
      //     this.form.columnName = e.physicalName
      //   }
      // })
      if (!id) {
        return
      }
      this.form.columnName = this.columnList.filter(
        e => e.objectId === id
      )[0].physicalName
    },
    test() {
      this.$refs.ruleForm.validate(valid => {
        this.$refs.ruleForm2.validate(valid2 => {
          if (valid && valid2) {
            if (this.form.type !== 'Function') {
              if (this.form.type === 'Regex') {
                var content = ''
                if (!this.form.tableId) {
                  this.$message.warning(
                    this.$t('quality.page.qualityRule.detail.table') +
                      this.$t('quality.page.qualityRule.detail.cannotEmpty')
                  )
                  return
                }
                if (!this.form.columnId) {
                  this.$message.warning(
                    this.$t('quality.page.qualityRule.detail.field') +
                      this.$t('quality.page.qualityRule.detail.cannotEmpty')
                  )
                  return
                }
                var targetColumn = this.form.columnName
                targetColumn = '[' + targetColumn + ']'
                var formattedRegex = this.form.content.replace(/\\/g, '\\\\')
                content =
                  this.form.checkMode +
                  '(' +
                  targetColumn +
                  ", '" +
                  formattedRegex +
                  "')"
                this.form.formattedContent = content
              } else if (
                this.form.type === 'SQL' ||
                this.form.type === 'Compare'
              ) {
                this.form.formattedContent = this.form.content
              } else {
                this.form.content = this.form.formattedContent
              }
              this.testLoading = true
              this.boxLoading = true
              if (this.form.type === 'SQL') {
                this.form.resultTablePks = this.form.sqlPks
              }
              let response = {}
              if (this.form.type === 'Compare') {
                response = Object.assign({}, this.form)
                const objCompare = {
                  sql: this.form.formattedContent,
                  compare: {
                    sql: this.form.formattedContentB,
                    modelId: this.form.modelIdB,
                    sqlPks: this.form.sqlPksB,
                    countTotalSql: this.form.countTotalSqlB,
                  },
                  compareType: this.compareType,
                }
                response.content = JSON.stringify(objCompare)
                response.formattedContent = JSON.stringify(objCompare)
              } else {
                response = this.form
              }
              response.checkCount = true
              this.$http
                .post(`${this.$quality_url}/quality/rule/test`, response)
                .then(res => {
                  this.testLoading = false
                  this.boxLoading = false
                  this.$message.success(
                    this.$t('quality.page.qualityRule.detail.testSuccessful')
                  )
                  this.isSuccess = true
                })
                .catch(e => {
                  this.isSuccess = false
                  this.testLoading = false
                  this.boxLoading = false
                  this.$showFailure(e.response.data.rootErrorMessage)
                })
            } else {
              for (var key in this.fieldArr) {
                if (
                  (this.fieldArr[key].columnId === null ||
                    this.fieldArr[key].columnId === '') &&
                  (this.fieldArr[key].modelId === null ||
                    this.fieldArr[key].modelId === '') &&
                  (this.fieldArr[key].tableId === null ||
                    this.fieldArr[key].tableId === '')
                ) {
                  delete this.fieldArr[key]
                }
              }
              for (let i = 0; i < this.fieldArr.length; i++) {
                if (this.fieldArr[i] === undefined) {
                  this.fieldArr.splice(i, 1)
                  i = i - 1
                }
              }
              this.$refs.ruleForm3.validate(valid3 => {
                this.$refs.ruleForm4.validate(valid4 => {
                  if (valid3 && valid4) {
                    if (this.tipsDataFun === false) {
                      this.tipsData = false
                      let stateColumnId = this.fieldArr.some(
                        (element, index) => {
                          return (
                            element.columnId === null || element.columnId === ''
                          )
                        }
                      )
                      if (
                        ((this.fieldArr.length > 0 &&
                          stateColumnId === false) ||
                          (this.fieldArr.length === 0 &&
                            this.domainArr.length !== 0)) &&
                        this.tipsData === false
                      ) {
                        this.boxLoading = true
                        const parameters = this.encodeParams()
                        const requestBody = {
                          funcTypeId: this.currentFunction.functionModel,
                          funcInstanceName: this.form.name + '函数',
                          parameters: parameters,
                        }
                        this.$http
                          .post(this.$quality_url + '/funcs/new', requestBody)
                          .then(res => {
                            this.boxLoading = false
                            this.funcsNewArr = res.data
                            this.$message.success(
                              this.$t(
                                'quality.page.qualityRule.detail.testSuccessful'
                              )
                            )
                            this.isSuccess = true
                            this.tipsData = false
                          })
                          .catch(e => {
                            this.boxLoading = false
                            this.$showFailure(e)
                          })
                      } else {
                        this.tipsData = true
                      }
                    } else {
                      return false
                      this.tipsDataFun = true
                    }
                  }
                })
              })
            }
          } else {
            return false
          }
        })
      })
    },
    // getCategoryId (id) {
    //   this.form.modelCategoryId = id
    // },
    handleModelCategoryChange() {
      // this.form.buRuleId = null
      // this.form.modelId = null
      this.getSystemIdAndSourceList()
    },
    handleChooseModelChange(val) {},
    selectModelCategoryChange(row) {
      const categoryId = this.$modelCategories.filter(
        e => e.categoryName === row.targetDB
      )[0].categoryId
      this.form.modelCategoryId = 0
      // this.getModelList(categoryId, row)
    },
    getSystemIdAndSourceList() {
      if (!this.form.targetDB) {
        return
      }
      this.form.modelCategoryId = this.$modelCategories.filter(
        e => e.categoryName === this.form.targetDB
      )[0].categoryId
      // this.filterDataSourceList(this.form.modelCategoryId)
      // this.businessRules = this.businessRulesAll.filter(e => e.modelCategoryIds === this.form.modelCategoryId.toString())
      if (this.form.type !== 'Function') {
        this.getModelList()
      }
      // this.getBusinessRulesList(this.buRuleName)
    },
    filterDataSourceList(id) {
      // this.allSystemDataSource.forEach(e => {
      //   if (e.id === id && e.subNodes && e.subNodes.length) {
      //     this.dataSourceList = e.subNodes.sort((a, b) => {
      //       return a.name.localeCompare(b.name)
      //     })
      //   }
      // })
    },
    initTableAndColumn() {
      this.form.tableId = null
      this.form.columnId = null
      this.form.tableName = null
      this.form.columnName = null
      this.columnList = []
      this.tableList = []
      // this.form.schemaName = null
      this.form.resultTablePks = []
      this.getTableList(this.form.binddb)
      this.$refs.ruleForm.validateField('binddb')
    },
    fieldArrColumn(field) {
      this.fieldArr.forEach(element => {
        if (element.addFieldId === field.addFieldId) {
          element.tableId = ''
          element.columnId = ''
          element.tableList = []
          element.columnList = []
          element.schemaArr = []
          element.schema = ''
          element.modelList.forEach(ele => {
            if (ele.modelId === element.modelId) {
              if (ele.connectionInfo.SELECT_SCHEMA) {
                let arr = ele.connectionInfo.SELECT_SCHEMA.split(';')
                arr.forEach((item, index) => {
                  element.schemaArr.push({
                    name: item,
                    id: index,
                  })
                })
              } else {
                let arr = ele.connectionInfo.DATABASE_NAME.split(';')
                arr.forEach((item, index) => {
                  element.schemaArr.push({
                    name: item,
                    id: index,
                  })
                })
              }
            }
          })
        }
      })
      // this.getTableList('',field.modelId)
    },
    initTableAndColumnB() {
      this.form.tableIdB = null
      this.form.columnIdB = null
      this.form.tableNameB = null
      this.form.columnNameB = null
      this.form.resultTablePks = []
      this.getTableList(this.form.modelIdB)
      this.$refs.ruleForm.validateField('modelId')
    },
    ruleTypeChange(value) {
      this.$refs.ruleForm.clearValidate()
      // if (this.form.type === 'Regex' && !this.tableList.length) {
      //   this.getTableList(this.form.modelId)
      // }
      // this.getTableList('')
      // 切换时清空所有sql脱敏相关信息
      this.cols = []
      this.colsA = []
      this.colsB = []
      this.resMapping = '{}'
      this.resMappingA = '{}'
      this.resMappingB = '{}'
      this.realMapping = '[]'
      this.realMappingA = '[]'
      this.realMappingB = '[]'
      this.form.autoGeneratePk = false
    },
    initColumn(tableName) {
      if (typeof tableName === 'string') {
        this.form.tableName = tableName
      }
      this.form.columnId = null
      this.form.columnName = null
      this.form.resultTablePks = []
      this.showTableList = false
    },
    handleParam(type) {
      let response = {}
      if (this.form.type === 'Compare') {
        this.form.resultTablePks = this.form.sqlPks
        response = Object.assign({}, this.form)
        const objCompare = {
          sql: this.form.formattedContent,
          compare: {
            sql: this.form.formattedContentB,
            modelId: this.form.modelIdB,
            sqlPks: this.form.sqlPksB,
            countTotalSql: this.form.countTotalSqlB,
          },
          compareType: this.compareType,
        }
        response.content = JSON.stringify(objCompare)
        response.formattedContent = JSON.stringify(objCompare)
      } else if (this.form.type === 'Function') {
        response = Object.assign({}, this.form)
        const objFunction = {
          funcId: this.funcsNewArr.funcId,
        }
        if (this.domainArr.length > 0) {
          objFunction.domains = {}
          const domainObj = {
            domainCode: this.domainArr[0].domainCode,
            chineseName: this.domainArr[0].chineseName,
            englishName: this.domainArr[0].englishName,
          }
          objFunction.domains[this.domainArr[0].domainId] =
            JSON.stringify(domainObj)
        }
        if (
          this.fieldArr.length > 0 &&
          this.fieldArr[0].columnId !== null &&
          this.fieldArr[0].columnId !== ''
        ) {
          objFunction.columnObject = {}
          this.fieldArr.forEach((element, index) => {
            const eleArr = {
              addFieldId: element.addFieldId,
              columnId: element.columnId,
              delete: element.delete,
              modelId: element.modelId,
              tableId: element.tableId,
              schema: element.schema,
              // targetDB: element.targetDB
            }
            element.modelList.forEach(ele => {
              if (element.modelId === ele.modelId) {
                eleArr.definitionModelId = ele.definition
                eleArr.modelId = ele.modelId
              }
            })
            element.tableList.forEach(ele => {
              if (element.tableId === ele.objectId) {
                eleArr.physicalNameTableId = ele.physicalName
              }
            })
            element.columnList.forEach(ele => {
              if (element.columnId === ele.objectId) {
                eleArr.physicalNameColumnId = ele.physicalName
              }
            })
            objFunction.columnObject[element.columnId] = JSON.stringify(eleArr)
          })
        }
        response.content = JSON.stringify(objFunction)
        response.formattedContent = JSON.stringify(objFunction)
      } else {
        response = this.form
      }
      if (this.$isShort && type && type === 'publish') {
        response.publicState = 'A'
      }
      return response
    },
    submit(type) {
      // this.ruleDataObj  有值时为编辑，否则为新建
      let response = this.handleParam(type)
      if (!this.ruleDataObj) {
        if (this.form.formattedContent.trim().includes(';')) {
          this.form.formattedContent = this.form.formattedContent
            .trim()
            .substring(0, this.form.formattedContent.length - 1)
        }
        this.submitLoading = true
        // this.form.content = this.form.formattedContent
        if (this.form.type === 'SQL' || this.form.type === 'Compare') {
          this.form.resultTablePks = this.form.sqlPks
        }
        if (this.parameterIds) {
          this.form.parameterIds = this.parameterIds
        }
        this.$http
          .post(`${this.$quality_url}/quality/rules/tech`, [response])
          .then(res => {
            this.submitLoading = false
            this.$message.success(
              this.$t('quality.page.qualityRule.detail.createdSuccessfully')
            )
            this.$bus.$emit('refreshRuleList')

            this.saveLineage(parseInt(res.data))
            // this.back()
          })
          .catch(e => {
            this.submitLoading = false
            this.$showFailure(e)
          })
      } else {
        if (
          this.ruleDataObj.copyId ||
          this.ruleDataObj.publicState !== 'A' ||
          this.$isShort
        ) {
          if (this.ruleDataObj.level === 1) {
            this.$http
              .put(
                `${this.$quality_url}/quality/rule/tech/${this.ruleDataObj.id}`,
                response
              )
              .then(res => {
                this.$message.success(
                  this.$t(
                    'quality.page.qualityRule.detail.successfullyModified'
                  )
                )
                this.$bus.$emit('refreshRuleList', 'editRule', 'submit')
                // 保存 sql映射后再退出
                // this.back()
                this.saveLineage()
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else {
            this.$http
              .post(
                `${this.$quality_url}/quality/rule/tech/updateCopy`,
                response
              )
              .then(res => {
                this.$message.success(
                  this.$t(
                    'quality.page.qualityRule.detail.successfullyModified'
                  )
                )
                this.$bus.$emit('refreshRuleList', 'editRule', 'submit')
                this.saveLineage(null, false)
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        } else {
          const obj = {
            techRuleId: this.ruleDataObj.id,
            processState: 'A_TO_A',
            techRule: response,
          }
          this.$http
            .post(
              this.$quality_url + '/quality/rule/tech/createUpdateCopy',
              obj
            )
            .then(res => {
              this.$message.success(
                this.$t('quality.page.qualityRule.detail.successfullyModified')
              )
              this.$bus.$emit('refreshRuleList', 'editRule', 'submit')
              // 保存 sql映射后再退出
              // this.back()
              this.saveLineage()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      }
    },
    preBack() {
      this.$DatablauCofirm(
        this.$t('quality.page.qualityRule.detail.backTips'),
        this.$t('assets.common.tip'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('quality.page.qualityRule.confirm'),
        }
      )
        .then(() => {
          this.back()
        })
        .catch(e => console.info(e))
    },
    back() {
      const name = !this.ruleDataObj
        ? 'add'
        : !this.isSee
        ? 'edit'
        : this.form.name
      this.$emit('back', name)
    },
    sqlChange(value) {
      if (this.form.type !== 'SQL' && this.form.type !== 'Compare') {
        return
      }

      // this.form.content = this.form.formattedContent.trim()
      // const index = this.form.formattedContent.toLowerCase().indexOf('from')
      // if (this.form.content.substring(0, 6).toLowerCase() === 'select') {
      this.form.formattedContent = this.form.content
      // if (!this.form.formattedContent.toLowerCase().includes('from')) {
      //   return
      // }
      // let st = this.form.formattedContent.substring(6, index)
      // let arr = []
      // st.split(',').forEach(e => {
      //   if (e.trim() !== '*') {
      //     if (!e.toUpperCase().includes(' AS ')) {
      //       if (e.trim().indexOf(' ') > -1) {
      //         arr.push(e.trim().substring(e.trim().indexOf(' ') + 1))
      //       } else {
      //         arr.push(e.trim())
      //       }
      //     } else {
      //       if (e.trim().includes(' ')) {
      //         arr.push(e.substring(e.toUpperCase().indexOf(' AS ') + 3).trim())
      //       } else {
      //         arr.push(e.trim())
      //       }
      //     }
      //   }
      // })
      // const arr2 = []
      // arr.forEach(e => {
      //   arr2.push(e.includes('.') ? e.substring(e.indexOf('.') + 1) : e)
      // })
      // if ([...new Set(arr2)].length !== arr2.length) {
      //   this.$message.error('检测到重名列')
      //   this.sqlPksList = []
      //   return
      // }
      // arr = arr2
      // this.sqlPksList = arr
      // this.form.sqlPks = JSON.stringify(this.oldSqlPksList) === JSON.stringify(arr) || this.oldSqlPksList.length === 0 ? this.form.sqlPks : []
      // this.oldSqlPksList = arr
      if (value === 'dataB' && !this.form.modelIdB) {
        this.$message.warning(
          this.$t('quality.page.qualityRule.detail.pleaseSelect') +
            this.$t('quality.page.qualityRule.detail.targetModelId')
        )
        return
      }
      if (value !== 'dataB' && !this.form.modelId) {
        this.$message.warning(
          this.$t('quality.page.qualityRule.detail.pleaseSelect') +
            this.$t('quality.page.qualityRule.detail.targetModelId')
        )
        return
      }
      if (value === 'dataB' && !this.form.formattedContentB) {
        this.$message.warning(
          this.$t('quality.page.qualityRule.detail.rules.content')
        )
        return
      }
      if (value !== 'dataB' && this.form.content === '') {
        this.$message.warning(
          this.$t('quality.page.qualityRule.detail.rules.content')
        )
        return
      }
      this.sqlPksList = []
      this.pksLoading = true
      let response = {}
      if (this.form.type === 'Compare') {
        response.type = 'SQL'
        if (value === 'dataB') {
          response.modelId = this.form.modelIdB
          response.formattedContent = this.form.formattedContentB.trim()
        } else {
          response.modelId = this.form.modelId
          response.formattedContent = this.form.formattedContent.trim()
        }
      } else {
        response = this.form
      }
      response.checkCount = false
      if (this.pksLoading) {
        this.sqlPksList.push({
          value: this.$t('quality.page.qualityRule.detail.getPrimary'),
          label: this.$t('quality.page.qualityRule.detail.getPrimary'),
          disabled: true,
        })
      }
      this.$http
        .post(`${this.$quality_url}/quality/rule/test`, response)
        .then(res => {
          this.pksLoading = false
          this.sqlPksList = []
          res.data.forEach(element => {
            this.sqlPksList.push({
              value: element,
              label: element,
            })
          })
        })
        .catch(e => {
          this.pksLoading = false
          this.$showFailure(e.response.data.rootErrorMessage)
          // this.$message.error(
          //   this.$t('quality.page.qualityRule.detail.failedPrimary')
          // )
          this.sqlPksList = []
        })
      // } else {
      //   if (this.form.content) {
      //     this.$message.warning('请输入以SELECT开头的SQL语句')
      //   }
      // }
    },
    autoPkChange(val) {
      this.rules.sqlPks[0].required = !val
      this.rules.resultTablePks[0].required = !val
      if (val) {
        this.form.resultTablePks = []
        this.form.sqlPks = []
      }
    },
    updateParameterIds(parameterIds) {
      // 更新规则提交时，表单携带的参数列表
      this.parameterIds = parameterIds
    },
    clearFormItems() {
      // 当切换规则编写方式时，清空部分表单
      // if (this.form.type !== 'SQL') {
      //   this.form.content = ''
      // }
      // if (this.form.type !== 'Regex') {
      //   this.form.content = ''
      // }
      // if (this.form.type !== 'Compare') {
      //
      // }

      this.$set(this.form, 'formattedContentB', '')
      this.$set(this.form, 'countTotalSqlB', '')
      this.$set(this.form, 'content', '')
      this.$set(this.form, 'formattedContent', '')
      this.$set(this.form, 'countTotalSql', '')
      this.$set(this.form, 'countProblemSql', '')
      this.currentFunction.params.forEach(i => {
        i.value = ''
      })
      this.$refs.listInRule.setRules([_.cloneDeep(this.form)])
      this.$refs.listInRule.setParameterNamesDirectly([])
    },
    updateParameters() {
      const parameters = this.currentFunction.params
        .filter(i => i.valueType === 'expression')
        .map(i => i.value)
      if (this.$refs.listInRule) {
        this.$refs.listInRule.setRules([_.cloneDeep(this.form)])
        this.$refs.listInRule.setParameterNamesDirectly(parameters)
      }
    },
    getCurrentInfo() {
      this.dataSourceName =
        this.$refs.dataSource.$el.querySelector('input').value
    },
    getCurrentInfo2() {
      this.dataSourceNameA =
        this.$refs.dataSourceA.$el.querySelector('input').value
      this.dataSourceNameB =
        this.$refs.dataSourceB.$el.querySelector('input').value
    },
    /**
     * BUG-fix 20254 返回参数设计多了一个返回tableId 与 应用系统的映射集合，新增了一个函数处理这些
     */
    fillCategoryNames(cols, lineageData) {
      if (lineageData && lineageData.tableCategoryMapping) {
        this.tableCategoryMapping = lineageData.tableCategoryMapping
        cols.forEach(col => {
          col.categoryName = lineageData.tableCategoryMapping[col.tableId]
        })
      }
    },
    getSqlresult() {
      this.tableLoading = true
      this.$http
        .get(
          `${this.$quality_url}/quality/rules/${this.ruleDataObj.id}/lineage`
        )
        .then(res => {
          this.currentSqlResultVer = res.data.version
          this.currentSqlResultId = res.data.id
          if (this.form.type === 'SQL') {
            if (!res) {
              return
            }
            if (res.data.realMapping) {
              this.getTableIdMap(JSON.parse(res.data.realMapping))
              this.cols = this.obj2Arr(JSON.parse(res.data.resMapping))
              this.fillCategoryNames(this.cols, res.data)
            }
            this.getSchemaList()
            this.tableLoading = false
            return
          } else if (this.form.type === 'Compare') {
            if (!res) {
              return
            }
            if (res.data.realMapping) {
              this.getTableIdMap(JSON.parse(res.data.realMapping))
              this.obj2Arr(JSON.parse(res.data.resMapping), true, true)
              this.fillCategoryNames(this.colsA, res.data)
              this.fillCategoryNames(this.colsB, res.data)
            }
            this.getSchemaListB()
            this.tableLoading = false
            return
          }
        })
        .catch(err => {
          console.error(err)
          this.currentSqlLineageErrMsg = err.response.message
        })
    },
    createSqlResult(isCompareSql = null) {
      if (!this.form.modelId) {
        return
      }
      this.currentSqlLineageErrMsg = ''
      this.tableLoading = true
      let sql = this.form.content
      let modelId = this.form.modelId
      if (this.form.type === 'Compare' && isCompareSql === false) {
        sql = this.form.formattedContentB
        modelId = this.form.modelIdB
      }
      this.$http
        .post(`${this.$quality_url}/quality/rules/sql/lineage`, {
          modelId,
          sql,
          isCompareSql,
        })
        .then(res => {
          if (!res.data || res.data === '') {
            res.data = {
              realMapping: 'null',
              resMapping: 'null',
            }
          }
          this.getTableIdMap(JSON.parse(res.data.realMapping) || [])
          if (this.form.type === 'SQL') {
            this.cols = this.obj2Arr(JSON.parse(res.data.resMapping))
            this.fillCategoryNames(this.cols, res.data)
            this.getSchemaList()
          } else if (this.form.type === 'Compare') {
            if (isCompareSql) {
              this.colsA = this.obj2Arr(JSON.parse(res.data.resMapping), true)
              this.fillCategoryNames(this.colsA, res.data)
              this.getSchemaList()
            } else {
              this.colsB = this.obj2Arr(JSON.parse(res.data.resMapping), true)
              this.fillCategoryNames(this.colsB, res.data)
              this.getSchemaListB()
            }
          }
          this.tableLoading = false
        })
        .catch(err => {
          this.tableLoading = false
          // this.currentSqlLineageErrMsg =
          //   `错误：${err.response.data.errorMessage}` || '错误：sql解析出错'
          console.error(err)
        })
    },
    getTableIdMap(arr) {
      this.tableIdMap = {}
      arr.forEach(v => {
        let strArr = v.split('.')
        this.tableIdMap[strArr[1]] = strArr[0]
      })
    },
    saveChangeCol() {
      let row = this.currentRow
      let form = this.rowForm
      let cols = this.cols
      row.col = form.currentcolName
      row.id = form.columnId
      row.tableId = form.tableId
      row.schema = this.currentSchema
      row.table = form.currentTableName
      this.cols = _.cloneDeep(cols)
      this.rowDialogShow = false
    },
    saveLineage(ruleId) {
      let cols =
        this.form.type === 'Compare' ? this.colsA.concat(this.colsB) : this.cols
      this.arr2resMapping(cols)
      this.arr2realMapping(cols)
      this.tableLoading = true
      this.$http
        .post(`${this.$quality_url}/quality/rules/save/lineage`, {
          modelId: this.form.modelId,
          techRuleId: ruleId || this.ruleDataObj.id,
          realMapping: JSON.stringify(this.realMapping),
          resMapping: JSON.stringify(this.resMapping),
          version: this.currentSqlResultVer || '',
          id: this.currentSqlResultId || '',
          tableCategoryMapping: this.tableCategoryMapping,
        })
        .then(res => {
          this.back()
        })
        .catch(err => {
          console.error(err)
        })
    },
    handleOptClick(tableName) {
      // 获得选中的表名字 后续处理resMapping用
      this.rowForm.currentTableName = tableName
    },
    handleColClick(colName) {
      // 获得选中的字段名字
      this.rowForm.currentcolName = colName
    },
    handleSqlModelChange(isInitTableAndColumn = true) {
      if (this.form.type === 'SQL') {
        this.createSqlResult()
      }
      if (this.form.type === 'Compare') {
        this.createSqlResult(true)
      }
      if (isInitTableAndColumn) {
        this.initTableAndColumn()
      }
    },
    handleSqlModelChangeB() {
      this.createSqlResult(false)
      this.initTableAndColumnB()
    },
    delelteCol(idx, type) {
      if (type === 'A') {
        // this.colsA.splice(idx, 1)
        let { output, outputDisplay } = this.colsA[idx]
        let newObj = {
          col: '',
          id: '',
          output,
          outputDisplay,
          schema: '',
          table: '',
          tableId: '',
        }
        this.$set(this.colsA, idx, newObj)
        return
      }
      if (type === 'B') {
        // this.colsB.splice(idx, 1)
        let { output, outputDisplay } = this.colsB[idx]
        let newObj = {
          col: '',
          id: '',
          output,
          outputDisplay,
          schema: '',
          table: '',
          tableId: '',
        }
        this.$set(this.colsB, idx, newObj)
        return
      }
      // this.cols.splice(idx, 1)
      let { output, outputDisplay } = this.cols[idx]
      let newObj = {
        col: '',
        id: '',
        output,
        outputDisplay,
        schema: '',
        table: '',
        tableId: '',
      }
      this.$set(this.cols, idx, newObj)
    },
    changeCol(row, type) {
      // this.tableList.forEach(v => {
      //   if (v.name === 'ACL_CLASS') {
      //     console.log(v)
      //   }
      // })
      this.isDataB = type === 'B'
      this.currentRow = row
      let tableId = parseInt(row.tableId) || ''
      // this.tableList.some(v => {
      //   if (v.physicalName.toLowerCase() === row.table) {
      //     tableId = v.objectId
      //     return true
      //   }
      // })
      if (this.schemaList.some(v => v === row.schema.toUpperCase())) {
        this.currentSchema = row.schema.toUpperCase()
      }
      this.getAllTableList(
        this.isDataB ? this.form.modelIdB : this.form.modelId,
        this.currentSchema
      )
      this.rowForm = {
        schema: row.schema,
        output: row.outputDisplay || row.output,
        tableId,
        currentTableName: row.table,
        columnId: parseInt(row.id) || '',
        categoryName: row.categoryName,
      }
      this.getTableName2(tableId)
      this.rowDialogShow = true
    },
    getSchemaList() {
      this.modelList.some(v => {
        if (this.form.modelId === v.modelId) {
          let schemas = v.reverseOptions.SELECT_SCHEMA
            ? v.reverseOptions.SELECT_SCHEMA
            : v.reverseOptions.DATABASE_NAME
          this.schemaList = schemas.split(';')
          return true
        }
      })
    },
    getSchemaListB() {
      this.modelList.some(v => {
        if (this.form.modelIdB === v.modelId) {
          let schemas = v.reverseOptions.SELECT_SCHEMA
            ? v.reverseOptions.SELECT_SCHEMA
            : v.reverseOptions.DATABASE_NAME
          this.schemaList = schemas.split(';')
          return true
        }
      })
    },
    handleSchemaChange(val) {
      this.rowForm.tableId = ''
      this.rowForm.columnId = ''
      this.columnList3 = []
      this.getAllTableList(
        this.isDataB ? this.form.modelIdB : this.form.modelId,
        val
      )
    },
    obj2Arr(obj, isCompare = false, isDivAB = false) {
      let arr = []
      let arr2 = []
      if (!obj) {
        return []
      }
      for (let key in obj) {
        let ele = {
          output: key,
          outputDisplay: isCompare ? key.slice(3) : key,
          id: '',
          table: '',
          col: '',
        }
        for (let colId in obj[key]) {
          let strArr = obj[key][colId].split('.')
          ele.id = colId
          ele.schema = strArr[0].toUpperCase()
          ele.table = strArr[1].toUpperCase()
          ele.col = strArr[2].toUpperCase()
          ele.tableId = this.tableIdMap[colId]
          if (isDivAB && key.indexOf('a_')) {
            arr.push(ele)
          } else if (isDivAB && key.indexOf('b_')) {
            arr2.push(ele)
          } else {
            arr.push(ele)
          }
        }
      }
      if (isDivAB) {
        this.colsA = arr.sort((a, b) => a.output.localeCompare(b.output))
        this.colsB = arr2.sort((a, b) => a.output.localeCompare(b.output))
        return []
      }
      arr.sort((a, b) => a.output.localeCompare(b.output))
      return arr
    },
    arr2obj(arr) {
      let obj = {}
      arr.forEach(v => {
        if (Array.isArray(obj[v.output])) {
          obj[v.output].push(v.id)
        } else {
          obj[v.output] = [v.id]
        }
      })
      return obj
    },
    arr2realMapping(arr) {
      this.realMapping = arr.map(v => {
        return `${v.tableId}.${v.id}.${v.col}`
      })
    },
    arr2resMapping(arr) {
      this.resMapping = {}
      arr.forEach(v => {
        if (!this.resMapping[v.output]) {
          this.resMapping[v.output] = {}
        }
        this.resMapping[v.output][v.id] = `${v.schema}.${v.table}.${v.col}`
      })
    },
    updateCountTotalSqlFormRules() {
      if (this.form.type === 'Compare') {
        this.rules.countTotalSql[0].required =
          this.compareType !== 'A_CONTAINS_B'
        this.rules.countTotalSqlB[0].required =
          this.compareType !== 'B_CONTAINS_A'
        this.rules.binddb[0].required = false
      } else if (this.form.type === 'Regex') {
        this.rules.binddb[0].required = true
      } else {
        this.rules.countTotalSql[0].required = true
        this.rules.binddb[0].required = false
      }
      this.rules.sqlPks[0].required = !this.form.autoGeneratePk
      this.rules.resultTablePks[0].required = !this.form.autoGeneratePk
    },
  },
  computed: {
    bigClass() {
      return this.form.bigClassSelectOption
    },
    // smallClassList () {
    //   let arr = []
    //   switch (this.form.bigClass) {
    //     case 1:
    //       arr = [{label: '空值检查', value: 1}]; break
    //     case 2:
    //       arr = [{label: '一致性检查', value: 2}]; break
    //     case 3:
    //       arr = [{label: '主外键关联检查', value: 3}]; break
    //     case 4:
    //       arr = [{label: '唯一性检查', value: 4}]; break
    //     case 6:
    //       arr = [{label: '长度检查', value: 6}, {label: '取值精度', value: 8}]; break
    //     case 7:
    //       arr = [{label: '值域检查', value: 7}]; break
    //   }
    //   return arr
    // }
    toSqlDisabled() {
      let bool = false
      if (!this.template) {
        bool = true
      }
      const checkArr = []
      // const checkArr = ['tableName1', 'columnName1']
      if (this.template.includes('table1')) {
        checkArr.push('tableName1')
      }
      if (this.template.includes('column1')) {
        checkArr.push('columnName1')
      }
      if (this.template.includes('view1')) {
        checkArr.push('viewName1')
      }
      if (this.template.includes('view2')) {
        checkArr.push('viewName2')
      }
      if (this.template.includes('table2')) {
        checkArr.push('tableName2')
      }
      if (this.template.includes('column2')) {
        checkArr.push('columnName2')
      }
      if (this.template.includes('[[num]]')) {
        checkArr.push('columnLength')
      }
      if (this.template.includes('[[comp]]')) {
        if (this.templateTC.valueRange !== 'BETWEEN') {
          checkArr.push('dataRange')
        } else {
          checkArr.push('min')
          checkArr.push('max')
        }
      }
      checkArr.forEach(e => {
        if (!this.templateTC[e]) {
          bool = true
        }
      })
      return bool
    },
    //   filterTables() {
    //     if (!this.currentSchema) {
    //       return this.allTableList
    //     }
    //     return this.allTableList.filter(
    //       v => this.currentSchema.toUpperCase() === v.schema
    //     )
    //   },
  },
  watch: {
    // fieldArr: {
    //   handler(value) {
    //     this.isSuccess = false
    //     if (value.length > 0) {
    //       value.forEach(element => {
    //         if (element.columnId !== null && element.columnId !== '') {
    //           this.tipsData = false
    //         } else {
    //           this.tipsData = true
    //         }
    //       })
    //     } else {
    //       this.tipsData = false
    //     }
    //   },
    //   deep: true,
    // },

    currentFunction: {
      handler(newValue) {
        this.isSuccess = false
        const flag = true
        for (let i = 0; i < newValue.params.length; i++) {
          if (newValue.params[i].required) {
            if (newValue.params[i].value === '') {
              this.tipsDataFun = flag
              return false
            } else {
              this.tipsDataFun = false
            }
          } else {
            this.tipsDataFun = false
          }
        }
      },
      deep: true,
    },
    domainArr: {
      handler(value) {
        this.isSuccess = false
        if (value.length > 0) {
          this.tipsData = false
        }
      },
      deep: true,
    },
    template(value) {
      if (value === 6) {
        // this.getStandardCodeList()
      }
    },
    form: {
      handler(value) {
        this.isSuccess = false
        if (value.type === 'Function') {
          this.getParameters()
        }
      },
      deep: true,
    },
    ruleDataObj: {
      handler(value) {
        this.getRuleDataObj()
      },
      deep: true,
      immediate: true,
    },
    'form.type': {
      handler(newVal, oldVal) {
        this.updateCountTotalSqlFormRules()
        if (newVal && oldVal) {
          this.clearFormItems()
        }
        this.updateParameters()
      },
      immediate: true,
    },
    'form.autoGeneratePk': {
      handler(newVal, oldVal) {
        this.updateCountTotalSqlFormRules()
      },
      immediate: true,
    },
    'form.content'(value) {
      if (this.$refs.listInRule && this.form.type !== 'Function') {
        this.$refs.listInRule.setRules([_.cloneDeep(this.form)])
        this.$refs.listInRule.setSql(value, 'formattedContent')
      }
    },
    'form.formattedContentB'(value) {
      if (this.$refs.listInRule && value) {
        this.$refs.listInRule.setRules([_.cloneDeep(this.form)])
        this.$refs.listInRule.setSql(value, 'formattedContentB')
      }
    },
    'form.countTotalSql'(value) {
      if (this.$refs.listInRule) {
        this.$refs.listInRule.setRules([_.cloneDeep(this.form)])
        this.$refs.listInRule.setSql(value, 'countTotalSql')
      }
    },
    'form.countProblemSql'(value) {
      if (this.$refs.listInRule) {
        this.$refs.listInRule.setRules([_.cloneDeep(this.form)])
        this.$refs.listInRule.setSql(value, 'countProblemSql')
      }
    },
    compareType: {
      immediate: true,
      handler() {
        this.updateCountTotalSqlFormRules()
      },
    },
    // 'form.preScript' (value) {
    //   if (this.$refs.listInRule) {
    //     this.$refs.listInRule.setSql(value, 'preScript')
    //   }
    // },
    // 'form.postScript' (value) {
    //   if (this.$refs.listInRule) {
    //     this.$refs.listInRule.setSql(value, 'postScript')
    //   }
    // }
  },
  beforeMount() {
    document.onkeyup = e => {
      if (e.ctrlKey && e.key === 'Delete') {
        // if (!this.form.modelId) {
        //   alert('请选择目标数据源')
        //   return
        // }
        // if (!this.form.content) {
        //   alert('请填写识别内容')
        //   return
        // }
        if (this.form.type === 'SQL') {
          this.getCurrentInfo()
          this.tableDialog = true
          return
        }
        if (this.form.type === 'Compare') {
          this.getCurrentInfo2()
          this.tableDialogB = true
        }
      }
    }
  },
  beforeDestroy() {
    this.$bus.$off('domainSelected')
    setTimeout(() => {
      this.deleteArr.forEach(item => {
        if (typeof this[item] === 'object' && this[item]) {
          Object.keys(this[item]).forEach(o => {
            this[item][o] = null
          })
        }
        this[item] = null
      })
      if (window.CollectGarbage) {
        window.CollectGarbage()
      }
    })
    document.onkeyup = null
  },
}
