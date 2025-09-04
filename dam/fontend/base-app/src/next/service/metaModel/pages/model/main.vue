<template>
  <div></div>
</template>
<script>
export default {
  mounted() {
    this.getDomain()
  },
  components: {

  },
  data() {
    return {

    }
  },
  methods: {
    getDomain() {
      this.$http.post(`/metamodel/getDomain?namespace=&name=`).then(res => {
        console.log(res.data)
      }).catch(e => {
        this.$showFailure(e)
      })
    },
  },
}
</script>
<style lang="scss" scoped>

</style>
