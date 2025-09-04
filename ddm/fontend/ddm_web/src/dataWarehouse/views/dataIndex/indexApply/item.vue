<template>
  <div class="item">
    <datablau-dialog
      :title="$t('indicator.apply.dialogTitle')"
      size="l"
      :visible.sync="showFilter"
      :show-close="false"
      height="500px"
    >
      <div>
        <datablau-form
          ref="form"
          label-width="10em"
          :model="formData"
          :rules="rules"
        >
          <el-form-item
            :label="$t('indicator.apply.subTitle')"
            style="margin-bottom: 0"
          >
            <datablau-button
              type="important"
              class="iconfont icon-tianjia"
              style="float: right; margin-bottom: 10px"
              @click="addQuery"
            >
              {{ $t('indicator.apply.newCondition') }}
            </datablau-button>
          </el-form-item>
          <el-form-item label-width="0">
            <div style="">
              <function-graph
                :key="graphKey"
                @update="updateFunction"
                :raw-data="filterData"
                :metricoption="metricoption"
              ></function-graph>
            </div>
          </el-form-item>
        </datablau-form>
      </div>
      <div slot="footer">
        <datablau-button type="secondary" @click="cancel">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="primary" @click="save">
          {{ $t('common.button.save') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <div class="row-filter">
      <div class="filter" id="filter" style="position: relative">
        <div
          style="padding-right: 50px; padding-left: 20px; display: inline-block"
        >
          <div style="position: absolute; top: 10px; left: 0">
            <span>{{ $t('meta.report.dimension') }}</span>
          </div>
          <el-tag
            v-for="tag in tags"
            :key="tag.metricMappingId"
            closable
            :style="{ marginLeft: $i18n.locale === 'en' ? '55px' : '10px' }"
            @close="handleClose(tag)"
          >
            {{ tag.attrInfo }}
          </el-tag>
        </div>
        <div style="position: absolute; top: 10px; right: 0">
          <el-button
            plain
            type="warning"
            style="padding: 0px 7px; float: right; font-size: 16px"
            icon="el-icon-delete"
            @click="clickDelete"
          ></el-button>
          <i
            class="el-icon-s-tools"
            style="
              float: right;
              font-size: 25px;
              margin-right: 10px;
              cursor: pointer;
              margin-top: 5px;
            "
            @click="clickFilter"
          ></i>
        </div>
      </div>
      <div class="filter" id="filter2" style="position: relative">
        <div
          style="padding-right: 50px; padding-left: 20px; display: inline-block"
        >
          <div style="position: absolute; top: 10px; left: 0">
            <span>{{ $t('meta.report.index') }}</span>
          </div>
          <el-tag
            v-for="tag in tags1"
            :key="tag.metricMappingId"
            closable
            :style="{ marginLeft: $i18n.locale === 'en' ? '55px' : '10px' }"
            @close="handleClose1(tag)"
          >
            {{ tag.attrInfo }}
          </el-tag>
        </div>
        <div style="position: absolute; top: 10px; right: 0">
          <el-button
            plain
            type="warning"
            style="padding: 0px 7px; float: right; font-size: 16px"
            icon="el-icon-delete"
            @click="clickDelete1"
          ></el-button>
          <!-- <el-button
            plain
            type="primary"
            style="
              padding: 0px 7px;
              float: right;
              font-size: 16px;
              margin-right: 10px;
            "
            icon="el-icon-search"
            @click="search"
          ></el-button> -->
        </div>
      </div>
    </div>
    <div class="table" id="table" v-if="mappingName && mappingName.length > 0">
      <datablau-table :data="tableData" height="100%">
        <el-table-column
          v-for="(item, i) in mappingName"
          :key="i"
          min-width="150"
          :label="mappingName[i]"
          :prop="mappingName[i]"
          show-overflow-tooltip
        >
          <template slot="header" slot-scope="scope">
            <div style="position: relative; padding-right: 15px">
              <span
                :title="mappingName[i]"
                style="
                  max-width: 100%;
                  display: inline-block;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                "
              >
                {{ mappingName[i] }}
              </span>
              <el-dropdown
                @command="handleClick"
                trigger="click"
                class="orderBy"
                style="position: absolute; top: 0px; right: 0px"
              >
                <span class="el-dropdown-link">
                  <i class="el-icon-s-tools el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="beforhandle('Asc', scope.$index)">
                    {{ $t('indicator.apply.asc') }}
                  </el-dropdown-item>
                  <el-dropdown-item :command="beforhandle('Des', scope.$index)">
                    {{ $t('indicator.apply.des') }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </template>
          <template slot-scope="scope">
            {{ scope.row[i] }}
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <div class="row-page-info">
      <datablau-pagination
        v-if="true"
        style="padding-top: 10px; float: right"
        class="ddc-pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[20, 50, 100, 500]"
        :page-size="pageSize"
        layout="sizes, prev, pager, next"
        :total="totalItems"
      ></datablau-pagination>
    </div>
  </div>
</template>

<script>
import item from './item.js'
export default item
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.item {
  padding-top: 10px;
  padding-right: 20px;
  .row-filter {
    //background-color: #eee;
    border-bottom: 1px solid #eee;
    font-size: 16px;
    .filter {
      padding: 10px 20px;
      line-height: 30px;
    }
  }
  .table {
    position: absolute;
    bottom: 50px;
    left: 20px;
    right: 20px;
    top: 120px;
    // transition: top 0.5s ease-in-out;
  }
  .row-page-info {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 30px;
    height: 50px;
    padding-left: 26px;
    margin-right: -20px;
    padding-right: 40px;
    margin-left: -30px;
    overflow-x: visible;
    overflow-y: hidden;
    line-height: 50px;
    border-top: 1px solid var(--border-color-lighter);
    box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
    .check-info {
      display: inline-block;
      width: 14px;
      height: 14px;
      vertical-align: middle;
      background: $primary-color;
    }
    .footer-row-info {
      margin-right: 10px;
      &::before {
        margin-right: 5px;
        margin-left: -13px;
        font-family: 'element-icons';
        font-size: 12px;
        font-weight: 200;
        line-height: 13px;
        color: white;
        vertical-align: middle;
        content: '\e6da';
      }
    }
  }
}
//点击文字出现蓝色底色去掉
.deleteBlue {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
