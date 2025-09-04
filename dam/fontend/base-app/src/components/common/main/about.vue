<template>
  <el-dialog
    :visible.sync="visible"
    append-to-body
    close-on-click-modal
    width="450px"
    :title="$t('common.version.title')"
    class="version-info"
  >
    <el-form label-width="150px" label-position="left" class="info-container">
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
    <div class="bottom-pwb" v-if="$showLogoInAbout">
      <span class="text-inner">
        Powered by
        <a
          :title="$t('common.version.company')"
          @click="datablau"
          href="http://www.datablau.cn"
          target="_blank"
        >
          {{ $t('common.version.company') }}
        </a>
      </span>
    </div>
  </el-dialog>
</template>

<script>
import moment from 'moment'
export default {
  data() {
    return {
      visible: false,
      tableData: [],
    }
  },
  mounted() {
    this.$bus.$on('showVersionMessage', this.showDialog)
  },
  beforeDestroy() {
    this.$bus.$off('showVersionMessage')
  },
  methods: {
    showDialog() {
      this.getAbout()
    },
    getAbout() {
      this.$http.post('/gateway/main/about').then(res => {
        this.tableData = []
        this.prepareData(res.data)
        this.visible = true
      })
    },
    prepareData(data) {
      const buildExpireDate = timestamp => {
        if (timestamp - new Date().getTime() > 1000 * 3600 * 24 * 365 * 20) {
          return this.$t('common.version.permanent')
        } else {
          return moment(timestamp).format('YYYY-MM-DD')
        }
      }
      this.tableData.push({
        label: 'DAM Server ' + this.$t('common.version.version'),
        value: data.version,
        class: 'version',
      })
      this.tableData.push({
        label: 'DAM Web ' + this.$t('common.version.version'),
        value: window.setting.version.dam,
        class: 'version',
      })
      // const buildTimestamp = data.buildTimestamp
      // this.tableData.push({
      //   label: this.$t('common.version.date'),
      //   value: buildTimestamp
      //     ? '20' +
      //       buildTimestamp.slice(0, 2) +
      //       '-' +
      //       buildTimestamp.slice(2, 4) +
      //       '-' +
      //       buildTimestamp.slice(4, 6) +
      //       ' ' +
      //       buildTimestamp.slice(6, 8) +
      //       ':' +
      //       buildTimestamp.slice(8, 10) +
      //       ':' +
      //       buildTimestamp.slice(10, 12)
      //     : 'N/A',
      // })
      // if (this.$overflowModel) {
      //   this.tableData.push({
      //     label: this.$t('common.version.licModelNumber'),
      //     value: data.licModelNumber,
      //     class: 'data-source-count',
      //   })
      // }
      // this.tableData.push({
      //   label: this.$t('common.version.licCompany'),
      //   value: data.licCompany ? data.licCompany : data.licUser,
      //   class: 'lic-user',
      // })
      // this.tableData.push({
      //   label: this.$t('common.version.licExpireTime'),
      //   value: buildExpireDate(data.licExpireTime),
      //   class: 'lic-expire-time',
      // })
      // const right = '<i class="enable-icon el-icon-check enable-model"></i>'
      // const wrong = '<i class="enable-icon el-icon-close disable-model"></i>'
      // const modelArr = [
      //   {
      //     label: this.$t('common.version.meta'),
      //     class: 'data-quality',
      //     code: 1,
      //   },
      //   {
      //     label: this.$t('common.version.quality'),
      //     class: 'data-quality',
      //     code: 16,
      //   },
      //   {
      //     label: this.$t('common.version.standard'),
      //     class: 'data-standard',
      //     code: 256,
      //   },
      //   {
      //     label: this.$t('common.version.indexManagement'),
      //     class: 'data-index',
      //     code: 4096,
      //   },
      //   {
      //     label: this.$t('common.version.lineage'),
      //     class: 'lineage',
      //     code: 65536,
      //   },
      //   {
      //     label: this.$t('common.version.basicServices'),
      //     class: 'assets-map',
      //     code: 1048576,
      //   },
      //   {
      //     label: this.$t('common.version.security'),
      //     class: 'data-security',
      //     code: 2,
      //   },
      //   {
      //     label: this.$t('common.version.asset'),
      //     class: 'data-asset',
      //     code: 4,
      //   },
      //   {
      //     label: this.$t('common.version.service'),
      //     class: 'data-service',
      //     code: 8,
      //   },
      // ]
      // let features = ''
      // modelArr.forEach(item => {
      //   let enableIcon = ''
      //   if ((data.features | item.code) === data.features) {
      //     enableIcon = right
      //   } else {
      //     enableIcon = wrong
      //   }
      //   let classNames = 'feature-label'
      //   if (this.$i18n.locale === 'en') {
      //     classNames += ' en'
      //   }
      //   features += `<span class="${classNames}"><span class="${item.class}">${item.label}</span>${enableIcon}</span>`
      // })
      // this.tableData.push({
      //   label: this.$t('common.version.features'),
      //   value: features,
      //   class: 'features',
      // })
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
      color: var(--table-head-bgc);
    }
    .el-dialog__headerbtn .el-icon-close {
      color: #696969;
      font-size: 16px;
    }
  }
  .info-container {
    padding-left: 50px;
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
        color: var(--about-dialog-color);
      }
    }

    .features {
      .feature-label {
        display: inline-block;
        margin-right: 20px;
        width: 140px;
        &.en {
          width: 160px;
        }
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
