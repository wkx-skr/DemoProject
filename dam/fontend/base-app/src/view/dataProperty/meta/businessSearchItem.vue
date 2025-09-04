<template>
  <div class="box" :class="{ expand: expand }" @click="handleItemClick">
    <div class="box-inner oneline-eclipse">
      <div class="icon">
        <datablau-icon
          :data-type="item.type"
          v-if="item.type !== 'SHARE_FILE'"
          :size="20"
        ></datablau-icon>
        <datablau-icon
          :size="20"
          :data-type="$fileTypeFormatter(item.fileType)"
          v-else
        ></datablau-icon>
      </div>
      <datablau-tooltip
        style="float: left"
        :content="item.name"
        :disabled="showNameTip"
        v-if="item.type == 'SHARE_FILE'"
      >
        <div class="title file-name" @mouseenter="getTooltip">
          {{ item.name }}
        </div>
      </datablau-tooltip>
      <datablau-tooltip
        style="float: left"
        v-else-if="item.type !== 'REPORT'"
        :content="getContent(item)"
        :disabled="showNameTip"
      >
        <div class="title" @mouseenter="getTooltip">
          {{ item.physicalName }}

          <span
            v-if="
              item.physicalName !== item.name &&
              item.type !== 'DOMAIN' &&
              item.type !== 'DOMAIN_CODE'
            "
          >
            ({{ item.name }})
          </span>
          <span
            v-else-if="item.type === 'DOMAIN' || item.type === 'DOMAIN_CODE'"
          >
            {{ item.name }}
          </span>
          <span v-else></span>
        </div>
      </datablau-tooltip>
      <datablau-tooltip
        style="float: left"
        :disabled="showNameTip"
        :content="`${item.name}(${item.code})`"
        v-else
      >
        <div @mouseenter="getTooltip" class="title">
          {{ item.name }} ({{ item.code }})
        </div>
      </datablau-tooltip>
      <div style="width: 100px; display: inline-block">
        <span v-if="dataSecurity">{{ item.assetsLevelName }}</span>
      </div>
      <!--<div class="vice-title path oneline-eclipse" style="width:30%" :title="item.path ? item.path.slice(1):''">
        <i class="fa fa-folder"></i>
        {{item.path ? item.path.slice(1):''}}
      </div>-->
      <div class="vice-title-info">
        <div
          class="vice-title vice-title-detail"
          v-for="table in tableList"
          :key="table.label"
        >
          <img
            :src="table.src"
            alt=""
            style="margin-riht: 4px; margin-top: -41px"
          />
          <div class="table-key">{{ table.label }}:</div>
          <div v-if="table.value !== 'type'">
            <datablau-tooltip
              v-if="table.value === 'categoryName'"
              :content="getCategoryName(item, table)"
              :disabled="showTableValueTip"
            >
              <div
                class="table-value"
                v-if="table.value === 'categoryName'"
                @mouseenter="getShowTableValueTip"
              >
                {{ getCategoryName(item, table) }}
              </div>
            </datablau-tooltip>
            <datablau-tooltip
              v-else
              :content="getTableNameValue(item, table)"
              :disabled="showTableValueTip"
            >
              <div class="table-value" @mouseenter="getShowTableValueTip">
                {{ getTableNameValue(item, table) }}
              </div>
            </datablau-tooltip>
            <!-- <span v-else @mouseenter="getShowTableValueTip">
              {{ getTableNameValue(item, table) }}
            </span> -->
          </div>
          <div v-else class="table-value">
            {{ appTypesFormatter[item.reportType || item.type] || item.type }}
          </div>
        </div>
      </div>
      <div
        v-if="$auth['MAIN_CATALOG_MANAGE']"
        title="从所属业务目录中移除该项"
        class="delete-box"
      >
        <datablau-button
          type="icon"
          low-key
          @click.stop="unbindTable"
          class="iconfont icon-delete btn-info"
        ></datablau-button>
      </div>
    </div>
  </div>
</template>
<script>
import DatablauButton from '@/next/components/basic/button/DatablauButton.vue'
export default {
  components: { DatablauButton },
  props: {
    item: Object,
    expand: Boolean,
    writable: {
      type: Boolean,
      default: false,
    },
    dataSecurity: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showTableValueTip: true,
      showNameTip: true,
      tableList: [],
      appTypesFormatter: {
        Analysis: '多维分析',
        Report: '报表',
        List: '清单',
        DOMAIN: '标准',
      },
    }
  },
  computed: {
    stas() {
      return this.$route.path.includes('embeddedModule') ? 'false' : ''
    },
  },
  beforeMount() {
    this.getTableList()
  },
  methods: {
    getTableNameValue(item, table) {
      return item[table.value]
        ? item[table.value]
        : this.$modelCategoriesDetailsMap[item.categoryId]
        ? this.$modelCategoriesDetailsMap[item.categoryId][table.value]
        : '无'
    },
    getCategoryName(item, table) {
      return item.modelCategoryId
        ? this.$modelCategoriesDetailsMap[item.modelCategoryId][table.value]
        : item[table.value]
        ? item[table.value]
        : this.$modelCategoriesDetailsMap[item.categoryId]
        ? this.$modelCategoriesDetailsMap[item.categoryId][table.value]
        : '无'
    },
    getShowTableValueTip(event) {
      let target = event.target
      if (target.offsetWidth < target.scrollWidth) {
        this.showTableValueTip = false
      } else {
        this.showTableValueTip = true
      }
    },
    getContent(item) {
      let str = ''
      if (item.physicalName !== item.name && item.type !== 'DOMAIN') {
        str = `${item.physicalName}(${item.name})`
      } else if (item.type === 'DOMAIN') {
        str = `${item.physicalName}(${item.name})`
      } else {
        str = item.physicalName
      }
      return str
    },
    getTooltip(event) {
      let target = event.target
      if (target.offsetWidth < target.scrollWidth) {
        this.showNameTip = false
      } else {
        this.showNameTip = true
      }
    },
    getTableList() {
      if (
        this.item.type === 'TABLE' ||
        this.item.type === 'VIEW' ||
        this.item.type === 'STORED_PROCEDURE' ||
        this.item.type === 'FUNCTION'
      ) {
        this.tableList = [
          {
            label: '业务系统',
            // value: 'displayName',
            value: 'categoryName',
            src: '/static/images/metadataIcon/metadataBusiness.svg',
          },
          {
            label: '数据源',
            value: 'modelName',
            src: '/static/images/metadataIcon/metadataDataBase.svg',
          },
          {
            label: 'Schema',
            value: 'schema',
            src: '/static/images/metadataIcon/schema.svg',
          },
        ]
      } else if (this.item.type === 'COLUMN') {
        this.tableList = [
          {
            label: '类型',
            value: 'type',
            src: '/static/images/metadataIcon/metadataBusiness.svg',
          },
          {
            label: '所属表',
            value: 'parentPhysicalName',
            src: '/static/images/metadataIcon/metadataDataBase.svg',
          },
        ]
      } else {
        this.tableList = [
          {
            label: '类型',
            value: 'type',
            src: '/static/images/metadataIcon/metadataBusiness.svg',
          },
        ]
      }
    },
    handleItemClick() {
      this.$emit('itemClick', this.item)
    },
    unbindTable() {
      this.$emit('unbindTable', this.item)
    },
  },
}
</script>
<style scoped lang="scss">
.box-inner {
  border-bottom: 1px solid #e5e5e5;
  // height: 70px;
  position: relative;
  &:hover {
    background: #f8f9fc;
    background-color: rgba(64, 158, 255, 0.1);
  }
  &.selected {
    background: #ebf4ff;
    background-color: rgba(64, 158, 255, 0.1);
  }
}
.box {
  height: 70px;

  cursor: pointer;
  &:last-child .box-inner {
    border-bottom: none;
  }

  position: relative;
  /deep/ .icon {
    top: 0px;
    .img-icon-outer {
      vertical-align: middle;
    }
  }
}
.box.expand {
  .box-inner {
    height: 50px;
    line-height: 50px;
  }
  height: 50px;
  line-height: 50px;
  .icon {
    top: 0px;
    .item-icon-img {
      display: inline-block;
      width: 20px;
      height: 20px;
      border-radius: 10px;

      & > span {
        left: 5px;
        transform: scale(0.8, 0.8);
      }
    }
  }
  .title {
    // text-indent:5em;
    margin-left: 46px;
    margin-right: 5em;
    // min-width:24em;
    width: 20em;
    // border: 1px solid red;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &.file-name {
    }
  }
  .title,
  .vice-title {
    margin-right: 20px;
    display: inline-block;
    position: static;
    line-height: 48px;
  }
  .vice-title-detail {
    max-width: 300px;
    height: 50px;
    div {
      display: inline-block;
      height: 50px;
      position: relative;
      &.table-value {
        max-width: 180px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      &.table-key {
        top: -41%;
        margin-right: 10px;
      }
    }
  }
  .vice-title.path {
    // vertical-align: middle;
    margin-right: 3em;
    min-width: 10em;
    max-width: 10em;
  }
}
.icon {
  position: absolute;
  top: 4px;
  left: 10px;
  // .item-icon-img {
  //   width: 20px;
  //   display: inline-block;
  //   height: 20px;
  //   line-height: 20px;
  //   border-radius: 10px;
  //   & > span {
  //     display: inline-block;
  //     position: relative;
  //     top: -14px;
  //     left: 11px;
  //     color: #fff;
  //     font-size: 12px;
  //   }
  // }
}
.title {
  position: absolute;
  left: 70px;
  top: 15px;
  color: #494850;
}
.vice-title-info {
  display: inline-block;
  position: absolute;
  min-width: 600px;
  left: 400px;
  right: 16px;
  .vice-title {
    position: absolute;
    left: 200px;
    bottom: 13px;
    color: #68758c;
    &.path {
      left: 70px;
    }
  }
}
.btn-info {
  position: static;
}

.box.expand:hover .delete-box {
  .btn-info {
    margin-top: 13px;
  }
}
.box-inner .delete-box {
  display: none;
}
.box-inner:hover .delete-box {
  display: block;
  // background-color: #f56c6c;
  width: 40px;
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
  vertical-align: center;
  text-align: center;
  color: #f1f5f8;
  font-size: 16px;
  i {
    margin-top: 26px;
  }
}
</style>
