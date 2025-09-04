<template>
  <div class="dashboard-item">
    <datablau-dialog
      :title="notiTabObj.title"
      :visible.sync="dialogVisibleNotiTabObj"
      width="600px"
      append-to-body
      :close-on-click-modal="false"
    >
      <check-notification
        :notification="notiTabObj"
        ref="checkNotification"
      ></check-notification>
      <span slot="footer">
        <datablau-button
          type="secondary"
          @click="hideMessageDetail"
        >
          关闭
        </datablau-button>
      </span>
    </datablau-dialog>
    <!--<div class="title-line">
      <span class="title">我的消息</span>
      <span class="table-count">（共{{ count }}条）</span>
      <datablau-button
        type="text"
        class="skip-btn"
        @click="checkMore"
      >
        查看更多
      </datablau-button>
    </div>-->
    <div class="table-container">
      <datablau-table
        v-loading="loading"
        :data="tableData"
        @row-click="handleRowClick"
        height="100%"
        row-class-name="dashboard-click-row"
        :show-header="false">
        <el-table-column
          :label="$t('userPane.inbox.subject')"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <template v-if="scope.row.isPublish">
              <span class="unread-icon" style="position: relative">
                <i class="iconfont icon-publish-news" style="color: #409EFF;position: relative;top:2px;"></i>
              </span>
            </template>
            <template v-else>
              <span v-if="scope.row.read" style="position: relative">
                <i class="iconfont icon-read" style="color: #999;position: relative;top:2px;"></i>
              </span>
                <span v-else class="unread-icon" style="position: relative">
                <i class="iconfont icon-unread" style="color: #409EFF;position: relative;top:2px;"></i>
              </span>
            </template>
            <span
              style="padding-left: 5px"
              :class="{ 'read-style': scope.row.read }"
            >
              {{ scope.row.title }}
            </span>
          </template>
        </el-table-column>
        <!--<el-table-column-->
        <!--  prop="taskName"-->
        <!--  show-overflow-tooltip-->
        <!--&gt;-->
        <!--  <template slot-scope="scope">-->
        <!--    <span class="table-import-column">-->
        <!--      {{ scope.row.title }}-->
        <!--    </span>-->
        <!--  </template>-->
        <!--</el-table-column>-->
        <el-table-column
          prop="createdOn"
          :formatter="$timeFormatter"
          show-overflow-tooltip
          width="130px"
        ></el-table-column>
        <template slot="empty">
          <div class="no-result-wrapper">
            <img :src="noresultImg" alt="" />
            <p>暂无数据</p>
          </div>
        </template>
      </datablau-table>
    </div>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import checkNotification from '@/views/notification/checkNotification.vue'
import sentImg from '@/assets/images/userCenter/sent.png'
import readImg from '@/assets/images/userCenter/read.png'
import unreadImg from '@/assets/images/userCenter/unread.png'
import noresultImg from './noresult.svg'
export default {
  name: 'dashboardMyMessage',
  data () {
    return {
      noresultImg,
      sentImg,
      readImg,
      unreadImg,
      loading: false,
      count: 0,
      tableData: [],
      dialogVisibleNotiTabObj: false,
      notiTabObj: {}
    }
  },
  components: {
    checkNotification
  },
  computed: {},
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      let para = {
        inbox: false,
        currentPage: 1,
        pageSize: 20,
        orderBy: 'createdOn',
        sort: false,
        isRead: false
      }
      let tableData = []
      let getAnnouncement = HTTP.getAnnouncement()
      let getMessageList = HTTP.getMessageList(para)
      Promise.all([getAnnouncement, getMessageList])
        .then((arr) => {
          let [res, data] = arr
          let announcement = res[0] || {}
          if (announcement.content || announcement.title) {
            announcement.isPublish = true
            tableData.unshift(announcement)
          }
          this.count = data.totalItems || 0
          this.$emit('getCount', this.count)
          tableData = tableData.concat(data.content)
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.tableData = tableData
          this.$nextTick(() => {
            this.loading = false
          })
        })
    },
    handleRowClick (obj) {
      this.notiTabObj = obj
      let getMessageDetails = obj.priority !== 1 ? HTTP.getMessageDetails(obj.id) : Promise.resolve(obj)
      getMessageDetails
        .then(res => {
          this.notiTabObj = res
          this.dialogVisibleNotiTabObj = true
          setTimeout(() => {
            this.$refs.checkNotification.dataInit()
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    hideMessageDetail () {
      this.dialogVisibleNotiTabObj = false
    },
    checkMore () {
      this.$router.push({
        name: 'myMessage'
      })
    }
  },
  watch: {
    dialogVisibleNotiTabObj (newVal) {
      if (!newVal) {
        this.dataInit()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import './dashboardBase.scss';
</style>
