<template>
  <div id="page-outer">
    <el-tabs v-model="currentType" id="tab" @tab-click="handleTypeChange">
      <el-tab-pane label="全部" name="all"></el-tab-pane>
      <el-tab-pane label="数据标准" name="DOMAIN"></el-tab-pane>
      <el-tab-pane label="标准代码" name="CODE"></el-tab-pane>
      <!-- <el-tab-pane label="业务质量规则" name="QUALITY_BUSINESS_RULE"></el-tab-pane>
      <el-tab-pane label="系统" name="MODEL_CATEGORY"></el-tab-pane> -->
      <el-tab-pane label="表/视图" name="TABLE"></el-tab-pane>
      <!-- <el-tab-pane label="列" name="COLUMN"></el-tab-pane> -->
      <!-- <el-tab-pane label="DataStage" name="DataStage"></el-tab-pane> -->
      <el-tab-pane label="报表" name="Report"></el-tab-pane>
      <!--      <el-tab-pane label="指标" name="INDEX"></el-tab-pane>-->
      <el-tab-pane label="文件类资产" name="SHAREFILE"></el-tab-pane>
    </el-tabs>
    <div id="outer">
      <div id="resultStats">
        <span class="count-info">
          找到{{ resultCount === 1000 ? '超过1000' : resultCount }}条结果 （用时
          {{ timeCost }} 秒）
        </span>
        <!--        <div class="create-required-line">-->
        <!--          <span>搜索结果不满意，点击<span class="create-required-btn" @click="skip2Required">创建数据需求</span></span>-->
        <!--        </div>-->
      </div>
      <div class="content-list">
        <div class="content-item" v-for="item in pageData">
          <div class="title oneline-eclipse" @click="go(item)">
            <!--<div class="tree-icon folder"></div>-->
            <!--["{{item.type.toLowerCase()}}"]-->
            【{{ typeTranslate(item.type) }}】{{ item.name }}
            <span v-if="item.typeId === 80010066">({{ item.domainCode }})</span>
          </div>
          <div class="definition" v-if="item.type === 'TABLE'">
            <span>英文名：{{ item.physicalName }}。</span>
            <span v-if="item.name !== item.physicalName">
              中文名：{{ item.name }}。
            </span>
            所属模型：{{ item.parentPhysicalName }}。
          </div>
          <div class="definition" v-if="item.type === 'COLUMN'">
            <span>英文名：{{ item.physicalName }}。</span>
            <span v-if="item.name !== item.physicalName">
              中文名：{{ item.name }}。
            </span>
            所属表英文名：{{ item.parentPhysicalName }}。
            <span v-if="item.parentLogicalName">
              所属表中文名：{{ item.parentLogicalName }}。
            </span>
          </div>
          <div class="definition" v-if="item.type === 'CODE'">
            {{ '英文名称 : ' + item.orginData.alias }} &nbsp;&nbsp;
            {{ '备注 : ' + item.orginData.comment }}
          </div>
          <div class="definition" v-else-if="!item.definition">
            {{ '' }}{{ item.alias }}
          </div>
          <div class="definition" v-else>
            {{ '' }}{{ item.alias }}
            <br v-if="item.type !== 'Report'" />
            {{ item.definition }}
            <span v-if="item.type === 'Report'">
              <span v-if="item.columns">{{ item.columns }}</span>
            </span>
          </div>
        </div>
      </div>
      <el-pagination
        :page-size="pageSize"
        :pager-count="11"
        layout="prev, pager, next"
        @current-change="currentChange"
        :total="resultCount"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>

<style lang="scss" scoped="scoped">
@import './main.scss';
</style>
