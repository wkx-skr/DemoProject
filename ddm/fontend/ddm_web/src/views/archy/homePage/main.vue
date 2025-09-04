<template>
  <div class="archyBox" ref="cont">
    <div class="search-outer" v-if="!searchList">
      <div  class="con">
        <div class="searchBox">
          <div class="inputBox">
            <datablau-input
              v-model="keyWords"
              height="40"
              :iconfont-state="true"
              :placeholder="hotList.length > 0 ? hotList[0].keyword :'搜索'"
              @keydown.enter.native="searchBtn"
              clearable
            ></datablau-input>
            <datablau-button
              type="important"
              height="40"
              @click="searchBtn"
            >搜索</datablau-button>
<!--            <div class="searchRecommended"></div>-->
          </div>

          <div class="topSearch" v-if="hotList.length">
            <i>最近热搜：</i>
            <span v-for="(item, i) in hotList" :key="item.keyword + i" @click="hotClick(item.keyword)">{{item.keyword}}<span v-if="i <hotList.length-1">、</span></span>

          </div>
          <div class="typeObject">
            <div>
              <div class="left">
                <img src="../../../assets/images/archy/iconGrouping.svg" alt="">
              </div>
              <div>
                <div class="top">主题域分组</div>
                <div class="num">{{mapObject.OBJECT_SUBJECT_DOMAIN}}</div>
              </div>
            </div>

            <div>
              <div class="left">
                <img src="../../../assets/images/archy/iconTheme.svg" alt="">
              </div>
              <div>
                <div class="top">主题域</div>
                <div class="num">{{mapObject.OBJECT_SUBJECT}}</div>
              </div>
            </div>
            <div>
              <div class="left">
                <img src="../../../assets/images/archy/iconSystem.svg" alt="">
              </div>
              <div>
                <div class="top">业务系统</div>
                <div class="num">{{mapObject.SYSTEM}}</div>
              </div>
            </div>
            <div>
              <div class="left">
                <img src="../../../assets/images/archy/iconBusiness.svg" alt="">
              </div>
              <div>
                <div class="top">业务对象</div>
                <div class="num">{{mapObject.OBJECT}}</div>
              </div>
            </div>
            <!--<div>
              <div class="left">
                <img src="../../../assets/images/archy/iconModel.svg" alt="">
              </div>
              <div>
                <div class="top">概念模型</div>
                <div class="num">10</div>
              </div>
            </div>
            <div>
              <div class="left">
                <img src="../../../assets/images/archy/iconLogica.svg" alt="">
              </div>
              <div>
                <div class="top">逻辑模型</div>
                <div class="num">10</div>
              </div>
            </div>-->
            <div>
              <div class="left">
                <img src="../../../assets/images/archy/iocnPhysics.svg" alt="">
              </div>
              <div>
                <div class="top">物理模型</div>
                <div class="num">{{mapObject.PHYSIC_MODEL}}</div>
              </div>
            </div>
            <div>
              <div class="left">
                <img src="../../../assets/images/archy/iconEntity.svg" alt="">
              </div>
              <div>
                <div class="top">实体</div>
                <div class="num">{{mapObject.ENTITY}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="searchList" class="searchList">
      <div class="stickyBox">
        <div class="searchLogobox" :class="{shadowTop: shadowTop}">
          <div style="margin-top: -20px;padding-top: 20px;background: #fff;display: flex;">
            <div  style="margin-right: 12px;margin-top: 7px;">
              <img class="datablau-logo"  src="../../../assets/images/blue_logo.svg" alt="logo" style="cursor:pointer;" width="140" @click="goToSearch" />
            </div>
            <div>
              <div class="inputBox">
                <datablau-input
                  v-model="keyWords"
                  height="40"
                  :iconfont-state="true"
                  :placeholder="'搜索'"
                  @keydown.enter.native="searchBtn"
                  clearable
                ></datablau-input>
                <datablau-button
                  type="important"
                  height="40"
                  @click="searchBtn"
                >搜索</datablau-button>
              </div>
              <div class="module">
                <div v-for="item in moduleLIst" :key="item.type" @click="moduleClick(item)" :class="{'active' : activeName === item.type, noClick: !item.click}">{{item.label}}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="listScroll" ref="listScroll" :style="{'padding-bottom': activeName==='all'? 0: '50px'}">
          <div v-if="noData" class="noData">
            <img src="../../../assets/images/archy/nodata.svg" alt="">
            <p>暂无数据，重新搜索</p>
          </div>
          <div v-else v-for="item in searchHomeList" :key="item.type">
            <div class="moduleTop" @click="moduleClick(item, 'click')" v-if="activeName === 'all' && item.content">
              <span>{{objectList[item.type]}}</span>
              <span class="iconfont icon-goto"></span>
            </div>
            <div class="systemBox" v-for="v in item.content" :key="v.id" @click="systemClick(v, item.type)">
              <div class="iconBox">
                <span :class="v.icon" v-if="v.icon.indexOf('tree-icon') !== -1"></span>
                <span v-else-if="v.icon === 'object'"><datablau-list-icon iconType="svg" :dataType="'business_object'"></datablau-list-icon>
                  </span>
                <span v-else-if="v.icon === 'entity'"><datablau-list-icon
                  iconType="svg"
                  :dataType="'table'"
                ></datablau-list-icon>
                  </span>
                <span v-else><datablau-icon  style="vertical-align: text-top;" :data-type="v.icon" icon-type="svg" :size="18" ></datablau-icon>
                  </span>
              </div>
              <div class="listCon">
                <span class="catalogName">{{v.name}}</span>
                <div>路径：{{v.path}}</div>
              </div>
            </div>
<!--            <div v-if="!item.content || !item.content.length">暂无数据</div>-->
          </div>

        </div>
      </div>
      <div class="pagination-part" :class="{shadowBto: shadowBto, 'borderTop': !shadowBto}" v-show="activeName !== 'all' && total">
        <datablau-pagination
          style=""
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50,100]"
          :page-size="sizePage"
          layout="total, sizes,  pager,  jumper"
          :total="total">
        </datablau-pagination>
      </div>
    </div>
  </div>

</template>

<script>
import HTTP from '@/resource/http'
export default {
  data () {
    return {
      keyWords: '',
      searchList: false,
      activeName: 'all',
      moduleLIst: [
        { type: 'all', label: '全部', click: true },
        { type: 'OBJECT_SUBJECT_DOMAIN', label: '主题域分组', click: true },
        { type: 'OBJECT_SUBJECT', label: '主题域', click: true },
        { type: 'SYSTEM', label: '业务系统', click: true },
        { type: 'OBJECT', label: '业务对象', click: true },
        /* { type: 'conceptual', label: '概念模型' },
        { type: 'logical', label: '逻辑模型' }, */
        { type: 'PHYSIC_MODEL', label: '物理模型', click: true },
        { type: 'ENTITY', label: '业务实体', click: true }
      ],
      objectList: {
        OBJECT_SUBJECT_DOMAIN: '主题域分组',
        OBJECT_SUBJECT: '主题域',
        SYSTEM: '业务系统',
        OBJECT: '业务对象',
        PHYSIC_MODEL: '物理模型',
        ENTITY: '业务实体'
      },
      mapObject: {},
      sizePage: 3,
      currentPage: 1,
      total: 0,
      shadowTop: false,
      shadowBto: true,
      searchHomeList: [],
      hotList: [],
      noData: false
    }
  },
  methods: {
    result (val) {
      console.log(val, 'val')
    },
    searchBtn () {
      if (!this.keyWords && this.hotList.length && !this.searchList) {
        this.keyWords = this.hotList[0].keyword
      }
      let params = {
        name: this.keyWords,
        currentPage: this.currentPage,
        pageSize: this.sizePage
        // type: this.activeName === 'all' ? '' : this.activeName
      }
      this.activeName !== 'all' && (params.type = this.activeName)
      this.noData = false
      HTTP.archyHomeSearch(params)
        .then(res => {
          let num = 0
          !params.type && this.moduleLIst.forEach(v => {
            v.click = true
          })
          res.data.forEach(item => {
            if (!item.content) {
              num++
              this.moduleLIst.forEach(v => {
                if (v.type === item.type) {
                  v.click = false
                }
              })
            }
            // 主题域分组
            if (item.type === 'OBJECT_SUBJECT_DOMAIN') {
              item.content && item.content.forEach(item => {
                item.icon = 'tree-icon business-area'
              })
            }
            if (item.type === 'OBJECT_SUBJECT') {
              item.content && item.content.forEach(item => {
                item.icon = 'tree-icon theme-area'
              })
            }
            if (item.type === 'SYSTEM') {
              item.content && item.content.forEach(item => {
                item.icon = 'modelcategory'
              })
            }
            if (item.type === 'OBJECT') {
              item.content && item.content.forEach(item => {
                item.icon = 'object'
              })
            }
            if (item.type === 'PHYSIC_MODEL') {
              item.content && item.content.forEach(item => {
                item.icon = 'model'
              })
            }
            if (item.type === 'ENTITY') {
              item.content && item.content.forEach(item => {
                item.icon = 'entity'
              })
            }
          })
          if (num === res.data.length) {
            this.noData = true
          }
          this.searchHomeList = res.data
          // this.activeName = 'all'
          this.searchList = true
          this.activeName !== 'all' && (this.total = res.data[0]?.totalElements)
          this.$nextTick(() => {
            this.setShadow()
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
      // }
      // this.searchList = true
    },
    goToSearch () {
      this.searchList = false
      this.activeName = 'all'
    },
    moduleClick (val, flag) {
      console.log(val.click, flag)
      if (!val.click && !flag) return
      this.activeName = val.type
      if (val.type === 'all') {
        this.sizePage = 3
      } else {
        this.sizePage = 50
      }

      this.searchBtn()
    },
    handleSizeChange (val) {},
    handleCurrentChange (val) {},
    setShadow () {
      $(this.$refs['listScroll']).scroll(() => {
        let height = parseInt($(this.$refs['listScroll']).css('height'))
        let offsetTop = $(this.$refs['listScroll']).offset().top
        let scrollTop = $(this.$refs['listScroll']).scrollTop()
        if (scrollTop > 0) {
          this.shadowTop = true
        } else {
          this.shadowTop = false
        }
        if (offsetTop + scrollTop > height) {
          this.shadowBto = false
        } else {
          this.shadowBto = true
        }
      })
      /* if (offsetTop < 165) {
        this.shadowTop = true
      } else {
        this.shadowTop = false
      } */
    },
    getStatistics () {
      HTTP.getStatistics()
        .then(res => {
          this.mapObject = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    archyHomeHot () {
      HTTP.archyHomeHot()
        .then(res => {
          this.hotList = res.data.slice(0, 10)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    hotClick (item) {
      this.keyWords = item
      this.searchBtn()
    },
    systemClick (item, type) {
      let url = ''
      let query = ''
      switch (type) {
        case 'OBJECT_SUBJECT_DOMAIN':
          url = 'main/enterpriseLogicalModel'
          query = '?treeId=' + item.id
          break
        case 'OBJECT_SUBJECT':
          url = 'main/enterpriseLogicalModel'
          query = '?treeId=' + item.id
          break
        case 'SYSTEM':
          url = 'main/applicationSystemModel'
          query = `?name=${item.name}&id=${item.id}`
          break
        case 'OBJECT':
          url = 'main/enterpriseLogicalModel'
          query = '?id=' + item.id
          break
        case 'PHYSIC_MODEL':
          HTTP.getModelPermission({ modelId: item.id })
            .then(data => {
              if (data.admin || data.editor || data.viewer) {
                url = 'main/list'
                query = `?id=${item.id}&pId=${item.categoryId}&currentVersion=${item.currentVersion}`
                const pos = location.href.indexOf('#/')
                const baseUrl = location.href.slice(0, pos + 2)
                url && window.open(baseUrl + url + query)
              } else {
                this.$message.warning(this.$v.modelList.tip_1)
              }
            })
            .catch(e => {
              this.$showFailure(e)
            })
          break
        case 'ENTITY':
          HTTP.getModelPermission({
            modelId: item.modelId
          })
            .then(permission => {
              permission = permission || {}
              if (permission.admin || permission.editor || permission.viewer) {
                url = 'main/list'
                query = `?id=${item.modelId}&objectId=${item.elementId}&objectType=table`
                const pos = location.href.indexOf('#/')
                const baseUrl = location.href.slice(0, pos + 2)
                url && window.open(baseUrl + url + query)
              } else {
                this.$datablauMessage.warning(this.$t('common.info.noModelPermission'))
              }
            })
            .catch(e => {
              this.$showFailure(e)
            })

          break
      }
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      type !== 'ENTITY' && type !== 'PHYSIC_MODEL' && window.open(baseUrl + url + query)

      console.log(item)
    }
  },
  mounted () {
    this.getStatistics()
    this.archyHomeHot()
  }
}
</script>

<style scoped lang='scss'>
  body,html,  .search-outer{
    width: 100%;
    height: 100%;
    background: #fff;
  }
  .archyBox{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    /*padding: 20px;*/
  }
  .search-outer{
    display: flex;
    justify-content: center;
    align-items: center;
  }
.con{
  width: 100%;
  height: 100%;
  /*min-height: 570px;*/
  display: flex;
  justify-content: center;
  align-items: center;
  background: url("../../../assets/images/archy/Back.svg") center center;
  /*background-size: 100% 100%;*/
  .topSearch{
    color: #555;
    font-size: 12px;
    width: 545px;
    margin: 15px auto 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    i{
      color: #999;
      font-size: 12px;
      font-style: normal;
    }
    span{
      cursor: pointer;
      &:hover{
        color: #409EFF;
      }
    }
  }
  .typeObject{
    display: flex;
    flex-wrap: wrap;
    width: 606px;
    &>div{
      display: flex;
      justify-content: center;
      align-items: center;
      /*margin: 10px 10px 0 0;*/
      background: url(../../../assets/images/archy/homebg.svg) center center;
      width: 202px;
      height: 86px;
      background-size: 100% 100%;
      margin-bottom:8px;
      &:hover{
        background: url(../../../assets/images/archy/bgHover.svg) center center;
        background-size: 100% 100%;
      }
      &:nth-child(3n){
        margin-right: 0;
      }
      .left{
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #fff;
        text-align: center;
        line-height: 48px;
        margin-right: 10px;
      }
      .top{
        color: #777;
        margin-bottom: 5px;
      }
      .num{
        color: #555;
        font-size: 16px;
      }
    }
  }
}
  .tree-icon.business-area {
    width: 14px;
    height: 14px;
    margin-left: 0;
    background-image: url(../../../assets/images/search/business_area.svg);
  }
  .tree-icon.theme-area {
    width: 14px;
    height: 14px;
    margin-left: 0;
    background-image: url(../../../assets/images/search/theme-area.svg);
  }
.searchList{
  height: 100%;
  padding: 20px;
}
.stickyBox{
  flex: 1;
  height: 100%;
  /*padding-bottom: 30px;*/
  display: flex;
  flex-direction: column;
}
  .searchLogobox{
    position: sticky;
    top: 0;
    display: flex;
    background: #fff;
    width: 100%;
    height: 96px;
  }
  .module{
    margin:16px 0;
    display: flex;
    div{
      padding: 6px 9px;
      line-height: 1;
      background: rgba(153, 153, 153, 0.10);
      font-size: 12px;
      margin-right: 8px;
      cursor: pointer;
      float: left;
      border-radius: 2px;
      &.active{
        background: #409EFF;
        color: #fff;
      }
      &.noClick{
        color: #999;
        cursor: not-allowed;
      }
    }
  }
  .listScroll{
    padding-left: 152px;
    flex: 1;
    overflow: auto;
  }
  .moduleTop{
    width: 800px;
    height: 32px;
    background: #F5F5F5;
    border-radius: 2px;
    padding: 0 8px;
    line-height: 32px;
    cursor: pointer;
    span:first-child{
      float: left;
    }
    span:last-child{
      float: right;
      line-height: 32px;
    }
  }
  .systemBox{
    width: 800px;
    height: 48px;
    border-radius: 2px;
    padding: 8px 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    &>div:first-child{
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .listCon{
      margin-left: 5px;
    }
    & > .iconBox{
      float: left;
      margin-right: 8px;
      width: 32px;
      height: 32px;
      border-radius: 2px;
      background: rgba(64, 158, 255, 0.1);
      text-align: center;
      line-height: 32px;
    }

    div{
      div{
        color: #777;
      }
    }
    &:hover{
      background: rgba(64,158,255,0.06);
      .catalogName{
        color: #409EFF;
      }
    }
  }
  .pagination-part{
    position: absolute;
    bottom: 0;
    z-index: 99;
    width: 100%;
    background: #ffffff;
    padding: 10px 0;
    padding-left: 225px;
    margin-left: -25px;
  }
  .shadowTop{
    box-shadow:  0 5px 8px -8px rgba(0, 0, 0, 0.2);
    margin-left: -25px;
    padding-left: 25px
  }
  .borderTop{
    border-top: 1px solid #ddd;
  }
  .shadowBto{
    box-shadow:  0 -5px 8px -8px rgba(0, 0, 0, 0.2);

    /*padding-left: 0px*/
  }
  .searchRecommended{
    width: 628px;
    height: 200px;
    line-height: 32px;
    background: #fff;
    box-shadow: 0px 2px 4px 0px rgba(85,85,85,0.2);
    border-radius: 0px 0px 4px 4px;
    border: 1px solid #409EFF;
    border-top: 0;
    position: absolute;
    top: 40px;
    left: 0;
  }
  .noData{
    width: 800px;
    text-align: center;
    margin-top: 100px;
    p{
      margin-top: 10px;
    }
  }
  .tree-icon{
    margin: 0;
  }
</style>
<style lang="scss">
  .inputBox{
    display: flex;
    margin: 0 auto;
    width: 545px;
    position: relative;
    .datablau-input .el-input__inner{
      width: 480px;
      height: 40px;
      border: 1px solid #409EFF;
      line-height: 40px;
      border-radius: 2px 0 0 2px;
      &:hover{
        height: 40px;
        border: 2px solid #409EFF;
      }
    }
    .is-block{
      height: 40px;
      line-height: 40px;
      border-radius: 0 2px 2px 0;
    }
  }
  .stickyBox .inputBox{
    width:800px;
    .datablau-input .el-input__inner{
      width: 726px;
    }
  }
</style>
