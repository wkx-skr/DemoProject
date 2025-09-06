<template>
  <div class="searchGlobal-page">
    <div class="search-part">
      <div class="search-input">
        <el-autocomplete style="width: 540px" v-model="keyword" clearable v-if="showGlobalSearch"
          ref="showGlobalSearchDom" :fetch-suggestions="queryHistoryRecord" placeholder="请输入内容" @select="goSearch()"
          class="datablau-input seachInput" @keydown.enter.native="goSearch()">
          <div slot-scope="{ item, index }">
            {{ item.label }}
            <i class="el-icon-close" @click.stop="removeHistoryRecord(item)" style="float: right; margin-top: 10px"></i>
          </div>
          <el-cascader style="width: 120px" @change="selectedItemTypeChangeEvent" :props="defaultProps"
            :options="itemTypeOptions" :show-all-levels="false" v-model="selectedItemType" slot="append"
            placeholder="请选择"></el-cascader>
        </el-autocomplete>
      </div>
      <div class="search-button" @click="goSearch()">
        <i class="iconfont icon-search"></i>
        搜 索
      </div>
    </div>
    <div style="
        height: calc(100vh - 135px);
        display: flex;
        padding-left: 20px;
        padding-right: 20px;
        position: relative;
      ">
      <Panel>
        <el-table :key="tableKey" :data="resultData" row-key="id" height="100%" :show-header="true" style="width: 100%" v-if="resultData.length > 0"
          @row-click="goTodetail">
          <el-table-column :label="tableHeaderLabel" min-width="100">
            <template v-slot="{ row, $index }">
              <div class="result-table-li-left">
                <template v-if="!isMetadata">
                  <datablau-icon class="iconForIe" :data-type="row.logical ? 'logicaltable' : 'table'"
                    :key="row.data.itemId" :size="32" style="position: relative; margin-left: 5px; top: 3px"
                    v-if="row.data.itemType === 80000004"></datablau-icon>
                  <datablau-icon class="iconForIe" :data-type="row.logical ? 'logicalcolumn' : 'column'"
                    :key="row.data.itemId" :size="32" style="position: relative; margin-left: 5px; top: 3px"
                    v-else-if="row.data.itemType === 80000005"></datablau-icon>
                  <datablau-icon class="iconForIe" :data-type="String(row.data.itemType)" :key="row.data.itemId"
                    :size="32" style="position: relative; margin-left: 5px; top: 3px" v-else-if="
                      row.data.itemType === 80010001 ||
                      row.data.itemType === 82800012
                    "></datablau-icon>
                  <img v-else-if="row.data.itemType === 80010076" :src="imgPath(row.data)" width="32" height="32"
                    alt="" />
                  <datablau-icon class="iconForIe" :data-type="row.data.itemType === 82800008
                      ? fileTypeFormatter(row.data.type)
                      : typeList[row.data.itemType]
                    " :key="row.data.itemId" :size="32" style="position: relative; margin-left: 5px; top: 3px"
                    v-else></datablau-icon>
                </template>
                <img v-else :src="metaModelIconMap[row.data.itemType]" width="32" height="32" alt="" />
                <div class="cont" :class="{ contQRule: row.data.itemType === 82800016 }">
                  <p class="name" v-if="
                    row.data.itemType === 82800002 ||
                    row.data.itemType === 82800008 ||
                    row.data.itemType === 82800016 ||
                    row.data.itemType === 82800017
                  ">
                    <is-show-tooltip :content="row.data.chineseName">
                      <datablau-high-light style="font-weight: bold" :content="row.data.chineseName" :keyword="keyword"
                        :show-overflow-tooltip="false"></datablau-high-light>
                    </is-show-tooltip>
                  </p>
                  <p class="name" v-else-if="
                    row.data.itemType === 80010098 ||
                    row.data.itemType === 80010066 ||
                    row.data.itemType === 82800003
                  ">
                    <is-show-tooltip :content="row.data.chineseName +
                      (row.data.englishName
                        ? `(${row.data.englishName})`
                        : '')
                      ">
                      <datablau-high-light style="font-weight: bold" :content="row.data.chineseName" :keyword="keyword"
                        :show-overflow-tooltip="false"></datablau-high-light>
                      <span v-if="row.data.englishName">
                        (
                        <datablau-high-light style="font-weight: bold" :content="row.data.englishName"
                          :keyword="keyword" :show-overflow-tooltip="false"></datablau-high-light>
                        )
                      </span>
                      <span class="domain-code">
                        {{ row.data.code }}
                      </span>
                    </is-show-tooltip>
                  </p>
                  <p class="name" v-else>
                    <is-show-tooltip :content="row.data.englishName +
                      (row.data.chineseName
                        ? `row${row.data.chineseName})`
                        : '')
                      ">
                      <datablau-high-light style="font-weight: bold" :content="row.data.englishName" :keyword="keyword"
                        :show-overflow-tooltip="false"></datablau-high-light>
                      <span v-if="row.data.chineseName">
                       {{row.data.itemType === 80010001 ?'':'('}}
                        <datablau-high-light style="font-weight: bold" :content="row.data.chineseName"
                          :keyword="keyword" :show-overflow-tooltip="false"></datablau-high-light>
                       {{row.data.itemType === 80010001 ?'':')'}}
                      </span>
                      <span v-if="
                        row.data.itemType === 80010066 ||
                        row.data.itemType === 82800003
                      " class="domain-code">
                        {{ row.data.code }}
                      </span>
                    </is-show-tooltip>
                  </p>
                  <div v-if="row.data.itemType !== 82800016">
                    <datablau-high-light style="font-size:12px;color:#909399" v-if="row.data.description"
                      :content="row.data.description" :keyword="keyword"
                      :show-overflow-tooltip="false"></datablau-high-light>
                    <p v-else class="nodescription">暂无信息</p>
                  </div>
                  <div class="children-column" v-if="row.data.children.length > 0">
                    {{
                      row.data.itemType === 82800002
                        ? '关联信息项：'
                        : row.data.itemType === 80010098
                          ? '码值：'
                          : row.data.itemType === 82800017
                            ? '关联技术规则：'
                            : row.data.itemType === 82800016
                              ? '关联业务规则：'
                              : '字段：'
                    }}
                    <p v-for="(column, index) in row.data.children" :key="index" v-show="row.data.children &&
                      row.data.children.length > 0 &&
                      index < 5
                      ">
                      <datablau-high-light style="font-weight: bold" v-if="column.name" :content="column.name"
                        :keyword="keyword" :widthStyle="true" :show-overflow-tooltip="true"></datablau-high-light>
                    </p>
                    <span v-if="row.data.children.length > 5">&nbsp;等</span>
                    <!-- <p
                      v-for="(column, ind) in result.data.children"
                      :key="ind + column"
                      v-show="!result.highLight['children.name']"
                    >
                      {{ column.name }}
                    </p> -->
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <!--  增加资产目录  资产目录类型列-->
          <el-table-column label="资产目录类型" width="170" show-overflow-tooltip prop="catalogType"
            v-if="selectedItemType.includes('sjzcml')">
            <template v-slot="{ row }">
              <datablau-status
        :type="catalogTypeMap[row.data.catalogType]"
        :desc="row.data.catalogType"
        business-type
      ></datablau-status>
            </template>
          </el-table-column>
          <!-- 数据表/字段/标准数据元/接口采集数据/参考数据 路径列-->
          <el-table-column label="路径" min-width="50" v-if="
            selectedItemType.includes('sjb') ||
            selectedItemType.includes('zd') ||
            selectedItemType.includes('sjbj') ||
            selectedItemType.includes('cksj') ||
            selectedItemType.includes('sjzcml') ||
            isMetadata
          ">
            <template v-slot="{ row, index }">
              <div class="result-table-li-right">
                <div class="result-table-li-right-path">
                  <div class="path">
                    <i class="iconfont icon-file"></i>
                    <p class="path-p">
                      <is-show-tooltip :content=" selectedItemType.includes('sjzcml')?row.data.pathStr:row.data.path">
                        <span>{{ selectedItemType.includes('sjzcml')?row.data.pathStr:row.data.path }}</span>
                      </is-show-tooltip>
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 数据资产目录/标准数据元  创建人列 -->
          <el-table-column label="创建人" prop="creator" width="120" show-overflow-tooltip v-if="
            selectedItemType.includes('sjzcml') ||
            selectedItemType.includes('sjbj')
          ">
            <template v-slot="{ row }">
              <datablau-status v-if="row.data.creator"
        type="7"
        :desc="row.data.creator"
        business-type
      ></datablau-status>
            </template>
          </el-table-column>
          <!-- 数据资产目录  创建时间列 -->
          <el-table-column label="创建时间" width="170" show-overflow-tooltip prop="createTime"
            v-if="selectedItemType.includes('sjzcml')">
            <template v-slot="{ row }">
              {{ row.data.createTime }}
            </template>
          </el-table-column>
          <!-- 参考数据 关联的数据标准名称列 TODO确认字段 -->
          <el-table-column label="关联标准数据元" show-overflow-tooltip prop="domainName" width="170"
            v-if="selectedItemType.includes('cksj')">
            <template v-slot="{ row }">
              <span style="color: #3e9aff">{{ row.data.domainName }}</span>
            </template>
          </el-table-column>
          <!-- 数据库  采集类型列 TODO确认字段--->
          <el-table-column label="采集类型" min-width="50" prop="type" show-overflow-tooltip
            v-if="selectedItemType.includes('sjk')">
            <template v-slot="{ row }">
              <!-- {{ row.data.type }} -->
              <datablau-status v-if="row.data.type"
        type="6"
        :desc="row.data.type"
        business-type
      ></datablau-status>
            </template>
          </el-table-column>
          <!-- 数据库  所属系统列 TODO确认字段-->
          <el-table-column label="所属系统" show-overflow-tooltip min-width="50" prop="modelCategoryName"
            v-if="selectedItemType.includes('sjk')">
            <template v-slot="{ row }">
              <!-- {{ row.data.modelCategoryName }} -->
              <datablau-status v-if="row.data.modelCategoryName"
        type="2"
        :desc="row.data.modelCategoryName"
        business-type
      ></datablau-status>
            </template>
          </el-table-column>
          <!-- 数据表  业务域、业务描述、使用描述、负责人、数据库类型列(字段)-->
          <el-table-column label="业务域" width="130" show-overflow-tooltip prop="businessDomain"
            v-if="selectedItemType.includes('sjb')">
            <template v-slot="{ row }">
              <!-- {{ row.data.businessDomain }} -->
              <datablau-status v-if="row.data.businessDomain"
        type="2"
        :desc="row.data.businessDomain"
        business-type
      ></datablau-status>
            </template>
          </el-table-column>
          <el-table-column label="业务描述" width="150" show-overflow-tooltip prop="businessDescription"
            v-if="selectedItemType.includes('sjb')">
            <template v-slot="{ row }">
              <!-- {{ row.data.businessDescription }} -->
              <span style="color:#909399"> {{ row.data.businessDescription }}</span>
            </template>
          </el-table-column>
          <el-table-column label="使用描述" width="150" show-overflow-tooltip prop="useDescription"
            v-if="selectedItemType.includes('sjb')">
            <template v-slot="{ row }">
             <span style="color:#909399"> {{ row.data.useDescription }}</span>
            </template>
          </el-table-column>
          <el-table-column label="负责人" width="130" show-overflow-tooltip prop="owner"
            v-if="selectedItemType.includes('sjb')">
            <template v-slot="{ row }">
              <!-- {{ row.data.owner }} -->
              <datablau-status v-if="row.data.owner"
        type="7"
        :desc="row.data.owner"
        business-type
      ></datablau-status>
            </template>
          </el-table-column>
          <el-table-column label="数据库类型" width="130" key="modelType1" show-overflow-tooltip prop="modelType" v-if="
            selectedItemType.includes('sjb')">
            <template v-slot="{ row }">
              <!-- {{ row.data.modelType }} -->
              <datablau-status v-if="row.data.modelType"
        type="3"
        :desc="row.data.modelType"
        business-type
      ></datablau-status>
            </template>
          </el-table-column>
          <el-table-column label="数据库类型" width="130" key="modelType2" show-overflow-tooltip prop="modelType"
            v-if="selectedItemType.includes('zd')">
            <template v-slot="{ row }">
              <!-- {{ row.data.modelType }} -->
              <datablau-status v-if="row.data.modelType"
        type="3"
        :desc="row.data.modelType"
        business-type
      ></datablau-status>
            </template>
          </el-table-column>
          <!-- 字段  类型列,数据库类型 -->
          <el-table-column label="类型" width="130" v-if="selectedItemType.includes('zd')">
            <template v-slot="{ row }">
              <div class="result-table-li-right">
                <div class="result-table-li-right-all">
                  <!-- <div class="domian">
                    <div class="domian-div">
                      <p class="domian-p" v-if="row.data.domain">
                        {{ row.data.domain.chineseName }}
                      </p>
                    </div>
                    <div class="domian-div">
                      <p class="code-p" v-if="row.data.standardCode">
                        {{ row.data.standardCode }}
                      </p>
                    </div>
                  </div> -->
                  <div class="column-columnType">
                    <datablau-tooltip :content="row.data.columnType" placement="bottom" effect="dark">
                      <p>
                        <i class="data-type-icon iconfont" :class="[
                          row.data.columnType
                            ? getDataTypeIcon(row.data.columnType)
                            : '',
                        ]"></i>
                        <span>
                          {{
                            dataTypeFormatter(
                              row.data.columnType,
                              row.data.modelType
                            )
                          }}
                        </span>
                      </p>
                    </datablau-tooltip>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 参考数据 引用列 -->
          <el-table-column label="引用" width="150" v-if="selectedItemType.includes('cksj')">
            <template v-slot="{ row }">
              <div class="result-table-li-right code">
                <div class="count">
                  <p>
                    码值数量
                    <span>
                      {{
                        row.data.childrenCount > 99
                          ? '99+'
                          : row.data.childrenCount
                      }}
                    </span>
                  </p>
                  <!--              TODO 需求上是删除的 -->
                  <!--              |-->
                  <!--              <p>-->
                  <!--                字段引用-->
                  <!--                <span>-->
                  <!--                  {{-->
                  <!--                    row.data.usedCount > 999 ? '999+' : row.data.usedCount-->
                  <!--                  }}-->
                  <!--                </span>-->
                  <!--              </p>-->
                  <!--              |-->
                  <!--              <p>-->
                  <!--                数据标准引用-->
                  <!--                <span>-->
                  <!--                  {{-->
                  <!--                    row.data.domainUsedCount > 999-->
                  <!--                      ? '999+'-->
                  <!--                      : row.data.domainUsedCount-->
                  <!--                  }}-->
                  <!--                </span>-->
                  <!--              </p>-->
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 数据表/字段  部门列 TODO需求上是没显示的
    <el-table-column
    label="部门列"
    v-if="
      selectedItemType.includes('sjb') ||
      selectedItemType.includes('zd')
    "
    >
    <template v-slot="{ row, index }">
      <div class="result-table-li-right">
        <div class="result-table-li-right-all">
          <div class="departmentName">
            <i
              v-if="row.data.dataDepartments"
              class="iconfont icon-ownership"
            ></i>
            <p v-if="row.data.dataDepartments" style="height: 18px">
              <is-show-tooltip
                :content="
                  row.data.dataDepartments
                    ? row.data.dataDepartments[0].departmentName
                    : ''
                "
              >
                <span>
                  {{ row.data.dataDepartments[0].departmentName }}
                </span>
              </is-show-tooltip>
            </p>
            <datablau-tooltip
              :content="
                row.data.dataDepartments
                  .map(item => item.departmentName)
                  .join(',')
              "
              placement="bottom"
              effect="dark"
              v-if="
                row.data.dataDepartments &&
                row.data.dataDepartments.length > 1
              "
            >
              <span
                v-show="
                  row.data.dataDepartments &&
                  row.data.dataDepartments.length > 1
                "
                style="
                  font-size: 11px;
                  margin-left: 8px;
                  color: rgba(124, 137, 168, 0.9);
                "
              >
                更多
              </span>
            </datablau-tooltip>
          </div>
          <div class="owner">
            <p
              class="headPortrait"
              v-if="
                row.data.dataManagers &&
                row.data.dataManagers.length > 0 &&
                row.data.dataManagers[0].firstName
              "
            >
              {{ row.data.dataManagers[0].firstName.slice(0, 1) }}
            </p>
            <p
              class="headPortrait-name"
              style="height: 18px"
              v-if="row.data.dataManagers"
            >
              <is-show-tooltip
                :content="row.data.dataManagers[0].firstName"
                style="height: 18px"
              >
                <span>
                  {{ row.data.dataManagers[0].firstName }}
                </span>
              </is-show-tooltip>
            </p>
            <datablau-tooltip
              :content="
                row.data.dataManagers.map(item => item.firstName).join(',')
              "
              placement="bottom"
              effect="dark"
              v-if="
                row.data.dataManagers && row.data.dataManagers.length > 1
              "
            >
              <span
                v-show="
                  row.data.dataManagers && row.data.dataManagers.length > 1
                "
                style="
                  font-size: 11px;
                  margin-left: 8px;
                  color: rgba(124, 137, 168, 0.9);
                "
              >
                更多
              </span>
            </datablau-tooltip>
          </div>
        </div>
      </div>
    </template>
    </el-table-column>-->
          <!-- 视图的 中文名列 TODO 需求上是删除的
          <el-table-column label="中文名列"  v-if="isMetadata">
            <template v-slot="{ row }">
              <div class="result-table-li-right">
                <div class="result-table-li-right-path">
                  <div class="path">
                    <p class="path-p">
                      <is-show-tooltip :content="itemTypeChineseName">
                        <span>{{ itemTypeChineseName }}</span>
                      </is-show-tooltip>
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>-->
          <!-- 标准数据元 引用列 TODO 需求上是删除的
          <el-table-column label="引用列" v-if="selectedItemType.includes('sjbj')">
            <template v-slot="{ row }">
              <div class="result-table-li-right domain">
                <div class="usedCount">
                  <p>
                    引用次数
                    <span>
                      {{ row.data.usedCount > 999 ? '999+' : row.data.usedCount }}
                    </span>
                  </p>
                </div>
              </div>
            </template>
          </el-table-column> -->
        </el-table>
        <div class="nothing" v-if="resultData.length === 0">
          <img src="./nothing.svg" alt="" />
          <p>暂无数据</p>
        </div>
        <template #bottomBar>
          <div style="display: flex; align-items: center; justify-content: center" v-if="resultData.length > 0">
            <span style="margin-right: 8px">
              共 {{ totalShow > 10000 ? '10000+' : totalShow }} 条
            </span>
            <datablau-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
              :current-page="currentPage" :page-sizes="[20, 50, 100]" :page-size="pageSize" :total="totalShow"
              layout="prev, pager, next" type="ES" prev-text="上一页" next-text="下一页"></datablau-pagination>
          </div>
        </template>
      </Panel>
    </div>

    <!-- TODO 使用el-table重构下方代码，下方代码参考为了，使用v-if隐藏 -->
    <div v-if="false" class="search-result-part" :style="{ top: '110px' }">
      <div class="search-result-table" v-if="resultData.length > 0">
        <div class="result-table-li" v-for="(result, index) in resultData" :key="index" @click="goTodetail(result)">
          <div class="result-table-li-left">
            <template v-if="!isMetadata">
              <datablau-icon class="iconForIe" :data-type="result.logical ? 'logicaltable' : 'table'"
                :key="result.data.itemId" :size="32" style="position: relative; margin-left: 5px; top: 3px"
                v-if="result.data.itemType === 80000004"></datablau-icon>
              <datablau-icon class="iconForIe" :data-type="result.logical ? 'logicalcolumn' : 'column'"
                :key="result.data.itemId" :size="32" style="position: relative; margin-left: 5px; top: 3px"
                v-else-if="result.data.itemType === 80000005"></datablau-icon>
              <datablau-icon class="iconForIe" :data-type="String(result.data.itemType)" :key="result.data.itemId"
                :size="32" style="position: relative; margin-left: 5px; top: 3px" v-else-if="
                  result.data.itemType === 80010001 ||
                  result.data.itemType === 82800012
                "></datablau-icon>
              <img v-else-if="result.data.itemType === 80010076" :src="imgPath(result.data)" width="32" height="32"
                alt="" />
              <datablau-icon class="iconForIe" :data-type="result.data.itemType === 82800008
                  ? fileTypeFormatter(result.data.type)
                  : typeList[result.data.itemType]
                " :key="result.data.itemId" :size="32" style="position: relative; margin-left: 5px; top: 3px"
                v-else></datablau-icon>
            </template>
            <img v-else :src="metaModelIconMap[result.data.itemType]" width="32" height="32" alt="" />
            <div class="cont" :class="{ contQRule: result.data.itemType === 82800016 }">
              <p class="name" v-if="
                result.data.itemType === 82800002 ||
                result.data.itemType === 82800008 ||
                result.data.itemType === 82800016 ||
                result.data.itemType === 82800017
              ">
                <is-show-tooltip :content="result.data.chineseName">
                  <datablau-high-light :content="result.data.chineseName" :keyword="keyword"
                    :show-overflow-tooltip="false"></datablau-high-light>
                </is-show-tooltip>
              </p>
              <p class="name" v-else-if="
                result.data.itemType === 80010098 ||
                result.data.itemType === 80010066 ||
                result.data.itemType === 82800003
              ">
                <is-show-tooltip :content="result.data.chineseName +
                  (result.data.englishName
                    ? `(${result.data.englishName})`
                    : '')
                  ">
                  <datablau-high-light :content="result.data.chineseName" :keyword="keyword"
                    :show-overflow-tooltip="false"></datablau-high-light>
                  <span v-if="result.data.englishName">
                    (
                    <datablau-high-light :content="result.data.englishName" :keyword="keyword"
                      :show-overflow-tooltip="false"></datablau-high-light>
                    )
                  </span>
                  <span class="domain-code">
                    {{ result.data.code }}
                  </span>
                </is-show-tooltip>
              </p>
              <p class="name" v-else>
                <is-show-tooltip :content="result.data.englishName +
                  (result.data.chineseName
                    ? `(${result.data.chineseName})`
                    : '')
                  ">
                  <datablau-high-light :content="result.data.englishName" :keyword="keyword"
                    :show-overflow-tooltip="false"></datablau-high-light>
                  <span v-if="result.data.chineseName">
                    (
                    <datablau-high-light :content="result.data.chineseName" :keyword="keyword"
                      :show-overflow-tooltip="false"></datablau-high-light>
                    )
                  </span>
                  <span v-if="
                    result.data.itemType === 80010066 ||
                    result.data.itemType === 82800003
                  " class="domain-code">
                    {{ result.data.code }}
                  </span>
                </is-show-tooltip>
              </p>
              <div v-if="result.data.itemType !== 82800016">
                <datablau-high-light v-if="result.data.description" :content="result.data.description"
                  :keyword="keyword" :show-overflow-tooltip="false"></datablau-high-light>
                <p v-else class="nodescription">暂无信息</p>
              </div>
              <div class="children-column" v-if="result.data.children.length > 0">
                {{
                  result.data.itemType === 82800002
                    ? '关联信息项：'
                    : result.data.itemType === 80010098
                      ? '码值：'
                      : result.data.itemType === 82800017
                        ? '关联技术规则：'
                        : result.data.itemType === 82800016
                          ? '关联业务规则：'
                          : '字段：'
                }}
                <p v-for="(column, index) in result.data.children" :key="index" v-show="result.data.children &&
                  result.data.children.length > 0 &&
                  index < 5
                  ">
                  <datablau-high-light v-if="column.name" :content="column.name" :keyword="keyword" :widthStyle="true"
                    :show-overflow-tooltip="true"></datablau-high-light>
                </p>
                <span v-if="result.data.children.length > 5">&nbsp;等</span>
                <!-- <p
                  v-for="(column, ind) in result.data.children"
                  :key="ind + column"
                  v-show="!result.highLight['children.name']"
                >
                  {{ column.name }}
                </p> -->
              </div>
            </div>
          </div>

          <!-- 数据表/视图 -->
          <div class="result-table-li-right" v-if="
            result.data.itemType === 80000004 ||
            result.data.itemType === 80500008
          ">
            <div class="result-table-li-right-path">
              <div class="path">
                <i class="iconfont icon-file"></i>
                <p class="path-p">
                  <is-show-tooltip :content="result.data.path">
                    <span>{{ result.data.path }}</span>
                  </is-show-tooltip>
                </p>
              </div>
            </div>
            <div class="result-table-li-right-all">
              <div class="departmentName">
                <i v-if="result.data.dataDepartments" class="iconfont icon-ownership"></i>
                <p v-if="result.data.dataDepartments" style="height: 18px">
                  <is-show-tooltip :content="result.data.dataDepartments
                      ? result.data.dataDepartments[0].departmentName
                      : ''
                    ">
                    <span>
                      {{ result.data.dataDepartments[0].departmentName }}
                    </span>
                  </is-show-tooltip>
                </p>
                <datablau-tooltip :content="result.data.dataDepartments
                    .map(item => item.departmentName)
                    .join(',')
                  " placement="bottom" effect="dark" v-if="
                    result.data.dataDepartments &&
                    result.data.dataDepartments.length > 1
                  ">
                  <span v-show="result.data.dataDepartments &&
                    result.data.dataDepartments.length > 1
                    " style="
                      font-size: 11px;
                      margin-left: 8px;
                      color: rgba(124, 137, 168, 0.9);
                    ">
                    更多
                  </span>
                </datablau-tooltip>
              </div>
              <div class="owner">
                <p class="headPortrait" v-if="
                  result.data.dataManagers &&
                  result.data.dataManagers.length > 0 &&
                  result.data.dataManagers[0].firstName
                ">
                  {{ result.data.dataManagers[0].firstName.slice(0, 1) }}
                </p>
                <p class="headPortrait-name" style="height: 18px" v-if="result.data.dataManagers">
                  <is-show-tooltip :content="result.data.dataManagers[0].firstName" style="height: 18px">
                    <span>
                      {{ result.data.dataManagers[0].firstName }}
                    </span>
                  </is-show-tooltip>
                </p>
                <datablau-tooltip :content="result.data.dataManagers
                    .map(item => item.firstName)
                    .join(',')
                  " placement="bottom" effect="dark" v-if="
                    result.data.dataManagers &&
                    result.data.dataManagers.length > 1
                  ">
                  <span v-show="result.data.dataManagers &&
                    result.data.dataManagers.length > 1
                    " style="
                      font-size: 11px;
                      margin-left: 8px;
                      color: rgba(124, 137, 168, 0.9);
                    ">
                    更多
                  </span>
                </datablau-tooltip>
              </div>
              <!-- <div class="data">
                <p v-if="result.data.hasSampleData" class="hasSampleData">
                  <img src="./hasSampleData.svg" alt="" />
                  有采样数据
                </p>
                <p v-else class="hasSampleDatafalse">
                  <img src="./hasSampleDatafalse.svg" alt="" />
                  无采样数据
                </p>
              </div> -->
            </div>
          </div>
          <div class="result-table-li-right" v-if="isMetadata">
            <div class="result-table-li-right-path">
              <div class="path">
                <p class="path-p">
                  <is-show-tooltip :content="itemTypeChineseName">
                    <span>{{ itemTypeChineseName }}</span>
                  </is-show-tooltip>
                </p>
              </div>
            </div>
          </div>
          <div class="result-table-li-right" v-if="isMetadata">
            <div class="result-table-li-right-path">
              <div class="path">
                <i class="iconfont icon-file"></i>
                <p class="path-p">
                  <is-show-tooltip :content="result.data.path">
                    <span>{{ result.data.path }}</span>
                  </is-show-tooltip>
                </p>
              </div>
            </div>
          </div>
          <!-- 字段 -->
          <div class="result-table-li-right" v-if="result.data.itemType === 80000005">
            <div class="result-table-li-right-path column">
              <div class="path">
                <i class="iconfont icon-file"></i>
                <p class="path-p">
                  <is-show-tooltip :content="result.data.path">
                    <span>{{ result.data.path }}</span>
                  </is-show-tooltip>
                </p>
              </div>
            </div>
            <!-- 字段 -->
            <div class="result-table-li-right-all">
              <div class="domian">
                <div class="domian-div">
                  <p class="domian-p" v-if="result.data.domain">
                    {{ result.data.domain.chineseName }}
                  </p>
                </div>
                <div class="domian-div">
                  <p class="code-p" v-if="result.data.standardCode">
                    {{ result.data.standardCode }}
                  </p>
                </div>
              </div>
              <div class="column-columnType">
                <datablau-tooltip :content="result.data.columnType" placement="bottom" effect="dark">
                  <p>
                    <i class="data-type-icon iconfont" :class="[
                      result.data.columnType
                        ? getDataTypeIcon(result.data.columnType)
                        : '',
                    ]"></i>
                    <span>
                      {{
                        dataTypeFormatter(
                          result.data.columnType,
                          result.data.modelType
                        )
                      }}
                    </span>
                  </p>
                </datablau-tooltip>
              </div>
            </div>
          </div>
          <!-- 报表 TODO -->
          <div class="result-table-li-right" v-if="result.data.itemType === 82800002">
            <div class="result-table-li-right-path report">
              <div class="path">
                <i class="iconfont icon-file"></i>
                <p class="path-p">
                  <is-show-tooltip :content="result.data.path">
                    <span>{{ result.data.path }}</span>
                  </is-show-tooltip>
                </p>
              </div>
            </div>
            <div class="result-table-li-right-all">
              <div class="report-frequency">
                <p v-if="result.data.frequency">
                  <i class="iconfont icon-refresh"></i>
                  更新频率：{{ result.data.frequency }}
                </p>
              </div>
              <div class="owner">
                <p class="headPortrait" v-if="result.data.dataManagers">
                  {{ result.data.dataManagers[0].firstName.slice(0, 1) }}
                </p>
                <p class="headPortrait-name" v-if="result.data.dataManagers">
                  {{ result.data.dataManagers[0].firstName }}
                </p>
              </div>
              <div class="reportTypes">
                <p>{{ reportTypes[result.data.type] }}</p>
              </div>
            </div>
          </div>
          <!-- 文件 TODO -->
          <div class="result-table-li-right file" v-if="result.data.itemType === 82800008">
            <div class="path">
              <i class="iconfont icon-file"></i>
              <p class="path-p">
                <is-show-tooltip :content="result.data.path">
                  <span>{{ result.data.path }}</span>
                </is-show-tooltip>
              </p>
            </div>
          </div>
          <!-- 基础标准/指标标准/标准数据元 -->
          <div class="result-table-li-right domain" v-if="
            result.data.itemType === 80010066 ||
            result.data.itemType === 82800003
          ">
            <div class="path">
              <i class="iconfont icon-file"></i>
              <p class="path-p">
                <is-show-tooltip :content="result.data.path">
                  <span>{{ result.data.path }}</span>
                </is-show-tooltip>
              </p>
            </div>
            <div class="usedCount">
              <p>
                引用次数
                <span>
                  {{
                    result.data.usedCount > 999 ? '999+' : result.data.usedCount
                  }}
                </span>
              </p>
            </div>
          </div>
          <!-- 业务规则 TODO -->
          <div class="result-table-li-right rule" v-if="result.data.itemType === 82800017">
            <div class="path">
              <i class="iconfont icon-file"></i>
              <p class="path-p">
                <is-show-tooltip :content="result.data.path">
                  <span>{{ result.data.path }}</span>
                </is-show-tooltip>
              </p>
            </div>
            <div class="rule-type">
              <p>{{ searchQuery(result.data.type) }}</p>
            </div>
          </div>
          <!-- 技术规则 TODO-->
          <div class="result-table-li-right qualityRule" v-if="result.data.itemType === 82800016">
            <div class="result-table-li-right-path qualityRule">
              <div class="path">
                <i class="iconfont icon-file"></i>
                <p class="path-p">
                  <is-show-tooltip :content="result.data.path">
                    <span>{{ result.data.path }}</span>
                  </is-show-tooltip>
                </p>
              </div>
            </div>
            <div class="result-table-li-right-all">
              <div class="rule-bizTypeSelectOption">
                <p>{{ result.data.bizTypeSelectOption }}</p>
              </div>
              <div class="rule-bigClassSelectOption">
                <p>
                  {{
                    result.data.bigClassSelectOption | bigClassFilter(queryArr)
                  }}
                </p>
              </div>
            </div>
          </div>
          <!-- 标准代码 -->
          <div class="result-table-li-right code" v-if="result.data.itemType === 80010098">
            <div class="path">
              <i class="iconfont icon-file"></i>
              <p class="path-p">
                <is-show-tooltip :content="result.data.path">
                  <span>{{ result.data.path }}</span>
                </is-show-tooltip>
              </p>
            </div>
            <div class="count">
              <p>
                码值数量
                <span>
                  {{
                    result.data.childrenCount > 99
                      ? '99+'
                      : result.data.childrenCount
                  }}
                </span>
              </p>
              |
              <p>
                字段引用
                <span>
                  {{
                    result.data.usedCount > 999 ? '999+' : result.data.usedCount
                  }}
                </span>
              </p>
              |
              <p>
                数据标准引用
                <span>
                  {{
                    result.data.domainUsedCount > 999
                      ? '999+'
                      : result.data.domainUsedCount
                  }}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="search-result-pagination" v-if="resultData.length > 0">
        <span style="margin-right: 8px">
          共 {{ totalShow > 10000 ? '10000+' : totalShow }} 条
        </span>
        <datablau-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
          :current-page="currentPage" :page-sizes="[20, 50, 100]" :page-size="pageSize" :total="totalShow"
          layout="prev, pager, next" type="ES" prev-text="上一页" next-text="下一页"></datablau-pagination>
      </div>
      <div class="nothing" v-if="resultData.length === 0">
        <img src="./nothing.svg" alt="" />
        <p>暂无数据</p>
      </div>
    </div>
  </div>
</template>

<script>
import main from './main.js'

export default main
</script>

<style lang="scss" scoped="scoped">
@import './main.scss';
</style>
<style lang="scss">
.searchGlobal-page {
  .search-part {
    .search-input {
      .datablau-input {
        &.seachInput {
          .el-cascader {
            .el-input__inner {
              background: #f5f7fa;
            }
          }

          .el-input__inner {
            border-color: transparent;
          }

          .el-input-group__append {
            border: 0;
            border-radius: 5px;
          }
        }
      }
    }
  }

  .search-tabs {
    // width: 586px;

    width: 660px;
    margin: 0 auto;
    margin-top: 4px;

    .el-tabs .el-tabs__nav-wrap:after {
      background-color: transparent;
    }

    .el-tabs .el-tabs__item {
      padding: 0 12px;
    }

    .el-tabs .el-tabs__nav-wrap .el-tabs__item.is-active {
      color: #3c64f0;
    }

    .el-tabs .el-tabs__nav-wrap .el-tabs__active-bar {
      background-color: #3c64f0;
    }

    .el-tabs .el-tabs__nav-wrap .el-tabs__item:hover {
      color: #3c64f0;
    }
  }

  em {
    font-style: normal;
    color: #ff7519;
  }
}
</style>
<style lang="scss" scoped>
.result-table-li-left {
  display: flex;

  .cont {
    margin-left: 8px;
    width: 84%;
    // width: 40%;
    display: inline-block;

    &.contQRule {
      .name {
        height: 32px;
        line-height: 32px;
      }
    }

    .name {
      display: inline-block;
      color: #354f7b;
      font-weight: 500;
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-size: 14px;
      height: 20px;

      .domain-code {
        display: inline-block;
        margin-left: 8px;
        min-width: 61px;
        height: 20px;
        background: rgba(64, 158, 255, 0.1);
        border-radius: 4px;
        color: #409eff;
        line-height: 20px;
        text-align: center;
        padding: 0 4px;
        vertical-align: bottom;
        font-size: 11px;
        font-weight: 400;
      }
    }

    .description {
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      color: #7c89a8;
      padding-top: 6px;
    }

    .nodescription {
      color: rgba(124, 137, 168, 0.5);
    }

    .children-column {
      display: flex;
      align-items: center;
      color: #354f7b;
      padding-top: 9px;
      font-weight: 500;

      p {
        padding: 1px 8px;
        background: #ffffff;
        border: 1px solid #d6dcea;
        border-radius: 4px;
        margin-right: 4px;
        display: inline-block;
        float: none;
        font-weight: normal;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        -o-text-overflow: ellipsis;
        max-width: 80px;
      }
    }
  }
}

.result-table-li-right {
  // margin-left: 48px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &.file {
    display: inline-block;

    .path {
      transform: translateY(2px);

      p {
        width: 100%;
      }
    }
  }

  &.domain {
    justify-content: space-between;

    .path {
      width: 77%;

      p {
        width: 100%;
      }
    }
  }

  &.code {
    justify-content: space-between;

    .path {
      width: 50%;

      p {
        width: 100%;
      }
    }
  }

  &.rule {
    .path {
      width: 77%;

      p {
        width: 100%;
      }
    }
  }

  &.qualityRule {
    .path {

      // width: 55%;
      p {
        width: 100%;
      }
    }
  }

  .result-table-li-right-path {
    display: flex;
    width: 88%;
    align-items: center;

    .path i{
      transform: translateY(3px) !important;
    }

    &.column {
      width: 50%;
    }

    &.report {
      width: 45%;
    }

    &.qualityRule {
      width: 70%;
    }
  }

  .result-table-li-right-all {
    display: flex;
    align-items: center;
  }

  .path {
    display: flex;
    align-items: center;
    width: 100%;

    i {
      font-size: 14px;
      color: #7c89a8;
    }

    .path-p {
      margin-left: 4px;
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      -o-text-overflow: ellipsis;
      color: #354f7b;
      height: 18px;
    }
  }

  .departmentName {
    display: flex;
    align-items: center;
    color: #354f7b;
    margin-left: 24px;
    width: 138px;

    i {
      font-size: 14px;
      color: #7c89a8;
    }

    p {
      margin-left: 4px;
      max-width: 80px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      color: #354f7b;
      -o-text-overflow: ellipsis;
    }
  }

  .owner {
    display: flex;
    align-items: center;
    margin-left: 12px;
    width: 122px;

    .headPortrait {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(64, 158, 255, 0.1);
      border-radius: 50%;
      color: #409eff;
      font-size: 11px;
      margin-right: 2px;
    }

    .headPortrait-name {
      color: #354f7b;
      max-width: 64px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      -o-text-overflow: ellipsis;
      display: inline-block;
    }
  }

  .data {
    margin-left: 12px;

    p {
      padding: 3px 4px;
      background: rgba(78, 133, 247, 0.1);
      border-radius: 4px;
      color: #4e85f7;

      img {
        width: 12px;
        height: auto;
        margin-right: 4px;
      }
    }

    .hasSampleDatafalse {
      background: rgba(124, 137, 168, 0.1);
      color: #7c89a8;
    }
  }

  .domian {
    display: flex;
    align-items: center;

    .domian-div {
      width: 74px;
      margin-right: 8px;
    }

    .domian-p {
      width: 74px;
      height: 20px;
      background: rgba(56, 180, 139, 0.1);
      border-radius: 4px;
      color: #38b48b;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      -o-text-overflow: ellipsis;
      padding: 0 4px;
      text-align: center;
      line-height: 20px;
    }

    .code-p {
      width: 74px;
      height: 20px;
      background: rgba(157, 91, 139, 0.1);
      border-radius: 4px;
      color: #9d5b8b;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      -o-text-overflow: ellipsis;
      padding: 0 4px;
      text-align: center;
      line-height: 20px;
    }
  }

  .column-columnType {
    // margin-left: 16px;

    p {
      background: rgba(124, 137, 168, 0.1);
      height: 20px;
      padding: 0 4px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      -o-text-overflow: ellipsis;
      max-width: 74px;
      line-height: 20px;
      border-radius: 4px;

      i {
        font-size: 11px;
        margin-right: 2px;
      }
    }
  }

  .report-frequency {
    margin-right: 4px;
    width: 120px;

    i {
      vertical-align: middle;
    }
  }

  .reportTypes {
    margin-left: 24px;

    p {
      width: 74px;
      height: 20px;
      background: rgba(0, 163, 237, 0.1);
      border-radius: 4px;
      text-align: center;
      line-height: 20px;
      color: #00a3ed;
    }
  }

  .usedCount {
    p {
      width: 105px;
      height: 24px;
      background: #f7f8fb;
      border-radius: 12px;
      color: #354f7b;
      text-align: center;
      line-height: 24px;

      span {
        font-weight: 500;
      }
    }
  }

  .rule-type {
    margin-left: 24px;

    p {
      min-width: 41px;
      height: 20px;
      background: rgba(191, 121, 78, 0.1);
      border-radius: 4px;
      color: #bf794e;
      text-align: center;
      line-height: 20px;
      padding: 0 4px;
    }
  }

  .rule-bizTypeSelectOption {
    margin-left: 24px;

    p {
      min-width: 41px;
      height: 20px;
      background: rgba(78, 133, 247, 0.1);
      border-radius: 4px;
      color: #4e85f7;
      text-align: center;
      line-height: 20px;
      padding: 0 4px;
    }
  }

  .rule-bigClassSelectOption {
    margin-left: 24px;

    p {
      max-width: 120px;
      height: 20px;
      background: rgba(191, 121, 78, 0.1);
      border-radius: 4px;
      color: #bf794e;
      text-align: center;
      line-height: 20px;
      padding: 0 4px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      -o-text-overflow: ellipsis;
    }
  }

  .count {
    display: flex;
    align-items: center;
    background: #f7f8fb;
    border-radius: 12px;
    height: 24px;
    justify-content: center;
    padding: 0 12px;
    color: #354f7b;

    p {
      &:first-child {
        padding-right: 8px;
      }

      &:nth-of-type(2) {
        padding-right: 8px;
        padding-left: 8px;
      }

      &:last-child {
        padding-left: 8px;
      }
    }
  }
}

.nothing {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: column;

  img {
    width: 80px;
    height: auto;
  }

  p {
    color: #999;
    padding-top: 10px;
  }
}
</style>
