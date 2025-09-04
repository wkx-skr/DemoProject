<template>
  <div :style="style.box">
    <div :style="style.innerBox">
      <img :src="imgSrc" style="width: 126px" alt="no-data" />
      <div
        style="
          color: #555;
          margin-top: 39px;
          margin-bottom: 20px;
          font-size: 16px;
        "
      >
        {{ $t('indicator.definition.noData') }}
      </div>
      <datablau-button
        type="primary"
        @click="createCategory"
        style="
          height: 50px;
          line-height: 48px;
          padding: 0 46px;
          font-size: 18px;
        "
      >
        {{ $t('indicator.definition.newCategory') }}
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
  methods: {
    createCategory() {
      this.$emit('create-category')
    },
  },
}
</script>
<style></style>
