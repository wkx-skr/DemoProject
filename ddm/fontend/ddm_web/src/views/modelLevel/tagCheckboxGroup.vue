<template>
  <div>
    <span class="form-label" style="margin-left:.2em;">{{$store.state.$v.modelList.filterTag}}</span>
    <el-checkbox-group @change="handleSelectionChange" style="display:inline-block;" v-model="selection">
      <el-checkbox
        class="small"
        v-for="t in allTags"
        :label="t.id"
        :key="t.id"
      >{{t.name}}</el-checkbox>
    </el-checkbox-group>
  </div>
</template>
<script>
import HTTP from '@/resource/http'
export default {
  data () {
    return {
      selection: [],
      allTags: []
    }
  },
  mounted () {
    this.getTags()
  },
  methods: {
    getTags () {
      HTTP.getTags({
        successCallback: data => {
          this.allTags = data
        }
      })
    },
    handleSelectionChange () {
      let result = []
      let tagMap = new Map()
      this.allTags.forEach(item => {
        tagMap.set(item.id, item)
      })
      this.selection.forEach(item => {
        result.push(tagMap.get(item))
      })
      this.$emit('selected', result)
    }
  }
}
</script>
<style scoped="scoped">
  .form-label {
    margin-left:1em;
    margin-right: .5em;
  }
</style>
