<template>
  <div>
    <el-upload
      style="z-index: -9999; height: 0"
      :action="
        $uploadUrlFormatter(
          $metric_url + 'dimension/value/import?dimensionId=' + dataId
        )
      "
      :show-file-list="false"
      :on-success="onUploadSuccess"
      :headers="$headers"
      :on-error="onUploadError"
    >
      <el-button type="text" size="small" ref="uploadBtn"></el-button>
    </el-upload>
    <datablau-dialog
      :title="$t('meta.DS.udp.udp')"
      :visible.sync="showUdps"
      v-if="showUdps"
      :close-on-click-modal="true"
      append-to-body
      size="xl"
    >
      <set-udp
        @closeSetUp="closeSetUp"
        @update-udps="updateUdps"
        :type-id="String(LDMTypes.DataDimensionValue) + '@@' + dataId"
      ></set-udp>
    </datablau-dialog>
    <!-- 静态新增维度值 -->
    <datablau-dialog
      :title="$t('indicator.dimension.addDimensionValue')"
      :visible.sync="showValue"
      :close-on-click-modal="true"
      v-if="showValue"
      append-to-body
      width="700px"
      height="510px"
      class="newDialog"
    >
      <div class="row-main">
        <el-form
          class="page-form"
          label-position="right"
          :label-width="$i18n.locale === 'en' ? '14em' : '10em'"
          :rules="valueRules"
          ref="valueForm"
          :model="valueFormData"
        >
          <el-form-item
            :label="$t('meta.common.sourceType.dimLevel')"
            prop="lvlId"
          >
            <datablau-select v-model="valueFormData.lvlId" @change="lvlChange">
              <el-option
                v-for="item in hierarchyOption"
                :key="item.chName"
                :label="item.chName"
                :value="item.order"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            :label="$t('indicator.dimension.parentValue')"
            prop="parentId"
          >
            <datablau-select
              v-model="valueFormData.parentId"
              @change="selectParentId"
            >
              <el-option
                :title="item.chineseName"
                v-for="item in parentOptions"
                :key="item.chineseName"
                :label="item.chineseName"
                :value="item.codeId"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            :label="$t('indicator.dimension.newDimensionValue')"
            prop="valueTableData"
          >
            <datablau-button
              style="float: left; margin-top: 5px"
              type="text"
              @click="addClick"
            >
              {{ $t('common.button.add') }}
            </datablau-button>
          </el-form-item>
        </el-form>
        <div class="table-area">
          <datablau-table :data="valueFormData.valueTableData">
            <el-table-column
              min-width="120"
              :label="$t('system.systemSetting.cnName')"
              prop="chineseName"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ scope.row.chineseName }}
              </template>
            </el-table-column>
            <el-table-column
              min-width="120"
              :label="$t('system.systemSetting.enName')"
              prop="name"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ scope.row.name }}
              </template>
            </el-table-column>
            <el-table-column
              min-width="140"
              :label="$t('domain.common.dataTypeMap.coding')"
              prop="code"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ scope.row.code }}
              </template>
            </el-table-column>
            <el-table-column
              v-for="u in udps"
              :key="u.id"
              show-overflow-tooltip
              :label="u.name"
            >
              <template slot-scope="scope">
                {{ scope.row.udpValue[u.id] }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('meta.dataSource.operation')"
              min-width="120"
              fixed="right"
              align="center"
            >
              <template slot-scope="scope">
                <datablau-button type="text" @click="addValueDelete(scope)">
                  <span>{{ $t('common.button.delete') }}</span>
                </datablau-button>
              </template>
            </el-table-column>
          </datablau-table>
        </div>
      </div>
      <div class="row-bottom" style="height: 50px">
        <datablau-button
          @click="showValue = false"
          type="secondary"
          style="float: right; margin-top: 20px; margin-left: 10px"
        >
          {{ $t('common.button.close') }}
        </datablau-button>
        <datablau-button
          type="important"
          style="float: right; margin-top: 20px"
          @click="submitValue"
        >
          {{ $t('common.button.submit') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <!-- 添加 -->
    <datablau-dialog
      :title="addTitle"
      :visible.sync="showAddValue"
      :close-on-click-modal="true"
      v-if="showAddValue"
      append-to-body
      width="700px"
      height="410px"
    >
      <div class="row-main">
        <el-form
          class="page-form"
          label-position="right"
          label-width="10em"
          :rules="addValueRules"
          ref="addValueForm"
          :model="addValueForm"
        >
          <el-form-item
            :label="$t('system.systemSetting.cnName')"
            prop="chineseName"
          >
            <datablau-input
              maxlength="200"
              v-model="addValueForm.chineseName"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('system.systemSetting.enName')" prop="name">
            <datablau-input
              maxlength="200"
              v-model="addValueForm.name"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('domain.common.dataTypeMap.coding')"
            prop="code"
          >
            <datablau-input
              maxlength="200"
              v-model="addValueForm.code"
            ></datablau-input>
          </el-form-item>
          <el-form-item v-for="u in udps" :label="u.name" :key="u.id">
            <datablau-input
              maxlength="200"
              v-model="addValueForm.udpValue[u.id]"
            ></datablau-input>
          </el-form-item>
          <!-- <el-form-item label="码值" prop="codeId">
            <datablau-input
              maxlength="200"
              v-model="addValueForm.codeId"
            ></datablau-input>
          </el-form-item> -->
          <el-form-item
            :label="$t('indicator.dimension.order')"
            prop="dataOrder"
          >
            <datablau-input
              maxlength="200"
              v-model.number="addValueForm.dataOrder"
            ></datablau-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="row-bottom" style="height: 50px">
        <datablau-button
          @click="showAddValue = false"
          type="secondary"
          style="float: right; margin-top: 20px; margin-left: 10px"
        >
          {{ $t('common.button.close') }}
        </datablau-button>
        <datablau-button
          type="important"
          style="float: right; margin-top: 20px"
          @click="submitAddValue"
        >
          {{ $t('common.button.submit') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <div class="part-title">
      {{ $t('indicator.dimension.setDimensionValue') }}
      <div style="float: right">
        <el-dropdown
          style="float: right; vertical-align: top"
          @command="handleAddCommand"
          trigger="click"
        >
          <datablau-button type="important" class="iconfont icon-tianjia">
            {{ $t('indicator.dimension.addDimensionValue') }}
            <i class="el-icon-arrow-down el-icon--right"></i>
          </datablau-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="staticAdd">
              {{ $t('indicator.dimension.staticAdd') }}
            </el-dropdown-item>
            <el-dropdown-item command="importValue">
              {{ $t('quality.page.ruleTemplate.button.import') }}
            </el-dropdown-item>
            <el-dropdown-item command="exportValue">
              {{ $t('quality.page.ruleTemplate.button.export') }}
            </el-dropdown-item>
            <el-dropdown-item command="exportTemplate">
              {{ $t('indicator.dimension.downloadTemplate') }}
            </el-dropdown-item>
            <!-- <el-dropdown-item disabled>导入新增</el-dropdown-item>
            <el-dropdown-item disabled>连库新增</el-dropdown-item> -->
          </el-dropdown-menu>
        </el-dropdown>
        <datablau-button
          class="iconfont icon-expand"
          style="margin-right: 10px"
          @click="showUdpDialog"
        >
          {{ $t('assets.common.extendAttr') }}
        </datablau-button>
        <!-- <datablau-button
          style="float: right; margin-right: 10px"
          class="iconfont icon-download"
          @click="handleClick"
        >
          导入
        </datablau-button> -->
      </div>
    </div>
    <div class="table-area">
      <datablau-table
        :data="dimensionValueTreeDisplay"
        row-key="codeId"
        :default-expand-all="true"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        lazy
        :load="loadFunction"
      >
        <!-- <el-table-column
          min-width="100"
          label="层级"
          prop="lvlId"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.lvlId }}
          </template>
        </el-table-column> -->
        <el-table-column
          min-width="120"
          :label="$t('system.systemSetting.cnName')"
          prop="chineseName"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.chineseName }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="120"
          :label="$t('system.systemSetting.enName')"
          prop="name"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="140"
          :label="$t('domain.common.dataTypeMap.coding')"
          prop="code"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.code }}
          </template>
        </el-table-column>
        <el-table-column
          v-for="u in udps"
          :key="u.id"
          show-overflow-tooltip
          :label="u.name"
          :min-width="140"
        >
          <template slot-scope="scope" v-if="scope.row.udpValue">
            {{ scope.row.udpValue[u.id] }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('system.systemSetting.operation')"
          min-width="120"
          fixed="right"
          align="center"
        >
          <template slot-scope="scope">
            <datablau-button type="text" @click="valueEdit(scope)">
              <span>{{ $t('common.button.edit') }}</span>
            </datablau-button>
            <datablau-button type="text" @click="valueDelete(scope)">
              <span>{{ $t('common.button.delete') }}</span>
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-size="10"
        layout="prev, pager, next"
        :total="total"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import setUdp from './setUdp'
import LDMTypes from '@constant/LDMTypes'
export default {
  props: {
    dataId: {
      type: Number,
      required: true,
    },
    hierarchyTable: {},
  },
  components: {
    setUdp,
  },
  data() {
    return {
      LDMTypes: LDMTypes,
      dimensionValueTable: [],
      dimensionValueTree: [],
      dimensionValueTreeDisplay: [],
      hierarchyOption: [],
      showValue: false,
      valueFormData: {
        valueTableData: [],
      },
      addValueForm: {},
      parentOptions: [],
      valueRules: {
        lvlId: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull'),
        },
        parentId: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull'),
        },
        valueTableData: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull'),
        },
      },
      showAddValue: false,
      addValueRules: {
        name: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull'),
        },
        chineseName: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull'),
        },
        code: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull'),
        },
        dataOrder: {
          type: 'number',
          message: this.$t(
            'quality.page.ruleTemplate.generatesql.placeholder.number'
          ),
          transform(value) {
            return Number(value)
          },
        },
      },
      showUdps: false,
      udps: [],
      currentPage: 1,
      total: 0,
    }
  },
  mounted() {
    this.getValue()
    this.getValueTree()
    this.getValueUdp()
  },
  methods: {
    handleCurrentChange() {
      this.dimensionValueTreeDisplay = this.dimensionValueTree.slice(
        (this.currentPage - 1) * 10,
        this.currentPage * 10 - 1
      )
    },
    loadFunction(row, treeNode, resolve) {
      console.log(row)
    },
    getValueUdp() {
      this.$http
        .post(
          `${this.$metric_url}dimension/udp/get?category=${
            String(LDMTypes.DataDimensionValue) + '@@' + this.dataId
          }`
        )
        .then(res => {
          this.udps = res.data.sort((a, b) => a.udpOrder - b.udpOrder)
          console.log(this.udps)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    showUdpDialog() {
      this.showUdps = true
    },
    closeSetUp() {
      this.showUdps = false
    },
    updateUdps(udps) {
      this.udps = udps
    },
    // 查询全部维度树
    getValueTree() {
      let url = `${this.$metric_url}dimension/tree/get?id=${this.dataId}`
      this.$http
        .post(url)
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            res.data.sort((a, b) => a.dataOrder - b.dataOrder)
            this.dimensionValueTree = res.data
            this.dimensionValueTreeDisplay = res.data.slice(0, 10)
            this.total = res.data.length
          } else {
            this.dimensionValueTree = []
            this.dimensionValueTree = []
            this.total = res.data.length
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 查询全部维度值
    getValue() {
      let url = `${this.$metric_url}dimension/list/get?id=${this.dataId}`
      this.$http
        .post(url)
        .then(res => {
          if (res.data) {
            this.dimensionValueTable = res.data
          } else {
            this.dimensionValueTable = []
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 点编辑维度值
    valueEdit(scope) {
      this.addValueForm = scope.row
      this.addValueForm.index = scope.$index
      if (!this.addValueForm.dataOrder) {
        this.addValueForm.dataOrder = ''
      }
      this.addTitle = this.$t('indicator.dimension.editDimensionValue')
      this.showAddValue = true
    },
    // 删除维度值
    valueDelete(scope) {
      this.$DatablauCofirm(
        this.$t('assets.permissionSettings.confirmDelete'),
        this.$t('assets.permissionSettings.hint'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      ).then(() => {
        let arr = this.dimensionValueTable.filter(
          item => item.parentId === scope.row.codeId
        )
        if (arr.length > 0) {
          this.$message.error(
            this.$t('indicator.dimension.dimensionValueHasChild')
          )
        } else {
          this.dimensionValueTable.splice(scope.$index, 1)
          let url = `${this.$metric_url}dimension/value/delete`
          let body = [scope.row.codeId]
          this.$http
            .post(url, body)
            .then(res => {
              this.$message.closeAll()
              this.$message.success(
                this.$t('quality.page.qualityRule.successfullyDeleted')
              )
              this.getValue()
              this.getValueTree()
            })
            .catch(e => {
              // this.$showFailure(e)
            })
        }
      })
    },
    // 新增值
    handleAddCommand(command) {
      if (command === 'staticAdd') {
        // 静态新增
        this.addTitle = this.$t('indicator.dimension.newDimensionValue')
        this.valueFormData = {
          valueTableData: [],
        }
        this.parentOptions = []
        if (this.hierarchyTable && this.hierarchyTable.length > 0) {
          this.showValue = true
          this.hierarchyOption = []
          let l1 =
            this.dimensionValueTable &&
            this.dimensionValueTable.filter(item => item.lvlId === 1)
          if (this.dimensionValueTable && l1.length > 0) {
            // 已有跟节点
            this.hierarchyOption = this.hierarchyTable.filter(item => item)
          } else {
            // 无根节点，只能选根节点层级
            let lv = this.hierarchyTable.filter(item => item.order === 1)[0]
            let obj = {
              order: lv.order,
              chName: lv.chName,
            }
            this.hierarchyOption.push(obj)
            // 没有上级维度值
            this.parentOptions = []
          }
        } else {
          this.$message.error(this.$t('indicator.dimension.needHierarchy'))
        }
      } else {
        this[command]()
      }
    },
    exportTemplate() {
      const url = `${this.$metric_url}dimension/value/downloadTemplate?dimensionId=${this.dataId}`
      this.$downloadFilePost(url)
    },
    exportValue() {
      const url = `${this.$metric_url}dimension/value/export?dimensionId=${this.dataId}`
      this.$downloadFilePost(url)
    },
    importValue() {
      this.$refs.uploadBtn.$el.click()
    },
    onUploadSuccess() {
      this.$datablauMessage.success(
        this.$t('quality.page.dataQualityRules.import.importSuccessful')
      )
      this.getValue()
      this.getValueTree()
    },
    onUploadError(err) {
      this.$showUploadFailure(err)
    },
    // 提交手工新增维度值(添加维度值)
    submitValue() {
      this.$refs.valueForm.validate(valid => {
        if (!valid) {
          this.$blauShowFailure(this.$t('domain.common.requiredIsNull'))
          return false
        } else {
          this.valueFormData.valueTableData.forEach(item => {
            let obj = {
              chineseName: item.chineseName,
              code: item.code,
              codeId: item.codeId,
              dataOrder: item.dataOrder,
              dimensionId: this.dataId || '',
              lvlId: this.valueFormData.lvlId,
              name: item.name,
              parentId: this.valueFormData.parentId,
              udpValue: item.udpValue,
            }
            this.dimensionValueTable.push(obj)
          })
          let url = `${this.$metric_url}dimension/value/maintain?dimensionId=${this.dataId}`
          let body = this.dimensionValueTable
          this.$http
            .post(url, body)
            .then(res => {
              this.$message.closeAll()
              this.$message.success(this.$t('domain.common.addSucceed'))
              this.getValue()
              this.getValueTree()
              this.$bus.$emit('updateDimensionItem1', { id: null })
            })
            .catch(e => {
              this.$showFailure(e)
              for (
                let i = 0;
                i < this.valueFormData.valueTableData.length;
                i++
              ) {
                this.dimensionValueTable.pop()
              }
            })
          this.showValue = false
        }
      })
    },
    // 点添加按钮
    addClick() {
      this.addValueForm = {
        dataOrder: '',
        udpValue: {},
      }
      if (!this.valueFormData.lvlId === undefined) {
        this.$message.error(this.$t('indicator.dimension.needSelectHierarchy'))
        return false
      }
      this.showAddValue = true
    },
    // 删除增加的维度值
    addValueDelete(scope) {
      this.$DatablauCofirm(
        this.$t('meta.report.delConfirm'),
        this.$t('meta.report.tips'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(() => {
          this.valueFormData.valueTableData.splice(scope.$index, 1)
          this.$message.closeAll()
          this.$message.success(
            this.$t('meta.lineageManage.lineageCatalogue.successfullyDeleted')
          )
        })
        .catch(e => {
          // this.$showFailure(e)
        })
    },
    // 维度层级选择
    lvlChange(lvlId) {
      if (lvlId === 1) {
        this.parentOptions = [
          {
            chineseName: this.$t('domain.common.none'),
            codeId: 0,
          },
        ]
      } else {
        this.parentOptions = []
        let id = lvlId - 1
        this.parentOptions = this.dimensionValueTable.filter(
          item => item.lvlId === id
        )
        this.$set(this.valueFormData, 'parentId', '')
      }
    },
    // 点击上一维度
    selectParentId(val) {
      if (!this.valueFormData.lvlId) {
        this.$message.error(this.$t('indicator.dimension.needSelectHierarchy'))
        this.$set(this.valueFormData, 'parentId', '')
      } else {
        this.$set(this.valueFormData, 'parentId', val)
        // this.valueFormData.parentId = val;
      }
    },
    // 提交添加维度值
    submitAddValue() {
      this.$refs.addValueForm.validate(valid => {
        if (!valid) {
          this.$blauShowFailure(this.$t('indicator.dimension.formWrong'))
          return false
        } else {
          if (this.addValueForm.index !== undefined) {
            // 编辑维度值
            // let index = this.addValueForm.index;
            let url = `${this.$metric_url}dimension/value/update`
            let body = this.addValueForm
            this.$http
              .post(url, body)
              .then(res => {
                this.$message.closeAll()
                this.$message.success(
                  this.$t('system.organization.info.editSucceed')
                )
                this.getValue()
                this.getValueTree()
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else {
            // 添加维度值，返回到手工添加页面
            this.valueFormData.valueTableData.push(this.addValueForm)
            this.$message.closeAll()
            if (
              this.addTitle === this.$t('indicator.dimension.newDimensionValue')
            ) {
              this.$message.success(
                this.$t('quality.page.knowledgebase.successfullyAdded')
              )
            } else {
              this.$message.success(
                this.$t('quality.page.knowledgebase.successfullyModified')
              )
            }
          }
          this.showAddValue = false
          this.$bus.$emit('clearDimTree')
        }
      })
    },
  },
}
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.row-header {
  padding: 10px 0 8px;
  border-bottom: 1px solid $border-color;
}
.part-title {
  border-left: 4px solid $primary-color;
  margin-bottom: 12px;
  margin-top: 10px;
  padding-left: 6px;
  color: $text-default;
  font-size: 14px;
}
</style>
