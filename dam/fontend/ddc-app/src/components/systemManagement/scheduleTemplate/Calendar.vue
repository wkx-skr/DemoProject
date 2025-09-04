<template>
  <div class="item">
    <div class="title">
      {{ $t('system.systemSetting.yearMonth', { year: year, month: month }) }}
    </div>
    <div class="dates-header">
      <span class="out">{{ $t('el.datepicker.weeks.mon') }}</span>
      <span class="out">{{ $t('el.datepicker.weeks.tue') }}</span>
      <span class="out">{{ $t('el.datepicker.weeks.wed') }}</span>
      <span class="out">{{ $t('el.datepicker.weeks.thu') }}</span>
      <span class="out">{{ $t('el.datepicker.weeks.fri') }}</span>
      <span class="out">{{ $t('el.datepicker.weeks.sat') }}</span>
      <span class="out">{{ $t('el.datepicker.weeks.sun') }}</span>
    </div>
    <div class="dates-values" v-if="ready">
      <span class="out" v-for="i in spaceBefore" :key="'s' + i"></span>
      <span
        v-for="i in days"
        :key="i"
        class="out"
        :class="{ checked: checked[i] }"
        @click="setChecked(i)"
      >
        <span class="in">{{ i }}</span>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    year: Number,
    month: Number,
    dates: Array,
  },
  data() {
    return {
      spaceBefore: 0, // 1号之前的空格数量
      days: 0, // 本月天数
      checked: {},
      ready: false,
    }
  },
  mounted() {
    this.initCalendar()
  },
  methods: {
    initCalendar() {
      this.ready = false
      const date = new Date(this.year, this.month - 1)
      const day = date.getDay()
      this.spaceBefore = day === 0 ? 6 : day - 1
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1)
      const lastDay = new Date(nextMonth.getTime() - 24 * 60 * 60 * 1000)
      this.days = lastDay.getDate()
      for (let i = 1; i <= 31; i++) {
        this.checked[i] = false
      }
      this.dates.forEach(date => {
        let d = new Date(date)
        if (d.getFullYear() === this.year && d.getMonth() === this.month - 1) {
          this.checked[d.getDate()] = true
        }
      })
      this.ready = true
    },
    setChecked(idx) {
      this.ready = false
      this.checked[idx] = !this.checked[idx]
      this.updateDates(idx, this.checked[idx])
      this.ready = true
    },
    updateDates(day, mode) {
      let result = {
        day: /*day < 10 ? '0' + day : */String(day),
        month: /*this.month < 10 ? '0' + String(this.month) : */String(this.month),
        year: String(this.year),
      }
      this.$emit('update-dates', {
        mode: mode,
        str: result.year + '-' + result.month + '-' + result.day,
      })
    },
  },
  watch: {
    year() {
      this.initCalendar()
    },
    dates() {
      this.initCalendar()
    },
  },
}
</script>

<style scoped lang="scss">
@import './src/next/components/basic/color';
.item {
  width: 15%;
  @media only screen and (max-width: 1600px) {
    width: 24%;
  }
  height: 203px;
  margin-left: 10px;
  margin-bottom: 10px;
  display: inline-block;
  border: 1px solid $border-color;
  border-radius: 4px;
  vertical-align: top;
}
.title {
  text-align: center;
  margin-top: 3px;
}
.in {
  display: inline-block;
}
.dates-header,
.dates-values {
  .out {
    display: inline-block;
    text-align: center;
    width: 14%;
    line-height: 2em;
    position: relative;
  }
}
.dates-header {
  margin-top: 10px;
}
.dates-values {
  .in {
    cursor: pointer;
    width: 62%;
    height: 20px;
    line-height: 20px;
  }
  .out.checked span.in {
    background-color: $primary-color;
    color: #fff;
    border-radius: 6px;
  }
}
</style>
