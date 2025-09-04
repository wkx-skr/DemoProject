<template>
  <el-dialog
    :visible.sync="visible"
    append-to-body
    close-on-click-modal
    width="450px"
    :title="$v.about.versionInfo"
    class="version-info"
  >
    <el-table
      :data="tableData"
      class="datablau-table"
      :show-header="false"
      :border="false"
      v-if="false"
    >
      <el-table-column prop="label" width="250px">
        <template slot-scope="scope">
          <span style="font-weight: bold">{{scope.row.label}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="value">
        <template slot-scope="scope">
          <div v-html="scope.row.value"></div>
        </template>
      </el-table-column>
    </el-table>
    <el-form label-width="250px" label-position="left" class="info-container">
      <el-form-item v-for="(item, index) in tableData" :key="index" :label="item.label" :class="item.class">
        <span v-if="item.class!=='features' && item.class!=='lic-expire-time'"> {{ item.value }} </span>
        <span v-else v-html="item.value"></span>
      </el-form-item>
    </el-form>
    <div class="bottom-pwb" v-if="$customSetting.showLogoInAbout">
      <span class="text-inner">
        Powered by
        <a
          title="Datablau"
          @click="datablau"
          :href="webUrl"
          target="_blank"
        >Datablau</a>
      </span>
    </div>
  </el-dialog>
</template>

<script>
import moment from 'moment'
export default {
  data () {
    return {
      visible: false,
      tableData: [],
      webUrl: '',
      appName: window.NODE_APP
    }
  },
  mounted () {
    this.$bus.$on('showVersionMessage', this.showDialog)
    this.webUrl = 'http://www.datablau.cn'
    if (this.$isEng) {
      this.webUrl = 'https://www.datablau.com'
    }
  },
  beforeDestroy () {
    this.$bus.$off('showVersionMessage')
  },
  methods: {
    showDialog () {
      this.getAbout()
    },
    getAbout () {
      if (this.appName.toUpperCase() === 'DDD'){
        this.$http.get(this.$dddUrl + '/service/version/about').then(res => {
          this.tableData = []
          this.prepareData(res.data)
          this.visible = true
        })
      } else {
        this.$http.get(this.$url + '/service/utils/about').then(res => {
          this.tableData = []
          this.prepareData(res.data)
          this.visible = true
        })
      }

    },
    prepareData (data) {
      if (this.appName.toUpperCase() === 'DDD'){
        this.tableData.push({
          label: 'DDD Server 版本',
          value: data,
          class: 'version'
        })
        this.tableData.push({
          label: 'DDD Web 版本',
          value: data,
          class: 'version'
        })
      } else {
        // let licExpireBool = data.web.licExpireTime && data.web.licExpireTime < new Date().getTime()
        //
        //   const buildExpireDate = (timestamp) => {
        //     let text = ''
        //     let styleStr = ''
        //     if (timestamp - new Date().getTime() > 1000 * 3600 * 24 * 365 * 20) {
        //       text = this.$v.about.workFor
        //     } else if (timestamp - new Date().getTime() < 0) {
        //       text = moment(timestamp).format('YYYY-MM-DD') + '(已过期)'
        //       styleStr = 'color: #d94e00;'
        //     } else {
        //       text = moment(timestamp).format('YYYY-MM-DD')
        //     }
        //     return `<span style="${styleStr}">${text}</span>`
        //   }
        this.tableData.push({
          label: 'DDM Server 版本',
          value: data.version,
          class: 'version'
        })
        this.tableData.push({
          label: 'DDM Web 版本',
          value: window.setting.version.ddm,
          class: 'version'
        })
        this.tableData.push({
          label: this.$v.about.buildNumber,
          value: data.buildNumber,
          class: 'build-number'
        })
        // this.tableData.push({
        //   label: this.$v.about.licUser,
        //   value: data.server.licUser,
        //   class: 'lic-user'
        // })
        // this.tableData.push({
        //   label: this.$v.about.licExpireTime,
        //   value: buildExpireDate(data.server.licExpireTime),
        //   class: 'lic-expire-time'
        // })
        // if (data.web.licExpireTime) {
        //   this.tableData.push({
        //     label: this.$v.about.webLicExpireTime,
        //     value: buildExpireDate(data.web.licExpireTime),
        //     class: 'lic-expire-time'
        //   })
        // }

        // this.tableData.push({
        //   label: this.$v.about.licModelNumber,
        //   value: data.web.licModelNumber,
        //   class: 'lic-model-number'
        // })
        // this.tableData.push({
        //   label: 'WEB授权用户',
        //   value: data.web.licUser
        // })
        // this.tableData.push({
        //   label: 'WEB授权到期日期',
        //   value: buildExpireDate(data.web.licExpireTime),
        //   class: 'lic-expire-time'
        // })
        // let right = `<i class="enable-icon el-icon-check enable-model"></i>`
        // let wrong = `<i class="enable-icon el-icon-close disable-model"></i>`
        // let modelArr = [
        //   {
        //     name: 'qualityReport',
        //     label: this.$v.about.qualityReport,
        //     class: 'quality-report',
        //     code: 256
        //   },
        //   // {
        //   //   name: 'domain',
        //   //   label: '数据标准',
        //   //   class: 'domain',
        //   //   code: 4096
        //   // },
        //   {
        //     name: 'editOnline',
        //     label: this.$v.about.editOnline,
        //     class: 'edit-online',
        //     code: 16
        //   },
        //   {
        //     name: 'archy',
        //     label: '企业架构',
        //     class: 'archy',
        //     code: 65536
        //   }
        // ]
        // let features = ''
        // modelArr.forEach(item => {
        //   let enableIcon = ''
        //   if ((data.web.parsedRv | item.code) === data.web.parsedRv && !licExpireBool) {
        //     enableIcon = right
        //   } else {
        //     enableIcon = wrong
        //   }
        //   features += `<span class="feature-label"><span class="${item.class}">${item.label}</span>${enableIcon}</span>`
        // })

        // this.tableData.push({
        //   label: this.$v.about.features,
        //   value: features,
        //   class: 'features'
        // })
      }

    },
    datablau () {
      // window.open('http://www.datablau.cn')
    }
  }
}
</script>

<style scoped lang="scss">

</style>
<style lang="scss">
  .version-info {
    .el-dialog {
      border-radius: 5px;
    }
    .el-dialog__header {
      border-bottom: 1px solid #DDDDDD;
      .el-dialog__title {
        font-weight: bold;
        font-size: 16px;
        color: #3A3E44;
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
          color: #2D3546;
        }
      }

      .features {
        .feature-label {
          display:inline-block;
          margin-right: 20px;
          width: 150px;
          height: 34px;
          border: 1px solid #E2E2E2;
          line-height: 32px;
          box-sizing: border-box;
          padding: 0 8px 0 14px;
          border-radius: 6px;
          margin-bottom: 12px;
          position: relative;
          .enable-icon {
            // float: right;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            color: #fff;
            text-align: center;
            line-height: 20px;
            font-size: 12px;
            // margin-top: 6px;
            position: absolute;
            top: 6px;
          }
          .enable-model {
            font-weight:bold;
            background-color: #6acf72;
            margin-left:.5em;
          }
          .disable-model {
            font-weight:bold;
            background-color: #d94e00;
            margin-left:.5em;
          }
        }
      }
    }
    .bottom-pwb {
      border-radius: 8px;
      background-color: #F5F9FF;
      text-align: center;
      margin-bottom: 10px;
      .text-inner {
        display: inline-block;
        width: 100%;
        height: 34px;
        font-size: 12px;
        line-height: 34px;
        // opacity:0.75;
        color: #878D9B;
        a {
          cursor: pointer;
          color: #4587F5;
        }
      }
    }
  }
</style>
