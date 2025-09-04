<template>
  <div class="addOrEdit-content">
    <datablau-form-submit>
      <el-form
        style="margin-top: 64px; margin-left: 20px; margin-right: 20px"
        ref="form"
        :model="form"
        label-width="180px"
        :rules="rules"
        v-if="way === 'edit' || way === 'add'"
      >
        <el-form-item
          :label="$t('quality.page.ruleTemplate.templateName')"
          prop="name"
        >
          <datablau-input
            v-model="form.name"
            class="maxlengthInput"
            ref="name"
            maxlength="40"
            style="width: 500px"
            :disabled="way === 'detail'"
            show-word-limit
            :placeholder="$version.ruleTemplate.placeholder.inputTemplateName"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="$t('quality.page.ruleTemplate.detailRuleClass')"
          required
          prop="class"
        >
          <datablau-radio v-model="form.class" :disabled="way === 'detail'">
            <el-radio
              v-for="item in classTypes"
              :label="item.id"
              :key="item.id"
            >
              {{ item.optionValue }}
            </el-radio>
          </datablau-radio>
        </el-form-item>
        <el-form-item
          :label="$t('quality.page.ruleTemplate.databaseType')"
          prop="type"
        >
          <datablau-select
            size="mini"
            v-model="form.type"
            :placeholder="
              $t('quality.page.ruleTemplate.databaseTypePlaceholder')
            "
            @change="dbTypeWrapSelected"
            filterable
            style="width: 500px"
            test-name="ruleTemplate_databaseType"
          >
            <el-option
              v-for="item in $allPlugins"
              :key="item.dbType"
              :label="item.dbLabel"
              :value="item.dbType"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item
          :label="$t('quality.page.ruleTemplate.content')"
          prop="sql"
        >
          <div class="button-content" v-if="way === 'edit' || way === 'add'">
            <datablau-button
              style="margin-left: 10px; height: 24px; line-height: 22px"
              type="secondary"
              @click="insertSql('[[table1]]')"
            >
              {{ $t('quality.page.ruleTemplate.tableName1') }}
            </datablau-button>
            <datablau-button
              style="height: 24px; line-height: 22px"
              type="secondary"
              @click="insertSql('[[table2]]')"
            >
              {{ $t('quality.page.ruleTemplate.tableName2') }}
            </datablau-button>
            <datablau-button
              style="height: 24px; line-height: 22px"
              type="secondary"
              @click="insertSql('[[column1]]')"
            >
              {{ $t('quality.page.ruleTemplate.fieldName1') }}
            </datablau-button>
            <datablau-button
              style="height: 24px; line-height: 22px"
              type="secondary"
              @click="insertSql('[[column2]]')"
            >
              {{ $t('quality.page.ruleTemplate.fieldName2') }}
            </datablau-button>
            <datablau-button
              style="height: 24px; line-height: 22px"
              type="secondary"
              @click="insertSql('[[presetParameter]]')"
            >
              {{ $t('quality.page.ruleTemplate.presetParameter') }}
            </datablau-button>
            <datablau-button
              style="height: 24px; line-height: 22px"
              type="secondary"
              @click="insertSql('[[view1]]')"
            >
              {{ $t('quality.page.ruleTemplate.view1') }}
            </datablau-button>
            <datablau-button
              style="height: 24px; line-height: 22px"
              type="secondary"
              @click="insertSql('[[view2]]')"
            >
              {{ $t('quality.page.ruleTemplate.view2') }}
            </datablau-button>
          </div>
          <el-input
            clearable
            type="textarea"
            :autosize="{ minRows: 12, maxRows: 12 }"
            class="sql"
            id="sqlTemplate"
            maxlength="4096"
            size="small"
            ref="sqlContent"
            style="width: 780px"
            :placeholder="$t('quality.page.ruleTemplate.contentPlaceholder')"
            :disabled="way === 'detail'"
            v-model="form.sql"
            test-name="ruleTemplate_sql"
          ></el-input>
        </el-form-item>
      </el-form>
      <div class="footer-button" slot="buttons">
        <div v-if="way === 'edit' || way === 'add'" class="button-box">
          <datablau-button type="important" @click="test('form')">
            {{ $t('quality.page.ruleTemplate.test') }}
          </datablau-button>
          <datablau-button
            type="important"
            @click="commitForm('form')"
            :disabled="disabledConfirm || !classTypes.length"
            test-name="ruleTemplate_confirm"
          >
            {{ $t('quality.page.ruleTemplate.confirm') }}
          </datablau-button>
          <datablau-button
            type="secondary"
            @click="cancel"
            test-name="ruleTemplate_cancel"
          >
            {{ $t('quality.page.ruleTemplate.cancel') }}
          </datablau-button>
        </div>
      </div>
    </datablau-form-submit>
    <datablau-dialog
      class="jobs-sta"
      width="600px"
      :title="$t('quality.page.ruleTemplate.generatesql.title')"
      :visible.sync="showDialog"
      append-to-body
      @close="showDialogClose"
      :close-on-click-modal="false"
      style="position: relative; overflow-x: hidden"
    >
      <el-form
        :label-width="$i18n.locale === 'zh' ? '100px' : '120px'"
        style="max-height: 60vh; overflow: auto"
        :model="formSql"
        :rules="rulesSql"
      >
        <el-form-item
          :label="$t('quality.page.ruleTemplate.generatesql.item.dataSource')"
          required
        >
          <datablau-select
            ref="dataSource"
            style="width: 90%; margin-right: 4%; display: inline-block"
            v-model="formSql.modelId"
            :placeholder="
              $t('quality.page.ruleTemplate.generatesql.placeholder.dataSource')
            "
            @clear="initTableAndColumn"
            @change="handleSqlModelChange"
            filterable
            clearable
          >
            <el-option
              v-for="item in modelList"
              :key="item.modelId"
              :label="item.definition"
              :value="item.modelId"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item
          v-if="form.sql.includes('table1')"
          required
          :label="$t('quality.page.ruleTemplate.generatesql.item.table1')"
        >
          <el-select
            filterable
            style="width: 90%; margin-right: 4%"
            v-model="templateTC.tableId1"
            size="small"
            :placeholder="
              $t('quality.page.ruleTemplate.generatesql.placeholder.tableName1')
            "
            remote
            reserve-keyword
            :remote-method="getTableList"
            @focus="getTableList('', '', 'table')"
            @change="changeTableList('tableName1')"
          >
            <el-option
              v-for="item in tableList"
              :key="item.objectId"
              :label="item.physicalName"
              @click.native="initTemplateColumn(item.objectId, 'table1')"
              :value="item.objectId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="form.sql.includes('view1')"
          required
          :label="$t('quality.page.ruleTemplate.generatesql.item.view1')"
        >
          <el-select
            filterable
            style="width: 90%; margin-right: 4%"
            v-model="templateTC.viewId1"
            size="small"
            :placeholder="
              $t('quality.page.ruleTemplate.generatesql.placeholder.viewName1')
            "
            remote
            reserve-keyword
            :remote-method="getTableList"
            @focus="getTableList('', '', 'view')"
            @change="changeTableList('viewName1')"
          >
            <el-option
              v-for="item in tableList"
              :key="item.objectId"
              :label="item.physicalName"
              @click.native="initTemplateColumn(item.objectId, 'view1')"
              :value="item.objectId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="form.sql.includes('column1')"
          required
          :label="$t('quality.page.ruleTemplate.generatesql.item.field1')"
        >
          <el-select
            filterable
            clearable
            style="width: 90%"
            v-model="templateTC.columnName1"
            size="small"
            :placeholder="
              $t('quality.page.ruleTemplate.generatesql.placeholder.fieldName1')
            "
            remote
            reserve-keyword
            :remote-method="initTemplateColumn"
          >
            <el-option
              v-for="item in columnList1"
              :key="item.objectId"
              :label="item.physicalName"
              :value="item.physicalName"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="form.sql.includes('table2')"
          :label="$t('quality.page.ruleTemplate.generatesql.item.table2')"
          required
        >
          <el-select
            filterable
            style="width: 90%"
            v-model="templateTC.tableId2"
            size="small"
            :placeholder="
              $t('quality.page.ruleTemplate.generatesql.placeholder.tableName2')
            "
            remote
            reserve-keyword
            :remote-method="getTableList"
            @focus="getTableList('', '', 'table')"
            @change="changeTableList('tableName2')"
          >
            <el-option
              v-for="item in tableList"
              :key="item.objectId"
              :label="item.physicalName"
              @click.native="initTemplateColumn2(item.objectId, 'table2')"
              :value="item.objectId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="form.sql.includes('view2')"
          required
          :label="$t('quality.page.ruleTemplate.generatesql.item.view2')"
        >
          <el-select
            filterable
            style="width: 90%; margin-right: 4%"
            v-model="templateTC.viewId2"
            size="small"
            :placeholder="
              $t('quality.page.ruleTemplate.generatesql.placeholder.viewName2')
            "
            remote
            reserve-keyword
            :remote-method="getTableList"
            @focus="getTableList('', '', 'view')"
            @change="changeTableList('viewName2')"
          >
            <el-option
              v-for="item in tableList"
              :key="item.objectId"
              :label="item.physicalName"
              @click.native="initTemplateColumn2(item.objectId, 'view2')"
              :value="item.objectId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="form.sql.includes('column2')"
          :label="$t('quality.page.ruleTemplate.generatesql.item.field2')"
          required
        >
          <el-select
            clearable
            filterable
            style="width: 90%"
            v-model="templateTC.columnName2"
            size="small"
            :placeholder="
              $t('quality.page.ruleTemplate.generatesql.placeholder.fieldName2')
            "
            remote
            reserve-keyword
            :remote-method="initTemplateColumn2"
          >
            <el-option
              v-for="item in columnList2"
              :key="item.objectId"
              :label="item.physicalName"
              :value="item.physicalName"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="form.sql.includes('[[presetParameter]]')"
          :label="
            $t('quality.page.ruleTemplate.generatesql.item.parameterCode')
          "
          required
        >
          <el-select
            v-model="templateTC.preRawValue"
            size="small"
            :placeholder="
              $t(
                'quality.page.ruleTemplate.generatesql.placeholder.pleaseSelect'
              )
            "
            style="width: 90%"
            filterable
            clearable
          >
            <el-option
              v-for="item in preRawData"
              :key="item.value"
              :label="item.name"
              :value="item.name"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="form.sql.includes('[[comp]]')"
          :label="$t('quality.page.ruleTemplate.generatesql.item.rangeOptions')"
          required
        >
          <el-select
            v-model="templateTC.valueRange"
            size="small"
            :placeholder="
              $t(
                'quality.page.ruleTemplate.generatesql.placeholder.pleaseSelect'
              )
            "
            style="width: 90%"
            filterable
            clearable
          >
            <el-option
              v-for="item in valueRangeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="form.sql.includes('[[comp]]')"
          :label="$t('quality.page.ruleTemplate.generatesql.item.dataRange')"
          required
        >
          <el-input
            clearable
            v-if="templateTC.valueRange !== 'BETWEEN'"
            style="width: 90%"
            v-model="templateTC.dataRange"
            type="number"
            size="small"
            maxlength="256"
            :placeholder="
              $t('quality.page.ruleTemplate.generatesql.placeholder.number')
            "
          ></el-input>
          <el-input
            clearable
            v-if="templateTC.valueRange === 'BETWEEN'"
            style="width: 42%; margin-right: 5.5%"
            v-model="templateTC.min"
            type="number"
            size="small"
            maxlength="256"
            :placeholder="
              $t('quality.page.ruleTemplate.generatesql.placeholder.lowerLimit')
            "
          ></el-input>
          <el-input
            clearable
            v-if="templateTC.valueRange === 'BETWEEN'"
            style="width: 42%"
            v-model="templateTC.max"
            type="number"
            size="small"
            maxlength="256"
            :placeholder="
              $t('quality.page.ruleTemplate.generatesql.placeholder.upperLimit')
            "
          ></el-input>
        </el-form-item>
        <el-form-item
          v-if="form.sql.includes('[[num]]')"
          :label="$t('quality.page.ruleTemplate.generatesql.item.fieldLength')"
          required
        >
          <el-input
            clearable
            style="width: 90%"
            v-model="templateTC.columnLength"
            type="number"
            size="small"
            maxlength="256"
            :placeholder="
              $t(
                'quality.page.ruleTemplate.generatesql.placeholder.numberLength'
              )
            "
          ></el-input>
        </el-form-item>
        <datablau-button
          type="important"
          :disabled="toSqlDisabled"
          @click="toSql"
          :style="{ marginLeft: $i18n.locale === 'zh' ? '18%' : '120px' }"
        >
          {{ $t('quality.page.ruleTemplate.generatesql.title') }}
        </datablau-button>
        <el-form-item
          :label="$t('quality.page.ruleTemplate.generatesql.item.generatedsql')"
        >
          <el-input
            clearable
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8 }"
            style="width: 90%; margin-top: 10px"
            maxlength="4096"
            size="small"
            :placeholder="
              $t(
                'quality.page.ruleTemplate.generatesql.placeholder.pleaseEnterSql'
              )
            "
            v-model="templateTC.sql"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <datablau-button type="secondary" @click="showDialog = false">
          {{ $t('quality.page.ruleTemplate.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          :disabled="toSqlDisabled || !templateTC.sql"
          @click="handleOk"
        >
          {{ $t('quality.page.ruleTemplate.confirm') }}
        </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
import HTTP from '@/http/main.js'

export default {
  props: ['way', 'formData', 'nameList'],
  name: 'addOrEdit',
  data() {
    return {
      form: {
        name: '',
        class: '',
        sql: '',
        type: '',
      },
      disabledConfirm: false,
      rules: {
        name: [
          {
            required: true,
            message: this.$version.ruleTemplate.placeholder.inputTemplateName,
            trigger: 'blur',
          },
        ],
        class: [
          {
            required: true,
            message: this.$t('quality.page.ruleTemplate.fillRuleType'),
            trigger: 'change',
          },
        ],
        sql: [
          {
            required: true,
            message:
              this.$version.ruleTemplate.placeholder.inputTemplateContent,
            trigger: 'change',
          },
        ],
        type: [
          {
            required: true,
            message: '请选择数据库类型',
            trigger: 'change',
          },
        ],
      },
      originFormStr: '',
      maxName: '',
      isExist: false,
      deleteArr: ['form', 'rules'],
      sqlDBTypesArr: [
        { label: 'Oracle', value: 'ORACLE' },
        { label: 'SQL Server', value: 'SQLSERVER' },
        { label: 'MySQL', value: 'MYSQL' },
        { label: 'OceanBase', value: 'OCEANBASE' },
        { label: 'OceanBase-Oracle', value: 'OCEANBASEO' },
        { label: 'PostgreSQL', value: 'POSTGRESQL' },
        { label: 'Polar-DB', value: 'POLARDB' },
        { label: 'PolarDBO', value: 'POLARDBO' },
        { label: 'PolarDBMySQL', value: 'POLARDBMYSQL' },
        { label: 'GaussDB', value: 'GAUSSDB' },
        { label: 'GaussDB/A', value: 'GAUSSDBA' },
        { label: 'Greenplum', value: 'GREENPLUM' },
        { label: 'DB2', value: 'DB2' },
        { label: 'DB2 for iSeries', value: 'DB2I' },
        { label: 'GBase', value: 'GBASE' },
        { label: 'Hana', value: 'HANA' },
        // {label: 'ODPS', value:  'ODPS'},
        { label: 'MaxCompute', value: 'MAXCOMPUTE' },
        { label: 'Teradata', value: 'TERADATA' },
        { label: 'ClickHouse', value: 'CLICKHOUSE' },
        { label: 'Vertica', value: 'VERTICA' },
        { label: 'CirroData', value: 'CIRRODATA ' },
        { label: 'Phoenix', value: 'PHOENIX' },
        { label: 'TiDB', value: 'TIDB' },
        // { label: 'Inceptor', value: 'INCEPTOR' },
        { label: 'MariaDB', value: 'MARIADB' },
        { label: 'DB2LUW', value: 'DB2LUW' },
        { label: 'DaMeng', value: 'DAMENG' },
        { label: 'OceanBaseMySQL', value: 'OCEANBASEMYSQL' },
        { label: 'Hologres', value: 'HOLOGRES' },
        { label: 'OpenGauss', value: 'OPENGAUSS' },
        // { label: '自定义', value: 'CUSTOMIZED' },
        { label: 'HBASE', value: 'HBASE' },
        { label: 'Hive', value: 'HIVE' },
        { label: 'Transwarp-Inceptor', value: 'INCEPTOR' },
        { label: 'FusionInsight', value: 'FUSIONINSIGHT' },
        { label: 'Impala', value: 'IMPALA' },
        { label: 'MongoDB', value: 'MONGODB' },
        { label: 'Elasticsearch', value: 'ES' },
      ],
      formSql: {
        modelId: null,
      },
      rulesSql: {},
      showDialog: false,
      modelList: [],
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
      tableList: [],
      columnList1: [],
      columnList2: [],
      valueRangeList: [
        { label: '大于', value: '>' },
        { label: '等于', value: '=' },
        { label: '小于', value: '<' },
        { label: '大于等于', value: '>=' },
        { label: '小于等于', value: '<=' },
        { label: '区间', value: 'BETWEEN' },
      ],
      testSql: true,
      preRawData: [],
      curType: '',
      classTypes: [],
    }
  },
  computed: {
    sqlDbTypesWithOffline() {
      const result = _.cloneDeep(this.sqlDBTypesArr)
      result.push({
        label: '离线生产库',
        value: 'OFFLINEDUMP',
      })
      result.push({ label: '离线生产库ex', value: 'OFFLINEDUMP_RAW' })
      return result
    },
    toSqlDisabled() {
      let bool = false
      if (!this.form.sql) {
        bool = true
      }
      const checkArr = []
      // const checkArr = ['tableName1', 'columnName1']
      if (this.form.sql.includes('table1')) {
        checkArr.push('tableName1')
      }
      if (this.form.sql.includes('column1')) {
        checkArr.push('columnName1')
      }
      if (this.form.sql.includes('table2')) {
        checkArr.push('tableName2')
      }
      if (this.form.sql.includes('view1')) {
        checkArr.push('viewName1')
      }
      if (this.form.sql.includes('view2')) {
        checkArr.push('viewName2')
      }
      if (this.form.sql.includes('column2')) {
        checkArr.push('columnName2')
      }
      if (this.form.sql.includes('[[num]]')) {
        checkArr.push('columnLength')
      }
      if (this.form.sql.includes('[[comp]]')) {
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
  },
  methods: {
    getClassType() {
      HTTP.getSelectionOptions({
        requestBody: {
          category: 'TR',
          names: ['规则大类'],
        },
      })
        .then(res => {
          let data = res.data
          if (!data || !Array.isArray(data)) {
            data = []
          }
          this.classTypes = data
          if (!data.length) {
            this.$message.warning({
              message: this.$t(
                'quality.page.dataQualityRules.rules.noTypeTips'
              ),
              showClose: true,
              duration: 0,
            })
          } else {
            this.form.class = data[0].id
          }
          if (this.formData?.ruleClass) {
            this.form.class = this.formData.ruleClass
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 数据源
    getModelList() {
      this.$http
        .get(`${this.$meta_url}/service/models/fromre/`)
        .then(res => {
          this.modelList = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    initTableAndColumn() {
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
      }
      this.columnList1 = []
      this.columnList2 = []
    },
    handleSqlModelChange() {
      // this.getTableList()
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
      }
      this.columnList1 = []
      this.columnList2 = []
    },
    getTableList(tableName, id, type) {
      if (!this.formSql.modelId) {
        this.tableList = []
        return
      }
      return new Promise(resolve => {
        const obj = {
          currentPage: 1,
          keyword: tableName === this.formSql.modelId ? '' : tableName,
          modelIds: this.formSql.modelId ? [this.formSql.modelId] : null,
          pageSize: 1000,
          tagIds: null,
          // types: ['TABLE'],
        }
        if (type === 'table') {
          obj.types = ['TABLE']
        } else if (type === 'view') {
          obj.types = ['VIEW']
        } else {
          obj.types = ['TABLE', 'VIEW']
        }
        this.$http
          // .post(`${this.$url}/service/entities/search`, obj)
          .post(this.$meta_url + '/entities/searchMetadata', obj)
          .then(res => {
            let _this = this
            if (
              this.formSql.tableId !== null &&
              this.formSql.tableId !== undefined
            ) {
              let findtableId = res.data.content.find(function (obj) {
                return obj.objectId === _this.formSql.tableId
              })
              if (findtableId === undefined) {
                res.data.content.push({
                  objectId: this.formSql.tableId,
                  splicingName: this.formSql.tableName,
                })
              }
            }
            res.data.content.forEach(element => {
              if (element.logicalName !== null) {
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
    },
    changeTableList(type) {
      this.tableList.forEach(t => {
        if (
          t.objectId === this.templateTC.tableId1 ||
          t.objectId === this.templateTC.viewId1
        ) {
          this.templateTC[type] = t.physicalName
        }
      })
    },
    initTemplateColumn(name, type) {
      this.curType = type || this.curType
      let searchname = ''
      if (typeof name === 'string') {
        searchname = name
      }
      /* if (this.curType === 'table1') {
        this.templateTC.tableId1 = name
      } else if (this.curType === 'view1') {
        this.templateTC.viewId1 = name
      } */
      if (this.templateTC.tableId1 || this.templateTC.viewId1) {
        this.$http
          .post(
            `${this.$quality_url}/quality/rules/tech/ ${
              this.curType === 'table1'
                ? this.templateTC.tableId1
                : this.templateTC.viewId1
            }/fields`,
            {
              name: searchname,
            }
          )
          .then(res => {
            this.columnList1 = res.data
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    initTemplateColumn2(name, type) {
      this.curType = type || this.curType
      let searchname = ''
      if (typeof name === 'string') {
        searchname = name
      }
      /* if (type === 'table2') {
        this.templateTC.tableId2 = name
      } else if (type === 'view2') {
        this.templateTC.viewId2 = name
      } */
      if (this.templateTC.tableId2 || this.templateTC.viewId2) {
        this.$http
          .post(
            `${this.$quality_url}/quality/rules/tech/${
              this.curType === 'table2'
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
    toSql() {
      let sql = this.form.sql
      sql = sql.replace(/\[\[table1]]/g, this.templateTC.tableName1)
      sql = sql.replace(/\[\[column1]]/g, this.templateTC.columnName1)
      if (this.templateTC.tableName2) {
        sql = sql.replace(/\[\[table2]]/g, this.templateTC.tableName2)
      }
      if (this.templateTC.viewName1) {
        sql = sql.replace(/\[\[view1]]/g, this.templateTC.viewName1)
      }
      if (this.templateTC.viewName2) {
        sql = sql.replace(/\[\[view2]]/g, this.templateTC.viewName2)
      }
      if (this.templateTC.columnName2) {
        sql = sql.replace(/\[\[column2]]/g, this.templateTC.columnName2)
      }
      if (this.form.sql.includes('[[num]]')) {
        sql = sql.replace(/\[\[num]]/g, this.templateTC.columnLength)
      }
      if (this.form.sql.includes('[[comp]]')) {
        sql = sql.replace(/\[\[comp]]/g, this.templateTC.valueRange)
        sql =
          this.templateTC.valueRange !== 'BETWEEN'
            ? sql.replace(/\[\[value]]/g, this.templateTC.dataRange)
            : sql.replace(
                /\[\[value]]/g,
                `${this.templateTC.min} AND ${this.templateTC.max}`
              )
      }
      if (this.form.sql.includes('[[presetParameter]]')) {
        sql = sql.replace(
          /\[\[presetParameter]]/g,
          '[[' + this.templateTC.preRawValue + ']]'
        )
      }

      // sql = sql.replace(/\[\[/g, '')
      // sql = sql.replace(/]]/g, '')
      this.templateTC.sql = sql
      // this.templateTC.sql = this.templateTC.sql.replace(/\{\{/g, '[[')
      // this.templateTC.sql = this.templateTC.sql.replace(/}}/g, ']]')
    },
    handleOk() {
      this.$http
        .post(`${this.$quality_url}/template/test`, {
          content: this.templateTC.sql,
          modelId: this.formSql.modelId,
        })
        .then(res => {
          if (res.data === true) {
            this.$datablauMessage({
              message: this.$t('quality.page.ruleTemplate.message.success'),
              type: 'success',
            })
            this.showDialogClose()
          } else {
            this.$datablauMessage({
              message: this.$t('quality.page.ruleTemplate.message.fail'),
              type: 'error',
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    test() {
      this.$refs.form.validateField('sql', valid => {
        if (!valid) {
          this.showDialog = true
          this.getModelList()
          this.getParameters()
        } else {
          return false
        }
      })
    },
    getParameters() {
      this.$http
        .get(this.$quality_url + '/parameters/')
        .then(res => {
          res.data.sort((a, b) => b.paramId - a.paramId)
          this.preRawData = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    dbTypeWrapSelected(val) {
      // console.log(val, '111')
    },
    showDialogClose() {
      this.showDialog = false
      this.formSql.modelId = null
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
      }
    },
    cancel() {
      if (this.way === 'edit') {
        if (JSON.stringify(this.form) !== this.originFormStr) {
          this.$confirm(
            this.$version.ruleTemplate.tell.isGiveUp,
            this.$version.ruleTemplate.tell.info,
            {
              confirmButtonText: this.$version.ruleTemplate.name.confirm,
              cancelButtonText: this.$version.ruleTemplate.name.cancel,
              type: 'warning',
            }
          )
            .then(() => {
              this.$bus.$emit('cancel')
            })
            .catch(() => {})
        } else {
          this.$bus.$emit('cancel')
        }
      } else {
        this.$bus.$emit('cancel')
      }
    },
    insertSql(st) {
      const oTxt1 = document.getElementById('sqlTemplate')
      let cursurPosition = -1
      if (oTxt1.selectionStart) {
        // 非IE浏览器
        cursurPosition = oTxt1.selectionStart
      } else {
        // IE
        try {
          var range = document.selection.createRange()
        } catch (e) {
          this.$message.warning(
            this.$t('quality.page.ruleTemplate.message.insertError')
          )
          return
        }
        range.moveStart('character', -oTxt1.value.length)
        cursurPosition = range.text.length
      }
      const st1 = this.form.sql.substring(0, cursurPosition)
      const st2 = this.form.sql.substring(cursurPosition)
      this.form.sql = st1 + ' ' + st + ' ' + st2
      this.$refs.sqlContent.focus()
    },
    commitForm(form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          this.checkName()
          if (this.isExist) {
            return
          }
          this.disabledConfirm = true
          const obj = {
            templateName: this.form.name,
            ruleClass: parseInt(this.form.class),
            sql: this.form.sql,
            creator: this.$user.username,
            creatorName: this.$user.firstName,
            type: this.form.type,
            // createTime: this.getNow(),
            // updateTime: this.getNow()
          }
          if (this.way === 'add') {
            this.$http
              .post(`${this.$quality_url}/template/create`, obj)
              .then(res => {
                if (res) {
                  this.$message({
                    message: this.$t(
                      'quality.page.ruleTemplate.message.addSuccess'
                    ),
                    type: 'success',
                  })
                  this.cancel() // 回到列表页
                }
              })
              .catch(e => {
                this.disabledConfirm = false
                this.$showFailure(e)
              })
          }
          if (this.way === 'edit') {
            obj.id = this.formData.id
            this.$http
              .post(`${this.$quality_url}/template/update`, obj)
              .then(res => {
                if (res) {
                  this.$message({
                    message: this.$t(
                      'quality.page.ruleTemplate.message.editSuccess'
                    ),
                    type: 'success',
                  })
                  this.$bus.$emit('cancel') // 回到列表页
                }
              })
              .catch(e => {
                this.disabledConfirm = false
                this.$showFailure(e)
              })
          }
        } else {
          return false
        }
      })
    },
    checkName() {
      let has = false
      this.nameList.forEach(e => {
        if (this.way === 'edit') {
          if (
            this.form.name === e &&
            this.form.name !== this.formData.templateName
          ) {
            this.$message.warning(
              this.$t('quality.page.ruleTemplate.message.namerepeat', {
                name: this.form.name,
              })
            )
            // this.$refs.name.focus()
            has = true
          }
        } else {
          if (this.form.name === e) {
            this.$message.warning(
              this.$t('quality.page.ruleTemplate.message.namerepeat', {
                name: this.form.name,
              })
            )
            // this.$refs.name.focus()
            has = true
          }
        }
      })
      this.isExist = has
    },
    getDefaultName() {
      return new Promise(resolve => {
        this.$http
          .get(`${this.$quality_url}/template/name`)
          .then(res => {
            resolve(res.data)
          })
          .catch(e => {
            this.$message.error('获取默认名字失败')
          })
      })
    },
    // getNow(){
    //   const y = new Date().getFullYear();
    //   const m = (new Date().getMonth() + 1).toString().padStart(2, '0');
    //   const d = (new Date().getDate()).toString().padStart(2, '0');
    //   const hh = (new Date().getHours()).toString().padStart(2, '0');
    //   const mm = (new Date().getMinutes()).toString().padStart(2, '0');
    //   const ss = (new Date().getSeconds()).toString().padStart(2, '0');
    //   // return y + '-' + m + '-' + d;
    //   return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss;
    // }
    updateForm() {
      this.form.name = this.formData.templateName
      this.form.class = this.formData.ruleClass
      this.form.sql = this.formData.sql
      this.originFormStr = JSON.stringify(this.form)
    },
  },
  created() {
    this.getClassType()
  },
  mounted() {
    if (this.way === 'edit' || this.way === 'detail') {
      this.form.name = this.formData.templateName
      this.form.class = this.formData.ruleClass
      this.form.sql = this.formData.sql
      this.form.type = this.formData.type
      this.originFormStr = JSON.stringify(this.form)
    } else {
      this.getDefaultName().then(res => {
        this.form.name = res
      })
      // this.getMax()
    }
  },
  beforeDestroy() {
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
    }, 3000)
  },
  watch: {
    formData() {
      this.updateForm()
    },
  },
}
</script>
<style lang="scss">
.addOrEdit-content {
  .el-form-item {
    margin-bottom: 16px;
  }
  .el-textarea__inner {
    border-radius: 0 0 4px 4px;
  }
  .seeDetail {
    .el-form-item {
      margin-bottom: 0;
    }
  }
}
</style>
<style lang="scss" scoped>
.addOrEdit-content {
  .button-content {
    width: 780px;
    height: 34px;
    border: 1px solid #dcdfe6;
    border-bottom: none;
  }
}
.name {
  width: 20vw;
}
.sql {
  width: 30vw;
}
.insert {
  transform: scale(0.8);
  border-radius: 6px;
  margin-bottom: 2px;
  width: 10vw;
  min-width: 105px;
}
.insert:nth-child(1) {
  transform: scale(0.8) translateX(6px);
}
.button {
  margin-top: 10px;
}
.rightButton {
  display: inline-block;
  width: 10vw;
  vertical-align: top;
}
</style>
