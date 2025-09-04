<template>
  <div class="title-line">
    <p class="title">{{ titleText }}</p>
    <p class="subtitle" v-if="subtitle">{{ subtitle }}</p>
    <p class="right-buttons">
      <slot></slot>
    </p>
  </div>
</template>

<script>
export default {
  name: 'titleLine',
  props: {
    titleText: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
  },
  data() {
    return {}
  },
  components: {},
  mounted() {},
  methods: {},
  watch: {},
}
</script>

<style scoped lang="scss">
.title-line {
  position: relative;
  height: 47px;
  border-bottom: 1px solid #ddd;

  .title {
    color: #555555;
    font-size: 14px;
    line-height: 46px;
    padding-left: 20px;
  }

  .right-buttons {
    //border: 1px solid red;
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
