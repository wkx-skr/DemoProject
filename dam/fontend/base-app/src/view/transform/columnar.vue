<template>
  <div style="padding: 0 0 2px 0">
    <div class="container">
      <div
        v-for="col in columns"
        :style="{ height: col.height + '%', width: col.width + '%' }"
        class="column"
      >
        <el-tooltip
          :content="tooltipFormatter(col)"
          effect="light"
          :open-delay="100"
          placement="top"
        >
          <div></div>
        </el-tooltip>
      </div>
    </div>
    <div class="row-cnt">
      <span>{{ cntMsg }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'columnar',
  props: ['data'],
  mounted() {
    this.countData()
  },
  data() {
    return {
      columns: [],
      cntMsg: '',
      isDate: false,
      isInt: false,

      keyTransform: false,
      min: null,
      max: null,
    }
  },
  methods: {
    tooltipFormatter(col) {
      if (this.keyTransform) {
        let result = ''
        const per = (this.max - this.min) / 36
        const from = this.min + per * col.value
        const to = from + per
        result += from + ' to ' + to
        if (this.isDate) {
          return this.$timeFormatter(from) + ' to ' + this.$timeFormatter(to)
        } else if (this.isInt) {
          return (
            this.intFormatter(Math.ceil(from)) +
            ' to ' +
            this.intFormatter(Math.floor(to))
          )
        } else {
          return this.doubleFormatter(from) + ' to ' + this.doubleFormatter(to)
        }
        return result
      } else {
        return String(col.value)
      }
    },
    countData() {
      this.columns = []
      switch (this.data.col.logicalType) {
        case 'String': {
          this.countTypeString()
          break
        }
        case 'Integer':
        case 'BigInteger':
          this.isInt = true
          this.countTypeNumber(true)
          break
        case 'Decimal':
        case 'double':
          this.countTypeNumber(false)
          break
        case 'Date':
        case 'Time':
        case 'Timestamp':
          this.isDate = true
          this.countTypeNumber()
          break
        case 'Boolean': {
          this.countTypeString()
          break
        }
        case 'Binary':
          break
        default: {
        }
      }
    },
    numberKeyFormatter(cntMap, min, max) {
      for (let i = 0; i < 36; i++) {
        cntMap.set(i, 0)
      }
    },
    numberKeyReverseFormatter(value, min, max) {
      const span = (max - min) / 36
      const key = Math.floor((value - min) / span)
      if (key === 36) {
        return 35
      } else {
        return key
      }
    },
    dateFormatter(value) {
      return this.$timeFormatter(value).slice(0, 10)
    },
    intFormatter(value) {
      if (value > 1e12) {
        return (value / 1e12).toFixed(2) + 'T'
      } else if (value > 1e9) {
        return (value / 1e9).toFixed(2) + 'G'
      } else if (value > 1e6) {
        return (value / 1e6).toFixed(2) + 'M'
      } /* else if(value > 1e3) {
          return value/1e3 + 'K';
        } */ else {
        return value
      }
    },
    doubleFormatter(value) {
      if (value > 100000) {
        return value.toExponential(2)
      } else if (value < 0.1) {
        return value.toExponential(2)
      } else {
        return value.toFixed(2)
      }
    },
    countTypeNumber(isInt) {
      const data = this.data.data
      const max = Math.max.apply(this, data)
      const min = Math.min.apply(this, data)
      let length = max - min + 1
      if (this.isDate) {
        this.cntMsg = this.dateFormatter(min) + ' - ' + this.dateFormatter(max)
      } else if (isInt) {
        this.cntMsg = this.intFormatter(min) + ' - ' + this.intFormatter(max)
      } else {
        this.cntMsg =
          this.doubleFormatter(min) + ' - ' + this.doubleFormatter(max)
      }

      const cntMap = new Map()
      if (isInt && max - min < 36) {
        for (let i = min; i <= max; i++) {
          cntMap.set(i, 0)
        }
        data.forEach(item => {
          cntMap.set(item, cntMap.get(item) + 1)
        })
      } else {
        length = 36
        this.keyTransform = true
        this.min = min
        this.max = max
        this.numberKeyFormatter(cntMap, min, max)
        data.forEach(item => {
          const key = this.numberKeyReverseFormatter(item, min, max)
          cntMap.set(key, cntMap.get(key) + 1)
        })
      }
      const cntArray = []
      let maxValue = 0
      cntMap.forEach(function (value, key, map) {
        cntArray.push({
          value: value,
          key: key,
        })
        if (maxValue < value) {
          maxValue = value
        }
      })

      cntArray.forEach(item => {
        const column = {
          value: item.key,
          height: 100 * (item.value / maxValue),
          width: 100 / length,
        }
        if (column.height < 1 && column.height > 0) {
          column.height = 1
        }
        this.columns.push(column)
      })
    },
    countTypeString() {
      const cntMap = new Map()
      this.data.data.forEach(item => {
        if (!cntMap.has(item)) {
          cntMap.set(item, 1)
        } else {
          cntMap.set(item, cntMap.get(item) + 1)
        }
      })
      const cntArray = []
      cntMap.forEach(function (value, key, map) {
        cntArray.push({
          value: value,
          key: key,
        })
      })
      cntArray.sort((a, b) => {
        return b.value - a.value
      })
      const max = cntArray[0].value
      let length = cntArray.length
      this.cntMsg = length + ' Categories'
      if (length === 100) {
        this.cntMsg = 'More than ' + length + ' Categories'
      }
      if (length > 40) {
        length = 40
      }

      cntArray.forEach(item => {
        const column = {
          value: item.key,
          height: 100 * (item.value / max),
          width: 100 / length,
        }
        if (column.height < 1 && column.height > 0) {
          column.height = 1
        }
        this.columns.push(column)
      })
      this.columns = this.columns.slice(0, 40)
    },
  },
}
</script>

<style scoped lang="scss">
.column {
  margin-top: 2px;
  padding: 0;
  max-width: 20px;
  display: inline-block;
  div {
    display: block;
    padding: 0;
    height: 100%;
    background: #4eb6ac;
    margin-right: 1px;
    &:hover {
      background: lightskyblue;
    }
  }
}
.container {
  padding: 0 2px 2px 3px;
  height: 60px;
  display: block;
  text-align: center;
}
.row-cnt {
  height: 20px;
  line-height: 20px;
  font-size: 12px;
  font-weight: normal;
  display: block;
}
</style>
