<template>
  <standard-scan
    v-if="domainId && udps"
    :domain-id="domainId"
    :udps="udps"
    :label-text="labelText()"
    @base-dom="setBaseDom"
  ></standard-scan>
</template>
<script>
import standardScan from './domainDetailPages/standardScanBasic.vue'
import $version from '@/resource/version.json'

export default {
  data() {
    return {
      udps: {},
      domainId: '',
      $version
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
  mounted() {
  },
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
  methods: {
    labelText() {
      let obj = {
        typeName: '数据标准',
        standard: this.$version.domain.propertyType.standard,
        domainCode: this.$version.domain.property.domainCode,
        status: '标准状态',
        name: '标准名称',
        nameAbbr: '标准',
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
