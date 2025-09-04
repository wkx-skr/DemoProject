<template>
  <div
    class="img-icon-outer"
    :class="{ xx: dataTypeComputed }"
    :style="{ height: `${size}px`, width: `${size}px` }"
    :test-name="testName"
  >
    <i
      class="bgc-icon-outer"
      :style="{ 'background-image': `url(${imgUrl})` }"
    ></i>
  </div>
</template>

<script>
export default {
  name: 'DatablauIcon',
  props: {
    testName: String,
    dataType: {
      type: String,
      default: '',
    },
    iconType: {
      default: 'svg',
      type: String,
    },
    url: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 32,
    },
  },
  data() {
    return {
      imgUrl: undefined,
    }
  },
  beforeMount() {
    if (this.url) {
      const rex = /(\/static)/g
      if (rex.test(this.url)) {
        this.imgUrl = this.url
      } else {
        let res = this.url.slice(this.url.indexOf('assets/') + 7)
        this.imgUrl = require(`@/assets/${res}`)
      }
    } else {
      if (this.dataTypeComputed) {
        this.imgUrl = require(`@/assets/images/search/${this.dataTypeComputed}.${this.iconType}`)
      }
    }
  },
  computed: {
    dataTypeComputed() {
      const dataType = this.dataType.toLowerCase()
      let result = ''
      if (!dataType) return
      switch (dataType) {
        case 'stored_procedure':
        case 'storedprocedure':
        case 'StoredProcedure':
        case 'Storedrocedure':
          result = 'storedProcedure'
          break
        case 'share_file':
        case 'file':
        case 'exe':
        case 'jar':
        case 'lic':
        case 'icon':
          result = 'file'
          break
        case 'domain':
          result = 'datastandard'
          break
        case 'infoitems':
          result = 'infoitems'
          break
        case 'domain_code':
          result = 'index'
          break
        case 'service':
          result = 'service'
          break
        case 'xlsx':
          result = 'excel'
          break
        case 'jpg':
          result = 'picture'
          break
        case 'mp3':
          result = 'music'
          break
        // case 'dims':
        //   return 'icon-zhibiao'
        default:
          result = dataType
          break
      }
      this.imgUrl = require(`@/assets/images/search/${result}.${this.iconType}`)
      return result
    },
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
