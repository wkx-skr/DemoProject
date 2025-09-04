<template>
  <div class="container">
    <div class="left-part">
      <el-menu
        :default-active="currentIndex"
        class="el-menu-vertical-demo"
        @open="handleOpen"
        @close="handleClose"
        @select="handleSelect"
        :default-openeds="[
          'guide',
          'basic',
          'nav',
          'data',
          'form',
          'information',
          'other',
          'business',
          'dashboard',
        ]"
      >
        <el-submenu index="guide">
          <template slot="title">
            <i class="el-icon-position"></i>
            <span>组件总览</span>
          </template>
          <el-menu-item index="guide-develop">组件开发</el-menu-item>
          <el-menu-item index="guide-apply">使用规范</el-menu-item>
        </el-submenu>
        <el-submenu index="basic">
          <template slot="title">
            <i class="el-icon-turn-off"></i>
            <span>Basic 基本组件</span>
          </template>
          <el-menu-item index="guide-color">Color 颜色</el-menu-item>
          <el-menu-item index="guide-icon">Icon 图标</el-menu-item>
          <el-menu-item index="common-button">Button 按钮</el-menu-item>
          <el-menu-item index="common-status">Status 类型状态</el-menu-item>
        </el-submenu>
        <el-submenu index="nav">
          <template slot="title">
            <i class="el-icon-turn-off"></i>
            <span>Nabigation 导航</span>
          </template>
          <el-menu-item index="common-tab">Tabs 标签页</el-menu-item>
          <el-menu-item index="common-tag">Tag 标签</el-menu-item>
          <el-menu-item index="common-breadcrumb">
            Breadcrumb 面包屑
          </el-menu-item>
          <el-menu-item index="common-detail-subtitle">
            DetailSubtitle 内容标题
          </el-menu-item>
        </el-submenu>
        <el-submenu index="data">
          <template slot="title">
            <i class="el-icon-turn-off"></i>
            <span>Data 数据展示</span>
          </template>
          <el-menu-item index="common-table">Table 表格</el-menu-item>
          <!-- 新增暂无 -->
          <!-- <el-menu-item index="common-tag">Tag 标签</el-menu-item> -->
          <el-menu-item index="common-progress">Progressed 进度条</el-menu-item>
          <el-menu-item index="common-tree">Tree 树形控件</el-menu-item>
          <el-menu-item index="common-pagination">Pagination 分页</el-menu-item>
          <el-menu-item index="common-empty">Empty 空状态</el-menu-item>
          <!-- <el-menu-item >Avatar 头像</el-menu-item> -->
          <!-- <el-menu-item >Skeleton 骨架屏</el-menu-item> -->
          <!-- <el-menu-item >Empty 空状态</el-menu-item> -->
        </el-submenu>
        <el-submenu index="form">
          <template slot="title">
            <i class="el-icon-turn-off"></i>
            <span>Form 表单</span>
          </template>
          <el-menu-item-group>
            <template slot="title">Common 通用</template>
            <el-menu-item index="common-radio">Radio 单选框</el-menu-item>
            <el-menu-item index="common-checkbox">Checkbox 多选框</el-menu-item>
            <el-menu-item index="common-input">Input 输入框</el-menu-item>
            <el-menu-item index="common-select">Select 选择框</el-menu-item>
            <el-menu-item index="common-dropdown">
              Dropdown 下拉菜单
            </el-menu-item>
            <el-menu-item index="common-cascader">
              Cascader 级联组件
            </el-menu-item>
            <el-menu-item index="common-switch">Switch 开关</el-menu-item>
            <el-menu-item index="common-date-range">
              DateTimePicker 日期时间选择器
            </el-menu-item>
            <el-menu-item index="common-date">
              DatePicker 日期选择器
            </el-menu-item>
            <el-menu-item index="common-star">Rate 评分</el-menu-item>
            <el-menu-item index="common-transfer">Transfer 穿梭框</el-menu-item>
            <el-menu-item index="common-upload">Upload 上传</el-menu-item>
            <el-menu-item index="common-download">Download 下载</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group>
            <template slot="title">业务使用</template>
            <el-menu-item index="common-detail">
              Descriptions 表单浏览
            </el-menu-item>
            <el-menu-item index="common-form">
              FromFilling 表单填写
            </el-menu-item>
            <el-menu-item index="common-form-submit">
              FormSubmit 表单确认
            </el-menu-item>
            <el-menu-item index="meta-data-attr">抽屉</el-menu-item>
          </el-menu-item-group>
        </el-submenu>
        <el-submenu index="information">
          <template slot="title">
            <i class="el-icon-turn-off"></i>
            <span>Information 信息交互</span>
          </template>
          <el-menu-item-group>
            <template slot="title">Notice 通告消息</template>
            <el-menu-item index="common-loading">Loading 加载中</el-menu-item>
            <el-menu-item index="common-message">Message 消息提示</el-menu-item>
            <el-menu-item index="common-pop-confirm">
              Pop 弹出框提示
            </el-menu-item>
            <el-menu-item index="common-message-box">
              Messagebox 消息确认
            </el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group>
            <template slot="title">Tips 提示</template>
            <el-menu-item index="common-badge">Badge 标记</el-menu-item>
            <el-menu-item index="common-tooltip">Tooltip 文字提示</el-menu-item>
            <el-menu-item index="common-richtip">
              Link 弹出框及链接
            </el-menu-item>
          </el-menu-item-group>
        </el-submenu>
        <el-submenu index="other">
          <template slot="title">
            <i class="el-icon-turn-off"></i>
            <span>Other其他组件</span>
          </template>
          <el-menu-item index="common-editor">Editor 富文本</el-menu-item>
          <el-menu-item index="common-codeMirror">SQL 编辑器</el-menu-item>
        </el-submenu>
        <el-submenu index="business">
          <template slot="title">
            <i class="el-icon-turn-off"></i>
            <span>business 业务模块</span>
          </template>
          <el-menu-item index="common-list-search">
            ListSearch 列表检索
          </el-menu-item>
          <el-menu-item index="common-dialog">Dialog 对话框</el-menu-item>
          <el-menu-item index="common-tree-header">
            TreeHeader 树顶部
          </el-menu-item>
          <el-menu-item index="common-high-light">
            HighLight 分词高亮
          </el-menu-item>
          <el-menu-item index="common-lineage">lineage 血缘图</el-menu-item>
        </el-submenu>
        <el-submenu index="dashboard">
          <template slot="title">
            <i class="el-icon-turn-off"></i>
            <span>Dashboard 驾驶舱</span>
          </template>
          <el-menu-item index="dashboard-number-card">数字卡片</el-menu-item>
        </el-submenu>
        <el-submenu index="service">
          <template slot="title">
            <i class="el-icon-turn-off"></i>
            <span>Service 服务</span>
          </template>
          <el-menu-item index="service-user">用户信息</el-menu-item>
        </el-submenu>
      </el-menu>
    </div>
    <div class="right-part">
      <guide-develop v-if="currentIndex === 'guide-develop'"></guide-develop>
      <guide-apply v-if="currentIndex === 'guide-apply'"></guide-apply>
      <guide-color v-if="currentIndex === 'guide-color'"></guide-color>
      <guide-icon v-if="currentIndex === 'guide-icon'"></guide-icon>
      <guide-type v-if="currentIndex === 'guide-type'"></guide-type>
      <service-user v-if="currentIndex === 'service-user'"></service-user>
      <service-date v-if="currentIndex === 'service-date'"></service-date>
      <service-export-excel
        v-if="currentIndex === 'service-export-excel'"
      ></service-export-excel>
      <service-export-pdf
        v-if="currentIndex === 'service-export-pdf'"
      ></service-export-pdf>
      <dashboard-number-card-demo
        v-if="currentIndex === 'dashboard-number-card'"
      ></dashboard-number-card-demo>
      <type-script-demo
        v-if="currentIndex === 'type-script'"
      ></type-script-demo>
      <button-demo v-if="currentIndex === 'common-button'"></button-demo>
      <input-demo v-if="currentIndex === 'common-input'"></input-demo>
      <radio-demo v-if="currentIndex === 'common-radio'"></radio-demo>
      <checkbox-demo v-if="currentIndex === 'common-checkbox'"></checkbox-demo>
      <datepicker-demo v-if="currentIndex === 'common-date'"></datepicker-demo>
      <upload-demo v-if="currentIndex === 'common-upload'"></upload-demo>
      <tree-demo v-if="currentIndex === 'common-tree'"></tree-demo>
      <editor-demo v-if="currentIndex === 'common-editor'"></editor-demo>
      <tabs-demo v-if="currentIndex === 'common-tab'"></tabs-demo>
      <tag-demo v-if="currentIndex === 'common-tag'"></tag-demo>
      <progress-demo v-if="currentIndex === 'common-progress'"></progress-demo>
      <download-demo v-if="currentIndex === 'common-download'"></download-demo>
      <select-demo v-if="currentIndex === 'common-select'"></select-demo>
      <dropdown-demo v-if="currentIndex === 'common-dropdown'"></dropdown-demo>
      <cascader-demo v-if="currentIndex === 'common-cascader'"></cascader-demo>
      <transfer-demo v-if="currentIndex === 'common-transfer'"></transfer-demo>
      <loading-demo v-if="currentIndex === 'common-loading'"></loading-demo>
      <table-demo v-if="currentIndex === 'common-table'"></table-demo>
      <message-demo v-if="currentIndex === 'common-message'"></message-demo>
      <dialog-demo v-if="currentIndex === 'common-dialog'"></dialog-demo>
      <high-light-demo
        v-if="currentIndex === 'common-high-light'"
      ></high-light-demo>
      <lineage-demo v-if="currentIndex === 'common-lineage'"></lineage-demo>
      <!-- 菜单 -->
      <menu-demo v-if="currentIndex === 'common-menu'"></menu-demo>
      <message-box-demo
        v-if="currentIndex === 'common-message-box'"
      ></message-box-demo>
      <tooltip-demo v-if="currentIndex === 'common-tooltip'"></tooltip-demo>
      <daterange-demo
        v-if="currentIndex === 'common-date-range'"
      ></daterange-demo>
      <rate-demo v-if="currentIndex === 'common-star'"></rate-demo>
      <pagination-demo
        v-if="currentIndex === 'common-pagination'"
      ></pagination-demo>
      <empty-demo v-if="currentIndex === 'common-empty'"></empty-demo>
      <breadcrumb-demo
        v-if="currentIndex === 'common-breadcrumb'"
      ></breadcrumb-demo>
      <table-list-demo
        v-if="currentIndex === 'common-table-list'"
      ></table-list-demo>
      <form-submit-demo
        v-if="currentIndex === 'common-form-submit'"
      ></form-submit-demo>
      <meta-data-attr-demo
        v-if="currentIndex === 'meta-data-attr'"
      ></meta-data-attr-demo>
      <list-search-demo
        v-if="currentIndex === 'common-list-search'"
      ></list-search-demo>
      <form-demo v-if="currentIndex === 'common-form'"></form-demo>
      <switch-demo v-if="currentIndex === 'common-switch'"></switch-demo>
      <icon-demo v-if="currentIndex === 'common-icon'"></icon-demo>
      <tips-demo v-if="currentIndex === 'common-tips'"></tips-demo>
      <code-mirror-demo
        v-if="currentIndex === 'common-codeMirror'"
      ></code-mirror-demo>
      <subtab-demo v-if="currentIndex === 'common-subtab'"></subtab-demo>
      <status-demo v-if="currentIndex === 'common-status'"></status-demo>
      <detail-demo v-if="currentIndex === 'common-detail'"></detail-demo>
      <detail-subtitle-demo
        v-if="currentIndex === 'common-detail-subtitle'"
      ></detail-subtitle-demo>
      <richtip-demo v-if="currentIndex === 'common-richtip'"></richtip-demo>
      <badge-demo v-if="currentIndex === 'common-badge'"></badge-demo>
      <pop-confirm-demo
        v-if="currentIndex === 'common-pop-confirm'"
      ></pop-confirm-demo>
      <userselect-demo
        v-if="currentIndex === 'common-userselect'"
      ></userselect-demo>
      <roleselect-demo
        v-if="currentIndex === 'common-roleselect'"
      ></roleselect-demo>
      <tree-header-demo
        v-if="currentIndex === 'common-tree-header'"
      ></tree-header-demo>
    </div>
  </div>
</template>

<script>
import GuideDevelop from './guide/guideDevelop.vue'
import GuideApply from './guide/guideApply.vue'
import GuideColor from './guide/guideColor.vue'
import GuideIcon from './guide/guideIcon.vue'
import GuideType from './guide/guideType.vue'
import ServiceUser from './service/user.vue'
import ServiceDate from './service/user.vue'
import ServiceExportExcel from './service/user.vue'
import ServiceExportPdf from './service/user.vue'
import DashboardNumberCardDemo from './dashboard/dashboardNumberCardDemo.vue'
import TypeScriptDemo from './guide/typescript.vue'
import ButtonDemo from './basic/buttonDemo.vue'
import UploadDemo from './basic/uploadDemo.vue'
import InputDemo from './basic/inputDemo.vue'
import RadioDemo from './basic/radioDemo.vue'
import TreeDemo from './basic/treeDemo.vue'
import CheckboxDemo from './basic/checkboxDemo.vue'
import DatepickerDemo from './basic/datepickerDemo.vue'
import EditorDemo from './basic/editorDemo.vue'
import TabsDemo from './basic/tabsDemo.vue'
import TagDemo from './basic/tagDemo.vue'
import ProgressDemo from './basic/progressDemo.vue'
import DownloadDemo from './basic/downloadDemo'
import selectDemo from './basic/selectDemo.vue'
import cascaderDemo from './basic/cascaderDemo.vue'
import transferDemo from './basic/transferDemo.vue'
import loadingDemo from './basic/loadingDemo.vue'
import TableDemo from './basic/tableDemo.vue'
import DaterangeDemo from './basic/daterangeDemo.vue'
import RateDemo from './basic/rateDemo.vue'
import PaginationDemo from './basic/paginationDemo.vue'
import EmptyDemo from './basic/emptyDemo.vue'

import breadcrumbDemo from './basic/breadcrumbDemo.vue'
import dialogDemo from './basic/dialogDemo.vue'

import messageDemo from './basic/messageDemo.vue'
import messageBoxDemo from './basic/messageBoxDemo.vue'
import tooltipDemo from './basic/tooltipDemo.vue'
import menuDemo from './basic/menuDemo.vue'
import tableListDemo from './basic/tableListDemo.vue'
import formSubmitDemo from './basic/formSubmitDemo.vue'
import formDemo from './basic/formDemo.vue'
import switchDemo from './basic/switchDemo.vue'
import listSearchDemo from './basic/listSearchDemo.vue'
import iconDemo from './basic/iconDemo.vue'
import tipsDemo from './basic/tipsDemo.vue'
import codeMirrorDemo from './basic/codeMirrorDemo.vue'
import subtabDemo from './basic/subtabDemo.vue'
import statusDemo from './basic/statusDemo.vue'
import detailDemo from './basic/detailDemo.vue'
import detailSubtitleDemo from './basic/detailSubtitleDemo.vue'
import userselectDemo from './basic/userselectDemo.vue'
import roleselectDemo from './basic/roleselectDemo.vue'
import richtipDemo from './basic/richtipDemo.vue'
// import metaDataAttrDemo from './basic/metaDataAttrDemo.vue'
import badgeDemo from './basic/badgeDemo.vue'
import popConfirmDemo from './basic/popConfirmDemo.vue'
import dropdownDemo from './basic/dropdownDemo.vue'
import highLightDemo from './basic/highLightDemo.vue'
import lineageDemo from './basic/lineageDemo.vue'
import treeHeaderDemo from './basic/treeHeaderDemo.vue'
export default {
  mounted() {
    this.fullScreenContent()
  },
  components: {
    menuDemo,
    GuideDevelop, // 指南-组件开发
    GuideApply, // 指南-组件应用
    GuideColor, // 指南-颜色
    GuideIcon, // 指南-图标
    GuideType, // 指南-资产状态
    ServiceUser,
    ServiceDate,
    ServiceExportExcel,
    ServiceExportPdf,
    DashboardNumberCardDemo, // 基本组件-驾驶舱-数字卡片
    TypeScriptDemo,
    ButtonDemo,
    UploadDemo,
    InputDemo,
    RadioDemo,
    CheckboxDemo,
    DatepickerDemo,
    TreeDemo,
    EditorDemo,
    TabsDemo,
    TagDemo,
    ProgressDemo,
    DownloadDemo,
    selectDemo,
    cascaderDemo,
    transferDemo,
    loadingDemo,
    TableDemo,
    DaterangeDemo,
    RateDemo,
    PaginationDemo,
    EmptyDemo,
    breadcrumbDemo,
    messageDemo,
    messageBoxDemo,
    tooltipDemo,
    tableListDemo,
    formSubmitDemo,
    formDemo,
    dialogDemo,
    switchDemo,
    listSearchDemo,
    iconDemo,
    tipsDemo,
    codeMirrorDemo,
    subtabDemo,
    statusDemo,
    detailSubtitleDemo,
    detailDemo,
    userselectDemo,
    roleselectDemo,
    richtipDemo,
    // metaDataAttrDemo,
    badgeDemo,
    popConfirmDemo,
    dropdownDemo,
    highLightDemo,
    lineageDemo,
    treeHeaderDemo,
  },
  data() {
    return {
      currentIndex: 'guide-develop',
    }
  },
  methods: {
    fullScreenContent() {
      setTimeout(() => {
        $('#page-heading').css('display', 'none')
        $('#main-content').css('top', 0)
      })
    },
    handleOpen(key, keyPath) {
      // console.log(key, keyPath)
    },
    handleClose(key, keyPath) {
      // console.log(key, keyPath)
    },
    handleSelect(index, indexPath) {
      // this.currentIndex = index
      this.$router.push({
        name: 'frontendDevelopmentDocument',
        query: { currentIndex: index },
      })
    },
  },
  watch: {
    currentIndex() {},
    $route: {
      immediate: true,
      deep: true,
      handler(newVal) {
        if (newVal && newVal.query && newVal.query.currentIndex) {
          this.currentIndex = newVal.query.currentIndex
        } else {
          this.handleSelect(this.currentIndex)
        }
      },
    },
  },
}
</script>

<style scoped lang="scss">
.container {
  overflow: auto;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  padding: 20px;
}
.left-part {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 280px;
  overflow: auto;
}
.right-part {
  background-color: #fff;
  position: absolute;
  overflow: auto;
  left: 280px;
  right: 0;
  top: 0;
  bottom: 0;
  padding: 20px;
}
</style>
<style lang="scss">
.el-menu {
  border-right: none;
  background: #f6f8fd;
}
.left-part {
  .el-submenu__title {
    padding-left: 8px;
    font-size: 12px;
  }
  .el-submenu {
    // margin-right: 8px;
  }
  .el-submenu__title i {
    margin-right: 8px;
  }
  .el-submenu .el-menu-item {
    padding-left: 52px !important;
  }
}
</style>
