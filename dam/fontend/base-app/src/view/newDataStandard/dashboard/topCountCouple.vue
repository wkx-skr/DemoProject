<template>
  <div class="top-count-item" :class="{ 'en-page': $i18n.locale !== 'zh' }">
    <div class="domain-top-box" @click="skip2">
      <p class="domain-count-item-title">{{ $t(showData.title) }}</p>
      <div class="bottom-part">
        <div class="info-container">
          <div class="left-box">
            <div class="text-box">
              <p class="info-label left-label">{{ $t(dataObj.label) }}</p>
              <p class="info-value left-value">{{ $t(dataObj.value) }}</p>
            </div>
          </div>
          <div class="right-box">
            <div class="text-box">
              <p class="info-label left-label">{{ $t(dataObj.label2) }}</p>
              <p class="info-value left-value">{{ $t(dataObj.value2) }}</p>
            </div>
          </div>
          <div class="center-line">
            <div class="left-triangle"></div>
            <div class="right-triangle"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'topCountCouple',
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
            label2: this.showData.label2,
            value: data[this.showData.prop],
            value2: data[this.showData.prop2],
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    skip2() {
      let para = {
        name: 'domain',
      }
      if (this.showData.name === 'codeTopCount') {
        para = {
          name: 'code',
        }
      } else if (this.showData.name === 'indexTopCount') {
        para = {
          name: 'index',
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
    top: auto;
    height: 90px;

    .info-container {
      //border: 1px solid red;
      position: absolute;
      left: 10px;
      right: 10px;
      top: 10px;
      bottom: 10px;
      border-radius: 2px;
      overflow: hidden;

      .text-box {
        position: absolute;
        top: 50%;
        width: 60px;
        line-height: 21px;
        transform: translateY(-50%);

        .info-label {
          color: #777777;
          line-height: 21px;
        }
      }

      .left-box {
        //border: 1px solid red;
        @include absPos();
        right: 50%;
        padding-left: 20px;
        background-color: rgba(109, 149, 255, 0.1);
      }

      .right-box {
        //border: 1px solid red;
        @include absPos();
        //left: 137px;
        left: 50%;
        padding-left: 33px;
        background-color: rgba(94, 84, 231, 0.1);
      }

      .center-line {
        background-color: #fff;
        z-index: 2;
        @include absPos();
        //border: 1px solid red;
        width: 40px;
        height: 100%;
        left: 50%;
        top: 0;
        bottom: 0;
        transform: translateX(-50%);

        .left-triangle {
          //border: 1px solid red;
          @include absPos();
          right: 10px;

          &::before {
            @include absPos();
            content: '';
            border-top: 70px solid rgba(109, 149, 255, 0.1);
            border-right: 30px solid transparent;
          }
        }

        .right-triangle {
          //border: 1px solid red;
          @include absPos();
          left: 10px;

          //padding-left: 53px;

          &::before {
            content: '';
            @include absPos();

            border-bottom: 70px solid rgba(94, 84, 231, 0.1);
            border-left: 30px solid transparent;
          }
        }
      }
    }
  }

  &.en-page {
    .left-label {
      //border: 1px solid red;
      width: 120px;
    }
  }
}
</style>
