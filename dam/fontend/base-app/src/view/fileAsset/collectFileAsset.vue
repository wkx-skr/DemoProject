<template>
  <div class="collect-file-asset">
    <div class="page-title-row">
      <span class="menu font-medium" style="font-size: 18px">数据采集</span>
      <span class="gun">|</span>
      <span class="item">文件类资产</span>
    </div>
    <div class="bottom-part">
      <div class="content-con">
        <p class="title-line">文件路径</p>
        <div class="path-line">
          <div class="path-outer">
            <el-input
              size="mini"
              v-model="editData.sharePath"
              placeholder="请输入文件路径"
              type="textarea"
              class="path-input"
              :autosize="{ minRows: 1, maxRows: 5 }"
              clearable
            ></el-input>
          </div>
          <el-checkbox v-model="userPw" class="pw-check">使用密码</el-checkbox>
        </div>
        <div class="password-con">
          <el-form
            class="page-form"
            label-position="left"
            label-width="60px"
            size="small"
            :model="editData"
            style="overflow: hidden"
            ref="form"
          >
            <el-form-item label="描述">
              <el-input
                size="mini"
                v-model="editData.description"
                placeholder="请输入描述"
                type="textarea"
                class="des-input"
                :autosize="{ minRows: 1, maxRows: 5 }"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item label="用户名" v-if="userPw">
              <el-input
                size="mini"
                v-model="editData.username"
                placeholder="请输入用户名"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item label="密码" v-if="userPw">
              <el-input
                size="mini"
                type="password"
                v-model="editData.password"
                placeholder="请输入密码"
                clearable
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
        <div class="btn-line">
          <el-button
            size="small"
            type="primary"
            @click="confirmSharePath"
            :disabled="disableCommitButton"
          >
            采集数据
          </el-button>
          <el-button
            size="small"
            type="primary"
            @click="testSharePath"
            :disabled="disableCommitButton"
          >
            测试
          </el-button>
        </div>
      </div>
    </div>
    <div class="loading-mask" v-if="uploading">
      <i class="el-icon-loading"></i>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userPw: false,
      editData: {
        sharePath: '',
        description: '',
        username: '',
        password: '',
      },
      uploading: false,
      testedSuccessed: false,
    }
  },
  components: {},
  computed: {
    disableCommitButton() {
      let bool = false
      if (this.uploading) {
        bool = true
      }
      if (!(this.editData && this.editData.sharePath)) {
        bool = true
      }
      return bool
    },
  },
  mounted() {},
  methods: {
    confirmSharePath() {
      this.$message.success('开始采集')
      this.uploading = true
      const url = `${this.$url}/service/shareFile/folder`
      const body = this.getPara()
      this.$http
        .put(url, body)
        .then(res => {
          this.uploading = false
          this.$message.success('采集完成')
          this.editData = {
            sharePath: '',
            description: '',
            username: '',
            password: '',
          }
        })
        .catch(e => {
          this.$showFailure(e)
          this.uploading = false
        })
    },
    testSharePath() {
      this.testedSuccessed = false
      this.uploading = true
      const url = `${this.$url}/service/shareFile/folder/test`
      const body = this.getPara()
      this.$http
        .put(url, body)
        .then(res => {
          this.uploading = false
          this.testedSuccessed = true
          this.$message.success('连接成功')
        })
        .catch(e => {
          this.$showFailure(e)
          this.uploading = false
        })
    },
    getPara() {
      const obj = _.cloneDeep(this.editData)
      if (!this.userPw) {
        obj.username = ''
        obj.password = ''
      } else {
        // obj.password = this.$pwEncrypt(this.editData.password);
      }
      return obj
    },
  },
  watch: {},
}
</script>

<style lang="scss">
@mixin absPos() {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
.collect-file-asset {
  @include absPos;
  z-index: 1;
  .loading-mask {
    z-index: 3;
    @include absPos;
    background-color: rgba(100, 100, 100, 0.3);
    text-align: center;
    // color: #fff;
    i {
      position: absolute;
      font-size: 50px;
      left: 50;
      top: 40%;
    }
  }
  .bottom-part {
    padding: 0 20px;
    .content-con {
      // border: 1px solid red;
      padding-left: 25px;
      border-top: 1px solid #ddd;
      padding-top: 35px;
      .title-line {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 30px;
      }
      .path-line {
        vertical-align: middle;
        margin-bottom: 20px;
        .path-outer {
          width: 70%;
          max-width: 550px;
          display: inline-block;
        }
        .pw-check {
          vertical-align: middle;
          display: inline-block;
          margin: -20px 0 0 20px;
        }
      }
      .password-con {
        .el-textarea {
          width: 460px;
          textarea {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
