<template>
  <div class="machine-page">
    <div class="machine-head" :class="{ 'max-machine-head': !showSearch }">
      <img src="static/kgimg/machine.png" alt="" />
    </div>
    <div class="head-tip">当前算法词库中词汇量</div>
    <div class="head-num">
      <span
        v-for="(item, index) in vocabulary"
        :key="index"
        :class="{ 'sep-span': item === ',' }"
      >
        {{ item }}
      </span>
    </div>
    <div class="head-btn-box">
      <el-popover
        :popper-class="[
          'machine-book-popover',
          showSearchBox ? 'machine-book-popover-spe' : '',
        ]"
        ref="testPopover"
        transition="fade-in-linear"
        placement="bottom"
        :visible-arrow="false"
        width="660"
        trigger="click"
        @show="showPopover"
        @hide="hidePopover"
      >
        <div class="btn" slot="reference">牛刀小试</div>
        <div
          v-if="showSearch"
          class="machine-search"
          :class="{ 'max-machine-search': showResult }"
          :style="{ height: boxH + 'px' }"
        >
          <div class="machine-box">
            <datablau-input
              class="maxlength-input"
              maxlength="200"
              :disabled="loading"
              show-word-limit
              style="width: 545px; margin-right: 8px"
              :placeholder="'请输入匹配内容'"
              v-model="keyword"
              @keyup.native.enter="query"
            ></datablau-input>
            <datablau-button type="normal" @click="query">
              <i class="el-icon-loading" v-if="loading"></i>
              查询
            </datablau-button>
          </div>
          <div class="search-list-box" v-loading="loading">
            <div
              class="search-list"
              v-for="item in searchList"
              :key="item.catalogId"
            >
              <div class="name">
                <!-- <i></i> -->
                <span v-html="formatAlias(item.catalogName)"></span>
              </div>
              <div class="rate-box">
                <datablau-rate
                  v-model="item.rate"
                  :colors="colors"
                  :disabled-void-color="'#ddd'"
                  disabled
                ></datablau-rate>
                <div class="rate-num">{{ item.score }}</div>
              </div>
            </div>
          </div>
        </div>
      </el-popover>
      <el-popover
        v-if="isBook"
        popper-class="machine-book-popover"
        ref="popover"
        :visible-arrow="false"
        placement="right"
        width="320"
        trigger="hover"
      >
        <div class="btn-tip" slot="reference">
          <i class="iconfont icon-ziliao"></i>
        </div>
        <div class="machine-book">
          <div
            class="book-header"
            :class="{ 'book-header-shadow': bookList > 8 }"
          >
            <div class="title">
              参与机器学习的内容
              <div class="book-total">共：{{ bookList }} 篇文档</div>
            </div>
          </div>
          <div class="book-content">
            <div class="list" v-for="item in bookList">
              <span></span>
              金融标准2020
            </div>
          </div>
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script>
import API from '@/view/dataSecurity/util/api'
export default {
  data() {
    return {
      canInput: false,
      isBook: false, // 暂时不显示
      loading: false,
      vocabulary: '',
      keyword: '',
      showSearch: false,
      showResult: false,
      colors: ['#409eff', '#409eff', '#409eff'],
      searchList: [],
      bookList: 15,
      boxH: 62,
      showSearchBox: false,
    }
  },
  watch: {
    keyword(val) {
      if (!val) {
        this.query()
      }
    },
  },
  mounted() {
    this.getVocabularyList()
  },
  methods: {
    operationBtn() {
      this.showSearch = !this.showSearch
    },
    getVocabularyList() {
      API.machineVocabulary()
        .then(res => {
          const num = res.data.data
          console.log(num)
          this.vocabulary = Number(num).toLocaleString()
          console.log(this.vocabulary)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    formatAlias(str) {
      if (!str) {
        return ''
      }
      if (this.keyword) {
        const strKey = this.keyword.toString()
        if (str.includes(strKey)) {
          const heightStr = str.replace(
            new RegExp(this.keyword, 'g'),
            `<em>${this.keyword}</em>`
          )
          return heightStr
        } else {
          return str
        }
      } else {
        return str
      }
    },
    query() {
      if (this.loading) {
        return
      }
      this.loading = true
      API.machineSearch(this.keyword)
        .then(res => {
          const h = res.data.data.length * 32 + 62
          this.boxH = h > 320 ? 320 : h
          this.showResult = true
          this.loading = false
          res.data.data.map(item => {
            item.rate = parseFloat((item.score * 5).toFixed(2))
            item.score = item.score.toFixed(2)
          })
          this.searchList = res.data.data
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
    showPopover() {
      this.showSearch = true
      setTimeout(() => {
        this.$nextTick(() => {
          this.$refs.testPopover.updatePopper()
          this.showSearchBox = true
        })
      }, 300)
    },
    hidePopover() {
      this.boxH = 62
      this.keyword = ''
      this.showResult = false
      this.searchList = []
      this.showSearch = false
      this.showSearchBox = false
    },
  },
}
</script>
<style lang="scss">
.search-list {
  .name {
    em {
      font-style: normal;
      color: #ff7519;
    }
  }
}
.machine-book-popover {
  padding: 0;
  padding-bottom: 10px;
  border-radius: 4px;
  border: 0;
  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.11);
  display: none;
  &.machine-book-popover-spe {
    display: block;
  }
}
</style>
<style scoped lang="scss">
.machine-book {
  max-height: 300px;
  position: relative;
  .book-header {
    height: 40px;
    padding: 12px 16px 0;
    box-sizing: border-box;
    &.book-header-shadow {
      box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.06);
    }
    .title {
      height: 24px;
      position: relative;
      color: #555555;
      font-size: 14px;
      text-align: left;
      .book-total {
        float: right;
        font-size: 12px;
        color: #999;
      }
    }
  }
  .book-content {
    padding: 0 16px;
    overflow-y: auto;
    max-height: 256px;
    .list {
      height: 32px;
      line-height: 32px;
      color: #555555;
      font-size: 12px;
      text-align: left;
      position: relative;
      padding-left: 20px;
      span {
        position: absolute;
        top: 8px;
        left: 0;
        width: 16px;
        height: 16px;
        background: transparentize($color: #409eff, $amount: 0.89);
        border-radius: 50%;
      }
    }
  }
}
.machine-page {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  .machine-head {
    border-radius: 10px;
    position: relative;
    text-align: center;
    margin-bottom: 16px;
    transition: all 0.3s;
    &.max-machine-head {
      transition: all 0.3s;
      margin-bottom: 40px;
      img {
        width: 480px;
        height: 180px;
        transition: all 0.3s;
        margin-top: 100px;
      }
    }
    img {
      display: block;
      margin: 0 auto;
      width: 160px;
      height: 60px;
      transition: all 0.3s;
      margin-top: 45px;
    }
  }
  .head-tip {
    height: 20px;
    line-height: 20px;
    font-size: 14px;
    text-align: center;
    color: #999999;
  }
  .head-num {
    margin-top: 18px;
    text-align: center;
    span {
      display: inline-block;
      width: 32px;
      height: 48px;
      line-height: 48px;
      background: #f5f5f5;
      border-radius: 4px;
      font-size: 40px;
      font-weight: 800;
      color: #555555;
      margin-right: 4px;
      &:last-child {
        margin-right: 0;
      }
      &.sep-span {
        width: 12px;
        background: transparent;
      }
    }
  }
  .head-btn-box {
    margin: 0 auto;
    margin-top: 24px;
    width: 220px;
    width: 160px;
    position: relative;
    .btn {
      width: 160px;
      height: 44px;
      line-height: 44px;
      background: linear-gradient(129deg, #74cdff 8%, #409eff 88%);
      border-radius: 6px;
      box-shadow: 0px 8px 14px 0px rgba(64, 158, 255, 0.29);
      vertical-align: top;
      color: #ffffff;
      font-size: 14px;
      cursor: pointer;
      text-align: center;
    }
    .btn-tip {
      position: absolute;
      right: -60px;
      top: 0;
      width: 44px;
      height: 44px;
      line-height: 44px;
      border: 1px solid #409eff;
      border-radius: 6px;
      text-align: center;
      cursor: pointer;
      i {
        font-size: 20px;
        color: #409eff;
      }
    }
  }
}
.machine-search {
  padding: 20px 0;
  padding-bottom: 10px;
  height: 62px;
  overflow: hidden;
  transition: all 0.3s;
  &.max-machine-search {
    transition: all 0.3s;
  }
  .machine-box {
    height: 32px;
    padding: 0 20px;
    i.el-icon-loading {
      font-size: 12px;
    }
  }
  .search-list-box {
    padding: 0 20px;
    margin-top: 8px;
    max-height: 165px;
    overflow-y: auto;
    transition: all 0.3s;
    .search-list {
      line-height: 32px;
      height: 32px;
      position: relative;
      .name {
        font-size: 12px;
        color: #555;
        position: relative;
        // padding-left: 20px;
        max-width: 440px;
        text-align: left;
        i {
          position: absolute;
          top: 8px;
          left: 0;
          width: 16px;
          height: 16px;
          background: transparentize($color: #409eff, $amount: 0.89);
          border-radius: 50%;
        }
      }
      .rate-box {
        position: absolute;
        top: 6px;
        right: 0;
        padding-left: 8px;
        width: 136px;
        height: 20px;
        line-height: 20px;
        border-radius: 10px;
        background: transparentize($color: #409eff, $amount: 0.92);
        /deep/ .datablau-rate {
          vertical-align: top;
          display: inline-block;
          height: 20px;
          line-height: 20px;
          .el-rate {
            .el-rate__icon {
              font-size: 15px;
            }
            .el-icon-star-on {
              .el-rate__decimal {
                color: #409eff !important;
              }
            }
          }
        }
        .rate-num {
          vertical-align: middle;
          height: 20px;
          line-height: 20px;
          width: 40px;
          font-size: 12px;
          float: right;
          background: #409eff;
          color: #fff;
          text-align: center;
          border-radius: 12px;
        }
      }
    }
  }
}
</style>
