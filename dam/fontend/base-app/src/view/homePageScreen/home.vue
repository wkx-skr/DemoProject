<template>
  <div class="embedded-module-home">
    <div class="left-part">
      <topone :catalog-data="catalogData" :theme="theme"></topone>
      <system :catalog-data="catalogData" :theme="theme"></system>
    </div>
    <div class="middle-part">
      <card :con-list="conList" :theme="theme"></card>
      <doman :catalog-data="catalogData" :theme="theme"></doman>
    </div>
    <div class="right-part">
      <top-tow :catalog-data="catalogData" :theme="theme"></top-tow>
      <div style="flex-grow: 1; height: 60%">
        <p class="titles" style="background: #1d1d1d">
          <i></i>
          数据标准概况
        </p>
        <div id="scrollBox" style="overflow: auto">
          <biao :domainData="domainData" :theme="theme"></biao>
          <zhi :domainData="domainData" :theme="theme"></zhi>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import topone from './top1'
import topTow from './toptwo'
import biao from './biaocoumt'
import zhi from './zhicoumt'
import card from './card'
import system from './system'
import doman from './doman'
export default {
  components: {
    topone,
    topTow,
    biao,
    zhi,
    card,
    system,
    doman,
  },
  data() {
    return {
      dataLoadedCount: 0,
      catalogData: [],
      domainData: [],
      conList: {},
      // pocUrl: '/poc',
      theme: 'dark',
      // theme: 'default',
    }
  },
  mounted() {
    this.dataInit()
    this.getList()
    this.getHome()
  },
  beforeDestroy() {
    $(window).unbind('resize', this.resetStyle)
  },
  props: ['indexClick', 'standardClick'],
  methods: {
    dataInit() {
      // this.handleHeight()
      this.resetStyle()
      $(window).resize(this.resetStyle)
    },
    resetStyle() {
      let $leftPart = $('.embedded-module-home .left-part')
      let $middlePart = $('.embedded-module-home .middle-part')
      let $rightPart = $('.embedded-module-home .right-part')
      let $parentWidth = $('.embedded-module-home').width()
      let midWidth =
        $parentWidth - ($leftPart.width() + $rightPart.width()) - 20
      $middlePart.css('maxWidth', midWidth)
      let docHeight = $(document).height()

      this.$nextTick(() => {
        if (!$('#scrollBox')) return
        let boxTop = $('#scrollBox').offset().top
        $('#scrollBox').css('height', docHeight - boxTop)
      })
    },
    getHome() {
      // top1 toptwo catalogData-系统
      this.$http.get(this.$url + '/service/dashboard/catalog').then(res => {
        // localStorage.setItem('catalog', JSON.stringify(res.data))
        this.catalogData = res.data
        /// this.dataLoadedCount++

        // this.$bus.$emit('embeddedDataLoaded11',res.data)
        // this.dataLoadedTest()
      })
      // biaocoumt zhicoumt 数据标准概况
      this.$http
        .get(this.$url + '/service/dashboard/domain/count/usage')
        .then(res => {
          // localStorage.setItem('domains', JSON.stringify(res.data))
          this.domainData = res.data
          // this.dataLoadedCount++
          // this.dataLoadedTest()
        })
    },
    getList() {
      this.$http
        .get(this.$url + '/service/dashboard/itdepartmentsysteminfo')
        .then(res => {
          let data = res.data
          localStorage.setItem('echarsList', JSON.stringify(data))
          // this.dataLoadedCount++
          // this.dataLoadedTest()
        })
        .catch(e => {
          this.$showFailure(e)
        })
      this.$http
        .get(this.$url + '/service/dashboard/main')
        .then(res => {
          let json = res.data
          if (json.columnWithAlias != 0 && json.columnCnt1 != 0) {
            json.biaocnt = json.columnWithAlias / json.columnCnt1
          } else {
            json.biaocnt = 0
          }
          // localStorage.setItem('conList', JSON.stringify(json))
          this.conList = json
          // this.dataLoadedCount++
          // this.dataLoadedTest()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    //
    dataLoadedTest() {
      if (this.dataLoadedCount >= 4) {
        // this.$bus.$emit('embeddedDataLoaded')
      }
    },
  },
}
</script>
<style lang="scss" scoped>
@import './theme/dark.sass';
//@import './theme/default.sass';

@function px2Rem($px, $base-font-size: 16px) {
  @if (unitless($px)) {
    //有无单位
    @return ($px / 19.2) * 1rem;
  } @else if (unit($px) == em) {
    @return $px;
  }
  @return ($px / $base-font-size) * 1rem;
}
.embedded-module-home {
  background: $bg-color;
  box-sizing: border-box;
  padding: 10px;
  height: 100%;
  min-width: 1400px;
  display: flex;
  justify-content: space-between;
  .left-part {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    width: 25.5%;
    height: 100%;
    overflow: hidden;
  }
  .middle-part {
    flex-shrink: 0;
    width: 41%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .right-part {
    flex-shrink: 0;
    width: 32%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}
</style>
