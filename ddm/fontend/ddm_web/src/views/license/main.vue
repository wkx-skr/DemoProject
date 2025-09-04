<template>
  <iframe id="FF" :src="url" frameborder="0" width="100%" height="100%" style="position:absolute;top:0;left:0;right:0;bottom:0;"></iframe>
</template>

<script>
export default {
  mounted () {
    document.getElementById('FF').onload = () => {
      document.getElementById('FF').contentWindow.document.getElementsByClassName('center-box')[0].style = 'width: 100%;height:100%;margin: 0;'
      document.getElementById('FF').contentWindow.document.getElementsByClassName('box-card')[0].style = 'margin: 0;'
    }
  },
  data () {
    return {
      url: this.$licenseServerUrl
    }
  }
}
</script>

<style scoped>

</style>
