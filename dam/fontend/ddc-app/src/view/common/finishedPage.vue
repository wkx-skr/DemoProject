<template>
  <div class="finised-page">
    <div class="center-box">
      <div class="message-box">
        <div class="message-item" v-show="msgType === '001'">
          信息发送成功，请等待管理员回复。
          <p class="back-index-part">
            点击
            <span class="back-btn" @click="skip2InfoPage">返回</span>
            ，回到消息页
          </p>
        </div>
        <div class="message-item" v-show="msgType === '002'">
          信息回复成功。
          <p class="back-index-part">
            点击
            <span class="back-btn" @click="skip2InfoPage">返回</span>
            ，回到消息页
          </p>
        </div>
        <div v-show="msgType === '003'" class="created-view">
          <p class="message-item">视图创建成功。</p>
          <p class="back-msg" v-if="messageId">
            点击
            <span class="back-btn" @click="skip2CheckAppli">返回</span>
            ，继续回复权限申请信息。
          </p>
          <p class="back-msg" v-else-if="tablePath">
            点击
            <span class="back-btn" @click="skip2TableDtail">返回</span>
            ，继续查看表信息。
          </p>
          <p class="back-msg" v-else>
            点击
            <span class="back-btn" @click="skip2Index">返回</span>
            ，回到首页
          </p>
        </div>
        <p class="message-item" v-show="msgType === '004'">未发现视图</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      msgType: '001',
      messageId: '',
      tablePath: '',
    }
  },
  components: {},
  computed: {},
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      const query = this.$route.query
      if (query) {
        this.msgType = query.msgType
        this.messageId = query.messageId
        this.tablePath = query.tablePath
      }
    },
    skip2CheckAppli() {
      if (!this.messageId) {
        return
      }
      this.$router.push({
        name: 'checkApplication',
        path: '/main/checkApplication',
        query: { messageId: this.messageId },
      })
    },
    skip2TableDtail() {},
    skip2Index() {
      this.$router.push({ name: 'home' })
      this.showDetail = false
      this.showNews = false
    },
    skip2InfoPage() {
      this.$router.push({
        name: 'notification',
      })
    },
  },
  watch: {},
}
</script>

<style lang="scss">
@import '../../assets/styles/constForDDC.sass';
.finised-page {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f4f4f4;
  .center-box {
    margin: 0 auto;
    position: relative;
    max-width: 1240px;
    width: 100%;
    margin: 0 auto;
    height: 100%;
    .message-box {
      position: absolute;
      top: 20px;
      bottom: 20px;
      left: 0;
      right: 0;
      background-color: #fff;
      font-size: 18px;
      text-align: center;
      .message-item {
        padding: 40px 0 0 20px;
      }
      .created-view {
      }
      .back-msg,
      .back-index-part {
        font-size: 12px;
        padding-top: 20px;
        .back-btn {
          color: $textBtnBlue;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
