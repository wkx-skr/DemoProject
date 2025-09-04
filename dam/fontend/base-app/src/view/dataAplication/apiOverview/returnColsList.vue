<template>
  <div class="return-cols-list-component">
    <datablau-dialog
      title="编辑返回值"
      :visible.sync="returnEditVisible"
      width="560px"
      size="s"
      class="app-edit-return-dialog"
      append-to-body
      :close-on-click-modal="false"
      key="editReturnCol"
    >
      <el-form
        label-width="100px"
        :model="returnEditObj"
        :rules="rules"
        ref="editForm"
        class="prams-list-form"
      >
        <el-form-item label="返回值名称：" prop="name">
          <datablau-input
            size="mini"
            clearable
            v-model="returnEditObj.name"
            class="edit-item-input"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="别名：" prop="alias">
          <datablau-input
            size="mini"
            clearable
            v-model="returnEditObj.alias"
            class="edit-item-input"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="分组：" prop="apiGroup">
          <datablau-input
            size="mini"
            clearable
            v-model="returnEditObj.apiGroup"
            class="edit-item-input"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="说明：" prop="description" class="textarea-outer">
          <datablau-input
            size="mini"
            type="textarea"
            clearable
            v-model="returnEditObj.description"
            class="edit-item-input"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="安全等级：" prop="type" v-if="false">
          <el-select
            size="mini"
            v-model="returnEditObj.safeLevel"
            filterable
            clearable
            class="edit-item-input"
          >
            <el-option
              v-for="item in safeLevels"
              :key="item"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-bottom">
        <datablau-button type="secondary" @click="returnEditVisible = false">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="primary"
          @click="saveReturnObj"
          class=""
          :disabled="!couldSaveReturnEdit"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-table
      :showColumnSelection="false"
      :data="tableData"
      style="width: 100%; margin-bottom: 20px"
      row-key="autoId"
      default-expand-all
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column label="" align="right" width="120">
        <template slot-scope="scope">
          <template v-if="scope.row.sortIndex < 3">
            <span :class="[scope.row.name, 'return-tag']">
              {{ scope.row.description }}
            </span>
          </template>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="返回值名称"></el-table-column>
      <el-table-column prop="alias" label="别名"></el-table-column>
      <el-table-column prop="apiGroup" label="分组"></el-table-column>
      <el-table-column prop="description" label="说明"></el-table-column>
      <el-table-column
        v-if="isEdit"
        align="center"
        width="200"
        min-width="200"
        label="操作"
      >
        <template slot-scope="scope">
          <datablau-button
            type="text"
            size="small"
            :disabled="cannotEditOrDelete(scope.row)"
            @click="editReturnObj(scope.row)"
            style="margin-left: 0px"
          >
            {{ $t('common.button.edit') }}
          </datablau-button>
          <datablau-button
            type="text"
            size="small"
            :disabled="cannotEditOrDelete(scope.row)"
            @click="deleteReturnObj(scope.row)"
            style="margin-left: 0px"
          >
            {{ $t('common.button.delete') }}
          </datablau-button>
          <datablau-button
            type="text"
            size="small"
            :disabled="cannotReduceIndex(scope.row)"
            @click="reduceIndex(scope.row)"
            style="width: 24px; margin-left: 0px"
          >
            <i class="iconfont icon-up"></i>
          </datablau-button>
          <datablau-button
            type="text"
            size="small"
            :disabled="cannotIncreaseIndex(scope.row)"
            @click="increaseIndex(scope.row)"
            style="width: 24px; margin-left: 0px"
          >
            <i class="iconfont icon-down"></i>
          </datablau-button>
        </template>
      </el-table-column>
    </datablau-table>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'returnColsList',
  data() {
    return {
      tableData: [],
      tableHeightInfo: '',
      returnColumnDefs: [],
      tableHidePagination: true,
      defaultParaData: {},
      tableOption: {
        rowSelection: 'single', //  multiple
      },
      hideTopLine: true,
      hideBottomLine: true,
      autoIncreaseId: 10,
      isAddReturnCol: false,
      returnEditVisible: false,
      returnEditObj: {
        id: '',
        name: '',
        alias: '',
        apiGroup: '',
        description: '',
        safeLevel: '',
        status: '',
        modifyTime: '',
        apiId: '',
      },
      defaultReturnObjMap: {
        6: {
          id: '',
          name: 'code',
          alias: '',
          apiGroup: '',
          description: '返回码',
          safeLevel: '',
          status: '',
          modifyTime: '',
          apiId: '',
          autoId: 6,
          sortIndex: 0,
        },
        7: {
          id: '',
          name: 'message',
          alias: '',
          apiGroup: '',
          description: '返回说明',
          safeLevel: '',
          status: '',
          modifyTime: '',
          apiId: '',
          autoId: 7,
          sortIndex: 1,
        },
        8: {
          id: '',
          name: 'data',
          alias: '',
          apiGroup: '',
          description: '返回结果集',
          safeLevel: '',
          status: '',
          modifyTime: '',
          apiId: '',
          autoId: 8,
          sortIndex: 2,
        },
        9: {
          id: '——',
          name: '——',
          alias: '——',
          apiGroup: '——',
          description: '——',
          safeLevel: '——',
          status: '——',
          modifyTime: '——',
          apiId: '——',
          autoId: 9,
          level: 0,
        },
      },
      returnObjMap: {},
      // couldSaveReturnEdit: false,
      returnColsList: [],
      returnColRepeat: false,
      rules: {
        name: [
          {
            trigger: 'blur',
            required: true,
            message: '请输入返回值名称',
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
            validator: this.$utils.validator.maxLengthCustom(50),
          },
        ],
        apiGroup: [
          {
            trigger: 'blur',
            validator: this.$utils.validator.maxLengthCustom(50),
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
    safeLevels: {},
    isEdit: {
      type: Boolean,
      default: false,
    },
    defaultReturnColsList: {
      type: Array,
      default() {
        return []
      },
    },
    apiEditData: {
      type: Object,
      default() {
        return {}
      },
    },
    getColumnList: {},
  },
  components: {},
  computed: {
    couldSaveReturnEdit() {
      return this.returnEditObj && _.trim(this.returnEditObj.name)
    },
  },
  mounted() {
    this.returnEditObj.apiId =
      this.apiEditData && this.apiEditData.id ? this.apiEditData.id : ''
    this.returnObjMap = _.cloneDeep(this.defaultReturnObjMap)
    // this.defaultParamsMap
    Object.keys(this.defaultReturnObjMap).forEach(key => {
      this.returnObjMap[key] = _.merge(
        {},
        this.returnEditObj,
        this.defaultReturnObjMap[key]
      )
    })

    this.dataInit()
  },
  methods: {
    cannotEditOrDelete(data) {
      return data.sortIndex < 3
    },
    cannotReduceIndex(data) {
      let bool = false
      let defaultCount = 4
      if (this.apiEditData.apiAccessMethod === 'PROXY_API') {
        defaultCount = defaultCount - 3
      }
      if (data.sortIndex < 3) {
        // 禁止编辑
        bool = true
      } else if (data.sortIndex < defaultCount) {
        bool = true
      }
      return bool
    },
    cannotIncreaseIndex(data) {
      let bool = false
      if (data.sortIndex < 3) {
        // 禁止编辑
        bool = true
      } else if (data.isLast) {
        // 最后一个
        bool = true
      }
      return bool
    },
    dataInit() {
      this.returnColsList = _.cloneDeep(this.defaultReturnColsList)
      this.refreshEditData()
    },
    getReturnListShowData() {
      return new Promise((resolve, reject) => {
        try {
          let arr = []
          if (this.apiEditData.apiAccessMethod !== 'PROXY_API') {
            arr = ['6', '7', '8']
              .map(item => this.defaultReturnObjMap[item])
              .concat(this.returnColsList)
          } else {
            arr = this.returnColsList
          }
          if (arr.length > 0) {
            arr.sort((a, b) => a.sortIndex - b.sortIndex)
            arr = arr.slice(0, arr.length)
            // arr.splice(3, 0, this.returnObjMap['9'])
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
    getReturnCols(sql = '') {
      const fromIndex = sql.toLowerCase().indexOf('from ')
      if (fromIndex !== -1) {
        sql = sql.slice(0, fromIndex)
      }
      let arr = []
      if (sql.indexOf('*') !== -1) {
        // select *
        if (this.apiEditData.apiAccessMethod === 'CUSTOM_SQL') {
          this.$message.info('使用 * 时请选择表')
          return
        }
        this.getColumnList()
          .then(data => {
            data.forEach(item => {
              arr.push(item.physicalName)
            })
            this.returnColsFormatter(arr)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        sql = sql.slice(6)
        arr = sql.split(',')
        if (!sql) {
          arr = []
        }
        arr = arr.map(item => {
          item = _.trim(item)
          let result = item
          if (item.toLowerCase().indexOf(' as ') !== 0) {
            const cols = item.split(/\sas\s/i) || []
            if (cols && cols[1]) {
              result = cols[1]
            }
          } else {
            // table.column
            const cols = item.split('.')
            if (cols && cols[1]) {
              result = cols[1]
            }
          }
          return _.trim(result)
        })

        this.returnColsFormatter(arr)
      }
    },
    // 将 SQL 中 select 的字段加入的返回值列表
    returnColsFormatter(arr) {
      arr = arr.map(item => {
        const obj = {
          name: item.includes('_')
            ? this.$utils.string.underLine2Hump(item)
            : item.toLowerCase(),
          id: '',
          alias: item,
          apiGroup: '',
          description: '',
          safeLevel: '',
          status: '',
          modifyTime: '',
          apiId:
            this.apiEditData && this.apiEditData.id ? this.apiEditData.id : '',
          autoId: this.autoIncreaseId++,
          level: 1,
        }
        this.returnObjMap[obj.autoId] = obj
        return obj
      })
      // 判断是否有重复字段
      let returnColRepeat = false
      const dupMap = {}
      arr.forEach((item, index) => {
        // console.log(item, 'item')
        if (!dupMap[item.name]) {
          dupMap[item.name] = 1
        } else {
          returnColRepeat = true
          this.$message.info(`名称为 ${item.name} 的返回值重复`)
        }

        item.sortIndex = index + 3
        this.returnObjMap[item.autoId] = item
      })
      this.returnColsList = arr
      this.returnColRepeat = returnColRepeat
      this.refreshReturnList()
    },
    reduceIndex(data) {
      if (data.sortIndex > 2) {
        const currentObj = this.returnColsList.find(
          item => item.sortIndex === data.sortIndex
        )
        const otherObj = this.returnColsList.find(
          item => item.sortIndex === data.sortIndex - 1
        )
        if (otherObj) {
          otherObj.sortIndex++
          currentObj.sortIndex--
          this.refreshReturnList()
        }
      }
    },
    increaseIndex(data) {
      if (data.sortIndex < this.returnColsList.length + 2) {
        const currentObj = this.returnColsList.find(
          item => item.sortIndex === data.sortIndex
        )
        const otherObj = this.returnColsList.find(
          item => item.sortIndex === data.sortIndex + 1
        )
        if (otherObj) {
          otherObj.sortIndex--
          currentObj.sortIndex++
          this.refreshReturnList()
        }
      }
    },
    refreshReturnList() {
      this.$emit('sqlColsDuplicateTest')
    },
    resizeTable() {
      if (this.$refs.returnList && this.$refs.returnList.resetTableStyle) {
        this.$refs.returnList.resetTableStyle()
      }
    },
    addReturnCol() {
      this.isAddReturnCol = true
      Object.keys(this.returnEditObj).forEach(key => {
        this.returnEditObj[key] = ''
      })
      this.returnEditObj.apiId =
        this.apiEditData && this.apiEditData.id ? this.apiEditData.id : ''
      this.returnEditObj.autoId = this.autoIncreaseId++
      this.returnEditVisible = true
      this.clearValidate()
    },
    editReturnObj(data) {
      this.isAddReturnCol = false
      this.returnEditObj = _.clone(data)
      this.returnEditVisible = true
      this.clearValidate()
    },
    clearValidate() {
      this.$nextTick(() => {
        if (this.$refs.editForm && this.$refs.editForm.clearValidate) {
          this.$refs.editForm.clearValidate()
        }
      })
    },
    deleteReturnObj(data) {
      this.returnColsList = this.returnColsList.filter(
        item => item.autoId !== data.autoId
      )
      delete this.returnObjMap[data.autoId]

      setTimeout(() => {
        this.refreshReturnList()
      }, 300)
    },
    saveReturnObj() {
      // 校验是否有名称重复
      const nameMap = {}
      let dupName = ''
      this.returnColsList.forEach(item => {
        if (!nameMap[item.name]) {
          nameMap[item.name] = item
        } else {
          if (item.autoId !== nameMap[item.name].autoId) {
            dupName = item.name
          }
        }
      })
      if (
        nameMap[this.returnEditObj.name] &&
        this.returnEditObj.autoId !== nameMap[this.returnEditObj.name].autoId
      ) {
        dupName = this.returnEditObj.name
      }
      if (dupName) {
        this.$showFailure(`名称为 ${dupName} 的返回值重复`)
        return
      }

      if (!this.returnEditObj.autoId) {
        this.returnEditObj.autoId = this.autoIncreaseId++
      }
      if (!this.isAddReturnCol) {
        this.returnObjMap[this.returnEditObj.autoId] = _.merge(
          this.returnObjMap[this.returnEditObj.autoId],
          this.returnEditObj
        )
      } else {
        const obj = _.clone(this.returnEditObj)
        this.$set(this.returnObjMap, obj.autoId, obj)
        this.returnColsList.push(obj)
      }
      this.returnEditVisible = false

      setTimeout(() => {
        this.refreshEditData()
        this.refreshReturnList()
      }, 300)
    },
    refreshEditData() {
      const maxIndex = 999999
      const returnObjMap = this.returnObjMap
      // console.log(this.returnColsList, 'this.returnColsList')
      this.returnColsList.forEach(item => {
        item.sortIndex = maxIndex
      })
      this.returnColsList.sort((a, b) => a.sortIndex - b.sortIndex)
      this.returnColsList.forEach((item, index) => {
        if (!item.autoId) {
          item.autoId = this.autoIncreaseId++
        }
        if (
          (!item.sortIndex && item.sortIndex !== 0) ||
          item.sortIndex === maxIndex
        ) {
          item.sortIndex = index + 3
        }
        returnObjMap[item.autoId] = item
      })
      this.returnObjMap = returnObjMap

      this.refreshReturnList()
    },
    getReturnColsList() {
      const responses = _.cloneDeep(this.returnColsList)
      if (responses && Array.isArray(responses)) {
        responses.forEach(item => {
          if (!item.id) {
            delete item.id
          }
          if (!item.apiId) {
            delete item.apiId
          }
          delete item.autoId
          delete item.isLast
          delete item.sortIndex
        })
      }
      return responses
    },
    duplicateTest() {
      let dupName = ''
      const dupMap = {}
      this.returnColsList.forEach((item, index) => {
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
    defaultReturnColsList() {
      this.dataInit()
    },
    returnColsList: {
      handler() {
        let arr = []
        if (!this.returnColRepeat) {
          const list = _.cloneDeep(this.returnColsList)
          if (list.length > 0) {
            list.sort((a, b) => a.sortIndex - b.sortIndex)
            list.forEach(item => {
              item.isLast = false
            })
            list[list.length - 1].isLast = true
          }
          if (this.apiEditData.apiAccessMethod !== 'PROXY_API') {
            arr = ['6', '7', '8'].map(item => this.defaultReturnObjMap[item])
            arr[2].children = list
          } else {
            arr = list
          }
        }
        this.tableData = arr
      },
      deep: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.return-tag {
  display: inline-block;
  font-size: 10px;
  width: 75px;
  border-radius: 5px;
  text-align: center;
}
.return-tag.code {
  background-color: rgba(67, 193, 202, 0.1);
  color: rgb(67, 193, 202);
}
.return-tag.message {
  background-color: rgba(145, 202, 67, 0.1);
  color: rgb(145, 202, 67);
}
.return-tag.data {
  background-color: rgba(79, 118, 223, 0.1);
  color: rgb(79, 118, 223);
}
.table-tab-container {
  margin-left: -20px;
}
.prams-list-form {
  .el-form-item {
    margin-bottom: 20px;
  }
}
.el-table__row.el-table__row--level-1 {
  background-color: rgb(247, 249, 251);
}
</style>

<style lang="scss">
.app-edit-return-dialog {
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
}
.edit-item-input {
  width: 300px;
  //border: 1px solid red;
}
.el-table__row.el-table__row--level-1 {
  background-color: rgb(247, 249, 251);
}
</style>
