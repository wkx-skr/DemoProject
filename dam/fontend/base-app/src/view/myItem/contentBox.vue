<template>
  <div class="contentBox">
    <el-tooltip :content="content.physicalName" placement="top">
      <div class="physicalName">{{ content.physicalName }}</div>
    </el-tooltip>

    <!--<div class="logicalName">{{content.logicalName}}</div>-->
    <!--<div class="definition">{{content.definition}}</div>-->
    <div class="tagBox">
      <el-tooltip
        :content="tag.name"
        v-for="tag in content.tags"
        :key="tag.name"
        placement="top"
      >
        <el-tag :type="tag.properties">
          <span
            style="
              max-width: 160px;
              transform: translateY(-2px);
              display: inline-block;
              vertical-align: middle;
              opacity: 1;
              text-overflow: ellipsis;
              overflow: hidden;
              white-space: nowarp;
            "
          >
            {{ tag.name }}
          </span>
        </el-tag>
      </el-tooltip>
    </div>
    <div class="FKBox">
      <div v-if="FK.length > 0"></div>
      <div
        class="FK-item"
        v-for="item in FK.exter"
        :key="item.id"
        @click="go(item.id)"
      >
        <i
          style="width: 20px; color: lightblue"
          class="el-icon-d-arrow-right"
        ></i>
        {{ item.name }}
      </div>
      <div
        class="FK-item"
        v-for="item in FK.inter"
        :key="item.id"
        @click="go(item.id)"
      >
        <i
          style="width: 20px; color: lightblue"
          class="el-icon-d-arrow-left"
        ></i>
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['content'],
  data() {
    return {
      FK: {
        exter: [],
        inter: [],
      },
    }
  },
  methods: {
    go(objectId) {
      return
      location.hash = location.hash + '&column=' + objectId
      this.$parent.$parent.$parent.$parent.showColumnContent(objectId)
    },
  },
  mounted() {
    const self = this
    var relationships = this.content.relationships
    relationships.forEach(item => {
      if (item.sourceParent) {
        var raw = item.source
        const obj = JSON.parse(raw)
        for (var i in obj) {
          self.FK.inter.push({
            name: i,
            id: obj[i].Id,
          })
        }
      } else {
        var raw = item.target
        const obj = JSON.parse(raw)
        for (var i in obj) {
          self.FK.exter.push({
            name: i,
            id: obj[i].Id,
          })
        }
      }
    })
  },
}
</script>

<style scoped lang="scss">
.contentBox {
  width: 200px;
  height: 200px;
  margin: 10px 10px 0 0;
  float: left;
  background-color: #fff;
  border: 1px solid #d1d5d8;
  border-radius: 4px;
  .physicalName {
    font-size: 20px;
    margin: 10px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .tagBox {
    padding: 10px;
    .el-tag {
      margin-bottom: 5px;
    }
  }
  .FKBox {
    height: 130px;
    overflow: auto;
    .FK-item {
      padding-left: 10px;
      /*cursor:pointer;*/
      &:hover {
        color: lightblue;
      }
    }
  }
}
</style>
