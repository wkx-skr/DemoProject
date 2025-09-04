<template>
  <div>
    <div class="table-controller">
      <span>包含对象（{{ totalObjects }}个）</span>
      <div class="search-props">
        <datablau-select
          v-if="level === 0"
          v-model="areaValue"
          placeholder="请选择"
          size="small"
        >
          <el-option
            v-for="item in areaOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </datablau-select>
        <datablau-input placeholder="搜索编号或名称" v-model="keyword" style="margin-left: 10px;"></datablau-input>
        <datablau-button style="margin-left: 10px;" @click="queryTableData">查询</datablau-button>
      </div>
      <div>
        <datablau-button type="important" @click="refreshTableData">刷新</datablau-button>
        <!-- L2主题 -->
        <datablau-button v-if="level < 3" @click="showAddDialog">添加</datablau-button>
      </div>
    </div>
    <datablau-table
      v-loading="loading"
      :data="tableData"
    >
      <el-table-column v-for="c in columns" :key="c.props" :prop="c.prop" :label="c.label">
        <template slot-scope="scope">
          <datablau-button v-if="c.prop === 'name'" type="text" href="javascript:;" @click="OBDetails(scope.row)">{{ scope.row.name }}</datablau-button>
          <datablau-button v-else-if="c.prop === 'categoryId'" type="text" href="javascript:;" @click="showThemes(scope.row)">{{ scope.row.categoryId.length + '个' }}</datablau-button>
          <template v-else-if="c.prop === 'status'">{{ formatStatus(scope.row.status) }}</template>
          <template v-else-if="c.prop === 'lastModifiedTime'">{{ formatTime(scope.row.lastModifiedTime) }}</template>
          <template v-else> <span>{{ scope.row[c.prop] }}</span> </template>
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        width="190px"
      >
        <template slot-scope="scope">
          <datablau-button @click="handleOperate(scope.row, 0)" type="text" class="bingBtn">绑定对象</datablau-button>
          <datablau-button @click="handleOperate(scope.row, 3)" type="text" :class="{'bingBtn':true, 'unClick': !scope.row.bindId}" >绑定实体</datablau-button>
          <datablau-button @click="handleOperate(scope.row, 1)" type="text" class="bingBtn">编辑</datablau-button>
          <datablau-button @click="handleOperate(scope.row, 2)" type="text" class="bingBtn">删除</datablau-button>
        </template>
      </el-table-column>
    </datablau-table>
    <div style="margin-top: 10px; float: right;">
      <datablau-pagination
        :current-page='paginationData.currentPage'
        :total="paginationData.total"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="paginationData.pageSize"
        @size-change="s => handlePaginationChange({pageSize: s})"
        @current-change="p => handlePaginationChange({currentPage: p - 1})"
      />
    </div>
    <!-- L2编辑的对话框 -->
    <datablau-dialog title="编辑" :visible.sync="objectEditVisible" :before-close="resetEditObjectData">
      <datablau-form :model="activeData" label-width="80px" :rules="objectAddRules" ref="objectEditForm">
        <el-form-item label="名称" prop="name">
          <datablau-input v-model="activeData.name" autocomplete="off" size="small"></datablau-input>
        </el-form-item>
        <el-form-item label="描述">
          <datablau-input v-model="activeData.description" type="textarea" :rows="2" autocomplete="off" size="small"></datablau-input>
        </el-form-item>
        <el-form-item v-if="level ===0 || level === 1" label="主题" prop="categoryId">
          <div>
            <el-select v-model="activeData.categoryId" multiple size="small">
              <el-option v-for="t in themeList" :key="t.value" :value="t.value" :label="t.label" />
            </el-select>
          </div>
        </el-form-item>
        <el-form-item label="编号" prop="code">
          <datablau-input v-model="activeData.code" autocomplete="off" size="small" disabled></datablau-input>
        </el-form-item>
      </datablau-form>
      <div slot="footer" class="dialog-footer">
        <datablau-button type="secondary" @click="resetEditObjectData">取 消</datablau-button>
        <datablau-button type="important" @click="submitDialog" :disabled="btnDisable">确 定</datablau-button>
      </div>
    </datablau-dialog>
    <!-- L2主题 添加对话框 -->
    <datablau-dialog title="添加" :visible.sync="objectDialogVisible" :before-close="resetNewObjectData">
      <datablau-form :model="newObjectData" label-width="80px" :rules="objectAddRules" ref="newObjectForm">
        <el-form-item label="名称" prop="name">
          <el-autocomplete
            class="inline-input"
            v-model="newObjectData.name"
            value-key="name"
            :fetch-suggestions="queryObjectByName"
            placeholder="请输入业务对象名称"
            :trigger-on-focus="false"
            @select="handleSelectObject"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="描述">
          <datablau-input v-model="newObjectData.description" type="textarea" :rows="2" autocomplete="off" placeholder="请输入业务对象描述" :disabled="!editable" style=""></datablau-input>
        </el-form-item>
        <el-form-item v-if="level ===0 || level === 1" label="主题" prop="categoryId" style="width: 100%;">
          <el-select v-model="newObjectData.categoryId" multiple>
            <el-option v-for="t in themeList" :key="t.value" :value="t.value" :label="t.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="编号" prop="code">
          <datablau-input v-model="newObjectData.code" autocomplete="off" placeholder="请输入业务对象编号" :disabled="!editable"></datablau-input>
        </el-form-item>
      </datablau-form>
      <div slot="footer" class="dialog-footer">
        <datablau-button type="secondary" @click="resetNewObjectData">取 消</datablau-button>
        <datablau-button type="important" @click="submitNewObjectData" :disabled="btnDisable">确 定</datablau-button>
      </div>
    </datablau-dialog>
    <!-- L2主题 删除确认对话框 -->
    <datablau-dialog title="确认删除" :visible.sync="objectDeleteVisible" width="500px">
      <span v-if="level === 0"><i class="el-icon-question"></i>所选的对象将被彻底在模型中删除？</span>
      <span v-else><i class="el-icon-question"></i>所选的对象将被删除，请确认您将在当前{{ level === 1 ? '领域' : level === 2 ? '主题' : '' }}下删除，还是彻底在模型中删除？</span>
      <div slot="footer" class="dialog-footer">
        <datablau-button v-if="level !== 0" type="important" @click="deleteObject(0)" :disabled="btnDisable">当前{{ level === 1 ? '领域' : level === 2 ? '主题' : '' }}</datablau-button>
        <datablau-button type="important" @click="deleteObject(1)" :disabled="btnDisable">{{ level === 0 ? '确定' : '永久删除' }}</datablau-button>
        <datablau-button type="secondary" @click="objectDeleteVisible = false">取消</datablau-button>
      </div>
    </datablau-dialog>
    <!-- 主题对话框 -->
    <datablau-dialog title="主题" :visible.sync="themeDialogVisible" width="500px">
      <datablau-table :data="themeDataDetails">
        <el-table-column label="名称" prop="name">
          <template slot-scope="scope"><datablau-button type="text" @click="showThemeDetails(scope.row.id)">{{ scope.row.name }}</datablau-button></template>
        </el-table-column>
        <el-table-column label="简称" prop="alias"></el-table-column>
        <el-table-column label="描述" prop="description"></el-table-column>
      </datablau-table>
      <!-- <div slot="footer" class="dialog-footer">
        <datablau-button type="important" @click="themeDialogVisible = false">确定</datablau-button>
      </div> -->
    </datablau-dialog>
    <!--    绑定对话框-->
<!--    <datablau-dialog title="绑定业务对象" :visible.sync="binObject" width="500px" @close="webFlag = !webFlag">-->
      <bin-model @clientId="getClientId" :bindId="webItem.bindId" :binObject="binObject" :webFlag="webFlag"  @close="modelClose"></bin-model>
      <entity-binding :dataJson="binding" :flagClear="flagClear" :binFlag="binFlag" @close="bingingClose"></entity-binding>

  </div>
</template>

<script>
import HTTP from '@/resource/http'
// import Table from './table.vue'
import BinModel from '@/views/enterprise/component/binModel'
import entityBinding from './entityBinding'

import cellRenderer from '@/datablauComponents/Grid/cellRenderer'
export default {
  components: { BinModel, entityBinding },
  props: {
    level: {
      type: Number,
      default: 0
    },
    parentData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  // components: { Table },
  data () {
    return {
      totalObjects: 0,
      objectAddRules: {
        name: [{ required: true, message: '请输入业务对象名称', trigger: 'blur' }],
        code: [{ required: true, message: '请输入业务对象编号', trigger: 'blur' }],
        categoryId: [{ type: 'array', required: true, message: '请选择主题', trigger: 'change' }]
      },
      areaOptions: [],
      tableData: [],
      loading: false,
      columns: [{
        prop: 'name',
        label: '对象名称'
      }, {
        prop: 'code',
        label: '编号'
      }, {
        prop: 'description',
        label: '描述'
      }, {
        prop: 'status',
        label: '状态'
      }, {
        prop: 'categoryId',
        label: '主题'
      }, {
        prop: 'lastModifiedTime',
        label: '更新时间'
      }],
      paginationData: {
        currentPage: 0,
        total: 0,
        pageSize: 10
      },
      areaValue: '',
      keyword: '',
      activeData: {},
      themeList: [],
      objectEditVisible: false,
      formLabelWidth: '100px',
      objectDialogVisible: false,
      themeStatusOptions: [{
        value: 0,
        label: '草稿'
      }, {
        value: 1,
        label: '发布'
      }, {
        value: 2,
        label: '废弃'
      }],
      editable: true,
      newObjectData: {
        categoryId: [],
        code: '',
        name: '',
        description: ''
      },
      objectDeleteVisible: false,
      btnDisable: false,
      binObject: false,
      webItem: '', // 绑定业务对象的id
      webFlag: false,
      themeDataDetails: [],
      themeDialogVisible: false,
      binFlag: false,
      binding: {
        bindTil: '',
        id: ''
      },
      flagClear: false
    }
  },
  methods: {
    // 格式化业务对象状态
    formatStatus (s) {
      if (s === 'NotSubmitted') return '未提交'
      if (s === 'UnderReview') return '未审核'
      if (s === 'Published') return '已发布'
      return ''
    },
    // 格式化时间
    formatTime (val) {
      let data = new Date(parseInt(val))
      let year = data.getFullYear()
      let month = data.getMonth() + 1
      let dates = data.getDate()
      let hours = data.getHours()
      let minute = data.getMinutes()
      let second = data.getSeconds()
      return `${year}-${month < 10 ? '0' + month : month}-${dates < 10 ? '0' + dates : dates} ${hours < 10 ? '0' + hours : hours}:${minute < 10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}`
    },
    // 查询表格数据
    queryTableData (params = {}) {
      if (this.parentData.id) {
        const queryParams = {
          categoryId: this.areaValue || this.parentData.id,
          content: this.keyword,
          currentPage: params.currentPage ? params.currentPage : 0,
          pageSize: params.pageSize ? params.pageSize : 10
        }
        this.loading = true
        HTTP.getObjectList({ ...queryParams }).then(res => {
          this.totalObjects = res.totalElements
          this.tableData = res.content
          this.paginationData = {
            currentPage: queryParams.currentPage,
            pageSize: queryParams.pageSize,
            total: res.totalElements
          }
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      }
    },
    // 刷新数据
    refreshTableData () {
      // console.log('刷新')
      this.queryTableData(this.paginationData)
    },
    handleOperate (row, type) {
      // 绑定
      if (type === 0) {
        this.binObject = true
        this.webFlag = false
        this.webItem = row
      }
      // 编辑
      if (type === 1) {
        const { ownCategory, otherCategory } = this.filterCategoryId(row.categoryId)
        this.activeData = {
          ...row,
          categoryId: ownCategory,
          otherCategory
        }
        this.activeData.otherCategory = otherCategory
        this.objectEditVisible = true
      }
      if (type === 2) {
        this.activeData = row
        // 删除
        this.objectDeleteVisible = true
      }
      if (type === 3) {
        if (!row.bindId) {
          return
        }
        this.binFlag = true
        this.binding.bindTil = `绑定实体`
        this.binding.id = row.bindId
      }
    },
    // 获取绑定的表id
    getClientId (id) {
      let params = {
        webBusinessObjectId: this.webItem.id,
        clientBusinessObjectId: id
      }
      HTTP.binModel(params).then(res => {
        this.binObject = false
        let mess = ''
        id ? mess = '绑定对象成功' : mess = '解绑成功'
        this.$message.success(mess)
        this.queryTableData(this.paginationData)
      })
    },
    bingingClose () {
      this.binFlag = false
      this.flagClear = !this.flagClear
    },
    modelClose () {
      this.binObject = !this.binObject
      this.webFlag = !this.webFlag
    },
    filterCategoryId (categoryIds) {
      const otherCategory = []
      const ownCategory = []
      categoryIds.forEach(c => {
        const t = this.themeList.find(t => t.value === c)
        if (t) {
          ownCategory.push(c)
        } else {
          otherCategory.push(c)
        }
      })
      return { ownCategory, otherCategory }
    },
    deleteObject (type) {
      this.btnDisable = true
      // 在当前主题或当前领域删除
      if (type === 0) {
        // console.log('在当前主题或领域下删除===>', this.activeData)
        const { categoryId } = this.activeData
        // 从当前领域下删除
        if (this.level === 1) {
          // console.log(this.themeList)
          this.themeList.forEach(t => {
            const index = categoryId.indexOf(t.value)
            if (index) {
              categoryId.splice(index, 1)
            }
          })
        }
        // 从当前主题下删除
        if (this.level === 2) {
          const index = categoryId.indexOf(this.parentData.id)
          categoryId.splice(index, 1)
        }
        if (this.activeData.id) {
          HTTP.updateObject({
            ...this.activeData,
            categoryId
          }).then(res => {
            // console.log(res)
            if (!res.errorMessage) {
              this.alertMessage('删除成功', 'success')
              this.resetEditObjectData()
              this.refreshTableData()
              this.btnDisable = false
            } else {
              this.alertMessage(res.errorMessage, 'error')
              this.btnDisable = false
            }
          }).catch(() => {
            this.btnDisable = false
          })
        } else {
          this.btnDisable = false
        }
      }
      // 永久删除
      if (type === 1) {
        // console.log('永久删除===>', this.activeData)
        if (this.activeData.id) {
          HTTP.deleteObjectFromSystem({
            id: this.activeData.id
          }).then(res => {
            // console.log(res)
            if (!res) {
              // console.log(res)
              this.resetEditObjectData()
              this.alertMessage('删除成功', 'success')
              this.refreshTableData()
              this.btnDisable = false
            } else {
              this.alertMessage(res.errorMessage, 'success')
              this.btnDisable = false
            }
          }).catch(() => {
            this.btnDisable = false
          })
        } else {
          this.btnDisable = false
        }
      }
    },
    alertMessage (message, type) {
      this.$message({
        message,
        type,
        center: true
      })
    },
    handlePaginationChange (np) {
      console.log(np)
      const pagination = { ...this.paginationData, ...np }
      // 请求数据
      this.queryTableData(pagination)
    },
    // 添加业务对象时，根据名称模糊查询业务对象
    queryObjectByName (s, cb) {
      // console.log(s)
      HTTP.getObjectListByName({
        name: this.newObjectData.name
      }).then(res => {
        // console.log(res)
        if (res.content && res.content.length !== 0) {
          cb(res.content)
        } else {
          this.newObjectData.description = ''
          this.newObjectData.code = ''
          this.editable = true
          cb(res.content || [])
        }
      })
    },
    // 选择系统中已有的业务对象
    handleSelectObject (o) {
      const { categoryId = [] } = o
      const { ownCategory, otherCategory } = this.filterCategoryId(categoryId)
      this.newObjectData = { ...o, categoryId: ownCategory, otherCategory }
      if (this.level === 2) this.newObjectData.categoryId.push(this.parentData.id)
      this.editable = false
    },
    submitDialog () {
      // console.log('提交编辑结果')
      this.$refs.objectEditForm.validate(valid => {
        if (valid) {
          const { categoryId, otherCategory = [] } = this.activeData
          HTTP.updateObject({
            ...this.activeData,
            categoryId: categoryId.concat(otherCategory)
          }).then(res => {
            if (!res.errorMessage) {
              this.alertMessage('修改成功', 'success')
              this.resetEditObjectData()
              this.refreshTableData()
            } else {
              this.alertMessage(res.errorMessage, 'error')
            }
          }).catch(e => {
            this.alertMessage(e.errorMessage, 'error')
          })
          this.resetEditObjectData()
        }
      })
    },
    // 展示 业务对象 添加模态框
    showAddDialog () {
      // console.log('添加')
      if (this.parentData.type === 'Subject') {
        this.newObjectData.categoryId = [this.parentData.id]
      }
      this.objectDialogVisible = true
    },
    // 主题选项（添加业务对象）和领域选项（查询业务对象）
    getThemeList () {
      const tl = []
      if (this.parentData.type && this.parentData.type !== 'Subject') {
        HTTP.categoryTreeById({
          categoryId: this.parentData.id
        }).then(data => {
          const areaData = [{
            value: '',
            label: '所有领域'
          }]
          const baseCA = this.parentData.name
          for (let i = 0; i < data.length; i++) {
            const data1 = data[i]
            const ca1 = data[i].name
            if (this.level === 0) {
              areaData.push({
                value: data1.id,
                label: ca1
              })
            }
            if (data1.type !== 'Subject') {
              const dc = data[i].child
              for (let j = 0; j < dc.length; j++) {
                tl.push({
                  value: dc[j].id,
                  label: `${baseCA}/${ca1}/${dc[j].name}`
                })
              }
            } else {
              tl.push({
                value: data1.id,
                label: `${baseCA}/${ca1}`
              })
            }
          }
          // console.log(tl, areaData)
          this.areaOptions = areaData
          this.themeList = tl
        })
      }
    },
    // 提交新增的业务对象
    submitNewObjectData () {
      this.$refs.newObjectForm.validate(valid => {
        if (valid) {
          const submit = this.editable ? HTTP.addObject : HTTP.updateObject
          const { categoryId, otherCategory = [] } = this.newObjectData
          this.btnDisable = true
          submit({ ...this.newObjectData, categoryId: categoryId.concat(otherCategory) }).then(res => {
            if (!res.errorMessage) {
              this.alertMessage('添加成功', 'success')
              this.refreshTableData()
              this.resetNewObjectData()
              this.btnDisable = false
            } else {
              this.alertMessage(res.errorMessage, 'error')
              this.btnDisable = false
            }
          }).catch(() => {
            this.btnDisable = false
          })
        }
      })
    },
    resetEditObjectData () {
      this.activeData = {
        name: '',
        description: '',
        code: '',
        categoryId: []
      }
      this.$refs.objectEditForm && this.$refs.objectEditForm.resetFields()
      this.objectEditVisible = false
      this.objectDeleteVisible = false
    },
    resetNewObjectData () {
      this.newObjectData = {
        name: '',
        code: '',
        description: '',
        categoryId: []
      }
      this.$refs.newObjectForm && this.$refs.newObjectForm.resetFields()
      this.editable = true
      this.objectDialogVisible = false
    },
    OBDetails (row) {
      this.$bus.$emit('showLowerData', { parentData: this.parentData, row })
    },
    showThemes (row) {
      // 获取业务对象相关的主题
      console.log(row.categoryId)
      HTTP.getThemeListByCategoryId({ ids: (row.categoryId || [].join(',')) }).then(res => {
        this.themeDataDetails = res
        this.themeDialogVisible = true
      })
    },
    showThemeDetails (id) {
      this.themeDialogVisible = false
      this.$bus.$emit('nextTickMethod', id)
    }
  },
  watch: {
    parentData: {
      handler (v, preV) {
        if (v.id) {
          // this.totalObjects = 200
          this.getThemeList()
          this.queryTableData()
        }
      },
      immediate: true,
      deep: true
    }
  }
}
</script>

<style>
.table-controller{
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.el-form.db-form .datablau-input[type='textarea']{
  width: 100%;
}
.el-dialog__wrapper .el-dialog .el-dialog__header .el-dialog__headerbtn{
  top: 10px!important;
}
.search-props{
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.search-props .el-select > .el-input{
  width: 100px;
}
.table-controller .el-button{
  margin-left: 10px;
}
.el-button{
  border-radius: 5px;
}
.el-autocomplete, .el-select{
  width: 100%;
}
.el-textarea__inner{
  font-family: system-ui;
}
</style>
<style scoped lang='scss'>
  .bingBtn {
    padding: 0;
  }
  .unClick.text{
    color: #999;
    cursor: no-drop;
    &:hover{
    color: #999;
     }
  }
</style>
