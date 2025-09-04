<template>
  <div class="box">
    <div class="inner-box">
      <div class="problem-cnt">
        <span class="label">
          {{ $t('quality.page.dataQualityDashboard.problemStatistics') }}
        </span>
        <span class="num" v-if="data.allQualityCount < 10000">
          {{ data.allQualityCount }}
        </span>
        <span class="num" v-else-if="data.allQualityCount">
          {{ Math.round(data.allQualityCount / 1000) }}
          <span class="tail">k</span>
        </span>
      </div>
      <div class="detail-cnt">
        <!-- <div class="label">重点问题</div>
        <div class="num">{{data.allQualityImportantCount}}</div>-->
        <div class="label">
          {{ $t('quality.page.dataQualityDashboard.increment') }}
        </div>
        <div class="num">{{ data.incrMonthCount }}</div>
      </div>
    </div>
  </div>
</template>
<script>
import DashboardMore from '@/view/dashboard5.5/commonDashboardComponent/dashboardMore'
export default {
  name: 'problemStatistics',
  components: {
    DashboardMore,
  },
  props: {
    // data: {
    //   required: true,
    //   type: Object
    // },
    rootData: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      data: this.rootData.allQualityCount,
    }
  },
}
</script>

<style scoped lang="scss">
.box {
  position: absolute;
  /*<!--top:-5px;left:0;right:-5px;bottom:-5px;-->*/
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
  border-radius: 4px;
  background-image: linear-gradient(to right, #5090fd, #564ef8);
  color: #fff;
}
.inner-box {
  min-width: 180px;
  position: relative;
}
.problem-cnt {
  position: absolute;
  left: 20px;
  top: 24px;
  .label {
    font-size: 15px;
  }
  .num {
    margin-top: 6px;
    margin-left: -2px;
    display: block;
    font-size: 38px;
  }
  .tail {
    font-size: 18px;
    margin-left: 0.3em;
  }
}
.detail-cnt {
  position: absolute;
  left: 55%;
  top: 40px;
  .label {
    font-size: 12px;
    color: #bcc6fc;
  }
  .num {
    font-size: 20px;
    margin-bottom: 12px;
    margin-top: 3px;
  }
}
</style>
