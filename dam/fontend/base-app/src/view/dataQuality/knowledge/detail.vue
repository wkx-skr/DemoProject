<template>
  <div class="knowledge-detail-content">
    <datablau-dialog
      :title="$t('quality.page.knowledgebase.selectRules')"
      :visible.sync="chooseRulesDialogVisible"
      width="1050px"
      append-to-body
    >
      <choose-quality-rules
        v-if="chooseRulesDialogVisible"
        :selectedRules="content.techRules"
        @closeDialog="chooseRulesDialogVisible = false"
        @qualityRulesSelected="qualityRulesSelected"
      ></choose-quality-rules>
    </datablau-dialog>
    <el-dialog
      :title="$t('quality.page.knowledgebase.selectKnowledge')"
      :visible.sync="chooseKnowledgeDialogVisible"
      width="900px"
      append-to-body
    >
      <knowledge-selecter
        v-if="chooseKnowledgeDialogVisible"
        width="1000px"
        :selected="content.techRules"
      ></knowledge-selecter>
    </el-dialog>

    <datablau-form-submit>
      <div style="margin-top: 64px">
        <el-form
          label-position="right"
          label-width="180px"
          :model="content"
          ref="form"
          :rules="validateRules"
          style="margin-left: 20px; margin-right: 20px"
          v-if="hasAccess"
        >
          <div class="db-fieldMessage-title" style="margin-bottom: 20px">
            <p class="message-title">
              {{ $t('quality.page.knowledgebase.basicProperties') }}
            </p>
          </div>
          <el-form-item
            :label="$t('quality.page.knowledgebase.form.title')"
            prop="title"
          >
            <datablau-input
              clearable
              maxlength="100"
              v-model="content.title"
              style="width: 500px"
              :placeholder="
                $t('common.placeholder.prefix') +
                $t('quality.page.knowledgebase.form.title')
              "
              :disabled="!hasAccess"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.knowledgebase.form.submitter')"
            v-if="false"
          >
            <datablau-input
              style="width: 750px"
              clearable
              maxlength="100"
              readonly
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.knowledgebase.form.submissionTime')"
            v-if="false"
          >
            <datablau-input
              style="width: 750px"
              clearable
              maxlength="100"
              readonly
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.knowledgebase.form.description')"
          >
            <datablau-input
              clearable
              maxlength="500"
              show-word-limit
              type="textarea"
              style="width: 750px"
              v-model="content.description"
              :placeholder="
                $t('common.placeholder.prefix') +
                $t('quality.page.knowledgebase.form.desPlaceholder')
              "
              :disabled="!hasAccess"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.knowledgebase.form.cause')"
            prop="cause"
          >
            <datablau-input
              clearable
              maxlength="500"
              show-word-limit
              type="textarea"
              style="width: 750px"
              v-model="content.cause"
              :placeholder="
                $t('common.placeholder.prefix') +
                $t('quality.page.knowledgebase.form.cause')
              "
              :disabled="!hasAccess"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.knowledgebase.form.solution')"
            prop="solution"
          >
            <datablau-input
              clearable
              maxlength="500"
              show-word-limit
              type="textarea"
              style="width: 750px"
              v-model="content.solution"
              :placeholder="
                $t('common.placeholder.prefix') +
                $t('quality.page.knowledgebase.form.solution')
              "
              :disabled="!hasAccess"
            ></datablau-input>
          </el-form-item>
        </el-form>
        <el-form
          label-position="right"
          label-width="180px"
          :model="content"
          ref="form"
          :rules="validateRules"
          style="margin-left: 20px; margin-right: 20px"
          v-else
          class="seeDetail"
        >
          <div class="db-fieldMessage-title" style="margin-bottom: 20px">
            <p class="message-title">
              {{ $t('quality.page.knowledgebase.basicProperties') }}
            </p>
          </div>
          <el-form-item
            :label="$t('quality.page.knowledgebase.form.title')"
            prop="title"
          >
            <p>{{ content.title }}</p>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.knowledgebase.form.description')"
          >
            <p style="width: 750px">{{ content.description }}</p>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.knowledgebase.form.cause')"
            prop="cause"
          >
            <p style="width: 750px">{{ content.cause }}</p>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.knowledgebase.form.solution')"
            prop="solution"
          >
            <p style="width: 750px">{{ content.solution }}</p>
          </el-form-item>
        </el-form>
        <div class="list-area">
          <!-- <el-menu
        :default-active="activeIndex"
        class="default-menu"
        mode="horizontal"
        @select="handleActiveIndexChange"
      >
        <el-menu-item index="rule">相关技术规则</el-menu-item>
        <el-menu-item index="document">相关文档</el-menu-item>
        <el-menu-item index="history" v-if="content.kdId">
          更改历史
        </el-menu-item>
      </el-menu> -->
          <datablau-tabs
            v-model="activeIndex"
            @tab-click="handleActiveIndexChange"
            class="detailTab"
          >
            <el-tab-pane
              :label="$t('quality.page.knowledgebase.technicalRules')"
              name="rule"
            >
              <datablau-table
                :data="content.techRules"
                v-show="activeIndex === 'rule'"
                :max-height="400"
                :data-selectable="option.selectable"
                :auto-hide-selection="option.autoHideSelectable"
                :show-column-selection="option.showColumnSelection"
                :column-selection="option.columnSelection"
                :border="option.columnResizable"
              >
                <!-- <el-table-column width="20"></el-table-column> -->
                <el-table-column
                  prop="name"
                  :label="$t('quality.page.knowledgebase.rulesTable.ruleName')"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    <datablau-button
                      type="text"
                      @click="jumpTotechRuleName(scope.row)"
                    >
                      {{ scope.row.name }}
                    </datablau-button>
                  </template>
                </el-table-column>
                <!--        <el-table-column-->
                <!--          min-width="100"-->
                <!--          show-overflow-tooltip-->
                <!--          prop="catalog"-->
                <!--          label="目录">-->
                <!--        </el-table-column>-->
                <el-table-column
                  :label="
                    $t('quality.page.knowledgebase.rulesTable.modelCategoryId')
                  "
                  prop="modelCategoryId"
                  show-overflow-tooltip
                  min-width="140"
                  :formatter="$mappingCategory"
                ></el-table-column>
                <el-table-column
                  :label="$t('quality.page.knowledgebase.rulesTable.tableName')"
                  prop="tableName"
                ></el-table-column>
                <el-table-column
                  :label="
                    $t('quality.page.knowledgebase.rulesTable.columnName')
                  "
                  prop="columnName"
                ></el-table-column>
                <el-table-column
                  :label="
                    $t('quality.page.knowledgebase.rulesTable.maxErrorRow')
                  "
                  prop="maxErrorRow"
                ></el-table-column>
                <el-table-column
                  :label="$t('quality.page.knowledgebase.rulesTable.type')"
                  :width="$i18n.locale === 'zh' ? '' : 150"
                  prop="type"
                >
                  <template slot-scope="scope">
                    {{ typeArr[scope.row.type] }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="bigClassSelectOption"
                  :label="$t('quality.page.knowledgebase.rulesTable.ruleType')"
                >
                  <template slot-scope="scope">
                    <span>
                      {{
                        scope.row.bigClassSelectOption
                          | bigClassFilter(bigClassList)
                      }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('quality.page.knowledgebase.rulesTable.operation')"
                  fixed="right"
                  width="80"
                  align="center"
                  v-if="hasAccess"
                >
                  <template slot-scope="scope">
                    <datablau-button
                      type="text"
                      @click="deleteRule(scope.$index)"
                    >
                      {{ $t('common.button.delete') }}
                    </datablau-button>
                  </template>
                </el-table-column>
              </datablau-table>
              <datablau-button
                type="text"
                v-if="hasAccess && activeIndex === 'rule'"
                style="float: right; margin-right: 2em"
                class="el-icon-plus"
                @click="chooseRulesDialogVisible = true"
              >
                {{ $t('quality.page.knowledgebase.selectAdd') }}
              </datablau-button>
            </el-tab-pane>
            <el-tab-pane
              :label="$t('quality.page.knowledgebase.document')"
              name="document"
            >
              <datablau-table
                v-if="activeIndex === 'document'"
                :data="documents"
                :data-selectable="documentOption.selectable"
                :auto-hide-selection="documentOption.autoHideSelectable"
                :show-column-selection="documentOption.showColumnSelection"
                :column-selection="documentOption.columnSelection"
                :border="documentOption.columnResizable"
              >
                <!-- <el-table-column width="20"></el-table-column> -->
                <el-table-column
                  prop="fileName"
                  :label="
                    $t(
                      'quality.page.knowledgebase.documentTable.fileOrginalName'
                    )
                  "
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  :label="
                    $t('quality.page.knowledgebase.documentTable.fileSize')
                  "
                >
                  <template slot-scope="scope">
                    {{ Math.ceil(scope.row.fileSize / 1024) }}KB
                  </template>
                </el-table-column>
                <el-table-column
                  prop="uploader"
                  :label="
                    $t('quality.page.knowledgebase.documentTable.uploader')
                  "
                >
                  <template slot-scope="scope">
                    <span>{{ scope.row.uploader }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="createTime"
                  :formatter="$dateFormatter"
                  :label="
                    $t(
                      'quality.page.knowledgebase.documentTable.uploadTimestamp'
                    )
                  "
                ></el-table-column>
                <el-table-column
                  :label="
                    $t('quality.page.knowledgebase.documentTable.operation')
                  "
                  align="center"
                  :width="$i18n.locale === 'zh' ? 120 : 180"
                >
                  <template slot-scope="scope">
                    <datablau-button
                      type="text"
                      @click="downloadDoc(scope.row.fileId)"
                    >
                      {{
                        $t('quality.page.knowledgebase.documentTable.download')
                      }}
                    </datablau-button>
                    <datablau-button
                      type="text"
                      v-if="hasAccess"
                      @click="handleDocumentRemove(scope.row.fileId)"
                    >
                      {{ $t('common.button.delete') }}
                    </datablau-button>
                  </template>
                </el-table-column>
              </datablau-table>
              <el-upload
                v-if="hasAccess && activeIndex === 'document'"
                :show-file-list="false"
                style="float: right; margin-right: 2em"
                :action="$url + '/files/upload'"
                :on-success="handleUploadSuccess"
                :before-upload="beforeUpload"
                :on-error="handleUploadError"
                :headers="$headers"
              >
                <datablau-button type="text" class="iconfont icon-upload">
                  {{ $t('quality.page.knowledgebase.fileUpload') }}
                </datablau-button>
              </el-upload>
            </el-tab-pane>
            <el-tab-pane
              :label="$t('quality.page.knowledgebase.history')"
              name="history"
              v-if="content.kdId"
            >
              <knowledge-history
                :kdId="content.kdId"
                v-if="activeIndex === 'history'"
              ></knowledge-history>
            </el-tab-pane>
          </datablau-tabs>

          <el-table
            v-if="activeIndex === 'knowledge'"
            class="plain-table"
            :data="content.refKnowledgeDocs"
          >
            <el-table-column width="20"></el-table-column>
            <el-table-column
              prop="title"
              :label="$t('quality.page.knowledgebase.table.title')"
            ></el-table-column>
            <el-table-column
              prop="techRules"
              :formatter="ruleFormatter"
              :label="$t('quality.page.knowledgebase.table.techRules')"
            ></el-table-column>
            <el-table-column
              prop="lastModifyTime"
              :label="$t('quality.page.knowledgebase.table.lastModifyTime')"
              :formatter="$timeFormatter"
              width="190"
            ></el-table-column>
            <el-table-column
              prop="lastModifier"
              :label="$t('quality.page.knowledgebase.table.lastModifier')"
            >
              <template slot-scope="scope">
                <span>{{ nameMapping[scope.row.lastModifier] }}</span>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('quality.page.knowledgebase.table.operation')"
              header-align="right"
              align="right"
              width="120"
              fixed="right"
            >
              <template slot-scope="scope">
                <el-button
                  size="small"
                  type="text"
                  @click="handleEdit(scope.$index)"
                  disabled
                >
                  {{ $t('common.button.scan') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button
            size="small"
            type="text"
            v-if="hasAccess && activeIndex === 'knowledge'"
            style="float: right; margin-right: 2em"
            class="el-icon-plus"
            @click="chooseKnowledgeDialogVisible = true"
          >
            {{ $t('quality.page.knowledgebase.selectAdd') }}
          </el-button>
        </div>
      </div>
      <div class="footer-button" slot="buttons">
        <div class="button-box">
          <datablau-button type="important" @click="confirm" v-if="hasAccess">
            {{ $t('common.button.ok') }}
          </datablau-button>
          <datablau-button type="secondary" @click="remove" v-if="hasAccess">
            {{ $t('common.button.cancel') }}
          </datablau-button>
          <datablau-button type="secondary" @click="remove" v-else>
            {{ $t('common.button.close') }}
          </datablau-button>
        </div>
      </div>
    </datablau-form-submit>
  </div>
</template>

<script>
import detail from './detail.js'
export default detail
</script>
<style lang="scss">
.knowledge-detail-content {
  .seeDetail {
    .el-form-item {
      margin-bottom: 0;
    }
  }
  .el-form-item {
    margin-bottom: 16px;
  }
}
</style>
<style lang="scss" scoped="scoped">
.list-area {
  min-height: 100px;
  //border-top:1px solid #E6E7EC;
  margin-top: 20px;
  margin-left: 20px;
  margin-right: 20px;
  .detailTab {
    /deep/ .el-tabs__content {
      overflow: hidden;
    }
  }
}
.width {
  width: 400px;
}

// tab 标签
.el-menu--horizontal .el-menu-item:not(.is-disabled):focus,
.el-menu--horizontal .el-menu-item:not(.is-disabled):hover {
  color: var(--about-dialog-color);
}
.el-menu--horizontal > .el-menu-item:not(.is-disabled):focus,
.el-menu--horizontal > .el-menu-item:not(.is-disabled):hover {
  background-color: var(--heading-ddc-bgc);
}
.el-menu {
  background-color: var(--heading-ddc-bgc);
}
</style>
