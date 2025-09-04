<template>
  <div class="system" :class="{ highlight: highlight }" @click="nameClick">
    <img :src="type && type === 'model' ? meta : image" alt="" />
    <datablau-tooltip
      class="item"
      effect="dark"
      :content="name"
      placement="top-start"
      :disabled="name.length < 16"
    >
      <p>{{ name.length < 16 ? name : name.substring(0, 14) + '...' }}</p>
    </datablau-tooltip>
  </div>
</template>

<script>
import image from './system.png'
import meta from './meta.png'
export default {
  data() {
    return {
      image,
      meta,
      node: null,
      name: '',
      type: '',
      highlight: false,
      num: 0,
    }
  },
  inject: ['getNode'],
  methods: {
    nameClick() {
      let time = null
      this.num++
      time = setTimeout(() => {
        if (this.num === 1) {
          this.node = this.getNode()
          this.node.setData({
            showDetail: true,
            id: this.node?.data?.id,
          })
        } else if (this.num === 2) {
          this.node.setData({
            showDetail: true,
            db: true,
            id: this.node?.data?.id,
          })
        }
        this.num = 0
      }, 300)
    },
  },
  mounted() {
    this.node = this.getNode()
    this.name = this.node?.data?.text || ''
    this.type = this.node?.data?.type || ''
    this.highlight = this.node?.data?.highlight
    this.node.on('change:data', res => {
      this.highlight = res.current.highlight
    })
  },
}
</script>

<style scoped lang="scss">
.system {
  background: #fff;
  border-radius: 4px;
  padding: 18px 16px 14px;
  text-align: center;
  height: 120px;
  width: 128px;
  img {
    width: 45px;
  }
  p {
    margin-top: 10px;
    /*text-align: left;*/
    /*text-overflow: -o-ellipsis-lastline;*/
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    cursor: pointer;
    -webkit-box-orient: vertical;
  }
  &:hover {
    color: #409eff;
  }
}
.highlight {
  border: 2px solid #409eff;
  box-shadow: 0px 4px 10px 0px rgba(64, 158, 255, 0.2);
}
</style>
