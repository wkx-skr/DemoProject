<template>
  <div id="home-page">
    <div class="home-container">
      <div class="title">
        欢迎回来
        <span class="blue-name">{{ $user.username }}</span>
        <div class="span">|</div>
        <div class="about-message">您有0条新消息</div>
      </div>
      <div class="search-input">
        <div class="input-outer">
          <input
            type="text"
            v-model="searchVal"
            placeholder="搜索"
            @keydown.enter="search()"
          />
          <i class="icon-ic-left-search" @click="search()"></i>
        </div>
      </div>
      <div class="link-container">
        <div
          class="link-box"
          v-if="$isDataAdmin"
          @click="goPreview('dataSource')"
        >
          <div class="icon">
            <i class="icon-ic-left-datasource"></i>
          </div>
          <div class="caption">添加数据源</div>
        </div>
        <div
          class="link-box"
          v-if="$isUserAdmin"
          @click="goPreview('userManagement')"
        >
          <div class="icon">
            <i class="icon-ic-left-user"></i>
          </div>
          <div class="caption">添加用户</div>
        </div>
        <div class="link-box" @click="goPreview('qualityTask')">
          <div class="icon">
            <i class="icon-ic-left-standard"></i>
          </div>
          <div class="caption">查看质量任务</div>
        </div>
        <div class="link-box" @click="goPreview('dataStandard')">
          <div class="icon">
            <i class="icon-ic-left-dataStandard"></i>
          </div>
          <div class="caption">查看数据标准</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      a: 1,
      searchVal: '',
    }
  },
  methods: {
    goPreview(state) {
      this.$router.push({ name: state })
    },
    search() {
      const val = this.searchVal
      this.$router.push({
        name: 'dataCatalog',
        query: { keyword: val, type: 'all' },
      })
    },
  },
}
</script>

<style scoped lang="scss">
@import '../../assets/styles/const.scss';
#home-page {
  .home-container {
    width: 800px;
    /*height:500px;*/
    /*outline:1px solid pink;*/
    margin: 150px auto;
    .title {
      text-align: center;
      font-size: 16px;
      color: $default-color;
      margin-bottom: 50px;
      .blue-name {
        color: $blue;
      }
      .span {
        color: $grey-2;
        font-size: 12px;
        display: inline-block;
        margin: -4px 5px 0;
      }
      .about-message {
        display: inline-block;
        font-size: 12px;
        color: $aux-color;
      }
    }
    .search-input {
      .input-outer {
        border: 1px solid $grey-2;
        width: 800px;
        height: 40px;
        background: #fff;
      }
      input {
        margin: 0 10px 0 20px;
        width: 730px;
        height: 40px;
        font-size: 16px;
      }
      i {
        font-size: 16px;
        position: relative;
        display: inline-block;
        top: 2px;
        color: $default-color;
        cursor: pointer;
        &:hover {
          transform: translateY(-1px);
          /*font-weight: bold;*/
        }
      }
    }
    .link-container {
      margin-top: 20px;
      .link-box {
        width: 190px;
        height: 180px;
        display: inline-block;
        margin-left: 9px;
        &:first-child {
          margin-left: 0;
        }
        background: #fff;
        cursor: pointer;
        &:hover {
          box-shadow: 0 0 6px 2px $grey-2;
          transform: translateY(-3px);
        }
        .icon {
          text-align: center;
          padding-top: 50px;
          font-size: 45px;
          color: $aux-color;
        }
        .caption {
          position: relative;
          left: -3px;
          text-align: center;
          margin-top: 10px;
          color: $default-color;
          font-size: 14px;
        }
      }
    }
  }
}

$aux-color: #777f9e;
::-webkit-input-placeholder {
  /* WebKit browsers */
  font-size: 14px;
  color: $aux-color;
}
:-moz-placeholder {
  /* Mozilla Firefox 4 to 18 */
  font-size: 14px;
  color: $aux-color;
}
::-moz-placeholder {
  /* Mozilla Firefox 19+ */
  font-size: 14px;
  color: $aux-color;
}
:-ms-input-placeholder {
  /* Internet Explorer 10+ */
  font-size: 14px;
  color: $aux-color;
}
</style>
