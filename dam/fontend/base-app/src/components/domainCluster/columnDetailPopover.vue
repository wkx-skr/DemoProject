<template>
  <el-popover
    placement="left-start"
    trigger="hover"
    :open-delay="150"
    :popper-options="columnDetailPopOption"
    :disabled="popDisabled"
    :reference="referDom"
    :value="showPopOnce"
    ref="columnPopover"
  >
    <div class="popover-con column-detail">
      <p class="domain-detail">
        <el-form
          label-position="left"
          label-width="80px"
          class="dom-detail"
          :model="formData"
        >
          <el-form-item :label="`${$t('domain.domainCluster.name')}:`">
            <span @click="handleSkip2DataCata('column')">
              {{ formData.logicalName }}
            </span>
            <span @click="handleSkip2Column(column)" class="check-btn">
              {{ $t('domain.common.check') }}
            </span>
          </el-form-item>
          <el-form-item :label="`${$t('domain.domainCluster.enName')}:`">
            <span>{{ formData.physicalName }}</span>
          </el-form-item>
          <el-form-item :label="`${$t('domain.domainCluster.owningModel')}:`">
            <span @click="handleSkip2DataCata('model')">
              {{ formData.modelName }}
            </span>
          </el-form-item>
          <el-form-item :label="`${$t('domain.domainCluster.owningTable')}:`">
            <span @click="handleSkip2DataCata('table')">
              {{ formData.tableName }}
            </span>
          </el-form-item>
        </el-form>
      </p>
    </div>
  </el-popover>
</template>

<script>
export default {
  data() {
    return {
      columnDetailPopOption: {
        gpuAcceleration: false,
      },
      // default when no column data
      columnDataNew: {},
      getNewColumnData: false,
      showPopOnce: false,
      showTimer: '',
    }
  },
  components: {},
  props: {
    popoverDisabled: {
      default: false,
    },
    referDom: {
      required: true,
    },
    columnId: {
      required: true,
    },
    oldColumnData: {
      type: Object,
    },
    boundariesElement: {
      default: '',
    },
    showOnce: {
      default: false,
    },
  },
  computed: {
    column() {
      let result = {}
      if (this.oldColumnData && this.oldColumnData.id) {
        result = _.cloneDeep(this.oldColumnData)
      } else if (!this.getNewColumnData) {
        this.getColumnData()
      } else {
        result = this.columnDataNew
      }
      return result
    },
    popDisabled() {
      return this.popoverDisabled || !this.referDom
    },
    formData() {
      const column = this.column
      if (!column) {
        return
      }
      const result = {
        physicalName: column.physicalName,
        logicalName: column.logicalName,
        modelName: column.modelName,
        id: column.objectId,
        tableName: column.tableName,
        modelId: column.modelId,
        tableId: column.tableId,
      }
      const properties = column.properties
      // result.LogicalName = properties.LogicalName;
      if (properties) {
        result.DataType = properties.DataType
        result.precision = this.getDataScale(properties.DataType)
        result.IsNotNull = properties.IsNotNull
      }
      return result
    },
  },
  mounted() {
    this.columnDetailPopOption.boundariesElement = this.boundariesElement
    if (this.showOnce) {
      this.showPopover()
    }
  },
  methods: {
    getColumnData() {
      this.$http
        .get(this.$url + '/service/entities/' + this.columnId + '/summary')
        .then(res => {
          this.getNewColumnData = true
          this.columnDataNew = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleSkip2DataCata(type) {
      return
      const data = this.formData
      const obj = {
        modleId: data.modleId,
        keyword: '',
        type: 'table',
      }
      switch (type) {
        case 'modle':
          obj.modle = data.modleId
          return
          break
        case 'table':
          obj.table = data.tableId
          break
        case 'column':
          obj.column = data.id
          break
      }
      this.$router.push({
        name: 'dataCatalog',
        query: obj,
      })
    },
    handleSkip2Column(column) {
      const data = this.formData
      const obj = {
        modleId: data.modleId,
        keyword: '',
        type: 'column',
        column: data.id,
      }
      this.$router.push({
        name: 'dataCatalog',
        query: obj,
      })
    },
    showPopover() {
      this.showPopOnce = true
    },
    getDataScale(DataType) {
      const str = DataType || ''
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
  },
  watch: {},
}
</script>

<style lang="scss">
.popover-con.column-detail {
  $formLineHeight: 24px;
  // border: 1px solid red;
  padding: 10px 20px;

  .el-form-item__label {
    font-weight: bold;
    line-height: $formLineHeight;
  }

  .el-form-item__content {
    line-height: $formLineHeight;
    .check-btn {
      cursor: pointer;
      color: #409eff;
      margin-left: 20px;
    }
  }
}
</style>
