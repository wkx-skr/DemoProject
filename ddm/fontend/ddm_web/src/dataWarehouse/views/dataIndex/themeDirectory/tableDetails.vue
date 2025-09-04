<template>
  <div style="padding: 0 20px" class="alltheme">
    <div class="row-header">
      <datablau-breadcrumb
        @back="back"
        :node-data="nodeData"
        separator="/"
      ></datablau-breadcrumb>
    </div>
    <div
      style="
        padding: 10px 20px;
        position: absolute;
        top: 50px;
        left: 0;
        right: 0;
        bottom: 0;
      "
    >
      <datablau-form
        class="page-form multiple-column"
        inline
        label-position="right"
        label-width="7em"
        :rules="formRules"
        ref="form"
        :model="formData"
      >
        <el-form-item :label="$t('indicator.subject.name')" prop="name">
          <datablau-input
            maxlength="200"
            v-model="formData.name"
            :disabled="true"
          ></datablau-input>
        </el-form-item>
        <el-form-item :label="$t('system.systemSetting.dir')" prop="categorys">
          <datablau-cascader
            clearable
            v-model="formData.categorys"
            :options="options"
            filterable
            :props="{ checkStrictly: true }"
            @change="categoryChange"
            style="margin-top: -5px"
            ref="cascader"
            :disabled="true"
          ></datablau-cascader>
        </el-form-item>
        <el-form-item :label="$t('assets.udp.modelMart')" prop="system">
          <datablau-input
            maxlength="200"
            v-model="formData.system"
            :disabled="true"
          ></datablau-input>
        </el-form-item>
        <el-form-item :label="$t('meta.DS.tableDetail.lineage.dataTable')" prop="tableName">
          <datablau-input
            maxlength="200"
            v-model="formData.tableName"
            :disabled="true"
          ></datablau-input>
        </el-form-item>
        <!-- <el-form-item label="数据源" prop="technicalLeader">
            <datablau-input
              maxlength="200"
              v-model="formData.technicalLeader"
              :disabled="true"
            ></datablau-input>
          </el-form-item> -->
      </datablau-form>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.row-header {
  padding: 10px 0 8px;
  border-bottom: 1px solid $border-color;
}
.part-title {
  border-left: 4px solid $primary-color;
  margin-bottom: 12px;
  margin-top: 10px;
  padding-left: 6px;
  color: $text-default;
  font-size: 14px;
}
.el-dialog .el-form-item {
  margin-bottom: 20px;
}
</style>
<style lang="scss">
.alltheme .el-input__inner {
  border: none;
}
.multiple-column {
  .el-form-item {
    min-width: 532px;
    font-size: 12px;
    &:nth-of-type(odd) {
      margin-right: 100px;
      /*outline: 1px solid indianred;*/
    }
    margin-right: 100px;
  }
  .el-form-item__error {
    padding-top: 0;
  }
  .auto {
    .el-form-item__label {
      width: auto !important;
    }
  }
}
.alltheme .el-form-item {
  margin-bottom: 20px;
}
</style>

<script>
import HTTP from '@/resource/http.js'
export default {
  props: {
    iscreate: {
      type: Boolean,
      required: false
    },
    id: {
      type: Number,
      required: false
    },
    categoryId: {
      type: Number,
      required: false
    }
  },
  data () {
    return {
      type: 82800027,
      nodeData: [
        {
          name: this.$t('common.page.themeDirectory'),
          couldClick: false
        },
        {
          name: '',
          couldClick: false
        }
      ],
      formData: {},
      formRules: {},
      // 目录
      options: [],
      categoryArr: []
    }
  },
  beforeMount () {},
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.getTreeData()
      if (this.id) {
        this.getTreeList()
        setTimeout(() => {
          this.getFormData()
        }, 200)
      } else {
        if (this.categoryId && this.categoryId != null) {
          this.getTreeList()
          setTimeout(() => {
            let categorys = this.sortCategory(this.categoryId).splice(1)
            this.$set(this.formData, 'categorys', categorys)
            // console.log(this.formData.categorys,'this.formData.categorys')
          }, 400)
        }
      }
    },
    back () {
      this.$emit('back')
    },
    // 筛选目录
    sortCategory (id) {
      this.categoryArr.unshift(id)
      console.log(this.treeList, 'terr')
      if (Array.isArray(this.treeList)) {
        let c = this.treeList.filter(item => item.categoryId === id)[0]
        if (c.parentId) {
          console.log(c.parentId, 'c.parentId')
          this.sortCategory(c.parentId)
        }
      }
      return this.categoryArr
    },
    // 获取详情
    getFormData () {
      let url = `${HTTP.$domains}querytheme/get?id=${this.id}`
      this.$http
        .post(url)
        .then(res => {
          this.formData = res.data
          this.nodeData = [
            {
              name: this.$t('common.page.themeDirectory'),
              couldClick: false
            },
            {
              name: this.formData.name,
              couldClick: false
            }
          ]
          this.hierarchyTable = _.cloneDeep(res.data.hierarchy)
          if (this.formData.hierarchy === null) {
            this.formData.hierarchy = []
            this.hierarchyTable = []
          }
          this.formData.categorys = this.sortCategory(
            res.data.categoryId
          ).splice(1)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 提交
    categoryChange (val) {
      console.log(val, 'val')
    },
    treeSort (root) {
      let t = root.subNodes
      if (t) {
        t.forEach(item => {
          item.value = item.id
          item.label = item.name
          if (item.subNodes) {
            item.children = item.subNodes
            this.treeSort(item)
          }
        })
      }
      return t
    },
    // 获取目录树
    getTreeData () {
      let url = `${HTTP.$domains}categories/tree?type=${this.type}`
      this.$http
        .post(url)
        .then(res => {
          this.options = this.treeSort(res.data.subNodes[0])
          console.log(this.options, 'this.options')
        })
        .catch(e => {
          this.$showFailure(e)
        })
      // setTimeout(() => {
      //   this.treeData = this.TREE_DATA
      // }, 1000)
    },
    // 获取目录列表
    getTreeList () {
      let url = `${HTTP.$domains}categories/get?type=${this.type}`
      this.$http
        .post(url)
        .then(res => {
          this.treeList = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    }
  },
  computed: {}
}
</script>
