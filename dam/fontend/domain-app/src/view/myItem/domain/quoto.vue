<template>
  <div id="dataStandard-quoto">
    <span class="info">在生产元数据中被{{ quotoNum }}个字段引用</span>
    <div class="table-container">
      <el-table
        :data="data"
        v-show="data.length > 0"
        border
        class="plain-table"
        :default-sort="{ prop: 'columnName' }"
      >
        <el-table-column type="index" label="#" width="44"></el-table-column>
        <el-table-column
          prop="columnName"
          label="字段名"
          sortable
          show-overflow-tooltip
          min-width="100"
        >
          <template slot-scope="scope">
            <a
              @click="
                onColumnClick(scope.row.tableObjectId, scope.row.columnObjectId)
              "
              href="javascript:;"
              class="blue"
            >
              {{ scope.row.columnName }}
            </a>
          </template>
        </el-table-column>
        <el-table-column
          label="所在表"
          sortable
          show-overflow-tooltip
          min-width="100"
        >
          <template slot-scope="scope">
            <a
              @click="onTableClick(scope.row.tableObjectId)"
              href="javascript:;"
              class="blue"
            >
              {{ scope.row.tableName }}
            </a>
          </template>
        </el-table-column>
        <el-table-column
          label="所在库"
          sortable
          show-overflow-tooltip
          min-width="100"
        >
          <template slot-scope="scope">
            <a>{{ scope.row.modelName }}</a>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="preUnbind(scope.row)">
              解绑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <span class="info">
      在模型库中被{{ ddmCnt }}个字段引用
      <span v-if="ddmCnt > 500">，以下只显示前500条字段引用</span>
    </span>
    <div class="table-container">
      <el-table
        :data="ddmData"
        v-show="ddmData.length > 0"
        border
        class="plain-table"
        :default-sort="{ prop: 'columnName' }"
      >
        <el-table-column type="index" label="#" width="44"></el-table-column>
        <el-table-column
          prop="columnName"
          show-overflow-tooltip
          label="字段名"
          sortable
          min-width="100"
        ></el-table-column>
        <el-table-column
          label="所在表"
          prop="tableName"
          sortable
          show-overflow-tooltip
          min-width="100"
        ></el-table-column>
        <el-table-column
          label="所在库"
          sortable
          min-width="150"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <a>{{ scope.row.modelPath }}/{{ scope.row.modelName }}</a>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  props: ['domainId', 'domainCode'],
  mounted() {
    setTimeout(() => {
      this.getData()
    }, 200)
  },
  beforeDestroy() {
    $(window).unbind('resize')
  },
  updated() {},
  data() {
    return {
      tableData: [],
      quotoNum: 0,
      ddmData: [],
      ddmCnt: 0,
    }
  },
  methods: {
    getDDMData() {
      this.$plainRequest
        .put(
          `${this.$url}/service/domains/ddm/usage?pageSize=500&currentPage=1`,
          this.domainCode
        )
        .then(res => {
          if (!res.data) {
            this.ddmData = []
            this.ddmCnt = 0
          } else {
            this.ddmData = res.data.items
            this.ddmCnt = res.data.totalItems
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getData() {
      if (!this.domainId) {
        return
      }
      this.$http
        .get(`/metadata/domains/${this.domainId}/usages`)
        .then(res => {
          this.tableData = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {
          this.getDDMData()
        })
    },
    preUnbind(row) {
      const objectId = row.columnObjectId
      const domainId = this.domainId
      this.$confirm('确定执行解绑操作吗？', '', {
        type: 'warning',
      })
        .then(() => {
          this.unbind(objectId, domainId)
        })
        .catch(() => {})
    },
    unbind(objectId, domainId) {
      this.$http
        .delete(`${this.$url}/service/domains/${domainId}/columns/${objectId}`)
        .then(res => {
          this.getData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    onRowClick(row) {
      this.$router.push({
        name: 'dataCatalog',
        query: { table: row.tableObjectId, column: row.columnObjectId },
      })
    },
    onTableClick(objectId) {
      this.$router.push({ name: 'dataCatalog', query: { table: objectId } })
    },
    onColumnClick(table, column) {
      this.$router.push({
        name: 'dataCatalog',
        query: { table: table, column: column },
      })
    },
  },
  computed: {
    data() {
      var result = []
      this.tableData.forEach((item, index) => {
        const row = {
          num: index,
          columnName: item.columnName,
          tableName: item.tableName,
          modelName: item.modelName,
          columnObjectId: item.columnObjectId,
          tableObjectId: item.tableObjectId,
        }
        index < 9 && (row.num = '0' + (index + 1))
        result.push(row)
      })
      this.quotoNum = result.length
      return result
    },
  },
}
</script>

<style lang="scss" scoped></style>
<style lang="scss">
$default-color: #454850;
$aux-color: #777f9e;
#dataStandard-quoto {
  .info {
    float: left;
    margin-top: 15px;
    margin-left: 20px;
    color: $aux-color;
  }
  .table-container {
    padding-top: 40px;
    // max-width: 800px;
    td {
      .cell {
        color: $default-color;
      }
    }
  }
}
</style>
