<template>
  <div class="wrapper">
    <div class="flex">
      <div class="logo">
<!--        <img src="/static/image/logo.svg" alt="">-->
<!--       根据左侧菜单切换图标-->
        <img src="/static/image/architecture.svg" alt="" v-if="headJson.type === 'Framework'">
        <img src="/static/image/area.svg" alt="" v-else-if="headJson.type === 'Domain'">
        <img src="/static/image/theme.svg" alt="" v-else>
      </div>
      <div class="flex1">
        <h1>{{headJson.name}}</h1>
        <div class="describeBox">
          <div class="flex detail">
            <div>类型：{{headJson.type === 'Framework' ? '企业架构' : headJson.type === 'Domain' ? '领域' : '主题'}}</div>
            <div>简称：{{headJson.alias}}</div>
            <div>管理员：{{headJson.owner}}</div>
          </div>
          <div class="flex detail">
            <div>层级：{{headJson.type === 'Framework' ? 'L0' : headJson.type === 'Domain' ? 'L1' : 'L2'}}</div>
            <div>状态：{{headJson.status === 'NotSubmitted' ? '未提交' : headJson.status === 'UnderReview' ? '审核中' : '已发布'}}</div>
            <div>更新时间：{{headJson.lastModifiedTime}}</div>
          </div>
          <div>描述：{{headJson.description}}</div>
        </div>
      </div>
    </div>
    <div class="ascription" v-show="headJson.type !== 'Framework'">
      <span>父主题：</span>
      <b @click="leftMenu(parentName.id)">{{parentName.name}}</b>
    </div>
    <div v-show="headJson.type !== 'Subject'">
      <div class="til">{{headJson.type === 'Domain' ? '主题' : '领域'}}-{{len}}个</div>
      <ul class="fieldList">
        <li v-for="item in headJson.children" :key="item.id" @click="leftMenu(item.id)">{{item.name}}</li>
        <li class="add" @click="addField">+</li>
      </ul>
      <Dialog :flag="show" :title="headJson.type === 'Domain' ? '添加主题' : '添加领域'" :from="form" @save="save" @cancel="cancel"></Dialog>
    </div>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import Dialog from '../component/dialog'
export default {
  components: { Dialog },
  props: {},
  data () {
    return {
      headJson: {},
      len: 0,
      form: {},
      show: false,
      parentName: ''
    }
  },
  watch: {},
  computed: {},
  methods: {
    level () {
      this.$bus.$off('level').$on('level', res => {
        if (res.lastModifiedTime) {
          res.lastModifiedTime = this.time(res.lastModifiedTime)
        } else {
          res.lastModifiedTime = ''
        }
        this.headJson = res
        this.len = res.children.length
      })
      this.$bus.$off('parentName').$on('parentName', res => {
        this.parentName = res
      })
    },
    time (val) {
      let data = new Date(val)
      let year = data.getFullYear()
      let month = data.getMonth() + 1
      let dates = data.getDate()
      let hours = data.getHours()
      let minute = data.getMinutes()
      let second = data.getSeconds()
      return `${year}-${month < 10 ? '0' + month : month}-${dates < 10 ? '0' + dates : dates} ${hours < 10 ? '0' + hours : hours}:${minute < 10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}`
    },
    addField () {
      this.show = true
      this.form = {}
    },
    save () {
      if (!this.form.name) {
        this.$message.warning('名称必须填写')
        return
      }
      this.form.parentId = this.headJson.id
      HTTP.addNameTree(this.form).then(res => {
        this.categoryTree()
      }).catch(e => {
        // this.$showFailure(e)
      })
      this.show = false
    },
    cancel () {
      this.show = false
    },
    categoryTree () {
      HTTP.categoryTree().then(res => {
        this.$bus.$emit('update', res)
      }).catch(e => {
        // this.$showFailure(e)
      })
    },
    leftMenu (id) {
      this.$bus.$emit('nextTickMethod', id)
    }
  },
  created () {},
  mounted () {
    this.level()
  }
}
</script>
<style lang="scss" scoped>
.wrapper{
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
        flex: 1;
      }
    }
  }
  .flex{
    display: flex;
  }
  .flex1{
    flex: 1;
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
      width: 65px;
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
  .fieldList{
    margin-top: 10px;
    display: flex;
    li{
      width:100px;
      height: 30px;
      text-align: center;
      line-height: 30px;
      background-color: rgb(222, 237, 253);
      color: rgb(79, 160, 230);
      margin-right: 10px;
      margin-bottom: 10px;
      cursor: pointer;
      &.add{
        font-size: 26px;
        line-height: 26px;
        cursor: pointer;
      }
    }
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
</style>
