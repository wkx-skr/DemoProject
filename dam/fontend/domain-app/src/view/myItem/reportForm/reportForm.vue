<template>
  <div
    class="page-outer table-main-page"
    v-loading="pageLoading"
    :class="{ 'hide-breadcrumbs': !hideBreadcrumbs }"
  >
    <datablau-dialog
      :visible.sync="showImgPre"
      :fullscreen="false"
      :modal-append-to-body="true"
      :title="reportData.name"
      width="70%"
      class="img-pre-dialog"
    >
      <div class="img-pre-container">
        <img :src="preImgSrc" alt="" />
      </div>
    </datablau-dialog>
    <div class="page-container" v-show="show">
      <div class="content-nav" v-if="!hideBreadcrumbs">
        <datablau-breadcrumb
          :node-data="[
            searchKeyword
              ? searchKeyword +
                this.$t('meta.DS.tableDetail.report.searchResult')
              : this.$t('meta.DS.tableDetail.report.allResult'),
            reportData.name,
          ]"
          :couldClick="false"
          @back="handleClose"
        ></datablau-breadcrumb>
        <!-- <span
          @click="handleClose"
          class="ddc-icon-back"
          style="margin-left: 15px; margin-top: 5px"
        >
          返回
        </span> -->
        <!-- <span class="menu" @click="handleShowAllData">
          {{
            searchKeyword ? '"' + searchKeyword + '" 的搜索结果' : '全部结果'
          }}
        </span> -->
        <!-- 中间部分，暂不知道哪里使用 -->
        <!-- <span
          class="catalog-path-item"
          v-for="(item, index) in catalogPathArr"
          :key="index"
        >
          <i class="fa fa-chevron-right"></i>
          <span class="path-item-text" @click="handleSkip2catalog(item)">
            {{ item.name }}
          </span>
        </span>
        <i class="fa fa-chevron-right"></i>
        <span>{{ reportData.name }}</span> -->
      </div>
      <report-detail-scan
        v-if="reportUdpPro && reportData.id"
        :oldReportFormManage="reportData"
        :appTypes="appTypes"
        :indexTree="indexTree"
        :dimMap="dimMap"
        :indexMap="indexMap"
        :reportUdpPro="reportUdpPro"
        :typeMap="typeMap"
        :hideHeader="hideBreadcrumbs"
        :disabledEdit="true"
      ></report-detail-scan>
    </div>
  </div>
</template>

<script>
import reportDetailScan from '@/components/reportFormManage/reportDetailScan.vue'
import HTTP from '@/http/main'
export default {
  components: {
    reportDetailScan,
  },
  data() {
    const { grey, greyBorder } = this.$style
    return {
      getReport: null,
      reportData: {},
      imgArr: [],
      indexTree: [],
      // indexMap 编辑报表时需要, 如果不能编辑, 不需要调用api去获取
      indexMap: {},
      dimMap: {},
      typeMap: {
        Analysis: this.$t('meta.DS.tableDetail.report.multiAnalysis'),
        Report: this.$t('meta.DS.tableDetail.report.report'),
        List: this.$t('meta.DS.tableDetail.report.list'),
      },
      appTypes: [
        {
          label: this.$t('meta.DS.tableDetail.report.multiAnalysis'),
          text: this.$t('meta.DS.tableDetail.report.multiAnalysis'),
          value: 'Analysis',
        },
        {
          label: this.$t('meta.DS.tableDetail.report.report'),
          text: this.$t('meta.DS.tableDetail.report.report'),
          value: 'Report',
        },
        {
          label: this.$t('meta.DS.tableDetail.report.list'),
          text: this.$t('meta.DS.tableDetail.report.list'),
          value: 'List',
        },
      ],
      dataDemandMap: {},

      pageLoading: false,
      style: {
        preview: {
          // height:'180px',
          // borderBottom:greyBorder,
          padding: '10px 5px',
        },
      },
      dataType: '',
      sqlContent: '',
      reportRate: 0,
      hasCollected: false,
      queryData: {},
      catalogPathArr: [],
      activeName: 'reportItem',
      ps: null,
      show: true,

      searchKeyword: '',
      commentCnt: 0,
      canNotProfile: true,
      profilingRowCount: 0,
      favoPara: null,
      favId: null,

      udps: [],
      showImgPre: false,
      preImgSrc: '',
      reportUdpPro: null,
    }
  },
  props: {
    hideBreadcrumbs: {
      type: Boolean,
      default: false,
    },
  },
  beforeMount() {
    this.getDimensionMap()
    this.getDataReq()
    this.queryData = this.getQuery()
    this.dataType = this.queryData.type
    this.reportRate = this.queryData.vote || 0
    if (this.queryData.reportId) {
      this.getReportDetail(this.queryData.reportId)
    }
  },
  mounted() {
    if (this.queryData.catalogPath && this.queryData.catalogPath.length > 0) {
      if (!Array.isArray(this.queryData.catalogPath)) {
        this.queryData.catalogPath = [this.queryData.catalogPath]
      }
      const catalogMap = this.$globalData.catalogsMap
      const arr = []
      this.queryData.catalogPath.forEach(item => {
        item = item - 0
        if (item && catalogMap.has(item)) {
          const cur = catalogMap.get(item)
          arr.push(cur)
        }
      })
      console.log(arr)
      this.catalogPathArr = arr
    } else {
      this.searchKeyword = this.queryData.keyword
    }
    // setTimeout(() => {
    //   const listContainer = $(this.$el).find('.ps-container')[0]
    //   this.ps = new NewPs(listContainer)
    // })
    $(window).on('resize', this.handleResize)
    this.refreshGetUdp()
    this.dataInit()
  },
  beforeDestroy() {
    if (this.ps) {
      this.ps.destroy()
    }
    $(window).off('resize', this.handleResize)
  },
  methods: {
    refreshGetUdp() {
      this.reportUdpPro = HTTP.getUdpByType({ typeId: 82800002 })
    },
    getReportDetail(reportId) {
      this.getReport = this.$http.get(
        `${this.$url}/service/dataReport/${reportId}`
      )
      return this.getReport
    },
    dataInit() {
      const reportId = this.queryData.reportId
      this.getReport
        .then(res => {
          const data = res.data
          this.reportData = data
          this.favoPara = {
            typeId: this.$commentPreCode.Report,
            objId: this.reportData.id,
            objectName: this.reportData.name,
          }
          let imgArr = []
          const imgIds = data.thumbnailFileIds || ''
          imgArr = imgIds.split(',').filter(item => {
            return !!item
          })
          this.imgArr = imgArr

          this.checkIfCollected()
        })
        .catch(e => {
          this.$showFailure(e)
        })
      this.getreportRate()
    },
    getImgSrt(id) {
      const url = `${this.$url}/service/files/${id}/download`
      return url
    },
    skip2Url(url) {
      const index = url.indexOf('http://')
      if (index === -1) {
        url = 'http://' + url
      }
      window.open(url)
    },
    getItemData() {
      return new Promise((resolve, reject) => {
        this.getReport
          .then(res => {
            resolve(res.data)
          })
          .catch(e => {
            reject(e)
          })
      })
    },
    // 获取 维度信息
    getDimensionMap() {
      this.$http
        .get(this.$url + '/service/me/dims/catalogs')
        .then(res => {
          const map = {}
          if (res.data && Array.isArray(res.data)) {
            const arr = res.data
            arr.forEach((item, index) => {
              map[item.catalogId] = item
            })
          }
          this.dimMap = map
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    /* 获取 数据需求 信息 */
    getDataReq() {
      this.$http
        .get(this.$url + '/service/dataRequirement/')
        .then(res => {
          const data = res.data
          const map = {}
          if (data && Array.isArray(data)) {
            data.forEach(item => {
              map[item.id] = item
            })
          }
          this.dataDemandMap = map
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    toggleCollecStatus() {
      this.hasCollected = !this.hasCollected
      const obj = this.favoPara
      const succesedCallback = res => {
        const msg = this.hasCollected
          ? this.$t('meta.DS.message.collectSuccess')
          : this.$t('meta.DS.message.unCollectSuccess')
        this.$message.success(msg)
        this.refreshFavStatus()
        this.checkIfCollected()
      }
      const failureCallback = e => {
        this.$showFailure(e)
        this.refreshFavStatus()
        this.checkIfCollected()
      }
      if (this.hasCollected) {
        HTTP.addFavorite({
          succesedCallback: succesedCallback,
          failureCallback: failureCallback,
          para: obj,
        })
      } else {
        this.favId &&
          HTTP.removeCollection({
            succesedCallback: succesedCallback,
            failureCallback: failureCallback,
            para: {
              favId: this.favId,
            },
          })
      }
    },
    checkIfCollected() {
      const para = this.favoPara
      HTTP.getIfCollected({
        succesedCallback: data => {
          this.hasCollected = !!data
          if (data) {
            this.favId = data.id
          }
        },
        failureCallback: e => {
          this.$showFailure(e)
          this.hasCollected = false
        },
        para: para,
      })
    },
    refreshFavStatus() {
      HTTP.refreshCollectionList({
        succesedCallback: data => {},
        failureCallback: e => {
          this.$showFailure(e)
        },
        para: {},
      })
    },
    getreportRate() {
      const para = {
        objId: this.queryData.reportId,
        typeId: this.$commentPreCode.Report,
      }
      HTTP.getAverageRate({
        succesedCallback: res => {
          this.reportRate = parseFloat(res)
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
        para: para,
      })
    },
    handleRateSubmit() {
      this.getreportRate()
    },
    getCommentCnt() {
      this.$http
        .get(
          `${this.$url}/service/thread/types/${this.$commentPreCode.Report}/objects/${this.queryData.reportId}?size=1`
        )
        .then(res => {
          this.commentCnt = res.data.thread.msgCount - 1
        })
        .catch(e => {
          this.commentCnt = 0
        })
    },
    handleResize() {
      if (this.ps) {
        this.$nextTick(() => {
          this.ps.update()
        })
      }
    },
    handleTabClick() {
      this.handleResize()
      switch (this.activeName) {
        case 'reportItem':
          // if (!this.columnsLoaded) {
          //   this.getColumns();
          // }
          break
        case 'data':
          if (!this.previewLoaded) {
            this.getPreview()
          }
          break
        case 'dataViste':
          this.$refs.dataViste && this.$refs.dataViste.dataInit()
          break
        default:
          break
      }
    },
    handleShowAllData() {
      if (this.searchKeyword) {
        this.$router.push({
          name: 'search',
          query: { keyword: this.searchKeyword },
        })
      } else {
        this.back2Index()
      }
    },
    handleSkip2catalog(data) {
      this.$router.push({
        name: 'search',
        query: { catalogId: data.id },
      })
    },
    handleClose() {
      this.$emit('close')
      // window.history.back();
      window.close()
      location.hash = ''
    },
    getQuery() {
      const obj = this.$route.query || {}
      // if (this.data) {
      //   for(let key in this.data) {
      //     obj[key] = this.data[key];
      //   }
      // }
      return obj
    },
    back2Index() {
      this.$router.push({
        name: 'home',
      })
    },
    handleShowImgPre(item) {
      this.showImgPre = true
      const imgSrc = this.getImgSrt(item)
      this.preImgSrc = imgSrc
    },
  },
  computed: {},
}
</script>

<style lang="scss" scoped>
@import '~@/assets/styles/_constForDDC.sass';
$blue: #4278c9;
$greyText: #898989;
$grey-border: 1px solid #e4e4e4;
/deep/ .el-tabs__content {
  position: absolute;
  top: 31px;
  bottom: 0;
  left: 0;
  right: 0;
}
.content-nav {
  position: absolute;
  top: 0;
  left: 20px;
  right: 20px;
  z-index: 2;
  height: 40px;
  padding: 8px 0px 0;
  border-bottom: 1px solid var(--border-color-lighter);
  .menu {
    color: #9f9f9e;
  }
  .fa-chevron-right {
    color: #999998;
    margin: 0 0.3em;
  }
}
.content-preview {
  //min-height:150px;
  .title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 0.6em;
  }
  .type-icon {
    width: 20px;
    position: relative;
    top: 3px;
  }
  .description-line {
    font-size: 14px;
    max-width: 85%;
    margin-bottom: 1em;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    .el-button {
      color: $blue;
      vertical-align: middle;
    }
  }
  .description {
    //display:inline-block;
    line-height: 2em;
    max-width: 56em;
    vertical-align: middle;
  }
  .properties {
    margin-bottom: 1em;
  }
}
.page-container {
  /deep/ .report-detail-scan {
    .tab-top-line {
      .search-input {
        margin-left: 0;
      }
    }
  }
  .content-nav {
    .menu {
      cursor: pointer;
    }
    .path-item-text {
      cursor: pointer;
    }
  }
}
.column-btn {
  width: 100px;
  height: 30px;
  padding: 0;
  margin: 0;
  margin-top: 8px;
  border-radius: 2px;
  font-size: 12px;
  background-color: #ebf1fa;
  color: $deepBlueForBtn;
  border: 1px solid $deepBlueForBtn;
  .view-btn {
    display: inline-block;
  }
  & {
    color: #fff;
    background: $deepBlueForBtn;
  }
  &.is-disabled,
  &.disable-btn {
    color: #a8a8a8;
    background: #f7f7f7;
    border-color: #dddddd;
  }
}
.content-preview {
  position: relative;
  .btn-con {
    position: absolute;
    top: 0px;
    right: 20px;
    width: 120px;
    .btn-item {
      float: right;
      width: 120px;
      height: 36px;
      padding: 0;
      margin: 0;
      margin-top: 8px;
      border-radius: 4px;
      background-color: #ebf1fa;
      color: $deepBlueForBtn;
      border: 1px solid $deepBlueForBtn;
      .view-btn {
        display: inline-block;
      }
      &:hover {
        color: #fff;
        background: $deepBlueForBtn;
      }
      &.is-disabled,
      &.disable-btn {
        color: #a8a8a8;
        background: #f7f7f7;
        border-color: #dddddd;
      }
    }
  }
}
.table-main-page {
  .page-container {
    .ps-container {
      .properties {
        .star {
          .table-rate {
            display: inline-block;
          }
        }
        .collection {
          // border: 1px solid #898989;
          border-radius: 3px;
          padding: 0 10px;
          text-align: center;
          display: inline-block;
          cursor: pointer;
          box-sizing: border-box;
          user-select: none;
          & > i,
          & > span {
            line-height: 20px;
            vertical-align: top;
          }
          i {
            color: #ff9933;
          }
          &:hover {
            background-color: #e9e9e9;
          }
        }
      }
      .detail-line {
        /*border: 1px solid red;*/
        /*min-height: 240px;*/
        /*max-height: 300px;*/
        // height: 200px;
        .carousel-container {
          display: inline-block;
          width: 30%;
          height: 202px;
          vertical-align: top;
          border: 1px solid #eee;
          .img-container {
            position: relative;
            .controler-container {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              top: 0;
              /*height: 50px;*/
              display: none;
              /*background-color: rgba(0,0,0,.3);*/
              cursor: pointer;
              .icon-con {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                left: 0;
                right: 0;
                text-align: center;
                .preview-img,
                .item-download {
                  display: inline-block;
                  width: 30px;
                  height: 30px;
                  i {
                    font-size: 20px;
                    line-height: 30px;
                    color: #fff;
                    vertical-align: top;
                    cursor: pointer;
                  }
                }
              }
            }
            &:hover {
              .controler-container {
                display: block;
              }
            }
          }
          .img-stations {
            width: 100%;
            height: 100%;
            text-align: center;
            padding-top: 100px;
            box-sizing: border-box;
          }
        }
        .report-detail {
          display: inline-block;
          width: 69%;
          // height: 100%;
          /*border: 1px solid green;*/
          vertical-align: top;
          padding-left: 30px;
          box-sizing: border-box;
          .el-form-item {
            width: 47%;
            &.url-link {
              width: 90%;
              .el-form-item__content {
                width: 80%;
              }
            }
            .report-link {
              display: inline-block;
              width: 100%;
              word-wrap: break-word;
              word-break: break-all;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 1;
              overflow: hidden;
            }
            .report-link {
              color: #409eff;
              cursor: pointer;
            }
          }
        }
      }
    }
  }
}
</style>

<style lang="scss">
.img-pre-dialog {
  .img-pre-container {
    overflow: auto;
  }
}
.el-tooltip__popper.report-url-tooltip {
  word-break: break-all;
  max-width: 80%;
}
.el-tooltip__popper.report-description-tooltip {
  max-width: 80%;
}
</style>
