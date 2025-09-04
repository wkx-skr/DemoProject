import reportDs from './reportDs.vue'
import reFile from './reFile.vue'
import reMetaModel from './reMetaModel.vue'
import reDatasource from './reDatasource.vue'

export default {
  props: [
    'tagTree',
    'tagMap',
    'dsEditing',
    'editRow',
    'isReport',
    'isFile',
    'isShareFile',
    'isMetaModel',
  ],
  data() {
    return {}
  },
  components: { reportDs, reFile, reDatasource, reMetaModel },
  computed: {
    pathArr() {
      let arr = [this.$t('common.page.dataResource')]
      if (!this.dsEditing) {
        arr.push(this.$t('meta.dataSource.addRe'))
      } else {
        arr.push(this.editRowData.definition)
      }
      return arr
    },
  },
  mounted() {},
  beforeDestroy() {},
  methods: {
    removetab() {
      this.$emit('removeReTab')
    },
    backClick() {
      this.removetab()
    },
    // 报表数据源
    handleCreateReport() {
      if (this.$refs.reportDs && this.$refs.reportDs.confirmPost) {
        this.$refs.reportDs.confirmPost()
      }
    },
    reportTest(reportTest) {
      this.reportTestSucceeded = reportTest
    },
    fileTest(fileTest) {
      this.fileTestSucceeded = fileTest
    },
    createdReportJob() {
      this.$emit('reportDsCreated')
      this.removetab()
    },
    createdMetaModelJob() {},
    createFile() {
      this.$emit('reportDsCreated')
      this.removetab()
    },
  },
  watch: {
    editRow: {
      handler: function (newVal) {
        if (newVal && this.dsEditing) {
          this.editRowData = newVal
        }
      },
      immediate: true,
    },
  },
}
