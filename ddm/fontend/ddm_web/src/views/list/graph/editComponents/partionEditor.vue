<template>
  <div class="partition-wrapper" :style="editorType === 'table' && editMode? 'bottom: 30px;': ''">
    <datablau-dialog
      :visible.sync="designModal"
      width="620px"
      height="480px"
      :blackTheme="typeDataWareHouse"
      title="分区设计器">
      <datablau-form
        :rules="request.type === 'value' ? rules: rules1"
        :model="request"
        ref="form"
        size="small"
        label-width="75px"
      >
        <el-form-item
          label="同步设置">
          <datablau-checkbox :themeBlack="typeDataWareHouse" v-model="request.sync">
            <el-checkbox v-for="item in syncDetail" :label="item.value" :key="item.value">{{item.label}}</el-checkbox>
          </datablau-checkbox>
        </el-form-item>
        <el-form-item
          style="margin-top: -15px;"
          label="分区方式"
          prop="type"
        >
          <datablau-radio :themeBlack="typeDataWareHouse" v-model="request.type">
            <el-radio v-for="item in designType" :label="item.value" :key="item.value">{{item.label}}</el-radio>
          </datablau-radio>
        </el-form-item>
        <template v-if="request.type === 'value'">
          <el-form-item
            label="起始值"
            key="1"
            prop="startVal">
            <datablau-input :themeBlack="typeDataWareHouse" @input="changeValue2(request, 'startVal', $event)" v-model="request.startVal"></datablau-input>
          </el-form-item>
          <el-form-item
            label="结束值"
            key="2"
            prop="endVal">
            <datablau-input :themeBlack="typeDataWareHouse" @input="changeValue2(request, 'endVal', $event)" v-model="request.endVal"></datablau-input>
          </el-form-item>
          <el-form-item
            label="步长"
            key="3"
            prop="stepLength">
            <datablau-input :themeBlack="typeDataWareHouse" @input="changeValue(request, 'stepLength', $event)" v-model="request.stepLength"></datablau-input>
          </el-form-item>
        </template>
        <template v-else-if="request.type === 'date'">
          <el-form-item
            label="开始日期"
            key="4"
            prop="startDate">
            <el-date-picker :class="{'black-el-date-picker': typeDataWareHouse}" :popper-class="typeDataWareHouse?'el-date-pickerpopper-black':''" style="width: 100%;" type="date" v-model="request.startDate"></el-date-picker>
          </el-form-item>
          <el-form-item
            label="结束日期"
            key="5"
            prop="endDate">
            <el-date-picker :class="{'black-el-date-picker': typeDataWareHouse}" :popper-class="typeDataWareHouse?'el-date-pickerpopper-black':''" style="width: 100%" type="date" :picker-options="pickerOptions" v-model="request.endDate"></el-date-picker>
          </el-form-item>
          <el-form-item
            label="步长单位"
            key="6"
            prop="stepDateType">
            <datablau-radio :themeBlack="typeDataWareHouse" @change="changeStepDateType" v-model="request.stepDateType">
              <el-radio :label="'years'">年</el-radio>
              <el-radio :label="'months'">月</el-radio>
              <el-radio :label="'days'">日</el-radio>
            </datablau-radio>
          </el-form-item>
          <el-form-item
            label="步长"
            prop="stepDateLength">
            <datablau-input :themeBlack="typeDataWareHouse" @input="changeValue(request, 'stepDateLength', $event)" v-model="request.stepDateLength"></datablau-input>
          </el-form-item>
          <el-form-item
            label="日期格式"
            prop="dateFormat"
          >
            <datablau-radio :themeBlack="typeDataWareHouse" :disabled="request.stepDateType === 'years'" v-model="request.dateFormat">
              <el-radio v-for="item in dateFormat[request.stepDateType]" :label="item.value" :key="item.value">{{item.label}}</el-radio>
            </datablau-radio>
          </el-form-item>
        </template>
      </datablau-form>
      <div slot="footer">
        <datablau-button :themeBlack="typeDataWareHouse" @click="cancelDesign">取消</datablau-button>
        <datablau-button :themeBlack="typeDataWareHouse" type="important" @click="confirmDesign">确定</datablau-button>
      </div>
    </datablau-dialog>
    <div class="partition-type-wrapper">
      <span class="partion-type-title" :style="typeDataWareHouse?'color:#bbbbbb':''">分区类型</span>
      <datablau-radio :themeBlack="typeDataWareHouse" :disabled="!editMode" @change="changePartitionType" style="display: inline-block;" v-model="partitionShow.properties.PartitionType">
        <el-radio v-for="item in partitionType" :label="item.value" :key="item.value">{{item.label}}</el-radio>
      </datablau-radio>
    </div>
    <el-collapse v-model="defaultOpen" :class="{'collapseDataWareHouse':typeDataWareHouse}" >
      <el-collapse-item class="partition-expression-wrapper" name="expression">
        <template slot="title">
          <!-- <datablau-detail-subtitle title="分区表达式1" mt="10px"></datablau-detail-subtitle> -->
          <h2 class="title-hint" :style="typeDataWareHouse?'color:#bbbbbb':''">分区表达式</h2>
        </template>
        <div class="content">
          <span class="first">分区表达式</span>
          <el-autocomplete
          :class="{'autocompleteDataWareHouse':typeDataWareHouse}"
            :disabled="!editMode || partitionShow.properties.PartitionType === 'None' || partitionShow.properties.PartitionType === 'Key'"
            class="expression-input"
            v-model="partitionShow.properties.PartitionMemberExpression"
            @focus="expressionFocus"
            @input="expressionInput"
            :fetch-suggestions="querySearch"
            placeholder="请输入内容"
            @select="handlePartionSelect"
            :popper-class="typeDataWareHouse ? 'balckpopper-class' : ''"
          ></el-autocomplete>
        </div>
        <div class="columns">
          <datablau-transfer
            style="height: 100%"
            :width="235"
            v-model="partitionShow.properties.partitionColumnIds"
            :data="columns"
            filterable
            target-order="shift"
            :titles="['字段选择', '分区成员']"
            @change="changeTransfer"
            :themeBlack="typeDataWareHouse"
          >
            <div class="column-item" slot-scope="{option}">
              <span :title="option.cnName ? `${option.label} (${option.cnName})` : option.label">{{option.cnName ? `${option.label} (${option.cnName})` : option.label}}</span>
              <datablau-button :disabled="!editMode|| (partitionShow.properties.partitionColumnIds && (partitionShow.properties.partitionColumnIds.findIndex(i => i === option.key) === 0))" @click.prevent.stop="upColumn(option)" type="icon" class="iconfont icon-up"></datablau-button>
              <datablau-button :disabled="!editMode || (partitionShow.properties.partitionColumnIds && (partitionShow.properties.partitionColumnIds.findIndex(i => i === option.key) === partitionShow.properties.partitionColumnIds.length -1))" @click.prevent.stop="downColumn(option)" type="icon" class="iconfont icon-down"></datablau-button>
            </div>
          </datablau-transfer>
        </div>
      </el-collapse-item>
      <el-collapse-item v-if="partitionBianJieShow" class="partition-border-wrapper" name="border">
        <template v-if="partitionShow.properties.PartitionType === 'Range' || partitionShow.properties.PartitionType === 'List' || (partitionShow.properties.PartitionType === 'Hash' && currentModel.TypeUniqueId === '2c85c9ca-d052-467c-8c55-d367d69982cf')">
          <template slot="title">
            <h2 class="title-hint" :style="typeDataWareHouse?'color:#bbbbbb':''">分区边界</h2>
          </template>
          <div class="buttons">
            <datablau-button
              :disabled="!editMode"
              type="text"
              style="font-size: 14px"
              class="el-icon-circle-plus-outline"
              @click="addPartition"
            >
              新建分区
            </datablau-button>
            <datablau-button
              v-if="partitionShow.properties.PartitionType === 'Range'"
              :disabled="!editMode"
              type="text"
              style="font-size: 14px"
              @click="designPartition"
            ><img :src="editMode ? partitionDesignImg:partitionDesignDisabledImg" width="16" height="16" /> 分区设计器</datablau-button>
          </div>
          <div class="table-content table-box1" :class="{'black-table-box1': typeDataWareHouse}">
            <datablau-table
              :border="!typeDataWareHouse"
              header-row-class-name="table-header-class"
              :cell-style="{height: '30px'}"
              :disabled="!editMode"
              :data="partitionElementList"
              row-key="id"
              ref="partitionElementTable"
              @focusin.native="handleFocusIn"
              @focusout.native="handleFocusOut"
              @cell-mouse-enter="handleCellMouseEnter"
              @cell-mouse-leave="handleCellMouseLeave"
              @mousedown.native="handleTableMouseDown"
              @mouseup.native="handleTableMouseUp"
              :cell-class-name="tableCellClassName"
              @paste.native="handleTablePaste"
              :themeBlack="typeDataWareHouse"
              @copy.native="handleTableCopy">
              <el-table-column label="分区">
                <template slot-scope="scope">
                  <datablau-input :class="caculateBorderClass(scope)" :disabled="!editMode" v-model="scope.row.properties.Name"></datablau-input>
                </template>
              </el-table-column>
              <el-table-column label="边界值">
                <template slot-scope="scope">
                  <datablau-input :class="caculateBorderClass(scope)" :disabled="!editMode" v-model="scope.row.properties.Text"></datablau-input>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template slot-scope="scope">
                  <datablau-button type="icon" class="iconfont icon-delete" :disabled="!editMode" @click="deleteElement(scope.$index)"></datablau-button>
                  <datablau-button type="icon" class="iconfont icon-up" :disabled="scope.$index === 0 || !editMode" @click="upElement(scope.$index)"></datablau-button>
                  <datablau-button type="icon" class="iconfont icon-down" :disabled="scope.$index === partitionElementList.length - 1 || !editMode" @click="downElement(scope.$index)"></datablau-button>
                </template>
              </el-table-column>
            </datablau-table>
          </div>
        </template>
        <template v-else-if="partitionShow.properties.PartitionType === 'Hash' || partitionShow.properties.PartitionType === 'Key'">
          <template slot="title">
            <h2 class="title-hint" :style="typeDataWareHouse?'color:#bbbbbb':''">分区边界</h2>
          </template>
          <div>
            <span style="margin-right: 6px;" :style="{color: typeDataWareHouse ? '#BBBBBB': '#303133'}">分区数</span>
            <datablau-input :themeBlack="typeDataWareHouse" size="mini" :disabled="!editMode" style="margin-top: 7px;display: inline-block;" @input="changeValue(partitionShow.properties, 'PartitionsNumber', $event)" v-model="partitionShow.properties.PartitionsNumber"></datablau-input>
          </div>
        </template>
      </el-collapse-item>
    </el-collapse>
    <!--<div class="partition-expression-wrapper">
      <h2 class="title-hint">分区表达式</h2>
      <div class="content">
        <span class="first">分区表达式</span>
        <el-autocomplete
          :disabled="!editMode || partitionShow.properties.PartitionType === 'None' || partitionShow.properties.PartitionType === 'Key'"
          class="expression-input"
          v-model="partitionShow.properties.PartitionMemberExpression"
          :fetch-suggestions="querySearch"
          placeholder="请输入内容"
          @select="handlePartionSelect"
        ></el-autocomplete>
      </div>
      <div class="columns">
        <datablau-transfer
          style="height: 100%"
          :width="235"
          v-model="partitionShow.properties.partitionColumnIds"
          :data="columns"
          filterable
          target-order="shift"
          :titles="['字段选择', '分区成员']"
          @change="changeTransfer"
        >
          <div class="column-item" slot-scope="{option}">
            <span :title="option.cnName ? `${option.label} (${option.cnName})` : option.label">{{option.cnName ? `${option.label} (${option.cnName})` : option.label}}</span>
            <datablau-button :disabled="partitionShow.properties.partitionColumnIds && (partitionShow.properties.partitionColumnIds.findIndex(i => i === option.key) === 0)" @click.prevent.stop="upColumn(option)" type="icon" class="iconfont icon-up"></datablau-button>
            <datablau-button :disabled="partitionShow.properties.partitionColumnIds && (partitionShow.properties.partitionColumnIds.findIndex(i => i === option.key) === partitionShow.properties.partitionColumnIds.length -1)" @click.prevent.stop="downColumn(option)" type="icon" class="iconfont icon-down"></datablau-button>
          </div>
        </datablau-transfer>
      </div>
    </div>
    <div class="partition-border-wrapper">
      <template v-if="partitionShow.properties.PartitionType === 'Range' || partitionShow.properties.PartitionType === 'List' || (partitionShow.properties.PartitionType === 'Hash' && currentModel.TypeUniqueId === '2c85c9ca-d052-467c-8c55-d367d69982cf')">
        <h2 class="title-hint">分区边界</h2>
        <div class="buttons">
          <datablau-button
            :disabled="!editMode"
            type="text"
            style="font-size: 14px"
            class="el-icon-circle-plus-outline"
            @click="addPartition"
          >
            新建分区
          </datablau-button>
          <datablau-button
            v-if="partitionShow.properties.PartitionType === 'Range'"
            :disabled="!editMode"
            type="text"
            style="font-size: 14px"
            @click="designPartition"
          ><img :src="partitionDesignImg" width="16" height="16" /> 分区设计器</datablau-button>
        </div>
        <div class="table-content table-box1">
          <datablau-table
            border
            header-row-class-name="table-header-class"
            :cell-style="{height: '30px'}"
            :disabled="!editMode"
            :data="partitionElementList"
            row-key="id"
            ref="partitionElementTable"
            @focusin.native="handleFocusIn"
            @focusout.native="handleFocusOut"
            @cell-mouse-enter="handleCellMouseEnter"
            @cell-mouse-leave="handleCellMouseLeave"
            @mousedown.native="handleTableMouseDown"
            @mouseup.native="handleTableMouseUp"
            :cell-class-name="tableCellClassName"
            @paste.native="handleTablePaste"
            @copy.native="handleTableCopy">
            <el-table-column label="分区">
              <template slot-scope="scope">
                <datablau-input :class="caculateBorderClass(scope)" :disabled="!editMode" v-model="scope.row.properties.Name"></datablau-input>
              </template>
            </el-table-column>
            <el-table-column label="边界值">
              <template slot-scope="scope">
                <datablau-input :class="caculateBorderClass(scope)" :disabled="!editMode" v-model="scope.row.properties.Text"></datablau-input>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template slot-scope="scope">
                <datablau-button type="icon" class="iconfont icon-delete" :disabled="!editMode" @click="deleteElement(scope.$index)"></datablau-button>
                <datablau-button type="icon" class="iconfont icon-up" :disabled="scope.$index === 0 || !editMode" @click="upElement(scope.$index)"></datablau-button>
                <datablau-button type="icon" class="iconfont icon-down" :disabled="scope.$index === partitionElementList.length - 1 || !editMode" @click="downElement(scope.$index)"></datablau-button>
              </template>
            </el-table-column>
          </datablau-table>
        </div>
      </template>
      <template v-else-if="partitionShow.properties.PartitionType === 'Hash' || partitionShow.properties.PartitionType === 'Key'">
        <h2 class="title-hint">分区边界</h2>
        <div>
          <span style="margin-right: 6px;">分区数</span>
          <datablau-input :disabled="!editMode" style="margin-top: 7px;display: inline-block;" @input="changeValue(partitionShow.properties, 'PartitionsNumber', $event)" v-model="partitionShow.properties.PartitionsNumber"></datablau-input>
        </div>
      </template>
    </div>-->
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
      partitionShow: {
        properties: {
        }
      },
      partitionShowTemplate: {
        children: [],
        objectClass: 'Datablau.LDM.Partition',
        properties: {
          // Id: this.deliverNum.seed,
          Id: '',
          Name: '',
          // Name: `Partition_${this.deliverNum.seed++}`,
          PartitionMemberExpression: '',
          PartitionsNumber: '',
          PartitionElementOrderRefs: '',
          PartitionMemberOrderRefs: '',
          partitionColumnIds: '',
          PartitionType: 'None',
          TypeId: LDMTypes.Partition,
          UniqueId: uuidv4()
        }
      },
      columns: this.allCols.filter(i => !i.deleted).map(i => ({
        key: i.elementId,
        label: i.name,
        cnName: i.cnName,
        dataType: i.dataType,
        disabled: !this.editMode || this.partitionShow?.properties?.PartitionType === 'None'
      })),
      columnsMap: this.allCols.filter(i => !i.deleted).reduce((pre, cur) => ({
        ...pre,
        [cur.elementId]: {
          key: cur.elementId,
          label: cur.name,
          cnName: cur.cnName,
          dataType: cur.dataType,
          disabled: !this.editMode || this.partitionShow?.properties?.PartitionType === 'None'
        }
      }), {}),
      partitionMemberList: [],
      partitionElementList: []
    }
  },
  props: {
    allCols: {
      required: true
    },
    partition: {
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
    partitionElementDesign: { // 分区边界设计临时保存

    },
    rawData: {

    },
    typeDataWareHouse: {

    }
  },
  computed: {
    partitionBianJieShow () {
      return this.partitionShow.properties.PartitionType !== 'None' && (this.currentModel.TypeUniqueId === '2c85c9ca-d052-467c-8c55-d367d69982cf' || this.currentModel.TypeUniqueId === '0f691fa0-3fd7-42f1-b868-051b0ffad10c')
    },
    expressionOption () {
      if (this.currentModel.TypeUniqueId === '2c85c9ca-d052-467c-8c55-d367d69982cf' || this.currentModel.TypeUniqueId === '0f691fa0-3fd7-42f1-b868-051b0ffad10c') { // PostgreSQL 、MySQL
        return [{
          value: 'ABS()'
        }, {
          value: 'DateDiff()'
        }, {
          value: 'Day()'
        }, {
          value: 'DayOfMonth()'
        }, {
          value: 'DayOfWeek()'
        }, {
          value: 'DayOfYear()'
        }, {
          value: 'Floor()'
        }, {
          value: 'Hour()'
        }, {
          value: 'Minute()'
        }, {
          value: 'Mod()'
        }, {
          value: 'Month()'
        }, {
          value: 'Quarter()'
        }, {
          value: 'Second()'
        }, {
          value: 'To_Days()'
        }, {
          value: 'To_Seconds()'
        }, {
          value: 'Week()'
        }, {
          value: 'WeekDay()'
        }, {
          value: 'Year()'
        }, {
          value: 'YearWeek()'
        }]
      } else if (this.currentModel.TypeUniqueId === '647f241e-bf2f-7f19-6754-ec94e1c07bec') { // iceberg
        return [{
          value: 'hour()'
        }, {
          value: 'hours()'
        }, {
          value: 'month()'
        }, {
          value: 'months()'
        }, {
          value: 'truncate()'
        }, {
          value: 'year()'
        }, {
          value: 'years()'
        }]
      } else {
        return []
      }
    },
    partitionType () {
      if (this.currentModel.TypeUniqueId === '2c85c9ca-d052-467c-8c55-d367d69982cf') { // PostgreSQL
        return [{ // PostGre 没有Key
          label: 'None',
          value: 'None'
        }, {
          label: 'Range',
          value: 'Range'
        }, {
          label: 'List',
          value: 'List'
        }, {
          label: 'Hash',
          value: 'Hash'
        }]
      } else if (this.currentModel.TypeUniqueId === '0f691fa0-3fd7-42f1-b868-051b0ffad10c') { // MySQL
        return [{
          label: 'None',
          value: 'None'
        }, {
          label: 'Range',
          value: 'Range'
        }, {
          label: 'List',
          value: 'List'
        }, {
          label: 'Hash',
          value: 'Hash'
        }, {
          label: 'Key',
          value: 'Key'
        }]
      } else if (this.currentModel.TypeUniqueId === '647f241e-bf2f-7f19-6754-ec94e1c07bec') { // iceberge
        return [{
          label: 'None',
          value: 'None'
        }, {
          label: 'Expr',
          value: 'Expr'
        }]
      } else {
        return []
      }
    },
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
    this.initPartition()
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
          disabled: !this.editMode || this.partitionShow?.properties?.PartitionType === 'None'
        }))
        this.columnsMap = this.allCols.filter(i => !i.deleted).reduce((pre, cur) => ({
          ...pre,
          [cur.elementId]: {
            key: cur.elementId,
            label: cur.name,
            cnName: cur.cnName,
            dataType: cur.dataType,
            disabled: !this.editMode || this.partitionShow?.properties?.PartitionType === 'None'
          }
        }), {})
        this.partitionShow.properties.partitionColumnIds = this.partitionShow.properties.partitionColumnIds.filter(key => this.columns.map(i => i.key).includes(key))
      }
    }
  },
  methods: {
    expressionFocus () {
      this.focus = true
    },
    expressionInput () {
      this.focus = false
    },
    deleteColumn (columnId) {
      let index = this.partitionMemberList.findIndex((member) => member.properties.AttributeRef === columnId)
      if (index !== -1) {
        // this.partitionShow.properties.partitionColumnIds.splice(index, 1) //在watch里已修改，不需要重复修改
        this.partitionMemberList.splice(index, 1)
        this.partitionShow.properties.PartitionMemberExpression = this.partitionShow.properties.PartitionMemberExpression.replace(/^(\S+)\(\S*\)/, `$1(${this.partitionShow.properties.partitionColumnIds.map(key => this.columnsMap[key].label).join(',')})`)
        this.partitionShow.properties.PartitionMemberOrderRefs = this.partitionMemberList.map(member => member.properties.Id)
      }
    },
    changeType (type) {
      if (type === 'value') {
        this.request.startDate = ''
        this.request.endDate = ''
        this.request.stepDateType = 'years'
        this.request.stepDateLength = ''
        this.request.dateFormat = 'YYYY'
      } else if (type === 'date') {
        this.request.startVal = ''
        this.request.endVal = ''
        this.request.stepLength = ''
      }
    },
    escKeydown (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        let activeEle = document.activeElement
        if (activeEle.tagName === 'INPUT') {
          let $newInput = null
          let $input = $(document.activeElement)
          let text = $input.val()
          if (e.key === 'ArrowRight' && activeEle.selectionEnd === text.length) { // 下一个
            $newInput = $input.closest('td').next('td').find('input')
            $newInput.focus()
          } else if (e.key === 'ArrowLeft' && activeEle.selectionStart === 0) { // 上一个
            $newInput = $input.closest('td').prev('td').find('input')
            $newInput.focus()
          }
        }
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        let activeEle = document.activeElement
        if (activeEle.tagName === 'INPUT') {
          let $input = $(document.activeElement)
          let index = $input.closest('tr').children('td').index($input.closest('td'))
          let $newInput = null
          if (e.key === 'ArrowUp') { // 上一个
            $newInput = $($input.closest('tr').prev('tr').children('td')[index]).find('input')
            $newInput.focus()
          } else if (e.key === 'ArrowDown') { // 下一个
            $newInput = $($input.closest('tr').next('tr').children('td')[index]).find('input')
            $newInput.focus()
          }
          const mousedownEvent = new MouseEvent('mousedown', {
            bubbles: true, // 是否冒泡
            cancelable: true, // 是否可取消
            view: window // 事件所属的窗口对象
          })
          const mouseupEvent = new MouseEvent('mouseup', {
            bubbles: true, // 是否冒泡
            cancelable: true, // 是否可取消
            view: window // 事件所属的窗口对象
          })
          $newInput[0]?.dispatchEvent(mousedownEvent)
          $newInput?.click()
          $newInput[0]?.dispatchEvent(mouseupEvent)
        }
      }
    },
    async handleTableCopy (e) {
      if (this.isFocusArea) {
        e.preventDefault()
        let str = ''
        for (let i = this.startRow; i <= this.endRow; i++) {
          for (let j = this.startColumn; j <= this.endColumn; j++) {
            let item = this.partitionElementList[i]
            str += (item.properties[this.dbHeaders[j]] || '') + '\t'
          }
          str = str.substr(0, str.length - 1)
          str += '\r\n'
        }
        str = str.substr(0, str.length - 2)
        e.clipboardData.setData('text/plain', str)
      }
    },
    isFocusAreaText (str) {
      let arr = str.split('\r\n')
      if (arr.length > 1) {
        return true
      }
      for (let i = 0; i < arr.length; i++) {
        let item = arr[i].split('\t')
        if (item.length > 1) {
          return true
        }
      }
      return false
    },
    async handleTablePaste (evt) {
      let paste = (evt.clipboardData || window.clipboardData).getData('text')
      console.log(paste)
      if (this.isFocusArea || this.isFocusAreaText(paste)) {
        evt.preventDefault()
        let rows = paste.split(/\r\n/)
        if (!rows.length) {
          return
        }
        let rowStart = this.isFocusArea ? this.startRow : this.tempFocusRow
        let firstI = this.isFocusArea ? this.startColumn : this.tempFocusColumn
        if (rows.length > this.partitionElementList.length - rowStart) {
          try {
            await this.$confirm(`是否创建分区？`, '', {
              type: 'warning'
            })
            for (let i = 0; i <= rows.length - (this.partitionElementList.length - rowStart); i++) {
              this.addPartition()
            }
          } catch (e) {
            rows.splice(this.partitionElementList.length - rowStart + 1)
          }
        }
        for (let i = 0; i < rows.length; i++) {
          if (rows[i]) {
            let rowsArr = rows[i].split(/\t/)
            let item = this.partitionElementList[rowStart + i]
            for (let j = firstI; j < Math.min(firstI + rowsArr.length, this.dbHeaders.length); j++) {
              item.properties[this.dbHeaders[j]] = rowsArr[j - firstI]
            }
          }
        }
      }
    },
    caculateBorderClass (scope) {
      let i = scope.$index
      let j = scope.column.columnIndex
      let borderClass = ''
      if (scope.row.focusArea && scope.row.focusArea[this.dbHeaders[j]]) { // 需要边框
        if (i === 0 || !this.partitionElementList[i - 1].focusArea[this.dbHeaders[j]]) {
          borderClass += 'top '
        }
        if (i === this.partitionElementList.length - 1 || !this.partitionElementList[i + 1].focusArea[this.dbHeaders[j]]) { // 需要上边框
          borderClass += 'bottom '
        }
        if (!scope.row.focusArea[this.dbHeaders[j - 1]]) {
          borderClass += 'left '
        }
        if (!scope.row.focusArea[this.dbHeaders[j + 1]]) {
          borderClass += 'right '
        }
        return borderClass
      } else {
        return ''
      }
    },
    handleTableMouseDown (e) {
      if (e.target.className.indexOf('el-table__body-wrapper') !== -1) {
        return
      }
      this.drag = true
      this.dragStart.row = this.tempRow
      this.dragStart.column = this.tempColumn
      this.tempFocusRow = this.tempRow
      this.tempFocusColumn = this.tempColumn
      // if (!$(evt.target).parents('td').hasClass('focus')) {
      this.partitionElementList.forEach(item => {
        this.$set(item, 'focusArea', {
          Name: false,
          Text: false
        })
      })
      // }
      // this.allCols[this.tempFocusRow].focusArea.splice(this.tempFocusColumn, 1, true)
      this.isFocusArea = false
    },
    handleTableMouseUp (evt) {
      this.drag = false
      this.dragStart.row = -1
      this.dragStart.column = -1
    },
    handleCellMouseLeave (row, column, cell, event) {
      if (this.drag) {

      }
    },
    handleCellMouseEnter (row, column, cell, event) {
      this.tempRow = row.rowIndex
      this.tempColumn = column.columnIndex
      if (this.drag) {
        if (this.dragStart.row !== -1) {
          let tempRow = row.rowIndex
          let tempColumn = column.columnIndex
          this.drawArea(this.dragStart.row, this.dragStart.column, tempRow, tempColumn)
        }
      }
    },
    drawArea (startRow, startColumn, endRow, endColumn) {
      if (startRow > endRow) {
        this.drawArea(endRow, startColumn, startRow, endColumn)
        return
      }
      if (startColumn > endColumn) {
        this.drawArea(startRow, endColumn, endRow, startColumn)
        return
      }
      this.startRow = startRow
      this.endRow = endRow
      this.startColumn = startColumn
      this.endColumn = endColumn
      this.partitionElementList.forEach((item, index) => {
        for (let k in item.focusArea) {
          item.focusArea[k] = false
        }
        if (index >= startRow && index <= endRow) {
          for (let i = startColumn; i <= endColumn; i++) {
            item.focusArea[this.dbHeaders[i]] = true
          }
        }
      })
      this.isFocusArea = true
    },
    tableCellClassName ({ row, column, rowIndex, columnIndex }) {
      row.rowIndex = rowIndex
      column.columnIndex = columnIndex
      if (row.focusArea && row.focusArea[this.dbHeaders[columnIndex]]) {
        return 'focus'
      } else {
        return ''
      }
    },
    handleFocusIn (event) {
      clearTimeout(this.focusTimeout)
      this.isFocusOnly = true
    },
    handleFocusOut (event) {
      this.focusTimeout = setTimeout(() => {
        this.isFocusOnly = false
      }, 500)
    },
    temporarySave () {
      this.del = this.mod = this.new = null
      this.partitionShow.children = _.concat(this.partitionMemberList, this.partitionElementList)
      this.partitionShow.properties.PartitionMemberOrderRefs = this.partitionShow.properties.PartitionMemberOrderRefs.join(',')
      this.partitionShow.properties.PartitionElementOrderRefs = this.partitionShow.properties.PartitionElementOrderRefs.join(',')
      let comparePartition = _.cloneDeep(this.partitionShow) // 用作比较
      delete comparePartition.properties.partitionColumnIds
      delete comparePartition.properties.new
      delete comparePartition.properties.changed
      if (!comparePartition.properties.PartitionsNumber) {
        delete comparePartition.properties.PartitionsNumber
      }
      if (!comparePartition.properties.PartitionElementOrderRefs) {
        delete comparePartition.properties.PartitionElementOrderRefs
      }
      if (!comparePartition.properties.PartitionMemberExpression) {
        delete comparePartition.properties.PartitionMemberExpression
      }
      if (!comparePartition.properties.PartitionMemberOrderRefs) {
        delete comparePartition.properties.PartitionMemberOrderRefs
      }
      comparePartition.children?.sort((a, b) => {
        return a.properties.Id - b.properties.Id
      })
      comparePartition.children?.forEach(item => {
        if (item.objectClass === 'Datablau.LDM.PartitionElement') {
          delete item.rowIndex
        }
      })
      let comparePartition1 = this.partition ? _.cloneDeep(this.partition) : { properties: {} } // 用作比较
      delete comparePartition1.properties.partitionColumnIds
      delete comparePartition1.properties.new
      delete comparePartition1.properties.changed
      if (!comparePartition1.properties.PartitionsNumber) {
        delete comparePartition1.properties.PartitionsNumber
      }
      comparePartition1.children?.sort((a, b) => {
        return a.properties.Id - b.properties.Id
      })
      if (!this.partitionShow.properties.new && this.partitionShow.properties.PartitionType === 'None' && this.partition.properties.PartitionType !== 'None') { // deleted
        this.del = this.partitionShow
      } else if (!this.partitionShow.properties.new && !_.isEqual(comparePartition, comparePartition1)) { // modified
        this.mod = this.partitionShow
      } else if (this.partitionShow.properties.new && this.partitionShow.properties.PartitionType !== 'None') { // new
        this.new = this.partitionShow
      }
      this.rawData.partitionElementDesign = this.mapPartitionElementDesignRevertToSave()
    },
    changePartitionType (type) {
      if (type === 'None') {
        this.partitionShow.children = []
        this.partitionShow.properties.PartitionMemberExpression = ''
        this.partitionShow.properties.PartitionsNumber = ''
        this.partitionShow.properties.PartitionMemberOrderRefs = []
        this.partitionShow.properties.partitionColumnIds = []
        this.partitionShow.properties.PartitionElementOrderRefs = []
        this.partitionMemberList = []
        this.partitionElementList = []
      } else if (type === 'Key') {
        this.partitionShow.properties.PartitionMemberExpression = ''
      }
      this.columns = this.allCols.filter(i => !i.deleted).map(i => ({
        key: i.elementId,
        label: i.name,
        cnName: i.cnName,
        dataType: i.dataType,
        disabled: !this.editMode || this.partitionShow?.properties?.PartitionType === 'None'
      }))
    },
    changeStepDateType (val) {
      if (val === 'years') {
        this.request.dateFormat = 'YYYY'
      } else if (val === 'months') {
        this.request.dateFormat = 'YYYY-MM'
      } else if (val === 'days') {
        this.request.dateFormat = 'YYYY-MM-DD'
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
    changeValue2 (item, key, value) {
      let valueInt = parseInt(value)
      if (isNaN(value) || parseFloat(value).toString().includes('.') || value.toString().includes('.')) {
        this.$datablauMessage.warning('必须大于等于0的整数')
        item[key] = isNaN(valueInt) ? undefined : valueInt
      } else if (valueInt < 0) {
        this.$datablauMessage.warning('必须大于等于0的整数')
        item[key] = 1
      }
    },
    cancelDesign () {
      // this.$refs.form.resetFields()
      if (this.requestBak) {
        this.request = _.cloneDeep(this.requestBak)
      }
      this.designModal = false
    },
    confirmDesign () {
      let res = false
      this.$refs.form.validate((valid) => {
        res = valid
      })
      if (res) {
        if (this.request.type === 'value') {
          this.changeType('value')
          let startVal = +this.request.startVal
          let endVal = +this.request.endVal
          let step = +this.request.stepLength
          if (step === 0) {
            this.designModal = false
            return
          }
          let i = startVal + step
          let j = endVal
          let list = []
          let num = this.request.sync.includes('cover') ? 0 : this.getMaxNum(this.partitionElementList) + 1
          // mysql 并且字段为varchar或者char
          let addDot = this.currentModel.TypeUniqueId === '0f691fa0-3fd7-42f1-b868-051b0ffad10c' && this.partitionShow.properties.partitionColumnIds.length && this.partitionShow.properties.partitionColumnIds.every(id => this.columns.find(item => item.key === id).dataType.toUpperCase().indexOf('CHAR') !== -1)
          if (this.request.sync.includes('start')) {
            list.push({
              objectClass: 'Datablau.LDM.PartitionElement',
              properties: {
                Id: this.deliverNum.seed++,
                Name: `Part${num++}`,
                Text: addDot ? `'${startVal}'` : startVal,
                TypeId: LDMTypes.PartitionElement,
                UniqueId: uuidv4()
              }
            })
          }
          while (i <= j) {
            list.push({
              objectClass: 'Datablau.LDM.PartitionElement',
              properties: {
                Id: this.deliverNum.seed++,
                Name: `Part${num++}`,
                Text: addDot ? `'${i}'` : i,
                TypeId: LDMTypes.PartitionElement,
                UniqueId: uuidv4()
              }
            })
            i += step
          }
          if (this.request.sync.includes('end')) {
            if (!list.find(item => item.properties.Text === (addDot ? `'${endVal}'` : endVal))) {
              list.push({
                objectClass: 'Datablau.LDM.PartitionElement',
                properties: {
                  Id: this.deliverNum.seed++,
                  Name: `Part${num++}`,
                  Text: addDot ? `'${endVal}'` : endVal,
                  TypeId: LDMTypes.PartitionElement,
                  UniqueId: uuidv4()
                }
              })
            }
          } else {
            if (list.find(item => item.properties.Text === (addDot ? `'${endVal}'` : endVal))) {
              list.splice(list.length - 1, 1)
            }
          }
          if (this.request.sync.includes('cover')) {
            this.partitionElementList = list
          } else {
            this.partitionElementList = this.partitionElementList.concat(list)
          }
        } else if (this.request.type === 'date') {
          this.changeType('date')
          let startDate = moment(this.request.startDate)
          let endDate = moment(this.request.endDate)
          if (+this.request.stepDateLength === 0) {
            this.designModal = false
            return
          }
          let i = moment(startDate).add(parseInt(this.request.stepDateLength), this.request.stepDateType)
          // let j = this.request.sync.includes('end') ? endDate : moment(endDate).add(-parseInt(this.request.stepDateLength), this.request.stepDateType)
          let j = endDate
          let num = this.request.sync.includes('cover') ? 0 : this.getMaxNum(this.partitionElementList) + 1
          let list = []
          let addDot = this.currentModel.TypeUniqueId === '0f691fa0-3fd7-42f1-b868-051b0ffad10c'
          if (this.request.sync.includes('start')) {
            list.push({
              objectClass: 'Datablau.LDM.PartitionElement',
              properties: {
                Id: this.deliverNum.seed++,
                Name: `Part${num++}`,
                Text: addDot ? `'${startDate.format(this.request.dateFormat)}'` : startDate.format(this.request.dateFormat),
                TypeId: LDMTypes.PartitionElement,
                UniqueId: uuidv4()
              }
            })
          }
          while (i.valueOf() <= j.valueOf()) {
            list.push({
              objectClass: 'Datablau.LDM.PartitionElement',
              properties: {
                Id: this.deliverNum.seed++,
                Name: `Part${num++}`,
                Text: addDot ? `'${i.format(this.request.dateFormat)}'` : i.format(this.request.dateFormat),
                TypeId: LDMTypes.PartitionElement,
                UniqueId: uuidv4()
              }
            })
            i = i.add(parseInt(this.request.stepDateLength), this.request.stepDateType)
          }
          if (this.request.sync.includes('end')) {
            if (!list.find(item => item.properties.Text === (addDot ? `'${endDate.format(this.request.dateFormat)}'` : endDate.format(this.request.dateFormat)))) {
              list.push({
                objectClass: 'Datablau.LDM.PartitionElement',
                properties: {
                  Id: this.deliverNum.seed++,
                  Name: `Part${num++}`,
                  Text: addDot ? `'${endDate.format(this.request.dateFormat)}'` : endDate.format(this.request.dateFormat),
                  TypeId: LDMTypes.PartitionElement,
                  UniqueId: uuidv4()
                }
              })
            }
          } else {
            if (list.find(item => item.properties.Text === (addDot ? `'${endDate.format(this.request.dateFormat)}'` : endDate.format(this.request.dateFormat)))) {
              list.splice(list.length - 1, 1)
            }
          }
          if (this.request.sync.includes('cover')) {
            this.partitionElementList = list
          } else {
            this.partitionElementList = this.partitionElementList.concat(list)
          }
        }
        this.requestBak = _.cloneDeep(this.request)
        this.designModal = false
      }
    },
    deleteElement (index) {
      this.partitionElementList.splice(index, 1)
    },
    upElement (index) {
      this.partitionElementList.splice(index - 1, 0, this.partitionElementList.splice(index, 1)[0])
      this.partitionShow.properties.PartitionElementOrderRefs = this.partitionElementList.map(member => member.properties.Id)
    },
    downElement (index) {
      this.partitionElementList.splice(index + 1, 0, this.partitionElementList.splice(index, 1)[0])
      this.partitionShow.properties.PartitionElementOrderRefs = this.partitionElementList.map(member => member.properties.Id)
    },
    getMaxNum (list) {
      let num = -1
      list.forEach(member => {
        let res = member.properties.Name.match(/\d+$/)
        if (res) {
          if (+res[0] > num) {
            num = +res[0]
          }
        }
      })
      return num
    },
    addPartition () {
      let num = this.getMaxNum(this.partitionElementList)
      this.partitionElementList.push({
        objectClass: 'Datablau.LDM.PartitionElement',
        properties: {
          Id: this.deliverNum.seed++,
          Name: `Part${++num}`,
          Text: '',
          TypeId: LDMTypes.PartitionElement,
          UniqueId: uuidv4()
        }
      })
    },
    designPartition () {
      this.designModal = true
    },
    initPartition () {
      this.partitionShowTemplate.properties.Id = this.deliverNum.seed
      this.partitionShowTemplate.properties.Name = `Partition_${this.deliverNum.seed++}`
      this.partitionShow = _.cloneDeep(this.partitionShowTemplate)
      if (this.partition) {
        _.merge(this.partitionShow, _.cloneDeep(this.partition))
        this.partitionShow.properties.PartitionMemberOrderRefs = this.partitionShow.properties.PartitionMemberOrderRefs ? this.partitionShow.properties.PartitionMemberOrderRefs.split(',').map(i => +i) : []
        this.partitionShow.properties.partitionColumnIds = this.partitionShow.properties.PartitionMemberOrderRefs.map(memberId => this.partitionShow.children.find(member => member.properties.Id === memberId)?.properties.AttributeRef)
        this.partitionShow.properties.PartitionElementOrderRefs = this.partitionShow.properties.PartitionElementOrderRefs ? this.partitionShow.properties.PartitionElementOrderRefs.split(',').map(i => +i) : []
        // this.partitionShow.properties.new = false 可能是临时保存的，这时new为true不能赋值为false
        this.partitionMemberList = _.cloneDeep(this.partitionShow.children?.filter(member => member.objectClass === 'Datablau.LDM.PartitionMember')).sort((a, b) => {
          let aIndex = this.partitionShow.properties.PartitionMemberOrderRefs.findIndex((id) => a.properties.Id === id)
          let bIndex = this.partitionShow.properties.PartitionMemberOrderRefs.findIndex((id) => b.properties.Id === id)
          if (aIndex === -1 && bIndex === -1) {
            return a.properties.Id - b.properties.Id
          } else {
            return aIndex - bIndex
          }
        })
        this.partitionElementList = _.cloneDeep(this.partitionShow.children?.filter(member => member.objectClass === 'Datablau.LDM.PartitionElement')).sort((a, b) => {
          let aIndex = this.partitionShow.properties.PartitionElementOrderRefs.findIndex((id) => a.properties.Id === id)
          let bIndex = this.partitionShow.properties.PartitionElementOrderRefs.findIndex((id) => b.properties.Id === id)
          if (aIndex === -1 && bIndex === -1) {
            return a.properties.Id - b.properties.Id
          } else {
            return aIndex - bIndex
          }
        })
      } else {
        this.partitionShow.properties.PartitionMemberOrderRefs = this.partitionShow.properties.PartitionMemberOrderRefs ? this.partitionShow.properties.PartitionMemberOrderRefs.split(',').map(i => +i) : []
        this.partitionShow.properties.partitionColumnIds = this.partitionShow.properties.PartitionMemberOrderRefs.map(memberId => this.partitionShow.children.find(member => member.properties.Id === memberId)?.properties.AttributeRef)
        this.partitionShow.properties.PartitionElementOrderRefs = this.partitionShow.properties.PartitionElementOrderRefs ? this.partitionShow.properties.PartitionElementOrderRefs.split(',').map(i => +i) : []
        this.partitionShow.properties.new = true
        this.partitionMemberList = []
        this.partitionElementList = []
      }
      this.mapPartitionElementDesign()
    },
    mapPartitionElementDesign () {
      if (this.partitionElementDesign) {
        let design = this.partitionElementDesign
        this.request.type = design.PartitionCreatedStrategy === 0 ? 'value' : 'date'
        if (this.request.type === 'value') {
          this.request.startVal = design.StartInteger
          this.request.endVal = design.EndInteger
          this.request.stepLength = design.ValueStep
          this.request.sync = []
          if (design.ValueIncludeBoundaryStart) {
            this.request.sync.push('start')
          }
          if (design.ValueIncludeBoundaryEnd) {
            this.request.sync.push('end')
          }
          if (design.OverwriteValueRule) {
            this.request.sync.push('cover')
          }
        } else if (this.request.type === 'date') {
          this.request.startDate = design.StartDate
          this.request.endDate = design.EndDate
          this.request.stepDateLength = design.DateStep
          this.request.sync = []
          if (design.DateIncludeBoundaryStart) {
            this.request.sync.push('start')
          }
          if (design.DateIncludeBoundaryEnd) {
            this.request.sync.push('end')
          }
          if (design.OverwriteDateRule) {
            this.request.sync.push('cover')
          }
          this.request.stepDateType = design.PartitionStep === '日' ? 'days' : design.PartitionStep === '月' ? 'months' : design.PartitionStep === '年' ? 'years' : ''
          this.request.dateFormat = this.dateFormat[this.request.stepDateType].find(item => item.label === design.DateFormat).value
        }
      }
    },
    mapPartitionElementDesignRevertToSave () {
      let design = {}
      design.PartitionCreatedStrategy = this.request.type === 'value' ? 0 : 1
      if (design.PartitionCreatedStrategy === 0) {
        design.StartInteger = this.request.startVal
        design.EndInteger = this.request.endVal
        design.ValueStep = this.request.stepLength
        design.ValueIncludeBoundaryStart = this.request.sync.includes('start')
        design.ValueIncludeBoundaryEnd = this.request.sync.includes('end')
        design.OverwriteValueRule = this.request.sync.includes('cover')
        design.DateIncludeBoundaryStart = false
        design.DateIncludeBoundaryEnd = false
        design.OverwriteDateRule = false
      } else if (design.PartitionCreatedStrategy === 1) {
        design.StartDate = moment(this.request.startDate).valueOf()
        design.EndDate = moment(this.request.endDate).valueOf()
        design.DateStep = this.request.stepDateLength
        design.DateIncludeBoundaryStart = this.request.sync.includes('start')
        design.DateIncludeBoundaryEnd = this.request.sync.includes('end')
        design.OverwriteDateRule = this.request.sync.includes('cover')
        design.PartitionStep = this.request.stepDateType === 'years' ? '年' : this.request.stepDateType === 'months' ? '月' : this.request.stepDateType === 'days' ? '日' : ''
        design.DateFormat = this.dateFormat[this.request.stepDateType].find(item => item.value === this.request.dateFormat).label
        design.ValueIncludeBoundaryStart = false
        design.ValueIncludeBoundaryEnd = false
        design.OverwriteValueRule = false
      }
      return design
    },
    upColumn (item) {
      let index = this.partitionShow.properties.partitionColumnIds.findIndex(i => i === item.key)
      this.partitionShow.properties.partitionColumnIds.splice(index, 1)
      this.partitionShow.properties.partitionColumnIds.splice(index - 1, 0, item.key)
      this.partitionMemberList.splice(index - 1, 0, this.partitionMemberList.splice(index, 1)[0])
      this.partitionShow.properties.PartitionMemberExpression = this.partitionShow.properties.PartitionMemberExpression.replace(/^(\S+)\(\S*\)/, `$1(${this.partitionShow.properties.partitionColumnIds.map(key => this.columnsMap[key].label).join(',')})`)
      this.partitionShow.properties.PartitionMemberOrderRefs = this.partitionMemberList.map(member => member.properties.Id)
    },
    downColumn (item) {
      let index = this.partitionShow.properties.partitionColumnIds.findIndex(i => i === item.key)
      this.partitionShow.properties.partitionColumnIds.splice(index, 1)
      this.partitionShow.properties.partitionColumnIds.splice(index + 1, 0, item.key)
      this.partitionMemberList.splice(index + 1, 0, this.partitionMemberList.splice(index, 1)[0])
      this.partitionShow.properties.PartitionMemberExpression = this.partitionShow.properties.PartitionMemberExpression.replace(/^(\S+)\(\S*\)/, `$1(${this.partitionShow.properties.partitionColumnIds.map(key => this.columnsMap[key].label).join(',')})`)
      this.partitionShow.properties.PartitionMemberOrderRefs = this.partitionMemberList.map(member => member.properties.Id)
    },
    changeTransfer (value, direction, movedKeys) {
      console.log(value, direction, movedKeys)
      this.partitionShow.properties.PartitionMemberExpression = this.partitionShow.properties.PartitionMemberExpression.replace(/^(\S+)\(\S*\)/, `$1(${this.partitionShow.properties.partitionColumnIds.map(key => this.columnsMap[key].label).join(',')})`)
      if (direction === 'right') {
        this.partitionMemberList = this.partitionMemberList.concat(movedKeys.map(key => ({
          objectClass: 'Datablau.LDM.PartitionMember',
          properties: {
            AttributeRef: key,
            Id: this.deliverNum.seed,
            Name: `PartitionMember_${this.deliverNum.seed++}`,
            TypeId: LDMTypes.PartitionMember,
            UniqueId: uuidv4()
          }
        })))
      } else if (direction === 'left') {
        movedKeys.forEach(key => {
          let children = this.partitionMemberList
          let index = children.findIndex(i => i.properties.AttributeRef === key)
          if (index !== -1) {
            children.splice(index, 1)
          }
        })
      }
      this.partitionShow.properties.PartitionMemberOrderRefs = this.partitionMemberList.map(member => member.properties.Id)
    },
    querySearch (queryString, cb) {
      if (queryString && !this.focus) {
        cb(this.expressionOption.filter(item => item.value.toUpperCase().indexOf(queryString.toUpperCase()) > -1))
      } else {
        cb(this.expressionOption)
      }
    },
    handlePartionSelect (item) {
      this.partitionShow.properties.PartitionMemberExpression = item.value.replace('()', `(${this.partitionShow.properties.partitionColumnIds.map(key => this.columnsMap[key].label).join(',')})`)
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
.partition-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
}
.partion-type-title {
  display: inline-block;
  margin-right: 8px;
}
.partition-expression-wrapper {
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
