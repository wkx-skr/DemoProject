<template>
  <div class="unfold">
    <i
      v-if="!isFold"
      class="foldBtn icons el-icon-d-arrow-right"
      @click="fold"
    ></i>
    <i v-else class="foldBtn icons el-icon-d-arrow-left" @click="fold"></i>
  </div>
</template>
<script>
export default {
  data() {
    return {
      isFold: false,
    }
  },
  mounted() {},
  methods: {
    fold() {
      this.isFold = !this.isFold
      this.$emit('fold', this.isFold)
    },
  },
}
</script>
<style lang="scss" scoped>
.unfold {
  box-sizing: border-box;
  width: 20px;
  height: 200px;
  position: absolute;
  bottom: 40px;
  right: 18px;
  &:hover .foldBtn {
    display: block;
  }
  .foldBtn {
    margin-top: 100px;
    display: none;
    cursor: pointer;
  }
}
</style>
