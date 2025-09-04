<template>
  <div id="data-subject">
    <div class="subject-title" id="dvmenu">
      <!--<el-breadcrumb class="breadCrum" separator=">">
        <el-breadcrumb-item :to="{ path: '/main/dataProperty/dataSubject'}">{{$version.dataSubject.subjectTitle}}(共{{subjectAreas.length}}个)</el-breadcrumb-item>
      </el-breadcrumb>-->
      <div class="text main">
        {{ $version.dataSubject.subjectTitle }}
      </div>
      <div class="text vice">(共{{ subjectAreas.length }}个)</div>
      <span class="wrapper">
        <el-button
          type="primary"
          size="small"
          icon="time"
          @click="onRefreshClick"
        >
          {{ $version.dataSubject.refresh }}
        </el-button>
      </span>
    </div>

    <div class="function-bar"></div>

    <div class="subject-list" v-show="showList" v-loading="loadingSubject">
      <div
        class="item"
        v-for="subject in subjectAreas"
        :key="subject.subjectId"
        @click="onCardClick(subject)"
      >
        <el-card>
          <div class="image icon-ic-left-standard"></div>
          <div class="text">
            <div class="title">
              <span class="bottom clearfix">{{ subject.name }}</span>
            </div>
            <div class="desc">
              <span>{{ subject.definition }}</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>
<script>
import dataSubject from './dataSubject.js'
export default dataSubject
</script>
<style scoped lang="scss">
/*@import '../../assets/styles/dataSubject.scss'*/
@import './dataSubject.scss';
</style>
