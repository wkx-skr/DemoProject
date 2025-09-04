<template>
  <div class="apply-info">
    <el-form
      class="st-page-form"
      :inline="inlineInfo"
      ref="ruleForm"
      label-position="right"
      label-width="80px"
      :model="apiData"
      :rules="rules"
    >
      <el-form-item label="API名称">
        <span style="width: 300px">{{ apiData.apiName }}</span>
      </el-form-item>
      <br />
      <el-form-item label="版本号">
        <span style="width: 280px">{{ apiData.version }}</span>
      </el-form-item>
      <br />
      <el-form-item label="访问地址">
        <span style="width: 700px">{{ apiData.baseURL }}</span>
      </el-form-item>
      <br />
      <el-form-item
        label="应用名称"
        prop="appId"
        v-if="componentType === 'requestAPI'"
      >
        <span style="width: 280px">{{ apiData.appName }}</span>
      </el-form-item>
      <el-form-item
        label="选择应用"
        prop="appId"
        v-if="componentType !== 'requestAPI'"
      >
        <datablau-select
          @change="appChange"
          :disabled="componentType === 'requestAPI'"
          v-model="apiData.appId"
          style="width: 300px"
          clearable
          filterable
        >
          <el-option
            v-for="item in appOption"
            :key="item.id"
            :value="item.id"
            :label="item.applicationName"
          >
            <i v-if="item.id === 0" class="el-icon-circle-plus-outline"></i>
            <span
              v-if="item.appId === 0"
              style="font-weight: bold; margin-left: 0.5em"
            >
              {{ item.applicationName }}
            </span>
            <span v-if="item.appId !== 0">{{ item.applicationName }}</span>
          </el-option>
        </datablau-select>
      </el-form-item>
      <br />
      <el-form-item label="有效期" prop="dateContent">
        <datablau-radio
          v-model="apiData.dateContent"
          @change="handleRadioChange"
        >
          <el-radio :label="longDate" name="dateContent">长期</el-radio>
          <el-radio label="30" name="dateContent">30天</el-radio>
          <el-radio label="60" name="dateContent">60天</el-radio>
          <el-radio label="90" name="dateContent">90天</el-radio>
          <el-radio label="自定义" name="dateContent"></el-radio>
        </datablau-radio>
      </el-form-item>
      <datablau-datePicker
        v-if="apiData.dateContent === '自定义'"
        prop="dateTimeString"
        :disabled="apiData.dateContent !== '自定义'"
        style="margin-left: -30px; display: inline-block"
        :picker-options="pickerOptions"
        v-model="dateInfo"
        format="yyyy-MM-dd "
        placeholder="选择日期时间"
        size="mini"
        :now-before-state="true"
      ></datablau-datePicker>
      <el-form-item label="申请原因" prop="applyReason">
        <datablau-input
          type="textarea"
          resize="none"
          style="width: 600px"
          maxlength="50"
          show-word-limit
          :rows="2"
          v-model="apiData.applyReason"
        ></datablau-input>
      </el-form-item>
    </el-form>
    <div class="dialog-bottom">
      <datablau-button type="secondary" size="mini" @click="cancelItem">
        {{ $t('common.button.cancel') }}
      </datablau-button>
      <datablau-button type="primary" size="mini" @click="confirmItem">
        提交
      </datablau-button>
    </div>
  </div>
</template>
<script>
import HTTP from '../ddsHTTP.js'
export default {
  created() {
    this.getAppOption()
  },
  mounted() {
    this.apiData.apiName = this.applyDetail.name
    this.apiData.version = this.applyDetail.version
    this.apiData.baseURL = this.applyDetail.baseURL
    if (this.componentType === 'requestAPI') {
      this.apiData.apiId = this.applyDetail.apiId
      this.apiData.appId = this.applyDetail.appId
      this.apiData.appName = this.applyDetail.appName
    } else {
      this.apiData.apiId = this.applyDetail.id
    }
    console.log(this.apiData, 'this.apiData')
  },
  props: ['applyDetail', 'componentType'], // componentType=requestAPI 我申请的api，再申请
  data() {
    return {
      inlineInfo: true,
      longDate: null,
      appMap: {},
      appOption: [],
      catlogOption: [],
      apiData: {
        apiName: '',
        apiId: null,
        appId: null,
        appName: null,
        version: '',
        baseURL: '',
        dateType: null,
        dateContent: null,
        applyReason: '',
      },
      dateInfo: '',
      rules: {
        dateContent: [
          { required: true, message: '请输入有效期', trigger: 'blur' },
        ],
        appId: [{ required: true, message: '请选择应用', trigger: 'change' }],
        applyReason: { max: 50, message: '字符长度50以下', trigger: 'blur' },
      },
      pickerOptions: {
        disabledDate: time => {
          return time.getTime() < Date.now()
        },
      },
      statusOpt: [
        {
          label: '启用',
          value: '1',
        },
        {
          label: '禁用',
          value: '0',
        },
      ],
    }
  },
  methods: {
    handleRadioChange(newval) {
      if (newval === '自定义') {
        this.dateInfo = new Date().valueOf() + 86400000
      } else {
        this.dateInfo = ''
      }
    },
    appChange(item) {
      if (item === 0) {
        this.apiData.appId = null
        const routeData = this.$router.resolve({
          name: 'devApp',
          query: { type: '新增' },
        })
        window.open(routeData.href, '_blank')
      }
    },
    getAppOption() {
      const name = this.$user.username
      HTTP.getAllMyApp(name)
        .then(res => {
          this.appOption = res.data
          res.data.forEach(item => {
            this.appMap[item.id] = item.applicationName
          })
          const obj = {
            id: 0,
            applicationName: '去添加应用',
          }
          this.appOption.push(obj)
          if (this.applyDetail.id && !this.applyDetail.appId) {
            this.apiData.appName = this.appMap[this.apiData.id]
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    confirmItem() {
      if (this.apiData.dateContent === null) {
        this.apiData.dateContent = 'eeeee'
      }
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          if (this.apiData.dateContent === 'eeeee') {
            this.apiData.dateContent = null
          }
          if (!this.apiData.dateContent) {
            this.apiData.dateType = 1
          } else if (this.apiData.dateContent === '自定义') {
            this.apiData.dateType = 3

            this.apiData.dateContent = new Date(this.dateInfo).getTime()
          } else {
            this.apiData.dateType = 2
          }
          this.apiData.appName = this.appMap[this.apiData.appId]
          let newPromise
          const nowTime = new Date()
          if (this.componentType === 'requestAPI') {
            this.apiData.id = this.applyDetail.id
            newPromise = HTTP.applyApiAgain(this.apiData)
          } else {
            newPromise = HTTP.proposeApi(this.apiData)
          }
          newPromise
            .then(() => {
              this.$emit('applySuccess')
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          return false
        }
      })
    },
    cancelItem() {
      this.$emit('cancelItem')
    },
  },
}
</script>
<style lang="scss" scoped>
.apply-info {
  // position: relative;
  // height: 400px;

  /* .el-input{
            width:300px;
        } */
  .selcet-info {
    font-weight: bold;
  }

  .bottom-btn-info {
    float: right;
    margin-top: 120px;
  }
}
</style>
