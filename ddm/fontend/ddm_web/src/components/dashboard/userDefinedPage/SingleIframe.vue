<template>
  <div class="container" :key="pageKey">
    <div v-if="isSingleIframe" class="container">
      <iframe
        :src="iframeSrc"
        frameborder="0"
        style="width: 100%; height: 100%"
      ></iframe>
    </div>
    <full-dashboard
      v-else
      :en-name="dashboardName"
      :ch-name="dashboardChName"
    ></full-dashboard>
  </div>
</template>

<script>
import UserPageService from '@service/userPage/UserPageService'
import UserPageType from '@constant/UserPageType'
import fullDashboard from '@/view/dashboard5.7/api/fullDashboard.vue'
export default {
  components: {
    fullDashboard
  },
  mounted () {
    this.loadSetting()
  },
  methods: {
    loadSetting () {
      const userPages = UserPageService.userPages
      const routeName = this.$route.name
      userPages.forEach(page => {
        if (page.enName === routeName) {
          if (page.pageType === UserPageType.Iframe) {
            this.iframeSrc = page.iframeSrc
            this.isSingleIframe = true
          } else if (page.pageType === UserPageType.Dashboard) {
            this.iframeSrc = ''
            this.dashboardName = page.enName
            this.dashboardChName = page.chName
            this.isSingleIframe = false
          }
        }
      })
    }
  },
  data () {
    return {
      isSingleIframe: true,
      iframeSrc: '',
      dashboardName: '',
      dashboardChName: '',
      pageKey: 0
    }
  },
  watch: {
    $route () {
      this.loadSetting()
    }
  }
}
</script>
<style scoped>
.container {
  height: 100%;
}
</style>
