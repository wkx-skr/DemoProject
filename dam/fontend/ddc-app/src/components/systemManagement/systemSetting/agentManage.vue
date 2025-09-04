<template>
  <div class="synonyms-tab">
    <!--    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      :append-to-body="true"
      width="700px"
      class="edit-synonyms-dia"
      :close-on-click-modal="false"
    >
      <div class="synonyms-dialog-body">
        <el-form
          ref="editSynonyms"
          label-position="right"
          label-width="110px"
          size="small"
        >
          <el-form-item
            label="同义词："
            prop="synonyms"
            v-model="editSynonymsData"
          >
            <el-input
              type="textarea"
              v-model="editSynonymsData.synonyms"
              size="mini"
              autosize
            ></el-input>
            <el-tooltip
              effect="light"
              content="同义词使用英文逗号分隔"
              placement="right"
            >
              <i class="el-icon-info"></i>
            </el-tooltip>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="synonyms-dialog-footer">
        <el-button
          type="primary"
          @click="saveEditObj"
          class=""
          :disabled="!editBottomItemConfirm"
        >
          确 定
        </el-button>
        <el-button @click="dialogVisible = false">
          {{ $t('common.button.cancel') }}
        </el-button>
      </div>
    </el-dialog>-->
    <datablau-eltable
      class="table-tab-container agent-manage"
      ref="agentTab"
      :hideDefaultFilter="false"
      :totalShow="totalShow"
      :columnDefs="columnDefs"
      :getShowData="getShowData"
      :hideTopLine="hideTopLine"
      :hideBottomLine="hideTopLine"
      :tableOption="tableOption"
      :tableHidePagination="tableHidePagination"
      :defaultParaData="defaultParaData"
      :tableHeightInfo="tableHeightInfo"
      @gridSelectionChanged="gridSelectionChanged"
    >
      <!-- @changeKeyWord="changeKeyWord" -->
      <div class="right-btn-container" slot="header">
        <!-- <datablau-button  type="secondary" size="mini" @click="refreshTable">刷 新</datablau-button> -->
      </div>
    </datablau-eltable>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // *** tab with table ***
      totalShow: 0,
      columnDefs: [],
      hideTopLine: false,
      tableOption: {
        rowSelection: 'single',
        showColumnSelection: false, // 设置不展示多出来的那一列
      },
      tableHidePagination: false,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20,
      },
      selection: [],

      // *** edit dialog ***
      dialogVisible: false,
      editSynonymsData: {
        synonyms: '',
        id: '',
      },
      // dialogTitle: '创建同义词',
      isAddSynonyms: false,
      getAllInfo: null,
      keyword: '',
      tableHeightInfo: '100%', // 设置表格的高度
    }
  },
  components: {},
  beforeMount() {
    const formatterTime = data => {
      const t = this.$timeFormatter(data.value)
      return t
    }
    const columnDefs = [
      // {
      //   type: ['selectionCheckboxColumn'],
      // },
      // {
      //   type: ['firstEmptyColumn'],
      // },
      // {
      //   headerName: '序号',
      //   field: 'domainName',
      //   tooltipField: 'domainName',
      //   width: 150,
      //   // type: ['customSortCol'],
      // },
      {
        headerName: this.$t('system.systemSetting.serverIp'),
        field: 'host',
        tooltipField: 'host',
        // width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: this.$t('system.systemSetting.serverPort'),
        field: 'port',
        tooltipField: 'port',
        // valueFormatter: formatterTime,
        // tooltipValueGetter: formatterTime,
        // width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: this.$t('system.systemSetting.serverType'),
        field: 'type',
        tooltipField: 'type',
        // valueFormatter: formatterTime,
        // tooltipValueGetter: formatterTime,
        // width: 150,
        // type: ['customSortCol'],
      },
      // {
      //   headerName: '操作',
      //   width: 100,
      //   type: ['optionsWithContent'],
      //   cellRendererParams: {
      //     tabComponent: this,
      //     options: [
      //       // {name: 'edit', text: '编辑', method: 'showEditDialog'},
      //       {name: 'remove', text: '删除', method: 'deleteSynonymsItem'},
      //     ]
      //   },
      // }
    ]
    this.columnDefs = columnDefs
  },
  computed: {
    /* editBottomItemConfirm() {
      let bool = false
      bool = !!(this.editSynonymsData && this.editSynonymsData.synonyms)
      return bool
    }, */
  },
  mounted() {},
  methods: {
    // *** tab with table ***
    getShowData(para) {
      if (!this.getAllInfo) {
        this.setTaskResult()
      }
      return new Promise((resolve, reject) => {
        const keyword = para.keyword || ''

        if (this.getAllInfo) {
          this.getAllInfo
            .then(res => {
              let data = res.data
              const resultArr = []
              for (const key in data) {
                const agent = data[key]
                if (agent && Array.isArray(agent)) {
                  agent.forEach(item => {
                    item.type = key
                    resultArr.push(item)
                  })
                }
              }
              data = resultArr
              if (!data || !Array.isArray(data)) {
                data = []
              }

              let keyword = para.keyword || ''
              keyword = _.trim(keyword)
              if (keyword) {
                const result = []
                keyword = keyword.toLowerCase()
                let taskName = ''
                data.forEach(item => {
                  taskName = item.host || ''
                  taskName = taskName.toLowerCase()
                  const index = taskName.indexOf(keyword)
                  if (index !== -1) {
                    result.push(item)
                  }
                })
                data = result
              }

              this.totalShow = data.length

              const s = para.pageSize
              const c = para.currentPage

              const arr = data.slice(s * (c - 1), s * c)
              resolve(arr)
            })
            .catch(e => {
              this.$showFailure(e)
              reject(e)
            })
        } else {
          resolve([])
          this.$showFailure(this.$t('system.systemSetting.taskUndefined'))
        }
      })
    },

    setTaskResult() {
      const url = `${this.$url}/service/main/remote-services`
      this.getAllInfo = this.$http.get(url)
    },

    gridSelectionChanged(para) {
      const api = para.api
      const arr = api.getSelectedNodes()
      const result = []
      arr.forEach(item => {
        result.push(item.data)
      })
      this.selection = result
    },

    // *** edit dialog ***
    /* showAddDialog() {
      this.isAddSynonyms = true
      this.editSynonymsData = {
        synonyms: '',
        id: '',
      }
      this.dialogVisible = true
    }, */
    /* showEditDialog({ data, api, e }) {
      // console.log({data, api, e}, '{data, api, e}')
      this.isAddSynonyms = false
      this.editSynonymsData = {
        synonyms: data.synonymContent,
        id: data.id,
      }
      this.dialogVisible = true
    }, */
    /* deleteSynonymsItem({ data, api, e }) {
      // let id = data.id;
      // let url = `${this.$url}/service/synonym/?id=${id}`;

      // this.$confirm('删除后不可恢复，确认删除？','提示',{
      //   type: 'warning',
      // }).then(()=>{
      //   this.$http.delete(url)
      //   .then(res => {
      //     this.$message.success('删除成功');
      //     this.refreshTable();
      //   })
      //   .catch(e => {
      //     this.$showFailure(e);
      //   });
      // }).catch((e)=>{
      //   console.log(e);
      // });

      this.$confirm('删除后不可恢复，确认删除？', '提示', {
        type: 'warning',
      })
        .then(() => {
          const id = data.id
          const para = { id }
          const callback = () => {
            this.$message.success('删除成功')
            this.refreshTable()
          }
          this.deleteItem(para, callback)
        })
        .catch(e => {
          console.info(e)
        })
    }, */
    /* saveEditObj() {
      if (this.editSynonymsData && this.editSynonymsData.synonyms) {
        const method = this.isAddSynonyms ? 'put' : 'post'
        const sucMsg = this.isAddSynonyms ? '添加成功' : '修改成功'
        const synonymContent = this.editSynonymsData.synonyms || ''
        const id = this.editSynonymsData.id || ''
        let url = ''
        if (this.isAddSynonyms) {
          url = `${
            this.$url
          }/service/synonym/?synonymContent=${encodeURIComponent(
            synonymContent
          )}`
        } else {
          url = `${
            this.$url
          }/service/synonym/?synonymContent=${encodeURIComponent(
            synonymContent
          )}&id=${id}`
          if (!id) {
            this.$showFailure('id不能为空')
            return
          }
        }
        this.$http[method](url)
          .then(res => {
            // console.log(res, 'res')
            this.$message.success(sucMsg)
            this.dialogVisible = false
            this.refreshTable()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$showFailure('内容不能为空')
      }
    }, */
    /* refreshTable() {
      this.setTaskResult()
      if (this.$refs.agentTab && this.$refs.agentTab.refreshData) {
        this.$refs.agentTab.refreshData()
      }
    }, */
    /* deleteItem(para, callback) {
      const id = para.id
      const url = `${this.$url}/service/synonym/?id=${id}`

      this.$http
        .delete(url)
        .then(res => {
          this.$message.success('删除成功')
          this.refreshTable()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    }, */

    // async delete  synonyms item
    /* async deleteItemAsync(para, callback) {
      const id = para.id
      const url = `${this.$url}/service/synonym/?id=${id}`

      await this.$http.delete(url)
      callback && callback()
    }, */

    /* deleteBatch() {
      const arr = this.selection.map(item => {
        const obj = {
          id: item.id,
        }
        return obj
      })
      // let arr = this.selection.map(item => {id:item.id});
      const callback = () => {
        this.$message.success('删除成功')
        this.refreshTable()
      }
      const para = {
        fun: this.deleteItemAsync,
        paraArr: arr,
        callback,
      }
      this.$confirm('删除后不可恢复，确认删除？', '提示', {
        type: 'warning',
      })
        .then(() => {
          this.seriesFunCallback(para)
        })
        .catch(e => console.info(e))
    }, */
    /* seriesFunCallback({ fun, paraArr, callback }) {
      let delCallback = null
      const nextCallback = () => {
        paraArr.shift()
        this.seriesFunCallback({ fun, paraArr, callback })
      }
      let obj = null
      if (paraArr && Array.isArray(paraArr) && paraArr.length > 1) {
        delCallback = nextCallback
        obj = paraArr[0]
      } else if (paraArr && Array.isArray(paraArr) && paraArr.length == 1) {
        obj = paraArr[0]
        delCallback = () => {
          paraArr.shift()
          callback && callback()
        }
      } else {
        callback && callback()
      }
      try {
        obj && fun(obj, delCallback)
      } catch (e) {
        this.$showFailure(e)
      }
    }, */
    /* tableLayout() {
      if (this.$refs.agentTab && this.$refs.agentTab.resetTableStyle) {
        this.$refs.agentTab.resetTableStyle()
      }
    }, */
  },
  watch: {},
}
</script>

<style lang="scss">
.synonyms-tab {
  .delete-btn {
    margin-left: 20px;
  }
  .synonyms-header {
    position: absolute;
    top: 10px;
    left: 20px;
    right: 20px;
    z-index: 5;
    .search-input {
      display: inline-block;
      width: 203px;
    }
    .header-btn {
      position: absolute;
      right: 0;
    }
  }
}
</style>

<style lang="scss">
.edit-synonyms-dia {
  .synonyms-dialog-body {
    .el-textarea {
      max-width: 400px;
    }
  }
}
.agent-manage {
  margin-right: 20px;
}
</style>
