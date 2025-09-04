<template>
  <div class="cluster-wrapper" :style="editorType === 'table' && editMode? 'bottom: 30px;': ''">
    <div class="content">
      <span class="first">Buckets</span>
      <datablau-input
        :disabled="!editMode"
        @blur="isInteger"
        v-model="clusterShow.properties.BucketSize"
        class="expression-input">
      </datablau-input>
    </div>
    <div class="columns">
      <datablau-transfer
        style="height: 100%"
        :width="235"
        v-model="clusterShow.properties.clusterColumnIds"
        :data="columns"
        filterable
        target-order="shift"
        :titles="['字段选择', '成员字段']"
        @change="changeTransfer"
        :themeBlack="typeDataWareHouse"
      >
        <div class="column-item" slot-scope="{option}">
          <span :title="option.cnName ? `${option.label} (${option.cnName})` : option.label">{{option.cnName ? `${option.label} (${option.cnName})` : option.label}}</span>
          <datablau-button :disabled="!editMode|| (clusterShow.properties.clusterColumnIds && (clusterShow.properties.clusterColumnIds.findIndex(i => i === option.key) === 0))" @click.prevent.stop="upColumn(option)" type="icon" class="iconfont icon-up"></datablau-button>
          <datablau-button :disabled="!editMode || (clusterShow.properties.clusterColumnIds && (clusterShow.properties.clusterColumnIds.findIndex(i => i === option.key) === clusterShow.properties.clusterColumnIds.length -1))" @click.prevent.stop="downColumn(option)" type="icon" class="iconfont icon-down"></datablau-button>
        </div>
      </datablau-transfer>
    </div>
  </div>
</template>

<script>
import LDMTypes from '@constant/LDMTypes'
import { v4 as uuidv4 } from 'uuid'
import $ from 'jquery'

export default {
  data () {
    const endValValidator = (rule, value, callback) => {
      if (value !== '' && +value < +this.request.startVal) {
        callback(new Error('结束值必须大于等于初始值'))
      } else {
        callback()
      }
    }
    const dateFormatValidator = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请选择日期格式'))
      } else {
        callback()
      }
    }
    const endDateValidator = (rule, value, callback) => {
      if (value !== '' && this.request.startDate !== '' && moment(value).valueOf() < moment(this.request.startDate).valueOf()) {
        callback(new Error('结束时间不能小于起始时间'))
      } else {
        callback()
      }
    }
    return {
      defaultOpen: ['expression', 'border'],
      partitionDesignImg: require('@/assets/images/mxgraphEdit/partitionDesign.svg'),
      partitionDesignDisabledImg: require('@/assets/images/mxgraphEdit/partitionDesignDisabled.svg'),
      dbHeaders: ['Name', 'Text'],
      drag: false,
      dragStart: {
        row: -1,
        column: -1
      },
      tempRow: -1,
      tempColumn: -1,
      tempFocusRow: -1,
      tempFocusColumn: -1,
      isFocusArea: false,
      isFocusOnly: false,
      dateFormat: {
        years: [{
          label: 'yyyy',
          value: 'YYYY'
        }],
        months: [{
          label: 'yyyy-MM',
          value: 'YYYY-MM'
        }, {
          label: 'yyyy/MM',
          value: 'YYYY/MM'
        }, {
          label: 'yyyy年/MM月',
          value: 'YYYY年/MM月'
        }, {
          label: 'yyyy.MM',
          value: 'YYYY.MM'
        }],
        days: [{
          label: 'yyyy-MM-dd',
          value: 'YYYY-MM-DD'
        }, {
          label: 'yyyy/MM/dd',
          value: 'YYYY/MM/DD'
        }, {
          label: 'yyyy年/MM月/dd日',
          value: 'YYYY年/MM月/DD日'
        }, {
          label: 'yyyy.MM.dd',
          value: 'YYYY.MM.DD'
        }]
      },
      syncDetail: [{
        label: '包含起始值',
        value: 'start'
      }, {
        label: '包含结束值',
        value: 'end'
      }, {
        label: '覆盖原有分区设计',
        value: 'cover'
      }],
      designType: [{
        value: 'value',
        label: '按值域'
      }, {
        value: 'date',
        label: '按日期'
      }],
      rules: {
        startVal: [{ required: true, message: '请输入起始值', trigger: 'blur' }],
        endVal: [{ required: true, message: '请输入结束值', trigger: 'blur' }, { validator: endValValidator, trigger: 'change' }],
        stepLength: [{ required: true, message: '请输入步长', trigger: 'blur' }]
      },
      rules1: {
        startDate: [{ type: 'date', required: true, message: '请输入起始日期', trigger: 'change' }],
        endDate: [{ type: 'date', required: true, message: '请输入结束日期', trigger: 'change' }, { validator: endDateValidator, trigger: 'change' }],
        stepDateLength: [{ required: true, message: '请输入步长', trigger: 'blur' }],
        dateFormat: [{ validator: dateFormatValidator, trigger: 'blur' }]
      },
      request: {
        sync: ['start', 'cover'],
        type: 'value',
        startVal: '',
        endVal: '',
        stepLength: '',
        startDate: '',
        endDate: '',
        stepDateType: 'years',
        stepDateLength: '',
        dateFormat: 'YYYY'
      },
      designModal: false,
      clusterShow: {
        properties: {
        }
      },
      clusterShowTemplate: {
        children: [],
        objectClass: 'Datablau.LDM.EntityCluster',
        properties: {
          // Id: this.deliverNum.seed,
          BucketSize: '',
          ClusterMemberRefs: '',
          clusterColumnIds: '',
          Id: '',
          Name: '',
          TypeId: LDMTypes.Cluster,
          UniqueId: uuidv4()
        }
      },
      columns: this.allCols.filter(i => !i.deleted).map(i => ({
        key: i.elementId,
        label: i.name,
        cnName: i.cnName,
        dataType: i.dataType,
        disabled: !this.editMode
      })),
      columnsMap: this.allCols.filter(i => !i.deleted).reduce((pre, cur) => ({
        ...pre,
        [cur.elementId]: {
          key: cur.elementId,
          label: cur.name,
          cnName: cur.cnName,
          dataType: cur.dataType,
          disabled: !this.editMode
        }
      }), {})
    }
  },
  props: {
    allCols: {
      required: true
    },
    cluster: {
      required: true
    },
    deliverNum: {
      required: true
    },
    editMode: {
      default: true
    },
    currentModel: {
      required: true
    },
    editorType: {
      required: true
    },
    rawData: {

    },
    typeDataWareHouse: {

    }
  },
  computed: {
    pickerOptions () {
      return {
        disabledDate: time => {
          if (this.request.startDate) {
            return time.getTime() < moment(this.request.startDate).valueOf()
          } else {
            return false
          }
        }
      }
    }
  },
  mounted () {
    this.initCluster()
    this.$bus.$on('deleteColumn', this.deleteColumn)
  },
  beforeDestroy () {
    this.$bus.$off('deleteColumn')
  },
  watch: {
    allCols: {
      deep: true,
      handler () {
        this.columns = this.allCols.filter(i => !i.deleted).map(i => ({
          key: i.elementId,
          label: i.name,
          cnName: i.cnName,
          dataType: i.dataType,
          disabled: !this.editMode
        }))
        this.columnsMap = this.allCols.filter(i => !i.deleted).reduce((pre, cur) => ({
          ...pre,
          [cur.elementId]: {
            key: cur.elementId,
            label: cur.name,
            cnName: cur.cnName,
            dataType: cur.dataType,
            disabled: !this.editMode
          }
        }), {})
        this.clusterShow.properties.clusterColumnIds = this.clusterShow.properties.clusterColumnIds.filter(key => this.columns.map(i => i.key).includes(key))
      }
    }
  },
  methods: {
    isInteger () {
      if (this.clusterShow.properties.BucketSize) {
        let res = parseInt(this.clusterShow.properties.BucketSize)
        if (res && res.toString() === this.clusterShow.properties.BucketSize + '') {
          return true
        } else {
          this.$datablauMessage.error('Cluster的Buckets请输入整数')
          return false
        }
      } else {
        return true
      }
    },
    deleteColumn (columnId) {
      let index = this.partitionMemberList.findIndex((member) => member.properties.AttributeRef === columnId)
      if (index !== -1) {
        // this.clusterShow.properties.clusterColumnIds.splice(index, 1) //在watch里已修改，不需要重复修改
        this.partitionMemberList.splice(index, 1)
        this.clusterShow.properties.PartitionMemberExpression = this.clusterShow.properties.PartitionMemberExpression.replace(/^(\S+)\(\S*\)/, `$1(${this.clusterShow.properties.clusterColumnIds.map(key => this.columnsMap[key].label).join(',')})`)
        this.clusterShow.properties.PartitionMemberOrderRefs = this.partitionMemberList.map(member => member.properties.Id)
      }
    },
    valid () {
      return this.isInteger()
    },
    temporarySave () {
      this.del = this.mod = this.new = null
      this.clusterShow.properties.ClusterMemberRefs = this.clusterShow.children.map(i => i.properties.Id).join(',')
      let comparePartition = _.cloneDeep(this.clusterShow) // 用作比较
      delete comparePartition.properties.clusterColumnIds
      delete comparePartition.properties.new
      delete comparePartition.properties.changed
      comparePartition.children?.sort((a, b) => {
        return a.properties.Id - b.properties.Id
      })
      let comparePartition1 = this.partition ? _.cloneDeep(this.partition) : { properties: {} } // 用作比较
      delete comparePartition1.properties.clusterColumnIds
      delete comparePartition1.properties.new
      delete comparePartition1.properties.changed
      comparePartition1.children?.sort((a, b) => {
        return a.properties.Id - b.properties.Id
      })
      if (!this.clusterShow.properties.new && !_.isEqual(comparePartition, comparePartition1)) { // modified
        this.mod = this.clusterShow
      } else if (this.clusterShow.properties.new) { // new
        this.new = this.clusterShow
      }
    },
    changeValue (item, key, value) {
      let valueInt = parseInt(value)
      if (isNaN(value) || parseFloat(value).toString().includes('.') || value.toString().includes('.')) {
        this.$datablauMessage.warning('必须大于等于1的整数')
        item[key] = isNaN(valueInt) ? undefined : valueInt
      } else if (valueInt <= 0) {
        this.$datablauMessage.warning('必须大于等于1的整数')
        item[key] = 1
      }
    },
    initCluster () {
      this.clusterShowTemplate.properties.Id = this.deliverNum.seed
      this.clusterShowTemplate.properties.Name = `Cluster_${this.deliverNum.seed++}`
      this.clusterShow = _.cloneDeep(this.clusterShowTemplate)
      if (this.cluster) {
        _.merge(this.clusterShow, _.cloneDeep(this.cluster))
        this.clusterShow.properties.ClusterMemberRefs = this.clusterShow.properties.ClusterMemberRefs ? this.clusterShow.properties.ClusterMemberRefs.split(',').map(i => +i) : []
        this.clusterShow.properties.clusterColumnIds = this.clusterShow.properties.ClusterMemberRefs.map(memberId => this.clusterShow.children.find(member => member.properties.Id === memberId)?.properties.AttributeRef)
        this.clusterShow.children = _.cloneDeep(this.clusterShow.children).sort((a, b) => {
          let aIndex = this.clusterShow.properties.ClusterMemberRefs.findIndex((id) => a.properties.Id === id)
          let bIndex = this.clusterShow.properties.ClusterMemberRefs.findIndex((id) => b.properties.Id === id)
          if (aIndex === -1 && bIndex === -1) {
            return a.properties.Id - b.properties.Id
          } else {
            return aIndex - bIndex
          }
        })
        // this.clusterShow.properties.new = false 可能是临时保存的，这时new为true不能赋值为false
      } else {
        this.clusterShow.properties.ClusterMemberRefs = this.clusterShow.properties.ClusterMemberRefs ? this.clusterShow.properties.ClusterMemberRefs.split(',').map(i => +i) : []
        this.clusterShow.properties.clusterColumnIds = this.clusterShow.properties.ClusterMemberRefs.map(memberId => this.clusterShow.children.find(member => member.properties.Id === memberId)?.properties.AttributeRef)
        this.clusterShow.children = []
        this.clusterShow.properties.new = true
      }
    },
    upColumn (item) {
      let index = this.clusterShow.properties.clusterColumnIds.findIndex(i => i === item.key)
      this.clusterShow.properties.clusterColumnIds.splice(index, 1)
      this.clusterShow.properties.clusterColumnIds.splice(index - 1, 0, item.key)
      this.clusterShow.children.splice(index - 1, 0, this.clusterShow.children.splice(index, 1)[0])
      this.clusterShow.properties.ClusterMemberRefs = this.clusterShow.children.map(member => member.properties.Id)
    },
    downColumn (item) {
      let index = this.clusterShow.properties.clusterColumnIds.findIndex(i => i === item.key)
      this.clusterShow.properties.clusterColumnIds.splice(index, 1)
      this.clusterShow.properties.clusterColumnIds.splice(index + 1, 0, item.key)
      this.clusterShow.children.splice(index + 1, 0, this.clusterShow.children.splice(index, 1)[0])
      this.clusterShow.properties.ClusterMemberRefs = this.clusterShow.children.map(member => member.properties.Id)
    },
    changeTransfer (value, direction, movedKeys) {
      if (direction === 'right') {
        this.clusterShow.children = this.clusterShow.children.concat(movedKeys.map(key => ({
          objectClass: 'Datablau.LDM.ClusterMember',
          properties: {
            AttributeRef: key,
            Id: this.deliverNum.seed,
            Name: `ClusterMember_${this.deliverNum.seed++}`,
            TypeId: LDMTypes.ClusterMember,
            UniqueId: uuidv4()
          }
        })))
      } else if (direction === 'left') {
        movedKeys.forEach(key => {
          let children = this.clusterShow.children
          let index = children.findIndex(i => i.properties.AttributeRef === key)
          if (index !== -1) {
            children.splice(index, 1)
          }
        })
      }
    }
  }
}
</script>
<style scoped lang="scss">
.table-content {
  width: 543px;
}
/deep/ .el-collapse-item__wrap {
  padding-bottom: 20px;
}
.table-box1 /deep/ {
  .datablau-input {
    width: 100%;
  }
  .el-table__row td:last-child .cell {
    border-right: 1px solid #ddd;
  }
  .table-header-class {
    th {
      background-color: #F5F5F5;
    }
  }
  .el-table--border th.is-leaf {
    border-right: 2px solid #EBEEF5;
  }
  .el-table--border th.is-leaf.is-hidden {
    border: none;
  }
  .el-table__body {
    .el-select {
      vertical-align: top;
    }
    .el-checkbox {
      line-height: 30px;
      height: 30px;
    }
    i.el-icon-check {
      height: 30px;
      line-height: 30px;
    }
    tr > td .is-error input {
      color: #F56C6C;
      border: 1px solid #F56C6C;
    }
    tr > td.focus .top input {
      border-top: 1px solid rgb(64, 158, 255)
    }
    tr > td.focus .left input {
      border-left: 1px solid rgb(64, 158, 255)
    }
    tr > td.focus .right input {
      border-right: 1px solid rgb(64, 158, 255)
    }
    tr > td.focus .bottom input {
      border-bottom: 1px solid rgb(64, 158, 255)
    }
    tr > td input:focus {
      background-color: rgba(64, 158, 255, 0.1) !important;
      border: 1px solid rgb(64, 158, 255)
    }
    tr td.focus input {
      position: relative;
      background-color: rgba(64, 158, 255, 0.1) !important;
      border: none;
    }
    .cell {
      position: absolute;
      top: 0;
      left: 1px;
      right: 1px;
      bottom: -1px;
    }
  }
  .el-input {
    vertical-align: top;
  }
  td {
    vertical-align: top;
  }
  input {
    height: 30px;
    line-height: 30px;
    vertical-align: inherit;
    border: none;
    background-color: unset;
  }
  button {
    padding: 0;
    height: 30px!important;
    vertical-align: inherit;
    border: none;
    background-color: unset;
  }
  .el-table__body, .el-table__footer, .el-table__header {
    border-collapse: collapse;
  }
  .el-table--border {
    border: none;
  }
  .el-table__header-wrapper {
    table {
      border-right: 1px solid #EBEEF5;
      /*border-top: 1px solid #EBEEF5;*/
    }
  }
  .el-table__fixed-header-wrapper {
    table {
      border-left: 1px solid #EBEEF5;
      /*border-top: 1px solid #EBEEF5;*/
    }
  }
  .el-table__body-wrapper {
    table {
      border: 1px solid #EBEEF5;
      border-top: none;
      .cell {
        padding-left: 0;
        padding-right: 0;
      }
    }
  }
  .el-table__fixed-body-wrapper {
    table {
      border: 1px solid #EBEEF5;
      border-top: none;
      .cell {
        padding-left: 0;
        padding-right: 0;
      }
    }
  }

}
.table-box1{
  &.black-table-box1 /deep/{
      .el-table__row td:last-child .cell {
      border-right: 1px solid transparent;
      }
      .el-table__body-wrapper table{
        border: none;
      }
  }
}
.cluster-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
  .content {
    width: 543px;
    display: flex;
    align-items: center;
    .first {
      flex: 0 0 auto;
      margin-right: 7px;
    }
    .expression-input {
      flex: 1 1 auto;
    }
  }
  .columns {
    margin-top: 8px;
    height: 240px;
    .datablau-transfer {
      height: 100%;
      /deep/ .el-transfer-panel:first-child .iconfont:not(.icon-search) {
        display: none;
      }
      /deep/ .el-transfer-panel {
        height: 100%;
      }
    }
    .column-item {
      display: flex!important;
      align-items: center;
      span {
        flex: 1 1 auto;
        width: 180px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .iconfont {
        flex: 0 0 auto;
      }
    }
    /deep/ .el-transfer-panel__item {
      margin-right: 0;
    }
  }
  .expression-input /deep/ .el-input__inner {
    width: 100%;
    height: 32px;
    line-height: 32px;
  }
}
.partion-type-title {
  display: inline-block;
  margin-right: 8px;
}
  h2.title-hint {
    &:before {
      display: inline-block;
      margin-right: 6px;
      content: '';
      width: 4px;
      height: 14px;
      background: #409EFF;
      border-radius: 1px;
      vertical-align: text-bottom;
      margin-bottom: 2px;
    }
    font-size: 14px;
    line-height: 18px;
    color: #555;
  }
.partition-border-wrapper {
  .buttons {
    margin-bottom: 10px;
  }
}
.el-form.db-form .datablau-input {
  width: 100%;
}
.partition-number-wrapper {
  h2 {
    display: inline-block;
    font-weight: normal;
  }
}
.black-el-date-picker /deep/{
  .el-input__inner{
    background: transparent;
    border: 1px solid #4D4D4D;
    color: #BBBBBB;
  }
}

</style>
<style lang="scss">
  .collapseDataWareHouse{
    // margin-top: 20px;
    border-top: 1px solid transparent !important;
    border-bottom: 1px solid transparent !important;
    .el-collapse-item__header{
      background-color: transparent;
      border-bottom: 1px solid transparent;

    }
    .el-collapse-item__wrap{
      background-color: transparent;
      border-bottom: 1px solid #4D4D4D
    }
    .partition-expression-wrapper .content .first{
      color: #BBBBBB;
    }
    .el-collapse-item__arrow{
      color: #BBBBBB;
    }
    .autocompleteDataWareHouse{
      .el-input.is-disabled .el-input__inner{
        // border:1px solid #bbbbbb
        border-color: #666666;
        background-color: #3C3F41;
      }
      .el-input.is-disabled .el-input__inner::placeholder{
        color: #666666;
      }
      .el-input__inner::placeholder{
        color: #666666;
      }
      .el-input__inner{
        background-color: transparent;
        border-color: #4D4D4D;;
      }

    }
    .transferDataWareHouse{
      .el-transfer-panel{
        border: 1px solid #666666;
      }
    }
  }
  .el-autocomplete-suggestion{
    &.balckpopper-class{
        background-color: #2A2A2A;
        border: 1px solid #333333;
        li{
          color: #BBBBBB;
          &:hover{
            background: rgba(24, 127, 255, .2);
          }
        }
        .popper__arrow{
          border-bottom-color: #333333;
        }
        .popper__arrow::after{
          border-bottom-color: #333333;
        }
    }
  }
  .el-date-pickerpopper-black{
    background: #2A2A2A;
    border: 1px solid #333333;
    color: #BBBBBB;
    .popper__arrow{
      border-bottom-color: #333333 !important;
    }
    .popper__arrow::after{
      border-bottom-color: #333333 !important;
    }
    .el-date-picker__header-label{
      color: #BBBBBB;
    }
    .el-date-table th{
      color: #BBBBBB;
    border-bottom: solid 1px #4D4D4D;

    }
  }
</style>
