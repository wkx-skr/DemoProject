<template>
  <div class="params-component">
    <datablau-dialog
      title="编辑参数"
      :visible.sync="paramEditVisible"
      width="25%"
      size="s"
      class="app-edit-proxy-dialog"
      append-to-body
      :close-on-click-modal="false"
      key="editParams"
    >
      <el-form
        label-width="110px"
        :model="paramEditObj"
        :rules="rules"
        ref="editForm"
      >
        <el-form-item label="代理参数名称：" prop="alias">
          <datablau-input
            size="mini"
            clearable
            v-model="paramEditObj.alias"
            placeholder="请输入代理参数名称"
            class="edit-item-input"
          ></datablau-input>
          <!--:disabled="apiEditData.apiAccessMethod !== '3'"-->
        </el-form-item>
        <el-form-item label="是否用户传入：" prop="parSynchronize">
          <!--<el-radio-group v-model="paramEditObj.parSynchronize">-->
          <!--  <el-radio name="required" :label="1">是</el-radio>-->
          <!--  <el-radio name="required" :label="0">否</el-radio>-->
          <!--</el-radio-group>-->
          <el-switch
            v-model="paramEditObj.parSynchronize"
            active-text="是"
            inactive-text="否"
            :active-value="1"
            :inactive-value="0"
          ></el-switch>
          <el-tooltip
            effect="light"
            content="需要用户传入的参数会自动同步到 API 参数列表中"
            placement="top"
            style="margin-left: 20px"
          >
            <i class="el-icon-info"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item
          label="参数名称："
          prop="name"
          v-if="paramEditObj.parSynchronize === 1"
        >
          <datablau-input
            size="mini"
            clearable
            v-model="paramEditObj.name"
            placeholder="请输入参数名称"
            class="edit-item-input"
          ></datablau-input>
          <!--:disabled="apiEditData.apiAccessMethod !== '3'"-->
        </el-form-item>
        <el-form-item label="是否必需：" prop="required" v-if="false">
          <el-radio-group v-model="paramEditObj.required">
            <el-radio name="required" :label="0">是</el-radio>
            <el-radio name="required" :label="1">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="位置：" prop="location">
          <el-select
            size="mini"
            v-model="paramEditObj.location"
            filterable
            class="edit-item-input"
          >
            <el-option
              v-for="item in paramLocations"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="类型：" prop="type">
          <el-select
            size="mini"
            v-model="paramEditObj.type"
            filterable
            class="edit-item-input"
          >
            <el-option
              v-for="(value, item) in paramTypes"
              :key="item"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="默认值：" prop="defaults">
          <datablau-input
            size="mini"
            clearable
            v-model="paramEditObj.defaults"
            class="edit-item-input"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="说明：" prop="description" class="textarea-outer">
          <datablau-input
            size="mini"
            type="textarea"
            clearable
            v-model="paramEditObj.description"
            class="edit-item-input"
          ></datablau-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-bottom">
        <datablau-button type="secondary" @click="paramEditVisible = false">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="primary"
          @click="saveParamEdit"
          class=""
          :disabled="!couldSaveParamEdit"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-eltable
      class="table-tab-container"
      ref="paramsList"
      :key="paramsListId"
      :columnDefs="paramsColumnDefs"
      :getShowData="getParamsListShowData"
      :hideTopLine="hideTopLine"
      :hideBottomLine="hideBottomLine"
      :tableOption="tableOption"
      :tableHidePagination="tableHidePagination"
      :defaultParaData="defaultParaData"
      :totalShow="0"
      style="height: 260px"
    ></datablau-eltable>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'paramsListComponent',
  data() {
    return {
      paramEditVisible: false,
      defaultParamEditObj: {
        name: '',
        id: '',
        required: 0,
        location: 'QUERY',
        type: 'STRING',
        description: '',
        status: '',
        modifyTime: '',
        defaults: '', // 默认值
        apiId: '',
        autoId: '', // 自增id, 提交时移除
        parSynchronize: 0, // 是否同步到参数列表
        parType: 1,
        alias: '',
      },
      paramEditObj: {},
      // couldSaveParamEdit: false,
      paramsListId: 1,
      paramsColumnDefs: [],
      hideTopLine: true,
      hideBottomLine: true,
      tableOption: {
        rowSelection: 'single', //  multiple
      },
      tableHidePagination: true,
      defaultParaData: {},
      isAddParam: false,
      paramsList: [],
      defaultParamsMap: {
        1: {
          name: 'appKey',
          id: '',
          required: 0,
          type: 'STRING',
          location: 'QUERY',
          description: '在绑定的应用组里查看',
          status: '',
          modifyTime: '',
          defaults: '', // 默认值
          apiId: '',
          autoId: 1,
        },
        2: {
          name: 'appSecret',
          id: '',
          required: 0,
          type: 'STRING',
          location: 'QUERY',
          description: '在绑定的应用组里查看',
          status: '',
          modifyTime: '',
          defaults: '', // 默认值
          apiId: '',
          autoId: 2,
        },
        3: {
          name: 'pageSize',
          id: '',
          required: 1,
          type: 'INT',
          location: 'QUERY',
          description: '固定参数，每页的数量，30，60，90',
          status: '',
          modifyTime: '',
          defaults: '30', // 默认值
          apiId: '',
          autoId: 3,
        },
        4: {
          name: 'pageIndex',
          id: '',
          required: 1,
          type: 'INT',
          location: 'QUERY',
          description: '从 1 开始的页索引',
          status: '',
          modifyTime: '',
          defaults: '1', // 默认值
          apiId: '',
          autoId: 4,
        },
        5: {
          name: '——',
          id: '——',
          required: '——',
          location: '——',
          type: '——',
          description: '——',
          status: '——',
          modifyTime: '——',
          defaults: '——', // 默认值
          apiId: '——',
          autoId: 5,
        },
      },
      paramsObjMap: {},
      autoIncreaseId: 10,
      paramsRepeat: false,
      // defaultParams: ['appKey', 'appSecret', 'pageSize', 'pageIndex'],
      defaultParams: [],
      rules: {
        name: [
          {
            trigger: 'blur',
            required: true,
            message: '请输入参数名称',
            validator: this.$utils.validator.notEmptyRequired,
          },
          {
            trigger: 'blur',
            validator: this.$utils.validator.maxLengthCustom(50),
          },
        ],
        alias: [
          {
            trigger: 'blur',
            required: true,
            message: '请输入代理参数名称',
            validator: this.$utils.validator.notEmptyRequired,
          },
          {
            trigger: 'blur',
            validator: this.$utils.validator.maxLengthCustom(50),
          },
        ],
        // required: [{trigger: 'blur', required: true, message: '请输入参数名称'}],
        parSynchronize: {
          trigger: 'blur',
          required: true,
          message: '请选择',
          validator: this.$utils.validator.notEmptyRequired,
        },
        location: {
          trigger: 'blur',
          required: true,
          message: '请输入参数位置',
          validator: this.$utils.validator.notEmptyRequired,
        },
        type: [
          {
            trigger: 'blur',
            required: true,
            message: '请输入参数类型',
            validator: this.$utils.validator.notEmptyRequired,
          },
        ],
        defaults: [
          {
            trigger: 'blur',
            required: true,
            message: '请输入默认值',
            validator: this.$utils.validator.notEmptyRequired,
          },
          {
            trigger: 'blur',
            validator: this.$utils.validator.maxLengthCustom(100),
          },
        ],
        description: [
          {
            trigger: 'blur',
            validator: this.$utils.validator.maxLengthCustom(1000),
          },
        ],
      },
    }
  },
  props: {
    paramLocations: {},
    paramTypes: {},
    isEdit: {
      type: Boolean,
      default: false,
    },
    defaultParamsList: {
      type: Array,
      default() {
        return []
      },
    },
    getParamsListFun: {
      type: Function,
      required: true,
    },
    apiEditData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  components: {},
  computed: {
    handleTableHeight() {
      console.log($('.params-list'), 'height2')
      return $('.params-list')[0].offsetHeight
    },
    couldSaveParamEdit() {
      let bool = false
      if (this.paramEditObj) {
        const name = _.trim(this.paramEditObj.name)
        const defaults = _.trim(this.paramEditObj.defaults)
        if (
          !this.paramEditObj.location ||
          !this.paramEditObj.type ||
          !defaults
        ) {
          bool = true
        }
        if (this.paramEditObj.parSynchronize === 1 && !name) {
          bool = true
        }
      } else {
        bool = true
      }
      return !bool
    },
  },
  beforeMount() {
    // this.setTableCol()
    const formatterRequired = data => {
      if (data.required === '——') return '——'
      return data.required === 0 ? '是' : '否'
    }
    const paramsColumnDefs = [
      // {
      //   type: ['indexCol'],
      //   // width: 90
      // },
      {
        headerName: '代理参数名称',
        field: 'alias',
        tooltipField: 'alias',
        // width: 150,
        // minWidth: 150,
        // type: ['customSortCol'],
      },
      // {
      //   headerName: '用户传入',
      //   field: 'par_synchronize',
      //   // tooltipField: 'required',
      //   cellRenderer: params => {
      //     if (params.data.required === '——') return '——'
      //     return params.data.parSynchronize === 1 ? '是' : '否'
      //   },
      //   width: 80,
      //   resizable: false,
      //   suppressSizeToFit: true,
      //   minWidth: 80,
      //   // type: ['customSortCol'],
      // },
      {
        headerName: '参数名称',
        field: 'name',
        tooltipField: 'name',
        // width: 150,
        // minWidth: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '参数位置',
        field: 'location',
        tooltipField: 'location',
        // width: 100,
        // minWidth: 100,
        resizable: false,
        suppressSizeToFit: true,
        // type: ['customSortCol'],
      },
      {
        headerName: '必填',
        field: 'required',
        // tooltipField: 'required',
        valueFormatter: formatterRequired,
        tooltipValueGetter: formatterRequired,
        resizable: false,
        suppressSizeToFit: true,
        // minWidth: 80,
        // width: 80,
        // type: ['customSortCol'],
      },
      {
        headerName: '类型',
        field: 'type',
        tooltipField: 'type',
        resizable: false,
        suppressSizeToFit: true,
        // minWidth: 150,
        // width: 150,
        // minWidth: 300
        // type: ['customSortCol'],
      },
      {
        headerName: '默认值',
        field: 'defaults',
        tooltipField: 'defaults',
        // width: 300,
        // minWidth: 300,
        // type: ['customSortCol'],
      },
      {
        headerName: '说明',
        field: 'description',
        tooltipField: 'description',
        // width: 300,
        // minWidth: 300,
        // type: ['customSortCol'],
      },
      // {
      //   headerName: '索引',
      //   field: 'sortIndex',
      //   tooltipField: 'sortIndex',
      //   width: 100
      //   // type: ['customSortCol'],
      // },
      {
        headerName: '操作',
        minWidth: 200,
        type: ['optionsWithContent'],
        cellRendererParams: {
          tabComponent: this,
          options: [
            // {name: 'edit', text: '发起流程', method: 'handleApply'},
            // {name: 'bind', text: '绑定流程', method: 'bandProcess'},
            {
              name: 'editParam',
              text: '编辑',
              method: 'editParam',
              preventDefault: true,
              stopPropagation: true,
              ifBtnDisabled: data => {
                return !!this.defaultParams.find(item => item === data.name)
              },
              ifBtnShow: data => {
                return !['——'].find(item => item === data.name)
              },
            },
            {
              name: 'deleteParam',
              text: '删除',
              method: 'deleteParam',
              ifBtnDisabled: data => {
                return !!this.defaultParams.find(item => item === data.name)
              },
              ifBtnShow: data => {
                return !['——'].find(item => item === data.name)
              },
            },
            {
              name: 'reduceIndex',
              // text: '上移',
              // text: '↑',
              btnType: 'icon',
              icon: 'iconfont icon-up',
              method: 'reduceIndex',
              ifBtnDisabled: data => {
                let bool = false
                let defaultCount = 3
                if (this.apiEditData.apiAccessMethod === 'PROXY_API') {
                  defaultCount = defaultCount - 2
                }
                if (this.defaultParams.find(item => item === data.name)) {
                  // 禁止编辑
                  bool = true
                } else if (data.sortIndex < defaultCount) {
                  bool = true
                }
                return bool
              },
              ifBtnShow: data => {
                return !['——'].find(item => item === data.name)
              },
            },
            {
              name: 'increaseIndex',
              // text: '下移',
              // text: '↓',
              btnType: 'icon',
              icon: 'iconfont icon-down',
              method: 'increaseIndex',
              ifBtnDisabled: data => {
                let bool = false
                if (this.defaultParams.find(item => item === data.name)) {
                  // 禁止编辑
                  bool = true
                } else if (data.isLast) {
                  // 最后一个
                  bool = true
                }
                return bool
              },
              ifBtnShow: data => {
                return !['——'].find(item => item === data.name)
              },
            },
          ],
        },
      },
    ]

    if (!this.isEdit) {
      paramsColumnDefs.pop()
    }
    this.paramsColumnDefs = paramsColumnDefs
  },
  mounted() {
    this.defaultParamEditObj.apiId =
      this.apiEditData && this.apiEditData.id ? this.apiEditData.id : ''
    this.paramEditObj = _.cloneDeep(this.defaultParamEditObj)
    // this.defaultParamsMap
    Object.keys(this.defaultParamsMap).forEach(key => {
      this.paramsObjMap[key] = _.merge(
        {},
        this.defaultParamEditObj,
        this.defaultParamsMap[key]
      )
    })
    // this.setTableCol()
    this.dataInit()
  },
  methods: {
    // setTableCol() {},
    dataInit() {
      // console.log("dataInit");
      this.paramsList = _.cloneDeep(this.defaultParamsList)
      this.refreshEditData()

      if (this.apiEditData && this.apiEditData.id) {
        const name2Id = {}
        this.paramsList.forEach(item => {
          if (item.parSynchronize) {
            name2Id[item.name] = item.autoId
          }
        })
        this.$emit('updateProxyId', name2Id)
      }
    },
    addParam() {
      this.isAddParam = true
      // Object.keys(this.paramEditObj).forEach(key => {
      //   this.paramEditObj[key] = ''
      // })
      // this.paramEditObj.required = '0'
      // this.paramEditObj.location = 'QUERY'
      // this.paramEditObj.type = 'STRING'
      // this.paramEditObj.apiId = (this.apiEditData && this.apiEditData.id) ? this.apiEditData.id : ''
      this.paramEditObj = _.cloneDeep(this.defaultParamEditObj)

      this.paramEditVisible = true
      this.clearValidate()
    },
    editParam(param) {
      this.isAddParam = false
      this.paramEditObj = _.cloneDeep(param.data)
      this.paramEditVisible = true
      this.clearValidate()
    },
    clearValidate() {
      this.$nextTick(() => {
        if (this.$refs.editForm && this.$refs.editForm.clearValidate) {
          this.$refs.editForm.clearValidate()
        }
      })
    },
    deleteParam(param) {
      const data = param.data
      this.updateParameter('delete', data)
      this.paramsList = this.paramsList.filter(
        item => item.autoId !== data.autoId
      )
      delete this.paramsObjMap[data.autoId]

      setTimeout(() => {
        this.refreshParamsList()
      }, 300)
    },
    saveParamEdit() {
      // 校验是否有名称重复

      // 代理参数名称
      let dupName = ''
      const nameMap = {}

      // 代理参数列表里 参数名称
      const nameMap2 = {}
      let dupName2 = ''

      // 参数列表中 参数名称
      const nameMap3 = {}
      let dupName3 = ''

      // 参数列表中 默认的参数
      let dupDefault = ''
      const defaultMap = {
        appKey: true,
        appSecret: true,
      }

      const apiParamsList = this.getParamsListFun() || []
      apiParamsList.forEach(item => {
        nameMap3[item.name] = item
      })
      // console.log(apiParamsList, 'apiParamsList')

      this.paramsList.forEach(item => {
        if (!nameMap[item.alias]) {
          nameMap[item.alias] = item
        } else {
          // 旧数据中有同名, 正常不会发生
          if (item.autoId !== nameMap[item.alias].autoId) {
            dupName = item.alias
          }
        }

        if (!nameMap2[item.name]) {
          nameMap2[item.name] = item
        } else {
          if (item.autoId !== nameMap2[item.name].autoId) {
            dupName2 = item.name
          }
        }

        if (defaultMap[item.name]) {
          dupDefault = item.name
        }
      })
      if (
        nameMap[this.paramEditObj.alias] &&
        this.paramEditObj.autoId !== nameMap[this.paramEditObj.alias].autoId
      ) {
        dupName = this.paramEditObj.alias
      }

      if (
        nameMap[this.paramEditObj.name] &&
        this.paramEditObj.autoId !== nameMap[this.paramEditObj.name].autoId
      ) {
        dupName2 = this.paramEditObj.name
      }

      // 正在编辑的参数 跟 参数列表中同名参数的代理参数 不是同一个, 即新增了一个同名参数, 报错
      if (
        nameMap3[this.paramEditObj.name] &&
        this.paramEditObj.autoId !== nameMap3[this.paramEditObj.name].proxyId
      ) {
        dupName3 = this.paramEditObj.name
      }
      if (dupDefault) {
        this.$showFailure(`[参数名称] 不能为 ${dupDefault}`)
        return
      }
      // console.log(dupName, 'dupName')
      if (dupName) {
        this.$showFailure(`[代理参数名称] 为 ${dupName} 的代理参数重复`)
        return
      }

      if (dupName2) {
        this.$showFailure(`[参数名称] 为 ${dupName2} 的代理参数重复`)
        return
      }

      if (dupName3) {
        this.$showFailure(`参数列表中已存在 [参数名称] 为 ${dupName3} 的参数`)
        return
      }

      if (!this.isAddParam) {
        this.paramsObjMap[this.paramEditObj.autoId] = _.merge(
          this.paramsObjMap[this.paramEditObj.autoId],
          this.paramEditObj
        )
        const obj = this.paramsObjMap[this.paramEditObj.autoId]
        if (obj.parSynchronize === 1) {
          this.updateParameter('update', obj)
        } else {
          this.updateParameter('delete', obj)
        }
      } else {
        const obj = _.clone(this.paramEditObj)
        obj.autoId = this.autoIncreaseId++
        this.$set(this.paramsObjMap, obj.autoId, obj)
        // this.paramsObjMap[obj.autoId] = obj
        this.paramsList.push(obj)

        if (obj.parSynchronize === 1) {
          this.updateParameter('create', obj)
        }
      }
      this.paramEditVisible = false

      // console.log(this.paramsObjMap, 'this.paramsObjMap')
      // console.log(this.paramsList, 'this.paramsList')
      setTimeout(() => {
        this.refreshEditData()
        this.refreshParamsList()
      }, 300)
    },
    refreshParamsList() {
      // this.paramsListId++
      if (this.$refs.paramsList && this.$refs.paramsList.refreshData) {
        this.$refs.paramsList.refreshData()
        // this.$refs.paramsList.forceUpdateCell()
      }
      this.sqlColsDuplicateTest()
    },
    resizeTable() {
      if (this.$refs.paramsList && this.$refs.paramsList.resetTableStyle) {
        this.$refs.paramsList.resetTableStyle()
      }
    },
    sqlColsDuplicateTest() {
      this.$emit('sqlColsDuplicateTest')
    },
    getParamsListShowData() {
      return new Promise((resolve, reject) => {
        try {
          // let arr = this.paramsRepeat ? [] : this.paramsList
          let arr = this.paramsList
          if (arr.length > 0) {
            arr = arr.slice(0, arr.length)
            arr.sort((a, b) => a.sortIndex - b.sortIndex)
            // arr.splice(4, 0, this.paramsObjMap['5'])
            arr.forEach(item => {
              item.isLast = false
            })
            arr[arr.length - 1].isLast = true
          }
          // console.log(arr, 'arr')
          resolve(arr)
        } catch (e) {
          reject(e)
        }
      })
    },
    refreshEditData() {
      const paramsObjMap = this.paramsObjMap

      this.paramsList.forEach((item, index) => {
        if (!item.autoId) {
          item.autoId = this.autoIncreaseId++
        }
        paramsObjMap[item.autoId] = item
        item.sortIndex = index
      })
      this.paramsObjMap = paramsObjMap

      this.refreshParamsList()
    },
    // getParams(sql = '') {
    //   let params = (sql.match(/\{\{[a-zA-Z0-9_]+\}\}/ig) || []).map(item => {
    //     let str = item.replace('{{', '').replace('}}', '')
    //     return str
    //   })
    //   // params = ['appKey', 'appSecret', 'pageIndex', 'pageSize'].concat(params)
    //   if (this.apiEditData.apiAccessMethod === 'PROXY_API') {
    //     params = ['1', '2'].concat(params)
    //   } else {
    //     params = ['1', '2', '3', '4'].concat(params)
    //   }
    //
    //   this.paramsList = params.map(item => {
    //     // 有旧值返回旧值, 否则返回 默认初始化的值
    //     return this.paramsObjMap[item] || {
    //       name: item,
    //       id: '',
    //       required: 0,
    //       type: 'STRING',
    //       description: '',
    //       status: '',
    //       modifyTime: '',
    //       location: 'QUERY',
    //       apiId: (this.apiEditData && this.apiEditData.id) ? this.apiEditData.id : '',
    //       autoId: this.autoIncreaseId++
    //     }
    //   })
    //
    //   // 判断是否有重复字段
    //   let paramsList = this.paramsList.map(item => item.name)
    //   let paramsListSet = new Set(paramsList)
    //   this.paramsRepeat = paramsList.length !== paramsListSet.size
    //   this.paramsList.forEach((item, index) => {
    //     item.sortIndex = index
    //     this.paramsObjMap[item.autoId] = item
    //   })
    //
    //   this.refreshParamsList()
    // },
    updateParameter(updateType = 'update', data = {}) {
      if (!data.name) return
      data = _.cloneDeep(data)
      data.parType = 2
      data.proxyId = data.autoId
      delete data.autoId
      delete data.isLast
      delete data.id
      delete data.sortIndex
      this.$emit('updateParameter', {
        updateType: updateType,
        parameterData: data,
      })
    },
    getParamsList() {
      const parameters = _.cloneDeep(this.paramsList)
      if (parameters && Array.isArray(parameters)) {
        parameters.forEach(item => {
          if (!item.id) {
            delete item.id
          }
          if (!item.apiId) {
            delete item.apiId
          }
          delete item.autoId
          delete item.isLast
          delete item.sortIndex
          // item.type = this.paramTypes[item.type]
        })
      }
      return parameters
    },
    hasDefaults() {
      let hasDefaults = true
      const parameters = this.paramsList
      if (parameters && Array.isArray(parameters)) {
        parameters.forEach(item => {
          if (
            !item.defaults &&
            !this.defaultParams.find(name => item.name === name)
          ) {
            hasDefaults = false
          }
        })
      }
      return hasDefaults
    },
    reduceIndex(param) {
      const data = param.data

      if (data.sortIndex > 2) {
        const otherObj = this.paramsList.find(
          item => item.sortIndex === data.sortIndex - 1
        )
        if (otherObj) {
          otherObj.sortIndex++
          data.sortIndex--
        }
      }
      setTimeout(() => {
        this.refreshParamsList()
      }, 300)
    },
    increaseIndex(param) {
      const data = param.data

      if (data.sortIndex < this.paramsList.length - 1) {
        const otherObj = this.paramsList.find(
          item => item.sortIndex === data.sortIndex + 1
        )
        if (otherObj) {
          otherObj.sortIndex--
          data.sortIndex++
        }
      }
      setTimeout(() => {
        this.refreshParamsList()
      }, 300)
    },
    duplicateTest() {
      let dupName = ''
      const dupMap = {}
      this.paramsList.forEach((item, index) => {
        // console.log(item, 'item')
        if (!dupMap[item.alias]) {
          dupMap[item.alias] = 1
        } else {
          dupName = item.alias
        }
      })
      return dupName
    },
  },
  watch: {
    defaultParamsList() {
      this.dataInit()
    },
  },
}
</script>

<style lang="scss" scoped>
.table-tab-container {
  margin-left: -20px;
  /deep/ .datablau-tab-table-line {
    height: 260px;
  }
}
</style>
<style lang="scss">
.app-edit-proxy-dialog {
  .el-dialog {
    //border: 1px solid red;
    min-width: 500px;

    .el-form-item__error {
      padding-top: 0;
    }

    .el-form-item.textarea-outer {
      margin: 15px 0;
    }
  }

  .edit-item-input {
    width: 300px;
    //border: 1px solid red;
  }
}
</style>
