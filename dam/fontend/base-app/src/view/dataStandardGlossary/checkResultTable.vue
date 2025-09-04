<template>
  <datablau-eltable
    style="margin-right: 20px"
    :totalShow="totalShow"
    :getShowData="getShowData"
    :columnDefs="columnDefs"
    :hideTopLine="hideTopLine"
    :defaultParaData="defaultParaData"
    :tableOption="tableOption"
    :hideDefaultFilter="true"
    :showCustomFilter="true"
    ref="referenceTable"
    :key="tableKey"
  >
    <div class="show-more-para" slot="customFilter">
      <datablau-radio
        v-model="typeId"
        @change="handleTypeIdChange"
        class="inline-block-components"
      >
        <el-radio label="80000004">{{ $t('domain.common.table') }}</el-radio>
        <el-radio label="80000005">{{ $t('domain.common.field') }}</el-radio>
      </datablau-radio>
      <el-checkbox
        style="margin-left: 2em"
        :label="$t('domain.glossary.filterField')"
        v-model="ignoreNonAuto"
        @change="filterChange"
      ></el-checkbox>
    </div>
  </datablau-eltable>
</template>

<script>
import HTTP from '@/http/main.js'
export default {
  props: {
    chineseName: {
      type: [String, Number],
      required: true,
    },
    abbreviation: {
      type: [String, Number],
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
        selectable: false,
        showColumnSelection: false,
        columnResizable: true,
      },
      ignoreNonAuto: true,
      typeId: '80000005',
      tableKey: 0,
    }
  },
  components: {},
  computed: {},
  beforeMount() {
    this.initTable()
  },
  mounted() {},
  methods: {
    initTable() {
      const typeMap = {
        80000005: this.$t('domain.common.field'),
        80000004: this.$t('domain.common.table'),
      }
      const formatterType = row => {
        if (row.data.typeId) {
          return typeMap[row.data.typeId]
        } else {
          return ''
        }
      }
      const columnNotContainsColumnDefs = [
        // {
        //   type: ['firstEmptyColumn'],
        // },
        {
          headerName: this.$t('domain.glossary.tableCName'),
          field: 'tableAlias',
          tooltipField: 'tableAlias',
          width: 300,
        },
        {
          headerName: this.$t('domain.glossary.tableName'),
          field: 'tableName',
          tooltipField: 'tableName',
          width: 300,
        },

        {
          headerName: this.$t('domain.glossary.path'),
          field: 'modelPath',
          tooltipField: 'modelPath',
          width: 300,
        },
        {
          headerName: this.$t('domain.glossary.owningModel'),
          field: 'modelName',
          tooltipField: 'modelName',
          width: 300,
        },
        {
          headerName: this.$t('domain.glossary.owningBranch'),
          field: 'modelBranch',
          tooltipField: 'modelBranch',
          width: 300,
        },
      ]
      const columnDefs = [
        {
          type: ['firstEmptyColumn'],
        },
        {
          headerName: this.$t('domain.glossary.tableCName'),
          field: 'tableAlias',
          tooltipField: 'tableAlias',
          minWidth: 150,
        },
        {
          headerName: this.$t('domain.glossary.tableName'),
          field: 'tableName',
          tooltipField: 'tableName',
          minWidth: 150,
        },
        {
          headerName: this.$t('domain.glossary.fieldCName'),
          field: 'columnAlias',
          tooltipField: 'columnAlias',
          minWidth: 150,
        },
        {
          headerName: this.$t('domain.glossary.fieldName'),
          field: 'columnName',
          tooltipField: 'columnName',
          minWidth: 150,
        },

        {
          headerName: this.$t('domain.glossary.path'),
          field: 'modelPath',
          tooltipField: 'modelPath',
          minWidth: 150,
        },
        {
          headerName: this.$t('domain.glossary.owningModel'),
          field: 'modelName',
          tooltipField: 'modelName',
          minWidth: 150,
        },
        {
          headerName: this.$t('domain.glossary.owningBranch'),
          field: 'modelBranch',
          tooltipField: 'modelBranch',
          minWidth: 150,
        },
      ]
      this.columnDefs =
        this.typeId === '80000005' ? columnDefs : columnNotContainsColumnDefs
      this.defaultParaData = {
        keyword: '',
        pageSize: 20,
        currentPage: 1,
      }
    },
    handleTypeIdChange() {
      this.initTable()
      this.tableKey++
    },
    getShowData(para) {
      return new Promise((resolve, reject) => {
        HTTP.nsGetCheckResultService({
          currentPage: para.currentPage,
          pageSize: para.pageSize,
          chName: this.chineseName,
          abbr: this.abbreviation,
          ignoreNonAuto: this.ignoreNonAuto,
          type: this.typeId,
        })
          .then(res => {
            if (this.$utils.isJSON(res.data)) {
              res.data = JSON.parse(res.data)
            }
            this.totalShow = res.data.totalItems
            const data = res.data.items || []
            resolve(data)
          })
          .catch(e => {
            reject(e)
          })
      })
    },
    filterChange(val) {
      if (
        this.$refs.referenceTable &&
        this.$refs.referenceTable.setCurrentPara
      ) {
        const para = {
          currentPage: 1,
        }
        this.$refs.referenceTable.setCurrentPara(para)
      }
    },
  },
  watch: {},
}
</script>
