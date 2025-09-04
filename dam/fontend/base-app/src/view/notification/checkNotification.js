import HTTP from '@/http/main.js'
import NotificationController from "../../../../base-components/http/baseController/NotificationController";
export default {
  data() {
    return {
      notifi: {
        source: '',
        target: '',
        title: '',
        message: '',
        type: '',
        content: '',
      },
      message: '',
      changeData: [],
      viewChangedData: [],
      defaultNoti: true,

      // 申请被拒绝
      rejectTableDataArr: [],
      rejectTableNameArr: [],
    }
  },
  props: {
    notification: {
      type: [String, Object],
      required: true,
    },
  },
  components: {},
  computed: {},
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      if (this.notification) {
        if (this.notification.id || this.notification.id === 0) {
          NotificationController.getNotification({id: this.notification.id}).then(res => {
            const data = res.data
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
                    objectId: item,
                  }
                  HTTP.getTableDetail({
                    succesedCallback: data => {
                      rejectTableDataArr.push(data)
                    },
                    failureCallback: e => {
                      this.$showFailure(e)
                    },
                    para: obj,
                  })
                })
                this.rejectTableDataArr = rejectTableDataArr
              }
            }
            if (this.defaultNoti) {
              this.message = data.content
            }
          }).catch(e => {
            this.$showFailure(e)
          })
        }
      }
    },
    skipToTable(tableObjectId) {
      this.$router.push({
        name: '',
        path: '',
        query: '',
      })
    },
    skip2View(item) {
      if (item.viewId) {
        this.$router.push({
          name: 'dataShow',
          query: {
            viewId: item.viewId,
          },
        })
      }
    },
    gotoProblemDetail(id) {
      this.$skip2({
        name: 'dataQualityRepairJob',
        query: {
          id: id,
        },
      })
    },
  },
  watch: {},
}
