<template>
  <div class="screen-shorts">
    <div id="screenshots-result" style="width: 800px; height: 600px"></div>
  </div>
</template>

<script>
import html2canvas from 'html2canvas'

export default {
  name: 'screenshots',
  methods: {
    generate (selector, name = '导出图片', options = {}) {
      let $targetDom = $(selector)
      let width = $targetDom.width()
      let height = $targetDom.height()
      options.width = options.width || width + 20
      options.height = options.height || height + 20
      html2canvas($targetDom[0], options).then(canvas => {
        setTimeout(() => {
          function restoreImg (canvas) {
            const href = canvas.toDataURL() // 获取canvas对应的base64编码
            const a = document.createElement('a') // 创建a标签
            a.download = name // 设置图片名字
            a.href = href
            a.dispatchEvent(new MouseEvent('click'))
          }

          restoreImg(canvas)
        })
      })
    }
  }
}
</script>

<style scoped lang="scss">
  .screen-shorts {
    position: relative;
    height: 20px;
    overflow: hidden;

    .screenshots-result {
      //border: 1px solid red;
      position: absolute;
      left: 0;
      top: 0;
    }
  }
</style>
