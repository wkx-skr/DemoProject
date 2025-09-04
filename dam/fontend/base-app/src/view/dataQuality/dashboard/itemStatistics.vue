<template>
  <div class="box" @click="goPreview">
    <div class="inner-box">
      <div class="box-label">
        {{ title }}
      </div>
      <div class="num">{{ typeof number === 'number' ? number : total }}</div>
      <div class="bar">
        <span
          v-for="bar in bars"
          class="bar-item"
          :class="bar.color"
          :style="{ width: bar.rate }"
        ></span>
      </div>
      <div class="figures">
        <span v-for="(d, index) in data" class="figure">
          <span class="dot" :class="bars[index].color"></span>
          <span class="label">{{ d.name }} {{ d.count }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardMore from '@/view/dashboard5.5/commonDashboardComponent/dashboardMore'
export default {
  components: {
    DashboardMore,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    number: {
      required: false,
      type: Number,
    },
    data: {
      type: Array,
      required: true,
    },
    routerName: {
      type: String,
    },
    from: {
      type: String,
    },
  },
  beforeMount() {
    this.getTotal()
    this.getBars()
  },
  data() {
    return {
      total: '',
      bars: [],
      figures: [],
    }
  },
  methods: {
    goPreview() {
      this.$router.push({ name: this.routerName })
    },
    getTotal() {
      let total = 0
      this.data.forEach(item => {
        total += item.count
      })
      this.total = total
    },
    getBars() {
      const bars = []
      this.data.forEach(item => {
        let color
        switch (item.color) {
          case 1:
            color = 'blue'
            break
          case 2:
            color = 'green'
            break
          default:
            color = 'grey'
            break
        }
        bars.push({
          color: color,
          rate: Math.floor((item.count * 100) / this.total) + '%',
        })
      })
      this.bars = bars
    },
  },
}
</script>

<style scoped lang="scss">
.box {
  background: var(--default-bgc);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
  border-radius: 3px;
  &:hover {
    cursor: pointer;
    box-shadow: 0 0 6px #bbbec2;
  }
}
.inner-box {
  position: relative;
  min-width: 160px;
  height: 100%;
}
.box-label {
  position: absolute;
  left: 10px;
  top: 16px;
  font-size: 15px;
}
.num {
  position: absolute;
  right: 10px;
  top: 10px;
  font-size: 24px;
}
.bar {
  position: absolute;
  height: 12px;
  left: 10px;
  right: 10px;
  top: 55px;
}
.bar-item {
  display: inline-block;
  height: 100%;
  &:first-child {
    border-radius: 3px 0 0 3px;
  }
  &:last-child {
    border-radius: 0 3px 3px 0;
  }
}
.figures {
  position: absolute;
  bottom: 14px;
  left: 10px;
  right: 0;
}
.figure {
  margin-right: 1em;
  .dot {
    $size: 8px;
    width: $size;
    height: $size;
    display: inline-block;
    border-radius: 2px;
    vertical-align: middle;
    position: relative;
    top: -1px;
    line-height: 16px;
  }
  .label {
    font-size: 12px;
    color: #9096a3;
    display: inline;
  }
}
.blue {
  background-color: #4386f5;
}
.green {
  background-color: #a4f2ef;
}
.grey {
  background-color: #e0e0e0;
}
</style>
