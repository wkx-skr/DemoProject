<template>
  <div class="page-heading">
    <datablau-dialog title="选择目录" :visible.sync="showModeCategory" size="l">
      <div style="height: 100%; min-height: 400px; overflow: auto">
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
    <datablau-dialog
      :close-on-click-modal="false"
      :visible.sync="showAddModel"
      width="1040px"
      height="632px"
      custom-class="create-model-dialog"
      :modal-append-to-body="false"
      @close="cancelForm"
    >
      <div class="dialog-head" slot="title">新建模型</div>
      <el-form
        style="position: relative; left: -25px; padding-top: 10px"
        :model="addModelForm"
        ref="addModelForm"
        :rules="addModelFormRules"
        label-width="80px"
        :inline="false"
        size="normal"
      >
        <el-form-item label="模型名称" prop="name" size="mini">
          <el-input
            maxlength="40"
            id="limit-paste"
            style="max-width: 178px"
            v-model="addModelForm.name"
          ></el-input>
        </el-form-item>
        <el-form-item label="目录位置" prop="path" size="mini">
          <el-input
            maxlength="40"
            readonly
            style="max-width: 178px; cursor: pointer"
            v-model="addModelForm.path"
            @click.native="showModeCategory = true"
          ></el-input>
        </el-form-item>
      </el-form>
      <div class="db-logo-container">
        <div class="disc">1、逻辑数据模型</div>
        <div
          v-for="item in logicalModel"
          :key="item"
          class="db-logo-box"
          @click="addModelForm.type = item"
        >
          <img :src="`${webPath}static/image/DBlogos/${item}.png`" />
          <div class="db-name">
            {{ item }}
          </div>
          <transition name="el-zoom-in-center">
            <div class="selected-db" v-show="item === addModelForm.type">
              <img :src="`${webPath}static/image/DBlogos/correct.svg`" />
            </div>
          </transition>
        </div>
      </div>
      <div class="db-logo-container">
        <div class="disc">2、分析型数据模型</div>
        <div
          v-for="item in sqlModels"
          :key="item"
          class="db-logo-box"
          @click="addModelForm.type = item"
        >
          <img
            :src="
              item !== 'GaussDB/A'
                ? `${webPath}static/image/DBlogos/${item}.png`
                : `${webPath}static/image/DBlogos/GaussDBA.png`
            "
          />
          <div class="db-name">
            {{ item }}
          </div>
          <transition name="el-zoom-in-center">
            <div class="selected-db" v-show="item === addModelForm.type">
              <img :src="`${webPath}static/image/DBlogos/correct.svg`" />
            </div>
          </transition>
        </div>
      </div>
      <div class="db-logo-container" style="padding-bottom: 20px">
        <div class="disc">3、NoSQL数据模型</div>
        <div
          v-for="item in noSqlModels"
          :key="item"
          class="db-logo-box"
          @click="addModelForm.type = item"
        >
          <img :src="`${webPath}static/image/DBlogos/${item}.png`" />
          <div class="db-name">
            {{ item }}
          </div>
          <transition name="el-zoom-in-center">
            <div class="selected-db" v-show="item === addModelForm.type">
              <img :src="`${webPath}static/image/DBlogos/correct.svg`" />
            </div>
          </transition>
        </div>
      </div>
      <span slot="footer">
        <el-button
          style="width: 64px; height: 34px"
          @click="cancelForm"
          size="mini"
        >
          取消
        </el-button>
        <el-button
          :disabled="addModelForm.type === ''"
          style="width: 64px; height: 34px; padding: 7px 15px"
          type="primary"
          @click="submitForm('addModelForm')"
          size="mini"
        >
          确定
        </el-button>
      </span>
    </datablau-dialog>
    <about></about>
    <img
      v-if="false"
      class="datablau-logo"
      id="logo"
      src="./guanwang_black.png"
      alt="logo"
      style="cursor: pointer"
      @click="goToIndex"
    />
    <div class="logo-container" v-else>
      <img
        class="custom-logo"
        :src="imgName"
        alt="logo"
        style="
          cursor: pointer;
          width: 144px;
          margin: 0 20px 0 10px;
          vertical-align: middle;
        "
        @click="goToIndex"
      />
    </div>
    <Menu></Menu>
    <div class="right">
      <div
        class="search-outer"
        :class="{ 'show-search-input': showSearchInput }"
        @click="searchInputShow"
      >
        <div class="input-outer">
          <el-input
            placeholder="请输入关键词"
            size="mini"
            v-model="keyword"
            @blur="searchInputBlur"
            @focus="searchInputFocus"
            @keyup.enter.native="skip2Search"
            @clear="focusInput"
            :clearable="true"
            v-if="showSearchInput"
            ref="searchInput"
            class="search-input"
          >
            <!--<i slot="suffix" class="el-icon-search el-input__icon" @click="skip2Search" style="cursor: pointer;"></i> -->
          </el-input>
          <i
            class="el-icon-search"
            style="color: #f6f6f6"
            v-show="!showSearchInput"
          ></i>
        </div>
      </div>
      <iframe :src="iframeSrc" style="display: none"></iframe>
      <el-tooltip content="版本信息" :hide-after="1000" effect="light">
        <img :src="icon.version" alt="" class="top-icon" @click="showInfo" />
      </el-tooltip>
      <span class="downlod-ddm">
        <el-tooltip content="下载DDM" :hide-after="1000" effect="light">
          <span class="down-btn" @click="downloadDDM">
            <i class="img-download"></i>
          </span>
        </el-tooltip>
      </span>
      <span
        v-if="$store.state.lic.editor"
        @click="openCreateModelDialog"
        class="new-model-btn"
      >
        <i class="iconfont icon-NewModel" style="margin-right: 5px"></i>
        新建模型
      </span>
      <span class="downlod-ddm">
        <el-tooltip content="启动DDM客户端" :hide-after="1000" effect="light">
          <div class="sign-in-ddm-wrapper">
            <span class="down-btn" @click="signInDDM">
              <i class="img-workbench"></i>
              &nbsp;启动DDM客户端
            </span>
          </div>
        </el-tooltip>
      </span>
      <el-dropdown trigger="click" @command="handleCommand">
        <span class="el-dropdown-link">
          <!--          <img :src="portraitSrc" class="portrait" alt="" />-->
          <i class="iconfont icon-schema"></i>
          <span class="text oneline-eclipse">
            {{ $user.fullname || $user.username }}
          </span>
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="user">个人工作台</el-dropdown-item>
          <el-dropdown-item command="token">获取动态密码</el-dropdown-item>
          <el-dropdown-item
            command="changeProduct"
            v-if="gatewayEnable && $damEnabled"
          >
            切换产品
          </el-dropdown-item>
          <el-dropdown-item command="logout">登出</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div id="context-menu" v-show="showContext">
      <ul class="context-menu-style">
        <div v-for="(o, idx) in contextOptions" :key="o.idx">
          <li v-if="!o.line" class="context-option" @click="o.callback(o.args)">
            <i v-if="o.icon" class="icon" :class="o.icon"></i>
            <span class="label">{{ o.label }}</span>
          </li>
          <template v-else>
            <div class="hr"></div>
          </template>
        </div>
      </ul>
      <div class="arrow"></div>
    </div>
  </div>
</template>
<script>
import HTTP from '@/http/main'
import Menu from './Menu'
import string from '@/utils/String.js'
import about from './about.vue'
import dbTree from './tree/DatablauTree.vue'
import sort from '@/utils/sort'

export default {
  components: { Menu, about, dbTree },
  data() {
    return {
      ddmBaseUrl: window.setting.products.ddm.serverPath,
      ddmWebPath: window.setting.products.ddm.webPath,
      defaultkey: [1],
      modelCategoryMap: new Map(),
      moveTreeDefaultProps: {
        label: 'name',
        children: 'children',
        id: 'id',
      },
      cateGoryData: {},
      chosenMoveCategoryId: null,
      treeData: null,
      showModeCategory: false,
      webPath: window.setting.products.ddm.webPath,
      logicalModel: ['Conceptual', 'Logical'],
      sqlModels: [
        'MySQL',
        'Oracle',
        'PostgreSQL',
        'SQLServer',
        'MariaDB',
        'GaussDBA',
        'DB2LUW',
        'GBase',
        'Greenplum',
        'Hana',
        'MaxCompute',
        'OceanbaseMySQL',
        'OceanbaseO',
        'PolarDBMySQL',
        'PolarDBO',
        'Teradata',
        'TiDB',
        'DaMeng',
        'GoldenDB',
        'OpenGauss',
        'HashData',
        'Hologres',
      ],
      noSqlModels: ['Hive', 'Cassandra', 'Impala', 'MongoDB', 'Inceptor'],
      addModelForm: {
        name: '',
        type: '',
        path: '',
        pathId: '',
      },
      addModelFormRules: {
        name: [
          { required: true, message: '请输入模型名称', trigger: 'blur' },
          {
            min: 4,
            max: 40,
            message: '长度在 4 到 40 个字符',
            trigger: 'blur',
          },
        ],
        type: [
          { required: true, message: '请选择模型类型', trigger: 'change' },
        ],
        path: [
          { required: true, message: '请选择模型目录', trigger: 'change' },
        ],
      },
      showAddModel: false,
      icon: {
        version: require('../../components/common/main/navIcon/version.svg'),
      },
      showSearchInput: false,
      keyword: '',
      ifSearchInputFocus: false,
      portraitSrc: require('../../components/common/main/portrait/1.png'),
      imgName: require('./guanwang_black.png'),
      iframeSrc: null,
      showContext: false,
      contextOptions: [],
      gatewayEnable: window.setting.gatewayEnable,
    }
  },
  created() {
    this.getModelsTree()
    window.sessionStorage.setItem('ddmFirst', 'true')
    this.$setHeader(true)
    // this.prototype.$ddmFirst = true
  },
  computed: {
    customerId() {
      return this.$customerId || 'datablau'
    },
  },
  mounted() {
    this.createContextMenu()
    let route = this.$route
    this.handleCommandFromDam()
    if (route && route.name === 'searchResult') {
      let query = this.$route.query
      let keyword = _.trim(query.keyword)
      if (keyword) {
        this.searchInputShow()
        this.keyword = keyword
        setTimeout(() => {
          this.focusInput()
        }, 1000)
      }
    }
  },
  beforeDestroy() {
    $(window).off('mouseup', this.hideContextMenu)
  },
  methods: {
    getModelsTree(callback) {
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
            if (
              sortModelLib(
                item,
                !!item.damModelCategoryId || result.parentBindDam
              )
            ) {
              result.childrenBindDam = true
            }
          })
        }

        return !!result.childrenBindDam
      }
      const handler = result => {
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
        this.$http
          .get(`${this.ddmBaseUrl}/service/models/`)
          .then(res => {
            handler(res.data)
          })
          .catch(err => {
            this.$showFailure(err)
          })
      }
    },
    pushModels(treeData) {
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
    handleMoveCategory() {
      this.addModelForm.path = this.cateGoryData.name
      this.addModelForm.pathId = this.cateGoryData.id
      this.showModeCategory = false
    },
    chooseMoveCategoryNode(data, node) {
      if (data.id === 1) {
        this.$datablauMessage({
          message: '不能选择根目录',
          type: 'error',
          showClose: true,
        })
        return
      }
      this.chosenMoveCategoryId = data.id
      this.cateGoryData = data
    },
    filterNode(value, data, node) {
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
    dataIconFunction(data, node) {
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
    openCreateModelDialog() {
      this.showAddModel = true
    },
    cancelForm() {
      this.$refs.addModelForm.resetFields()
      this.showAddModel = false
      this.addModelForm = {
        name: '',
        type: '',
      }
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.addModel()
        } else {
          return false
        }
      })
    },
    addModel() {
      this.wholeLoading = true
      this.$http
        .post(`${this.ddmBaseUrl}/service/models/`, {
          modelInfo: {
            name: this.addModelForm.name,
            description: '',
            categoryId: this.addModelForm.pathId,
            type: this.addModelForm.type,
            owner: this.$user.username,
          },
        })
        .then(res => {
          this.wholeLoading = false
          // this.refresh()
          this.$message.success('模型新增成功')
          this.editModel({ row: res.data })
          this.showAddModel = false
        })
        .catch(err => {
          this.$showFailure(err)
          this.wholeLoading = false
        })
    },
    editModel(scope) {
      this.$http
        .put(`${this.ddmBaseUrl}/service/editor/${scope.row.id}/lock`)
        .then(res => {
          if (res.data) {
            location.href = `${this.ddmWebPath}#/main/modeledit?id=${
              scope.row.id
            }&currentVersion=${scope.row.currentVersion}&modelType=${
              scope.row.modelType
            }&phase=${scope.row.phase ? scope.row.phase : 0}`
            // this.$router.push({
            //   path: '/main/modeledit',
            //   query: {
            //     id: scope.row.id,
            //     currentVersion: scope.row.currentVersion,
            //     modelType: scope.row.modelType,
            //     phase: scope.row.phase ? scope.row.phase : 0,
            //   },
            // })
            // window.open(`${window.baseUrl}#/main/modeledit?id=${scope.row.id}&currentVersion=${scope.row.currentVersion}&modelType=${scope.row.modelType}&phase=${scope.row.phase ? scope.row.phase : 0}`)
          }
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    hideContextMenu() {
      this.showContext = false
    },
    createContextMenu() {
      const dom = $('#context-menu')
      $(window).on('mouseup', this.hideContextMenu)
      this.$bus.$on(
        'callContextMenu',
        ({ x, y, options, placement = 'right' }) => {
          console.log('options', 'options')
          this.contextOptions = options
          this.showContext = true
          this.$nextTick(() => {
            switch (placement) {
              case 'right':
                dom.removeClass('to-right')
                dom.css({
                  top: y + 1 + 10 + 'px',
                  left: x + 1 - 23 + 'px',
                })
                break
              case 'left':
                dom.addClass('to-right')
                dom.css({
                  top: y + 1 + 10 + 'px',
                  left: x + 25 - parseFloat(dom.css('width')) + 'px',
                })
                break
              case 'bottom-left':
                dom.css({
                  top: y + 10 + 'px',
                  left: x - 100 + 'px',
                })
                break
            }
          })
        }
      )
    },
    handleCommandFromDam() {
      const query = _.cloneDeep(this.$route.query)
      const command = query.command
      delete query.command
      switch (command) {
        case 'dataModelingDownload':
          this.downloadDDM()
          break
        case 'dataModelingSetup':
          this.signInDDM()
          break
        case 'dataModelingMyModel':
        case 'dataModelingModelMap':
          this.$skip2Ddm({
            query: query,
          })
          break
        default:
          break
      }
    },
    handleCommand(command) {
      if (command === 'logout') {
        HTTP.logout('ddm')
      } else if (command === 'changeProduct') {
        location.href = '../base-app/datablau.html'
      } else if (command === 'version') {
        this.showInfo()
      } else if (command === 'update') {
        // this.$router.push('update').catch(e => {
        //   this.$message.info('已经位于产品更新页面')
        // })
      } else if (command === 'token') {
        HTTP.getWebToken()
          .then(res => {
            let token = res.data
            if (token) {
              console.log(token)
              const h = this.$createElement
              this.$msgbox({
                title: '动态密码',
                showCancelButton: true,
                cancelButtonText: '确定',
                confirmButtonText: '复制到粘贴板',
                message: h(
                  'textarea',
                  {
                    attrs: {
                      readonly: 'readonly',
                    },
                    style: {
                      width: '350px',
                      height: '80px',
                      resize: 'none',
                    },
                  },
                  token
                ),
                closeOnClickModal: false,
              })
                .then(() => {
                  string.setClipBoard(token)
                  this.$message.success('复制成功')
                })
                .catch(() => {})
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
        // HTTP.getWebToken({
        //   successCallback: token => {
        //     if (token) {
        //       console.log(token)
        //       const h = this.$createElement
        //       this.$msgbox({
        //         title: '动态密码',
        //         showCancelButton: true,
        //         cancelButtonText: '确定',
        //         confirmButtonText: '复制到粘贴板',
        //         message: h(
        //           'textarea',
        //           {
        //             attrs: {
        //               readonly: 'readonly',
        //             },
        //             style: {
        //               width: '350px',
        //               height: '80px',
        //               resize: 'none',
        //             },
        //           },
        //           token
        //         ),
        //         closeOnClickModal: false,
        //       })
        //         .then(() => {
        //           string.setClipBoard(token)
        //           this.$message.success('复制成功')
        //         })
        //         .catch(() => {})
        //     }
        //   },
        // })
      } else if (command === 'user') {
        this.$skip2Ddm({ name: 'userModal' })
      }
    },
    showInfo() {
      this.$bus.$emit('showVersionMessageDdm')
    },
    goToIndex() {
      this.$skip2Ddm({ name: 'dashboard' })
    },
    searchInputShow() {
      this.showSearchInput = true
    },
    searchInputHide() {
      this.showSearchInput = this.ifSearchInputFocus
    },
    searchInputFocus() {
      this.ifSearchInputFocus = true
    },
    searchInputBlur() {
      this.ifSearchInputFocus = false
      this.searchInputHide()
    },
    skip2Search() {
      let keyword = _.trim(this.keyword)
      let query = this.$route.query || {}
      let queryKeyword = _.trim(query.keyword || '')
      if (queryKeyword !== keyword) {
        this.$skip2Ddm({
          name: 'searchResult',
          query: {
            keyword: keyword,
          },
        })
      }
    },
    focusInput(para) {
      if (this.$refs.searchInput) {
        this.$refs.searchInput.focus()
      }
    },
    downloadDDM() {
      this.$skip2Ddm({ name: 'ddmDownload' })
      // HTTP.downloadDDM()
      // let url = this.ddmLoginUrl + '/static/download/DDMSetup.zip'
      // this.$downloadFile(url);
      // window.open(url)
    },
    signInDDM() {
      HTTP.getWebToken()
        .then(res => {
          let token = res.data
          if (token) {
            const json = this.$skip2Ddm({ name: 'ddmOpen' })
            json.WebLoginToken = token
            const s = JSON.stringify(json)
            this.iframeSrc = 'ddm:' + `${btoa(JSON.stringify(json))}`
            this.$message({
              message: `正在尝试启动DDM客户端。如未看到启动界面，请检查DDM客户端是否已被正确的安装和配置`,
              type: 'warning',
              duration: 8000,
              showClose: true,
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
</script>
<style scoped lang="scss">
.create-model-dialog {
  .dialog-head {
    font-size: 16px;
    font-weight: 500;
    color: #409eff;
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
.downlod-ddm {
  cursor: pointer;
}
.el-dropdown-link {
  .iconfont {
    font-size: 16px;
    margin-right: 5px;
    opacity: 0.7;
  }
}
.sign-in-ddm-wrapper {
  display: inline-block;
  width: 144px;
  height: 32px;
  background: linear-gradient(112deg, #5ba9d1 0%, #2573ca 100%);
  border-radius: 16px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  line-height: 32px;
  padding-left: 16px;
}
.el-dropdown {
  display: inline-block;
  height: 32px;
  background: rgba(140, 160, 200, 0.2);
  border-radius: 16px;
  padding: 0 6px;
  line-height: 32px;
  vertical-align: middle;
}
.new-model-btn {
  display: inline-block;
  height: 32px;
  line-height: 32px;
  opacity: 0.7;
  background: rgba(140, 160, 200, 0.2);
  border-radius: 16px;
  padding: 0 10px;
  margin-right: 8px;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
}
@import './pageHeading.scss';
</style>

<style lang="scss">
@import '~@/assets/styles/const.scss';
@import '~@/next/components/basic/color.sass';
@import './style.css';

.show-search-input {
  .search-input {
    input.el-input__inner:focus {
      outline: none;
      border-color: #dcdfe6;
    }
  }
}
html body {
  min-width: 600px !important;
}
</style>
