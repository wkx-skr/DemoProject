<template>
  <el-dialog
    :visible.sync="visible"
    append-to-body
    close-on-click-modal
    width="610px"
    title="版本信息"
    class="version-info"
  >
    <el-table
      :data="tableData"
      class="datablau-table"
      :show-header="false"
      :border="false"
      v-if="false"
    >
      <el-table-column prop="label" width="160">
        <template slot-scope="scope">
          <span style="font-weight: bold">{{ scope.row.label }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="value">
        <template slot-scope="scope">
          <div v-html="scope.row.value"></div>
        </template>
      </el-table-column>
    </el-table>
    <el-form label-width="200px" label-position="left" class="info-container">
      <el-form-item
        v-for="(item, index) in tableData"
        :key="index"
        :label="item.label"
        :class="item.class"
      >
        <span v-if="item.class !== 'features'">{{ item.value }}</span>
        <span v-else v-html="item.value"></span>
      </el-form-item>
    </el-form>
    <div class="bottom-pwb" v-if="$customSetting.showLogoInAbout">
      <span class="text-inner">
        Powered by
        <a
          title="datablau 数语科技"
          @click="datablau"
          href="http://www.datablau.cn"
          target="_blank"
        >
          数语科技
        </a>
      </span>
    </div>
  </el-dialog>
</template>

<script>
import moment from 'moment'
import HTTP from '@/http/main'

export default {
  data() {
    return {
      visible: false,
      tableData: [],
    }
  },
  mounted() {
    this.$bus.$on('showVersionMessageDdm', this.showDialog)
  },
  beforeDestroy() {
    this.$bus.$off('showVersionMessageDdm')
  },
  methods: {
    showDialog() {
      this.getAbout()
    },
    getAbout() {
      HTTP.getAbout().then(res => {
        const data = res.data
        // if ((data.web.parsedRv & 16) === 16) {
        //   this.$store.state.lic.editor = true
        // }
        // if ((data.web.parsedRv & 256) === 256) {
        //   this.$store.state.lic.quality = true
        // }
        // if ((data.web.parsedRv & 4096) === 4096) {
        //   this.$store.state.lic.domain = true
        // }
        // if ((data.web.parsedRv & 65536) === 65536) {
        //   this.$store.state.lic.archy = true
        // }
        this.tableData = []
        this.prepareData(res.data)
        this.visible = true
      })
    },
    prepareData(data) {
      const buildExpireDate = timestamp => {
        if (timestamp - new Date().getTime() > 1000 * 3600 * 24 * 365 * 20) {
          return '永久有效'
        } else {
          return moment(timestamp).format('YYYY-MM-DD')
        }
      }
      this.tableData.push({
        label: '版本',
        value: data.version,
        class: 'version',
      })
      this.tableData.push({
        label: '构建号',
        value: data.buildNumber,
        class: 'build-number',
      })
      this.tableData.push({
        label: '授权用户',
        value: data.server.licUser,
        class: 'lic-user',
      })
      this.tableData.push({
        label: '授权到期日期',
        value: buildExpireDate(data.server.licExpireTime),
        class: 'lic-expire-time',
      })
      this.tableData.push({
        label: '编辑权限用户数',
        value: data.web.licModelNumber,
        class: 'lic-model-number',
      })
      // this.tableData.push({
      //   label: 'WEB授权用户',
      //   value: data.web.licUser
      // })
      // this.tableData.push({
      //   label: 'WEB授权到期日期',
      //   value: buildExpireDate(data.web.licExpireTime),
      //   class: 'lic-expire-time'
      // })
      let right = `<i class="enable-icon el-icon-check enable-model"></i>`
      let wrong = `<i class="enable-icon el-icon-close disable-model"></i>`
      let modelArr = [
        {
          name: 'qualityReport',
          label: '模型管理',
          class: 'quality-report',
          code: 256,
        },
        {
          name: 'domain',
          label: '数据标准',
          class: 'domain',
          code: 4096,
        },
        {
          name: 'editOnline',
          label: '模型Web设计器',
          class: 'edit-online',
          code: 16,
        },
        {
          name: 'archy',
          label: '企业架构',
          class: 'archy',
          code: 65536,
        },
      ]
      let features = ''
      modelArr.forEach(item => {
        let enableIcon = ''
        if ((data.web.parsedRv | item.code) === data.web.parsedRv) {
          enableIcon = right
        } else {
          enableIcon = wrong
        }
        features += `<span class="feature-label"><span class="${item.class}">${item.label}</span>${enableIcon}</span>`
      })
      this.tableData.push({
        label: 'WEB授权模块',
        value: features,
        class: 'features',
      })
    },
    datablau() {
      // window.open('http://www.datablau.cn')
    },
  },
}
</script>

<style scoped lang="scss"></style>
<style lang="scss">
.version-info {
  .el-dialog {
    border-radius: 5px;
  }

  .el-dialog__header {
    border-bottom: 1px solid #dddddd;

    .el-dialog__title {
      font-weight: bold;
      font-size: 16px;
      color: #3a3e44;
    }

    .el-dialog__headerbtn .el-icon-close {
      color: #696969;
      font-size: 16px;
    }
  }

  .info-container {
    padding-left: 48px;
    // margin-bottom: 0;
    padding-top: 25px;

    .el-form-item {
      line-height: 20px;
      margin-bottom: 15px;

      .el-form-item__label {
        color: #838998;
        line-height: 20px;
      }

      .el-form-item__content {
        line-height: 20px;
        color: #2d3546;
      }
    }

    .features {
      .feature-label {
        display: inline-block;
        width: 4em;
        margin-right: 20px;
        width: 140px;
        height: 34px;
        border: 1px solid #e2e2e2;
        line-height: 32px;
        box-sizing: border-box;
        padding: 0 8px 0 14px;
        border-radius: 6px;
        margin-bottom: 12px;

        .enable-icon {
          float: right;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          color: #fff;
          text-align: center;
          line-height: 20px;
          font-size: 12px;
          margin-top: 6px;
        }

        .enable-model {
          font-weight: bold;
          background-color: #6acf72;
          margin-left: 0.5em;
        }

        .disable-model {
          font-weight: bold;
          background-color: #d94e00;
          margin-left: 0.5em;
        }
      }
    }
  }

  .bottom-pwb {
    border-radius: 8px;
    background-color: #f5f9ff;
    text-align: center;
    margin-bottom: 10px;

    .text-inner {
      display: inline-block;
      width: 100%;
      height: 34px;
      font-size: 12px;
      line-height: 34px;
      // opacity:0.75;
      color: #878d9b;

      a {
        cursor: pointer;
        color: #4587f5;
      }
    }
  }
}
</style>
