<template>
  <div  class="component-container">
    <div
      class="tree-area"
    >
      <left-tree
        ref="leftTree"
        @chooseCategory="chooseCategory"
        @themeCreate="themeCreate"
        @editTheme="editTheme"
        @setCategoryData="setCategoryData"
        @getDisplayPath="getDisplayPath"
      ></left-tree>
    </div>
    <div class="resize-column-middle model-library-middle"></div>
    <div
      class="right-table"
    >
      <div
        class="list-container"
        v-if="currentCategory"
      >
        <right-list :currentCategory="currentCategory"
        :allDepartmentMap="allDepartmentMap"
        ref="rightList"
        @openDetail="openDetail"
        @openViewDetail="openViewDetail"
        @setUdps="setUdps"
        @getTree="getTree"
        :categoryLevel="currentCategoryNode.level"></right-list>
      </div>
    </div>
    <add-detail @serachList="serachList" :udps="udps" :titlePath="titlePath" :titlePathId="titlePathId" :detailObj="detailObj" v-if="type === 'add' || type === 'edit'" @openDetail="openDetail"></add-detail>
    <view-detail v-if="type === 'view' && Object.keys(allDepartmentMap).length" :udps="udps" :viewDetailObj="viewDetailObj" :allDepartmentMap="allDepartmentMap" @openViewDetail="openViewDetail"></view-detail>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import leftTree from './leftTree.vue'
import rightList from './list.vue'
import addDetail from './addDetail.vue'
import viewDetail from './viewDetail.vue'

export default {
  name: 'applyPhysicalModel',
  data () {
    return {
      currentCategory: null,
      currentCategoryNode: null,
      titlePath: null,
      type: null,
      titlePathId: null,
      detailObj: null,
      viewDetailObj: null,
      udps: null,
      allDepartmentMap: {}
    }
  },
  components: {
    leftTree,
    rightList,
    addDetail,
    viewDetail
  },
  computed: {},
  mounted () {
    this.dataInit()
    this.getOrgList()
  },
  methods: {
    // 获取所有的机构，并将返回的树形数据 转换成 数组
    getOrgList () {
      this.$http
        .get('/user/org/organization/tree/')
        .then(res => {
          this.allDepartmentList = this.flatten([res.data])
          this.allDepartmentList.forEach(item => {
            this.allDepartmentMap[item.bm] = item
          })
        })
    },
    // 将嵌套数据 拍平成 数组
    flatten (sourceArray, flattenedArray = []) {
      for (const element of sourceArray) {
        if (Array.isArray(element.children) && element.children.length > 0) {
          flattenedArray.push({
            ...element,
            children: []
          })
          this.flatten(element.children, flattenedArray)
        } else {
          flattenedArray.push(element)
        }
      }
      return flattenedArray
    },
    getTree () {
      this.$refs.leftTree.dataInit()
    },
    serachList () {
      this.$refs.leftTree.getNodeClick()
    },
    setUdps (data) {
      this.udps = data
    },
    openDetail (type, data) {
      this.type = type
      if (type === 'edit') {
        this.detailObj = data
      } else {
        this.detailObj = null
      }
    },
    openViewDetail (type, data) {
      if (!type && this.$route.query && this.$route.query.name) {
        this.$refs.rightList.getSystemsList()
        this.$route.query.name = ''
      }
      this.type = type
      this.viewDetailObj = data
    },
    getDisplayPath (data, id) {
      this.titlePath = data
      this.titlePathId = id
    },
    dataInit () {
    },
    chooseCategory (data, node) {
      this.currentCategory = data
      this.currentCategoryNode = node
      this.$nextTick(() => {
        this.$refs.rightList.getSystemsList()
      })
    },
    themeCreate () {

    },
    editTheme () {

    },
    setCategoryData () {}
  },
  watch: {}
}
</script>

<style lang="scss" scoped>
$leftWidth: 240px;
@mixin absPos() {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.component-container {
  @include absPos();
  //border: 1px solid red;

  .tree-area {
    padding: 0px;
    width: $leftWidth;
    overflow: hidden;
  }

  .right-table {
    @include absPos();
    left: $leftWidth;

    .business-obj-list-container {
      @include absPos();
      //top: 60px;
    }

  }

  .business-object-detail {
    @include absPos();
    background-color: #fff;
    z-index: 4;
  }
}

</style>

<style lang="scss">
.theme-create-form {
  .content-inner {
    margin-top: 0;

    .el-form.db-form .el-form-item {
      //margin-bottom: 10px;
    }
  }

  .inline-item {
    .el-form-item {
      display: inline-block;

      .code-item {
        .el-form-item__content {
        }
      }

      .order {
        float: right;

        .el-input-number {
          width: 100px;
        }
      }

    }

  }
}
</style>
