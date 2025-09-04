<template>
  <div></div>
</template>

<script>
export default {
  mounted() {
    this.toProductIndex()
  },
  methods: {
    toProductIndex() {
      let env = window.sessionStorage.getItem('env')
      if (env === 'development') {
        this.$router.push({
          name: 'dataStandard',
        })
      }
    },
  },
}
</script>
