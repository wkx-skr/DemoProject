<template>
  <div class="synonyms-tab">
    <datablau-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      append-to-body
      class="edit-synonyms-dia"
      :close-on-click-modal="false"
      size="m"
    >
      <div class="synonyms-tooltip">
        <datablau-tooltip
          :content="$t('system.systemSetting.addTopTips')"
          placement="left"
        >
          <i class="iconfont icon-tips" style="margin-left: 0px"></i>
        </datablau-tooltip>
        <span class="fake-label">
          {{ $t('system.systemSetting.addTopTips') }}
        </span>
      </div>
      <div class="synonyms-dialog-body">
        <datablau-form ref="editSynonyms" label-width="0px">
          <el-form-item>
            <!-- autosize -->
            <datablau-input
              type="textarea"
              v-model="editSynonymsData.synonyms"
              class="synonyms-textarea"
              style="width: 100%"
              :placeholder="placeholder"
            ></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>
      <div slot="footer" class="synonyms-dialog-footer">
        <span style="position: absolute; left: 20px; color: #555; bottom: 28px">
          {{ $t('system.systemSetting.nameLen', { num: namesLength }) }}
        </span>
        <datablau-button
          type="secondary"
          size="small"
          @click="dialogVisible = false"
        >
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          size="small"
          type="important"
          @click="saveEditObj"
          class=""
          style="width: 78px"
          :disabled="!editBottomItemConfirm"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-eltable
      class="table-tab-container synonyms-table"
      ref="synonymsTable"
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
      <div class="right-btn-container" slot="header">
        <datablau-button
          type="important"
          size="mini"
          style="width: 78px"
          @click="showAddDialog"
        >
          {{ $t('common.button.add') }}
        </datablau-button>
        <!-- <datablau-button size="mini" type="secondary" @click="refreshTable">
          刷 新
        </datablau-button> -->
      </div>
      <div class="bottom-btn-container" slot="footer">
        <div class="row-page-footer" v-show="couldDeleteBatch">
          <span class="check-info"></span>
          <span class="footer-span">
            {{ $t('system.systemSetting.selLen', { num: selection.length }) }}
          </span>
          <datablau-button
            type="danger"
            size="small"
            class="iconfont icon-delete"
            @click="deleteBatch"
          >
            {{ $t('common.button.delete') }}
          </datablau-button>
        </div>
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
        selectable: true,
        autoHideSelectable: true,
        showColumnSelection: false,
        columnSelection: [],
        columnResizable: true,
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
      isAddSynonyms: false,
      getAllSyno: null,
      lastPara: {},
      placeholder: this.$t('system.systemSetting.fillSynonyms'),
      tableHeightInfo: '100%',
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
        headerName: this.$t('system.systemSetting.synonyms'),
        field: 'synonymContent',
        tooltipField: 'synonymContent',
        minWidth: 175,
        // width: 150,

        // type: ['customSortCol'],
      },
      {
        headerName: this.$t('system.systemSetting.createTime'),
        field: 'createTime',
        // tooltipField: 'createTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        // width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: this.$t('system.systemSetting.modifyTime'),
        field: 'modifyTime',
        // tooltipField: 'modifyTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        // width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: this.$t('system.systemSetting.operation'),
        width: 120,
        type: ['optionsWithContent'],
        cellRendererParams: {
          tabComponent: this,
          options: [
            // { name: 'edit', text: '编辑', method: 'showEditDialog' },
            // { name: 'remove', text: '删除', method: 'deleteSynonymsItem' },
            {
              name: 'edit',
              text: this.$t('common.button.edit'),
              icon: 'iconfont icon-bianji',
              method: 'showEditDialog',
            },
            {
              name: 'remove',
              text: this.$t('common.button.delete'),
              icon: 'iconfont icon-delete',
              method: 'deleteSynonymsItem',
            },
          ],
        },
      },
    ]
    this.columnDefs = columnDefs
  },
  computed: {
    editBottomItemConfirm() {
      let bool = false
      bool = !!(this.editSynonymsData && this.editSynonymsData.synonyms)
      return bool
    },
    couldDeleteBatch() {
      const arr = this.selection
      return arr && Array.isArray(arr) && arr.length > 0
    },
    namesLength() {
      if (!this.editSynonymsData.synonyms) {
        return 0
      } else {
        return this.editSynonymsData.synonyms
          .replace(/\n/g, ',')
          .split(',')
          .filter(i => i).length
      }
    },
    dialogTitle() {
      if (this.isAddSynonyms) {
        return this.$t('system.systemSetting.createSynonyms')
      } else {
        return this.$t('system.systemSetting.editSynonyms')
      }
    },
  },
  mounted() {},
  methods: {
    // *** tab with table ***
    getShowData(para) {
      // console.log(para, 'para')
      return new Promise((resolve, reject) => {
        const currentPage = para.currentPage
        const pageSize = para.pageSize
        let keyword = para.keyword || ''
        this.lastPara = para
        // let url = `${this.$url}/service/synonym/?currentPage=${currentPage}&pageSize=${pageSize}&synonymContent=${keyword}`;
        // url = `${this.$url}/service/synonym/`

        if (!this.getAllSyno) {
          this.setAllSyno()
        }

        this.getAllSyno
          .then(res => {
            let data = res.data
            data.sort((a, b) => {
              return b.createTime - a.createTime
            })
            if (data || Array.isArray(data)) {
              // data = [];
              if (keyword) {
                keyword = keyword.toLowerCase()
                data = data.filter(item => {
                  let bool = false
                  let index = -1
                  if (item && item.synonymContent) {
                    index = item.synonymContent.toLowerCase().indexOf(keyword)
                  }
                  if (index !== -1) {
                    bool = true
                  }
                  return bool
                })
              }
            } else {
              data = []
            }
            const s = para.pageSize
            const c = para.currentPage
            const arr = data.slice(s * (c - 1), s * c)
            // console.log(data, 'data');
            this.totalShow = data.length
            resolve(arr)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    setAllSyno() {
      const url = `${this.$url}/service/synonym/`
      this.getAllSyno = this.$http.get(url)
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
    showAddDialog() {
      this.isAddSynonyms = true
      this.editSynonymsData = {
        synonyms: '',
        id: '',
      }
      this.dialogVisible = true
    },
    showEditDialog({ data, api, e }) {
      // console.log({data, api, e}, '{data, api, e}')
      this.isAddSynonyms = false
      this.editSynonymsData = {
        synonyms: data.synonymContent,
        id: data.id,
      }
      this.dialogVisible = true
    },
    deleteSynonymsItem({ data, api, e }) {
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

      this.$DatablauCofirm(
        this.$t('system.systemSetting.delConfirm'),
        this.$t('system.systemSetting.tips'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(() => {
          const id = data.id
          const para = { id }
          const callback = () => {
            this.$message.success(this.$t('system.systemSetting.delSucceed'))
            // this.refreshTable();
            const para = {
              keyword: this.lastPara.keyword || '',
              currentPage: 1,
              pageSize: this.lastPara.pageSize || 20,
            }
            this.setCurrentPara(para)
          }
          this.deleteItem(para, callback)
        })
        .catch(e => {
          console.info(e)
        })
    },
    saveEditObj() {
      if (this.editSynonymsData && this.editSynonymsData.synonyms) {
        const method = this.isAddSynonyms ? 'put' : 'post'
        const sucMsg = this.isAddSynonyms
          ? this.$t('system.systemSetting.addSucceed')
          : this.$t('system.systemSetting.modifySucceed')
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
            this.$showFailure(this.$t('system.systemSetting.idRequired'))
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
        this.$showFailure(this.$t('system.systemSetting.infoRequired'))
      }
    },
    refreshTable() {
      this.setAllSyno()
      if (this.$refs.synonymsTable && this.$refs.synonymsTable.refreshData) {
        this.$refs.synonymsTable.refreshData()
      }
    },
    setCurrentPara(para) {
      this.setAllSyno()
      if (this.$refs.synonymsTable && this.$refs.synonymsTable.setCurrentPara) {
        this.$refs.synonymsTable.setCurrentPara(para)
      }
    },
    deleteItem(para, callback) {
      const id = para.id
      const url = `${this.$url}/service/synonym/?id=${id}`

      this.$http
        .delete(url)
        .then(res => {
          this.$message.success(this.$t('system.systemSetting.delSucceed'))
          // this.refreshTable();
          const para = {
            keyword: this.lastPara.keyword || '',
            currentPage: 1,
            pageSize: this.lastPara.pageSize || 20,
          }
          this.setCurrentPara(para)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    // async delete  synonyms item
    async deleteItemAsync(para, callback) {
      const id = para.id
      const url = `${this.$url}/service/synonym/?id=${id}`

      await this.$http.delete(url)
      callback && callback()
    },

    deleteBatch() {
      const arr = this.selection.map(item => {
        const obj = {
          id: item.id,
        }
        return obj
      })
      // let arr = this.selection.map(item => {id:item.id});
      const callback = () => {
        this.$message.success(this.$t('system.systemSetting.delSucceed'))
        // this.refreshTable();
        const para = {
          keyword: this.lastPara.keyword || '',
          currentPage: 1,
          pageSize: this.lastPara.pageSize || 20,
        }
        this.setCurrentPara(para)
      }
      const para = {
        fun: this.deleteItemAsync,
        paraArr: arr,
        callback,
      }
      this.$DatablauCofirm(
        this.$t('system.systemSetting.delConfirm'),
        this.$t('system.systemSetting.tips'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(() => {
          this.seriesFunCallback(para)
        })
        .catch(e => console.info(e))
    },
    seriesFunCallback({ fun, paraArr, callback }) {
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
    },
    // tableLayout() {
    //   if (
    //     this.$refs.synonymsTable &&
    //     this.$refs.synonymsTable.resetTableStyle
    //   ) {
    //     this.$refs.synonymsTable.resetTableStyle()
    //   }
    // },
  },
  watch: {},
}
</script>

<style lang="scss" scoped>
$primary-color: #409eff;
.synonyms-tab {
  .synonyms-table {
    margin-right: 20px;
  }
  .bottom-btn-container {
    .row-page-footer {
      margin-left: -10px;
      white-space: nowrap;

      .check-info {
        display: inline-block;
        width: 14px;
        height: 14px;
        margin-right: -13px;
        vertical-align: middle;
        background: $primary-color;
      }

      .footer-span {
        margin-right: 10px;
        color: rgba(85, 85, 85, 1);

        &::before {
          margin-right: 5px;
          font-family: 'element-icons';
          font-size: 12px;
          font-weight: 200;
          line-height: 14px;
          color: white;
          vertical-align: middle;
          content: '\e6da';
        }
      }

      .footer-button {
        width: 66px;
        height: 30px;
        line-height: 30px;
      }
    }
  }
}

.synonyms-tooltip {
  margin-bottom: 5px;
  .fake-label {
    font-size: 12px;
    margin-left: 5px;
    height: 12px;
    color: #555;
  }
}
.synonyms-textarea {
  display: inline-block;
  /deep/ .el-textarea__inner {
    height: 160px !important;
  }
}
</style>
