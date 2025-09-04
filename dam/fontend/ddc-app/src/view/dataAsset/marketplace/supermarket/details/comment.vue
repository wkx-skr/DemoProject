<template>
  <div class="asset-comment">
    <comment
      v-bind="$attrs"
      :showRate="true"
      :comments="commentList"
      :isManager="isManager"
      @submit="submitComment"
      @delete="deleteComment"
      @close="close"
    />
  </div>
</template>

<script>
import Comment from '@/components/commentDrawer/index.vue'
import api from '../../../utils/api'
import { formatTreeData, typeIdMap } from '../../../utils/methods'
export default {
  name: 'AssetComment',
  data() {
    return {
      commentList: [],
      isManager: false,
      thread: {},
      node: {},
      commentsMap: [],
      userMap: {},
    }
  },
  props: {
    objectId: {
      type: Number,
    },
    assetType: {
      type: String,
      default: '',
    },
    typeId: {
      type: Number,
    },
    assetId: {
      type: String,
      default: '',
    },
    structureId: {
      type: [String, Number],
      default: '',
    },
  },
  components: { Comment },
  methods: {
    async readAll() {
      // 清除某资产的所有未读
      api
        .setAllReadByAsset({
          type: this.assetType,
          objectId: this.objectId,
          assetId: this.assetId,
          id: this.assetId,
          structureId: this.assetType === 'catalog' ? this.structureId : '',
        })
        .then(res => {
          this.$parent.getNotReadNum()
        })
    },
    submitCatalogComment(data) {
      api
        .submitComment({
          catalogId: this.assetId,
          content: data.content,
          star: data.star,
          assetId: 'catalog' + this.assetId,
          commentId: data.replyTo ? data.replyTo : undefined,
        })
        .then(res => {
          if (res.status === 200) {
            this.sendNotification(data)
            this.getComments()
            if (data.content) {
              this.$message.success(this.$t('assets.comment.submitSuccess'))
            } else if (data.star) {
              this.$message.success(this.$t('assets.comment.gradeSuccess'))
              this.$emit('update')
            }
          }
        })
        .catch(error => {
          this.$showFailure(error)
        })
    },
    submitObjectComment(data) {
      if (data.receiver) {
        data.content = data.receiver + '||||' + data.text
      } else {
        data.content = '||||' + data.text
      }
      // console.log(data)
      const apiArr = []
      if (data.star) {
        api
          .submitAssetStar({
            objId: Number(this.objectId),
            star: data.star || 0,
            typeId: this.typeId,
            assetId: this.assetId,
          })
          .then(res => {
            if (res.status === 200) {
              if (data.content === '||||') {
                this.$message.success(this.$t('assets.comment.gradeSuccess'))
              }
              // 更新详情的评分
              this.$emit('update')
            }
          })
      }
      if (data.content !== '||||') {
        api
          .submitAssetComment({
            threadId: this.thread.tId,
            message: {
              message: {
                content: data.content,
                replyTo: data.replyTo,
                createOn: data.createOn,
              },
            },
          })
          .then(res => {
            if (res.status === 200) {
              this.$message.success(this.$t('assets.comment.submitSuccess'))
              this.sendNotification(data)
              this.getObjectComments()
            }
          })
      }
    },
    submitComment(data) {
      if (data.star || data.content) {
        // if (this.assetType === 'catalog') {
        //   this.submitCatalogComment(data)
        // } else {
        //   this.submitObjectComment(data)
        // }
        this.submitObjectComment(data)
      } else {
        this.$showFailure(this.$t('assets.comment.notEmpty'))
      }
    },
    deleteComment(id) {
      let apiRes = null
      // if (this.assetType !== 'catalog') {
      //   apiRes = api.deleteAssetsComment(id)
      // } else {
      //   apiRes = api.deleteComment(id)
      // }
      apiRes = api.deleteAssetsComment(id)
      apiRes
        .then(res => {
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
    handleComments(comments, userMap) {
      const commentList = []
      comments.forEach(element => {
        const subComment = this.flatten(element.subComment || [])

        commentList.push({
          ...element,
          subComment: subComment.map(sub => {
            const replyTo =
              this.commentsMap.find(comment => comment.mId == sub.replyTo) ||
              element
            return {
              ...sub,
              replyTo: `${userMap[replyTo.creator]}`,
            }
          }),
        })
      })
      this.commentList = commentList.sort((a, b) => a.id - b.id)
    },
    getCatalogComments() {
      api.getCommentList(this.assetId).then(res => {
        this.isManager = res.data.manager
        const comments = res.data.comment
        // console.log(comments)
        this.handleComments(comments)
      })
    },
    getObjectComments() {
      this.$http
        .post(
          this.$base_url +
            `/thread/getAssetThreadMessage?size=1000&assetId=${this.assetId}`
        )
        .then(res => {
          this.thread = res.data.thread
          const comments = (res.data.messages.content || []).filter(
            element => element.content.split('||||')[1]
          )
          this.commentsMap = comments
          console.log(comments)
          if (comments) {
            if (comments.length) {
              const userMap = { [this.$user.username]: this.$user.fullName }
              this.$http
                .post(
                  '/user/usermanagement/user/getUsersByUsernames',
                  comments.map(c => c.creator)
                )
                .then(res => {
                  res.data.forEach(user => {
                    userMap[user.username] = user.firstName
                    this.handleComments(
                      formatTreeData(
                        comments
                          .filter(
                            c =>
                              !c.replyTo ||
                              (c.replyTo &&
                                comments.some(i => i.mId === c.replyTo))
                          )
                          .map(c => ({
                            ...c,
                            content: c.content.split('||||')[1],
                            username: c.creator,
                            fullName: userMap[c.creator],
                            createTime: this.$timeFormatter(c.createOn),
                            id: c.mId,
                            // replyUsername:
                          })),
                        'mId',
                        'replyTo',
                        'subComment'
                      ),
                      userMap
                    )
                  })
                  this.userMap = userMap
                })
            } else {
              this.commentList = []
            }
          }
        })
        .catch(e => {
          if (
            e.response.data.errorMessage === '找不到对应的话题' ||
            e.response.data.errorMessage === 'thNotFindThread'
          ) {
            this.createThread()
          }
        })
    },
    getComments() {
      // if (this.assetType === 'catalog') {
      //   this.getCatalogComments()
      // } else {
      //   this.getObjectComments()
      // }
      this.getObjectComments()
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

    createThread() {
      const requestBody = {
        thread: {
          threadType: this.typeId,
          itemId: Number(this.objectId),
          assetId: this.assetId,
          attachedObjectId: Number(this.objectId),
          topic: '表的评论',
        },
        message: {
          content: '我是任意内容，前端任意存储',
          createOn: 1,
          replyTo: 999999999999999,
        },
      }
      this.$http
        .post(this.$base_url + '/thread/createThread', requestBody)
        .then(res => {
          this.getObjectComments()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    // 评论提交成功后，发送消息通知
    sendNotification(data) {
      console.log(data)
      const post = request => {
        const para = {
          type: 1100,
          title: `${this.$user.username}${this.$t(
            'assets.comment.replyTip'
          )}. ${data.text}`,
          content: request.content,
          target: request.target,
          assetId: this.assetId,
          objectId: Number(this.objectId),
        }
        if (request.type === 'at') {
          para.title = `${this.$user.username}${this.$t(
            'assets.comment.mentionTip'
          )}. ${data.text}`
        }
        this.$http.post(`/base/notifications/createNotification`, para)
      }
      if (data.replyTo) {
        let content = ''
        if (this.assetType === 'catalog') {
          content = `${this.$user.username}${this.$t(
            'assets.comment.replyTip'
          )}，<a href="${location.href}?structureId=${
            this.node.structureId
          }&catalogId=${this.node.id}">${this.$t(
            'assets.comment.clickToCheck'
          )}</a>`
        } else {
          content = `${this.$user.username}${this.$t(
            'assets.comment.replyTip'
          )}，<a href="${location.href}">${this.$t(
            'assets.comment.clickToCheck'
          )}</a>`
        }
        const request = {
          target: data.receiver,
          content,
        }
        post(request)
        if (data.receiver === this.$user.username) {
          console.log('自己评论自己')
        }
      }
      // const dom = $(data.text).find('em:contains("@")')
      // console.log(dom)
      // const messageOfReply = []
      // for (let i = 0; i < dom.length; i++) {
      //   messageOfReply.push($(dom[i]).text().trim().slice(1))
      // }
      // messageOfReply.forEach(target => {
      //   const request = {
      //     content: `${this.$user.username}${this.$t(
      //       'assets.comment.mentionTip'
      //     )}，<a href="${location.href}">${this.$t(
      //       'assets.comment.clickToCheck'
      //     )}</a>`,
      //     target: target,
      //     type: 'at',
      //   }
      //   post(request)
      // })
    },
    getCatalogDetail() {
      api.getDirDetails(this.assetId).then(res => {
        this.node = res.data.data
      })
    },
    async close() {
      this.$emit('close')
    },
  },
  watch: {
    assetId: {
      handler() {
        if (this.assetId) {
          if (this.assetType === 'catalog') {
          }

          this.getComments()
          this.readAll()
        }
      },
      immediate: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.asset-comment {
  z-index: 9999;
  position: fixed;
  bottom: 58px;
  right: 10px;
  width: 480px;
  height: 640px;
  background: radial-gradient(rgba(60, 100, 240, 0.1), rgba(255, 255, 255, 0.1))
    linear-gradient(
      180deg,
      rgba(60, 100, 240, 0.1),
      rgba(255, 255, 255, 0.1) 41%,
      rgba(255, 255, 255, 0.1) 41%,
      rgba(255, 255, 255, 0.1) 41%
    );
  border: 1px solid #ffffff;
  border-radius: 8px;
  box-shadow: 0px 2px 14px 0px rgba(118, 174, 231, 0.16);
  backdrop-filter: blur(20px);
}
</style>
