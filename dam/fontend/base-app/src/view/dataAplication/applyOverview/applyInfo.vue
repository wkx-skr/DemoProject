<template>
  <div class="apply-info">
    <!-- <staff-select v-if="$store.state.showStaffSelect"></staff-select> -->
    <el-form
      class="st-page-form"
      ref="ruleForm"
      :inline="inlineInfo"
      label-position="right"
      label-width="60px"
      :model="applyData"
      :rules="rules"
    >
      <el-form-item label="应用名称">
        <span style="width: 600px">{{ applyData.appName }}</span>
      </el-form-item>
      <br />

      <el-form-item
        class="check-info"
        label="用户名"
        v-if="isAddUser"
        prop="appUser"
      >
        <datablau-input
          ref="appUserInput"
          v-model="applyData.appUser"
          placeholder="点击选择用户"
          @focus="openStaff"
        ></datablau-input>
        <!-- <el-select style="width:600px" filterable clearable v-model="applyData.appUser">
          <el-option v-for="item in ownerOption" :key="item" :value="item" :label="item">
          </el-option>
        </el-select> -->
        <!-- <datablau-input v-model="applyData.authUser" style="width:600px"></datablau-input> -->
      </el-form-item>

      <!--      <el-form-item label="有效期" prop="dataType">-->
      <!--        <el-radio-group v-model="applyData.dataContent">-->
      <!--          <el-radio label='' name="dataContent">长期</el-radio>-->
      <!--          <el-radio label=30 name="dataContent">30天</el-radio>-->
      <!--          <el-radio label=60 name="dataContent">60天</el-radio>-->
      <!--          <el-radio label=90 name="dataContent">90天</el-radio>-->
      <!--          <el-radio label="自定义" name="dataContent">-->
      <!--          </el-radio>-->
      <!--        </el-radio-group>-->
      <!--      </el-form-item>-->
      <!--      <el-date-picker :disabled="applyData.dataContent!=='自定义'" style="margin-top:7px;" v-model="dateInfo"-->
      <!--        format="yyyy-MM-dd " placeholder="选择日期时间" size="mini">-->
      <!--      </el-date-picker><br/>-->
      <el-form-item label="申请原因" prop="aduidReason">
        <datablau-input
          type="textarea"
          :row="2"
          resize="none"
          style="width: 600px"
          v-model="applyData.aduidReason"
        ></datablau-input>
      </el-form-item>
    </el-form>
    <div class="dialog-bottom">
      <datablau-button type="secondary" size="mini" @click="cancelItem">
        {{ $t('common.button.cancel') }}
      </datablau-button>
      <datablau-button type="important" size="mini" @click="confirmItem">
        提交
      </datablau-button>
    </div>
  </div>
</template>
<script>
import HTTP from '../ddsHTTP.js'
export default {
  mounted() {
    this.applyData.appName = this.applyDetail.applicationName
    this.applyData.appId = this.applyDetail.id
    this.applyData.appAbbr = this.applyDetail.applicationAbbr
    // this.applyData.appUser = this.applyDetail.creater
    this.getOwnerOption()
  },
  props: {
    applyDetail: {
      type: Object,
      default: () => {
        return {}
      },
    },
    modeType: {
      type: String,
      default: 'apply',
    },
  },
  data() {
    return {
      applyData: {
        appAbbr: '',
        authUser: '',
        appName: '',
        appId: null,
        dataType: null,
        dataContent: '',
        aduidReason: '',
        appUser: '',
      },
      dateInfo: '',
      ownerOption: [],
      inlineInfo: true,
      rules: {
        dataType: { required: true, message: '请输入有效期', trigger: 'blur' },
        appUser: { required: true, message: '请选择用户', trigger: 'change' },
        aduidReason: { max: 50, message: '字符长度50以下', trigger: 'blur' },
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
  computed: {
    isAddUser() {
      return this.modeType === 'addUser'
    },
    isApplyAgain() {
      return this.modeType === 'applyAgain'
    },
    isApply() {
      return this.modeType === 'apply'
    },
  },
  methods: {
    openStaff() {
      this.$refs.appUserInput.blur()
      this.$utils.staffSelect
        .open([], true)
        .then(data => {
          if (data && Array.isArray(data) && data.length === 1) {
            this.applyData.appUser = data[0].fullUserName
            this.applyData.authUser = data[0].username
            this.$refs.ruleForm.clearValidate()
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    getOwnerOption() {
      HTTP.getAppUsers()
        .then(res => {
          this.ownerOption = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    confirmItem() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          let newPromise
          if (this.isAddUser) {
            // this.applyData.authUser = this.applyData.appUser
            newPromise = HTTP.addAppUser(this.applyData.appId, this.applyData)
          } else {
            console.log(13)
            delete this.applyData.authUser
            this.applyData.appUser = this.applyDetail.creater
            if (this.isApplyAgain) {
              const obj = {
                authId: this.applyDetail.id,
                aduidReason: this.applyData.aduidReason,
              }
              newPromise = HTTP.proposeAppAgain(obj)
            } else if (this.isApply) {
              newPromise = HTTP.proposeApply(this.applyData)
            }
          }
          newPromise
            .then(() => {
              this.$emit('applySuccess')
              if (this.isAddUser) {
                this.$showSuccess('授权成功')
              } else {
                this.$showSuccess('成功提交审核')
              }
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
      this.$emit('cancelApply')
    },
  },
  watch: {
    '$store.state.staffData': {
      deep: true,
      handler(newval) {
        console.log(newval)
        this.applyData.appUser = newval[0].fullUserName
      },
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
  .st-page-form {
    .el-form-item {
      margin-top: 14px;
      margin-bottom: 0;
    }
  }
  .check-info {
    margin-bottom: 22px;
  }
  .bottom-info {
    float: right;
    margin-top: 180px;
  }
}
</style>
