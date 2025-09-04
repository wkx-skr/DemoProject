<template>
  <div class="detailSta" v-loading="loading">
    <datablau-breadcrumb
      class="title"
      :node-data="nodeData1"
      :separator="'/'"
      @back="returnList"
    ></datablau-breadcrumb>
    <div class="fileDetail">
      <div class="enclosure" @click="enclosureDownload">下载附件</div>
      <h2 class="til">
        {{ title }}
        <!--        <p>GBT-35273-2017</p>-->
      </h2>
      <div class="staDetail">
        <ul class="flex">
          <li>
            <span>法规简称：</span>
            <span class="decText">{{ detail.regulationShortName }}</span>
          </li>
          <li>
            <span>法规来源：</span>
            <span class="decText">{{ detail.regulationSource }}</span>
          </li>
        </ul>
        <div class="dec">
          {{ detail.description }}
        </div>
        <ul class="rightUl">
          <li>
            <span>上传部门：</span>
            {{ detail.deptCode }}
          </li>
          <li>
            <span>发布部门：</span>
            {{ detail.pubDeptCode }}
          </li>
          <li>
            <span>上传人：</span>
            {{ detail.uploader }}
          </li>
          <li>
            <span>上传时间：</span>
            {{ timeFun(detail.uploadDate) }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import HTTP from '../util/api'
export default {
  props: {
    detailItem: {
      type: Object,
    },
  },
  data() {
    return {
      title: '',
      detail: {},
      showRegulations: false,
      tableau: null,
      doc: false,
      loading: false,
    }
  },
  computed: {
    nodeData1() {
      return {
        name: '法规条文',
        icon: '',
        children: [
          {
            name: '法规条文',
            couldClick: false,
            children: [{ name: this.title, couldClick: false }],
          },
        ],
      }
    },
  },
  watch: {
    detailItem: {
      handler(val) {
        console.log(val)
        if (val && val.fileId) {
          this.getDetail()
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    returnList() {
      this.$emit('returnList')
    },
    enclosureDownload() {
      let url =
        this.$url +
        `/service/datasecurity/regulation/download/${this.detail.fileId}`
      this.$datablauDownload(
        url,
        { regulationId: this.detail.fileId },
        this.title
      )
    },
    getDetail() {
      this.loading = true
      HTTP.detailRegulation({ id: this.detailItem.fileId })
        .then(res => {
          this.title = res.data.data.fileName
          this.detail = res.data.data
          this.loading = false
        })
        .catch(e => {
          this.$showFailure(e)
          this.loading = false
        })
    },
    timeFun(time) {
      let date = new Date(time)
      let Y = date.getFullYear() + '-'
      let M =
        (date.getMonth() + 1 < 10
          ? '0' + (date.getMonth() + 1)
          : date.getMonth() + 1) + '-'
      let D =
        date.getDate() < 10 ? '0' + date.getDate() + ' ' : date.getDate() + ' '
      let H = date.getHours() + ':'
      let M2 =
        (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) +
        ':'
      let S =
        date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
      return Y + M + D + H + M2 + S
    },
  },
  mounted() {},
}
</script>

<style scoped lang="scss">
.detailSta {
  padding: 20px;
}
.flex {
  display: flex;
}
.title {
  padding-bottom: 8px;
  border-bottom: 1px solid #dddddd;
  font-size: 14px;
  color: #555;
  align-items: center;
}
.fileDetail {
  width: 1018px;
  height: 840px;
  background: url('/static/images/dataAssets/statutoryBg.png');
  margin: 10px auto 0;
  border: 1px solid #dddddd;
  position: relative;
  .til {
    padding-top: 142px;
    text-align: center;
    font-size: 33px;
    font-weight: 800;
    line-height: 32px;
    p {
      font-size: 18px;
      line-height: 32px;
      margin-top: 10px;
    }
  }
  .enclosure {
    float: right;
    color: #409eff;
    margin-top: 79px;
    margin-right: 83px;
    line-height: 32px;
    font-size: 14px;
    cursor: pointer;
    div {
      margin-left: 10px;
      span {
        cursor: pointer;
        color: #409eff;
      }
      span:nth-child(1) {
        margin-right: 20px;
        position: relative;
        &:after {
          content: '';
          display: inline-block;
          position: absolute;
          top: 5px;
          right: -10px;
          width: 1px;
          height: 12px;
          background: #409eff;
        }
      }
    }
  }
  .staDetail {
    width: 802px;
    margin: 25px auto 0;
    font-size: 14px;
    line-height: 30px;
    li {
      width: 33.33%;
      display: flex;
      .decText {
        flex: 1;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: normal;
      }
    }
    .rightUl {
      float: right;
      li {
        width: 100%;
      }
    }
  }
}
.dec {
  min-height: 45px;
  word-break: break-all;
  width: 100%;
}
</style>
