<template>
  <div style="padding: 0 40px">
    <span v-show="showNone">该表没有任何表关系或血缘关系</span>
    <div class="row-box" v-if="hasFk">
      <div>表关系</div>
      <contentBox
        v-for="item in data.relatedTableByFk"
        :key="item.id"
        :content="item"
      ></contentBox>
    </div>
    <div class="row-box" v-if="hasLi">
      <div>血缘关系</div>
      <contentBox
        v-for="item in data.relatedTableByLineage"
        :key="item.id"
        :content="item"
      ></contentBox>
    </div>
  </div>
</template>

<script>
import contentBox from './contentBox.vue'
export default {
  components: {
    contentBox,
  },
  props: ['objectId'],
  data() {
    return {
      prevObjectId: undefined,
      data: undefined,
      showNone: false,
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      const self = this
      self.data = null
      this.$http
        .get(this.$meta_url + '/entities/' + self.objectId + '/relationships')
        .then(res => {
          self.data = res.data
          if (!res.data.relatedTableByFk && !res.data.relatedTableByLineage) {
            this.showNone = true
          }
        })
        .catch(err => {})
    },
    getGraph(data) {
      const self = this

      var tableSelf = {
        id: self.objectId,
        name: self.$parent.data.tableData.physicalName,
        columns: [],
        columnsObj: {},
      }
      var result = {
        lines: [],
        steps: {},
      }

      data.relatedTableByFk.forEach(item => {
        const step = {
          id: item.objectId,
          name: item.physicalName,
          columns: [],
        }
        item.relationships.forEach(sub_item => {
          let columnRow = ''
          const source = JSON.parse(sub_item.source)
          const target = JSON.parse(sub_item.target)

          if (sub_item.sourceParent) {
            columnRow = sub_item.source
            for (var source_key in source) {
              for (var target_key in target) {
                result.lines.push({
                  sourceStepId: step.id,
                  source: source[source_key].Id,
                  targetStepId: self.objectId,
                  target: target[source_key].Id,
                })
              }
            }
            for (const i in target) {
              tableSelf.columnsObj[i] = {
                id: target[i].Id,
                name: i,
              }
            }
          } else {
            columnRow = sub_item.target
            for (var source_key in source) {
              for (var target_key in target) {
                result.lines.push({
                  sourceStepId: self.objectId,
                  source: source[source_key].Id,
                  targetStepId: step.id,
                  target: target[source_key].Id,
                })
              }
            }
            for (const i in source) {
              tableSelf.columnsObj[i] = {
                id: source[i].Id,
                name: i,
              }
            }
          }
          const columnObj = JSON.parse(columnRow)
          for (var key in columnObj) {
            step.columns.push({
              id: columnObj[key].Id,
              name: key,
            })
          }
        })
        result.steps[step.id] = step
      })
      result.steps[tableSelf.id] = tableSelf
      for (const i in result.steps[tableSelf.id].columnsObj) {
        result.steps[tableSelf.id].columns.push(
          result.steps[tableSelf.id].columnsObj[i]
        )
      }

      this.handleData(result)
    },
    handleData(data) {},
    sortByName(a, b) {
      return a.name > b.name ? -1 : 1
    },
  },
  computed: {
    hasFk() {
      return !!(
        this.data &&
        this.data.relatedTableByFk &&
        Array.isArray(this.data.relatedTableByFk) &&
        this.data.relatedTableByFk.length > 0
      )
    },
    hasLi() {
      return !!(
        this.data &&
        this.data.relatedTableByLineage &&
        Array.isArray(this.data.relatedTableByLineage) &&
        this.data.relatedTableByLineage.length > 0
      )
    },
    relatedTableByFkSorted() {
      return data.relatedTableByFk.sort(this.sortByName)
    },
    relatedTableByLineage() {
      return data.relatedTableByLineage.sort(this.sortByName)
    },
  },
}
</script>

<style scoped lang="scss">
.row-box {
  margin: 20px 0;
}
</style>
