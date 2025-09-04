<template>
  <div class="page-outer width-1440">
    <div class="page-container">
      <div class="content-tree">
        <com-tree
          ref="listTree"
          @node-click="handleNodeClick"
          @update-path="handleUpdatePath"
        ></com-tree>
      </div>
      <div class="resize-column-middle"></div>
      <div class="right-part">
        <datablau-button
          type="important"
          class="title-btn iconfont icon-menu-blsx"
          v-show="titleBtnShow"
          @click="skipBussCatelog"
        >
          目录管理
        </datablau-button>
        <div class="content-nav">
          <div id="calculate-width" class="top-bread-crumb">
            <datablau-breadcrumb
              class="search-bread-info"
              :node-data="displayPath"
              @nodeClick="nodeClick"
              :showBack="false"
              separator="/"
            ></datablau-breadcrumb>
            <div class="com-tag-box">
              <span class="tag-group-label">资产类型</span>
              <datablau-input
                class="search-input-info"
                style=""
                placeholder="搜索关键字"
                :iconfont-state="true"
                v-model="keyword"
                @keyup.native.enter="search"
                @focus_todo="handleInputFocus"
                @blur_todo="handleInputBlur"
                clearable
              ></datablau-input>
              <datablau-checkbox
                v-model="selectedDataTypes"
                class="tag-checkbox-group top-filter-checkbox"
                :class="{
                  'has-any-tag': showTagFilter,
                }"
                @change="handleDataTypeChange"
              >
                <el-checkbox
                  class="tag-checkbox"
                  v-for="s in dataTypes"
                  :key="s.label"
                  :label="s.typeId"
                >
                  <span>{{ s.label }}</span>
                </el-checkbox>
              </datablau-checkbox>
              <div
                v-if="showTagFilter"
                @click="filterPopoverVisible = true"
                slot="reference"
                class="filter-header-info"
              >
                <i class="iconfont icon-filter"></i>
                标签过滤
              </div>
              <div
                v-if="filterPopoverVisible"
                @click="filterPopoverVisible = false"
                slot="reference"
                ref="filter-header-btn"
                class="filter-header-info active"
              >
                <i class="iconfont icon-filter"></i>
                收起过滤
              </div>
              <!--<el-popover
                placement="bottom-end"
                :width="$data.$window.innerWidth > 1440 ? 1100 : $data.$window.innerWidth - 360"
                trigger="manual"
                v-model="filterPopoverVisible">
              </el-popover>-->
            </div>
            <div class="com-tag-box" v-for="f in tagsDisplay" :key="f.id">
              <span class="tag-group-label">{{ f.name }}</span>
              <datablau-checkbox
                v-model="f.selection"
                class="tag-checkbox-group"
                @change="handleTagChange"
              >
                <el-checkbox
                  class="tag-checkbox"
                  v-for="s in f.children"
                  :key="s.tagId"
                  :label="s"
                >
                  <span>{{ s.name }}</span>
                </el-checkbox>
              </datablau-checkbox>
            </div>

            <!--<template v-for="f in tags">
              <div
                v-if="f.selection.length > 0"
                class="rect-tag"
              ><span style="display:inline-block;position:relative;top:-1px;">{{f.name}}: </span><span v-for="(s,i) in f.selection" class="single-tag">{{s.name}}
                <span class="close el-icon-close" @click="removeTag(i,f.selection)"></span></span
              ></div>
            </template>-->
          </div>
          <!--<div class="create-required-line">
            <span>若搜索结果不满意，点击<span class="create-required-btn" @click="skip2Required">创建数据需求</span></span>
          </div>-->
        </div>
        <div class="middle-tag-box">
          <div
            class="content-sort"
            :class="
              selectedTagMoudleLen && tagIds && tagIds.length > 0
                ? 'tag-filtered'
                : ''
            "
            style="top: 0"
          >
            <el-checkbox
              v-for="(v, k) in sort"
              :key="k"
              class="rect-checkbox dark condense"
              v-model="sort[k]"
              style="margin-right: 8px"
              @change="handleCheckboxChange(k, ...arguments)"
            >
              <i class="iconfont icon-paixu" v-if="sortLabel[k] === '综合'"></i>
              <i class="el-icon-star-off" v-if="sortLabel[k] === '评分'"></i>
              <i
                class="iconfont icon-chakan"
                v-if="sortLabel[k] === '浏览量'"
              ></i>
              <span>{{ sortLabel[k] }}</span>
            </el-checkbox>
            <datablau-input
              class="ddc-rect-input right-join"
              placeholder="目录内搜索"
              disabled
              v-if="false"
            ></datablau-input>
            <datablau-button
              v-if="false"
              class="rect-btn"
              disabled
              style="margin-right: 10px"
            >
              {{ $t('common.button.ok') }}
            </datablau-button>
          </div>
          <div
            class="com-tag-box target"
            id="tag-target"
            v-if="
              (moreTags &&
                Object.keys(moreTags).length > 0 &&
                moreTags.filter(i => i.selection.length > 0).length > 0) ||
              udps.filter(i => udpValue[i.id] && udpValue[i.id].length > 0)
                .length > 0
            "
          >
            <!--              <span class="tag-group-label">过滤</span>-->
            <!-- 每个小模块tag的详情 -->
            <el-popover
              v-for="f in moreTags"
              v-if="f.selection.length > 0"
              :key="f.id"
              placement="bottom-start"
              width="600"
              trigger="click"
            >
              <div
                style="
                  display: flex;
                  padding: 20px;
                  line-height: 2em;
                  overflow-x: auto;
                "
              >
                <div
                  class="remove-info"
                  v-if="f.selection.length > 0"
                  @click="cancelTagFilter(f)"
                >
                  清除
                </div>
                <datablau-checkbox
                  v-model="f.selection"
                  class="tag-checkbox-group"
                  style="display: inline-block"
                  @change="handleTagChange(f.selection)"
                >
                  <el-checkbox
                    class="tag-checkbox"
                    v-for="s in f.children"
                    :key="s.tagId"
                    :label="s"
                    @change="handleTagCheckboxChange(s)"
                  >
                    <span v-if="s.name.length <= 10">{{ s.name }}</span>
                    <el-tooltip v-else :content="s.name" placement="top">
                      <span>{{ s.name.slice(0, 10) }}...</span>
                    </el-tooltip>
                  </el-checkbox>
                </datablau-checkbox>
              </div>
              <!-- 展示的过滤标签，可点击下拉选择更改 -->
              <span slot="reference" class="more-tag-btn">
                {{ f.name }}{{ tagsLabel(f.selection) }}
                <i class="el-icon-arrow-down"></i>
              </span>
            </el-popover>
            <!-- 所有标签，点击标签过滤的下拉 -->
            <el-popover
              v-for="u in udps"
              v-if="udpValue[u.id] && udpValue[u.id].length > 0"
              :key="'udp' + u.id"
              placement="bottom"
              width="600"
              trigger="click"
              :open-delay="500"
            >
              <div>
                <template v-if="u.selection && u.selection.length > 0">
                  <el-checkbox
                    @change="handleUdpValueChange(udpValue[u.id])"
                    v-model="udpValue[u.id]"
                    v-for="s in u.selection.filter(i => i)"
                    :key="s"
                    :label="s"
                    :value="s"
                  >
                    <span v-if="s.length <= 10">{{ s }}</span>
                    <el-tooltip v-else :content="s" placement="top">
                      <span>{{ s.slice(0, 10) }}...</span>
                    </el-tooltip>
                  </el-checkbox>
                </template>
                <span
                  v-if="!u.selection || u.selection.filter(i => i).length === 0"
                >
                  没有可选值
                </span>
                <datablau-button
                  v-if="udpLabel(u.id, udpValue[u.id])"
                  type="text"
                  size="small"
                  style="margin-left: 20px"
                  @click="cancelUdpFilter(u.id)"
                >
                  取消过滤
                </datablau-button>
              </div>
              <span
                slot="reference"
                class="more-tag-btn"
                @click="getUdpValues(u)"
              >
                {{ u.name }}{{ udpLabel(u.id, udpValue[u.id]) }}
                <i class="el-icon-arrow-down"></i>
              </span>
            </el-popover>
          </div>
          <div class="tag-collapse" v-show="showTagCollapse">
            <datablau-button
              type="text"
              size="small "
              @click="handleTagCollapse(true)"
            >
              展开标签
              <i class="el-icon-arrow-down"></i>
            </datablau-button>
          </div>
          <div id="tag-folder" v-show="showTagFolder">
            <datablau-button
              type="text"
              size="small"
              @click="handleTagCollapse(false)"
            >
              收起标签
              <i class="el-icon-arrow-up"></i>
            </datablau-button>
          </div>
        </div>
        <div class="content-list" ref="contentList" v-loading="contentLoading">
          <list-detail
            v-for="table in tables"
            :key="
              table.name +
              table.code +
              table.domainId +
              table.objectId +
              'AND' +
              listKey
            "
            :data="table"
            :catalogPath="catalogPath"
            :keyword="keyword"
          ></list-detail>
          <div
            style="
              text-align: center;
              height: 100%;
              padding-top: 1px;
              position: relative;
            "
            v-if="!contentLoading && tables.length === 0"
          >
            <img
              src="../../assets/images/search/no-result.svg"
              alt="当前关键字搜索无结果"
              style="
                width: 200px;
                position: absolute;
                top: 50%;
                left: 50%;
                margin: -100px 0 0 -100px;
              "
            />
          </div>
        </div>
        <div class="content-pagination">
          <datablau-pagination
            class="ddc-pagination"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage"
            :page-sizes="[10, 20, 50]"
            :page-size="pageSize"
            layout=" total,prev, pager, next,total,sizes"
            :total="totalItems"
          ></datablau-pagination>
        </div>
        <div
          ref="filter-popover"
          class="filter-popover-all"
          v-show="filterPopoverVisible"
        >
          <div
            style="
              position: absolute;
              right: 0;
              top: -1px;
              width: 69px;
              height: 1px;
            "
          ></div>
          <!-- <datablau-input
            prefix-icon="el-icon-search"
            class="search-input"
            placeholder="搜索过滤项"
            size="small"
            v-model="tagFilterKeyword"
            clearable
          ></datablau-input>-->
          <!--<button
            type="button"
            aria-label="Close"
            class="el-dialog__headerbtn"
            style="top: 14px;"
            @click="filterPopoverVisible=false"
          ><i class="el-dialog__close el-icon el-icon-close"></i></button>-->

          <!-- 所有标签 -->
          <div
            class="all-tags"
            :style="{ 'max-height': $data.$window.innerHeight - 300 + 'px' }"
          >
            <div
              v-for="groupName in filterPopoverTableDataGroupName"
              :key="groupName"
              v-show="
                tagsVisible(groupName) &&
                filterPopoverTableDataDisplay
                  .filter(i => i.groupName === groupName)
                  .some(
                    t =>
                      (t.isUdp && !udpNoValueSet.has(String(t.id))) || !t.isUdp
                  )
              "
            >
              <div class="group-name">{{ groupName }}</div>
              <div
                v-for="t in filterPopoverTableDataDisplay.filter(
                  i => i.groupName === groupName
                )"
                v-show="
                  tagsVisible(groupName, t.tagName) &&
                  ((t.isUdp && !udpNoValueSet.has(String(t.id))) || !t.isUdp)
                "
                class="group-content"
              >
                <div class="tag-name">
                  <el-tooltip
                    placement="left"
                    :content="t.tagName"
                    :disabled="t.tagName.length <= 6"
                  >
                    <span
                      style="
                        display: inline-block;
                        max-width: 7em;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                      "
                    >
                      {{ t.tagName }}
                    </span>
                  </el-tooltip>
                  <visible
                    v-if="
                      isAdmin &&
                      t.isUdp &&
                      Object.keys(udpCollection).length > 0
                    "
                    v-model="udpCollection[t.id]"
                    @change="handleCollectionChange(t.isUdp)"
                    style="margin-top: 1px"
                  ></visible>
                  <visible
                    v-if="
                      isAdmin &&
                      !t.isUdp &&
                      Object.keys(tagCollection).length > 0
                    "
                    v-model="tagCollection[t.tagId]"
                    @change="handleCollectionChange(t.isUdp)"
                    style="margin-top: 1px"
                  ></visible>
                </div>
                <div class="tag-content">
                  <template
                    v-if="
                      t.isUdp &&
                      udpsMap[t.id] &&
                      udpsMap[t.id].selection &&
                      udpValue
                    "
                  >
                    <el-checkbox
                      @change="handleUdpValueChange"
                      v-model="udpValue[t.id]"
                      v-for="s in udpsMap[t.id].selection.filter(i => i)"
                      v-show="tagsVisible(groupName, t.tagName, s)"
                      :key="s + tableKey"
                      size="mini"
                      :label="s"
                      :value="s"
                    ></el-checkbox>
                  </template>
                  <datablau-checkbox
                    v-if="!t.isUdp"
                    v-model="tags[t.tagId] && tags[t.tagId].selection"
                    class="tag-checkbox-group"
                    @change="handleTagChange"
                  >
                    <el-checkbox
                      class="tag-checkbox"
                      v-for="s in tags[t.tagId].children"
                      v-show="tagsVisible(groupName, t.tagName, s.name)"
                      :key="s.tagId"
                      :label="s"
                    >
                      <span>{{ s.name }}</span>
                    </el-checkbox>
                  </datablau-checkbox>
                </div>
              </div>
            </div>
            <!--<el-table
              class="datablau-table"
              :data="filterPopoverTableDataDisplay"
            >
              <el-table-column
                label="启用"
                :width="80"
                v-if="isAdmin"
              >
                <template slot-scope="scope">
                  <el-checkbox
                    v-if="scope.row.isUdp"
                    @change="handleCollectionChange(scope.row.isUdp)"
                    v-model="udpCollection[scope.row.id]"
                  ></el-checkbox>
                  <el-checkbox
                    v-else
                    @change="handleCollectionChange(scope.row.isUdp)"
                    v-model="tagCollection[scope.row.tagId]"
                  ></el-checkbox>
                </template>
              </el-table-column>
              <el-table-column
                label="一级分组"
                :width="160"
                prop="groupName"
              ></el-table-column>
              <el-table-column
                label="二级分组"
                :width="160"
                prop="tagName"
              >
                <template
                  slot-scope="scope"
                >
                  <span>{{scope.row.tagName}}</span>
                </template>
              </el-table-column>
              <el-table-column
                label="标签"
              >
                <template slot-scope="scope">
                  <div style="padding: 10px 0">
                    <template
                      v-if="scope.row.isUdp && udpsMap[scope.row.id] && udpsMap[scope.row.id].selection && udpValue"
                    >
                      <el-radio
                        @change="handleUdpValueChange"
                        v-model="udpValue[scope.row.id]"
                        v-for="s in udpsMap[scope.row.id].selection.filter(i => i)"
                        :key="s + tableKey"
                        :label="s"
                        :value="s"
                      ></el-radio>
                    </template>
                    <datablau-checkbox
                      v-if="!scope.row.isUdp"
                      v-model="tags[scope.row.tagId] && tags[scope.row.tagId].selection"
                      class="tag-checkbox-group"
                      @change="handleTagChange"
                    ><el-checkbox
                      class="tag-checkbox"
                      v-for="s in tags[scope.row.tagId].children"
                      :key="s.tagId"
                      :label="s">
                      <span>{{s.name}}</span>
                    </el-checkbox
                    ></datablau-checkbox>
                  </div>
                </template>
              </el-table-column>
            </el-table>-->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>
<style scoped="scoped" lang="scss">
@import './_tagFilter';
</style>
<style lang="sass">
.filter.el-collapse
  .el-collapse-item__header
    font-size: 12px
    height: 34px
    line-height: 34px
    padding-left: 20px
  .el-collapse-item__content
    padding: 0 20px 20px 0
  .title
    &.selected
      color: #409EFF
#collapse-container
  .el-collapse-item__header,.el-collapse-item__content
    background: var(--search-left-bgc)
    border: none
  .el-collapse-item__wrap
    border-bottom: none
  .el-collapse
    border: none
  .el-icon-arrow-right:not(.is-active)::before
    content: '+'
    font-size: 16px
    font-weight: bold
</style>
<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
@import './main.scss';
.right-part {
  margin-top: 20px;
}
.top-filter-checkbox.has-any-tag {
  &::after {
    display: inline-block;
    width: 2px;
    height: 14px;
    margin-right: 10px;
    line-height: 24px;
    vertical-align: middle;
    content: '';
    background-color: $border-color;
  }
}
.filter-header-info {
  width: 86px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  display: inline-block;
  color: $primary-color;
  cursor: pointer;
  i {
    margin-right: 6px;
    &:before {
      color: $primary-color;
    }
  }
  &.active {
    background-color: $table-hover-color;
  }

  &:hover {
    background-color: $table-hover-color;
  }
}
.rect-checkbox {
  border: 0;
  outline: null;
  padding: 0 6px;
  &.is-checked {
    background-color: $table-hover-color;
    border-radius: 12px;
    i {
      &:before {
        color: $primary-color;
      }
    }
    span {
      color: $primary-color;
    }
  }
}
</style>
