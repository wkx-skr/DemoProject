<template>
  <div class="userinfo-card">
    <div class="personalData-title">
      <div class="personalData-title-head">
        <p v-if="details.fullUserName">
          {{ details.fullUserName.substr(0, 1) }}
        </p>
      </div>
      <div class="personalData-message">
        <p class="personalData-fullUserName">{{ details.fullUserName }}</p>
      </div>
    </div>
    <ul class="personalData-user">
      <li>
        <p class="li-lable">{{ $t('system.user.fullName') }}</p>
        <p class="li-cont">
          <span v-if="first == 'list'" style="color: #20293b">
            {{ details.fullUserName }}
          </span>
          <span v-else>
            <el-input
              v-model="details.fullUserName"
              @blur="modifyDetails"
            ></el-input>
          </span>
        </p>
        <el-divider></el-divider>
      </li>
      <li>
        <p class="li-lable">{{ $t('system.user.email') }}</p>
        <p class="li-cont">
          <span v-if="email == 'list'" style="color: #20293b">
            {{ details.emailAddress }}
          </span>
          <span v-else>
            <el-input
              v-model="details.emailAddress"
              @blur="modifyDetails"
            ></el-input>
          </span>
        </p>
        <el-divider></el-divider>
      </li>
      <li>
        <p class="li-lable">{{ $t('system.user.phone') }}</p>
        <p class="li-cont">
          <span v-if="phone == 'list'" style="color: #20293b">
            {{ details.phoneNumber }}
            <!-- 13246670043 -->
          </span>
          <span v-else>
            <el-input
              v-model="details.phoneNumber"
              @blur="modifyDetails"
            ></el-input>
          </span>
        </p>
        <el-divider></el-divider>
      </li>
      <li>
        <p class="li-lable">{{ $t('system.user.password') }}</p>
        <p class="li-cont">
          <span style="color: #20293b">******</span>
          <datablau-button
            type="icon"
            @click="initReset"
            style="float: right; margin-right: 10px"
          >
            <i class="iconfont icon-bianji"></i>
          </datablau-button>
        </p>
        <el-divider></el-divider>
      </li>
    </ul>
    <datablau-dialog
      :title="$t('system.user.placeholder.resetPassword')"
      :visible.sync="passwordDialog.dialogFormVisible"
      size="s"
      append-to-body
      custom-class="userinfo-dialog"
      :close-on-click-modal="false"
      v-if="passwordDialog.dialogFormVisible"
    >
      <el-form
        ref="resetPassword"
        size="mini"
        label-position="right"
        :model="passwordDialog.resetPasswordForm"
        :rules="passwordDialog.inputRules"
        :label-width="$i18n.locale === 'en' ? '140px' : '120px'"
      >
        <el-form-item :label="$t('system.user.oldPass')" prop="oldPassword">
          <datablau-input
            v-model="passwordDialog.resetPasswordForm.oldPassword"
            auto-complete="off"
            type="password"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="$t('system.user.newPass')"
          class="newPassword"
          prop="password"
        >
          <datablau-input
            v-model="passwordDialog.resetPasswordForm.password"
            auto-complete="off"
            type="password"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="" v-if="$strongPassword">
          <check-password-box
            :password="passwordDialog.resetPasswordForm.password"
          ></check-password-box>
        </el-form-item>

        <el-form-item
          :label="$t('system.user.placeholder.confirmPassword')"
          prop="confirmPassword"
        >
          <datablau-input
            v-model="passwordDialog.resetPasswordForm.confirmPassword"
            auto-complete="off"
            type="password"
          ></datablau-input>
        </el-form-item>
        <el-form-item></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <datablau-button
          size="mini"
          type="secondary"
          @click="passwordDialog.dialogFormVisible = false"
        >
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          size="mini"
          type="primary"
          @click="confirmResetPassword"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
import checkPasswordBox from '@/components/common/checkPasswordBox.vue'
import HTTP from '@/http/main.js'

export default {
  name: 'UserInformation',
  components: { checkPasswordBox },
  data() {
    const validatePassword = (rule, value, callback) => {
      const pPattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,.\/]).{8,}$/
      if (pPattern.test(value)) {
        callback()
      } else {
        callback(new Error())
      }
    }
    const validateDialogConfirmPassword = (rule, value, callback) => {
      if (value === this.passwordDialog.resetPasswordForm.password) {
        callback()
      } else {
        callback(new Error())
      }
    }
    const validateOldPassword = (rule, value, callback) => {
      if (value === this.passwordDialog.resetPasswordForm.oldPassword) {
        callback(new Error(this.$t('system.user.validator.samePassword')))
      } else {
        callback()
      }
    }
    return {
      passwordDialog: {
        dialogFormVisible: false,
        resetPasswordForm: {
          oldPassword: '',
          password: '',
          confirmPassword: '',
        },
        inputRules: {
          oldPassword: [
            {
              required: true,
              message:
                this.$t('system.user.oldPass') +
                this.$t('system.user.validator.notEmpty'),
            },
          ],
          password: !this.$strongPassword
            ? [
                {
                  required: true,
                  message:
                    this.$t('system.user.newPass') +
                    this.$t('system.user.validator.notEmpty'),
                  trigger: 'blur',
                },
                {
                  required: true,
                  validator: validateOldPassword,
                  trigger: 'blur',
                },
              ]
            : [
                {
                  required: true,
                  message: this.$t('system.user.validator.strongRule'),
                  trigger: 'blur',
                  validator: validatePassword,
                },
                {
                  required: true,
                  validator: validateOldPassword,
                  trigger: 'blur',
                },
                {
                  min: 8,
                  message: this.$t('system.user.validator.minRule'),
                  trigger: 'blur',
                },
                {
                  max: 128,
                  message: this.$t('system.user.validator.maxRule'),
                  trigger: 'blur',
                },
                {
                  max: 128,
                  message: this.$t('system.user.validator.maxRule'),
                  trigger: 'change',
                },
              ],
          confirmPassword: [
            {
              required: true,
              message: this.$t('system.user.placeholder.retypePass'),
              trigger: 'blur',
            },
            {
              validator: validateDialogConfirmPassword,
              message: this.$t('system.user.validator.inconsistentPassword'),
              trigger: 'change',
            },
          ],
        },
      },
      first: 'list',
      phone: 'list',
      email: 'list',
      details: {
        // name:''
      },
    }
  },
  props: {
    useDam: {
      type: Boolean,
      default: true,
    },
  },
  mounted() {
    this.getDetails()
  },
  methods: {
    confirmResetPassword() {
      var self = this
      this.$refs.resetPassword.validate((valid, obj) => {
        console.log(valid, obj, 'valid, obj')
        if (!valid) {
          if (obj.hasOwnProperty('password')) {
            self.$message.error(obj.password[0]?.message || this.$t("system.user.info.passwordError"))
            // alert('密码错误')
            $('.reset-password-box').attr('tabindex', '100')
            $('.reset-password-box').focus()
            //  setTimeout(() => {
            //    $('.reset-password-box').removeAttr('tabindex')

            //  }, 2000);
          } else {
            let msg = ''
            for (let key in obj) {
              msg = obj[key][0]?.message
              if (msg) break
            }
            let key = Object.keys(obj)[0]
            self.$message.error(msg ||  this.$t("system.user.info.passwordError"))
          }
          return false
        } else {
          const response = {
            newPassword: this.$pwEncrypt(
              this.passwordDialog.resetPasswordForm.password
            ),
            oldPassword: this.$pwEncrypt(
              this.passwordDialog.resetPasswordForm.oldPassword
            ),
          }
          // var password = this.$pwEncrypt(this.passwordDialog.resetPasswordForm.password)
          // self.$http
          //   .post(this.$url + '/service/main/password', response)
          HTTP.updateUserPassword(response)
            .then(res => {
              self.$message.success(this.$t('system.user.info.passwordChanged'))
              self.passwordDialog.dialogFormVisible = false
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      })
    },
    initReset() {
      this.passwordDialog.dialogFormVisible = true
      this.passwordDialog.resetPasswordForm = {
        password: '',
        confirmPassword: '',
      }
    },
    getDetails() {
      this.$http.get(`/user/usermanagement/users/details/self`).then(res => {
        this.details = res.data
        // console.log(this.details);
      })
    },
    modifyDetails() {
      this.$http
        .put(`/user/usermanagement/users/details/self`, this.details)
        .then(res => {
          this.$message.success(this.$t('system.user.info.infoChangeed'))
          this.first = 'list'
          this.email = 'list'
          this.phone = 'list'
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 刷新页面
    refresh() {
      this.$router.go(0)
    },
    edit(name) {
      if (name === 'name') {
        this.first = 'form'
      } else if (name === 'email') {
        this.email = 'form'
      } else {
        this.phone = 'form'
      }
    },
  },
}
</script>
<style lang="scss">
.userinfo-dialog {
  .el-input {
    width: 320px;
  }

  //.newPassword {
  //  .el-form-item__error {
  //    display: none;
  //  }
  //  .el-input__inner {
  //    border: 1px solid #dcdfe6;
  //  }
  //}
}
</style>

<style scoped>
span {
  color: var(--table-color);
  font-size: 12px;
}
</style>
<style lang="scss" scoped>
.userinfo-card {
  background: white;
  width: 720px;
  margin: 0 auto;
  margin-top: 20px;
  .personalData-title {
    height: 100px;
    // box-shadow: 0px 0px 20px rgba(46, 105, 240, 0.1);
    border-radius: 10px;
    display: flex;
    align-items: center;
    margin-bottom: 38px;
    .personalData-title-head {
      width: 80px;
      height: 80px;
      background: #fff;
      border-radius: 50%;
      overflow: hidden;
      margin-left: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--color-primary);
      p {
        color: #fff;
        font-size: 16px;
      }
    }
    .personalData-message {
      padding-left: 20px;
      .personalData-fullUserName {
        padding-bottom: 14px;
        font-size: 18px;
      }
      .personalData-tag {
        .el-tag {
          height: 22px;
          line-height: 22px;
          font-size: 12px;
          padding: 0 14px;
          color: #4386f5;
          background: #edf4ff;
          margin-right: 10px;
        }
      }
    }
  }
  .personalData-user {
    li {
      padding-left: 17px;
      // height: 34px;
      // line-height: 34px;
      margin-bottom: 14px;
      p {
        // display: inline-block;
        font-size: 13px;
      }
      .li-lable {
        font-size: 14px;
        height: 20px;
        line-height: 20px;
        color: #555555;
        font-weight: 500;
        padding-right: 20px;
      }
      .el-divider--horizontal {
        margin: 0;
      }
      .li-cont {
        height: 40px;
        line-height: 40px;
        color: #20293b;
        span {
          font-size: 13px;
        }
      }
    }
  }
  .dialog-footer {
    text-align: right;
  }
}
</style>
