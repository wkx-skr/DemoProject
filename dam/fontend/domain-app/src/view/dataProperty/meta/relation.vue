<template>
  <div id="relation-container" :objectId="objectId" v-loading="loading">
    <!-- <span
      v-show="showNone"
      style="color: #909399; margin-bottom: 1em; display: inline-block"
    >
      {{ $version.dataCatalog.tableDetail.noPhysicalRelation }}
    </span> -->
    <div class="noresult" v-show="showNone && !isLogical" style="height: 200px">
      <div class="noresult-img">
        <img src="static/kgimg/noresult.svg" alt="" />
        <p>
          {{ $t('meta.DS.tableDetail.relationMessage.noPhysicalRelation') }}
        </p>
      </div>
    </div>
    <div class="row-box" v-if="hasFk && !isLogical">
      <!-- <div style="margin-bottom: 1em">物理关联</div> -->
      <relation-graph
        v-if="data && data.relatedTableByFk"
        :rawData="data.relatedTableByFk"
        :tableName="tableName"
      ></relation-graph>
    </div>
    <div class="fieldMessage-title">
      <p class="message-title">
        {{ $t('meta.DS.tableDetail.relationMessage.logicalRelation') }}
      </p>
    </div>
    <logical-relation
      :object-id="objectId"
      :table-name="tableName"
    ></logical-relation>
  </div>
</template>

<script>
import contentBox from './contentBox.vue'
import DrawGraph from './DrawGraph.js'
import relationGraph from './relationGraph.vue'
import logicalRelation from './logicalRelation.vue'
export default {
  components: {
    contentBox,
    relationGraph,
    logicalRelation,
  },
  props: ['objectId', 'tableName', 'isLogical'],
  data() {
    return {
      prevObjectId: undefined,
      data: undefined,
      showNone: false,
      loading: true,
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout)
  },
  mounted() {
    this.timeout = setTimeout(() => {
      this.getData()
    }, 0)
  },
  methods: {
    getData() {
      const self = this
      self.data = null
      if (!this.objectId) {
        return
      }
      this.$http
        .get(
          this.$url + '/service/entities/' + self.objectId + '/relationships'
        )
        .then(function (res) {
          if (res.status === 200) {
            self.data = res.data
            if (
              !res.data.relatedTableByFk ||
              res.data.relatedTableByFk.length ===
                0 /* && !res.data.relatedTableByLineage */
            ) {
              self.showNone = true
            }
            self.loading = false
            //						self.getGraph(self.data);
          }
        })
        .catch(function (err) {})
        .then(() => {
          this.$emit('loaded')
        })
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
    handleData(data) {
      new DrawGraph($('#consa-graph')[0], data).start()
    },
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
  overflow: auto;
}
.graph-outer {
  padding: 20px;
  //background:#FFF;
  background-color: var(--default-bgc);
  width: 100%;
  position: relative;
  max-height: 400px;
}
#consa-graph {
  position: absolute;
  bottom: 20px;
  top: 50px;
  left: 20px;
  right: 20px;
  overflow: auto;
}
.message-title {
  display: inline-block;
  // padding: 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: #555555;
  position: relative;
  padding-left: 10px;
  &:before {
    position: absolute;
    content: '';
    left: 0;
    top: 4px;
    width: 4px;
    height: 14px;
    background: #409eff;
    border-radius: 1px;
  }
}
</style>
