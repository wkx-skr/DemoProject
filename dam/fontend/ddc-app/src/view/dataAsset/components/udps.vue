<template>
  <div>
    <div style="text-align: right">
      <datablau-button @click="toAddUDP" type="secondary">
        {{ $t('assets.udp.proAdd') }}
      </datablau-button>
    </div>
    <datablau-dialog
      :visible.sync="editDialogVisible"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
      :title="$t('assets.udp.proEdit')"
    >
      <div style="height: 220px; width: 100%">
        <el-form
          size="mini"
          :model="udpFormData"
          label-width="6em"
          :rules="udpRules"
        >
          <el-form-item
            :label="$t('assets.udp.udpName')"
            prop="propName"
            style="width: 100%"
          >
            <datablau-input
              v-model="udpFormData.propName"
              :placeholder="$t('assets.udp.validate.nameRequired')"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('assets.udp.udpGroup')" prop="udpGroup">
            <datablau-select
              style="width: 100%"
              v-model="udpFormData.propCatalog"
              :placeholder="$t('assets.udp.validate.selectRequired')"
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
          <el-form-item :label="$t('assets.udp.udpType')" prop="type">
            <datablau-select v-model="udpFormData.type" style="width: 100%">
              <el-option
                value="STRING"
                :label="$t('assets.udp.valueType.string')"
              ></el-option>
              <el-option
                value="ENUM"
                :label="$t('assets.udp.valueType.enum')"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            :label="$t('assets.udp.enumOption')"
            v-show="udpFormData.type === 'ENUM'"
          >
            <datablau-input
              type="textarea"
              :row="4"
              v-model="udpFormData.typeData"
              :placeholder="$t('assets.udp.enumPlaceholder')"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('assets.udp.desc')">
            <datablau-input
              type="textarea"
              class="max-textarea"
              maxlength="200"
              :minRow="3"
              :maxRows="5"
              style="max-height: 100px"
              v-model="udpFormData.desc"
              show-word-limit
            ></datablau-input>
          </el-form-item>
        </el-form>
        <div class="dialog-bottom">
          <datablau-button type="secondary" @click="close">
            {{ $t('common.button.cancel') }}
          </datablau-button>
          <datablau-button
            type="important"
            @click="beforeSave"
            :disabled="disabledSave"
          >
            {{ $t('common.button.ok') }}
          </datablau-button>
        </div>
      </div>
    </datablau-dialog>
    <datablau-table
      style="margin-top: 0em"
      :height="300"
      :data="udps"
      v-loading="loading"
    >
      <!-- <el-table-column prop="category" label="属性类型"></el-table-column> -->
      <el-table-column
        prop="propCatalog"
        :label="$t('assets.udp.group')"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="propName"
        :label="$t('assets.udp.name')"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="type"
        :label="$t('assets.udp.valRangeType')"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="desc"
        :label="$t('assets.udp.desc')"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        :label="$t('assets.udp.operation')"
        width="200"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <datablau-button
            type="text"
            @click="up(scope.$index)"
            :disabled="scope.$index === 0"
            class="iconfont icon-up"
          ></datablau-button>
          <datablau-button
            type="text"
            @click="down(scope.$index)"
            :disabled="scope.$index === udps.length - 1"
            class="iconfont icon-down"
          ></datablau-button>
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
        </template>
      </el-table-column>
    </datablau-table>
  </div>
</template>

<script>
export default {
  name: 'Asset-UDP',
  data() {
    return {
      loading: false,
      oldName: '',
      udps: [],
      editDialogVisible: false,
      udpFormData: {
        propName: '',
        propCatalog: '',
        type: '',
        typeData: '',
      },
      udpRules: {
        propName: {
          // validator: nameValidate,
          message: this.$t('meta.DS.udp.validate.nameRequired'),
          required: true,
          trigger: 'blur',
        },
        udpGroup: [
          {
            required: true,
            message: this.$t('meta.DS.udp.validate.selectRequired'),
            trigger: 'blur',
          },
        ],
        type: [
          {
            required: true,
            message: this.$t('meta.DS.udp.validate.selectRequired'),
            trigger: 'blur',
          },
        ],
      },
      udpGroupOptions: [],
    }
  },
  props: {
    id: {
      type: Number,
      default: 0,
    },
    getGroup: {
      type: Function,
      default: null,
    },
    get: {
      type: Function,
      default: null,
    },
    add: {
      type: Function,
      default: null,
    },
    delete: {
      type: Function,
      default: null,
    },
    update: {
      type: Function,
      default: null,
    },
  },
  mounted() {
    // if (this.currentRow) {
    //   this.oldName = this.currentRow.name
    //   if (this.currentRow.typeData) {
    //     this.currentRow.typeData = this.currentRow.typeData.replace(/\n/g, ';')
    //   }
    //   this.udpFormData = _.clone(this.currentRow)
    // }
    this.getAllUDPs()
    this.getGroup &&
      this.getGroup().then(res => {
        this.udpGroupOptions = res.data.data
      })
  },

  computed: {
    disabledSave() {
      const name = _.trim(this.udpFormData.propName)
      const catalog = _.trim(this.udpFormData.propCatalog)
      const type = _.trim(this.udpFormData.type)
      return !name || !catalog || !type
    },
  },
  methods: {
    getAllUDPs() {
      this.get &&
        this.get().then(res => {
          this.udps = res.data.data.sort((a, b) => a.order - b.order)
        })
    },
    toAddUDP() {
      this.editDialogVisible = true
    },
    deleteRow(row) {
      this.delete &&
        this.delete(row.id)
          .then(res => {
            if (res.status === 200) {
              this.$message({
                type: 'success',
                message: this.$t('assets.common.deleteSuccess'),
              })
              this.getAllUDPs()
            } else {
              this.$showFailure(this.$t('assets.common.deleteFailure'))
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
    },
    modifyProperty(row) {
      this.udpFormData = { ...row }
      this.editDialogVisible = true
    },
    // 向上
    up(index) {
      const currentOrder = this.udps[index].order
      const preOrder = this.udps[index - 1].order
      this.loading = true
      Promise.all([
        this.update &&
          this.update({
            ...this.udps[index],
            order: preOrder,
          }),
        this.update &&
          this.update({
            ...this.udps[index - 1],
            order: currentOrder,
          }),
      ]).then(res => {
        this.getAllUDPs()
        this.loading = false
      })
    },
    // 向下
    down(index) {
      const currentOrder = this.udps[index].order
      const nextOrder = this.udps[index + 1].order
      this.loading = true
      Promise.all([
        this.update &&
          this.update({
            ...this.udps[index],
            order: nextOrder,
          }),
        this.update &&
          this.update({
            ...this.udps[index + 1],
            order: currentOrder,
          }),
      ]).then(res => {
        this.getAllUDPs()
        this.loading = false
      })
    },
    close() {
      this.editDialogVisible = false
    },
    selectBlur(e) {
      // 属性类别
      if (e.target.value !== '') {
        this.udpFormData.propCatalog = e.target.value
        this.$forceUpdate() // 强制更新
      }
    },
    selectClear() {
      this.udpFormData.propCatalog = ''
      this.$forceUpdate()
    },
    selectChange(val) {
      this.udpFormData.propCatalog = val
      this.$forceUpdate()
    },
    beforeSave() {
      if (!this.udpFormData.propName) {
        this.$message.error(this.$t('meta.DS.message.nameRequired'))
        return
      }
      if (this.udpFormData.propName.length > 127) {
        this.$message.error(this.$t('meta.DS.message.nameLenTooLong'))
        return
      }
      const api = this.udpFormData.id ? this.update : this.add
      api &&
        api({
          ...this.udpFormData,
        })
          .then(res => {
            if (res.status === 200) {
              this.$message({
                type: 'success',
                message: this.$t('assets.common.saveSuccess'),
              })
              this.editDialogVisible = false
              this.getAllUDPs()
              this.udpFormData = {
                propName: '',
                propCatalog: '',
                type: '',
                typeData: '',
              }
            } else {
              this.$showFailure(this.$t('assets.common.saveFailure'))
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
    },
    createOrUpdateUdp() {
      const requestBody = _.cloneDeep(this.udpFormData)
      if (requestBody.type !== 'ENUM') {
        delete requestBody.typeData
      } else {
        requestBody.typeData = requestBody.typeData.replace(/;/g, '\n')
        requestBody.typeData = requestBody.typeData.replace(/；/g, '\n')
      }
      // console.log(requestBody)
    },
  },
}
</script>

<style scoped>
.datablau-input {
  width: 100%;
}
</style>
