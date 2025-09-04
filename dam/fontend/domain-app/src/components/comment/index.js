/**
 * 评论组件入口：
 * 需传递的属性有：
 *  1. comments：评论列表，数据格式为两级树结构，如：
*   [
      {
        "id": 23,
        "commentId": 0,
        "content": "||||<p>评论A</p>",
        "username": "sunyuxia",
        "createTime": "2022-10-08T17:27:10.66",
        "subComment": [
          {
            "id": 24,
            "commentId": 23,
            "content": "sunyuxia||||<p>评论B（回复评论A）</p>",
            "username": "admin",
            "createTime": "2022-10-08T17:28:38.592",
            "replyTo": "admin", // 被评论内容的作者
          },
          {
            "id": 25,
            "commentId": 24,
            "content": "admin||||<p>评论C（回复评论B）</p>",
            "username": "admin",
            "createTime": "2022-10-08T17:37:24.641",
            "replyTo": "admin",
          }
        ]
      }
    ]
    2. showRate: 是否展示评分
    需定义的事件有：
    1. submit：提交评论，如果需进行消息通知，则在提交评论的逻辑中添加消息通知的逻辑，提交评论时，组件输出的参数为：
      {
        content:"admin||||<p>大大大大大大</p>", // 评论内容，包括评论的作者及评论文字
        createOn:1665221844813, // 评论时间
        receiver:"admin", // 被评论内容的作者
        replyTo:24, // 评论的对象，如果为0，表示一级评论，如果不为0，表示对某条评论的评论
        star:null, // 评分
        text:"<p>大大大大大大</p>", // 评论的文字
      }
    2. delete：删除评论
 */
import 'quill/dist/quill.snow.css'
import commentTextArea from './commentTextArea.vue'
import CommentItem from './item.vue'
import UserInformationService from '@service/UserInformationService'
export default {
  components: { commentTextArea, CommentItem },
  name: 'comment',
  props: {
    onlyList: {
      type: Boolean,
      default: false,
    },
    comments: {
      type: Array,
      default() {
        return []
      },
    },
    showRate: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      commentsJSON: [],
      commentsList: [],
      commentsDisplay: [],
      textAreaPosition: undefined,
      listKey: 0,
      users: [],
      thread: null,
      star: 0,
    }
  },
  methods: {
    moveTextArea(id) {
      this.textAreaPosition = id || null
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

      this.commentsList = _.cloneDeep(this.commentsJSON)
      this.commentsList.sort((a, b) => {
        return a.time - b.time
      })
      const rootComment = {}
      this.commentsList.forEach(item => {
        if (!item.pId) {
          item.children = []
          rootComment[item.id] = item
        }
      })
      this.commentsList.forEach(item => {
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
        this.commentsList
          .map(i => i.name)
          .concat(this.commentsList.map(i => i.receiver).filter(i => i))
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
    async submit(comment) {
      const timeStamp = new Date().getTime()
      if (comment.text.length) {
        comment.content = comment.text
      } else {
        comment.content = ''
      }
      const requestBody = {
        ...comment,
        content: comment.content,
        replyTo: comment.to ? comment.to : null,
        createOn: timeStamp,
        star: comment.star === 0 ? null : comment.star,
      }
      await this.$emit('submit', requestBody)
    },
    handleSetMyRate(value) {
      this.star = value
    },
  },
}
