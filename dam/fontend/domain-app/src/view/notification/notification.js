import HTTP from '@/http/main.js'

import checkNotification from './checkNotification.vue'
import newsList from './newsList.vue'
import spanWithTooltip from '@/components/common/spanWithTooltip.vue'

export default {
  data() {
    return {
      currentTab: 'allGetNotifi',
      notiTabArr: [],
      notiTabObj: {},
      dialogVisibleNotiTabObj: false,
    }
  },
  components: {
    checkNotification,
    newsList,
    spanWithTooltip,
  },
  props: {
    hideOuter: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: false,
    },
  },
  computed: {},
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      if (this.type === 'messageInbox') {
        this.$refs.allGetNotifiList.dataInit()
      } else if (this.type === 'messageSendMailbox') {
        this.$refs.sentNotifiList.dataInit()
      }
    },
    removeTab(name) {
      const index = this.notiTabArr.findIndex(item => {
        return item.nId + '' === name
      })
      if (index !== -1) {
        this.notiTabArr.splice(index, 1)
      }
      this.currentTab = 'allGetNotifi'
    },

    checkNoti(obj) {
      if (obj.type === 1100) {
        // 评论与回复 跳转到评论对象
        HTTP.getNotifiDetail({
          para: { nId: obj.nId },
          succesedCallback: data => {
            // return;
            // TODO
            // 处理跳转到 dam 或者 ddc
            console.log(data)
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
              const comment = href.includes('&nav=comment')
                ? ''
                : '&nav=comment'
              if (this.$skip2DDC) {
                const urlHash = href.split('#')[1] + comment
                this.$skip2DDC({ path: urlHash })
              } else {
                location.href =
                  location.pathname + '#' + href.split('#')[1] + comment
              }
            }
          },
        })
      } else if (obj.type === 1003) {
        // 数据需求
        HTTP.getNotifiDetailPro(obj.nId)
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
    checkNormalNoti(obj) {
      this.dialogVisibleNotiTabObj = true
      this.notiTabObj = obj
      setTimeout(() => {
        this.$refs.checkNotification.dataInit()
      })
      // let index = this.notiTabArr.findIndex(item => {
      //   return item.nId === obj.nId;
      // });
      // if (index === -1) {
      //   this.notiTabArr.push(obj);
      // }
      // this.currentTab = obj.nId + '';
    },
  },
  watch: {
    type(newVal) {
      if (newVal === 'messageInbox') {
        this.$refs.allGetNotifiList.resize()
        this.$refs.allGetNotifiList.dataInit()
      } else if (newVal === 'messageSendMailbox') {
        this.$refs.sentNotifiList.resize()
        this.$refs.sentNotifiList.dataInit()
      }
    },
    currentTab(newVal) {
      if (newVal === 'allGetNotifi') {
        this.$refs.allGetNotifiList.resize()
        this.$refs.allGetNotifiList.dataInit()
      } else if (newVal === 'sentNotifi') {
        this.$refs.sentNotifiList.resize()
        this.$refs.sentNotifiList.dataInit()
      }
    },
  },
}
