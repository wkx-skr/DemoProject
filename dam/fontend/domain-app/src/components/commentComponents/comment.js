import 'quill/dist/quill.snow.css'
import commentTextArea from './commentTextArea.vue'
import HTTP from '@/http/main'
import UserInformationService from '@service/UserInformationService'
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
      default: '1',
    },
    typeCategoryId: {
      type: [String, Number],
      default: '1',
    },
  },
  data() {
    return {
      commentsJSON: [],
      comments: [],
      commentsDisplay: [],
      textAreaPosition: undefined,
      listKey: 0,
      users: [],
      usersLoaded: false,

      thread: null,
      myObjectRate: null,
      createdThread: false,
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
        .post(
          this.$baseurl + `/thread/updateThread?threadId=${threadId}`,
          requestBody
        )
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
      // let objectId = this.objectId;
      const typeId = this.typeId
      let objectId

      if (this.objectId === undefined) {
        objectId = this.$route.query.domain
      } else {
        objectId = this.objectId
      }
      const url =
        typeId === 80010066
          ? this.$baseurl +
            `/thread/getItems?itemId=${typeId}/${objectId}&pageSize=1000`
          : this.$baseurl +
            `/thread/getThreadMessageByObject?typeId=${typeId}&objectId=${objectId}&pageSize=${1000}`
      this.$http
        .post(url)
        .then(res => {
          this.thread = res.data
          this.listKey++
          // this.getMessages();
          this.handleComments()
        })
        .catch(e => {
          if (
            !this.createdThread &&
            (e.response.data.errorMessage === '找不到对应的话题' ||
              e.response.data.errorMessage === 'thNotFindThread')
          ) {
            this.createThread()
          } else {
            // this.$showFailure(e);
          }
        })
    },
    createThread() {
      const requestBody = {
        thread: {
          threadType: this.typeId === 80010066 ? 2 : this.typeId,
          itemId:
            this.typeId === 80010066
              ? `${this.typeId}/${this.objectId || this.$route.query.domain}`
              : '',
          attachedObjectId: this.typeId === 80010066 ? '' : this.objectId,
          topic: '表的评论',
        },
        message: {
          content: '我是任意内容，前端任意存储',
          createOn: 1,
          replyTo: 999999999999999,
        },
      }
      this.$http
        .post(this.$baseurl + '/thread/createThread', requestBody)
        .then(res => {
          this.createdThread = true
          this.getThread()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getAllUsers() {
      this.users = []
      this.usersLoaded = true
      // this.$http
      //   .post(this.$url + '/service/org/groups/page', {
      //     currentPage: 1,
      //     fullUserName: '',
      //     pageSize: 100,
      //     username: '',
      //   })
      //   .then(res => {
      //     this.users = res.data.content
      //     this.usersLoaded = true
      //   })
      //   .catch(e => {
      // this.$showFailure(e);
      // console.log(e)
      // })
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
      UserInformationService.getUsernames(
        this.comments
          .map(i => i.name)
          .concat(this.comments.map(i => i.receiver).filter(i => i))
      ).then(map => {
        setTimeout(() => {
          this.commentsDisplay.forEach(item => {
            if (map.has(item.name)) {
              this.$set(item, 'displayName', map.get(item.name))
            } else {
              this.$set(item, 'displayName', item.name)
            }
            if (map.has(item.receiver)) {
              this.$set(item, 'displayReceiver', map.get(item.receiver))
            } else {
              this.$set(item, 'displayReceiver', item.receiver)
            }
          })
        })
      })
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
        // let request = {
        //   target:data.receiver,
        //   content:`${this.$user.username}回复了你的评论，<a href="${location.href}">点击查看</a>`
        // }
        // post(request);
        if (this.typeId === 80010066) {
          if (this.typeCategoryId === 80010066) {
            const request = {
              target: data.receiver,
              content: `${this.$user.username}回复了你的评论，<a href="${
                location.href + '?domain=' + this.objectId
              }">点击查看</a>`,
            }
            post(request)
          } else if (this.typeCategoryId === 82800003) {
            const request = {
              target: data.receiver,
              content: `${this.$user.username}回复了你的评论，<a href="${
                location.href + '?domain=' + this.objectId
              }">点击查看</a>`,
            }
            post(request)
          }
        } else if (this.typeId === '82800002') {
          const herf = location.href
          const request = {
            target: data.receiver,
            content: `${this.$user.username}回复了你的评论，<a href="${herf}">点击查看</a>`,
          }
          post(request)
        } else {
          const request = {
            target: data.receiver,
            content: `${this.$user.username}回复了你的评论，<a href="${location.href}">点击查看</a>`,
          }
          post(request)
        }
      }
      {
        const dom = $(data.text).find('em:contains("@")')
        const messageOfReply = []
        for (let i = 0; i < dom.length; i++) {
          messageOfReply.push($(dom[i]).text().trim().slice(1))
        }
        messageOfReply.forEach(target => {
          if (this.typeId === 80010066) {
            if (this.typeCategoryId === 80010066) {
              const request = {
                content: `${this.$user.username}回复了你的评论，<a href="${
                  location.href + '?domain=' + this.objectId
                }">点击查看</a>`,
                target: target,
                type: 'at',
              }
              post(request)
            } else if (this.typeCategoryId === 82800003) {
              const request = {
                content: `${this.$user.username}回复了你的评论，<a href="${
                  location.href + '?domain=' + this.objectId
                }">点击查看</a>`,
                target: target,
                type: 'at',
              }
              post(request)
            }
          } else if (this.typeId === '82800002') {
            const herf = location.href.replace(/objectId/, 'id')
            const request = {
              content: `${this.$user.username}回复了你的评论，<a href="${herf}">点击查看</a>`,
              target: target,
              type: 'at',
            }
            post(request)
          } else {
            const request = {
              content: `${this.$user.username}在评论中@了你，<a href="${location.href}">点击查看</a>`,
              target: target,
              type: 'at',
            }
            post(request)
          }
        })
      }
    },
    // 提交评论
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
          this.textAreaPosition = null
          this.deleteMessage(id)
        })
        .catch(() => {})
    },
    getMyRate() {
      const para = {
        objId: this.objectId || this.$route.query.domain,
        typeId: this.typeId === 80010066 ? this.typeCategoryId : this.typeId,
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
        objId: this.objectId || this.$route.query.domain,
        typeId: this.typeId === 80010066 ? this.typeCategoryId : this.typeId,
        value: value,
      }
      HTTP.setMyRate({
        succesedCallback: data => {
          this.getMyRate()
          this.$message.success(this.$t('meta.DS.tableDetail.submitScore'))
          this.$emit('rateSubmitSuccess')
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
