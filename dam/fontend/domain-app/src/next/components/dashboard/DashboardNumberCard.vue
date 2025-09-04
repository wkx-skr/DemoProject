<template>
  <div class="outer">
    <div class="base"></div>
    <div class="label oneline-eclipse">{{ label }}</div>
    <div class="right-part">
      <span class="value">{{ generatedValue }}</span>
      <span class="unit">{{ unit }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardNumberCard',
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number],
      required: true,
    },
  },
  computed: {
    rawValue() {
      let rawValue = ''
      if (typeof this.value === 'number') {
        rawValue = this.value
      } else if (typeof this.value === 'string') {
        rawValue = Number.parseInt(this.value)
      }
      return rawValue
    },
    generatedValue() {
      const rawValue = this.rawValue
      if (rawValue < 10000) {
        return rawValue
      } else if (rawValue < 1e7) {
        return Math.round(rawValue / 1000)
      } else if (rawValue < 1e10) {
        return Math.round(rawValue / 1e6)
      } else if (rawValue < 1e13) {
        return Math.round(rawValue / 1e9)
      } else if (rawValue < 1e16) {
        return Math.round(rawValue / 1e12)
      }
    },
    unit() {
      const rawValue = this.rawValue
      if (rawValue < 10000) {
        return ''
      } else if (rawValue < 1e7) {
        return 'K'
      } else if (rawValue < 1e10) {
        return 'M'
      } else if (rawValue < 1e13) {
        return 'G'
      } else if (rawValue < 1e16) {
        return 'T'
      }
    },
  },
}
</script>

<style scoped lang="scss">
.outer {
  position: relative;
}
.base {
  height: 100%;
  display: inline-block;
  vertical-align: middle;
}
.label {
  color: #7d8493;
  font-size: 14px;
  padding-left: 16px;
  display: inline-block;
  vertical-align: middle;
  width: 55%;
}
.value {
  font-size: 34px;
  color: #232e43;
}
.right-part {
  padding-right: 25px;
  display: inline-block;
  width: 45%;
  vertical-align: middle;
  text-align: right;
}
.unit {
  font-size: 16px;
  color: #232e43;
}
</style>
