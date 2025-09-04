<template>
  <div>
    <code-apply-data-tab
      :code="domainId"
      :applyData="true"
      :isField="isField"
    ></code-apply-data-tab>
  </div>
</template>
<script>
import codeApplyDataTab from './domainCodeCodeFromDomainApp/codeDetailTab.vue'
import HTTP from '@/resource/http'

export default {
  components: {
    codeApplyDataTab,
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
        console.log('val', val)
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
    getId() {
      this.$http
        .post(
          `/domain/flow/getIdByProcessInstanceId?processInstanceId=${this.commonData.processInstanceId}`
        )
        .then(res => {
          this.domainId = res.data
        })
    },
  },
}
</script>
