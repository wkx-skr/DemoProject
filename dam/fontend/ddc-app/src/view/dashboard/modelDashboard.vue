<template>
  <div class="page-container">
    <el-card class="card" v-for="data in rawData" :key="data.id">
      <div class="title oneline-eclipse">
        {{ data.name }}
      </div>
      <div class="sub-title">
        <span class="oneline-eclipse">{{ data.creator }}</span>
        <!--<i class="el-icon-question"></i>-->
      </div>
      <div class="complete" :class="{ true: isComplete[n - 1] }">
        <div class="inner">
          <i v-if="isComplete[n - 1]" class="el-icon-check"></i>
          <span v-else>{{ complete[n - 1] }}</span>
        </div>
      </div>
      <div class="row">
        <div class="mail-to-group" v-if="false">
          <div class="mail-to">
            <div class="graph"></div>
            <div class="name oneline-eclipse">John D</div>
          </div>
          <!--<div class="mail-to">
						<div class="graph">

						</div>
						<div class="name oneline-eclipse">
							John D
						</div>
					</div>-->
          <div class="mail-to view-all">
            <div class="graph">
              <i class="el-icon-more"></i>
            </div>
            <div class="name oneline-eclipse">View All</div>
          </div>
        </div>
        <div class="time">Last Modified: 03.01.17</div>
      </div>

      <!--<div class="schedule">
				<div class="s-title">Customer Controls</div>
				<div class="s-cal">30 of 84</div>
				<el-progress :text-inside="true" :stroke-width="18" :percentage="50"></el-progress>
			</div>
			<div class="schedule">
				<div class="s-title">Customer Controls</div>
				<div class="s-cal">30 of 84</div>
				<el-progress :text-inside="true" :stroke-width="18" :percentage="80" status="success"></el-progress>
			</div>-->
    </el-card>
  </div>
</template>

<script>
import modelDashboard from './modelDashboard.js'
export default modelDashboard
</script>

<style scoped="scoped" lang="scss">
@import './modelDashboard.scss';
</style>
<style lang="scss">
.el-progress__text i {
  font-size: 18px;
}
</style>
