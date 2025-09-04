<template>
  <div class="form-con">
    <el-form
      ref="form"
      label-width="110px"
      label-position="right"
      size="small"
      class="cre-virds-form"
      :model="fdsContent"
      :rules="vdprules"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          size="mini"
          v-model="fdsContent.name"
          placeholder="请输入数据源名称"
        ></el-input>
        <el-tooltip
          content="名字仅支持包含字母，数字，下划线，且此名称全局唯一"
          effect="light"
          placement="right"
        >
          <i class="el-icon-info"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="显示名称" :rules="{ required: true }">
        <el-input
          size="mini"
          v-model="fdsContent.displayName"
          placeholder="输入数据源名称"
        ></el-input>
      </el-form-item>
      <el-form-item label="数据源" :rules="{ required: true }">
        <el-input
          size="mini"
          v-model="currentDataSource.definition"
          readonly
        ></el-input>
        <!--<el-select
          size="mini"
          v-model="fdsContent.modelId"
          placeholder="请选择数据源"
          filterable
          clearable
          :disabled="!modelIdChangeable"
        >
          <el-option
            v-for="item in modelsArr"
            :key="item.id"
            :label="item.name"
            :value="item.id"
            :disabled="disabledModedMap[item.id + '']"
          ></el-option>
        </el-select>-->
      </el-form-item>
      <el-form-item label="描述">
        <el-input
          size="mini"
          type="textarea"
          v-model="fdsContent.description"
          placeholder="输入数据源名称"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="handleCreateFds"
          :disabled="submitDisabled"
        >
          立即创建
        </el-button>
        <el-button @click="handleCancel">
          {{ $t('common.button.cancel') }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
/**
 * 创建虚拟数据源
 */
import createVDs from './createVDs.js'
export default createVDs
</script>

<style lang="scss">
.form-con {
  max-width: 600px;

  .cre-virds-form {
    input {
    }

    .el-input {
      max-width: 250px;
      width: 80%;
    }
  }
}
</style>
