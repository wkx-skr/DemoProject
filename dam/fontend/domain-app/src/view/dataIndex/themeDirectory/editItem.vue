<template>
  <div style="padding: 0 20px" class="allOut">
    <div class="row-header">
      <datablau-breadcrumb
        @back="back"
        :node-data="nodeData"
        separator="/"
      ></datablau-breadcrumb>
    </div>
    <datablau-form-submit
      style="position: absolute; top: 50px; left: 0; right: 0; bottom: 0"
    >
      <div style="padding: 10px 20px">
        <el-form
          class="page-form multiple-column"
          inline
          label-position="right"
          :label-width="$i18n.locale === 'en' ? '10em' : '7em'"
          :rules="formRules"
          ref="form"
          :model="formData"
        >
          <el-form-item :label="$t('indicator.subject.name')" prop="name">
            <datablau-input
              maxlength="200"
              v-model="formData.name"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('system.systemSetting.dir')"
            prop="categorys"
          >
            <el-cascader
              clearable
              v-model="formData.categorys"
              :options="options"
              filterable
              :props="{ checkStrictly: true }"
              @change="categoryChange"
              ref="cascader"
            ></el-cascader>
          </el-form-item>
          <!-- <el-form-item label="应用系统" prop="system">
            <datablau-input
              maxlength="200"
              v-model="formData.system"
            ></datablau-input>
          </el-form-item> -->
          <!-- <el-form-item label="数据表" prop="tableName">
            <datablau-input
              maxlength="200"
              v-model="formData.tableName"
            ></datablau-input>
          </el-form-item> -->
          <meta-selector
            ref="metaSelector"
            type="table"
            @select="handleMetaSelect"
            :key="selectKey"
          ></meta-selector>
          <el-form-item
            :label="$t('meta.common.sourceType.dataSource')"
            :required="true"
          >
            <datablau-input
              :value="tableLabel"
              disabled="true"
              :title="tableLabel"
            ></datablau-input>
            <datablau-button type="text" @click="setTable">
              {{ $t('meta.DS.tableDetail.security.set') }}
            </datablau-button>
          </el-form-item>
        </el-form>
      </div>
      <div style="height: 200px"></div>
      <div slot="buttons" class="page-btn-group left-bottom" style="margin: 0">
        <datablau-button type="important" @click="onSubmit">
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button type="secondary" @click="back">
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </div>
    </datablau-form-submit>
  </div>
</template>
<script>
import editItem from './editItem.js'
export default editItem
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.row-header {
  padding: 10px 0 8px;
  border-bottom: 1px solid $border-color;
}
.part-title {
  border-left: 4px solid $primary-color;
  margin-bottom: 12px;
  margin-top: 10px;
  padding-left: 6px;
  color: $text-default;
  font-size: 14px;
}
.el-dialog .el-form-item {
  margin-bottom: 20px;
}
// .newDialog {
//   .el-select-dropdown{
//     width: 300px;
//   }
// }
</style>
<style lang="scss">
.multiple-column {
  .el-form-item {
    min-width: 532px;
    font-size: 12px;
    &:nth-of-type(odd) {
      margin-right: 100px;
      /*outline: 1px solid indianred;*/
    }
    margin-right: 100px;
  }
  .el-form-item__error {
    padding-top: 0;
  }
  .auto {
    .el-form-item__label {
      width: auto !important;
    }
  }
}
.allOut .el-form-item {
  margin-bottom: 20px;
}
</style>
