<template>
  <div>
    <div class="contentBox">
      <el-row class="helpDocContent">
        <el-col id="doc-menu-con">
          <el-menu
            :default-active="pageNo"
            class="el-menu-vertical-demo"
            @open="handleOpen"
            @close="handleClose"
            @select="goToDoc"
            background-color="#fff"
            text-color="#545c64"
            active-text-color="#3f829cda"
            unique-opened
          >
            <el-submenu
              v-for="item in dealedContents"
              :key="item.id"
              :index="item.index"
            >
              <template slot="title">
                <span>快速上手</span>
              </template>
              <el-menu-item
                v-for="item_2 in item.children"
                :index="item_2.indexText"
                :key="item_2.id"
              >
                {{ item_2.index }}. {{ item_2.text }}
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-col>
      </el-row>
    </div>
    <div class="docContainer">
      <router-view
        class="help-page-container"
        :page="pageNo"
        :content="content"
        :dealedContents="dealedContents"
        :contentMap="contentMap"
        @gotoPage="goToDoc"
      ></router-view>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      pageNo: 'pageDoc1_1',
      domData: '',
      contentsText: [
        // 从word粘贴的目录
        '快速上手',
        '1.	访问地址',
        '2.	角色分类',
        '系统管理员',
        '1.	操作流程图',
        '2.	系统名录管理',
        '3.	角色管理',
        '4.	用户管理',
        '5.	系统设置',
        '6.	Dashboards数据扫描任务',
        '数据库管理员（DBA）',
        '1.	操作流程图',
        '2.	数据源管理',
        '3.	技术质量规则',
        '4.	检查任务',
        '5.	修复任务',
        '6.	模型差异比较任务',
        '7.	数据源更新扫描任务',
        '普通用户',
        '1.	操作流程图',
        '2.	生产模型',
        '3.	开发模型',
        '4.	模型差异比较任务',
        '5.	查看数据标准',
        '6.	查看数据质量修复任务',
        '数据标准管理员',
        '1.	标准管理',
        '2.	代码管理',
        '数据血缘管理员',
        '1.	地图概览',
        '2.	数据地图',
        '数据质量管理员',
        '1.	业务质量规则',
        '附录教程',
        '1.	Groovy使用实例',
        '2.	参数相关的操作',
      ],
      dealedContents: [], // 处理过后的目录
      content: [], // 一级目录的id,
      // contents2id: [],
      contentMap: {},
    }
  },

  components: {},

  computed: {},

  mounted() {
    this.dealContents()
    setTimeout(() => {
      Ps.initialize($('#doc-menu-con')[0])
      Ps.initialize($('.docContainer')[0])
    }, 50)
    this.getPageNo(this.$route.query)
  },

  watch: {
    $route(to) {
      if (!to.query.page) {
        this.getPageNo(this.$route.query)
      }
    },
  },

  methods: {
    dealContents() {
      const arr = []
      let lastParent = {}
      this.contentsText.forEach((item, index) => {
        const obj = {
          id: index - 0 + 1, // 目录组成的数组，索引加一
          level: item.indexOf('.') > -1 ? 2 : 1,
        }
        if (obj.level == 1) {
          this.content.push(obj.id)
          obj.text = _.trim(item)
          lastParent = obj
          obj.children = []
          arr.push(obj)
          obj.index = arr.length + ''
        } else {
          item = item.slice(2)
          obj.parentCon = lastParent
          obj.text = _.trim(item)
          lastParent.children.push(obj)
          obj.index = lastParent.children.length
          obj.indexText =
            'pageDoc' + lastParent.index + '_' + lastParent.children.length
          this.contentMap[obj.indexText] = index
        }
      })
      this.dealedContents = arr
    },
    handleOpen(key, keyPath) {
      this.contentUpdata()
    },
    handleClose(key, keyPath) {
      this.contentUpdata()
    },
    goToDoc(index, indexPath) {
      index = index || ''
      if (index.indexOf('_') > -1) {
        this.$router.push({
          name: 'helpDocPage',
          query: {
            page: index,
          },
        })
        this.pageNo = index
        this.pageUpdata()
      }
    },
    contentUpdata() {
      setTimeout(() => {
        Ps.update($('#doc-menu-con')[0])
      }, 50)
    },
    pageUpdata() {
      setTimeout(() => {
        Ps.update($('.docContainer')[0])
        $('.docContainer').scrollTop(0)
      }, 50)
    },
    getPageNo(query) {
      if (query && query.page) {
        this.pageNo = query.page
      } else {
        this.goToDoc('pageDoc1_1')
      }
    },
  },
}
</script>

<style lang="scss" scoped>
$contentWidth: 230px;
.contentBox {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: $contentWidth;
  background-color: #fff;
  overflow: hidden;
  .helpDocContent {
    position: absolute;
    top: 0;
    left: 0;
    width: $contentWidth;
    height: 100%;
    #doc-menu-con {
      position: absolute;
      top: 0;
      left: 0;
      width: $contentWidth;
      height: 100%;
      .el-menu-item.is-active {
        background-color: #ccc !important;
      }
    }
  }
}
.docContainer {
  position: absolute;
  left: $contentWidth;
  top: 0;
  bottom: 0;
  right: 0;
  background-color: #fff;
  // padding-left: 20px;
  // overflow: auto;
  overflow: hidden;
  // border: 1px solid #aaa;
}
</style>
