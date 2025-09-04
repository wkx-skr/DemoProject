<template slot>
  <div class="panel" :style="panelStyle">
    <div class="header" v-if="$slots.header">
      <slot name="header"></slot>
    </div>
    <div class="content">
      <div class="content-panel">
        <slot></slot>
      </div>
      <div v-if="$slots.bottomBar" class="bottom-bar">
        <slot name="bottomBar"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "panel",
  inject: ["layout"],
  props: {
    width: String,
    height: String,
  },
  computed: {
    panelStyle() {
      if (this.layout === "horizontal" && this.width) {
        return {
          "-webkit-box-flex": "initial",
          "-ms-flex": "initial",
          flex: "initial",
          width: this.width,
        };
      }
      if (this.layout !== "horizontal" && this.height) {
        return {
          "-webkit-box-flex": "initial",
          "-ms-flex": "initial",
          flex: "initial",
          height: this.height,
        };
      }
    },
  },
};
</script>

<style lang="scss">
.panel {
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  border-radius: 4px;
  margin: 8px;
  flex: 1;
  background-color: #fff;
  overflow: auto;
  box-shadow: 0px 0px 12px 2px rgba(0, 0, 0, 0.1);

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 40px;
    border-radius: 4px 4px 0px 0px;
    border-bottom: 1px solid #dcdfe6;
    padding: 8px 16px;
    flex: 0 0 auto;
    color: #606266;
    font-size: 16px;
    font-weight: 400;

    .el-tabs__item.is-active {
      font-weight: bold;
    }

    .el-tabs__item {
      height: 46px;
      font-size: 14px;
      font-weight: 400;
      line-height: 46px;
      > div {
        padding: 0 12px;
      }
    }

    .el-tabs__nav-wrap::after {
      background-color: #fff;
    }

    .el-tabs {
      height: 46px;
    }

    .icon {
      font-size: 16px;
      margin-right: 8px;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    border-radius: 4px;
    flex: 1;
    overflow-y: auto;

    .content-panel {
      padding: 16px;
      overflow: auto;
      flex: 1 1 auto;

      .el-tree--highlight-current
        .el-tree-node.is-current
        > .el-tree-node__content {
        color: var(--color-primary);
      }

      .el-tree--highlight-current
        .el-tree-node.is-current
        > .el-tree-node__content {
        background-color: var(--color-hover-primary-9);
      }

      .el-form {
        margin-bottom: -16px;

        .el-form-item {
          margin-bottom: 16px;
        }
      }
    }

    .bottom-bar {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 60px;//min-height: 60px;
      padding: 16px;
      flex: 0 0 auto;
      background: #fff;
      overflow: hidden;
      box-shadow: 0px 0px 12px 2px rgba(0, 0, 0, 0.1);

      .pagination-container {
        padding: 0 !important;
        margin: 0;
        height: auto;

        .el-pagination {
          position: static;
          padding: 0;
        }
      }
    }
  }
}
</style>
