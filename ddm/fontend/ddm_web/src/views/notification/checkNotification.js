import HTTP from '@/resource/http'

export default {
  data () {
    return {
      notifi: {
        source: '',
        target: '',
        title: '',
        message: '',
        type: '',
        content: ''
      },
      message: '',
      changeData: [],
      viewChangedData: [],
      defaultNoti: true,

      // 申请被拒绝
      rejectTableDataArr: [],
      rejectTableNameArr: []
    }
  },
  props: {
    notification: {
      type: [String, Object],
      required: true
    }
  },
  components: {},
  computed: {},
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      if (this.notification) {
        let obj = this.notification
        // ddm 没有 type 属性, dam 有,
        // 目标是将处理消息类型的相关逻辑放到这个组件
        if (obj.type === 1100) {
          // 评论与回复 跳转到评论对象
          HTTP.getNotifiDetail({
            para: { nId: obj.nId },
            succesedCallback: data => {
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
            }
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
                    requirementid: demandCode
                  }
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
              query: { messageId: obj.nId }
            })
          } else {
            this.$skip2DDC({
              name: 'checkApplication',
              path: '/checkApplication',
              query: { messageId: obj.nId }
            })
          }
        } else {
          if (this.notification.nId || this.notification.nId === 0) {
            HTTP.getNotifiDetail({
              succesedCallback: data => {
                this.notifi.source = data.source
                this.notifi.target = data.target
                this.notifi.title = data.title
                this.notifi.type = data.type + ''
                this.notifi.content = data.content

                let content = {}
                const targetTableIdArr = []
                let targetViewIdArr = []
                if (data.content && this.$utils.isJSON(data.content)) {
                  content = JSON.parse(data.content)
                  this.notifi.message = content.message
                }
                if (data.type + '' === '1001') {
                  // if (content.targetTableIdArr) {
                  //   targetTableIdArr = content.targetTableIdArr;
                  //   targetTableIdArr.forEach(item => {
                  //     let obj = {
                  //       objectId: item
                  //     };
                  //     HTTP.getTableDetail({
                  //       succesedCallback: (data) => {

                  //       },
                  //       failureCallback: (e) => {
                  //         this.$showFailure(e);
                  //       },
                  //       para: obj
                  //     });
                  //   });
                  // }
                  this.defaultNoti = false
                  if (
                    content.targetViewIdArr &&
                    content.targetViewIdArr.length > 0
                  ) {
                    targetViewIdArr = content.targetViewIdArr
                    const viewChangedData = []
                    targetViewIdArr.forEach(item => {
                      if (item.type === 'add') {
                        viewChangedData.push(item)
                      }
                    })
                    this.viewChangedData = viewChangedData
                  }
                } else if (data.type + '' === '1002') {
                  this.defaultNoti = false
                  // 申请被拒绝
                  const rejectTableDataArr = []
                  this.rejectTableNameArr = content.rejectTableNameArr
                  if (
                    content.rejectTableArr &&
                    content.rejectTableArr.length > 0
                  ) {
                    content.rejectTableArr.forEach(item => {
                      const obj = {
                        objectId: item
                      }
                      HTTP.getTableDetail({
                        succesedCallback: data => {
                          rejectTableDataArr.push(data)
                        },
                        failureCallback: e => {
                          this.$showFailure(e)
                        },
                        para: obj
                      })
                    })
                    this.rejectTableDataArr = rejectTableDataArr
                  }
                }
                if (this.defaultNoti) {
                  this.message = data.content
                }
              },
              failureCallback: e => {
                this.$showFailure(e)
              },
              para: { nId: this.notification.nId }
            })
          } else {
            this.notifi = this.notification
            this.message = this.notification.content
            // this.notifi.message = this.notification.content
          }
        }
      }
    },
    skipToTable (tableObjectId) {
      this.$router.push({
        name: '',
        path: '',
        query: ''
      })
    },
    skip2View (item) {
      if (item.viewId) {
        this.$router.push({
          name: 'dataShow',
          query: {
            viewId: item.viewId
          }
        })
      }
    },
    gotoProblemDetail (id) {
      this.$router.push({
        name: 'dataQualityRepairJob',
        params: {
          id: id
        }
      })
    }
  },
  watch: {}
}
