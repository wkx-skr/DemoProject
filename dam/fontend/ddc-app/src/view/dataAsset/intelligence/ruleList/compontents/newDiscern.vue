<template>
  <div class="new-discern-page">
    <!-- 选择资产目录 -->
    <datablau-dialog
      width="480px"
      :isTree="true"
      :title="$t('intelligence.selectAssetCatalogs')"
      :visible.sync="showAddCatalog"
      :height="560"
      v-if="showAddCatalog"
      :close-on-click-modal="false"
    >
      <classify-tree
        ref="classifyTree"
        :clickChild="classifyTree"
        :currentNode="currentNode"
        :showCheckbox="true"
        :checkStrictly="true"
        :type="assetsType"
        :isDia="true"
        :hasCheckList="classifyCatalogList"
        :canCheckType="assetsType"
        :selectList="formContent.catalogIdList"
      ></classify-tree>
      <span slot="footer">
        <datablau-button
          type="primary"
          :tooltip-content="tip"
          @click="addCatalog"
        >
          {{ $t('securityModule.sure') }}
        </datablau-button>
        <datablau-button type="secondary" @click="handleClose">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <!-- 信息项目录弹窗 -->
    <datablau-dialog
      class="jobs-sta"
      width="650px"
      :title="$t('intelligence.idRulesCatalog')"
      :visible.sync="showCatalog"
      :height="350"
      :isTree="true"
      v-if="showCatalog"
      :close-on-click-modal="false"
    >
      <div class="tree-search-box">
        <datablau-input
          style="width: 100%"
          v-model="treeKey"
          :iconfont-state="true"
          clearable
          :placeholder="$t('securityModule.search')"
        ></datablau-input>
      </div>
      <div class="tree-box" id="tree-box">
        <datablau-tree
          node-key="catalogId"
          @node-click="handleCatalog"
          :props="catalogProps"
          :data="treeData"
          :data-icon-function="dataIconFunctionCatalog"
          :expand-on-click-node="false"
          :show-overflow-tooltip="true"
          ref="catalogTree"
          :filter-node-method="filterNodeCatalog"
        ></datablau-tree>
      </div>
      <div slot="footer">
        <datablau-button
          :disabled="!canSure"
          type="important"
          @click="sureCatalog"
        >
          {{ $t('securityModule.sure') }}
        </datablau-button>
        <datablau-button type="secondary" @click="showCatalog = false">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <!-- 条件测试 -->
    <datablau-dialog
      :title="$t('intelligence.test')"
      :visible.sync="showTest"
      v-if="showTest"
      :width="diaWidth"
      height="540"
    >
      <div slot="title">
          <div
            class="name"
            style="
              font-size: 16px;
              color: #555;
              font-weight: 500;
              display: inline-block;
            "
          >
            {{ $t('intelligence.test') }}
          </div>
          <span style="color: #999; margin-left: 10px">
            {{ $t('intelligence.testTip') }}
          </span>
        </div>
      <div v-loading="loading" style="width: 970px;height: 400px">
        <div class="fromre-box" :class="[assetsType]">
          <datablau-input
            :iconfont-state="true"
            v-model="fromreKeyword"
            clearable
            style="margin: 10px; width: 220px"
            :placeholder="$t('intelligence.searchDatasource')"
          ></datablau-input>
          <div class="fromre-lists">
            <datablau-tree
              v-loading="treeLoading1"
              :show-checkbox="false"
              ref="tree1"
              :data="fromreList"
              :expand-on-click-node="false"
              :default-expand-all="false"
              :props="defaultProps1"
              @node-click="handleNodeClick1"
              :filter-node-method="filterNode1"
              check-strictly
              node-key="id"
              :data-supervise="true"
              :data-icon-function="dataIconFunction1"
            ></datablau-tree>
          </div>
        </div>
        <div class="tables-box">
          <datablau-input
            clearable
            :iconfont-state="true"
            v-model="tablesKeyword"
            style="margin: 10px; display: block"
            :placeholder="placeholderName"
          ></datablau-input>
          <div
            class="tables-lists"
            :class="{ 'view-tables-lists': type === 80500008 }"
          >
            <datablau-tree
              v-loading="treeLoading2"
              :show-checkbox="false"
              ref="tree2"
              :data="tablesList"
              :expand-on-click-node="false"
              default-expand-all
              :props="defaultProps2"
              @node-click="handleNodeClick2"
              :filter-node-method="filterNode2"
              check-strictly
              node-key="id"
              :data-supervise="true"
              :data-icon-function="dataIconFunction2"
            ></datablau-tree>
          </div>
        </div>
        <div class="field-box" v-if="type === 80000005">
        <datablau-input
          clearable
          :iconfont-state="true"
          v-model="fieldKeyword"
          style="margin: 10px; display: block"
          :placeholder="$t('intelligence.searchColumn')"
        ></datablau-input>
        <div class="field-lists">
          <datablau-tree
            v-loading="treeLoading3"
            :show-checkbox="true"
            ref="tree3"
            :data="fieldList"
            :expand-on-click-node="false"
            default-expand-all
            :props="defaultProps3"
            @node-click="handleNodeClick3"
            :filter-node-method="filterNode3"
            check-strictly
            node-key="id"
            @check="treeNodeClick"
            :data-supervise="true"
            :data-icon-function="dataIconFunction3"
          ></datablau-tree>
        </div>
      </div>
      </div>
      <span slot="footer">
        <div
          class="result-box"
          style="float: left; line-height: 34px"
          v-if="testResult"
        >
          {{ $t('intelligence.testResult') }}：
          <div
            class="tip-box"
            :class="{ 'err-tip-box': isError }"
            style="display: inline-block"
          >
            <i
              :class="['iconfont', isError ? 'icon-wenti' : 'icon-zhengque']"
            ></i>
            {{ testResult }}
          </div>
        </div>
        <!-- :disabled="testId" -->
        <datablau-button type="primary" :disabled="!testId" @click="testRule">
          {{ $t('securityModule.sure') }}
        </datablau-button>
        <datablau-button type="secondary" @click="showTest = false">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      :title="$t('intelligence.lableSelect')"
      size="l"
      :height="500"
      append-to-body
      v-if="addTagVisible"
      :visible.sync="addTagVisible"
    >
      <datablau-input
        :placeholder="$t('intelligence.searchLable')"
        v-model="tagFilterText"
        clearable
        :iconfont-state="true"
      ></datablau-input>
      <div
        class="tag-tree-container tag-scroll-box"
        style="height: 320px; position: relative"
      >
        <el-table
          :data="catalogTree1"
          :span-method="objectSpanMethod"
          class="datablau-table"
          :row-class-name="tableRowClassName"
        >
          <el-table-column
            prop="name"
            :label="$t('intelligence.oneTeam')"
            width="120"
          ></el-table-column>
          <el-table-column
            prop="nameLevel2"
            width="140"
            :label="$t('intelligence.twoTeam')"
          ></el-table-column>
          <el-table-column :label="$t('intelligence.lable')">
            <template slot-scope="scope">
              <el-checkbox-group
                v-model="checkList"
                :key="scope.row.name + scope.row.nameLevel2"
                @change="checkChange(scope.row, ...arguments)"
              >
                <el-checkbox
                  v-show="item.show"
                  :label="
                    item.content.tagId +
                    '^' +
                    item.name +
                    '^' +
                    item.content.parentId
                  "
                  v-for="item in scope.row.children"
                  :key="item.name"
                >
                  {{ item.name }}
                </el-checkbox>
              </el-checkbox-group>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <span slot="footer" class="dialog-footer xx">
        <datablau-button
          type="primary"
          :disabled="!checkList.length"
          @click="choseTag"
        >
          {{ $t('securityModule.sure') }}
        </datablau-button>
        <datablau-button type="secondary" @click="closeDialog">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <!-- 数据分类树 -->
    <catalog-tree
      v-if="showCatalogTree"
      :show="showCatalogTree"
      :dialogType="catalogType"
      :targetData="targetData"
      :clickChild="clickChild"
    ></catalog-tree>
    <add-item
      v-if="showItem"
      :infoItemId="formContent.infoItemId"
      :showItem="showItem"
      :clickChild="clickChild"
    ></add-item>
    <datablau-form-submit
      v-if="editable"
      v-show="!$store.state.showAssetAlgorithm"
      v-loading="detailLoading"
    >
      <datablau-detail-subtitle
        style="margin-left: 20px"
        :title="$t('intelligence.baseInfo')"
        mt="20px"
      ></datablau-detail-subtitle>
      <datablau-form
        :model="formContent"
        ref="newDiscernForm"
        childRef="discernForm"
        :rules="rules"
      >
        <el-form-item :label="$t('intelligence.ruleName')" prop="name">
          <datablau-input
            class="maxlength-input"
            v-model="formContent.name"
            :placeholder="$t('securityModule.input')"
            show-word-limit
            style="width: 640px"
            maxlength="100"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="
            '选择目录'
          "
          prop="catalog"
        >
          <datablau-input
            ref="catalogInput"
            style="width: 640px"
            @focus="getCatalog"
            :placeholder="$t('securityModule.placeSelect')"
            v-model="formContent.catalog"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          v-if="false && ruleType === ruleTypeEnum.MACHINE_LEARNING"
          class="is-required"
          :label="$t('intelligence.algorithmStudy')"
          prop="catalogIds"
        >
          <datablau-select
            v-model="learnTargetType"
            @change="handleLearnTypeChange"
            style="width: 240px; display: inline-block; margin-right: 8px"
          >
            <el-option
              :label="$t('intelligence.tableClass')"
              value="TABLE_ONLY"
            ></el-option>
            <el-option
              :label="$t('intelligence.columnClass')"
              value="TABLE_PUBLISH"
            ></el-option>
            <el-option
              :label="$t('intelligence.columnClass1')"
              value="TABLE_UN_PUBLISH"
            ></el-option>
            <el-option
              :label="$t('intelligence.infoItem')"
              value="AUTH_STANDARD"
            ></el-option>
            <!-- <el-option label="数据分类" value="CATALOG_DESC"></el-option> -->
            <!-- <el-option
              label="已分类数据资产"
              value="CATALOG_ASSETS"
            ></el-option> -->
          </datablau-select>
          <datablau-button
            v-if="learnTargetType !== 'TABLE_PUBLISH'"
            class="iconfont icon-tianjia"
            @click="addLearnTarget"
          >
            {{ $t('securityModule.add')
            }}{{
              learnTargetType === 'AUTH_STANDARD'
                ? $t('intelligence.infoItem')
                : $t('securityModule.securityClassify')
            }}
          </datablau-button>
          <span
            v-if="learnTargetType !== 'TABLE_PUBLISH'"
            style="margin-left: 8px"
          >
            {{
              $t('intelligence.selectTip', {
                num: targetData.length,
              })
            }}
          </span>
          <div
            class="tag-box"
            v-if="
              learnTargetType === 'TABLE_ONLY' ||
              learnTargetType === 'TABLE_UN_PUBLISH'
            "
            style="
              border: 1px solid #dddddd;
              width: 640px;
              height: 104px;
              padding: 8px;
              margin-top: 8px;
              overflow-y: scroll;
            "
          >
            <datablau-tag
              v-for="item in targetData"
              :key="item.id"
              closable
              @close="deleteTargetItems(item)"
            >
              <span class="target-tag">
                <is-show-tooltip
                  :content="item.name"
                  :delay="200"
                  placement="bottom"
                ></is-show-tooltip>
              </span>
            </datablau-tag>
          </div>
          <div
            v-if="learnTargetType === 'AUTH_STANDARD'"
            style="
              position: relative;
              width: 938px;
              height: 400px;
              border: 1px solid #dddddd;
              border-radius: 2px;
              margin-top: 8px;
            "
          >
            <datablau-form-submit>
              <datablau-table
                :data="targetData"
                @selection-change="handleTargetSelectionChange"
                :data-selectable="true"
              >
                <el-table-column
                  prop="name"
                  :label="$t('intelligence.infoItemName')"
                ></el-table-column>
                <el-table-column
                  prop="stdCode"
                  :label="$t('intelligence.infoItemCode')"
                ></el-table-column>
                <el-table-column
                  prop="catalogPathName"
                  :label="$t('intelligence.inCatalog')"
                ></el-table-column>
                <el-table-column
                  prop="businessDepartment"
                  width="120"
                  :label="$t('intelligence.department')"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  :label="$t('securityModule.operate')"
                  width="80"
                  align="center"
                  fixed="right"
                >
                  <template slot-scope="scope">
                    <datablau-button
                      size="mini"
                      type="icon"
                      style="display: inline-block; margin-left: 0"
                      @click="deleteTargetItems(scope.row)"
                    >
                      <datablau-tooltip
                        effect="dark"
                        :content="$t('securityModule.delete')"
                        placement="bottom"
                      >
                        <i class="iconfont icon-delete"></i>
                      </datablau-tooltip>
                    </datablau-button>
                  </template>
                </el-table-column>
              </datablau-table>
              <template slot="buttons" v-if="selectedTargetItems.length">
                <div class="bottom">
                  <div style="position: absolute">
                    <span style="margin-right: 20px">
                      {{
                        $t('securityModule.selectNum', {
                          num: selectedTargetItems.length,
                        })
                      }}
                    </span>
                    <datablau-button
                      type="danger"
                      @click="deleteTargetItems(selectedTargetItems)"
                      class="el-icon-delete"
                      size="small"
                    >
                      {{ $t('securityModule.delete') }}
                    </datablau-button>
                  </div>
                </div>
              </template>
            </datablau-form-submit>
          </div>
          <div class="item-tip" v-if="showError">
            {{ $t('intelligence.selectAlgorithmStudy') }}
          </div>
        </el-form-item>
        <el-form-item
          class="is-required form-item-radio"
          v-if="ruleType === ruleTypeEnum.GENERAL_RULE"
          :label="$t('intelligence.idAssetsType')"
        >
          <datablau-radio v-model="assetsType" @change="assetsChange">
            <el-radio label="TABLE_VIEW">
              {{ $t('intelligence.tableAndView') }}
            </el-radio>
            <el-radio label="COLUMN">
              {{ $t('securityModule.dataItem') }}
            </el-radio>
            <el-radio label="REPORT" v-if="$versionFeature['dataasset_CatalogType']">
              {{ $t('securityModule.reportForm') }}
            </el-radio>
            <el-radio label="FILE" v-if="$versionFeature['dataasset_CatalogType']">
              {{ $t('securityModule.file') }}
            </el-radio>
          </datablau-radio>
        </el-form-item>
        <!-- 新增的优先级 -->
        <el-form-item
          v-if="ruleType === ruleTypeEnum.GENERAL_RULE"
          :label="$t('intelligence.priority')"
        >
          <datablau-radio v-model="priorityType">
            <el-radio label="1">P1</el-radio>
            <el-radio label="2">P2</el-radio>
            <el-radio label="3">P3</el-radio>
          </datablau-radio>
        </el-form-item>

        <el-form-item :label="$t('securityModule.des')">
          <datablau-input
            class="discern-desc"
            v-model="formContent.description"
            :placeholder="$t('securityModule.input')"
            type="textarea"
            style="width: 780px"
            maxlength="1000"
            show-word-limit
          ></datablau-input>
        </el-form-item>
        <el-form-item
          class="is-required form-item-radio"
          v-if="ruleType === ruleTypeEnum.MACHINE_LEARNING"
          :label="$t('intelligence.idAssetsType')"
        >
          <datablau-radio v-model="assetsType" @change="assetsChange">
            <el-radio label="TABLE_VIEW">
              {{ $t('intelligence.tableAndView') }}
            </el-radio>
            <el-radio label="COLUMN">
              {{ $t('securityModule.dataItem') }}
            </el-radio>
            <el-radio label="REPORT" v-if="$versionFeature['dataasset_CatalogType']">
              {{ $t('securityModule.reportForm') }}
            </el-radio>
            <el-radio label="FILE" v-if="$versionFeature.dataasset_CatalogType">
              {{ $t('securityModule.file') }}
            </el-radio>
            <!-- <el-radio label="BASIC_STANDARD">
              {{ $t('assets.generalSettings.basicStandard') }}
            </el-radio>
            <el-radio label="NDEX_STANDARD">
              {{ $t('assets.generalSettings.index') }}
            </el-radio> -->
          </datablau-radio>
        </el-form-item>
        <el-form-item
          v-if="
            ruleType === ruleTypeEnum.MACHINE_LEARNING &&
            assetsType === 'COLUMN'
          "
          class="is-required"
          label="机器学习类型"
          prop="learnTargetType"
        >
          <datablau-radio
            v-model="learnTargetType"
            @change="handleLearnTypeChange"
          >
            <el-radio label="TABLE_PUBLISH">依赖已识别表/视图</el-radio>
            <el-radio label="TABLE_UN_PUBLISH">不依赖已识别表/视图</el-radio>
          </datablau-radio>
        </el-form-item>
        <!-- 新增的优先级 -->
        <el-form-item
          v-if="
            ruleType === ruleTypeEnum.CONSANGUINITY_CASCADE ||
            ruleType === ruleTypeEnum.MACHINE_LEARNING
          "
          :label="$t('intelligence.priority')"
        >
          <datablau-radio v-model="priorityType">
            <el-radio label="1">P1</el-radio>
            <el-radio label="2">P2</el-radio>
            <el-radio label="3">P3</el-radio>
          </datablau-radio>
        </el-form-item>
        <el-form-item
          v-if="ruleType === ruleTypeEnum.MACHINE_LEARNING"
          :label="$t('intelligence.rateVal')"
        >
          <el-input-number
            v-model="formContent.scoreThreshold"
            :min="0"
            :max="1"
            :precision="2"
            :step="0.1"
            size="small"
          ></el-input-number>
          <span style="color: #999; font-size: 12px">
            <i class="iconfont icon-tips"></i>
            {{ $t('intelligence.inputTip') }}
          </span>
        </el-form-item>
        <el-form-item
          v-if="ruleType === ruleTypeEnum.MACHINE_LEARNING"
          :label="$t('intelligence.recResult')"
        >
          <el-input-number
            v-model="formContent.suggestionThreshold"
            :min="1"
            :max="10"
            :precision="0"
            :step="1"
            size="small"
          ></el-input-number>
          <span style="color: #999; font-size: 12px">
            <i class="iconfont icon-tips"></i>
            {{ $t('intelligence.inputTip1') }}
          </span>
        </el-form-item>
      </datablau-form>
      <div
        class="rule-content"
        v-if="ruleType !== ruleTypeEnum.MACHINE_LEARNING"
      >
        <datablau-detail-subtitle
          :title="$t('intelligence.idRules')"
          mt="0px"
          mb="20px"
        ></datablau-detail-subtitle>
        <datablau-button
          v-if="ruleType === ruleTypeEnum.GENERAL_RULE"
          type="important"
          class="iconfont icon-tianjia add-btn"
          style="margin-left: 10px"
          @click="addQuery"
        >
          {{ $t('intelligence.newConditionGroup') }}
        </datablau-button>
        <datablau-button
          v-if="ruleType === ruleTypeEnum.GENERAL_RULE && assetsType!== 'REPORT' && assetsType!== 'FILE'"
          style="margin-left: 10px; vertical-align: top"
          @click="showTsetBox"
        >
          {{ $t('intelligence.test') }}
          <datablau-tooltip
            :content="$t('intelligence.testTip')"
            placement="bottom"
            effect="dark"
          >
            <i
              class="iconfont icon-tips"
              style="margin-right: 0; color: #409eff"
            ></i>
          </datablau-tooltip>
        </datablau-button>
        <datablau-button
          v-if="ruleType === ruleTypeEnum.GENERAL_RULE"
          :disabled="!($auth.DATA_ASSET_DISCERN_ALGORITHM_UPLOAD ||
          $auth.DATA_ASSET_DISCERN_ALGORITHM_DOWNLOAD ||
          $auth.DATA_ASSET_DISCERN_ALGORITHM_CATALOG_MANAGE ||
          $auth.DATA_ASSET_DISCERN_ALGORITHM_CATALOG ||
          $auth.DATA_ASSET_DISCERN_ALGORITHM_MANAGE ||
          $auth.DATA_ASSET_DISCERN_ALGORITHM
          )"
          type="important"
          style="margin-left: 10px"
          @click="goToAlgorithm"
        >
          管理算法库
        </datablau-button>
        <div
          v-if="ruleType === ruleTypeEnum.GENERAL_RULE"
          style="padding-left: 50px; position: relative"
          class="groups-outer"
          :class="{
            hide: ruleObj.discernConditionDtoList.length <= 1,
            green: ruleObj.logic === 'OR',
          }"
        >
          <div
            v-for="(formDatas, idx) in ruleObj.discernConditionDtoList"
            :key="idx"
            style="margin-bottom: 20px; padding-left: 50px; position: relative"
            class="group"
          >
            <div
              class="item"
              v-for="(formData, idx1) in formDatas.conditionList"
              :key="idx1"
              :class="{
                hide: formData.length <= 1,
                green: formDatas.logic === 'OR',
              }"
            >
              <div class="left-item">
                <datablau-select
                  clearable
                  @change="v => changeProperty(v, idx, idx1)"
                  v-model="formData.firstProperty"
                >
                  <el-option
                    :value="o.value"
                    :label="o.label"
                    v-for="o in firstLayer"
                    :key="o.value"
                  ></el-option>
                </datablau-select>
              </div>
              <div
                class="inner-item"
                :class="{
                  'inner-spec-item': formData.firstProperty === 'TAG',
                }"
              >
                <!-- 一级属性为‘内建属性’ -->
                <datablau-select
                  v-if="
                    formData.firstProperty === 'SELF_PROPERTY' ||
                    !formData.firstProperty
                  "
                  :disabled="!formData.firstProperty"
                  clearable
                  v-model="formData.secondProperty"
                >
                  <el-option
                    :value="o.value"
                    :label="o.label"
                    v-for="o in secondLayer"
                    :key="o.value"
                  ></el-option>
                </datablau-select>
                <!-- 一级属性为‘自定义属性’ -->
                <datablau-select
                  clearable
                  v-if="formData.firstProperty === 'DEF_PROPERTY'"
                  v-model="formData.udpId"
                  :placeholder="$t('securityModule.placeSelect')"
                >
                  <el-option
                    v-for="o in customerList"
                    :key="o.id"
                    :label="o.name"
                    :value="o.id"
                  />
                </datablau-select>
                <!-- 一级属性为‘标签’ -->
                <template v-if="formData.firstProperty === 'TAG'">
                  <div class="datablau-normal" @click="toAddRuleTag(idx, idx1)">
                    <datablau-button
                      type="icon"
                      low-key
                      class="iconfont icon-tianjia"
                    ></datablau-button>
                    <span class="span">
                      {{ $t('intelligence.selectLable') }}
                    </span>
                  </div>
                  <div
                    class="has-select"
                    v-if="Object.keys(formData.tagList).length > 0"
                  ></div>
                  <datablau-tag
                    style="margin-left: 6px"
                    closable
                    v-for="(val, k) in formData.tagList.slice(0, 2) || []"
                    :key="val.split('^')[0]"
                    @close="removeRuleTag(idx, idx1, k)"
                  >
                    <is-show-tooltip
                      class="tag-type"
                      :content="val.split('^')[1]"
                      :refName="'catalog'"
                    ></is-show-tooltip>
                  </datablau-tag>
                  <el-popover
                    popper-class="dir-tm-popover"
                    style="display: inline-block"
                    v-if="formData.tagList.length - 2 > 0"
                    placement="bottom"
                    title=""
                    width="400"
                    trigger="click"
                    transition="fade-in-linear"
                    :visible-arrow="false"
                  >
                    <span
                      style="cursor: pointer; color: #555; margin-left: 8px"
                      slot="reference"
                    >
                      {{ $t('securityModule.more') }}
                      {{ formData.tagList.length - 2 }}
                      {{ formData.tagList.length - 2 > 99 ? '+' : '' }}
                    </span>
                    <p
                      style="
                        margin-bottom: 8px;
                        overflow: hidden;
                        color: #20293b;
                        font-size: 14px;
                      "
                    >
                      {{ $t('intelligence.lable') }}：{{
                        Object.keys(formData.tagList).length
                      }}{{ $t('securityModule.strip') }}
                    </p>
                    <datablau-tag
                      class="discern-tag"
                      closable
                      style="margin-bottom: 5px"
                      v-for="(val, k) in formData.tagList"
                      :key="val.split('^')[0]"
                      @close="removeRuleTag(idx, idx1, k)"
                    >
                      <is-show-tooltip
                        class="tag-type"
                        :content="val.split('^')[1]"
                        :refName="'catalog'"
                      ></is-show-tooltip>
                    </datablau-tag>
                  </el-popover>
                </template>
                <!-- 一级属性为‘数据值’ -->
                <datablau-input
                  class="threshold-input"
                  style="width: 187px"
                  :placeholder="$t('intelligence.inputTip2')"
                  :min="1"
                  :max="100"
                  @input="v => numberInput(v, idx, idx1)"
                  v-model="formData.threshold"
                  v-if="formData.firstProperty === 'DATA_VALUE'"
                ></datablau-input>
              </div>
              <div class="right-item" v-if="formData.firstProperty !== 'TAG'">
                <datablau-select
                  filterable
                  clearable
                  :placeholder="$t('intelligence.selectAlgorithm')"
                  remote
                  :remote-method="remoteMethod"
                  @focus="handleAlgorithm"
                  v-selectLazyLoad="lazyloading"
                  v-model="formData.algorithmId"
                >
                  <el-option
                    v-for="algorith in nowRuleList"
                    :key="algorith.algorithmId"
                    :label="algorith.algorithmName"
                    :value="algorith.algorithmId"
                  ></el-option>
                  <el-option
                    v-if="algorithmLoading"
                    value=""
                    class="table-option"
                  >
                    {{ $t('securityModule.loading') }}
                  </el-option>
                </datablau-select>
              </div>
              <div class="item-btn" style="margin-left: 10px">
                <datablau-button
                  class="iconfont icon-delete"
                  type="icon"
                  low-key
                  @click="removeItem(idx, idx1)"
                ></datablau-button>
                <datablau-button
                  class="iconfont icon-tianjia"
                  type="icon"
                  low-key
                  @click="addItem(idx, idx1)"
                ></datablau-button>
              </div>
            </div>
            <!-- 内层与和或 -->
            <span
              class="logical-line"
              :class="{
                hide: formDatas.conditionList.length <= 1,
                green: formDatas.logic === 'OR',
              }"
            >
              <span
                class="logical-btn"
                @click="changeLogicalType1(formDatas.logic, idx)"
              >
                {{
                  formDatas.logic === 'OR'
                    ? $t('securityModule.or')
                    : $t('securityModule.yu')
                }}
              </span>
            </span>
          </div>
          <!-- 外层与和或 -->
          <span
            class="logical-line"
            :class="{
              hide: ruleObj.discernConditionDtoList.length <= 1,
              green: ruleObj.logic === 'OR',
            }"
          >
            <span class="logical-btn" @click="changeLogicalType">
              {{
                ruleObj.logic === 'OR'
                  ? $t('securityModule.or')
                  : $t('securityModule.yu')
              }}
            </span>
          </span>
        </div>
        <div
          class="blood-box"
          v-if="ruleType === ruleTypeEnum.CONSANGUINITY_CASCADE"
        >
          <datablau-radio
            v-model="bloodType"
            :radioTitle="$t('intelligence.consanguinityDir')"
          >
            <el-radio label="UPSTREAM">
              {{ $t('intelligence.upstream') }}
            </el-radio>
            <el-radio label="DOWNSTREAM">
              {{ $t('intelligence.downstream') }}
            </el-radio>
            <!-- <el-radio label="UP_DOWN">上游和下游</el-radio> -->
          </datablau-radio>
        </div>
      </div>
      <div
        class="rule-target"
        v-if="ruleType !== ruleTypeEnum.CONSANGUINITY_CASCADE"
      >
        <datablau-detail-subtitle
          :title="'识别结果处理'"
          mt="0px"
          mb="20px"
        ></datablau-detail-subtitle>
        <datablau-form
          :model="formContent"
          ref="targetForm"
          :rules="rules"
          :label-width="'160px'"
        >
          <el-form-item :label="assetLabel" prop="catalogIdList"  v-if="ruleType !== ruleTypeEnum.MACHINE_LEARNING || !(ruleType === ruleTypeEnum.MACHINE_LEARNING &&
            assetsType === 'COLUMN' && learnTargetType === 'TABLE_PUBLISH')">
<!--            <p>{{ assetLabel }}</p>-->
            <el-tooltip class="item" effect="dark" content="将识别结果挂载到对应资产目录下" placement="top">
              <i class="iconfont icon-tips" style="margin-left: -4px;position: relative;top: 1px;"></i>
            </el-tooltip>
            <datablau-button
              type="icon"
              class="iconfont icon-tianjia"
              @click="toSelectAssetCatalogs"
              style="margin-left: 4px;"
            ></datablau-button>
            <el-select v-model="formContent.catalogIdList" v-show="false"  multiple>
              <el-option v-for="(v, i) in option" :key="'item' + i" :label="v" :value="v"></el-option>
            </el-select>
            <el-tag
              style="margin-left: 0.3em"
              size="small"
              v-for="(v, i) in formContent.catalogIdList"
              :key="'item' + i"
              closable
              @close="_ => deleteCatalog(catalog, i)"
            >
              {{ v.catalogPathName || v.catalogNamePath || v.name }}
            </el-tag>

          </el-form-item>
          <el-form-item :label="tagLabel" prop="assetCatalogs" v-if="assetsType!== 'REPORT'">
<!--            <p>{{ tagLabel }}</p>-->
            <el-tooltip class="item" effect="dark" content="将识别结果关联对应标签下" placement="top">
              <i class="iconfont icon-tips" style="margin-left: -4px;;position: relative;top: 1px;"></i>
            </el-tooltip>

            <datablau-button
              type="icon"
              class="iconfont icon-tianjia"
              @click="addTags"
              style="margin-left: 4px;"
            ></datablau-button>
            <el-tag
              style="margin-left: 0.3em"
              size="small"
              v-for="(v, i) in tagIdList"
              :key="'item' + i"
              closable
              @close="_ => deleteTag(tag, i)"
            >
              {{ tagNameMap[v] }}
            </el-tag>

          </el-form-item>
        </datablau-form>
      </div>
      <div slot="buttons">
        <datablau-button type="important" @click="sure">
          {{ $t('securityModule.sure') }}
        </datablau-button>
        <datablau-button type="secondary" @click="cancel">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
      </div>
    </datablau-form-submit>
    <datablau-detail
      v-else
      :column="1"
      class="rule-datablau-detail"
      v-loading="detailLoading"
    >
      <datablau-detail-subtitle
        style="margin-left: 20px"
        :title="$t('intelligence.baseInfo')"
        mt="20px"
      ></datablau-detail-subtitle>
      <el-form-item :label="$t('intelligence.ruleName')" prop="name">
        {{ formContent.name }}
      </el-form-item>

      <el-form-item
        v-if="
          ruleType === ruleTypeEnum.GENERAL_RULE &&
          classifyCatalogList.length > 0
        "
        :label="$t('intelligence.idAssetsType')"
      >
        <div v-if="assetsTypeObj[assetsType]">{{assetsTypeObj[assetsType]}}</div>
        <div v-else>{{ $t('intelligence.column') }}</div>
      </el-form-item>
      <el-form-item
        v-if="ruleType === ruleTypeEnum.MACHINE_LEARNING && assetsType === 'COLUMN'"
        :label="$t('intelligence.algorithmStudy')"
      >
        {{ getTargetName(learnTargetType) }}
        <template v-if="targetData.length > 0">
          <div
            style="
              border: 1px solid #ddd;
              width: 640px;
              padding: 5px 0 8px 8px;
              margin-top: 5px;
            "
          >
            <span v-for="(item, index) in targetData" :key="item.id">
              {{ item.name + (index + 1 === targetData.length ? '' : '，') }}
            </span>
          </div>
        </template>
      </el-form-item>
      <el-form-item :label="$t('intelligence.idRulesCatalog')" prop="catalog">
        {{ formContent.catalog }}
      </el-form-item>
      <el-form-item :label="$t('securityModule.des')" prop="description">
        {{ formContent.description }}
      </el-form-item>
      <el-form-item :label="$t('intelligence.priority')">
        {{ getPriorityType(priorityType) }}
      </el-form-item>
      <el-form-item
        v-if="ruleType === ruleTypeEnum.MACHINE_LEARNING"
        :label="$t('intelligence.rateVal')"
      >
        {{ formContent.scoreThreshold }}
      </el-form-item>
      <el-form-item
        v-if="ruleType === ruleTypeEnum.MACHINE_LEARNING"
        :label="$t('intelligence.recResult')"
      >
        {{ formContent.suggestionThreshold }}
      </el-form-item>
      <div
        class="rule-content"
        v-if="ruleType !== ruleTypeEnum.MACHINE_LEARNING"
      >
        <datablau-detail-subtitle
          :title="$t('intelligence.idRules')"
          mt="0px"
          mb="20px"
        ></datablau-detail-subtitle>

        <div
          v-if="ruleType === ruleTypeEnum.GENERAL_RULE"
          style="padding-left: 50px; position: relative"
          class="groups-outer"
          :class="{
            hide: ruleObj.discernConditionDtoList.length <= 1,
            green: ruleObj.logic === 'OR',
          }"
        >
          <div
            v-for="(formDatas, idx) in ruleObj.discernConditionDtoList"
            :key="idx"
            style="margin-bottom: 20px; padding-left: 50px; position: relative"
            class="group"
          >
            <div
              class="item"
              v-for="(formData, idx1) in formDatas.conditionList"
              :key="idx1"
              :class="{
                hide: formData.length <= 1,
                green: formDatas.logic === 'OR',
              }"
            >
              <div class="left-item">
                <span class="span-value" style="">
                  {{ getFirstName(formData.firstProperty) }}
                </span>
              </div>
              <div
                class="inner-item"
                :class="{
                  'inner-spec-item': formData.firstProperty === 'TAG',
                }"
              >
                <!-- 一级属性为‘内建属性’ -->
                <span
                  v-if="formData.firstProperty === 'SELF_PROPERTY'"
                  class="span-value"
                  style="width: 187px"
                >
                  {{ getSecondName(formData.secondProperty) }}
                </span>
                <!-- 一级属性为‘自定义属性’ -->
                <span
                  v-if="formData.firstProperty === 'DEF_PROPERTY'"
                  class="span-value"
                  style="width: 187px"
                >
                  {{ getCustomName(formData.udpId) }}
                </span>
                <!-- 一级属性为‘标签’ -->
                <template v-if="formData.firstProperty === 'TAG'">
                  <el-tag
                    size="mini"
                    v-for="val in formData.tagList.slice(0, 2) || []"
                    :key="val.split('^')[0]"
                  >
                    <is-show-tooltip
                      class="tag-type"
                      :content="val.split('^')[1]"
                      :refName="'catalog'"
                    ></is-show-tooltip>
                  </el-tag>
                  <el-popover
                    popper-class="dir-tm-popover"
                    style="display: inline-block"
                    v-if="formData.tagList.length - 2 > 0"
                    placement="bottom"
                    title=""
                    width="400"
                    trigger="hover"
                    transition="fade-in-linear"
                    :visible-arrow="false"
                  >
                    <span
                      style="cursor: pointer; color: #555; margin-left: 8px"
                      slot="reference"
                    >
                      {{ $t('securityModule.more') }}
                      {{ formData.tagList.length - 2 }}
                      {{ formData.tagList.length - 2 > 99 ? '+' : '' }}
                    </span>
                    <p
                      style="
                        margin-bottom: 8px;
                        overflow: hidden;
                        color: #20293b;
                        font-size: 14px;
                      "
                    >
                      {{ $t('intelligence.lable') }}：{{
                        Object.keys(formData.tagList).length
                      }}{{ $t('securityModule.strip') }}
                    </p>
                    <el-tag
                      class="discern-tag"
                      style="margin-bottom: 5px"
                      v-for="(val, k) in formData.tagList"
                      :key="val.split('^')[0]"
                      size="normal"
                      effect="light"
                    >
                      <is-show-tooltip
                        class="tag-type"
                        :content="val.split('^')[1]"
                        :refName="'catalog'"
                      ></is-show-tooltip>
                    </el-tag>
                  </el-popover>
                </template>
                <!-- 一级属性为‘数据值’ -->
                <span
                  v-if="formData.firstProperty === 'DATA_VALUE'"
                  class="span-value"
                  style="width: 187px"
                >
                  {{ formData.threshold }} %
                </span>
              </div>
              <div class="right-item" v-if="formData.firstProperty !== 'TAG'">
                <span class="span-value">
                  {{ getRuleName(formData.algorithmId) }}
                </span>
              </div>
            </div>
            <!-- 内层与和或 -->
            <span
              class="logical-line"
              :class="{
                hide: formDatas.conditionList.length <= 1,
                green: formDatas.logic === 'OR',
              }"
            >
              <span class="logical-btn" style="cursor: default">
                {{
                  formDatas.logic === 'OR'
                    ? $t('securityModule.or')
                    : $t('securityModule.yu')
                }}
              </span>
            </span>
          </div>
          <!-- 外层与和或 -->
          <span
            class="logical-line"
            :class="{
              hide: ruleObj.discernConditionDtoList.length <= 1,
              green: ruleObj.logic === 'OR',
            }"
          >
            <span class="logical-btn" style="cursor: default">
              {{
                ruleObj.logic === 'OR'
                  ? $t('securityModule.or')
                  : $t('securityModule.yu')
              }}
            </span>
          </span>
        </div>
        <div
          style="margin-left: -20px"
          v-if="ruleType === ruleTypeEnum.CONSANGUINITY_CASCADE"
        >
          <el-form-item label="血缘级联方向">
            <span v-if="bloodType === 'UPSTREAM'">
              {{ $t('intelligence.upstream') }}
            </span>
            <span v-if="bloodType === 'DOWNSTREAM'">
              {{ $t('intelligence.downstream') }}
            </span>
            <span v-if="bloodType === 'UP_DOWN'">
              {{ $t('intelligence.upAndDownstream') }}
            </span>
          </el-form-item>
        </div>
      </div>
      <div
        class="rule-target"
        v-if="ruleType !== ruleTypeEnum.CONSANGUINITY_CASCADE"
      >
        <datablau-detail-subtitle
          :title="'识别结果处理'"
          mt="0px"
          mb="20px"
        ></datablau-detail-subtitle>
        <datablau-form :model="formContent" ref="targetForm" :rules="rules" :label-width="'160px'">
          <el-form-item :label="assetLabel" prop="catalogIdList"  v-if="ruleType !== ruleTypeEnum.MACHINE_LEARNING || !(ruleType === ruleTypeEnum.MACHINE_LEARNING &&
            assetsType === 'COLUMN' && learnTargetType === 'TABLE_PUBLISH')">
<!--            <p>{{ assetLabel }}</p>-->
            <div style="margin-top: -12px;">
              <el-tag
                style="margin-left: 0.3em;margin-top: 10px"
                size="small"
                v-for="(v, i) in formContent.catalogIdList"
                :key="'item' + i"
              >
                {{ v.catalogPathName || v.catalogNamePath || v.name }}
              </el-tag>
            </div>
          </el-form-item>
          <el-form-item :label="tagLabel" prop="assetCatalogs"  v-if="assetsType!== 'REPORT'">
<!--            <p>{{ tagLabel }}</p>-->
            <div style="margin-top: -12px;">
            <el-tag
              style="margin-left: 0.3em;margin-top: 10px"
              size="small"
              v-for="(v, i) in tagIdList"
              :key="'item' + i"
            >
              {{ tagNameMap[v] }}
            </el-tag>
            </div>
          </el-form-item>
        </datablau-form>
      </div>
    </datablau-detail>

    <template v-if="$store.state.showAssetAlgorithm">
      <asset-algorithm
        @back="hideAssetAlgorithm"
        from="rules"
      ></asset-algorithm>
    </template>
  </div>
</template>

<script>
import newDiscern from './newDiscern.js'
export default newDiscern
</script>
<style lang="scss">
.dir-tm-popover {
  > p {
    text-align: left;
  }
}
.tag-tree-container {
  .hide-row {
    display: none;
  }
}
</style>
<style lang="scss" scoped>
/deep/ .is-block {
  span {
    font-family: 'iconfont';
    font-size: 12px;
  }
}
.sep-btn-right {
  &:before {
    float: right;
    margin-left: 4px;
  }
}
.tree-box {
  position: absolute;
  top: 46px;
  bottom: 0;
  left: 20px;
  right: 20px;
  overflow-y: auto;
}
.form-item-radio {
  /deep/ &.el-form-item {
    .el-form-item__label {
      margin-top: 0;
    }
    .el-form-item__content {
      .datablau-radio {
        vertical-align: middle;
      }
    }
  }
}
.tag-box {
  /deep/ .datablau-tag {
    .el-tag {
      .el-tag__close {
        top: -1px;
      }
    }
  }
}
/deep/ .datablau-tag {
  height: 24px;
  line-height: 24px;
  margin-bottom: 8px;
  margin-right: 4px;
  .el-tag {
    vertical-align: top;
    .text-tooltip {
      height: 24px;
      line-height: 24px;
    }
    .el-tag__close {
      top: -8px;
    }
  }
}
.target-tag {
  display: inline-block;
  max-width: 88px;
  box-sizing: border-box;
  color: #409eff;
  background: transparent;
  text-align: center;
  vertical-align: top;
  &.target-tag-detail {
    max-width: auto;
  }
  &:last-child {
    margin-right: 0;
  }
  .el-tag .el-icon-close {
    top: -8px;
  }
}
.discern-tag {
  margin-right: 4px;
  /deep/ .el-tag {
    vertical-align: middle;
    width: 120px;
    padding: 0 8px;
    padding-right: 24px;
    text-align: center;
    height: 24px;
    line-height: 24px;
    background: transparentize(#409eff, 0.9);
    color: #409eff;
    margin-right: 4px;
    margin-left: 0;
    border-radius: 2px;
    position: relative;
    i.el-tag__close {
      position: absolute;
      right: 6px !important;
      top: 4px !important;
    }
  }
}
</style>
<style scoped lang="scss">
.el-form-item__content {
  position: relative;
  .item-tip {
    line-height: 14px;
    height: 14px;
    position: absolute;
    bottom: -14px;
    color: #f56c6c;
  }
}
.tip-box {
  color: #409eff;
  &.err-tip-box {
    color: #e6ad00;
    i {
      color: #e6ad00;
    }
  }
  i {
    color: #409eff;
    margin-left: 10px;
    margin-right: 5px;
  }
}
.new-discern-page {
  position: absolute;
  top: -8px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9;
  background: #fff;
  padding-top: 50px;
  .rule-content {
    padding: 0 20px;

    .blood-box {
      /deep/ .datablau-radio {
        .radioTitle {
          width: 160px;
          padding-right: 10px;
          display: inline-block;
          text-align: right;
          &:before {
            content: '*';
            color: #f56c6c;
            margin-right: 4px;
          }
        }
      }
    }
    .groups-outer {
      margin-bottom: 20px;
      padding-left: 50px;
      position: relative;
      .group {
        position: relative;
        &.hide {
          &::before {
            display: none;
          }
          &::after {
            display: none;
          }
        }
        .item {
          margin-bottom: 12px;
          &:after {
            content: '';
            display: block;
            clear: both;
          }
          .left-item {
            vertical-align: top;
            display: inline-block;
            line-height: 34px;
            height: 34px;
            width: 200px;
          }
          .span-value {
            display: inline-block;
            width: 200px;
            height: 32px;
            border: 1px solid #dcdfe6;
            line-height: 30px;
            padding-left: 10px;
          }
          .inner-item {
            vertical-align: top;
            display: inline-block;
            line-height: 34px;
            height: 34px;
            width: 200px;
            margin-left: 13px;
            padding-left: 13px;
            position: relative;
            &.inner-spec-item {
              width: 413px;
              // overflow: hidden;
              // white-space: nowrap;
              // text-overflow: ellipsis;
              box-sizing: border-box;
              overflow: hidden;
              &:before {
                background: transparent;
              }
              .el-tag {
                vertical-align: middle;
                width: 120px;
                padding: 0 8px;
                padding-right: 24px;
                text-align: center;
                height: 24px;
                line-height: 24px;
                background: transparentize(#409eff, 0.9);
                color: #409eff;
                margin-right: 4px;
                margin-left: 0;
                border-radius: 2px;
                position: relative;
                /deep/ i {
                  position: absolute;
                  right: 6px;
                  top: 4px;
                }
                /deep/ .text-tooltip {
                  height: 24px;
                  line-height: 24px;
                }
              }
              .more-tag {
                font-size: 12px;
                cursor: pointer;
              }
            }
            &:before {
              content: '';
              position: absolute;
              left: 0px;
              top: 9px;
              width: 2px;
              height: 16px;
              background: #d8d8d8;
            }
            .threshold-input {
              position: relative;
              &:after {
                content: '%';
                position: absolute;
                right: 8px;
                top: 0;
              }
            }
            .datablau-normal {
              display: inline-block;
              // height: 24px;
              // line-height: 24px;
              // margin-top: 5px;
              cursor: pointer;
              .iconfont {
                margin-left: 0px;
                color: #409eff;
                &:before {
                  vertical-align: top;
                }
              }
              .span {
                color: #409eff;
                margin-left: 4px;
                display: inline-block;
                height: 24px;
                line-height: 24px;
              }
            }
            .has-select {
              display: inline-block;
              margin-left: 6px;
              color: #409eff;
            }
          }
          .right-item {
            vertical-align: top;
            display: inline-block;
            line-height: 34px;
            height: 34px;
            margin-left: 13px;
            // padding-left: 13px;
            position: relative;
            width: 200px;
            &.no-line {
              &:before {
                background: transparent;
              }
            }
            // &:before {
            //   content: '';
            //   position: absolute;
            //   left: 0px;
            //   top: 9px;
            //   width: 2px;
            //   height: 16px;
            //   background: #d8d8d8;
            // }
            .function-name {
              display: inline-block;
            }
          }
          .item-btn {
            vertical-align: top;
            display: inline-block;
            line-height: 34px;
            margin-left: 10px;
          }
          .logical-line {
          }
        }
      }

      .logical-line {
        position: absolute;
        left: 30px;
        top: 31px;
        bottom: 37px;
        border-left: 2px solid lightskyblue;
        display: inline-block;
        &:before {
          content: '';
          width: 0;
          -webkit-transform: rotate(45deg);
          transform: rotate(45deg);
          height: 20px;
          display: inline-block;
          border-left: 2px solid transparent;
          border-left: 2px solid lightskyblue;
          position: absolute;
          left: 5px;
          top: -17px;
        }
        &:after {
          content: '';
          width: 0;
          -webkit-transform: rotate(135deg);
          transform: rotate(135deg);
          height: 20px;
          display: inline-block;
          border-left: 2px solid transparent;
          border-left: 2px solid lightskyblue;
          position: absolute;
          left: 5px;
          bottom: -17px;
        }
        &.hide {
          display: none;
        }
        &.green {
          border-left-color: lightgreen;
          .logical-btn {
            background-color: lightgreen;
          }
          &:before {
            border-left: 2px solid lightgreen;
          }
          &:after {
            border-left: 2px solid lightgreen;
          }
        }
        .logical-btn {
          background-color: lightskyblue;
          width: 30px;
          height: 30px;
          line-height: 29px;
          color: #fff;
          font-size: 14px;
          border-radius: 15px;
          text-align: center;
          position: absolute;
          left: -16px;
          top: 50%;
          margin-top: -15px;
          cursor: pointer;
          z-index: 1;
        }
      }
    }
  }
  .rule-target {
    padding: 0 20px;
  }
  /deep/ .datablau-detail .detail-form .el-form-item {
    width: 100%;
  }
  .rule-datablau-detail {
    position: absolute;
    top: 0px;
    bottom: 0;
    left: 0;
    right: 0;
    overflow-y: auto;
  }

  /deep/.el-form-item {
    .discern-desc {
      .el-textarea {
        width: 640px;
      }
    }
  }
}
.fromre-box {
  float: left;
  width: 240px;
  border: 1px solid #dddddd;
  height: 400px;
  position: relative;
  /deep/ .el-tree {
    .el-tree-node__content {
      .el-tree-node__expand-icon.expanded{
        margin-top: -10px;
      }
      .el-icon-caret-right {
        width: 10px;
        /*margin-left: 0;*/
        margin-right: 10px;
      }
    }
  }
  &.FILE {
    /deep/ .el-tree {
      .el-tree-node__content {
        .el-icon-caret-right {
          width: 20px;
          margin-left: 0;
        }
      }
    }
  }
  .title {
    height: 30px;
    line-height: 30px;
    background: rgba(64, 158, 255, 0.1);
    padding: 0 12px;
    i {
      color: #409eff;
      font-size: 14px;
    }
    span {
      color: #409eff;
      margin-left: 10px;
    }
  }
  .fromre-lists {
    position: absolute;
    top: 54px;
    left: 0;
    right: 0;
    bottom: 0;
    max-height: 344px;
    overflow-y: auto;
    .list {
      height: 30px;
      line-height: 30px;
      padding: 0 10px;
      color: #555555;
      cursor: pointer;
      &.list-active {
        background: rgba(64, 158, 255, 0.1);
        color: #409eff;
      }
      i {
        color: #409eff;
        margin-right: 6px;
      }
    }
  }
}
.tables-box,
.field-box {
  float: left;
  width: 360px;
  border: 1px solid #dddddd;
  border-left: 0;
  height: 400px;
  position: relative;
  /deep/ .el-tree {
    .el-tree-node__content {
      .el-icon-caret-right {
        width: 10px;
        margin-left: 0;
      }
    }
  }
  .title {
    height: 30px;
    line-height: 30px;
    background: rgba(64, 158, 255, 0.1);
    padding: 0 12px;
    /deep/ .img-icon-outer {
      vertical-align: middle;
    }
    i {
      color: #409eff;
      font-size: 14px;
    }
    span {
      color: #409eff;
      margin-left: 10px;
    }
  }
  .field-lists {
    /deep/ .el-tree {
      .iconfont {
        color: #c44ad1;
      }
      .el-tree-node {
        &.is-current {
          > .el-tree-node__content {
            background-color: transparent;
            color: #555;
          }
        }
        &.is-checked {
          > .el-tree-node__content {
            background-color: transparentize(#409eff, 0.9);
            color: #409eff;
          }
        }
      }
    }
  }
  .view-tables-lists {
    /deep/ .el-tree {
      .iconfont {
        color: #4b5cc4;
      }
    }
  }
  .tables-lists,
  .field-lists {
    position: absolute;
    top: 54px;
    left: 0;
    right: 0;
    bottom: 0;
    max-height: 344px;
    overflow-y: auto;
    /deep/ .el-tree {
      .icon-shitu {
        color: #4b5cc4;
      }
    }

    .list {
      height: 30px;
      line-height: 30px;
      padding: 0 10px;
      color: #555555;
      cursor: pointer;
      &.list-active {
        background: rgba(64, 158, 255, 0.1);
        color: #409eff;
      }
      /deep/ .img-icon-outer {
        vertical-align: middle;
      }
      i {
        color: #409eff;
        margin-right: 6px;
      }
    }
  }
}
.field-box {
  .title {
    i {
      color: #c44ad1;
    }
  }
}
</style>
