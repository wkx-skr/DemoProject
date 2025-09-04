import HTTP from '@/http/main.js'

const datePoint = new Date().getTime() - 0 + 1000 * 3600 * 24
export default {
  data() {
    const userName = this.$user.username
    return {
      userInfo: {
        title: '权限申请',
        userName: userName,
        applType: 'shortType',
        lastTime: 'week',
        lastTimePoint: datePoint,
        description: '',
      },
      applaTableData: [],
      loadingDetail: false,
      selection: [],
      userName: userName,
      pickerOptions1: {
        disabledDate(time) {
          return time.getTime() < Date.now()
        },
      },
    }
  },
  components: {},
  computed: {
    cansubmit() {
      return this.selection && this.selection.length > 0
    },
  },
  mounted() {
    this.dataInit()
  },
  methods: {
    handleSubmit() {
      const messageArr = []
      if (this.selection && this.selection.length > 0) {
        this.selection.forEach(item => {
          const index = messageArr.findIndex(item2 => {
            return item2.targetUser === item.detail.owner
          })
          if (index === -1) {
            const obj = {
              targetUser: item.detail.owner,
              message: {
                targetTableIdArr: [item.detail.objectId],
                targetViewIdArr: [],
                endTime: this.userInfo.lastTime,
                lastType: this.userInfo.applType,
                description: this.userInfo.description,
                lastTimePoint: this.userInfo.lastTimePoint,
              },
            }
            messageArr.push(obj)
          } else {
            const arr = messageArr[index].message.targetTableIdArr
            if (arr && Array.isArray(arr)) {
              arr.push(item.detail.objectId)
            } else {
              messageArr[index].message.targetTableIdArr = [
                item.detail.objectId,
              ]
            }
          }
        })
      }
      if (messageArr && messageArr.length > 0) {
        // let succesCount = 0;
        // let allMsgCount = messageArr.length;
        messageArr.forEach(item => {
          const contentStr = JSON.stringify(item.message)
          // let obj = {
          //   type: 1000,
          //   title: this.userInfo.title,
          //   content: contentStr,
          //   target: item.targetUser,
          // };
          // false && HTTP.sendNotification({
          //   succesedCallback: (data) => {
          //     this.$showSuccess('发送成功');
          //     succesCount++;
          //     if (succesCount === allMsgCount) {
          //       this.skipToFinishedPage();
          //     }
          //     let arr = item.message.targetTableIdArr;
          //     arr.forEach(item => {
          //       if (!item) {
          //         return;
          //       }
          //       let index = this.applaTableData.findIndex(item2 => {
          //         return item2.detail.objectId == item;
          //       });
          //       this.removeTableItem({index, objectId: item});
          //     });
          //   },
          //   failureCallback: (e) => {
          //     this.$showFailure(e);
          //   },
          //   para: obj
          // });

          // if (true) {
          const processBody = {
            requestBody: {
              processType: this.$processMap.applyData,
              formDefs: [
                { code: 'applyUser', value: `${this.$user.username}` },
                { code: 'owner', value: `${item.targetUser}` },
                { code: 'applyContent', value: `${contentStr}` },
                { code: 'applyName', value: `${this.userInfo.title}` },
                {
                  code: 'applyTableObjectId',
                  value: JSON.stringify(item.message.targetTableIdArr),
                },
              ],
            },
          }

          HTTP.publish(processBody)
            .then(res => {
              this.toPublishLoading = false
              this.$message.success('申请发布成功')
              this.selection.forEach(item => {
                this.removeTableItem({
                  index: -1,
                  objectId: item.detail.objectId,
                })
              })
              // localStorage.removeItem('dataApply')
              this.userInfo = {
                title: '权限申请',
                userName: this.$user.username,
                applType: 'shortType',
                lastTime: 'week',
                lastTimePoint: datePoint,
                description: '',
              }
              this.$bus.$emit('changeTableApplyNum')
              this.dataInit()
            })
            .catch(e => {
              this.toPublishLoading = false
              this.$showFailure(e)
            })
          // let processApplyUrl = `${this.$url}/service/workflow/process/apply`;
          //
          // this.$http.post(processApplyUrl, processBody)
          // .then(res => {
          //   // console.log(res.data, 'apply data')
          //   this.$showSuccess('发送成功');
          //   succesCount++;
          //   if (succesCount === allMsgCount) {
          //     this.skipToFinishedPage();
          //   }
          //   let arr = item.message.targetTableIdArr;
          //   arr.forEach(item => {
          //     if (!item) {
          //       return;
          //     }
          //     let index = this.applaTableData.findIndex(item2 => {
          //       return item2.detail.objectId == item;
          //     });
          //     this.removeTableItem({index, objectId: item});
          //   });
          // })
          // .catch(e => {
          //   this.$showFailure(e);
          // })
          // }
        })
      }
    },
    handleCancle() {
      window.history.back()
    },
    dataInit() {
      const tableIdsArr = this.$utils.localStorage.getDataApplication({
        attr: 'dataApply',
        type: 'Object',
        userName: this.userName,
      })
      const arr = []
      tableIdsArr.forEach((item, index) => {
        arr[index] = this.getTableDetail(item)
      })
      this.applaTableData = arr
      this.$nextTick(() => {
        this.$refs.applaTableData.toggleAllSelection()
      })
    },
    handleSelectionChange(val) {
      this.selection = val
      this.resetTitle()
    },
    resetTitle() {
      const val = this.selection
      let str = '权限申请'
      if (val && val.length > 0) {
        const tableNameArr = []
        val.forEach(item => {
          if (item.detail.physicalName) {
            tableNameArr.push(item.detail.physicalName)
          }
        })
        if (tableNameArr.length > 0) {
          str = '表 [' + tableNameArr.join(', ') + '] 的权限申请'
        }
      }
      this.userInfo.title = str
    },
    handleRemoveAppliTable(scope) {
      const index = scope.$index
      const objectId = scope.row.detail.objectId

      this.removeTableItem({ index, objectId })
    },

    getTableDetail(objectId) {
      const obj = { objectId: objectId }
      const result = {
        views: {},
        detail: {},
      }
      HTTP.getTableDetail({
        succesedCallback: data => {
          result.detail = data
          this.resetTitle()
        },
        failureCallback: e => {
          // this.$showFailure(e);
          // let paraObj = {
          //   attr: 'dataApply',
          //   data: objectId,
          //   userName: this.userName,
          //   type: 'Object'
          // };
          // this.$utils.localStorage.removeDataApplication(paraObj);
          this.removeTableItem({ index: -1, objectId: objectId })
          this.$nextTick(() => {
            this.dataInit()
          })
        },
        para: {
          objectId: objectId,
        },
      })
      return result
    },
    removeTableItem({ index, objectId }) {
      const paraObj = {
        attr: 'dataApply',
        data: objectId,
        userName: this.userName,
        type: 'Object',
      }
      this.$utils.localStorage.removeDataApplication(paraObj)
      this.$bus.$emit('removeTableApplication')

      if (index !== -1) {
        this.applaTableData.splice(index, 1)
      }
    },
    skipToFinishedPage() {
      this.$router.push({
        name: 'finishedPage',
        path: '/main/finishedPage',
        query: {
          msgType: '001',
        },
      })
    },
  },
  watch: {},
}
