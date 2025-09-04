<template>
  <div>
    <el-form
      size="mini"
      :model="editBody"
      label-width="8em"
      :rules="editRules"
      ref="form"
    >
      <el-form-item label="编码" required prop="code">
        <el-input
          clearable
          maxlength="100"
          v-model="editBody.code"
          size="mini"
          style="max-width: 300px"
        ></el-input>
      </el-form-item>
      <el-form-item label="名称" required prop="name">
        <el-input
          clearable
          maxlength="100"
          v-model="editBody.name"
          size="mini"
          style="max-width: 300px"
        ></el-input>
      </el-form-item>
      <el-form-item label="值域类型" style="max-width: 300px">
        <el-select v-model="editBody.type" @change="typeChange">
          <el-option value="STRING" label="字符串"></el-option>
          <el-option value="LONG" label="数值"></el-option>
          <el-option value="DATE" label="日期"></el-option>
          <el-option value="BOOLEAN" label="布尔值"></el-option>
          <el-option value="ENUM" label="枚举值"></el-option>
          <!-- <el-option value="USERS" label="用户"></el-option> -->
          <!-- <el-option value="ROLE" label="角色"></el-option>
          <el-option value="ORGANIZATION" label="部门"></el-option>
          <el-option value="EXPRESS" label="审批人"></el-option> -->
        </el-select>
      </el-form-item>
      <el-form-item
        label="默认值"
        prop="value"
        ref="value"
        v-if="editBody.type !== 'EXPRESS'"
      >
        <el-date-picker
          v-model="editBody.value"
          type="datetime"
          placeholder="选择日期"
          v-if="editBody.type === 'DATE'"
          format="yyyy-MM-dd HH:mm:ss"
          value-format="timestamp"
          size="mini"
          style="max-width: 300px"
          clearable
        ></el-date-picker>
        <el-select
          v-model="editBody.value"
          v-else-if="editBody.type === 'BOOLEAN'"
        >
          <el-option :value="true" label="true"></el-option>
          <el-option :value="false" label="false"></el-option>
        </el-select>
        <el-input
          clearable
          v-model="handlers"
          v-else-if="editBody.type === 'USERS'"
          placeholder="请选择审批人"
          style="max-width: 300px"
          @focus="selectUser"
        ></el-input>
        <!--        <sqy-select v-else-if="editBody.type === 'USERS'" :plist="peopleList" placeholder="请选择审批人" @valueChange="valueChange"></sqy-select>-->
        <el-select
          v-else-if="editBody.type === 'ROLE'"
          style="max-width: 300px"
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
        </el-select>
        <el-input
          v-model="branch"
          v-else-if="editBody.type === 'ORGANIZATION'"
          clearable
          placeholder="请选择部门"
          style="max-width: 300px"
          @focus="selectBranch"
        ></el-input>
        <el-input
          maxlength="100"
          v-else
          v-model="editBody.value"
          placeholder="请填写默认值"
          clearable
          @blur="validateDefAndOpt"
          size="mini"
          style="max-width: 300px"
        ></el-input>
      </el-form-item>
      <el-form-item label="枚举项" v-show="editBody.type === 'ENUM'">
        <el-input
          clearable
          maxlength="100"
          type="textarea"
          :row="4"
          v-model="editBody.enums"
          placeholder="请输入备选值，以分号分隔"
        ></el-input>
      </el-form-item>
      <el-form-item label="其他" prop="readable" v-if="!isExpress">
        <el-checkbox
          name="readable"
          v-model="editBody.readable"
          label="可见"
        ></el-checkbox>
      </el-form-item>
      <el-form-item prop="writable" v-if="!isExpress">
        <el-checkbox
          name="writable"
          v-model="editBody.writable"
          label="可编辑"
        ></el-checkbox>
      </el-form-item>
      <el-form-item prop="required" v-if="!isExpress">
        <el-checkbox
          name="required"
          v-model="editBody.required"
          label="必填"
        ></el-checkbox>
      </el-form-item>
      <el-form-item label="审批人表达式" prop="express" v-if="isExpress">
        <el-select
          v-model="expressNameValue"
          style="max-width: 300px; display: block"
          placeholder="请选择"
          @change="expressNameChange"
        >
          <el-option
            v-for="item in expressNameOptions"
            :key="item.expressName"
            :label="item.expressName"
            :value="item.id"
          ></el-option>
        </el-select>
        <el-input
          style="max-width: 300px; margin-top: 10px"
          type="textarea"
          :rows="2"
          placeholder="请输入表达式"
          v-model="expressObj.express"
        ></el-input>
      </el-form-item>
    </el-form>
    <div style="margin-top: 1em; overflow: auto">
      <el-button
        type="primary"
        size="small"
        @click="beforeSave"
        :disabled="disabledSave"
      >
        保存
      </el-button>
      <el-button class="white-btn" size="small" @click="close">返 回</el-button>
    </div>
  </div>
</template>

<script>
import HTTP from '@/resource/http.js'
export default {
  props: ['currentRow', 'maxOrder', 'dupUdpNamMap'],
  data () {
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
        required: false
      },
      oldName: '',
      editRules: {
        name: {
          validator: nameValidate,
          required: true,
          trigger: 'blur'
        },
        code: {
          required: true,
          trigger: 'blur'
        },
        express: {
          required: true,
          trigger: 'blur'
        }
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
        express: ''
      }
    }
  },
  mounted () {
    if (this.currentRow) {
      this.oldName = this.currentRow.name
      if (this.currentRow.enums) {
        this.currentRow.enums = this.currentRow.enums.join(';')
      }
      this.editBody = _.clone(this.currentRow)
    }
    if (this.editBody.type === 'USERS') {
      // this.getUserByIds(this.editBody.value.toString().split(','))
    } else if (this.editBody.type === 'ORGANIZATION') {
      this.$getBranchNameByToBm(this.editBody.value).then(res => {
        this.branch = res[this.editBody.value]
      })
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
    disabledSave () {
      const name = _.trim(this.editBody.name)
      return !name || (!!this.dupUdpNamMap[name] && this.oldName !== name)
    },
    isExpress () {
      if (this.editBody.type === 'EXPRESS') {
        return true
      } else {
        return false
      }
    }
  },
  methods: {
    beforeSave () {
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
    typeChange () {
      this.editBody.value = ''
      if (this.editBody.type === 'ROLE') {
        this.getAllRoles()
      }
      if (this.editBody.type === 'EXPRESS') {
        this.getExpressOptions()
      }
    },
    getExpressOptions () {
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
    expressNameChange (value) {
      this.expressNameOptions.forEach(element => {
        if (element.id === value) {
          this.expressObj = element
        }
      })
    },
    getAllRoles () {
      this.$http
        .get(this.$url + '/service/usermanagement/groups')
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
    selectBranch () {
      this.$utils.branchSelect.open().then(res => {
        this.branch = res.fullName
        this.editBody.value = res.bm
      })
    },
    createOrUpdateUdp () {
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
    validateDefAndOpt () {
      if (this.$refs.form && this.$refs.form.validateField) {
        this.$refs.form.validateField(['value', 'options'])
      }
    },
    close () {
      this.$emit('close')
    },
    selectUser () {
      console.log(1234)
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
    getUserByIds (idList) {
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
    getPeopleName (list) {
      // return list.map(e => this.nameMapping[e]).toString()
      return list.toString()
    },
    valueChange (val) {
      this.editBody.value = val
    }
  },
  watch: {
    handlers (val) {
      if (!val) {
        this.editBody.value = ''
      }
    },
    branch (val) {
      if (!val) {
        this.editBody.value = ''
      }
    }
  }
}
</script>

<style scoped></style>
