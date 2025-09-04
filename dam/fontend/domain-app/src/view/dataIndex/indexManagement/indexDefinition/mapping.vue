<template>
  <div>
    <datablau-dialog
      size="m"
      :title="$t('indicator.mapping.selectDim')"
      :visible.sync="dimDialogVisible"
    >
      <datablau-tree
        ref="tree"
        style="height: 300px"
        :data="allDimsTree"
        :props="{
          label: 'treeLabel',
        }"
        show-checkbox
        :data-icon-function="dataIconFunction"
      ></datablau-tree>
      <div slot="footer">
        <datablau-button type="secondary" @click="closeDimDialog">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="primary" @click="saveDimDialog">
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <meta-selector
      ref="metaSelector"
      type="table"
      :dialog-title="$t('component.metadataSelector.dialogTitle')"
      @select="handleMetaSelect"
    ></meta-selector>
    <datablau-form :label-width="$i18n.locale === 'zh' ? '6em' : '8em'">
      <el-form-item :label="$t('indicator.mapping.dim')">
        <!--        <el-tag closable>部门：产品部</el-tag>-->
        <el-tag
          v-for="(dim, idx) in dimsDisplay"
          :key="idx"
          closable
          @close="handleRemoveDim(idx)"
          style="margin-right: 10px"
        >
          {{ dim.displayName }}
        </el-tag>
        <datablau-button type="text" @click="addDim">
          {{ $t('meta.DS.tableDetail.security.set') }}
        </datablau-button>
      </el-form-item>
      <el-form-item :label="$t('indicator.mapping.metadata')">
        <datablau-input :value="tableLabel"></datablau-input>
        <datablau-button type="text" @click="setTable">
          {{ $t('meta.DS.tableDetail.security.set') }}
        </datablau-button>
      </el-form-item>
      <el-form-item
        :label="$t('indicator.mapping.relationMapping')"
        style="margin-bottom: 0"
      ></el-form-item>
    </datablau-form>
    <datablau-table
      :data="tableData"
      style="width: 1200px"
      v-loading="!columnsReady"
    >
      <el-table-column
        :label="$t('indicator.mapping.attributeInfo')"
        prop="attrInfo"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        :label="$t('indicator.mapping.attributeType')"
        prop="attrType"
        :width="150"
      >
        <template slot-scope="scope">
          {{
            scope.row.attrType === LDMTypes.DataDimension
              ? $t('meta.report.dimension')
              : $t('meta.report.index')
          }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('domain.verification.mappingField')"
        prop="objectId"
      >
        <template slot-scope="scope">
          <datablau-select
            v-show="columnsReady"
            v-model="scope.row.objectId"
            @change="addOrUpdateMapping(scope.row, $event)"
            :disabled-no="columnsDisabled"
          >
            <el-option
              v-for="(column, $idx) in columns"
              :key="$idx"
              :value="column.objectId"
              :disabled="
                scope.row.objectId !== column.objectId &&
                usedColumn.has(column.objectId)
              "
              :label="column.physicalName"
            ></el-option>
          </datablau-select>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('domain.common.remark')"
        prop="comment"
        :min-width="200"
      >
        <template slot-scope="scope">
          <datablau-input
            style="width: 100%"
            v-model="scope.row.comment"
            @change="addOrUpdateMapping(scope.row, $event)"
            :disabled="!scope.row.objectId"
          ></datablau-input>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('domain.common.operation')"
        :width="90"
        header-align="center"
        align="center"
      >
        <template slot-scope="scope">
          <datablau-button
            type="text"
            @click="unbindMapping(scope.row)"
            :disabled="!scope.row.objectId"
          >
            {{ $t('common.button.unbind') }}
          </datablau-button>
        </template>
      </el-table-column>
    </datablau-table>
  </div>
</template>
<script>
import LDMTypes from '@constant/LDMTypes'
import MetaSelector from '@/components/common/metaSelector.vue'
export default {
  components: {
    MetaSelector,
  },
  props: {
    metricId: {
      required: true,
    },
    metricName: {
      required: true,
    },
    allDimsTree: {},
    allDims: {},
  },
  data() {
    return {
      LDMTypes: LDMTypes,
      tableData: [
        {
          attrInfo: this.metricName,
          attrType: LDMTypes.Index,
          itemId: this.metricId,
          mappingColumn: '',
          metricId: this.metricId,
          objectId: '',
          tableId: this.tableId, // 可能还没产生
        },
      ],
      // 从数据源表单项中提取出来的信息
      modelName: '',
      tableId: null,
      tableName: '',
      // END
      formData: {
        attrInfo: 'string', // 指标或维度名称
        attrType: LDMTypes.Index, //  映射类型，指标：82800003，维度：82800023 ,
        itemId: this.metricId, // 指标或维度id
        mappingColumn: '字段名',
        metricId: this.metricId,
        // metricMappingId: 0,
        objectId: 0, // 字段id
        tableId: 0, // 表id
      },
      columns: [],
      columnKeyword: '',
      columnsReady: false,
      columnDialogVisible: false,
      tableLabelArray: ['', ''],
      dimsDisplay: [],
      lastDims: [],
      dims: [],
      dimDialogVisible: false,
    }
  },
  computed: {
    tableLabel() {
      return this.tableLabelArray.filter(i => i).join(' / ')
    },
    columnsDisabled() {
      return !this.columns || this.columns.length === 0
    },
    usedColumn() {
      const tableData = this.tableData
      const set = new Set()
      if (tableData && Array.isArray(tableData)) {
        tableData.forEach(item => {
          if (item.objectId) {
            set.add(item.objectId)
          }
        })
      }
      return set
    },
  },
  mounted() {
    this.getMappingList()
  },
  methods: {
    getMappingList() {
      this.$http
        .post(`/domain/metricManagement/mapping/list?metricId=${this.metricId}`)
        .then(res => {
          res.data.forEach(item => {
            if (item.objectId === 0) {
              item.objectId = null
            }
            if (item.tableId === 0) {
              item.tableId = null
            }
          })
          if (
            res.data.some(item => {
              return item.attrType === LDMTypes.Index
            })
          ) {
            this.tableData = res.data
          } else {
            this.tableData = [
              this.tableData.filter(i => i.attrType === LDMTypes.Index)[0],
            ].concat(res.data)
          }
          if (res.data && res.data.length >= 1) {
            this.tableId = res.data[0].tableId
            this.getTableDetail()
            this.dims = []
            this.dimsDisplay = res.data
              .filter(i => i.attrType === LDMTypes.DataDimension)
              .map(item => {
                return {
                  id: item.itemId + '-' + item.dimensionLevelId,
                  displayName: this.allDims.filter(
                    i => i.id === item.itemId + '-' + item.dimensionLevelId
                  )[0].displayName,
                }
              })
            this.dims = this.dimsDisplay.map(i => i.id)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getTableDetail() {
      if (this.tableId) {
        this.$http
          .get(this.$url + `/service/entities/${this.tableId}/summary`)
          .then(res => {
            this.tableName = res.data.physicalName
            this.modelName = res.data.modelName + ' / ' + res.data.schemaName
            this.tableLabelArray = [this.modelName, this.tableName]
          })
      }
    },
    dataIconFunction(data, node) {
      if (node.level === 1) {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      } else {
        return 'tree-icon domain-code'
      }
    },
    addDim() {
      this.dimDialogVisible = true
      this.$nextTick(() => {
        this.$refs.tree.setCheckedKeys(this.dims)
      })
    },
    saveDimDialog() {
      const checkedNodes = this.$refs.tree.getCheckedNodes()
      this.dims = checkedNodes
        .filter(i => typeof i.id === 'string')
        .map(i => i.id)
      this.lastDims = _.clone(this.dims)
      this.dimsDisplay = this.allDims.filter(i => this.dims.includes(i.id))
      this.dimDialogVisible = false
    },
    closeDimDialog() {
      this.dims = _.clone(this.lastDims)
      this.dimDialogVisible = false
    },
    handleRemoveDim(idx) {
      this.dimsDisplay.splice(idx, 1)
      this.dims = this.dimsDisplay.map(i => i.id)
    },
    setTable() {
      this.$refs.metaSelector.init()
    },
    handleMetaSelect({ model, table, column }) {
      this.tableId = table.objectId
      this.tableName = table.physicalName
      if (model.schema) {
        this.modelName = model.name + ' / ' + model.schema
      } else {
        this.modelName = model.name
      }
      this.unbindAll()
      // this.searchColumns()
      this.tableLabelArray = [this.modelName, this.tableName]
    },
    searchColumns() {
      if (this.tableId) {
        this.columnsReady = false
        const requestUrl = `${this.$meta_url}/service/entities/${this.tableId}/columns`
        this.$http
          .get(requestUrl)
          .then(res => {
            this.columns = res.data
            this.columnsReady = true
          })
          .catch(e => {
            this.$showFailure(e)
            this.columnsReady = true
          })
      }
    },
    addOrUpdateMapping(row, newValue) {
      if (!newValue) {
        return
      }
      if (row.metricMappingId) {
        // update
        this.$http
          .post(`/domain/metricManagement/mapping/update`, {
            metricMappingId: row.metricMappingId,
            attrInfo: row.attrInfo,
            attrType: row.attrType,
            itemId: row.itemId,
            comment: row.comment,
            dimensionLevelId: row.dimensionLevelId,
            mappingColumn: this.columns.filter(
              i => i.objectId === row.objectId
            )[0].physicalName,
            metricId: this.metricId,
            objectId: row.objectId,
            tableId: this.tableId,
          })
          .then(() => {
            // this.getMappingList()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$http
          .post(`/domain/metricManagement/mapping/add`, {
            attrInfo: row.attrInfo,
            attrType: row.attrType,
            itemId: row.itemId,
            dimensionLevelId: row.dimensionLevelId,
            mappingColumn: this.columns.filter(
              i => i.objectId === row.objectId
            )[0].physicalName,
            metricId: this.metricId,
            objectId: row.objectId,
            tableId: this.tableId,
          })
          .then(() => {
            this.getMappingList()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    bindNullObject(requestBody) {
      return new Promise(resolve => {
        this.$http
          .post(`/domain/metricManagement/mapping/add`, requestBody)
          .then(() => {
            resolve()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    realUnbindMapping(row) {
      this.$http
        .post(`/domain/metricManagement/mapping/delete`, [row.metricMappingId])
        .then(() => {
          if (row) {
            row.objectId = null
            row.metricMappingId = null
          }
        })
    },
    unbindAll() {
      this.tableData.forEach(row => {
        if (row.metricMappingId) {
          this.unbindMapping({
            metricMappingId: row.metricMappingId,
            attrInfo: row.attrInfo,
            attrType: row.attrType,
            itemId: row.itemId,
            dimensionLevelId: row.dimensionLevelId,
            mappingColumn: 'n/a',
            metricId: row.metricId,
            objectId: 0,
            tableId: row.tableId,
          })
        }
      })
    },
    unbindMapping(row) {
      this.$http
        .post(`/domain/metricManagement/mapping/update`, {
          metricMappingId: row.metricMappingId,
          attrInfo: row.attrInfo,
          attrType: row.attrType,
          itemId: row.itemId,
          dimensionLevelId: row.dimensionLevelId,
          mappingColumn: 'n/a',
          metricId: row.metricId,
          objectId: 0,
          tableId: this.tableId,
        })
        .then(() => {
          this.tableData.forEach(item => {
            if (item.metricMappingId === row.metricMappingId) {
              item.objectId = null
            }
          })
          // row.objectId = null 此处由于数据有可能为二次包装，因此不能直接对row.objectId进行操作
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    compareMixedId(mixedId, tableItem) {
      const item = tableItem
      return (
        typeof mixedId === 'string' &&
        mixedId.includes('-') &&
        mixedId.split('-')[0] === _.toString(item.itemId) &&
        mixedId.split('-')[1] === _.toString(item.dimensionLevelId)
      )
    },
  },
  watch: {
    dimsDisplay(val) {
      const dimIds = val.map(i => i.id)
      this.tableData
        .filter(i => i.attrType === LDMTypes.DataDimension)
        .forEach(item => {
          if (!dimIds.some(mixedId => this.compareMixedId(mixedId, item))) {
            this.realUnbindMapping(item)
          }
        })
      const tableData = _.cloneDeep(this.tableData)
      this.tableData = this.tableData.filter(i => i.attrType === LDMTypes.Index) // 指标的留着
      const promises = []
      val.forEach(item => {
        if (
          !tableData
            .filter(i => i.attrType === LDMTypes.DataDimension)
            .some(i => this.compareMixedId(item.id, i))
        ) {
          this.tableData.push({
            attrInfo: item.displayName,
            attrType: LDMTypes.DataDimension,
            itemId: item.id.split('-')[0],
            dimensionLevelId: item.id.split('-')[1],
            mappingColumn: '',
            metricId: this.metricId,
            objectId: '',
            tableId: this.tableId, // 可能还没产生
          })
          promises.push(
            this.bindNullObject({
              attrInfo: item.displayName,
              attrType: LDMTypes.DataDimension,
              itemId: item.id.split('-')[0],
              dimensionLevelId: item.id.split('-')[1],
              mappingColumn: 'n/a',
              metricId: this.metricId,
              objectId: 0,
              tableId: this.tableId ? this.tableId : 0, // 可能还没产生
            })
          )
        } else {
          let innerItem = tableData.filter(
            i => i.itemId + '-' + i.dimensionLevelId === String(item.id)
          )[0]
          if (innerItem) {
            this.tableData.push(innerItem)
          }
        }
      })
      if (promises.length > 0) {
        Promise.all(promises).then(() => {
          this.getMappingList()
        })
      }
    },
    tableId: {
      handler: function () {
        if (this.tableId) {
          this.searchColumns()
        } else {
          this.columnsReady = true
        }
      },
      immediate: true,
    },
  },
}
</script>
<style lang="scss"></style>
