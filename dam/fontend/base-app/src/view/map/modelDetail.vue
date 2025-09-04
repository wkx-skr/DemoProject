<template>
  <div class="map-detail">
    <div class="map-title oneline-eclipse">
      {{ data.cat }} ({{
        $modelCategoriesDetailsMap[data.catId].categoryAbbreviation
      }})
    </div>
    <div class="map-vice-title oneline-eclipse">
      <span class="fa fa-database"></span>
      {{ data.model }}
    </div>
    <div class="list-box" style="top: 100px">
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane
          :label="$t('meta.map.basicInfo')"
          name="basic"
        ></el-tab-pane>
        <el-tab-pane :label="$t('meta.map.table')" name="table"></el-tab-pane>
      </el-tabs>
      <span class="inner-search-box" v-if="activeName === 'table'">
        <input
          type="text"
          :placeholder="$t('meta.map.searchTableInModel')"
          v-model="keyword"
          @keydown.enter="search"
        />
        <span
          style="float: right; color: #fff; margin-right: 5px; cursor: pointer"
          @click="search"
        >
          <i class="el-icon-search"></i>
        </span>
      </span>
      <div class="list-content">
        <auto-table
          key="table"
          v-if="activeName === 'table'"
          :data="tableData"
          :table-prop="tableProp"
          :show-header="true"
          @row-click="handleRowClick"
        ></auto-table>
        <auto-table
          key="basic"
          v-else-if="activeName === 'basic'"
          :data="basicData"
          :show-header="false"
          :tableProp="[
            { width: 10 },
            { prop: 'label', className: 'labelColumn', width: 150 },
            { prop: 'value' },
          ]"
        ></auto-table>
      </div>
    </div>
  </div>
</template>
<script>
import autoTable from './autoTable.vue'
export default {
  props: ['data'],
  components: { autoTable },
  mounted() {
    this.getModelPlain()
  },
  beforeDestroy() {},
  data() {
    return {
      childrenModelIds: null,
      activeName: 'basic',
      tableData: [],
      tableProp: [],
      keyword: '',
      basicData: [
        /* {
          label:'用途',value:'开发环境'
        },{
          label:'部署地',value:'研发中心'
        },{
          label:'版本',value:'Oracle11g'
        },{
          label:'IP地址',value:'10.12.11.234'
        },{
          label:'负责人',value:'李一'
        },{
          label:'Schema',value:'namespace'
        },{
          label:'状态',value:'在用'
        },{
          label:'备注',value:''
        } */
        /* {
            label:'用途',value:''
          },{
            label:'部署地',value:''
          },{
            label:'版本',value:''
          },{
            label:'IP地址',value:''
          },{
            label:'负责人',value:''
          },{
            label:'Schema',value:''
          },{
            label:'状态',value:''
          },{
            label:'备注',value:''
          } */
      ],
    }
  },
  watch: {
    keyword(newVal, oldVal) {
      if (oldVal && !newVal) {
        this.getTableData()
      }
    },
  },
  methods: {
    handleClick() {},
    getModelPlain() {
      const modelId = this.data.logicalModelId
      const url = this.$meta_url + `/models/${modelId}/plain`
      this.$http
        .get(url)
        .then(res => {
          this.childrenModelIds = res.data.childrenModelIds
          /* if (this.$customerId === 'gszc') {
            this.basicData.push({
              value: res.data.connectionInfo.parameterMap.Zone,
              label: '用途',
            })
            this.basicData.push({
              value: res.data.connectionInfo.parameterMap.Deploy,
              label: '部署地',
            })
          } */
          /* this.basicData.push({
            value: res.data.connectionInfo.parameterMap.DBVersion,
            label: '版本',
          }) */
          this.basicData.push({
            value: res.data.reverseOptions.HostServer,
            label: $t('meta.map.IP'),
          })
          this.basicData.push({
            value: res.data.owner,
            label: $t('meta.map.owner'),
          })
          this.basicData.push({
            value:
              res.data.reverseOptions.SELECT_SCHEMA ||
              res.data.reverseOptions.DATABASE_NAME,
            label: 'Schema',
          })
          /* if (this.$customerId === 'gszc') {
            this.basicData.push({
              value: res.data.connectionInfo.parameterMap.State,
              label: '状态',
            })
            this.basicData.push({
              value: res.data.connectionInfo.parameterMap.Description,
              label: '备注',
            })
          } */
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleTabClick() {
      switch (this.activeName) {
        case 'basic':
          break
        case 'table':
          this.getTableData()
          break
      }
    },
    search() {
      this.getTableData()
    },
    getTableData() {
      if (!this.data.logicalModelId) {
        this.$message.warning(this.$t('meta.map.programError'))
      }
      this.$http
        .post(`${this.$meta_url}/entities/searchMetadata`, {
          currentPage: 1,
          keyword: this.keyword,
          modelIds: this.childrenModelIds ? this.childrenModelIds : null,
          pageSize: 500,
          types: ['TABLE'],
        })
        .then(res => {
          res.data.content.forEach(item => {
            if (item.name === item.physicalName) {
              item.name = ''
            }
          })
          this.tableData = res.data.content
          this.tableProp = [
            {
              width: 10,
            },
            {
              prop: 'physicalName',
              label: this.$t('meta.map.enName'),
            },
            {
              prop: 'name',
              label: this.$t('meta.map.chName'),
            },
            {
              prop: 'definition',
              label: this.$t('meta.map.desc'),
            },
          ]
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleRowClick(row) {
      this.$emit('row-click', row)
    },
  },
}
</script>
