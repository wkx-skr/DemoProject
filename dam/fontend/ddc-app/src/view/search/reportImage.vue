<template>
  <div style="height: 100%; overflow: hidden" class="imge-info">
    <!--    <img src="../../assets/images/search/report-default.png" alt="">-->
    <img :src="imgSrc" style="width: 120px; height: 66px" alt="" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      imgSrc: '',
    }
  },
  mounted() {
    let selectedId = this.fileId.split(',')[0]
    this.imgSrc = this.$url + `/service/files/${selectedId}/download`
  },
  props: ['fileId'],
}
</script>

<style scoped></style>
