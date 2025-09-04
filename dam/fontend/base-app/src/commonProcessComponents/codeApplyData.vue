<template>
  <div>
    <code-detail-tab
      key="codeApplyData"
      :code="domainId"
      :applyData="true"
      :isField="isField"
      :processInstanceId="processInstanceId"
    ></code-detail-tab>
  </div>
</template>
<script>
import codeDetailTab from './domainCodeCodeFromDomainApp/codeDetailTab.vue'
import HTTP from '@/http/main.js'
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
      processInstanceId: '',
    }
  },
  mounted() {},
  watch: {
    commonData: {
      handler(val) {
        console.log('val', val)
        if (val.processInstanceId) {
          this.getId()
          this.processInstanceId = val.processInstanceId
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
