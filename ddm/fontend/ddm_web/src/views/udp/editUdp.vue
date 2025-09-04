<template>
  <div class="tab-page edit-udp">
    <datablau-form-submit>
      <div>
        <datablau-form
          class="page-form udp-form"
          label-position="right"
          label-width="180px"
          size="small"
          ref="form"
          :rules="rules"
          :model="udpData"
        >
          <!--ID-->
          <el-form-item
            label="ID"
            v-if="!isAdd"
          >
            <datablau-input
              v-model="udpData.udpId"
              :placeholder="$t('common.placeholder.prefix')"
              class="id-input"
              :disabled="true"
            ></datablau-input>
          </el-form-item>

          <!--对象层级-->
          <el-form-item
            :label="$v.udp.objectHierarchy"
            prop="targetTypes"
          >
            <datablau-select
                v-model="udpData.targetTypes"
                :placeholder="$t('common.placeholder.selectPrefix')"
                @change="handleTargetTypesChange"
                :disabled="!isAdd"
            >
              <el-option
                v-for="item in targetTypeArr"
                :label="item.label"
                :value="item.typeId"
                :key="item.typeId"
              ></el-option>
            </datablau-select>
          </el-form-item>

          <!--属性名称-->
          <el-form-item
            :label="$v.udp.name"
            prop="name"
          >
            <datablau-input
              v-model="udpData.name"
              :placeholder="$t('common.placeholder.prefix')"
              clearable
            ></datablau-input>
          </el-form-item>

          <!--属性分页-->
          <el-form-item
            :label="$t('assets.udp.udpTab')"
          >
            <datablau-select
              v-model="udpData.tabPage"
              placeholder="请输入或者选择"
              :filterable="true"
              :allow-create="true"
              :default-first-option="true"
              clearable
            >
              <el-option
                v-for="item in tabPageArr"
                :label="item"
                :value="item"
                :key="item"
              ></el-option>
            </datablau-select>
            <!--<el-autocomplete-->
            <!--  v-model="udpData.category"-->
            <!--  :fetch-suggestions="classSearch"-->
            <!--  :placeholder="$t('assets.udp.pleaseSelectUdpTab')"-->
            <!--  @select="classSelect"-->
            <!--  clearable-->
            <!--  style="width: 500px;"-->
            <!--&gt;-->
            <!--  <template slot-scope="{ item }">-->
            <!--    {{ item }}-->
            <!--  </template>-->
            <!--</el-autocomplete>-->
          </el-form-item>
          <!--属性分类-->
          <el-form-item
            :label="$v.udp.attributeClassIfication"
          >
            <datablau-select
              v-model="udpData.category"
              :placeholder="$t('common.placeholder.selectPrefix')"
              :filterable="true"
              :allow-create="true"
              :default-first-option="true"
              clearable
            >
              <el-option
                v-for="item in this.$globalData.udpCategoryArr"
                :label="item"
                :value="item"
                :key="item"
              ></el-option>
            </datablau-select>
            <!--<el-autocomplete-->
            <!--  v-model="udpData.category"-->
            <!--  :fetch-suggestions="classSearch"-->
            <!--  :placeholder="$v.udp.PleaseSelectAttribute"-->
            <!--  @select="classSelect"-->
            <!--  clearable-->
            <!--  style="width: 500px;"-->
            <!--&gt;-->
            <!--  <template slot-scope="{ item }">-->
            <!--    {{ item }}-->
            <!--  </template>-->
            <!--</el-autocomplete>-->
          </el-form-item>
          <!--业务条线-->
          <el-form-item
            :label="$v.udp.BelongingbusinessLine"
          >
            <datablau-select
              v-model="categoriesType"
              :placeholder="$v.udp.pleaseselectBusinessLine"
              v-if="false"
              clearable
            >
              <el-option :label="$v.udp.overall" value="all"></el-option>
              <el-option :label="$v.udp.part" value="part"></el-option>
            </datablau-select>
            <!-- <div :style="{'height': '10px'}"></div> -->
            <datablau-select
              v-model="udpData.categories"
              :placeholder="$v.udp.itisGlobal"
              :multiple="true"
              clearable
            >
              <el-option
                v-for="item in $globalData.udpCategories"
                :label="item.name"
                :value="item.id"
                :key="item.id"
              ></el-option>
            </datablau-select>
          </el-form-item>

          <!--数据类型-->
          <el-form-item
            :label="$v.udp.dataType"
            prop="valueType"
          >
            <datablau-select
              v-model="udpData.valueType"
              :placeholder="$t('common.placeholder.selectPrefix')"
              @change="dataTypeChange"
            >
              <el-option
                v-for="item in valueTypeArr"
                :label="item.label"
                :value="item.value"
                :key="item.value"
              >
              </el-option>
            </datablau-select>
          </el-form-item>

          <!--级联属性-->
          <el-form-item
            :label="$t('assets.udp.parentUdp')"
            v-if="canAddEnum"
          >
            <datablau-select
              v-model="udpData.parentUdpId"
              :placeholder="$t('common.placeholder.selectPrefix')"
              clearable
              @change="parentUdpChange"
            >
              <el-option-group
                v-for="group in parentUdpArr"
                :key="group.label"
                :label="group.label">
                <el-option
                  v-for="item in group.udps"
                  :key="item.udpId"
                  :label="item.name"
                  :value="item.udpId"
                  :disabled="item.disabled"
                >
                </el-option>
              </el-option-group>
            </datablau-select>
          </el-form-item>

          <!--枚举值-->
          <el-form-item
            :label="$t('assets.udp.enumValue')"
            prop="options"
            ref="options"
            v-if="canAddEnum"
          >
            <div class="enumValue-container">
              <!--添加 枚举值-->
              <datablau-button
                size="small"
                type="text"
                @click="addEnumValue"
                class="iconfont icon-tianjia"
              > &nbsp;添加枚举值
              </datablau-button>

              <!--枚举值列表-->
              <div
                class="enumValue-list"
                style="width: 1000px;"
                v-if="udpData.enumValues && udpData.enumValues.length>0"
              >
                <datablau-table
                  :data="enumShowValues" ref="enumTable"
                  class="el-table datablau-table"
                  :showColumnSelection="false"
                  border>
                  <el-table-column width="20px">
                    <template>
                      <i class="iconfont icon-drag dragIcon"></i>
                    </template>
                  </el-table-column>
                  <el-table-column min-width="75px" label="键" prop="i">
                    <!--<el-table-column min-width="75px" label="枚举值ID" prop="i">-->
                    <template slot-scope="scope">
                      <datablau-input
                        v-model="scope.row.i"
                        :placeholder="$t('common.placeholder.prefix')"
                        :ref="`enumKeyInput${scope.$index}`"
                        @blur="checkMultiSelecValue(scope.row.i, scope.$index, true)"
                        clearable
                        style="width: 100%;"
                      ></datablau-input>
                    </template>
                  </el-table-column>
                  <!--<el-table-column min-width="150px" label="枚举值" prop="n">-->
                  <el-table-column min-width="150px" label="值" prop="n">
                    <template slot-scope="scope">
                      <datablau-input
                        v-model="scope.row.n"
                        :placeholder="$t('common.placeholder.prefix')"
                        :ref="`enumValueInput${scope.$index}`"
                        @blur="checkMultiSelecValue(scope.row.n, scope.$index, false)"
                        clearable
                        style="width: 100%;"
                      ></datablau-input>
                    </template>
                  </el-table-column>
                  <!--上级枚举值-->
                  <!--<el-table-column min-width="150px" label="上级枚举值" prop="p">-->
                  <el-table-column min-width="75px" label="父键" prop="p">
                    <template slot-scope="scope">
                      <datablau-select
                        v-model="scope.row.p"
                        style="width: 100%"
                        :placeholder="$t('common.placeholder.selectPrefix')"
                        clearable
                        filterable
                        @change="changeParentValue(scope.row)"
                        :disabled="!udpData.parentUdpId"
                      >
                        <el-option
                          v-for="item in parentUdpValues"
                          :key="item.id"
                          :label="item.i"
                          :value="item.i">
                          <span class="item-label">父键：</span> <span class="item-value">{{ item.i }}</span>
                          <span class="item-label" style="display:inline-block;margin-left: 20px;">父值：</span> <span
                          class="item-value">{{ item.n }}</span>
                        </el-option>
                      </datablau-select>
                    </template>
                  </el-table-column>
                  <!--<el-table-column min-width="75px" label="上级枚举值ID" prop="pi">-->
                  <el-table-column min-width="150px" label="父值" prop="pi" show-overflow-tooltip>
                    <template slot-scope="scope">
                      <span>{{ scope.row.pn }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column min-width="150px" label="是否默认值" prop="d" show-overflow-tooltip>
                    <template slot-scope="scope">
                      <el-checkbox @change="dDisabledChange(scope.row)" v-model="scope.row.d" ></el-checkbox>
                    </template>
                  </el-table-column>
                  <el-table-column width="150px" label="操作" align="center">
                    <template slot-scope="scope">
                      <datablau-button
                        type="icon" class="iconfont icon-delete"
                        tooltipContent="删除"
                        @click="removeEnumValue(scope.row)"
                      ></datablau-button>
                    </template>
                  </el-table-column>
                </datablau-table>
                <div
                  class="udp-enum-pagination-container"
                  style="text-align: right;margin-top: 10px;"
                  v-if="total > 20"
                >
                  <datablau-pagination
                    class="enum-pagination"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="currentPage"
                    :page-sizes="[20, 50, 100]"
                    :page-size="pageSize"
                    :total="total"
                  ></datablau-pagination>
                </div>
              </div>
            </div>
          </el-form-item>
          <!--枚举值多选-->
          <el-form-item
            label="枚举值多选"
            v-if="canAddEnum"
          >
            <datablau-checkbox :checkboxType="'single'" v-model="udpData.multiSelect"></datablau-checkbox>
          </el-form-item>
          <!--必填-->
          <el-form-item
            label="必填"
          >
            <datablau-checkbox :checkboxType="'single'" v-model="udpData.needed"></datablau-checkbox>
          </el-form-item>

          <!--默认值-->
          <el-form-item :label="$v.udp.defaultValue" prop="defaultValue" ref="defaultValue">
            <!--<el-date-picker-->
            <!--  v-model="udpData.defaultValue"-->
            <!--  type="datetime"-->
            <!--  :placeholder="$v.udp.Selectdate"-->
            <!--  v-if="udpData.valueType === 'DATETIME'"-->
            <!--  format="yyyy-MM-dd HH:mm:ss"-->
            <!--  value-format="yyyy-MM-dd HH:mm:ss"-->
            <!--&gt;-->
            <!--</el-date-picker>-->
            <!--&gt;-->
            <div style="display: inline-block;">
              <el-date-picker
                  v-model="udpData.defaultValue"
                  type="datetime"
                  :placeholder="$t('common.placeholder.selectPrefix')"
                  v-if="udpData.valueType === 'DATETIME'"
                  clearable
                  format="yyyy-MM-dd HH:mm:ss"
                  value-format="timestamp"
              >
                <!--format="yyyy-MM-dd HH:mm:ss"-->
              </el-date-picker>
              <datablau-input
                  v-else
                  v-model="udpData.defaultValue"
                  :placeholder="$t('common.placeholder.prefix')"
                  clearable
                  :disabled="enumShowValues.length>0"
                  @blur="validateDefAndOpt"
              ></datablau-input>
            </div>
            <!-- <datablau-tips
                placement="right"
                icon="iconfont icon-tips"
                content="有枚举时填写枚举的键"
                style="display: inline-block;margin-left: 8px;"
            ></datablau-tips> -->
          </el-form-item>

          <!--备注-->
          <el-form-item
            :label="$t('assets.udp.udpDesc')"
            style="line-height: 12px;"
          >
            <datablau-input
              type="textarea"
              v-model=" udpData.description"
              :placeholder="$t('common.placeholder.prefix')"
              :autosize="{
                minRows: 3,
                maxRows: 12
              }"
              clearable
            ></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>
      <template slot="buttons">
        <datablau-button size="small" type="primary" @click="confirmPost" :disabled="btnDisable">{{ $v.udp.Yes }}
        </datablau-button>
        <datablau-button size="small" type="secondary" @click="removetab">{{ $v.udp.cancel }}</datablau-button>
      </template>
    </datablau-form-submit>

  </div>
</template>

<script>
import editUdp from './editUdp.js'

export default editUdp
</script>
<style lang='scss' scoped>
.edit-udp {
  .page-form {
    padding-top: 20px;
  }

  .page-form.udp-form {
    /deep/ .el-input {
      input.el-input__inner[disabled] {
        color: #606266;
      }

      //.el-input__suffix {
      //  display: none;
      //}
    }

  }

  .enum-pagination {
    display: inline-block;
  }

  .dragIcon {
    //margin-top: 1px;
    color: #409eff;
    cursor: pointer;
    //font-size: 22px;
    //position: relative;
    //top: 2px;
    //display: none;
    //cursor: move;
    //margin-left: -2px;
  }
}
</style>
