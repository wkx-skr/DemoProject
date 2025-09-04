<template>
  <div class="map-detail">
    <div class="map-title oneline-eclipse">{{ data.categoryName }}</div>
    <div class="map-vice-title oneline-eclipse">
      {{ data.categoryAbbreviation }}
    </div>
    <div
      v-if="data.description"
      class="description"
      :title="data.description.length > 100 ? data.description : ''"
    >
      {{ data.description.length }}
      {{ data.description }}
    </div>
    <div class="list-box">
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane
          :label="$t('meta.map.basicInfo')"
          name="basic"
        ></el-tab-pane>
        <el-tab-pane
          :label="$t('meta.map.interface')"
          name="call"
        ></el-tab-pane>
        <el-tab-pane
          :label="$t('meta.map.model')"
          name="model"
          v-if="$ddmConnectable"
        ></el-tab-pane>
        <el-tab-pane
          :label="$t('meta.map.environment')"
          name="environment"
          v-if="$customerId === 'gszc'"
        ></el-tab-pane>
        <!--<el-tab-pane label="表" name="table"></el-tab-pane>-->
      </el-tabs>
      <span class="inner-search-box" v-if="activeName === 'table'">
        <input
          type="text"
          :placeholder="$t('meta.map.searchTableInSys')"
          v-model="keyword"
          @keydown.enter="search"
        />
        <span
          style="float: right; color: #fff; margin-right: 5px; cursor: pointer"
          @click="search"
        >
          <i class="el-icon-search"></i>
        </span>
      </span>
      <div class="list-content">
        <auto-table
          key="basic"
          v-if="activeName === 'basic'"
          :data="basicData"
          :show-header="false"
          :tableProp="[
            { width: 10 },
            { prop: 'label', className: 'labelColumn', width: 150 },
            { prop: 'value' },
          ]"
        ></auto-table>
        <auto-table
          key="env"
          v-if="activeName === 'environment'"
          :data="environmentData"
          support-jump
          show-header
          @jumpToModel="jumpToModel"
          :tableProp="[
            { width: 10 },
            {
              prop: 'label',
              label: $t('meta.map.usage'),
              className: 'labelColumn',
              width: 150,
            },
            { prop: 'value', label: $t('meta.map.datasource') },
          ]"
        ></auto-table>
        <auto-table
          key="model"
          v-if="activeName === 'model'"
          :data="modelData"
          show-header
          :tableProp="[
            { width: 10 },
            { prop: 'path', label: $t('meta.map.path') },
            { prop: 'name', label: $t('meta.map.name') },
            { prop: 'description', label: $t('meta.map.desc') },
          ]"
        ></auto-table>
        <auto-table
          key="call"
          v-else-if="activeName === 'call'"
          :data="callData"
          show-header
          :tableProp="[
            { width: 10 },
            { icon: 'call', width: 40 },
            { prop: 'categoryName', label: $t('meta.map.sysName') },
            { prop: 'length', label: $t('meta.map.interfaceNum'), width: 90 },
          ]"
          @row-click="handleCallClick"
        ></auto-table>
        <auto-table
          key="table"
          v-else-if="activeName === 'table'"
          :data="tableData"
          :tableProp="[
            { width: 10 },
            { prop: 'name', label: '中文名' },
            { prop: 'physicalName', label: '英文名' },
            { label: '描述', prop: 'definition' },
          ]"
        ></auto-table>
      </div>
    </div>
  </div>
</template>
<script>
import code from './categoryDetail.js'
export default code
</script>
<style lang="scss" scoped></style>
