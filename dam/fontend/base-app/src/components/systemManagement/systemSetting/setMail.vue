<template>
  <div style="position: relative">
    <datablau-list-search style="margin: 0 20px">
      <template slot="title">
        <div>{{ $t('system.systemSetting.serviceSetting') }}</div>
      </template>
    </datablau-list-search>
    <datablau-form
      label-width="70px"
      class="demo-ruleForm page-form"
      label-position="right"
      v-if="!showMessage"
    >
      <el-form-item
        :label="$t('system.systemSetting.server')"
        prop="host"
        class="st-page-form-span"
      >
        <span style="padding-left: 10px">{{ mailForm.host }}</span>
      </el-form-item>
      <el-form-item
        :label="$t('system.systemSetting.port')"
        prop="port"
        class="st-page-form-span"
      >
        <span style="padding-left: 10px">{{ mailForm.port }}</span>
      </el-form-item>
      <el-form-item
        :label="
          doNotNeedAuth
            ? $t('system.systemSetting.testRecipients')
            : $t('system.systemSetting.sender')
        "
        prop="sender"
        class="st-page-form-span"
      >
        <span style="padding-left: 10px">{{ mailForm.sender }}</span>
      </el-form-item>
      <el-form-item
        :label="$t('system.systemSetting.username')"
        prop="username"
        class="st-page-form-span"
      >
        <span style="padding-left: 10px">{{ mailForm.username }}</span>
      </el-form-item>
      <el-form-item class="post-button">
        <datablau-button type="important" size="mini" @click="editForm">
          {{ $t('common.button.edit') }}
        </datablau-button>
        <datablau-button type="strong" @click="updateForm">
          {{ $t('system.systemSetting.updateServer') }}
        </datablau-button>
      </el-form-item>
    </datablau-form>

    <datablau-form
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      label-width="70px"
      class="demo-ruleForm page-form"
      label-position="right"
      v-show="showMessage"
      :disabled="isDisabled"
    >
      <el-form-item
        :label="$t('system.systemSetting.server1')"
        prop="host"
        class="st-page-form-span"
      >
        <datablau-input
          v-model="ruleForm.host"
          :placeholder="$t('system.systemSetting.serverPlaceholder')"
          clearable
        ></datablau-input>
      </el-form-item>
      <el-form-item label="" class="st-page-form-span">
        <!-- <el-checkbox v-model="doNotNeedAuth">匿名发送</el-checkbox>
        <el-checkbox v-model="ruleForm.useSsl" @change="changePort">
          ssl加密
        </el-checkbox> -->
        <datablau-checkbox2
          v-model="doNotNeedAuth"
          :options="doNotNeedArr"
          style="display: inline-block"
        ></datablau-checkbox2>
        <datablau-checkbox2
          v-model="ruleForm.useSsl"
          :options="useSslArr"
          @change="changePort"
          style="display: inline-block"
        ></datablau-checkbox2>
      </el-form-item>
      <el-form-item
        :label="$t('system.systemSetting.port1')"
        prop="port"
        class="st-page-form-span"
      >
        <datablau-input
          v-model="ruleForm.port"
          @change="changeSsl"
          clearable
        ></datablau-input>
      </el-form-item>
      <el-form-item
        :label="
          doNotNeedAuth
            ? $t('system.systemSetting.testRecipients1')
            : $t('system.systemSetting.sender1')
        "
        prop="sender"
        class="st-page-form-span"
      >
        <datablau-input
          v-model="ruleForm.sender"
          :placeholder="$t('system.systemSetting.fillFullMail')"
          clearable
        ></datablau-input>
      </el-form-item>
      <el-form-item
        :label="$t('system.systemSetting.username1')"
        prop="username"
        class="st-page-form-span"
      >
        <datablau-input v-model="ruleForm.username" clearable></datablau-input>
      </el-form-item>
      <el-form-item
        :label="$t('system.systemSetting.password')"
        v-if="!doNotNeedAuth"
        :prop="doNotNeedAuth ? 'nPassword' : 'password'"
        class="st-page-form-span"
      >
        <datablau-input
          type="password"
          v-model="ruleForm.password"
          :placeholder="$t('system.systemSetting.fillPassword')"
          clearable
        ></datablau-input>
      </el-form-item>
      <!--<el-form-item label="需要验证" prop="auth" placeholder="是否需要验证，请咨询您的邮件服务提供商">
		    <el-switch v-model="ruleForm.needAuth"></el-switch>
		  </el-form-item>-->
      <el-form-item class="post-button">
        <!-- <datablau-button
          type="important"
          size="mini"
          @click="editForm"
        >
          编辑
        </datablau-button> -->
        <datablau-button
          type="important"
          :disabled="wating"
          style="width: 92px"
          @click="submitForm('ruleForm')"
        >
          <span v-if="wating">
            {{ $t('system.systemSetting.updating') }}
            <i class="el-icon-loading"></i>
          </span>
          <span v-else>{{ $t('system.systemSetting.updateServer') }}</span>
        </datablau-button>
        <datablau-button
          type="strong"
          @click="resetForm('ruleForm')"
          class="reset"
          :disabled="wating"
        >
          {{ $t('system.systemSetting.resetForm') }}
        </datablau-button>
        <div class="button-line"></div>
        <datablau-button
          type="important"
          @click="saveForm"
          :disabled="saveButton"
        >
          {{ $t('common.button.save') }}
        </datablau-button>
        <datablau-button
          type="secondary"
          @click="removeForm"
          :disabled="wating"
        >
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </el-form-item>
    </datablau-form>

    <datablau-list-search style="margin: 0 20px">
      <template slot="title">
        <div>{{ $t('system.systemSetting.sendSet') }}</div>
      </template>
    </datablau-list-search>
    <div class="mail-card">
      <el-card v-for="item in emailList" :key="item.sceneId" class="box-card">
        <datablau-form
          label-width="70px"
          class="mail-content"
          label-position="right"
        >
          <el-form-item>
            <span style="margin-left: -70px">
              {{
                $t('system.systemSetting.notificationEmail', {
                  name: item.sceneName,
                })
              }}
            </span>
          </el-form-item>
          <el-form-item :label="$t('system.systemSetting.triggerCondition')">
            <span>{{ item.sceneTrigger }}</span>
          </el-form-item>
          <el-form-item :label="$t('system.systemSetting.sendTo')">
            <span>{{ item.sendObject }}</span>
          </el-form-item>
          <el-form-item
            :label="$t('system.systemSetting.state')"
            style="position: absolute; top: 5px; right: 10px"
          >
            <datablau-switch
              v-model="item.enable"
              @change="changeState(item.sceneId, item.enable)"
              :disabled="item.sceneName === '重置密码'"
            ></datablau-switch>
          </el-form-item>
          <el-form-item style="position: absolute; bottom: 5px; right: 10px">
            <el-button type="text" @click="openEmailTemplate(item.sceneId)">
              {{ $t('system.systemSetting.emailTemp') }}
            </el-button>
          </el-form-item>
        </datablau-form>
      </el-card>
    </div>
  </div>
</template>

<script>
import HTTP from '@/http/main'
export default {
  data() {
    return {
      emailList: [], // 邮件模板列表
      wating: false,
      ruleForm: {
        host: '',
        port: '25',
        username: '',
        password: '',
        sender: '',
        useSsl: false,
        needAuth: true,
      },
      doNotNeedAuth: false,
      rules: {
        host: [
          {
            required: true,
            message: this.$t('system.systemSetting.serverRequired'),
            trigger: 'blur',
          },
        ],
        port: [
          {
            required: true,
            message: this.$t('system.systemSetting.portRequired'),
            trigger: 'blur',
          },
        ],
        username: [
          {
            required: true,
            message: this.$t('system.systemSetting.usernameRequired'),
            trigger: 'blur',
          },
        ],
        password: [
          {
            required: true,
            message: this.$t('system.systemSetting.passwordRequired'),
            trigger: 'blur',
          },
        ],
        sender: [
          {
            required: true,
            message: this.$t('system.systemSetting.senderOrReceiveRequired'),
            trigger: 'blur',
          },
        ],
      },
      doNotNeedArr: JSON.stringify([
        {
          value: '01',
          label: this.$t('system.systemSetting.anonymousSend'),
        },
      ]),
      useSslArr: JSON.stringify([
        {
          value: '02',
          label: this.$t('system.systemSetting.sslEncryption'),
        },
      ]),
      isDisabled: false, // 设置邮件默认进来只展示，不能修改
      showMessage: false, // 设置页面编辑进来的展示
      saveButton: true, // 设置保存按钮是否可用
      mailForm: {
        host: '',
        port: '25',
        username: '',
        sender: '',
      },
      resForm: {}, // 用来存储获取到的值
    }
  },
  mounted() {
    this.showMailSender()
    //			this.ruleForm = JSON.parse(localStorage.sender);
    this.getemailList()
  },
  methods: {
    // 获取邮件列表
    getemailList() {
      HTTP.getemailList()
        .then(res => {
          const emailList = []
          res.data.data.forEach(element => {
            const sceneName = element.sceneName
            switch (sceneName) {
              case 'API过期、下线':
                if (this.$featureMap.FE_SERVICE) {
                  emailList.push(element)
                }
                break
              case '元数据更新任务':
              case '数据源与模型差异比较与同步任务':
              case '重置密码':
              case '邮件通知审批人':
                if (this.$featureMap.FE_META) {
                  emailList.push(element)
                }
                break
              case '更新数据标准':
              case '更新标准代码':
                if (this.$featureMap.FE_DOMAIN) {
                  emailList.push(element)
                }
                break
              case '质量检核任务':
              case '标准检核任务':
                if (this.$featureMap.FE_QUALITY) {
                  emailList.push(element)
                }
                break
              default:
                emailList.push(element)
                break
            }
          })
          this.emailList = emailList
          // console.log('邮件列表', res.data.data)
          this.emailList.map(item => {
            if (item.enable === 1) {
              item.enable = true
            } else {
              item.enable = false
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 启用状态变化
    changeState(sceneId, enable) {
      if (enable) {
        enable = 1
      } else {
        enable = 0
      }
      HTTP.setSceneenable(sceneId, enable)
        .then(res => {
          this.$blauShowSuccess(res.data.message)
          this.getemailList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 打开邮件模板
    openEmailTemplate(sceneId) {
      this.$bus.$emit('openEmailTemplate', sceneId)
    },
    setMailSender() {
      this.isDisabled = true
      this.wating = true
      this.saveButton = true
      this.ruleForm.needAuth = !this.doNotNeedAuth
      this.$http
        .post('/user/mail/createMailConfiguration', this.ruleForm)
        .then(res => {
          this.$message({
            message: this.$t('system.systemSetting.operateSucceed'),
            type: 'success',
          })
          this.wating = false
          this.saveButton = false
        })
        .catch(e => {
          this.wating = false
          this.saveButton = true
          this.$showFailure(e)
        })
        .then(() => {
          this.isDisabled = false
        })
    },
    showMailSender() {
      this.$http.post('/user/mail/getMailServer').then(res => {
        if (res.data) {
          this.ruleForm = res.data
          this.doNotNeedAuth = !this.ruleForm.needAuth
          this.mailForm = _.clone(res.data) // 获取到展示到页面上的值
          this.resForm = _.clone(res.data) // 将获取到的值存储起来
        } else {
        }
      })
    },
    // 编辑按钮
    editForm() {
      this.showMessage = true
    },
    // 默认页面的更新服务器按钮
    updateForm() {
      this.ruleForm = _.clone(this.resForm)
      this.showMessage = true
      this.isDisabled = true
      this.$nextTick(() => {
        this.submitForm('ruleForm')
      })
    },
    // 取消按钮
    removeForm() {
      this.showMessage = false
      this.mailForm = _.clone(this.resForm)
    },
    // 保存按钮
    saveForm() {
      this.showMessage = false
      this.showMailSender()
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.setMailSender()
        } else {
          console.log('error submit!!')
          this.isDisabled = false
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    changePort(isSsl) {
      if (isSsl) {
        this.ruleForm.port = 465
      } else {
        this.ruleForm.port = 25
      }
    },
    changeSsl(port) {
      if (port === 25) {
        this.ruleForm.useSsl = false
      } else if (port === 465) {
        this.ruleForm.useSsl = true
      }
    },
  },
  watch: {
    'ruleForm.sender': {
      handler() {
        // if (!this.ruleForm.username) {
        this.ruleForm.username = this.ruleForm.sender
        // }
      },
      immediate: true,
    },
    '$mainVue.$i18n.locale': {
      // doNotNeedArr useSslArr两个变量无法国际化，手动监听
      handler(val) {
        console.log('val', val)
        if (val === 'zh') {
          this.doNotNeedArr = JSON.stringify([
            {
              value: '01',
              label: '匿名发送',
            },
          ])
          this.useSslArr = JSON.stringify([
            {
              value: '02',
              label: 'ssl加密',
            },
          ])
        } else {
          this.doNotNeedArr = JSON.stringify([
            {
              value: '01',
              label: 'anonymousSend',
            },
          ])

          this.useSslArr = JSON.stringify([
            {
              value: '02',
              label: 'sslEncryption',
            },
          ])
        }
      },
      immediate: true,
    },
  },
}
</script>
<style lang="scss" scoped>
.green-btn {
  padding: 0 12px;
}
.reset {
  height: 34px;
  width: 80px;
}
.page-form {
  /deep/ .el-form {
    display: flex;
    flex-wrap: wrap;
    max-width: 1200px;
    .st-page-form-span {
      width: calc(50% - 10px);
      margin: 0;
      &:nth-child(odd) {
        margin-right: 20px;
      }
      &.is-required {
        padding-bottom: 20px;
      }
      .el-form-item__label {
        width: 70px !important;
        padding-right: 10px !important;
      }
      .el-form-item__content {
        width: 300px !important;
      }
    }
    .post-button {
      position: absolute;
      top: 20px;
      right: 20px;
    }
  }
  /deep/ .el-form-item__label {
    line-height: 34px;
    height: 34px;
  }
}
.button-line {
  display: inline-block;
  width: 2px;
  height: 14px;
  background: #ddd;
  margin-left: 10px;
  margin-right: 10px;
}
.mail-card {
  max-width: calc(98% - 10px);
  margin-left: 20px;
  overflow-y: scroll;
  height: calc(100vh - 350px);
  .box-card {
    background-color: #d7d7d7;
    margin-bottom: 10px;
    /deep/ .el-card__body {
      position: relative;
      padding: 10px 0 0 20px;
    }
  }
  .mail-content {
    /deep/ .el-form {
      .el-form-item {
        margin-bottom: 0px;
      }
    }
  }
}
</style>
