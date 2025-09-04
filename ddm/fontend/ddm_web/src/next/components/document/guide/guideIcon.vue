<template>
  <div>
    <h1>Icon 图标</h1>
    <h2>使用方法</h2>
    <p>使用内联标签，组合使用iconfont和图标的className作为class属性</p>
    <p>如&lt;i class="iconfont icon-tips"&gt;&lt;/i&gt;</p>

    <h2>图例</h2>
    <div class="tab-container">
      <div class="content unicode" style="display: block">
        <ul class="icon_lists dib-box" @click="copyName($event)">
          <li class="dib" v-for="item in iconfontItems">
            <span
              class="icon iconfont"
              :class="`icon-${item.font_class}`"
            ></span>
            <div class="name">{{ item.name }}</div>
            <div class="code-name">icon-{{ item.font_class }}</div>
          </li>
        </ul>
      </div>
    </div>
    <br />
    <h2>彩色图例（SVG）</h2>
    <h2>使用方法</h2>
    <p>使用datablau-icon组件</p>
    <br />
    <p style="display: flex; align-items: center">
      使用举例:
      <datablau-icon
        style="margin: 0 10px"
        :data-type="'report'"
        icon-type="svg"
        :size="40"
      ></datablau-icon>
      &lt;datablau-icon :data-type="'report'" icon-type="svg" :size="40"
      &gt;&lt;/datablau-icon&gt;
    </p>
    <br/>
    <p>data-type必传,icon-type非必传,默认值为svg</p>
    <p>使用该目录下的文件：src/assets/images/search ，注意：文件名要全小写</p>
    <p>扫描文件的脚本：cd 到对应目录，运行脚本 node scan.js ./ ./colorIcon.json</p>
    <br/>
    <br/>
    <div class="tab-container">
      <div class="content unicode" style="display: block">
        <ul class="icon_lists dib-box">
          <li
            class="dib"
            v-for="item in colorIcon"
            :key="item.type + item.iconType"
            :title="item.type"
          >
            <datablau-icon
              :data-type="item.type"
              :icon-type="item.iconType"
              :size="40"
            ></datablau-icon>
            <div class="name">{{ item.name }}</div>
            <div class="code-name">{{ item.iconType }}</div>
          </li>
        </ul>
      </div>
    </div>
    <br />
    <h2>插画图例</h2>
    <h2>使用方法</h2>
    <p>使用datablau-icon组件</p>
    <br />
    <p style="display: flex; align-items: center">
      使用举例:
      <datablau-icon
        style="margin: 0 10px"
        :data-type="'no-result'"
        icon-type="svg"
        :size="40"
      ></datablau-icon>
      &lt;datablau-icon :data-type="'no-result'" icon-type="svg" :size="40"
      &gt;&lt;/datablau-icon&gt;
    </p>
    <br />
    <p>data-type必传,icon-type非必传,默认值为svg</p>
    <br />
    <br />
    <div class="tab-container">
      <div class="content unicode" style="display: block">
        <ul class="icon_lists dib-box">
          <li
            class="dib"
            v-for="item in dataIcon"
            :key="item.type + item.iconType"
          >
            <datablau-icon
              :data-type="item.type"
              :icon-type="item.iconType"
              :size="40"
            ></datablau-icon>
            <div class="name">{{ item.name }}</div>
            <div class="code-name">{{ item.type }}</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import iconfont from '@/assets/iconfont/iconfont.json'
import colorIcon from '@/assets/images/search/colorIcon.json'
// 扫描文件的脚本：
// node scan.js ./ ./colorIcon.json

export default {
  name: 'guideIcon',
  data() {
    return {
      colorIcon: [
        {
          type: 'api',
          iconType: 'svg',
          name: '数据服务',
        },
        {
          type: 'column',
          iconType: 'svg',
          name: '字段',
        },
        {
          type: 'daima',
          iconType: 'svg',
          name: '标准代码',
        },
        {
          type: 'datastandard',
          iconType: 'svg',
          name: '基础标准',
        },

        {
          type: 'index',
          iconType: 'svg',
          name: '指标标准',
        },
        {
          type: 'package',
          iconType: 'svg',
          name: '包',
        },
        {
          type: 'report',
          iconType: 'svg',
          name: '报表',
        },
        {
          type: 'storedProcedure',
          iconType: 'svg',
          name: '存储过程',
        },
        {
          type: 'table',
          iconType: 'svg',
          name: '表',
        },
        {
          type: 'view',
          iconType: 'svg',
          name: '视图',
        },
        {
          type: 'function',
          iconType: 'svg',
          name: '函数',
        },
        {
          type: 'file',
          iconType: 'png',
          name: '文件',
        },
        {
          type: 'zip',
          iconType: 'svg',
          name: '压缩包',
        },
        {
          type: 'excel',
          iconType: 'svg',
          name: '表格',
        },
        {
          type: 'word',
          iconType: 'svg',
          name: '文档',
        },
        {
          type: 'ppt',
          iconType: 'svg',
          name: '幻灯片',
        },
        {
          type: 'pdf',
          iconType: 'svg',
          name: 'pdf文档',
        },
        {
          type: 'txt',
          iconType: 'svg',
          name: '文本文档',
        },
        {
          type: 'music',
          iconType: 'svg',
          name: '音乐',
        },
        {
          type: 'picture',
          iconType: 'svg',
          name: '图片',
        },
        {
          type: 'video',
          iconType: 'svg',
          name: '视频',
        },
        {
          type: 'normal',
          iconType: 'svg',
          name: '普通文件',
        },
        {
          type: 'wuquanxian',
          iconType: 'svg',
          name: '无权限',
        },
        {
          type: 'tongyici',
          iconType: 'svg',
          name: '同义词',
        },
        {
          type: 'chengxubao',
          iconType: 'svg',
          name: '程序包',
        },
        // {
        //   type: 'infoitems',
        //   iconType: 'svg',
        //   name: '程序包',
        // },
        {
          type: 'domain_code',
          iconType: 'svg',
          name: '标准代码',
        },
        // {
        //   type: 'service',
        //   iconType: 'svg',
        //   name: '程序包',
        // },
      ],
      dataIcon: [
        {
          type: 'no-result',
          iconType: 'svg',
          name: '无数据',
        },
        {
          type: 'no-result-black',
          iconType: 'svg',
          name: '无数据',
        },
      ],
      iconfontItems: [],
    }
  },
  mounted() {
    this.iconfontItems = iconfont.glyphs.filter(item => {
      let bool = this.colorIcon.find(
        colorIcon =>
          colorIcon.name === item.name || colorIcon.type === item.name
      )
      // return !bool
      return true
    })
    let colorMap = {
      scan: true,
      colorIcon: true,
    }
    this.colorIcon.forEach(item => {
      colorMap[item.type] = true
    })
    let colorIconFilter = colorIcon.filter(item => !colorMap[item.type])
    this.colorIcon.push(...colorIconFilter)
    console.log(this.colorIcon, 'this.colorIcon')
  },
  methods: {
    copyName(e) {
      if (e.target.classList[0] === 'icon') {
        this.$utils.string.setClipBoard(e.target.classList[2])
        this.$message.success('复制成功：' + e.target.classList[2])
      } else if (e.target.className === 'code-name') {
        this.$utils.string.setClipBoard(e.target.innerHTML)
        this.$message.success('复制成功：' + e.target.innerHTML)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../base.scss';
@import '../../../../assets/iconfont/demo.css';
.dib {
  display: inline-block;
}
</style>
