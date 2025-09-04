<template>
  <div class="process-center-tab">
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      :append-to-body="true"
      width="600px"
      class="start-process-dia"
      :close-on-click-modal="false"
    >
      <div class="start-dialog-body">
        <el-form
          ref="processDia"
          label-position="right"
          label-width="110px"
          size="small"
          :model="applyData"
          :rules="editRules"
        >
          <el-form-item
            :label="item.name"
            :prop="item.name"
            v-for="item in applyPropArr"
            :key="item.id"
          >
            <el-input-number
              v-model="applyData[item.name]"
              size="mini"
              clearable
              :placeholder="`请输入${item.name}`"
              v-if="item.dataType === 'long'"
              :disabled="item.disabled"
            ></el-input-number>
            <el-date-picker
              v-model="applyData[item.name]"
              v-else-if="item.dataType === 'date'"
              type="date"
              placeholder="选择日期"
              :disabled="item.disabled"
            ></el-date-picker>
            <span v-else-if="item.dataType === 'boolean'">
              <el-radio
                v-model="applyData[item.name]"
                :disabled="item.disabled"
                label="true"
              >
                是
              </el-radio>
              <el-radio
                v-model="applyData[item.name]"
                :disabled="item.disabled"
                label="false"
              >
                否
              </el-radio>
            </span>
            <el-select
              :placeholder="`请选择${item.name}`"
              v-model="applyData[item.name]"
              filterable
              v-else-if="item.dataType === 'enum'"
              :disabled="item.disabled"
            >
              <el-option
                v-for="value in item.enumSelect"
                :key="value"
                :value="value"
                :label="value"
              ></el-option>
            </el-select>
            <el-input
              v-model="applyData[item.name]"
              size="mini"
              clearable
              :placeholder="`请输入${item.name}`"
              type="textarea"
              v-else
              :disabled="item.disabled"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="models-dialog-footer">
        <el-button
          type="primary"
          @click="saveEditObj"
          class=""
          :disabled="disabledSave"
        >
          发起流程
        </el-button>
        <el-button @click="dialogVisible = false"> {{ $t('common.button.cancel') }} </el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="配置审批人"
      :visible.sync="setUserDialogShow"
      :append-to-body="true"
      width="600px"
      class="choose-user-list"
      :close-on-click-modal="false"
    >
      <div class="user-dialog-body" v-if="setUserDialogShow">
        <choose-user-list
          @saveChoosedUser="saveChoosedUser"
          @cancelSave="setUserDialogShow = false"
          :choosedUser="choosedUser"
        ></choose-user-list>
      </div>
    </el-dialog>
    <datablau-tab-with-eltable
      class="table-tab-container"
      ref="modelsTable"
      :totalShow="totalShow"
      :columnDefs="columnDefs"
      :getShowData="getShowData"
      :hideTopLine="hideTopLine"
      :hideBottomLine="hideTopLine"
      :tableOption="tableOption"
      :tableHidePagination="tableHidePagination"
      :defaultParaData="defaultParaData"
    >
      <!-- @gridSelectionChanged="gridSelectionChanged" -->
      <div class="right-btn-container" slot="header">
        <!-- <el-button
          type="primary"
          size="mini"
          @click="showAddDialog"
        >添 加</el-button> -->
        <el-button size="mini" @click="refreshTable">刷 新</el-button>
      </div>
      <!-- <div class="bottom-btn-container" slot="footer">
        <el-button
          type="danger"
          size="small"
          class="delete-btn"
          @click="deleteBatch"
          :disabled="!couldDeleteBatch"
        >删 除</el-button>
      </div> -->
    </datablau-tab-with-eltable>
  </div>
</template>

<script>
import moment from 'moment'
import chooseUserList from './chooseUserList.vue'
export default {
  data() {
    return {
      // *** tab with table ***
      totalShow: 0,
      columnDefs: [],
      hideTopLine: false,
      tableOption: {
        rowSelection: 'single',
      },
      tableHidePagination: false,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20,
      },
      selection: [],
      modelMap: {},

      // *** edit dialog ***
      dialogVisible: false,
      applyData: {},
      dialogTitle: '发起流程',
      isAddModel: false,
      applyPropArr: [],
      editRules: {},

      editOriginData: null,

      // set user dialog
      setUserDialogShow: false,
      choosedUserList: [],
      currentProcessData: null,
      choosedUser: [],
      defaultApplyName: '视图申请',
      centerDelete: [
        'columnDefs',
        'applyPropArr',
        'choosedUserList',
        'choosedUser',
      ],
    }
  },
  components: {
    chooseUserList,
  },
  beforeMount() {
    const formatterTime = data => {
      const t = this.$timeFormatter(data.value)
      return t
    }
    const columnDefs = [
      // {
      //   type: ['selectionCheckboxColumn'],
      // },
      {
        type: ['firstEmptyColumn'],
      },
      // {
      //   headerName: '序号',
      //   field: 'domainName',
      //   tooltipField: 'domainName',
      //   width: 150,
      //   // type: ['customSortCol'],
      // },
      {
        headerName: '名称',
        field: 'name',
        tooltipField: 'name',
        minWidth: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '描述',
        field: 'description',
        tooltipField: 'description',
        minWidth: 300,
        // type: ['customSortCol'],
      },
      // {
      //   headerName: 'key',
      //   field: 'key',
      //   tooltipField: 'key',
      //   width: 150,
      //   // type: ['customSortCol'],
      // },
      // {
      //   headerName: '版本',
      //   field: 'version',
      //   tooltipField: 'version',
      //   width: 150,
      //   // type: ['customSortCol'],
      // },
      {
        headerName: '操作',
        width: 150,
        type: ['optionsWithContent'],
        cellRendererParams: {
          tabComponent: this,
          options: [
            // {name: 'edit', text: '发起流程', method: 'handleApply'},
            // {name: 'bind', text: '绑定流程', method: 'bandProcess'},
            { name: 'setApproval', text: '配置审批人', method: 'setApproval' },
          ],
        },
      },
    ]
    this.columnDefs = columnDefs
  },
  computed: {
    disabledSave() {
      let bool = false
      if (this.editRules) {
        for (const key in this.editRules) {
          if (!this.applyData || !this.applyData[key]) {
            bool = true
          }
        }
      }
      return bool
    },
    couldDeleteBatch() {
      const arr = this.selection
      return arr && Array.isArray(arr) && arr.length > 0
    },
  },
  mounted() {},
  beforeDestroy() {
    //     this.centerDelete.forEach(item => {
    //       if (typeof this[item] === 'object' && this[item]) {
    //         Object.keys(this[item]).forEach(o => {
    //           this[item][o] = null
    //         })
    //       }
    //       this[item] = ; if (window.CollectGarbage) { window.CollectGarbage() }
    //     })
  },
  methods: {
    // *** tab with table ***
    getShowData(para) {
      return new Promise((resolve, reject) => {
        const currentPage = para.currentPage
        const pageSize = para.pageSize
        const keyword = para.keyword || ''
        let url = `${this.$url}/service/workflow/process/`
        const body = {
          name: keyword,
          pageSize: pageSize + '',
          currentPage: currentPage + '',
        }
        url = `${this.$url}/service/workflow/process/?name=${keyword}&pageSize=${pageSize}&currentPage=${currentPage}`

        // this.$http.post(url, body)
        this.$http
          .get(url)
          .then(res => {
            const map = {}
            const data = res.data
            let value = data.content
            const result = []
            if (value && Array.isArray(value)) {
              value.forEach(item => {
                if (item.name === this.$processMap.applyData) {
                  this.currentProcessData = item
                  result.push(item)
                }
                if (
                  this.$workflowStatus &&
                  this.$workflowStatus.workflow_domain_enable &&
                  this.$workflowStatus.workflow_enable
                ) {
                  if (item.name === this.$processMap.dataStandard) {
                    result.push(item)
                  }
                }
                //   map[item.id] = item;
                //   item.createTime = moment(item.createTime).valueOf();
                //   item.lastUpdateTime = moment(item.lastUpdateTime).valueOf();
                //   if (item.metaInfo) {
                //     item.description = item.metaInfo.description;
                //     item.revision = item.metaInfo.revision;
                //   }
              })
              value = result
            } else {
              value = []
            }
            this.totalShow = value.length
            this.modelMap = map
            resolve(value)
          })
          .catch(e => {
            this.$showFailure(e)
            reject(e)
          })
      })
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
      this.isAddModel = true
      this.applyData = {
        name: '',
        key: '',
        description: '',
      }
      // for(let key in this.applyData) {
      //   this.applyData[key] = '';
      // }
      this.dialogVisible = true
    },
    showEditDialog({ data, api, e }) {
      //
      this.isAddModel = false
      let metaInfo = data.metaInfo
      if (this.$utils.isJSON(metaInfo)) {
        metaInfo = JSON.parse(metaInfo)
      } else {
        metaInfo = {}
      }
      this.applyData = {
        name: data.name,
        key: data.key,
        description: metaInfo.description || '',
        id: data.id,
      }
      this.dialogVisible = true
    },
    deleteModel({ data, api, e }) {
      // let id = data.id;
      // let url = `${this.$url}/service/model/?id=${id}`;

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
      //
      // });

      this.$confirm('删除后不可恢复，确认删除？', '提示', {
        type: 'warning',
        closeOnClickModal: false,
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
    },
    saveEditObj() {
      if (this.$refs.processDia && this.$refs.processDia.validate()) {
        const oriData = _.cloneDeep(this.editOriginData)

        const startProcessData = {}
        startProcessData.proDefId = oriData.id
        startProcessData.proDefName = oriData.name
        const formData = []

        const formProperties = oriData.formProperties
        if (formProperties && Array.isArray(formProperties)) {
          formProperties.forEach(item => {
            item.value = this.applyData[item.name] || ''
            if (item.value !== '') {
              formData.push(item.id + '=' + item.value)
            }
          })
        }

        startProcessData.formData = formData

        const url = `${this.$url}/service/workflow/process/apply`

        this.$http
          .post(url, startProcessData)
          .then(res => {
            this.$message.success('发起成功')
            this.dialogVisible = false
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$showFailure('内容不能为空')
      }
    },
    refreshTable() {
      if (this.$refs.modelsTable && this.$refs.modelsTable.refreshData) {
        this.$refs.modelsTable.refreshData()
      }
    },
    deleteItem(para, callback) {
      const id = para.id
      const url = `${this.$url}/service/workflow/model/?id=${id}`

      this.$http
        .delete(url)
        .then(res => {
          this.$message.success('删除成功')
          this.refreshTable()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    handleApply({ data, api, e }) {
      this.dialogTitle = '发起流程：' + data.name
      const id = data.id
      if (!id) return
      const url = `${this.$url}/service/workflow/process/start?proDefId=${id}`
      this.$http
        .get(url)
        .then(res => {
          const data = res.data
          const formProperties = data.formProperties
          const applyData = {}
          const editRules = {}
          const applyPropArr = []
          if (formProperties && Array.isArray(formProperties)) {
            formProperties.forEach(item => {
              const obj = _.cloneDeep(item)
              obj.dataType = obj.type.name
              applyData[item.name] = ''
              if (item.required) {
                editRules[item.name] = {
                  reuqired: item.required,
                  trigger: 'blur',
                  message: '请输入' + item.required,
                }
              }
              if (item.readable) {
                applyPropArr.push(obj)
              }
            })
          }
          this.applyData = applyData
          this.editRules = editRules
          this.applyPropArr = applyPropArr
          if (applyPropArr.length > 0) {
            this.editOriginData = data
            this.dialogVisible = true
          } else {
            this.$message.info('流程内容为空')
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    bandProcess({ data, api, e }) {
      //
      const getUrl = `${this.$url}/service/process/bind/page?currentPage=1&name=&pageSize=50`
      this.$http
        .get(getUrl)
        .then(res => {
          const content = res.data.content
          let editConfigObj = null
          if (content && Array.isArray(content)) {
            content.forEach(item => {
              if (item.name === this.$processMap.applyData) {
                editConfigObj = item
              }
            })
          }

          const createUrl = `${this.$url}/service/process/bind/`
          let method = ''

          if (editConfigObj) {
            method = 'post'
            editConfigObj.proDefId = data.id
            editConfigObj.proDefName = data.name
          } else {
            method = 'put'
            editConfigObj = {
              name: this.$processMap.applyData,
              proDefId: data.id,
              proDefName: data.name,
              callbackFlag: '',
              callbackApi: '',
              apiMethod: '',
              jsonFlag: '',
            }
          }

          this.$http[method](createUrl, editConfigObj)
            .then(res => {
              this.$message.success('绑定成功')
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    setApproval({ data, api, e }) {
      if (data.name === this.$processMap.dataStandard) {
        this.$emit('showAssignee', data)
        return
      }
      const url = `${this.$url}/service/process/bind/name?name=${this.$processMap.applyData}`
      this.$http
        .get(url)
        .then(res => {
          const data = res.data
          this.choosedUser = data.assignee
          this.setUserDialogShow = true
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // getUserList() {
    //   return [];
    // },

    // async delete  models item
    async deleteItemAsync(para, callback) {
      const id = para.id
      const url = `${this.$url}/service/workflow/model/?id=${id}`

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
        closeOnClickModal: false,
      })
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
    tableLayout() {
      if (this.$refs.modelsTable && this.$refs.modelsTable.resetTableStyle) {
        this.$refs.modelsTable.resetTableStyle()
      }
    },
    saveChoosedUser(userList) {
      const currentProcessData = this.currentProcessData
      const para = {
        // id: currentProcessData.id || '',
        id: '',
        name: this.$processMap.applyData,
        proDefId: currentProcessData.id,
        proDefName: currentProcessData.name,
        assignee: _.cloneDeep(userList),
      }
      const url = `${this.$url}/service/process/bind/`
      this.$http
        .post(url, para)
        .then(res => {
          //
          this.$message.success('设置成功')
          this.setUserDialogShow = false
          this.refreshTable()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
  watch: {},
}
</script>

<style lang="scss">
.process-center-tab {
  // border: 1px solid red;
  // position: relative;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  .delete-btn {
    margin-left: 20px;
  }
}
</style>

<style lang="scss">
.start-process-dia {
  .start-dialog-body {
    margin-top: 20px;
    .el-textarea,
    .el-input {
      max-width: 300px;
    }
  }
}
</style>
