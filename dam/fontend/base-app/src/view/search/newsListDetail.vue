<template>
  <div :style="style.container">
    <div class="title" @click="showDetail">
      A股今天全线大涨、外资狂买超100亿元 背后不止有中美贸易的重磅消息
    </div>
    <div class="sup">
      <i class="el-icon-view"></i>
      39
      <i class="fa fa-commenting-o"></i>
      10
    </div>
    <div class="description two-line-eclipse">
      今天沪深两市开盘大幅高开，早盘小幅回落之后，重新掀起上攻态势，午后汽车零部件概念股集体爆发，三大股指全天维持高位震荡，上证综指再度站上60日均线，两市成交量较前一个交易日大幅放量。截至收盘：上证综指收盘报2654.80点，涨幅2.57%，成交额1878.32亿元；深证成指收盘报7938.47点，涨幅3.34%，成交额2372.27亿元；创业板指数收盘报1372.79点，涨幅3.26%，成交额695.57亿元。
    </div>
    <div class="icon"></div>
  </div>
</template>

<script>
export default {
  name: 'listDetail',
  data() {
    const { blue, greyBorder } = this.$style
    return {
      style: {
        container: {
          height: '120px',
          borderBottom: greyBorder,
          position: 'relative',
          padding: '13px 20px 0 60px',
        },
      },
    }
  },
  methods: {
    showDetail() {
      this.$bus.$emit('showNewsDetail')
    },
  },
}
</script>

<style scoped lang="scss">
$grey-font: #6d6d6d;
$blue: #4278c9;
.checkbox {
  position: absolute;
  left: 12px;
  top: 12px;
}
.title {
  font-size: 14px;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  font-weight: bold;
  display: inline-block;
  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
}
.sup {
  float: right;
  margin: 3px 0;
  color: $blue;
  i {
    color: initial;
    font-size: 14px;
    margin-left: 0.8em;
    margin-right: 0.1em;
  }
}
.description {
  color: $grey-font;
  line-height: 2em;
  margin-bottom: 1em;
}
.icon {
  background: url('../../assets/images/icon/news.png') no-repeat;
  position: absolute;
  top: 20px;
  left: 20px;
  width: 24px;
  height: 30px;
}
</style>
