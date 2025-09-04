<template>
  <comments
    v-bind="$attrs"
    :showRate="true"
    :comments="commentList"
    :isManager="isManager"
    @submit="submitComment"
    @delete="deleteComment"
  />
</template>

<script>
import comments from '@/components/comment/index.vue'
import api from '../utils/api'
import HTTP from '@/http/main'
export default {
  name: 'CatalogComments',
  components: { comments },
  data() {
    return {
      commentList: [],
      isManager: false,
    }
  },
  props: {
    node: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  methods: {
    submitComment(data) {
      // console.log(data)
      if (data.star || data.content) {
        api
          .submitComment({
            catalogId: this.node.id,
            content: data.content,
            star: data.star,
            commentId: data.replyTo ? data.replyTo : undefined,
          })
          .then(res => {
            if (res.status === 200) {
              this.sendNotification(data)
              this.getComments()
              if (data.content) {
                this.$message.success(this.$t('assets.comment.submitSuccess'))
                this.$parent.getDirInfo(this.$parent.currentNode)
              } else if (data.star) {
                this.$message.success(this.$t('assets.comment.gradeSuccess'))
                this.$parent.getDirInfo(this.$parent.currentNode)
              }
            }
          })
          .catch(error => {
            this.$showFailure(error)
          })
      } else {
        this.$showFailure(this.$t('assets.comment.notEmpty'))
      }
    },
    deleteComment(id) {
      // console.log(id)
      api
        .deleteComment(id)
        .then(res => {
          // console.log(res)
          if (res.status === 200) {
            this.$message({
              type: 'success',
              message: this.$t('assets.common.deleteSuccess'),
            })
            this.getComments()
          } else {
            this.$showFailure(this.$t('assets.common.deleteFailure'))
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 评论
    getComments() {
      api.getCommentList(this.node.id).then(res => {
        this.isManager = res.data.manager
        const comments = res.data.comment || []
        const commentList = []
        comments.forEach(element => {
          const subComment = this.flatten(element.subComment)
          commentList.push({
            ...element,
            subComment: subComment.map(sub => ({
              ...sub,
              replyTo: (
                subComment.find(comment => comment.id === sub.commentId) ||
                element
              ).username,
            })),
          })
        })
        this.commentList = commentList.sort((a, b) => a.id - b.id)
      })
    },

    // 解析评论的回复信息
    flatten(sourceArray, flattenedArray = []) {
      for (const element of sourceArray) {
        if (
          Array.isArray(element.subComment) &&
          element.subComment.length > 0
        ) {
          flattenedArray.push({
            ...element,
            subComment: [],
          })
          this.flatten(element.subComment, flattenedArray)
        } else {
          flattenedArray.push(element)
        }
      }
      return flattenedArray
    },

    // 评论提交成功后，发送消息通知
    sendNotification(data) {
      const post = request => {
        const para = {
          type: 1100,
          title: `${this.$user.username}${this.$t(
            'assets.comment.replyTip'
          )}. ${$(data.text).text()}`,
          content: request.content,
          target: request.target,
        }
        if (request.type === 'at') {
          para.title = `${this.$user.username}${this.$t(
            'assets.comment.mentionTip'
          )}. ${$(data.text).text()}`
        }
        HTTP.sendNotification({
          para: para,
          succesedCallback: () => {},
        })
      }
      if (data.replyTo) {
        const request = {
          target: data.receiver,
          content: `${this.$user.username}${this.$t(
            'assets.comment.replyTip'
          )}，<a href="${location.href}?structureId=${
            this.node.structureId
          }&catalogId=${this.node.id}">${this.$t(
            'assets.comment.clickToCheck'
          )}</a>`,
        }
        post(request)
      }
      const dom = $(data.text).find('em:contains("@")')
      const messageOfReply = []
      for (let i = 0; i < dom.length; i++) {
        messageOfReply.push($(dom[i]).text().trim().slice(1))
      }
      messageOfReply.forEach(target => {
        const request = {
          content: `${this.$user.username}${this.$t(
            'assets.comment.mentionTip'
          )}，<a href="${location.href}">${this.$t(
            'assets.comment.clickToCheck'
          )}</a>`,
          target: target,
          type: 'at',
        }
        post(request)
      })
    },
  },
  watch: {
    node: {
      handler(node) {
        if (node && node.id) {
          this.getComments()
        }
      },
      immediate: true,
    },
  },
}
</script>

<style></style>
