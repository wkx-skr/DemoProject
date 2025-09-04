<template>
  <div class="ddl-setting-list-tab">
    <div class="top-header-info-panel-wrapper">
      <b>DDL 配置</b>
    </div>
    <div class="search-line">
      <datablau-input
        size="small"
        :iconfont-state="true"
        prefix-icon="el-icon-search"
        v-model="keyword"
        placeholder="搜索模型类型"
        clearable
        style="vertical-align: top;line-height:34px; width: 240px;"
      ></datablau-input>
      <div class="type-change">
        <datablau-tabs type="card" v-model="showType">
          <el-tab-pane name="list">
            <span slot="label"><i class="iconfont icon-lie"></i></span>
          </el-tab-pane>
          <el-tab-pane name="card">
            <span slot="label"><i class="iconfont icon-kapian"></i></span>
          </el-tab-pane>
        </datablau-tabs>
      </div>
    </div>
    <div class="db-ddl-setting-list">
      <div class="card-container" v-if="showType === 'card'">
        <div class="db-item-card" v-for="item in showTableData" :key="item.text">
          <div class="card-item">
            <div class="top-box">
              <div class="logo-container">
                <db-logo :db-type="item.text"></db-logo>
              </div>
              <div class="db-min-logo">
                <database-type
                  :value="item.text"
                  :key="item.text"
                  :hideLabel="true"
                  :size="24"
                ></database-type>
              </div>
              <span class="db-name">
                <datablau-tooltip
                  :content="item.text"
                  :autoHide="true"
                  :key="item.text + '_db'"
                >
                <span class="type-text">{{ item.text }}</span>
              </datablau-tooltip>
              </span>
              <div class="edit-container">
                <datablau-button
                  type="icon"
                  tooltip-content="脚本配置"
                  class="iconfont icon-bianji edit-icon"
                  @click="editDdl(item)"
                >
                </datablau-button>
              </div>
            </div>
            <div class="bottom-box">
              <p class="info-item">
                <span class="label">配置人：</span>
                <span class="info-text">{{ item.lastModifier }}</span>
              </p>
              <p class="info-item">
                <span class="label">配置时间：</span>
                <span class="info-text">{{ $timeFormatter(item.lastModifyTime) }}</span>
              </p>
            </div>

          </div>
        </div>
      </div>
      <div class="list-container" v-if="showType === 'list'">
        <datablau-form-submit>
          <datablau-table
            ref="templateList"
            class="project-data-list"
            :data="tableData"
            @sort-change="handleSortChange"
            height="100%"
            row-key="id"
            :data-selectable="false"
            :show-column-selection="false"
          >
            <el-table-column
              label="模型类型"
              prop="text"
              sortable="custom"
              min-width="100"
            >
              <template slot-scope="scope">
                <database-type :value="scope.row.type" :key="scope.row.type"></database-type>
              </template>
            </el-table-column>
            <el-table-column
              label="配置人"
              prop="lastModifier"
              min-width="100"
            >
            </el-table-column>
            <el-table-column
              label="配置时间"
              prop="lastModifyTime"
              sortable="custom"
              min-width="100"
            >
              <template slot-scope="scope">
                {{ $timeFormatter(scope.row.lastModifyTime) }}
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="80"
              fixed="right"
              header-align="center"
              align="center"
            >
              <template slot-scope="scope">
                <datablau-button
                  type="icon"
                  tooltip-content="编辑"
                  class="iconfont icon-bianji edit-icon"
                  @click="editDdl(scope.row)"
                >
                </datablau-button>
              </template>
            </el-table-column>
          </datablau-table>
          <template slot="buttons">
            <!--<div v-if="multipleSelection.length" style="float: left">-->
            <!--</div>-->
            <datablau-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[20, 50, 100]"
              :page-size="pageSize"
              :total="total"
              :layout="'total, sizes, prev, pager, next, jumper'"
            ></datablau-pagination>
          </template>
        </datablau-form-submit>
      </div>
    </div>
  </div>
</template>

<script>
import dbType from '@/components/dataSource/databaseType'
import dbLogo from '@/components/dataSource/dbLogo.vue'
import paginationMixin from '@/components/common/mixin/paginationMixin.js'
import DatabaseType from '@/components/common/DatabaseType.vue'
import HTTP from '@/resource/http'

export default {
  name: 'dbBoard',
  data () {
    return {
      showType: 'list',
      searchProps: ['text'],
      configData: {}
      // allData: []
      // keyword: ''
    }
  },
  components: {
    dbLogo,
    DatabaseType
  },
  mixins: [paginationMixin],
  computed: {
    showTableData () {
      let keyword = _.trim(this.keyword)
      return this.allData?.filter(item => this.$MatchKeyword(item, keyword, 'text')) || []
    }
  },
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      this.refreshData()
    },
    refreshData () {
      HTTP.getAllScriptOption()
        .then(res => {
          this.configData = res
          this.allData = dbType.SQL_DB_LIST.concat(dbType.NO_SQL_DB_LIST).map(item => {
            return {
              text: item.text,
              type: item.text,
              lastModifier: ((this.configData[item.second] || [{}])[0] || {}).lastModifier || '',
              lastModifyTime: ((this.configData[item.second] || [{}])[0] || {}).lastUpdateTime || ''
            }
          })
          this.getData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getData () {
      this.getDataFromAll()
    },
    editDdl (data) {
      this.$emit('editDdlSetting', { dbType: data.text === 'GaussDB' ? 'GaussDBA' : data.text })
    }
  },
  watch: {}
}
</script>

<style lang="scss" scoped>
@import "~@/next/components/basic/color.sass";

.ddl-setting-list-tab {
  .top-header-info-panel-wrapper {
    height: 40px;
    line-height: 40px;
    //margin-top: -20px;
    vertical-align: top;
    padding-left: 20px;
  }

  .search-line {
    padding-left: 20px;

    .type-change {
      float: right;
      margin-right: 20px;

      /deep/ .el-tabs__item {
        padding-top: 1px;
      }
    }
  }

  .db-ddl-setting-list {
    position: absolute;
    left: 0px;
    right: 0px;
    top: 75px;
    bottom: 0px;
    overflow-y: auto;
    padding-right: 20px;

    .card-container {
      margin: 0 10px;
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      flex-direction: row;
    }

    $transitionTime: .4s;

    .db-item-card {
      display: inline-block;
      width: 25%;
      padding: 10px;
      //border: 1px solid red;

      .card-item {
        transition: all $transitionTime;
        border: 1px solid #DDDDDD;
        border-radius: 2px;
        position: relative;
        height: 80px;
        margin: 13px 0;
        overflow: hidden;

        .top-box {
          height: 100%;
          box-sizing: border-box;
          transition: all $transitionTime;
          //padding-left: 5px;
        }

        .bottom-box {
          padding-left: 18px;
          line-height: 20px;
          padding-top: 8px;
          height: 0;
          overflow: hidden;
          visibility: hidden;
          color: #fff;
          transition: color 1s ease-in;
        }

        .db-min-logo {
          position: absolute;
          margin-top: 13px;
          display: none;
        }
      }

      .logo-container {
        display: inline-block;
        margin-top: 15px;
        position: absolute;
        left: 0;
        top: 0;
      }

      .db-name {
        position: relative;
        font-size: 16px;
        color: #555555;
        vertical-align: top;
        display: inline-block;
        line-height: 80px;
        padding-left: 120px;
        width: 100%;
        height: 100%;

        .type-text {
          display: inline-block;
          width: 100%;
          text-overflow: ellipsis;
          overflow: hidden;
          word-break: break-all;
          white-space: nowrap;
        }
      }

      .edit-container {
        display: inline-block;
        //display: none;
        position: absolute;
        right: 0px;
        top: 0px;
        line-height: 48px;
        width: 0;
        transition: all $transitionTime;

        .edit-icon {
          //display: none;
          margin-right: 17px;
          width: 32px;
          height: 32px !important;
          line-height: 32px !important;
          border-radius: 50%;
          transition: all $transitionTime;

          color: rgb(255, 255, 255);
          background-color: rgb(255, 255, 255);
        }
      }

      & .card-item:hover {
        //& .card-item {
        border-color: $primary-color;
        height: 106px;
        margin: 0;
        box-shadow: 0 0 4px 1px rgba(0, 0, 0, 0.2);

        .top-box {
          height: 50px;
          padding-left: 16px;
          padding-right: 55px;
        }

        .db-min-logo {
          display: inline-block;
        }

        .bottom-box {
          height: 56px;
          visibility: visible;
          border-top: 1px solid #DDD;
          color: #555;
        }

        .edit-container {
          display: inline-block;
          width: auto;

          .edit-icon {
            display: inline-block;

            color: $click-color;
            background-color: rgba(64, 158, 255, 0.1);
          }

          //background-color: rgba(64, 158, 255, 0.1);
        }

        .logo-container {
          visibility: hidden;
          display: inline-block;
          width: 0;
        }

        .db-name {
          width: 100%;
          line-height: 50px;
          padding-left: 40px;
        }
      }
    }
  }
}
</style>
