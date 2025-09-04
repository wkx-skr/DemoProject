<template>
  <div class="report-detail-show">
    <!-- :appTypes="appTypes" -->
    <edit-report
      ref="editReport"
      :dimensionOptions="dimensionOptions"
      :oldReportFormManage="objData"
      :dimMap="dimMap"
      :hasAccess="hasAccess"
      :getDataDemand="getDataDemand"
      :getDataSourceTree="getDataSourceTree"
      :indexTree="indexTree"
      :indexMap="indexMap"
      :showHeightAuto="true"
    ></edit-report>
  </div>
</template>

<script>
import editReport from '@/components/reportFormManage/editReportFormManageTab.vue'
export default {
  data() {
    return {
      dimensionOptions: [],
      dimMap: {},
      hasAccess: false,
      getDataDemand: null,
      getDataSourceTree: null,
      indexMap: {},
      indexTree: [],
    }
  },
  props: {
    objData: {
      type: Object,
      required: true,
    },
  },
  components: {
    editReport,
  },
  computed: {},
  beforeMount() {
    this.getDimensionOptions()
    this.setLoadDataDemand()
    this.setLoadDSTree()
    this.getIndexTree()
  },
  mounted() {},
  methods: {
    getDimensionOptions() {
      this.$http
        .get(this.$url + '/service/me/dims/catalogs')
        .then(res => {
          this.dimensionOptions = []
          if (res.data && Array.isArray(res.data)) {
            const arr = res.data
            arr.forEach((item, index) => {
              if (item.dimensionType === 'TIME') return
              const obj = {
                value: item.catalogId,
                label: item.catalog,
                dimensionType: item.dimensionType,
                children: [],
              }
              this.dimensionOptions.push(obj)
              this.getDimChil(item.catalogId, this.dimensionOptions.length - 1)
              this.dimMap[item.catalogId] = item
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDimChil(val, index) {
      this.$http
        .get(this.$url + '/service/me/dims/catalogs/' + val + '/dims')
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            const arr = res.data
            arr.forEach((item, index2) => {
              this.dimensionOptions[index].children.push({
                value: item.dimId,
                label: item.value,
              })
              this.dimMap[item.dimId] = item
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    setLoadDataDemand() {
      this.getDataDemand = this.$http.get(
        this.$url + '/service/dataRequirement/'
      )
    },
    setLoadDSTree() {
      this.getDataSourceTree = this.$http.get(
        this.$meta_url + '/models/modeltree'
      )
    },
    getIndexTree() {
      this.$http
        .get(this.$url + '/service/me/tree')
        .then(res => {
          this.indexMap = {}
          const count = 0
          const arr = res.data ? res.data.children : []
          const dealArr = arr => {
            const arr2 = []
            arr.forEach(item => {
              const obj = {}
              obj.type = item.type
              obj.name = item.name
              obj.disabled = item.type === 'FOLDER'
              obj.id = item.id
              this.indexMap[obj.id] = item
              if (item.children && item.children.length > 0) {
                obj.children = dealArr(item.children)
              }
              arr2.push(obj)
            })
            return arr2
          }
          if (arr && Array.isArray(arr)) {
            this.indexTree = dealArr(arr)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    refreshData() {
      if (this.$refs.editReport && this.$refs.editReport.dataInit) {
        this.$refs.editReport.dataInit()
      }
    },
  },
  watch: {},
}
</script>

<style lang="scss">
.report-detail-show {
  position: relative;
  width: 100%;
  // border: 1px solid red;
  min-height: 600px;
}
</style>
