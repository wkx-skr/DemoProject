<template>
  <div>
    <div v-if="isMultiple">
      <datablau-subtab
        :tabs="[
          { name: 'before', label: '修改前' },
          { name: 'after', label: '修改后' },
        ]"
        :current="1"
        show-name="label"
        @change="changeSubType"
        style="margin-top: 10px"
      ></datablau-subtab>
      <div style="height: 300px; overflow-y: auto; overflow-x: hidden">
        <view-detail
          v-if="
            decodeReady &&
            requirementReady &&
            udpReady &&
            currentTab === 'before'
          "
          :form-data="formData"
          :requirement-option="requirementOption"
          :udps="udps"
          :index-page="indexPage"
        ></view-detail>
        <view-detail
          v-if="
            decodeReadyAfter &&
            requirementReady &&
            udpReady &&
            currentTab === 'after'
          "
          :form-data="formDataAfter"
          :requirement-option="requirementOption"
          :udps="udps"
          :index-page="indexPage"
        ></view-detail>
      </div>
    </div>
    <view-detail
      v-else-if="decodeReady && requirementReady && udpReady"
      :form-data="formData"
      :requirement-option="requirementOption"
      :udps="udps"
      :index-page="indexPage"
    ></view-detail>
  </div>
</template>

<script>
import ViewDetail from '@/dataWarehouse/views/dataIndex/indexManagement/indexDefinition/viewDetail.vue'
import _ from 'lodash'
import { IndexType } from '@/dataWarehouse/views/dataIndex/indexManagement/indexDefinition/class/Enum'
import HTTP from '@/dataWarehouse/resource/http.js'
import { CategoryId } from '@/dataWarehouse/views/dataIndex/indexManagement/indexDefinition/entrance/Constant'

export default {
  components: {
    ViewDetail
  },
  props: {
    rawData: {
      required: true
    }
  },
  mounted () {
    this.domainId = this.rawData.itemId
    this.getDomain(() => {
      this.decodeData(this.formData)
      this.getUdps()
      this.decodeReady = true
    })
    this.getRequirementData()
  },
  data () {
    return {
      indexPage: 0,
      requirementOption: [],
      udps: [],
      formData: {},
      formDataAfter: {},
      domainId: null,
      ready: false,
      decodeReady: false,
      decodeReadyAfter: false,
      requirementReady: false,
      udpReady: false,
      currentTab: 'after'
    }
  },
  computed: {
    isMultiple () {
      return (
        this.rawData.processType === '指标标准_修改' &&
        (this.$route.query.currentNav === 'myTodo' ||
          this.$route.name === 'homePage')
      )
    }
  },
  methods: {
    changeSubType (val) {
      this.currentTab = val.name
    },
    // 获取需求列表
    getRequirementData () {
      let url = `${this.$domains}requirementmanagement/getall`
      this.$http
        .post(url)
        .then(res => {
          let data = _.cloneDeep(res.data)
          data.map(item => {
            if (item.name.length > 21) {
              item.name = item.name.slice(0, 20) + '...'
            }
          })
          this.requirementOption = data
          this.requirementReady = true
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getUdps () {
      HTTP.getUpds({ categoryId: CategoryId[this.indexPage] })
        .then(res => {
          let data = res.data
          if (data && Array.isArray(data)) {
          } else {
            data = []
          }
          this.udps = data
          this.udpReady = true
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDomain (callback) {
      this.$http
        .post(`${this.$domains}domains/domain/getDomainById`, {
          domainId: this.domainId
        })
        .then(res => {
          this.formData = res.data
          if (this.formData.categoryId === 6) {
            this.indexPage = 1
          }
          if (callback) {
            callback()
          }
          if (res.data.updatingDomainId) {
            this.$http
              .post(`${this.$domains}domains/domain/getDomainById`, {
                domainId: res.data.updatingDomainId
              })
              .then(res => {
                this.formDataAfter = res.data
                this.decodeData(this.formDataAfter)
                this.decodeReadyAfter = true
              })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    decodeData (formData) {
      // if (
      //   this.formData.additionalProperties &&
      //   Array.isArray(this.formData.additionalProperties)
      // ) {
      //   this.formData.additionalProperties.forEach(e => {
      //     this.additionalPropertiesObj[e[0]] = e[1]
      //   })
      //   this.additionalPropertiesObjInitial = _.cloneDeep(
      //     this.additionalPropertiesObj
      //   )
      // }
      formData.metricType = IndexType[formData.metricType]
      if (formData.metricType === IndexType.DERIVE) {
        if (!formData.relationDomain || formData.relationDomain.length === 0) {
          formData.relationDomain = ['']
        }
      }
      if (formData.takeEffectDate && formData.expireDate) {
        this.dateRange = [formData.takeEffectDate, formData.expireDate]
      }
      if (
        formData.relationDimensionValues &&
        formData.relationDimensionValues.length
      ) {
        this.dimForm = formData.relationDimensionValues
      }
      if (formData.modifierRefs) {
        this.modifierRefs = formData.modifierRefs.map(i => {
          return {
            id: i.id,
            type: i.modifierType,
            code: i.code,
            name: i.name
          }
        })
      }
      if (formData.timeModifierRefs) {
        if (formData.timeModifierRefs.length === 1) {
          const first = formData.timeModifierRefs[0]
          this.timeModifierRef = {
            id: first.id,
            type: first.modifierType,
            code: first.code,
            name: first.name
          }
        }
      }
    }
  }
}
</script>

<style scoped></style>
