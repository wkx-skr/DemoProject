<template>
  <div class="ddd-table-wrapper" v-loading="loading.status">
    <!--<table-details
      v-if="tables[0] && currentModel"
      :rawData="tables[0]"
      :current-model="currentModel"
      :data-by-type="dataByType"
      :isLogicalModel="isLogical || isConceptual"
      @updateTabName="updateTabName"
      @updateVersion="updateVersion"
      @updateTableData="updateTableData"
      :typeDataWareHouse="true"
      :TypeUniqueIdToColumnDefaultType="TypeUniqueIdToColumnDefaultType"
    >
    </table-details>-->
    <table-details
      v-if="tables[0] && currentModel"
      :editorType="editorType"
      :key="tables[0].tableMsg.Id"
      :deliverNum="currentModel"
      :TypeUniqueIdToColumnDefaultType="TypeUniqueIdToColumnDefaultType"
      :tableDialogKey="tableDialogKey"
      ref="tableDetailsEdit"
      :rawData="tables[0]"
      :current-model="currentModel"
      :data-by-type="dataByType"
      :isLogicalModel="isLogical"
      :isDesignModel="isLogical || isConceptual"
      :getTableHTMLFunction="null"
      :startIdToEndIds="{}"
      :createDeepRelation="() => {}"
      :calculateStartIdToEndIds="() => {}"
      :cellDialogData="null"
      :currentStyleRelatedShapeTemplate="{}"
      :formatThemeTemplateData="() => {}"
      :currentId="currentId"
      :isCassandraOrMongoDB="isCassandraOrMongoDB"
      :isLogical="isLogical"
      :isConceptual="isConceptual"
      :getTableNameNamingMap="getTableNameNamingMap"
      :getColumnNameNamingMap="getColumnNameNamingMap"
      :getIndexNameNamingMap="getIndexNameNamingMap"
      :categoryOrder="categoryOrder"
      :isShowSchema="showViewButton"
      @changeDialogWidth="() => {}"
      :LayerEdit="function (changes) {
        this.changes = changes
      }"
      :Changes="function (type, obj) {
        this.type = type
        this.obj = obj
      }"
      :typeDataWareHouse="true"
      @updateTabName="updateTabName"
      @updateVersion="updateVersion"
      @updateTableData="updateTableData"
      @handleDialogData="handleDialogData"
      :authPro="authPro"
      :themeBlack="true">
    </table-details>
  </div>
</template>

<script>
// import tableDetails from '@/views/list/graph/editComponents/tableDetails.vue'
import HTTP from '@/resource/http'
import LDMTypes from '@constant/LDMTypes'
let tableDetails = null
if (window.EREncode) {
  try {
    require('@er/modelEdit.css')
  } catch (e) {
    console.log(e)
  }
} else {
  try {
    tableDetails = require('@/views/list/graph/editComponents/tableDetails.vue').default
  } catch (e) {
    console.log(e)
  }
}
export default {
  props: {
    item: {
      type: Object,
      required: true
    },
    authPro: {
      type: Object
    }
  },
  components: tableDetails ? {
    tableDetails
  } : {},
  computed: {
    isLogical () {
      return this.dataByType.model.TypeUniqueId === '025502f5-3820-4555-9d0f-bbb148840e9a' || this.dataByType.model.TypeUniqueId === '7865092e-58be-4096-b824-11bcba4aa10a' || this.dataByType.model.TypeUniqueId === '71f0d1c4-d45d-4eb7-bd1a-e45a0b018121' || this.dataByType.model.TypeUniqueId === '5c9598bc-6906-4edb-9ddb-a23428e224c2'
    },
    showViewButton () {
      return !this.isLogical && !this.isConceptual && !this.isCassandraOrMongoDB
    },
    isCassandraOrMongoDB () {
      return this.dataByType.model.TypeUniqueId === '8ea840a5-37f4-48f8-82d9-1429e42a0fc6' || this.dataByType.model.TypeUniqueId === '4ab7d425-7b4a-49c2-a19b-86dd5f911706'
    },
    isConceptual () {
      return this.dataByType.model.TypeUniqueId === '721ac3dc-dabe-4be2-ae47-cbd6b0a14d80' || this.dataByType.model.TypeUniqueId === 'f9c0cbd3-055c-4e33-8f41-5022062a8df0'
    }
  },
  data () {
    return {
      loading: {
        status: false
      },
      from: 'tables',
      categoryOrder: [],
      currentId: 0,
      tableDialogKey: 0,
      editorType: 'table',
      tables: [],
      currentModel: null,
      dataByType: null,
      TypeUniqueIdToColumnDefaultType: {
        '8CE0D4A7-ADAC-4244-A944-EA74815F5AB8': 'STRING', // hive
        'ADECDAAC-D24B-4081-94E2-9D6217ECC5AA': 'VARCHAR(50)', // MariaDB
        '0F691FA0-3FD7-42F1-B868-051B0FFAD10C': 'VARCHAR(50)',
        'b3fa9413-2e92-4927-bc44-ae81ec7d3c8a': 'VARCHAR(50)', // TDSQLMySQL
        'C14A95B1-5FA3-4F1A-9B04-2507E8C96ADE': 'VARCHAR(50)', // CBase
        'AA8FBE2F-EC17-48B4-B7F1-A9AC47525D3F': 'VARCHAR(50)',
        'F3901084-5B9A-4776-86E9-FDEE6F7F87B7': 'VARCHAR(50)',
        '2C85C9CA-D052-467C-8C55-D367D69982CF': 'VARCHAR(50)',
        '139A6B8F-3D10-4C0E-BA3D-8B43131EF06A': 'STRING',
        'F2B1C0D4-1E4E-4CE4-9C98-988191D63C55': 'VARCHAR2(20)',
        '998E48F9-FFEC-4473-A7A0-754C055C0953': 'VARCHAR(50)',
        '4091BC89-EEBB-4E1D-866B-A47707804417': 'CHAR(18)',
        '8EA840A5-37F4-48F8-82D9-1429E42A0FC6': 'string',
        '4AB7D425-7B4A-49C2-A19B-86DD5F911706': 'string',
        '67AE3EBF-8D3B-4E6C-93F5-E35E6CF32C8E': 'VARCHAR(50)',
        '0DD030E7-9412-4ACE-9ED7-E1225DBA2855': 'VARCHAR(20)',
        '84A19E0F-9937-4B5C-8E55-B1AE54BF9352': 'VARCHAR2(50)',
        '1333DCA6-0D18-195A-6EE0-E6FB0D3666FF': 'VARCHAR2(20)',
        '16C864E9-1492-6D39-7E47-763067512DC2': 'VARCHAR(50)',
        '2CE303DB-DE63-7696-8A71-041AF6EB772B': 'VARCHAR(50)',
        '2022EC9E-15F5-DEFF-32B0-DCFABCCDE3EF': 'VARCHAR2(20)',
        '6d977600-5d0d-441b-a85a-d682827d696c': 'VARCHAR(50)',
        '076733be-ee09-4bba-8adb-5d2b48036a42': 'VARCHAR(50)',
        '597095CA-993C-4EF9-8AEE-48E87F7EE7E2': 'VARCHAR(50)',
        '025502f5-3820-4555-9d0f-bbb148840e9a': 'VARCHAR(50)',
        'b6a80960-849e-491e-9283-2042405fba29': 'STRING',
        '45c7074a-0c6e-4b0b-9ef8-6c6fa5242bc0': 'VARCHAR(50)',
        '721ac3dc-dabe-4be2-ae47-cbd6b0a14d80': 'VARCHAR(50)',
        'e8fdd9f9-2d5f-456d-a5f4-de6c17025e23': 'VARCHAR(50)',
        'a5277112-1079-4d90-89e6-a46f00c6c7f0': 'STRING',
        'df57529d-3918-42aa-bc8d-092c2b7c12b4': 'VARCHAR(50)',
        'b86fdec4-da62-4ee2-8c65-1bc221d2a578': 'VARCHAR(50)',
        '097618F2-3A1D-4D4F-A31C-E138217A486A': 'VARCHAR(80)',
        'F9C0CBD3-055C-4E33-8F41-5022062A8DF0': 'VARCHAR(50)',
        '5C9598BC-6906-4EDB-9DDB-A23428E224C2': 'VARCHAR(50)',
        '7865092E-58BE-4096-B824-11BCBA4AA10A': 'VARCHAR(50)',
        '71F0D1C4-D45D-4EB7-BD1A-E45A0B018121': 'VARCHAR(50)',
        '5053d067-62bb-f7ae-7971-f28ac8fdd44b': 'String'
      }
    }
  },
  mounted () {
    this.getCategories()
    let { table, currentModel, dataByType } = this.item
    this.tables.push(table)
    this.currentModel = currentModel
    this.dataByType = dataByType
  },
  methods: {
    getCategories () {
      this.$http.get(this.$url + '/service/nametranslate/category').then(res => {
        this.categoryData = res.data.map(item => ({
          name: item === '' ? '默认' : item,
          checked: true
        }))
        let categoryStr = localStorage.getItem('categoryOrderMap')
        if (categoryStr) {
          let categoryOrderMap = JSON.parse(categoryStr)
          this.categoryData.forEach(i => {
            i.checked = Boolean(categoryOrderMap[i.name] && categoryOrderMap[i.name].checked)
          })
          this.categoryData = this.categoryData.sort((a, b) => {
            if (!categoryOrderMap[a.name]) {
              categoryOrderMap[a.name] = {
                index: this.categoryData.length
              }
            }
            if (!categoryOrderMap[b.name]) {
              categoryOrderMap[b.name] = {
                index: this.categoryData.length
              }
            }
            return categoryOrderMap[a.name].index - categoryOrderMap[b.name].index
          })
        }
        this.categoryOrder = this.categoryData.filter(i => i.checked).map(i => i.name === '默认' ? '' : i.name)
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    getTableNameNamingMap (name) {
      let { namingOption } = this.dataByType
      if (namingOption.IsTableTranslateEnabled) {
        // name = name.slice(0, namingOption.TableNameMaxLength)
        if (name.toLowerCase().indexOf(namingOption.TableNamePrefix.toLowerCase()) !== 0) {
          name = namingOption.TableNamePrefix + name
        }
        if (name.toLowerCase().lastIndexOf(namingOption.TableNamePostfix.toLowerCase()) !== -1 && name.toLowerCase().lastIndexOf(namingOption.TableNamePostfix.toLowerCase()) + namingOption.TableNamePostfix.length === name.length) {

        } else {
          name = name + namingOption.TableNamePostfix
        }
        name = this.changeAlphabetType(name, namingOption.TableNameCase)
      }
      return name
    },
    getColumnNameNamingMap (name) {
      let { namingOption } = this.dataByType
      if (namingOption.IsColumnTranslateEnabled) {
        // name = name.slice(0, namingOption.ColumnNameMaxLength)
        if (name.toLowerCase().indexOf(namingOption.ColumnNamePrefix.toLowerCase()) !== 0) {
          name = namingOption.ColumnNamePrefix + name
        }
        if (name.toLowerCase().lastIndexOf(namingOption.ColumnNamePostfix.toLowerCase()) !== -1 && name.toLowerCase().lastIndexOf(namingOption.ColumnNamePostfix.toLowerCase()) + namingOption.ColumnNamePostfix.length === name.length) {

        } else {
          name = name + namingOption.ColumnNamePostfix
        }
        name = this.changeAlphabetType(name, namingOption.ColumnNameCase)
      }
      return name
    },
    getIndexNameNamingMap (macro, name, keyId) {
      return this.changeAlphabetType(macro.replace(/%owner%/, name).replace(/%keyid%/, keyId), this.dataByType.namingOption.IndexNameCase)
    },
    changeAlphabetType (name, type) {
      if (type === 'None') {

      } else if (type === 'Lower') {
        name = name.toLowerCase()
      } else if (type === 'Upper') {
        name = name.toUpperCase()
      } else if (type === 'Initial') {
        name = name.slice(0, 1).toUpperCase() + name.slice(1, name.length).toLowerCase()
      }
      return name
    },
    updateTabName () {
      this.currentTab = this.tabLabelFormatter(this.tables[0])
    },
    updateVersion (version) {
      if (version) {
        this.currentModel.currentVersion = version
      } else {
        this.currentModel.currentVersion++
      }
    },
    updateTableData (data) {
      this.dataByType.table[data.properties.Id] = data
      this.afterHandleDialogData(data.properties.Id)
      if (this.$refs.tables) {
        this.$refs.tables.updateTableData(data)
      }
      if (this.$refs.partTables) {
        this.$refs.partTables.updateTableData(data)
      }
    },
    handleDialogData (tableId, editMode, isView = false) { // tableId可能是viewId
      if (tableId) {
        if (this.from === 'tables') {
          this.loading.status = true
          HTTP.getElementContent({
            modelId: this.currentModel.id,
            elementId: tableId,
            longkey: this.longkey,
            successCallback: data => {
              if (this.longkey) {
                data = this.transformData(data)
              }
              const dataColumnOrdered = {
                properties: data.properties,
                children: [],
                objectClass: data.objectClass
              }
              if (data.properties.ColumnOrderArrayRefs) {
                const columnMap = new Map()
                data.children.forEach(item => {
                  if (item.properties.TypeId === 80000005) {
                    columnMap.set(item.properties.Id, item)
                  } else {
                    dataColumnOrdered.children.push(item)
                  }
                })
                data.properties.ColumnOrderArrayRefs.forEach(item => {
                  if (columnMap.get(item)) {
                    dataColumnOrdered.children.push(columnMap.get(item))
                  }
                })
              } else {
                dataColumnOrdered.children = data.children
              }
              if (isView) {
                this.dataByType.view[tableId] = dataColumnOrdered
              } else {
                this.dataByType.table[tableId] = dataColumnOrdered
              }
              this.afterHandleDialogData(tableId, editMode, isView)
            },
            finallyCallback: () => {
              this.loading.status = false
            }
          })
        } else if (this.from === 'graph') { // 有画布的graph已加载table详情数据
          this.afterHandleDialogData(tableId, editMode, isView)
        }
      } else {
        // 添加新表
        this.$set(this.dataByType.table, this.currentModel.seed, {
          objectClass: 'Datablau.LDM.EntityComposite',
          children: [],
          properties: {
            ColumnOrderArrayRefs: [],
            DataStandardCode: '',
            Id: this.currentModel.seed,
            IsLogicalOnly: false,
            IsPhysicalOnly: false,
            Name: this.getTableNameNamingMap((this.isLogical ? 'Entity_' : this.isCassandraOrMongoDB ? 'Collection_' : 'Table_') + (this.sumElementNumCopy += 2)),
            RawType: 'Entity',
            TypeId: 80000004,
            changed: true,
            new: true
          }
        })
        const existTable = this.tables.find(table => {
          return table.appendMode
        })
        let dialog = {
          columnsMsg: [],
          pk: [],
          fk: [],
          uk: [],
          nk: [],
          vk: [],
          tableMsg: {
            LogicalName: '',
            Name: '',
            Definition: '',
            Id: this.currentModel.seed++
          },
          appendMode: true
        }
        if (!existTable) {
          this.tables.push(dialog)
          // this.showTabs = true
          this.currentTab = dialog.tableMsg.Id + ''
        } else {
          this.currentTab = existTable.tableMsg.Id + ''
        }
      }
    },
    afterHandleDialogData (tableId, editMode = false) {
      this.tables = []
      if (tableId) { //  it means a table already exists
        let data = this.dataByType.table[tableId]
        let dialog = {}
        dialog.visible = true
        dialog.tableMsg = data.properties
        if (!dialog.tableMsg.LogicalName) {
          //          dialog.tableMsg.LogicalName = dialog.tableMsg.Name;
        }
        dialog.editMode = editMode
        dialog.columnsMsg = []
        dialog.pk = []
        dialog.fk = []
        dialog.uk = []
        dialog.nk = []
        dialog.vk = []
        dialog.partition = null
        dialog.dwMapping = []
        if (Array.isArray(data.children)) {
          data.children.forEach(item => {
            if (!item.properties.deleted) {
              if (item.properties['TypeId'] === LDMTypes.Attribute) {
                dialog.columnsMsg.push(item)
              } else if (item.properties['KeyGroupType'] === 'PrimaryKey') {
                dialog.pk.push(item)
              } else if (item.properties['KeyGroupType'] === 'ForeignKey') {
                dialog.fk.push(item)
              } else if (item.properties['KeyGroupType'] === 'UniqueKey') {
                dialog.uk.push(item)
              } else if (item.properties['KeyGroupType'] === 'NonUniqueKey') {
                dialog.nk.push(item)
              } else if (item.properties['KeyGroupType'] === 'VirtualKey') {
                dialog.vk.push(item)
              } else if (item.properties['TypeId'] === LDMTypes.Partition) {
                dialog.partition = item
              } else if (item.properties.TypeId === LDMTypes.DWMapping) {
                dialog.dwMapping.push(item)
              }
            }
          })
        }
        dialog.dwMapping.sort((a, b) => { // mapping按照创建顺序排序
          return a.properties.Id - b.properties.Id
        })
        dialog.dwMapping.forEach(mapping => {
          mapping.children?.sort((a, b) => {
            return a.properties.Id - b.properties.Id
          })
        })
        const exist = this.tables.some(table => {
          return table.tableMsg.Id === dialog.tableMsg.Id
        })
        if (!exist) {
          this.tables.push(dialog)
          // this.showTabs = true
        } else {
          this.tables.forEach(table => {
            if (table.tableMsg.Id === dialog.tableMsg.Id) {
              Object.keys(dialog).forEach(p => {
                this.$set(table, p, dialog[p])
              })
            }
          })
        }
        this.currentTab = this.tabLabelFormatter(dialog)
      }
    },
    tabLabelFormatter (v) {
      if (this.currentOperation === 'openTable') {
        this.$emit('openTable', {
          id: this.item.modelId + '_' + this.currentRow.id,
          name: this.currentRow.tableName + '_' + this.currentModel.name,
          table: this.tables[0],
          currentModel: this.currentModel,
          dataByType: this.dataByType
        })
      } else if (this.currentOperation === 'newTable') {
        this.$emit('openTable', {
          id: this.item.modelId + '_',
          name: '新建表' + '_' + this.currentModel.name,
          table: this.tables[0],
          currentModel: this.currentModel,
          dataByType: this.dataByType
        })
      }
      if (!v) {
        return
      }
      if (v.appendMode) {
        return this.isLogical ? this.$store.state.$v.dataEntity.addEntity : this.$store.state.$v.dataEntity.addTable
      } else {
        return v.tableMsg.Name + (v.tableMsg.LogicalName ? `(${v.tableMsg.LogicalName})` : '')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.ddd-table-wrapper {
  position: absolute;
  top: 33px;
  left: 0px;
  right: 0px;
  bottom: 0;
  background: #222222;
}
</style>
