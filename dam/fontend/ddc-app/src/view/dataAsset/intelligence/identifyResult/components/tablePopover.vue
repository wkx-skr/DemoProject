<template>
  <div class="table-popover">
    <div
      class="table-cell-tag cur-tag"
      :class="{
        'select-tag': row.catalogList.length > 1,
      }"
      v-for="(item, index) in row.catalogList.slice(0, 3)"
      :key="item.id"
    >
      <el-popover
        popper-class="classification-card-popover"
        placement="bottom"
        title=""
        width="320"
        trigger="hover"
        @show="showTip(item.id, item)"
        transition="fade-in-linear"
      >
        <div class="catalog-name" slot="reference">{{ item.name }}</div>
        <classify-pop :catalogInfo="catalogInfo"></classify-pop>
      </el-popover>
    </div>
    <el-popover
      popper-class="table-popover"
      style="display: inline-block"
      v-if="row.catalogList.length - 3 > 0"
      placement="bottom"
      title=""
      width="490"
      trigger="hover"
      transition="fade-in-linear"
      :visible-arrow="false"
    >
      <div class="more" slot="reference">
        {{ $t('securityModule.more') }} {{ row.catalogList.length - 3 }}
        {{ row.catalogList.length - 3 > 99 ? '+' : '' }}
      </div>
      <p
        style="
          margin-bottom: 8px;
          overflow: hidden;
          color: #20293b;
          font-size: 12px;
          text-align: left;
        "
      >
        {{ $t('securityModule.securityClassify') }}：{{ row.catalogList.length
        }}{{ $t('securityModule.strip') }}
      </p>
      <div
        class="table-cell-tag cur-tag"
        :class="{
          'select-tag': row.catalogList.length > 1,
        }"
        style="margin-bottom: 5px"
        v-for="(item, index) in row.oriCatalogList"
        :key="item.id"
      >
        <el-popover
          popper-class="classification-card-popover"
          placement="bottom"
          title=""
          width="320"
          trigger="hover"
          @show="showTip(item.id, item)"
          transition="fade-in-linear"
        >
          <div class="catalog-name" slot="reference">{{ item.name }}</div>
          <classify-pop :catalogInfo="catalogInfo"></classify-pop>
        </el-popover>
      </div>
    </el-popover>
  </div>
</template>

<script>
import API from '@/view/dataAsset/utils/s_api'
import classifyPop from './classifyPop.vue'
export default {
  components: {
    classifyPop,
  },
  props: {
    row: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  watch: {},
  data() {
    return {
      catalogInfo: {},
    }
  },
  mounted() {},
  methods: {
    selectType(row, id, index) {
      let typeId = ''
      row.changeLevel = true
      setTimeout(() => {
        row.changeLevel = false
      }, 200)
      // 更多里面的数据分类目录
      row.oriCatalogList.map(item => {
        if (parseFloat(item.id) === parseFloat(id)) {
          item.select = true
          typeId = item.id
        } else {
          item.select = false
        }
      })
      row.levelList.map(item => {
        if (parseFloat(item.key) === parseFloat(id)) {
          item.select = true
        } else {
          item.select = false
        }
      })
      let newList = []
      if (index >= 3) {
        row.oriCatalogList.map(item => {
          if (item.select) {
            newList.splice(0, 0, item)
          } else {
            newList.push(item)
          }
        })
        row.catalogList = newList
      } else {
        row.catalogList = row.oriCatalogList
      }
      // this.tableData.map((m, index) => {
      //   if (m.resultId === row.resultId) {
      //     this.tableData.splice(index, 1, row)
      //   }
      // })
    },
    showTip(id, item) {
      API.getCatalogDetail(id)
        .then(res => {
          const data = res.data.data
          this.catalogInfo = {
            catalogName: item.name,
            catalogPath: item.catalogPath,
            icon: data.icon,
            type: data.name,
            desc: data.desc,
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
</script>

<style lang="scss">
.table-popover {
  .table-cell-tag {
    vertical-align: middle;
    display: inline-block;
    margin-right: 4px;
    width: 104px;
    text-align: center;
    &:last-child {
      margin-right: 0;
    }
    &:hover {
      .catalog-name {
        border: 1px solid #409eff;
        color: #409eff;
        background: #fff;
      }
    }
    &.select-tag {
    }
    &.cur-tag {
      .catalog-name {
        background: transparentize(#409eff, 0.9);
        border: 1px solid #409eff;
        color: #409eff;
      }
    }
    .catalog-name {
      cursor: pointer;
      color: #999999;
      text-align: center;
      vertical-align: middle;
      background: transparent;
      height: 24px;
      line-height: 22px;
      box-sizing: border-box;
      border: 1px solid #dddddd;
      border-radius: 2px;
      padding: 0 8px;
      width: 104px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    + span {
      vertical-align: middle;
      height: 24px;
      .more {
        cursor: pointer;
        color: #555;
        position: relative;
        padding: 0 4px;
        border-radius: 2px;
        &:hover {
          background: transparentize(#409eff, 0.8);
          color: #fff;
          color: #555555;
        }
      }
    }

    .tag-type {
    }
  }
}
</style>
