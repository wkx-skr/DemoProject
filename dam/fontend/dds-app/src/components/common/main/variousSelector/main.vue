<template>
  <div>
    <el-dialog
      :title="$version.tag.tagSelect"
      :visible.sync="dialogVisible"
      width="900px"
      append-to-body
      @close="closeDialog"
    >
      <tag-selector
        :key="selectorKey"
        :tagIds="tagIds"
        @closeDialog="closeDialog"
        :single="single"
        :security="security"
      ></tag-selector>
    </el-dialog>
  </div>
</template>
<script>
import TagSelector from './TagSelectorVersion2.vue'
export default {
  components: {
    TagSelector,
  },
  data() {
    return {
      dialogVisible: false,
      type: 'tag',
      selectorKey: 0,
      tagIds: [],
      single: false,
      security: true,
    }
  },
  mounted() {
    this.$bus.$on(
      'callSelectorDialog',
      ({ type = 'tag', tagIds = [], single, security }) => {
        this.selectorKey++
        this.dialogVisible = true
        if (tagIds) {
          this.tagIds = tagIds
        } else {
          this.tagIds = []
        }
        this.type = 'tag'
        this.single = single
        this.security = security
      }
    )
    // this.$bus.$on('shutSelectorDialog',()=>{
    //   this.selectorKey++;
    // });
  },
  methods: {
    closeDialog() {
      this.dialogVisible = false
      this.$bus.$emit('tagSelected', {})
    },
  },
  beforeDestroy() {
    this.$bus.$off('callSelectorDialog')
    this.$bus.$off('shutSelectorDialog')
  },
}
</script>
