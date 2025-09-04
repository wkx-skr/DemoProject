<template>
  <div>
    <el-input v-model="url"></el-input>
    <!--<iframe id="demoI" :key="iframeKey" :src="url" frameborder="0"></iframe>-->
    <el-button @click="generate">生成图片</el-button>
    <div
      id="result"
      style="outline: 1px solid pink; width: 800px; height: 600px"
    ></div>
    <div id="capture" style="padding: 10px; background: #f5da55">
      <h4 style="color: #000">Hello world!</h4>
    </div>
  </div>
</template>

<script>
import html2canvas from 'html2canvas'

export default {
  name: 'shotDemo',
  data() {
    return {
      url: 'http://www.baidu.com',
      iframeKey: 0,
    }
  },
  methods: {
    generate() {
      html2canvas($('#capture')[0]).then(canvas => {
        $('#result').html(canvas)
        setTimeout(() => {
          function restoreImg() {
            const name = prompt('请输入要保存的图片名称', 'canvas绘制图片') // 'canvas绘制图片'为图片默认名
            if (name === '') {
              alert('名字不能为空')
            } else {
              const href = canvas.toDataURL() // 获取canvas对应的base64编码
              const a = document.createElement('a') // 创建a标签
              a.download = name // 设置图片名字
              a.href = href
              a.dispatchEvent(new MouseEvent('click'))
            }
          }
          const canvas = $('canvas')[0]
          restoreImg()
        })
      })
    },
  },
  watch: {
    url() {
      this.iframeKey++
    },
  },
}
</script>

<style scoped></style>
