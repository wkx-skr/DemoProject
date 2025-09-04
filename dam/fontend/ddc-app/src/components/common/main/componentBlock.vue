<template>
  <div class="box" @mouseleave="hover = false" @mouseover="hover = true">
    <div class="box-bg"></div>
    <div class="box-content">
      <img :src="bg" alt="" />
      <div class="label">{{ $t('common.page.' + dataValue) }}</div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    dataValue: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      bg: null,
      bg1: null,
      hover: false,
    }
  },
  beforeMount() {
    let fileNameMap = {
      数据标准: 'domain',
      元数据: 'meta',
      数据质量: 'quality',
      指标管理: 'index',
      数据识别: 'recognize',
      数据安全: 'security',
      数据服务: 'service',
      统一查询: 'search',
    }
    const fileNameFormatter = dataValue => {
      if (fileNameMap.hasOwnProperty(dataValue)) {
        return fileNameMap[dataValue]
      } else {
        return dataValue
      }
    }
    try {
      this.bg = require(`./images/${fileNameFormatter(this.dataValue)}.png`)
    } catch (e) {
      console.log(e)
    }
  },
  mounted() {},
  methods: {},
  computed: {},
  watch: {},
}
</script>
<style lang="scss" scoped>
$primary-color: #409eff;
.box {
  cursor: pointer;
  text-align: center;
  background-color: #f9f9fd;
  &:hover {
    .box-bg {
      opacity: 0.2;
    }
    .label {
      // color: #fff;
    }
  }
  .label {
    transition: color ease-in-out 0.3s;
  }
  position: relative;
}
.box-bg {
  background: linear-gradient(#4386f5, #78a9fa);
  background: $primary-color;
  border-radius: inherit;
  opacity: 0.06;
  transition: opacity ease-in-out 0.3s;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.box-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  .label {
    position: absolute;
    top: 55px;
    left: 0;
    right: 0;
    text-align: center;
    color: #555555;
  }
}
img {
  margin-top: 16px;
  width: 32px;
  height: auto;
  /*width: 40px;*/
  /*height: 40px;*/
}
</style>
