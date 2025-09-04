<template>
  <div class="grid-icon-clo-outer">
    <span class="clo-icon tree-icon" :class="classStr"></span>
  </div>
</template>

<script>
export default {
  data () {
    return {
      tabComponent: null,
      classStr: '',
      typeProp: ''
    }
  },
  components: {

  },
  computed: {

  },
  mounted () {
    // console.log(this.params, 'this.params')
    this.tabComponent = this.params.tabComponent
    this.typeProp = this.params.typeProp
    let data = this.params.data
    if (this.typeProp) {
      // console.log(data[this.typeProp], 'data[this.typeProp]')
      this.classStr = data[this.typeProp]
    }

    let classStr = this.params.classStr
    if (classStr) {
      this.classStr = this.classStr + ' ' + classStr
    }
  },
  methods: {

  },
  watch: {

  }
}
</script>

<style lang="scss" scpoed>
.grid-icon-clo-outer {
  position: relative;
  display: inline-block;
  // width: 100%;
  height: 100%;
  // width: 16px;
  width: 100%;
  min-width: 26px;
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
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    border: 1px solid transparent;
  }
}

</style>
