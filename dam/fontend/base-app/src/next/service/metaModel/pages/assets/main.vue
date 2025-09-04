<template>
  <div>
    <datablau-dialog title="绑定属性" :visible.sync="attachDialogVisible" height="450px" size="mini">
      <datablau-table
        :data="properties"
        :height="300"
        data-selectable
        :auto-hide-selection="false"
        @selection-change="handleSelectionChange">
        <el-table-column label="名称" :formatter="nameFormatter" show-overflow-tooltip :width="200"></el-table-column>
        <el-table-column label="显示名" :formatter="displayNameFormatter" show-overflow-tooltip :width="200"></el-table-column>
        <el-table-column label="数据类型" :formatter="dataTypeFormatter" show-overflow-tooltip :width="200"></el-table-column>
      </datablau-table>
      <div slot="footer">
        <datablau-button @click="handleAttachDialogSubmit" type="primary">确定</datablau-button>
        <datablau-button @click="handleAttachDialogClose">关闭</datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog title="新建资产类型" :visible.sync="dialogVisible" height="240px" size="mini">
      <datablau-form label-width="6em">
        <el-form-item label="基类型">
          <datablau-select v-model="newAsset.copyAssetId" placeholder="请选择基类型">
            <el-option v-for="asset in assets" :key="asset.id" :value="asset.id" :label="asset.name"></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="名称">
          <datablau-input v-model="newAsset.newAssetName" placeholder="请输入资产类型的名称"></datablau-input>
        </el-form-item>
      </datablau-form>
      <div slot="footer">
        <datablau-button @click="handleDialogSubmit" type="primary">确定</datablau-button>
        <datablau-button @click="handleDialogClose">关闭</datablau-button>
      </div>
    </datablau-dialog>
    <div class="com-title">
      资产类型 Asset
    </div>
    <div>资产类型，包含在域的定义中，用来扩展自定义的资产类型，可引用属性和建立关联关系。
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
<!--      <datablau-button class="com-button" @click="initCreateAsset()">新建资产类型</datablau-button>-->
    </div>
    <div class="com-table">
      <datablau-table :data="assets">
        <el-table-column label="名称" prop="name" show-overflow-tooltip :width="200"></el-table-column>
<!--        <el-table-column label="显示名" prop="displayName" show-overflow-tooltip :width="200"></el-table-column>-->
        <el-table-column prop="propertyIds" label="属性">
          <template slot-scope="scope">
            <datablau-tag
              v-for="t in scope.row.propertyIds"
              :key="t"
              style="margin-right: 5px;transform: translateY(4px);"
            >{{t.split('.').pop()}}</datablau-tag>
          </template>
        </el-table-column>
        <el-table-column :width="200" label="操作" algin="right">
          <template slot-scope="scope">
            <datablau-button @click="initCreateAsset(scope.row)" type="text">新建资产类型</datablau-button>
            <datablau-button @click="initAttachProperty(scope.row)" type="text">绑定属性</datablau-button>
          </template>
        </el-table-column>
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
      domains: [],
      assets: null,
      currentDomain: null,
      newAsset: {
        copyAssetId: '',
        newAssetName: '',
      },
      attachObject: {
        assetId: '',
        selection: [],
      },
      dialogVisible: false,
      attachDialogVisible: false,
      properties: null,
    }
  },
  methods: {
    clearForm() {
      for (let newPropertyKey in this.newAsset) {
        this.newAsset[newPropertyKey] = ''
      }
    },
    propertyIdsFormatter(row) {
      if (row.propertyIds) {
        return row.propertyIds.map(i => {
          return i.split('.').pop()
        }).join(',')
      }
    },
    initCreateAsset(asset) {
      this.newAsset.copyAssetId = asset.id
      this.dialogVisible = true
    },
    initAttachProperty(asset) {
      this.attachObject.assetId = asset.id
      this.attachDialogVisible = true
    },
    handleAttachDialogSubmit() {
      this.attachProperties().then(_ => {
        this.handleAttachDialogClose()
        setTimeout(() => {
          this.loadModel(true)
        }, 1000)
      })
    },
    handleAttachDialogClose() {
      this.attachDialogVisible = false
    },
    async attachProperties() {
      const assetId = this.attachObject.assetId;
      const properties = this.attachObject.selection;
      await this.$http.post(`/metamodel/attachProperties?${Context.ns}=${Context.namespace}&assetId=${assetId}`, properties).then(res => {
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    handleDialogSubmit() {
      this.createAsset().then(_ => {
        this.handleDialogClose()
        this.clearForm()
        setTimeout(() => {
          this.loadModel(true)
        }, 1000)
        this.loadModel()
      })
    },
    handleDialogClose() {
      this.dialogVisible = false;
    },
    async createAsset() {
      let copyAssetId = this.newAsset.copyAssetId;
      let newAssetName = this.newAsset.newAssetName;
      await this.$http.post(`/metamodel/createAsset?${Context.ns}=${Context.namespace}&${Context.db}=${Context.testDomain}&copyAssetId=${copyAssetId}&newAssetName=${newAssetName}`).then(res => {
        console.log(res.data)
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    loadModel(forceUpdate) {
      this.$parent.loadModel(this.currentDomain, forceUpdate).then(_ => {
        const modelByDomain = this.$parent.modelByDomain[this.currentDomain]
        this.assets = modelByDomain.assets
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
    handleSelectionChange(selection) {
      this.attachObject.selection = selection.map(i => i.id)
    },
  },
}
</script>
<style lang="css">
@import "../../assets/base.css";
</style>
