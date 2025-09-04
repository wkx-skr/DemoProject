<template>
  <div :style="style.box" v-show="ready">
    <div :style="style.innerBox">
      <img :src="imgSrc" style="width: 126px; height: 99.46px" alt="no-data" />
      <div
        style="
          color: #555;
          margin-top: 39px;
          margin-bottom: 20px;
          font-size: 16px;
        "
      >
        {{ $t('component.table.noData') }}
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      ready: false,
      style: {
        box: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#FFF',
          zIndex: 10,
        },
        innerBox: {
          // margin: '0 auto',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-112px, -116px)',
          textAlign: 'center',
        },
      },
      imgSrc: require('./no-result.svg'),
    }
  },
  mounted() {
    setTimeout(() => {
      this.ready = true
    })
  },
}
</script>
<style></style>
