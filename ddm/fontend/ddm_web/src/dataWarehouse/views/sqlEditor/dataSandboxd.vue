<template>
    <div class="data-Sandboxd">
        <div class="create-part" v-if="!sandboxdData.id || edit">
            <div class="setp-cont">
              <div class="setp-cont-div">
                <div class="setp-ul">
                  <div
                      v-for="item in stepData"
                      :key="item.label"
                      :class="[
                        'step',
                        {
                          active: currentStep === item.step,
                          done: item.done,
                          current: item.current,
                          disabled: currentStep === 3,
                        },
                      ]"
                      @click="changeStepTop(item)"
                    >
                      <div class="step-line"></div>
                      <div class="step-label">
                        <span style="margin-right:4px">
                          <span class="defult" v-if="item.disabled">
                            <i ></i>
                          </span>
                          <span class="success" v-if="item.done">
                            <i class=" el-icon-success"    style="color:#187FFF;font-size:22px"></i>
                          </span>
                          <span class="current"  v-if="item.current">
                            <i></i>
                          </span>
                        </span>
                        {{ item.label }}
                      </div>
                    </div>
                </div>
              </div>
            </div>
            <div class="first-part" v-show="step === '1'">
                <div class="cont">
                  <div class="cont-search">
                    <div class="searchPart">
                        <datablau-detail-subtitle :themeBlack="true" title="数据需求" mt="16px" mb="16px"></datablau-detail-subtitle>
                        <div class="modelSelect">
                          <p>源模型选择</p>
                          <datablau-select
                            v-model="modelId"
                            size="mini"
                            placeholder="请选择模型"
                            style="display: inline-block;width:100%"
                            :themeBlack="true"
                          >
                            <el-option
                              v-for="v in modelList"
                              :key="v.id"
                              :label="v.name"
                              :value="v.id"
                            >
                            </el-option>
                          </datablau-select>
                        </div>
                        <datablau-input :themeBlack="true" :autosize="{minRows: 5,maxRows: 5}" :resizeState="true"  type="textarea" style="width: 100%;margin-right: 20px;" placeholder="请输入" clearable v-model="keyValue"></datablau-input>
                        <datablau-button
                        type="normal"
                        @click="queryKeyValue"
                        :themeBlack="true"
                        style="width:100%;margin-top:16px"
                        >查询结果</datablau-button>
                    </div>
                    <div class="referTo">
                      <div>
                        <datablau-detail-subtitle :themeBlack="true" title="参考指标" mt="16px" mb="16px"></datablau-detail-subtitle>
                          <datablau-input :iconfont-state="true" clearable
                            :themeBlack="true"
                              style="display: inline-block;width: 100%" placeholder="搜索"
                              v-model="filterText" ></datablau-input>
                              <div>
                                <datablau-tree
                                style="position: absolute;
                                width:27%;
                                  bottom: 0;
                                  top: 360px;
                                  overflow: auto;"
                                  :props="props"
                                  class="grey-tree"
                                  lazy
                                  :load="loadNode"
                                  :data="treeData"
                                  :data-icon-function="dataIconFunction"
                                  :show-checkbox="true"
                                  @node-click="handleNodeClick"
                                  :themeBlack="true"
                                  @check="clickDeal"
                                  :filter-node-method="filterNode"
                                  ref="tree"
                                  >
                                  </datablau-tree>
                              </div>
                      </div>
                    </div>
                  </div>
                  <div class="cont-table">
                    <div class="cont-tablePart">
                      <p class="cont-tablePart-p">信息项列表</p>
                      <datablau-button :themeBlack="true" style="position: absolute;right: 0;top:0;"  type="normal" @click.native.stop="addRow">
                        <i class="iconfont icon-tianjia" style="vertical-align: middle;padding-right: 4px;"></i>手动添加
                      </datablau-button>
                      <div class="cont-tablePart-table">
                        <datablau-table
                        :data="tableDataList"
                        height="100%"
                        ref="tableDataList"
                        :themeBlack="true"
                        >
                        <el-table-column
                            label="字段中文名"
                            prop="name"
                            width="180px"
                        >
                        <template slot="header" slot-scope="scope">
                          <span :data="scope.$index" class="table-label required">字段中文名</span>
                        </template>
                            <template slot-scope="scope">
                              <datablau-input :themeBlack="true" style="width:160px" clearable v-model="scope.row.name"></datablau-input>
                            </template>
                        </el-table-column>
                        <el-table-column
                            label="字段名"
                            prop="colName"
                            width="180px"
                        >
                        <template slot="header" slot-scope="scope">
                          <span :data="scope.$index" class="table-label required">字段名</span>
                        </template>
                            <template slot-scope="scope">
                              <datablau-input :themeBlack="true" clearable v-model="scope.row.colName"></datablau-input>
                            </template>
                        </el-table-column>
                        <el-table-column
                            label="字段类型"
                            prop="type"
                            width="180px"
                        >
                        <template slot="header" slot-scope="scope">
                          <span :data="scope.$index" class="table-label required">字段类型</span>
                        </template>
                            <template slot-scope="scope">
                            <datablau-input :themeBlack="true" clearable v-model="scope.row.type"></datablau-input>
                            </template>
                        </el-table-column>
                        <el-table-column
                            label="取数逻辑"
                            prop="accessLogic"
                            width="100px"
                        >
                            <template slot-scope="scope">
                                <!--<datablau-input clearable v-model="scope.row.accessLogic" v-if="scope.row.editor"></datablau-input>-->
                              <datablau-select
                                v-model="scope.row.accessLogic"
                                v-if="scope.row.editor"
                                v-selectLazyLoad="lazyloading"
                                :themeBlack="true"
                              >
                                <el-option
                                  v-for="item in mappingList"
                                  :key="item.id"
                                  :label="item.mappingType"
                                  :value="item.mappingType"
                                ></el-option>
                              </datablau-select>
                              <div v-else>{{scope.row.accessLogic}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column
                            label="计算公式"
                            prop="formula"
                            width="200"
                        >
                            <template slot-scope="scope">
                            <datablau-input :themeBlack="true" clearable v-model="scope.row.formula" v-if="scope.row.editor"></datablau-input>
                              <div v-else>{{scope.row.formula}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column
                            :label="'数据来源'"
                        >
                          <template slot-scope="scope">
                            <datablau-input :themeBlack="true" clearable v-model="scope.row.sourceData" v-if="scope.row.editor"></datablau-input>
                            <div v-else>{{scope.row.sourceData}}</div>
                          </template>
                        </el-table-column>
                        <el-table-column
                            :label="'字段来源'"
                        >
                          <template slot-scope="scope">
                            <div>{{scope.row.fieldSsource}}</div>
                          </template>
                        </el-table-column>
                          <el-table-column
                            :label="'操作'"
                            fixed="right"
                            width="120px"
                          >

                            <template slot-scope="scope">
                              <datablau-button
                                type="text"
                                @click.native.stop="deleteRow(scope.row, scope.$index)"
                                style="position: relative;
                                        right: 4px;"
                              >
                                <i class="iconfont icon-delete"></i>
                              </datablau-button>
                              <datablau-button
                                type="text"
                                @click.native.stop="addRow"
                                style=""
                                v-if="tableDataList.length - 1 === scope.$index"
                              >
                                <i class="iconfont icon-tianjia"></i>
                              </datablau-button>
                            </template>
                          </el-table-column>
                        </datablau-table>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="transform-btn">
                    <div class="nextStep">
                        <datablau-button
                        :themeBlack="true"
                        type="normal"
                        @click="closeCreate"
                        >重置</datablau-button>
                        <datablau-button
                        type="important"
                        :themeBlack="true"
                        :disabled="disabledFirst"
                        @click="nextStep('2')"
                        >下一步</datablau-button>
                    </div>
                </div>
            </div>
            <div class="second-part" v-show="step === '2'">
                <div class="cont">
                    <datablau-detail-subtitle :themeBlack="true" title="SQL预览" mt="16px"></datablau-detail-subtitle>
                    <div class="previewddl">
                        <!-- <editor
                            :hideBtn="false"
                            ref="sandboxdEditor"
                            :item="ddlitem"
                            :black="true"
                            :idToFileData="{}"
                            :previewDdl="true"
                        ></editor> -->
                        <monaco
                        ref="sandboxdEditor"
                        :opts="monacoOpts"
                        :isDiff="false"
                        style="width: 100%;height: 240px;border: 1px solid #3D3D3D;"
                        class="monacoBox"
                    ></monaco>
                    </div>
                    <div class="dataPreview" style="flex: 1;    position: absolute;
                    top: 300px;
                    left: 20px;
                    right: 20px;
                    bottom: 50px;">
                      <div>
                        <span>数据源</span>
                        <datablau-select
                        style="width:320px;display: inline-block;margin-left: 8px;margin-right: 8px;"
                        filterable
                        clearable
                        class="select-panel"
                        @change="getChemaList()"
                        v-model="dataSourceId"
                        placeholder="请选择数据源"
                        isIcon="iconfont icon-shujuyuan iconBlack"
                        :themeBlack="true"
                        >
                          <el-option
                            v-for="(ds,index) in dataSourceList"
                            :key="index"
                            :label="ds.damDsName"
                            :value="ds.damDsId">
                            <div slot="default">
                              <database-type style="display: inline-block" :size="24"
                                             :value="ds.type" hide-label>
                              </database-type>&nbsp;{{ds.damDsName}}
                            </div>
                          </el-option>
                        </datablau-select>
                        <span style="margin-left: 4px">Schema</span>
                        <datablau-select
                        style="width:320px;display: inline-block;margin-left: 8px;margin-right: 8px;"
                        filterable
                        clearable
                        class="select-panel"
                        v-model="schema"
                        placeholder="请选择schema"
                        isIcon="iconfont icon-schema iconBlack"
                        :themeBlack="true"
                        >
                          <el-option
                            v-for="i in schemaList"
                            :key="i"
                            :label="i"
                            :value="i">
                          </el-option>
                        </datablau-select>
                        <datablau-button
                        type="important"
                        :disabled="!dataSourceId || !schema"
                        @click="dataPreviewClick"
                        :themeBlack="true"
                        >数据预览</datablau-button>
                      </div>
                      <div style="position:absolute;top: 60px;bottom: 0;right:0;left: 0" v-if="dataPreviewView">
                        <datablau-table :themeBlack="true"  :data="dataExplorationData" height="100%" v-show="dataExplorationColumn && dataExplorationColumn.length">
                            <el-table-column
                                v-for="item in dataExplorationColumn"
                                :label="item"
                                :key="item"
                                :prop="item"
                                :formatter="jsonFormatter"
                                :min-width="120"
                                show-overflow-tooltip
                            >
                            <div slot="header">
                                <datablau-tooltip
                                    :content="item"
                                    placement="top-start"
                                >
                                <span class="show-tooltip-header">
                                    {{ item }}
                                </span>
                                </datablau-tooltip>
                            </div>
                            <template slot-scope="scope">
                                {{ scopeJsonFormatter(scope) }}
                            </template>
                            </el-table-column>
                        </datablau-table>
                        <div class="no-data" v-if="(!dataExplorationColumn || !dataExplorationColumn.length)">
                            <div class="center-content">
                            <datablau-icon :data-type="'no-result-black'" icon-type="svg" :size="64"></datablau-icon>
                            <p>暂无数据</p>
                            </div>
                        </div>
                      </div>
                    </div>
                </div>
                <div class="transform-btn">
                    <div class="nextStep">
                        <datablau-button
                        type="important"
                        @click="backStep('1')"
                        :themeBlack="true"
                        >上一步</datablau-button>
                        <datablau-button
                        type="important"
                        :disabled="!dataSourceId || !schema"
                        @click="nextStep('3')"
                        :themeBlack="true"
                        >下一步</datablau-button>
                    </div>
                </div>
            </div>
            <div class="third-part" v-show="step === '3'">
                <div class="cont">
                    <datablau-detail-subtitle :themeBlack="true" title="新建分析" mt="16px"></datablau-detail-subtitle>
                    <datablau-form :rules="rules" ref="sandboxdForm" :model="sandboxdForm" label-width="120px" >
                            <el-form-item label="分析名称" prop="analysisName">
                                <p v-if="edit">{{ sandboxdForm.analysisName }}</p>
                                <datablau-input :themeBlack="true" v-else style="width: 440px;" v-model.trim="sandboxdForm.analysisName" placeholder="请输入分析名称" ></datablau-input>
                            </el-form-item>
                            <el-form-item label="目录选择" prop="analysisDirectory" v-if="!edit">
                                <datablau-cascader
                                :themeBlack="true"
                                :disabled="edit"
                                :options="analysisDirectoryLIst"
                                style="width: 440px;"
                                v-model="sandboxdForm.analysisDirectory"
                                ref="cascader"
                                :props="{ checkStrictly: true ,children: 'children',label: 'name', value: 'id'}"
                                clearable></datablau-cascader>
                            </el-form-item>
                        <el-form-item label="建模分析说明" >
                            <datablau-input
                            style="width: 600px"
                            v-model="sandboxdForm.describe"
                            placeholder="请输入建模分析说明"
                            type="textarea"
                            :themeBlack="true"
                            ></datablau-input>
                        </el-form-item>
                        <el-form-item label="模型存储" prop="modelStorage">
                          <datablau-cascader
                          :themeBlack="true"
                            :options="modelStorageList"
                            style="width: 440px;"
                            v-model="sandboxdForm.modelStorage"
                            clearable
                            ref="modelStorageList"
                            @change="modelStorageListChage"
                            :props="{disabled: 'disabled',checkStrictly: true, children: 'childList',label: 'name', value: 'modelId'}"
                          ></datablau-cascader>
                        </el-form-item>
                            <el-form-item label="实体名称" prop="entityName">
                                <datablau-input :themeBlack="true" style="width: 440px;" v-model.trim="sandboxdForm.entityName" placeholder="请输入实体名称" ></datablau-input>
                            </el-form-item>
                            <el-form-item label="实体中文名" prop="tableCnName">
                                <datablau-input :themeBlack="true" style="width: 440px;" v-model.trim="sandboxdForm.entityChName" placeholder="请输入实体中文名" ></datablau-input>
                            </el-form-item>
                            <el-form-item label="SQL文件名称" prop="sqlfileName">
                                <datablau-input :themeBlack="true" style="width: 440px;" v-model.trim="sandboxdForm.sqlfileName" placeholder="请输入SQL文件名称"></datablau-input>
                            </el-form-item>
                            <el-form-item label="目录选择" prop="fileDirectory">
                                <datablau-cascader
                                :themeBlack="true"
                                style="width: 440px;"
                                :options="fileList"
                                v-model="sandboxdForm.fileDirectory"
                                ref="fileDirectory"
                                @change="fileDirectoryChange"
                                :props="{ checkStrictly: true ,children: 'childList',label: 'name', value: 'id'}"
                                clearable></datablau-cascader>
                            </el-form-item>
                    </datablau-form>
                </div>
                <div class="transform-btn">
                    <div class="nextStep">
                        <!--<datablau-button
                        @click="cancel"
                        >取消</datablau-button>-->
                        <datablau-button
                        type="important"
                        @click="backStep('2')"
                        :themeBlack="true"
                        >上一步</datablau-button>
                        <datablau-button
                        type="important"
                        :disabled="addSandboxdDisabled"
                        @click="addSandboxd(edit)"
                        :themeBlack="true"
                        >创建</datablau-button>
                    </div>
                </div>
            </div>
        </div>
        <div class="edit-part" v-if="sandboxdData.id && !edit">
            <dataSandboxdView
              :detail="sandboxdData" @reestablish="reestablish"
              @closeCreate="closeCreate"
            ></dataSandboxdView>
        </div>
        <datablau-dialog
            title="指标"
            :visible.sync="dialogVisible"
            width="740px"
            height="500px"
            append-to-body
        >
        <div class="flexTree">
            <datablau-tree
            :props="props"
            class="grey-tree"
            lazy
            :load="loadNode"
            :data="treeData"
            :data-icon-function="dataIconFunction"
            @node-click="handleNodeClick"
            node-key="elementId"
            >
            </datablau-tree>
        </div>
            <div slot="footer">
            <datablau-button type="important" @click="addNewFile" :disabled="!Object.keys(indexId).length">
                确定
            </datablau-button>
            <datablau-button @click="cancelLog">
                取消
            </datablau-button>
            </div>
        </datablau-dialog>
    </div>
</template>

<script>
import dataSandboxd from './dataSandboxd.js'
export default dataSandboxd
</script>
<style>
</style>
<style lang="scss" scoped>
.data-Sandboxd{
    position: absolute;
    top: 32px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    overflow-x: hidden;
    background: #222222;
    .create-part{
        // padding: 20px;
        .setp-cont{
          height: 56px;
          background: #333333;
          border-radius: 4px;
          margin: 16px;
          display: flex;
          align-items: center;
          .setp-cont-div{
            width: 100%;
            min-width: 1000px;
            .setp-ul{
              // padding: 0 15%;
              display: flex;
              justify-content: center;
              .step{
                width: 25%;
                color: #888888;
                position: relative;
                height: 56px;
                display: flex;
                align-items: center;
                &:last-child{
                  width: 15%;
                  .step-line{
                    display: none;
                  }
                }
                &:first-child{
                  .step-line{
                    padding-left: 0;
                  }
                }
                &.active{
                  color: #187FFF;
                  .step-label{
                    .success{
                      border: 6px solid rgba(24,127,255,0.2);
                      border-radius: 22px;
                      // background: rgba(24,127,255,0.2);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    }
                    .current{
                      border-radius:  19px;
                      border: 6px solid rgba(24,127,255,0.2);
                    }
                  }
                }
                &.done{
                  color: #187FFF;
                  .step-line{
                    background: #187FFF;
                  }
                  .step-label{
                    cursor: pointer;
                  }
                }
                .step-line{
                  width: 100%;
                  height: 2px;
                  background: #666666;
                  border-radius: 1px;
                  position: absolute;
                  // top: 10px;
                }
                .step-label{
                  background: #333333;
                  position: absolute;
                  z-index: 1;
                  padding-left: 4px;
                  padding-right: 8px;
                  display: flex;
                  align-items: center;
                  // min-width: 100px;
                  .success{
                    border: 6px solid transparent;
                  }
                  .defult{
                    border: 6px solid transparent;
                    i{
                      width: 21px;
                      height: 21px;
                      border: 3px solid #4D4D4D;
                      border-radius:  21px;
                      display: inline-block;
                      vertical-align: middle;
                    }
                  }
                  .current{
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 6px solid transparent;
                    i{
                      width: 16px;
                      height: 16px;
                      background: #FFFFFF;
                      display: inline-block;
                      border-radius:  19px;
                      vertical-align: middle;
                      border: 5px solid #187FFF;
                    }
                  }
                }
              }
            }
          }
        }
        .first-part{
          position: absolute;
          top: 72px;
          .cont{
            display: flex;
            position: absolute;
            top: 0;
            bottom: 50px;
            left: 20px;
            right: 20px;
            .cont-search{
              width: 40%;
              padding-right: 16px;
              .modelSelect{
                display: flex;
                align-items: center;
                margin-bottom: 16px;
                p{
                  color: #BBBBBB;
                  font-size: 12px;
                  padding-right: 8px;
                  width: 92px;
                }
              }
            }
            .cont-table{
              position: relative;
              width: 100%;
              border-left: 1px solid #4D4D4D;;
              margin-top: 18px;
              .cont-tablePart{

                padding-left: 16px;
                .cont-tablePart-p{
                  color: #BBBBBB;
                  font-size: 14px;
                }
                .cont-tablePart-table{
                  position: absolute;
                  left: 16px;
                  right: 0px;
                  bottom: 0;
                  top: 34px;
                }
              }
            }
          }
        }

        .second-part, .third-part, .first-part{
          position: absolute;
          top: 88px;
          left: 0px;
          right: 0px;
          bottom: 0px;
            .previewddl{
                position: relative;
                height: 240px;
            }
            .dataPreview{
                padding-top: 16px;
                display: flex;
                flex-direction: column;
                span{
                  color: #BBBBBB;
                }
            }
        }
        .second-part{
          .cont{
            padding: 0 20px;
          }
        }
        .third-part{
          .cont{
            padding: 0 20px;
            position: absolute;
            left: 0;
            right: 0;
            bottom: 50px;
            overflow: auto;
            top: 0;
          }
        }
    }
    .transform-btn{
    position: absolute;
    bottom: 0px;
    left: 0px;
    height: 50px;
    right: 0;
    box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
        padding: 8px 20px;
        border-top: 1px solid #3D3D3D;
        background: #222222;
    }
    .no-data, .table-outer {
  position: absolute;
  left: 20px;
  top: 130px;
  bottom: 0;
  right: 20px;

  .center-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
}
.no-data{
  p{
    text-align: center;
    padding-top: 4px;
  }
}
  /deep/.datablau-select .el-select .el-input input::placeholder{
    color: #bbb;
  }
/deep/.datablau-cascader .el-cascader .el-input input::placeholder{
  color: #bbb;
}
.table-label {
  position:relative;
  &.required {
    &::before {
      content: '*';
      color: #e86666;
      //position:absolute;
      //left:-8px;
      font-size:13px;
    }
  }
}
</style>
