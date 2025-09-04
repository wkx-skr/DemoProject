<template>
  <div>
    <div class="tags">
      <el-tooltip
        v-for="t in tages"
        :key="t.id"
        :content="t.firstName"
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
          {{ t.firstName }}
        </el-tag>
      </el-tooltip>
      <el-button
        @click="beforeAddTag"
        type="text"
        icon="iconfont icon-bianji"
        v-if="
          ($auth['METADATA_REPORT_MODIFY'] ||
            (inSystem && $auth['METADATA_EDIT_CURRENT_SYSTEM'])) &&
          !Boolean($route.query.isAssets)
        "
        size="mini"
        style="
          height: 34px;
          color: #a6abb7;
          font-size: 20px;
          line-height: 18px;
          padding: 0;
        "
      ></el-button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
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
    }
  },
  watch: {
    typeIds(val) {
      if (val) {
        this.type = val
        this.getList()
      }
    },
  },
  mounted() {
    this.id =
      this.currentObjectId || this.$route.query.objectId || this.$route.query.id
    this.type = this.typeIds
    if (this.type) {
      // 报表部分页面过来的直接调取，数据集过来的需要watch监听
      this.getList()
    }
  },
  methods: {
    getList() {
      const requestUrl =
        this.$url + `/service/dataManager/${this.id}/${this.type}`
      this.$http.get(requestUrl).then(res => {
        this.tages = res.data
      })
    },
    // 添加
    beforeAddTag() {
      this.$utils.staffSelect.open().then(data => {
        const arrUsername = this.tages.map(e => e.username) // selectedUsersAll是进来页面时获取到的所有成员的完整信息数组，你后面加分页也需要这个变量，你自己去定义和获取吧，
        const arr = []
        const bodys = []
        data.forEach(e => {
          // 判断如果不存在才算新成员
          if (arrUsername.indexOf(e.username) === -1) {
            arr.push(e)
          }
        })
        // console.log(arr);
        for (var i = 0; i < arr.length; i++) {
          var obj = {
            dataType: this.type,
            dataId: this.id,
            username: arr[i].username,
            firstName: arr[i].fullUserName,
          }
          bodys.push(obj)
        }

        if (bodys.length > 0) {
          const requestUrl = this.$url + '/service/dataManager/saves'
          this.$http.post(requestUrl, bodys).then(res => {
            this.getList()
          })
        } else {
          this.$message.error(this.$t('meta.DS.message.doNotsubmitDuplicate'))
        }
      })
    },
    // 删除
    handleClose(tag) {
      const requestUrl = this.$url + `/service/dataManager/del/${tag.id}`
      const requestBody = {
        id: tag.id,
      }
      this.$http.post(requestUrl).then(res => {
        this.getList()
      })
    },
  },
}
</script>
<style></style>
