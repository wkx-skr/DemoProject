<template>
  <div class="ruleTemplate-content">
    <div class="citic-card-tabs">
      <ruleTemplate :hasAccess="hasAccess" ref="child"></ruleTemplate>
    </div>
    <div class="our-detail" v-if="showAddTab">
      <div class="model-item-page-title">
        <datablau-breadcrumb
          :node-data="nodeData"
          @back="removeTab"
          @nodeClick="nodeClick"
        ></datablau-breadcrumb>
      </div>
      <addOrEdit
        v-if="showType === 'add'"
        :hasAccess="hasAccess"
        way="add"
        :nameList="nameList"
      ></addOrEdit>
      <addOrEdit
        v-if="showType === 'edit'"
        :hasAccess="hasAccess"
        way="edit"
        :formData="formData"
        :nameList="nameList"
      ></addOrEdit>
    </div>
    <datablau-dialog
      :visible.sync="dialogVisible"
      :title="formData.templateName + $t('quality.page.ruleTemplate.scan')"
      :size="'l'"
      height="500px"
      :before-close="handleClose"
      :close-on-click-modal="true"
      append-to-body
    >
      <div class="content seeDetail">
        <el-form ref="form" :model="formData" label-width="120px">
          <el-form-item :label="$t('quality.page.ruleTemplate.templateName')">
            <p>{{ formData.templateName }}</p>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.ruleTemplate.detailRuleClass')"
          >
            <p>{{ classArr[formData.ruleClass] }}</p>
          </el-form-item>
          <el-form-item :label="$t('quality.page.ruleTemplate.databaseType')">
            <p>{{ formData.type }}</p>
          </el-form-item>
          <el-form-item :label="$t('quality.page.ruleTemplate.content')">
            <p
              style="width: 540px; white-space: pre-line"
              v-text="formData.sql"
            ></p>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer">
        <datablau-button type="secondary" @click="dialogVisible = false">
          {{ $t('quality.page.ruleTemplate.close') }}
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import HTTP from '@/http/main.js'
import ruleTemplate from './ruleTemplate.vue'
import addOrEdit from './addOrEdit.vue'
export default {
  components: {
    ruleTemplate,
    addOrEdit,
  },
  data() {
    return {
      lastTab: 'list',
      currentTab: 'list',
      showAddTab: false,
      showEditTab: false,
      showDetailTab: false,
      dataMap: {},
      hasAccess: true,
      formData: {},
      nameList: [],
      detailTabList: [],
      ruleDelete: ['formData', 'nameList'],
      // hasAccess: false,
      nodeData: [],
      showType: '',
      dialogVisible: false,
      classArr: {},
      sqlDBTypesArr: [
        { label: 'Oracle', value: 'ORACLE' },
        { label: 'SQL Server', value: 'SQLSERVER' },
        { label: 'MySQL', value: 'MYSQL' },
        { label: 'OceanBase', value: 'OCEANBASE' },
        { label: 'OceanBase-Oracle', value: 'OCEANBASEO' },
        { label: 'PostgreSQL', value: 'POSTGRESQL' },
        { label: 'Polar-DB', value: 'POLARDB' },
        { label: 'GaussDB', value: 'GAUSSDB' },
        { label: 'Greenplum', value: 'GREENPLUM' },
        { label: 'DB2', value: 'DB2' },
        { label: 'DB2 for iSeries', value: 'DB2I' },
        { label: 'GBase', value: 'GBASE' },
        { label: 'Hana', value: 'HANA' },
        // {label: 'ODPS', value:  'ODPS'},
        { label: 'MaxCompute', value: 'MAXCOMPUTE' },
        { label: 'Teradata', value: 'TERADATA' },
        { label: 'ClickHouse', value: 'CLICKHOUSE' },
        { label: 'Vertica', value: 'VERTICA' },
        { label: '自定义', value: 'CUSTOMIZED' },
      ],
    }
  },
  created() {
    this.getClassType()
  },
  mounted() {
    this.$bus.$on('addTab', nameList => {
      this.showAddTab = true
      this.showType = 'add'
      this.nameList = nameList
      this.nodeData = [
        { name: this.$t('common.page.ruleTemplate'), couldClick: false },
        {
          name: this.$t('quality.page.ruleTemplate.addTemplate'),
          couldClick: false,
        },
      ]
    })
    this.$bus.$on('addEdit', (data, nameList) => {
      this.showAddTab = true
      this.formData = data
      this.nameList = nameList
      this.showType = 'edit'
      this.nodeData = [
        { name: this.$t('common.page.ruleTemplate'), couldClick: false },
        {
          name:
            data.templateName +
            this.$t('quality.page.ruleTemplate.button.edit'),
          couldClick: false,
        },
      ]
    })
    this.$bus.$on('addDetail', data => {
      this.detailTabList.push(data.templateName)
      this.currentTab = data.templateName
      this.sqlDbTypesWithOffline.forEach(element => {
        if (element.value === data.type) {
          data.type = element.label
        }
      })
      this.formData = data
      // this.showAddTab = true
      // this.nodeData = [
      //   { name: '规则模板', couldClick: false },
      //   { name: data.templateName + '查看', couldClick: false },
      // ]
      this.dialogVisible = true
    })
    this.$bus.$on('removeTab', name => {
      if (name) {
        this.removeTab(name)
      } else {
        this.removeTab('add')
      }
    })
    this.$bus.$on('cancel', () => {
      this.removeTab(this.currentTab)
    })
  },
  beforeDestroy() {
    this.$bus.$off('addTab')
    this.$bus.$off('addEdit')
    this.$bus.$off('addDetail')
    this.$bus.$off('removeTab')
    this.$bus.$off('cancel')
    setTimeout(() => {
      this.ruleDelete.forEach(item => {
        if (typeof this[item] === 'object' && this[item]) {
          Object.keys(this[item]).forEach(o => {
            this[item][o] = null
          })
        }
        this[item] = null
      })
      if (window.CollectGarbage) {
        window.CollectGarbage()
      }
    }, 3000)
  },
  methods: {
    getClassType() {
      HTTP.getSelectionOptions({
        requestBody: {
          category: 'TR',
          names: ['规则大类'],
        },
      })
        .then(res => {
          let data = res.data
          if (!data || !Array.isArray(data)) {
            data = []
          }
          if (data.length) {
            let map = {}
            data.forEach(d => {
              map[d.id] = d.optionValue
            })
            this.classArr = map
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleClose() {
      this.dialogVisible = false
    },
    nodeClick(node) {
      if (node.level === 1) {
        this.removeTab()
      }
    },
    removeTab(tabName) {
      this.showAddTab = false
      // if (tabName === 'add') {
      //   this.currentTab = this.lastTab
      //   this.showAddTab = false
      // } else if (tabName === 'edit') {
      //   this.currentTab = this.lastTab
      //   this.showEditTab = false
      // } else {
      //   this.detailTabList = this.detailTabList.filter(e => e !== tabName)
      //   this.currentTab = this.lastTab
      // }
      this.$refs.child.initData()
    },
  },
  computed: {
    showTabs() {
      return this.showAddTab || this.showEditTab || this.detailTabList.length
    },
    sqlDbTypesWithOffline() {
      const result = _.cloneDeep(this.sqlDBTypesArr)
      result.push({
        label: '离线生产库',
        value: 'OFFLINEDUMP',
      })
      result.push({ label: '离线生产库ex', value: 'OFFLINEDUMP_RAW' })
      return result
    },
  },
}
</script>

<style scoped></style>
<style lang="scss" scoped>
.ruleTemplate-content {
  .citic-card-tabs {
    top: 0;
  }
  .our-detail {
    background: #fff;
    position: absolute;
    width: 100%;
    z-index: 12;
    top: 0;
    bottom: 0;
    .model-item-page-title {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      z-index: 9;
      height: 40px;
      margin: 0 20px;
      font-size: 16px;
      // line-height: 40px;
      padding-top: 8px;
      background: var(--default-bgc);
      border-bottom: 1px solid var(--border-color-lighter);
      // border-bottom: 1px solid red;
      button {
        margin-top: 8px;
      }
      .item-title {
        font-size: 18px;
      }
      .bottom-line {
        position: absolute;
        right: 20px;
        bottom: 0;
        left: 20px;
        display: inline-block;
        border-bottom: 1px solid #ddd;
      }
    }
  }
}
.seeDetail {
  .el-form-item {
    margin-bottom: 0;
  }
}
</style>
