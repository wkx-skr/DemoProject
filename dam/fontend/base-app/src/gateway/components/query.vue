<template>
  <div class="query-gateway-page">
    <datablau-list-search>
      <template slot="title">
        <div style="padding: 0 20px">安全网关统一查询</div>
      </template>
    </datablau-list-search>
    <div class="gateway-content" v-loading="tableLoading">
      <div class="gateway-search-box">
        <el-form ref="searchForm" :model="searchForm">
          <el-form-item prop="modelId" label="安全网关">
            <datablau-select
              style="width: 240px"
              v-model="searchForm.servicePort"
              placeholder="请选择安全网关"
            >
              <el-option
                :label="item.name"
                :value="item.servicePort"
                v-for="item in dataSource"
                :key="item.servicePort"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item prop="num" label="查询条数">
            <datablau-input
              size="small"
              style="width: 240px"
              type="number"
              clearable
              @keyup.native="inputhandle"
              v-model.number="searchForm.num"
              placeholder="请输入查询条数"
            ></datablau-input>
            <datablau-tips
              style="display: inline-block"
              content="最大值不大于5000,默认值为500"
              icon="icon-tips"
            ></datablau-tips>
          </el-form-item>
          <DatablauCodeMirror
            ref="sqleditor"
            @change="changeValue"
            :value="searchForm.sql"
            :option="setOptions"
            :tables="tables"
          ></DatablauCodeMirror>
          <div class="sure">
            <datablau-button
              type="important"
              @click="handleSure"
              :disabled="!canClick"
            >
              执行
            </datablau-button>
          </div>
        </el-form>
      </div>
      <div class="query-result" v-if="isResult">
        <div class="descriptionMessage-title" style="margin: 0 20px">
          <p class="message-title">执行结果</p>
        </div>
        <div class="table-box">
          <datablau-form-submit>
            <datablau-table
              :data="nowDataList"
              class="query-table"
              height="100%"
              v-if="isSuccess && isSelect"
            >
              <el-table-column
                v-for="item in nameList"
                :key="item"
                :prop="item"
                :label="item"
                min-width="100"
              ></el-table-column>
            </datablau-table>
            <div v-else class="query-tip">{{ resultTip }}</div>
            <template slot="buttons" v-if="isSuccess && isSelect">
              <datablau-pagination
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
                :current-page.sync="page"
                :page-sizes="[10, 20, 50, 100]"
                :page-size="size"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                class="page"
              ></datablau-pagination>
            </template>
          </datablau-form-submit>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      setOptions: {
        toolbar: true,
        copy: true,
        setTheme: true,
        setFontSize: true,
        fullScreen: true,
        formater: true,
        gutterMark: true,
      },
      tables: {
        t_users: ['id', 'name', 'account', 'password', 'email'],
        t_role: ['id', 'uid', 'code', 'permissions'],
      },
      dataSource: [],
      dataSourceTotal: 0,
      searchForm: {
        servicePort: '',
        name: '',
        passwords: '',
        sql: '',
        num: null,
      },
      nameList: [],
      dataList: [],
      nowDataList: [],
      isSuccess: false,
      isSelect: false,
      isResult: true,
      resultTip: '',
      tableLoading: false,
      currentPage: 1,
      pageSize: 500,
      page: 1,
      size: 10,
      total: 0,
    }
  },
  mounted() {
    this.getList()
  },
  computed: {
    canClick() {
      if (this.searchForm.servicePort && this.searchForm.sql) {
        return true
      } else {
        return false
      }
    },
  },
  methods: {
    inputhandle({ target }) {
      target.value = target.value.replace(/[^\d]/g, '')
      if (target.value > 5000) {
        target.value = 5000
      }
      if (target.value) {
        this.searchForm.num = parseInt(target.value)
      } else {
        this.searchForm.num = null
      }
    },
    changeValue(val) {
      this.$set(this.searchForm, 'sql', val)
    },
    getList() {
      const params = {
        current_page: this.currentPage,
        page_size: 500,
      }
      this.$http
        .get(this.$url + '/service/dataSecurity/inquire/gateway', {
          params: params,
        })
        .then(data => {
          this.dataSource = data.data
          // this.dataSource = this.dataSource.filter(item => {
          //   return item.gatewayType !== 'PROXY_GATEWAY'
          // })
          // this.dataSourceTotal = this.dataSource.length
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handlePageChange(page) {
      this.page = page
      this.showList()
    },
    handleSizeChange(size) {
      this.page = 1
      this.size = size
      this.showList()
    },
    showList() {
      this.nowDataList =
        this.dataList.slice(
          this.size * (this.page - 1),
          this.size * this.page
        ) || []
    },
    handleSure() {
      this.tableLoading = true
      this.isSelect = false
      const params = {
        port: this.searchForm.servicePort,
        query: this.searchForm.sql,
        pageSize: this.searchForm.num ? this.searchForm.num : this.pageSize,
      }
      this.dataList = []
      this.resultTip = ''
      this.$http
        .post(this.$url + '/service/gateway/query', params)
        .then(data => {
          this.tableLoading = false
          this.isResult = true
          this.isSuccess = data.data.success
          if (data.data.type) {
            const type = data.data.type.toUpperCase()
            switch (type) {
              case 'SELECT':
                this.isSelect = true
                if (this.isSuccess) {
                  this.nameList = data.data.columns
                  this.total = data.data.data.length
                  data.data.data.map(res => {
                    let itemList = {}
                    res.map((item, index) => {
                      itemList[this.nameList[index]] = item
                    })
                    this.dataList.push(itemList)
                  })
                  this.showList()
                } else {
                  this.resultTip = data.data.errorMsg
                }
                break
              case 'UPDATE':
                if (this.isSuccess) {
                  this.resultTip = `成功更新${data.data.row}条数据`
                } else {
                  this.resultTip = data.data.errorMsg
                }
                break
              case 'DELETE':
                if (this.isSuccess) {
                  this.resultTip = `成功删除${data.data.row}条数据`
                } else {
                  this.resultTip = data.data.errorMsg
                }
                break
              case 'INSERT':
                if (this.isSuccess) {
                  this.resultTip = `成功插入${data.data.row}条数据`
                } else {
                  this.resultTip = data.data.errorMsg
                }
                break
              default:
                if (this.isSuccess) {
                  this.resultTip = data.data.row
                } else {
                  this.resultTip = data.data.errorMsg
                }
                break
            }
          } else {
            if (this.isSuccess) {
              this.resultTip = data.data.row
            } else {
              this.resultTip = data.data.errorMsg
            }
          }
        })
        .catch(e => {
          this.tableLoading = false
          this.$showFailure(e)
        })
    },
  },
}
</script>

<style scoped lang="scss">
/deep/ .CodeMirror {
  height: 100px;
}
/deep/ .cm-fullscreen {
  .toolbar {
    top: 50px;
  }
  .CodeMirror-fullscreen {
    top: 105px;
  }
}
.query-gateway-page {
  background-color: #fff;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  .gateway-content {
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .gateway-header {
    .title {
      font-size: 20px;
    }
  }

  .gateway-search-box {
    padding: 0 20px;
    /deep/ .el-form-item {
      display: inline-block;
      margin-right: 20px;
      .el-form-item__label {
        padding-right: 6px;
      }
      .el-form-item__content {
        display: inline-block;
      }
      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none;
      }
      input[type='number'] {
        -moz-appearance: textfield;
      }
    }

    .sure {
      margin-top: 10px;
    }
  }

  .query-result {
    position: absolute;
    top: 250px;
    left: 0;
    right: 0;
    bottom: 0;
    .query-table {
      min-height: 120px;
      padding: 0 20px;
    }
    .table-box {
      position: absolute;
      top: 24px;
      left: 0;
      right: 0;
      bottom: 0px;
    }

    .query-tip {
      margin-top: 20px;
      line-height: 24px;
      font-size: 12px;
      color: red;
      margin-left: 20px;
    }
  }
}
</style>
