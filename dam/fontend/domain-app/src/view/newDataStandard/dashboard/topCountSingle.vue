<template>
  <div class="top-count-item" :class="{ 'en-page': $i18n.locale !== 'zh' }">
    <div class="domain-top-box" @click="skip2">
      <p class="domain-count-item-title">{{ $t(showData.title) }}</p>
      <div class="bottom-part">
        <div class="info-container">
          <div class="info-box">
            <span class="item-label">{{ $t(dataObj.label) }}</span>
            <span class="item-value">{{ $t(dataObj.value) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'topCountSingle',
  data() {
    return {
      getData: null,
      dataObj: {},
    }
  },
  props: {
    showData: {
      type: Object,
      required: true,
    },
  },
  components: {},
  computed: {},
  mounted() {
    this.getData = this.showData.getData()
    this.dataInit()
  },
  methods: {
    dataInit() {
      this.getData
        .then(res => {
          let data = res
          // console.log(data, 'data')
          // console.log(this.showData, 'this.showData')
          this.dataObj = {
            label: this.showData.label,
            value: data[this.showData.prop],
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    skip2() {
      console.log(this.showData, 'this.showData')
      let para = {
        name: 'glossary',
      }
      if (this.showData.name === 'dimTopCount') {
        para = {
          name: 'dataStandardField',
        }
      }
      this.$skip2(para, 'dam')
    },
  },
  watch: {},
}
</script>

<style lang="scss" scoped>
@mixin absPos {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.top-count-item {
  position: relative;
  //border: 1px solid red;
  width: 100%;
  height: 100%;
  background-color: #fff;
  overflow: auto;

  .domain-top-box {
    position: relative;
    min-width: 200px;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  .domain-count-item-title {
    width: 100%;
    //height: 14px;
    font-size: 14px;
    //font-family: PingFangSC-Medium, PingFang SC;
    font-weight: bold;
    color: #555555;
    line-height: 14px;
    padding: 14px 0 0 10px;
  }

  .bottom-part {
    @include absPos();
    //top: 34px;
    top: auto;
    height: 90px;

    .info-container {
      //border: 1px solid red;
      position: absolute;
      left: 10px;
      right: 10px;
      top: 10px;
      bottom: 10px;
      background: rgba(94, 84, 231, 0.1);
      border-radius: 2px;
      color: #777;
      vertical-align: middle;

      .info-box {
        display: inline-block;
        vertical-align: middle;
        position: absolute;
        top: 50%;
        width: 100%;
        text-align: center;
        transform: translateY(-50%);

        .item-label {
          display: inline-block;
          //border: 1px solid red;
          text-align: left;
          margin-left: 10px;
          width: 80px;
        }

        .item-value {
          display: inline-block;
          width: 50px;
          text-align: right;
        }
      }
    }
  }

  &.en-page {
    .bottom-part .info-container {
      .item-label {
        width: 180px;
      }
    }
  }
}
</style>
