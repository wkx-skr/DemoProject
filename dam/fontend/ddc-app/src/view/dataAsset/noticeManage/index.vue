<template>
  <div class="notice-manage">
    <template v-if="!showNoticeDetails">
      <div class="head">
        <span>公告信息管理</span>
        <datablau-button
          type="primary"
          class="iconfont icon-tianjia"
          @click="addNotice"
        >
          新建公告
        </datablau-button>
      </div>
      <div class="content">
        <datablau-form-submit style="top: 40px">
          <datablau-table :data="noticeList">
            <el-table-column
              label="名称"
              prop="name"
              min-width="200"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              label="更新时间"
              prop="updateTime"
            ></el-table-column>
            <el-table-column label="创建人" prop="creator"></el-table-column>
            <el-table-column
              label="操作"
              prop="creator"
              width="180px"
              align="center"
            >
              <template slot-scope="scope">
                <datablau-button
                  type="icon"
                  class="iconfont icon-see"
                  @click="seeDetails(scope.row)"
                ></datablau-button>
                <datablau-button
                  type="icon"
                  class="iconfont icon-bianji"
                  :disabled="scope.row.status === 'PUBLISHED'"
                  @click="editDetails(scope.row)"
                ></datablau-button>
                <datablau-button
                  type="icon"
                  class="iconfont icon-Offline"
                  :disabled="scope.row.status !== 'PUBLISHED'"
                  @click="offlineNotice(scope.row)"
                ></datablau-button>
                <datablau-button
                  :disabled="scope.row.status === 'PUBLISHED'"
                  type="icon"
                  class="iconfont icon-publish"
                  @click="publishNotice(scope.row)"
                ></datablau-button>
                <datablau-button
                  :disabled="scope.row.status === 'PUBLISHED'"
                  type="icon"
                  class="iconfont icon-delete"
                  @click="deleteNotice(scope.row)"
                ></datablau-button>
              </template>
            </el-table-column>
          </datablau-table>
          <template slot="buttons">
            <datablau-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page.sync="pagination.currentPage"
              :page-sizes="[20, 50, 100, 200]"
              :page-size="pagination.pageSize"
              layout="total, sizes, prev, jumper, next"
              :total="pagination.total"
              class="page"
            ></datablau-pagination>
          </template>
        </datablau-form-submit>
      </div>
    </template>

    <notice-details
      v-if="showNoticeDetails"
      :defaultData="currentDetails"
      :editable="detailEditable"
      @back="goBack"
    ></notice-details>
  </div>
</template>

<script>
import index from './index.js'
export default index
</script>

<style lang="scss" scoped>
.notice-manage {
  width: 100%;
  height: 100%;
  background: #fff;
  padding-left: 20px;
  padding-right: 16px;
  color: #555;
  .head {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    > span {
      font-size: 16px;
      font-weight: 600;
    }
  }
}
</style>
