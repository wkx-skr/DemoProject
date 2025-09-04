<template>
  <standard-detail
    ref="standardDetail"
    style="
      position: absolute;
      height: auto;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    "
    :options="creDomOpt"
    :udps="udps"
    :defaultPublic="defaultPublic"
    :useWorkflow="useWorkflow"
    @domainCreated="handleCreateDomain"
    :labelText="labelText"
    :getDataTypeOptionsPromise="getDataTypeOptionsPromise"
    :columnTabArr="columnTabArr"
    @back="back"
    :typeIds="typeIds"
  ></standard-detail>
</template>

<script>
import HTTP from '@/http/main.js'
import standardDetail from '@/view/newDataStandard/standardDetail.vue'
export default {
  data() {
    return {
      defaultPublic: false,
      getDataTypeOptionsPromise: null,
      typeIds: 1,
    }
  },
  components: {
    standardDetail,
  },
  props: {
    columnTabArr: {
      type: Array,
      required: true,
    },
    columnData: {
      type: Object,
    },
    creDomOpt: {
      type: Array,
    },
    udps: {
      type: Array,
      required: true,
    },
    clusterId: {
      required: true,
    },
    selectionColumns: {
      type: Array,
      required: true,
    },
    getColumnsData: {
      type: Function,
      required: true,
    },
    getPrecision: {
      type: Function,
      required: true,
    },
  },
  created() {
    this.getDataTypeOptionsPromise = HTTP.getSelectionOptions({
      requestBody: {category: 'DOMAIN', names: ['数据类型']},
    })
  },
  computed: {
    labelText() {
      let obj = {}
      if (this.typeIds === 3) {
        obj = {
          typeName: this.$t('domain.common.dataDictionary'),
          standard: this.$t('domain.common.dictionaryInformation'),
          domainCode: this.$t('domain.common.dictionaryEncoding'),
          status: this.$t('domain.common.dictionaryState'),
          name: this.$t('domain.common.dictionaryName'),
          nameAbbr: this.$t('domain.common.dictionary'),
        }
      } else if (this.typeIds === 2) {
        obj = {
          typeName: this.$t('domain.common.indicator'),
          standard: this.$t('domain.common.indicatorInformation'),
          domainCode: this.$t('domain.common.indicatorCoding'),
          status: this.$t('domain.common.indicatorStatus'),
          name: this.$t('domain.common.indicatorName'),
          nameAbbr: this.$t('domain.common.indicator'),
        }
      } else {
        obj = {
          typeName: this.$t('domain.common.dataStandard'),
          standard: this.$version.domain.propertyType.standard,
          domainCode: this.$version.domain.property.domainCode,
          status: this.$t('domain.common.standardStatus'),
          name: this.$t('domain.common.domainName'),
          nameAbbr: this.$t('domain.common.standard'),
        }
      }

      return obj
    },
    useWorkflow() {
      return !!(
        this.$workflowStatus &&
        this.$workflowStatus.workflow_enable &&
        this.$workflowStatus.workflow_domain_enable
      )
    },
  },
  mounted() {
    this.dataInit()
  },
  methods: {
    back() {
      this.$emit('back')
    },
    dataInit() {
      this.setDefaultValue()
    },
    handleCreateDomain(domain) {
      const selection = [...this.selectionColumns]
      this.$emit(
        'handleCreateDomain',
        domain,
        this.clusterId,
        this.columnData,
        selection
      )
    },
    setDefaultValue() {
      const column = this.columnData
      const value = {
        domainCode: 'dc_' + parseInt(Math.random() * 1000),
        domainChName: column.logicalName,
        domainEnName: column.physicalName,
        description: column.definition,
        domainAbbr: this.getAbbr(column.physicalName),
        dataType: this.getDataTyep(column.properties.DataType),
        dataScale: this.getDataScale(column.properties.DataType),
        dataPrecision: this.getPrecision(column.properties.DataType),
      }
      const ids = []
      this.selectionColumns.forEach(item => {
        ids.push(item.objectId)
      })
      this.getColumnsData(ids)
        .then(res => {
          const defaultValue = this.getDefaultValue(value, res)
          this.$refs.standardDetail.setDefault(defaultValue)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDataTyep(DataType) {
      let result = ''
      if (!DataType) {
        result = ''
      } else {
        const index = DataType.indexOf('(')
        result = DataType.slice(0, index)
      }
      return result.toUpperCase()
    },
    getDataScale(DataType) {
      const str = DataType
      let result = ''
      if (!str) {
        result = ''
      }
      const start = str.indexOf('(')
      const comma = str.indexOf(',')
      const end = str.indexOf(')')
      if (start == -1) {
        result = ''
      }
      if (comma == -1 && end != -1) {
        result = str.slice(start + 1, end)
      }
      if (start != -1 && comma != -1 && comma < end) {
        result = str.slice(start + 1, comma)
      }
      if (result) {
        result = result - 0
        if (isNaN(result)) {
          result = ''
        }
      }
      return result
    },
    getAbbr(eName) {
      let result = eName
      while (result.indexOf(' ') !== -1) {
        result = result.replace(' ', '_')
      }
      return result
    },
    getDefaultValue(value, colData) {
      const result = _.clone(value)
      const ids = Object.keys(colData)
      const datatypeMap = {}
      // domainCode,domainChName,domainEnName,description,domainAbbr,dataType,dataScale,dataPrecision,
      for (let i = 0, len = ids.length; i < len; i++) {
        const currentCol = colData[ids[i]] || {}
        if (!result.domainChName) {
          result.domainChName = currentCol.logicalName || ''
        }
        if (!result.description) {
          result.description = currentCol.definition || ''
        }
        if (!result.domainAbbr) {
          // English abbreviation
          result.domainAbbr = this.getAbbr(currentCol.physicalName) || ''
        }
        const currentDataType =
          this.getDataTyep(currentCol.properties.DataType) || ''
        if (!datatypeMap[currentDataType]) {
          datatypeMap[currentDataType] = 0
        }
        datatypeMap[currentDataType]++
        const currentDataScale = this.getDataScale(
          currentCol.properties.DataType
        )
        if (
          (currentDataScale && !result.dataScale) ||
          result.dataScale < currentDataScale
        ) {
          result.dataScale = currentDataScale
        }
        const currentPrecision = this.getPrecision(
          currentCol.properties.DataType
        )
        if (
          (currentPrecision && !result.dataPrecision) ||
          result.dataPrecision < currentPrecision
        ) {
          result.dataPrecision = currentPrecision
        }
      }
      // get data type
      let typeResult = ''
      let maxCount = 0
      for (const key in datatypeMap) {
        if (datatypeMap[key] && datatypeMap[key] > maxCount) {
          typeResult = key
          maxCount = datatypeMap[key]
        }
      }
      result.dataType = typeResult
      return result
    },
  },
  watch: {},
}
</script>

<style lang="scss" scoped></style>
