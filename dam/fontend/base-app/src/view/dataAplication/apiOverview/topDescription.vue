<template>
  <div>
    <div class="row-main" v-if="showDefault">
      <div class="first-part">
        <div class="first-partLeft">
          <datablau-icon
            class="iconBox"
            v-if="dataLoaded"
            :data-type="objectType"
            :size="48"
          ></datablau-icon>
          <div class="logicalNameBox">
            <p class="physicalName">{{ apiData.name || '新建API' }}</p>
            <div class="active-icon-line">
              <div
                class="active-status-btn"
                :class="{ 'active-status': propArr.testedSuccessed }"
              >
                <span v-if="!propArr.testedSuccessed">
                  <!-- <i class="fa fa-info-circle"></i> -->
                  未测试成功
                </span>
                <span v-if="propArr.testedSuccessed">
                  <!-- <i class="fa fa-check-circle"></i> -->
                  测试成功
                </span>
              </div>
              <div
                class="active-status-btn"
                :class="{ 'active-status': propArr.publish }"
              >
                <span v-if="!propArr.publish">
                  <!-- <i class="fa fa-info-circle"></i> -->
                  未发布
                </span>
                <span v-if="propArr.publish">
                  <!-- <i class="fa fa-check-circle"></i> -->
                  已发布
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="first-partRight">
          <div class="partRight-button">
            <!--<div class="collectionButton" @click="toggleCollecStatus" :class="{'collectionButton2':hasCollected}"-->
            <!--     v-if="false">-->
            <!--  <span v-if="hasCollected">已收藏</span>-->
            <!--  <span v-if="!hasCollected">未收藏</span>-->
            <!--</div>-->
            <div class="control-btn-line">
              <datablau-button
                type="normal"
                @click="editApi"
                class=""
                :disabled="false"
                v-if="
                  apiData.id &&
                  !propArr.publish &&
                  couldEdit &&
                  !this.$auth.API_DEVELOP_ALL
                "
              >
                编辑
              </datablau-button>
              <datablau-button
                type="normal"
                @click="testApi"
                class=""
                v-if="apiData.id && couldEdit"
              >
                测试
              </datablau-button>
              <datablau-button
                type="primary"
                @click="publishApi"
                class=""
                :disabled="false"
                v-if="apiData.id && !propArr.publish && couldEdit"
              >
                发布
              </datablau-button>
              <datablau-button
                type="normal"
                @click="authorizeApi"
                class=""
                :disabled="!propArr.publish"
                v-if="propArr.publish && false"
              >
                授权
              </datablau-button>
              <datablau-button
                type="normal"
                @click="offlineApi"
                class=""
                :disabled="!propArr.publish"
                v-if="propArr.publish && couldEdit"
              >
                下线
              </datablau-button>
            </div>

            <el-popover
              v-if="false"
              placement="bottom"
              width="150"
              trigger="click"
            >
              <datablau-button
                @click="downloadApi"
                style="width: 140px; border: none"
                plain
                size="small"
              >
                导出此表
              </datablau-button>
              <datablau-button
                slot="reference"
                class="moreButton"
                style="padding-left: 10px; padding-right: 10px"
                type="primary"
                size="small"
              >
                更多操作
                <i style="margin-left: 5px" class="el-icon-more"></i>
              </datablau-button>
            </el-popover>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HTTP from '@/http/main'

export default {
  data() {
    return {
      showDefault: true,
      dataLoaded: false,
      // objectType: 'report',
      contentWritable: false,
      // propArr: [],
      scoreColors: ['#99A9BF', '#F7BA2A', '#FF9900'],
      hasCollected: false,
      favId: '',
    }
  },
  components: {},
  props: {
    apiData: {
      required: true,
    },
    objectType: {
      type: String,
      default: 'API',
    },
    couldEdit: {
      type: Boolean,
      default: false,
    },
    propArr: {
      default() {
        return {}
      },
    },
    favoritesPara: {
      required: true,
    },
  },
  computed: {},
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      this.dataLoaded = true
      // this.checkIfCollected()
    },
    handleReportEdit() {
      this.$emit('handleReportEdit')
    },

    // 收藏
    toggleCollecStatus() {
      this.hasCollected = !this.hasCollected
      const obj = this.favoritesPara
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
      const para = this.favoritesPara
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
      })
    },
    downloadApi() {},
    statusChange(status) {
      this.$emit('statusChange', status)
    },
    editApi() {
      this.$emit('editApi')
    },
    testApi() {
      this.statusChange('testApi')
    },
    publishApi() {
      this.statusChange('publishApi')
    },
    authorizeApi() {
      this.statusChange('authorizeApi')
    },
    offlineApi() {
      this.statusChange('offlineApi')
    },
  },
  watch: {},
}
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
$bac-grey: transparentize(#555555, 0.9);
.row-main {
  padding: 16px 20px 20px 20px;
  //padding: 20px;
  //overflow: auto;
  position: absolute;
  top: 0px;
  left: 0;
  right: 0;
  bottom: 0;

  .owner {
    &.writable {
      color: #40a4ff;
      cursor: pointer;
    }

    .icon {
      $size: 20px;
      text-align: center;
      line-height: 20px;
      color: #898989;
      display: inline-block;
      background: #ebebeb;
      width: $size;
      height: $size;
      border-radius: $size/2;
    }

    .label {
      vertical-align: top;
      margin-top: 2px;
      display: inline-block;
    }

    //position:absolute;
    //right:20px;
    //top:20px;
    float: right;
  }

  .physical-name {
    font-size: 18px;
    font-weight: bold;
    max-width: 70%;
    color: var(--base-font-color);
  }

  .logical-name {
    display: inline-block;
    font-size: 14px;
    color: var(--base-font-color);
    min-height: 19px;
    margin-top: 0.6em;
    //margin-bottom:1em;
    &:hover {
      i {
        display: inline-block;
      }
    }

    & > i {
      cursor: pointer;
      margin-left: 0.5em;
      color: #409eff;
    }
  }

  .description {
    display: inline-block;
    margin-top: 1em;
    font-size: 12px;
    color: #686868;
    line-height: 1.6em;
    margin-left: 10px;

    & > i {
      cursor: pointer;
      margin-left: 0.5em;
      color: #409eff;
    }
  }

  .definition-edit {
    margin-top: 1em;
  }

  .tags {
    margin-top: 1em;

    & > {
      margin-right: 1em;
    }
  }

  .model-name {
    display: inline;
    margin-right: 2em;
  }
}

.first-part {
  position: relative;
  // padding-right: 20px;
  .first-partLeft {
    width: 50%;
    position: absolute;
    top: 0;
    bottom: 0;
    margin-bottom: 16px;

    .iconBox {
      // float: left;
    }

    .logicalNameBox {
      display: inline-block;
      margin-left: 10px;
      position: absolute;
      .active-icon-line {
        margin-top: 5px;
        .active-status-btn {
          display: inline-block;
          //float: left;
          text-align: center;
          padding-left: 10px;
          padding-right: 10px;
          border-radius: 11px;
          background: $bac-grey;
          color: $text-default;
          cursor: default;
          // border: 1px solid #999;
          //display: flex;
          //align-items: center;
          //justify-content: center;
          height: 22px;
          line-height: 22px;
          margin-right: 10px;
          //cursor: pointer;
          transition: background-color 0.5s, color 0.5s;
          vertical-align: middle;

          // &:hover {
          //   color: #777;
          //   background: #eee;
          //   border-color: #777;
          // }

          &.active-status {
            color: $primary-color;
            background: $table-hover-color;
            // border-color: $table-hover-color;
          }

          //span {
          //  display: flex;
          //  align-items: center;
          //}
        }
      }

      .physicalName {
        font-size: 20px;
        font-weight: 500;
        line-height: 20px;
        padding-bottom: 5px;
      }

      .logical-name {
        margin-top: 0;
        position: relative;

        i {
          position: absolute;
          top: 4px;
        }

        .el-button {
          padding: 0;
        }
      }
    }
  }

  .first-partRight {
    width: 50%;
    width: 600px;
    float: right;
    //border: 1px solid red;
    // border-left: 2px solid #efefef;
    padding-left: 20px;

    .partRight-button {
      line-height: 40px;
      position: relative;
      display: inline-block;
      width: 500px;
      float: right;
      //border: 1px solid red;
      margin-top: 5px;

      .collectionButton {
        float: left;
        padding-left: 10px;
        padding-right: 10px;
        background: #fff;
        border-color: #409eff;
        color: #409eff;
        border: 1px solid #4386f5;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 30px;
        line-height: 30px;
        margin-right: 10px;
        cursor: pointer;
        transition: background-color 0.5s, color 0.5s;

        &.collectionButton2 {
          color: #409eff;
          background: #ecf5ff;
          border-color: #4386f5;
        }

        &:hover {
          color: #409eff;
          background: #ecf5ff;
          border-color: #4386f5;
        }

        span {
          display: flex;
          align-items: center;
        }

        img {
          width: 16px;
          height: auto;
          margin-right: 6px;
        }
      }

      .moreButton {
        float: right;
      }
    }

    .control-btn-line {
      //position: absolute;
      //left: 0;
      //top: 40px;
      float: right;
      padding-top: 10px;
      padding-bottom: 10px;
    }
  }
}
</style>

<style lang="scss">
.rate-starts {
  .el-rate__icon {
    font-size: 14px;
    margin-right: 0px;
  }
}
</style>
