<template>
  <div :style="style.box">
    <div :style="style.innerBox">
      <img :src="imgSrc" style="width: 126px" alt="no-data" />
      <div
        style="
          color: #555;
          margin-top: 20px;
          margin-bottom: 20px;
          font-size: 14px;
        "
      >
        暂无用户组，请创建
      </div>
      <datablau-button
        type="primary"
        @click="createCategory"
        style=" 
          padding: 0 20px;
          font-size: 14px;
        "
      >
        创建用户组
      </datablau-button>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      style: {
        box: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#FFF',
          zIndex: 12001,
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
  methods: {
    createCategory() {
      this.$emit('create-user-group')
    },
  },
}
</script>
<style></style>
