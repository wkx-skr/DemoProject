<template>
  <div class="wrapper">
    <datablau-breadcrumb
      :node-data="routerMap"
      :separator="'/'"
      :couldClick="true"
      :showBack="false"
      @nodeClick="changeRouter"
    ></datablau-breadcrumb>
<!--    <span v-for="(r, index) in (routerMap || [])" :key="index">> <a href="javascript:;" @click="changeRouter(r)" style="color: #409EFF;">{{ r.name }}</a></span>-->
<!--    <span> {{ parentData.name }}</span>-->
    <div class="wrapper" style="margin-top: 15px;">
      <div class="flex">
        <div class="logo">
<!--          更具业务对象实体物理表c`切换图片-->
<!--          <img src="/static/image/logo.svg" alt="" />-->
          <img src="/static/image/object.svg" alt="" v-if="!parentData.entityFlag">
          <img src="/static/image/CEntity.svg" alt="" v-else-if="parentData.entityFlag && parentData.typeName === `C'`">
          <img src="/static/image/table.svg" alt="" v-else-if="parentData.entityFlag && parentData.typeName === `物理表`">
          <img src="/static/image/entity.svg" alt="" v-else>
<!--          <span v-if="!parentData.entityFlag">业务对象</span>-->
<!--          <span v-else-if="parentData.entityFlag">-->
<!--            <span v-if="parentData.typeName === `C'`">C'</span>-->
<!--            <span v-else-if="parentData.typeName === `物理表`">物理表</span>-->
<!--            <span v-else>业务实体</span>-->
<!--          </span>-->
        </div>
        <div>
          <h1>{{ parentData.name }}</h1>
          <div class="describeBox" v-if="!parentData.entityFlag">
            <div class="flex detail">
              <div>类型：业务对象</div>
              <div>编号：{{ parentData.code }}</div>
              <div>状态：{{ formatStatus(parentData.status) }}</div>
            </div>
            <div class="flex detail">
              <div>管理员：{{ parentData.owner }}</div>
              <div >更新时间：{{ time(parentData.lastModifiedTime) }}</div>
            </div>
            <div class="flex detail">
              <div style="width: 500px;">描述：{{ parentData.description }}</div>
            </div>
          </div>
          <div  class="describeBox"  v-else-if="parentData.entityFlag">
            <div class="flex detail">
              <div>中文名称：{{parentData.aliasName}}</div>
              <div>类型：{{parentData.typeName || '业务实体'}}</div>
            </div>
            <div class="flex detail">
              <div>描述：{{parentData.definition}}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="ascription">
        <!-- <span>被引用的主题</span> -->
      </div>
      <!-- <div class="">图谱</div> -->
      <datablau-tabs v-model="activeName" @tab-click="handleClick" style="margin-top: 10px;">
        <el-tab-pane v-for="l in tabsLabel" :key="l.name" :name="l.name" :label="l.label">
          <component v-bind:is="l.tabContent" :parentData="parentData" :activeName="activeName"/>
        </el-tab-pane>
      </datablau-tabs>
    </div>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import EntityTabContent from '../component/entityTabContent.vue'
import PysicalTab from '../component/physicalTab'
import Business from '../component/business'
import EntityC from '../component/entityC'
import IndexInformation from '../component/indexInformation'
import Properties from '../component/properties'
export default {
  components: { EntityTabContent, PysicalTab, Business, EntityC, IndexInformation, Properties },
  props: {
    routerMap: {
      type: Array,
      default: () => {
        return []
      }
    },
    currentData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      len: 0,
      form: {},
      show: false,
      parentName: '',
      tabsLabel: [{
        name: 'entity',
        tabContent: 'entityTabContent',
        label: '业务实体'
      }],
      activeName: 'entity',
      parentData: {}
    }
  },
  watch: {
    currentData: {
      handler (cv, pv) {
        this.parentData = cv
        if (cv.entityFlag === 'entity') { // 实体下钻
          this.tabsLabel = [
            {
              name: 'entityC',
              tabContent: 'EntityC',
              label: `C'`
            },
            {
              name: 'physical',
              tabContent: 'PysicalTab',
              label: '物理表'
            },
            {
              name: 'Business',
              tabContent: 'business',
              label: '业务属性'
            }
          ]
          this.activeName = 'entityC'
        } else if (cv.entityFlag === 'entityC') { // c`下钻
          this.tabsLabel = [{
            name: 'physical',
            tabContent: 'PysicalTab',
            label: '物理表'
          },
          {
            name: 'Business',
            tabContent: 'business',
            label: '业务属性'
          }
          ]
          this.activeName = 'physical'
        } else if (cv.entityFlag === 'physical') { // 物理表下钻
          this.tabsLabel = [
            {
              name: 'BusinessP',
              tabContent: 'Business',
              label: '字段信息'
            },
            {
              name: 'indexInformation',
              tabContent: 'IndexInformation',
              label: '索引信息'
            },
            {
              name: 'properties',
              tabContent: 'Properties',
              label: '扩展属性'
            }
          ]
          this.activeName = 'BusinessP'
        } else { // 业务对象默认
          this.tabsLabel = [{
            name: 'entity',
            tabContent: 'entityTabContent',
            label: '业务实体'
          },
          {
            name: 'Business',
            tabContent: 'business',
            label: '业务属性'
          }
          ]
          this.activeName = 'entity'
          this.parentData.entityFlag = false
        }
      },
      immediate: true,
      deep: true
    }
  },
  computed: {},
  methods: {
    time (val) {
      let data = new Date(parseInt(val))
      let year = data.getFullYear()
      let month = data.getMonth() + 1
      let dates = data.getDate()
      let hours = data.getHours()
      let minute = data.getMinutes()
      let second = data.getSeconds()
      return `${year}-${month < 10 ? '0' + month : month}-${dates < 10 ? '0' + dates : dates} ${hours < 10 ? '0' + hours : hours}:${minute < 10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}`
    },
    formatStatus (s) {
      if (s === 'NotSubmitted') return '未提交'
      if (s === 'UnderReview') return '未审核'
      if (s === 'Published') return '已发布'
      return ''
    },
    changeRouter (r) {
      r.routerDel = true
      // 和左边菜单栏关联
      if (r.type) {
        this.$bus.$emit('showTopData', r)
        this.$bus.$emit('levelChange', r)
        this.$bus.$emit('level', r)
      } else { // 从物理表回到c`
        if (r.entityFlag === 'entityC') r.entityFlag = 'entityC'
        // 业务对象、实体、物理表
        this.$bus.$emit('showLowerData', { parentData: this.parentData, row: r })
      }
    },
    handleClick () {}
  },
  created () {},
  mounted () {}
}
</script>
<style lang="scss" scoped>
.wrapper{
  overflow: hidden;
  color: #20293B;
  .logo{
    height: 50px;
    width: 50px;
    margin-right: 15px;
    font-size: 0;
    img{
      width: 100%;
    }
  }
  .describeBox{
    margin-top: 10px;
    &>div{
      margin-top: 3px;
      &>div{
        width: 250px;
      }
    }
  }
  .flex{
    display: flex;
  }
  .detail{
    div{
      margin-right: 50px;
    }
  }
  .ascription{
    margin-top: 10px;
    span{
      font-weight: bold;
      font-size: 14px;
      width: 165px;
      display: inline-block;
    }
    b{
      font-weight: normal;
      display: inline-block;
      padding: 0 5px;
      height: 30px;
      text-align: center;
      line-height: 30px;
      background-color: rgb(222, 237, 253);
      color: rgb(79, 160, 230);
      cursor: pointer;
    }
  }
  .til{
    font-weight: bold;
    margin-top: 10px;
    font-size: 14px;
  }
  .company-info-edit-wrapper {
    /deep/ {
      .el-dialog {
        width: 460px;
      }
      .el-dialog__header {
        display: none;
      }

      .el-dialog__body {
        padding: 24px 40px 20px;
        h2 {
          font-weight: normal;
          color: #3A3E44;
          font-size: 16px;
          line-height: 1;
        }
        .el-date-editor.el-input {
          width: 100%;
        }
        .el-button {
          width: 60px;
          height: 34px;
          padding: 0;
        }
      }
    }
  }
}
  /deep/ .el-tabs{
    padding-bottom: 35px;
  }
</style>
