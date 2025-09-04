<template>
<div class="project-list">
  <router-view v-if="render"></router-view>

  <datablau-dialog
      :title="createProjectModal ? '创建项目' : '修改项目'"
      :visible.sync="showProjectDialog"
      :append-to-body="true"
      size="l"
      @close="cancelProject">
    <datablau-form
        size="small"
        label-width='90px'
        :model="projectData"
        :rules="rules"
        ref="eform"
    >
      <el-form-item
          label="名称"
          prop="name"
      >
        <datablau-input
            v-model="projectData.name"
            class="input-detail"
        ></datablau-input>
      </el-form-item>
      <el-form-item
        label="描述"
        prop="desc"
      >
        <datablau-input
          type="textarea"
          v-model="projectData.desc"
          class="input-detail"
          style="width: 500px;"
          maxlength="200"
          show-word-limit
        ></datablau-input>
      </el-form-item>
      <!-- <el-form-item
        label="开发环境"
        prop="env">
        <datablau-radio v-model="projectData.env">
          <el-radio :label="item.value" v-for="item in envList" :key="item.value">{{item.label}}</el-radio>
        </datablau-radio>
      </el-form-item> -->
      <el-form-item
        label="类型"
        prop="type">
        <datablau-select
          v-model="projectData.type"
          clearable
          filterable
          style="width: 300px"
        >
          <el-option
            v-for="typeId in Object.keys(types)"
            :key="typeId"
            :label="types[typeId]"
            :value="+typeId"
          ></el-option>
        </datablau-select>
      </el-form-item>
       <el-form-item
        label="项目状态"
        style="display: inline-block;"
        prop="enable">
         <datablau-switch
           v-model="projectData.enable"
           active-text="开启"
           inactive-text="关闭"
           type="innerText"
         ></datablau-switch>
      </el-form-item>
       <el-form-item
        label="开启git管理"
        prop="enable">
         <datablau-switch
          :disabled="!createProjectModal"
           v-model="gitEnable"
           active-text="开启"
           inactive-text="关闭"
           type="innerText"
         ></datablau-switch>
      </el-form-item>
      <!-- <el-form-item
        style="display: inline-block;"
        label="模型检查"
        prop="modelCheck">
         <datablau-switch
           v-model="projectData.modelCheck"
           active-text="开启"
           inactive-text="关闭"
           type="innerText"
         ></datablau-switch>
      </el-form-item>
      <el-form-item
      style="display: inline-block;"
        label="程序检查"
        prop="procedureCheck">
         <datablau-switch
           v-model="projectData.procedureCheck"
           active-text="开启"
           inactive-text="关闭"
           type="innerText"
         ></datablau-switch>
      </el-form-item> -->
      <el-form-item
          label="数据源"
          prop="testSource"
      >
        <datablau-select
            size="mini"
            v-model="projectData.testSource"
            style="width: 300px"
            multiple
            clearable
        >
          <el-option
              v-for="item in dataSourceList"
              :value="item.id"
              :label="item.sourceName"
              :key="item.id"
          >
          <div slot="default" style="display: inline-block;" class="defaultBox">
            <database-type style="display: inline-block" :size="24"
                            :value="item.type" :hideLabel="true">
            </database-type>
            <span>{{ item.sourceName }}</span>
            <!-- <span class="tagName">{{ item.tagName }}</span> -->
          </div>
        </el-option>
        </datablau-select>
      </el-form-item>
      <el-form-item
      label="负责人"
      prop="creator"
      >
        <datablau-select
          size="mini"
          v-model="projectData.creator"
          style="width: 300px"
          remote
          filterable
          clearable
          :remote-method="remoteMethod"
          @focus="changePersonnelList(projectData.creator)"
          @clear="changePersonnelList('')"
          @change="changePersonnelList"
          v-selectLazyLoad="lazyloading"
        >
          <el-option
            v-for="item in personnelList"
            :value="item.username"
            :label="item.fullUserName"
            :key="item.username"
          >
            <div slot="default" style="display: inline-block;" class="defaultBox">
              {{item.fullUserName}}({{item.username}})
            </div>
          </el-option>
        </datablau-select>
      </el-form-item>
    </datablau-form>
    <div slot="footer">
      <datablau-button type="cancel" @click="cancelProject"></datablau-button>
      <datablau-button @click="editConfirm" type="important" :disabled="creatBtnDisabled">确定</datablau-button>
    </div>
  </datablau-dialog>
  <div class="flexBox">
    <div class="leftBox">
      <datablau-input
      maxlength="100"
      style="width: 260px; margin: 10px; position: relative; top: -1px"
      v-model="keyword"
      clearable
      :iconfont-state="true"
      placeholder="请输入机构名称或编码"
      ></datablau-input>
      <datablau-tree
      style="
      position: absolute;
    top: 50px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
      "
        ref="tree2"
        :data-supervise="true"
        :data-icon-function="dataIconFunction"
        @node-click="handleNodeClick"
        node-key="id"
        :props="defaultProps"
        :custom-node-key="nodeKeys"
        :default-expanded-keys="defaultExpandedKeys"
        auto-expand-parent
        :data="wholeTreeData"
        :expand-on-click-node="false"
        :filter-node-method="filterNode"
        v-loading="treeLoading"
        height="calc(100vh - 110px)"
        :itemSize="34"
        :key="treeKey"
      ></datablau-tree>
    </div>
    <div class="rightBox">
      <div class="tool">
        <datablau-input
          :iconfont-state="true"
          placeholder="请输入项目名称"
          clearable
          @change="getProjectList"
          @keydown.enter.native="getProjectData()"
          v-model="query">
        </datablau-input>
        <span class="label">
          类型
        </span>
        <datablau-select
          v-model="currentType"
          style="width: 120px"
          clearable
          placeholder="全部类型"
          @change="getProjectList"
        >
          <el-option
            v-for="item in  Object.keys(types)"
            :key="item"
            :label="types[item]"
            :value="item"
          ></el-option>
        </datablau-select>

        <datablau-button class="ml"  type="" @click="getProjectData">查 询</datablau-button>
        <datablau-button  type="secondary" @click="resetting">重 置</datablau-button>
        <datablau-button style="float:right" class="iconfont icon-tianjia" type="important" v-if="auth['DDD_PROJECT_EDIT']"  @click="openCreateProject" >新建</datablau-button>
        <datablau-button
          type="text"
          @click="showFilterTag"
          class="iconfont icon-filter"
        >
        {{showTag?'更多过滤':'收起过滤'}}
        </datablau-button>
        <div class="tag" style="margin-top:8px">
          <span class="label">
            标签
          </span>
          <el-tag
              style="margin-left: 0.3em"
              size="small"
              closable
              v-for="(v, i) in currentTag"
              @close="closeSeachTagManage(v, i)"
              v-show="currentTag && i < 5"
              :key="i"
            >
              {{ tagNames[i] }}
            </el-tag>
            <span v-if="currentTag && currentTag.length > 5">
              等{{currentTag.length}}个标签
            </span>
            <datablau-button type="text" class="iconfont icon-tianjia" @click="addTagManageSeach" >选择</datablau-button>
            <datablau-button type="text"  @click="closeTagManageAll" style="margin-left:0">清除</datablau-button>
        </div>
      </div>
      <datablau-form-submit class="formBox" :class="{ 'show-tag': !showTag }">
        <datablau-table
          class="project-data-list"
          :data="projectList"
          height="100%"
          v-loading="loading"
          row-key="id"
          :indent="0"
          :expand-row-keys="rowKeys"
          @expand-change="expandChange"
          >
          <el-table-column
            width='30'
          >
          <template>
            <span class="circle"><i class="iconfont icon-project"></i></span>
          </template>
          </el-table-column>
          <el-table-column
            label="项目名称"
            show-overflow-tooltip
            sortable
            width="180px"
            prop="name">
          </el-table-column>
          <!--<el-table-column
            label="状态">
            <template slot-scope="scope">
              <span :class="`status c${scope.row.status}`">
                <span>{{status[scope.row.status]}}</span>
              </span>
            </template>
          </el-table-column>-->
          <el-table-column
            label="类型">
            <template slot-scope="scope">
              <span :class="`rowType c${scope.row.type}`">
                <span>{{types[scope.row.type]}}</span>
              </span>
                </template>
              </el-table-column>
              <el-table-column
                label="管理方式">
                <template slot-scope="scope">
                  {{scope.row.gitEnable ? 'git' : '数据库'}}
                </template>
              </el-table-column>
              <el-table-column
                label="负责人"
                width="100px"
                show-overflow-tooltip
                prop="userFirstName">
                <template slot-scope="scope">
                  {{ scope.row.userFirstName }}
                </template>
              </el-table-column>
              <el-table-column
                prop="orgName"
                show-overflow-tooltip
                label="所属机构">
              </el-table-column>
              <el-table-column
                prop="labelIds"
                show-overflow-tooltip
                label="标签">
              </el-table-column>
              <el-table-column
                sortable
                prop="createTime"
                show-overflow-tooltip
                width="180px"
                label="创建时间">
                <template slot-scope="scope">
                  {{moment(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss')}}
                </template>
              </el-table-column>
              <el-table-column
                prop="enable"
                label="状态">
                <template slot-scope="{row}">
                  {{row.enable ? '开启' : '关闭'}}
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                fixed="right"
                width="120px" >
                <template slot-scope="scope">
                  <datablau-tooltip
                    effect="dark"
                    content="管理"
                    placement="bottom"
                  >
                    <datablau-button type="icon" @click.stop="darkClick(scope.row)" class="iconfont icon-see"></datablau-button>
                  </datablau-tooltip>
                  <datablau-tooltip
                    effect="dark"
                    content="开始开发"
                    placement="bottom"
                  >
                    <datablau-button type="icon"
                                    @click.stop="openWindow(scope.row)"
                                    :disabled="!scope.row.enable"
                                    class="iconfont icon-code"></datablau-button>
                  </datablau-tooltip>
                </template>
              </el-table-column>
        </datablau-table>
        <template slot="buttons">
          <datablau-pagination
            v-if="!showPage"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="page.current"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="page.size"
            :total="page.count"
            :layout="'total, sizes, prev, pager, next, jumper'"
          ></datablau-pagination>
        </template>
      </datablau-form-submit>
    </div>
  </div>
  <projectDetail ref="projectDetail" v-if="type === 'projectDetail'" :id="detailId" name="detailName" @goProjectList="goProjectList"></projectDetail>
</div>
</template>
<script>
import moment from 'moment'
import HTTP from '@/dataWarehouse/resource/http'
import databaseType from '@/components/common/DatabaseType.vue'
import projectDetail from './projectDetail.vue'

export default {
  data () {
    return {
      type: '',
      detailId: '',
      detailName: '',
      udpRules: {
        name: {
          required: true,
          message: '请输入属性名称',
          trigger: 'change'
        },
        udpType: {
          required: true,
          message: '请选择属性类型',
          trigger: 'change'
        },
        groupName: {
          required: true,
          message: '请输入分组名称',
          trigger: 'change'
        }

        // udpValConstant: {
        //   required: true,
        //   message: '请输入枚举项',
        //   trigger: 'change'
        // }

      },
      udpOptions: [
        {
          label: '字符串',
          value: 'STRING'
        },
        {
          label: '数值',
          value: 'NUM'
        },
        {
          label: '枚举',
          value: 'ENUM'
        }
      ],
      udpForm: {
        name: '',
        udpType: '',
        udpValConstant: '',
        groupName: ''
      },
      loading: false,
      envList: [
        {
          label: '测试环境',
          value: 'test'
        },
        {
          label: '开发环境',
          value: 'prod'
        }
      ],
      refresh: false,
      editProjectModal: false,
      createProjectModal: false,
      showProjectDialog: false,
      moment,
      query: '',
      page: {
        current: 1,
        size: 20,
        count: 0
      },
      projectList: null,
      statusArr: [],
      typeArr: [],
      projectData: {
        name: '',
        desc: '',
        type: '',
        status: '',
        testSource: [],
        creator: '',
        prodSource: '',
        env: 'test',
        enable: true,
        modelCheck: true,
        procedureCheck: true
      },
      rules: {
        name: {
          required: true,
          message: '请输入项目名称',
          trigger: 'change'
        },
        type: {
          required: true,
          message: '请选择项目类型',
          trigger: 'change'
        },
        status: {
          required: true,
          message: '请选择项目状态',
          trigger: 'change'
        },
        env: {
          required: true,
          message: '请选择开发环境',
          trigger: 'change'
        },
        testSource: {
          required: true,
          message: '请选择数据源',
          trigger: 'change'
        },
        creator: {
          required: true,
          message: '请选择项目负责人',
          trigger: 'change'
        }
      },
      dataSourceList: [],
      personnelList: [],
      types: {},
      status: {},

      currentStatus: '',
      statusOptions: [
        {
          value: 'all',
          label: '所有状态'
        }
      ],
      currentType: '',
      TypeOptions: [
        {
          value: 'all',
          label: '所有类型'
        }
      ],
      render: true,
      showUdp: false,
      udpList: [],
      udpLoading: false,
      showAddUdp: false,
      udpEditMode: false,
      detailFlag: false,
      showPage: false,
      rowKeys: [],
      tagMap: [], // 标签列表
      currentPage: 1,
      totalItems: 0,
      auth: this.$store.state.$auth,
      requirementId: [],
      currentTag: null,
      showTag: true,
      tagNames: null,
      keyword: '',
      gitEnable: false,
      creatBtnDisabled: false,
      defaultProps: {
        children: 'children',
        label: 'fullName',
        value: 'id'
      },
      defaultExpandedKeys: [],
      nodeKeys: 1,
      wholeTreeData: [],
      treeLoading: false,
      bmCode: '',
      treeKey: 0
    }
  },
  components: {
    databaseType,
    projectDetail
  },
  watch: {
    keyword (val) {
      this.$refs.tree2.filter(val)
    },
    $route: {
      handler (val) {
        if (val.query.id && val.query.name) {
          this.darkClick({
            id: val.query.id,
            name: val.query.name
          })
          this.type = 'projectDetail'
        } else {
          this.type = ''
          this.init()
        }
      },
      immediate: true
    }
  },
  mounted () {
    this.getOrgTree()
    this.init()
    // 获取数据源标签
    this.getTagMap()
    // 获取人员列表
    this.getPersonnelList()
    this.$bus.$on('addProject', display => {
      this.requirementId = display
      this.projectData = {
        name: '',
        desc: '',
        type: '',
        status: '',
        testSource: [],
        prodSource: '',
        env: 'test',
        enable: true,
        modelCheck: true,
        procedureCheck: true,
        creator: ''
      }
      this.$store.state.user.name !== 'admin' && (this.projectData.creator = this.$store.state.user.name)
      this.createProjectModal = true
      this.showProjectDialog = true
    })
  },
  beforeDestroy () {
    this.$bus.$off('addProject')
  },
  methods: {
    filterNode (value, data, node) {
      if (!value) return true
      return (
        (data.fullName && data.fullName.indexOf(value) !== -1) ||
        (data.bm && data.bm.indexOf(value) !== -1)
      )
    },
    modifyProjectTag (projectData, tagNames, type) {
      this.$http.put(`${this.$dddUrl}/service/project/`, {
        id: projectData.id,
        name: projectData.name,
        type: projectData.type,
        creator: projectData.creator,
        description: projectData.description,
        testDataSource: projectData.testDataSource,
        prodDataSource: projectData.prodDataSource,
        env: projectData.env,
        enable: projectData.enable,
        labelIds: tagNames.join(',')
      }).then(res => {
        if (this.refresh) {
          this.refresh = false
          this.refreshView()
        }
        if (type) {
          this.$datablauMessage.success('修改成功！')
        } else {
          this.$datablauMessage.success('新增成功！')
        }
        this.editProjectModal = false
        this.showProjectDialog = false
        this.init()
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    closeTagManageAll () {
      this.currentTag = null
    },
    showFilterTag () {
      this.showTag = !this.showTag
    },
    addTagManageSeach () {
      this.$bus.$once('tagSelected', ({ keys, names }) => {
        if (keys && names) {
          this.currentTag = keys
          this.tagNames = names
          this.currentPage = 1
          // this.getData()
        }
      })
      this.$bus.$emit('callSelectorDialog', {
        type: 'tag',
        tagIds: this.currentTag
      })
    },
    closeSeachTagManage (v, i) {
      this.currentTag.splice(i, 1)
      this.tagNames.splice(i, 1)
    },
    dataIconFunction (data, node) {
      if (data.bm === '@ROOT') {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      } else {
        // return 'iconfont icon-schema'
        return 'iconfont icon-bumen'
      }
    },
    handleNodeClick (data) {
      this.bmCode = data.bm
      this.page.current = 1
      this.page.size = 20
      this.getProjectData()
    },
    goProjectList () {
      this.type = ''
      this.$router.push({
        query: {
        }
      })
    },
    lazyloading () {
      if (this.personnelList.length && this.personnelList.length >= this.totalItems) return
      this.currentPage += 1
      this.getPersonnelList()
    },
    remoteMethod (val) {
      setTimeout(() => {
        this.changePersonnelList(val)
      }, 300)
    },
    changePersonnelList (val) {
      this.currentPage = 1
      this.getPersonnelList(val)
    },
    // 获取人员列表
    getPersonnelList (val) {
      let requestBody = {
        currentPage: this.currentPage,
        pageSize: 20,
        username: val || this.projectData.creator,
        fullUserName: val || this.projectData.creator,
        enabled: true
      }
      this.$http.post('/user/org/groups/page?appName=ddt', requestBody)
        .then(res => {
          this.totalItems = res.data.totalItems
          if (this.currentPage === 1) {
            this.personnelList = res.data.content
          } else {
            this.personnelList.push(...res.data.content)
          }
          this.personnelList = this.personnelList.filter((item) => {
            if (item.username === 'admin') { this.totalItems -= 1 }
            return item.username !== 'admin'
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 获取数据源标签
    getTagMap () {
      this.$http
        .post(this.$baseUrl + '/tags/getAllTags')
        .then(res => {
          const map = {}
          let datazoneTag = {}
          if (res.data && Array.isArray(res.data)) {
            res.data.forEach(item => {
              map[item.tagId] = item
              if (item.name === '数据区域') {
                datazoneTag = item
              }
            })
            res.data.forEach(item => {
              if (item.parentId && map[item.parentId]) {
                let parent = map[item.parentId]
                if (!parent.children) {
                  parent.children = []
                }
                parent.children.push(item)
              }
            })
            this.tagMap = map
            this.getDataSource()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    expandChange (row) {
      let index
      this.projectList.find((item, i) => {
        item.id === row.id && (index = i)
      })
      HTTP.getBranchList(row.id).then(res => {
        this.$set(row, 'children', res || [])
        this.$set(this.projectList, index, row)
      }).catch(e => {
        // treeNode.children = []
        this.$set(row, 'children', [])
        // resolve([])
        this.$showFailure(e)
      })
    },
    resetting () {
      this.query = ''
      this.currentStatus = ''
      this.currentType = ''
      this.currentTag = null
      this.tagNames = null
    },
    editUdp (row) {
      this.udpEditMode = true
      let { name, udpType, groupName, udpValConstant, id } = row
      this.udpForm = {
        name,
        udpType,
        groupName,
        udpValConstant,
        id
      }
      this.showAddUdp = true
    },
    deleteUdp (row) {
      this.$DatablauCofirm(`扩展属性 “${row.name}” ,确定要删除？`).then(() => {
        this.$http.delete(`${this.$dddUrl}/service/udp/${row.id}`)
          .then(res => {
            this.$datablauMessage.success('扩展属性删除成功')
            this.getUdpList()
          })
          .catch(err => {
            this.$showFailure(err)
          })
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    submitUdpForm () {
      this.$refs.udpForm.validate(valid => {
        if (valid) {
          this.udpForm.required = false
          let http = this.udpEditMode ? this.$http.put(`${this.$dddUrl}/service/udp/`, this.udpForm) : this.$http.post(`${this.$dddUrl}/service/udp/`, this.udpForm)
          http.then(res => {
            this.$datablauMessage.success(this.udpEditMode ? '扩展属性修改成功！' : '扩展属性创建成功！')
            this.createProjectModal = false
            this.showProjectDialog = false
            this.showAddUdp = false
            this.getUdpList()
          }).catch(err => {
            this.$showFailure(err)
          })
        }
      })
    },
    handleAddUdp () {
      this.udpEditMode = false
      this.showAddUdp = true
      this.udpForm = {
        name: '',
        udpType: '',
        udpValConstant: '',
        groupName: ''
      }
      this.$nextTick(() => {
        this.resetForm('udpForm')
      })
    },
    handleCommand (val) {
      switch (val) {
        case 'udp':
          this.getUdpList()
          break
      }
    },
    getUdpList () {
      this.showUdp = true
      this.udpLoading = true
      this.$http.get(`${this.$dddUrl}/service/udp/`)
        .then(res => {
          this.udpList = res.data.data
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    darkClick (scope) {
      this.detailId = scope.id
      this.detailName = scope.name
      this.$router.push({
        query: {
          id: scope.id,
          name: scope.name
        }
      })

      // this.$router.push(`/main/project?id=${scope.row.id}&name=${scope.row.name}`)
      this.showPage = true
      this.type = 'projectDetail'
    },
    openWindow (row) {
      this.$http.get(`${this.$dddUrl}/service/project/auth/devlopment?projectId=${row.id}`)
        .then(res => {
          this.$http.get(`${this.$dddUrl}/service/datasource/auth/refresh?projectId=${row.id}`)
            .then(res => {})
          const pos = location.href.indexOf('#/')
          const baseUrl = location.href.slice(0, pos + 2)
          let pageUrl = this.BaseUtils.RouterUtils.getFullUrl('sqlEditor', {
            projectId: row.id
          })
          window.open(pageUrl)
          // window.open(`${baseUrl}sql_editor?projectId=${row.id}`)
          this.detailFlag = true
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    resetForm (form) {
      if (this.$refs[form]) {
        this.$refs[form]?.clearValidate()
      }
    },
    tableRowClick (row, column, event) {
      // this.$router.push({
      //   path: '/main/sql_editor',
      //   query: {
      //     projectId: row.id
      //   }
      // })
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      // window.open(`${baseUrl}sql_editor?projectId=${row.id}`)
      let pageUrl = this.BaseUtils.RouterUtils.getFullUrl('sqlEditor', {
        projectId: row.id
      })
      window.open(pageUrl)
    },
    cancelProject () {
      this.createProjectModal = false
      this.editProjectModal = false
      this.showProjectDialog = false
      this.creatBtnDisabled = false
    },
    createProject () {
      this.$refs.eform.validate(valid => {
        if (valid) {
          this.creatBtnDisabled = true
          let obj = {
            name: this.projectData.name,
            type: this.projectData.type,
            // status: 0,
            creator: this.projectData.creator, // 修改创建人
            description: this.projectData.desc,
            testDataSource: this.projectData.testSource,
            prodDataSource: this.projectData.prodSource,
            env: this.projectData.env,
            enable: this.projectData.enable,
            gitEnable: this.gitEnable
            // modelCheck: this.projectData.modelCheck,
            // procedureCheck: this.projectData.procedureCheck
          }
          this.bmCode !== '@ROOT' && (obj.orgId = this.bmCode)
          if (this.requirementId.length > 0) {
            obj.requirementId = this.requirementId
          }
          this.$http.post(`${this.$dddUrl}/service/project/`, obj).then(res => {
            this.$datablauMessage.success('创建成功！')
            this.createProjectModal = false
            this.showProjectDialog = false
            this.init()
            if (this.requirementId.length > 0) {
              this.$router.push({
                path: '/main/project'
              })
            }
            this.creatBtnDisabled = false
          }).catch(err => {
            this.$showFailure(err)
            this.creatBtnDisabled = false
          })
        }
      })
    },
    modifyProject () {
      this.$refs.eform.validate(valid => {
        if (valid) {
          let obj = {
            id: this.projectData.id,
            name: this.projectData.name,
            type: this.projectData.type,
            // status: this.projectData.status,
            creator: this.projectData.creator,
            description: this.projectData.desc,
            testDataSource: this.projectData.testSource,
            prodDataSource: this.projectData.prodSource,
            env: this.projectData.env,
            enable: this.projectData.enable,
            gitEnable: this.gitEnable
            // modelCheck: this.projectData.modelCheck,
            // procedureCheck: this.projectData.procedureCheck
          }
          this.bmCode !== '@ROOT' && (obj.orgId = this.bmCode)
          this.$http.put(`${this.$dddUrl}/service/project/`, obj).then(res => {
            // if (this.refresh) {
            //   this.refresh = false
            //   this.refreshView()
            // }
            this.$datablauMessage.success('修改成功！')
            this.editProjectModal = false
            this.showProjectDialog = false
            this.init()
            this.refreshView(res.data)
          }).catch(err => {
            this.$showFailure(err)
          })
        }
      })
    },
    editConfirm () {
      if (this.createProjectModal) {
        this.createProject()
      } else {
        this.modifyProject()
      }
    },
    refreshView (data) {
      this.$router.push({
        query: {
          id: data.id,
          name: data.name
        }
      })
      this.$refs.projectDetail.init()
    },
    handleSizeChange (size) {
      this.page.size = size
      this.getProjectData()
    },
    handleCurrentChange (current) {
      this.page.current = current
      this.getProjectData()
    },
    editProject (row, isRefresh = false) {
      // this.$set(this, 'projectData', {
      //   id: row.id,
      //   name: row.name,
      //   desc: row.description,
      //   type: row.type,
      //   status: row.status,
      //   testSource: row.testDataSource,
      //   prodSource: row.prodDataSource,
      //   creator: row.creator
      // })
      this.$nextTick(() => {
        this.projectData = {
          id: row.id,
          name: row.name,
          desc: row.description,
          type: row.type,
          // status: row.status,
          testSource: row.testDataSource,
          prodSource: row.prodDataSource,
          creator: row.creator || this.$store.state.user.name,
          env: row.env || 'test',
          enable: row.enable,
          modelCheck: row.modelCheck,
          procedureCheck: row.procedureCheck
        }
      })
      !this.projectData.creator && this.$store.state.user.name !== 'admin' && (this.projectData.creator = this.$store.state.user.name)
      this.editProjectModal = true
      this.showProjectDialog = true
      this.refresh = isRefresh
      this.gitEnable = row.gitEnable
    },
    deleteProject (row, isRefresh = false) {
      this.$DatablauCofirm('确定要删除项目？').then(() => {
        this.$http.delete(`${this.$dddUrl}/service/project/${row.id}`).then(res => {
          this.$datablauMessage.success('删除成功')
          if (isRefresh) {
            this.$router.push('main/project')
          }
          this.init()
          this.goProjectList()
        }).catch(err => {
          this.$showFailure(err)
        })
      }).catch(() => {

      })
    },
    async init () {
      this.page.current = 1
      this.page.size = 20
      this.getProjectTypes()
      this.getProjectStatus()
      this.getProjectData()
    },
    getProjectTypes () {
      this.$http.get(`${this.$dddUrl}/service/project/type`)
        .then(res => {
          this.types = res.data[0]
          // console.log(res, 'typeArr')
        }).catch(err => {
          this.$showFailure(err)
        })
    },
    getProjectStatus () {
      this.$http.get(`${this.$dddUrl}/service/project/status`)
        .then(res => {
          // this.statusArr = res.data
          this.status = res.data[0]
          // res.data.forEach(i => {
          //   this.status[i.statusId] = i.status
          // })
        }).catch(err => {
          this.$showFailure(err)
        })
    },
    getProjectList () {
      this.page.current = 1
      this.page.size = 20
      // this.getProjectData()
    },
    getOrgTree () {
      this.treeLoading = true
      this.$http.get(`${this.$userUrl}org/organization/tree/`, { keyword: this.keyword })
        .then(res => {
          this.treeLoading = false
          if (res.data !== '') {
            this.bmCode = res.data.bm
            // this.getProjectData()
            this.defaultExpandedKeys = [res.data.id]
            this.nodeKeys = res.data.id
            this.$nextTick(() => {
              this.$refs.tree2.setCurrentKey(res.data.id)
              // const treeNode = $('.el-tree-node')[0]
              // treeNode && treeNode.click()
            })
            this.wholeTreeData = [res.data]
          } else {
            this.wholeTreeData = []
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getProjectData () {
      this.loading = true
      let params = {
        currentPage: this.page.current,
        pageSize: this.page.size,
        projectName: this.query,
        status: this.currentStatus,
        type: this.currentType
      }
      this.bmCode !== '@ROOT' && (params.orgId = this.bmCode)
      this.currentTag && (params.labelId = this.tagNames.join(','))
      HTTP.projectList(params)
        .then(res => {
          this.projectList = res.content
          this.projectList.forEach(item => {
            item.hasChildren = true
            item.children = []
          })
          this.page.count = res.totalItems
          this.loading = false
        }).catch(err => {
          this.$showFailure(err)
          this.loading = false
        })
    },
    openCreateProject () {
      this.projectData = {
        name: '',
        desc: '',
        type: '',
        status: '',
        testSource: [],
        prodSource: '',
        env: 'test',
        enable: true,
        creator: '',
        modelCheck: true,
        procedureCheck: true
      }
      this.$store.state.user.name !== 'admin' && (this.projectData.creator = this.$store.state.user.name)
      this.createProjectModal = true
      this.showProjectDialog = true
      this.gitEnable = false
      this.$nextTick(() => {
        this.resetForm('eform')
      })
    },
    getDataSource () {
      this.$http.post(`${HTTP.$damBase}datasources/findDatasources`, { 'keyword': '' })
        .then(res => {
          let data = res.data
          this.dataSourceList = data
          // this.dataSourceList.forEach(item => {
          //   let tagList = []
          //   // item.TagIds
          //   let tagId = item.connectionInfo?.parameterMap?.TagIds?.split(',') || []
          //   tagId.forEach(v => {
          //     if ((v || v === 0) && !isNaN(v - 0)) {
          //       tagList.push(this.tagMap[v - 0].name)
          //     }
          //   })
          //   item.tagName = tagList.join(',')
          // })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.status {
  position: relative;
  color: #409EFF;
  padding-left: 10px;
  &::before {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 1px;
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    background: #409EFF;
    border-radius: 50%;
  }
  span {
    padding-left: 10px;
  }
  &.c1 {
    color: #53A7AD;
    &::before {
      background: #53A7AD;
    }
  }
  &.c2 {
    color: #66BF16;
    &::before {
      background: #66BF16;
    }
  }
}
.rowType{
  display: block;
  width: 64px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  &.c0{
    background: rgba(141, 199, 138, 0.1);
    color: #8DC78A;
  }
  &.c1{
    background: rgba(78, 133, 247, 0.1);
    color: #4E85F7;
  }
  &.c2{
    background: rgba(187, 108, 249, 0.1);
    color: #BB6CF9;
  }
  &.c3{
    background: rgba(58, 209, 191, 0.1);
    color: #3AD1BF;
  }
}
.circle {
  width: 24px;;
  color: #1E6ED2;
  font-size: 12px;
  border-radius: 50%;
}
.form-submit {
  top: 50px;
  left: 281px;
  transition: top 0.5s;
  &.show-tag{
    top: 75px;
  }
}
.udp-tool {
  height: 32px;
  .is-block {
    float: right;
  }
}
.project-list {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
}
.tool {
  .ml {
    margin-left: 10px;
  }
  .label {
    margin:0 6px;
    color: #555;
    font-size: 12px;
  }
  /deep/ .iconfont[class*='icon-']::before {
    margin-right: 6px;
  }
}
.datablau-select {
  display: inline-block;
}

/deep/ .el-dropdown-menu__item {
  text-align: center;
      width: 90px;
}
.project-list-wrapper {
  position: absolute;
  top: 70px;
  left: 20px;
  right: 20px;
  bottom: 50px;
}
.pagination-wrapper {
  position: absolute;
  bottom: 0;
  height: 50px;
  left: 20px;
  right: 20px;
  text-align: right;
  .datablau-pagination {
    position: relative;
    top: 10px;
  }
}
  .cardBox{
   display: flex;
    flex-wrap: wrap;

    /*justify-content: space-between;*/
    .card{
      width: 18.7%;
      margin: 10px
    }
    .branchName{
      font-size: 14px;
    }
  }
  /deep/.el-card__body{
    padding: 12px;
  }
  .defaultBox{
  }
  .tagName {
    position: absolute;
    right: 10px;
    color: #999;
    width: 76px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    text-align: right;
  }
  .flexBox{
    display: flex;
    height: 100%;
  }
  .leftBox{
    width: 280px;
    height: 100%;
    // padding-top: 20px;
    border-right: 1px solid #e3e3e3;
    position: relative;
  }
  .rightBox{
    padding: 20px;
    padding-top: 10px;
    flex: 1;
  }
</style>
