<template>
  <el-card class="box-card info-list">
    <div slot="header" class="clearfix">
      <span class="sub-title">
        {{ $t('userPane.userPane.latestMessages') }}
      </span>
      <el-button class="showMore" type="text" @click="toMessageBox">
        {{ $t('userPane.userPane.more') }}
      </el-button>
    </div>
    <div v-loading="loading">
      <div
        v-for="(val, index) in infoList"
        :key="val.id"
        class="wrap"
        @click="rowClick(val)"
      >
        <div
          class="tag"
          :style="{
            color: setType(val.type),
            background: setBg(val.type),
            width: baseLen,
          }"
        >
          <!-- {{ val.tag }} -->
          {{ val.typeName }}
        </div>
        <el-tooltip
          effect="dark"
          :content="val.title"
          placement="top"
          :disabled="isShowTooltip"
        >
          <p class="msg" @mouseover="onMouseOver('infoList' + index)">
            <span :ref="'infoList' + index">{{ val.title }}</span>
          </p>
        </el-tooltip>

        <div class="date">
          {{ val.createdOn | dateFormater }}
        </div>
      </div>
    </div>
    <datablau-dialog
      :title="notiTabObj.title"
      :visible.sync="dialogVisibleNotiTabObj"
      width="600px"
      append-to-body
      :close-on-click-modal="false"
    >
      <check-notification
        :notification="notiTabObj"
        ref="checkNotification"
      ></check-notification>
      <div slot="footer">
        <datablau-button @click="dialogVisibleNotiTabObj = false">
          关 闭
        </datablau-button>
      </div>
    </datablau-dialog>
  </el-card>
</template>

<script>
import moment from 'moment'
import checkNotification from '@/view/notification/checkNotification.vue'
import HTTP from '@/http/main'
import userPane from '@constant/userPane'
import NotificationController from '../../../../../base-components/http/baseController/NotificationController'

export default {
  name: 'infoList',
  mixins: [userPane],
  data() {
    return {
      isShowTooltip: false,
      loading: false,
      infoList: [],
      notiTabObj: {},
      dialogVisibleNotiTabObj: false,
      baseLen: 0,
    }
  },
  components: {
    checkNotification,
  },
  filters: {
    dateFormater(val) {
      return moment(val).format('YYYY-MM-DD')
    },
  },
  mounted() {
    this.getNotification()
  },
  methods: {
    getNotification() {
      this.loadingMsg = true
      NotificationController.getNotifications().then(res => {
        this.loading = false
        let arr = res.data.slice(-10)
        arr.reverse()
        let baseLen = 0
        arr.forEach(item => {
          item.typeName = ''
          for (let key in this.$messageTypeMap) {
            if (`${item.type}` === `${key}`) {
              item.typeName = this.$messageTypeMap[key]
            }
          }
          baseLen =
            this.$messageTypeMap[item.type].length > baseLen
              ? this.$messageTypeMap[item.type].length
              : baseLen
        })
        this.$nextTick(() => {
          if (this.$i18n.locale === 'zh') {
            this.baseLen = baseLen * 12 + 12 + 'px'
          } else {
            this.baseLen = baseLen * 7 + 12 + 'px'
          }
        })
        this.infoList = arr
      })
    },
    setType(val) {
      // 数据标准审核   数据权限申请

      let typeToColorObj = {
        0: '#3466C0',
        1: '#53A7AD',
        1000: '3466C0', // 蓝色
        1001: '#57a07f', // 绿色
        1003: '#53A7AD',
        1600: '#F46565',
        1500: '#53A7AD',
        1200: '#53A7AD',
        1300: '#53A7AD', // 青色
        1100: '#85c9ff', // 淡天蓝色
        1002: '#F46565',
        9999: '#F46565',
        66601: '#38B48B',
        66602: '#38B48B',
        66603: '#38B48B',
        66604: '#53A7AD',
        66605: '#53A7AD',
        66606: '#FFDE6A',
        66607: '#FFDE6A',
        66608: '#FFDE6A',
        66609: '#57a07f',
        66610: '#57a07f',
        66611: '#A4CE62',
        66612: '#A4CE62',
        66613: '#A4CE62',
        66614: '#9D5B8B',
        66615: '#9D5B8B',
        66616: '#9D5B8B',
        66617: '#F46565',
        66618: '#F46565',
        66619: '#D1495B',
        66620: '#D1495B',
        66621: '#D1495B',
        66622: '#3466C0',
        66623: '#88d0d0',
        66624: '#3466C0',
        66625: '#EDAD4A',
        66626: '#EDAD4A',
        66627: '#EDAD4A',
        66628: '#EDAD4A',
        66629: '#3466C0',
        66630: '#3466C0',
        66631: '#3466C0',
        66632: '#F46565',
        66633: '#F46565',
        66634: '#5DC4C0',
        66635: '#5DC4C0',
        66636: '#409EFF',
        66637: '#5DC4C0',
        66638: '#409EFF',
        66639: '#409EFF',
        66640: '#5DC4C0',
        66641: '#85A452',
        66642: '#BF794E',
        66643: '#88d0d0',
        66644: '#88d0d0',
        66645: '#88d0d0',
        66646: '#88d0d0',
        66647: '#0095D9',
        66648: '#0095D9',
        66649: '#0095D9',
        66650: '#0095D9',
      }
      // let typeToColorObj = { 0: '#3466C0', 1: '#57a07f', 2: '#F46565',3:'#53A7AD',4:'#E3F1FF'}
      return typeToColorObj[val]
    },
    setBg(val) {
      let typeToBgObj = {
        0: 'rgba(52, 102, 192, 0.15)', // 蓝
        1: 'rgba(83, 167, 173, 0.15)', // 青
        1000: 'rgba(52, 102, 192, 0.15)', // 蓝
        1001: 'rgba(87, 160, 127, 0.15)', // 绿
        1002: 'rgba(244, 101, 101, 0.15)', // 红
        9999: 'rgba(244, 101, 101, 0.15)', // 红
        1600: 'rgba(244, 101, 101, 0.15)', // 红
        1003: 'rgba(83, 167, 173, 0.15)', // 青
        1200: 'rgba(83, 167, 173, 0.15)', // 青
        1300: 'rgba(83, 167, 173, 0.15)', // 青
        1500: 'rgba(83, 167, 173, 0.15)', // 青
        1100: '#e6f2ff', // 淡天蓝色66601: 'rgba(56, 180, 139, 0.15)',
        66602: 'rgba(56, 180, 139, 0.15)',
        66603: 'rgba(56, 180, 139, 0.15)',
        66604: 'rgba(83, 167, 173, 0.15)',
        66605: 'rgba(83, 167, 173, 0.15)',
        66606: 'rgba(255, 222, 106, 0.15)',
        66607: 'rgba(255, 222, 106, 0.15)',
        66608: 'rgba(255, 222, 106, 0.15)',
        66609: 'rgba(87, 160, 127, 0.15)',
        66610: 'rgba(87, 160, 127, 0.15)',
        66611: 'rgba(164, 206, 98, 0.15)',
        66612: 'rgba(164, 206, 98, 0.15)',
        66613: 'rgba(164, 206, 98, 0.15)',
        66614: 'rgba(157, 91, 139, 0.15)',
        66615: 'rgba(157, 91, 139, 0.15)',
        66616: 'rgba(157, 91, 139, 0.15)',
        66617: 'rgba(244, 101, 101, 0.15)',
        66618: 'rgba(244, 101, 101, 0.15)',
        66619: 'rgba(209, 73, 91, 0.15)',
        66620: 'rgba(209, 73, 91, 0.15)',
        66621: 'rgba(209, 73, 91, 0.15)',
        66622: 'rgba(52, 102, 192, 0.15)',
        66623: 'rgba(96,170,199,0.15)',
        66624: 'rgba(52, 102, 192, 0.15)',
        66625: 'rgba(237, 173, 74, 0.15)',
        66626: 'rgba(237, 173, 74, 0.15)',
        66627: 'rgba(237, 173, 74, 0.15)',
        66628: 'rgba(237, 173, 74, 0.15)',
        66629: 'rgba(52, 102, 192, 0.15)',
        66630: 'rgba(52, 102, 192, 0.15)',
        66631: 'rgba(52, 102, 192, 0.15)',
        66632: 'rgba(244, 101, 101, 0.15)',
        66633: 'rgba(244, 101, 101, 0.15)',
        66634: 'rgba(93,196,192,0.15)',
        66635: 'rgba(93,196,192,0.15)',
        66636: 'rgba(64,158,255,0.15)',
        66637: 'rgba(93,196,192,0.15)',
        66638: 'rgba(64,158,255,0.15)',
        66639: 'rgba(64,158,255,0.15)',
        66640: 'rgba(93,196,192,0.15)',
        66641: 'rgba(133, 164, 82, 0.15)',
        66642: 'rgba(191, 121, 78, 0.15)',
        66643: 'rgba(96,170,199,0.15)',
        66644: 'rgba(96,170,199,0.15)',
        66645: 'rgba(96,170,199,0.15)',
        66646: 'rgba(96,170,199,0.15)',
        66647: 'rgba(0, 149, 217, 0.15)',
        66648: 'rgba(0, 149, 217, 0.15)',
        66649: 'rgba(0, 149, 217, 0.15)',
        66650: 'rgba(0, 149, 217, 0.15)',
      }
      return typeToBgObj[val]
    },
    toMessageBox() {
      // 跳转收件箱
      this.$router.push({
        name: 'userModal',
        query: {
          currentNav: 'message',
        },
      })
    },
    rowClick(obj) {
      this.checkNoti(obj)
      if (!obj.read) {
        setTimeout(() => {
          this.getNotification()
        }, 500)
      }
    },
    onMouseOver(str) {
      const tag = this.$refs[str]
      const contentWidth = tag[0].offsetWidth // 获取元素可视宽度
      const parent = this.$refs[str][0].parentNode // 获取元素父级可视宽度
      const parentWidth = parent.offsetWidth
      this.isShowTooltip = contentWidth <= parentWidth
    },
    /* getNotification(para) {
      const username = this.$user.username
      this.loadingMsg = true
      HTTP.getNotification({
        succesedCallback: data => {
          const arr = []
          if (data && Array.isArray(data)) {
            // arr = data.reverse();
            data.forEach(item => {
              if (item.target === username) {
                if (this.keyword !== '') {
                  const keyword = this.keyword.trim().toLowerCase()
                  if (item.title.toLowerCase().indexOf(keyword) !== -1) {
                    arr.push(item)
                  }
                } else {
                  arr.push(item)
                }
              }
            })
            arr.reverse()
          }
          this.$bus.$emit('getInfication', arr) // 全局通知获得消息
          this.allDataArr = arr
          this.getShowData(this.showNotiType, para)
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
      })
    }, */
    checkNormalNoti(obj) {
      this.dialogVisibleNotiTabObj = true
      this.notiTabObj = obj
      setTimeout(() => {
        this.$refs.checkNotification.dataInit()
      })
    },
    checkNoti(obj) {
      if (obj.type === 1100) {
        // 评论与回复 跳转到评论对象
        NotificationController.getNotification({ id: obj.id }).then(res => {
          const data = res.data
          // return;
          // TODO
          // 处理跳转到 dam 或者 ddc
          const isDDMcomment =
            data.content &&
            /modelId/.test(data.content) &&
            /branchId/.test(data.content)
          if (isDDMcomment) {
            const text = $('<div>' + data.content + '</div>')
            const href = text.find('a')[0].href
            window.open(href)
          } else if (data.content) {
            const text = $('<div>' + data.content + '</div>')
            let href = text.find('a')[0].href
            if (href.includes('myAsset') || href.includes('overview')) {
              return // 暂时不跳转了，6.5.1再改
              // 资产浏览发表的评论
              href = href.replace('myAsset', 'overview')
            }
            if (href.split('?').length > 2) {
              const curHref = href.split('?').slice(0, 2)
              href = curHref.join('?')
            }
            const comment = href.includes('&nav=comment') ? '' : '&nav=comment'
            if (this.$skip2DDC) {
              const urlHash = href.split('#')[1] + comment
              this.$skip2DDC({ path: urlHash })
            } else {
              location.href =
                location.pathname + '#' + href.split('#')[1] + comment
            }
          }
        })
      } else if (obj.type === 1003) {
        // 数据需求
        NotificationController.getNotification({ id: obj.id })
          .then(res => {
            const obj = res.data
            const content = obj.content || ''
            let paraArr = content.split('?')[1] || ''
            paraArr = paraArr.split('"')[0]
            paraArr = paraArr.split('&')
            let demandCode = ''
            paraArr.forEach(item => {
              if (item.indexOf('code') !== -1) {
                demandCode = item.split('=')[1] || ''
              }
            })
            if (demandCode) {
              this.$router.push({
                name: 'dataDemand',
                query: {
                  currentTab: 'check',
                  // id: demandId,
                  requirementid: demandCode,
                },
              })
            } else {
              this.$showFailure('未找到指定数据需求')
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else if (obj.type === 1000) {
        // 数据权限申请
        if (!this.$skip2DDC) {
          this.$router.push({
            name: 'checkApplication',
            path: '/checkApplication',
            query: { messageId: obj.nId },
          })
        } else {
          this.$skip2DDC({
            name: 'checkApplication',
            path: '/checkApplication',
            query: { messageId: obj.nId },
          })
        }
      } else {
        this.checkNormalNoti(obj)
      }
    },
  },
}
</script>

<style lang="scss">
.info-list {
  box-shadow: none;
  background: #fff;
  height: 100%;
  .el-card__header {
    padding: 14px 20px;
  }
  .el-loading-parent--relative {
    height: 400px;
  }
  .sub-title {
    width: 126px;
    height: 21px;
    font-size: 14px;
    // font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: #555555;
    line-height: 21px;
  }
  .showMore {
    float: right;
    padding: 3px 0;
    position: absolute;
    right: 20px;
    font-size: 12px;
    // font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #409eff;
  }
  .el-card__body {
    padding: 14px;
    padding-top: 6px;
  }
  .wrap {
    display: flex;
    align-items: center;
    height: 40px;
    line-height: 40px;
  }
  .tag {
    display: inline-block;
    overflow: hidden;
    width: 100px;
    height: 22px;
    line-height: 22px;
    text-align: center;
    background: rgba(188, 193, 194, 0.15);
    border-radius: 2px;
  }
  .msg {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    display: inline-block;
    margin: 0 20px 0 10px;
  }
  .date {
    display: inline-block;
    width: 70px;
    text-align: right;
  }
}
.info-list.el-card.is-always-shadow {
  box-shadow: none;
}
</style>
