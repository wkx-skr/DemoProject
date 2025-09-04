<template>
    <div class="devPublish-content">
      <datablau-dialog
        :title="editModel ? '编辑映射' : '创建映射'"
        :visible.sync="newProject"
        :modal-append-to-body="true"
        size="s"
      >
        <datablau-form
          :rules="rules"
          :model="request"
          ref="form"
          size="small"
          label-width="110px"
        >
        <el-form-item
            label="目标环境"
            prop="env"
          >
          <datablau-select
              v-model="request.env"
              filterable
              style="width: 100%"
              :disabled ="editModel"
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
            label="源数据源"
            prop="sourceId"
          >
          <datablau-select
              v-model.trim="request.sourceId"
              placeholder="请选择源数据源id"
              clearable
              @change="sourceIdChange"
             :disabled ="editModel"
              style="width :100%">
              <el-option
                v-for="(source) in sourceOption"
                :key="source.id"
                :label="source.name"
                :value="source.id"
              >
              </el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            label="数据库类型"
            prop="type"
          >
            <datablau-input
              style="width: 100%"
             :disabled="true"
              v-model="request.type"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            label="目标数据源"
            prop="targetId"
          >
          <datablau-select
              v-model.trim="request.targetId"
              placeholder="请选择目标数据源id"
              clearable
              @change="sourceIdTargetChange"
              style="width :100%">
              <el-option
                v-for="(source) in sourceOptionTarget"
                :key="source.id"
                :label="source.name"
                :value="source.id"
              >
              </el-option>
            </datablau-select>
          </el-form-item>
          <!-- <el-form-item
            label="生产数据源名称"
            prop="targetName"
          >
            <datablau-input
              v-model="request.targetName"
              placeholder="请输入生产数据源名称"
              style="width: 100%"
            ></datablau-input>
          </el-form-item> -->

        </datablau-form>
        <span slot="footer">
            <datablau-button @click="closeLog" type="secondary">取 消</datablau-button>
            <datablau-button type="primary" @click="submitEnv">
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
      <datablau-button class="add iconfont icon-tianjia" @click="create" type="important">创建映射</datablau-button>
      <div style="position: absolute;top: 32px;left: 0;right: 0;bottom: 0;">
          <datablau-table :data="projects" height="100%">
            <el-table-column
              label="环境"
              prop="env"
            >
            <template slot-scope="scope">
              {{ scope.row.env.toLocaleUpperCase() }}
            </template>
            </el-table-column>
            <el-table-column
              label="源数据源id"
              prop="sourceId"
              show-overflow-tooltip
            >
            </el-table-column>
            <el-table-column
              label="源数据源名称"
              prop="sourceName"
              show-overflow-tooltip
            >
            </el-table-column>
            <el-table-column
              label="生产数据源id"
              prop="targetId"
              show-overflow-tooltip
            >
            </el-table-column>
            <el-table-column
              label="生产数据源名称"
              prop="targetName"
              show-overflow-tooltip
            >
            </el-table-column>
            <el-table-column
              label="数据库类型"
              prop="type"
              show-overflow-tooltip
            >
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
    return {
      newProject: false,
      projects: [],
      request: {
        sourceId: '',
        sourceName: '',
        targetId: '',
        targetName: '',
        type: '',
        env: 'prod',
        typeOption: [{
          label: 'MYSQL',
          value: 'MYSQL'
        }, {
          label: 'POSTGRESQL',
          value: 'POSTGRESQL'
        }, {
          label: 'HIVE',
          value: 'HIVE'
        }, {
          label: 'SPARK',
          value: 'SPARK'
        }, {
          label: 'CLICKHOUSE',
          value: 'CLICKHOUSE'
        }, {
          label: 'ORACLE',
          value: 'ORACLE'
        }, {
          label: 'SQLSERVER',
          value: 'SQLSERVER'
        }, {
          label: 'DB2',
          value: 'DB2'
        }, {
          label: 'PRESTO',
          value: 'PRESTO'
        }, {
          label: 'REDSHIFT',
          value: 'REDSHIFT'
        }, {
          label: 'ATHENA',
          value: 'ATHENA'
        }, {
          label: 'GBASE',
          value: 'GBASE'
        }]
      },
      sourceOption: [],
      sourceOptionTarget: [],
      rules: {
        sourceId: [
          { required: true, message: '请选择源数据源id', trigger: 'change' }
        ],
        // sourceName: [
        //   { required: true, message: '请选择源数据源id', trigger: 'blur' }
        // ],
        env: [
          { required: true, message: '请选择环境', trigger: 'blur' }
        ],
        targetId: [
          { required: true, message: '请输入生产数据源id', trigger: 'blur' }
        ],
        targetName: [
          { required: true, message: '请输入生产数据源名称', trigger: 'blur' }
        ]
      },
      editModel: false,
      keywordEnv: '',
      projectsArr: [],
      envOption: [
      ]
    }
  },
  mounted () {
    this.getProjects()
    this.getEnvOption()
    this.datasourceDolphin()
  },
  methods: {
    keywordEnvChange () {
      this.projects = this.projectsArr.filter(v => v.env.indexOf(this.keywordEnv) > -1)
    },
    sourceIdChange (value) {
      this.sourceOption.forEach(element => {
        if (element.id === value) {
          this.$set(this.request, 'sourceName', element.name)
          this.$set(this.request, 'type', element.type)
          this.getSourceOptionTarget()
        }
      })
    },
    datasourceDolphin () {
      this.$http.get(`${this.$dddUrl}/service/datasource/dolphin`).then(res => {
        this.sourceOption = res.data
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    getSourceOptionTarget () {
      this.$http.get(`${this.$dddUrl}/service/datasource/dolphin?env=${this.request.env}&type=${this.request.type}`).then(res => {
        this.sourceOptionTarget = res.data
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    sourceIdTargetChange (val) {
      this.sourceOptionTarget.forEach(element => {
        if (element.id === val) {
          this.$set(this.request, 'targetName', element.name)
        }
      })
    },
    getEnvOption () {
      this.$http.get(`${this.$dddUrl}/service/local/ds-envs`).then(res => {
        let deWeightThree = () => {
          let map = new Map()
          for (let item of res.data) {
            if (!map.has(item.env)) {
              map.set(item.env, {
                value: item.env,
                label: item.env.toLocaleUpperCase()
              })
            }
          }
          return [...map.values()]
        }
        this.envOption = deWeightThree()
      })
    },
    editEnv (row) {
      this.$set(this.request, 'sourceId', row.sourceId)
      this.$set(this.request, 'targetId', row.targetId)
      this.$set(this.request, 'targetName', row.targetName)
      this.$set(this.request, 'type', row.type)
      this.$set(this.request, 'id', row.id)
      this.$set(this.request, 'env', row.env)

      this.newProject = true
      this.editModel = true
    },
    deleteEnv (row) {
      this.$DatablauCofirm(`确定要删除此条环境配置？`).then(res => {
        this.$http.delete(`${this.$dddUrl}/service/datasource/env/bind?id=${row.id}`)
          .then(res => {
            this.getProjects()
          })
      })
    },
    getProjects () {
      this.$http.get(`${this.$dddUrl}/service/datasource/mapping`).then(res => {
        this.projects = res.data
        this.projectsArr = res.data
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    create () {
      this.request = {
        sourceId: '',
        sourceName: '',
        targetId: '',
        targetName: '',
        type: '',
        env: 'prod'
      }
      this.editModel = false
      this.newProject = true
      this.$refs.form && this.$refs.form.resetFields()
    },
    closeLog () {
      this.newProject = false
      this.$refs.form.resetFields()
      this.request = {
        sourceId: '',
        sourceName: '',
        targetId: '',
        targetName: '',
        type: ''
      }
    },
    submitEnv () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          let obj = {
            sourceId: this.request.sourceId,
            sourceName: this.request.sourceName,
            targetId: this.request.targetId,
            targetName: this.request.targetName,
            type: this.request.type,
            env: this.request.env
          }
          if (this.editModel) {
            obj.id = this.request.id
          }
          let request = this.editModel ? this.$http.put(`${this.$dddUrl}/service/datasource/env/bind`, obj) : this.$http.post(`${this.$dddUrl}/service/datasource/env/bind`, obj)
          request
            .then(res => {
              if (this.editModel) {
                this.$blauShowSuccess('映射修改成功')
              } else {
                this.$blauShowSuccess('映射创建成功')
              }
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

.devPublish-content{
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
}
  </style>
