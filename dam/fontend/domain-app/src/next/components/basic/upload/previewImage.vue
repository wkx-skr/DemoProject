<template>
  <div class="preview-box">
    <el-image ref="preview" :src="url" :preview-src-list="imageList"></el-image>
  </div>
</template>

<script>
export default {
  props: {
    index: {
      type: Number,
      default: 0,
    },
    url: {
      type: String,
      default: '',
    },
    imageList: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  data() {
    return {}
  },
  created() {
    // this.url = this.srcList[this.index]
    // console.log(this.index)
  },
  mounted() {
    // this.imageList = [
    //   'https://fuss10.elemecdn.com/8/27/f01c15bb73e1ef3793e64e6b7bbccjpeg.jpeg',
    //   'https://fuss10.elemecdn.com/1/8e/aeffeb4de74e2fde4bd74fc7b4486jpeg.jpeg',
    //   'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
    // ]
    console.log(this.imageList)
  },
  methods: {
    onPreview() {
      this.$refs.preview.clickHandler()
    },
  },
}
</script>

<style scoped lang="scss">
.preview-box {
  width: 100px;
  height: 200px;
  .el-image__preview {
    width: 100%;
    height: 100%;
  }
}
</style>
