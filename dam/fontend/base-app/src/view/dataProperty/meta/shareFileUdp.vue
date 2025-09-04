<template>
  <div>
    <div style="text-align: right">
      <datablau-button @click="addProperty" type="secondary">
        {{ $t('meta.DS.udp.proAdd') }}
      </datablau-button>
    </div>
    <datablau-dialog
      :visible.sync="editDialogVisible"
      width="640px"
      height="350px"
      append-to-body
      :close-on-click-modal="false"
      :title="$t('meta.DS.udp.proEdit')"
    >
      <edit-udp
        :current-row="currentRow"
        v-if="editDialogVisible"
        @close="editDialogVisible = false"
        :type-id="currentTypeId"
        :max-order="maxOrder"
        :dupUdpNamMap="dupUdpNamMap"
        @refresh="getUdpsByType"
      ></edit-udp>
    </datablau-dialog>
    <datablau-table style="margin-top: 0em" :height="300" :data="udps">
      <!-- <el-table-column prop="category" label="属性类型"></el-table-column> -->
      <el-table-column
        prop="name"
        :label="$t('meta.DS.udp.name')"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="type"
        :label="$t('meta.DS.udp.valRangeType')"
        :formatter="valueTypeFormatter"
        show-overflow-tooltip
      ></el-table-column>

      <el-table-column
        :label="$t('meta.DS.udp.operation')"
        width="200"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <datablau-button
            type="text"
            @click="modifyProperty(scope.row)"
            class="iconfont icon-bianji"
          ></datablau-button>
          <datablau-button
            type="text"
            @click="deleteRow(scope.row)"
            class="iconfont icon-delete"
          ></datablau-button>
          <datablau-button
            type="icon"
            style="width: 5px"
            @click="up(scope.$index)"
            :disabled="scope.$index === 0"
            class="iconfont icon-up"
          ></datablau-button>
          <datablau-button
            type="icon"
            style="width: 5px"
            @click="down(scope.$index)"
            :disabled="scope.$index === udps.length - 1"
            class="iconfont icon-down"
          ></datablau-button>
        </template>
      </el-table-column>
    </datablau-table>

    <div class="dialog-bottom">
      <datablau-button type="secondary" @click="close">
        {{ $t('common.button.close') }}
      </datablau-button>
      <!--<el-button type="primary" size="small">保存</el-button>-->
    </div>
  </div>
</template>

<script>
import editUdp from './editShareFileUdp.vue'
export default {
  components: { editUdp },
  beforeMount() {
    // this.TypeMap = TypeMap
  },
  mounted() {
    this.getUdpsByType()
  },
  data() {
    const TypeMap = {
      TABLE: { id: '80000004', label: this.$t('meta.DS.udp.table') },
      VIEW: { id: '80500008', label: this.$t('meta.DS.udp.column') },
      COLUMN: { id: '80000005', label: this.$t('meta.DS.udp.table') },
      FUNCTION: { id: '80010119', label: this.$t('meta.DS.udp.function') },
      STORED_PROCEDURE: {
        id: '80010118',
        label: this.$t('meta.DS.udp.storedProcedure'),
      },
      PACKAGE: { id: '82800024', label: this.$t('meta.DS.udp.package') },
    }
    return {
      TypeMap: TypeMap,
      udps: [],
      dupUdpNamMap: {},
      currentTypeId: String(TypeMap.TABLE.id),
      editDialogVisible: false,
      currentRow: null,
      maxOrder: 0,
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    getUdpsByType() {
      // this.$getShareFileUdp()
      this.$http
        .post(`${this.$meta_url}/udps/getUdpsOfType?typeId=82800008`)
        .then(res => {
          this.$bus.$emit('updateShareFileUdp')
          const data = res.data
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
            ' (' +
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
          const propertyId = row.id
          const url = `${this.$meta_url}/udps/deleteUdp?udpId=${propertyId}`
          this.$http
            .post(url)
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
        this.changeOrder(this.udps[next], this.getUdpsByType)
      })
    },
    changeOrder(requestBody, callback) {
      this.$http
        .post(
          `${this.$meta_url}/udps/updateUdpOfType?typeId=82800008`,
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
  watch: {},
}
</script>
<style lang="scss">
.el-message-box__message {
  word-break: break-all;
}
</style>
<style scoped></style>
