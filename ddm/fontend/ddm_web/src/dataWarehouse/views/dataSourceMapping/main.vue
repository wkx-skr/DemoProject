<template>
  <div>
    <div class="btn">
      <datablau-button class="add iconfont icon-tianjia" @click="create" type="important">创建映射</datablau-button>
    </div>
    <datablau-table :data="mapingList" class="tableBox">
      <!--<el-table-column
        label="dam数据源id"
        prop="user"
      >
      </el-table-column>-->
      <el-table-column
        label="dam数据源名称"
        prop="damDsName"
      >
      </el-table-column>
      <el-table-column
        label="ds数据源名称"
        prop="dsDsName"
      >
      </el-table-column>
      <el-table-column
        label="环境"
        prop="env"
      >
      </el-table-column>
      <el-table-column
        label="类型"
        prop="type"
      >
      </el-table-column>
      <el-table-column
        label="操作"
      >
        <template scope="{row}">
          <datablau-button class="iconfont icon-bianji" @click="updateList(row)" type="icon"></datablau-button>
          <datablau-button class="iconfont icon-delete" @click="delectList(row)" type="icon"></datablau-button>
        </template>
      </el-table-column>
    </datablau-table>
    <datablau-dialog
      :title="update ? '修改映射关系' : '添加映射关系'"
      :visible.sync="mapingShow"
      :modal-append-to-body="true"
      size="s"
    >
      <datablau-form
        :rules="rules"
        :model="request"
        ref="form"
        size="small"
        label-width="75px"
      >
        <el-form-item
          label="数据源类型"
          prop="type"
        >
          <datablau-select
            v-model="request.type"
            style="width: 100%"
            placeholder="请选择"
            :disabled="update"
            @change="typeChange"
          >
            <el-option
              v-for="(key) in dsTypeList"
              :key="key.value"
              :label="key.label"
              :value="key.value"
            >
            </el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item
          label="dam数据源"
          prop="damDsId"
        >
          <datablau-select
            v-model="request.damDsId"
            :disabled="update"
            style="width: 100%"
            placeholder="请选择dam数据源"
          >
            <el-option
              v-for="(key) in damSelectList"
              :key="key.modelId"
              :label="key.definition"
              :value="key.modelId +'/'+ key.definition"
            >
            </el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item
          label="ds数据源"
          prop="dsDsId"
        >
          <datablau-select
            v-model="request.dsDsId"
            style="width: 100%"
            placeholder="请选择ds数据源"
          >
            <el-option
              v-for="(key) in dsSelectList"
              :key="key.id"
              :label="key.name"
              :value="key.id +'/'+ key.name"
            >
            </el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item
          label="环境"
          prop="user"
        >
          <datablau-input
            style="width: 100%"
            placeholder="请输入环境名称"
            v-model="request.env"
          ></datablau-input>
        </el-form-item>
      </datablau-form>
      <span slot="footer">
        <datablau-button @click="close" type="secondary">取 消</datablau-button>
        <datablau-button type="primary" @click="createMap">
          保 存
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import HTTP from '@/dataWarehouse/resource/http'

export default {
  data () {
    return {
      mapingList: [],
      mapingShow: false,
      update: false,
      request: {
      },
      rules: {},
      dsTypeList: [
        { value: 'MYSQL', label: 'MYSQL' },
        { value: 'POSTGRESQL', label: 'POSTGRESQL' },
        { value: 'HIVE', label: 'HIVE' },
        { value: 'CLICKHOUSE', label: 'CLICKHOUSE' },
        { value: 'SQLSERVER', label: 'SQLSERVER' }
      ],
      damAllList: [],
      damSelectList: [],
      dsSelectList: []
    }
  },
  methods: {
    create () {
      this.mapingShow = true
      this.update = false
    },
    createMap () {
      this.submitEnv(this.update ? 'update' : 'create')
    },
    submitEnv (val) {
      let params = {
        damDsId: this.request.damDsId.split('/')[0],
        damDsName: this.request.damDsId.split('/')[1],
        dsDsId: this.request.dsDsId.split('/')[0],
        dsDsName: this.request.dsDsId.split('/')[1],
        type: this.request.type,
        env: this.request.env
      }
      this.$http.post(`${HTTP.$dddServerUrl}datasource/operate/${val}`, params)
        .then(res => {
          this.$datablauMessage.success('映射成功')
          this.close()
          this.getDatasourceType()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    close () {
      this.mapingShow = false
      this.request = {}
      this.damSelectList = []
      this.dsSelectList = []
    },
    getDatasourceType () {
      HTTP.getDatasourceList()
        .then(res => {
          this.mapingList = res
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 编辑
    updateList (row) {
      this.typeChange(row.type)
      this.update = true
      this.mapingShow = true
      this.request = {
        damDsId: row.damDsId + '/' + row.damDsName,
        damDsName: row.damDsName,
        dsDsId: row.dsDsId + '/' + row.dsDsName,
        dsDsName: row.dsDsName,
        type: row.type,
        env: row.env
      }
    },
    // 删除
    delectList (row) {
      this.$DatablauCofirm(`确定要删除该条映射关系吗？`).then(() => {
        HTTP.delDatasource(row.damDsId)
          .then(res => {
            this.$datablauMessage.success('删除成功')
            this.getDatasourceType()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
        .catch(() => {})
    },
    typeChange (val) {
      this.damSelectList = this.damAllList.filter(item => item.type === val)
      HTTP.getDsDatasourceList(val)
        .then(res => {
          this.dsSelectList = res
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDamDatasourceList () {
      HTTP.getDamDatasourceList()
        .then(res => {
          this.damAllList = res
        })
        .catch(e => {
          this.$showFailure(e)
        })
    }
  },
  mounted () {
    this.getDatasourceType()
    this.getDamDatasourceList()
  }
}
</script>

<style scoped lang='scss'>
.add{
  float: right;
  cursor: pointer;
}
.btn{
  height: 32px;
}
</style>
