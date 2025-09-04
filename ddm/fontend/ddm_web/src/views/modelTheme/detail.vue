<template>
    <div class="model-theme-detail" v-loading="loading">
        <!-- <div class="top clearfix">
            <span class="back-btn" @click="goBack">
              <img :src="backImg" alt="">
              <i>{{$store.state.$v.modelDetail.back}}</i>
            </span>
            <h1>{{info.name}}</h1>
        </div> -->
        <datablau-breadcrumb
            :node-data="nodeData"
            :couldClick="false"
            @back="goBack"
          ></datablau-breadcrumb>
          <div class="detail-box clearfix">
            <div class="logo"></div>
            <div class="row">
              <div class="title">
                主题：{{info.name}}
              </div>
              <div class="info clearfix">
                <div class="mes">
                  主题编码：{{info.code}}
                </div>
                <div class="tag">
                  |
                </div>
                <div class="long-box">
                  <div class="long-inner">
                    {{info.definition}}
                  </div>
                  <el-popover
                    popper-class="long-text-pop"
                    width='367'
                    v-if="info.definition && info.definition.length > 28"
                    placement='left-start'
                  >
                    <div slot="reference" class="check-text" >
                      查看
                    </div>
                    <div class="long-text-inner">
                      <div class="title-box">
                        {{info.name}}
                      </div>
                      {{info.definition}}
                    </div>
                  </el-popover>
                </div>
              </div>
            </div>
            <img :src="bg" >
          </div>
        <!-- <datablau-tabs v-model="activeName">
        <el-tab-pane label="基本属性" name="details">
            <div class="info-detail">
                    <ul>
                      <li>
                        <h2><i class="iconfont icon-menu-zlbg"></i><span>定义</span></h2>
                        <p class="content">{{info.definition}}</p>
                      </li>
                      <li>
                        <h2><i class="iconfont icon-menu-zlbg"></i><span>目的</span></h2>
                        <p class="content">{{info.purpose}}</p>
                      </li>
                      <li>
                        <h2><i class="iconfont icon-menu-zlbg"></i><span>范围</span></h2>
                        <p class="content">{{info.scope}}</p>
                      </li>
                      <li>
                        <h2><i class="iconfont icon-menu-zlbg"></i><span>包含</span></h2>
                        <p class="content">{{info.include}}</p>
                      </li>
                      <li>
                        <h2><i class="iconfont icon-menu-zlbg"></i><span>不包含</span></h2>
                        <p class="content">{{info.exclude}}</p>
                      </li>
                    </ul>
                  </div>
        </el-tab-pane>
        <el-tab-pane label="业务对象" name="subject">
          <datablau-button
          type="important"
          @click="hanldeObjectAdd"
        >添加对象</datablau-button>
          <business-obj ref="obj" v-if="activeName === 'subject'" :object-id="id" show-type='theme'></business-obj>
        </el-tab-pane>
      </datablau-tabs> -->
      <div class="content-box">
        <div class="content-title">
          业务对象
        </div>
        <datablau-button
          type="important"
          @click="goBusinessObj"
          class="iconfont icon-shezhi"
        >管理业务对象</datablau-button>
          <business-obj ref="obj" :object-id="id" show-type='theme'></business-obj>
      </div>
      <datablau-dialog
          :visible.sync="dialogVisible"
          custom-class="theme-create-form"
          :title="editModel ? '编辑对象' : '创建对象'"
          width="450px"
          height="500"
          append-to-body
          :before-close="handleClose"
        >
          <div class="content">
            <datablau-form
              v-loading="loading"
              label-width="68px"
              :model="createForm"
              ref="createForm"
              :rules="rules">
              <el-form-item label="对象名称" prop="name">
                <datablau-input v-model="createForm.name" placeholder="请输入对象名称" clearable></datablau-input>
              </el-form-item>
              <el-form-item label="对象编码" prop="code">
                <datablau-input v-model="createForm.code" placeholder="请输入对象编码" clearable></datablau-input>
              </el-form-item>
              <el-form-item label="目的" prop="purpose">
                <datablau-input v-model="createForm.purpose" placeholder="请输入目的" clearable></datablau-input>
              </el-form-item>
              <el-form-item label="定义" prop="definition">
                <datablau-input type="textarea" v-model="createForm.definition" placeholder="请输入定义" clearable></datablau-input>
              </el-form-item>
              <el-form-item label="范围" prop="scope">
                <datablau-input v-model="createForm.scope" placeholder="请输入范围" clearable></datablau-input>
              </el-form-item>
              <el-form-item label="包括" prop="include">
                <datablau-input v-model="createForm.include" placeholder="请输入包括" clearable></datablau-input>
              </el-form-item>
              <el-form-item label="不包括" prop="exclude">
                <datablau-input v-model="createForm.exclude" placeholder="请输入不包括" clearable></datablau-input>
              </el-form-item>
            </datablau-form>
          </div>
          <span slot="footer">
            <datablau-button @click="handleCancel">取 消</datablau-button>
            <datablau-button type="primary" @click="handleSubmit">
              确 定
            </datablau-button>
          </span>
        </datablau-dialog>
    </div>
</template>
<script>
import HTTP from '@/resource/http'
import businessObj from '@/views/assets/businessObj/main.vue'
export default {
  data () {
    return {
      nodeData: ['主题', '查看'],
      loading: true,
      backImg: require('../../assets/images/icon/back.svg'),
      bg: require('../../assets/images/bg/bg33.png'),
      info: {
        name: '',
        purpose: '',
        definition: '',
        scope: '',
        include: '',
        exclude: ''
      },
      activeName: 'details',
      dialogVisible: false,
      rules: {
        name: [
          { required: true, message: '请输入对象名称', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入对象编码', trigger: 'blur' }
        ]
      },
      editModel: false,
      createForm: {
        name: '',
        code: '',
        purpose: '',
        definition: '',
        scope: '',
        include: '',
        exclude: ''
      }
    }
  },
  components: { businessObj },
  props: ['id'],
  methods: {
    refreshData () {
      this.$refs.obj.refreshData()
    },
    createBussinessObject () {
      this.loading = true
      this.createForm.subjectId = this.id
      HTTP.createBussinessObject(this.createForm)
        .then(res => {
          this.loading = false
          this.$blauShowSuccess('业务对象创建成功')
          this.handleCancel()
          this.refreshData()
        })
        .catch(err => {
          this.loading = false
          console.error(err)
          this.$showFailure(err)
        })
    },
    handleSubmit () {
      this.$refs['createForm'].validate((valid) => {
        if (valid) {
          if (this.editModel) {
            // this.updateModelTheme()
          } else {
            this.createBussinessObject()
          }
        } else {
          return false
        }
      })
    },
    handleCancel () {
      this.$refs['createForm'].resetFields()
      this.createForm = {
        name: '',
        purpose: '',
        definition: '',
        scope: '',
        include: '',
        exclude: ''
      }
      this.editModel = false
      this.dialogVisible = false
    },
    handleClose (done) {
      this.handleCancel()
      done()
    },
    goBusinessObj () {
      this.$router.push({ path: '/main/businessObj' })
    },
    getModelThemeDetail (id) {
      HTTP.getModelThemeDetail(id)
        .then(res => {
          this.loading = false
          this.info = res
        })
        .catch(err => {
          console.error(err)
          this.showFailure(err)
        })
    },
    goBack () {
      this.$router.push({ path: '/main/modelTheme' })
    }
  },
  mounted () {
    this.getModelThemeDetail(this.id)
  }
}
</script>
<style lang="scss" scoped>
.model-theme-detail {
    background: #fff;
    padding: 0px;
    /deep/ .tab-with-table .datablau-tab-table-line {
      top: 42px;
    }
    /deep/ .db-table {
      top: 0;
      padding-left: 0;
      padding-right: 0;
    }
    .detail-box {
      position: relative;
      padding:0 20px;
      padding-top: 14px;
      height: 60px;
      background: #F6F8FF;
      > img {
        position: absolute;
        top: 0;
        right: 0;
      }
      > div {
        float: left;
      }
      .logo {
        margin-right: 10px;
        width: 32px;
        height: 32px;
        background: #409EFF;
        border-radius: 10px;
      }
      .row {
        .title {
          margin-bottom: 6px;
          font-size: 16px;
          font-weight: 500;
          color: #555555;
          line-height: 16px;
        }
        .info {
          font-size: 12px;
          font-weight: 400;
          color: #555555;
          div {
            float: left;
          }
          .tag {
            margin: 0 20px;
          }

        }
        .long-box {
          height: 23px;
          div {
            float: left;
          }
          .check-text {
            margin-left: 10px;
            cursor: pointer;
            color: #409EFF;
          }
        }
        .long-inner {
          width: 348px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
    .content-box {
      position: absolute;
      top: 84px;
      right: 0;
      bottom: 0;
      left: 0;
      .content-title {
        position: absolute;
        top: 10px;
        left: 20px;
        height: 16px;
        line-height: 16px;
        z-index: 9;
        padding-left: 6px;
        border-left: 4px solid #409EFF;
        font-size: 14px;
        font-weight: 500;
        color: #555555;
      }
    }
    /deep/ .ant-breadcrumb .breadcrumb-item:last-of-type .ant-breadcrumb-separator {
      display: none;
    }
    /deep/ .table-tab-container {
      top: 35px;
      background-color: #fff;
    }
    .db-breadcrumb {
      padding: 0 20px;
      background-color: #fff;
    }
    .clearfix::after {
      content: "";
      clear: both;
      display: table;
    }
    /deep/ #tab-details {
      padding: 0;
      padding-left: 20px;
    }
    .top {
        background: #fff;
        span,h1 {
            float: left;
        }
    }
    .datablau-tabs {
      background: #fff;
      height: 40px;
    }
    .info-detail {
    position: absolute;
    top: 10px;
    bottom: 30px;
    left: 20px;
    right: 20px;
    padding: 0 20px;
    overflow: auto;
    h2 {
      vertical-align: middle;
      .icon-menu-zlbg {
        color: #409EFF;
        font-size: 24px;
        margin-right: 4px;
      }
      span {
        position: relative;
        top: -3px;
        display: inline-block;
        color: #333;
        font-size: 14px;
        line-height: 24px;
      }
    }
    p {
      margin: 10px 30px 20px;
      font-size: 12px;
      line-height: 17px;
      color: #333;
      padding: 10px;
      background-color: #FAFAFA;
    }
  }
    /deep/ .tab-with-table .datablau-tab-top-line {
      top: 0px;
      height: 32px;
      padding-left: 0px;
      left: 20px;
      right: 20px;
    }
    // .row {
    //     padding-left: 20px;
    //     margin-bottom: 15px;
    //     div {
    //         font-size: 14px;
    //         color: #555;
    //         float: left;
    //     }
    // }
    .back-btn {
        margin-right: 15px;
        font-size: 12px;
        line-height: 1;
        color: #888F9D;
        padding: 7px 12px;
        background: #F7F7F7;
        cursor: pointer;
        &:active {
          background: #e5e5e5;
        }
        img {
          width: 16px;
          margin-right: 4px;
          vertical-align: middle;
        }
        i {
          font-style: normal;
          vertical-align: middle;
        }
  }
  .is-block.important{
      position: absolute;
      right: 20px;
      top: 34px;
      z-index: 99;
      &::before {
          margin-right: 5px;
        }
  }
  /deep/ .business-obj {
    left: 0px;
    right: 0px;
    bottom: 5px;
  }
  /deep/ .el-tabs__content {
  position: absolute;
    top: 86px;
    left: 20px;
    right: 20px;
    bottom: 0;
    background-color: #fff;
}
}
</style>
<style lang="scss">
// .el-tabs__content {
//   position: absolute;
//     top: 86px;
//     left: 20px;
//     right: 20px;
//     bottom: 0;
//     background-color: #fff;
// }
.long-text-pop {
  padding: 16px !important;
  .long-text-inner {
    font-size: 12px;
    color: #555;
    .title-box {
      margin-bottom: 8px;
      border-left: 4px solid #409EFF;
      padding-left: 4px;
      height: 14px;
      line-height: 14px;
    }
  }
}
</style>
