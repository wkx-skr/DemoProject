<template>
  <div>
    <datablau-dialog title="新建属性" :visible.sync="dialogVisible" height="360px" size="mini">
      <datablau-form label-width="6em">
        <el-form-item label="名称">
          <datablau-input v-model="newProperty.name" placeholder="请输入属性的名称"></datablau-input>
        </el-form-item>
        <el-form-item label="显示名">
          <datablau-input v-model="newProperty.displayName" placeholder="请输入属性的显示名"></datablau-input>
        </el-form-item>
        <el-form-item label="数据类型">
          <datablau-select v-model="newProperty.dataType" placeholder="请选择数据类型">
            <el-option v-for="i in dataTypes" :key="i" :label="i" :value="i"></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="描述">
          <datablau-input
            v-model="newProperty.description"
            placeholder="请输入描述"
            type="textarea"
            style="width: 500px;"
          ></datablau-input>
        </el-form-item>
      </datablau-form>
      <div slot="footer">
        <datablau-button @click="handleDialogSubmit" type="primary">确定</datablau-button>
        <datablau-button @click="handleDialogClose">关闭</datablau-button>
      </div>
    </datablau-dialog>
    <div class="com-title">
      属性 Property
    </div>
    <div>属性，包含在域的定义中，通过和资产类型建立关联来扩展自定义的资产类型。
    </div>
    <div style="margin-top: 10px;">
      {{ Context.namespace }} /
      <datablau-select v-model="currentDomain" @change="handleDomainChange" style="width: 240px;display:inline-block;">
        <el-option
          v-for="domain in domains"
          :key="domain.name"
          :label="domain.name"
          :value="domain.name"
        ></el-option>
      </datablau-select>
      <datablau-button class="com-button" @click="initCreateDomain">新建属性</datablau-button>
    </div>
    <div class="com-table">
      <datablau-table :data="properties">
        <el-table-column label="名称" :formatter="nameFormatter" show-overflow-tooltip :width="200"></el-table-column>
        <el-table-column label="显示名" :formatter="displayNameFormatter" show-overflow-tooltip :width="200"></el-table-column>
        <el-table-column label="数据类型" :formatter="dataTypeFormatter" show-overflow-tooltip :width="200"></el-table-column>
        <el-table-column label="描述" :formatter="descriptionFormatter" show-overflow-tooltip></el-table-column>
      </datablau-table>
    </div>
  </div>
</template>
<script>
import Context from "@/next/service/metaModel/class/Context";

export default {
  mounted() {
    this.listDomains()
  },
  components: {},
  data() {
    return {
      Context: Context,
      dataTypes: ['System.String', 'System.Int32', 'System.Boolean', 'System.DateTime'],
      domains: [],
      properties: null,
      currentDomain: null,
      newProperty: {
        name: '',
        dataType: '',
        description: '',
      },
      dialogVisible: false,
    }
  },
  methods: {
    clearForm() {
      for (let newPropertyKey in this.newProperty) {
        this.newProperty[newPropertyKey] = ''
      }
    },
    nameFormatter(row) {
      if (row.propertyMap.$name)
        return row.propertyMap.$name.value
    },
    displayNameFormatter(row) {
      if (row.propertyMap.$displayName)
        return row.propertyMap.$displayName.value
    },
    dataTypeFormatter(row) {
      if (row.propertyMap.$valueType)
        return row.propertyMap.$valueType.value
    },
    descriptionFormatter(row) {
      if (row.propertyMap.$description)
        return row.propertyMap.$description.value
    },
    initCreateDomain() {
      this.dialogVisible = true
    },
    handleDialogSubmit() {
      this.createAssetProperty().then(_ => {
        this.handleDialogClose()
        this.clearForm()
        this.loadModel(true)
      })
    },
    handleDialogClose() {
      this.dialogVisible = false;
    },
    async createAssetProperty() {
      await this.$http.post(`/metamodel/createAssetProperty?${Context.ns}=${Context.namespace}`, {
        "name": this.newProperty.name,
        "propertyMap": {
          "$name": {"id": "$name", "value": this.newProperty.name, "valueType": "string"},
          "$description": {"id": "$name", "value": this.newProperty.description, "valueType": "string"},
          "$displayName": {"id": "$displayName", "value": this.newProperty.displayName, "valueType": "string"},
          "$namespace": {"id": "$namespace", "value": Context.namespace, "valueType": "string"},
          "$valueType": {"id": "$valueType", "value": this.newProperty.dataType, "valueType": "string"},
          "$domainRef": {"id": "$domainRef", "value": this.currentDomain, "valueType": "string"},
        }
      }).then(_ => {
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    loadModel(forceUpdate) {
      this.$parent.loadModel(this.currentDomain, forceUpdate).then(_ => {
        const modelByDomain = this.$parent.modelByDomain[this.currentDomain]
        this.properties = modelByDomain.properties.filter(i => i.propertyMap.$name?.value)
      })
    },
    handleDomainChange() {
      this.loadModel(false)
    },
    listDomains() {
      this.$parent.listDomains().then(_ => {
        this.domains = this.$parent.domains;
        this.currentDomain = this.domains[0].name;
        this.loadModel(false);
      })
    },
  },
}
</script>
<style lang="css">
@import "../../assets/base.css";
</style>
