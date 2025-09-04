<template>
  <div>
    <!-- <el-dialog
      :visible.sync="editDialogVisible"
      width="800px"
      height="500px"
      append-to-body
      :close-on-click-modal="false"
      :before-close="closeEditDialogVisible"
      title="选择目标数据"
    ></el-dialog> -->
    <div class="row-main" style="height: 350px;overflow: auto;">
      <el-form
        class="page-form multiple-column"
        inline
        label-position="right"
        label-width="10em"
        :rules="formRules"
        ref="form"
        :model="formData"
      >
        <!-- <div class="part-title">对应信息</div> -->
        <el-form-item :label="$t('assets.assetList.dataItem')" prop="dataItem">
          <datablau-input
            maxlength="200"
            v-model="formData.dataItem"
            v-if="!readOnly"
          ></datablau-input>
          <span v-else>{{ formData.dataItem }}</span>
        </el-form-item>
        <el-form-item
          :label="$t('indicator.demand.analysisProps.description')"
          prop="businessDescription"
        >
          <datablau-input
            maxlength="200"
            v-model="formData.businessDescription"
            v-if="!readOnly"
          ></datablau-input>
          <span v-else>{{ formData.businessDescription }}</span>
        </el-form-item>
        <!-- <el-form-item label="对应编码:" prop="columnCode">
          <datablau-input
            maxlength="200"
            v-model="formData.columnCode"
            v-if="!readOnly"
          ></datablau-input>
          <span v-else>{{ formData.columnCode }}</span>
        </el-form-item>
        <el-form-item label="对应标准项:" prop="columnStandard">
          <datablau-input
            maxlength="200"
            v-model="formData.columnStandard"
            v-if="!readOnly"
          ></datablau-input>
          <span v-else>{{ formData.columnStandard }}</span>
        </el-form-item>
        <el-form-item label="推荐标准/指标:" prop="recommendedStandards">
          <datablau-input
            maxlength="200"
            v-model="formData.recommendedStandards"
            v-if="!readOnly"
          ></datablau-input>
          <span v-else>{{ formData.recommendedStandards }}</span>
        </el-form-item> -->
        <!-- <div class="part-title">关联数据</div> -->
        <!-- <el-form-item label="目标数据:" prop="">
          <datablau-input v-model="formData.target" v-if="!readOnly"></datablau-input>
          <span v-else>{{formData.target}}</span>
        </el-form-item> -->
        <el-form-item :label="$t('assets.udp.modelMart')" prop="systemName">
          <datablau-input
            maxlength="200"
            v-model="formData.systemName"
            v-if="!readOnly"
            disabled="true"
          ></datablau-input>
          <span v-else>{{ formData.systemName }}</span>
        </el-form-item>
        <el-form-item
          :label="$t('meta.DS.tableDetail.security.database')"
          prop="dataDatabase"
        >
          <datablau-input
            maxlength="200"
            v-model="formData.dataDatabase"
            v-if="!readOnly"
            disabled="true"
          ></datablau-input>
          <span v-else>{{ formData.dataDatabase }}</span>
        </el-form-item>
        <el-form-item label="SCHEMA:" prop="dataSchema">
          <datablau-input
            maxlength="200"
            v-model="formData.dataSchema"
            v-if="!readOnly"
            disabled="true"
          ></datablau-input>
          <span v-else>{{ formData.dataSchema }}</span>
        </el-form-item>
        <el-form-item
          :label="$t('meta.DS.tableDetail.security.table')"
          prop="dataTable"
        >
          <datablau-input
            maxlength="200"
            v-model="formData.dataTable"
            v-if="!readOnly"
            disabled="true"
          ></datablau-input>
          <span v-else>{{ formData.dataTable }}</span>
        </el-form-item>
        <el-form-item
          :label="$t('meta.DS.tableDetail.column.name')"
          prop="dataColumnName"
        >
          <datablau-input
            maxlength="200"
            v-model="formData.dataColumnName"
            v-if="!readOnly"
            disabled="true"
          ></datablau-input>
          <span v-else>{{ formData.dataColumnName }}</span>
        </el-form-item>
        <el-form-item
          :label="$t('meta.DS.tableDetail.column.chineseName')"
          prop="dataColumnChName"
        >
          <datablau-input
            maxlength="200"
            v-model="formData.dataColumnChName"
            v-if="!readOnly"
            disabled="true"
          ></datablau-input>
          <span v-else>{{ formData.dataColumnName }}</span>
        </el-form-item>
        <el-form-item :label="$t('meta.DS.treeSubOperation.columnType')" prop="columnType">
          <!-- <datablau-select v-model="formData.columnType" v-if="!readOnly">
            <el-option key="1" label="String" value="String"></el-option>
          </datablau-select> -->
          <datablau-input
            maxlength="200"
            v-model="formData.columnType"
            v-if="!readOnly"
            disabled="true"
          ></datablau-input>
          <span v-else>{{ formData.columnType }}</span>
        </el-form-item>
        <!-- <el-form-item label="是否必填:" prop="dataRequired">
          <el-switch
            v-model="formData.dataRequired"
            v-if="!readOnly"
          ></el-switch>
          <span v-else>{{ formData.dataRequired ? '是' : '否' }}</span>
        </el-form-item>
        <el-form-item label="字段描述:" prop="columnDescription">
          <datablau-input
            v-model="formData.columnDescription"
            type="textarea"
            :rows="2"
            v-if="!readOnly"
          ></datablau-input>
          <span v-else>{{ formData.columnDescription }}</span>
        </el-form-item>
        <div class="part-title">执行设置</div>
        <el-form-item label="是否执行:" prop="columnExecute">
          <el-switch
            v-model="formData.columnExecute"
            v-if="!readOnly"
          ></el-switch>
          <span v-else>{{ formData.columnExecute ? '是' : '否' }}</span>
        </el-form-item>
        <el-form-item label="不执行原因:" prop="noExecuteReason">
          <datablau-input
            v-model="formData.noExecuteReason"
            type="textarea"
            :rows="2"
            v-if="!readOnly"
          ></datablau-input>
          <span v-else>{{ formData.noExecuteReason }}</span>
        </el-form-item> -->
      </el-form>
    </div>
    <div class="bottom-info" slot="footer">
      <datablau-button
        @click="$emit('close')"
        type="secondary"
        style="float: right; margin-top: 20px; margin-left: 10px"
      >
        {{ $t('common.button.close') }}
      </datablau-button>
      <datablau-button
        v-if="!readOnly"
        type="important"
        style="float: right; margin-top: 20px"
        @click="onSubmit"
      >
        {{ $t('common.button.submit') }}
      </datablau-button>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  beforeMount () {},
  props: {
    readOnly: {
      type: Boolean,
      required: false,
      default: false
    },
    message: {
      type: Object,
      required: false,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      formData: {},
      formRules: {
        columnDescription: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull')
        }
      }
    }
  },
  mounted () {
    if (this.message) {
      this.formData = _.cloneDeep(this.message)
      //   this.formData.target =
      //     this.message.systemName +
      //     '/' +
      //     this.message.dataDatabase +
      //     '/' +
      //     this.message.dataSchema +
      //     '/' +
      //     this.message.dataTable +
      //     '/' +
      //     this.message.dataColumnName
    }
  },
  beforeDestroy () {},
  methods: {
    onSubmit () {
      this.$refs.form.validate(valid => {
        if (!valid) {
          this.$blauShowFailure(this.$t('domain.common.requiredIsNull'))
          return false
        } else {
          let url =
            '/requirementmanagement/requirementanalysisdataobject/create'
          let body = this.formData
          // this.$http.post(url, body).then(res => {})
          this.$emit('submitMessage', this.formData)
          this.formData = {}
          this.$emit('close')
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped="scoped">
@import '~@/next/components/basic/color.sass';
.part-title {
  border-left: 4px solid $primary-color;
  margin-bottom: 12px;
  margin-top: 10px;
  padding-left: 6px;
  color: $text-default;
  font-size: 14px;
}
.bottom-info {
  height: 50px;
}
</style>
<style>
.row-main .el-form.page-form textarea {
  width: 700px;
}
</style>
