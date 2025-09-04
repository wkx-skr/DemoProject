<template>
  <div
    class="img-icon-outer"
    :style="{ height: `${sizeComputed}px`, width: `${sizeComputed}px` }"
  >
    <!-- <img :src="imgUrl" class="img-icon"> -->
    <!-- <i
      :class="['iconfont', dataTypeComputed]"
      style="font-size: 40px"
      v-if="isIcon"
    ></i> -->
    <i
      class="bgc-icon-outer"
      :style="{ 'background-image': `url(${imgUrl})` }"
    ></i>
  </div>
</template>

<script>
export default {
  name: 'Icon',
  props: {
    dataType: {
      default: '',
    },
    iconType: {
      default: 'svg',
      type: String,
    },
    size: {},
    isIcon: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      imgUrl: undefined,
    }
  },
  beforeMount() {
    if (this.dataTypeComputed === 'file') {
      this.imgUrl = require(`../../assets/images/search/${this.dataTypeComputed}.png`)
    } else {
      this.imgUrl = require(`../../assets/images/search/${this.dataTypeComputed}.${this.iconType}`)
    }
  },
  computed: {
    dataTypeComputed() {
      const dataType = this.dataType.toLowerCase()
      switch (dataType) {
        case 'stored_procedure':
          return 'storedProcedure'
        case 'storedprocedure':
          return 'storedProcedure'
        case 'share_file':
        case 'file':
          return 'file'
        case 'domain2':
          return 'domain2'
        case 'domain':
          return 'domain2'
        case 'xlsx':
          return 'excel'
        default:
          // console.log(dataType)
          return dataType
      }
    },
    sizeComputed() {
      if (this.size) {
        return this.size
      } else {
        return 32
      }
    },
    // @deprecated
    /* colorComputed(){
        if(this.color){
          return  this.color;
        }else{
          let dataType = this.dataType.toLowerCase();
          switch(dataType){
              case 'table':
                return '#7ecce0';
              case 'view':
                return '#bda5fc';
              case 'column':
                return '#8798b0';
              case 'index':
                return '#f7c2a4';
              case 'report':
                return '#9db6e0';
              case 'function':
                return '#a9c6d5';
              case 'domain':
                return '#b0d8c8';
              case 'stored_procedure':
                return '#5c88c6';
            default:
              return '#999';
          }
        }
      } */
  },
}
</script>

<style lang="scss" scoped>
.img-icon-outer {
  display: inline-block;
  // vertical-align: middle;
  // vertical-align: bottom;
  // vertical-align: top;
  text-align: left;
  // border: 1px solid green;
  .iconfont {
    vertical-align: middle;
    line-height: 42px;
  }
  position: relative;
  .img-icon {
    // border: 1px solid red;
    width: 100%;
    height: 100%;
    vertical-align: top;
    display: none;
  }
  .bgc-icon-outer {
    // border: 1px solid red;
    display: inline-block;
    width: 100%;
    height: 100%;
    // vertical-align: top;
    position: absolute;
    top: 0;
    left: 0;
    background: no-repeat center/contain;
  }
}
</style>
