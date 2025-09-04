<template>
  <div v-if="modelToTagMap.has(modelId)" class="show-tags-list">
    <datablau-tooltip v-for="item in tagNames" :content="item" :key="item">
      <datablau-tag class="model-tag">
        <span class="tag-text">
          {{ item }}
        </span>
      </datablau-tag>
    </datablau-tooltip>

    <el-popover
      placement="bottom"
      width="350"
      :visible-arrow="false"
      trigger="hover"
      :popper-class="$route.path.indexOf('sql_editor') !== -1 ? 'tag-container-popover tag-list-outer el-popoverblack' : 'tag-container-popover tag-list-outer'"
    >
      <div class="tag-list-container">
        <p class="tag-container-title">
          <span>标签：{{ tags.length }} 条</span>
        </p>
        <div class="list-outer">
          <datablau-tooltip
            v-for="item in tags.map((item) => item.name)"
            :content="item"
            :key="'list' + item"
            :disabled="item.length < 4"
          >
            <datablau-tag class="model-tag">
              <span class="tag-text">
                {{ item }}
              </span>
            </datablau-tag>
          </datablau-tooltip>
        </div>
      </div>
      <span class="show-more" slot="reference" v-show="tags.length > 2"
      >更多</span
      >
    </el-popover>
  </div>
</template>

<script>
export default {
  name: 'tagContainer',
  data () {
    return {
      tagNames: [], // 仅显示前两个标签
      tags: []
    }
  },
  props: {
    modelId: {
      required: true
    },
    modelToTagMap: {
      required: true
    }
  },
  components: {},
  computed: {},
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      this.tagNames = []
      console.log('dataInit')
      let tags = this.modelToTagMap.get(this.modelId)
      if (tags) {
        tags[0] && tags[0].name && this.tagNames.push(tags[0].name)
        tags[1] && tags[1].name && this.tagNames.push(tags[1].name)
      }
      // tags.push(...tags)
      this.tags = tags
      // console.log(tags, 'tags')
    }
  },
  watch: {}
}
</script>

<style lang="scss" scoped>
@import "~@/assets/style/const.scss";

.show-tags-list {
  vertical-align: top;
  font-size: 0px;

  .model-tag,
  .show-more {
    vertical-align: top;
    font-size: 12px;
    cursor: pointer;
    margin-left: 4px;

    &:hover {
      color: $blue;
    }
  }

  .model-tag {
    position: relative;
    display: inline-block;
    font-size: 0;
    text-align: center;
    //width: 52px;
    //border: 1px solid red;
    //white-space: nowrap;
    //overflow: hidden;
    //text-overflow: ellipsis;

    .tag-text {
      //border: 1px solid red;
      display: inline-block;
      //width: 100%;
      width: 52px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  /deep/ {
    .model-tag.datablau-tag {
      margin: 0 4px;
      line-height: 0;
    }

    .el-popover__reference-wrapper {
      line-height: 32px;
    }
    .el-tag {
      background-color: #D9ECFF;
    }
  }
}
</style>

<style lang="scss">
.el-popover.tag-container-popover.tag-list-outer {
  padding: 0;
  //height: 160px;
  margin-top: 0;

  .el-tag {
    background-color: #D9ECFF;
  }

  .tag-list-container {
    padding: 0 8px;
    //height: 160px;

    .tag-container-title {
      display: inline-block;
      height: 36px;
      line-height: 36px;
      color: #555;
      font-weight: bold;
      padding-left: 8px;
    }

    .list-outer {
      position: relative;
      //border: 1px solid red;
      //left: 8px;
      //right: 8px;
      overflow: auto;
      padding-bottom: 2px;
      margin-bottom: 12px;
      max-height: 120px;

      .model-tag.datablau-tag {
        margin: 4px 4px;
        line-height: 0;

        .el-tag {
          width: 100px;
          text-align: center;

          .tag-text {
            width: 100%;
            display: inline-block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
}
.el-popover{
  &.el-popoverblack{
    background-color: #222;
    border-color: #333333;
    .tag-container-title{
      color: #bbb !important;
    }
  }
}

</style>
