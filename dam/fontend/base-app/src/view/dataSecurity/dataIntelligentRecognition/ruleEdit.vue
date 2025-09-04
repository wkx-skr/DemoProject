<template>
  <div id="dir-rule-edit" v-loading="loading">
    <atomic-rule
      v-if="showRS"
      @addRules="addRules"
      @close="showRS = false"
    ></atomic-rule>
    <datablau-dialog
      :title="'标签选择'"
      size="l"
      :height="500"
      append-to-body
      :visible.sync="addTagVisible"
    >
      <datablau-input
        :placeholder="'搜索标签...'"
        v-model="tagFilterText"
        clearable
        :iconfont-state="true"
        :on-icon-click="clearTagFilterText"
      ></datablau-input>
      <div
        class="tag-tree-container tag-scroll-box"
        style="height: 320px; position: relative"
      >
        <datablau-table
          :data="catalogTree"
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
              <!-- checkList   currentTagList -->
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
        </datablau-table>
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
    <standard-selector :hideFilter="true"></standard-selector>
    <datablau-dialog
      append-to-body
      title="选择目录"
      :visible.sync="showCatSelector"
      width="30%"
    >
      <div style="height: 500px; position: relative">
        <div class="search-line">
          <datablau-input
            class="keyword-input"
            :placeholder="$t('common.placeholder.normal')"
            v-model="categoryKeyword"
            clearable
            style="width: 100%"
          ></datablau-input>
        </div>
        <div
          class="tree-outer"
          style="
            position: absolute;
            left: 0;
            right: 0;
            top: 50px;
            bottom: 0;
            overflow: auto;
          "
        >
          <datablau-tree
            v-if="showCatSelector"
            :data="treeData"
            node-key="id"
            ref="tree"
            :default-checked-keys="defaultKeys"
            :check-strictly="true"
            :props="defaultProps"
            show-checkbox
            @check-change="getCurrentIds"
            :data-icon-function="dataIconFunction"
            :filter-node-method="filterCategory"
          ></datablau-tree>
        </div>
      </div>
      <span slot="footer">
        <datablau-button @click="showCatSelector = false" type="secondary">
          取消
        </datablau-button>
        <datablau-button @click="commitCatSelects" type="important">
          选择
        </datablau-button>
      </span>
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
          :class="{ 'view-tables-lists': form.discernType === 80500008 }"
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
      <div class="field-box" v-if="form.discernType === 80000005">
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
        <datablau-button type="primary" :disabled="!testId" @click="testRule">
          测 试
        </datablau-button>
      </span>
    </datablau-dialog>
    <div class="datablau-breadcrumb-header" style="padding-left: 0">
      <div>
        <datablau-breadcrumb
          @back="closeEdit"
          :node-data="nodeData"
          :couldClick="false"
        ></datablau-breadcrumb>
      </div>
    </div>
    <datablau-form-submit>
      <div
        style="
          position: absolute;
          top: 0px;
          right: 0;
          bottom: 0px;
          left: 0px;
          overflow: auto;
        "
      >
        <div class="descriptionMessage-title" style="margin: 20px">
          <p class="message-title">业务规则信息</p>
        </div>
        <div class="content-box">
          <el-form
            style="min-height: 250px; padding: 0 20px"
            :rules="rules"
            :model="form"
            ref="form"
            class="detail-form-content"
          >
            <el-form-item label="业务规则名称" prop="name">
              <datablau-input
                style="width: 600px"
                v-model="form.name"
                placeholder="请输入识别规则的中文名称"
                :maxlength="50"
                show-word-limit
              ></datablau-input>
            </el-form-item>
            <el-form-item label="目录" prop="categoryId">
              <datablau-select
                style="width: 600px"
                v-model="form.categoryId"
                placeholder="选择目录"
              >
                <el-option
                  v-for="item in treeData1"
                  :label="item.name"
                  :value="item.id"
                  :key="item.id"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item label="规则描述">
              <datablau-input
                style="width: 600px; max-height: 200px"
                v-model="form.disc"
                type="textarea"
                :rows="4"
                placeholder="请输入内容"
                :maxlength="200"
                show-word-limit
                resize="none"
              ></datablau-input>
            </el-form-item>
            <el-form-item label="识别对象">
              <datablau-radio v-model="form.discernType" @change="changeType">
                <el-radio style="width: 80px" :label="80000004">表</el-radio>
                <el-radio style="width: 80px" :label="80500008">视图</el-radio>
                <el-radio style="width: 80px" :label="80000005">字段</el-radio>
              </datablau-radio>
            </el-form-item>
            <el-form-item label="打标优先级" style="display: inline-block">
              <datablau-select
                v-model="form.level"
                placeholder="选择打标优先级"
              >
                <el-option
                  v-for="item in opt1"
                  :label="item.label"
                  :value="item.value"
                  :key="item.label"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item
              label-width="0"
              style="display: inline-block; margin-left: 20px"
              label=""
            >
              <el-switch v-model="form.status"></el-switch>
              <span
                style="margin-left: 5px"
                :style="{ color: form.status ? '#479EFF' : '' }"
              >
                {{ form.status ? '已启用' : '已禁用' }}
              </span>
            </el-form-item>
          </el-form>
          <div class="descriptionMessage-title" style="margin: 40px 20px 14px">
            <p class="message-title">识别条件</p>
          </div>
          <div class="condition-box">
            <div class="condition-header">
              <datablau-button
                type="important"
                class="iconfont icon-tianjia add-btn"
                @click="addQuery"
              >
                新增条件组
              </datablau-button>
              <datablau-button style="margin-left: 20px" @click="showTsetBox">
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
            </div>
            <div class="graph-box">
              <function-graph
                :key="graphKey"
                @openTags="openTags"
                @update="updateFunction"
                @showRule="showRule"
                :discern-content="discernContent"
                :metricoption="metricoption"
                :distinguishKeys="distinguishKeys"
                :discernType="form.discernType"
                :groupParams="groupParams"
                :isEditMode="isEditMode"
                :outerLogic="outerLogic"
                :customerList="customerList"
                ref="functionGraph"
              ></function-graph>
            </div>
          </div>
          <div class="descriptionMessage-title" style="margin: 20px 20px 0">
            <p class="message-title">识别结果处理</p>
          </div>
          <div class="row tag-row detail-form-content">
            <div class="label">安全等级</div>
            <!-- 多选 但每个目录仅可以选择一个 -->
            <datablau-select
              style="width: 500px; display: inline-block"
              v-model="currentAuthTag"
              placeholder="选择安全等级"
              clearable
            >
              <el-option
                v-for="item in authTags"
                :key="item.content.tagId"
                :label="item.content.name"
                :value="item.content.tagId"
              ></el-option>
            </datablau-select>
          </div>
          <div class="row tag-row">
            <div class="label">标签</div>
            <div class="box">
              <datablau-button @click="openParentTags">
                <i class="el-icon-plus"></i>
              </datablau-button>
              <el-tag
                style="margin-left: 10px; margin-top: 5px"
                type=""
                size="mini"
                closable
                v-for="(val, k) in tagObj"
                :key="val.split('^')[0]"
                @close="removeTag(k)"
              >
                {{ val.split('^')[1] }}
              </el-tag>
            </div>
          </div>
          <div class="row tag-row" v-if="form.discernType === 80000005">
            <div class="label">数据标准</div>
            <div id="standard" class="box">
              <datablau-button @click="showStandard">
                <i class="el-icon-sort" style="transform: rotate(90deg)"></i>
              </datablau-button>
              <el-tag
                v-show="currentStandard.chineseName"
                style="margin-left: 10px"
                type=""
                size="mini"
                closable
                @close="deleteStandard"
              >
                {{ currentStandard.chineseName }}
              </el-tag>
            </div>
          </div>
          <div class="row tag-row">
            <div class="label">数据分类</div>
            <div class="box">
              <datablau-button @click="showCatSelector = true">
                <i class="el-icon-plus"></i>
              </datablau-button>
              <el-tag
                v-for="(item, idx) in currentCatList"
                :key="item.id"
                style="margin-left: 10px; margin-top: 5px"
                size="mini"
                closable
                @close="closeCatTag(idx)"
              >
                {{ item.infoCatalogName }}
              </el-tag>
            </div>
          </div>
          <div class="row tag-row" v-if="form.discernType === 80000005">
            <div class="label">静态脱敏规则</div>
            <datablau-select
              style="width: 500px; display: inline-block"
              v-model="currentMaskingRuleId"
              placeholder="请选择脱敏函数"
              clearable
              filterable
              @change="handleMaskingChange"
            >
              <el-option
                v-for="item in maskingRules"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </datablau-select>
            <datablau-tooltip
              v-show="currentMaskingTips !== ''"
              class="item"
              effect="dark"
              :content="
                currentMaskingTips ? currentMaskingTips : '该规则没有描述'
              "
              placement="right"
            >
              <i class="iconfont icon-tips"></i>
            </datablau-tooltip>
          </div>
          <template v-if="form.discernType === 80000005">
            <div
              class="row tag-row"
              v-for="item in levelOption"
              :key="item.accessCode"
            >
              <div class="label">{{ item.name }}</div>
              <datablau-select
                style="width: 500px; display: inline-block"
                v-model="curAccessCodeList[item.accessCode]"
                placeholder="请选择脱敏规则"
                clearable
                filterable
                @change="value => handleLevelChange(value, item)"
              >
                <el-option
                  v-for="v in maskingRules"
                  :key="v.id"
                  :label="v.name"
                  :value="v.id"
                ></el-option>
              </datablau-select>
            </div>
          </template>
        </div>
      </div>
      <div slot="buttons">
        <datablau-button type="important" @click="beforeSave">
          确定
        </datablau-button>
        <datablau-button type="secondary" @click="closeEdit">
          取消
        </datablau-button>
      </div>
    </datablau-form-submit>
  </div>
</template>
<script>
import ruleEdit from './ruleEdit'
export default ruleEdit
</script>
<style lang="scss" scoped>
#dir-rule-selector {
  width: 100%;
  // height: 520px;
  .rules-box {
    width: 240px;
    height: 365px;
    float: left;
    border: 1px solid #dddddd;
    box-sizing: border-box;
    .filter-input {
      margin: 10px;
    }
    .tree-content {
    }
  }
  .right-box {
    height: 365px;
    // width: 660px;
    max-width: 660px;
    float: left;
    margin-left: 20px;
  }

  .table-box {
    // height: 460px;
    // min-height: 200px;
    margin-top: 2px;
    /deep/ .el-table__body-wrapper {
      min-height: 285px;
    }
  }
  .buttom {
    padding-top: 6px;
  }
  .button-box {
    position: absolute;
    bottom: 5px;
    right: 18px;
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
.condition-box {
  .condition-header {
    height: 34px;
    margin-bottom: 30px;
    .add-btn {
      margin-left: 30px;
      float: left;
    }
    .condition-tip {
      float: left;
      margin-left: 8px;
      line-height: 34px;
      height: 34px;
      padding: 0 10px;
      background: #f5f5f5;
      border-radius: 2px;
    }
  }
  .graph-box {
    margin-left: 110px;
  }
}
.tag-scroll-box {
  /deep/ .el-table {
    height: 100%;
    .el-table__body-wrapper {
      position: absolute;
      top: 34px;
      left: 0;
      right: 0;
      bottom: 0;
      overflow-y: auto;
    }
  }
}
#dir-rule-edit {
  .clearfix:before,
  .clearfix:after {
    display: table;
    content: '';
  }
  /deep/ .form-submit {
    top: 41px;
  }

  .clearfix:after {
    clear: both;
  }
  .right-content {
    float: left;
    max-width: 835px;
  }
  overflow: auto;
  box-sizing: border-box;
  padding: 0 20px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  //解决ie不兼容var的问题
  background-color: #fff;
  background-color: var(--default-bgc);
  z-index: 9;
  .header {
    box-sizing: border-box;
    height: 40px;
    line-height: 40px;
    .title {
      display: inline-block;
      font-size: 13px;
      color: rgb(190, 190, 190);
    }
    .back-btn {
      display: inline-block;
      float: right;
    }
  }
  .row {
    padding-top: 18px;
    width: 100%;
    height: 40px;
    .label {
      display: inline-block;
      text-align: right;
      width: 180px;
      padding-right: 6px;
      box-sizing: border-box;
    }
    .box {
      max-width: 740px;
      display: inline-block;
    }
  }
  .tag-row {
    height: auto;
    padding: 14px 20px 0;
    overflow: hidden;
    .requiredIcon {
      &:before {
        content: '*';
        color: #f56c6c;
        margin-right: 4px;
      }
    }
  }
  .content-box {
    padding-bottom: 20px;
    /deep/ .el-form {
      .el-form-item {
        margin-bottom: 14px;
      }
      .el-form-item__label {
        line-height: 34px;
      }
      .el-form-item__content {
        line-height: 34px;
      }
    }
  }
  .bottom {
    text-align: right;
    height: 50px;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    border-top: 1px solid #ebeef5;
    border-top: 1px solid var(--border-color-lighter);
    background-color: #fff;
  }
  .el-icon-question {
    position: relative;
    left: 5px;
    color: lightblue;
    font-size: 16px;
    cursor: pointer;
  }
}
.row-box {
  /deep/ .el-form-item {
    display: inline-block;
    .el-form-item__content {
      width: auto;
    }
  }
}
</style>
<style lang="scss">
#dir-rule-edit {
  .el-radio.is-bordered.is-checked {
    border-color: #4d91f7;
    background-color: #edf4ff;
  }
  #standard {
    .el-tag {
      background: #e4f2e5;
      color: #57a07f;
      .el-icon-close {
        color: #57a07f;
        &:hover {
          color: #e4f2e5;
          background-color: #57a07f;
        }
      }
    }
  }
  .el-form-item__content .el-button--primary.is-disabled,
  .el-button--primary.is-disabled:active,
  .el-button--primary.is-disabled:focus,
  .el-button--primary.is-disabled:hover {
    color: #fff;
    background-color: #a0cfff;
    border-color: #a0cfff;
  }
}
</style>
