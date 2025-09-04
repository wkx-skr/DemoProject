<template>
  <div class="statutory">
    <div v-if="showList" class="padding20">
      <div class="titleTab">安全策略管理</div>
      <datablau-input
        v-model="fileName"
        :iconfont-state="true"
        placeholder="搜索安全策略名称、数据所属部门"
        @keyup.native.enter="searchFileName"
        @clear="searchFileName"
        style="width: 250px"
        clearable
      ></datablau-input>
      <datablau-button
        type="important"
        class="documentBox iconfont icon-tianjia"
        @click="documentsClick"
      >
        新建安全策略
      </datablau-button>
      <datablau-form-submit
        class="table-row"
        ref="tableOuter"
        style="margin-top: 82px"
      >
        <!--        <div class="padding20" v-loading="loading">-->
        <datablau-table
          height="100%"
          v-loading="loading"
          ref="deTable"
          :data-selectable="false"
          :show-column-selection="false"
          @sort-change="sortChange"
          :auto-hide-selection="true"
          :default-sort="{ prop: 'createTime', order: '' }"
          :data="structureList"
          tooltip-effect="dark"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            :selectable="selectable"
            width="18"
          ></el-table-column>
          <el-table-column
            prop="name"
            label="安全策略名称"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="deptName"
            label="数据所属部门"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="creator"
            label="创建人"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="createTime"
            label="创建时间"
            show-overflow-tooltip
            sortable="custom"
          >
            <template scope="{row}">
              {{
                row.createTime
                  .replace(/-/g, '/')
                  .replace(/T/g, ' ')
                  .replace(/\.\d+/g, '')
              }}
            </template>
          </el-table-column>
          <el-table-column
            prop="processName"
            label="操作"
            show-overflow-tooltip
            width="80"
          >
            <template scope="{row}">
              <div class="iconBox">
                <datablau-button type="icon">
                  <datablau-tooltip
                    content="安全策略被引用，不能修改"
                    placement="bottom"
                    effect="dark"
                    v-if="row.ableDelete"
                  >
                    <i
                      class="iconfont icon-bianji"
                      :class="{ green: row.ableDelete }"
                      @click="edit(row)"
                    ></i>
                  </datablau-tooltip>
                  <i
                    class="iconfont icon-bianji"
                    v-if="!row.ableDelete"
                    @click="edit(row)"
                  ></i>
                </datablau-button>
                <datablau-button type="icon">
                  <datablau-tooltip
                    content="安全策略被引用，不能删除"
                    placement="bottom"
                    effect="dark"
                    v-if="row.ableDelete"
                  >
                    <i
                      :class="[
                        'iconfont',
                        'icon-delete',
                        { green: row.ableDelete },
                      ]"
                      @click="delet(row)"
                    ></i>
                  </datablau-tooltip>
                  <i
                    :class="['iconfont', 'icon-delete']"
                    v-if="!row.ableDelete"
                    @click="delet(row)"
                  ></i>
                </datablau-button>
              </div>
            </template>
          </el-table-column>
        </datablau-table>
        <!--        </div>-->
        <template slot="buttons">
          <template v-if="handleSelection.length > 0">
            <span class="check-info"></span>
            <span class="footer-row-info">
              当前选中“{{ handleSelection.length }}条”信息，是否
            </span>

            <datablau-button
              type="danger"
              class="el-icon-delete"
              @click="delectAry"
            >
              删除
            </datablau-button>
          </template>
          <datablau-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            class="left-btn"
          ></datablau-pagination>
        </template>
      </datablau-form-submit>
    </div>
    <div v-else class="otherBox">
      <div class="returnBox">
        <datablau-breadcrumb
          class="title"
          :node-data="nodeData1"
          :couldClick="false"
          :separator="'/'"
          @back="returnList('')"
        ></datablau-breadcrumb>
      </div>
      <newSecurityPolicy
        @documentsClick="policyAdd"
        @rulesDetail="rulesDetail"
        :detailItem="detailItem"
        :oldPolicy="oldPolicy"
        :options="options"
        :securityPolicyRulesDtos="rulesDtosList"
        v-show="addPolicy"
        @cancelbtn="returnList"
        ref="policy"
      ></newSecurityPolicy>
      <addPolicyRules
        v-if="!addPolicy"
        ref="rules"
        :rulesItem="rulesItem"
        :oldRulesItem="oldRulesItem"
        :gradeList="options"
        @addRules="addRules"
        @cancelbtn="returnList"
      ></addPolicyRules>
    </div>
  </div>
</template>

<script>
import newSecurityPolicy from './components/newSecurityPolicy'
import addPolicyRules from './components/addPolicyRules'
import HTTP from '../util/api'
import _ from 'lodash'
import { AttrsTypeEnum } from '@/view/dataSecurity/util/attrEnum.ts'
export default {
  components: { newSecurityPolicy, addPolicyRules },
  data() {
    return {
      nodeData1: [
        {
          name: '安全策略管理',
          level: 1,
        },
        {
          name: '新建安全策略',
          level: 2,
        },
      ],
      structureList: [], // 表格数据
      showList: true, // 详情，新建
      currentPage: 1,
      pageSize: 20,
      total: 0,
      fileName: '', // 表单搜索
      detailItem: {}, // 详情数据
      oldPolicy: {}, // 旧数据，比对是否取消
      loading: false,
      time: null,
      handleSelection: [], // 选中表格数据
      addPolicy: true,
      rulesItem: {},
      oldRulesItem: {},
      rulesDtosList: {},
      options: [],
      sort: 'DESC',
    }
  },
  created() {},
  mounted() {
    this.getRegulation('')
    this.getLevelData()
  },
  methods: {
    selectable(row) {
      return !row.ableDelete
    },
    getLevelData() {
      // 旧的数据安全等级的接口
      // HTTP.getAuthLevel()
      //   .then(res => {
      //     this.options = res.data.filter(item => !item.category)
      //   })
      //   .catch(e => {
      //     this.$showFailure(e)
      //   })
      // 6.4安全等级
      HTTP.getLevelData()
        .then(res => {
          let data = res.data.data
          let newList = data.filter(
            k => k.classificationType === AttrsTypeEnum.LEVEL
          )
          this.options = newList.map(m => Object.assign({}, m.tag))
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 添加规则
    addRules(item) {
      // !item.index && this.rulesDtosList.push(item)
      this.rulesDtosList = item
      this.returnList('add')
    },
    // 上传文件--完
    handleSizeChange(val) {
      this.pageSize = val
      this.getRegulation(this.fileName)
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getRegulation(this.fileName)
    },
    handleSelectionChange(row) {
      this.handleSelection = row
    },
    delectAry() {
      let ary = []
      this.handleSelection.forEach(item => {
        ary.push(item.id)
      })
      // let form = new FormData()
      // form.append('regulationIds', ary)
      this.$DatablauCofirm('确定要删除吗?', '提示', {
        type: 'warning',
        cancelButtonText: this.$t('common.button.cancel'),
        confirmButtonText: this.$t('common.button.ok'),
      })
        .then(() => {
          HTTP.delPolicy(ary)
            .then(res => {
              this.$blauShowSuccess('删除成功')
              this.currentPage = 1
              this.getRegulation(this.fileName)
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {})
    },
    edit(item) {
      if (item.ableDelete) return
      this.showList = false // 展示法规条文详情
      this.detailItem = item
      this.oldPolicy = _.cloneDeep(this.detailItem)
      this.nodeData1[1].name = '编辑安全策略'
    },
    delet(item) {
      if (item.ableDelete) return
      this.$DatablauCofirm('确定要删除吗?', '提示', {
        type: 'warning',
        cancelButtonText: this.$t('common.button.cancel'),
        confirmButtonText: this.$t('common.button.ok'),
      })
        .then(() => {
          HTTP.delPolicy([item.id])
            .then(res => {
              this.$blauShowSuccess('删除成功')
              this.currentPage = 1
              this.getRegulation('')
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {})
    },
    documentsClick() {
      this.rulesDtosList = {}
      // this.rulesItem = {}
      this.nodeData1[1].name = '新建安全策略'
      this.detailItem = {}
      this.oldPolicy = _.cloneDeep(this.detailItem)
      this.showList = false
    },
    searchFileName(val) {
      this.currentPage = 1
      // this.pageSize = 20
      // clearTimeout(this.time)
      // this.time = setTimeout(() => {
      this.getRegulation(this.fileName)
      // }, 200)
    },
    sortChange(data) {
      this.sort = data.order === 'ascending' ? 'ASC' : !data.order ? '' : 'DESC'
      this.getRegulation(this.fileName)
    },
    getRegulation(name) {
      this.loading = true
      let param = {
        pageNum: this.currentPage,
        pageSize: this.pageSize,
        orderBy: 'createTime',
        // sort: this.sort,
        securityPolicyName: name,
      }
      this.sort && (param.sort = this.sort)
      HTTP.getControlList(param)
        .then(res => {
          this.loading = false
          this.structureList = res.data.data.content
          this.total = res.data.data.totalElements
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
    returnList(val) {
      this.handleSelection = []
      let flag
      if (this.nodeData1.length > 2) {
        !val && (flag = this.$refs.rules.cancel())
        if (flag || val) {
          this.nodeData1 = this.nodeData1.splice(0, 2)
          this.addPolicy = true
        }
      } else {
        !val && (flag = this.$refs.policy.cancel())
        if (flag || val) {
          this.showList = true
        }
      }
      val === 'policyNo' && this.getRegulation(this.fileName)
    },
    policyBack(obj) {
      this.addPolicy = false
      let tex = (obj && '编辑策略规则') || '新建策略规则'
      this.nodeData1.push({ name: tex, level: 3 })
    },
    policyAdd(list) {
      this.policyBack()
      this.rulesItem = { item: {}, list }
      this.oldRulesItem = _.cloneDeep(this.rulesItem)
    },
    // 策略规则详情
    rulesDetail(item) {
      this.rulesItem = item
      this.oldRulesItem = _.cloneDeep(this.rulesItem)
      this.policyBack(item.item)
    },
  },
}
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.statutory {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: #fff;
  overflow: auto;
}
.titleTab {
  font-size: 16px;
  vertical-align: middle;
  font-weight: 600;
  height: 44px;
  color: #555;
  line-height: 44px;
}
.deTable {
  /*margin-top: 10px;*/
}
.iconBox i {
  /*margin-right: 10px;*/
  color: #409eff;
  cursor: pointer;
  &.green {
    color: #999;
  }
}
.padding20 {
  padding: 0 20px;
  height: 100%;
}
.documentBox {
  float: right;
}
.flex {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
/deep/.datablau-input .el-textarea {
  width: 100% !important;
}
/deep/.row-content > div {
  /*height: 98%;*/
}
.fileList {
  position: relative;
  /deep/ .el-form-item__content {
    overflow: auto;
    & > div {
      float: left;
    }
    .tipBox {
      margin-left: -18px;
      font-size: 12px;
      color: #999;
    }
  }
  &:after {
    content: '*';
    display: block;
    position: absolute;
    top: 6px;
    font-size: 16px;
    left: 0;
    color: #f56c6c;
  }
}
.left-btn {
  float: right;
}
.check-info {
  width: 14px;
  height: 14px;
  display: inline-block;
  background: $primary-color;
  margin-right: -13px;
  vertical-align: middle;
}
.footer-row-info {
  height: 50px;
  margin-right: 10px;
  &:before {
    content: '\e6da';
    font-family: 'element-icons';
    font-size: 12px;
    font-weight: 200;
    margin-right: 5px;
    vertical-align: middle;
    line-height: 13px;
    color: white;
  }
}

.otherBox {
  padding: 0 20px;
}
.returnBox {
  padding: 10px 0 8px 0;
  border-bottom: 1px solid #e0e0e0;
}
</style>
