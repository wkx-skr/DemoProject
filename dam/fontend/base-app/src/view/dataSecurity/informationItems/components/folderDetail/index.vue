<template></template>
<script>
import folderDetail from './index.js'

export default folderDetail
</script>
<style lang="scss" scoped>
#domainFolder .st-page-form {
  @media (max-width: 1525px) {
    .el-form-item__content {
      //border: 1px solid red;
      width: 110px;

      .el-input {
        width: 110px;
      }

      .el-button {
        padding: 7px 10px;
      }
    }
  }
}

.datastandard-folder-detail {
  position: relative;
  height: 100%;
  width: 100%;

  .inline-search-item {
    display: inline-block;
    margin-left: 8px;
  }

  .search-outer {
    padding: 10px 20px 0 20px;

    /deep/ .datablau-form-box .el-select.is-single {
      width: 100% !important;
    }
    /deep/ .datablau-form-box {
      // min-width: 1000px;
      display: flex;
    }
    /deep/ .datablau-form-box .list-buttons {
      // min-width: 1000px;
      display: flex;
      float: none;
      flex-shrink: 0;
    }
    /deep/ .datablau-form-box .list-search-box {
      // display: flex;
      // flex-wrap: wrap;
      flex-grow: 1;
      overflow-x: auto;
      margin-right: 0;
      // min-width: 840px;
      overflow-y: hidden;
    }

    /deep/ .datablau-form-box .list-search-box .el-form {
      // flex-grow: 1;
      min-width: 0;
    }

    /deep/ .datablau-form-box .list-search-box .el-form .el-form-item {
      //border: 1px solid red;
      margin-right: 10px;

      .el-form-item__content {
        min-width: auto;
        line-height: 30px;
      }
    }

    .more-condition-btn {
      //border: 1px solid red;
      position: absolute;
      top: 18px;
      right: 350px;

      i {
        transform: rotate(180deg);
      }
    }

    .more-fun-btn {
      margin-left: 10px;
    }
  }

  /deep/ .list-title {
    display: none;
  }

  .search-form {
    padding: 10px 0 0 20px;

    &.el-form.el-form--inline /deep/ .el-form-item {
      margin-bottom: 4px;
    }
  }

  /deep/ .form-submit {
    top: 105px;
  }

  /deep/ .row-buttons {
    text-align: left;
  }

  .left-btn {
    position: absolute;
    left: 0;
    height: 100%;
    width: 600px;
    padding-left: 20px;

    .footer-row-info {
      margin-right: 10px;
    }
  }

  .pagination-component {
    float: right;
    margin-right: 20px;
  }

  .hide-btn {
    visibility: hidden;
  }

  .not-subscribe {
    i.icon-dingyue {
      color: #999;
    }
  }
}

.edit-btn {
  display: inline-block;
}

.datastandard-folder-detail.less-search-line {
  /deep/ .form-submit {
    top: 80px;
  }

  .more-condition-btn {
    i {
      transform: rotate(0deg);
    }
  }
}
</style>
<style lang="scss">
.datastandard-folder-detail {
  border-top: 1px solid rgba(0, 0, 0, 0);

  .ag-root {
    // ag-grid root
    $headerHigth: 50px;

    .ag-header {
      .ag-header-row {
        .ag-header-cell {
          height: $headerHigth;
          line-height: $headerHigth;

          &::after {
            height: $headerHigth;
          }
        }
      }
    }
  }

  .circle {
    position: relative;
    bottom: 1px;
    display: inline-block;
    margin-right: 7px;
    background-color: #5cb793;
    border-radius: 3.5px;
    width: 7px;
    height: 7px;
  }
}
.more-drop-box .el-dropdown-menu__item {
  .iconfont {
    color: #999;
    font-size: 14px;
  }
  &:hover {
    color: #409eff;
    .iconfont {
      color: #409eff;
    }
  }
}
.el-popover {
  min-width: 100px;
}
</style>
