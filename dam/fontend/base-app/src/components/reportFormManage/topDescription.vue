<template>
  <div>
    <div class="row-main" v-if="showDefault">
      <div class="first-part">
        <div class="first-partLeft">
          <datablau-icon
            class="iconBox"
            v-if="summaryLoaded"
            :data-type="objectType"
            :size="48"
          ></datablau-icon>
          <div class="logicalNameBox">
            <datablau-tooltip
              style="display: block"
              effect="dark"
              :content="summary.name"
              placement="bottom"
            >
              <p class="physicalName">{{ summary.name }}</p>
            </datablau-tooltip>

            <div class="logical-name">
              {{ summary.code }}
              <span
                v-if="!summary.code"
                style="color: #909399; font-size: 12px"
              >
                {{ $t('meta.DS.tableDetail.noAlias') }}
              </span>
              <!--              <i
                v-if="
                  (this.$isAdmin || $auth['METADATA_REPORT_MODIFY']) &&
                  !disabledEdit
                "
                :title="$t('meta.report.editReport')"
                class="icon-edit"
                :class="{ iconedit2: false }"
                @click="handleReportEdit"
              ></i>-->
            </div>
          </div>
        </div>
        <div class="first-partRight">
          <ul>
            <!--            <li class="li-authentication" v-if="propArr.auth !== null">
              <p>{{ $t('meta.DS.tableDetail.authState') }}</p>
              <div class="partRight-box">
                <img
                  style="width: 58px"
                  v-if="propArr.auth === true"
                  src="/static/images/meta/authtrue.svg"
                  alt=""
                />
                <img
                  style="width: 58px"
                  v-else
                  src="/static/images/meta/authnull.svg"
                  alt=""
                />
              </div>
            </li>-->
            <li class="li-complete" v-if="false">
              <p>{{ $t('meta.DS.tableDetail.completeDegree') }}</p>
              <div class="partRight-box">
                <el-progress
                  style="width: 140px"
                  :percentage="
                    propArr.completion ? propArr.completion * 100 : 0
                  "
                ></el-progress>
              </div>
            </li>
            <li class="li-score">
              <p>{{ $t('meta.DS.tableDetail.score') }}</p>
              <div class="partRight-box">
                <el-rate
                  disabled
                  class="rate-starts"
                  v-model="propArr.vote"
                  :colors="scoreColors"
                ></el-rate>
              </div>
            </li>
            <li class="li-collection">
              <p @click="toggleCollecStatus" style="cursor: pointer">
                {{
                  hasCollected
                    ? $t('meta.DS.tableDetail.collected')
                    : $t('meta.DS.tableDetail.notCollect')
                }}
                <img
                  v-if="hasCollected"
                  src="static/images/meta/collectionTrue.svg"
                  alt=""
                />
                <img
                  v-else
                  src="static/images/meta/collectionFalse.svg"
                  alt=""
                />
              </p>
              <div class="partRight-box">
                <span>
                  {{ propArr.favoriteNumber ? propArr.favoriteNumber : 0 }}
                </span>
                <span class="span-company">
                  {{ $t('meta.DS.tableDetail.times') }}
                </span>
              </div>
            </li>
            <li class="li-visit">
              <p>{{ $t('meta.report.visitCount') }}</p>
              <div class="partRight-box">
                <span>{{ propArr.visitCount }}</span>
                <span class="span-company">
                  {{ $t('meta.DS.tableDetail.times') }}
                </span>
              </div>
            </li>
          </ul>
          <div class="partRight-button">
            <el-popover
              v-if="
                (objectType === 'TABLE' || objectType === 'VIEW') &&
                summaryLoaded
              "
              placement="bottom"
              width="150"
              trigger="click"
            >
              <el-button
                @click="downloadTable"
                style="width: 140px; border: none"
                plain
                size="small"
              >
                {{ $t('meta.DS.tableDetail.exportMetaData') }}
              </el-button>
              <el-button
                slot="reference"
                class="moreButton"
                style="padding-left: 10px; padding-right: 10px"
                type="primary"
                size="small"
              >
                {{ $t('meta.DS.tableDetail.moreOperation') }}
                <i style="margin-left: 5px" class="el-icon-more"></i>
              </el-button>
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
      summaryLoaded: false,
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
    disabledEdit: {
      type: Boolean,
      default: false,
    },
    summary: {
      required: true,
    },
    objectType: {
      type: String,
      default: 'REPORT',
    },
    propArr: {
      default() {
        return {}
      },
    },
    favoPara: {
      required: true,
    },
  },
  computed: {},
  mounted() {
    const query = this.$route.query
    this.dataInit()
  },
  methods: {
    dataInit() {
      this.summaryLoaded = true
      this.checkIfCollected()
    },
    handleReportEdit() {
      this.$emit('handleReportEdit')
    },

    // 收藏
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
        succesedCallback: data => {
          this.$emit('changeFav')
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.row-main {
  padding: 20px;
  overflow: auto;
  // position: absolute;
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
  // padding-right: 20px;
  .first-partLeft {
    width: 60%;
    float: left;
    margin-bottom: 16px;
    position: relative;
    //border-right: 2px solid #EFEFEF;

    .iconBox {
      // float: left;
    }

    .logicalNameBox {
      display: inline-block;
      margin-left: 10px;
      position: absolute;

      .physicalName {
        font-size: 20px;
        font-weight: 500;
        line-height: 20px;
        padding-bottom: 5px;
        max-width: 700px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        word-break: break-all;
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
    // width: 50%;
    // width: 400px;
    float: right;

    ul {
      margin-left: 10px;
      display: inline-block;

      li {
        float: left;
        height: 40px;
        padding: 0 20px;
        border-right: 1px solid #dddddd;
        &:last-child {
          border-right: 0;
        }

        p {
          font-size: 12px;
          color: #555555;
        }

        .partRight-box {
          height: 26px;
          display: flex;
          align-items: center;
          vertical-align: bottom;

          span {
            font-size: 16px;
          }

          img {
            width: 70px;
          }
        }
      }
    }

    .partRight-button {
      float: right;
      line-height: 48px;
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

.li-collection {
  img {
    margin-left: 6px;
  }
}
</style>
