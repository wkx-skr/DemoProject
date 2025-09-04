<template>
  <div style="border-top: 1px solid #e3e3e3;">
    <datablau-dialog
      title="选择目录"
      :visible.sync="showModeCategory"
      size="l"
    >
      <div style="height: 100%;min-height: 400px;overflow: auto;">
        <!--v-if="showModeCategory"-->
        <db-tree
          node-key="id"
          :props="moveTreeDefaultProps"
          :data="treeData"
          :data-supervise="true"
          :data-icon-function="dataIconFunction"
          ref="tree2"
          :default-expand-all="false"
          :default-expanded-keys="defaultkey"
          :filter-node-method="filterNode"
          :expand-on-click-node="true"
          @node-click="chooseMoveCategoryNode"
          :showLockedMessage="false"
        ></db-tree>
      </div>
      <div slot="footer">
        <datablau-button type="secondary" @click="showModeCategory = false">
          取消
        </datablau-button>
        <datablau-button
          type="primary"
          :disabled="!chosenMoveCategoryId"
          @click="handleMoveCategory"
        >
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
    <div v-show="showAddModel" class="create-model-dialog">
      <div class="dialog-head">
        新建模型
      </div>
      <el-form style="padding-top: 10px;" :model="addModelForm" ref="addModelForm" :rules="addModelFormRules" label-width="80px" :inline="false" size="normal">
        <el-form-item  label="模型名称" prop="name" size="mini">
          <el-input maxlength="40" id="limit-paste"  style="max-width:178px" v-model="addModelForm.name"></el-input>
        </el-form-item>
        <el-form-item  label="目录位置" prop="path" size="mini">
          <el-input maxlength="40" readonly  style="max-width:178px;cursor: pointer;" v-model="addModelForm.path" @click.native="showDir"></el-input>
        </el-form-item>
      </el-form>
      <div class="db-logo-container">
        <div class="disc">1、逻辑数据模型</div>
        <div v-for="item in logicalModel" :key='item' class="db-logo-box" @click="addModelForm.type = item">
          <img :src="`/static/image/DBlogos/${item}.png`">
          <div class="db-name">
            {{item}}
          </div>
          <transition name="el-zoom-in-center">
            <div class="selected-db" v-show="item === addModelForm.type">
              <img src="/static/image/DBlogos/correct.svg">
            </div>
          </transition>
        </div>
      </div>
      <div class="db-logo-container">
        <div class="disc">2、分析型数据模型</div>
        <div v-for="item in sqlModels" :key='item' class="db-logo-box" @click="addModelForm.type = item">
          <img v-if="item === 'GaussDB/A'" :src="'/static/image/DBlogos/GaussDBA.png'">
          <img v-else-if="item === 'CBase'" :src="`/static/image/DBlogos/${item}.svg`">
          <img v-else :src="`/static/image/DBlogos/${item}.png`">
          <div class="db-name">
            {{ item }}
          </div>
          <transition name="el-zoom-in-center">
            <div class="selected-db" v-show="item === addModelForm.type">
              <img src="/static/image/DBlogos/correct.svg">
            </div>
          </transition>
        </div>
      </div>
      <div class="db-logo-container" style="padding-bottom: 20px;">
        <div class="disc">3、NoSQL数据模型</div>
        <div v-for="item in noSqlModels" :key='item' class="db-logo-box" @click="addModelForm.type = item">
          <img :src="`/static/image/DBlogos/${item}.png`">
          <div class="db-name">
            {{item}}
          </div>
          <transition name="el-zoom-in-center">
            <div class="selected-db" v-show="item === addModelForm.type">
              <img src="/static/image/DBlogos/correct.svg">
            </div>
          </transition>
        </div>
      </div>
      <span class="footer">
        <el-button :disabled="addModelForm.type === ''" style="width: 64px;height: 34px;padding: 7px 15px;"
                   type="primary" @click="submitForm('addModelForm')" size='mini'>确定</el-button>
        <el-button style="width: 64px;height: 34px" @click="cancelForm" size='mini'>取消</el-button>
      </span>
    </div>
    <div class="left-panel">
      <div class="operate-wrapper">
        <div class="new-model-btn">
          <new-model>
            <div>
              <div class="plus">+</div>
              <div class="content">新建模型</div>
            </div>
          </new-model>
        </div>
        <ul class="operate-item">
          <li :class="{active: current === 'model'}" @click="handleMyModel">
            <i class="iconfont icon-ownsee"></i>
            <div class="content">我的模型</div>
          </li>
          <li :class="{active: current === 'tree'}" @click="hanldeModelTree">
            <i class="iconfont icon-save"></i>
            <div class="content">模型目录</div>
          </li>
        </ul>
        <div class="user-wrapper">
          <el-popover
            popper-class="electron-user-logout"
            placement="right"
            min-width="20"
            trigger="click">
            <div style="cursor: pointer;" @click="logout">退出</div>
            <datablau-tooltip slot="reference" effect="dark" :content="$store.state.user.username" placement="top-start">
              <img :src="headSvg" alt="" />
            </datablau-tooltip>
          </el-popover>
        </div>
      </div>
    </div>
    <div class="content-panel">
      <model-list v-if="current=== 'model'" class="model-list full">
      </model-list>
      <model-library v-if="current=== 'tree' && alive">
      </model-library>
    </div>
  </div>
</template>
<script>
import headSvg from '@/assets/images/electron/head.png'
import modelList from '@/views/dashboard/modelList.vue'
import modelLibrary from '@/views/modelLibrary/modelLibrary.vue'
import HTTP from '@/resource/http'
import string from '@/resource/utils/string'
import sort from '@/resource/utils/sort'
import dbTree from '@/views/modelLibrary/tree/DatablauTree.vue'
import dbType from '@/components/dataSource/databaseType.js'
import newModel from '@/views/common/newModel.vue'

export default {
  data () {
    return {
      defaultkey: [1],
      modelCategoryMap: new Map(),
      moveTreeDefaultProps: {
        label: 'name',
        children: 'children',
        id: 'id'
      },
      cateGoryData: {},
      chosenMoveCategoryId: null,
      treeData: null,
      showModeCategory: false,
      current: 'model',
      headSvg,
      alive: true,
      showAddModel: false,
      logicalModel: ['Conceptual', 'Logical'],
      sqlModels: ['MySQL', 'Oracle', 'PostgreSQL', 'SQLServer', 'MariaDB', 'GaussDBA', 'DB2LUW', 'GBase', 'Greenplum', 'Hana', 'MaxCompute', 'OceanbaseMySQL', 'OceanbaseO', 'PolarDBMySQL', 'PolarDBO', 'Teradata', 'TiDB', 'DaMeng', 'GoldenDB', 'OpenGauss', 'HashData', 'Hologres', 'CBase', 'TDSQLMySQL'],
      noSqlModels: ['Hive', 'Cassandra', 'Impala', 'MongoDB', 'Inceptor'],
      addModelForm: {
        name: '',
        type: '',
        path: '',
        pathId: ''
      },
      addModelFormRules: {
        name: [
          { required: true, message: '请输入模型名称', trigger: 'blur' },
          { min: 4, max: 40, message: '长度在 4 到 40 个字符', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择模型类型', trigger: 'change' }
        ],
        path: [
          { required: true, message: '请选择模型目录', trigger: 'change' }
        ]
      }
    }
  },
  mounted () {
    this.getSupportedModel()
    this.getModelsTree()
    if (this.$route.query.pId) {
      this.current = 'tree'
      this.showAddModel = false
    }
  },
  watch: {
    $route () {
      if (this.$route.query.pId) {
        this.current = 'tree'
        this.showAddModel = false
      }
    }
  },
  components: {
    modelList,
    modelLibrary,
    dbTree,
    newModel
  },
  provide () {
    return {
      refresh: this.refresh
    }
  },
  methods: {
    getSupportedModel () {
      let SqlDbHide = []
      let NoSqlDbHide = []
      if (!this.$store.state.featureMap.ddm_Database_CBase) {
        SqlDbHide.push('CBase')
      }
      // if (!this.$store.state.featureMap.ddm_Database_TDSQLMySQL) {
      //   SqlDbHide.push('TDSQLMySQL')
      // }

      if (!this.$store.state.featureMap.ddm_Database_Cassandra) {
        NoSqlDbHide.push('Cassandra')
      }
      if (!this.$store.state.featureMap.ddm_Database_MongoDB) {
        NoSqlDbHide.push('MongoDB')
      }

      _.pullAll(this.sqlModels, SqlDbHide)
      _.pullAll(this.noSqlModels, NoSqlDbHide)
    },
    showDir () {
      this.getModelsTree(() => {
        this.showModeCategory = true
      })
    },
    logout () {
      HTTP.logout()
    },
    getModelsTree (callback) {
      let categoryMap = {}
      const sortModelLib = (result, bindDam = false) => {
        // 递归 增加判断 是否已经绑定 dam 系统
        // childrenBindDam: 自身 或者 子目录 绑定了 dam 系统
        result.childrenBindDam = false
        categoryMap[result.id] = result
        if (result.damModelCategoryId) {
          result.childrenBindDam = true
        }
        result.parentBindDam = !!bindDam
        if (result.children) {
          sort.sortConsiderChineseNumber(result.children, 'name')
          result.children.forEach(item => {
            // 排序 并 返回 是否绑定 dam 系统
            if (sortModelLib(item, !!item.damModelCategoryId || result.parentBindDam)) {
              result.childrenBindDam = true
            }
          })
        }

        return !!result.childrenBindDam
      }
      const handler = (result) => {
        this.rootModelId = result.id
        sortModelLib(result)
        this.pushModels(result)
        this.treeData = [result]
        this.treeDataLoaded = true
        this.categoryMap = categoryMap
        setTimeout(() => {
          callback && callback()
        })
      }
      if (this.$store.state.modelsTree) {
        handler(this.$store.state.modelsTree)
      } else {
        HTTP.getModels({
          successCallback: handler
        })
      }
    },
    pushModels (treeData) {
      const forEach = node => {
        if (!node) return
        if (this.modelCategoryMap.has(node.id)) {
          node.models = this.modelCategoryMap.get(node.id)
        }
        if (node.children) {
          node.children.forEach(item => {
            forEach(item)
          })
        }
      }
      forEach(treeData)
    },
    handleMoveCategory () {
      this.addModelForm.path = this.cateGoryData.name
      this.addModelForm.pathId = this.cateGoryData.id
      this.showModeCategory = false
    },
    chooseMoveCategoryNode (data, node) {
      if (data.id === 1) {
        this.$datablauMessage({
          message: '不能选择根目录',
          type: 'error',
          showClose: true
        })
        return
      }
      this.chosenMoveCategoryId = data.id
      this.cateGoryData = data
    },
    filterNode (value, data, node) {
      if (!value) {
        return true
      }
      if (!data.name) {
        return false
      }
      let hasValue = false
      let current = node
      if (string.matchKeyword(node.data, value, 'name', 'alias')) {
        hasValue = true
      }
      // do {
      //   if (string.matchKeyword(current.data, value, 'name', 'alias')) {
      //     hasValue = true
      //   }
      //   current = current.parent
      // } while (current && !Array.isArray(current.data))
      return hasValue
    },
    dataIconFunction (data, node) {
      if (node.level === 1) {
        return 'tree-icon model'
      }
      if (node.data.damModelCategoryId) {
        if (node.expanded) {
          return 'iconfont icon-openfilebinding'
        } else {
          return 'iconfont icon-filebinding'
        }
      } else {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      }
    },
    openCreateModelDialog () {
      this.showAddModel = true
      this.addModelForm = {
        name: '',
        type: '',
        path: '',
        pathId: ''
      }
      this.$refs.addModelForm.resetFields()
    },
    cancelForm () {
      this.$refs.addModelForm.resetFields()
      this.showAddModel = false
      this.addModelForm = {
        name: '',
        type: ''
      }
    },
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.addModel()
        } else {
          return false
        }
      })
    },
    addModel () {
      this.wholeLoading = true
      HTTP.addModel({
        modelInfo: {
          name: this.addModelForm.name,
          description: '',
          categoryId: this.addModelForm.pathId,
          type: this.addModelForm.type,
          owner: this.$store.state.user.name
        }
      })
        .then(res => {
          this.wholeLoading = false
          this.refresh()
          this.$message.success('模型新增成功')
          this.editModel({ row: res })
        })
        .catch(err => {
          console.error(err)
          this.wholeLoading = false
        })
    },
    editModel (scope) {
      this.$http.put(`${this.$url}/service/editor/${scope.row.id}/lock`).then(res => {
        if (res.data) {
          // this.$router.push({
          //   path: '/main/modeledit',
          //   query: {
          //     id: scope.row.id,
          //     currentVersion: scope.row.currentVersion,
          //     modelType: scope.row.modelType,
          //     phase: scope.row.phase ? scope.row.phase : 0
          //   }
          // })
          this.showAddModel = false
          // window.open(`./index.html#/main/modeledit?id=${scope.row.id}&currentVersion=${scope.row.currentVersion}&modelType=${scope.row.modelType}&phase=${scope.row.phase ? scope.row.phase : 0}`, '', 'width=1300,height=800,contextIsolation=no,nodeIntegration=yes,autoHideMenuBar=true')
          const { ipcRenderer } = window.require('electron')
          ipcRenderer && ipcRenderer.send('newTab', JSON.stringify(scope.row))
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    refresh () {
      this.alive = false
      this.$nextTick(() => {
        this.alive = true
      })
    },
    handleMyModel () {
      this.current = 'model'
      this.showAddModel = false
    },
    hanldeModelTree () {
      this.current = 'tree'
      this.showAddModel = false
      this.$router.push('/electron/main/list')
    }
  }
}
</script>
<style lang="scss">
  .electron-user-logout {
    min-width: 55px;
    width: 55px;
  }
</style>
<style lang="scss" scoped>
  .footer {
    padding-bottom: 40px;
  }
  .user-wrapper {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    text-align: center;
    cursor: pointer;
    img {
      width: 48px;
      height: 48px;
    }
    h2 {
      text-align: center;
      margin-top: 8px;
      font-size: 18px;
      line-height: 50px;
      color: #555;
      font-weight: normal;
    }
  }
  .left-panel {
    position: absolute;
    left: 0;
    width: 100px;
    bottom: 0;
    top: 1px;
    border-right: 1px solid #D8D8D8;
    background: #FBFBFB;
  }
  /deep/ .tree-area:not(.model) {
    border-top: 1px solid #e3e3e3;
  }
  .content-panel {
    position: absolute;
    left: 100px;
    right: 0;
    bottom: 0;
    top: 0;
    background: #fff;
    /deep/ .table-area {
      top: 0;
    }
  }
  .operate-wrapper {
    .new-model-btn {
      margin: 20px 20px 32px;
      color: #409EFF;
      font-size: 14px;
      text-align: center;
      cursor: pointer;
      & .plus {
        width: 40px;
        height: 40px;
        display: inline-block;
        background: #409EFF;
        color: #fff;
        font-size: 35px;
        line-height: 40px;
        border-radius: 50%;
        margin-bottom: 10px;
      }
    }
    .operate-item {
      li {
        padding: 19px 10px 16px;
        width: 80px;
        margin: 0 auto;
        box-sizing: border-box;
        background: #fff;
        border-radius: 4px;
        text-align: center;
        cursor: pointer;
        i {
          font-size: 20px;
          color: #999;
        }
        .content {
          font-size: 14px;
          color: #555;
        }
        &.active {
          background: #409EFF;
          i {
            color: #fff;
          }
          .content {
            color: #fff;
          }
        }
      }
    }
  }
  .create-model-dialog {
    position: absolute;
    left: 100px;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    background: #fff;
    padding: 20px 20px 0;
    overflow: auto;
    .dialog-head {
      font-size: 16px;
      font-weight: 500;
      color: #409EFF;
      line-height: 50px;
    }
    .el-dialog__header {
      padding: 0;
      padding-left: 20px;
      height: 50px;
      border-bottom: 1px solid #ddd;
      position: relative;
    }
    .el-dialog__headerbtn {
      top: 14px;
      right: 16px;
      font-size: 14px;
    }
    .el-dialog__body {
      padding-right: 0;
      padding-bottom: 0;
      height: 505px;
      background-color: #f7f7f7;
      overflow-y: auto;
    }
    .el-dialog__footer {
      height: 64px;
    }
    .db-logo-container {
      .disc {
        margin-top: 20px;
        font-size: 12px;
        font-family: "Microsoft YaHei", "PingFang SC", serif;
        font-weight: 500;
        color: #555555;
      }
      .db-logo-box {
        position: relative;
        display: inline-block;
        margin-top: 10px;
        margin-right: 18px;
        width: 150px;
        height: 86px;
        cursor: pointer;
        img {
          display: block;
          margin: 0 auto;
        }
        background-color: #fff;
        .db-name {
          font-size: 12px;
          text-align: center;
          line-height: 26px;
        }
      }
      .selected-db {
        position: absolute;
        top: 0;
        left: 0;
        width: 150px;
        height: 86px;
        background-color: rgba(85, 85, 85, 0.7);

        img {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }
  }
</style>
