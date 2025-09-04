<template>
    <div class="viewBox">
      <div class="viewContent">
        <div class="top">
          <div class="detailName">基本信息</div>
          <div><span>模型存储：</span>{{detail.modelDir}}</div>
          <div class="flex">
            <div><span>实体中名称：</span>{{detail.entityChName}}</div>
            <div><span>实体名称：</span>{{detail.entityName}}</div>
          </div>
          <div class="flex">
            <div><span>SQL文件名称：</span>{{detail.sqlName}}</div>
            <div><span>SQL目录：</span>{{detail.codeName}}/{{detail.sqlName}}</div>
          </div>
          <div class="description flex"><span>建模分析说明：</span> {{detail.comments}} </div>

          <datablau-tabs v-model="activeName" @tab-click="handleClick" :themeBlack="true">
            <!--        <el-tab-pane label="基本信息" name="first"></el-tab-pane>-->
            <el-tab-pane label="建模" name="second"></el-tab-pane>
            <el-tab-pane label="预览" name="third"></el-tab-pane>
<!--            <el-tab-pane label="历史" name="fourth"></el-tab-pane>-->
          </datablau-tabs>
          <div class="tabContent">
            <div v-if="activeName === 'second'" class="secondBox">
              <datablau-table
                :data="JSON.parse(detail.content)"
                row-key="id"
                :element-loading-background="'rgba(0,0,0,0.6)'"
                height="100%"
                :themeBlack="true"
              >
                <el-table-column label="数据集" prop="name"></el-table-column>
                <el-table-column label="类型" prop="type"></el-table-column>
                <el-table-column label="取数逻辑" prop="accessLogic"></el-table-column>
                <el-table-column label="数据来源" prop="sourceData"></el-table-column>
                <el-table-column label="字段来源" prop="fieldSsource"></el-table-column>
                <el-table-column label="计算公式" prop="formula"></el-table-column>
              </datablau-table>
            </div>
            <div v-if="activeName === 'third'" class="thirdBox">
              <monaco
                ref="editor"
                :opts="monacoOpts"
                :isDiff="false"
                class="monacoBox"
              ></monaco>
              <datablau-button :themeBlack="true" style="width:64px;margin-bottom: 10px" @click="carryOut" type="secondary">执行</datablau-button>
              <div style="height:50%;padding-bottom:10px">
                <datablau-table  :data="thirdData"
                                 height="100%"
                                 v-show="dataExplorationColumn && dataExplorationColumn.length">
                  <el-table-column
                    v-for="item in dataExplorationColumn"
                    :label="item"
                    :key="item"
                    :prop="item"
                    :formatter="jsonFormatter"
                    :min-width="120"
                    show-overflow-tooltip
                  >
                    <div slot="header">
                      <datablau-tooltip
                        :content="item"
                        placement="top-start"
                      >
                                <span class="show-tooltip-header">
                                    {{ item }}
                                </span>
                      </datablau-tooltip>
                    </div>
                    <template slot-scope="scope">
                      {{ scopeJsonFormatter(scope) }}
                    </template>
                  </el-table-column>
                </datablau-table>
              </div>
            </div>
            <!--<div v-if="activeName === 'fourth'">
              <datablau-table
                :data="fourthData"
                row-key="id"
                :element-loading-background="'rgba(0,0,0,0.6)'"
                height="100%"
              >
                <el-table-column label="分析日期" prop="date"></el-table-column>
                <el-table-column label="实体名称" prop="name"></el-table-column>
                <el-table-column label="数据建模" prop="modeling"></el-table-column>
                <el-table-column label="SQL文件" prop="sqlFile"></el-table-column>
              </datablau-table>
            </div>-->
          </div>
        </div>
        <div class="transform-btn">
          <div class="nextStep">
            <datablau-button
            :themeBlack="true"
              type="important"
              @click="reestablish"
            >重建</datablau-button>
            <!-- <datablau-button
              @click="cancel"
            >取消</datablau-button> -->
          </div>
        </div>
      </div>

      <datablau-dialog
        title="指标"
        :visible.sync="dialogVisible"
        width="740px"
        height="500px"
        append-to-body
      >
       <div class="flexTree">
         <datablau-tree
           :props="props"
           class="grey-tree"
           lazy
           :load="loadNode"
           :data="treeData"
           :data-icon-function="dataIconFunction"
           @node-click="handleNodeClick"
         >
         </datablau-tree>
       </div>
        <div slot="footer">
          <datablau-button type="important" @click="addNewFile" :disabled="!Object.keys(indexId).length">
            确定
          </datablau-button>
          <datablau-button @click="cancelLog">
            取消
          </datablau-button>
        </div>
      </datablau-dialog>
    </div>
</template>

<script>
import monaco from './monaco.vue'
import HTTP from '@/dataWarehouse/resource/http'
import { Base64 } from 'js-base64'
export default {
  components: { monaco },
  props: {
    detail: {
      type: Object,
      default: () => {
        return {
        }
      }
    }
  },
  data () {
    return {
      activeName: 'second',
      fourthData: [
        { date: '2023-09-10 21:23:20', name: 'ABCD', modeling: '数据模型/DM/财务数据模型', sqlFile: '程序开发/自动建模/ABCD.SQL' },
        { date: '2023-09-10 20:23:20', name: 'EFGH', modeling: '数据模型/DM/财务数据模型', sqlFile: '程序开发/自动建模/EFGH.SQL' },
        { date: '2023-09-10 12:23:20', name: 'ERFG', modeling: '数据模型/DM/财务数据模型', sqlFile: '程序开发/自动建模/ERFG.SQL' }
      ],
      thirdData: [],
      dataExplorationColumn: [],
      // 指标树
      dialogVisible: false,
      props: {
        label: 'name',
        children: 'nodes',
        isLeaf: (data, node) => {
          if (data.pageWithInfo) {
            return true
          }
          return false
        }
      },
      treeData: [],
      indexId: {}

    }
  },
  computed: {
    monacoOpts () {
      return {
        value: this.detail.sql,
        origin: '',
        readOnly: true,
        theme: 'vs-dark'
      }
    }
  },
  mounted () {
  },
  methods: {
    handleClick () {},
    reestablish () {
      this.$emit('reestablish')
    },
    scopeJsonFormatter (scope) {
      let cellValue = scope.row[scope?.column?.property] || ''
      return this.jsonFormatter(scope.row, scope.column, cellValue)
    },
    jsonFormatter (row, column, cellValue, index) {
      if (!cellValue) {
        return cellValue
      }
      let jsonData = null
      try {
        let jsonData2 = jsonData
        // json 字符串转义
        jsonData2 = JSON.parse(cellValue)
        jsonData2 = JSON.stringify(jsonData2)
        jsonData = jsonData2
      } catch (e) {
      }
      return jsonData || cellValue
    },
    cancel () {
      this.$emit('closeCreate')
    },
    carryOut () {
      // this.dataPreviewView = true
      this.thirdData = []
      this.dataExplorationColumn = []
      let sql = this.detail.sql
      let url = `${HTTP.$dddServerUrl}sqls/runSql`
      this.$http.post(url, {
        // timeout: 30000,
        datasourceId: this.detail.sourceId,
        timeout: 1800,
        maxLine: 10,
        sql: Base64.encode(sql),
        uuid: new Date().getTime() + Number.parseInt(Math.random() * 1000),
        properties: [],
        funNames: []
      })
        .then(res => {
          if (res.data.code !== 200) {
            this.$datablauMessage.warning(res.data.msg)
            return
          }
          if (res.data.data) {
            let resData = res.data.data[0][0]
            this.dataExplorationColumn = resData.header
            let lastData = []
            resData.data.forEach((item) => {
              let obj = {}
              item.forEach((v, j) => {
                obj[this.dataExplorationColumn[j]] = v
              })
              lastData.push(obj)
            })
            // this.dataExplorationColumn = Object.keys(res.data.data[0][0])
            this.thirdData = lastData
          }
        })
        .catch(e => {
          this.$showFailure(e)
          this.loading = false
        })
    },

    // 指标树
    getIndex () {
      this.getTreeData()
      this.dialogVisible = true
    },

    addNewFile () {
      if (!this.indexId.tableId) return
      this.$http.get(HTTP.$damServerUrl + `entities/${this.indexId.tableId}/summary`)
        .then(res => {
          Object.assign(this.indexId, { origin: res.data.modelName + '.' + res.data.schemaName + '.' + res.data.physicalName })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    cancelLog () {
      this.dialogVisible = false
    },
    getTreeData () {
      this.$http.post(this.$domains + 'domains/tree/getTree', {
        categoryId: 5, // 原子和衍生指标
        onlyFolder: true,
        state: ''
      })
        .then(res => {
          this.treeData = res.data.nodes
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    async loadNode (node, resolve) {
      let data = node.data
      let obj = this.findData(this.treeData, data.foldId)
      let res = await this.getContent(data.foldId)
      let contentData = []
      if (res && res.data) {
        contentData = res.data.map(item => {
          return {
            ...item,
            pageWithInfo: true
          }
        })
      }
      if (obj && Object.keys(obj).length) {
        resolve([...obj, ...contentData])
      } else {
        resolve(contentData)
      }
    },
    getContent (folderId) {
      return folderId && this.$http.post(this.$domains + 'domains/domain/getPage', {
        categoryId: 5, // 原子和衍生指标
        ascOrder: [false],
        // currentPage: 1,
        domainState: null,
        firstPublishEnd: null,
        firstPublishStart: null,
        folderId,
        keyword: '',
        metricsType: null,
        orderColumn: ['domainCode'],
        // pageSize: 20,
        submitter: ''
      })
    },
    findData (treeData, id) {
      let obj = {}
      treeData.forEach(item => {
        if (item.foldId === id) {
          obj = item.nodes
        }
        if (item.nodes && item.nodes.length) {
          this.findData(item.nodes, id)
        }
      })
      return obj
    },
    dataIconFunction (data) {
      if (data.pageWithInfo) {
        return 'iconfont icon-zhibiao'
      } else {
        return 'iconfont icon-file'
      }
    },
    handleNodeClick (data) {
      if (data.pageWithInfo) {
        this.indexId = data
      } else {
        this.indexId = {}
      }
    }
  }
}
</script>
<style>
</style>
<style lang="scss" scoped>
  .secondBox{
    position: absolute;
    bottom: 0;
    top: 200px;
    left: 0;
    right: 0;
    overflow: auto;
  }
  .viewBox{
    padding: 0 20px;
  }
  .firstTab{
    font-size: 14px;
    div{
      margin-bottom: 10px;
    }
  }
  .thirdBox{
    display: flex;
    flex-direction: column;;
    position: absolute;
    bottom: 30px;
    /*top: 46px;*/
    top: 202px;
    left: 20px;
    right: 20px;
  }
  .monacoBox{
    width: 100%;
    height: 50%;
    margin-bottom: 10px;
  }
  .tableData{
    height: 50%;
  }

  .detailName{
    font-size: 16px;
    padding-top: 10px;
    margin-bottom: 10px;
    color: #bbbbbb;
  }
  .flex{
    display: flex;
    div{
      width: 50%;
      margin-top: 10px;
      margin-right: 20px;
    }
    span{
      display: inline-block;
      width: 90px;
    }
  }
  .description{
    margin: 10px 0;
  }
  .transform-btn{
    position: absolute;
    bottom: 0px;
    left: 0px;
    height: 50px;
    right: 0;
    box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
    padding: 8px 20px;
  }
  .viewContent{
    display: flex;
    flex-direction: column;
    .top{
      position: absolute;
      bottom: 50px;
      top: 0;
      left: 20px;
      right: 20px;
      color: #bbbbbb;
    }
  }
</style>
<style>
  .grey-tree.datablau-tree .iconfont.icon-zhibiao{
    /*color: #d1af3e !important;*/
  }
</style>
