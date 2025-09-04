<template>
  <div
    class="page-outer table-main-page ddc-file-detail"
    v-loading="pageLoading"
  >
    <div class="page-container" v-show="show" v-if="!pageLoading">
      <div class="content-nav">
        <span
          @click="handleClose"
          class="ddc-icon-back"
          style="margin-left: 15px; margin-top: 5px; cursor: pointer"
        >
          返回
        </span>
        <span class="menu" @click="handleShowAllData">
          {{
            searchKeyword ? '"' + searchKeyword + '" 的搜索结果' : '全部结果'
          }}
        </span>
        <span
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
        <span>{{ fileData.name }}</span>
      </div>
      <table-details
        v-if="fileId && loadedTags && fileData.id"
        :objectId="parseInt(fileId)"
        objectTypeMaybe="FILE"
        :object="fileData"
        :expand="true"
        :loadedTagsBefore="loadedTags"
        :hideHeader="true"
        class="details"
      ></table-details>
      <!--<div class="ps-container top-40">
        <div :style="style.preview" class="content-preview">
          <div class="title">
            <div class="icon-outer">
              <datablau-icon :data-type="$fileTypeFormatter(fileData.type)" size="22"></datablau-icon>
            </div>
            <span class="file-name">
              {{fileData.name}}
            </span>
          </div>
          <div class="description-line">
            <el-tooltip
              effect="light"
              :content="fileData.description"
              placement="top"
              popper-class="report-description-tooltip"
            >
              <span class="report-description">{{fileData.description}}</span>
            </el-tooltip>
          </div>
          <div class="properties">
            <span class="property">
              <i class="fa fa-user-o"></i>{{fileData.shareUser}}
            </span>
            <span class="property star" v-if="false">
              <i class="fa fa-star-o"></i>
              <i class="fa fa-star-o"></i>
              <i class="fa fa-star-o"></i>
              <i class="fa fa-star-o"></i>
              <i class="fa fa-star-o"></i>
            </span>
            <span class="property star" v-else-if="true">
              <span>评分：</span>
              <el-rate
                class="table-rate"
                v-model="fileRate"
                disabled
                :show-score="fileRate !== 0"
                text-color="#898989"
                score-template="{value}"
              >
              </el-rate>
            </span>
            <span class="property collection" @click="toggleCollecStatus">
              <i class="el-icon-star-on" v-if="hasCollected"></i>
              <i class="el-icon-star-off" v-else></i>
              <span>收藏</span>
            </span>
            <span class="property file-path">
              <i class="el-icon-document"></i>{{$getFileFullPath(fileData)}}
            </span>
          </div>
          <div class="tag-box blue">
            <el-tooltip
              v-for="t in fileData.tags"
              :key="t.tagId"
              :disabled="!$globalData.tagDescriptionMap.get(t.tagId)"
              :content="$globalData.tagDescriptionMap.get(t.tagId)"
              effect="light"
              placement="top"
            >
              <span
                class="tag">{{t.name}}</span>
            </el-tooltip>
          </div>
        </div>
        <div>
          <el-tabs
            v-model="activeName"
            class="blue-tabs"
            @tab-click="handleTabClick"
          >
            <el-tab-pane
              label="扩展属性"
              name="udpData"
            ></el-tab-pane>
            <el-tab-pane name="comment">
              <span slot="label">评论</span>
            </el-tab-pane>
          </el-tabs>
          <comment
            v-if="activeName==='comment'"
            :objectId="fileData.id"
            :showRate="true"
            @rateSubmitSuccess="handleRateSubmit"
            :typeId="$commentPreCode.ShareFile"
          ></comment>
          <share-file-udp-edit
            v-if="activeName==='udpData'"
            :summary="fileData"
            :couldEdit="false"
          ></share-file-udp-edit>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script>
import comment from '@/view/myItem/commentComponents/comment.vue'
import HTTP from '@/http/main'
import fieldTitle from '@/view/dataProperty/meta/fieldTitle.vue'
import shareFileUdpEdit from '@/view/dataProperty/meta/shareFileUdpEdit.vue'
import tableDetails from '@/view/dataProperty/meta/tableDetails.vue'
export default {
  components: {
    // comment,
    // fieldTitle,
    // shareFileUdpEdit,
    tableDetails,
  },
  data() {
    const { grey, greyBorder } = this.$style
    return {
      fileData: {},

      pageLoading: false,
      style: {
        preview: {
          // height:'180px',
          // borderBottom:greyBorder,
          padding: '10px 5px',
        },
      },
      // dataType:'',
      sqlContent: '',
      fileRate: 0,
      hasCollected: false,
      queryData: {},
      catalogPathArr: [],
      activeName: '',
      ps: null,
      show: true,
      searchKeyword: '',
      commentCnt: 0,
      // canNotProfile:true,
      // profilingRowCount:0,
      favoPara: null,
      favId: null,
      loadedTags: [],
    }
  },
  props: {
    fileId: {
      type: [String, Number],
      required: true,
    },
  },
  beforeMount() {
    const query = this.$route.query || {}
    if (query.keyword) {
      this.searchKeyword = query.keyword
    } else {
      this.catalogPathArr = query.catalogPath || []
    }
    this.queryData = query
    // this.dataType = this.queryData.type;
    this.fileRate = this.queryData.vote || 0
  },
  mounted() {
    if (!Array.isArray(this.queryData.catalogPath)) {
      this.queryData.catalogPath = this.queryData.catalogPath || ''
      this.queryData.catalogPath = this.queryData.catalogPath.split(',')
    }
    if (this.queryData.catalogPath && this.queryData.catalogPath.length > 0) {
      const catalogMap = this.$globalData.catalogsMap
      const arr = []
      this.queryData.catalogPath.forEach(item => {
        item = item - 0
        if (item && catalogMap.has(item)) {
          const cur = catalogMap.get(item)
          arr.push(cur)
        }
      })
      this.catalogPathArr = arr
    } else {
      this.searchKeyword = this.queryData.keyword
    }
    // setTimeout(() => {
    //   const listContainer = $(this.$el).find('.ps-container')[0]
    //   this.ps = new NewPs(listContainer)
    // })
    $(window).on('resize', this.handleResize)
    this.dataInit()
    this.loadTags()
  },
  beforeDestroy() {
    if (this.ps) {
      this.ps.destroy()
    }
    $(window).off('resize', this.handleResize)
  },
  methods: {
    loadTags() {
      var self = this
      self.$http
        .get(self.$url + '/service/tags/')
        .then(res => {
          if (res.data && res.data.length) {
            var map = {}
            res.data.forEach(item => {
              map[item.tagId] = item
            })
            var treeData = []
            res.data.forEach(item => {
              if (item.parentId) {
                var parent = map[item.parentId]
                if (!parent.children) {
                  parent.children = []
                }
                parent.children.push(item)
              } else {
                treeData.push(item)
              }
            })
            self.loadedTags = treeData
            // self.tagMap = map;
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {})
    },
    dataInit() {
      this.pageLoading = true
      // console.log(this.fileId, 'this.fileId')
      const id = this.fileId
      if (id) {
        const url = `${this.$url}/service/shareFile/folder/${id}`
        this.$http
          .get(url)
          .then(res => {
            const data = res.data
            this.fileData = data
            this.fileData.type = 'FILE'
            this.favoPara = {
              typeId: this.$commentPreCode.ShareFile,
              objId: this.fileData.id,
              objectName: this.fileData.name,
            }
            // this.checkIfCollected();
            // this.getObjRate();
            this.activeName = 'udpData'
            // this.getObjectBindTags();
            this.pageLoading = false
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
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
    toggleCollecStatus() {
      this.hasCollected = !this.hasCollected
      const obj = this.favoPara
      const succesedCallback = res => {
        const msg = this.hasCollected ? '收藏成功' : '取消收藏成功'
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
    handleRateSubmit() {
      this.getObjRate()
    },
    getCommentCnt() {
      this.$http
        .get(
          `${this.$url}/service/thread/types/${this.$commentPreCode.ShareFile}/objects/${this.fileId}?size=1`
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
      if (this.$route.query.isAssets) {
        this.handleClose()
        return
      }
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
    getObjectBindTags() {
      const id = this.fileId
      const url = `${this.$url}/service/tags/getTagsOfItem?itemId=${id}&withoutCategory=true&type=82800008`
      this.$http
        .get(url)
        .then(res => {
          this.$set(this.fileData, 'tags', res.data)
          // this.fileData.tags = res.data;
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getObjRate() {
      const para = {
        objId: this.fileId,
        typeId: this.$commentPreCode.ShareFile,
      }
      HTTP.getAverageRate({
        succesedCallback: res => {
          this.fileRate = parseFloat(res)
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
        para: para,
      })
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
.details {
  position: static !important;
}
.content-nav {
  height: 40px;
  line-height: 40px;
  //border-bottom:$grey-border;
  //padding-left:-10px;
  margin-left: -10px;
  color: #606060;
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
    .icon-outer {
      display: inline-block;
      vertical-align: middle;
      margin-top: 2px;
    }
    .file-name {
      vertical-align: middle;
    }
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
