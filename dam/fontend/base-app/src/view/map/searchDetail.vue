<template>
  <div class="map-detail">
    <div class="search-result-cnt">
      <span class="result">{{ $t('meta.map.result') }}</span>
      <!--<span class="cnt">{{itemCnt}}条数据</span>-->
    </div>
    <div class="list-box search" style="top: 20px">
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane
          :label="$t('meta.map.system') + ' (' + categoryCnt + ')'"
          name="basic"
        ></el-tab-pane>
        <el-tab-pane
          :label="$t('meta.map.table') + ' (' + tableCnt + ')'"
          name="table"
        ></el-tab-pane>
      </el-tabs>
      <div class="list-content" style="border-top: 1px solid #606060">
        <div
          v-if="activeName === 'basic'"
          v-for="item in data"
          @click="go({ data: item })"
          class="list-content-item"
        >
          <div class="map-title">
            {{ item.categoryName }}({{ item.categoryAbbreviation }})
          </div>
          <div class="property" style="margin-top: 0.5em">
            <span style="width: 180px; display: inline-block">
              {{ $t('meta.map.itDepartment') }}：{{ item.itDepartment }}
            </span>
            <span>{{ $t('meta.map.zone') }}：{{ item.zone }}</span>
          </div>
          <div
            class="description"
            style="-webkit-line-clamp: 2; margin-top: 0.5em"
          >
            {{ item.description }}
          </div>
        </div>
        <div
          v-if="activeName === 'table'"
          v-for="item in tables"
          @click="showLineage({ data: item })"
          class="list-content-item"
        >
          <div class="map-title">{{ item.physicalName }}</div>
          <div class="property" style="margin-top: 0.5em">
            <span style="width: 180px; display: inline-block">
              {{ $t('meta.map.chName') }}：{{ item.name }}
            </span>
            <span>
              {{ $t('meta.map.ownerModel') }}：{{ item.parentPhysicalName }}
            </span>
          </div>
          <div
            class="description"
            style="-webkit-line-clamp: 2; margin-top: 0.5em"
          >
            {{ item.definition }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['keyword'],
  mounted() {
    Ps.initialize($('.list-content')[0])
    $(window).on('resize', this.handleResize)
    this.getData()
    this.$bus.$on('searchTable', () => {
      this.getData()
    })
  },
  beforeDestroy() {
    //      Ps.destroy($('.list-content')[0]);
    $(window).off('resize', this.handleResize)
    this.$bus.$off('searchTable')
  },

  data() {
    return {
      activeName: 'basic',
      itemCnt: '',
      data: [],
      tables: [],
      tableCnt: 0,
      categoryCnt: 0,
    }
  },
  methods: {
    handleTabClick() {
      setTimeout(() => {
        this.handleResize()
      }, 200)
    },
    getData() {
      this.data = []
      if (!this.keyword) {
        this.data = this.$modelCategories
        this.categoryCnt = this.data.length
      } else {
        const keyword = this.keyword.toLowerCase()
        this.$modelCategories.forEach(item => {
          if (
            item.categoryName.toLowerCase().indexOf(keyword) > -1 ||
            item.categoryAbbreviation.toLowerCase().indexOf(keyword) > -1
          ) {
            this.data.push(item)
          }
        })
        this.categoryCnt = this.data.length
        this.$http
          .post(this.$meta_url + '/service/entities/searchMetadata', {
            currentPage: 1,
            keyword: keyword,
            pageSize: 500,
            types: ['TABLE'],
          })
          .then(res => {
            res.data.content.forEach(item => {
              if (item.name === item.physicalName) {
                item.name = ''
              }
            })
            this.tables = res.data.content
            this.tableCnt = this.tables.length
            //            this.itemCnt = this.data.length + this.tables.length;
          })
        //          this.itemCnt = this.data.length + this.tables.length;
      }
    },
    handleResize() {
      Ps.update($('.list-content')[0])
    },
    go({ data, type = 'category' }) {
      if (type === 'category') {
        this.$emit('findCategory', data.categoryId)
      } else {
        this.$emit('findCategory', data.categoryId)
      }
    },
    showLineage({ data }) {
      this.$emit('row-click', data)
    },
  },
}
</script>

<style scoped lang="scss"></style>
