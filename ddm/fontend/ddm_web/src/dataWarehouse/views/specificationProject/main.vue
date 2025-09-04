<template>
    <div class="specificationProject">
        <div class="tool">
            <datablau-button style="float:right" class="iconfont icon-tianjia" type="important"   @click="openCreateProject" > 新建</datablau-button>
        </div>
        <datablau-form-submit style="margin-top: 60px">
            <datablau-table
            :data="projectList"
            height="100%"
            row-key="id"
            data-selectable
            @selection-change="handleSelectionChange"
            >
            <el-table-column
                label="项目类型"
                show-overflow-tooltip
                prop="typeName">
            </el-table-column>
            <el-table-column
                label="描述"
                show-overflow-tooltip
                prop="description">
            </el-table-column>
            <el-table-column
                label="模型策略"
                show-overflow-tooltip
                width="180"
                prop="defaultId">
                <template slot-scope="scope">
                    <datablau-select
                            v-model="scope.row.defaultId"
                            style="width: 150px"
                            @change="changeValue(scope.row)"
                        >
                            <el-option
                            v-for="item in defaultOptions"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                            ></el-option>
                        </datablau-select>
                </template>
            </el-table-column>
            <el-table-column
                label="程序策略"
                width="180"
                show-overflow-tooltip
                prop="policyId">
                <template slot-scope="scope">
                    <datablau-select
                        v-model="scope.row.policyId"
                        style="width: 150px"
                        @change="changeValue(scope.row)"
                    >
                        <el-option
                        v-for="item in policyOptions"
                        :key="item.id"
                        :label="item.policyName"
                        :value="item.id"
                        ></el-option>
                    </datablau-select>
                </template>
            </el-table-column>
            <el-table-column
                label="状态"
                show-overflow-tooltip
                prop="status">
                <template slot-scope="scope">
                    <datablau-switch
                    style="padding-bottom: 3px;"
                        v-model="scope.row.status"
                        @change="changeValue(scope.row)"
                        active-text="开启"
                        inactive-text="关闭"
                        :active-value="1"
                        :inactive-value="0"
                        type="innerText"
                        ></datablau-switch>
                </template>
            </el-table-column>
            <el-table-column
                label="操作"
                width="120px" >
                <template slot-scope="scope">
                    <datablau-tooltip
                        effect="dark"
                        content="编辑"
                        placement="bottom"
                        >
                        <datablau-button type="icon" @click.stop="darkClick(scope.row)" class="iconfont icon-bianji"></datablau-button>
                    </datablau-tooltip>
                    <datablau-tooltip
                        effect="dark"
                        content="查看"
                        placement="bottom"
                        >
                        <datablau-button type="icon" @click.stop="darkClick(scope.row,'scan')" class="iconfont icon-see"></datablau-button>
                    </datablau-tooltip>

                </template>
            </el-table-column>
            </datablau-table>
            <template slot="buttons">
                <div class="row-page-info">
                    <span v-if="selectedOut.length" class="check-info"></span>
                    <span v-if="selectedOut.length" class="footer-row-info">
                        {{
                        $t('common.deleteMessage', {
                            selection: selectedOut.length,
                        })
                        }}
                    </span>
                    <datablau-button
                    size="small"
                    type="danger"
                    class="el-icon-delete"
                    v-show="selectedOut.length"
                    @click="handleDelete"
                    :disable="!selectedOut.length"
                    >
                    删除
                    </datablau-button>
                </div>
                <datablau-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="page.current"
                    :page-sizes="[10, 20, 50, 100]"
                    :page-size="page.size"
                    :total="page.count"
                    :layout="'total, sizes, prev, pager, next, jumper'"
                ></datablau-pagination>
            </template>
        </datablau-form-submit>
        <datablau-dialog
            :visible.sync="dialogVisible"
            :title="formData.id ? '编辑' : '新建'"
            width="450px"
            :before-close="handleClose"
            append-to-body
            size="l"
        >
            <div class="content">
                <datablau-form
                    size="small"
                    label-width='90px'
                    :model="formData"
                    :rules="rules"
                    :disabled='disabledForm'
                    ref="form"
                >
                    <el-form-item
                    label="项目类型"
                    prop="typeName"
                    >
                    <datablau-input
                        v-model="formData.typeName"
                        show-word-limit
                        class="input-detail"
                    ></datablau-input>
                    </el-form-item>
                    <el-form-item
                    label="类型描述"
                    prop="description"
                    >
                    <datablau-input
                        type="textarea"
                        v-model="formData.description"
                        class="input-detail"
                        style="width: 500px;"
                        maxlength="200"
                        show-word-limit
                    ></datablau-input>
                    </el-form-item>
                    <el-form-item
                    label="模型策略"
                    prop="defaultId">
                        <datablau-select
                            v-model="formData.defaultId"
                            clearable
                            filterable
                            style="width: 300px"
                        >
                            <el-option
                            v-for="item in defaultOptions"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                            ></el-option>
                        </datablau-select>
                    </el-form-item>
                    <el-form-item
                    label="程序策略"
                    prop="policyId">
                    <datablau-select
                        v-model="formData.policyId"
                        clearable
                        filterable
                        style="width: 300px"
                    >
                        <el-option
                        v-for="item in policyOptions"
                        :key="item.id"
                        :label="item.policyName"
                        :value="item.id"
                        ></el-option>
                    </datablau-select>
                    </el-form-item>
                    <el-form-item
                    label="是否开启"
                    prop="status"
                    >
                    <datablau-switch
                        v-model="formData.status"
                        active-text="开启"
                        inactive-text="关闭"
                        :active-value="1"
                        :inactive-value="0"
                        type="innerText"
                        ></datablau-switch>
                    </el-form-item>
                </datablau-form>
            </div>
            <span slot="footer">
            <datablau-button @click="handleClose">取 消</datablau-button>
            <datablau-button type="primary" @click="addProject">
                确 定
            </datablau-button>
            </span>
        </datablau-dialog>
    </div>
</template>
<script>
import main from './main'
export default main
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';

.row-page-info {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 30px;
    height: 50px;
    padding-left: 26px;
    margin-right: -20px;
    margin-left: -30px;
    overflow-x: visible;
    overflow-y: hidden;
    line-height: 50px;
    border-top: 1px solid var(--border-color-lighter);
    box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
    .check-info {
      display: inline-block;
      width: 14px;
      height: 14px;
      vertical-align: middle;
      background: $primary-color;
    }
    .footer-row-info {
      margin-right: 10px;
      &::before {
        margin-right: 5px;
        margin-left: -13px;
        font-family: 'element-icons';
        font-size: 12px;
        font-weight: 200;
        line-height: 13px;
        color: white;
        vertical-align: middle;
        content: '\e6da';
      }
    }
  }
</style>
