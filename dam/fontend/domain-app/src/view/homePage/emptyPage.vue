<template>
  <div></div>
</template>

<script>
import HTTP from '@/http/main.js'
export default {
  created() {
    if (this.$route.query.judgeBy === 'version') {
      this.tipVersion()
    }
  },
  methods: {
    tipVersion() {
      this.$confirm(
        this.$t('common.access.noVersionAccess'),
        this.$t('common.access.title'),
        {
          type: 'error',
          showCancelButton: false,
          closeOnPressEscape: false,
          closeOnHashChange: false,
          closeOnClickModal: false,
          showClose: false,
          confirmButtonText: window.opener
            ? this.$t('common.access.confirm')
            : this.$t('common.access.cancel'),
        }
      ).then(() => {
        window.opener ? window.close() : HTTP.logout()
      })
    },
  },
}
</script>

<style scoped></style>
