<template>
  <div>
    <datablau-form
      :model="editBody"
      label-width="8em"
      :rules="editRules"
      ref="form"
      size="m"
    >
      <el-form-item
        label="编码"
        :rules="{
          required: true,
          message: '编码不能为空',
        }"
        prop="code"
      >
        <datablau-input
          show-word-limit
          maxlength="100"
          v-model="editBody.code"
          style="width: 100%"
          class="maxlengthInput edit-form-limit-input"
        ></datablau-input>
      </el-form-item>
      <el-form-item
        label="名称"
        :rules="{
          required: true,
          message: '名称不能为空',
        }"
        prop="name"
      >
        <datablau-input
          show-word-limit
          maxlength="100"
          v-model="editBody.name"
          style="width: 100%"
          class="maxlengthInput edit-form-limit-input"
        ></datablau-input>
      </el-form-item>
      <el-form-item label="值域类型">
        <datablau-select
          v-model="editBody.type"
          @change="typeChange"
          style="width: 100%"
        >
          <el-option value="STRING" label="字符串"></el-option>
          <el-option value="LONG" label="数值"></el-option>
          <el-option value="DATE" label="日期"></el-option>
          <el-option value="BOOLEAN" label="布尔值"></el-option>
          <el-option value="ENUM" label="枚举值"></el-option>
          <el-option value="USERS" label="用户"></el-option>
          <el-option value="ROLE" label="角色"></el-option>
          <el-option value="ORGANIZATION" label="部门"></el-option>
          <el-option value="EXPRESS" label="审批人"></el-option>
        </datablau-select>
      </el-form-item>
      <el-form-item
        label="默认值"
        prop="value"
        ref="value"
        v-if="editBody.type !== 'EXPRESS'"
      >
        <!--  v-if="editBody.type === 'DATE'" -->
        <datablau-datePicker
          v-if="editBody.type === 'DATE'"
          v-model="editBody.value"
          :dateTime="editBody.value"
          :datePickerType="'datetime'"
          placeholder="选择日期"
          style="width: 100%"
          class="log-manage-picker"
          clearable
        ></datablau-datePicker>
        <datablau-select
          v-model="editBody.value"
          v-else-if="editBody.type === 'BOOLEAN'"
          style="width: 100%"
        >
          <el-option :value="true" label="true"></el-option>
          <el-option :value="false" label="false"></el-option>
        </datablau-select>
        <!-- readonly -->
        <datablau-input
          clearable
          v-model="handlers"
          v-else-if="editBody.type === 'USERS'"
          placeholder="请选择审批人"
          style="width: 100%"
          @focus="selectUser"
          @change="changeClear(1)"
        ></datablau-input>
        <!--        <sqy-select v-else-if="editBody.type === 'USERS'" :plist="peopleList" placeholder="请选择审批人" @valueChange="valueChange"></sqy-select>-->
        <datablau-select
          v-else-if="editBody.type === 'ROLE'"
          style="width: 100%"
          v-model="editBody.value"
          clearable
          placeholder="请选择该用户的角色"
        >
          <el-option
            v-for="role in allRoles"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          ></el-option>
        </datablau-select>
        <!-- readonly -->
        <datablau-input
          v-model="branch"
          v-else-if="editBody.type === 'ORGANIZATION'"
          clearable
          placeholder="请选择部门"
          style="width: 100%"
          @focus="selectBranch"
          @change="changeClear(2)"
        ></datablau-input>
        <datablau-input
          show-word-limit
          maxlength="100"
          v-else
          v-model="editBody.value"
          placeholder="请填写默认值"
          @blur="validateDefAndOpt"
          style="width: 100%"
          class="maxlengthInput edit-form-limit-input"
        ></datablau-input>
      </el-form-item>
      <!-- v-show="editBody.type === 'ENUM'" -->
      <el-form-item label="枚举项" v-show="editBody.type === 'ENUM'">
        <datablau-input
          show-word-limit
          maxlength="100"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 6 }"
          v-model="editBody.enums"
          placeholder="请输入备选值，以分号分隔"
          style="width: 100%"
        ></datablau-input>
      </el-form-item>
      <el-form-item
        label="其他"
        prop="readable"
        v-if="!isExpress"
        style="display: inline-block"
      >
        <el-checkbox
          name="readable"
          v-model="editBody.readable"
          label="可见"
        ></el-checkbox>
        <el-checkbox
          name="writable"
          v-model="editBody.writable"
          label="可编辑"
        ></el-checkbox>
        <el-checkbox
          name="required"
          v-model="editBody.required"
          label="必填"
        ></el-checkbox>
      </el-form-item>
      <!-- <el-form-item prop="writable" v-if="!isExpress" style="display: inline-block">
        <el-checkbox
          name="writable"
          v-model="editBody.writable"
          label="可编辑"
        ></el-checkbox>
      </el-form-item>
      <el-form-item prop="required" v-if="!isExpress" style="display: inline-block">
        <el-checkbox
          name="required"
          v-model="editBody.required"
          label="必填"
        ></el-checkbox>
      </el-form-item> -->
      <!-- v-if="isExpress" -->
      <el-form-item label="审批人表达式" prop="express" v-if="isExpress">
        <datablau-select
          v-model="expressNameValue"
          style="width: 100%; display: block"
          placeholder="请选择"
          @change="expressNameChange"
        >
          <el-option
            v-for="item in expressNameOptions"
            :key="item.expressName"
            :label="item.expressName"
            :value="item.id"
          ></el-option>
        </datablau-select>
        <datablau-input
          style="width: 100%; margin-top: 10px"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 6 }"
          placeholder="请输入表达式"
          v-model="expressObj.express"
        ></datablau-input>
        <datablau-button
          type="text"
          style="
            margin-top: 10px;
            margin-left: 10px;
            float: right;
            margin-right: 31%;
          "
        >
          <a
            href="./static/审批人表达式规范说明.pdf"
            target="_blank"
            style="color: #409eff"
          >
            查看输入规范
          </a>
        </datablau-button>
      </el-form-item>
    </datablau-form>
    <div
      class="dialog-bottom"
      slot="footer"
      style="margin-top: 1em; overflow: auto; text-align: right"
    >
      <datablau-button
        type="secondary"
        class="white-btn"
        size="small"
        @click="close"
      >
        <!-- 返 回 -->

        {{ $t('common.button.cancel') }}
      </datablau-button>
      <datablau-button
        type="important"
        style="width: 74px"
        size="small"
        @click="beforeSave"
        :disabled="disabledSave"
      >
        保存
      </datablau-button>
    </div>
  </div>
</template>

<script>
import HTTP from '@/http/main'
export default {
  props: ['currentRow', 'maxOrder', 'dupUdpNamMap'],
  data() {
    const nameValidate = (rule, value, callback) => {
      value = _.trim(value)
      if (!value) {
        callback(new Error('请输入名称'))
      } else if (this.dupUdpNamMap[value] && this.oldName !== value) {
        callback(new Error(`已存在名称为 [${value}] 的属性`))
      } else {
        callback()
      }
    }
    return {
      editBody: {
        code: '',
        name: '',
        type: 'STRING', // STRING, NUM, NUM_RANGE, ENUM, BOOLEAN
        value: '',
        order: this.maxOrder + 1,
        enums: '',
        readable: true,
        writable: true,
        required: false,
      },
      oldName: '',
      editRules: {
        name: [
          {
            required: true,
            message: '名称不能为空',
            trigger: 'blur',
            validator: nameValidate,
          },
        ],
        code: {
          required: true,
          message: '编码不能为空',
          trigger: 'blur',
        },
        express: {
          required: true,
          message: '表达式不能为空',
          trigger: 'blur',
        },
      },
      handlers: '',
      nameMapping: {},
      allRoles: [],
      branch: '',
      peopleList: [],
      expressNameOptions: [],
      expressNameValue: '',
      expressObj: {
        expressName: '',
        express: '',
      },
    }
  },
  mounted() {
    if (this.currentRow) {
      this.oldName = this.currentRow.name
      if (this.currentRow.enums) {
        this.currentRow.enums = this.currentRow.enums.join(';')
      }
      let editBody = _.clone(this.currentRow)
      // 初始化数据, 将时间戳类型, 转成时间字符串
      if (editBody.type === 'DATE' && !isNaN(editBody.value - 0)) {
        editBody.value = new Date(editBody.value - 0).toISOString()
      }
      this.editBody = editBody
    }
    if (this.editBody.type === 'USERS') {
      // this.getUserByIds(this.editBody.value.toString().split(','))
      this.handlers = this.currentRow.value
    } else if (this.editBody.type === 'ORGANIZATION') {
      this.$http
        .post(`/user/org/organization/byBm?bm=${this.editBody.value}`)
        .then(res => {
          this.branch = res.data?.fullName || ''
        })
        .catch(e => {
          this.$showFailure(e)
        })
      /* this.$getBranchNameByToBm(this.editBody.value).then(res => {
        this.branch = res[this.editBody.value]
      }) */
    } else if (this.editBody.type === 'ROLE') {
      this.getAllRoles()
    } else if (this.editBody.type === 'EXPRESS') {
      this.getExpressOptions()
      this.expressObj = JSON.parse(this.editBody.value)
      this.expressNameValue = JSON.parse(this.editBody.value).expressName
    }
    HTTP.getFormItemDataType()
      .then(res => {
        const data = res.data
      })
      .catch(e => {
        this.$showFailure(e)
      })
  },
  computed: {
    disabledSave() {
      const name = _.trim(this.editBody.name)
      return !name || (!!this.dupUdpNamMap[name] && this.oldName !== name)
    },
    isExpress() {
      if (this.editBody.type === 'EXPRESS') {
        return true
      } else {
        return false
      }
    },
  },
  methods: {
    beforeSave() {
      if (!this.editBody.name) {
        this.$message.error('名称是必填的')
        return
      }
      if (this.editBody.name.length > 127) {
        this.$message.error('名称长度不能超过127个字符')
        return
      }
      if (this.editBody.type === 'EXPRESS') {
        if (
          this.expressObj.expressName === '' &&
          this.expressObj.express === ''
        ) {
          this.$message.error('审批人表达式不能为空')
          return
        }
      }
      this.createOrUpdateUdp()
    },
    typeChange() {
      this.editBody.value = ''
      if (this.editBody.type === 'ROLE') {
        this.getAllRoles()
      }
      if (this.editBody.type === 'EXPRESS') {
        this.getExpressOptions()
      }
    },
    getExpressOptions() {
      HTTP.getExpressAll()
        .then(res => {
          res.data.forEach(element => {
            this.expressNameOptions.push(element)
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    expressNameChange(value) {
      this.expressNameOptions.forEach(element => {
        if (element.id === value) {
          this.expressObj = element
        }
      })
    },
    getAllRoles() {
      HTTP.getAllGroups()
        .then(res => {
          const rawDataMap = res.data
          const arr = []
          for (const user in rawDataMap) {
            const item = rawDataMap[user]
            arr.push(item)
          }
          this.allRoles = arr
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    selectBranch() {
      this.$utils.branchSelect.open().then(res => {
        this.branch = res.fullName
        // this.editBody.value = res.bm
        this.$set(this.editBody, 'value', res.bm)
      })
    },
    createOrUpdateUdp() {
      const requestBody = _.cloneDeep(this.editBody)
      requestBody.modifiable = true
      if (requestBody.type !== 'ENUM') {
        delete requestBody.enums
      } else {
        requestBody.enums = requestBody.enums.split(';')
      }
      if (requestBody.type === 'EXPRESS') {
        requestBody.readable = false
        requestBody.required = false
        requestBody.writable = false
        requestBody.value = JSON.stringify(this.expressObj)
      }
      if (this.currentRow) {
        this.$emit('updateFormItem', requestBody)
      } else {
        this.$emit('addFormItem', requestBody)
      }
    },
    validateDefAndOpt() {
      if (this.$refs.form && this.$refs.form.validateField) {
        this.$refs.form.validateField(['value', 'options'])
      }
    },
    close() {
      this.$emit('close')
    },
    selectUser() {
      this.$utils.staffSelect.open().then(res => {
        const arr1 = []
        const arr2 = []
        res.forEach(e => {
          arr1.push(e.username)
          arr2.push(e.username)
        })
        this.editBody.value = arr1.toString()
        this.handlers = arr2.toString()
      })
    },
    // 使得input输入框内容不可输入
    changeClear(type) {
      if (type === 1) {
        this.editBody.value = ''
        this.handlers = ''
      } else {
        this.branch = ''
        this.editBody.value = ''
      }
    },
    getUserByIds(idList) {
      // if (!idList) {
      //   return
      // }
      // return new Promise(resolve => {
      //   this.$http.post(`${this.$url}/service/staffs/ids?isTuAcct=true`, idList).then(res => {
      //     const obj = {}
      //     // this.peopleList = []
      //     res.data.forEach(e => {
      //       // const obj = {
      //       //   tuAcct: e.tuAcct,
      //       //   tuCname: e.tuCname
      //       // }
      //       // this.peopleList.push(obj)
      //       obj[e.tuAcct] = e.tuCname
      //     })
      //     this.nameMapping = obj
      //     this.handlers = this.getPeopleName(this.editBody.value.split(','))
      //   }).catch(e => {
      //     this.$showFailure(e)
      //   })
      // })
    },
    getPeopleName(list) {
      // return list.map(e => this.nameMapping[e]).toString()
      return list.toString()
    },
    valueChange(val) {
      this.editBody.value = val
    },
  },
  watch: {
    handlers(val) {
      if (!val) {
        this.editBody.value = ''
      }
    },
    branch(val) {
      if (!val) {
        this.editBody.value = ''
      }
    },
  },
}
</script>

<style lang="scss" scoped>
/deep/ .el-form-item__label {
  line-height: 34px;
  height: 34px;
}
.edit-form-limit-input {
  /deep/ .el-input__inner {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
// .log-manage-picker {
/deep/ .log-manage-picker.datablau-datapicker .el-date-editor.el-input,
.datablau-datapicker .el-date-editor.el-input__inner {
  width: 100%;
}
// }
</style>
