<template>
  <el-container id="model-edit" v-loading="loading.status" :element-loading-text="loading.text" class="full-area" style="user-select:none;">
    <el-header v-if="isRenderTopHeader" ref="erHeader" style="height:30px;padding:0;line-height: 50px;z-index:4" v-show="showTopTilte">
      <div class="top-title-box" >
        <div class="infomes-box">
          <div class="user-info">
            <i class="iconfont icon-schema" style="color: #fff"></i><span class="text oneline-eclipse">{{$store.state.user.username}}</span>
          </div>
          <datablau-button style="height: 20px;line-height: 20px;border-radius: 10px;margin-left: 5px;" type="important" size="mini" @click="exit">退出编辑</datablau-button>
        </div>
      <div :title="currentModel.branch ? currentModel.pathName+ ':' + currentModel.Name : currentModel.Name + ':master'" class="model-header">
        <span style="position: relative;top: 2px;" class="tree-icon model"></span>
        <span class="model-name"><span>{{currentModel.branch ? currentModel.pathName+ ':' + currentModel.Name : currentModel.Name + ':master'}}</span><i style="margin-left: 10px;" title="编辑" class="iconfont icon-bianji" @click="editModelInfo()"></i></span>
      </div>
        <el-popover
          v-model="popoverVisible"
          placement="bottom-start"
          width="320"
          trigger="click"
          :append-to-body="false"
          style=""
          class="diagram-tree-wrapper"
        >
          <div v-loading="!diagrams" style="margin-bottom: 16px">
            <div class="title" style="margin-left: 16px;height: 46px;display: flex;align-items: center;">
              <img style="margin-right: 4px;" :src="diagramImg1" alt="">
              <span style="margin-right: 4px;font-size: 12px;font-weight: normal;">{{$store.state.$v.modelDetail.theme}}</span>
              <datablau-button type="icon" class="iconfont icon-tianjia" style="flex: 0 0 auto;cursor: pointer;margin-left: 208px;" @click.stop="addDiagram()"></datablau-button>
            </div>
            <datablau-tree
              v-if="diagrams && diagrams.length"
              class="grey-tree model-edit"
              :data="diagrams"
              ref="themeTree"
              :key="diagramKey"
              :props="{label: 'Name', id: 'Id'}"
              @node-click="handleDiagramClick"
              :render-content="renderContent"
              :filter-node-method="filterNode"
              :expand-on-click-node="true"
              node-key="Id"
            ></datablau-tree>
          </div>
          <div slot="reference">
            <div class="title" :title="diagramPath" style="height: 30px;display: flex;align-items: center;padding-left: 12px;cursor: pointer;position:relative;color: rgba(255,255,255,0.8);">
              <!-- <img style="margin-right: 4px;flex: 0 0 auto;" :src="diagramImg1" alt=""> -->
              <span style="margin-right: 4px;flex: 1 1 auto;font-size: 12px;font-weight: normal;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">{{diagramPath}}</span>
              <i :class='{"el-icon-arrow-down":true,"up":popoverVisible}' style=""></i>
            </div>
          </div>
        </el-popover>
      </div>

    </el-header>
    <el-container>
      <div class="tree-area left-panel-wrapper" :class="{'fullscreen':!showTopTilte}" style="position:absolute;bottom:0;left:0;width:270px;">

        <div v-show="isShowModelList === 'dataModel'" style="padding:0;position:absolute;top:0px;bottom:0;left:30px;right:0;overflow-x:hidden;overflow-y:auto;border-left: 1px solid #ddd;">
          <div class="clearfixed search-box" style="padding-right: 14px;margin:10px 0;display: flex;align-items: center;font-size: 12px;justify-content: space-around;">
            <el-input prefix-icon="iconfont icon-search" id="searchId" size="mini" v-model="searchQuery" style="width: 200px;margin-left: 10px;" placeholder="名称检索" @input="searchAll"></el-input>
            <datablau-tooltip
              style="flex: 0 0 auto;margin-left: 5px;"
              effect="dark"
              content="当前主题域使用"
              placement="top-start">
              <datablau-checkbox :checkboxType="'single'" style="margin-right:5px" v-model="showUsed" @change="searchAll(showUsed)" size="mini"></datablau-checkbox>
            </datablau-tooltip>
            <!--<div v-show="showModelSearch" class="close" @click="colseSearch">&times;</div>
            <img v-show="!showModelSearch" :src="searchImg" @click="showSearch">-->
            <template >
              <div class="img-box" @click="toggleExpand" v-show="!isExpandAll">
                  <i class="iconfont icon-shouqi" ></i>
              </div>
              <div class="img-box" @click="toggleExpand" v-show="isExpandAll">
                  <i class="iconfont icon-zhankai" ></i>
              </div>
            </template>
          </div>
          <div class="bottom-line"></div>
          <el-collapse class="entitiy-list-wrapper" :key="leftTreeKey" v-model="leftShowList" @change="handleCollapseChange">
            <el-collapse-item v-if="isLogical || isConceptual" name="business">
              <template slot="title">
                <div class="title " ref="business" @click="handleListHl('business')">
                  业务对象<span class="count-hint" v-if="tableShowList.filter(i => i.properties.TypeId === 80100073).length > 0"><span>{{tableShowList.filter(i => i.properties.used && i.properties.TypeId === 80100073).length}}</span>{{'/' + Object.values(dataByType.table).filter(i => !i.properties.deleted && i.properties.TypeId === 80100073).length}}</span>
                </div>
                <i class="el-icon-plus" :class="{show:showCurrentAdd === 'business'}" style="float:right;cursor: pointer;margin-right: 5px;" @click.stop="createBusiness"></i>
              </template>
              <ul style="margin-bottom: 16px;">
                <template v-if="getKeyLength(dataByType.table)">
                  <template v-for="(table, index) of Object.values(dataByType.table).filter(i => i.properties.TypeId === 80100073)">
                    <li v-show="!table.properties.deleted && !table.properties.hide" @click="businessClick(table.properties.Id,'business')" :id="table.properties.Id" class="tableDetail list-item-wrapper" :class="{unactive:!table.properties.used,active:currentBusinessId === table.properties.Id}" :key="table.properties.Id">
                      <img v-if="table.properties.used" :src="businessUsedImg" />
                      <img v-else :src="businessUnUsedImg" alt="">
                      <datablau-tooltip
                        effect="dark"
                        :content="table.properties.LogicalName ? `${table.properties.Name}（${table.properties.LogicalName}）` : table.properties.Name"
                        placement="top-start"
                        :disabled="toolTipDisabled(table.properties.LogicalName ? `${table.properties.Name}（${table.properties.LogicalName}）` : table.properties.Name)"
                      >
                        <span class="node-name">{{table.properties.Name}}<span v-if="table.properties.LogicalName && table.properties.LogicalName !== ''">（{{table.properties.LogicalName}}）</span></span>
                      </datablau-tooltip>
                      <span class="operate-list">
                        <el-popover
                          placement="right"
                          popper-class="mod-pop"
                          ref="businessPopover"
                          :visible-arrow='false'
                          trigger="click">
                          <span slot="reference" @click="hideBefore(index)" class="el-icon-more"></span>
                          <span  v-if="table.properties.used" class="modeEdit-more-itme-box iconfont icon-bianji" @click.stop="editItem(table, index)">编辑</span>
                          <span  class="modeEdit-more-itme-box iconfont icon-delete" @click.stop="deleteItem(table, index)">删除</span>
                        </el-popover>
                      </span>
                    </li>
                  </template>
                </template>
                <template v-else>
                  <div class="no-data">暂无数据</div>
                </template>
              </ul>
            </el-collapse-item>
            <el-collapse-item v-if="!isConceptual" name="table">
              <template slot="title">
                <div class="title " ref="table" @click="handleListHl('table')">
                  {{isLogical ? '实体': '表'}}<span class="count-hint" v-if="tableShowList.filter(i => i.properties.TypeId === 80000004).length > 0"><span>{{tableShowList.filter(i => i.properties.used && i.properties.TypeId === 80000004).length}}</span>{{'/' + Object.values(dataByType.table).filter(i => !i.properties.deleted && i.properties.TypeId === 80000004).length}}</span>
                </div>
                <i class="el-icon-plus" :class="{show:showCurrentAdd === 'table'}" style="float:right;cursor: pointer;margin-right: 5px;" @click.stop="createTable"></i>
              </template>
              <ul style="margin-bottom: 0.6em;">
                <template v-if="getKeyLength(dataByType.table)">
                  <template v-for="(table, index) of Object.values(dataByType.table).filter(i => i.properties.TypeId === 80000004)">
                    <li v-show="!table.properties.deleted && !table.properties.hide" @click="tableClick(table.properties.Id,'table')" :id="table.properties.Id" class="tableDetail list-item-wrapper" :class="{unactive:!table.properties.used,active:currentTableId === table.properties.Id}" :key="table.properties.Id">
                      <img v-if="table.properties.used" :src="tableUsedImg" />
                      <img v-else :src="tableUnUsedImg" alt="">
                      <datablau-tooltip
                        effect="dark"
                        :content="table.properties.LogicalName ? `${table.properties.Name}（${table.properties.LogicalName}）` : table.properties.Name"
                        placement="top-start"
                        :disabled="toolTipDisabled(table.properties.LogicalName ? `${table.properties.Name}（${table.properties.LogicalName}）` : table.properties.Name)"
                      >
                        <span class="node-name">{{table.properties.Name}}<span v-if="table.properties.LogicalName && table.properties.LogicalName !== ''">（{{table.properties.LogicalName}}）</span></span>
                      </datablau-tooltip>
                      <span class="operate-list">
                        <el-popover
                          :offset="20"
                          placement="right-end"
                          popper-class="mod-pop"
                          ref="tablePopover"
                          :visible-arrow='false'
                          trigger="click">
                          <span slot="reference" @click="hideBefore(index)" class="el-icon-more"></span>
                          <span  v-if="table.properties.used" class="modeEdit-more-itme-box iconfont icon-bianji" @click.stop="editItem(table, index)">编辑</span>
                          <span  class="modeEdit-more-itme-box iconfont icon-delete" @click.stop="deleteItem(table, index)">删除</span>
                        </el-popover>
                      </span>
                    </li>
                  </template>
                </template>
                <template v-else>
                  <div class="no-data">暂无数据</div>
                </template>
              </ul>
            </el-collapse-item>
            <el-collapse-item name="relation">
              <template slot="title">
                <div class="title " ref="relation" @click="handleListHl('relation')">
                  关系<span class="count-hint" v-if="relationShowList.length > 0"><span>{{relationShowList.filter(i => i.properties.used).length}}</span>{{'/' + Object.values(dataByType.relation).filter(i => !i.properties.deleted).length}}</span>
                </div>
<!--                <i class="el-icon-plus" style="float:right;cursor: pointer;margin-right: 5px;" @click.stop="createRelation"></i>-->
              </template>
              <ul style="margin-bottom: 0.6em;">
                <template v-if="getKeyLength(dataByType.relation)">
                  <template v-for="(relation, key, index) of dataByType.relation">
                    <li v-show="!relation.properties.deleted && !relation.properties.hide" @click="relationClick(+key)" :id="key" class="relationDetail list-item-wrapper" :class="{unactive:!relation.properties.used,active:currentRelationId === +key}" :key="key">
                      <img v-if="relation.properties.used" :src="relationUsedImg" />
                      <img v-else :src="relationUnUsedImg" />
                      <datablau-tooltip
                        effect="dark"
                        :content="relation.properties.Name"
                        placement="top-start"
                        :disabled="toolTipDisabled(relation.properties.Name)"
                      >
                        <span class="node-name">{{relation.properties.Name}}</span>
                      </datablau-tooltip>
                      <span  class="operate-list">
                         <el-popover
                          placement="right"
                          popper-class="mod-pop"
                          ref="relationPopover"
                          :visible-arrow='false'
                          trigger="click">
                          <span slot="reference" @click="hideBefore(index)" class="el-icon-more"></span>
                          <span  v-if="relation.properties.used" class="modeEdit-more-itme-box iconfont icon-bianji" @click.stop="editItem(relation, index)">编辑</span>
                          <span  class="modeEdit-more-itme-box iconfont icon-delete" @click.stop="deleteItem(relation, index)">删除</span>
                        </el-popover>
                      </span>
                    </li>
                  </template>
                </template>
                <template v-else>
                  <div class="no-data">暂无数据</div>
                </template>
              </ul>
            </el-collapse-item>
            <el-collapse-item name="comment">
              <template slot="title">
                <div class="title " ref="comment" @click="handleListHl('comment')">
                  文本<span class="count-hint" v-if="commentShowList.length > 0"><span>{{commentShowList.filter(i => i.properties.used).length}}</span>{{'/' + Object.values(dataByType.comment).filter(i => !i.properties.deleted).length}}</span>
                </div>
                <i class="el-icon-plus" :class="{show:showCurrentAdd === 'comment'}" style="float:right;cursor: pointer;margin-right: 5px;" @click.stop="createComment"></i>
              </template>
              <ul style="margin-bottom: 0.6em;">
                <template v-if="getKeyLength(dataByType.comment)">
                  <template v-for="(comment, key, index) of dataByType.comment">
                    <li v-show="!comment.properties.deleted && !comment.properties.hide" :id="key" class="commentDetail list-item-wrapper" @click="highLight('currentComentId',+key)" :class="{unactive:!comment.properties.used,active:currentComentId === +key}" :key="key">
                      <img v-if="comment.properties.used" :src="commentUsedImg" />
                      <img v-else :src="commentUnUsedImg" />
                      <datablau-tooltip
                        effect="dark"
                        :content="comment.properties.Text"
                        placement="top-start"
                        :disabled="toolTipDisabled(comment.properties.Text)"
                      >
                        <span class="node-name">"{{comment.properties.Text}}"</span>
                      </datablau-tooltip>
                      <span class="operate-list">
                         <el-popover
                          placement="right"
                          popper-class="mod-pop"
                          ref="commentPopover"
                          :visible-arrow='false'
                          trigger="click">
                          <span slot="reference" @click="hideBefore(index)" class="el-icon-more"></span>
                          <span  v-if="comment.properties.used" class="modeEdit-more-itme-box iconfont icon-bianji" @click.stop="editItem(comment, index)">编辑</span>
                        <span  class="modeEdit-more-itme-box iconfont icon-delete" @click.stop="deleteItem(comment, index)">删除</span>
                        </el-popover>
                      </span>
                    </li>
                  </template>
                </template>
                <template v-else>
                  <div class="no-data">暂无数据</div>
                </template>
              </ul>
            </el-collapse-item>
            <el-collapse-item v-if="showViewButton" name="view">
              <template slot="title">
                <div class="title " ref="view" @click="handleListHl('view')">
                  视图<span class="count-hint" v-if="viewShowList.length > 0"><span>{{viewShowList.filter(i => i.properties.used).length}}</span>{{'/' + Object.values(dataByType.view).filter(i => !i.properties.deleted).length}}</span>
                </div>
                <i class="el-icon-plus" :class="{show:showCurrentAdd === 'view'}" style="float:right;cursor: pointer;margin-right: 5px;" @click.stop="createView"></i>
              </template>
              <ul style="margin-bottom: 0.6em;">
                <template v-if="getKeyLength(dataByType.view)">
                  <template v-for="(view, key, index) of dataByType.view">
                    <li v-show="!view.properties.deleted && !view.properties.hide" :id="key" class="viewDetail list-item-wrapper" @click="highLight('currentViewId',+key)" :class="{unactive:!view.properties.used,active:currentViewId === +key}"  :key="key">
                      <img v-if="view.properties.used" :src="viewUsedImg" />
                      <img v-else :src="viewUnUsedImg" />
                      <datablau-tooltip
                        effect="dark"
                        :content="view.properties.Name"
                        placement="top-start"
                        :disabled="toolTipDisabled(view.properties.Name)"
                      >
                        <span class="node-name">{{view.properties.Name}}</span>
                      </datablau-tooltip>
                      <span class="operate-list">

                         <el-popover
                          placement="right"
                          popper-class="mod-pop"
                          ref="viewPopover"
                          :visible-arrow='false'
                          trigger="click">
                          <span slot="reference" @click="hideBefore(index)" class="el-icon-more"></span>
                          <span  v-if="view.properties.used" class="modeEdit-more-itme-box iconfont icon-bianji" @click.stop="editItem(view, index)">编辑</span>
                          <span  class="modeEdit-more-itme-box iconfont icon-delete" @click.stop="deleteItem(view, index)">删除</span>
                        </el-popover>
                      </span>
                    </li>
                  </template>
                </template>
                <template v-else>
                  <div class="no-data">暂无数据</div>
                </template>
              </ul>
            </el-collapse-item>
            <el-collapse-item name="schema" v-if="showSchema">
              <template slot="title">
                <div class="title " ref="schema" @click="handleListHl('schema')">
                  Schema<span class="count-hint" v-if="schemaShowList.length > 0">{{schemaShowList.length}}</span>
                </div>
                <i class="el-icon-plus" :class="{show:showCurrentAdd === 'schema'}" style="float:right;cursor: pointer;margin-right: 5px;" @click.stop="createSchema"></i>
              </template>
              <ul style="margin-bottom: 0.6em;">
                <template v-if="getKeyLength(dataByType.schema)">
                  <li v-show="!schema.properties.deleted && !schema.properties.hide" @click="highLight('currentSchemaId',+key)" v-for="(schema, key, index) of dataByType.schema" :id="key" :key="key" class="themeDetail list-item-wrapper" :class="{unactive:!schema.properties.used,active:currentSchemaId === +key}">
                    <img :src="schemaUsedImg" />
                    <datablau-tooltip
                      v-show="+key !== currentEditSchemaIndex"
                      effect="dark"
                      :content="schema.properties.Name"
                      placement="top-start"
                      :disabled="toolTipDisabled(schema.properties.Name)"
                    >
                      <span class="node-name">{{schema.properties.Name}}</span>
                    </datablau-tooltip>
                    <el-input :ref="`schema${key}`" style="width: 140px;" v-show="+key === currentEditSchemaIndex" v-model="schema.properties.Name"  size="mini" clearable @change="handleSchemaChange(schema)" @blur="checkSchema(schema.properties,+key)"></el-input>
                    <span style="position: absolute;" class="operate-list">
                       <el-popover
                          placement="right"
                          popper-class="mod-pop"
                          ref="schemaPopover"
                          :visible-arrow='false'
                          trigger="click">
                        <span slot="reference" @click="hideBefore(index)" class="el-icon-more"></span>
                        <span class="modeEdit-more-itme-box iconfont icon-bianji" @click.stop="handleSchemaEdit(+key, index)">编辑</span>
                        <span class="modeEdit-more-itme-box iconfont icon-delete" @click="deleteCurrentSchema(schema, index)">删除</span>
                      </el-popover>
                    </span>
                  </li>
                </template>
                <template v-else>
                  <div class="no-data">暂无数据</div>
                </template>
              </ul>
            </el-collapse-item>
            <el-collapse-item name="theme" >
              <template slot="title">
                <div class="title " ref="theme" @click="handleListHl('theme')">
                  样式<span class="count-hint" v-if="themeShowList.length > 0">{{themeShowList.length}}</span>
                </div>
                <i class="el-icon-plus" :class="{show:showCurrentAdd === 'theme'}" style="float:right;cursor: pointer;margin-right: 5px;" @click.stop="createTheme"></i>
              </template>
              <ul style="margin-bottom: 0.6em;">
                <template v-if="getKeyLength(dataByType.theme)">
                  <li v-show="!theme.properties.deleted && !theme.properties.hide" v-for="(theme, key) of dataByType.theme" @click="themeClick(+key)" :id="key" class="themeDetail list-item-wrapper" :key="key" :class="{unactive:theme.properties.Id !== (dataByType.diagram[diagramId] && dataByType.diagram[diagramId].properties.StyleThemeRef),active:currentThemeId === +key}">
                    <img :src="themeUsedImg" />
                    <!-- <span class="node-name" style="display: inline-block;vertical-align:middle;overflow: hidden;white-space: normal;text-overflow: ellipsis;">{{theme.properties.Name}}</span> -->
                    <datablau-tooltip
                      effect="dark"
                      :content="theme.properties.Name"
                      placement="top-start"
                      :disabled="toolTipDisabled(theme.properties.Name)"
                    >
                      <span class="node-name">{{theme.properties.Name}}</span>
                    </datablau-tooltip>
                    <span class="operate-list">
                       <el-popover
                        placement="right"
                        popper-class="mod-pop"
                        :visible-arrow='false'
                        v-model="theme.showMenu"
                        trigger="click">
                        <span slot="reference" @click="hideBefore(index)" class="el-icon-more"></span>
                        <span  class="modeEdit-more-itme-box iconfont icon-bianji" @click="showThemeEditDialog(theme)">编辑</span>
                      <span  class="modeEdit-more-itme-box iconfont icon-approve" @click="applyThemeToGraph(theme)">应用</span>
                      <span  class="modeEdit-more-itme-box iconfont icon-delete" @click="deleteTheme(theme)">删除</span>
                      </el-popover>

                    </span>
                  </li>
                </template>
                 <template v-else>
                  <div class="no-data">暂无数据</div>
                </template>
              </ul>
            </el-collapse-item>
          </el-collapse>

        </div>
        <neo-domain
        v-show="isShowModelList === 'dataStandard'"
        :limitedDsApply="currentModel.limitedDsApply"
        :limitedDsApplyConfig="currentModel.limitedDsApplyConfig"
        ></neo-domain>
        <archy-object
          ref="archyObjectRef"
          v-show="isShowModelList === 'archy'"></archy-object>
       <el-radio-group @change="changeLeftPane" v-model="isShowModelList">
        <el-radio-button label="dataModel">企业级逻辑模型</el-radio-button>
        <el-radio-button label="dataStandard">数据标准</el-radio-button>
         <el-radio-button label="archy">数据资产目录</el-radio-button>
      </el-radio-group>
      </div>
      <!-- <div class="resize-column-middle" style="top: 50px;cursor:unset !important"></div> -->
      <el-main class="model-box" :class="['content-box', {'hide-tabs': hideTabs},{'fullscreen':!showTopTilte}]" v-if="permissionReady" v-loading="!permissionReady">
        <model-graph-edit
          v-if="currentPane==='tables' && dataByType.udp"
          :current-id="diagramId"
          :currentPane="currentPane"
          editorType="model"
          current-name="数据实体"
          from="tables"
          key="tables"
          :data="data"
          :data-by-type="dataByType"
          :modelId="currentModel.id"
          :currentModel="currentModel"
          @hideTabs="hideTabsChange"
        >
        </model-graph-edit>
        <model-graph-edit
          v-else-if="currentPane.indexOf('diagram')===0"
          :current-id="diagramId"
          :currentPane="currentPane"
          editorType="model"
          :current-name="diagramName"
          from="graph"
          :key="diagramId"
          :data="data"
          ref="modelGraphReference"
          :data-by-type="dataByType"
          :modelId="currentModel.id"
          :currentModel="currentModel"
          :diagrams="diagrams"
          :diagram="diagram"
          :preDiagrams="preDiagrams"
          :mapIdToDiagramData="mapIdToDiagramData"
          :sumElementNum="sumElementNum"
          :searchPanelExist="searchPanelExist"
          :loading="loading"
          :showViewButton="showViewButton"
          :isCassandraOrMongoDB="isCassandraOrMongoDB"
          :isLogical="isLogical"
          :isConceptual="isConceptual"
          :entityTotal="entityTotal"
          :isShowSchema="showSchema"
          :transformData="transformData"
          @hideTabs="hideTabsChange"
          @modelLoading="handleModelLoading"
          @handleTopTileChange='handleTopTileChange'
          @handleTopHeaderChange="handleTopHeaderChange"
        >
          <el-header slot="header" v-if="!isRenderTopHeader" v-show="showTopTilte"  ref="erHeader" style="height:30px;padding:0;line-height: 50px;z-index:4" >
            <div class="top-title-box" >
              <div class="infomes-box">
                <div class="user-info">
                  <i class="iconfont icon-schema"></i><span class="text oneline-eclipse">{{$store.state.user.username}}</span>
                </div>
                <datablau-button style="height: 20px;line-height: 20px;border-radius: 10px;margin-left: 5px;" type="important" size="mini" @click="exit">退出编辑</datablau-button>
              </div>
              <div :title="currentModel.Name" class="model-header">
                <span style="position: relative;top: 2px;" class="tree-icon model"></span>
                <span class="model-name"><span>{{currentModel.Name}}</span><i style="margin-left: 10px;" title="编辑" class="iconfont icon-bianji" @click="editModelInfo()"></i></span>
              </div>
              <el-popover
                v-model="popoverVisible"
                placement="bottom-start"
                width="320"
                trigger="click"
                :append-to-body="false"
                style=""
                class="diagram-tree-wrapper"
              >
                <div v-loading="!diagrams" style="margin-bottom: 0.6em">
                  <div class="title" style="margin-left: 16px;margin-right: 16px;height: 46px;display: flex;align-items: center;">
                    <img style="margin-right: 4px;" :src="diagramImg1" alt="">
                    <span style="margin-right: 4px;font-size: 12px;font-weight: normal;">{{$store.state.$v.modelDetail.theme}}</span>
                    <datablau-button type="icon" class="iconfont icon-tianjia" style="flex: 0 0 auto;margin-left: 208px;cursor: pointer;" @click.stop="addDiagram()"></datablau-button>
                  </div>
                  <datablau-tree
                    v-if="diagrams && diagrams.length"
                    class="grey-tree model-edit"
                    :data="diagrams"
                    ref="themeTree"
                    :key="diagramKey"
                    :props="{label: 'Name', id: 'Id'}"
                    :render-content="renderContent"
                    @node-click="handleDiagramClick"
                    :filter-node-method="filterNode"
                    :expand-on-click-node="true"
                    node-key="Id"
                  ></datablau-tree>
                </div>
                <div slot="reference">
                  <div class="title" :title="diagramPath" style="height: 30px;display: flex;align-items: center;padding-left: 12px;cursor: pointer;position:relative;color: rgba(255,255,255,0.8);">
                    <!-- <img style="margin-right: 4px;flex: 0 0 auto;" :src="diagramImg1" alt=""> -->
                    <span style="margin-right: 4px;flex: 1 1 auto;font-size: 12px;font-weight: normal;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">{{diagramPath}}</span>
                    <i :class='{"el-icon-arrow-down":true,"up":popoverVisible}' style=""></i>
                  </div>
                </div>
              </el-popover>
            </div>
          </el-header>
        </model-graph-edit>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import modelDetail from './modelEdit.js'
import DatablauButton from '@components/basic/button/DatablauButton'
export default modelDetail
</script>
<style scoped lang="scss">
@import 'detail/modelDetail';
  .entitiy-list-wrapper {
    position: absolute;
    top: 55px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-x: hidden;
    overflow-y: auto;
  }
  /deep/ .grey-tree.datablau-tree .el-tree-node.is-current > .el-tree-node__content .operate-list {
    display: inline-block;
  }
  /deep/ .el-icon-more {
    width: 24px;
    font-size: 14px;
    color: #999;
  }
  /deep/ .el-icon-more:hover {
    color: #409EFF;
  }
  .apply-img {
    position: relative;
    top: 2px;
    margin-right: 3px;
  }
  /deep/.datablau-checkbox2 {
    display: inline-block;
    margin-left: 5px;
    .el-checkbox {
      margin-right: 0;
      .el-checkbox__inner {
        border-color: #999;
      }
      &:hover .el-checkbox__inner {
        border-color: #409EFF;
      }
    }
  }
  .model-box {
    top: 84px;
    &.fullscreen {
      top: 54px;
    }
  }
  .bottom-line {
    width: 240px;
    height: 1px;
    background-color: #dddddd;
  }
  .search-box {
    height: 28px;
    font-size: 12px;
    font-weight: 400;
    text-align: left;
    color: #555555;
    img {
      margin-left: 68px;
      cursor: pointer;
    }
    .close {
      margin-left: 6px;
      width: 20px;
      height: 20px;
      font-size: 12px;
      line-height: 20px;
      padding-left: 4px;
      color:  #999999;
      cursor: pointer;
    }
    .img-box {
      position: relative;
      top: 2px;
      margin-left: 4px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #999999;
      &:hover {
        color: #409eff;
      }
    }
  }
  .top-title-box {
    height: 30px;
    background: #455c7c;
    position: relative;
    .diagram-tree-wrapper {
      height: 30px;
      display: inline-block;
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
    }
    .model-header {
      margin-left: 10px;
      height: 30px;
      color: rgba(255,255,255,0.8);
      width: 40%;
      .model-name {
        font-size: 12px;
        font-weight: 400;
        &> span {
          max-width: 40%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
    .infomes-box {
      float: right;
      display: flex;
      height: 100%;
      align-items: center;
      .el-button {
        margin: 0 10px;
        width: 70px;
        height: 20px;
        background: rgba(255,255,255,0.10);
        border-radius: 12px;
        border: unset;
        padding: 0;
        color: rgba(255,255,255,0.8);
      }
      .user-info {
        display: flex;
        align-items: center;
        color: rgba(255,255,255,0.8);
        .iconfont {
          margin-right: 5px;
        }
      }
    }
  }
  .el-icon-arrow-down {
    transform: rotate(-90deg);
    transition: all 0.2s linear;
    &.up {
      transform: rotate(0deg);
    }
  }
  .tree-area {
    border-right: 1px solid rgba(0, 0, 0, 0.1);
  }
  .operate-list, /deep/ .operate-list {
    display: none;
    width: 24px !important;
    height: 30px;
    position: relative;
    right: 5px;
    span {
      cursor: pointer;
      color: #999;
      font-size: 14px;
    }
  }
  /deep/ .list-item-wrapper, .list-item-wrapper {
    position: relative;
    padding-left: 30px;
    line-height: 30px;
    cursor: pointer;
    align-items: center;
    display: flex;
    font-size: 12px;
    color: #555;
    &.unactive {
      color: #999;
    }
    &.active {
      background-color: rgba(64,158,255,0.10);
      .operate-list {
        display: inline-block;
      }
      .node-name {
        color: #409EFF;
      }
    }
    &:hover {
      // background-color: rgba(64,158,255,0.10);
      .operate-list {
        // flex: 0 0 auto;
        // position: relative; //与左边菜单冲突
        // left: 40px;
        display: inline-block;
      }
    }
    & > span.node-name {
      // flex: 1 1 auto;
      // width: 155px;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #555;
    }
    img {
      flex: 0 0 auto;
      position: relative;
      top: 2px;
      width: 14px;
      margin-right: 8px;
    }
  }
  .tableDetail,
  .relationDetail,
  .commentDetail,
  .viewDetail,
  .themeDetail{
    &.list-item-wrapper {
      &:hover {
        background-color: rgba(64,158,255,0.10);
      }
    }
  }
  /deep/ .grey-tree .el-icon-caret-right:not(.is-leaf):before {
    content: "\e6e0";
    font-family: unset;
  }
  .count-hint {
    margin-left: 6px;
    padding: 2px 8px;
    min-width: 34px;
    background:  rgba(119,119,119,0.10);
    border-radius: 10px;
    font-size: 12px;
    color: #555;
    & > span {
      color: #539FFD;
    }
  }
  .model-name {
    display: inline-block;
    vertical-align: top;
    font-weight: bold;
    font-size: 14px;
    & > span {
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: middle;
    }
  }
  .iconfont {
    position: relative;
    display: inline-block;
    vertical-align: middle;
    &:before {
       font-size: 14px;
    }
    &:after {
      content: '';
      top: -6px;
      left: -6px;
      right: -6px;
      bottom: -6px;
      position: absolute;
    }
  }
  .diagram-tree-wrapper /deep/ .el-tree-node__content {
    height: 30px;
  }
  // .diagram-tree-wrapper /deep/ span.el-tree-node__expand-icon.is-leaf {
  //   visibility: unset;
  // }
  .diagram-tree-wrapper /deep/ .el-popover {
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 90vh;
    & > .popper__arrow {
      display: none;
    }
    margin-top: 0!important;
    padding: 0;
  }
  .left-panel-wrapper {
    top: 86px;
    .title {
      font-size: 12px;
      color: #555;
    }
    .no-data {
      font-size: 12px;
      color: #999;
      text-align: center;
    }
    &.fullscreen {
      top: 54px;
    }
    /deep/ .el-collapse-item__header:hover {
      .el-collapse-item__arrow:before {
        color: #539ffd;
      }
      .title {
        color: #539ffd;
      }
    }
    .el-collapse-item {
      position: relative;
      /deep/.el-collapse-item__arrow {
            position: absolute;
            left: 14px;
            top: 9px;
            color: #999;
      }
      /deep/.el-icon-plus {
        padding-top: 5px;
        display: none;
        &::before {
          content:'';
          position: absolute;
          top: 7px;
          right: 7px;
          width: 24px;
          height: 24px;
          background: url('../../assets/images/mxgraphEdit/new-icon/add.svg') no-repeat;
        }
        &:hover::before {
          background: url('../../assets/images/mxgraphEdit/new-icon/add1.svg') no-repeat;
        }
        &.show {
          display: inline-block;
        }
      }
      /deep/ .el-collapse-item__header {
        border-bottom: unset;
        height: 30px;
        line-height: 30px;
        padding-left: 30px;
        &:hover {
          background-color: rgba(64,158,255,0.10);
        }
        &.active {
          background-color: rgba(64,158,255,0.10);
        }
      }
      /deep/ .el-collapse-item__wrap {
        border-bottom: unset;
        // position: relative;
        // left: -32px;
        // width: calc(100% + 32px);
      }
    }
    /deep/ .el-collapse-item__header {
      &:hover {
          .el-icon-plus {
             display: inline;
           }
        }
      &.active {
        .el-icon-plus {
          display: inline;
        }
      }
    }
    .el-radio-group {
      width: 30px;
      position: absolute;
      top: 0;
      left: 0;
      /deep/ .el-radio-button__inner {
        color: #555 !important;
        border: 1px solid #dddddd;
        width: 30px;
        padding: 1px;
        height: 98px;
        text-align: center;
        border-radius: 0;
        white-space: normal;
        line-height: 20px;
        border-right: none;
      }
      /deep/.el-radio-button.is-focus .el-radio-button__inner {
        color: #fff !important;
        border-color:#409EFF;
        background-color: #409EFF !important;
      }
      /deep/.el-radio-button__orig-radio:checked+.el-radio-button__inner {
        color: #fff !important;
        border-color:#409EFF;
        background-color: #409EFF !important;
      }
    }
    /deep/ .el-tooltip.node-name {
      display: inline-block;
      flex: unset;
      width: 155px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: middle;
    }
  }
</style>
<style lang="scss">
  .icon-delete.disabled {
    & + .label {
      color: #C0C4CC!important;
    }
    color: #C0C4CC;
  }
  .el-color-dropdown__value {
    width: 180px;
  }
  .el-popper .popper__arrow, .el-popper .popper__arrow::after {
    display: none;
  }
  .el-popover {
    min-width: unset;
  }
  #context-menu-dam {
    &.er-diagram {
      width: 80px;
      padding:6px 0;
      .arrow {
        display: none;
      }
      .label {
        color: #555;
      }
      .context-option {
        min-width: 40px;
        padding-left: 10px;
        background-color: #fff;
         &:hover {
          background: rgba(24, 144, 255, 0.1);
           color: #409EFF;
          .label {
            color: #409EFF;
          }
      }
     }
    }
  }
  .el-message-box__btns {
    width: 100%;
  }
  .el-collapse {
    border-top:none;
    border-bottom: none;
  }
  .el-collapse-item__content {
    padding-bottom:0;
  }
    .modeEdit-more-itme-box {
      padding-left: 10px;
      display: block!important;
      cursor: pointer;
      width: 70px;
      height: 30px;
      color: #555555;
      line-height: 30px;
      font-size: 12px;
      &:hover {
        background: rgba(24, 144, 255, 0.1);
        color: #539FFD;
        &.iconfont::before {
          color: #539FFD;
        }
      }
      &:before {
        margin-right: 6px;
      }
    }
    .mod-pop {
      transform: translateY(20px);
      padding: 6px 0px;
    }
</style>
