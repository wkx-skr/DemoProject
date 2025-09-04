<template>
  <div>
    <div class="tags">
      <el-tooltip
        v-for="t in tages"
        :key="t.id"
        :content="t.departmentName"
        :open-delay="200"
        placement="top"
      >
        <el-tag
          size="small"
          :closable="closable"
          @close="handleClose(t)"
          style="margin-right: 10px"
        >
          <span
            class="tagText"
            :style="{ 'max-width': closable ? '90%' : '100%' }"
          >
            {{ t.departmentName }}
          </span>
        </el-tag>
      </el-tooltip>
      <el-button
        v-if="closable"
        @click="beforeAddTag"
        type="text"
        icon="iconfont icon-bianji"
        style="
          height: 34px;
          color: #999;
          font-size: 20px;
          line-height: 34px;
          padding: 0;
        "
      ></el-button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    isEdit: {
      default: true,
    },
    typeIds: {
      type: String,
      default: '',
    },
    inSystem: {
      type: Boolean,
      default: false,
    },
    currentObjectId: {
      type: Number,
    },
  },
  data() {
    return {
      id: '',
      type: '',
      tages: [],
      arr: {},
      dialogVisible: false,
      //  defaultProps:{
      //     children: 'children',
      //     label: 'fullName'
      //  },
      filterText: '',
      arrs: [],
    }
  },
  mounted() {
    this.arr = JSON.parse(localStorage.getItem('summary'))
    this.id = this.currentObjectId || this.$route.query.objectId
    if (this.typeIds) {
      this.type = this.typeIds
    } else {
      this.type = this.arr.properties.TypeId
    }
    this.type = this.typeIds
    this.getList()
  },

  computed: {
    closable() {
      return (
        ((this.typeIds === '82800002' && this.$auth.METADATA_REPORT_MODIFY) ||
          (this.typeIds !== '82800002' &&
            (this.$auth.METADATA_EDIT ||
              (this.inSystem && this.$auth.METADATA_EDIT_CURRENT_SYSTEM)))) &&
        !this.$route.query.isAssets
      )
    },
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    },
    typeIds(val) {
      if(val) {
        this.type = this.typeIds
        this.getList()
      }
    }
  },
  methods: {
    getList() {
      const requestUrl =
        this.$meta_url + `/service/dataDepartment/${this.id}/${this.type}`
      this.$http.get(requestUrl).then(res => {
        this.tages = res.data
      })
    },
    renderContent(h, { node, data, store }) {
      if (data.bm === '@ROOT') {
        return (
          <span style="width: 88%;position:relative;">
            <span class="icon-i-folder">
              <span class="path1"></span>
              <span class="path2"></span>
            </span>
            <span>
              {node.label.indexOf('/') != -1
                ? node.label.split('/')[1]
                : node.label}
            </span>
            <span class="three-point" style="position: absolute;right: 5px;">
              <el-dropdown
                trigger="hover"
                style="float:right;margin-right:5px"
                size="mini"
                on-command={command => this.commandHandle(command, data)}
              >
                <el-dropdown-menu></el-dropdown-menu>
              </el-dropdown>
            </span>
          </span>
        )
      } else {
        return (
          <span style="width: 88%;position:relative;">
            <span class="icon-i-user">
              <span class="path1" style="margin-right:0px;"></span>
              <span class="path2"></span>
            </span>
            &nbsp;
            <span>
              {node.label.indexOf('/') != -1
                ? node.label.split('/')[1]
                : node.label}
            </span>
            <span class="three-point" style="position: absolute;right: 5px;">
              <el-dropdown
                trigger="hover"
                style="float:right;margin-right:5px"
                size="mini"
                on-command={command => this.commandHandle(command, data)}
              >
                <el-dropdown-menu></el-dropdown-menu>
              </el-dropdown>
            </span>
          </span>
        )
      }
    },
    // 添加
    beforeAddTag() {
      this.$utils.branchSelect.open(true).then(res => {
        const arrID = this.tages.map(e => e.departmentId)
        const requestUrl = this.$meta_url + '/dataDepartment/saves'
        let requestBody = []
        if (res.length) {
          res.forEach(re => {
            const obj = {
              dataId: this.id,
              dataType: this.type,
              departmentId: re.id,
              departmentName: re.fullName,
            }
            if (arrID.indexOf(re.id) === -1) {
              requestBody.push(obj)
            }
          })
        }
        this.$http.post(requestUrl, requestBody).then(res => {
          this.getList()
        })
      })
    },
    // 删除
    handleClose(tag) {
      const requestUrl =
        this.$meta_url + `/service/dataDepartment/del/${tag.id}`
      const requestBody = {
        id: tag.id,
      }
      this.$http.post(requestUrl).then(res => {
        this.getList()
      })
    },
    // //机构搜索
    // filterNode(value, data) {
    //     if (!value) return true
    //     return (data.fullName && data.fullName.indexOf(value) !== -1) || (data.bm && data.bm.indexOf(value) !== -1);
    // },
    // //选中取值
    // handleNodeClick(data) {
    //   this.arrs = data;
    // },
  },
}
</script>
<style lang="scss" scoped>
.tags {
  span {
    max-width: 100%;
    .tagText {
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: bottom;
    }
  }
  i {
    vertical-align: text-bottom;
  }
  ::v-deep .icon-bianji {
    &:hover {
      color: #409eff;
    }
  }
}
</style>
