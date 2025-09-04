<template>
  <div class="db-richtip">
    <div class="topInfo">
      <datablau-icon
        class="topIcon"
        data-type="system"
        icon-type="png"
      ></datablau-icon>
      <div class="info">
        <div class="code" style="margin-bottom: 10px;">{{ fullData.categoryName }}</div>
        <datablau-form
          class="info-form"
          label-width="6em"
          label-position="right"
          style="margin-top: 15px"
        >
          <el-form-item
            class="info-form-span form_oneline"
            :label="$t('meta.modelCategory.' + p)"
            v-for="p in [
              'categoryAbbreviation',
              'itDepartment',
              'businessDepartment',
              'importance',
              'zone',
              'owner',
              'deployment',
            ]"
            :key="p"
          >
            <datablau-tooltip
              class="item"
              effect="dark"
              :content="fullData[p]"
              placement="top-start"
              :open-delay="200"
            >
              <span class="nowrap-span">{{ fullData[p] }}</span>
            </datablau-tooltip>
          </el-form-item>
        </datablau-form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    dataId: {},
  },
  data() {
    return {
      fullData: {},
    }
  },
  mounted() {
  },
  methods: {
    getData() {
      this.fullData = this.$modelCategoriesDetailsMap[this.dataId]
      console.log(this.fullData)
    },
  },
}
</script>

<style lang="scss">
@import '../../../basic/color.sass';
.db-richtip {
  .info {
    .info-form {
      max-width: 412px;
      margin-top: 0 !important;
      .info-form-span {
        margin: 0;
        line-height: 30px;
        height: 30px;
        .item {
          width: 100%;
        }
        .el-form-item__label {
          line-height: 20px;
          padding-right: 0 !important;
          font-size: 12px;
          font-family: PingFangSC, PingFangSC-Regular;
          font-weight: 400;
          color: $grey-2;
        }
        .el-form-item__content {
          font-size: 12px;
          font-family: PingFangSC, PingFangSC-Regular;
          font-weight: 400;
          color: $grey-2;
          line-height: 20px;
          position: relative;
          top: 0px;
          left: 10px;
          .nowrap-span {
            width: 100%;
            display: inline-block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 20px;
          }
        }
      }
    }
  }
  .table-box {
    .el-table.datablau-table td {
      height: 32px;
    }
  }
  .showMore {
    margin-left: calc(50% - 24px);
    display: inline-block;
    height: 24px;
    line-height: 24px;
  }
}
</style>
