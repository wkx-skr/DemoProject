import HTTP from '@/http/main'
import _ from "lodash";
export default {
  props: {
    domainId: {},
    typeIds: {},
    noCompare: {
      type: Boolean,
      default: false,
    },
    udps: {},
  },
  mounted() {
    this.getVersionTableData()
  },
  data() {
    return {
      versionTableData: [],
      selection: [],
      CompareDisabled: true,
      smallVersionName1: '',
      smallVersionName2: '',
      ChEnObj: {},
      showVersionCompareDialog: false,
      onlyShowChange: false,
      smallVersionLoading: false,
      allData: [],
      compareResultTableData: [],
      allCompareResultTableData: [],
    }
  },
  methods: {
    getVersionTableData() {
      // this.$http.get(`${this.$url}/service/domains/${this.domainId}/oldVersions`)
      // this.$http
      //   .get(
      //     `${this.$url}/service/domains/${this.domainId}/history?pageSize=500&currentPage=1`
      //   )
      HTTP.getDomainHistory({
        domainId: this.domainId,
        currentPage: 1,
        pageSize: 500,
      })
        .then(res => {
          this.versionTableData = res.data.content
          setTimeout(() => {
            $('table th .el-checkbox').remove()
          }, 10)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    versionSelect(selection, row) {
      if (selection.length > 2) {
        const del_row = selection.shift()
        this.$refs.multipleTable.toggleRowSelection(del_row, false)
      }
      if (selection.length === 2) {
        this.CompareDisabled = false
        this.selection = selection.sort((a, b) => {
          return a.timestamp - b.timestamp
        })
        this.smallVersionName1 = this.selection[0].version.toString()
        this.smallVersionName2 = this.selection[1].version.toString()
      } else {
        this.CompareDisabled = true
      }
    },
    async versionCompare() {
      await this.getChEnObj()
      this.showVersionCompareDialog = true
      this.onlyShowChange = false
      this.smallVersionLoading = true
      // this.$http
      //   .get(
      //     `${this.$url}/service/domains/version/history/${this.smallVersionName1}/${this.smallVersionName2}?domainId=${this.domainId}`
      //   )
      HTTP.domainHistoryCompare({
        domainId: this.domainId,
        srcVersion: this.smallVersionName1,
        tagVersion: this.smallVersionName2,
      })
        .then(res => {
          this.allData = res.data
          const fullKeys = _.union(
            Object.keys(this.allData.first),
            Object.keys(this.allData.second)
          )
          const formatter = data => {
            if (typeof data === 'string') {
              return data
            } else if (Array.isArray(data)) {
              if (data.length === 0) {
                return undefined
              } else if (typeof data[0] === 'string') {
                return data.join(',')
              } else {
                return data
              }
            } else {
              return JSON.stringify(data)
            }
          }
          const arrKey = []
          const arrValue = []
          fullKeys.forEach(key => {
            if (key !== 'domainId' && key !== 'domainCode') {
              const obj = {
                name: key,
                new: formatter(this.allData.first[key]),
              }
              arrKey.push(obj)
            }
            if (key !== 'domainId' && key !== 'domainCode') {
              const obj = {
                name: key,
                old: formatter(this.allData.second[key]),
              }
              arrValue.push(obj)
            }
          })
          const aimArr = []
          arrKey.forEach((e, i) => {
            aimArr.push(Object.assign({}, arrKey[i], arrValue[i]))
          })
          const ar = []
          aimArr
            .filter(i => i.name !== 'additionalProperties')
            .forEach(e => {
              // 处理修饰词和时间周期
              if (e.name && e.name.endsWith('Refs')) {
                e.old = e.old && e.old.map(i => i.modifierType).join(',')
                e.new = e.new && e.new.map(i => i.modifierType).join(',')
              }
              e.name = this.EnToCh('1_' + e.name)
              if (e.name === this.$t('domain.common.standardStatus')) {
                e.new = this.statusFormatter(JSON.parse(e.new))
                e.old = this.statusFormatter(JSON.parse(e.old))
              }
              if (e.name && (e.new !== 'null' || e.old !== 'null')) {
                ar.push(e)
              }
            })
          this.addAdditionalProperties(aimArr, ar)
          this.smallVersionLoading = false
          this.compareResultTableData = ar
          this.allCompareResultTableData = ar
        })
        .catch(e => {
          this.smallVersionLoading = false
          this.$showFailure(e)
        })
    },
    addAdditionalProperties(aimArr, ar) {
      console.log(this.udps)
      if (!this.udps || !Array.isArray(this.udps)) {
        return
      }
      aimArr
        .filter(i => i.name === 'additionalProperties')
        .forEach(item => {
          this.udps.forEach(udp => {
            const id = udp.udpId
            const label = udp.name
            const e = {
              name: label,
              old: undefined,
              new: undefined,
            }
            if (
              Array.isArray(item.old) &&
              item.old.find(item => item[0] === id)
            ) {
              e.old = item.old.find(item => item[0] === id)[1]
            }
            if (
              Array.isArray(item.new) &&
              item.new.find(item => item[0] === id)
            ) {
              e.new = item.new.find(item => item[0] === id)[1]
            }
            ar.push(e)
          })
        })
    },
    statusFormatter(status) {
      switch (status) {
        case 'X':
          return this.$t('domain.common.obsolete')
        case 'D':
          return this.$t('domain.common.pendingReview')
        case 'C':
          return this.$t('domain.common.underReview')
        case 'A':
          return this.$t('domain.common.published')
      }
    },
    /**
     * @return {string}
     */
    EnToCh(key) {
      if (key.endsWith('additionalProperties')) {
        return 'additionalProperties'
      } else {
        return this.ChEnObj[key]
      }
    },
    getChEnObj() {
      return new Promise(resolve => {
        // this.$http
        //   .get(
        //     `${this.$url}/service/domains/column/mapping?categoryId=${this.typeIds}`
        //   )
        HTTP.getDomainColumnMapping(this.typeIds)
          .then(res => {
            this.ChEnObj = res.data
            resolve()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (row.new !== row.old && _.toString(row.new) !== _.toString(row.old)) {
        if (row.new && !row.old) {
          if (columnIndex === 2) {
            return {
              backgroundColor: '#ADFF2F',
            }
          }
        } else if (!row.new && row.old) {
          if (columnIndex === 1) {
            return {
              backgroundColor: '#ec808d',
            }
          }
        } else {
          if (columnIndex === 1 || columnIndex === 2) {
            return {
              backgroundColor: '#FFA500',
            }
          }
        }
      }
    },
  },
  watch: {
    onlyShowChange(value) {
      if (value) {
        const arr = []
        this.allCompareResultTableData.forEach(e => {
          if (JSON.stringify(e.new) !== JSON.stringify(e.old)) {
            arr.push(e)
          }
        })
        this.compareResultTableData = arr
      } else {
        this.compareResultTableData = this.allCompareResultTableData
      }
    },
  },
}
