<template>
  <div class="left-box">
    <div class="row-top">
      <datablau-select
        v-model="theme"
        @change="themeChange"
        clearable
        @clear="clearTheme"
      >
        <el-option
          v-for="item in themeOption"
          :key="item.name"
          :label="item.name"
          :value="item.tableId + '|' + item.name"
        ></el-option>
      </datablau-select>
    </div>
    <div class="row-main">
      <div class="row-fist">
        <div class="row-title">{{ $t('meta.report.dimension') }}</div>
        <div class="row-item">
          <div
            v-for="item in dimension"
            :key="item.metricMappingId"
            class="list"
          >
            <span>{{ item.attrInfo }}</span>
            <el-button
              plain
              style="padding: 0px 7px; float: right"
              icon="el-icon-plus"
              @click="clickPlus(item)"
            ></el-button>
          </div>
        </div>
      </div>
      <div class="row-fist">
        <div class="row-title">{{ $t('meta.report.index') }}</div>
        <div class="row-item">
          <div v-for="item in metric" :key="item.metricMappingId" class="list">
            <span>{{ item.attrInfo }}</span>
            <el-button
              plain
              style="padding: 0px 7px; float: right"
              icon="el-icon-plus"
              @click="clickPlusmetric(item)"
            ></el-button>
            <!-- <datablau-button
              v-else
              style="float: right; margin-top: 4px; padding: 0"
              type="text"
              @click="clickApply(item)"
            >
              申请
            </datablau-button> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: [],
  components: {},
  data () {
    return {
      themeOption: [],
      theme: '',
      metric: [],
      dimension: [],
      tableId: null
    }
  },
  mounted () {
    this.getOption()
  },
  beforeDestroy () {},
  methods: {
    // 获取主题
    getOption () {
      let url = `${this.$metric_url}querytheme/findall`
      this.$http
        .post(url)
        .then(res => {
          this.themeOption = res.data
          // console.log(res.data, 'res.data')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 更改主题
    themeChange (item) {
      if (!item) {
        return
      }
      // console.log(item, 'item')
      this.tableId = item.split('|')[0]
      let url = `${this.$metric_url}querytheme/mapping/list/get?tableId=${this.tableId}`
      this.$bus.$emit('getTableId', this.tableId)
      this.$http
        .post(url)
        .then(res => {
          // console.log(res.data, 'res')
          if (res.data.dimension) {
            this.dimension = res.data.dimension
          } else {
            this.dimension = []
            // this.dimension = [
            //   {
            //     //属性信息
            //     attrInfo: '维度1',
            //     //属性类型
            //     attrType: 82800023,
            //     //维度 ID
            //     itemId: 0,
            //     //指标id
            //     metricId: 0,
            //     //指标映射id
            //     metricMappingId: 1,
            //     //元数据id
            //     objectId: 'string',
            //   },
            //   {
            //     //属性信息
            //     attrInfo: '维度2',
            //     //属性类型
            //     attrType: 82800023,
            //     //维度 ID
            //     itemId: 0,
            //     //指标id
            //     metricId: 1,
            //     //指标映射id
            //     metricMappingId: 2,
            //     //元数据id
            //     objectId: 'string',
            //   },
            // ]
          }
          if (res.data.metric) {
            this.metric = res.data.metric
          } else {
            this.metric = []
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 清空主题
    clearTheme () {
      this.dimension = []
      this.metric = []
      this.$bus.$emit('clearThemeTable')
    },
    // 点击加号
    clickPlus (item) {
      // console.log(item, '+维度')
      this.$bus.$emit('addTags', item)
    },
    clickPlusmetric (item) {
      // console.log(item, '+指标')
      this.$bus.$emit('addTags', item)
    },
    // 点申请
    clickApply (item) {
      // console.log(item, '申请')
    }
  },
  computed: {},
  watch: {}
}
</script>

<style scoped lang="scss">
.left-box {
  padding: 10px;
  height: 100%;
  .row-main {
    height: 100%;
    .row-title {
      background-color: #eee;
      font-size: 16px;
      margin-top: 10px;
      padding: 5px 0 5px 10px;
    }
    .row-item {
      //background-color: red;
      height: calc(100% - 34px);
      //min-height: 100px;
      overflow-y: auto;
      .list {
        padding: 5px 10px;
        line-height: 30px;
      }
    }
    .row-fist {
      height: 45%;
      //overflow: hidden;
    }
  }
}
</style>
