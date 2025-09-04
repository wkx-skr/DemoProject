<template>
  <datablau-eltable
    class="domain-reference"
    ref="tabWitdTable"
    :searchPlaceholder="$t('domain.code.referenceCodeSearchPlaceholder')"
    :searchWidth="300"
    :totalShow="totalShow"
    :getShowData="getShowData"
    :columnDefs="columnDefs"
    :hideTopLine="hideTopLine"
    :defaultParaData="defaultParaData"
    :tableOption="tableOption"
    :frameworkComponents="frameworkComponents"
  >
    <template #vueCol="scope">
      <div v-if="scope.column.columnKey === 'chineseName'">
        <!--<name-col>aaa</name-col>-->
        <!--{{ scope.row }}-->
        <!--{{ scope.row.domainCode }}-->
        <datablau-link
          :data-type="LDMTypes.Domain"
          :data-object="scope.row"
          :label="scope.row.chineseName"
        ></datablau-link>
      </div>
      <div v-if="scope.column.columnKey === 'enName'">bbb</div>
    </template>
  </datablau-eltable>
</template>

<script>
import HTTP from '@/http/main'
import vue from 'vue'
import LDMTypes from '@constant/LDMTypes'

const nameCol = vue.extend({
  template: `
    <datablau-link
      :data-type="params.vueComponent.LDMTypes.CODE"
      :data-id="params.data.code"
      :label="params.data.code"
    ></datablau-link>
  `,
  mounted() {
    console.log(this.params, 'this.params')
    // this.dataInit(this.params)
  },
  methods: {},
})
export default {
  props: {
    codeData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      totalShow: 0,
      columnDefs: null,
      hideTopLine: false,
      defaultParaData: null,
      tableOption: {
        rowSelection: 'single',
      },
      allData: null,
      allCount: 0,
      LDMTypes: LDMTypes,
      frameworkComponents: {
        nameCol,
      },
    }
  },
  components: {},
  computed: {},
  beforeMount() {
    const formatterPath = para => {
      return para.value && para.value.join('/')
    }
    const columnDefs = [
      {
        type: ['firstEmptyColumn'],
      },
      {
        headerName: this.$t('domain.code.cName'),
        type: ['vueCol'],
        columnKey: 'chineseName',
        // field: 'chineseName',
        // tooltipField: 'chineseName',
        minWidth: 100,
        width: this.totalShow ? 300 : 0,
      },
      {
        headerName: this.$t('domain.common.domainPropCode'),
        field: 'domainCode',
        tooltipField: 'domainCode',
        minWidth: 100,
        width: this.totalShow ? 300 : 0,
      },
      {
        headerName: this.$t('domain.code.enName'),
        field: 'englishName',
        tooltipField: 'englishName',
        minWidth: 100,
        width: this.totalShow ? 300 : 0,
      },
      {
        headerName: this.$t('domain.code.enAbbreviation'),
        field: 'abbreviation',
        tooltipField: 'abbreviation',
        minWidth: 100,
        width: this.totalShow ? 300 : 0,
      },
      {
        headerName: this.$t('domain.common.description'),
        field: 'description',
        tooltipField: 'description',
        minWidth: 100,
        width: this.totalShow ? 300 : 0,
      },
      {
        headerName: this.$t('domain.code.path'),
        field: 'path',
        // tooltipField: 'path',
        valueFormatter: formatterPath,
        minWidth: 100,
        width: this.totalShow ? 400 : 0,
      },
      {
        headerName: this.$t('domain.code.submitter'),
        field: 'submitter',
        tooltipField: 'submitter',
        minWidth: 100,
        width: this.totalShow ? 200 : 0,
      },
    ]
    this.columnDefs = columnDefs
    this.defaultParaData = {
      keyword: '',
      pageSize: 20,
      currentPage: 1,
    }
  },
  mounted() {
    // this.getData();
  },
  methods: {
    getData(sCode) {
      const code = sCode || this.codeData.code
      // const url = `${this.$url}/service/domains/code/usages?codeNumber=${code}`
      // this.$http.get(url)
      this.allData =
        HTTP.getCodeUsagesService({
          code: code,
          state: this.codeData.state,
        }) || []
    },
    getShowData(para) {
      return new Promise((resolve, reject) => {
        const arr = []
        if (this.allData) {
          this.allData
            .then(res => {
              const data = res.data || []
              this.$emit('getDomainCount', data.length)
              let keyword = para.keyword
              let filteredData = []
              let showData = []
              const s = para.pageSize || 20
              const c = para.currentPage || 1

              this.totalShow = data.length
              if (keyword) {
                const testProps = [
                  'chineseName',
                  'domainCode',
                  'englishName',
                  'abbreviation',
                  'description',
                  'submitter',
                ]
                keyword = keyword.toLowerCase()
                data.forEach(item => {
                  let bool = false
                  bool = testProps.some(prop => {
                    let result = false
                    const str = item[prop] && item[prop].toLowerCase()
                    if (str) {
                      const index = str.indexOf(keyword)
                      if (index !== -1) {
                        result = true
                      }
                    }
                    return result
                  })
                  if (bool) {
                    filteredData.push(item)
                  }
                })
              } else {
                keyword = ''
                filteredData = data
              }

              showData = filteredData.slice((c - 1) * s, c * s)
              resolve(showData)
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          reject(this.$t('domain.common.noData'))
        }
      })
    },
    refreshData() {
      this.$refs.tabWitdTable && this.$refs.tabWitdTable.refreshData()
    },
  },
  watch: {
    'codeData.code': {
      handler(newVal) {
        this.getData(newVal)
        this.refreshData()
      },
      immediate: true,
    },
  },
}
</script>

<style lang="scss">
.domain-reference {
  .datablau-tab-top-line {
    left: 0 !important;
  }
  .datablau-tab-table-line {
    margin-left: 0 !important;
  }
}
</style>
