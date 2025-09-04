<template>
  <div>
    <el-dialog
      :visible.sync="editDialogVisible"
      width="800px"
      height="500px"
      append-to-body
      :close-on-click-modal="false"
      :before-close="closeEditDialogVisible"
      :title="$t('assets.udp.proEdit')"
    >
      <edit-udp
        :current-row="currentRow"
        v-if="editDialogVisible"
        @close="closeEditDialogVisible"
        :max-order="maxOrder"
        :dupUdpNamMap="dupUdpNamMap"
        @refresh="getUdpsByType"
        :type-id="typeId"
      ></edit-udp>
    </el-dialog>
    <div class="top-row">
      <div></div>
      <div class="btn-info">
        <datablau-button
          @click="addProperty"
          type="secondary"
          class="iconfont icon-tianjia"
        >
          {{ $t('assets.udp.proAdd') }}
        </datablau-button>
        <!--<datablau-button type="primary" size="small">保存</datablau-button>-->
      </div>
    </div>

    <datablau-table
      :show-column-selection="false"
      class="datablau-table"
      :height="300"
      :data="udps"
      v-loading="tabLoading"
    >
      <!-- <el-table-column
        prop="catalog"
        label="分组"
        width="100"
        show-overflow-tooltip
      ></el-table-column> -->
      <el-table-column
        prop="name"
        :label="$t('assets.udp.name')"
        width="100"
        show-overflow-tooltip
      ></el-table-column>
      <!-- <el-table-column
        prop="type"
        label="值域类型"
        width="280"
        show-overflow-tooltip
        :formatter="valueTypeFormatter"
      >
        <template slot-scope="scope">
          <span :class="getTypeClass(scope.row.type)" class="type-info">
            {{ valueTypeFormatter(scope.row) }}
          </span>
        </template>
      </el-table-column> -->
      <el-table-column
        prop="description"
        :label="$t('assets.udp.desc')"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        :label="$t('assets.udp.operation')"
        width="100"
        :resizable="false"
        header-align="right"
        align="right"
      >
        <template slot-scope="scope">
          <datablau-button
            low-key
            type="icon"
            :title="$t('assets.udp.btn_edit')"
            class="iconfont icon-revise right-btn"
            @click="modifyProperty(scope.row)"
          >
            <!-- <i></i> -->
          </datablau-button>
          <datablau-button
            low-key
            type="icon"
            :title="$t('assets.udp.btn_del')"
            @click="deleteRow(scope.row)"
            class="iconfont icon-delete right-btn"
          ></datablau-button>
          <datablau-button
            low-key
            type="icon"
            :title="$t('assets.udp.btn_up')"
            style="width: 5px"
            @click="up(scope.$index)"
            :disabled="scope.$index === 0"
            class="iconfont icon-up right-btn"
          ></datablau-button>
          <datablau-button
            low-key
            type="icon"
            :title="$t('assets.udp.btn_down')"
            style="width: 5px"
            @click="down(scope.$index)"
            :disabled="scope.$index === udps.length - 1"
            class="iconfont icon-down right-btn"
          ></datablau-button>
        </template>
      </el-table-column>
    </datablau-table>
    <div class="bottom-info">
      <datablau-button
        @click="closeItem"
        type="secondary"
        style="float: right; margin-top: 10px"
      >
        {{ $t('common.button.close') }}
      </datablau-button>
    </div>
  </div>
</template>

<script>
import LDMTypes from '@constant/LDMTypes'
import editUdp from './editUdp.vue'
export default {
  components: { editUdp },
  beforeMount() {},
  props: {
    from: {
      type: String,
      required: false,
    },
    typeId: {
      type: String,
      required: true,
    },
  },
  mounted() {
    this.getUdpsByType()
  },
  data() {
    return {
      udps: [],
      dupUdpNamMap: {},
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
      // this.getUdpsByType()
    },
    getUdpsByType() {
      this.tabLoading = true
      this.$http
        .post(`/domain/dimension/udp/get?category=${this.typeId}`)
        .then(res => {
          this.tabLoading = false
          this.udps = res.data.sort((a, b) => a.udpOrder - b.udpOrder)
          if (this.typeId.includes('@@') || [LDMTypes.TimeModifierType, LDMTypes.ModifierType].includes(parseInt(this.typeId))) {
            this.$emit('update-udps', this.udps)
          } else {
            this.$bus.$emit('update-dimension-udps', this.udps)
          }
          // this.$utils.sort.sort(this.udps, 'order')
          // const dupUdpNamMap = {}
          // this.udps.forEach(item => {
          //   if (item.order > this.maxOrder) {
          //     this.maxOrder = item.order
          //   }
          //   dupUdpNamMap[item.name] = item
          // })
          // this.dupUdpNamMap = dupUdpNamMap
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
          return '字符串'
        case 'NUM':
          return '数值'
        case 'NUM_RANGE':
          return '数值范围'
        case 'ENUM':
          return '枚举 (' + typeData.split('\n').join(';') + ')'
        case 'BOOL':
          return '布尔值'
        default:
          return row.type
      }
    },
    deleteRow(row) {
      this.$DatablauCofirm(
        this.$t('assets.udp.delTips', {
          udp: row.name,
        }),
        '',
        {
          type: 'warning',
        }
      )
        .then(() => {
          let body = [row.id]
          this.$http
            .post(`/domain/dimension/udp/delete`, body)
            .then(res => {
              this.$message.success(this.$version.common.operationSucceed)
              this.getUdpsByType()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {
          this.$message.info(this.$t('system.systemSetting.operationCancelled'))
        })
    },
    up(index) {
      this.swap(index - 1, index)
    },
    down(index) {
      this.swap(index, index + 1)
    },
    swap(prev, next) {
      this.udps[prev].udpOrder = next
      this.udps[next].udpOrder = prev
      this.$utils.sort.sort(this.udps, 'udpOrder')
      this.changeOrder(this.udps[prev], () => {
        this.changeOrder(this.udps[next])
      })
    },
    changeOrder(requestBody, callback) {
      this.$http
        .post(`/domain/dimension/udp/update`, requestBody)
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
  &.num-range {
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
    float: left;
  }
}
.bottom-info {
  height: 50px;
}
</style>
