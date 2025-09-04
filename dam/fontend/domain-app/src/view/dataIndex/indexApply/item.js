import FunctionGraph from './functionGraph.vue'
import axios from 'axios'
export default {
  props: [],
  components: {
    FunctionGraph,
  },
  data() {
    return {
      // 维度
      tags: [],
      // 指标
      tags1: [],
      tableData: [],
      pageSize: 20,
      currentPage: 1,
      totalItems: 0,
      showFilter: false,
      graphKey: 0,
      formData: {},
      rules: {},
      where: [],
      queryWhere: null,
      metricoption: [],
      metricMappingIds: [],
      orderByAsc: null,
      orderByMertric: null,
      mappingName: [],
      tableId: null,
      filterData: {
        logicalOperator: 'AND',
        query: [
          {
            logicalOperator: 'AND',
            query: [
              { comparisonOperator: 'EQUAL_TO', value: '' },
              { comparisonOperator: 'EQUAL_TO', value: '' },
            ],
          },
          {
            logicalOperator: 'OR',
            query: [
              { comparisonOperator: 'EQUAL_TO', value: '' },
              { comparisonOperator: 'EQUAL_TO', value: '' },
            ],
          },
        ],
      },
      FILTER: {
        logicalOperator: 'AND',
        query: [
          {
            logicalOperator: 'AND',
            query: [
              { comparisonOperator: 'EQUAL_TO', value: '' },
              { comparisonOperator: 'EQUAL_TO', value: '' },
            ],
          },
          {
            logicalOperator: 'OR',
            query: [
              { comparisonOperator: 'EQUAL_TO', value: '' },
              { comparisonOperator: 'EQUAL_TO', value: '' },
            ],
          },
        ],
      },
      filterHeight: 50,
      filter2Height: 50,
      source: null,
      hasNext: true,
    }
  },
  mounted() {
    this.$bus.$on('addTags', this.addTags)
    this.$bus.$on('getTableId', this.getTableId)
    this.$bus.$on('clearThemeTable', this.clearThemeTable)
  },
  beforeDestroy() {
    this.$bus.$off('addTags')
    this.$bus.$off('getTableId')
    this.$bus.$off('clearThemeTable')
  },
  methods: {
    // 增加标签
    addTags(item) {
      // console.log(item, 'addTags')
      let obj = {}
      if (item.attrType === 82800023) {
        // let arr = []
        let arr = this.tags.filter(
          item1 => item1.metricMappingId === item.metricMappingId
        )
        // objectId判断在后端完善后要删除此部分代码
        let obj = this.tags
          .concat(this.tags1)
          .filter(item1 => item1.objectId === item.objectId)
        if (obj.length !== 0) {
          this.$message.error(
            this.$t('indicator.apply.errorMessage.duplicate', [obj[0].attrInfo])
          )
          return
        }
        //
        if (arr.length == 0 && obj.length == 0) {
          this.tags.push(item)
          this.metricoption.push(item)
          this.metricMappingIds.push(item.metricMappingId)
          this.updataHeight()
        }
      } else {
        // let arr = []
        let arr = this.tags1.filter(
          item1 => item1.metricMappingId === item.metricMappingId
        )
        // objectId判断在后端完善后要删除此部分代码
        let obj = this.tags
          .concat(this.tags1)
          .filter(item1 => item1.objectId === item.objectId)
        if (obj.length !== 0) {
          this.$message.error(
            this.$t('indicator.apply.errorMessage.duplicate', [obj[0].attrInfo])
          )
          return
        }
        //
        if (arr.length == 0 && obj.length == 0) {
          this.tags1.push(item)
          this.metricMappingIds.push(item.metricMappingId)
          this.updataHeight()
        }
      }
    },
    updataHeight() {
      this.$nextTick(() => {
        this.filterHeight = document.getElementById('filter').offsetHeight
        this.filter2Height = document.getElementById('filter2').offsetHeight
        this.getTable()
        // console.log('filterHeight', this.filterHeight)
      })
    },
    // 新增条件组
    addQuery() {
      this.filterData.query.push({
        logicalOperator: 'AND',
        query: [
          { comparisonOperator: 'EQUAL_TO', value: '' },
          { comparisonOperator: 'EQUAL_TO', value: '' },
        ],
      })
    },
    sortQuery(first, second, operation, i) {
      let obj = {}
      if (i > 0) {
        obj = {
          first: first,
          second: {
            type: 'query',
            metricMappingId: second.metricMappingId,
            operator: second.comparisonOperator,
            value: second.value,
          },
          operation: operation,
          type: 'complex',
        }
      } else {
        obj = {
          type: 'complex',
          first: {
            type: 'query',
            metricMappingId: first.metricMappingId,
            operator: first.comparisonOperator,
            value: first.value,
          },
          second: {
            type: 'query',
            metricMappingId: second.metricMappingId,
            operator: second.comparisonOperator,
            value: second.value,
          },
          operation: operation,
        }
      }
      return obj
    },
    sortWhere(first, second, operation, i) {
      // console.log(first, second, operation, i, 'sortQuery111111111111')
      let obj = {}
      if (first.type == 'complex' && second.type == 'complex') {
        console.log('1')
        obj = {
          type: 'complex',
          first: {
            type: 'complex',
            first: first.first,
            second: first.second,
            operation: first.operation,
          },
          second: {
            type: 'complex',
            first: second.first,
            second: second.second,
            operation: second.operation,
          },
          operation: operation,
        }
      } else if (first.type == 'complex' && second.type == 'query') {
        console.log('2')
        obj = {
          type: 'complex',
          first: {
            type: 'complex',
            first: first.first,
            second: first.second,
            operation: first.operation,
          },
          second: {
            type: 'query',
            metricMappingId: second.metricMappingId,
            operator: second.operator,
            value: second.value,
          },
          operation: operation,
        }
      } else if (first.type == 'query' && second.type == 'complex') {
        console.log('3')
        obj = {
          type: 'complex',
          first: {
            type: 'query',
            metricMappingId: first.metricMappingId,
            operator: first.operator,
            value: first.value,
          },
          second: {
            type: 'complex',
            first: second.first,
            second: second.second,
            operation: second.operation,
          },
          operation: operation,
        }
      } else {
        obj = {
          type: 'complex',
          first: {
            type: 'query',
            metricMappingId: first.metricMappingId,
            operator: first.operator,
            value: first.value,
          },
          second: {
            type: 'query',
            metricMappingId: second.metricMappingId,
            operator: second.operator,
            value: second.value,
          },
          operation: operation,
        }
      }
      return obj
    },
    // 初始化查询条件
    initQuertWhere() {
      this.tags1 = []
      this.tags = []
      this.metricMappingIds = []
      this.metricoption = []
      this.queryWhere = null
      this.orderByAsc = null
      this.orderByMertric = null
      this.currentPage = 1
      this.totalItems = 0
      this.tableData = []
      this.hasNext = null
      // this.tableId = null;
      this.mappingName = []
      this.filterData = _.cloneDeep(this.FILTER)
      // 取消上一次请求
      this.cancelRequest()
    },
    // 更换主题
    getTableId(tableId) {
      this.initQuertWhere()
      this.tableId = Number(tableId)
      // console.log(this.tableId,this.tableId)
    },
    // 清空主题
    clearThemeTable() {
      this.initQuertWhere()
    },
    search() {
      if (this.metricMappingIds.length > 0) {
        this.orderByAsc = null
        this.orderByMertric = null
        this.currentPage = 1
        this.queryWhere = null
        this.getTable()
      } else {
        this.$message.error(this.$t('indicator.apply.errorMessage.dimOrIndex'))
      }
    },
    // 终止请求
    cancelRequest() {
      if (typeof this.source === 'function') {
        this.source('终止请求')
      }
    },
    // 获取表格
    getTable() {
      // 取消上一次请求
      this.cancelRequest()
      let that = this
      this.tableData = null
      this.mappingName = [this.$t('indicator.apply.loading')]
      let body = {
        currentPage: this.currentPage,
        mertriMappingId: this.metricMappingIds,
        orderByAsc: this.orderByAsc,
        orderByMertrid: this.orderByMertric,
        pageSize: this.pageSize,
        queryWhere: this.queryWhere,
        tableId: this.tableId,
      }
      let url = `/domain/querytheme/mapping/to/execute`
      let CancelToken = axios.CancelToken
      let source = CancelToken.source()
      this.$http
        .post(url, body, {
          cancelToken: new axios.CancelToken(function executor(c) {
            that.source = c
          }),
        })
        .then(res => {
          if (res.data) {
            this.mappingName = res.data.mappingName
            let content = _.cloneDeep(res.data.content)
            this.totalItems = res.data.hasNext
              ? res.data.currentPage * res.data.pageSize + 1
              : res.data.currentPage * res.data.pageSize
            this.tableData = content
            if (res.data.hasNext) {
              this.hasNext = true
            } else {
              // this.hasNext=true;
            }
            // if (content && content.length > 0) {
            //   content.forEach((item, index) => {
            //     let obj = {}
            //     for (let i = 0; i < item.length; i++) {
            //       obj[this.mappingName[i]] = item[i];
            //     }
            //     this.tableData.push(obj);
            //   });
            //   console.log(this.tableData, 'tableData');
            // }
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 取消
    cancel() {
      this.$DatablauCofirm(
        this.$t('indicator.apply.errorMessage.sure'),
        this.$t('domain.common.tip'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(() => {
          this.showFilter = false
          this.filterData = _.cloneDeep(this.FILTER)
          this.queryWhere = null
          this.currentPage = 1
          this.totalItems = 0
          if (this.metricMappingIds && this.metricMappingIds.length > 0) {
            this.tableData = null
            this.getTable()
          }
        })
        .catch(e => {
          // this.$showFailure(e)
        })
    },
    // 保存过滤条件
    save() {
      console.log(this.filterData, 'this.filterData')
      let operator = this.filterData.logicalOperator
      let canSave = true
      if (this.filterData.query.length > 1) {
        this.filterData.query.forEach((item, index) => {
          let query = item.query
          if (query.length > 1) {
            // 多组
            // 检验未填项
            for (let i = 0; i < query.length; i++) {
              if (!query[i].metricMappingId) {
                this.$message.closeAll()
                this.$message.error(
                  this.$t('indicator.apply.errorMessage.noDims')
                )
                // console.log(query[i],'item')
                canSave = false
                return false
              } else if (!query[i].value) {
                if (
                  !(
                    query[i].comparisonOperator == 'NOT_NULL' ||
                    query[i].comparisonOperator == 'IS_NULL'
                  )
                ) {
                  this.$message.closeAll()
                  this.$message.error(
                    this.$t('indicator.apply.errorMessage.noValues')
                  )
                  console.log(query[i], 'query[i]')
                  canSave = false
                  return false
                }
              } else {
                // 正确填写了
                if (query[i + 1]) {
                  if (i === 0) {
                    this.where[index] = query[i]
                  }
                  this.where[index] = this.sortQuery(
                    this.where[index],
                    query[i + 1],
                    item.logicalOperator,
                    i
                  )
                }
              }
            }
          } else {
            // 多组中每组一个的
            // 检验未填项
            if (!query[0].metricMappingId) {
              this.$message.closeAll()
              this.$message.error(
                this.$t('indicator.apply.errorMessage.noDims')
              )
              canSave = false
              return false
            } else if (!query[0].value) {
              if (
                !(
                  query[0].comparisonOperator == 'NOT_NULL' ||
                  query[0].comparisonOperator == 'IS_NULL'
                )
              ) {
                this.$message.closeAll()
                this.$message.error(
                  this.$t('indicator.apply.errorMessage.noValues')
                )
                canSave = false
                return false
              }
            } else {
              // 正确填写了
              this.where[index] = {
                type: 'query',
                metricMappingId: query[0].metricMappingId,
                operator: query[0].comparisonOperator,
                value: query[0].value,
              }
            }
          }
        })
        console.log(this.where, 'this.where')
        if (this.where.length > 0) {
          for (let i = 0; i < this.where.length; i++) {
            if (this.where[i + 1]) {
              if (i === 0) {
                this.queryWhere = this.where[i]
                console.log(this.queryWhere, '11111111111')
              }
              this.queryWhere = this.sortWhere(
                this.queryWhere,
                this.where[i + 1],
                operator,
                i + 1
              )
            }
          }
        }

        // console.log(this.where, 'this.where');
        console.log(this.queryWhere, 'this.queryWhere')
        // this.queryWhere = JSON.stringify(this.queryWhere)
      } else if (this.filterData.query.length == 1) {
        let query = this.filterData.query
        // 只有一组
        if (query[0].query.length > 1) {
          // 有两条以上
          let query2 = query[0].query
          for (let i = 0; i < query2.length; i++) {
            if (!query2[i].metricMappingId) {
              this.$message.error(
                this.$t('indicator.apply.errorMessage.noDims')
              )
              canSave = false
              return false
            } else if (
              !query2[i].value &&
              !['NOT_NULL', 'IS_NULL'].includes(query2[i].comparisonOperator)
            ) {
              this.$message.error(
                this.$t('indicator.apply.errorMessage.noValues')
              )
              canSave = false
              return false
            } else {
              if (query2[i + 1]) {
                if (i === 0) {
                  this.queryWhere = query2[i]
                }
                this.queryWhere = this.sortQuery(
                  this.queryWhere,
                  query2[i + 1],
                  query[0].logicalOperator,
                  i
                )
              }
            }
          }
        } else {
          // 一条
          if (!query[0].query[0].metricMappingId) {
            this.$message.error(this.$t('indicator.apply.errorMessage.noDim'))
            canSave = false
            return false
          } else if (
            !query[0].query[0].value &&
            !['NOT_NULL', 'IS_NULL'].includes(
              query[0].query[0].comparisonOperator
            )
          ) {
            this.$message.error(this.$t('indicator.apply.errorMessage.noValue'))
            canSave = false
            return false
          } else {
            let obj = {
              type: 'query',
              metricMappingId: query[0].query[0].metricMappingId,
              operator: query[0].query[0].comparisonOperator,
              value: query[0].query[0].value,
            }
            this.queryWhere = obj
            // console.log(obj, '111')
          }
        }
      } else {
        // 没有组
        this.queryWhere = null
        // this.$message.error('没有查询条件');
        // canSave = false
      }
      // console.log(canSave, 'canSavecanSavecanSave')
      if (canSave) {
        this.orderByAsc = null
        this.orderByMertric = null
        this.currentPage = 1
        if (this.metricMappingIds && this.metricMappingIds.length > 0) {
          this.tableData = null
          this.getTable()
        }
        this.showFilter = false
        // let body = {
        //   "currentPage": 1,
        //   "mertriMappingId": this.metricMappingIds,
        //   "orderByAsc": null,
        //   "orderByMertric": null,
        //   "pageSize": this.pageSize,
        //   "queryWhere": this.queryWhere,
        //   "tableId": this.tableId
        // }
        // let url = `/domain/querytheme/mapping/to/execute`
        // this.$http
        //   .post(url, body).then(res => {
        //     console.log(res.data)
        //     if (res.data) {
        //       this.mappingName = res.data.mappingName;
        //       let content = _.cloneDeep(res.data.content);
        //       this.totalItems=res.data.total
        //       this.tableData = [];
        //       if (content && content.length > 0) {
        //         content.forEach((item, index) => {
        //           let obj = {}
        //           for (let i = 0; i < item.length; i++) {
        //             obj[this.mappingName[i]] = item[i];
        //           }
        //           this.tableData.push(obj);
        //         });
        //         console.log(this.tableData, 'tableData');
        //       }
        //       this.showFilter = false;
        //     }
        //   })
        //   .catch(e => {
        //     this.$showFailure(e)
        //   })
      }
    },
    // 关闭标签
    handleClose(tag) {
      console.log(tag, 'tag')
      this.tags.splice(this.tags.indexOf(tag), 1)
      this.metricoption = this.metricoption.filter(
        item => item.metricMappingId !== tag.metricMappingId
      )
      this.metricMappingIds = this.metricMappingIds.filter(
        item => item !== tag.metricMappingId
      )
      this.queryWhere = null
      this.filterData = _.cloneDeep(this.FILTER)
      if (this.metricMappingIds && this.metricMappingIds.length > 0) {
        this.tableData = null
        this.currentPage = 1
        this.getTable()
      } else {
        this.initQuertWhere()
      }
    },
    handleClose1(tag) {
      this.tags1.splice(this.tags1.indexOf(tag), 1)
      this.metricMappingIds = this.metricMappingIds.filter(
        item => item !== tag.metricMappingId
      )
      if (this.metricMappingIds && this.metricMappingIds.length > 0) {
        this.tableData = null
        this.currentPage = 1
        this.getTable()
      } else {
        this.initQuertWhere()
      }
    },
    // 清空标签
    // 维度标签
    clickDelete() {
      this.tags = []
      this.metricMappingIds = []
      if (this.tags1 && this.tags1.length > 0) {
        this.metricMappingIds = this.tags1.map(item => item.metricMappingId)
      }
      this.metricoption = []
      this.queryWhere = null
      this.filterData = _.cloneDeep(this.FILTER)
      if (this.metricMappingIds && this.metricMappingIds.length > 0) {
        this.tableData = null
        this.currentPage = 1
        this.getTable()
      } else {
        this.initQuertWhere()
      }
    },
    // 指标标签
    clickDelete1() {
      this.tags1 = []
      this.metricMappingIds = []
      if (this.tags && this.tags.length > 0) {
        this.metricMappingIds = this.tags.map(item => item.metricMappingId)
      }
      if (this.metricMappingIds && this.metricMappingIds.length > 0) {
        this.tableData = null
        this.currentPage = 1
        this.getTable()
      } else {
        this.initQuertWhere()
      }
    },
    // 点齿轮
    clickFilter() {
      this.showFilter = true
      // this.filterData = {
      //   "logicalOperator": "AND",
      //   "query": [{
      //     "logicalOperator": "AND",
      //     "query": [{ "comparisonOperator": "EQUAL_TO", "value": "1" }, { "comparisonOperator": "EQUAL_TO", "value": "1" }],
      //   },
      //   {
      //     "logicalOperator": "OR",
      //     "query": [{ "comparisonOperator": "EQUAL_TO", "value": "1" }, { "comparisonOperator": "EQUAL_TO", "value": "1" }],
      //   }]
      // }
    },
    // 更新过滤条件
    updateFunction(rawData) {
      this.filterData = rawData
    },
    openDialog() {
      this.graphKey++
    },
    // 升序降序
    handleClick(command) {
      console.log(command, 'command1')
      let com = command.split('|')[0]
      if (com === 'Asc') {
        this.orderByAsc = true
      } else {
        this.orderByAsc = false
      }
      // console.log(this.orderByAsc,'this.orderByAsc');
      let i = Number(command.split('|')[1])
      this.orderByMertric = this.metricMappingIds[i]
      // console.log(this.orderByMertric,'this.orderByMertric');
      this.getTable()
    },
    beforhandle(command, i) {
      // if (command === 'Asc') {
      //   this.orderByAsc = true;
      // } else {
      //   this.orderByAsc = false;
      // }
      // this.orderByMertric = this.metricMappingIds[i]
      return command + '|' + i
    },
    handleSizeChange(val) {
      this.pageSize = val
      if (this.metricMappingIds && this.metricMappingIds.length > 0) {
        this.getTable()
      }
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getTable()
    },
    // 上一页
    goPrev() {
      if (
        this.currentPage > 1 &&
        this.metricMappingIds &&
        this.metricMappingIds.length > 0
      ) {
        this.currentPage--
        this.getTable()
      }
    },
    // 下一页
    goNext() {
      if (
        this.hasNext &&
        this.metricMappingIds &&
        this.metricMappingIds.length > 0
      ) {
        this.currentPage++
        this.getTable()
      }
    },
  },
  computed: {},
  watch: {
    filterHeight(newval, oldval) {
      console.log(newval, oldval)
      // console.log('filterHeight!!!!!!!!!!!!', this.filterHeight)
      $('#table').css('top', newval + 15 + this.filter2Height + 'px')
    },
    filter2Height(newval, oldval) {
      console.log(newval, oldval)
      // console.log('filterHeight!!!!!!!!!!!!', this.filter2Height)
      $('#table').css('top', newval + 15 + this.filterHeight + 'px')
    },
  },
}
