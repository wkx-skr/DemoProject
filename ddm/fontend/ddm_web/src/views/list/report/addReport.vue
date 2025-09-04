<template>
  <div class="add-report-component">
    <div class="top-line">
      <span class="title-text" @click="close">审批管理</span> <span class="split-line">/</span> <span
      class="page-name">发布报告</span>
    </div>
    <div class="content-container">
      <datablau-form-submit>
        <div>
          <datablau-form label-position="right" label-width="82px" size="mini" :rules="rules">
            <el-form-item :label="$store.state.$v.report.reportName" prop="name">
              <datablau-input v-model="name" style="width:360px;" maxlength="250" show-word-limit></datablau-input>
            </el-form-item>
            <el-form-item :label="''" label-width="0">
              <div class="version-table-outer">
                <datablau-table
                  ref="multipleTable"
                  :data="tableData"
                  :data-selectable="true"
                  row-class-name="row-can-click"
                  @row-click="toggleSelection"
                  @selection-change="handleSelectionChange"
                  class="datablau-table"
                  :reserve-selection="true"
                  row-key="id"
                  :auto-hide-selection="false"
                >
                  <!--<el-table-column type="selection"></el-table-column>-->
                  <el-table-column
                    prop="name"
                    :label="$store.state.$v.report.version"
                    min-width="150"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    prop="description"
                    :label="$store.state.$v.report.description"
                    min-width="150"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    :label="$store.state.$v.report.publisher"
                    prop="creator"
                    :width="140"
                  ></el-table-column>
                  <el-table-column
                    prop="timestamp"
                    :label="$store.state.$v.report.time"
                    :formatter="$timeFormatter"
                    :width="140"
                  ></el-table-column>
                </datablau-table>
                <div class="bottom-line" v-if="versionTotal >= 10">
                  <datablau-pagination
                    @size-change="handleSizeChangeVersion"
                    @current-change="handleCurrentChangeVersion"
                    :current-page.sync="versionCurrentPage"
                    :page-sizes="[10, 20, 30, 50]"
                    :page-size.sync="versionPageSize"
                    :total="versionTotal"
                  ></datablau-pagination>
                </div>
              </div>
            </el-form-item>
            <!--<el-form-item :label="$store.state.$v.report.addScript" v-if="supportScript">
              <div class="script-container">
                <div class="top-buttons">
                  <datablau-button
                    size="small" @click="downloadScript" type="secondary"
                    class="iconfont icon-export btn-icon"
                  >
                    <span class="button-text"> {{
                        $store.state.$v.report.output
                      }}</span>
                  </datablau-button>
                  <el-upload
                    action="datablau.cn"
                    :auto-upload="false"
                    :show-file-list="false"
                    style="display:inline-block;margin: 0 8px;"
                    :on-change="uploadScript"
                  >
                    <datablau-button
                      size="small" type="secondary" class="iconfont icon-import btn-icon"
                    >
                      <span
                        class="button-text"> {{
                          $store.state.$v.report.upload
                        }}</span>
                    </datablau-button>
                  </el-upload>

                  <datablau-button size="small" class="el-icon-document-copy" @click="copyScript" type="secondary"> {{
                      $store.state.$v.report.copy
                    }}
                  </datablau-button>
                </div>
                <div class="script-input-outer">
                  <datablau-input
                    v-if="editMode"
                    v-model="incrementalScript"
                    class="script-textarea"
                    type="textarea"
                    :autosize="{minRows:3,maxRows:18}"
                  ></datablau-input>
                </div>
              </div>

            </el-form-item>-->
          </datablau-form>
        </div>
        <template slot="buttons">
          <datablau-button
            @click="submit"
            type="primary" size="small" :disabled="buttonDisabled">
            {{ $store.state.$v.report.publish }}
          </datablau-button>
          <datablau-button
            @click="close"
            size="small"
            type="secondary"
          >{{ $store.state.$v.report.cancel }}
          </datablau-button>
        </template>
      </datablau-form-submit>
    </div>

  </div>
</template>
<script>
import HTTP from '@/resource/http'
import 'prismjs/themes/prism.css'
import Prism from 'prismjs'
import moment from 'moment'
import string from '@/resource/utils/string'

export default {
  props: {
    modelId: {
      required: true
    },
    model: {
      required: true
    }
  },
  data () {
    let contentValidate = (rule, value, callback) => {
      value = _.trim(this.name)
      if (!value) {
        callback(new Error(this.$store.state.$v.report.err1))
      } else {
        callback()
      }
    }
    return {
      tableData: [],
      name: '',
      modelName: '',
      incrementalScript: null,
      // incrementalScript: 'create or replace function aaa(v_total in number(10.2),\nv_num In OUT number(10,2)) return  number(10,2)\nas\nv_pric number(10,2);\nbegin\n  v_pric:=v_total/v_num;\n  \n  return v_pric;↵  end;',
      multipleSelection: [],
      supportScript: false,
      editMode: true,
      isPending: false,
      versionTotal: 0,
      versionPageSize: 10,
      versionCurrentPage: 1,
      allVersionList: [],
      rules: {
        name: {
          required: true,
          validator: contentValidate,
          trigger: ['change', 'blur']
        }
      }
    }
  },
  mounted () {
    if (['Oracle', 'DB2LUW', 'MySQL'].includes(this.model.modelType)) {
      this.supportScript = true
    }
    this.getVersions()
    this.$nextTick(() => {
      setTimeout(() => {
        this.highlight()
      })
    })
    this.getModelName()
  },
  methods: {
    highlight () {
      setTimeout(() => {
        Prism.highlightAll()
      })
    },
    editScript () {
      this.editMode = true
    },
    viewScript () {
      this.editMode = false
      this.highlight()
    },
    uploadScript (file) {
      const reader = new FileReader()
      reader.readAsText(file.raw)
      reader.onloadend = () => {
        this.incrementalScript = reader.result
        this.viewScript()
      }
    },
    downloadScript () {
      if (this.incrementalScript) {
        string.exportToFile(this.incrementalScript, 'export.sql')
      } else {
        this.$message.info(this.$store.state.$v.report.mes3)
      }
    },
    copyScript () {
      if (this.incrementalScript) {
        string.setClipBoard(this.incrementalScript)
        this.$message.success(this.$store.state.$v.report.mes5)
      } else {
        this.$message.info(this.$store.state.$v.report.mes4)
      }
    },
    getVersions () {
      HTTP.getVersions({
        modelId: this.modelId,
        successCallback: data => {
          this.allVersionList = data.filter(item => item.name !== 'Latest Version')
          this.versionTotal = this.allVersionList.length
          this.getTableShowData()
        }
      })
    },
    handleSizeChangeVersion () {
      this.getTableShowData()
    },
    handleCurrentChangeVersion () {
      this.getTableShowData()
    },
    getTableShowData () {
      if (this.versionTotal <= 10) {
        this.tableData = this.allVersionList
      } else {
        let s = this.versionPageSize
        let c = this.versionCurrentPage
        this.tableData = this.allVersionList.slice(s * (c - 1), s * c)
      }
    },
    toggleSelection (row) {
      // this.$refs.multipleTable.toggleRowSelection(row)
    },
    handleSelectionChange (val) {
      this.multipleSelection = val.map(item => item.id)
    },
    submit () {
      this.isPending = true
      HTTP.postReport({
        requestBody: {
          name: _.trim(this.name),
          incrementalScript: this.incrementalScript,
          modelId: this.modelId,
          modelVersionIds: this.multipleSelection
        },
        successCallback: data => {
          setTimeout(() => {
            this.$emit('reload')
            this.$emit('close')
            this.$message.success(this.$store.state.$v.RuleChecking.publishedSuccessfully)
          }, 500)
        },
        finallyCallback: () => {
          setTimeout(() => {
            this.isPending = false
          }, 1000)
        }
      })
    },
    close () {
      this.$emit('close')
    },
    getModelName () {
      let getTime = new Date()
      let y = getTime.getFullYear().toString().slice(-2) // 年份
      let M = (getTime.getMonth() + 1).toString().padStart(2, '0') // 月份
      let d = getTime.getDate().toString().padStart(2, '0') // 日
      let h = getTime.getHours().toString().padStart(2, '0') // 小时
      let m = getTime.getMinutes().toString().padStart(2, '0') // 分
      let t = getTime.getTime().toString().slice(-6) // 毫秒数后6位
      this.modelName = this.model.name
      this.name = `${this.$store.state.$v.report.aboutModel}${this.modelName}${this.$store.state.$v.report.modelReport}${y}${M}${d}${t}`
    }
  },
  computed: {
    buttonDisabled () {
      let name = _.trim(this.name)
      return !name || this.multipleSelection.length === 0 || this.isPending
    }
  },
  watch: {
    incrementalScript () {
      this.highlight()
    }
  }
}
</script>

<style scoped lang="scss">

.add-report-component {
  //border: 1px solid red;
  //padding: 20px;
  position: absolute;
  top: 4px;
  left: 0;
  right: 0;
  bottom: 0;

  .top-line {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 42px;
    font-size: 16px;

    padding-left: 20px;

    .title-text {
      cursor: pointer;

      &:hover {
        color: #409eff;
      }
    }

    .page-name {
      font-weight: bold;
    }
  }

  .content-container {
    position: absolute;
    top: 42px;
    left: 0;
    right: 0;
    bottom: 0;
  }

  //overflow: auto;

  .version-table-outer {
    //border: 1px solid red;
    margin: 0 20px;
  }

  .bottom-line {
    padding-top: 10px;
  }
}

/deep/ .el-form-item__label {
  font-weight: bold;
  font-size: 12px;
}

.footer-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  border-top: 1px solid #ddd;
  padding-left: 20px;
}

.script-container {
  border: 1px solid #DDDDDD;
  max-width: 1000px;
  border-radius: 2px;

  .top-buttons {
    //border: 1px solid red;
    padding: 10px;
    border-bottom: 1px solid #ddd;
  }

  .script-input-outer {
    .script-textarea {
      width: 100%;
      border-color: transparent;

      /deep/ .el-textarea__inner {
        border-color: transparent;

        &:focus, &:hover {
          border-color: transparent;
        }
      }

      &:focus, &:hover {
        border-color: transparent;
      }
    }
  }
}

</style>
