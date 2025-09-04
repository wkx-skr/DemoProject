<template>
  <div></div>
</template>
<script>
import HTTP from '@/resource/http'
export default {
  data () {
    return {
    }
  },
  mounted () {
    this.$globalData.rateMap = {}
    this.$bus.$on('getRates', this.handleGetRates)
    this.$bus.$on('updateRate', this.updateRate)
  },
  beforeDestroy () {
    this.$bus.$off('getRates')
    this.$bus.$off('updateRate')
  },
  methods: {
    updateRate ({ rate, id }) {
      this.$set(this.$globalData.rateMap, id, rate)
      this.$bus.$emit('updateRateForList')
    },
    handleGetRates (ids) {
      this.getRates(
        ids,
        data => {
          this.$globalData.rateMap = data
        },
        () => {
          this.$bus.$emit('ratesReceived')
        }
      )
    },
    getRates (ids, successCallback, finallyCallback) {
      HTTP.getRates({
        ids: ids,
        successCallback: successCallback,
        finallyCallback: finallyCallback
      })
    }
  }
}
</script>

<style scoped>
</style>
