<template>
  <div class="tab-page edit-code-node" v-loading="loading">
    <send-mail-confirm
      ref="sendMailConfirm"
      @ifSendMail="ifSendMail"
    ></send-mail-confirm>
    <div class="content-outer">
      <datablau-form-submit>
        <el-collapse
          v-model="showArr"
          @change="changeCollapse"
          style="border-top: none; margin-left: 20px"
        >
          <el-collapse-item name="codeDetail">
            <template slot="title">
              <div class="collapse-title">
                <h4>{{ $t('domain.code.codeInfoTab') }}</h4>
              </div>
            </template>
            <datablau-form
              label-width="190px"
              :model="editCode"
              :rules="editRules"
              ref="codeFrom"
            >
              <el-form-item
                class="message-form-item"
                :label="$t('domain.common.standardTheme')"
                prop="datasetName"
              >
                <el-autocomplete
                  size="small"
                  style="width: 300px"
                  clearable
                  class="inline-input"
                  :maxlength="20"
                  v-model="editCode.datasetName"
                  :fetch-suggestions="querySearch"
                  :placeholder="$t('domain.code.themePlaceholder')"
                ></el-autocomplete>
              </el-form-item>
              <el-form-item
                class="message-form-item"
                :label="$t('domain.code.codePropCode')"
                prop="code"
              >
                <datablau-input
                  size="small"
                  :maxlength="20"
                  v-model="editCode.code"
                  class="dia-input-item"
                  :placeholder="$t('domain.code.codePropCodePlaceholder')"
                  clearable
                  :disabled="isEdit || autoCode"
                  :disabledGrey="isEdit || autoCode"
                  :style="{
                    width:
                      isEdit || !(!isEdit && categoryId === 1 && useDam)
                        ? '300px'
                        : '200px',
                  }"
                ></datablau-input>
                <datablau-checkbox
                  v-if="!isEdit && categoryId === 1 && useDam"
                  :checkboxType="'single'"
                  v-model="autoCode"
                  @change="autoCodeChange"
                  :disabled="!autoCodeDisabled"
                  style="display: inline-block; margin-left: 10px"
                >
                  {{ $t('domain.code.autoCreate') }}
                </datablau-checkbox>
              </el-form-item>
              <el-form-item
                class="message-form-item"
                :label="$t('domain.code.cName')"
                prop="name"
              >
                <datablau-input
                  size="small"
                  :maxlength="30"
                  v-model="editCode.name"
                  class="dia-input-item"
                  :placeholder="$t('domain.code.namePlaceholder')"
                  clearable
                ></datablau-input>
              </el-form-item>
              <el-form-item
                class="message-form-item"
                :label="$t('domain.code.enName')"
              >
                <datablau-input
                  size="small"
                  :maxlength="30"
                  v-model="editCode.enName"
                  class="dia-input-item"
                  :placeholder="$t('domain.code.enNamePlaceholder')"
                  clearable
                ></datablau-input>
              </el-form-item>
              <el-form-item
                class="message-form-item"
                :label="$t('domain.common.remark')"
              >
                <datablau-input
                  size="small"
                  :maxlength="50"
                  v-model="editCode.comment"
                  class="dia-input-item"
                  :placeholder="$t('domain.code.remarkPlaceholder')"
                  clearable
                ></datablau-input>
              </el-form-item>
              <el-form-item
                class="message-form-item"
                :label="$t('domain.code.codeMapping')"
                v-if="categoryId !== 1"
              >
                <datablau-input
                  size="small"
                  :maxlength="50"
                  v-model="editCode.refStdCode"
                  class="dia-input-item"
                  :placeholder="$t('domain.code.codeMappingPlaceholder')"
                  clearable
                  @focus="handleChooseRefCode"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                class="message-form-item"
                :label="udp.name"
                v-for="(udp, index) in udps.filter(
                  e => e.catalog === $t('domain.domain.standardProp')
                )"
                :key="index"
                :prop="udp.udpId + ''"
              >
                <datablau-input
                  style="width: 300px"
                  v-if="udp.dataType === 'String'"
                  type="textarea"
                  :autosize="{ minRows: 2 }"
                  v-model="additionalPropertiesObj[udp.udpId]"
                  :placeholder="$version.domain.placeholder.property"
                ></datablau-input>
                <datablau-select
                  style="width: 300px"
                  v-if="
                    Array.isArray(udp.candidates) && udp.dataType === 'List'
                  "
                  v-model="additionalPropertiesObj[udp.udpId]"
                  :placeholder="$version.domain.placeholder.property"
                >
                  <el-option
                    v-for="item in udp.candidates"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </datablau-select>
              </el-form-item>
            </datablau-form>
          </el-collapse-item>
          <el-collapse-item name="codeValue">
            <template slot="title">
              <div class="collapse-title">
                <h4>{{ $t('domain.code.codeValue') }}</h4>
              </div>
            </template>
            <div
              class="table-container"
              :class="{ 'table-add-min-height': tableShowPagination }"
            >
              <datablau-button
                style="padding-left: 0"
                type="text"
                @click="addColumn"
              >
                <i class="el-icon-circle-plus"></i>
                {{ $t('domain.code.addCodeValue') }}
              </datablau-button>
              <datablau-table class="datablau-table thin" :data="showTableData">
                <el-table-column
                  :label="$t('domain.code.order')"
                  prop="order"
                  :width="$i18n.locale === 'en' ? 140 : 80"
                  align="center"
                >
                  <template slot="header" slot-scope="scope">
                    <span class="star">*</span>
                    <span>{{ $t('domain.code.order') }}</span>
                  </template>
                  <template slot-scope="scope">
                    <!--<span>{{ scope.row.order }}</span>-->
                    <datablau-input
                      v-model="scope.row.order"
                      size="mini"
                      style="width: 60px"
                    ></datablau-input>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('domain.code.codeValueCode')"
                  prop="value"
                  :min-width="100"
                  show-overflow-tooltip
                >
                  <template slot="header" slot-scope="scope">
                    <span class="star">*</span>
                    <span>{{ $t('domain.code.codeValueCode') }}</span>
                  </template>
                  <template slot-scope="scope">
                    <datablau-input
                      v-if="isEdit"
                      v-model="scope.row.value"
                      size="mini"
                    ></datablau-input>
                    <datablau-input
                      v-else
                      v-model="scope.row.value"
                      size="mini"
                    ></datablau-input>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('domain.code.codeValueName')"
                  prop="name"
                  :min-width="150"
                  show-overflow-tooltip
                >
                  <template slot="header" slot-scope="scope">
                    <span class="star">*</span>
                    <span>{{ $t('domain.code.codeValueName') }}</span>
                  </template>
                  <template slot-scope="scope">
                    <datablau-input
                      v-if="isEdit"
                      v-model="scope.row.name"
                      size="mini"
                    ></datablau-input>
                    <datablau-input
                      v-else
                      v-model="scope.row.name"
                      size="mini"
                    ></datablau-input>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('domain.code.parentCodeValue')"
                  :min-width="150"
                >
                  <template slot-scope="scope">
                    <datablau-select
                      size="mini"
                      clearable
                      filterable
                      v-model="scope.row.parentValue"
                      @visible-change="
                        parentValueChange($event, scope.row, false)
                      "
                      :placeholder="
                        $t('domain.code.parentCodeValuePlaceholder')
                      "
                    >
                      <el-option
                        v-for="item in parentValueOptions"
                        v-if="showSelectCode === scope.row"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                        :disabled="item.disabled"
                      ></el-option>
                    </datablau-select>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('domain.code.mappingCodeValueCode')"
                  :min-width="170"
                  v-if="categoryId !== 1"
                >
                  <template slot-scope="scope">
                    <datablau-select
                      size="mini"
                      clearable
                      filterable
                      v-if="scope.row.hasOwnProperty('refCodeValue')"
                      v-model="scope.row.refCodeValue"
                      :placeholder="
                        $t('domain.code.mappingCodeValueCodePlaceholder')
                      "
                      @change="mappingCodeValueCode(scope.$index, scope.row)"
                    >
                      <el-option
                        v-for="item in refCodeValues"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      ></el-option>
                    </datablau-select>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="categoryId !== 1"
                  :min-width="$i18n.locale === 'zh' ? 130 : 180"
                  :label="$t('domain.code.mappingCodeName')"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ refCodeMapName.get(scope.row.refCodeValue) }}
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('domain.code.mappingCodeValueName')"
                  prop="order"
                  :min-width="100"
                  show-overflow-tooltip
                  v-if="false"
                >
                  <template slot-scope="scope">
                    <datablau-input
                      v-if="isEdit"
                      v-model="scope.row.order"
                      size="mini"
                    ></datablau-input>
                    <datablau-input
                      v-else
                      v-model="scope.row.order"
                      size="mini"
                    ></datablau-input>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('domain.code.remark1')"
                  prop="definition"
                  :min-width="150"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    <datablau-input
                      v-if="isEdit"
                      v-model="scope.row.definition"
                      size="mini"
                    ></datablau-input>
                    <datablau-input
                      v-else
                      v-model="scope.row.definition"
                      size="mini"
                    ></datablau-input>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('domain.code.remark2')"
                  prop="definition"
                  :min-width="150"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    <datablau-input
                      v-if="isEdit"
                      v-model="scope.row.definition2"
                      size="mini"
                    ></datablau-input>
                    <datablau-input
                      v-else
                      v-model="scope.row.definition2"
                      size="mini"
                    ></datablau-input>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('domain.code.remark3')"
                  prop="definition"
                  :min-width="150"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    <datablau-input
                      v-if="isEdit"
                      v-model="scope.row.definition3"
                      size="mini"
                    ></datablau-input>
                    <datablau-input
                      v-else
                      v-model="scope.row.definition3"
                      size="mini"
                    ></datablau-input>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('domain.common.operation')"
                  fixed="right"
                  :width="80"
                >
                  <template slot-scope="scope">
                    <datablau-button
                      type="icon"
                      class="iconfont icon-delete"
                      @click="deleteRow(scope.row)"
                    ></datablau-button>
                  </template>
                </el-table-column>
              </datablau-table>
              <div class="pagination-outer" v-if="tableShowPagination">
                <datablau-pagination
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                  :current-page="filterObj.currentPage"
                  :page-sizes="[20, 50, 100]"
                  :page-size="filterObj.pageSize"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="codeValueCount"
                ></datablau-pagination>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
        <template slot="buttons">
          <datablau-button
            size="small"
            type="primary"
            @click="saveEditCode(row && row.isUpdate)"
            :disabled="
              disabledEditCon ||
              (udps.length > 0 && this.additionalPropertiesRequired)
            "
            :loading="submitLoading"
          >
            {{
              row && row.isUpdate
                ? $t('domain.common.submit')
                : $t('domain.common.confirm')
            }}
          </datablau-button>
          <datablau-button
            type="secondary"
            class="white-btn"
            @click="removetab"
          >
            {{ $t('common.button.cancel') }}
          </datablau-button>
        </template>
      </datablau-form-submit>
    </div>

    <code-select></code-select>
  </div>
</template>

<script>
import sendMailConfirm from './sendMailConfirm.vue'
import HTTP from '@/http/main.js'
import Vue from 'vue'
import codeSelect from '@/view/newDataStandard/codeSelect.vue'

// TODO i18n
let noRowsOverlayComponent = {
  template:
    '<div class="msg-container"><div class="msg-inner"> 暂无数据，点击创建新数据</div></div>',
  data() {
    return {
      supterComponent: null,
    }
  },
  mounted() {
    this.supterComponent = this.params.supterComponent
  },
  methods: {},
}
noRowsOverlayComponent = Vue.extend(noRowsOverlayComponent)
export default {
  props: {
    isEdit: {
      type: Boolean,
    },
    row: {
      type: Object,
    },
    useWorkflow: {
      type: Boolean,
      default: true,
    },
    udps: {},
  },
  data() {
    return {
      additionalPropertiesRequired: true,
      additionalProperties: [],
      additionalPropertiesObj: {},
      additionalPropertiesObjInitial: null,
      editCode: {
        code: '',
        name: '',
        enName: '',
        datasetName: '',
        '@class': 'com.datablau.service.dto.CodeDto',
        state: 'A',
        value: [],
        comment: '',
        refStdCode: '',
      },
      editRules: {
        name: [
          {
            required: true,
            message: this.$t('domain.code.nameNotEmpty'),
            trigger: 'blur',
          },
        ],
        code: [
          {
            required: true,
            message: this.$t('domain.code.codePropCodeNotEmpty'),
            trigger: 'blur',
          },
        ],
        datasetName: [
          {
            required: true,
            message: this.$t('domain.code.codeThemeNotEmpty'),
            trigger: 'change',
          },
        ],
      },
      editData: null,
      codeValue: [],
      showArr: ['codeDetail', 'codeValue'],
      // disabledEditCon: true,

      // value table
      totalShow: 0,
      num: 0,
      columnDefs: [],
      hideTopLine: true,
      defaultParaData: {},
      tableOption: null,
      propMap: {
        name: this.$t('domain.code.cName'),
        enName: this.$t('domain.code.enName'),
        value: this.$t('domain.code.codeValueCode'),
        order: this.$t('domain.code.order'),
        parentValue: this.$t('domain.code.codeValueParent'),
        definition: this.$t('domain.code.remark1'),
        definition2: this.$t('domain.code.remark2'),
        definition3: this.$t('domain.code.remark3'),
      },
      themeCategoryArr: [],
      submitLoading: false,
      parentValueOptions: [],
      filterObj: {
        currentPage: 1,
        pageSize: 50,
      },
      loading: false,
      showSelectCode: '',
      refStdCodeDetail: {},
      // 映射代码 的 代码取值
      refCodeValues: [],
      refCodeValueMap: {},
      autoCodeDisabled: null,
      autoCode: false,
      refCodeMapName: new Map(),
    }
  },
  components: {
    sendMailConfirm,
    codeSelect,
  },
  computed: {
    useDam() {
      return this.headerProduction && this.headerProduction === 'dam'
    },
    disabledEditCon() {
      if (this.autoCode === true) {
        let bool = true
        bool =
          !this.editCode.name ||
          !this.editCode.datasetName ||
          !this.testValueItem()
        return bool
      } else {
        let bool = true
        bool =
          !this.editCode.name ||
          !this.editCode.code ||
          !this.editCode.datasetName ||
          !this.testValueItem()
        return bool
      }
    },
    showAddFirst() {
      let bool = false
      if (this.codeValue && this.codeValue.length === 0) {
        bool = true
      }
      return bool
    },
    gszcCustomer() {
      return this.$customerId === 'gszc'
    },
    // 当前标准代码的 代码取值列表
    tableParentValue() {
      let arr = (this.isEdit ? this.editCode.values : this.editCode.value) || []
      const valueMap = {}
      arr.forEach(item => {
        if (item.value) {
          valueMap[item.value] = item.value
        }
      })
      arr.forEach(item => {
        if (item.refValue) {
          // refValue 是 对象, 包含整个代码取值
          // refCodeValue 是 字符串, 只包含代码取值的 value 字段
          item.refCodeValue = item.refValue.value ? item.refValue.value : ''
        } else {
          item.refCodeValue = item.refCodeValue ? item.refCodeValue : ''
        }
        // 父编码取值 未匹配到 编码取值, 清空 父编码取值
        if (!valueMap[item.parentValue]) {
          item.parentValue = ''
        }
      })
      this.$utils.sort.sort(arr, 'order')
      return arr
    },
    codeValueCount() {
      return this.tableParentValue ? this.tableParentValue.length || 0 : 0
    },
    tableShowPagination() {
      return this.codeValueCount > 50
    },
    showTableData() {
      if (!this.tableParentValue) return []
      let s = this.filterObj.pageSize
      let c = this.filterObj.currentPage
      return this.tableParentValue.slice(s * (c - 1), s * c)
    },
  },

  beforeMount() {
    this.loading = true
    if (this.isEdit) {
      this.getCodeDetail()
    } else {
      this.codeValue = []
      this.totalShow = this.codeValue.length
      this.loading = false
    }
    this.getThemeCategoryArr()
    this.dataInit()
    this.initAgGrid()
  },
  mounted() {
    this.$bus.$on('setCurrentDatasetName', val => {
      if (val) {
        this.editCode.datasetName = val
      }
    })
    this.getFindState()
    this.udps.forEach(e => {
      this.$set(this.additionalPropertiesObj, e.udpId, null)
      if (e.required) {
        let validator = (rule, value, callback) => {
          if (!this.additionalPropertiesObj[e.udpId]) {
            callback(
              new Error(
                this.$t('domain.common.itemRequiredInput', { name: e.name })
              )
            )
          } else {
            callback()
          }
        }
        this.$set(this.editRules, e.udpId, {
          required: true,
          trigger: 'blur',
          message: this.$t('domain.common.itemRequiredInput', { name: e.name }),
          validator,
        })
      }
    })
  },
  beforeDestroy() {
    this.$bus.$off('setCurrentDatasetName')
  },
  watch: {
    'editCode.values': {
      handler(val) {
        this.parentValueOptions = []
        val.forEach(element => {
          if (element.value !== '') {
            this.parentValueOptions.push({
              value: element.value,
              label: element.value,
            })
          }
        })
      },
      deep: true,
    },
    'editCode.value': {
      handler(val) {
        if (val) {
          this.parentValueOptions = []
          val.forEach(element => {
            if (element.value !== '') {
              this.parentValueOptions.push({
                value: element.value,
                label: element.value,
              })
            }
          })
        }
      },
      deep: true,
    },
    additionalPropertiesObj: {
      handler(value) {
        this.additionalPropertiesRequired = this.udps.some(e => {
          return e.required && !this.additionalPropertiesObj[e.udpId]
        })
      },
      deep: true,
    },
  },
  inject: ['categoryId', 'headerProduction'],
  methods: {
    autoCodeChange(value) {
      if (value === true) {
        this.editCode.code = ''
        this.$set(this.editRules, 'code', [{ required: false }])
        this.$refs.codeFrom.validateField('code')
      } else {
        this.$set(this.editRules, 'code', [
          {
            required: true,
            message: this.$t('domain.code.codePropCodeNotEmpty'),
            trigger: 'blur',
          },
        ])
      }
    },
    getFindState() {
      HTTP.getfindState({ domainType: 'STANDARD_CODE' })
        .then(res => {
          this.autoCodeDisabled = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    mappingCodeValueCode(index, row) {
      let code = this.refCodeValues.find(
        item => item.value === row.refCodeValue
      )
      this.$set(row, 'refValue', code)
      // this.$set(row.referCode, '')
      // this.$set(this.showTableData, index, row)
    },
    parentValueChange(callback, row, refreshData = false) {
      this.showSelectCode = row
      this.parentValueOptions.forEach(element => {
        if (element.value === row.value) {
          if (callback) {
            this.$set(element, 'disabled', true)
          } else {
            this.$set(element, 'disabled', false)
          }
        }
      })
      refreshData && (this.editCode.values = _.cloneDeep(this.editCode.values))
      refreshData && (this.editCode.value = _.cloneDeep(this.editCode.value))
    },
    getCodeDetail() {
      // this.$http
      //   .get(
      //     `${this.$url}/service/domains/codes/content?codeNumber=${this.row.code}`
      //   )
      HTTP.getCodeContent({
        codeNumber: this.row.code,
        categoryId: this.categoryId,
      })
        .then(res => {
          this.editCode = res.data
          if (!this.editCode.values || !Array.isArray(this.editCode.values)) {
            this.editCode.values = []
          }
          this.editCode.values.sort(function (a, b) {
            return a.order - b.order
          })
          this.editCode.values.forEach(element => {
            this.parentValueOptions.push({
              value: element.value,
              label: element.value,
            })
          })
          this.loading = false
          this.getRefCodeDetail(this.editCode.refStdCode)
          if (res.data.additionalProperties?.length) {
            res.data.additionalProperties.forEach(e => {
              this.additionalPropertiesObj[e[0]] = e[1]
            })
          }
          this.additionalPropertiesObjInitial = _.cloneDeep(
            this.additionalPropertiesObj
          )
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getThemeCategoryArr() {
      HTTP.getCodeDatasetName({ categoryId: this.categoryId })
        .then(res => {
          res.data.forEach(e => {
            const obj = {
              value: e,
            }
            this.themeCategoryArr.push(obj)
          })
          // this.themeCategoryArr = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleChooseRefCode() {
      this.$bus.$emit('callDomainCodeSelector')
      this.$bus.$once('domainCodeSelected', code => {
        // console.log(code, 'code')
        this.$set(this.editCode, 'refStdCode', code.code)
        this.getRefCodeDetail(code.code)
      })
    },
    getRefCodeDetail(codeNumber) {
      if (!codeNumber) return
      HTTP.getCodeContent({
        codeNumber,
      })
        .then(res => {
          this.refStdCodeDetail = res.data
          let valuesArr = res.data.values || []
          this.refCodeValues = valuesArr
          valuesArr.forEach(element => {
            this.refCodeMapName.set(element.value, element.name)
          })
          let valueMap = {}
          valuesArr.forEach(item => {
            valueMap[item.value] = item
          })
          this.refCodeValueMap = valueMap
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    saveCode(urlAdd, code, newCodes) {
      return HTTP.updateCodeService(newCodes)
    },
    initAgGrid() {
      const valueLength = this.codeValue.length

      const tableOption = {
        rowSelection: 'single',
        suppressRowClickSelection: true,
        noRowsOverlayComponent: 'noRowsOverlayComponent',
        noRowsOverlayComponentParams: {
          supterComponent: this,
        },
        frameworkComponents: {
          noRowsOverlayComponent: noRowsOverlayComponent,
        },
      }
      this.tableOption = tableOption
    },
    isInteger(obj) {
      return Math.floor(obj) === obj
    },
    saveEditCode(isUpdate) {
      const tableObj = this.isEdit ? this.editCode.values : this.editCode.value
      let errMsg = ''
      tableObj.forEach(item => {
        let o = item.order - 0
        if (isNaN(o) || !this.isInteger(o) || o <= 0) {
          errMsg = this.$t('domain.code.orderRule')
        }
      })
      if (errMsg) {
        this.$datablauMessage(errMsg)
        return
      }

      if (isUpdate) {
        this.updateCodeApply()
      } else {
        this.ifSendMail({
          emailForDam: false,
          emailForDdm: false,
        })
      }
      // if (this.isEdit) {
      //   this.$refs.sendMailConfirm && this.$refs.sendMailConfirm.showDailog();
      // } else {
      //   this.ifSendMail({
      //     emailForDam: false,
      //     emailForDdm: false
      //   });
      // }
    },
    ifSendMail(para) {
      const editCode = this.editCode || {}
      const urlAdd = `?sendMailForDAM=${para.emailForDam}&sendMailForDDM=${para.emailForDdm}`
      const newCodes = {
        code: editCode.code,
        datasetName: editCode.datasetName,
        name: editCode.name,
        enName: editCode.enName,
        '@class': this.codeClass,
        comment: editCode.comment,
        // values: this.isEdit ? editCode.values : editCode.value,
        categoryId: this.categoryId,
        refStdCode: editCode.refStdCode || null,
      }
      let values = (this.isEdit ? editCode.values : editCode.value) || []
      let valueResult = []
      values.forEach(item => {
        // refCodeValue codeMapping
        let obj = _.cloneDeep(item)
        let refValue = this.refCodeValueMap[obj.refCodeValue]
        // obj.refValue = refValue ? JSON.stringify(refValue) : null
        obj.refValue = refValue || null
        delete obj.refCodeValue
        valueResult.push(obj)
      })
      newCodes.values = valueResult

      // if (!this.useWorkflow) {
      // newCodes.state = 'A'
      // } else {
      newCodes.state = 'D'
      // }
      newCodes.additionalProperties = []
      Object.keys(this.additionalPropertiesObj).forEach(e => {
        if (this.additionalPropertiesObj[e]) {
          newCodes.additionalProperties.push([
            e,
            this.additionalPropertiesObj[e],
          ])
        } else {
          newCodes.additionalProperties.push([e, ''])
        }
      })

      this.submitLoading = true
      if (this.isEdit) {
        this.saveCode(urlAdd, editCode.code, newCodes)
          .then(res => {
            this.submitLoading = false
            this.$message.success(this.$t('domain.common.modifySuccessfully'))
            this.removetab()
            this.$emit('editSucess')
          })
          .catch(e => {
            this.submitLoading = false
            this.$showFailure(e)
          })
      } else {
        newCodes.autoGenCode = this.autoCode
        HTTP.saveCodeService(newCodes)
          .then(res => {
            this.submitLoading = false
            this.$message.success(this.$t('domain.common.addSucceed'))
            this.removetab()
            this.$emit('editSucess')
          })
          .catch(e => {
            this.submitLoading = false
            this.$showFailure(e)
          })
      }
    },
    updateCodeApply() {
      this.submitLoading = true
      const newCodes = this.editCode || {}
      const codeValueLabel = []
      codeValueLabel.push(
        {
          name: this.$t('domain.code.codeValue'),
          value: 'value',
          type: 'normal',
        },
        {
          name: this.$t('domain.code.cName'),
          value: 'name',
          type: 'normal',
        },
        {
          name: this.$t('domain.code.order'),
          value: 'order',
          type: 'normal',
        },
        {
          name: this.$t('domain.code.remark1'),
          value: 'definition',
          type: 'normal',
        },
        {
          name: this.$t('domain.code.remark2'),
          value: 'definition2',
          type: 'normal',
        },
        {
          name: this.$t('domain.code.remark3'),
          value: 'definition3',
          type: 'normal',
        }
      )
      const udp = {}
      const udpInitial = {}
      Object.keys(this.additionalPropertiesObj).forEach(e => {
        if (this.additionalPropertiesObj[e]) {
          const newValue = this.additionalPropertiesObj[e]
          const oldValue = this.additionalPropertiesObjInitial[e]
          udp[e] = newValue
          if (newValue !== oldValue) {
            udpInitial[e] = oldValue
          }
        }
      })
      const para = {
        requestBody: {
          // TODO i18n
          processType:
            this.categoryId === 1 ? '标准代码_修改' : '领域标准代码_修改',
          formDefs: [
            { code: 'realCode', value: newCodes.realCode },
            { code: 'datasetName', value: newCodes.datasetName },
            { code: 'enName', value: newCodes.enName },
            { code: 'name', value: newCodes.name },
            { code: 'description', value: newCodes.description },
            { code: 'comment', value: newCodes.comment },
            // {code: "source", value: newCodes.source},
            // {code: "note", value: newCodes.note},
            { code: 'codeValueLabel', value: JSON.stringify(codeValueLabel) },
            {
              code: 'codeValueValue',
              value: newCodes.values.length
                ? JSON.stringify(newCodes.values)
                : '',
            },
            {
              code: 'additionalProperties',
              value: JSON.stringify(udp),
            },
          ],
        },
      }
      HTTP.publish(para)
        .then(res => {
          this.submitLoading = false
          this.$message.success(this.$t('domain.common.SubmissionSucceeded'))
          this.removetab()
          this.$emit('editSucess')
        })
        .catch(e => {
          this.submitLoading = false
          this.$showFailure(e)
        })
    },
    dataInit() {
      if (this.isEdit) {
        for (const key in this.oldData) {
          this.$set(this.editCode, key, this.oldData[key] || '')
        }
      }
    },
    removetab() {
      this.$emit('removetab')
    },
    changeCollapse(showArr) {
      const index = showArr.indexOf('codeValue')
      if (index !== -1) {
        this.$nextTick(() => {
          setTimeout(() => {
            this.resetTableStyle()
          }, 300)
        })
      }
    },
    getShowData(para) {
      return new Promise((resolve, reject) => {
        const allValue = this.codeValue
        try {
          if (this.tableShowPagination) {
            let showData = []
            const s = para.pageSize || 50
            const c = para.currentPage || 1
            showData = allValue.slice((c - 1) * s, c * s)
            resolve(showData)
          } else {
            let data = allValue || []
            if (allValue.length === 0) {
              data = []
            }
            resolve(data)
          }
        } catch (e) {
          reject(e)
        }
      })
    },
    resetTableStyle() {
      const index = this.showArr.indexOf('codeValue')
      this.$refs.tabWitdTable &&
        this.$refs.tabWitdTable.resetTableStyle &&
        index !== -1 &&
        this.$refs.tabWitdTable.resetTableStyle()
    },
    testValueItem() {
      let errMsg = ''
      let bool = true
      const propsArr = ['name', 'value', 'order']
      const tableObj = []
      if (this.isEdit) {
        tableObj.push(...this.editCode.values)
      } else {
        tableObj.push(...this.editCode.value)
      }
      if (tableObj && Array.isArray(tableObj)) {
        tableObj.forEach(item => {
          const test = propsArr.some(prop => {
            let bool = false
            if (!item[prop] && item[prop] !== 0) {
              if (prop === 'order' && this.gszcCustomer) {
                item[prop] = this.getMaxOrder()
              } else {
                errMsg = this.$t('domain.common.requiredEmpty')
                bool = true
              }
            } else if (prop === 'order') {
              const o = item[prop]
              if (!o && o !== 0) {
                errMsg = this.$t('domain.common.requiredEmpty')
                bool = true
              }
            }
            return bool
          })
          if (test) {
            bool = false
          }
        })
      } else {
        bool = false
      }
      this.errMsg = errMsg
      return bool
    },
    removeValueItem(item) {
      const index = this.codeValue.findIndex(value => {
        return value.value === item.value
      })
      this.codeValue.splice(index, 1)
      this.refreshTable()
    },
    refreshTable() {
      this.$refs.tabWitdTable && this.$refs.tabWitdTable.refreshData()
    },
    getMaxOrder() {
      let values = this.isEdit ? this.editCode.values : this.editCode.value
      if (!values || !values.length) return 1
      let maxOrder = 1
      values.forEach(item => {
        let order = item.order - 0
        if (isNaN(order)) {
          order = 0
        }
        if (maxOrder <= order) {
          maxOrder = order + 1
        }
      })
      return maxOrder
    },
    addColumn() {
      if (typeof this.editCode.values !== 'undefined') {
        this.editCode.values.push({
          value: '',
          // children: [],
          // enName: '',
          name: '',
          order: this.getMaxOrder(),
          parentValue: '',
          refCodeValue: '',
          definition: '',
          definition2: '',
          definition3: '',
        })
      } else {
        // this.num++
        this.editCode.value.push({
          value: '',
          // children: [],
          // enName: '',
          name: '',
          order: this.getMaxOrder(),
          parentValue: '',
          refCodeValue: '',
          definition: '',
          definition2: '',
          definition3: '',
        })
      }

      this.skip2LastPage()
    },
    sortCodeValues() {
      this.$utils.sort.sort(this.tableParentValue, 'order')
    },
    skip2LastPage() {
      let pageCount = this.codeValueCount / this.filterObj.pageSize
      this.filterObj.currentPage = Math.ceil(pageCount)
    },
    deleteRow(row, index) {
      // console.log(index, 'index')
      if (!index && index !== 0) {
        index = this.tableParentValue.findIndex(item => item === row)
      }
      // console.log(index, 'index')
      if (index === -1) {
        this.$message.info(this.$t('domain.common.dataNotFind'))
      }
      if (this.isEdit) {
        this.editCode.values.splice(index, 1)
      } else {
        this.editCode.value.splice(index, 1)
      }
      this.parentValueOptions.forEach(element => {
        if (element.value === row.value) {
          this.parentValueOptions.splice(element, 1)
        }
      })
    },
    querySearch(queryString, cb) {
      // var restaurants = this.themeCategoryArr;
      var restaurants = this.themeCategoryArr
      var results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants
      cb(results)
    },
    createFilter(queryString) {
      return restaurant => {
        return (
          restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        )
      }
    },
    handleSizeChange(p) {
      this.filterObj.currentPage = 1
      this.filterObj.pageSize = p
    },
    handleCurrentChange(p) {
      this.filterObj.currentPage = p
    },
  },
}
</script>
<style lang="scss">
@mixin absPos() {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.tab-page.edit-code-node {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding-top: 20px;

  .content-outer {
    @include absPos();
    .el-collapse-item__header {
      height: 40px;
      line-height: 40px;
    }
    .collapse-title {
      padding-left: 10px;
      h4 {
        position: relative;
        display: inline-block;
        font-size: 14px;
        font-weight: bold;
        &::after {
          content: '';
          display: block;
          position: absolute;
          left: -10px;
          top: 50%;
          transform: translateY(-50%);
          height: 14px;
          width: 4px;
          background: #409eff;
        }
      }
    }
  }
  .message-form-item {
    // width: 490px;
    display: inline-block;
    vertical-align: top;
    &:nth-of-type(odd) {
      //margin-right: 20px;
    }
  }

  .dia-input-item {
    width: 300px;

    textarea {
      width: 100%;
    }
  }

  .table-container {
    position: relative;

    &.table-add-min-height {
      min-height: 500px;
    }

    .table-mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      cursor: pointer;
    }
    .thin {
      .el-table__body .el-table__row {
        .el-input__inner,
        .el-select .el-input {
          height: 30px !important;
          line-height: 30px !important;
        }
      }
    }
  }

  .page-btn-group {
    margin-bottom: 20px;
  }

  .pagination-outer {
    float: right;
    padding: 10px 0;
  }
}

.star {
  color: #f56c6c;
  font-size: 14px;
  margin: 2px 0 0 4px;
}
</style>

<style lang="scss">
.tab-page.edit-code-node {
  .page-form {
    .dia-input-item {
      textarea {
        width: 100%;
      }
    }
  }

  .required-star {
    .ag-header-cell-text {
      &::before {
        content: '* ';
        color: red;
      }
    }
  }

  .tab-bottom-line {
    border-bottom: 1px solid #eee;
  }

  .ag-overlay {
    z-index: 22;
    // background-color: red;
  }

  .ag-center-cols-container {
    background-color: #fff;
  }

  // .msg-container {
  //   position: relative;
  //   .msg-inner {
  //     position: absolute;
  //     z-index: 22;
  //     width: 300px;
  //     text-align: center;
  //   }
  // }
  .add-first-btn {
    span {
      // position: absolute;
      cursor: pointer;
    }
  }
}
</style>
