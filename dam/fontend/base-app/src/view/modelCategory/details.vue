<template>
  <div>
    <datablau-form-submit>
      <el-form
        class="page-form"
        label-position="right"
        :label-width="$i18n.local === 'zh' ? '120px' : '140px'"
        size="small"
        :model="category"
        ref="form"
        :rules="rules"
        :disabled="!writable"
      >
        <el-form-item
          :label="$t('meta.modelCategory.categoryName')"
          prop="categoryName"
        >
          <datablau-input
            :placeholder="
              $t('meta.modelCategory.inputPlacePrev').format(
                $t('meta.modelCategory.categoryName')
              )
            "
            v-model="category.categoryName"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="$t('meta.modelCategory.categoryAbbreviation')"
          prop="categoryAbbreviation"
        >
          <datablau-input
            :placeholder="
              $t('meta.modelCategory.inputPlacePrev').format(
                $t('meta.modelCategory.categoryAbbreviation')
              )
            "
            v-model="category.categoryAbbreviation"
          ></datablau-input>
        </el-form-item>
        <el-form-item :label="$t('meta.modelCategory.desc')">
          <datablau-input
            type="textarea"
            v-model="category.description"
            :placeholder="
              $t('meta.modelCategory.inputPlacePrev').format(
                $t('meta.modelCategory.desc')
              )
            "
          ></datablau-input>
        </el-form-item>
        <el-form-item :label="$t('meta.modelCategory.zone')">
          <el-autocomplete
            v-model="category.zone"
            :placeholder="
              $t('meta.modelCategory.inputPlacePrev').format(
                $t('meta.modelCategory.zone')
              )
            "
            clearable
            ref="cautocomplete"
            @clear="clearAutocomplete"
            :fetch-suggestions="
              (queryString, cb) => {
                cb($getSuggettionInputValue(queryString, cb, zoneArr, 'name'))
              }
            "
          ></el-autocomplete>
        </el-form-item>
        <el-form-item
          :label="$t('meta.modelCategory.itDepartment')"
          prop="itDepartment"
        >
          <el-input v-model="owers" @focus="addBm" readonly></el-input>
        </el-form-item>
        <el-form-item
          :label="$t('meta.modelCategory.businessDepartment')"
          prop="businessDepartment"
        >
          <el-input v-model="ower" @focus="addBms" readonly></el-input>
        </el-form-item>
        <el-form-item :label="$t('meta.modelCategory.importance')">
          <el-select
            v-model="category.importance"
            :placeholder="
              $t('meta.modelCategory.inputPlacePrev').format(
                $t('meta.modelCategory.importance')
              )
            "
            clearable
            :popper-append-to-body="false"
          >
            <el-option
              :label="$t('meta.modelCategory.high')"
              :value="$t('meta.modelCategory.high')"
            ></el-option>
            <el-option
              :label="$t('meta.modelCategory.medium')"
              :value="$t('meta.modelCategory.medium')"
            ></el-option>
            <el-option
              :label="$t('meta.modelCategory.low')"
              :value="$t('meta.modelCategory.low')"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('meta.modelCategory.owner')" prop="owner">
          <!-- <el-input
          v-model="category.owner"
          :placeholder="$version.modelCategory.inputPlacePrev.format($version.modelCategory.owner)"
          clearable
          ></el-input> -->
          <el-input @focus="addUsers" v-model="oversd" readonly></el-input>
        </el-form-item>
        <el-form-item :label="$t('meta.modelCategory.deployment')">
          <datablau-input
            :placeholder="
              $t('meta.modelCategory.inputPlacePrev').format(
                $t('meta.modelCategory.deployment')
              )
            "
            v-model="category.deployment"
          ></datablau-input>
        </el-form-item>
        <!--      <el-form-item-->
        <!--        :label="$version.modelCategory.systemStatus"-->
        <!--        prop="status"-->
        <!--      >-->
        <!--        <el-select v-model="category.status" placeholder="请选择" @change="()=>{$refs.form.validateField('status')}">-->
        <!--          <el-option-->
        <!--            v-for="item in systemStatusOptions"-->
        <!--            :key="item.value"-->
        <!--            :label="item.label"-->
        <!--            :value="item.value">-->
        <!--          </el-option>-->
        <!--        </el-select>-->
        <!--      </el-form-item>-->
        <el-form-item
          :label="$t('meta.modelCategory.Jira')"
          v-if="$customerId === 'CMBC'"
          prop="jiraProject"
        >
          <!--        <el-input-->
          <!--          v-model="category.jiraProject"-->
          <!--          placeholder="请输入Jira模块"-->
          <!--          clearable-->
          <!--        ></el-input>-->
          <el-select
            v-model="category.jiraProject"
            clearable
            :placeholder="$t('meta.modelCategory.fillJira')"
            filterable
          >
            <el-option
              v-for="item in jiraArr"
              :value="item.key"
              :label="`${item.name} (${item.key})`"
              :key="item.key"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-for="u in udps" :key="u.id" :label="u.name">
          <el-input
            v-if="u.type === 'STRING' || u.type === 'NUM_RANGE'"
            v-model="u.value"
          ></el-input>
          <el-input
            v-else-if="u.type === 'NUM'"
            v-model="u.value"
            oninput="value=value.replace(/[^\d]/g, '')"
          ></el-input>
          <el-switch
            v-else-if="u.type === 'BOOL'"
            v-model="u.value"
            :active-value="true"
            :inactive-value="false"
          ></el-switch>
          <el-select
            v-else-if="u.type === 'ENUM'"
            v-model="u.value"
            filterable
            clearable
            :popper-append-to-body="false"
          >
            <el-option
              v-for="o in u.typeData ? u.typeData.split(';') : []"
              :key="o"
              :label="o"
              :value="o"
            ></el-option>
          </el-select>
        </el-form-item>
        <!--        <datablau-table
          v-if="data && bindedModels"
          :data="bindedModels"
          :show-column-selection="false"
          class="plain-table"
          :stripe="true"
          :max-height="300"
          style="width: 720px"
          border
        >
          <el-table-column :label="$t('meta.modelCategory.modelName')">
            <template slot-scope="scope">
              {{ scope.row.definition }}
              <el-tooltip
                :content="$t('meta.DS.treeSubOperation.mainDataSource')"
                placement="right"
                v-show="scope.row.primaryModel"
              >
                <i class="el-icon-circle-check"></i>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="type"
            :label="$t('meta.modelCategory.modelType')"
          ></el-table-column>
          &lt;!&ndash;<el-table-column>
          <template slot-scope="scope">
            &lt;!&ndash;<el-button @click="unbind(scope.row.modelId)" type="text">解绑</el-button>&ndash;&gt;
          </template>
        </el-table-column>&ndash;&gt;
        </datablau-table>-->
      </el-form>
      <div slot="buttons" class="page-btn-group left-bottom" style="margin: 0">
        <datablau-button type="secondary" @click="removeTab" v-if="writable">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="secondary" @click="removeTab" v-else>
          {{ $t('common.button.close') }}
        </datablau-button>
        <datablau-button
          v-if="writable"
          type="important"
          @click="onSubmit"
          :disabled="submitDisabled"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-form-submit>
  </div>
</template>

<script>
import details from './details.js'
export default details
</script>

<style lang="scss" scoped>
/deep/ .el-form-item {
  margin-bottom: 14px;
  .el-form-item__label {
    word-break: break-word;
  }
}
.el-form.page-form {
  padding: 10px 20px;
  /deep/ .el-input {
    width: 500px !important;
  }
  ::v-deep textarea {
    width: 500px !important;
  }
}
.user-list {
  .head-box {
    border-top: 1px solid #eee;
    padding: 15px 20px 5px;
    h3 {
      display: inline-block;
      font-size: 16px;
    }
    .edit-users {
      float: right;
    }
  }
}
/deep/ .el-input__inner {
  &:hover {
    border-color: #409eff;
  }
}
/deep/ .el-textarea__inner {
  &:hover {
    border-color: #409eff;
  }
}
.page-btn-group {
  text-align: left;
}
</style>
<style lang="scss">
.el-autocomplete-suggestion li {
  font-size: 12px;
}
</style>
