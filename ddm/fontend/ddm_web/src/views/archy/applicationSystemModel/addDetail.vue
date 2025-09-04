<template >
    <div class="addDetail-content">
        <div class="row-header">
            <datablau-breadcrumb
                @back="backClick"
                :node-data="nodeData"
                separator="/"
            ></datablau-breadcrumb>
        </div>
        <datablau-form-submit
            style="position: absolute; top: 50px; left: 0; right: 0; bottom: 0"
            >
            <div style="padding: 10px 20px">
                <datablau-form
                class="page-form multiple-column"
                label-position="right"
                label-width="168px"
                :rules="formRules"
                ref="form"
                :model="formData"
                >
                <div>
                    <el-form-item label="系统名称" prop="name">
                        <datablau-input
                            v-model="formData.name"
                            maxlength="100"
                            class="maxlengthInput"
                            show-word-limit
                        ></datablau-input>
                    </el-form-item>
                    <el-form-item label="简称" prop="abbreviation">
                        <datablau-input
                            v-model="formData.abbreviation"
                            maxlength="100"
                            class="maxlengthInput"
                            show-word-limit
                        ></datablau-input>
                    </el-form-item>
                    <el-form-item label="描述" style="padding-top: 4px;">
                        <datablau-input
                            v-model="formData.description"
                            type="textarea"
                            maxlength="1000"
                            class="maxlengthInput"
                            show-word-limit
                        ></datablau-input>
                    </el-form-item>
                    <el-form-item label="业务域" >
                        <datablau-input
                            v-model="formData.zone"
                            maxlength="100"
                            class="maxlengthInput"
                            show-word-limit
                        ></datablau-input>
                    </el-form-item>
                    <el-form-item :key="1" label="技术部门" prop="itDepartment">
                        <div style="display: flex;align-items: center;">
                            <datablau-select
                                v-model="formData.itDepartment"
                                filterable
                                :placeholder="$t('assets.catalogue.inputRequired')"
                                style="width: 436px; border-right: none"
                                >
                                <el-option
                                    v-for="item in departmentList"
                                    :key="item.bm"
                                    :label="item.fullName"
                                    :value="item.bm"
                                ></el-option>
                            </datablau-select>
                            <datablau-button
                            type="secondary"
                            @click="addBm"
                            class="owner-select-btn"
                            style="border-left: none;"
                            >
                            {{ $t('common.button.select') }}
                            </datablau-button>
                        </div>
                    </el-form-item>
                    <el-form-item :key="2" label="业务部门" prop="businessDepartment">
                        <div style="display: flex;align-items: center;">
                        <datablau-select
                            v-model="formData.businessDepartment"
                            filterable
                            :placeholder="$t('assets.catalogue.inputRequired')"
                            style="width: 436px; border-right: none"
                            >
                            <el-option
                                v-for="item in departmentList"
                                :key="item.bm"
                                :label="item.fullName"
                                :value="item.bm"
                            >{{item.fullName}}</el-option>
                        </datablau-select>
                        <datablau-button
                        type="secondary"
                        @click="addBms"
                        class="owner-select-btn"
                        style="border-left: none;"
                        >
                        {{ $t('common.button.select') }}
                        </datablau-button>
                        </div>
                    </el-form-item>
                    <!-- <el-form-item label="重要程度" >
                        <datablau-radio
                            v-model="formData.importance"
                            >
                            <el-radio label="高" :value="'高'"></el-radio>
                            <el-radio label="中" :value="'中'"></el-radio>
                            <el-radio label="低" :value="'低'"></el-radio>
                            </datablau-radio>
                    </el-form-item> -->
                    <el-form-item label="负责人" prop="ownerfullName">
                        <datablau-input
                            v-model="formData.ownerfullName"
                            maxlength="100"
                            class="maxlengthInput"
                            show-word-limit
                            @focus="addUsers"
                            readonly
                        ></datablau-input>
                    </el-form-item>
                    <!-- <el-form-item label="部署地" >
                        <datablau-input
                            v-model="formData.deployment"
                            maxlength="100"
                            class="maxlengthInput"
                            show-word-limit
                        ></datablau-input>
                    </el-form-item> -->
                    <el-form-item  class="udp-form-item udp-form-item2"  label-width="0" v-for="u in udps" :key="u.id" label=""   :prop="u.propertyId + ''">
                        <!--注意：需要搭配 样式：.el-form-item__error-->
                        <udp-form-label
                        :content="`${u.name}`"
                        :strWidth="168"
                        :showModel="false"
                        :showRequired="!!u.required"
                        ></udp-form-label>
                        <datablau-input
                        class="udp-form-edit-item"
                            v-if="u.dataType === 'String'"
                            v-model="additionalPropertiesObj[u.propertyId]"
                        ></datablau-input>
                        <datablau-select
                        class="udp-form-edit-item"
                            v-else-if="u.dataType === 'List'"
                            v-model="additionalPropertiesObj[u.propertyId]"
                            filterable
                            clearable
                            :popper-append-to-body="false"
                        >
                            <el-option
                            v-for="o in u.candidates"
                            :key="o"
                            :label="o"
                            :value="o"
                            ></el-option>
                        </datablau-select>
                        </el-form-item>
                </div>
                </datablau-form>
            </div>
            <div slot="buttons" class="page-btn-group left-bottom" style="margin: 0">
                <datablau-button
                type="important"
                @click="onSubmit(true)"
                :disabled="submitLoading"
                >
                {{ $t('domain.common.submit') }}
                </datablau-button>
                <datablau-button type="secondary" @click="backClick">
                {{ $t('common.button.cancel') }}
                </datablau-button>
            </div>
        </datablau-form-submit>
    </div>
</template>
<script>
import editUdp from './addDetail.js'

export default editUdp
</script>
<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';

.addDetail-content{
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: #fff;
    z-index: 5;
    .row-header {
        padding: 10px 0 8px;
        border-bottom: 1px solid $border-color;
        margin: 0 16px;
    }
}
.udp-form-item {
    .udp-form-edit-item {
      display: inline-block;
    }

    /deep/ .el-form-item__error {
      left: 168px;
    }
  }
</style>
