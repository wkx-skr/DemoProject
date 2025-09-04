<template>
  <div class="box" :class="{ expand: expand }" @click="handleItemClick">
    <div class="box-inner oneline-eclipse">
      <div class="icon">
        <datablau-icon
          :data-type="$fileTypeFormatter(item.fileType || item.type)"
        ></datablau-icon>
      </div>
      <div
        class="title oneline-eclipse"
        style="
          width: 200px;
          position: absolute;
          line-height: 50px;
          left: 0;
          top: 0;
        "
      >
        {{ item.name }}
      </div>
      <div class="vice-title">
        <div class="flex-outer">
          <span class="file-info file-type-col" :title="item.type">
            {{ item.type }} 文件
          </span>
          <span
            class="file-info file-size-col"
            :title="item.size | fileSizeFormatter"
          >
            {{ item.size | fileSizeFormatter }}
          </span>
          <!-- <span class="file-info file-path-col" :title="'文件地址：'+item.path">
            {{'文件地址：'+item.path}}
          </span> -->
          <datablau-span-with-tooltip
            :content="item.path"
            placement="bottom"
            widthStr="150px"
            classString="file-info"
          ></datablau-span-with-tooltip>
          <span class="file-info mod-time">
            修改时间：
            <i class="fa fa-clock-o"></i>
            {{ $timeFormatter(item.lastModifyTime) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    item: Object,
    expand: Boolean,
  },
  mounted() {},
  methods: {
    handleItemClick() {
      this.$emit('itemClick', this.item)
    },
    titleFormatter(item) {
      let result = item.physicalName
      if (item.physicalName !== item.name) {
        result += ` (${item.name})`
      }
      return result
    },
  },
  filters: {
    fileSizeFormatter(num) {
      if (isNaN(num - 0)) {
        num = 0
      }
      num = num / 1024
      let unit = 'KB'
      if (num >= 100) {
        num = num / 1024
        unit = 'MB'
      }
      if (num >= 100) {
        num = num / 1024
        unit = 'GB'
      }
      num = num.toFixed(2)
      return num + unit
    },
  },
}
</script>
<style scoped lang="scss">
.box {
  height: 70px;

  cursor: pointer;
  .box-inner {
    margin-left: 10px;
    border-bottom: 1px solid #e5e5e5;
    height: 70px;
    position: relative;
    &:hover {
      background: #f8f9fc;
    }
    &.selected {
      background: #ebf4ff;
    }
  }
  &:last-child .box-inner {
    border-bottom: none;
  }

  position: relative;
  .time {
    /*display:none;*/
    margin-left: 2em;
  }
  .icon {
    top: -2px;
  }

  .icon {
    position: absolute;
    font-size: 48px;
    top: 4px;
    left: 10px;
    .item-icon-img {
      width: 48px;
      display: inline-block;
      height: 48px;
      line-height: 48px;
      border-radius: 24px;
      & > span {
        display: inline-block;
        /*vertical-align:middle;*/
        position: relative;
        top: -14px;
        left: 11px;
        color: #fff;
        font-size: 12px;
      }
    }
  }
  .title {
    position: absolute;
    left: 70px;
    top: 15px;
    color: #494850;
  }
  .vice-title {
    position: absolute !important;
    left: 200px !important;
    // bottom:13px;
    color: #68758c;

    .flex-outer {
      display: flex;
      justify-content: space-between;
      .file-info {
        margin-right: 20px;
        &.mod-time {
          display: none;
          min-width: 150px;
        }
      }
    }
  }
  &.expand {
    .time {
      display: inline-block;
      margin-left: 2em;
    }
    .box-inner {
      height: 50px;
    }
    height: 50px;
    .icon {
      font-size: 36px;
      top: 2px;
      left: 10px;
      .item-icon-img {
        margin-top: 5px;
        display: inline-block;
        width: 36px;
        height: 36px;
        border-radius: 18px;

        & > span {
          left: 5px;
          transform: scale(0.8, 0.8);
        }
      }
    }
    .column {
      width: 8em;
      display: inline-block;
      vertical-align: middle;
      @media (min-width: 1280px) and (max-width: 1600px) {
        width: 12em;
      }
      @media (min-width: 1600px) {
        width: 18em;
      }
    }
    .title {
      text-indent: 5em;
      margin-right: 2em;
      width: 24em;
      @media only screen and (min-width: 1600px) {
        width: 36em;
      }
      vertical-align: middle;
    }
    .title,
    .vice-title {
      display: inline-block;
      position: static;
      line-height: 50px;
      .file-info {
        display: inline-block;
        // border: 1px solid red;
        margin-right: 20px;
        // &.mod-time {
        //   min-width: 150px;
        //   display: inline-block;
        // }
        &.file-type-col {
          width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          // border: 1px solid red;
        }
        &.file-size-col {
          width: 60px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        &.file-path-col {
          width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      @media (min-width: 1300px) {
        .file-info {
          &.mod-time {
            display: inline-block;
          }
        }
      }
      @media (min-width: 1366px) {
        .file-info {
          margin-right: 40px;
        }
      }
    }
  }
}
</style>
