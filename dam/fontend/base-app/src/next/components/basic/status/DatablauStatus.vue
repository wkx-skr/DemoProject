<template>
  <div class="datablau-status" :test-name="testName">
    <div v-if="businessType">
      <span
        class="businessTypeBox"
        :style="{
          background: backgroundColor,
          color: color,
          width: bgWidth,
        }"
      >
        {{ desc }}
      </span>
    </div>
    <div v-else :style="{ color: color }">
      <span class="dot" :style="{ background: color }"></span>
      <span class="desc">{{ desc }}</span>
    </div>
  </div>
</template>
<script>
export default {
  name: 'DatablauStatus',
  props: {
    testName: String,
    tabs: {
      type: Array,
      default: () => {
        return []
      },
    },
    type: {
      type: [Number, String],
      default: 1,
    },
    desc: {
      type: String,
    },
    businessType: {
      type: Boolean,
    },
    bgWidth: {
      type: String,
      default: 'auto',
    },
  },
  data() {
    return {
      typeObj: {
        1: ['#5dc4c0', 'rgba(93, 196, 192, 0.1)'], // 未操作/通知
        2: ['#409eff', 'rgba(64, 158, 255, 0.1)'], // 中间状态/进行中/评论
        3: ['#e6ad00', 'rgba(230, 173, 0, 0.1)'], // 等待/不确定
        4: ['#66bf16', 'rgba(102, 191, 22, 0.1)'], // 成功结果
        5: ['#ff4b53', 'rgba(255, 75, 83, 0.1)'], // 失败结果
        6: ['#53a7ad', 'rgba(83, 167, 173, 0.1)'], // 确认
        7: ['#999999', 'rgba(153, 153, 153, 0.1)'], // 禁止/关闭
        yingyongxitong: ['#4C6CB3', 'rgba(76, 108, 179, 0.1)'],
        shujuyuan: ['#745399', 'rgba(116, 83, 153, 0.1)'],
        xueyuan: ['#A25768', 'rgba(162, 87, 104, 0.1)'],
        biao: ['#0095D9', 'rgba(0, 149, 217, 0.1)'],
        shitu: ['#4B5CC4', 'rgba(75, 92, 196, 0.1)'],
        ziduan: ['#B44C97', 'rgba(180, 76, 151, 0.1)'],
        baobiao: ['#008899', 'rgba(0, 136, 153, 0.1)'],
        cunchuguocheng: ['#867BA9', 'rgba(134, 123, 169, 0.1)'],
        hanshu: ['#C97586', 'rgba(201, 117, 134, 0.1)'],

        Report: ['#19b2ac', 'rgba(25, 178, 172, 0.1)'],
        List: ['#1e9600', 'rgba(30, 150, 0, 0.1)'],
        Analysis: ['#820096', 'rgba(130, 0, 150, 0.1)'],

        DOMAIN_UPDATE: ['#38B48B', 'rgba(56, 180, 139, 0.1)'],
        DOMAIN_ABOLISH: ['#38B48B', 'rgba(56, 180, 139, 0.1)'],
        DOMAIN_PUBLISH: ['#38B48B', 'rgba(56, 180, 139, 0.1)'],

        STANDARD_UPDATE: ['#9D5B8B', 'rgba(157, 91, 139, 0.1)'],
        STANDARD_ABOLISH: ['#9D5B8B', 'rgba(157, 91, 139, 0.1)'],
        STANDARD_PUBLISH: ['#9D5B8B', 'rgba(157, 91, 139, 0.1)'],

        METRIC_AUTH: ['#EDAD4A', 'rgba(237, 173, 74, 0.1)'],

        METRIC_ABOLISH: ['#FFDE6A', 'rgba(255, 222, 106, 0.1)'],
        METRIC_PUBLISH: ['#FFDE6A', 'rgba(255, 222, 106, 0.1)'],
        METRIC_UPDATE: ['#FFDE6A', 'rgba(255, 222, 106, 0.1)'],

        DATA_AUTH: ['#409EFF', 'rgba(64, 158, 255, 0.1)'],
        api: ['#00A497', 'rgba(0, 164, 151, 0.1)'],
        chengxubao: ['#5B7E91', 'rgba(91, 126, 145, 0.1)'],
        tongyici: ['#7BB15D', 'rgba(123, 177, 93, 0.1)'],
        mulu: ['#888084', 'rgba(136, 128, 132, 0.1)'],
        BUSINESS_RULE: ['#BF794E', 'rgba(191, 121, 78, 0.1)'],
        TECH_RULE: ['#85A452', 'rgba(133, 164, 82, 0.1)'],
        quanshubumen: ['#EE827C', 'rgba(238, 130, 124, 0.1)'],
        yonghu: ['#A88462', 'rgba(168, 132, 98, 0.1)'],
        biaoqian: ['#4D86E0', 'rgba(77, 134, 224, 0.1)'],

        TERRITORY_DOMAIN_ABOLISH: ['#A4CE62', 'rgba(164, 206, 98, 0.1)'],
        TERRITORY_DOMAIN_PUBLISH: ['#A4CE62', 'rgba(164, 206, 98, 0.1)'],
        TERRITORY_DOMAIN_UPDATE: ['#A4CE62', 'rgba(164, 206, 98, 0.1)'],

        TERRITORY_STANDARD_ABOLISH: ['#D1495B', 'rgba(209, 73, 91, 0.1)'],
        TERRITORY_STANDARD_PUBLISH: ['#D1495B', 'rgba(209, 73, 91, 0.1)'],
        TERRITORY_STANDARD_UPDATE: ['#D1495B', 'rgba(209, 73, 91, 0.1)'],

        CATALOG_PUBLISH_APPLY: ['#409EFF', 'rgba(64,158,255,0.1)'],
        CATALOG_OFFLINE_APPLY: ['#409EFF', 'rgba(64,158,255,0.1)'],
        CATALOG_CHANGE_APPLY: ['#409EFF', 'rgba(64,158,255,0.1)'],
        AUTHORITY_APPLY: ['#409EFF', 'rgba(64,158,255,0.1)'],

        xiaxianmulu: ['#796EE0', 'rgba(121, 110, 224, 0.1)'],
        biangengmulu: ['#796EE0', 'rgba(121, 110, 224, 0.1)'],

        ASSET_OFFLINE_APPLY: ['#5DC4C0', 'rgba(93,196,192,0.1)'],
        ASSET_PUBLISH_APPLY: ['#5DC4C0', 'rgba(93,196,192,0.1)'],

        zichanxiaxian: ['#463AB8', 'rgba(70, 58, 184, 0.1)'],
        DATA_APPLY: ['#51C9F6', 'rgba(81, 201, 246, 0.1)'],
        // zichanmuluquanxian: ['#463AB8', 'rgba(70, 58, 184, 0.1)'],
        shujujianmo: ['#409EFF', 'rgba(64, 158, 255, 0.1)'],
        DATA_MODEL_VERSION: ['#0095D9', 'rgba(0, 149, 217, 0.1)'],
        xiangmubanbenfabu: ['#4B5CC4', 'rgba(75, 92, 196, 0.1)'],

        // ddm
        MODEL_REPORT: ['#88d0d0', 'rgba(96,170,199,0.1)'],
      },
    }
  },
  computed: {
    color() {
      let color = '#5dc4c0' // 默认颜色
      for (let key in this.typeObj) {
        if (this.type == key) {
          color = this.typeObj[key][0]
        }
      }
      return color
    },
    backgroundColor() {
      let color = 'rgba(93, 196, 192, 0.1)'
      for (let key in this.typeObj) {
        if (this.type == key) {
          color = this.typeObj[key][1]
        }
      }
      return color
    },
  },
  mounted() {},
  methods: {},
}
</script>
<style lang="scss">
@import '../../basic/color.sass';
.datablau-status {
  display: inline-block;
  font-size: 12px;
  .dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 3px;
    margin-right: 4px;
    vertical-align: middle;
    position: relative;
    top: -0.5px;
  }
  .desc {
    display: inline-block;
    font-size: 12px;
  }
  .businessTypeBox {
    box-sizing: border-box;
    display: inline-block;
    padding: 0 6px;
    height: 24px;
    line-height: 24px;
    border-radius: 2px;
    font-size: 12px;
    text-align: center;
  }
}
</style>
