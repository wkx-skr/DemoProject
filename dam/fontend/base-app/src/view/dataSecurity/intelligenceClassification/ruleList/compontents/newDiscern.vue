<template>
  <div class="new-discern-page">
    <!-- 信息项目录弹窗 -->
    <datablau-dialog
      class="jobs-sta"
      width="650px"
      title="请选择识别规则目录"
      :visible.sync="showCatalog"
      v-if="showCatalog"
      :close-on-click-modal="false"
    >
      <div class="tree-box" style="overflow: auto; min-height: 400px">
        <datablau-tree
          node-key="categoryId"
          @node-click="handleCatalog"
          :props="catalogProps"
          :data="treeData"
          :data-icon-function="dataIconFunctionCatalog"
          :expand-on-click-node="false"
          :use-default-sort="false"
          ref="catalogTree"
          :filter-node-method="filterNodeCatalog"
        ></datablau-tree>
      </div>
      <div slot="footer">
        <datablau-button type="secondary" @click="showCatalog = false">
          取消
        </datablau-button>
        <datablau-button
          :disabled="!canSure"
          type="important"
          @click="sureCatalog"
        >
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      title="条件测试"
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
          条件测试
        </div>
        <span style="color: #999; margin-left: 10px">
          建议选择较小数据量的数据表作为测试数据，否则测试时间会过长！
        </span>
      </div>
      <div class="fromre-box">
        <datablau-input
          :iconfont-state="true"
          v-model="fromreKeyword"
          clearable
          style="margin: 10px; width: 220px"
          placeholder="搜索数据源"
        ></datablau-input>
        <div class="fromre-lists">
          <datablau-tree
            v-loading="treeLoading1"
            :show-checkbox="false"
            ref="tree1"
            :data="fromreList"
            :expand-on-click-node="false"
            default-expand-all
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
          placeholder="搜索字段"
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
      <span slot="footer">
        <div
          class="result-box"
          style="float: left; line-height: 34px"
          v-if="testResult"
        >
          测试结果：
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
        <datablau-button type="secondary" @click="showTest = false">
          取 消
        </datablau-button>
        <!-- :disabled="testId" -->
        <datablau-button type="primary" :disabled="!testId" @click="testRule">
          测 试
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      :title="'标签选择'"
      size="l"
      :height="500"
      append-to-body
      v-if="addTagVisible"
      :visible.sync="addTagVisible"
    >
      <datablau-input
        :placeholder="'搜索标签...'"
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
            label="一级分组"
            width="120"
          ></el-table-column>
          <el-table-column
            prop="nameLevel2"
            width="140"
            label="二级分组"
          ></el-table-column>
          <el-table-column label="标签">
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
        <datablau-button type="secondary" @click="closeDialog">
          取消
        </datablau-button>
        <datablau-button
          type="primary"
          :disabled="!checkList.length"
          @click="choseTag"
        >
          确认
        </datablau-button>
      </span>
    </datablau-dialog>
    <!-- 安全分类树 -->
    <catalog-tree
      v-if="showCatalogTree"
      :show="showCatalogTree"
      :dialogType="catalogType"
      :targetData="targetData"
      :clickChild="clickChild"
    ></catalog-tree>
    <add-item
      v-if="showItem"
      :showItem="showItem"
      :clickChild="clickChild"
    ></add-item>
    <datablau-form-submit v-if="editable" v-loading="detailLoading">
      <datablau-detail-subtitle
        style="margin-left: 20px"
        title="基本信息"
        mt="20px"
      ></datablau-detail-subtitle>
      <datablau-form :model="formContent" ref="demoForm" :rules="rules">
        <el-form-item label="规则名称" prop="name">
          <datablau-input
            class="maxlength-input"
            v-model="formContent.name"
            placeholder="请输入规则名称"
            show-word-limit
            maxlength="40"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          v-if="ruleType === ruleTypeEnum.MACHINE_LEARNING"
          class="is-required"
          label="算法学习的目标"
          prop="catalogIds"
        >
          <datablau-select
            v-model="learnTargetType"
            @change="handleLearnTypeChange"
            style="width: 120px; display: inline-block; margin-right: 8px"
          >
            <el-option label="对表进行分类" value="TABLE_ONLY"></el-option>
            <el-option
              label="对字段进行分类(依赖已分类的表)"
              value="TABLE_PUBLISH"
            ></el-option>
            <el-option
              label="对字段进行分类(不依赖已分类的表)"
              value="TABLE_UN_PUBLISH"
            ></el-option>
            <el-option label="信息项" value="AUTH_STANDARD"></el-option>
            <!-- <el-option label="安全分类" value="CATALOG_DESC"></el-option> -->
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
            添加{{
              learnTargetType === 'AUTH_STANDARD' ? '信息项' : '安全分类'
            }}
          </datablau-button>
          <span
            v-if="learnTargetType !== 'TABLE_PUBLISH'"
            style="margin-left: 8px"
          >
            共选 {{ targetData.length }} 条
          </span>
          <div
            v-if="
              learnTargetType === 'TABLE_ONLY' ||
              learnTargetType === 'TABLE_UN_PUBLISH'
            "
            style="
              border: 1px solid #dddddd;
              width: 684px;
              height: 104px;
              padding: 4px 8px;
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
                  label="信息项名称"
                ></el-table-column>
                <el-table-column
                  prop="stdCode"
                  label="信息项编码"
                ></el-table-column>
                <el-table-column
                  prop="catalogPathName"
                  label="所在目录"
                ></el-table-column>
                <el-table-column
                  prop="businessDepartment"
                  width="120"
                  label="业务定义部门"
                ></el-table-column>
                <el-table-column
                  label="操作"
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
                        :content="$t('common.button.delete')"
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
                      当前选中"{{ selectedTargetItems.length }}"条信息，是否
                    </span>
                    <datablau-button
                      type="danger"
                      @click="deleteTargetItems(selectedTargetItems)"
                      class="el-icon-delete"
                      size="small"
                    >
                      删除
                    </datablau-button>
                  </div>
                </div>
              </template>
            </datablau-form-submit>
          </div>
          <div class="item-tip" v-if="showError">请选择算法学习的目标</div>
        </el-form-item>
        <el-form-item
          v-if="ruleType === ruleTypeEnum.GENERAL_RULE"
          label="识别信息项"
          prop="infoItem"
        >
          <datablau-input
            @focus="getInfoItem"
            type="select"
            v-model="formContent.infoItem"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="选择目录" prop="catalog">
          <datablau-input
            @focus="getCatalog"
            v-model="formContent.catalog"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="描述">
          <datablau-input
            v-model="formContent.description"
            type="textarea"
            style="width: 500px"
          ></datablau-input>
        </el-form-item>
        <el-form-item class="is-required" label="优先级">
          <datablau-radio v-model="priorityType">
            <el-radio label="1" style="margin-bottom: 10px; margin-top: 6px">
              P1
            </el-radio>
            <el-radio label="2">P2</el-radio>
            <el-radio label="3">P3</el-radio>
          </datablau-radio>
        </el-form-item>
        <el-form-item
          v-if="ruleType === ruleTypeEnum.MACHINE_LEARNING"
          label="评分阈值"
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
            请输入0～1 之间的数值，支持两位小数点
          </span>
        </el-form-item>
        <el-form-item
          v-if="ruleType === ruleTypeEnum.MACHINE_LEARNING"
          label="推荐结果"
        >
          <el-input-number
            v-model="formContent.suggestionThreshold"
            :min="0"
            :precision="0"
            :step="1"
            size="small"
          ></el-input-number>
          <span style="color: #999; font-size: 12px">
            <i class="iconfont icon-tips"></i>
            请输入1～10之间的数值，不支持小数点
          </span>
        </el-form-item>
      </datablau-form>
      <div
        class="rule-content"
        v-if="ruleType !== ruleTypeEnum.MACHINE_LEARNING"
      >
        <datablau-detail-subtitle
          title="识别规则"
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
          新增条件组
        </datablau-button>
        <datablau-button
          v-if="ruleType === ruleTypeEnum.GENERAL_RULE"
          style="margin-left: 10px; vertical-align: top"
          @click="showTsetBox"
        >
          条件测试
          <datablau-tooltip
            content="建议选择较小数据量的数据表作为测试数据，否则测试时间会过长！"
            placement="bottom"
            effect="dark"
          >
            <i
              class="iconfont icon-tips"
              style="margin-right: 0; color: #409eff"
            ></i>
          </datablau-tooltip>
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
                :class="{ 'inner-spec-item': formData.firstProperty === 'TAG' }"
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
                  placeholder="请选择"
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
                    <i class="iconfont icon-tianjia"></i>
                    <span>选择标签</span>
                  </div>
                  <div
                    class="has-select"
                    v-if="Object.keys(formData.tagList).length > 0"
                  ></div>
                  <el-tag
                    style="margin-left: 6px"
                    size="mini"
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
                      更多 {{ formData.tagList.length - 2 }}
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
                      标签：{{ Object.keys(formData.tagList).length }}条
                    </p>
                    <el-tag
                      class="discern-tag"
                      closable
                      style="margin-bottom: 5px"
                      v-for="(val, k) in formData.tagList"
                      :key="val.split('^')[0]"
                      @close="removeRuleTag(idx, idx1, k)"
                      size="mini"
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
                <datablau-input
                  class="threshold-input"
                  style="width: 187px"
                  placeholder="输入匹配阈值1-100"
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
                  placeholder="请选择算法"
                  remote
                  @focus="handleAlgorithm"
                  :remote-method="remoteMethod"
                  v-model="formData.algorithmId"
                  v-selectLazyLoad="lazyloading"
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
                    加载中...
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
                {{ formDatas.logic === 'OR' ? '或' : '与' }}
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
              {{ ruleObj.logic === 'OR' ? '或' : '与' }}
            </span>
          </span>
        </div>
        <div
          class="blood-box"
          v-if="ruleType === ruleTypeEnum.CONSANGUINITY_CASCADE"
        >
          <datablau-radio v-model="bloodType" :radioTitle="'血缘级联方向'">
            <!-- <el-radio label="UPSTREAM">上游</el-radio> -->
            <el-radio label="DOWNSTREAM">下游</el-radio>
            <!-- <el-radio label="UP_DOWN">上游和下游</el-radio> -->
          </datablau-radio>
        </div>
      </div>
      <div slot="buttons">
        <datablau-button type="important" @click="sure">确定</datablau-button>
        <datablau-button type="secondary" @click="cancel">取消</datablau-button>
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
        title="基本信息"
        mt="20px"
      ></datablau-detail-subtitle>
      <el-form-item label="规则名称" prop="name">
        {{ formContent.name }}
      </el-form-item>
      <el-form-item
        v-if="ruleType === ruleTypeEnum.MACHINE_LEARNING"
        label="算法学习的目标"
      >
        {{
          learnTargetType === 'CATALOG_DESC'
            ? '安全分类'
            : learnTargetType === 'CATALOG_ASSETS'
            ? '已分类的数据资产'
            : '信息项'
        }}
        <template v-if="targetData.length > 0">
          <div
            style="
              border: 1px solid #409eff;
              width: 500px;
              padding: 5px 0 8px 8px;
              margin-top: 5px;
            "
          >
            <div class="target-tag" v-for="item in targetData" :key="item.id">
              <is-show-tooltip
                :content="item.name"
                :refName="'type'"
              ></is-show-tooltip>
            </div>
          </div>
        </template>
      </el-form-item>
      <el-form-item
        v-if="ruleType === ruleTypeEnum.GENERAL_RULE"
        label="识别信息项"
        prop="infoItem"
      >
        {{ formContent.infoItem }}
      </el-form-item>
      <el-form-item label="识别规则目录" prop="catalog">
        {{ formContent.catalog }}
      </el-form-item>
      <el-form-item label="描述" prop="description">
        {{ formContent.description }}
      </el-form-item>
      <el-form-item label="优先级">
        {{ getPriorityType(priorityType) }}
      </el-form-item>
      <el-form-item
        v-if="ruleType === ruleTypeEnum.MACHINE_LEARNING"
        label="评分阈值"
      >
        {{ formContent.scoreThreshold }}
      </el-form-item>
      <el-form-item
        v-if="ruleType === ruleTypeEnum.MACHINE_LEARNING"
        label="推荐结果"
      >
        {{ formContent.suggestionThreshold }}
      </el-form-item>
      <div
        class="rule-content"
        v-if="ruleType !== ruleTypeEnum.MACHINE_LEARNING"
      >
        <datablau-detail-subtitle
          title="识别规则"
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
                :class="{ 'inner-spec-item': formData.firstProperty === 'TAG' }"
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
                      更多 {{ formData.tagList.length - 2 }}
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
                      标签：{{ Object.keys(formData.tagList).length }}条
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
                {{ formDatas.logic === 'OR' ? '或' : '与' }}
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
              {{ ruleObj.logic === 'OR' ? '或' : '与' }}
            </span>
          </span>
        </div>
        <div
          style="margin-left: -20px"
          v-if="ruleType === ruleTypeEnum.CONSANGUINITY_CASCADE"
        >
          <el-form-item label="血缘级联方向">
            <span v-if="bloodType === 'UPSTREAM'">上游</span>
            <span v-if="bloodType === 'DOWNSTREAM'">下游</span>
            <span v-if="bloodType === 'UP_DOWN'">上游和下游</span>
          </el-form-item>
        </div>
      </div>
    </datablau-detail>
  </div>
</template>

<script>
import newDiscern from './newDiscern.js'
export default newDiscern
</script>
<style lang="scss" scoped>
.tag-tree-container {
  .hide-row {
    display: none;
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
  &:last-child {
    margin-right: 0;
  }
  .el-tag .el-icon-close {
    top: -8px;
  }
}
.discern-tag {
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
              cursor: pointer;
              display: inline-block;
              height: 24px;
              line-height: 24px;
              i {
                margin-left: 0px;
                vertical-align: middle;
                color: #409eff;
              }
              span {
                vertical-align: middle;
                color: #409eff;
                margin-left: 6px;
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
            padding-left: 13px;
            position: relative;
            width: 200px;
            &.no-line {
              &:before {
                background: transparent;
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
}
.fromre-box {
  float: left;
  width: 240px;
  border: 1px solid #dddddd;
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
