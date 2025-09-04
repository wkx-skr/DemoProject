<template >
    <div class="viewDetail-content">
        <div class="row-header">
            <datablau-breadcrumb
                @back="backClick"
                :node-data="nodeData"
                separator="/"
            ></datablau-breadcrumb>
        </div>
        <div class="top-info">
            <div class="left-info">
                <div class="icon-container">
                    <datablau-icon :data-type="'modelcategory'" icon-type="svg" :size="40" ></datablau-icon>
                </div>
                <div class="info-container">
                <p class="title">{{ viewDetailObj.name }}</p>
                <div class="define-text">
                    <p class="define-text-e">简称：{{ viewDetailObj.abbreviation }}</p>
                    <p class="define-text-y">业务域：{{ viewDetailObj.zone }}</p>
                </div>

                </div>
            </div>
            <div class="right-button">
                <div class="creat-time">
                    <p style="padding-bottom: 5px;">创建时间</p>
                    <p>{{ $timeFormatter(viewDetailObj.createTime) }}</p>
                </div>
            </div>
        </div>
        <div class="tabs-header-container">
            <datablau-tabs
                class="detail-wrapper "
                v-model="currentTab"
                @tab-click="tabChange"
            >
                <el-tab-pane
                label="摘要"
                name="info"
                >
                </el-tab-pane>
                <el-tab-pane
                label="模型"
                name="model"
                >
                </el-tab-pane>
                <el-tab-pane
                label="知识图谱"
                name="graph"
                >
                </el-tab-pane>
            </datablau-tabs>
        </div>
        <div class="tabs-content-container">
            <div v-if="currentTab === 'info'">
                <datablau-detail-subtitle title="基本信息" mt="16px" mb="4px"></datablau-detail-subtitle>
                <datablau-form
                class="datablau-formView"
                label-width="160px">
                    <el-form-item label="业务域：">
                        <p v-if="viewDetailObj.zone!==''"><!--<i class="iconfont icon-file" style="margin-right:3px"></i>-->{{ viewDetailObj.zone }}</p>
                    </el-form-item>
                    <el-form-item label="描述：">
                        <p style="
                        line-height: 2.6;width:750px">
                        {{ viewDetailObj.description }}</p>
                    </el-form-item>
                    <el-form-item v-for="u in udps" :key="u.id" label=""
              label-width="0" v-show="u.catalog === '基本信息'" >
                        <udp-form-label
                            :content="`${u.name}`"
                            :strWidth="160"
                            :showModel="true"
                        ></udp-form-label>
                        <p style="display: inline-block;" v-if="u.dataType === 'String' && JSON.stringify(additionalPropertiesObj) !== '{}'">{{ additionalPropertiesObj[u.propertyId]}}</p>
                        <p style="display: inline-block;" v-else-if="u.dataType === 'List' && JSON.stringify(additionalPropertiesObj) !== '{}'">{{ additionalPropertiesObj[u.propertyId]}}</p>
                    </el-form-item>
                </datablau-form>
                <datablau-detail-subtitle title="管理信息" mt="16px"  mb="4px"></datablau-detail-subtitle>
                <datablau-form
                class="datablau-formView"
                label-width="160px">
                    <el-form-item label="技术部门：">
                      <p>{{ viewDetailName }}</p>
                    </el-form-item>
                    <el-form-item label="业务部门：">
                        <p>{{ businessDetailName }}</p>
                    </el-form-item>
                    <el-form-item label="负责人：">
                        <p>{{ viewDetailObj.ownerfullName }}</p>
                    </el-form-item>
                    <el-form-item v-for="u in udps" :key="u.id" label=""
              label-width="0" v-show="u.catalog === '管理信息'">
                        <udp-form-label
                            :content="`${u.name}`"
                            :strWidth="160"
                            :showModel="true"
                        ></udp-form-label>
                        <p style="display: inline-block;" v-if="u.dataType === 'String' && JSON.stringify(additionalPropertiesObj) !== '{}'">{{ additionalPropertiesObj[u.propertyId]}}</p>
                        <p style="display: inline-block;" v-else-if="u.dataType === 'List' && JSON.stringify(additionalPropertiesObj) !== '{}'">{{ additionalPropertiesObj[u.propertyId]}}</p>
                    </el-form-item>
                </datablau-form>
            </div>
            <div v-if="currentTab === 'model'">
                <div class="filter-line">
                    <div class="left-filter">
                        <datablau-input
                            v-model="keyword"
                            :iconfont-state="true"
                            :placeholder="$store.state.$v.common.placeholder"
                            style="width: 264px;"
                        ></datablau-input>
                        <span style="padding-left: 16px;padding-right: 8px;">模型类型</span>
                        <datablau-select
                            size="small"
                            style="display:inline-block;width: 140px"
                            v-model="databaseType"
                            clearable
                            filterable
                            placeholder="请选择"
                            @change="changedatabaseType"
                        >
                            <el-option-group
                            v-for="group in modelFilters"
                            :key="group.type"
                            :label="isEN ? group.type : group.name">
                            <el-option
                                v-for="item in group.dataSourceTypeList"
                                :value="item.second"
                                :label="item.text2 || item.text"
                                :key="item.second"
                            ></el-option>
                            </el-option-group>
                        </datablau-select>
                    </div>
                </div>
                <datablau-form-submit class="list-outer-container" style="top: 51px;
                    left: -20px;
                    right: -20px;">
                    <datablau-table
                    :data="tableData"
                    height="100%"
                    >
                        <el-table-column
                            prop="verId"
                            width="30"
                            align="left"
                        >
                            <template >
                            <datablau-icon style="vertical-align: text-top;" :data-type="'model'" icon-type="svg" :size="18" ></datablau-icon>
                            </template>
                        </el-table-column>
                        <el-table-column
                            show-overflow-tooltip
                            label="名称"
                            min-width="90"
                        >
                        <template slot-scope="scope">
                            <datablau-button
                            type="text"
                            @click="goModel(scope.row)"
                            >{{ scope.row.name }}</datablau-button>
                            <!-- <p>{{ scope.row.name }}</p> -->
                        </template>
                        </el-table-column>
                        <el-table-column
                            show-overflow-tooltip
                            label="模型类型"
                            prop="modelType"
                            min-width="90"
                        >
                        </el-table-column>
                        <el-table-column
                            label="修改时间"
                            show-overflow-tooltip
                            :formatter="$timeFormatter"
                            prop="lastModificationTimestamp"
                        >
                        </el-table-column>
                        <el-table-column
                            show-overflow-tooltip
                            label="位置"
                            prop="path"
                            min-width="90"
                        >
                        </el-table-column>
                    </datablau-table>
                    <template slot="buttons">
                        <div class="bottom-pagination-container">
                            <datablau-pagination
                            layout="total, sizes, prev, pager, next, jumper"
                            :total="total"
                            :page-size="pageSize"
                            :page-sizes="[20, 50, 100]"
                            :current-page.sync="currentPage"
                            @size-change="handleSizeChange"
                            @current-change="handleCurrentChange"
                            ></datablau-pagination>
                        </div>
                    </template>
                </datablau-form-submit>
            </div>
             <!--知识图谱-->
            <div
            class="knowledge-graph"
            v-if="currentTab === 'graph'"
            >
            <knowledge-graph
                ref="knowledgeGraph"
                style="margin: 10px 0px;"
                :summary="{
            properties: { Id: this.viewDetailObj.id, TypeId: 'System',App: 'archy' },
            }"
            ></knowledge-graph>
            </div>

        </div>
    </div>
</template>
<script>
import viewDetail from './viewDetail.js'

export default viewDetail
</script>
<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.viewDetail-content{
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: #fff;
    z-index: 10;
    .row-header {
        padding: 10px 0 8px;
        border-bottom: 1px solid $border-color;
        margin: 0 16px;
    }
    .top-info{
        margin: 0 16px;
        display: flex;
        align-items: center;
        height: 70px;
        justify-content: space-between;
        .left-info{
            display: flex;
            align-items: center;
            .icon-container{
                margin-right: 12px;
            }
            .info-container{
                .title{
                    font-size: 20px;
                    color: #555555;
                }
                .define-text{
                    display: flex;
                    align-items: center;
                    .define-text-e{
                        font-size: 12px;
                        color: #777;
                        padding-right: 16px;
                        position: relative;
                        // border-right: 1px solid #DDDDDD;
                        &:after{
                            position: absolute;
                            content: '';
                            right: 0;
                            top: 3px;
                            width: 1px;
                            height: 12px;
                            background: #DDDDDD;
                        }
                    }
                    .define-text-y{
                        padding-left: 16px;
                    }
                }
            }
        }
        .right-button{
            .creat-time{
                margin-right: 16px;
            }
        }
    }
    .tabs-header-container{
        margin: 0 16px;
    }
    .tabs-content-container{
        position: absolute;
        top: 144px;
        bottom: 0px;
        left: 16px;
        right: 16px;
        z-index: 1;
        .filter-line{
            height: 52px;
            display: flex;
            align-items: center;
        }
    }
}
</style>
<style lang="scss">
    .datablau-formView{
        .el-form.db-form .el-form-item{
            margin-bottom: 0;
        }
        p{
            font-size: 12px;
            color: #555555;
        }
    }
</style>
