import 'quill/dist/quill.snow.css'
import commentTextArea from './commentTextArea.vue'
import HTTP from '../../../http/main'
export default {
  components: { commentTextArea },
  name: 'comment',
  props: {
    showRate: {
      type: Boolean,
      default: false,
    },
    objectId: {
      type: [String, Number],
      required: true,
    },
    typeId: {
      type: [String, Number],
      // required: true,
      default: '1',
    },
    metadata: {
      type: Boolean,
    },
  },
  data() {
    return {
      commentsJSON: [
        {
          id: 1,
          name: '张员工',
          time: 1548352940000,
          content: '编辑好的评论显示在这里',
        },
        {
          id: 2,
          pId: 1,
          receiver: '张员工',
          name: '李员工',
          time: 1548353940000,
          content: '编辑好的评论显示在这里编辑好的评论显示在这里',
        },
        {
          id: 3,
          name: '王员工',
          time: 1548353040000,
          content: '编辑好的评论显示在这里编辑好的评论显示在这里',
        },
      ],
      comments: [],
      commentsDisplay: [],
      textAreaPosition: undefined,
      listKey: 0,
      users: [],
      usersLoaded: false,

      thread: null,
      myObjectRate: null,
    }
  },
  mounted() {
    this.commentsJSON = JSON.parse(localStorage.getItem('tmp_table_comments'))
    if (!this.commentsJSON) {
      this.commentsJSON = []
    }
    this.getAllUsers()
    this.getThread()
    if (this.showRate) {
      this.getMyRate()
    }
  },
  methods: {
    deleteMessage(messageId) {
      this.$http
        .post(this.$url + `/thread/deleteMessage?messageId=${messageId}`)
        .then(res => {
          this.getThread()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    createMessage(message) {
      const threadId = this.thread.thread.tId
      const replyTo = null
      const timeStamp = new Date().getTime()
      if (message.receiver) {
        message.content = message.receiver + '||||' + message.text
      } else {
        message.content = '||||' + message.text
      }
      const requestBody = {
        message: {
          content: message.content,
          replyTo: message.to ? message.to : null,
          createOn: timeStamp,
        },
      }
      this.$http
        .put(this.$url + `/service/thread/${threadId}`, requestBody)
        .then(res => {
          this.getThread()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getMessages() {
      // no use
      const threadId = this.thread.thread.tId
      this.$http.get(this.$url + `/service/thread/${threadId}/messages`)
    },
    getThread() {
      const objectId = this.objectId
      const typeId = this.typeId
      /* this.$http
        .post(
          this.$url +
            `/service/thread/types/${typeId}/objects/${objectId}?size=1000`
        ) */
      this.$http
        .post(
          this.$url +
            `/thread/getThreadMessageByObject?size=1000&objectId=${objectId}&typeId=${objectId}`
        )
        // http://127.0.0.1:8070/base//thread/getThreadMessageByObject?size=1000&objectId=1400209&typeId=80000004
        .then(res => {
          this.thread = res.data
          this.listKey++
          // this.getMessages();
          this.handleComments()
        })
        .catch(e => {
          // this.$showFailure(e);
          if (e.response.data.errorMessage === '找不到对应的话题') {
            this.createThread()
          }
        })
    },
    createThread() {
      const requestBody = {
        thread: {
          threadType: this.typeId,
          attachedObjectId: this.objectId,
          topic: '表的评论',
        },
        message: {
          content: '我是任意内容，前端任意存储',
          createOn: 1,
          replyTo: 999999999999999,
        },
      }
      this.$http
        .post(this.$url + '/service/thread/', requestBody)
        .then(res => {
          this.getThread()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getAllUsers() {
      this.$http
        .get(this.$url + '/service/main/users')
        .then(res => {
          this.users = res.data
          this.usersLoaded = true
        })
        .catch(e => {
          // this.$showFailure(e);
          console.log(e)
        })
    },
    moveTextArea(id) {
      this.textAreaPosition = id
    },
    handleComments() {
      const messages = this.thread.messages.content
      const commentsJSON = []
      const messageCreatorMap = new Map()
      messages.forEach(item => {
        messageCreatorMap.set(item.mId, item.creator)
      })
      messages.forEach(item => {
        const result = {
          id: item.mId,
          name: item.creator,
          time: item.createOn,
          content: item.content.split('||||')[1],
        }
        if (item.replyTo) {
          result.pId = item.replyTo
          result.receiver = item.content.split('||||')[0]
        }
        commentsJSON.push(result)
      })
      this.commentsJSON = commentsJSON

      this.comments = _.cloneDeep(this.commentsJSON)
      this.comments.sort((a, b) => {
        return a.time - b.time
      })
      const rootComment = {}
      this.comments.forEach(item => {
        if (!item.pId) {
          item.children = []
          rootComment[item.id] = item
        }
      })
      this.comments.forEach(item => {
        if (item.pId && rootComment[item.pId]) {
          rootComment[item.pId].children.push(item)
        }
      })
      this.commentsDisplay.length = 0
      const result = this.commentsDisplay
      for (const i in rootComment) {
        const item = rootComment[i]
        item.isRoot = true
        result.push(item)
        item.children.forEach(item => {
          item.isRoot = false
          result.push(item)
        })
      }
    },
    sendNotification(data) {
      const post = request => {
        const para = {
          type: 1100,
          title: `${this.$user.username}回复了你的评论. ${$(data.text).text()}`,
          content: request.content,
          target: request.target,
        }
        if (request.type === 'at') {
          para.title = `${this.$user.username}在评论中@了你. ${$(
            data.text
          ).text()}`
        }
        HTTP.sendNotification({
          para: para,
          succesedCallback: () => {},
        })
      }
      if (data.receiver) {
        const request = {
          target: data.receiver,
          content: `${this.$user.username}回复了你的评论，<a href="${
            location.pathname + location.hash
          }">点击查看</a>`,
        }
        post(request)
      }
      {
        const dom = $(data.text).find('em:contains("@")')
        const messageOfReply = []
        for (let i = 0; i < dom.length; i++) {
          messageOfReply.push($(dom[i]).text().trim().slice(1))
        }
        messageOfReply.forEach(target => {
          const request = {
            content: `${this.$user.username}在评论中@了你，<a href="${location.hash}">点击查看</a>`,
            target: target,
            type: 'at',
          }
          post(request)
        })
      }
    },
    submit(data) {
      this.sendNotification(data)
      this.createMessage(data)
      return

      let body = null
      if (data.to) {
        body = {
          pId: data.to,
          id: this.$user.username + timeStamp,
          receiver: data.receiver,
          name: this.$user.username,
          time: timeStamp,
          content: data.text,
        }
      } else {
        body = {
          id: this.$user.username + timeStamp,
          name: this.$user.username,
          time: timeStamp,
          content: data.text,
        }
      }
      this.commentsJSON.push(body)
      this.handleComments()
    },
    deleteComment(id) {
      this.$confirm(
        this.$t('assets.comment.deleteTip'),
        this.$t('domain.common.tip'),
        {
          type: 'warning',
        }
      )
        .then(() => {
          this.deleteMessage(id)
        })
        .catch(() => {})
    },
    getMyRate() {
      const para = {
        objId: this.objectId,
        typeId: this.typeId,
      }
      HTTP.getMyRate({
        succesedCallback: data => {
          this.myObjectRate = data
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
        para: para,
      })
    },
    handleSetMyRate(value) {
      const para = {
        objId: this.objectId,
        typeId: this.typeId,
        value: value,
      }
      HTTP.setMyRate({
        succesedCallback: data => {
          this.getMyRate()
          this.$message.success(this.$t('meta.DS.tableDetail.submitScore'))
          this.$emit('rateSubmitSuccess')
          if (this.metadata && this.metadata === true) {
            this.$emit('getProp')
          }
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
        para: para,
      })
    },
  },
  watch: {
    showRate(newVal) {
      if (newVal) {
        this.getMyRate()
      }
    },
  },
}
