<template>
  <div>
    <datablau-dialog title="新建关系" :visible.sync="dialogVisible" height="400px" size="mini">
      <datablau-form label-width="9em">
        <el-form-item label="名称">
          <datablau-input v-model="newRelationship.name" placeholder="请输入关系的名称"></datablau-input>
        </el-form-item>
        <el-form-item label="源资产类型">
          <datablau-select v-model="newRelationship.sourceId" placeholder="请选择资产类型">
            <el-option v-for="asset in assets" :key="asset.id" :value="asset.id" :label="asset.name"></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="目标资产类型">
          <datablau-select v-model="newRelationship.targetId" placeholder="请选择资产类型">
            <el-option v-for="asset in assets" :key="asset.id" :value="asset.id" :label="asset.name"></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="正向关系">
          <datablau-input
            v-model="newRelationship.forwardName"
            placeholder="请输入正向关系"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="逆向关系">
          <datablau-input
            v-model="newRelationship.backwardName"
            placeholder="请输入逆向关系"
          ></datablau-input>
        </el-form-item>
      </datablau-form>
      <div slot="footer">
        <datablau-button @click="handleDialogSubmit" type="primary">确定</datablau-button>
        <datablau-button @click="handleDialogClose">关闭</datablau-button>
      </div>
    </datablau-dialog>
    <div class="com-title">
      关系 Relationship
    </div>
    <div>资产类型之间的一对一关系，包含在域的定义中。
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
      <datablau-button class="com-button" @click="initCreateRelationship">新建关系</datablau-button>
    </div>
    <div class="com-table">
      <datablau-table :data="relationships">
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column prop="sourceId" :formatter="assetFormatter" label="源资产类型"></el-table-column>
        <el-table-column prop="targetId" :formatter="assetFormatter" label="目标资产类型"></el-table-column>
        <el-table-column prop="forwardName" label="正向关系"></el-table-column>
        <el-table-column prop="backwardName" label="逆向关系"></el-table-column>
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
      assets: null,
      relationships: null,
      currentDomain: null,
      newRelationship: {
        name: '',
        sourceId: '',
        targetId: '',
        forwardName: '',
        backwardName: '',
      },
      dialogVisible: false,
    }
  },
  methods: {
    clearForm() {
      for (let newPropertyKey in this.newProperty) {
        this.newRelationship[newPropertyKey] = ''
      }
    },
    assetFormatter(row, col) {
      return row[col.property].split('.').pop()
    },
    initCreateRelationship() {
      this.dialogVisible = true
    },
    handleDialogSubmit() {
      this.createRelationship().then(_ => {
        this.handleDialogClose()
        this.clearForm()
        this.loadModel(true)
      })
    },
    handleDialogClose() {
      this.dialogVisible = false;
    },
    async createRelationship() {
      const sourceAssetId = this.newRelationship.sourceId;
      const targetAssetId = this.newRelationship.targetId;
      const name = this.newRelationship.name;
      const forwardName = this.newRelationship.forwardName;
      const backwardName = this.newRelationship.backwardName;
      await this.$http.post(`/metamodel/createRelationship?sourceAssetId=${sourceAssetId}&targetAssetId=${targetAssetId}&name=${name}&forwardName=${forwardName}&backwardName=${backwardName}&${Context.ns}=${Context.namespace}`).then(res => {
        console.log(res.data)
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    loadModel(forceUpdate) {
      this.$parent.loadModel(this.currentDomain, forceUpdate).then(_ => {
        const modelByDomain = this.$parent.modelByDomain[this.currentDomain]
        this.assets = modelByDomain.assets
        this.relationships = modelByDomain.relationships
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
