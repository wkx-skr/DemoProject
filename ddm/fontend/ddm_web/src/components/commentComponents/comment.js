import 'quill/dist/quill.snow.css'
import commentTextArea from './commentTextArea.vue'
import $ from 'jquery'
import _ from 'lodash'
import string from '@/resource/utils/string'
import HTTP from '@/resource/http'
export default {
  components: { commentTextArea },
  name: 'comment',
  props: {
    showRate: {
      type: Boolean,
      default: true
    },
    objectId: {
      type: [String, Number],
      required: true
    },
    typeId: {
      type: [String, Number],
      // required: true,
      default: '1'
    }
  },
  data () {
    return {
      commentsJSON: [
        {
          id: 1,
          name: '张员工',
          time: 1548352940000,
          content: '编辑好的评论显示在这里'
        },
        {
          id: 2,
          pId: 1,
          receiver: '张员工',
          name: '李员工',
          time: 1548353940000,
          content: '编辑好的评论显示在这里编辑好的评论显示在这里'
        },
        {
          id: 3,
          name: '王员工',
          time: 1548353040000,
          content: '编辑好的评论显示在这里编辑好的评论显示在这里'
        }
      ],
      comments: [],
      commentsDisplay: [],
      textAreaPosition: undefined,
      listKey: 0,
      users: [],
      usersLoaded: false,

      thread: null,
      myObjectRate: null
    }
  },
  beforeMount () {
    this.string = string
  },
  mounted () {
    this.commentsJSON = JSON.parse(localStorage.getItem('tmp_table_comments'))
    if (!this.commentsJSON) {
      this.commentsJSON = []
    }
    // this.getAllUsers()
    this.getThread()
    if (this.showRate) {
      this.getMyRate()
    }
  },
  methods: {
    deleteMessage (messageId) {
      this.$http.delete(this.$url + `/service/thread/messages/${messageId}`).then(res => {
        this.getThread()
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    createMessage (message) {
      let threadId = this.thread.thread.tId
      let replyTo = null
      let timeStamp = new Date().getTime()
      if (message.receiver) {
        message.content = message.receiver + '||||' + message.text
      } else {
        message.content = '||||' + message.text
      }
      let requestBody = {
        message: {
          content: message.content,
          replyTo: message.to ? message.to : null,
          createOn: timeStamp
        }

      }
      this.$http.put(this.$url + `/service/thread/${threadId}`, requestBody).then(res => {
        this.getThread()
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    getMessages () { // no use
      let threadId = this.thread.thread.tId
      this.$http.get(this.$url + `/service/thread/${threadId}/messages`)
    },
    getThread () {
      let objectId = this.objectId
      let typeId = this.typeId
      this.$http.get(this.$url + `/service/thread/types/${typeId}/objects/${objectId}?size=1000`).then(res => {
        this.thread = res.data
        this.listKey++
        // this.getMessages();
        this.handleComments()
      }).catch(e => {
        // this.$showFailure(e);
        if (e.response.data.rootErrorMessage === 'Cannot find the topic' || e.response.data.rootErrorMessage === '找不到对应的话题') {
          this.createThread()
        }
      })
    },
    createThread () {
      let requestBody = {
        thread: {
          threadType: this.typeId,
          attachedObjectId: this.objectId,
          topic: '表的评论'
        },
        message: {
          'content': '我是任意内容，前端任意存储',
          createOn: 1,
          replyTo: 999999999999999
        }
      }
      this.$http.post(this.$url + '/service/thread/', requestBody).then(res => {
        this.getThread()
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    // getAllUsers () {
    //   this.$http.get(this.$url + `/service/main/users`)
    //     .then((res) => {
    //       this.users = res.data
    //       this.usersLoaded = true
    //     })
    //     .catch(e => {
    //     // this.$showFailure(e);
    //       console.log(e)
    //     })
    // },
    moveTextArea (id) {
      this.textAreaPosition = id
    },
    handleComments () {
      let messages = this.thread.messages.content
      let commentsJSON = []
      let messageCreatorMap = new Map()
      messages.forEach(item => {
        messageCreatorMap.set(item.mId, item.creator)
      })
      messages.forEach(item => {
        let result = {
          id: item.mId,
          name: item.creator,
          time: item.createOn,
          content: item.content.split('||||')[1]
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
      let rootComment = {}
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
      let result = this.commentsDisplay
      for (let i in rootComment) {
        let item = rootComment[i]
        item.isRoot = true
        result.push(item)
        item.children.forEach(item => {
          item.isRoot = false
          result.push(item)
        })
      }
    },
    sendNotification (data) {
      let post = request => {
        let para = {
          type: 1100,
          title: `${this.$store.state.user.username}${this.$store.state.$v.report.replyYou}. ${$(data.text).text()}`,
          content: request.content,
          target: request.target
        }
        if (request.type === 'at') {
          para.title = `${this.$store.state.user.username}${this.$store.state.$v.report.atYou}. ${$(data.text).text()}`
        }
        // HTTP.sendNotification({
        //   para:para,
        //   succesedCallback:()=>{
        //
        //   },
        // })
      }
      if (data.receiver) {
        let request = {
          target: data.receiver,
          content: `${this.$store.state.user.username}${this.$store.state.$v.report.replyYou}，<a href="${location.href}">${this.$store.state.$v.report.clickTo}</a>`
        }
        post(request)
      }
      {
        let dom = $(data.text).find('em:contains("@")')
        let messageOfReply = []
        for (let i = 0; i < dom.length; i++) {
          messageOfReply.push($(dom[i]).text().trim().slice(1))
        }
        messageOfReply.forEach(target => {
          let request = {
            content: `${this.$store.state.user.username}${this.$store.state.$v.report.atYou}，<a href="${location.href}">${this.$store.state.$v.report.clickTo}</a>`,
            target: target,
            type: 'at'
          }
          post(request)
        })
      }
    },
    submit (data) {
      this.sendNotification(data)
      this.createMessage(data)
    },
    deleteComment (id) {
      this.$confirm(this.$store.state.$v.report.sureDelComment, this.$store.state.$v.modelDetail.tips, {
        type: 'warning'
      }).then(() => {
        this.deleteMessage(id)
      }).catch(() => {

      })
    },
    getMyRate () {
      HTTP.getUserRate({
        id: Number.parseInt(this.objectId.slice(8)),
        successCallback: data => {
          this.myObjectRate = data
        }
      })
    },
    handleSetMyRate (value) {
      const id = Number.parseInt(this.objectId.slice(8))
      HTTP.submitRate({
        rate: value,
        id: id,
        successCallback: data => {
          this.getMyRate()
          this.$message.success(this.$store.state.$v.report.rateSubmitSuccess)
          this.$emit('rateSubmitSuccess')
          this.$bus.$emit('updateRate', {
            rate: value,
            id: id
          })
          this.$bus.$emit('updateListRate', {
            rate: value,
            modelId: +this.$route.query.id
          })
        }
      })
    }
  },
  watch: {
    showRate (newVal) {
      if (newVal) {
        this.getMyRate()
      }
    }
  }
}
