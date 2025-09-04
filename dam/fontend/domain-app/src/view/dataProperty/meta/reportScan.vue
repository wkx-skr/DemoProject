<template>
  <div class="asset-report-scan-component">
    <report-form v-if="reportId" :hideBreadcrumbs="true"></report-form>
  </div>
</template>

<script>
import reportForm from '@/view/myItem/reportForm/reportForm.vue'

export default {
  name: 'reportScan',
  data() {
    return {
      reportId: '',
    }
  },
  components: { reportForm },
  computed: {},
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      // console.log('dataInit')
      let object = this.$route.query || {}
      if (object && object.objectId) {
        this.reportId = object.objectId
        this.changePage(this.reportId)
      }
      // this.$router.replace()
    },
    changePage(reportId) {
      let obj = JSON.parse(JSON.stringify(this.$route.query))
      Object.assign(obj, { reportId: reportId })
      this.$router.replace({
        query: obj,
      })
    },
  },
  watch: {},
}
</script>

<style lang="scss" scoped>
@mixin absPos() {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.asset-report-scan-component {
  @include absPos();
  top: 40px;
}
</style>
