<template>
  <div class="grid-icon-clo-outer">
    <span class="clo-icon tree-icon" :class="classStr"></span>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tabComponent: null,
      classStr: '',
      typeProp: '',
    }
  },
  components: {},
  computed: {},
  mounted() {
    // console.log(this.params, 'this.params')
    this.tabComponent = this.params.tabComponent
    this.typeProp = this.params.typeProp
    const data = this.params.data
    if (this.typeProp) {
      // console.log(data[this.typeProp], 'data[this.typeProp]')
      this.classStr = data[this.typeProp]
    }

    const classStr = this.params.classStr
    if (classStr) {
      this.classStr = this.classStr + ' ' + classStr
    }
  },
  methods: {},
  watch: {},
}
</script>

<style lang="scss">
.grid-icon-clo-outer {
  position: relative;
  display: inline-block;
  // width: 100%;
  height: 100%;
  width: 16px;
  // border: 1px solid green;
  .clo-icon {
    display: inline-block;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    // left: 0;
    // top: 0;
    width: 16px;
    height: 16px;
    // border: 1px solid green;
  }
}
</style>
