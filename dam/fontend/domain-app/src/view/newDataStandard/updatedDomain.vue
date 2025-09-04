<template>
  <div style="margin-bottom: 10px">
    {{
      $t('domain.domain.changeCount', {
        changeCount: updatedCnt,
      })
    }}
    <el-button
      type="text"
      size="small"
      style="margin-right: 1em"
      v-for="i in updatedDomains"
      :key="i.id"
      @click="getDomainDetail(i)"
    >
      {{ labelFormatter(i) }}
    </el-button>
    <div style="min-height: 200px" v-if="!firstOpen">
      <el-table
        v-if="tableData"
        class="plain-table"
        :data="tableData"
        :max-height="200"
        :empty-text="$t('domain.domain.noChange')"
      >
        <el-table-column
          :label="newDetail.domainChName"
          prop="propertyName"
        ></el-table-column>
        <el-table-column
          :label="$t('domain.domain.beforeChange')"
          prop="prevValue"
        ></el-table-column>
        <el-table-column
          :label="$t('domain.domain.afterChange')"
          prop="currentValue"
        ></el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    domains: Array,
    udps: Array,
  },
  beforeMount() {
    this.handleData()
  },
  mounted() {},
  data() {
    return {
      addedDomains: [],
      updatedDomains: [],
      newDetail: null,
      oldDetail: null,
      tableData: null,
      firstOpen: true,
    }
  },
  methods: {
    handleData() {
      this.domains.forEach(item => {
        if (item.updatingId) {
          this.updatedDomains.push(item)
        } else {
          this.addedDomains.push(item)
        }
      })
    },
    labelFormatter(domain) {
      return (
        domain.path.join(' / ') + ' / ' /* + `[${domain.code}]` */ + domain.name
      )
    },
    propertyNameFormatter(property) {
      switch (property) {
        case 'domainCode':
          return this.$t('domain.common.domainCode')
        case 'domainChName':
          return this.$t('domain.domain.cName')
        case 'domainEnName':
          return this.$t('domain.domain.enName')
        case 'domainAbbr':
          return this.$t('domain.domain.enAbbreviation')
        case 'referenceCode':
          return this.$t('domain.domain.referenceCode')
        case 'description':
          return this.$t('domain.dataFind.businessDefinition')
        case 'dataType':
          return this.$t('domain.common.dataType')
        case 'dataScale':
          return this.$t('domain.domainCluster.dataLength')
        case 'dataPrecision':
          return this.$t('domain.domainCluster.dataPrecision')
        case 'notNull':
          return this.$t('domain.domain.notNull')
        case 'path':
          return this.$t('common.page.themeDirectory')
        default:
          return false
      }
    },
    getDomainDetail(domain) {
      this.firstOpen = false
      this.tableData = null
      this.$http
        .get(this.$url + '/service/domains/details/' + domain.id)
        .then(res => {
          this.newDetail = res.data
          this.$http
            .get(this.$url + '/service/domains/details/' + domain.updatingId)
            .then(res => {
              this.oldDetail = res.data
              this.prepareTableData()
            })
        })
    },
    prepareTableData() {
      this.tableData = []
      const isEqual = (a, b) => {
        if (!a && !b) {
          return true
        } else if (
          a &&
          a.constructor.name === 'Array' &&
          b &&
          b.constructor.name === 'Array'
        ) {
          return a.toString() === b.toString()
        } else {
          return a === b
        }
      }
      for (const prop in this.oldDetail) {
        if (this.propertyNameFormatter(prop)) {
          if (!isEqual(this.oldDetail[prop], this.newDetail[prop])) {
            if (prop === 'path') {
              this.tableData.push({
                propertyName: this.propertyNameFormatter(prop),
                prevValue: this.oldDetail[prop].join('/'),
                currentValue: String(this.newDetail[prop].join('/')),
              })
            } else {
              this.tableData.push({
                propertyName: this.propertyNameFormatter(prop),
                prevValue: String(this.oldDetail[prop]),
                currentValue: String(this.newDetail[prop]),
              })
            }
          }
        }
      }
      if (
        this.oldDetail.additionalProperties.length > 0 ||
        this.newDetail.additionalProperties.length > 0
      ) {
        this.udps.forEach((item, index) => {
          if (
            !isEqual(
              this.oldDetail.additionalProperties[index],
              this.newDetail.additionalProperties[index]
            )
          ) {
            this.tableData.push({
              propertyName: item.name,
              prevValue: this.oldDetail.additionalProperties[index],
              currentValue: this.newDetail.additionalProperties[index],
            })
          }
        })
      }
    },
  },
  computed: {
    addedCnt() {
      return this.addedDomains.length
    },
    updatedCnt() {
      return this.updatedDomains.length
    },
  },
  watch: {},
}
</script>
