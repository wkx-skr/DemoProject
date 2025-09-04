<template>
  <div class="addWrap">
    <datablau-form-submit>
      <div>
        <el-form
          class="add-form"
          label-position="right"
          label-width="180px"
          :model="addForm"
          ref="addForm"
          :rules="rules"
        >
          <el-form-item
            :label="$t('meta.lineageManage.scriptManage.scriptName')"
            prop="name"
          >
            <datablau-input
              v-model="addForm.name"
              class="maxlengthInput"
              show-word-limit
              maxlength="40"
              style="width: 500px"
              :placeholder="
                $t('meta.lineageManage.scriptManage.fillScriptName')
              "
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('meta.lineageManage.scriptManage.lineageFileType')"
            prop="lineageType"
          >
            <el-select
              class="system-select"
              v-model="addForm.lineageType"
              filterable
              style="width: 500px"
            >
              <el-option
                v-for="item in lineageTypeList"
                :key="item"
                :label="item"
                :value="item"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            :label="$t('meta.lineageManage.scriptManage.scriptType')"
          >
            <datablau-radio v-model="addForm.scriptType">
              <el-radio label="JAVASCRIPT">javascript</el-radio>
              <el-radio label="REGEX">
                {{ $t('meta.lineageManage.scriptManage.regex') }}
              </el-radio>
            </datablau-radio>
          </el-form-item>
          <el-form-item>
            <div v-if="addForm.scriptType === 'JAVASCRIPT'">
              <datablau-input
                style="width: 500px"
                v-model="addForm.scriptContent"
                :autosize="{ minRows: 10, maxRows: null }"
                type="textarea"
                :clearable="true"
                :placeholder="placeholder"
              ></datablau-input>
              <datablau-button
                :disabled="!addForm.scriptContent"
                style="margin-left: 16px"
                @click="openTest"
              >
                {{ $t('common.button.test') }}
              </datablau-button>
            </div>
            <div v-else>
              <datablau-button @click="addRegex">
                {{ $t('meta.lineageManage.scriptManage.add') }}
              </datablau-button>
              <datablau-table :data="regexData" class="regxTable">
                <el-table-column
                  prop="regex"
                  :label="$t('meta.lineageManage.scriptManage.regex')"
                >
                  <template slot-scope="scope">
                    <datablau-input
                      v-model="scope.row.regex"
                      size="mini"
                      placeholder="eg. [a-z]+"
                    ></datablau-input>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="replace"
                  :label="$t('meta.lineageManage.scriptManage.replaceValue')"
                >
                  <template slot-scope="scope">
                    <datablau-input
                      v-model="scope.row.replace"
                      size="mini"
                    ></datablau-input>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('meta.lineageManage.scriptManage.operation')"
                  min-width="120"
                  header-align="center"
                  align="center"
                  fixed="right"
                >
                  <template slot-scope="scope">
                    <datablau-button
                      type="text"
                      @click.prevent.stop="openTest(scope.row)"
                      :disabled="!scope.row.regex"
                    >
                      {{ $t('common.button.test') }}
                    </datablau-button>
                    <datablau-button
                      type="text"
                      @click.prevent.stop="deleteRegexRow(scope.$index)"
                    >
                      {{ $t('common.button.delete') }}
                    </datablau-button>
                  </template>
                </el-table-column>
              </datablau-table>
            </div>
          </el-form-item>
          <el-form-item
            :label="$t('meta.lineageManage.scriptManage.description')"
          >
            <datablau-input
              style="width: 500px"
              maxlength="4000"
              v-model="addForm.description"
              :autosize="{ minRows: 3, maxRows: 6 }"
              type="textarea"
              :clearable="true"
              show-word-limit
              :placeholder="
                $t('meta.lineageManage.scriptManage.fillDescription')
              "
            ></datablau-input>
          </el-form-item>
        </el-form>
      </div>
      <template slot="buttons">
        <datablau-button @click="removeTab">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="important" @click="save">
          {{ $t('common.button.save') }}
        </datablau-button>
      </template>
    </datablau-form-submit>
    <datablau-dialog
      :visible.sync="testModal"
      width="800px"
      height="500px"
      :title="testTitle"
      @close="onCancel"
    >
      <el-form
        class="testContent"
        label-position="right"
        label-width="100px"
        :model="testForm"
      >
        <el-form-item
          :label="$t('meta.lineageManage.scriptManage.testContent')"
        >
          <datablau-input
            style="width: 100%"
            v-model="testForm.content"
            :autosize="{ minRows: 6, maxRows: null }"
            type="textarea"
            :clearable="true"
            :placeholder="$t('meta.lineageManage.scriptManage.fillTestContent')"
          ></datablau-input>
        </el-form-item>
        <el-form-item :label="$t('meta.lineageManage.scriptManage.runResult')">
          <datablau-input
            style="width: 100%"
            v-model="testForm.result"
            :autosize="{ minRows: 6, maxRows: null }"
            type="textarea"
            :clearable="true"
            :placeholder="
              $t('meta.lineageManage.scriptManage.resultPlaceholder')
            "
          ></datablau-input>
        </el-form-item>
      </el-form>
      <div class="dialog-bottom" slot="footer">
        <datablau-button
          type="primary"
          @click="runTest"
          :disabled="!testForm.content"
        >
          {{ $t('meta.lineageManage.scriptManage.running') }}
        </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>
<script>
import addScript from './addScript.js'
export default addScript
</script>
<style lang="scss" scoped="scoped">
.addWrap {
  position: absolute;
  top: 64px;
  right: 0;
  left: 0;
  bottom: 0;
  min-width: 700px;
  .search-area {
    padding-left: 20px;
    //height: 34px;
    .topBtns {
      margin-right: 20px;
    }
  }
  .el-form.add-form {
    .el-form-item {
      margin-bottom: 16px;
      .regxTable {
        width: 800px;
      }
      /deep/ .el-input .el-input__suffix {
        .el-input__suffix-inner i {
          line-height: 34px !important;
        }
      }
    }
  }
}
</style>
