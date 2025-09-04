<template>
  <div style="width: calc(100% - 160px); margin-top: 0">
    <el-tooltip
      v-if="ownship.length"
      :content="ownship"
      :open-delay="200"
      placement="top"
    >
      <el-tag
        size="small"
        style="
          margin-right: 10px;
          display: inline-block;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 5px;
          float: left;
        "
      >
        {{ ownship }}
      </el-tag>
    </el-tooltip>
    <el-button
      v-if="editable"
      @click="editOwnship"
      type="text"
      icon="iconfont icon-bianji"
      style="color: #999; font-size: 20px; padding: 0; float: left"
    ></el-button>
  </div>
</template>
<script>
export default {
  props: {
    editable: {
      default: true,
    },
    ownship: {
      type: String,
      default: '',
    },
    typeIds: {
      type: String,
      default: '',
    },
  },
  data() {
    return {}
  },
  mounted() {},
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    },
  },
  methods: {
    // 添加
    editOwnship() {
      this.$utils.branchSelect.open().then(res => {
        // console.log(res)
        this.$emit('saveOwnship', res)
      })
    },
  },
}
</script>
<style></style>
