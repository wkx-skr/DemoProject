<template>
    <div class="testPublish-content">
      <datablau-dialog
        :title="editModel ? '编辑DS环境' : '创建DS环境'"
        :visible.sync="newProject"
        :modal-append-to-body="true"
        size="s"
      >
        <datablau-form
          :rules="rules"
          :model="request"
          ref="form"
          size="small"
          label-width="75px"
        >
        <el-form-item
            label="环境"
            prop="env"
          >
          <datablau-select
              v-model="request.env"
              filterable
              style="width: 100%"
              :disabled="editModel"
          >
              <el-option
              v-for="item in envOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              ></el-option>
          </datablau-select>
          </el-form-item>
          <el-form-item
            label="IP"
            prop="ip"
          >
            <datablau-input
              v-model="request.ip"
              style="width: 100%"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            label="用户名"
            prop="user"
          >
            <datablau-input
              style="width: 100%"
              v-model="request.user"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            label="token"
            prop="token"
          >
            <datablau-input
              style="width: 100%"
              v-model="request.token"
            ></datablau-input>
          </el-form-item>
        </datablau-form>
        <span slot="footer">
            <datablau-button @click="closeLog" type="secondary">取 消</datablau-button>
            <datablau-button type="primary" @click="testEnv" :disabled="request.env===''||request.ip===''||request.user===''||request.token === ''">
              测 试
            </datablau-button>
            <datablau-button type="primary" @click="submitEnv" :disabled="testPass">
              保 存
            </datablau-button>
        </span>

      </datablau-dialog>
      <datablau-select
          v-model="keywordEnv"
          filterable
          clearable
          @change="keywordEnvChange"
          style="display: inline-block;"
          placeholder="请选择环境"
      >
          <el-option
          v-for="item in envOption"
          :key="item.value"
          :label="item.label"
          :value="item.value"
          ></el-option>
      </datablau-select>
      <datablau-button class="add iconfont icon-tianjia" @click="create" type="important">创建环境</datablau-button>
      <div style="position: absolute;top: 32px;left: 0;right: 0;bottom: 0;">
          <datablau-table :data="projects" height="100%">
            <el-table-column
              label="环境"
              prop="env"
              show-overflow-tooltip
            >
            <template slot-scope="scope">
              {{ scope.row.env.toLocaleUpperCase() }}
            </template>
            </el-table-column>
            <el-table-column
              label="用户"
              prop="user"
              show-overflow-tooltip
            >

            </el-table-column>
             <!-- <el-table-column
              label="开发环境"
              prop="env"
            >
            </el-table-column> -->
            <el-table-column
              label="token"
              prop="token"
              width="180px"
              show-overflow-tooltip
            >

            </el-table-column>
            <el-table-column
              label="路径"
              prop="ip"
              show-overflow-tooltip
            >

            </el-table-column>
            <el-table-column
              label="启用状态"
            >
            <template slot-scope="scope">
              <datablau-switch
              v-model="scope.row.enable"
              @change="changeValueEnable(scope.row.enable,scope.row)"
            ></datablau-switch>
            </template>

            </el-table-column>
            <el-table-column
              label="操作"
              width="120px">
              <template slot-scope="scope">
                <datablau-tooltip
                    effect="dark"
                    content="编辑"
                    placement="bottom"
                  >
                  <datablau-button type="icon" @click.stop="editEnv(scope.row)" class="iconfont icon-bianji"></datablau-button>
                </datablau-tooltip>
                <datablau-tooltip
                    effect="dark"
                    content="删除"
                    placement="bottom"
                  >
                  <datablau-button type="icon" @click.stop="deleteEnv(scope.row)" class="iconfont icon-delete"></datablau-button>
                </datablau-tooltip>
              </template>
            </el-table-column>
          </datablau-table>
      </div>
    </div>
  </template>

<script>
export default {
  data () {
    let validateIP = (rule, value, callback) => {
      let reg = /^(http|https):\/\/((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}:(6553[0-5]|655[0-2]\d|65[0-4]\d{2}|6[0-4]\d{3}|[1-5]\d{4}|[1-9]\d{0,3})$/
      if (value === '') {
        callback(new Error('请输入IP地址'))
      } else {
        if (reg.test(value)) {
          this.$refs.form.validateField('checkPass')
        } else {
          callback(new Error('请输入正确的IP地址,例如：http://192.168.7.158:12345'))
        }
        callback()
      }
    }
    return {
      newProject: false,
      projects: [],
      request: {
        env: '',
        ip: '',
        user: '',
        token: ''
      },
      rules: {
        user: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        env: [
          { required: true, message: '请选择环境', trigger: 'blur' }
        ],
        token: [
          { required: true, message: '请输入token', trigger: 'blur' }
        ],
        ip: [
          { required: true, validator: validateIP, trigger: 'blur' }
        ]
      },
      envList: ['test', 'uat', 'prod'],
      editModel: false,
      envOption: [{
        value: 'test',
        label: 'SIT'
      },
      // {
      //   value: 'dev',
      //   label: 'dev'
      // },
      {
        value: 'uat',
        label: 'UAT'
      },
      {
        value: 'prod',
        label: 'PROD'
      }],
      projectsArr: [],
      keywordEnv: '',
      testPass: true
    }
  },
  mounted () {
    this.getProjects()
  },
  methods: {
    keywordEnvChange () {
      this.projects = this.projectsArr.filter(v => v.env.indexOf(this.keywordEnv) > -1)
    },
    editEnv (row) {
      this.testPass = true
      this.request = _.cloneDeep(row)
      this.newProject = true
      this.editModel = true
    },
    deleteEnv (row) {
      this.$DatablauCofirm(`确定要删除 ${row.env.toLocaleUpperCase()} 环境？`).then(res => {
        this.$http.delete(`${this.$dddUrl}/service/local/ds-env?env=${row.env}`)
          .then(res => {
            this.getProjects()
          })
      })
    },
    getProjects () {
      this.$http.get(`${this.$dddUrl}/service/local/ds-envs`).then(res => {
        this.projects = res.data
        this.projectsArr = res.data
      })
    },
    create () {
      this.testPass = true
      this.editModel = false
      this.$refs.form && this.$refs.form.resetFields()
      this.request = {}
      this.request = {
        env: '',
        ip: '',
        user: '',
        token: ''
      }
      if (this.projects.length >= 3) {
        this.$DatablauCofirm('已创建所有环境，请删除环境后再创建', 'error')
        return
      }
      this.newProject = true
    },
    closeLog () {
      this.newProject = false
      this.$refs.form.resetFields()
    },
    testEnv () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.request.ip === window.location.origin) {
            this.$showFailure('创建失败')
          } else {
            let obj = {
              ip: this.request.ip,
              token: this.request.token
            }
            this.$http.post(`${this.$dddUrl}/service/local/connect`, obj).then(res => {
              this.$blauShowSuccess('测试通过')
              this.testPass = false
            }).catch(e => {
              this.$showFailure(e)
            })
          }
        } else {
          return false
        }
      })
    },
    changeValueEnable (value, row) {
      let obj = row
      obj.enable = value

      let request = this.$http.put(`${this.$dddUrl}/service/local/ds-env`, obj)
      request
        .then(res => {
          if (value === false) {
            this.$blauShowSuccess('已关闭')
          } else {
            this.$blauShowSuccess('已启用')
          }

          this.getProjects()
        }).catch(err => {
          this.$showFailure(err)
        })
    },
    submitEnv () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (!this.editModel) {
            this.request.enable = true
          }
          let request = this.editModel ? this.$http.put(`${this.$dddUrl}/service/local/ds-env`, this.request) : this.$http.post(`${this.$dddUrl}/service/local/ds-env`, this.request)
          request
            .then(res => {
              this.$blauShowSuccess('环境创建成功')
              this.closeLog()
              this.getProjects()
            }).catch(err => {
              this.$showFailure(err)
            })
        } else {
          return false
        }
      })
    }
  },
  watch: {
    request: {
      handler (newRoute, oldRoute) {
        this.testPass = true
      },
      deep: true
    }
  }
}
</script>

  <style scoped lang="scss">
  /deep/ .add.iconfont[class*='icon-']::before {
      margin-right: 6px;
    }
    .add {
      float: right;
      z-index: 9;
    }

.testPublish-content{
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
}
  </style>
