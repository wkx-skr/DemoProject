import HTTP from '@/http/main.js'

import createVirds from '@/view/authorityManage/createVirDs.vue'
import createView from '@/view/authorityManage/createView.vue'

let notificationObj = {}

export default {
  data() {
    return {
      userInfo: {
        userName: '',
        applType: 'shortType',
        lastTime: 'days3',
        description: 'description',
        message: '',
        lastTimePoint: '',
      },
      notifiTarget: '',
      messageId: '',
      applaTableData: [],
      loadingDetail: false,
      selection: [],

      // dialog
      dialogCrVdsVisible: false,
      choosedObjectId: '',
      dialogCrviewsVisible: false,

      viewMap: {}, // 此页面所有涉及的视图
      // vurDsMap: {}, // 虚拟数据源 modelId: 信息
      acceptable: false,
      pickerOptions1: {
        disabledDate(time) {
          return time.getTime() < Date.now()
        },
      },
      applicationResult: {},
      notiContentStr: '',
      showTooltipView: '',
      currentView: {},
      outgoingFlows: [],
      formProperties: [],

      // process
      taskId: null,
    }
  },
  components: {
    createVirds,
    createView,
  },
  computed: {
    rejectable() {
      return this.selection.length > 0
    },
    isTarget() {
      return true
    },
  },
  mounted() {
    this.dataInit()
    // this.getAllVds(); // 先获取所有虚拟数据源
  },
  methods: {
    dataInit() {
      let para = null
      if (this.$route.query) {
        para = this.$route.query
        if (para.taskId) {
          this.taskId = para.taskId
          this.getTaskDetail(para)
        } else if (para.messageId) {
          this.messageId = para.messageId
          this.getNotifiDetail(para.messageId)
        }
      } else {
        this.$router.push({
          name: 'notification',
          path: '/main/notification',
        })
      }
    },
    // getAllVds() {
    //   HTTP.getFds({
    //     succesedCallback: (data) => {
    //       let obj = {};
    //       if(data && Array.isArray(data)) {
    //         data.forEach(item => {
    //           obj[item.modelId] = item;
    //         });
    //       }
    //       this.vurDsMap = obj;
    //       this.dataInit();
    //     },
    //     failureCallback: (e) => {
    //       this.$showFailure(e);
    //       this.dataInit();
    //     },
    //   });
    // },
    handleSelectionChange(val) {
      this.selection = val
      this.testAcceptable()
    },
    resetChoosedItem() {
      this.selection = this.applaTableData
      this.testAcceptable()
    },
    getTableDetail(objectId) {
      const obj = { objectId: objectId }
      const result = {
        views: {},
        detail: {},
        choosedViewId: '',
      }
      HTTP.getAboutView({
        succesedCallback: data => {
          result.views = data
          if (data && Array.isArray(data)) {
            data.forEach(item => {
              this.viewMap[item.uuid] = item
            })
          }
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
        para: obj,
      })
      HTTP.getTableDetail({
        succesedCallback: data => {
          result.detail = data
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
        para: {
          objectId: objectId,
        },
      })
      return result
    },
    getTaskDetail(para) {
      const url = `${this.$url}/service/workflow/task/start?taskId=${para.taskId}`
      this.$http
        .get(url)
        .then(res => {
          const data = res.data
          const arr = []
          data.outgoingFlows.forEach(item => {
            if (item.name === '通过') {
              arr.unshift(item)
            } else {
              arr.push(item)
            }
          })
          this.outgoingFlows = arr
          this.formProperties = _.cloneDeep(data.formProperties)
          const formProperties = _.cloneDeep(res.data.formProperties)
          let applyResult = null
          if (formProperties && Array.isArray(formProperties)) {
            formProperties.forEach(item => {
              if (item.id === 'applyResult') {
                applyResult = _.cloneDeep(item.value)
              }
            })
          }
          const choosedViewMap = {}
          if (applyResult && this.$utils.isJSON(applyResult)) {
            applyResult = JSON.parse(applyResult)
            if (applyResult && Array.isArray(applyResult)) {
              applyResult.forEach(item => {
                choosedViewMap[item.bindObjectId] = item.uuid
              })
            }
          }
          this.userInfo.userName = formProperties[0].value
          this.notifiTarget = formProperties[2].value
          if (this.$utils.isJSON(formProperties[1].value)) {
            this.notiContentStr = formProperties[1].value
            const notifiObj = JSON.parse(formProperties[1].value)
            this.applicationResult = notifiObj.applicationResult || {}
            this.userInfo.applType = notifiObj.lastType || notifiObj.applType
            this.userInfo.lastTime = notifiObj.endTime || notifiObj.lastTime
            this.userInfo.description = notifiObj.description
            this.userInfo.lastTimePoint = notifiObj.lastTimePoint
            this.userInfo.message = notifiObj.message
            const tableIdArr =
              notifiObj.targetTableIdArr || notifiObj.tableIdArr
            if (tableIdArr && Array.isArray(tableIdArr)) {
              const tableDetailArr = []
              tableIdArr.forEach((item, index) => {
                tableDetailArr[index] = this.getTableDetail(item)
                tableDetailArr[index].choosedViewId = choosedViewMap[item] || ''

                if (
                  this.applicationResult &&
                  this.applicationResult[item + '']
                ) {
                  // tableDetailArr[index].responed = true; // 该行是否已经回复
                  tableDetailArr[index].responed =
                    this.applicationResult[item + ''] // 该行是否已经回复
                  if (this.applicationResult[item + ''] !== 'reject') {
                    tableDetailArr[index].choosedViewId =
                      this.applicationResult[item + '']
                  }
                }
              })
              this.applaTableData = tableDetailArr
              this.resetChoosedItem()
            }
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getNotifiDetail(nId) {
      const obj = { nId }
      HTTP.getNotifiDetail({
        succesedCallback: data => {
          notificationObj = data

          this.userInfo.userName = data.source
          this.notifiTarget = data.target
          if (this.$utils.isJSON(data.content)) {
            this.notiContentStr = data.content

            const notifiObj = JSON.parse(data.content)
            this.applicationResult = notifiObj.applicationResult || {}
            this.userInfo.applType = notifiObj.lastType
            this.userInfo.lastTime = notifiObj.endTime
            this.userInfo.description = notifiObj.description
            this.userInfo.lastTimePoint = notifiObj.lastTimePoint
            const tableIdArr = notifiObj.targetTableIdArr
            if (tableIdArr && Array.isArray(tableIdArr)) {
              const tableDetailArr = []
              tableIdArr.forEach((item, index) => {
                tableDetailArr[index] = this.getTableDetail(item)
                tableDetailArr[index].choosedViewId = ''

                if (
                  this.applicationResult &&
                  this.applicationResult[item + '']
                ) {
                  // tableDetailArr[index].responed = true; // 该行是否已经回复
                  tableDetailArr[index].responed =
                    this.applicationResult[item + ''] // 该行是否已经回复
                  if (this.applicationResult[item + ''] !== 'reject') {
                    tableDetailArr[index].choosedViewId =
                      this.applicationResult[item + '']
                  }
                }
              })
              this.applaTableData = tableDetailArr
              this.resetChoosedItem()
            }
          }
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
        para: obj,
      })
    },
    handleApply(item) {
      let datePoint = 0
      const acceptTableNameArr = []
      const date = new Date().getTime()
      if (this.userInfo.applType === 'longType') {
        datePoint = 4102315200000
      } else if (this.userInfo.applType === 'shortType') {
        if (this.userInfo.lastTime === 'week') {
          datePoint = date + 3600 * 1000 * 24 * 7
        } else if (this.userInfo.lastTime === 'month') {
          datePoint = date + 3600 * 1000 * 24 * 30
        } else if (this.userInfo.lastTime === '3month') {
          datePoint = date + 3600 * 1000 * 24 * 30 * 3
        }
      } else if (this.userInfo.applType === 'cosType') {
        datePoint = this.userInfo.lastTimePoint
      }
      const sharViewsArr = []
      // 分享视图
      // 发送消息
      this.selection.forEach(item => {
        if (!item.choosedViewId) {
          return
        }
        item.detail.physicalName &&
          acceptTableNameArr.push(item.detail.physicalName)
        const VView = this.viewMap[item.choosedViewId]
        const users = VView.sharedUsers ? VView.sharedUsers : []
        const index = users.findIndex(item => {
          return item === this.userInfo.userName
        })
        if (index === -1) {
          users.push(this.userInfo.userName)
        }
        VView.sharedUsers = users
        VView.expire = datePoint
        sharViewsArr.push(VView)
      })

      const taskData = {
        taskId: this.$route.query.taskId,
        nextFlow: item.id,
        formData: [],
      }
      const applyContent = this.userInfo
      applyContent.targetTableIdArr = this.applaTableData.map(
        item => item.detail.objectId
      )
      this.formProperties.forEach(property => {
        if (property.id === 'applyContent') {
          taskData.formData.push(
            property.id + '=' + JSON.stringify(applyContent)
          )
        } else {
          taskData.formData.push(property.id + '=' + property.value)
        }
        // taskData.formData.push(property.id + "=" + property.value)
      })
      taskData.formData.push('applyResult=' + JSON.stringify(sharViewsArr))
      taskData.formData = JSON.stringify(taskData.formData)

      // console.log(taskData, 'taskData')
      const url = `${this.$url}/service/workflow/task/complete`
      this.$http
        .post(url, taskData)
        .then(res => {
          this.$message.success('处理成功')
          this.$router.push({
            name: 'userModal',
            query: { currentNav: 'process' },
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleAcceptApplica() {
      let datePoint = 0
      const acceptTableNameArr = []
      const date = new Date().getTime()
      if (this.userInfo.applType === 'longType') {
        // datePoint = null;
        datePoint = 4102315200000
      } else if (this.userInfo.applType === 'shortType') {
        if (this.userInfo.lastTime === 'week') {
          datePoint = date + 3600 * 1000 * 24 * 7
        } else if (this.userInfo.lastTime === 'month') {
          datePoint = date + 3600 * 1000 * 24 * 30
        } else if (this.userInfo.lastTime === '3month') {
          datePoint = date + 3600 * 1000 * 24 * 30 * 3
        }
      } else if (this.userInfo.applType === 'cosType') {
        datePoint = this.userInfo.lastTimePoint
      }

      if (this.selection.length > 0) {
        // 分享视图
        // 发送消息
        // 显示成功 message
        const sharViewsArr = []
        const targetViewIdArr = []
        this.selection.forEach(item => {
          if (!item.choosedViewId) {
            return
          }
          item.detail.physicalName &&
            acceptTableNameArr.push(item.detail.physicalName)
          const VView = this.viewMap[item.choosedViewId]
          if (VView) {
            this.applicationResult = this.applicationResult || {}
            this.applicationResult[item.detail.objectId + ''] =
              item.choosedViewId
          }
          const users = VView.sharedUsers ? VView.sharedUsers : []
          const index = users.findIndex(item => {
            return item === this.userInfo.userName
          })
          if (index === -1) {
            users.push(this.userInfo.userName)
          }
          VView.sharedUsers = users
          VView.expire = datePoint
          const obj = {
            viewId: item.choosedViewId,
            VView: VView,
          }
          sharViewsArr.push(obj)

          const viewDataInNoti = {
            type: 'add',
            viewId: item.choosedViewId,
            endTime: VView.expire,
            viewName: VView.name,
            tableObjectId: item.detail.objectId,
            tablePhysicalName: item.detail.physicalName,
            owner: item.detail.owner,
          }
          targetViewIdArr.push(viewDataInNoti)
        })
        const showMsg = {
          viewCount: 0,
        }
        if (sharViewsArr.length > 0) {
          showMsg.viewCount = sharViewsArr.length
          sharViewsArr.forEach(item => {
            HTTP.shareView({
              succesedCallback: data => {
                showMsg.viewCount--
                if (showMsg.viewCount <= 0) {
                  this.updataNotiContent()
                  const shareSucceNotifi = data => {
                    this.$showSuccess('回复成功!')
                    this.skipToFinishedPage()
                  }
                  const contentObj = {
                    targetTableIdArr: [],
                    targetViewIdArr: targetViewIdArr,
                    endTime: datePoint,
                    message: this.userInfo.message,
                  }
                  const contentStr = JSON.stringify(contentObj)
                  const obj = {
                    type: 1001,
                    title:
                      '关于表 ' +
                      acceptTableNameArr.join(', ') +
                      ' 的数据申请通过',
                    content: contentStr,
                    target: this.userInfo.userName,
                  }
                  HTTP.sendNotification({
                    succesedCallback: shareSucceNotifi,
                    failureCallback: e => {
                      this.$showFailure(e)
                    },
                    para: obj,
                  })
                }
              },
              failureCallback: e => {
                this.$showFailure(e)
              },
              para: item,
            })
          })
        }
      }
    },
    handleRejectApplica() {
      // 发送消息
      // 更改信息 content
      // 显示发送成功
      const notContentObj = {
        appliNotiId: this.messageId,
        message: this.userInfo.message,
        rejectTableArr: [],
        rejectTableNameArr: [],
      }

      this.selection.forEach(item => {
        notContentObj.rejectTableArr.push(item.detail.objectId)
        notContentObj.rejectTableNameArr.push(item.detail.physicalName)
        this.$set(this.applicationResult, item.detail.objectId + '', 'reject')
      })

      const contentStr = JSON.stringify(notContentObj)
      const obj = {
        type: 1002,
        title:
          '关于表 ' +
          notContentObj.rejectTableNameArr.join(', ') +
          ' 的申请被拒绝',
        content: contentStr,
        target: this.userInfo.userName,
      }
      HTTP.sendNotification({
        succesedCallback: () => {
          const callback = () => {
            this.$showSuccess('回复成功!')
            this.skipToFinishedPage()
          }
          this.updataNotiContent(callback)
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
        para: obj,
      })
    },
    updataNotiContent(callback) {
      if (!this.notiContentStr) {
        return
      }
      const contentObj = JSON.parse(this.notiContentStr)
      contentObj.applicationResult = this.applicationResult
      const contentStr = JSON.stringify(contentObj)
      notificationObj.content = contentStr

      const para = {
        notiId: this.messageId,
        notiObj: notificationObj,
      }

      HTTP.updataNotifi({
        succesedCallback: data => {
          callback && callback()
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
        para: para,
      })
    },
    handleCreateView(obj) {
      this.$router.push({
        name: 'createView',
        path: '/main/createView',
        query: {
          objectId: obj.detail.objectId,
          messageId: this.messageId,
        },
      })
    },
    handleCreateVirDS(obj) {
      const objectId = obj.detail.objectId
      this.choosedObjectId = objectId
      this.dialogCrVdsVisible = true
      this.$nextTick(() => {
        this.$refs.createVirds.dataInit()
      })
    },
    handleBack2Notifi() {
      this.$router.push({
        name: 'notification',
        path: '/main/notification',
      })
    },
    handleBack() {
      const query = this.$route.query
      if (!query.taskId) {
        this.handleBack2Notifi()
      } else {
        window.close()
      }
    },

    // dialog
    handleCreated() {
      this.dialogCrviewsVisible = true
      this.dataInit()
    },
    handleViewCreated() {
      this.dialogCrviewsVisible = false
    },
    handleChooseView(data, view) {
      data.choosedViewId = view.uuid
      this.testAcceptable()
      // setInterval(() => {
      //   this.notifiTarget = this.notifiTarget === 'admin' ?  'test': 'admin';
      // }, 2000)
    },
    skipToFinishedPage() {
      this.$router.push({
        name: 'finishedPage',
        path: '/main/finishedPage',
        query: {
          msgType: '002',
        },
      })
    },
    testAcceptable() {
      let result = true
      if (this.selection.length > 0) {
        this.selection.forEach(item => {
          if (!item.choosedViewId) {
            result = false
          }
        })
      }
      this.acceptable = result
    },
    setCurrentPopover(view) {
      const currentView = _.cloneDeep(view)
      this.showTooltipView = view.uuid
      this.showTooltipRow = ''
      if (currentView.description && currentView.description.length > 300) {
        currentView.longText = true
      }
      this.currentView = currentView
    },
    clearCurrentPopover() {},
    handleSkip2View(view) {
      this.$router.push({
        name: 'dataShow',
        query: {
          viewId: view.uuid,
        },
      })
    },
  },
  watch: {},
}
