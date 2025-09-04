<template>
  <div class="reDetail edit-ds">
    <div class="container">
      <div class="form-container">
        <el-form
          class="page-form"
          label-position="right"
          :label-width="$i18n.locale === 'zh' ? '130px' : '140px'"
          size="small"
          :model="dsform"
          style="overflow: auto"
          ref="form"
        >
          <div class="database-info-container">
            <el-form-item
              :label="$t('meta.dataSource.edit.reName')"
              :rules="{ required: true }"
            >
              <datablau-input
                test-name="edit_datasource_name"
                size="mini"
                v-model="dsform.definition"
                maxlength="100"
                show-word-limit
                :placeholder="$t('meta.dataSource.edit.fillReName')"
              ></datablau-input>
            </el-form-item>
            <el-form-item
              :label="$t('meta.dataSource.system')"
              size="mini"
              :rules="{ required: true }"
              test-name="add_datasource_system"
            >
              <datablau-select
                v-model="dsform.categoryId"
                @change="getCategoryName"
                filterable
                clearable
                style="margin-right: 10px; width: 400px"
                :no-data-text="$t('meta.dataSource.noSystem')"
              >
                <el-option
                  v-for="c in $userModelCategoryDetail"
                  :title="c.categoryName + '(' + c.categoryAbbreviation + ')'"
                  :label="c.categoryName + '(' + c.categoryAbbreviation + ')'"
                  :value="c.categoryId"
                  :key="c.categoryId"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item
              :label="$t('meta.reManage.connection')"
              :rules="{ required: true }"
              prop="datasourceId"
              :show-message="false"
            >
              <el-select
                v-model="dsform.datasourceId"
                @change="changeDataSource"
                filterable
                style="margin-right: 10px"
                :placeholder="$t('meta.reManage.fillDatasourcePlaceholder')"
              >
                <el-option
                  v-for="d in dataSourceData"
                  :label="d.sourceName"
                  :value="d.id"
                  :key="d.id"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="元模型"
              :rules="{ required: true }"
              prop="metaModelCode"
              :show-message="false"
            >
              <el-select
                v-model="dsform.metaModelCode"
                filterable
                style="margin-right: 10px"
                :placeholder="$t('meta.reManage.fillDatasourcePlaceholder')"
              >
                <el-option
                  v-for="d in metaModelList"
                  :label="d.name"
                  :value="d.code"
                  :key="d.code"
                ></el-option>
              </el-select>
            </el-form-item>
          </div>
        </el-form>
        <div class="confirm-box">
          <datablau-button
            size="small"
            style="margin-right: 10px"
            @click="removetab"
            type="secondary"
          >
            {{ $t('common.button.cancel') }}
          </datablau-button>
          <div style="display: inline-block">
            <datablau-button
              size="small"
              type="important"
              @click="save"
              test-name="confirm_btn"
              :disabled="btnLoad"
            >
              {{ $t('common.button.ok') }}
              <i class="el-icon-loading" v-if="btnLoad"></i>
            </datablau-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Agent from '@/components/dataSource/agent'
import Compare from '@/components/dataSource/compare'
import DatasourceController from '../../../../../../base-components/http/baseController/DatasourceController'

import editDs from '@/components/dataSource/editDs.vue'
export default {
  mixins: [Agent, Compare],
  props: [
    'tagTree',
    'tagMap',
    'dsEditing',
    'editRow',
    'isReport',
    'isFile',
    'isShareFile',
    'isMetaModel',
  ],
  data() {
    return {
      saveLoading: false,
      isAdd: false,
      dsform: {
        jdbcModel: false,
        definition: '',
        CommentToLogicalName: false,
        TagIds: [],
        datasourceId: '',
        categoryId: '',
        modelCategoryId: '',
        metaModelCode: '',
        reverseOptions: {},
      },
      metaModelList: [],
      dataSourceData: [],
      currentDataSource: {},
      btnLoad: false,
    }
  },
  components: { editDs },

  computed: {
    step1CanNext() {
      return this.step1TestSucceed && this.$refs.step1?.canNext
    },
    pathArr() {
      let arr = [this.$t('common.page.dataSource')]
      if (!this.dsEditing) {
        arr.push(this.$t('meta.dataSource.add'))
      } else {
        arr.push(this.editRowData.definition)
      }
      return arr
    },
  },
  created() {},
  mounted() {
    if (this.dsEditing) {
      console.log(this.editRow)
      this.dsform.definition = this.editRow.definition
      this.dsform.metaModelCode = this.editRow.metaModelCode
      this.dsform.modelCategoryId = this.editRow.categoryId
      this.dsform.categoryId = this.editRow.categoryId
      this.dsform.datasourceId = this.editRow.datasourceId
      this.dsform.modelId = this.editRow.modelId
      this.getDatasourceData()
    }

    this.getModelList()
  },
  beforeDestroy() {},
  methods: {
    save() {
      this.btnLoad = true
      let param = { ...this.dsform, type: this.dsform.metaModelCode }
      this.$http
        .post(this.$meta_url + '/models/createModel', param)
        .then(res => {
          this.$datablauMessage.success('保存成功')
          this.btnLoad = false
          this.removetab()
        })
        .catch(e => {
          this.$showFailure(e)
          this.btnLoad = false
        })
    },
    async getModelList() {
      try {
        const res = await this.$http.post(`/metadata/mm/getMetaModels`)
        this.metaModelList = res.data
        console.log(res.data)
      } catch (error) {
        this.$blauShowFailure(error)
      }
    },
    changeDataSource(val) {
      this.currentDataSource = this.dataSourceData.filter(data => {
        return data.id === val
      })[0]
    },
    getCategoryName(val) {
      this.$modelCategories.forEach(item => {
        if (item.categoryId === val) {
          this.dsform.categoryName = item.categoryName
          this.dsform.categoryAbbreviation = item.categoryAbbreviation
        }
      })
      this.$set(this.dsform, 'categoryId', val)
      this.$set(this.dsform, 'modelCategoryId', val)
      this.$set(this.dsform, 'datasourceId', '')
      this.currentDataSource = {}
      this.getDatasourceData('changeSys')
    }, // 数据源列表
    getDatasourceData() {
      let param = {
        keyword: '',
        categoryId: this.dsform.categoryId,
      }
      if (!this.dsform.categoryId) {
        return
      }
      DatasourceController.findDatasources({ requestBody: param })
        .then(res => {
          if (!res.data || !Array.isArray(res.data)) {
            return
          }
          // 编辑只能选择同类型数据源
          if (this.dsEditing) {
            this.dataSourceData = res.data.filter(r => {
              return r.id === this.dsform.datasourceId
            })
          } else {
            this.dataSourceData = res.data.filter(
              source => !source.jdbc && source.customize
            )
          }
          this.dataSourceDataBackup = this.dataSourceData
          if (this.dsEditing) {
            if (
              res.data.filter(r => {
                return r.id === this.dsform.datasourceId
              }).length
            ) {
            } else {
              this.dsform.datasourceId = ''
              this.$refs.form.validateField('datasourceId')
            }
          }

          if (this.dsEditing) {
            this.changeDataSource(this.dsform.datasourceId)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    noClick(row) {
      let result = false
      if (row.done || this.activeStep === row.step) {
        result = false
      } else {
        result = true
      }
      if (this.activeStep === 3) {
        result = true
      }
      return result
    },
    async changeStepTop(row) {
      if (this.currentStep === 3) return
      if (this.currentStep === row.step) return
      if (row.step < this.currentStep) {
        this.currentStep = row.step
      } else {
        if (!row.done) return
        this.currentStep = row.step
      }
    },
    changeSaveLoading(val) {
      this.saveLoading = val
    },
    // step1 触发的change
    changeStep(step) {
      this.currentStep = step
    },

    removetab() {
      this.$emit('removeReTab')
    },
    nodeClick() {
      this.removetab()
    },
    backClick() {
      this.removetab()
    },
  },
  watch: {
    currentStep(step) {
      switch (step) {
        case 1:
          this.$refs.step1.getDatasourceData()
          break
        case 2:
          this.stepData[0].done = true
          break
        case 3:
          this.stepData[1].done = true
          break
      }
    },
    editRow: {
      handler: function (newVal) {
        if (newVal && this.dsEditing) {
          this.editRowData = newVal
        }
      },
      immediate: true,
    },
  },
}
</script>
<style lang="scss" scoped>
@import '~@/assets/styles/const.scss';
.backupDatasourceDisabled {
  background-color: var(--table-hover-bgc);
  border-color: #e4e7ed;
  color: #c0c4cc;
  cursor: not-allowed;
  border-radius: 2px;
}

$back-line-height: 40px;
$bottom-line-height: 50px;
.reDetail {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background: #fff;
  .container {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    .breadcrumb-line {
      box-sizing: border-box;
      padding-top: 8px;
      position: absolute;
      left: 20px;
      top: 0;
      right: 20px;
      height: $back-line-height;

      border-bottom: 1px solid var(--border-color-lighter);
    }
    .steps {
      width: 100%;
      height: 72px;
      padding: 16px 20px;
      box-sizing: border-box;
      position: relative;
      z-index: 9;
      &.steps-shadow {
        box-shadow: 0px 5px 14px -8px rgba(0, 0, 0, 0.2);
      }
      .step {
        position: relative;
        float: left;
        width: calc(33.3% - 20px);
        // width: 33.3%;
        margin-left: 8px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        background-color: #f5f5f5;
        color: #999;
        font-weight: 600;
        font-size: 14px;
        opacity: 1;
        transition: opacity 1s ease-in-out;
        cursor: pointer;
        &:after {
          content: '';
          width: 0px;
          height: 0px;
          border-top: 20px solid transparent;
          border-bottom: 20px solid transparent;
          border-left: 20px solid #f5f5f5;
          position: absolute;
          top: 0;
          right: -20px;
          z-index: 2;
        }
        &:before {
          content: '';
          width: 0px;
          height: 0px;
          border-top: 20px solid transparent;
          border-bottom: 20px solid transparent;
          border-left: 20px solid #fff;
          position: absolute;
          top: 0;
          left: 0;
        }
        &:nth-of-type(2) {
          width: calc(33.33% + 4px);
        }
        &:last-child {
          width: 33.33%;
          &:after {
            border: none;
            top: 0;
            right: 0;
          }
        }
        &:first-child {
          margin-left: 0;
          &:before {
            border: none;
            top: 0;
            right: 0;
          }
        }
        &.done {
          background: linear-gradient(
            90deg,
            rgba(64, 158, 255, 0.1),
            rgba(64, 158, 255, 0.2)
          );
          color: #409eff;
          &:after {
            border-left: 20px solid rgba(64, 158, 255, 0.2);
            z-index: 5;
          }
        }
        &.active {
          background: linear-gradient(90deg, #74cdff 3%, #409eff);
          color: #fff;
          &:after {
            border-left: 20px solid #409eff;
            z-index: 3;
          }
          &:before {
            z-index: 2;
          }
        }
        &.disabled {
          cursor: not-allowed;
        }
      }
    }
    .page-form {
      position: relative;
      top: 0;
      left: 0;
      .limitWidth .el-form-item__content {
        width: 620px;
      }

      textarea {
        width: 500px !important;
      }

      .contooltip {
        margin-right: 10px;
      }

      .disabled-with-border,
      .el-input__inner {
        border: 1px solid #dcdfe6;
        border-radius: 2px;
      }

      .user-name,
      .pass-word {
        &.is-disabled {
          .el-input__inner {
          }
          background-color: var(--table-hover-bgc);
          border-color: #e4e7ed;
          color: #c0c4cc;
          cursor: not-allowed;
          border-radius: 2px;
        }
      }

      .upload-wraper {
        display: inline-block;

        .upload-btn {
          background-color: $blue;
          color: #fff;
          margin-left: 10px;
        }
      }
    }
    .form-container {
      position: absolute;
      left: 0;
      right: 0;
      top: 42px;
      bottom: 0;
      overflow: auto;
      padding-bottom: 50px;

      .collect-item {
        margin-right: 20px;
      }

      /deep/ .datablau-input {
        display: inline-block;
      }
    }

    .confirm-box {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      // text-align: right;
      border-top: 1px solid #e0e0e0;
      background-color: #fff;
      padding: 8px 20px 0;
      font-size: 0;
      height: $bottom-line-height;
      z-index: 9;
      &.with-bottom-line-shadow {
        box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
      }
    }
  }
}
</style>
