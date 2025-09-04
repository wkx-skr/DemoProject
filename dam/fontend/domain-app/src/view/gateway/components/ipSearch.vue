<template>
  <div class="ip-search">
    <datablau-list-search>
      <template slot="title">
        <div>IP 检索</div>
      </template>
      <div>
        <el-form ref="form" class="form-search">
          <el-form-item label="">
            <datablau-input
              clearable
              type="text"
              v-model="form.start"
              @blur="handleBlur"
              @input="handleInput"
              placeholder="请输入ip"
            ></datablau-input>
            <div class="error-tip" v-if="!isIp">{{ ipTip }}</div>
          </el-form-item>
          <el-form-item :label="ipName">
            <el-input
              size="small"
              style="width: 80px"
              :disabled="!isIp"
              oninput="value = value.replace(/[^0-9.]/g,'')"
              maxlength="3"
              clearable
              type="text"
              v-model="form.end"
              placeholder="ip段"
            ></el-input>
            <div class="error-tip" v-if="showError">ip段不能小于第一个</div>
          </el-form-item>
        </el-form>
      </div>
      <template slot="buttons">
        <datablau-button
          type="normal"
          @click="formSearch"
          :disabled="isDisabled || !isLast"
        >
          扫描
        </datablau-button>
        <datablau-button type="normal" @click="stopSearch">
          停止扫描
        </datablau-button>
      </template>
    </datablau-list-search>
    <div class="ip-content">
      <div class="title">
        扫描结果：
        <span v-if="!isLast" style="color: #409eff">
          扫描中...
          <i class="el-icon-loading"></i>
        </span>
      </div>
      <div class="content">
        <p v-for="(item, index) in allList" :key="index">{{ item }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import ipSearch from './ipSearch.js'
export default ipSearch
</script>

<style scoped lang="scss">
.ip-search {
  padding: 0 20px;
  min-height: 100vh;
  background-color: #fff;

  .form-search {
    /deep/ .el-form-item {
      .el-form-item__content {
        position: relative;
        .el-input__inner {
          height: 34px;
          line-height: 34px;
          border-radius: 2px;
          padding-left: 10px;
        }
        .error-tip {
          position: absolute;
          bottom: -14px;
          left: 0;
          height: 14px;
          line-height: 14px;
          font-size: 12px;
          color: red;
        }
      }
    }
  }
  .ip-content {
    .title {
      line-height: 34px;
      font-size: 12px;
    }
    .content {
      border: 1px solid #409eff;
      border-radius: 5px;
      min-height: 300px;
      padding: 10px;
      box-sizing: border-box;
      overflow-y: auto;
      p {
        line-height: 24px;
      }
    }
  }
}
</style>
