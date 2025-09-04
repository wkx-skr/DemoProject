<template>
  <div :style="{color:colorFormatter}"><span class="dot" :style="{background:colorFormatter}"></span>{{textFormatter}}</div>
</template>
<script>
export default {
  props: {
    type: {
      type: String,
      default: 'doing'
    }
  },
  data () {
    return {

    }
  },
  methods: {
  },
  mounted () {
  },
  computed: {
    colorFormatter () {
      switch (this.type.toLowerCase()) {
        case 'process_generating':
          return '#4386f5'
        case 'generating':
          return '#c1c1c1'
        case 'generated':
          return '#c1c1c1'
        case 'rejected':
        case 'failed':
          return '#f84b58'
        case 'approved':
          return '#6fcc88'
        case 'auditing':
          return '#8c5dff'
        default:
          return ''
      }
    },
    textFormatter () {
      switch (this.type.toLowerCase()) {
        case 'process_generating':
          return this.$store.state.$v.report.process_generating
        case 'generating':
          return this.$store.state.$v.report.generating
        case 'generated':
          return this.$store.state.$v.report.generated
        case 'rejected':
          return this.$store.state.$v.report.rejected
        case 'failed':
          return this.$store.state.$v.report.failed
        case 'approved':
          return this.$store.state.$v.report.approved
        case 'auditing':
          return this.$store.state.$v.report.auditing
        default:
          return ''
      }
    }
  },
  watch: {

  }
}
</script>
<style lang="scss" scoped>
.dot {
  display:inline-block;
  width:6px;
  height:6px;
  border-radius:3px;
  margin-right:.6em;
  vertical-align: top;
  margin-top:9px;
}
</style>
