import api from '../utils/api'
import NoticeDetails from './noticeDetails.vue'
export default {
  name: 'NoticeManage',
  components: { NoticeDetails },
  data() {
    return {
      noticeList: [],
      showNoticeDetails: false,
      pagination: {
        total: 0,
        currentPage: 1,
        pageSize: 20,
      },
      currentDetails: {},
      detailEditable: false,
    }
  },
  mounted() {
    this.getNoticeList()
  },
  methods: {
    // 获取公告列表
    getNoticeList(defaultParams = {}) {
      const params = {
        pageNo: this.pagination.currentPage,
        pageSize: this.pagination.pageSize,
        ...defaultParams,
      }
      api.getNoticeList(params).then(res => {
        const data = res.data.data
        this.pagination.total = data.totalItems
        this.pagination.currentPage = data.currentPage
        this.pagination.pageSize = data.pageSize
        this.noticeList = data.content.map(notice => ({
          name: notice.subject,
          updateTime: notice.updateTime,
          creator: notice.creator,
          id: notice.id,
          cover: notice.coverImgFileId,
          content: notice.content,
          status: notice.status || 'UNPUBLISH',
        }))
      })
    },
    handleSizeChange(pageSize) {
      this.getNoticeList({ pageSize, pageNo: 1 })
    },
    handleCurrentChange(pageNo) {
      this.getNoticeList({ pageNo })
    },
    seeDetails(row) {
      api.getNoticeDetails(row.id).then(res => {
        if (res.data.status === 200) {
          const data = res.data.data
          this.currentDetails = {
            id: data.id,
            content: data.content,
            cover: data.coverImgFileId,
            name: data.subject,
            creator: data.creator,
            updateTime: data.updateTime,
          }
          this.showNoticeDetails = true
          this.detailEditable = false
        }
      })
    },
    editDetails(row) {
      api.getNoticeDetails(row.id).then(res => {
        if (res.data.status === 200) {
          const data = res.data.data
          this.currentDetails = {
            id: data.id,
            content: data.content,
            cover: data.coverImgFileId,
            name: data.subject,
            creator: data.creator,
            updateTime: data.updateTime,
          }
          this.showNoticeDetails = true
          this.detailEditable = true
        }
      })
    },
    addNotice() {
      this.currentDetails = {}
      this.showNoticeDetails = true
      this.detailEditable = true
    },
    // 发布公告
    publishNotice(row) {
      api
        .publishNotice(row.id)
        .then(res => {
          if (res.data.status === 200) {
            this.$blauShowSuccess('发布成功')
            this.getNoticeList()
          } else {
            this.$blauShowFailure('发布失败')
          }
        })
        .catch(error => {
          this.$blauShowFailure(error)
        })
    },
    // 下线公告
    offlineNotice(row) {
      api
        .offlineNotice(row.id)
        .then(res => {
          if (res.data.status === 200) {
            this.$blauShowSuccess('下线成功')
            this.getNoticeList()
          } else {
            this.$blauShowFailure('下线失败')
          }
        })
        .catch(error => {
          this.$blauShowFailure(error)
        })
    },
    // 删除公告信息
    deleteNotice(row) {
      this.$DatablauCofirm(
        `删除【${row.name}】为不可逆操作，是否确定删除？`,
        '删除公告信息'
      ).then(() => {
        api
          .deleteNotice(row.id)
          .then(res => {
            if (res.data.status === 200) {
              this.$blauShowSuccess('删除成功')
              this.getNoticeList()
            } else {
              this.$blauShowFailure('删除失败')
            }
          })
          .catch(error => {
            this.$blauFailure(error)
          })
      })
    },
    goBack() {
      this.showNoticeDetails = false
      this.getNoticeList()
    },
  },
}
