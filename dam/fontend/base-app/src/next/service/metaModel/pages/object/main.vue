<template>
  <div>
    <datablau-dialog title="新建资产" :visible.sync="dialogVisible" height="400px" v-if="dialogVisible">
      <datablau-form label-width="12em">
        <el-form-item label="资产名称">
          <datablau-input v-model="newObject.name"></datablau-input>
        </el-form-item>
        <el-form-item label="资产类型">
          <datablau-select
            v-model="newObject.typeId"
            placeholder="请选择资产类型"
            :disabled="editMode"
          >
            <el-option
              v-for="asset in assets"
              :key="asset.id"
              :value="asset.id"
              :label="asset.name"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item v-for="p in newObject.properties" :label="p.propertyId.split('.').pop()" :key="p.propertyId">
          <datablau-input v-model="p.value"></datablau-input>
        </el-form-item>
      </datablau-form>
      <div slot="footer">
        <datablau-button @click="handleDialogSubmit" type="primary">确定</datablau-button>
        <datablau-button @click="handleDialogClose">关闭</datablau-button>
      </div>
    </datablau-dialog>
    <div class="com-title">
      资产浏览
    </div>
    <div style="margin-top: 10px;">
      {{ Context.namespace }} /
      <datablau-select
        v-model="currentDomain" @change="handleDomainChange" style="width: 160px;display:inline-block;">
        <el-option
          v-for="domain in domains"
          :key="domain.name"
          :label="domain.name"
          :value="domain.name"
        ></el-option>
      </datablau-select>
      <datablau-select
        v-model="typeIds"
        :multiple="false"
        placeholder="请选择资产类型"
        style="margin-left: 10px;width: 160px;display:inline-block;"
        clearable
      >
        <el-option
          v-for="asset in assets"
          :key="asset.id"
          :value="asset.id"
          :label="asset.name"
        ></el-option>
      </datablau-select>
      <datablau-select
        v-model="propertyId"
        style="margin-left: 10px;margin-right: 10px;width: 160px;display:inline-block;"
        clearable
      >
        <el-option
          v-for="p in propertiesOfAsset"
          :key="p.id"
          :value="p.id"
          :label="p.label"
        ></el-option>
      </datablau-select>
      <datablau-input v-model="propertyValue" placeholder="请输入属性值" clearable></datablau-input>
      <datablau-button @click="findObjects" style="margin-left: 10px;">查询</datablau-button>
      <datablau-button class="com-button" @click="initCreateObject()">新建资产</datablau-button>
    </div>
    <div class="com-table">
      <datablau-table :data="objects">
        <el-table-column prop="typeId" :width="150" label="Type">
          <template slot-scope="scope">
            {{scope.row.typeId.split('.').pop()}}
          </template>
        </el-table-column>
        <el-table-column
          v-for="(column, idx) in columns"
          :key="column"
          :label="column.split('.').pop()"
          prop="column"
          :min-width="150"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{scope.row.properties.find(i => i.propertyId === column)?.value}}
          </template>
        </el-table-column>
<!--        <el-table-column label="操作" fixed="right" :width="100">
          <template slot-scope="scope">
            <datablau-button type="text" @click="initCreateObject(scope.row)" disabled>修改</datablau-button>
          </template>
        </el-table-column>-->
      </datablau-table>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import Context from "@/next/service/metaModel/class/Context";
export default {
  mounted() {
    $('#db-heading').remove()
    this.listDomains()
  },
  data() {
    return {
      Context: Context,
      domains: [],
      assets: [],
      currentDomain: null,
      properties: null,
      typeIds: null,
      propertyId: null,
      propertyValue: '',
      objects: null,
      columns: [],
      editMode: false,
      currentRow: null,
      dialogVisible: false,
      newObject: {
        name: '',
        typeId: '',
        properties: [],
      },
    }
  },
  computed: {
    propertiesOfAsset() {
      const properties = this.assets && this.assets.filter(i => {
        return !this.typeIds || this.typeIds === i.id
      }).filter(i => i.propertyIds).map(i => i.propertyIds)
      return (_.uniq(_.flatten(properties))).map(item => {
        return {
          id: item,
          label: item.split('.').pop()
        }
      })
    },
  },
  watch: {
    "newObject.typeId": {
      immediate: true,
      handler() {
        if (!this.newObject.typeId) {
          return;
        }
        const properties = [];
        const propertyIds = this.assets.find(i => i.id === this.newObject.typeId)?.propertyIds;
        propertyIds.forEach(item => {
          properties.push({
            propertyId: item,
            value: this.currentRow && this.currentRow.properties && this.currentRow.properties.length > 0 ? this.currentRow.properties.find(i => i.propertyId === item)?.value : '',
          })
        })
        this.newObject.properties = properties
      },
    }
  },
  methods: {
    initCreateObject(row) {
      this.editMode = !!row
      this.currentRow = row;
      if (row) { // 编辑
        this.newObject.typeId = row.typeId
        this.newObject.name = row.name
        this.newObject.id = row.id
      } else { // 创建
        this.newObject.typeId = this.typeIds
      }
      this.dialogVisible = true
    },
    handleDialogSubmit() {
      this.createObject().then(_ => {
        this.handleDialogClose();
        this.findObjects();
      })
    },
    handleDialogClose() {
      this.dialogVisible = false;
    },
    handleDomainChange() {
      this.loadModel(false)
    },
    listDomains() {
      this.$parent.listDomains().then(_ => {
        this.domains = this.$parent.domains;
        this.currentDomain = this.domains[0].name;
        this.loadModel(false);
        this.findObjects();
      })
    },
    loadModel(forceUpdate) {
      this.$parent.loadModel(this.currentDomain, forceUpdate).then(_ => {
        const modelByDomain = this.$parent.modelByDomain[this.currentDomain]
        this.assets = modelByDomain.assets
        this.properties = modelByDomain.properties.filter(i => i.propertyMap.$name?.value)
      })
    },
    findObjects() {
      this.$http.post(`/metamodel/findObjects?${Context.ns}=${Context.namespace}`, {
        "domains": [this.currentDomain],
        "typeIds": this.typeIds ? [this.typeIds] : null,
        "comparisons": (this.propertyId && this.propertyValue) ? [{
          "propertyId": this.propertyId,
          "propertyValue": this.propertyValue,
          "exactMatch": false
        }] : null
      }).then(res => {
        this.objects = res.data;
        if (res.data[0]) {
          let columns
          if (this.typeIds) {
            columns = this.assets.find(i => i.id === this.typeIds).propertyIds;
          } else {
            columns = [];
            this.assets.forEach(asset => {
              if (asset.propertyIds) {
                columns = _.concat(columns, asset.propertyIds);
              }
            })
            columns = _.uniq(columns);
          }

          columns.sort((a, b) => {
            if (a === 'com.datablau.database.Name') {
              return -1
            }
          })
          this.columns = columns;
        }
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    async createObject(row) {
      await this.$http.post(`/metamodel/createObject?${Context.ns}=${Context.namespace}`, {
        "name": this.newObject.name,
        "domain": this.currentDomain,
        "typeId": this.newObject.typeId,
        id: this.newObject.id,
        "properties": this.newObject.properties,
      }).then(_ => {
      }).catch(e => {
        this.$showFailure(e)
      })
    },
  },
}
</script>
<style lang="css">
@import "../../assets/base.css";
</style>
