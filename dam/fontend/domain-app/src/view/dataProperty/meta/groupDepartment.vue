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
          :closable="
            ($auth['METADATA_REPORT_MODIFY'] ||
              (inSystem && $auth['METADATA_EDIT_CURRENT_SYSTEM'])) &&
            !Boolean($route.query.isAssets)
          "
          @close="handleClose(t)"
          style="margin-right: 10px"
        >
          {{ t.departmentName }}
        </el-tag>
      </el-tooltip>
      <el-button
        v-if="
          ($auth['METADATA_REPORT_MODIFY'] ||
            (inSystem && $auth['METADATA_EDIT_CURRENT_SYSTEM'])) &&
          !Boolean($route.query.isAssets)
        "
        @click="beforeAddTag"
        type="text"
        icon="el-icon-edit-outline"
        style="
          height: 34px;
          color: #a6abb7;
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
      treeDatas: [],
      //  defaultProps:{
      //     children: 'children',
      //     label: 'fullName'
      //  },
      filterText: '',
      arrs: [],
    }
  },
  beforeMount() {
    this.treeData()
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
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    },
  },
  methods: {
    getList() {
      const requestUrl =
        this.$url + `/service/dataDepartment/${this.id}/${this.type}`
      this.$http.get(requestUrl).then(res => {
        this.tages = res.data
      })
    },
    // 机构列表数据
    treeData() {
      this.$http
        .post(`/user/org/organization/tree/`, {
          keyword: '',
        })
        .then(res => {
          const data = res.data
          this.treeDatas = [data]
          // localStorage.setItem('treeDatas',JSON.stringify(this.treeDatas));
        })
        .catch(e => {
          this.$showFailure(e)
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
      this.$utils.branchSelect.open().then(res => {
        const arrID = this.tages.map(e => e.departmentId) // selectedUsersAll是进来页面时获取到的所有成员的完整信息数组，你后面加分页也需要这个变量，你自己去定义和获取吧，
        const arr = []
        const bodys = []

        if (arrID.indexOf(res.id) === -1) {
          const requestUrl = this.$url + '/service/dataDepartment/save'
          const requestBody = {
            dataId: this.id,
            dataType: this.type,
            departmentId: res.id,
            departmentName: res.fullName,
          }
          this.$http.post(requestUrl, requestBody).then(res => {
            this.getList()
          })
        } else {
          this.$message.error(this.$t('meta.DS.message.doNotAddDuplicate'))
        }
      })
    },
    // 删除
    handleClose(tag) {
      const requestUrl = this.$url + `/service/dataDepartment/del/${tag.id}`
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
<style></style>
