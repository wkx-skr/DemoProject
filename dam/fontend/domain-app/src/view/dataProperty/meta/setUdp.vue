<template>
  <div>
    <datablau-dialog
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
    </datablau-dialog>
    <div class="top-row">
      <datablau-tabs
        type="card"
        v-model="currentTypeId"
        v-if="!from"
        @tab-click="handleTabClick"
      >
        <el-tab-pane
          v-for="t in TypeMap"
          :label="t.label"
          :key="t.id"
          :name="t.id"
        ></el-tab-pane>
      </datablau-tabs>
      <div v-else></div>
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

    <datablau-table
      :show-column-selection="false"
      class="datablau-table"
      :height="350"
      :data="udps"
    >
      <el-table-column
        prop="catalog"
        :label="$t('meta.DS.udp.group')"
        width="100"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="name"
        :label="$t('meta.DS.udp.name')"
        width="100"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="type"
        :label="$t('meta.DS.udp.valRangeType')"
        width="280"
        show-overflow-tooltip
        :formatter="valueTypeFormatter"
      >
        <template slot-scope="scope">
          <span :class="getTypeClass(scope.row.type)" class="type-info">
            {{ valueTypeFormatter(scope.row) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="desc"
        :label="$t('meta.DS.udp.desc')"
        show-overflow-tooltip
      ></el-table-column>
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
            class="iconfont icon-revise right-btn"
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
          <datablau-button
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
          ></datablau-button>
        </template>
      </el-table-column>
    </datablau-table>
    <div class="dialog-bottom">
      <datablau-button
        @click="closeItem"
        type="secondary"
        style="float: right; margin-top: 10px"
      >
        {{ $t('meta.DS.udp.close') }}
      </datablau-button>
    </div>
  </div>
</template>

<script>
import LDMTypes from '@constant/LDMTypes'
import editUdp from './editUdp.vue'

export default {
  components: { editUdp },
  beforeMount() {
    console.log('set-udp')
  },
  props: {
    from: {
      type: String,
      required: false,
    },
  },
  mounted() {
    // this.currentTypeId = TypeMap.meta.TABLE.id
    this.getUdpsByType()
  },
  data() {
    const TypeMap = {
      meta: {
        TABLE: {
          id: LDMTypes.Entity.toString(),
          label: this.$t('meta.DS.udp.table'),
        },
        VIEW: {
          id: LDMTypes.View.toString(),
          label: this.$t('meta.DS.udp.view'),
        },
        COLUMN: {
          id: LDMTypes.Attribute.toString(),
          label: this.$t('meta.DS.udp.column'),
        },
        FUNCTION: {
          id: LDMTypes.Function.toString(),
          label: this.$t('meta.DS.udp.function'),
        },
        STORED_PROCEDURE: {
          id: LDMTypes.StoredProcedure.toString(),
          label: this.$t('meta.DS.udp.storedProcedure'),
        },
        PACKAGE: {
          id: LDMTypes.Package.toString(),
          label: this.$t('meta.DS.udp.package'),
        },
      },
      category: {
        CATEGORY: {
          id: LDMTypes.ModelMart,
          label: this.$t('meta.DS.udp.modelMart'),
        },
      },
      report: {
        REPORT: {
          id: LDMTypes.Report,
          label: this.$t('meta.DS.udp.report'),
        },
      },
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
      TypeMap: typeMap,
      udps: null,
      dupUdpNamMap: {},
      currentTypeId: currentTypeId,
      editDialogVisible: false,
      currentRow: null,
      maxOrder: 0,
      tabLoading: false,
    }
  },
  methods: {
    closeItem() {
      this.$emit('closeSetUp')
    },
    closeEditDialogVisible() {
      this.editDialogVisible = false
      this.getUdpsByType()
    },
    getUdpsByType() {
      this.tabLoading = true
      const typeId = this.currentTypeId
      this.$http
        .get(this.$url + `/service/entities/udps/${typeId}`)
        .then(res => {
          this.tabLoading = false
          this.udps = res.data
          this.$utils.sort.sort(this.udps, 'order')
          const dupUdpNamMap = {}
          this.udps.forEach(item => {
            if (item.order > this.maxOrder) {
              this.maxOrder = item.order
            }
            dupUdpNamMap[item.name] = item
          })
          this.dupUdpNamMap = dupUdpNamMap
        })
        .catch(e => {
          this.tabLoading = false
          this.$showFailure(e)
        })
    },
    handleTabClick() {
      this.getUdpsByType()
    },
    addProperty() {
      this.currentRow = null
      this.editDialogVisible = true
    },
    modifyProperty(row) {
      this.currentRow = row
      this.editDialogVisible = true
    },
    getTypeClass(data) {
      return data.toLowerCase()
    },
    valueTypeFormatter(row) {
      const typeData = row.typeData || ''
      switch (row.type) {
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
            typeData.split('\n').join(';') +
            ')'
          )
        case 'BOOL':
          return this.$t('meta.DS.udp.valueType.boolean')
        default:
          return row.type
      }
    },
    deleteRow(row) {
      this.$DatablauCofirm(
        this.$t('meta.DS.udp.delTips', { udp: row.name }),
        '',
        {
          type: 'warning',
        }
      )
        .then(() => {
          this.$http
            .delete(this.$url + `/service/entities/udps/${row.id}`)
            .then(res => {
              this.$message.success(this.$t('meta.DS.message.operationSucceed'))
              this.getUdpsByType()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {
          this.$message.info(this.$t('meta.DS.message.operationCancelled'))
        })
    },
    up(index) {
      this.swap(index - 1, index)
    },
    down(index) {
      this.swap(index, index + 1)
    },
    swap(prev, next) {
      this.udps[prev].order = next
      this.udps[next].order = prev
      this.$utils.sort.sort(this.udps, 'order')
      this.changeOrder(this.udps[prev], () => {
        this.changeOrder(this.udps[next])
      })
    },
    changeOrder(requestBody, callback) {
      this.$http
        .post(
          this.$url + `/service/entities/udps/${this.currentTypeId}`,
          requestBody
        )
        .then(res => {
          if (callback) {
            callback()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
</script>
<style lang="scss" scoped="scoped">
@import './color.scss';
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
  .datablau-tabs {
    display: inline-block;
  }
  .btn-info {
    display: inline-block;
    float: right;
  }
}
</style>
