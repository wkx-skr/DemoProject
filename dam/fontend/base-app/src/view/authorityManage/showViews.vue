/** * showViews */
<template>
  <div class="show-view-outer">
    <div class="show-view-container">
      <el-tabs
        type="card"
        class="show-view-tabs"
        v-model="currentTab"
        @tab-remove="removeTab"
      >
        <el-tab-pane label="共享视图" name="allViews">
          <div class="all-views-container">
            <views-list
              :viewsList="allViewsList"
              @updataViews="allViewsUpdata"
              @checkView="checkView"
            ></views-list>
          </div>
        </el-tab-pane>
        <el-tab-pane label="我的视图" name="myViews">
          <div class="my-views-container">
            <views-list
              :viewsList="myViewsList"
              @updataViews="myViewsUpdata"
              @checkView="checkView"
            ></views-list>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import viewsList from './viewsList.vue'
export default {
  data() {
    return {
      currentTab: 'allViews',
      allViewCount: 0,
      allViewsList: [],
      myViewsList: [],
    }
  },
  components: {
    viewsList,
  },
  computed: {},
  beforeMount() {},
  mounted() {
    this.allViewsUpdata()
  },
  methods: {
    removeTab() {},
    getAllView() {
      return new Promise((resolve, reject) => {
        this.$http
          .get(`${this.$url}/service/vdp/views/shared`)
          .then(res => {
            const data = res.data || []
            if (Array.isArray(data)) {
              this.allViewCount = data.length
              resolve(data)
            } else {
              resolve([])
            }
          })
          .catch(e => {
            this.$showFailure(e)
            rejects(e)
          })
      })
    },
    getMyView(para) {
      return new Promise((resolve, reject) => {
        this.$http
          .get(`${this.$url}/service/vdp/view`)
          .then(res => {
            const data = res.data
            const views = data.views || []
            this.allViewCount = views.length
            resolve(views)
          })
          .catch(e => {
            this.$showFailure(e)
            rejects(e)
          })
      })
    },
    fresh() {},
    allViewsUpdata() {
      this.getAllView()
        .then(res => {
          this.allViewsList = res
        })
        .catch(e => {
          console.log(e)
        })
    },
    myViewsUpdata() {
      this.getMyView()
        .then(res => {
          this.myViewsList = res
        })
        .catch(e => {
          console.log(e)
        })
    },
    checkView(args) {
      this.$emit('checkView', args)
    },
  },
  watch: {
    currentTab(newVal) {
      if (newVal === 'myViews') {
        this.myViewsUpdata()
      } else {
        this.allViewsUpdata()
      }
    },
  },
}
</script>

<style lang="scss">
.show-view-outer {
  width: 100%;
  overflow: auto;
}

.show-view-container {
  // min-width: 900px;
}

.all-views-container,
.my-views-container {
  // min-height: 400px;
  max-height: 400px;
  overflow: auto;
}
</style>
