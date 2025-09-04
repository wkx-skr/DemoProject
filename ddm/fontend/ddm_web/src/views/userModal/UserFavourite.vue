<template>
  <div>
    <div>
      <div class="tab-topLine">
        <p class="tab-title">我的收藏</p>
        <div class="vertical-middle top-line-inner">
          <el-radio-group
            v-model="displayType"
            size="mini"
            @change="displayTypeChange"
            style="margin-right: 10px"
          >
            <el-radio-button style="height: 30px" label="1">
              <img
                style="width: 16px; height: auto"
                :src="displayTypeImg"
                alt=""
              />
            </el-radio-button>
            <el-radio-button label="2" style="height: 30px">
              <img
                style="width: 16px; height: auto"
                :src="displayTypeImg2"
                alt=""
              />
            </el-radio-button>
          </el-radio-group>
          <el-input
            class="search-input"
            size="small"
            placeholder="输入关键字进行搜索"
            prefix-icon="el-icon-search"
            v-model="keyword"
            :clearable="true"
          ></el-input>
        </div>
      </div>
      <div class="tab-tableLine styleTable" v-if="displayType === '1'">
        <el-table
          class="el-table datablau-table"
          ref="deTable"
          :data="items"
          v-loading="tableLoading"
        >
          <el-table-column label="名称" show-overflow-tooltip>
            <template slot-scope="scope">
              <img
                class="tableIcon"
                style="width: 24px; height: auto; position: relative; top: 7px"
                v-if="scope.row.typeId === 80000004"
                src="../../assets/images/search/table.svg"
                alt=""
              />
              <img
                class="tableIcon"
                style="width: 24px; height: auto; position: relative; top: 7px"
                v-if="scope.row.typeId === 82800002"
                src="../../assets/images/search/report.svg"
                alt=""
              />
              <img
                class="tableIcon"
                style="width: 24px; height: auto; position: relative; top: 7px"
                v-if="scope.row.typeId === 80000005"
                src="../../assets/images/search/column.svg"
                alt=""
              />
              <img
                class="tableIcon"
                style="width: 24px; height: auto; position: relative; top: 7px"
                v-if="scope.row.typeId === 80010119"
                src="../../assets/images/search/function.svg"
                alt=""
              />
              <img
                class="tableIcon"
                style="width: 24px; height: auto; position: relative; top: 7px"
                v-if="scope.row.typeId === 80500008"
                src="../../assets/images/search/view.svg"
                alt=""
              />
              <img
                class="tableIcon"
                style="width: 24px; height: auto; position: relative; top: 7px"
                v-if="scope.row.typeId === 80010118"
                src="../../assets/images/search/storedProcedure.svg"
                alt=""
              />
              <span style="padding-left: 10px">{{ scope.row.objectName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="收藏时间" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ $timeFormatter(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-button type="text" size="mini" @click="jumpToDdc(scope.row)">
                查看
              </el-button>
              <el-button
                type="text"
                size="small"
                @click="deleteFavor(scope.row)"
              >
                取消收藏
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="styleBlock" v-if="displayType === '2'">
        <div
          class="styleBlock-box"
          v-for="(valueIndex, index) in items"
          :key="index"
        >
          <div class="styleBlock-boxTop" @click="jumpToDdc(valueIndex)">
            <div class="styleBlock-boxTop-title">
              <div class="titleIcon">
                <img
                  class="tableIcon-img"
                  v-if="valueIndex.typeId === 80000004"
                  src="../../assets/images/search/table.svg"
                  alt=""
                />
                <img
                  class="tableIcon-img"
                  v-if="valueIndex.typeId === 82800002"
                  src="../../assets/images/search/report.svg"
                  alt=""
                />
                <img
                  class="tableIcon-img"
                  v-if="valueIndex.typeId === 80000005"
                  src="../../assets/images/search/column.svg"
                  alt=""
                />
                <span style="padding-left: 10px">
                  {{ valueIndex.objectName }}
                </span>
              </div>
              <p>{{ $timeFormatter(valueIndex.createTime) }}</p>
            </div>
          </div>
          <div class="styleBlock-boxBottom">
            <p @click="deleteFavor(valueIndex)">取消收藏</p>
          </div>
        </div>
      </div>
      <div class="tab-bottomLine"></div>
    </div>
    <!-- <div style="position:absolute;top:20px;left:170px;bottom:20px;width:700px;">
      <ag-table-component
        ref="modelTable"
        @grid-ready="onGridReady"
        :gridOptions="gridOptions"
        :columnDefs="columnDefs"
        :rowData="items"
        :loading="tableLoading"
        :frameworkComponents="frameworkComponents"
      ></ag-table-component>
    </div>

           <el-table
              class="plain-table"
      style="max-width:600px;"
      v-if="items && false"
              :data="items"
            > -->
    <!--<el-table-column prop="typeId" :formatter="typeFormatter" label="类型" width="80"></el-table-column>-->
    <!-- <el-table-column prop="objectName" label="名称" show-overflow-tooltip>
              <template slot-scope="scope">
                <i class="fa fa-table"></i>
                <span style="margin-left:0.5em;">{{scope.row.objectName}}</span>
              </template>
            </el-table-column>
      <el-table-column label="操作" width="120">
              <template slot-scope="scope">
          <el-button type="text" size="mini" @click="jumpToDdc(scope.row)">查看</el-button>
          <el-button type="text" size="mini" @click="deleteFavor(scope.row)">取消收藏</el-button>
              </template>
            </el-table-column>
          </el-table> -->
  </div>
</template>

<script>
import agTableComponent from '@/components/common/agTableComponent'
import MyScanRenderer from './favouriteScanRenderer.js'
export default {
  components: { agTableComponent },
  data() {
    return {
      items: null,
      gridApi: null,
      columnApi: null,
      gridOptions: {
        rowSelection: false,
      },
      tableLoading: false,
      columnDefs: null,
      tableData: null,
      frameworkComponents: null,
      keyword: '',
      displayType: '1',
      displayTypeImg: require('../../../static/userCenter/list2.png'),
      displayTypeImg2: require('../../../static/userCenter/card.png'),
      tableLoading: true,
    }
  },
  beforeMount() {
    this.frameworkComponents = {
      MyScanRenderer: MyScanRenderer,
    }
    this.columnDefs = [
      {
        headerName: '名称',
        field: 'objectName',
        sortable: true,
        filter: true,
        tooltipField: 'objectName',
        cellRenderer: params => {
          return /* '<i class="tree-icon folder"></i>' */ params.value
        },
      },
      {
        headerName: '操作',
        width: 260,
        minWidth: 260,
        cellRenderer: 'MyScanRenderer',
        /* cellRenderer:params=>{
            return `<el-button class="el-button--text el-button el-button--mini scan" type="text" size="mini" @click="jumpToDdc(scope.row)">查看</el-button>
            <el-button class="el-button--text el-button el-button--mini " type="text" size="mini" @click="deleteFavor(scope.row)">取消收藏</el-button>`
          } */
      },
    ]
  },
  mounted() {
    this.getData()
  },
  methods: {
    displayTypeChange(value) {
      if (this.displayType === '1') {
        this.displayTypeImg = require('../../../static/userCenter/list2.png')
        this.displayTypeImg2 = require('../../../static/userCenter/card.png')
      } else if (this.displayType === '2') {
        this.displayTypeImg = require('../../../static/userCenter/list.png')
        this.displayTypeImg2 = require('../../../static/userCenter/card2.png')
      }
    },
    getData() {
      this.$http
        .get(this.$url + '/service/favor/')
        .then(res => {
          const items = []
          res.data.forEach(item => {
            if (item.objId !== '0') {
              if (this.keyword !== '') {
                const keyword = this.keyword.trim().toLowerCase()
                if (item.objectName.toLowerCase().indexOf(keyword) !== -1) {
                  items.push(item)
                }
              } else {
                items.push(item)
              }
            }
          })
          this.items = items
          this.tableLoading = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    typeFormatter(row) {
      switch (row.typeId) {
        case 1:
        case '1':
          return '表'
        default:
          break
      }
    },
    jumpToDdc(row) {
      const objectId = row.objId
      // const type = row.typeId===80000004 ? 'TABLE' : 'VIEW';
      let type
      switch (row.typeId) {
        case 80000004:
          type = 'TABLE'
          break
        case 82800002:
          type = 'REPORT'
          break
        case 80500008:
          type = 'VIEW'
          break
      }
      if (objectId) {
        if (row.typeId === 82800002) {
          window.open(
            `${location.origin}${location.pathname}#/reportForm?reportId=${objectId}&type=${type}`
          )
        } else {
          if (
            location.pathname.includes('ddc.html') ||
            location.href.includes(':8081')
          ) {
            // from ddc
            window.open(
              `${location.origin}${location.pathname}#/myItem?objectId=${objectId}&type=${type}`
            )
          } else {
            // from dam
            window.open(
              `${location.origin}${location.pathname}#/myItem?objectId=${objectId}&type=${type}`
            )
          }
        }
      }
    },
    deleteFavor(row) {
      this.$confirm('确定要取消该收藏吗？', '', {
        type: 'warning',
      })
        .then(() => {
          const id = row.id
          this.$http.delete(this.$url + '/service/favor/' + id).then(res => {
            this.getData()
          })
        })
        .catch(() => {})
    },
    onGridReady(params) {
      this.gridApi = params.api
      this.columnApi = params.columnApi
      this.initAgGrid()
    },
    initAgGrid() {
      //        this.$refs.modelTable.sizeColumnsToFit();
    },
  },
  watch: {
    keyword(newVal) {
      this.getData()
    },
  },
}
</script>

<style scoped lang="scss">
@import './_main';
</style>
<style lang="scss">
.el-radio-button .el-radio-button__inner {
  padding: 5px 8px 4px !important;
}
.el-radio-button:first-child .el-radio-button__inner {
  border-radius: 2px 0 0 2px;
}
.el-radio-button:last-child .el-radio-button__inner {
  border-radius: 0 2px 2px 0;
}
</style>
