<template>
  <div>
    <code-detail-tab
      :code="domainId"
      :udps="udps"
      :isField="isField"
    ></code-detail-tab>
  </div>
</template>
<script>
import codeDetailTab from './domainCodeCodeFromDomainApp/codeDetailTab.vue'
import HTTP from '@/resource/http'
export default {
  components: {
    codeDetailTab,
  },
  props: {
    commonData: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      domainId: '',
      udps: [],
      typeIds: 1,
      isField: false,
    }
  },
  mounted() {
  },
  watch: {
    commonData: {
      handler(val) {
        if (val.processInstanceId) {
          this.getId()
        }
        if (val.processType?.includes('领域')) {
          this.isField = true
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    getUdps() {
      HTTP.getUpds({domainId: this.domainId, standardCode: true})
        .then(res => {
          let data = res
          if (data && Array.isArray(data)) {
            data = data.filter(item => {
              return this.isField
                ? item.bindFolderId - 0 !== 1
                : item.bindFolderId - 0 === 1
            })
          } else {
            data = []
          }
          this.udps = data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getId() {
      this.$http
        .post(
          `/domain/flow/getIdByProcessInstanceId?processInstanceId=${this.commonData.processInstanceId}`
        )
        .then(res => {
          this.domainId = res.data
          this.getUdps()
        })
    },
  },
}
</script>
