<template>
  <div style="position: relative">
    <access-apply
      v-if="applyDialogVisible"
      :metric-id="details.domainId"
      @close="applyDialogVisible = false"
    ></access-apply>
    <datablau-icon
      data-type="index"
      :isIcon="true"
      :size="42"
      style="position: absolute; left: 8px; top: 21px"
    ></datablau-icon>
    <el-tooltip
      :disabled="details.chineseName.length + details.domainCode.length < 36"
    >
      <h2 class="oneline-eclipse">
        {{ details.chineseName }}({{ details.domainCode }})
      </h2>
      <span slot="content">
        {{ $t('indicator.definition.chineseName') }}：{{ details.chineseName }}
        <br />
        {{ $t('indicator.definition.domainCode') }}：{{ details.domainCode }}
      </span>
    </el-tooltip>

    <div style="position: absolute; top: 54px; left: 68px">
      <!--<div
        style="
          padding: 0 10px;
          display: inline-block;
          background-color: rgba(195, 186, 49, 0.2);
          color: #c3ba31;
          border-radius: 2px;
          height: 22px;
          line-height: 22px;
          margin-right: 20px;
        "
      >
        基础指标
      </div>-->
      <!--业务定义:
      <span v-if="details.description">
        {{
          details.description.length < 25
            ? details.description
            : details.description.slice(0, 25) + '…'
        }}
      </span>
      <span v-else>暂未填写</span>
      <span style="margin-left: 20px"></span>
      单位：{{ details.measureUnit }}-->
      <!--      下次触发时间：-->
    </div>
    <div
      style="
        position: absolute;
        right: 0;
        top: 25px;
        width: 460px;
        height: 40px;
        line-height: 40px;
        text-align: right;
      "
    >
      <div
        style="
          display: inline-block;
          line-height: 14px;
          vertical-align: top;
          text-align: left;
        "
      >
        <div style="margin-bottom: 0">
          {{ $t('assets.commonHead.collect') }}
          <span class="property collection" @click="toggleCollecStatus">
            <datablau-button type="icon" low-key>
              <i
                class="el-icon-star-on"
                style="color: rgb(247, 186, 42)"
                v-if="hasCollected"
              ></i>
              <i class="el-icon-star-off" v-else></i>
            </datablau-button>
          </span>
        </div>
        <div>
          <span style="font-size: 14px">{{ favoriteNumber }}</span>
          {{ $t('assets.commonHead.ci') }}
        </div>
      </div>
      <div
        style="
          display: inline-block;
          border-left: 1px solid #dddddd;
          width: 0;
          height: 100%;
          margin: 0 20px;
        "
      ></div>
      <div
        style="
          display: inline-block;
          line-height: 14px;
          vertical-align: top;
          margin-top: 4px;
          text-align: left;
        "
      >
        <div style="margin-bottom: 6px">
          {{ $t('assets.commonHead.visit') }}
        </div>
        <div>
          <span style="font-size: 14px">{{ visit }}</span>
          {{ $t('assets.commonHead.ci') }}
        </div>
      </div>
      <div
        v-if="details.state === 'A' && details.path"
        style="
          display: inline-block;
          border-left: 1px solid #dddddd;
          width: 0;
          height: 100%;
          margin: 0 20px;
        "
      ></div>
      <datablau-subscribe
        v-if="details.state === 'A' && details.path"
        style="vertical-align: top; margin-top: 3px"
        type-id="80010066"
        display-type="buttonWithIcon"
        :object-name="details.path.join('/') + '/' + details.chineseName"
        :object-id="details.domainId"
        :domainFolderId="details.categoryId"
      ></datablau-subscribe>
      <div
        style="
          display: inline-block;
          border-left: 1px solid #dddddd;
          width: 0;
          height: 100%;
          margin: 0 20px;
        "
      ></div>
      <datablau-button
        style="vertical-align: top; margin-top: 3px"
        @click="callApplyDialog"
      >
        {{ $t('indicator.access.apply') }}
      </datablau-button>
      <!--<datablau-button style="vertical-align: top; margin-top: 3px">
        提需求
      </datablau-button>-->
    </div>
  </div>
</template>
<script>
import HTTP from '@/http/main'
import AccessApply from './accessApply.vue'
export default {
  components: {
    AccessApply,
  },
  props: {
    details: {
      required: true,
    },
  },
  data() {
    return {
      visit: '',
      vote: 0,
      favoriteNumber: '',
      hasCollected: false,
      favoPara: null,
      favId: null,
      applyDialogVisible: false,
    }
  },
  mounted() {
    this.getVisit()
    // this.getDomainVote()
    this.getCollectionNum()
    this.dataInit()
  },
  methods: {
    getVisit() {
      this.$http
        .get(
          `${this.$url}/service/browse/click/count/${this.details.domainId}/80010066`
        )
        .then(res => {
          this.visit = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDomainVote(id) {
      HTTP.getDomainVote(id)
        .then(res => {
          this.vote = res.data
        })
        .catch(err => {
          console.error(err)
        })
    },
    getCollectionNum() {
      const params = {
        objId: this.details.domainId, // 报表的id
        typeId: '80010066',
      }
      this.$http.post(this.$url + '/service/favor/count', params).then(res => {
        this.favoriteNumber = res.data
      })
    },
    checkIfCollected() {
      const para = this.favoPara
      HTTP.getIfCollected({
        succesedCallback: data => {
          this.hasCollected = !!data
          if (data) {
            this.favId = data.id
          }
        },
        failureCallback: e => {
          this.$showFailure(e)
          this.hasCollected = false
        },
        para: para,
      })
    },
    refreshFavStatus() {
      HTTP.refreshCollectionList({
        succesedCallback: data => {
          this.checkIfCollected()
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
      })
    },
    dataInit() {
      this.favoPara = {
        typeId: this.$commentPreCode.Domain,
        objId: this.details.domainId,
        objectName: this.details.chineseName,
      }
      this.checkIfCollected()
    },
    toggleCollecStatus() {
      this.hasCollected = !this.hasCollected
      const obj = this.favoPara
      const succesedCallback = res => {
        const msg = this.hasCollected ? this.$t('meta.DS.message.collectSuccess') : this.$t('meta.DS.message.unCollectSuccess')
        this.getCollectionNum()
        this.$message.success(msg)
        this.refreshFavStatus()
      }
      const failureCallback = e => {
        this.$showFailure(e)
        this.refreshFavStatus()
      }
      if (this.hasCollected) {
        HTTP.addFavorite({
          succesedCallback: succesedCallback,
          failureCallback: failureCallback,
          para: obj,
        })
      } else {
        this.favId &&
          HTTP.removeCollection({
            succesedCallback: succesedCallback,
            failureCallback: failureCallback,
            para: {
              favId: this.favId,
            },
          })
      }
    },
    callApplyDialog() {
      this.applyDialogVisible = true
    },
  },
}
</script>
<style lang="scss" scoped>
h2 {
  position: absolute;
  top: 24px;
  left: 68px;
  right: 400px;
  font-size: 20px;
  height: 30px;
  line-height: 20px;
  color: #555555;
  font-weight: 500;
}
</style>
