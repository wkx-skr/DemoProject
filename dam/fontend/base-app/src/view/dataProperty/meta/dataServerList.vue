<template>
  <div class="data-server-list" v-loading="loadingData">
    <div class="api-control-container" v-show="apiList.length > 0">
      <datablau-button type="important" @click="createApi" v-if="hasAccess">
        {{ $t('meta.DS.tableDetail.dataService.createApi') }}
      </datablau-button>
    </div>
    <!--modeType="manageApi"-->
    <my-app
      moudleType="manageApi"
      showType="dialog"
      @showDetail="showDetail"
      :disabledOption="true"
      :tableIdFilter="objectId"
      :hideTitle="true"
      v-if="false"
    ></my-app>
    <dds-api-list :apiList="apiList" v-show="apiList.length > 0"></dds-api-list>
    <div class="noresult-data-server" style="" v-show="apiList.length === 0">
      <div class="noresult-img">
        <img src="static/kgimg/noresult.svg" alt="" />
        <p>
          {{ $t('meta.DS.tableDetail.noData') }}
        </p>
        <datablau-button
          type="important"
          style="display: block; margin: 0 auto"
          @click="createApi"
          :disabled="Boolean(isAssets)"
          v-if="hasAccess"
        >
          {{ $t('meta.DS.tableDetail.dataService.createApi') }}
        </datablau-button>
      </div>
    </div>
    <div class="show-more-line" v-if="!showAll">
      <span @click="showAllData">
        {{ $t('meta.DS.tableDetail.dataService.showMore') }}
      </span>
    </div>
  </div>
</template>

<script>
import ddsHTTP from '@/view/dataAplication/ddsHTTP.js'
import myApp from '@/view/dataAplication/apiOverview.vue'
import ddsApiList from './ddsApiList.vue'

export default {
  name: 'dataServerList',
  data() {
    return {
      hasAccess: this.$auth.API_DEVELOP_ALL,
      apiList: [],
      showMax: 5,
      showAll: true,
      totalCount: 0,
      loadingData: true,
      isAssets: '',
    }
  },
  props: {
    objectId: {
      required: true,
    },
  },
  components: {
    myApp,
    ddsApiList,
  },
  computed: {
    isRole() {
      return (
        this.$isRole(this.$t('meta.DS.tableDetail.dataService.dataEngineer')) ||
        this.$isRole(
          this.$t('meta.DS.tableDetail.dataService.dataServeManager')
        ) ||
        this.$isAdmin
      )
    },
  },
  mounted() {
    if (this.$route.query.isAssets) {
      this.isAssets = this.$route.query.isAssets
    }
    this.dataInit()
  },
  methods: {
    dataInit() {
      this.loadingData = true
      const para = {
        currentPage: 0,
        pageSize: this.totalCount ? this.totalCount + 1 : this.showMax,
        group: '',
        name: '',
        status: 0,
        testStatus: null,
        tableObjectId: this.objectId,
      }
      ddsHTTP
        .getApiLists(para)
        .then(res => {
          const data = res.data
          this.apiList = data.content
          this.totalCount = data.totalItems
          if (data.totalItems > para.pageSize) {
            this.showAll = false
          }
          this.loadingData = false
        })
        .catch(e => {
          this.$showFailure(e)
          this.loadingData = false
        })
      // console.log("dataInit");
    },
    showAllData() {
      this.dataInit()
      this.showAll = true
    },
    showDetail(newVal) {
      // this.$emit('showDetail', newVal)
    },
    createApi() {
      this.$skip2({
        name: 'apiCreate',
        query: {
          tableId: this.objectId,
        },
      })
      // this.$router.push({
      //   name: 'devApi',
      //   query: {
      //     tableId: this.objectId,
      //     createApi: true
      //   }
      // })
    },
  },
  watch: {},
}
</script>

<style lang="scss" scoped>
.data-server-list {
  position: relative;
  height: 100%;
  //border: 1px solid red;
  .noresult-data-server {
    height: 500px;
    .noresult-img {
      width: 120px;
      margin: 0 auto;
      padding-top: 130px;
      img {
        width: 100px;
        height: auto;
        display: block;
        margin: 0 auto;
      }
      p {
        font-size: 14px;
        color: #555;
        text-align: center;
        padding: 10px 0;
      }
    }
  }
  .api-control-container {
    position: absolute;
    z-index: 2;
    right: 20px;
    top: -20px;
  }

  .show-more-line {
    text-align: center;
    color: var(--color-primary);
    cursor: pointer;
  }
}
</style>

<style lang="scss">
.api-detail-dialog {
  .el-dialog__header {
    height: 0;
    margin: 0;
    padding: 0;
  }

  .el-dialog__body {
    height: 100%;
    padding: 0;
    margin: 0;
  }
}
</style>
