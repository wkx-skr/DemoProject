<template>
  <div id="datablau-logo">
    <img
        :src="imgSrc"
        alt=""
    />
  </div>
</template>
<script>
export default {
  data() {
    return {
      imgSrc: require('@/assets/images/logo/blue_logo.svg')
    }
  }
}
</script>

<style scoped lang="scss">
#datablau-logo {
  position: relative;
  display: inline-block;
  max-height: 50px;
  overflow: hidden;
  line-height: 50px;
  cursor: pointer;

  &.ddc-home {
    background-color: transparent;
  }

  &.white {
    background: #fff;
  }

  &:not(.other).ext {
    width: 60px;

    img {
      position: absolute;
      clip: rect(0, 34px, 55px, 0);

    }
  }

  img {
    display: inline-block;
    align-items: center;
    width: 160px;
    height: auto;
    height: 50px;
  // width: 130px;
    margin: 0 15px;
  }

  &.other {
    img {
      width: auto;
      margin: 0;
    }

    &.ext {
      img {
        width: auto;
        clip: unset;
      }
    }
  }
}
</style>