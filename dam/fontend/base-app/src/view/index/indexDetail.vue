<template>
  <div class="index-detail">
    <el-dialog
      title="选择属性"
      width="600px"
      :visible.sync="showPropertyDialog"
      v-if="showPropertyDialog"
      append-to-body
    >
      <select-property></select-property>
    </el-dialog>
    <el-dialog
      title="添加维度"
      width="400px"
      :visible.sync="showChooseDims"
      :append-to-body="true"
    >
      <div class="row-inner">
        <div class="search-container">
          <el-input
            size="small"
            placeholder="输入关键字进行搜索"
            v-model="dimsKeyword"
            :clearable="true"
          ></el-input>
        </div>
      </div>
      <el-table
        class="plain-table choose-dims"
        ref="chooseDimsTable"
        show-overflow-tooltip
        :data="allDimsShow"
        :stripe="true"
        height="400"
        border
      >
        <el-table-column width="20" class-name="empty-column"></el-table-column>
        <el-table-column
          label="维度"
          prop="name"
          column-key="name"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="操作"
          ref="check"
          header-align="right"
          align="right"
          v-if="showOperation"
        >
          <template slot-scope="scope">
            <span>
              <el-button
                type="text"
                size="small"
                @click="handleAddDim(scope.row)"
              >
                添加
              </el-button>
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-collapse
      style="border-top: none; margin: -10px"
      v-model="activeCollapse"
      :accordion="false"
    >
      <el-form
        :inline-message="false"
        class="page-form index-page"
        label-position="right"
        label-width="100px"
        size="small"
        ref="form0"
        :key="formKey"
        :model="innerDetail"
      >
        <el-collapse-item name="0">
          <template slot="title">
            <div class="collapse-title">
              <h2>基本属性</h2>
            </div>
          </template>
          <el-form-item
            label="所属目录"
            prop="categoryId"
            v-if="editMode && baseCode"
          >
            <el-cascader
              size="mini"
              expand-trigger="click"
              :options="options ? options : []"
              :props="defaultProps"
              :change-on-select="true"
              v-model="innerDetail.categoryId"
            ></el-cascader>
          </el-form-item>
          <el-form-item label="指标编码" prop="codeId" v-if="!editMode">
            <el-input
              v-model="innerDetail.codeId"
              placeholder="如果为空，将自动生成"
            ></el-input>
          </el-form-item>
          <el-form-item label="中文名称" prop="cnFull" v-if="baseCode">
            <el-input
              v-model="innerDetail.cnFull"
              placeholder="请输入指标的中文名称"
            ></el-input>
          </el-form-item>
          <el-form-item label="中文名称" prop="chFull" v-else>
            <el-input
              v-model="innerDetail.chFull"
              placeholder="请输入指标的中文名称"
            ></el-input>
          </el-form-item>
          <el-form-item
            label="中文简称"
            prop="cnAbbr"
            v-if="baseCode"
            :rules="{ required: true, message: '中文简称是必填的' }"
          >
            <el-input
              v-model="innerDetail.cnAbbr"
              placeholder="请输入指标的中文简称"
            ></el-input>
          </el-form-item>
          <el-form-item
            label="中文简称"
            prop="chAbbr"
            v-else
            :rules="{ required: true, message: '中文简称是必填的' }"
          >
            <el-input
              v-model="innerDetail.chAbbr"
              placeholder="请输入指标的中文简称"
            ></el-input>
          </el-form-item>
          <el-form-item label="英文名称" prop="enFull">
            <el-input
              v-model="innerDetail.enFull"
              placeholder="请输入指标的英文名称"
            ></el-input>
          </el-form-item>
          <el-form-item
            label="英文简称"
            prop="enAbbr"
            :rules="{ required: true, message: '英文简称是必填的' }"
          >
            <el-input
              v-model="innerDetail.enAbbr"
              placeholder="请输入指标的英文简称"
            ></el-input>
          </el-form-item>
          <el-form-item label="定义">
            <el-input
              type="textarea"
              autosize
              v-model="innerDetail.description"
            ></el-input>
          </el-form-item>
          <template v-if="properties && properties['基本属性']">
            <el-form-item
              v-for="(item, index) in properties['基本属性']"
              :label="item.property.name"
              :key="index"
            >
              <el-input
                v-model="item.value"
                clearable
                v-if="!item.property.candidates"
              ></el-input>
              <el-select
                v-else
                clearable
                v-model="item.value"
                @change="refreshForm"
                filterable
              >
                <el-option
                  v-for="o in item.property.candidates"
                  :label="o"
                  :key="o"
                  :value="o"
                ></el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-collapse-item>

        <el-collapse-item name="alg" v-if="baseCode || true">
          <template slot="title">
            <div class="collapse-title">
              <h2>算法属性</h2>
            </div>
          </template>
          <el-form-item label="计算公式">
            <el-input
              v-model="innerDetail.function"
              type="textarea"
              autosize
              placeholder=""
            ></el-input>
          </el-form-item>
          <template v-if="properties && properties['算法属性']">
            <el-form-item
              v-for="(item, index) in properties['算法属性']"
              :label="item.property.name"
              :key="index"
            >
              <el-input
                v-model="describeValues[item.property.propId]"
                clearable
                type="textarea"
                autosize
                v-if="!item.property.candidates"
              ></el-input>
              <el-select
                v-else
                clearable
                v-model="item.value"
                @change="refreshForm"
                filterable
              >
                <el-option
                  v-for="o in item.property.candidates"
                  :label="o"
                  :key="o"
                  :value="o"
                ></el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-collapse-item>
        <!--<el-collapse-item name="time" v-if="!baseCode">
          <template slot="title">
            <div class="collapse-title">
              <h2>时间周期</h2>
            </div>
          </template>
          <el-form-item
            label="分组"
          >
            <el-select
              v-model="selectedTime.group"
            >
              <el-option
                v-for="t in times"
                :label="t.catalog"
                :key="t.catalogId"
                :value="t.catalogId"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="时间周期"
            v-if="selectedTime.group && times[selectedTime.group]"
          >
            <el-select
              v-model="selectedTime.time"
              value-key="dimId"
            >
              <el-option
                v-for="t in times[selectedTime.group].values"
                :label="t.value"
                :key="t.dimId"
                :value="t"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-collapse-item>-->
        <el-collapse-item name="dim" v-if="!baseCode">
          <template slot="title">
            <div class="collapse-title">
              <h2>修饰维度</h2>
            </div>
          </template>
          <el-form-item
            v-for="(d, k) in dimsDisplay"
            :key="k"
            :label="d.catalog"
          >
            <el-select
              v-model="selectedDims[k]"
              clearable
              @change="handleSelectChange"
              multiple
              filterable
            >
              <el-option
                v-for="value in d.values"
                :key="value.dimId"
                :value="value.dimId"
                :label="value.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addDims">添加维度</el-button>
            <!-- <el-dropdown @command="handleCommand">
              <el-button type="primary" :disabled="Object.keys(restDims).length===0">
                添加维度
                <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-for="(item,k) in restDims"
                  :key="k"
                  :command="k"
                >
                  {{item.catalog}}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown> -->
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item name="watch" v-if="!baseCode">
          <template slot="title">
            <div class="collapse-title">
              <h2>观测对象</h2>
            </div>
          </template>
          <el-form-item label="观测对象">
            <el-select
              v-model="selectedMonitors"
              clearable
              @change="handleSelectChange"
              multiple
              filterable
            >
              <el-option
                v-for="value in allMonitors"
                :key="value.objectId"
                :value="value.objectId"
                :label="value.monitorObject"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item name="function" v-if="!baseCode">
          <template slot="title">
            <div class="collapse-title">
              <h2>关联函数</h2>
            </div>
          </template>
          <el-form-item label="函数">
            <el-select
              multiple
              v-model="innerDetail.functions"
              filterable
              value-key="funcId"
            >
              <el-option
                v-for="f in functions"
                :value="f"
                :label="f.funcName"
                :key="f.funcId"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-collapse-item>
        <el-collapse-item name="manage" v-if="baseCode">
          <template slot="title">
            <div class="collapse-title">
              <h2>管理属性</h2>
            </div>
          </template>
          <el-form-item
            label="指标类型"
            prop="area"
            :rules="{
              required: true,
              message: '指标类型是必填的',
              trigger: 'blur',
            }"
          >
            <el-select v-model="innerDetail.area" allow-create filterable>
              <el-option value="投研类" label="投研类"></el-option>
              <el-option value="市场类" label="市场类"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="定义部门" prop="department">
            <el-input
              v-model="innerDetail.department"
              placeholder=""
            ></el-input>
          </el-form-item>
          <el-form-item label="定义参考标准">
            <el-input v-model="innerDetail.reference" placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="生效日期">
            <el-date-picker
              v-model="innerDetail.startDate"
              type="date"
              value-format="timestamp"
              placeholder="选择日期"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="失效日期">
            <el-date-picker
              v-model="innerDetail.endDate"
              type="date"
              value-format="timestamp"
              placeholder="选择日期"
            ></el-date-picker>
          </el-form-item>
          <template v-if="properties && properties['管理属性']">
            <el-form-item
              v-for="(item, index) in properties['管理属性']"
              :label="item.property.name"
              :key="index"
            >
              <el-input
                v-model="describeValues[item.property.propId]"
                clearable
                v-if="!item.property.candidates"
              ></el-input>
              <el-select
                v-else
                clearable
                v-model="item.value"
                @change="refreshForm"
                filterable
              >
                <el-option
                  v-for="o in item.property.candidates"
                  :label="o"
                  :key="o"
                  :value="o"
                ></el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-collapse-item>
        <el-collapse-item name="doc">
          <template slot="title">
            <div class="collapse-title">
              <h2>关联文档</h2>
            </div>
          </template>
          <div class="table" style="margin-right: 20px">
            <el-table class="stripe-table" :data="documents">
              <el-table-column
                prop="fileOrginalName"
                label="文件名称"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column label="文件大小">
                <template slot-scope="scope">
                  {{ Math.ceil(scope.row.fileSize / 1024) }}KB
                </template>
              </el-table-column>
              <el-table-column prop="uploader" label="上传人"></el-table-column>
              <el-table-column
                prop="uploadTimestamp"
                :formatter="$dateFormatter"
                label="上传日期"
              ></el-table-column>
              <el-table-column label="操作" :width="120">
                <template slot-scope="scope">
                  <el-button type="text" @click="downloadDoc(scope.row.fileId)">
                    下载
                  </el-button>
                  <el-button
                    type="text"
                    @click="handleDocumentRemove(scope.$index)"
                  >
                    {{ $t('common.button.delete') }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!--<el-tag-->
          <!--style="margin-right:1em;"-->
          <!--v-for="(doc,$index) in innerDetail.documents"-->
          <!--:key="doc.uuid"-->
          <!--closable-->
          <!--@close="handleDocumentRemove($index)"-->
          <!--&gt;{{doc.docName}}</el-tag>-->

          <el-form-item label-width="0">
            <el-upload
              :show-file-list="false"
              :action="$url + '/service/files/upload'"
              :on-success="handleUploadSuccess"
              :before-upload="beforeUpload"
              :on-error="handleUploadError"
              :headers="$headers"
            >
              <el-button class="el-icon-plus">添加</el-button>
            </el-upload>
          </el-form-item>
        </el-collapse-item>
      </el-form>
    </el-collapse>

    <div class="page-btn-group left-bottom">
      <el-button size="small" type="primary" @click="beforeUpdateDetail">
        保存
      </el-button>
      <el-button size="small" @click="cancel">退出编辑</el-button>
      <!--<el-button-->
      <!--size="small"-->
      <!--type="primary"-->
      <!--@click="addProperty"-->
      <!--&gt;选择属性</el-button>-->
      <!--<el-button size="small" class="white-btn">重置</el-button>-->
    </div>
  </div>
</template>

<script>
import indexDetail from './indexDetail.js'
export default indexDetail
</script>

<style lang="scss" scoped="scoped">
@import 'indexDetail';
</style>
<style lang="scss">
.index-detail {
  .over-hidden {
    overflow: hidden;
  }
}
</style>
