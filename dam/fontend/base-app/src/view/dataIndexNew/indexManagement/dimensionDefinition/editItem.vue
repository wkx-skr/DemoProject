<template>
  <div style="padding: 0 20px" class="outAll">
    <!-- 新增层级 -->
    <datablau-dialog
      :title="hierarchyTitle"
      :visible.sync="showhierarchy"
      :close-on-click-modal="true"
      v-if="showhierarchy"
      append-to-body
      width="700px"
    >
      <div class="row-main">
        <datablau-form
          class="page-form"
          label-position="right"
          label-width="10em"
          :rules="hierarchyRules"
          ref="hierarchyForm"
          :model="hierarchyFormData"
        >
          <!-- <el-form-item label="上一层级" prop="parentOrder">
            <datablau-select v-model="hierarchyFormData.parentOrder">
              <el-option
                v-for="item in orderOption"
                :key="item.order"
                :label="item.chName"
                :value="item.order"
              ></el-option>
            </datablau-select>
          </el-form-item> -->
          <el-form-item
            :label="$t('indicator.dimension.h.alias')"
            prop="chName"
          >
            <datablau-input
              maxlength="200"
              v-model="hierarchyFormData.chName"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('indicator.dimension.h.name')"
            prop="englishName"
          >
            <datablau-input
              maxlength="200"
              v-model="hierarchyFormData.englishName"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('indicator.dimension.h.column')"
            prop="dimensionColumn"
          >
            <datablau-input
              maxlength="200"
              v-model="hierarchyFormData.dimensionColumn"
            ></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>
      <div slot="footer">
        <datablau-button @click="showhierarchy = false" type="secondary">
          {{ $t('common.button.close') }}
        </datablau-button>
        <datablau-button type="important" @click="submitHierarchy">
          {{ $t('common.button.submit') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <div class="row-header">
      <datablau-breadcrumb
        @back="back"
        :node-data="nodeData"
        separator="/"
      ></datablau-breadcrumb>
    </div>
    <datablau-form-submit
      style="position: absolute; top: 50px; left: 0; right: 0; bottom: 0"
    >
      <div style="padding: 10px 20px">
        <datablau-form
          v-if="udpLoadedReady"
          class="page-form multiple-column"
          label-position="right"
          label-width="180px"
          :rules="formRules"
          ref="form"
          :model="formData"
        >
          <div class="part-title">{{ $t('indicator.demand.basic') }}</div>
          <div>
            <el-form-item
              :label="$t('system.systemSetting.dir')"
              prop="categorys"
            >
              <datablau-cascader
                clearable
                v-model="formData.categorys"
                :options="options"
                filterable
                :props="{ checkStrictly: true }"
                @change="categoryChange"
                ref="cascader"
              ></datablau-cascader>
              <!-- <datablau-cascader
                expand-trigger="click"
                :options="options ? options : []"
                :change-on-select="true"
                :emit-path="false"
                v-model="formData.categorys"
              ></datablau-cascader> -->
            </el-form-item>
            <!-- <el-form-item label="维度编码" prop="dimensionCode">
              <datablau-input
                maxlength="200"
                v-model="formData.dimensionCode"
              ></datablau-input>
            </el-form-item> -->
            <!-- <el-form-item label="维度ID" prop="dimensionId">
              <datablau-input
                maxlength="200"
                v-model="formData.dimensionId"
              ></datablau-input>
            </el-form-item> -->
            <!-- <el-form-item :label="$t('indicator.dimension.requirement')">
              <datablau-select
                v-model="formData.requirementId"
                clearable
                filterable
              >
                <el-option
                  v-for="item in requirementOption"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                ></el-option>
              </datablau-select>
            </el-form-item> -->
            <el-form-item
              :label="$t('indicator.dimension.dimensionName')"
              prop="dimensionName"
            >
              <datablau-input
                maxlength="200"
                v-model="formData.dimensionName"
              ></datablau-input>
            </el-form-item>
            <!-- <el-form-item label="同义词" prop="synonym">
              <datablau-input v-model="formData.synonym"></datablau-input>
            </el-form-item> -->
            <el-form-item
              :label="$t('indicator.dimension.name')"
              prop="englishName"
            >
              <datablau-input
                maxlength="200"
                v-model="formData.englishName"
              ></datablau-input>
            </el-form-item>
            <el-form-item
              :label="$t('indicator.dimension.dataRange')"
              prop="dateRange"
            >
              <!-- <datablau-date-picker
                v-if="showServiceLife"
                :dateTime="formData.serviceLife"
                v-model="formData.serviceLife"
              ></datablau-date-picker> -->
              <datablau-date-range
                ref="dataRange"
                v-model="formData.dateRange"
                @changeDateTime="changeEventStartTime"
              ></datablau-date-range>
              <!-- <el-date-picker
                v-model="dateRange"
                type="daterange"
                format="yyyy 年 MM 月 dd 日"
                value-format="timestamp"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              ></el-date-picker> -->
            </el-form-item>
            <el-form-item
              :label="$t('meta.DS.tableDetail.knowledgeGraph.edges.techLeader')"
              prop="technicalLeader"
            >
              <datablau-input
                v-model="formData.technicalLeader"
                readonly
              ></datablau-input>
              <datablau-button type="text" @click="setOwner('technicalLeader')">
                {{ $t('meta.DS.tableDetail.security.set') }}
              </datablau-button>
            </el-form-item>
            <el-form-item
              :label="$t('meta.DS.tableDetail.knowledgeGraph.edges.busiLeader')"
              prop="businessLeader"
            >
              <datablau-input
                v-model="formData.businessLeader"
                readonly
              ></datablau-input>
              <datablau-button type="text" @click="setOwner('businessLeader')">
                {{ $t('meta.DS.tableDetail.security.set') }}
              </datablau-button>
            </el-form-item>
            <el-form-item
              :label="$t('indicator.demand.taskProps.managementLeader')"
              prop="managementLeader"
            >
              <datablau-input
                v-model="formData.managementLeader"
                readonly
              ></datablau-input>
              <datablau-button
                type="text"
                @click="setOwner('managementLeader')"
              >
                {{ $t('meta.DS.tableDetail.security.set') }}
              </datablau-button>
            </el-form-item>
            <el-form-item
              :label="$t('indicator.dimension.state')"
              prop="stauts"
            >
              <datablau-select v-model="formData.stauts">
                <el-option
                  v-for="item in stautsOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <!-- <el-form-item label="标准引用" prop="standardReference">
              <datablau-input
                v-model="formData.standardReference"
              ></datablau-input>
            </el-form-item> -->
            <el-form-item
              :label="$t('meta.lineageManage.desc')"
              prop="description"
            >
              <datablau-input
                v-model="formData.description"
                type="textarea"
                :rows="4"
              ></datablau-input>
              <!-- <mavon-editor
                style="height: 300px; min-width: 600px;"
                :toolbars="toolbars"
                v-model="formData.definition"
              /> -->
            </el-form-item>
            <el-form-item
              :label="udp.name"
              v-for="(udp, index) in udps"
              :key="index"
            >
              <datablau-input
                type="textarea"
                :autosize="{ minRows: 2 }"
                v-model="formData.dimensionUdpValue[udp.id]"
                placeholder="请输入该属性"
              ></datablau-input>
            </el-form-item>
            <br />
            <el-form-item
              :label="$t('indicator.dimension.hierarchy')"
              prop="hierarchy"
              class="auto hierarchy"
              style="display: inline-block"
            >
              <div style="width: 100px; height: 10px"></div>
            </el-form-item>
            <div style="float: right">
              <!-- <datablau-button
                style="float: right; margin-right: 10px"
                @click=""
              >
                维度映射
              </datablau-button> -->
              <datablau-button
                style="float: right; margin-right: 10px"
                @click="addHierarchy"
              >
                {{ $t('indicator.dimension.h.new') }}
              </datablau-button>
            </div>
            <div class="table-area" style="height: 300px; margin-top: -26px">
              <datablau-table height="100%" :data="formData.hierarchy">
                <el-table-column
                  min-width="60"
                  :label="$t('indicator.dimension.h.order')"
                  prop="order"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ scope.row.order }}
                  </template>
                </el-table-column>
                <el-table-column
                  min-width="120"
                  :label="$t('indicator.dimension.h.alias')"
                  prop="chName"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ scope.row.chName }}
                  </template>
                </el-table-column>
                <el-table-column
                  min-width="120"
                  :label="$t('indicator.dimension.h.name')"
                  prop="englishName"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ scope.row.englishName }}
                  </template>
                </el-table-column>
                <el-table-column
                  min-width="140"
                  :label="$t('indicator.dimension.h.column')"
                  prop="dimensionColumn"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ scope.row.dimensionColumn }}
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('domain.common.operation')"
                  min-width="120"
                  align="center"
                >
                  <template slot-scope="scope">
                    <datablau-button type="text" @click="hierarchyEdit(scope)">
                      <span>{{ $t('common.button.edit') }}</span>
                    </datablau-button>
                    <datablau-button
                      type="text"
                      @click="hierarchyDelete(scope)"
                    >
                      <span>{{ $t('common.button.delete') }}</span>
                    </datablau-button>
                  </template>
                </el-table-column>
              </datablau-table>
            </div>
          </div>
        </datablau-form>
      </div>
      <!-- <div style="height: 200px"></div> -->
      <div slot="buttons" class="page-btn-group left-bottom" style="margin: 0">
        <datablau-button type="important" @click="onSubmit">
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button type="secondary" @click="back">
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </div>
    </datablau-form-submit>
  </div>
</template>
<script>
import editItem from './editItem'
export default editItem
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.row-header {
  padding: 10px 0 8px;
  border-bottom: 1px solid $border-color;
}
.part-title {
  border-left: 4px solid $primary-color;
  margin-bottom: 12px;
  margin-top: 10px;
  padding-left: 6px;
  color: $text-default;
  font-size: 14px;
}
.el-dialog .el-form-item {
  margin-bottom: 20px;
}
// .newDialog {
//   .el-select-dropdown{
//     width: 300px;
//   }
// }
</style>
<style lang="scss">
.multiple-column {
  .el-form-item {
    min-width: 532px;
    font-size: 12px;
    &:nth-of-type(odd) {
      margin-right: 100px;
      /*outline: 1px solid indianred;*/
    }
    margin-right: 100px;
  }
  .el-form-item__error {
    padding-top: 0;
  }
  .auto {
    .el-form-item__label {
      width: auto !important;
    }
  }
}
.outAll .el-form-item {
  margin-bottom: 20px;
}
.el-select-dropdown {
  min-width: 300px !important;
  .el-select-dropdown__item {
    max-width: 300px;
  }
}
.hierarchy .el-form-item__error {
  top: 14px;
  left: -76px;
}
</style>
