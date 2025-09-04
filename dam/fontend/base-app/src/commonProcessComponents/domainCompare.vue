<template>
  <!--  <standard-scan
    v-if="domainId && udps"
    :domain-id="domainId"
    :udps="udps"
    @updating-domain-id="setUpdatingDomainId"
    @base-dom="setBaseDom"
  ></standard-scan>-->
  <div>
    <el-row :gutter="10" style="padding-top: 10px">
      <el-col :span="12">
        <div
          style="
            width: 450px;
            height: 34px;
            line-height: 34px;
            background: #f5f5f5;
            text-align: center;
          "
        >
          {{ $t('userPane.myTodo.beforeChange') }}
        </div>
        <standard-scan
          v-if="commonData.processInstanceId && udps"
          :processInstanceId="commonData.processInstanceId"
          :label-text="labelText()"
          :udps="udps"
          :is-index="isIndex"
          @updating-domain-id="setUpdatingDomainId"
          @base-dom="setBaseDom"
        ></standard-scan>
      </el-col>
      <el-col :span="12">
        <div
          style="
            width: 450px;
            height: 34px;
            line-height: 34px;
            color: #66bf16;
            background: rgba(102, 191, 22, 0.1);
            text-align: center;
          "
        >
          {{ $t('userPane.myTodo.afterChange') }}

          <!--<div
            class="green-checkbox"
            style="
              font-size: 12px;
              position: relative;
              top: -34px;
              right: -168px;
            "
          >
            <el-checkbox v-model="checkBoxValueTrue"></el-checkbox>
            仅显示修改
          </div>-->
        </div>
        <standard-scan
          v-if="domainId && udps && initCompareDataOver"
          :domain-id="domainId"
          :compare-data="compareData"
          :compare-addi-data="compareAdditionalProperties"
          :label-text="labelText()"
          :udps="udps"
          :is-index="isIndex"
          :base-dom="baseDom"
        ></standard-scan>
      </el-col>
    </el-row>
    <div class="form-outer"></div>
  </div>
</template>
<script>
import HTTP from '@/http/main'
import standardScan from './domainDetailPages/standardScanBasic.vue'
export default {
  data() {
    return {
      udps: {},
      compareAdditionalProperties: [],
      compareData: null,
      initCompareDataOver: false,
      domainId: '',
      updatingDomainId: '',
      baseDom: null,
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
          this.initCompareData().finally(() => {
            this.initCompareDataOver = true
          })
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
    getId() {
      this.$http
        .post(
          `/domain/flow/getIdByProcessInstanceId?processInstanceId=${this.commonData.processInstanceId}`
        )
        .then(res => {
          this.domainId = res.data
        })
    },
    // todo --zl
    setUpdatingDomainId(domainId) {
      this.updatingDomainId = domainId
    },
    setBaseDom(dom) {
      this.baseDom = dom
    },
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
    async initCompareData() {
      const processInstanceId = this.commonData.processInstanceId
      let url = `/domain/flow/domain/getProcessDetail?processInstanceId=${processInstanceId}`
      let res = await this.$http.post(url).catch(err => {
        console.error(err)
        return { data: {} }
      })
      this.compareData = res.data
      const getUdps = async categoryId => {
        return this.$http
          .post(`/domain/domains/udp/getUdps`, { categoryId })
          .then(res => {
            if (Array.isArray(res.data)) {
              this.udps = res.data
              this.getUdpCurrent()
            }
          })
      }
      await getUdps(this.compareData.categoryId)
    },
    getUdpCurrent() {
      const propertiesObj = this.compareData.additionalProperties || []

      const additionPropertiesMap = new Map()
      propertiesObj.forEach(item => {
        additionPropertiesMap.set(item[0], item)
      })

      const finalPropertiesObj = []
      this.udps.length &&
        this.udps.forEach(item => {
          if (additionPropertiesMap.has(item.udpId)) {
            finalPropertiesObj.push(additionPropertiesMap.get(item.udpId))
          } else {
            finalPropertiesObj.push([item.udpId, ''])
          }
        })

      this.compareAdditionalProperties = []
      finalPropertiesObj.forEach(e => {
        if (this.udps.filter(item => item.udpId === parseInt(e[0])).length) {
          const obj = {
            name: this.udps.filter(item => item.udpId === parseInt(e[0]))[0]
              .name,
            value: e[1],
            catalog: this.udps.filter(item => item.udpId === parseInt(e[0]))[0]
              .catalog,
          }
          this.compareAdditionalProperties.push(obj)
        }
      })
    },
  },
}
</script>
