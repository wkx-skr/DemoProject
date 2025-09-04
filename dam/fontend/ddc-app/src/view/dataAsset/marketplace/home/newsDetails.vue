<template>
  <div class="news-details">
    <div class="news-breadcrumb">
      <datablau-breadcrumb
        :nodeData="breadcrumbNodes"
        @back="goBack"
      ></datablau-breadcrumb>
    </div>
    <div class="news-body">
      <div class="news-head">
        <p class="title">{{ newsDetails.subject }}</p>
        <p class="info">
          <span>创建人：{{ newsDetails.creator }}</span>
          <span style="margin-left: 24px">
            更新时间：{{ newsDetails.updateTime }}
          </span>
        </p>
      </div>
      <div v-html="newsDetails.content" style="padding: 24px 16px"></div>
    </div>
  </div>
</template>

<script>
import api from '../../utils/api'
export default {
  name: 'NewsDetails',
  data() {
    return {
      newsDetails: {},
      breadcrumbNodes: ['公告信息'],
    }
  },
  mounted() {
    const newsId = this.$route.query.id
    api.getNoticeDetails(newsId).then(res => {
      this.newsDetails = res.data.data
      this.breadcrumbNodes.push(this.newsDetails.subject)
    })
  },
  methods: {
    goBack() {
      window.close()
    },
  },
}
</script>

<style lang="scss" scoped>
.news-details {
  width: 100%;
  height: 100%;
  padding-left: 16px;
  padding-right: 16px;

  .news-breadcrumb {
    padding-top: 8px;
    padding-bottom: 8px;
  }

  .news-body {
    height: calc(100% - 64px);
    padding-left: 16px;
    padding-right: 16px;
    background: #fff;

    .news-head {
      height: 115px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid #f7f8fb;

      .title {
        font-size: 24px;
        color: #354f7b;
      }
      .info {
        font-size: 13px;
        color: #7c89a8;
        margin-top: 4px;
      }
    }
  }
}
</style>
