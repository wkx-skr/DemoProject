<template>
  <div class="base-info">
    <div class="db-fieldMessage-title">
      <p class="message-title">基本信息</p>
    </div>
    <div class="form-info" v-loading="loading">
      <datablau-form ref="form" :inline="true" :model="baseForm">
        <!-- <el-form-item label="应用名称" min-width="40%" prop="applicationName">
          <el-input :disabled="true" size="mini" style="width:300px" v-model="baseForm.applicationName"></el-input>
        </el-form-item>
        <span style="line-height:42px;">(字母名称和下划线)</span> -->
        <el-form-item class="item-form" min-width="50px" label="应用名称">
          <datablau-tooltip
            :content="baseForm.applicationName"
            :disabled="showNameTip"
          >
            <span
              class="item-detail-info app-name-info"
              @mouseover="getTooltip($event)"
            >
              {{ baseForm.applicationName }}
            </span>
          </datablau-tooltip>
        </el-form-item>
        <br />
        <el-form-item class="item-form" min-width="50px" label="所有者">
          <span class="item-detail-info">
            {{ baseForm.authCreator }}
          </span>
        </el-form-item>
        <br />
        <el-form-item
          class="item-form"
          label="appKey"
          min-width="50px"
          prop="appKey"
        >
          <span style="width: 1000px">{{ baseForm.appKey }}</span>
          <el-tooltip
            class="item"
            effect="dark"
            :content="appKeyTitle"
            placement="right"
          >
            <i class="icon iconfont icon-tips"></i>
          </el-tooltip>
        </el-form-item>
        <br />
        <el-form-item
          class="item-form"
          label="appSecret"
          min-width="50px"
          prop="appSecurity"
        >
          <span style="width: 500px">{{ baseForm.appSecurity }}</span>
          <el-tooltip
            class="item"
            effect="dark"
            :content="appSecurityTitle"
            placement="right"
          >
            <i class="iconfont icon-tips"></i>
          </el-tooltip>
          <datablau-button
            style="margin-left: 20px"
            type="secondary"
            plain
            size="mini"
            @click="updateNewKey"
            v-if="hasAccess"
          >
            重新生成
          </datablau-button>

          <br />
        </el-form-item>
        <br />
        <el-form-item
          class="area-item"
          label="应用描述"
          min-width="50px"
          prop="description"
        >
          <span style="width: 800px; display: inline-block">
            {{ baseForm.description }}
          </span>
        </el-form-item>
      </datablau-form>
    </div>
    <div class="bottom-line-detail">
      <div class="middle-info">
        <div class="db-fieldMessage-title">
          <p class="message-title">API列表</p>
        </div>
        <!-- <span class="text-info">Ⅱ API列表</span> -->
        <!-- <el-button size="mini" type="primary" round>申请API</el-button> -->
      </div>
      <div class="list-info">
        <base-list
          :modeType="modeType"
          :hasAccess="hasAccess"
          :detailData="detailData"
        ></base-list>
      </div>
    </div>
  </div>
</template>
<script>
import baseList from './baseList.vue'
import HTTP from '../ddsHTTP.js'
export default {
  props: ['detailData', 'modeType', 'moudleType', 'hasAccess'],
  components: { baseList },
  mounted() {
    this.getData()
  },
  created() {
    // let list = $('.bottom-line-detail')[0]
    let height
    setTimeout(() => {
      height =
        $('.form-info')[0].offsetHeight === 0
          ? 300
          : $('.form-info')[0].offsetHeight + 50
      this.$nextTick(() => {
        setTimeout(() => {
          $('.bottom-line-detail').css('top', height)
        })
      })
    }, 200)
  },
  data() {
    return {
      showNameTip: false,
      AccessAll: this.$auth.APP_MANAGE_ALL,
      loading: false,
      hideTopLine: false,
      baseForm: {},
      baseList: [],
      ownersOpt: [],
      appKeyTitle:
        'appKey是应用开发识别码，配合开发者密码可调用数据服务的接口能力',
      appSecurityTitle: '用户验证开发者身份，不要交给其他开发者。',
    }
  },
  computed: {
    // hasAccess(){
    //   let result;
    //   if(this.moudleType==='manageApp'){
    //     result=true;
    //   }else{
    //     result =this.modeType==='requestApp'&&(this.AccessAll || this.detailData.userState===1);
    //   }
    //   return result;
    // }
  },
  methods: {
    getTooltip(event) {
      let self = this
      this.$nextTick(() => {
        let aScroolWidth = $(event.target)[0]
          ? $(event.target)[0].scrollWidth
          : 0
        let aWidth = $(event.target)[0] ? $(event.target)[0].offsetWidth : 0
        if (aScroolWidth - aWidth > 0) {
          self.showNameTip = false
        } else {
          self.showNameTip = true
        }
      })
    },
    updateNewKey() {
      this.$DatablauCofirm('此操作旧AppSrect的接口将失效，是否继续?', '提示', {
        confirmButtonText: this.$t('common.button.ok'),
        cancelButtonText: this.$t('common.button.cancel'),
        type: 'warning',
      })
        .then(() => {
          HTTP.updateAppKey(this.baseForm.appId)
            .then(res => {
              this.$showSuccess('更新成功')
              this.getData()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '取消更新',
          })
        })
    },
    getData() {
      this.loading = true
      let id
      if (this.modeType === 'requestApp') {
        id = this.detailData.appId
      } else {
        id = this.detailData.id
      }
      HTTP.getAuthedList(id)
        .then(res => {
          this.loading = false
          this.baseForm = res.data.appAuthResultDto
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
          return Promise.reject([])
        })
    },
  },
}
</script>
<style lang="scss" scoped>
.base-info {
  top: 10px;
  bottom: 0;
  position: absolute;
  left: 0;
  right: 0;
  overflow: auto;
  .db-fieldMessage-title {
    margin-top: 10px;
    margin-left: 20px;
  }
  .form-info {
    position: absolute;
    margin-top: 10px;
    width: 100%;
    overflow: auto;
    /deep/.el-form.db-form .el-form-item__label {
      font-weight: bold;
    }
    .item-form {
      height: 30px;
    }
  }
  .bottom-line-detail {
    position: absolute;
    min-height: 340px;
    left: 0;
    right: 0;
    top: 200px;
    bottom: 0;
  }
  .item-detail-info {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 800px;
    display: inline-block;
  }
  .middle-info {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    span.text-info {
      color: #4386f5;
      font-weight: bold;

      span.text-info {
        color: #4386f5;
        font-weight: bold;
      }

      .el-button {
        float: right;
      }
    }
    .line {
      position: absolute;
      transition: translate(-50%);

      left: 50px;
      right: 0;
      height: 1px;
      background: #e0e0e0;
    }
  }

  .list-info {
    position: absolute;
    left: 0;
    right: 0;
    top: 40px;
    bottom: 0;
    overflow: auto;

    .tab-with-table {
      /deep/.datablau-tab-table-line {
        right: 20px;
      }
      /deep/.tab-bottom-line {
        left: 0;
        right: 0;
      }
    }
  }
}
</style>
