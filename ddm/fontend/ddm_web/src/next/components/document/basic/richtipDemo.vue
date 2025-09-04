<template>
  <div>
    <h1>Link 弹出框及链接</h1>
    <h3>说明</h3>
    本组件正在开发阶段，目前支持下列类型
    <br />
    LDMTypes.CODE(标准代码)提供tooltip及跳转功能,需要传入data-id(标准代码编号),categoryId(默认为1，可不传)
    <br />
    LDMTypes.Domain(数据标准)提供跳转功能，需要传入data-object(数据标准对象结构体)
    <br />
    其他数据类型敬请期待，欢迎提出合理化建议。
    <h3>示例1- 标准代码</h3>
    <div class="component-box" style="padding: 20px; height: auto; width: 100%">
      <!--      <el-card class="box-card">
        <datablau-richtip type="daima" id="qqy0016"></datablau-richtip>
      </el-card>-->
      <el-card class="box-card">
        <datablau-table ref="rightTable" :data="tableData">
          <el-table-column label="中文名称" prop="name"></el-table-column>
          <el-table-column label="代码编号" prop="code">
            <template slot-scope="scope">
              <datablau-link
                :data-type="LDMTypes.CODE"
                :data-id="scope.row.code"
                :label="scope.row.code"
              ></datablau-link>
            </template>
          </el-table-column>
        </datablau-table>
      </el-card>
    </div>
    <!--    <h3>代码</h3>-->
    <div class="pre">
      <pre><code>{{ code }}</code></pre>
    </div>
    <h3>示例2- 数据标准</h3>
    <div class="component-box" style="padding: 20px; height: auto; width: 100%">
      <el-card class="box-card" style="width: 700px">
        <datablau-table :data="domainTableData">
          <el-table-column label="路径" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.pathStr }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            label="中文名称"
            prop="chineseName"
          >
            <template slot-scope="scope">
              <datablau-link
                :data-type="LDMTypes.Domain"
                :label="scope.row.chineseName"
                :data-object="scope.row"
              ></datablau-link>
            </template>
          </el-table-column>
          <!--<el-table-column
            show-overflow-tooltip
            label="英文名称"
            prop="englishName"
          ></el-table-column>-->
        </datablau-table>
      </el-card>
    </div>
    <div class="pre">
      <pre><code>{{ code1 }}</code></pre>
    </div>
    <h3>示例3- 业务系统 -来自列表</h3>
    <div class="component-box" style="padding: 20px; height: auto; width: 100%">
      <el-card class="box-card">
        <datablau-table :data="$modelCategories.slice(0,3)">
          <el-table-column
            label="名称"
            prop="categoryName"
          >
            <template slot-scope="scope">
              <datablau-link
                :data-type="LDMTypes.ModelMart"
                :data-id="scope.row.categoryId"
                :label="scope.row.categoryName"
              ></datablau-link>
            </template>
          </el-table-column>
          <!--<el-table-column
            label="缩写"
            prop="categoryAbbreviation"
          ></el-table-column>-->
        </datablau-table>
      </el-card>
    </div>

    <h2>接口</h2>
    <p>
      组件配置到 src/next/components/basic/richtip/components/components.js 中
      注意组件名使用 LDMTypes中的名称
    </p>
    <h3>标签名称</h3>
    datablau-link
    <h3>属性</h3>
    <el-table
      style="width: 1000px"
      class="datablau-table"
      :data="[
        {
          name: 'dataType',
          explain: '应用类型，可直接用于icon展示。请使用LDMTypes',
          type: 'Number',
          candidate: '',
          isRequired: '是',
          default: '',
        },
        {
          name: 'dataId',
          explain: '唯一标识，用于获取数据',
          type: 'Number || String，根据需要自行配置',
          candidate: '',
          isRequired: '否',
          default: '',
        },
        {
          name: 'dataObject',
          explain: '数据结构体，则组件内不需要根据id重复获取数据',
          type: 'Object',
          candidate: '',
          isRequired: '否',
          default: '',
        },
        {
          name: 'categoryId',
          explain: '目录id,标准代码选填',
          type: 'String || Number',
          candidate: '',
          isRequired: '否',
          default: '1',
        },
        {
          name: 'label',
          explain: '显示的文本',
          type: 'String',
          isRequired: '是',
        },
        {
          name: 'placement',
          explain: '弹窗出现位置',
          type: 'String',
          candidate: '',
          isRequired: '否',
          default: 'right',
        },
      ]"
    >
      <el-table-column label="属性名称" prop="name"></el-table-column>
      <el-table-column
        label="说明"
        width="240"
        prop="explain"
      ></el-table-column>
      <el-table-column label="属性类型" prop="type"></el-table-column>
      <el-table-column label="可选值" prop="candidate"></el-table-column>
      <el-table-column label="必填" prop="isRequired"></el-table-column>
      <el-table-column label="默认值" prop="default"></el-table-column>
    </el-table>
  </div>
</template>
<script>
  import HTTP from '@/resource/http.js'
import LDMTypes from '@constant/LDMTypes'
export default {
  data() {
    return {
      LDMTypes: LDMTypes,
      code: `
        <datablau-link
          :data-type="LDMTypes.CODE"
          :data-id="scope.row.code"
          :label="scope.row.code"
        ></datablau-link>`,
      code1: `
        <datablau-link
          :data-type="LDMTypes.Domain"
          :label="scope.row.chineseName"
          :data-object="scope.row"
        ></datablau-link>`,
      tableData: [],
      tableLoading: false,
      domainTableData: [],
      domainTableLoading: false,
    }
  },
  watch: {},
  created() {
    this.getTableData()
    this.getDomainTableData()
  },
  methods: {
    getTableData() {
      this.tableLoading = true
      const obj = {
        currentPage: 1,
        pageSize: 10,
        name: '',
        state: 'A',
        datasetName: '',
      }
      HTTP.getCodeListService(obj)
        .then(res => {
          this.tableLoading = false
          this.tableData = res.data.data
          this.total = res.data.total
          setTimeout(() => {
            this.tableHeight = document.documentElement.clientHeight - 190
          })
          setTimeout(() => {
            $('#selectDomainCodeTable table th .el-checkbox').css({
              display: 'none',
            })
          }, 10)
        })
        .catch(e => {
          this.tableLoading = false
          this.$showFailure(e)
        })
    },
    getDomainTableData() {
      this.domainTableLoading = false
      const obj = {
        domainCode: '',
        chineseName: '',
        domainState: null,
        folderId: 1,
        submitter: '',
        firstPublishStart: null,
        firstPublishEnd: null,
        descriptionDepartment: '',
        orderColumn: ['lastModification'],
        ascOrder: [false],
        currentPage: 1,
        pageSize: 2,
        categoryId: 1,
        tagIds: null,
      }

      this.tableLoading = true
      HTTP.getFolderListService(obj).then(res => {
        this.domainTableData = res.data.content
        this.domainTableLoading = false
      })
    },
  },
}
</script>
<style lang="scss" scoped>
@import '../base.scss';
.box-card {
  width: 450px;
  float: left;
  margin-right: 20px;
  margin-bottom: 20px;
}
</style>
