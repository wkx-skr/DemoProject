<template>
  <div style="height: 100%" class="conUdp">
    <!-- <datablau-dialog
      :visible.sync="editDialogVisible"
      width="640px"
      height="360px"
      append-to-body
      :close-on-click-modal="false"
      :before-close="closeEditDialogVisible"
      :title="$t('meta.DS.udp.proEdit')"
    >
      <edit-udp
        :current-row="currentRow"
        v-if="editDialogVisible"
        @close="closeEditDialogVisible"
        :type-id="currentTypeId"
        :max-order="maxOrder"
        :dupUdpNamMap="dupUdpNamMap"
        @refresh="getUdpsByType"
      ></edit-udp>
    </datablau-dialog> -->
  <datablau-dialog
    :visible.sync="showAddUdp"
    :title="udpEditMode ? '编辑扩展属性' :  '添加扩展属性'"
    width="640px"
    height="430px"
    append-to-body
  >
    <div class="content">
      <datablau-form label-width="80px" :model="udpForm" ref="udpForm" :rules="udpRules"  >
        <el-form-item label="属性名称" prop="name">
          <datablau-input maxlength="100" v-model.trim="udpForm.name" placeholder="请输入属性名"  clearable></datablau-input>
        </el-form-item>
        <el-form-item label="属性分组" prop="groupName">
<!--          <datablau-input v-model="udpForm.groupName" placeholder="请输入分组名"  clearable></datablau-input>-->
          <datablau-select
            v-model="udpForm.groupName"
            :placeholder="'请选择'"
            clearable
            filterable
            @blur="selectBlur"
            @clear="selectClear"
            @change="selectChange"
          >
            <el-option
              v-for="item in udpGroupOptions"
              :key="item"
              :value="item"
              :label="item"
            ></el-option>
            </datablau-select>

        </el-form-item>
        <el-form-item label="属性类型" prop="udpType">
          <datablau-select v-model="udpForm.udpType"  placeholder="请选择属性类型" clearable>
            <el-option v-for="item in udpOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item v-show="udpForm.udpType === 'ENUM'" label="枚举项" prop="udpValConstant">
            <datablau-input
              style="width: 500px"
              v-model="udpForm.udpValConstant"
              placeholder="请输入枚举项用,分隔"
              type="textarea"
            ></datablau-input>
        </el-form-item>
      </datablau-form>
    </div>
    <span slot="footer">
      <datablau-button type="secondary" @click="showAddUdp = false">取 消</datablau-button>
      <datablau-button type="primary" @click="submitUdpForm">
        确 定
      </datablau-button>
    </span>
  </datablau-dialog>
    <datablau-tabs v-model="activeName">
      <el-tab-pane label="文件扩展属性" name="attribute" v-if="auth['DDD_DATAREPO_EXTENDPARAM']"></el-tab-pane>
      <el-tab-pane label="映射规则" name="mappingType" v-if="auth['DDD_DATAREPO_MAPPINGRULE']"></el-tab-pane>
    </datablau-tabs>
    <div v-if="activeName === 'attribute'">
      <div class="top-row">
  <!--      <div class="title">-->
  <!--        文件扩展属性-->
  <!--      </div>-->
        <div class="btn-info">
          <datablau-button
            test-name="metadata_udp_add"
            @click="addProperty"
            type="primary"
            class="iconfont icon-tianjia"
          >
            {{ $t('meta.DS.udp.proAdd') }}
          </datablau-button>
          <!--<datablau-button type="primary" size="small">保存</datablau-button>-->
        </div>
      </div>
      <datablau-form-submit class="tableCon">
      <datablau-table
        :show-column-selection="false"
        class="datablau-table"
        height="100%"
        :data="udpList"
      >
        <!-- <el-table-column
          prop="catalog"
          :label="$t('meta.DS.udp.group')"
          width="100"
          show-overflow-tooltip
        ></el-table-column> -->
        <el-table-column
          prop="name"
          :label="$t('meta.DS.udp.name')"
          min-width="100"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="groupName"
          label="分组"
          min-width="100"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="udpType"
          :label="$t('meta.DS.udp.valRangeType')"
          width="280"
          show-overflow-tooltip
          :formatter="valueTypeFormatter"
        >
          <template slot-scope="scope">
            <span :class="getTypeClass(scope.row.udpType)" class="type-info">
              {{ valueTypeFormatter(scope.row) }}
            </span>
          </template>
        </el-table-column>
        <!-- <el-table-column
          prop="desc"
          :label="$t('meta.DS.udp.desc')"
          show-overflow-tooltip
        ></el-table-column> -->
        <el-table-column
          :label="$t('meta.DS.udp.operation')"
          width="150"
          header-align="right"
          align="right"
        >
          <template slot-scope="scope">
            <datablau-button
              type="icon"
              :title="$t('meta.DS.udp.btn_edit')"
              class="iconfont icon-bianji right-btn"
              @click="modifyProperty(scope.row)"
            >
              <!-- <i></i> -->
            </datablau-button>
            <datablau-button
              type="icon"
              :title="$t('meta.DS.udp.btn_del')"
              @click="deleteRow(scope.row)"
              class="iconfont icon-delete right-btn"
            ></datablau-button>
            <!-- <datablau-button
              type="icon"
              :title="$t('meta.DS.udp.btn_up')"
              style="width: 5px"
              @click="up(scope.$index)"
              :disabled="scope.$index === 0"
              class="iconfont icon-up right-btn"
            ></datablau-button>
            <datablau-button
              type="icon"
              :title="$t('meta.DS.udp.btn_down')"
              style="width: 5px"
              @click="down(scope.$index)"
              :disabled="scope.$index === (udps && udps.length - 1)"
              class="iconfont icon-down right-btn"
            ></datablau-button> -->
          </template>
        </el-table-column>
      </datablau-table>
    </datablau-form-submit>
    </div>
    <div v-if="activeName === 'mappingType'">
      <mappingType></mappingType>
    </div>
  </div>
</template>

<script>
import LDMTypes from '@constant/LDMTypes'
import editUdp from './editUdp.vue'
import HTTP from '../../resource/http'

import mappingType from '@/dataWarehouse/views/udpManage/mappingType'

export default {
  components: { mappingType },
  beforeMount () {
    console.log('set-udp')
  },
  props: {
    from: {
      type: String,
      required: false
    }
  },
  mounted () {
    // this.currentTypeId = TypeMap.meta.TABLE.id
    // this.getUdpsByType()
    this.getUdpList()
  },
  data () {
    const TypeMap = {
      meta: {
        TABLE: {
          id: LDMTypes.Entity.toString(),
          label: this.$t('meta.DS.udp.table')
        },
        VIEW: {
          id: LDMTypes.View.toString(),
          label: this.$t('meta.DS.udp.view')
        },
        COLUMN: {
          id: LDMTypes.Attribute.toString(),
          label: this.$t('meta.DS.udp.column')
        },
        FUNCTION: {
          id: LDMTypes.Function.toString(),
          label: this.$t('meta.DS.udp.function')
        },
        STORED_PROCEDURE: {
          id: LDMTypes.StoredProcedure.toString(),
          label: this.$t('meta.DS.udp.storedProcedure')
        },
        PACKAGE: {
          id: LDMTypes.Package.toString(),
          label: this.$t('meta.DS.udp.package')
        }
      },
      category: {
        CATEGORY: {
          id: LDMTypes.ModelMart,
          label: this.$t('meta.DS.udp.modelMart')
        }
      },
      report: {
        REPORT: {
          id: LDMTypes.Report,
          label: this.$t('meta.DS.udp.report')
        }
      }
    }
    let typeMap = null
    if (this.from === 'modelCategory') {
      typeMap = TypeMap.category
    } else if (this.from === 'report') {
      typeMap = TypeMap.report
    } else {
      typeMap = TypeMap.meta
    }
    const currentTypeId = Object.values(typeMap)[0].id

    return {
      auth: this.$store.state.$auth,
      TypeMap: typeMap,
      udps: null,
      dupUdpNamMap: {},
      currentTypeId: currentTypeId,
      editDialogVisible: false,
      currentRow: null,
      maxOrder: 0,
      tabLoading: false,
      udpList: [],
      udpLoading: false,
      showAddUdp: false,
      udpEditMode: false,
      udpOptions: [
        {
          label: '字符串',
          value: 'STRING'
        },
        {
          label: '数值',
          value: 'NUM'
        },
        {
          label: '枚举',
          value: 'ENUM'
        }
      ],
      udpForm: {
        name: '',
        udpType: '',
        udpValConstant: '',
        groupName: ''
      },
      udpRules: {
        name: {
          required: true,
          message: '请输入属性名称',
          trigger: 'blur'
        },
        udpType: {
          required: true,
          message: '请选择属性类型',
          trigger: 'change'
        },
        groupName: {
          required: true,
          message: '请输入分组名称',
          trigger: 'change'
        }

        // udpValConstant: {
        //   required: true,
        //   message: '请输入枚举项',
        //   trigger: 'change'
        // }

      },
      udpGroupOptions: [], // 扩展属性组
      activeName: this.$store.state.$auth['DDD_DATAREPO_EXTENDPARAM'] ? 'attribute' : 'mappingType'
    }
  },
  methods: {
    // closeEditDialogVisible () {
    //   this.editDialogVisible = false
    //   this.getUdpsByType()
    // },
    // getUdpsByType () {
    //   this.tabLoading = true
    //   const typeId = this.currentTypeId
    //   this.$http
    //     .get(this.$dddUrl + `/service/udp/`)
    //     .then(res => {
    //       this.tabLoading = false
    //       this.udps = res.data.data
    //       this.$utils.sort.sort(this.udps, 'order')
    //       const dupUdpNamMap = {}
    //       this.udps.forEach(item => {
    //         if (item.order > this.maxOrder) {
    //           this.maxOrder = item.order
    //         }
    //         dupUdpNamMap[item.name] = item
    //       })
    //       this.dupUdpNamMap = dupUdpNamMap
    //     })
    //     .catch(e => {
    //       this.tabLoading = false
    //       this.$showFailure(e)
    //     })
    // },
    selectBlur (e) {
      // 属性类别
      if (e.target.value !== '') {
        this.udpForm.groupName = e.target.value
        this.$forceUpdate() // 强制更新
      }
    },
    selectClear () {
      this.udpForm.groupName = ''
      this.$forceUpdate()
    },
    selectChange (val) {
      this.udpForm.groupName = val
      this.$forceUpdate()
    },
    handleTabClick () {
      this.getUdpsByType()
    },
    getUdpList () {
      this.udpLoading = true
      this.$http.get(`${this.$dddUrl}/service/udp/`)
        .then(res => {
          this.udpList = res.data.data
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    getUdpGroups () {
      HTTP.getUdpGroups().then(res => {
        this.udpGroupOptions = res.data
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    addProperty () {
      // this.currentRow = null
      // this.editDialogVisible = true
      this.getUdpGroups()
      this.udpEditMode = false
      this.showAddUdp = true
      this.udpForm = {
        name: '',
        udpType: '',
        udpValConstant: '',
        groupName: ''
      }
      this.$nextTick(() => {
        this.resetForm('udpForm')
      })
    },
    submitUdpForm () {
      this.$refs.udpForm.validate(valid => {
        if (valid) {
          this.udpForm.required = false
          let http = this.udpEditMode ? this.$http.put(`${this.$dddUrl}/service/udp/`, this.udpForm) : this.$http.post(`${this.$dddUrl}/service/udp/`, this.udpForm)
          http.then(res => {
            this.$datablauMessage.success(this.udpEditMode ? '扩展属性修改成功！' : '扩展属性创建成功！')
            this.createProjectModal = false
            this.showAddUdp = false
            this.getUdpList()
          }).catch(err => {
            this.$showFailure(err)
          })
        }
      })
    },
    resetForm (form) {
      if (this.$refs[form]) {
        this.$refs[form].clearValidate()
      }
    },
    modifyProperty (row) {
      this.getUdpGroups()
      this.udpEditMode = true
      let { name, udpType, groupName, udpValConstant, id } = row
      this.udpForm = {
        name,
        udpType,
        groupName,
        udpValConstant,
        id
      }
      this.showAddUdp = true
    },
    getTypeClass (data) {
      return data.toLowerCase()
    },
    valueTypeFormatter (row) {
      const typeData = row.udpType || ''
      switch (row.udpType) {
        case 'STRING':
          return this.$t('meta.DS.udp.valueType.string')
        case 'NUM':
          return this.$t('meta.DS.udp.valueType.num')
        case 'NUM_RANGE':
          return this.$t('meta.DS.udp.valueType.numRange')
        case 'ENUM':
          return (
            this.$t('meta.DS.udp.valueType.enum') +
              '(' +
            row.udpValConstant +
              ')'
          )
        case 'BOOL':
          return this.$t('meta.DS.udp.valueType.boolean')
        default:
          return row.udpType
      }
    },
    deleteRow (row) {
      this.$DatablauCofirm(`扩展属性 “${row.name}” ,确定要删除？`).then(() => {
        this.$http.delete(`${this.$dddUrl}/service/udp/${row.id}`)
          .then(res => {
            this.$datablauMessage.success('扩展属性删除成功')
            this.getUdpList()
          })
          .catch(err => {
            this.$showFailure(err)
          })
      })
    }
    // up (index) {
    //   this.swap(index - 1, index)
    // },
    // down (index) {
    //   this.swap(index, index + 1)
    // },
    // swap (prev, next) {
    //   this.udps[prev].order = next
    //   this.udps[next].order = prev
    //   this.$utils.sort.sort(this.udps, 'order')
    //   this.changeOrder(this.udps[prev], () => {
    //     this.changeOrder(this.udps[next])
    //   })
    // },
    // changeOrder (requestBody, callback) {
    //   this.$http
    //     .post(
    //       this.$url + `/service/entities/udps/${this.currentTypeId}`,
    //       requestBody
    //     )
    //     .then(res => {
    //       if (callback) {
    //         callback()
    //       }
    //     })
    //     .catch(e => {
    //       this.$showFailure(e)
    //     })
    // }
  }
}
</script>
<style lang="scss" scoped="scoped">
  @import '~@/next/components/basic/color.sass';
  $middle-color: #e0e0e0;
  $primary-green: #3dae5d;
  $primary-purple: #a14dff;
  $primary-orange: #eb8449;
  $primary-enum: #43c1ca;
  $primary-boolen: #5775dc;
  .top-border {
    width: 1000px;
    height: 1px;
    background-color: $border-color;
    margin-left: -20px;
    margin-right: 20px;
    overflow: hidden;
  }
  .type-info {
    &:before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 8px;
      margin-left: 3px;
    }
    &.string {
      color: $primary-green;
      &:before {
        background-color: $primary-green;
      }
    }
    &.num {
      color: $primary-purple;
      &:before {
        background-color: $primary-purple;
      }
    }
    &.num_range {
      color: $primary-orange;
      &:before {
        background-color: $primary-orange;
      }
    }
    &.enum {
      color: $primary-enum;
      &:before {
        background-color: $primary-enum;
      }
    }
    &.bool {
      color: $primary-boolen;
      &:before {
        background-color: $primary-boolen;
      }
    }
  }
  .right-btn {
    color: $text-default;
    &:hover {
      color: $primary-color;
    }
  }
  .top-row {
    height: 40px;
    .title {
      float: left;
      font-size: 16px;
      font-weight: bold;
      color: #555;
    }
    .datablau-tabs {
      display: inline-block;
    }
    .btn-info {
      float: right;
    }
  }
  .tableCon{
    position: absolute;
    top: 78px;
    left: -20px;
    right: -20px;
    .tableBox{
      height: 100%;
    }
  }
  .conUdp{
    position: absolute;
    top: 0;
    left: 20px;
    right: 20px;
    bottom: 0;
    /*width: 100%;*/
    /*top: -20px;*/
  }
</style>
