<template>
  <div>
    <h1>{{ $t('component.roleSelect.roleSelect') }}</h1>
    <h2>{{ $t('component.roleSelect.example') }}</h2>
    <div class="component-box" style="padding: 20px; height: auto; width: 100%">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>{{ $t('component.roleSelect.singleSel') }}</span>
        </div>
        <datablau-roleselect v-model="chooseDataSingle"></datablau-roleselect>
      </el-card>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>{{ $t('component.roleSelect.multipleSel') }}</span>
        </div>
        <datablau-roleselect
          multiple
          v-model="chooseData"
        ></datablau-roleselect>
      </el-card>
    </div>
    <h2>{{ $t('component.roleSelect.code') }}</h2>
    <div class="component-box" style="padding: 20px; height: auto; width: 100%">
      <pre><code>{{ code }}</code></pre>
    </div>
    <h2>{{ $t('component.roleSelect.interface') }}</h2>
    <p>{{ $t('component.roleSelect.intro') }}</p>
    <h3>{{ $t('component.roleSelect.labelName') }}</h3>
    datablau-roleselect
    <h3>{{ $t('component.roleSelect.property') }}</h3>
    <el-table
      style="width: 1000px"
      class="datablau-table"
      :data="[
        {
          name: 'multiple',
          explain: $t('component.roleSelect.isMultiple'),
          type: 'Boolean',
          candidate: '',
          isRequired: $t('component.roleSelect.no'),
          default: 'false',
        },
        {
          name: 'placeholder',
          explain: 'placeholder',
          type: 'String',
          candidate: '',
          isRequired: $t('component.roleSelect.no'),
          default: $t('component.roleSelect.placeholder'),
        },
      ]"
    >
      <el-table-column
        :label="$t('component.roleSelect.propertyName')"
        prop="name"
      ></el-table-column>
      <el-table-column
        :label="$t('component.roleSelect.description')"
        width="240"
        prop="explain"
      ></el-table-column>
      <el-table-column
        :label="$t('component.roleSelect.propType')"
        prop="type"
      ></el-table-column>
      <el-table-column
        :label="$t('component.roleSelect.options')"
        prop="candidate"
      ></el-table-column>
      <el-table-column
        :label="$t('component.roleSelect.required')"
        prop="isRequired"
      ></el-table-column>
      <el-table-column
        :label="$t('component.roleSelect.default')"
        prop="default"
      ></el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  data() {
    return {
      list: [],
      chooseDataSingle: '',
      chooseData: [1],
      code: `
        <datablau-roleselect v-model="chooseDataSingle"></datablau-roleselect>`,
    }
  },
  watch: {
    chooseDataSingle: {
      handler(newVal, oldVal) {
        console.log('newVal', newVal)
      },
      deep: true,
      immediate: true,
    },
    chooseData: {
      handler(newVal, oldVal) {
        console.log('newVal', newVal)
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {},
}
</script>
<style lang="scss" scoped>
@import '../base.scss';

.box-card {
  width: 400px;
  float: left;
  margin-right: 20px;
  margin-bottom: 20px;
}
</style>
