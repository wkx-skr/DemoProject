<template>
  <div>
    <datablau-dialog title="新建域" :visible.sync="dialogVisible" height="240px" size="mini">
      <datablau-form label-width="6em">
        <el-form-item label="命名空间">{{Context.namespace}}</el-form-item>
        <el-form-item label="名称">
          <datablau-input v-model="newDomainName" placeholder="请输入域的名称"></datablau-input>
        </el-form-item>
      </datablau-form>
      <div slot="footer">
        <datablau-button @click="handleDialogSubmit" type="primary">确定</datablau-button>
        <datablau-button @click="handleDialogClose">关闭</datablau-button>
      </div>
    </datablau-dialog>
    <div class="com-title">
      域 Domain
    </div>
    <div>域，是命名空间之下的分区概念。域的定义中包含资产属性、资产类型、资产关系等信息。域本身也是一个对象，拥有属性和与其他域的关系。
      <datablau-button class="com-button" @click="initCreateDomain">新建域</datablau-button>
    </div>
    <div class="com-table">
      <datablau-table :data="domains">
        <el-table-column label="命名空间" :width="150">
          <template slot-scope="scope">
            <span>com.datablau</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" show-overflow-tooltip :width="200"></el-table-column>
        <el-table-column prop="propertyIds" label="属性">
          <template slot-scope="scope">
            <datablau-tag
              v-for="t in scope.row.propertyIds"
              :key="t"
              style="margin-right: 5px;transform: translateY(4px);"
            >{{t.split('.').pop()}}</datablau-tag>
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
  components: {

  },
  data() {
    return {
      Context: Context,
      domains: null,
      newDomainName: '',
      dialogVisible: false,
    }
  },
  methods: {
    propertyIdsFormatter(row) {
      if (row.propertyIds) {
        return row.propertyIds.map(i => {
          return i.split('.').pop()
        }).join(',')
      }
    },
    initCreateDomain() {
      this.dialogVisible = true
    },
    handleDialogSubmit() {
      this.createDomain().then(_ => {
        this.handleDialogClose()
        this.listDomains(true)
      })
    },
    handleDialogClose() {
      this.dialogVisible = false;
    },
    listDomains(forceUpdate) {
      this.$parent.listDomains(forceUpdate).then(_ => {
        this.domains = this.$parent.domains;
      })
    },
    async createDomain() {
      const newDomain = this.newDomainName;
      await this.$http.post(`/metamodel/createDomain?${Context.ns}=${Context.namespace}&newDomain=${newDomain}`).then(res => {
        console.log(res.data)
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
