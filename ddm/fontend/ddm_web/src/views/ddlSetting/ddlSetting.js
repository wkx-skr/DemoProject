import dbList from './dbList.vue'
import dbBoard from './dbBoard.vue'
import editDdlSetting from './editDdlSetting.vue'

export default {
  data () {
    return {
      currentTabData: null
    }
  },
  components: {
    dbList,
    dbBoard,
    editDdlSetting
  },
  props: {},
  beforeMount () {
  },
  mounted () {
  },
  methods: {
    editDdlSetting (para = {}) {
      let tab = {
        name: para.dbType,
        label: para.dbType
      }
      this.currentTabData = tab
      this.breadcrumbData = [`${para.dbType} DDL 配置`]
    },
    editSuccess () {
      this.goBack()
    },
    goBack (flushList = false) {
      this.currentTabData = null
      this.breadcrumbData = []

      if (flushList) {
        this.$refs.dbList?.refreshData()
      }
    }
  },
  watch: {},
  computed: {}
}
