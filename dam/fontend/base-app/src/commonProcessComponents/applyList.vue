<template>
  <standard-scan
    v-if="domainId && udps"
    :domain-id="domainId"
    :udps="udps"
    :label-text="labelText()"
    @base-dom="setBaseDom"
    :is-index="isIndex"
  ></standard-scan>
</template>
<script>
import standardScan from './domainDetailPages/standardScanBasic.vue'
export default {
  data() {
    return {
      udps: {},
      domainId: '',
    }
  },
  components: {
    standardScan,
  },
  props: {
    commonData: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  mounted() {},
  watch: {
    commonData: {
      handler(val) {
        if (val.processInstanceId) {
          this.getId()
        }
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    isIndex() {
      return this.commonData.processType.startsWith('指标标准')
    },
  },
  methods: {
    labelText() {
      let obj = {
        typeName: this.$t('domain.common.dataStandard'),
        standard: this.$version.domain.propertyType.standard,
        domainCode: this.$version.domain.property.domainCode,
        status: this.$t('domain.common.standardStatus'),
        name: this.$t('domain.common.domainName'),
        nameAbbr: this.$t('domain.common.standard'),
      }
      if (this.commonData.processType.startsWith('指标标准')) {
        obj = {
          typeName: this.$t('domain.common.indicator'),
          standard: this.$t('domain.common.indicatorInformation'),
          domainCode: this.$t('domain.common.indicatorCoding'),
          status: this.$t('domain.common.indicatorStatus'),
          name: this.$t('domain.common.indicatorName'),
          nameAbbr: this.$t('domain.common.indicator'),
        }
      }
      return obj
    },
    getId() {
      this.$http
        .post(
          `/domain/flow/getIdByProcessInstanceId?processInstanceId=${this.commonData.processInstanceId}`
        )
        .then(res => {
          this.domainId = res.data
        })
    },
    setBaseDom(dom) {
      // this.baseDom = dom
    },
  },
}
</script>
