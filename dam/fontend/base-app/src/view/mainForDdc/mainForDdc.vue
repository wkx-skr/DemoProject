<template>
  <div class="ddc-container default-style">
    <!-- <various-selector></various-selector> -->
    <page-heading
      :style="style.heading"
      @logo-click="handleLogoClick"
    ></page-heading>
    <div :style="style.content" class="ddc-view-container">
      <router-view></router-view>
    </div>
    <div :style="[style.content, style.detail]" v-if="showDetail">
      <my-item
        key="table"
        :data="currentTable"
        @close="handleTableClose"
      ></my-item>
    </div>
    <div :style="[style.content, style.detail]" v-if="showNews">
      <my-news key="news" @close="handleNewsClose"></my-news>
    </div>
    <div
      ref="dataList"
      id="sug-list"
      class="clearfix"
      :class="{
        opacity: !suggestions || suggestions.length === 0,
      }"
    >
      <!--下拉框数据-->
      <div class="selSug">
        <div v-for="(i, index) in suggestions" class="histyry_wrap">
          <div
            v-if="isLocal"
            class="sugHistory"
            @click="handleSuggestionClick(i)"
          >
            {{ i }}
            <span @click.stop="delHistoryItem(i)" class="del_history_item">
              ×
            </span>
          </div>
          <div v-else>
            <div class="sug_item_title" v-if="i.typeId !== 82800020">
              <span>{{ preMap(i).name }}</span>
              <span class="sug_res_count" @click="jumpToList(i)">
                （{{ i.count }}）
              </span>
            </div>
            <div
              v-if="i.typeId !== 82800020"
              v-for="(item, index) in i.options"
              :key="'suggestionKey' + item + index"
              @click="handleSuggestionClick(item)"
              class="sug_item clearfix"
              :class="{ keyHover: keyHover === index }"
            >
              <div class="clearfix">
                <div
                  class="sug_item_icon"
                  :style="{ background: preMap(item).bg }"
                >
                  <datablau-icon
                    class="icon_item"
                    :data-type="preMap(item).dataType"
                    :size="16"
                  ></datablau-icon>
                </div>
                <div class="sug_item_info">
                  <datablau-tooltip
                    effect="dark"
                    :content="item.secName"
                    placement="bottom-start"
                    :open-delay="700"
                    :disabled="!item.secName"
                  >
                    <div
                      class="item_info_name"
                      :style="{
                        lineHeight: item.description ? '20px' : '38px',
                      }"
                    >
                      <span>{{ item.name }}</span>
                      <span
                        :style="secnameStyle(item)"
                        :class="
                          item.typeId == 80010066 || item.typeId == 80010098
                            ? 'item_info_tag_secname'
                            : 'item_info_secname'
                        "
                      >
                        {{ item.secName }}
                      </span>
                    </div>
                  </datablau-tooltip>
                  <datablau-tooltip
                    v-if="item.description"
                    effect="dark"
                    :content="item.description"
                    placement="bottom-start"
                    :open-delay="700"
                    :disabled="!item.description"
                  >
                    <div class="item_info_desc">
                      <span>{{ item.description }}</span>
                    </div>
                  </datablau-tooltip>
                </div>
              </div>
            </div>
            <div class="synonym" v-if="i.typeId === 82800020">
              <div class="sug_item_title">
                <span>同义词</span>
              </div>
              <div class="synonym_sug_item">
                <span
                  v-for="item in i.options"
                  class="item"
                  @click="handleSynonymClick(item)"
                >
                  {{ item }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        style="margin-top: 20px"
        v-show="isLocal && suggestions && suggestions.length > 0"
      >
        <el-button
          size="mini"
          type="text"
          class="clearHistory"
          @click="clearHistories"
        >
          清空搜索历史
        </el-button>
      </div>
    </div>
    <div v-if="showFrontPage" @click="showFrontPage = false">
      <div
        style="
          background-color: #676767;
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          z-index: 10;
          opacity: 0.6;
        "
      ></div>
      <div
        style="
          background-color: transparent;
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          z-index: 10;
        "
      >
        <div
          style="
            background: #f1f5f8;
            box-shadow: 0 0 6px #999;
            width: 600px;
            height: 400px;
            margin: 150px auto 0;
            z-index: 11;
          "
          @click.stop
          v-html="frontPageHtml"
        ></div>
      </div>
    </div>
    <div id="context-menu" v-show="showContext">
      <ul class="context-menu-style">
        <li
          class="context-option"
          v-for="o in contextOptions"
          :key="o.label"
          @click="o.callback(o.args)"
        >
          <i v-if="o.icon" class="icon" :class="o.icon"></i>
          <span class="label">{{ o.label }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import pageHeading from './heading.vue'
import myItem from '../myItem/main.vue'
import myNews from '../myNews/main.vue'
export default {
  components: { pageHeading, myItem, myNews },
  data() {
    return {
      keyHover: null,
      style: {
        heading: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '51px',
          'line-height': '51px',
          backgroundColor: 'var(--heading-ddc-bgc)',
          borderBottom: this.$style.greyBorder,
          display: 'none',
        },
        content: {
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1,
          overflow: 'auto',
        },
        detail: {
          backgroundColor: '#FFF',
          zIndex: 2,
        },
      },
      showDetail: false,
      showNews: false,
      currentTable: null,
      showFrontPage: false,
      frontPageHtml: '',
      suggestions: null,
      fromLocal: null,
      suggestionKey: 0,
      showContext: false,
      contextOptions: [],
      keyword: '',
      isLocal: false,
    }
  },
  mounted() {
    // this.$bus.$on('showDetail',this.handleShowDetail);
    this.$bus.$on('showNewsDetail', this.handleShowNewsDetail)
    /* this.$bus.$on('showFrontPage',html=>{
        this.frontPageHtml = html;
        this.showFrontPage = true;
      }); */

    this.$bus.$on('handleDataList', setting => this.handleDataList(setting))
    this.createContextMenu()
  },
  beforeDestroy() {
    // this.$bus.$off('showDetail');
    this.$bus.$off('showNewsDetail')
    this.$bus.$off('handleDataList')
    // this.$bus.$off('showFrontPage');
    // this.$bus.$off('callContextMenu');
    $(window).off('mouseup', this.handleMouseUp)
    // $(window).off('keydown')
  },
  methods: {
    secnameStyle(item) {
      if (`${item.typeId}` === '80010066' && `${item.categoryId}` === '2') {
        // 指标标准
        return {
          color: '#D1AF3E',
          background: 'rgba(209, 175, 62, 0.1)',
        }
      } else if (`${item.typeId}` === '80010098') {
        return {
          color: '#9D5B8B',
          background: 'rgba(157, 91, 139, 0.1)',
        }
      }
    },

    // 单条删除
    delHistoryItem(item) {
      const oldStr = localStorage.getItem('recentSearch')
      const oldArr = oldStr.split('||')
      const delIndex = oldArr.findIndex(i => i == item)
      oldArr.splice(delIndex, 1)
      localStorage.setItem('recentSearch', oldArr.join('||'))
    },
    preMap(data) {
      if (data.typeId) {
        switch (`${data.typeId}`) {
          case `${this.$commentPreCode.Entity}`:
            return {
              dataType: 'table',
              bg: 'rgba(64, 158, 255, 0.1)',
              name: '表',
            }
            break
          case `${this.$commentPreCode.View}`:
            return {
              dataType: 'view',
              bg: 'rgba(75, 92, 196, 0.1)',
              name: '视图',
            }
            break
          case `${this.$commentPreCode.Package}`:
            return {
              dataType: 'package',
              bg: 'rgba(91, 126, 145, 0.1)',
              name: '程序包',
            }
            break
          case `${this.$commentPreCode.Index}`:
            return {
              dataType: 'index',
              bg: 'rgba(209, 175, 62, 0.1)',
              name: '指标标准',
            }
            break
          case `${this.$commentPreCode.Api}`:
            return {
              dataType: 'api',
              bg: 'rgba(0, 164, 151, 0.1)',
              name: 'API',
            }
            break
          case `${this.$commentPreCode.Domain}`:
            return {
              dataType: data.categoryId === 1 ? 'datastandard' : 'index',
              bg:
                data.categoryId === 1
                  ? 'rgba(56, 180, 139, 0.1)'
                  : 'rgba(209, 175, 62, 0.1)',
              name: '数据标准',
            }
            break
          case `${this.$commentPreCode.CODE}`:
            return {
              dataType: 'daima',
              bg: 'rgba(157, 91, 139, 0.1)',
              name: '标准代码',
            }
            break
          case `${this.$commentPreCode.ShareFile}`:
            return {
              dataType: this.$fileTypeFormatter(data.fileType),
              bg: 'rgba(64, 158, 255, 0.1)',
              name: '文件',
            }
            break
          case `${this.$commentPreCode.Report}`:
            return {
              dataType: 'report',
              bg: 'rgba(0, 136, 153, 0.1)',
              name: '报表',
            }
            break
        }
      }
    },
    jumpToDetail(data) {
      const ifOpenNewPage = true
      if (`${data.typeId}` === `${this.$commentPreCode.ShareFile}`) {
        // 文件类型--id
        const pos = location.href.indexOf('#/')
        const baseUrl = location.href.slice(0, pos + 1)
        const url = `${baseUrl}myShareFile?id=${data.id}&catalogPath=${data.catalogPath}&keyword=${this.keyword}`
        window.open(url)
      }
      const query = {
        objectId: data.objectId,
        keyword: this.keyword,
        catalogPath: this.catalogPath,
        type: data.type,
        typeId: String(data.typeId),
      }
      if (!data.typeId && data.api) {
        query.typeId = this.$commentPreCode.API
      }
      // this.$bus.$emit('showDetail', query);
      if (query.typeId === this.$commentPreCode.Entity) {
        // 表
        const pos = location.href.indexOf('#/')
        const baseUrl = location.href.slice(0, pos + 2)
        window.open(
          baseUrl +
            `myItem?objectId=${data.objectId}&keyword=${this.keyword}&catalogPath=${data.catalogPath}&type=TABLE`
        )
      }
      if (query.typeId === this.$commentPreCode.View) {
        // 视图
        const pos = location.href.indexOf('#/')
        const baseUrl = location.href.slice(0, pos + 2)
        window.open(
          baseUrl +
            `myItem?objectId=${data.objectId}&keyword=${this.keyword}&catalogPath=${data.catalogPath}&type=VIEW`
        )
      }
      if (query.typeId === this.$commentPreCode.Domain) {
        // 标准
        const pos = location.href.indexOf('#/')
        const baseUrl = location.href.slice(0, pos + 2)
        window.open(
          baseUrl +
            `domain?domainId=${data.domainId}&keyword=${this.keyword}&vote=${data.vote}`
        )
      }
      if (query.typeId === this.$commentPreCode.Index) {
        // 指标
        const pos = location.href.indexOf('#/')
        const baseUrl = location.href.slice(0, pos + 2)
        window.open(
          baseUrl + `indexForDdc?code=${this.data.code}&vote=${data.vote}`
        )
      }
      if (query.typeId === this.$commentPreCode.CODE) {
        // 标准代码
        const pos = location.href.indexOf('#/')
        const baseUrl = location.href.slice(0, pos + 2)
        window.open(baseUrl + `main/dataStandard/code?code=${data.code}`)
      }
      if (query.typeId === this.$commentPreCode.Report) {
        // 报表
        if (ifOpenNewPage) {
          const pos = location.href.indexOf('#/')
          const baseUrl = location.href.slice(0, pos + 2)
          window.open(
            baseUrl + `reportForm?reportId=${data.id}&keyword=${this.keyword}`
          )
        } else {
          const query = {
            reportId: data.id,
            type: 'Report',
            keyword: this.keyword,
          }
          this.$router.push({
            name: 'reportForm',
            query: query,
          })
        }
      }
      if (query.typeId === this.$commentPreCode.API) {
        const pos = location.href.indexOf('#/')
        const baseUrl = location.href.slice(0, pos + 2)
        window.open(baseUrl + `main/apiOverview?apiId=${data.id || ''}`)
      }
    },
    handleMouseUp(e) {
      const self = this
      self.showContext = false
      const target = $(e.target)
      if (target && target[0] && target[0].tagName !== 'INPUT') {
        $('#sug-list').hide()
        $(window).off('keydown')
      }
    },
    createContextMenu() {
      const dom = $('#context-menu')
      const self = this
      $(window).on('mouseup', this.handleMouseUp)
      /* this.$bus.$on('callContextMenu',({x,y,options,isLeft})=>{
          if(isLeft){
            dom.css({
              top:y + 1 +'px',
              left:x - 120 + 'px'
            });
          }else{
            dom.css({
              top:y + 1 +'px',
              left:x+  1 + 'px'
            });
          }
          this.contextOptions = options;
          this.showContext = true;
        }); */
    },
    handleKeyDown(e) {
      // keyCode===38 up
      // keyCode===40 down
      if (this.suggestions && this.suggestions.length > 0) {
        const length = this.suggestions.length

        if (
          !this.keyHover &&
          this.keyHover !== 0 &&
          (e.keyCode === 38 || e.keyCode === 40)
        ) {
          this.keyHover = 0
        } else if (e.keyCode === 38) {
          if (this.keyHover === 0) {
            this.keyHover = length - 1
          } else {
            this.keyHover--
          }
        } else if (e.keyCode === 40) {
          if (this.keyHover === length - 1) {
            this.keyHover = 0
          } else {
            this.keyHover++
          }
        } else {
        }
        if (e.keyCode === 38 || e.keyCode === 40) {
          this.resetKeyword(this.suggestions[this.keyHover])
        }
      }
    },
    handleDataList(setting) {
      this.keyword = setting.keyword
      const el = this.$refs.dataList
      switch (setting.type) {
        case 'hide': {
          $('#sug-list').hide()
          break
        }
        case 'click': {
          $('#sug-list').show()
          el.style.left = setting.left + 'px'
          el.style.top = setting.top + setting.height + 'px'
          el.style.width = setting.width + 'px'
          el.style.display = 'block'
          break
        }
        case 'focus': {
          el.style.left = setting.left + 'px'
          el.style.top = setting.top + setting.height + 'px'
          el.style.width = setting.width + 'px'
          el.style.display = 'block'
          this.keyHover = null
          const addKeyboardListener = () => {
            $(window).off('keydown', this.handleKeyDown)
            $(window).on('keydown', this.handleKeyDown)
          }
          addKeyboardListener()
          // el.$el.style.animation = 'suglist_in 0.1s linear'
          break
        }
        case 'blur':
          setTimeout(() => {
            if (el) {
              // el.style.display = 'none'
            }
            // this.suggestions =[];
          }, 100)

          break
        case 'change':
          const path = this.$route.path
          console.log(path)
          if (path === '/home') {
            // 下拉框数据
            // this.suggestions = Array.from(setting.options)
            $('#sug-list').show()
            el.style.left = setting.left + 'px'
            el.style.top = setting.top + setting.height + 'px'
            el.style.width = setting.width + 'px'
            el.style.display = 'block'
            if (setting.local) {
              this.isLocal = true
              this.suggestions = setting.options
            } else {
              this.isLocal = false
              this.suggestions = setting.options
            }
            this.fromLocal = setting.local
          }
          break
        case 'clear':
          this.suggestions = []
          break
      }
    },
    // handleShowDetail(data){
    //   if(data){
    //     this.currentTable = data;
    //     this.showDetail = true;
    //   }else{
    //     this.showDetail = false;
    //   }
    //   if (data) {
    //     this.$router.push({
    //       name: 'myItem',
    //       query: {
    //         objectId: data.objectId,
    //         path: ''
    //       }
    //     })
    //   }
    // },
    handleShowNewsDetail() {
      this.showNews = true
    },
    handleNewsClose() {
      this.showNews = false
    },
    handleTableClose() {
      this.showDetail = false
    },
    handleLogoClick() {
      this.$router.push({ name: 'home' })
      this.showDetail = false
      this.showNews = false
    },
    handleSynonymClick(value) {
      this.search(value)
    },
    handleSuggestionClick(value) {
      if (this.keyword) {
        this.jumpToDetail(value)
        let keyword = this.keyword
        // 存历史数据
        if (keyword && keyword !== '*') {
          const oldStr = localStorage.getItem('recentSearch')
          let oldArr = []
          if (!oldStr) {
          } else {
            oldArr = oldStr.split('||')
          }
          if (keyword.indexOf('*') === keyword.length - 1) {
            keyword = keyword.slice(0, -1)
          }
          if (oldArr.indexOf(keyword) === -1) {
            oldArr.push(keyword)
          } else {
            oldArr.splice(oldArr.indexOf(keyword), 1)
            oldArr.push(keyword)
          }
          if (oldArr.length > 10) {
            oldArr.shift()
          }
          localStorage.setItem('recentSearch', oldArr.join('||'))
        }
      } else {
        this.search(value)
      }
    },
    resetKeyword(value) {
      this.$bus.$emit('resetKeyword', value)
      this.keyword = value
    },
    search(value) {
      this.keyword = value
      this.$router.push({ name: 'search', query: { keyword: value } })
      this.$bus.$emit('resetKeyword', value)
    },
    jumpToList(data) {
      let typeId = ''
      if (data.standardAndIndex && data.standardAndIndex.length) {
        typeId =
          data.standardAndIndex.length > 1
            ? '80010066,82800003'
            : `${data.standardAndIndex[0]}` === '1'
            ? 80010066
            : 82800003
      } else {
        typeId = data.typeId
      }
      this.$router.push({
        name: 'search',
        query: { keyword: this.keyword, types: typeId },
      })
    },
    // 清空历史
    clearHistories() {
      localStorage.removeItem('recentSearch')
      // this.suggestions.length = 0;
      // this.suggestionKey++;
    },
  },
}
</script>

<style scoped lang="scss">
.clearfix:after {
  content: '';
  height: 0;
  visibility: hidden;
  clear: both;
  display: block;
}
.ddc-container,
.ddc-container .ddc-view-container {
  background-color: var(--main-content-bgc);
}
.sug_fade_out {
  height: 0;
  //animation: suglist_out 1s linear;
}
.sug_fade_in {
  animation: suglist_in 0.1s linear;
}
#sug-list {
  display: none;
  background: #fff;
  position: absolute;
  z-index: 9999;
  border-radius: 0 0 3px 3px;
  margin-top: 2px;
  box-shadow: 0px 0px 10px 0px rgba(85, 85, 85, 0.15);
  // border: 1px solid #ccc;
  text-align: left;
  line-height: 26px;
  max-width: 680px;
  //max-width: 1180px;
  max-height: 600px;
  padding: 16px 0;
  //animation: suglist_in 0.1s linear;
  & .clearHistory {
    position: absolute;
    bottom: 12px;
    right: 12px;
  }
  &.opacity {
    opacity: 0;
    -webkit-box-shadow: none;
  }
  .selSug {
    min-height: 100px;
    max-height: 550px;
    overflow-y: auto;
    .synonym {
      .synonym_sug_item {
        padding: 0 18px;
        display: inline-block;
        .item {
          padding: 0 6px;
          margin-top: 6px;
          display: inline-block;
          background-color: #f5f5f5;
          margin-right: 6px;
          border-radius: 2px;
          cursor: pointer;
        }
      }
    }
    .sug_item_title {
      padding: 0 18px;
      margin-bottom: 6px;
      color: #999999;
      font-size: 12px;
      .sug_res_count {
        //margin-left: 10px;
        color: #409eff;
        cursor: pointer;
      }
    }
    /*.histyry_wrap {
      &:hover {
        background-color: rgba(64, 158, 255, 0.1);
      }
    }*/
    .sugHistory {
      height: 32px;
      line-height: 32px;
      padding: 0 18px;
      &:hover {
        background-color: rgba(64, 158, 255, 0.1);
      }
      .del_history_item {
        width: 20px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        float: right;
        &:hover {
          color: #409eff;
        }
      }
    }
  }
  .sug_item {
    //height: 38px;
    //line-height: 40px;
    height: 44px;
    line-height: 44px;
    margin: 8px 0;
    cursor: pointer;
    padding: 0 16px;
    //margin-top: 16px;
    &:hover {
      //background: rgba(64, 158, 255, 0.1);
    }
    //text-indent: 1em;
    /*&:hover {
      background: #f0f0f0;
    }
    &.keyHover {
      background: #f0f0f0;
    }*/
    .sug_item_icon {
      float: left;
      width: 32px;
      height: 32px;
      line-height: 33px;
      text-align: center;
      background-color: #edf4ff;
      border-radius: 4px;
      margin-right: 6px;
      position: relative;
      top: 3px;

      .icon_item {
        vertical-align: text-top;
      }
    }
    .sug_item_info {
      float: left;
      //width: calc(100% - 52px);
      //height: 32px;
      //line-height: 33px;
      width: 520px;
      height: 52px;
      line-height: 18px;
      font-size: 14px;
      .item_info_name {
        width: 520px;
        display: inline-block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        .item_info_secname {
          line-height: 18px;
          margin-left: 6px;
          font-size: 12px;
          color: #999999;
        }
        .item_info_tag_secname {
          line-height: 18px;
          font-size: 12px;
          margin-left: 6px;
          display: inline-block;
          padding: 0 6px;
          color: #57a07f;
          background-color: rgba(87, 160, 127, 0.1);
          border-radius: 2px;
        }
      }
      .item_info_desc {
        font-size: 12px;
        color: #999999;
        width: 520px;
        display: inline-block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: PingFangSC, PingFangSC-Regular;
      }
    }
    /*.del_history_item {
      width: 20px;
      height: 32px;
      line-height: 32px;
      text-align: center;
      float: right;
      &:hover {
        color: red;
      }
    }*/
  }
}
#context-menu {
  position: absolute;
  z-index: 9999;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
@keyframes suglist_in {
  0% {
    height: 0;
  }
  50% {
    height: 200px;
  }
  100% {
    height: 400px;
  }
}
@keyframes suglist_out {
  0% {
    height: 400px;
  }
  50% {
    height: 200px;
  }
  100% {
    height: 0;
  }
}
</style>
