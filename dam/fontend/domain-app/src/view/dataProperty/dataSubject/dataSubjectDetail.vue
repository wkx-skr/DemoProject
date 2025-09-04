<template>
  <div class="rightView">
    <div id="dvmenu">
      <el-breadcrumb class="breadCrum" separator=">">
        <el-breadcrumb-item :to="{ path: '/main/dataSubject' }">
          {{ $version.dataSubject.subjectTitle }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>{{ subjectName }}</el-breadcrumb-item>
      </el-breadcrumb>
      <span class="wrapper">
        <el-radio-group v-model="listMode">
          <el-radio-button label="list">
            {{ '列表(' + members.length + ')' }}
          </el-radio-button>
          <el-radio-button label="er">
            {{ $version.dataSubject.subjectDiagram }}
          </el-radio-button>
        </el-radio-group>
      </span>
    </div>
    <div
      id="data-subjectDetail"
      v-loading.body="loadingSubject"
      v-show="isList"
    >
      <el-row>
        <el-col
          :span="4"
          v-for="member in members"
          :key="member.id"
          :offset="0"
        >
          <div @click="onCardClick(member)">
            <el-card :body-style="{ padding: '5px' }">
              <el-row>
                <el-col :span="4" style="margin-top: 4px; margin-right: 2px">
                  <img
                    src="../../../assets/images/icon/table.png"
                    class="image"
                  />
                </el-col>
                <el-col :span="16">
                  <div style="padding: 0px">
                    <div class="title">
                      <span class="bottom clearfix">{{ member.name }}</span>
                    </div>
                    <div class="desc">
                      <span>{{ member.definition }}</span>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </div>
    <div
      id="data-subject-graph"
      v-loading.body="loadingSubject"
      v-show="!isList"
    >
      <img id="subject-image" v-show="hasImage" />
      <div v-show="!hasImage" style="text-align: center; overflow: auto">
        <!--<img src="../../../assets/images/notice.png"></img>-->
        <span>
          <br />
          <h3>关系图尚未发布，请在客户端先在主题域发布ER图</h3>
        </span>
      </div>
    </div>
  </div>
</template>
<script>
import dataSubjectDetail from './dataSubjectDetail.js'
export default dataSubjectDetail
</script>
<style scoped lang="scss">
@import '../../../assets/styles/dataSubjectDetail.scss';
</style>
