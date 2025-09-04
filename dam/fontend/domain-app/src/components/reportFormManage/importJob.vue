<template>
  <div class="tab-page">
    <el-form
      class="page-form"
      label-position="right"
      label-width="120px"
      size="small"
      ref="form"
      :rules="rules"
      :model="importData"
    >
      <el-form-item label="报表类型" prop="type">
        <datablau-select-weak
          :optionsData="{
            data: importTypeArr,
            key: 'value',
            value: 'value',
            label: 'label',
          }"
          v-model="importData.type"
          placeholder="请选择BI类型"
          clearable
          filterable
          @change="handleTypeChange"
        >
          <!-- <el-option
            v-for="item in importTypeArr"
            :label="item.label"
            :value="item.value"
            :key="item.value"
          ></el-option> -->
        </datablau-select-weak>
      </el-form-item>
      <el-form-item
        label="Dispatcher URI"
        prop="CM_URL"
        v-if="importType === 'COGNOS'"
      >
        <datablau-input
          v-model="importData.CM_URL"
          placeholder="请填写 Dispatcher URI"
          clearable
          @change="handleCmchange"
        ></datablau-input>
      </el-form-item>
      <el-form-item
        label="Gateway URI"
        prop="GATEWAY_URL"
        v-if="importType === 'COGNOS'"
      >
        <datablau-input
          v-model="importData.GATEWAY_URL"
          placeholder="请填写 Gateway URI"
          clearable
        ></datablau-input>
      </el-form-item>
      <el-form-item label="服务器" prop="host">
        <datablau-input
          v-model="importData.host"
          placeholder="请填写服务器信息"
          clearable
          auto-complete="off"
          :disabled="hostEditDisabld"
        ></datablau-input>
      </el-form-item>
      <el-form-item label="端口" prop="port">
        <datablau-input
          v-model="importData.port"
          placeholder="请填写端口"
          clearable
          auto-complete="off"
          :disabled="hostEditDisabld"
        ></datablau-input>
      </el-form-item>
      <el-form-item label="用户名" prop="user">
        <datablau-input
          v-model="importData.user"
          placeholder="请填写用户名"
          clearable
          auto-complete="new-password"
        ></datablau-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <datablau-input
          v-model="importData.password"
          placeholder="请填写密码"
          clearable
          auto-complete="new-password"
          type="password"
        ></datablau-input>
      </el-form-item>
      <el-form-item
        label="命名空间"
        prop="NAMINGSPACE"
        v-if="importType === 'COGNOS'"
      >
        <datablau-input
          v-model="importData.NAMINGSPACE"
          placeholder="请填写命名空间"
          clearable
        ></datablau-input>
      </el-form-item>
    </el-form>
    <div class="page-btn-group left-bottom">
      <datablau-button type="secondary" class="white-btn" @click="removetab">
        {{ $t('common.button.cancel') }}
      </datablau-button>
      <datablau-button
        type="important"
        @click="confirmPost"
        :disabled="!testSuccesd"
      >

        {{ $t('common.button.ok') }}

      </datablau-button>
      <datablau-button
        type="important"
        @click="testConnect"
        :disabled="btnDisable"
      >
        测试
      </datablau-button>
    </div>
  </div>
</template>

<script>
export default {
  props: [],
  data() {
    return {
      emptyData: {
        host: '',
        port: '',
        user: '',
        password: '',
        type: 'YONGHONG',
      },
      rules: {},
      defaultRules: {
        host: {
          required: true,
          trigger: 'blur',
          message: '请填写服务器信息',
        },
        port: {
          required: 'true',
          trigger: 'blur',
          message: '请填写端口',
        },
        user: {
          required: 'true',
          trigger: 'blur',
          message: '请填写用户名',
        },
        password: {
          required: 'true',
          trigger: 'blur',
          message: '请填写密码',
        },
        type: {
          required: 'true',
          trigger: 'change',
          message: '请选择导入类型',
        },
      },
      rulesForYonghong: {
        host: {
          required: true,
          trigger: 'blur',
          message: '请填写服务器信息',
        },
        port: {
          required: 'true',
          trigger: 'blur',
          message: '请填写端口',
        },
        user: {
          required: 'true',
          trigger: 'blur',
          message: '请填写用户名',
        },
        password: {
          required: 'true',
          trigger: 'blur',
          message: '请填写密码',
        },
        type: {
          required: 'true',
          trigger: 'change',
          message: '请选择导入类型',
        },
      },
      rulesForCognos: {
        type: {
          required: 'true',
          trigger: 'change',
          message: '请选择导入类型',
        },
        GATEWAY_URL: {
          required: 'true',
          trigger: 'change',
          message: '请填写 Gateway URI',
        },
        CM_URL: {
          required: 'true',
          trigger: 'change',
          message: '请填写 Dispatcher URI',
        },
      },
      hostEditDisabld: false,
      importData: {
        additionalProp: {},
      },
      customCalleeModelName: false, // 数据库名称是否自定义
      resourceTypeArrSelected: [],
      importTypeArr: this.$globalData && this.$globalData.$importTypeArr,
      testSuccesd: false,
      hasRequired: false,
    }
  },

  components: {},
  computed: {
    btnDisable() {
      return !this.hasRequired
    },
    importType() {
      return this.importData && this.importData.type
    },
  },
  beforeMount() {
    this.rules = this.defaultRules
  },

  mounted() {
    this.dataInit()
  },
  destroyed() {},
  watch: {
    importData: {
      deep: true,
      handler: function (newVal) {
        this.hasRequired = this.coverRequired()
      },
      immediate: true,
    },
  },
  methods: {
    /** 响应事件 */
    dataInit() {
      this.importData = this.emptyData
    },
    confirmPost() {
      const url = `${this.$url}/service/dataReport/importBI`
      const para = this.getParams()
      const validate = this.$refs.form.validate()
      validate
        .then(res => {
          if (res) {
            this.$http
              .post(url, para)
              .then(res => {
                this.$message.success('任务创建成功, 开始导入, 请稍后...')
                this.$emit('createdJob', res)
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    getParams() {
      const password = this.$pwEncrypt(this.importData.password)
      const para = {
        type: this.importData.type,
        info: {
          host: this.importData.host,
          port: this.importData.port,
          auth: {
            user: this.importData.user,
            password: password,
          },
          additionalProp: {
            GATEWAY_URL: this.importData.GATEWAY_URL || '',
            CM_URL: this.importData.CM_URL || '',
            NAMINGSPACE: this.importData.NAMINGSPACE || '',
          },
        },
      }
      return para
    },
    removetab() {
      this.$emit('closeEditTab')
    },
    testConnect() {
      const url = `${this.$url}/service/dataReport/importBI/test`
      const para = this.getParams()
      const validate = this.$refs.form.validate()
      validate
        .then(res => {
          if (res) {
            this.$http
              .post(url, para)
              .then(res => {
                this.testSuccesd = true
                this.$message.success('测试成功')
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    handleTypeChange(type) {
      this.hostEditDisabld = false
      if (type === 'COGNOS') {
        this.rules = this.rulesForCognos
        this.hostEditDisabld = true
      } else if (type === 'YONGHONG') {
        this.rules = this.rulesForYonghong
      } else {
        this.rules = this.defaultRules
      }
      if (this.$refs.form && this.$refs.form.clearValidate) {
        this.$nextTick(this.$refs.form.clearValidate)
      }
    },
    getHost(url) {
      let host = url.split('//')[1]
      if (host) {
        host = host.split('/')[0]
      }
      if (host) {
        host = host.split(':')[0]
      }
      return host || ''
    },
    getPort(url) {
      let port = ''
      let host = url.split('//')[1]
      if (host) {
        host = host.split('/')[0]
      }
      if (host) {
        port = host.split(':')[1]
      }
      return port || ''
    },
    handleCmchange(url) {
      this.importData.host = this.getHost(url)
      this.importData.port = this.getPort(url)
    },
    coverRequired() {
      let result = true
      // this.rules
      for (const key in this.rules) {
        if (this.rules[key].required && !this.importData[key]) {
          result = false
        }
      }
      return result
    },
  },
}
</script>
<style scoped lang="scss">
.page-btn-group {
  border-top: 1px solid #e0e0e0;
  text-align: right;
  padding-top: 10px;
  box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
}
</style>
<style lang="scss">
.halfWidth {
  width: 40%;
}

.description {
  #desc {
    width: 40%;
  }
}
</style>
