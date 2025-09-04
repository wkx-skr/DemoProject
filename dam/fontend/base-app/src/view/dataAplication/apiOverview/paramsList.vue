<template>
  <div class="params-component">
    <datablau-dialog
      :title="isAddParam ? '添加参数' : '编辑参数'"
      :visible.sync="paramEditVisible"
      size="s"
      class="app-edit-param-dialog"
      append-to-body
      :close-on-click-modal="false"
      key="editParams"
    >
      <el-form
        label-width="100px"
        :model="paramEditObj"
        :rules="rules"
        ref="editForm"
        class="prams-list-form"
      >
        <el-form-item label="参数名称：" prop="name">
          <datablau-input
            size="mini"
            clearable
            v-model="paramEditObj.name"
            placeholder="请输入参数名称"
            :disabled="!!paramEditObj.parSynchronize"
            class="edit-item-input"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="是否必需：" prop="required" v-if="false">
          <datablau-radio v-model="paramEditObj.required">
            <el-radio name="required" :label="0">是</el-radio>
            <el-radio name="required" :label="1">否</el-radio>
          </datablau-radio>
        </el-form-item>
        <el-form-item label="位置：" prop="location">
          <datablau-select
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
          </datablau-select>
        </el-form-item>
        <el-form-item label="类型：" prop="type">
          <datablau-select
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
          </datablau-select>
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
          type="important"
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
      :tableHeightInfo="tableHeightInfo"
    ></datablau-eltable>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'paramsListComponent',
  data() {
    return {
      tableHeightInfo: '',
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
        parSynchronize: 0,
        parType: 2,
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
      defaultParams: ['appKey', 'appSecret', 'pageSize', 'pageIndex'],
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
            validator: this.$utils.validator.maxLengthCustom(100),
          },
          {
            trigger: 'blur',
            message: '支持字母、数字、下划线，不能以数字开头',
            validator: (rule, value, callback) => {
              if (!isNaN(value - 0)) {
                callback(new Error('变量名不能以数字开头'))
              } else if (
                value.match &&
                !value.match(/^[a-zA-Z_][a-zA-Z_0-9]*$/)
              ) {
                callback(new Error('支持字母、数字、下划线，不能以数字开头'))
              } else {
                callback()
              }
            },
          },
        ],
        location: [
          { trigger: 'blur', required: true, message: '请选择参数位置' },
        ],
        type: [{ trigger: 'blur', required: true, message: '请选择参数类型' }],
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
            validator: this.$utils.validator.maxLengthCustom(200),
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
    isAdd: {
      type: Boolean,
      default: true,
    },
    apiEditData: {
      type: Object,
      default() {
        return {}
      },
    },
    // 代理参数 与 参数 联系
    name2Id: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  components: {},
  computed: {
    couldSaveParamEdit() {
      let bool = false
      if (this.paramEditObj) {
        const name = _.trim(this.paramEditObj.name)
        const defaults = _.trim(this.paramEditObj.defaults)
        if (
          !name ||
          !this.paramEditObj.location ||
          !this.paramEditObj.type ||
          !defaults
        ) {
          bool = true
        }
        if (name.match && !name.match(/^[a-zA-Z_][a-zA-Z_0-9]*$/)) {
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
      if (data.data.name === 'appKey' || data.data.name === 'appSecret')
        return '是'
      if (data.required === '——') return '——'
      return data.required === 0 ? '是' : '否'
    }
    const paramsColumnDefs = [
      {
        headerName: '参数名称',
        field: 'name',
        tooltipField: 'name',
      },
      {
        headerName: '参数位置',
        field: 'location',
        tooltipField: 'location',
        suppressSizeToFit: true,
        resizable: false,
      },
      {
        headerName: '必填',
        field: 'required',
        suppressSizeToFit: true,
        resizable: false,
        valueFormatter: formatterRequired,
        tooltipValueGetter: formatterRequired,
      },
      {
        headerName: '类型',
        field: 'type',
        tooltipField: 'type',
        // width: 200,
        resizable: false,
        suppressSizeToFit: true,
      },
      {
        headerName: '默认值',
        field: 'defaults',
        tooltipField: 'defaults',
      },
      {
        headerName: '说明',
        field: 'description',
        tooltipField: 'description',
      },
      {
        headerName: '操作',
        width: 200,
        // minWidth: 300,
        type: ['optionsWithContent'],
        cellRendererParams: {
          tabComponent: this,
          options: [
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
              btnType: 'icon',
              icon: 'iconfont icon-up',
              method: 'reduceIndex',
              ifBtnDisabled: data => {
                let bool = false
                let defaultCount = 5
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
    Object.keys(this.defaultParamsMap).forEach(key => {
      this.paramsObjMap[key] = _.merge(
        {},
        this.defaultParamEditObj,
        this.defaultParamsMap[key]
      )
    })
    this.dataInit()
  },
  methods: {
    setTableCol() {},
    dataInit() {
      this.paramsList = _.cloneDeep(this.defaultParamsList)
      this.refreshEditData()

      this.updateProxyId()
    },
    addParam() {
      this.isAddParam = true
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
      const nameMap = {}
      let dupName = ''
      this.paramsList.forEach(item => {
        if (!nameMap[item.name]) {
          nameMap[item.name] = item
        } else {
          if (item.autoId !== nameMap[item.name].autoId) {
            dupName = item.name
          }
        }
      })
      if (
        nameMap[this.paramEditObj.name] &&
        this.paramEditObj.autoId !== nameMap[this.paramEditObj.name].autoId
      ) {
        dupName = this.paramEditObj.name
      }
      if (dupName) {
        this.$showFailure(`名称为 ${dupName} 的参数重复`)
        return
      }
      if (!this.isAddParam) {
        this.paramsObjMap[this.paramEditObj.autoId] = _.merge(
          this.paramsObjMap[this.paramEditObj.autoId],
          this.paramEditObj
        )
      } else {
        const obj = _.clone(this.paramEditObj)
        obj.autoId = this.autoIncreaseId++
        this.$set(this.paramsObjMap, obj.autoId, obj)
        this.paramsList.push(obj)
      }
      this.paramEditVisible = false
      setTimeout(() => {
        this.refreshEditData()
        this.refreshParamsList()
      }, 300)
    },
    refreshParamsList() {
      // this.paramsListId++
      if (this.$refs.paramsList && this.$refs.paramsList.refreshData) {
        this.$refs.paramsList.refreshData()
      }
      this.sqlColsDuplicateTest()
    },
    resizeTable() {
      if (this.$refs.paramsList && this.$refs.paramsList.resetTableStyle) {
        this.$refs.paramsList.resetTableStyle()
      }
    },
    sqlColsDuplicateTest() {
      const dupName = this.duplicateTest()
      if (dupName) {
        this.$showFailure(`名称为 ${dupName} 的参数重复`)
      }
      this.$emit('sqlColsDuplicateTest')
    },
    getParamsListShowData() {
      return new Promise((resolve, reject) => {
        try {
          let arr = this.paramsList
          if (arr.length > 0) {
            arr = arr.slice(0, arr.length)
            arr.sort((a, b) => a.sortIndex - b.sortIndex)
            arr.forEach(item => {
              item.isLast = false
            })
            arr[arr.length - 1].isLast = true
          }
          resolve(arr)
        } catch (e) {
          reject(e)
        }
      })
    },
    refreshEditData() {
      const paramsObjMap = this.paramsObjMap
      this.paramsList.forEach(item => {
        switch (item.name) {
          case 'appKey':
            item.sortIndex = 0
            break
          case 'appSecret':
            item.sortIndex = 1
            break
          case 'pageSize':
            item.sortIndex = 2
            break
          case 'pageIndex':
            item.sortIndex = 3
            break
        }
      })
      this.paramsList.sort((a, b) => a.sortIndex - b.sortIndex)
      this.paramsList.forEach((item, index) => {
        if (!item.autoId) {
          item.autoId = this.autoIncreaseId++
        }
        paramsObjMap[item.autoId] = item
        if (!item.sortIndex && item.sortIndex !== 0) {
          item.sortIndex = index
        }
      })
      this.paramsObjMap = paramsObjMap

      this.refreshParamsList()
    },
    // sql 语句编辑后, 自动生成参数
    getParams(sql = '') {
      // 根据 是否有 - 判断 是否带有参数
      // sql 中不带参数
      let reg = /{{[a-zA-Z0-9_]+}}/gi
      if (sql.match(/{{[^-]*-.*}}/)) {
        reg = /{{[a-zA-Z0-9_]+-.*}}/gi
      }
      let params = (sql.match(/\{\{[^\}]+\}\}/g) || []).map(p => {
        return (p.match(reg) || [])
          .map(item => item.replace('{{', '').replace('}}', ''))
          .join('')
      })
      if (this.apiEditData.apiAccessMethod === 'PROXY_API') {
        params = ['1', '2'].concat(params)
      } else {
        params = ['1', '2', '3', '4'].concat(params)
      }

      this.paramsList = params.map(item => {
        // 有旧值返回旧值, 否则返回 默认初始化的值
        // 如果原参数列表中有某个参数名，该参数名对应的参数信息不变
        if (this.paramsList.find(p => p.name === item)) {
          return this.paramsList.filter(p => p.name === item)[0]
        } else {
          // 有旧值返回旧值, 否则返回 默认初始化的值
          return (
            this.paramsObjMap[item] || {
              name: item.split('-')[0] || '',
              defaults: item.split('-')[1] || '',
              id: '',
              required: 0,
              type: 'STRING',
              description: '',
              status: '',
              modifyTime: '',
              location: 'QUERY',
              apiId:
                this.apiEditData && this.apiEditData.id
                  ? this.apiEditData.id
                  : '',
              autoId: this.autoIncreaseId++,
            }
          )
        }
      })

      // 判断是否有重复字段
      this.paramsRepeat = !!this.duplicateTest()
      this.paramsList.forEach((item, index) => {
        item.sortIndex = index
        this.paramsObjMap[item.autoId] = item
      })

      this.refreshParamsList()
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
          delete item.proxyId // 从代理参数同步过来时加上的 id
          // item.type = this.paramTypes[item.type]
        })
      }
      return parameters
    },
    getParamsListOrg() {
      return _.cloneDeep(this.paramsList)
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
    updateParameter({ updateType, parameterData }) {
      const data = _.cloneDeep(parameterData)
      const oldObj = this.paramsList.find(item => item.proxyId === data.proxyId)
      if (oldObj) {
        if (updateType === 'create' || updateType === 'update') {
          this.isAddParam = false
          Object.keys(data).forEach(key => {
            oldObj[key] = data[key]
          })
          this.paramEditObj = oldObj
          this.saveParamEdit()
        } else if (updateType === 'delete') {
          this.deleteParam({ data: oldObj })
        }
      } else {
        if (updateType === 'create' || updateType === 'update') {
          this.isAddParam = true
          this.paramEditObj = data
          this.saveParamEdit()
        }
      }
    },
    // 更新参数 proxy id
    updateProxyId() {
      const name2Id = this.name2Id
      // console.log(name2Id, 'name2Id')
      this.paramsList.forEach(item => {
        // console.log(item, 'item')
        if (name2Id[item.name]) {
          item.proxyId = name2Id[item.name]
        }
      })
      this.refreshParamsList()
    },
    duplicateTest() {
      let dupName = ''
      const dupMap = {}
      this.paramsList.forEach((item, index) => {
        // console.log(item, 'item')
        if (!dupMap[item.name]) {
          dupMap[item.name] = 1
        } else {
          dupName = item.name
        }
      })
      return dupName
    },
  },
  watch: {
    defaultParamsList() {
      this.dataInit()
    },
    name2Id: {
      immediate: true,
      handler: function (newVal) {
        this.$nextTick(this.updateProxyId)
      },
    },
  },
}
</script>

<style lang="scss" scoped>
.table-tab-container {
  margin-left: -20px;
}
.prams-list-form {
  .el-form-item {
    margin-bottom: 20px;
  }
}
</style>
<style lang="scss">
.app-edit-param-dialog {
  .datablau-dialog {
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
