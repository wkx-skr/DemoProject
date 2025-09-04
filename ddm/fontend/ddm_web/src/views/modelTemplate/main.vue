<template>
  <div class="model-template-wrapper">
    <div class="header clearfixed">
      <div>实体模板管理</div>
    </div>
    <div class="top-title">
      <div class="search-box">
        <!--请输入关键字-->
        <datablau-input
          class="search-input"
          v-model="keyword"
          placeholder="搜索"
          size="small"
          @input="filter"
          :clearable="true"
          prefix-icon="el-icon-search"
          :iconfont-state="true"
          style="line-height: 32px;"
        ></datablau-input>
        <datablau-button
        type="important"
        style="float: right;"
        @click="addTemplate"
        >
        新建
        </datablau-button>
      </div>
    </div>
    <div class="table-content">
      <datablau-form-submit>
        <datablau-table
          ref="templateList"
          class="project-data-list"
          :data="templateListShow"
          @sort-change="handleSortChange"
          height="100%"
          row-key="id"
          :data-selectable="option.selectable"
          :auto-hide-selection="option.autoHideSelectable"
          :show-column-selection="option.showColumnSelection"
          :checkDisabledObj="checkDisabledObj"
          @selection-change="handleSelectionChange"
          :reserveSelection="true">
          <el-table-column
            label="模板名称"
            prop="name"
            sortable="custom"
          >
            <template slot-scope="scope">
              <datablau-list-icon iconType="svg" dataType="table"></datablau-list-icon>
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column
            label="更新人"
            prop="updater"
            sortable="custom"
            :width="200"
          >
          </el-table-column>
          <el-table-column
            label="更新时间"
            prop="updateTime"
            sortable="custom"
            :width="140"
          >
            <template slot-scope="scope">
              {{scope.row.updateTime ? $timeFormatter(scope.row.updateTime) : ''}}
            </template>
          </el-table-column>
          <!--<el-table-column-->
          <!--  label="状态"-->
          <!--  prop="enabled"-->
          <!--  sortable="custom"-->
          <!--&gt;-->
          <!--  <template slot-scope="scope">-->
          <!--    {{scope.row.enabled ? '已发布' : '未发布'}}-->
          <!--  </template>-->
          <!--</el-table-column>-->
          <el-table-column
            :label="$v.customStatus.EnableStatus"
            width="100"
            align="center"
          >
            <template slot-scope="scope">
              <datablau-switch
              style="margin-right: 5px;"
                v-model="scope.row.enabled"
                :active-value="true"
                :inactive-value="false"
                @change="updateStatus($event,scope.row)"
                >
                <!--:active-text="scope.row.enabled ? $v.customStatus.Enable : $v.customStatus.Disable"-->
              </datablau-switch>
              <!--<span v-if="scope.row.modelPhaseForbidden">{{$v.customStatus.Disable}}</span>-->
              <!--<span v-else>{{$v.customStatus.Enable}}</span>-->
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="180"
            fixed="right"
            header-align="center"
            align="center"
          >
            <template slot-scope="scope">
              <datablau-button tooltipContent="查看" type="icon"  class="iconfont icon-see" @click="scanDetail(scope.row)"></datablau-button>
              <datablau-button tooltipContent="编辑" type="icon"  class="iconfont icon-bianji" @click="editTemplate(scope.row)"></datablau-button>

              <!--<datablau-button tooltipContent="发布" v-if="!scope.row.enabled" type="icon" @click="publishTemplateList([scope.row])" class="iconfont icon-publish"></datablau-button>-->
              <datablau-button tooltipContent="删除" type="icon" @click="deleteTemplateList([scope.row])" class="iconfont icon-delete" :disabled="scope.row.enabled"></datablau-button>
            </template>
          </el-table-column>
        </datablau-table>
        <template slot="buttons">
          <div v-if="multipleSelection.length" style="float: left">
            <!--<span>已选{{multipleSelection.length}}个模板</span>-->
            <span>{{$t('common.deleteMessage', {selection: multipleSelection.length})}}</span>
            <datablau-button style="display: inline-block;margin-left: 6px;" tooltipContent="启用"  @click="publishTemplateList(multipleSelection)" class="iconfont icon-publish">
              启用
            </datablau-button>
            <datablau-button
                tooltipContent="删除"
                @click="deleteTemplateList(multipleSelection)"
                class="iconfont icon-delete"
                type="danger"
            >
              删除
            </datablau-button>
          </div>
          <datablau-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            :total="total"
            :layout="'total, sizes, prev, pager, next, jumper'"
          ></datablau-pagination>
        </template>
      </datablau-form-submit>
    </div>
    <datablau-dialog
          :visible.sync="templateVisible"
          :title="scanDisabled ? '实体模版查看' : (form.id ? '实体模版编辑': '新建模版')"
          size="m"
          append-to-body
          height="500px"
          @close="closeDialog"
        >
          <div class="content">
            <datablau-form
              :model="form"
              ref="form"
              size="small"
              :rules="rules"
              :disabled="scanDisabled"
              label-width="75px"
            >
                <el-form-item label="模版名称" prop="name">
                <datablau-input
                  style="width: 100%"
                  placeholder="请输入模版名称"
                  v-model="form.name"
                ></datablau-input>
              </el-form-item>
              <el-form-item label="分隔符" v-if="scanDisabled===false">
                <datablau-input
                  style="width: 100%"
                  v-model="form.separator"
                ></datablau-input>
              </el-form-item>
              <el-form-item label="模型类型"  prop="type">
                <datablau-select
                    v-model="form.type"
                    @change="changeModelType"
                    clearable
                    filterable
                    class="rule-form-item"
                    style="width: 100%"
                    popperClass="choose-db-type"
                >
                  <el-option-group
                      v-for="group in form.databaseTypeArr"
                      :key="group.type"
                      :label=" group.name">
                    <el-option
                        v-for="item in group.dataSourceTypeList"
                        :value="item.second"
                        :label="item.text2 || item.text"
                        :key="item.second"
                    ></el-option>
                  </el-option-group>
                </datablau-select>
              </el-form-item>
            </datablau-form>
            <datablau-detail-subtitle title="命名规则" mt="20px"></datablau-detail-subtitle>
            <div class="namingRules">
              <div class="ruleLeft" v-if="scanDisabled===false">
                <p v-for="item in propertyList" :key="item.key">
                  <span>{{ item.key }}</span>
                  <datablau-button
                    type="icon"
                    @click="addProperty(item)"
                  >
                    <i class="iconfont icon-tianjia"></i>
                  </datablau-button>
                </p>
              </div>
              <div class="ruleRight">
                <datablau-input
                  style="width: 100%"
                  v-model="form.namingMacro"
                  type="textarea"
                  :disabled="scanDisabled"
                  :autosize="{minRows: 6, maxRows: 6}"
                ></datablau-input>
              </div>
            </div>
          </div>
          <span slot="footer">

            <div  v-if="scanDisabled===false">
              <datablau-button  @click="closeDialog">
                取消
              </datablau-button>
              <datablau-button type="primary" :disabled="form.namingMacro===''||form.name===''||form.type===''" @click="entitytemplateSave">
                确定
              </datablau-button>
            </div>
            <div  v-else>
              <datablau-button  @click="closeDialog">
                关闭
              </datablau-button>
            </div>
          </span>
        </datablau-dialog>
  </div>
</template>

<script>
import sort from '@/resource/utils/sort'
import HTTP from '@/resource/http'
import dbType from '@/components/dataSource/databaseType.js'

export default {
  data () {
    return {
      keyword: '',
      pageSize: 20,
      total: 0,
      currentPage: 1,
      templateList: [],
      templateListShow: [],
      option: {
        selectable: true,
        autoHideSelectable: true,
        showColumnSelection: true
      },
      checkDisabledObj: {
        enabled: [true]
      },
      multipleSelection: [],
      templateVisible: false,
      form: {
        separator: '_',
        namingMacro: '',
        databaseTypeArr: []
      },
      rules: {
        name: [
          {
            required: true,
            message: '请输入模版名称',
            trigger: 'blur'
          }
        ],
        type: [
          {
            required: true,
            message: '请选择模型类型',
            trigger: 'change'
          }
        ]
      },
      propertyList: [],
      databaseTypeListPromise: null,
      scanDisabled: false

    }
  },
  mounted () {
    this.getTemplateList()
  },
  methods: {
    scanDetail (row) {
      this.scanDisabled = true
      this.form = _.cloneDeep(row)

      this.templateVisible = true
      this.getPropertyList('editTemplate', row)
      this.getDatabaseTypePromise()
    },
    closeDialog () {
      this.templateVisible = false
      this.scanDisabled = false
      this.$nextTick(() => {
        this.$refs.form.clearValidate() // 只清除清除验证
      })
    },
    changeModelType (value) {
      const itemToUpdate = this.propertyList.find(item => item.key === '模型类型')
      if (itemToUpdate) {
        itemToUpdate.value = value
      } else {
        this.propertyList.push({ key: '模型类型', value: value })
      }
    },
    // 获取数据库类型
    getDbTypes () {
      this.databaseTypeListPromise && this.databaseTypeListPromise.then(res => {
        this.form.databaseTypeArr = res.data.subTree
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    // 获取数据库类型的 promise
    getDatabaseTypePromise () {
      this.databaseTypeListPromise = new Promise((resolve, reject) => {
        resolve({ data: dbType.DB_TYPE_TREE })
      })
      this.getDbTypes()
    },
    replaceWithKeyValue (result, data) {
      let propertyList = _.cloneDeep(this.propertyList)
      propertyList.sort((a, b) => b.key.length - a.key.length)
      propertyList.forEach(replacement => {
        const regex = new RegExp(replacement.key, 'g')
        result = result.replace(regex, replacement.value)
      })
      return result
    },
    replaceWithKeyKey (result, data) {
      // this.propertyList.forEach(replacement => {
      //   const regex = new RegExp(replacement.value, 'g')
      //   console.log(regex, 'regex1111', replacement.key)
      //   result = result.replace(regex, replacement.key)
      // })
      // console.log(result, 'result')
      let propertyList = _.cloneDeep(this.propertyList)
      propertyList.sort((a, b) => b.value.length - a.value.length)
      propertyList.forEach(replacement => {
        const escapedValue = replacement.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(escapedValue, 'g')
        result = result.replace(regex, replacement.key)
      })
      return result
    },
    escapeRegExp (string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // 转义特殊字符
    },
    entitytemplateSave () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          let searchString = this.propertyList.find(obj => obj.key === '表名').value
          if (this.replaceWithKeyValue(this.form.namingMacro).includes(searchString)) {
            if (this.form.id) {
              let obj = [{
                name: this.form.name,
                namingMacro: this.replaceWithKeyValue(this.form.namingMacro),
                type: this.form.type,
                id: this.form.id,
                separationSymbol: this.form.separator
              }]
              this.$http
                .post(`${this.$url}/entitytemplate/update`, obj)
                .then(res => {
                  this.$datablauMessage.success('修改成功')
                  this.templateVisible = false
                  this.getTemplateList()
                })
                .catch(e => {
                  this.$showFailure(e)
                })
            } else {
              let obj = [{
                name: this.form.name,
                namingMacro: this.replaceWithKeyValue(this.form.namingMacro),
                type: this.form.type,
                separationSymbol: this.form.separator
              }]
              this.$http
                .post(`${this.$url}/entitytemplate/save`, obj)
                .then(res => {
                  this.$datablauMessage.success('创建成功')
                  this.templateVisible = false
                  this.getTemplateList()
                })
                .catch(e => {
                  this.$showFailure(e)
                })
            }
          } else {
            this.$datablauMessage.error(`您的模版命名规则中没有【表名】，请您添加后保存。`)
          }
        }
      })
    },
    editTemplate (row) {
      console.log(row, 'row')
      this.form = _.cloneDeep(row)
      this.form.separator = '_'
      this.templateVisible = true
      this.getPropertyList('editTemplate', row)
      this.getDatabaseTypePromise()
    },
    addTemplate () {
      this.templateVisible = true
      this.form = {
        separator: '_',
        namingMacro: '',
        databaseTypeArr: []
      }
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      this.getPropertyList()
      this.getDatabaseTypePromise()
    },
    addProperty (item) {
      console.log(item, 'item')
      if (this.form.namingMacro !== '') {
        this.form.namingMacro = this.form.namingMacro + this.form.separator + item.key
      } else {
        this.form.namingMacro = item.key
      }
      console.log(this.form.namingMacro, 'this.form.namingMacro')
    },
    getPropertyList (type, row) {
      this.$http
        .get(`${this.$url}/entitytemplate/property/list`)
        .then(res => {
          this.propertyList = res.data
          if (type === 'editTemplate') {
            this.propertyList.push({ key: '模型类型', value: row.type })
            if (this.form.namingMacro) {
              this.form.namingMacro = this.replaceWithKeyKey(this.form.namingMacro)
            }
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
    },
    handleSortChange ({ prop, order }) {
      sort.sort(this.templateList, prop, order)
      this.getPageShowData()
    },
    filter () {
      this.currentPage = 1
      this.getPageShowData()
    },
    publishTemplateList (list) {
      this.$http({
        url: this.$url + '/service/entitytemplate/publish',
        method: 'POST',
        data: list
      }).then(res => {
        this.$datablauMessage.success('启用成功')
        if (list.length === 1) {
          list[0].enabled = true
        } else {
          this.getTemplateList()
        }
        // 清空选中
        this.$refs?.templateList?.clearSelection()
      }).catch(err => {
        this.$showFailure(err)
        this.getTemplateList()
      })
    },
    deleteTemplateList (list) {
      this.$DatablauCofirm('确定删除模板?', 'warning').then(() => {
        this.$http({
          url: this.$url + '/service/entitytemplate/delete',
          method: 'post',
          data: list,
          headers: { 'Content-Type': 'application/json' }
        }).then(res => {
          this.$datablauMessage.success('删除成功')
          // 清空选中
          this.$refs?.templateList?.clearSelection()
          this.getTemplateList()
        }).catch(err => {
          this.$showFailure(err)
        })
      }).catch()
    },
    handleSizeChange (size) {
      this.pageSize = size
      this.getPageShowData()
    },
    handleCurrentChange (current) {
      this.currentPage = current
      this.getPageShowData()
    },
    getPageShowData () {
      if (this.keyword) {
        let filterArr = this.templateList.filter(item => item.name.toLowerCase().indexOf(this.keyword.toLowerCase()) !== -1 || item.updater.toLowerCase().indexOf(this.keyword.toLowerCase()) !== -1) || []
        this.templateListShow = filterArr.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
        this.total = filterArr.length
      } else {
        this.templateListShow = this.templateList.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
        this.total = this.templateList.length
      }
    },
    getTemplateList () {
      this.$http.get(this.$url + '/service/entitytemplate/').then(res => {
        res.data.forEach(element => {
          if (!element.namingMacro) {
            element.namingMacro = ''
          }
        })
        this.templateList = res.data
        sort.sort(this.templateList, 'udpate_time')
        this.currentPage = 1
        this.total = this.templateList.length
        this.getPageShowData()
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    updateStatus (e, row) {
      if (row.enabled) {
        this.publishTemplateList([row])
        this.$refs.templateList.toggleRowSelection(row, false)
      } else {
        this.disableEntityTemplate([row])
      }
    },
    disableEntityTemplate (requestBody) {
      HTTP.disableEntityTemplate(requestBody)
        .then(res => {
          this.$datablauMessage.success('禁用成功')
        })
        .catch(e => {
          this.$showFailure(e)
          this.getTemplateList()
        })
        .finally(() => {

        })
    }
  }
}
</script>

<style scoped lang="scss">
.model-template-wrapper {
  .header {
    height: 40px;
    font-size: 16px;
    line-height: 40px;
    margin-top: -20px;

    div {
      float: left;
      margin-right: 5px;
      font-weight: bold;

    }

    i {
      float: left;
      padding-top: 5px;
      cursor: pointer;
      color: #7D8493;
    }
  }
  .table-content {
    position: absolute;
    top: 75px;
    left: 0;
    right: 0;
    bottom: 0;
  }

}
.namingRules{
    display: flex;
    .ruleLeft{
      width: 30%;
      height: 139px;
      margin-right: 10px;
      border-radius: 4px;
      border: 1px solid #dddddd;
      overflow-y: auto;
      padding: 4px;
      p{
        display: flex;
        align-items: center;
        span{
          display: inline-block;
          width: 90%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
    .ruleRight{
      width:70%
    }
  }
</style>
