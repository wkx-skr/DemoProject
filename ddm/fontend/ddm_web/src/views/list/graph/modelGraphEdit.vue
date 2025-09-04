<template>
  <div>
    <div v-if="editorType === 'model'" class="citic-card-tabs new-style">
      <check-in-version
        :dialog-visible="checkInVersionDialogVisible"
        @close="checkInVersionDialogVisible=false"
        @save="save"
      ></check-in-version>
      <datablau-dialog
        title="UDP设置详情"
        append-to-body
        height="600px"
        width="1000px"
        close-on-click-modal
        :visible.sync="udpSettingVisible">
        <udp
          v-if="dataByType.udp"
          :Changes="Changes"
          :key="udpKey"
          :dataByType="dataByType"
          :LayerEdit="LayerEdit"
          :graph="graph"
          @closeDialog="udpSettingVisible = false"
        ></udp>
      </datablau-dialog>
      <el-dialog
        width="240"
        title="视图详情"
        append-to-body
        close-on-click-modal
        :visible.sync="viewDialog.visible"
      >
        <el-table
          class="datablau-table"
          :show-header="false"
          :data="[{key: '名称', value: viewDialog.data.Name}, {key: '定义', value: viewDialog.data.Definition},{key: 'SQL', value: viewDialog.data.SQL}]">
          <el-table-column prop="key" :width="60"></el-table-column>
          <el-table-column prop="value">
            <template slot-scope="scope">
              <div v-html="scope.row.value"></div>
            </template>
          </el-table-column>
        </el-table>
        <el-button style="margin-top:1em;" size="small" @click="viewDialog.visible = false">关闭</el-button>
      </el-dialog>
      <el-dialog
        :title="'编辑表：'+ tableDialogDataShow.properties.Name"
        :visible.sync="tableDialog"
        width="600px"
        append-to-body>
        <div class="table-column-wrapper">
          <span>表名</span>
          <el-input size="mini" v-model="tableDialogDataShow.properties.Name"></el-input>
        </div>
        <h2 style="margin-top: 10px;font-size: 15px;">字段</h2>
        <ul>
          <li :key="item.properties.Id" v-for="(item, index) in tableDialogDataShow.children">
            <div class="table-column-wrapper" v-if="item.objectClass === 'Datablau.LDM.EntityAttribute'">
              <span>名称</span><el-input size="mini" v-model="item.properties.Name"></el-input>
              <span>类型</span><el-autocomplete
              size="mini"
              clearable
              v-model="item.properties.DataType"
              :fetch-suggestions="queryDataType"
              :disabled="limitedDsApply && limitedDsApplyConfig.rColDt"
              @click.native="limitedDsApplyMessage(limitedDsApply && limitedDsApplyConfig.rColDt)"
            >
              <template slot-scope="{ item }">
                <div @click.stop v-if="item.type" style="cursor:initial;color:#aaaaaa;margin-left:20px;">{{item.value}}</div>
                <span v-else style="margin-left:2em;">{{item.value}}</span>
              </template>
            </el-autocomplete>
              <i @click="addColumn(index)" class="icon el-icon-plus"></i>
              <i @click="deleteColumn(index)" class="icon el-icon-minus"></i>
            </div>
          </li>
        </ul>
        <div slot="footer">
          <el-button type="primary" @click="editTableConfirm" size="mini">确定</el-button>
          <el-button @click="tableDialog = false" size="mini">取消</el-button>
        </div>
      </el-dialog>
      <el-dialog
        :visible.sync="edgeDialog"
        width="650px"
        custom-class="er-modify-dialog-wrapper col-dialog"
        :class="isFullScreen?'full-screen': ''"
        append-to-body
        :modal="false"
        :before-close="closeEdgeDialog">
        <edge-details
          ref="edgeDetailsEdit"
          :isLogicalModel="isLogicalModel"
          :isDesignModel="isDesignModel"
          :endCardinalityType="endCardinalityType"
          :cellData="edgeDialogData"
          :key="edgeDialogKey"
          :data-by-type="dataByType"
          :getTableHTMLFunction="getTableHTMLFunction"
          :deliverNum="deliverNum"
          :LayerEdit="LayerEdit"
          :Changes="Changes"
          :pathIds="pathIds"
          :isCircle="isCircle"
          :createRelation="createRelation"
          :createDeepRelation="createDeepRelation"
          :currentEdgeType="currentEdgeType"
          :startIdToEndIds="startIdToEndIds"
          :calculateStartIdToEndIds="calculateStartIdToEndIds"
          :currentStyleRelatedShapeTemplate="currentStyleRelatedShapeTemplate"
          :formatThemeTemplateData="formatThemeTemplateData"
          :currentId="currentId"
          v-if="graph && edgeDialogData && (edgeDialogData.OwneeRef || edgeDialogData.isCreated)"
          :graph="graph">
        </edge-details>
      </el-dialog>
      <el-dialog
        :visible.sync="createEdgeDialog"
        width="50vw"
        custom-class="er-modify-dialog-wrapper"
        append-to-body
        :modal="false"
        :before-close="closeEdgeDialog">
        <create-edge-details
          ref="createEdgeDetailsEdit"
          :endCardinalityType="endCardinalityType"
          :cellData="edgeDialogData"
          :key="edgeDialogKey"
          :data-by-type="dataByType"
          :getTableHTMLFunction="getTableHTMLFunction"
          :deliverNum="deliverNum"
          :LayerEdit="LayerEdit"
          :Changes="Changes"
          :pathIds="pathIds"
          :isCircle="isCircle"
          :createRelation="createRelation"
          :createDeepRelation="createDeepRelation"
          :currentEdgeType="currentEdgeType"
          :startIdToEndIds="startIdToEndIds"
          :calculateStartIdToEndIds="calculateStartIdToEndIds"
          v-if="graph && edgeDialogData && (edgeDialogData.OwneeRef || edgeDialogData.isCreated)"
          :graph="graph">
        </create-edge-details>
        <!--<div slot="footer">
          <el-button type="primary" @click="editEdgeConfirm" size="mini">确定</el-button>
          <el-button @click="edgeDialog = false" size="mini">取消</el-button>
        </div>-->
      </el-dialog>
      <el-dialog
        :visible.sync="subtypeDialog"
        width="650px"
        custom-class="er-modify-dialog-wrapper"
        :class="isFullScreen?'full-screen': ''"
        append-to-body
        :modal="false"
        :before-close="closeSubtypeDialog">
        <subtype-detail
          ref="subtypeDetailEdit"
          :key="subtypeDialogKey"
          :currentId="currentId"
          :formatThemeTemplateData="formatThemeTemplateData"
          :currentStyleRelatedShapeTemplate="currentStyleRelatedShapeTemplate"
          :data-by-type="dataByType"
          :subtypeData="subtypeDialogData"
          :cellData="subtypeCellData"
          :getTableHTMLFunction="getTableHTMLFunction"
          :deliverNum="deliverNum"
          :LayerEdit="LayerEdit"
          :Changes="Changes"
          :graph="graph"
          v-if="graph && subtypeCellData">
        </subtype-detail>
      </el-dialog>
      <el-dialog
        class="checkin-version-wrapper"
        title="确认删除"
        :visible.sync="secondConfirm"
        width="370px"
        append-to-body
        :modal="false">
        <div class="el-message-box__status el-icon-warning"></div>
        <div class="el-message-box__message"><p>所选择的对象将被删除，请确认您想在当前主题中去除， 还是彻底在模型中删除？</p></div>
        <div slot="footer">
          <el-button @click="deleteInThemeConfirm" size="mini">当前主题</el-button>
          <el-button @click="deleteInRealConfirm" size="mini">永久删除</el-button>
          <el-button @click="cancelDelete" size="mini">取消</el-button>
        </div>
      </el-dialog>
      <el-dialog
        class="checkin-version-wrapper"
        title="提示"
        :visible.sync="quitSecondConfirm"
        width="370px"
        append-to-body>
        <div class="el-message-box__status el-icon-warning"></div>
        <div class="el-message-box__message"><p>模型[{{currentModel.Name}}]已经发生变更，是否保存模型？</p></div>
        <div slot="footer">
          <datablau-button type="important" @click="saveBeforeQuit" size="mini">保存</datablau-button>
          <datablau-button @click="immediateQuit" size="mini">否</datablau-button>
          <datablau-button @click="cancelQuit" size="mini">取消</datablau-button>
        </div>
      </el-dialog>
      <el-dialog
        @open='handleThemeSettingOpen'
        :visible.sync="themeDialog"
        width="950px"
        custom-class="er-modify-dialog-wrapper col-dialog style-editor-wrapper"
        :class="isFullScreen?'full-screen': ''"
        append-to-body
        :modal="false"
        :before-close="closeThemeDialog">
        <div slot="title" class="header-wrapper">
          <img style="margin-right: 5px;vertical-align: text-bottom;margin-left: 22px;position: relative;top: 1px;" :src="themeUsedImg" width="18" />
          <h2 style="padding-left: 0">样式编辑器：<datablau-input style="width: 150px;display: inline-block;" v-model="formatThemeDataCopy.Name"></datablau-input></h2>
        </div>
        <datablau-tabs style="position: relative;top: -15px;" v-model="activeThemeTab">
          <el-tab-pane label="表/视图" name="table"></el-tab-pane>
          <el-tab-pane label="字段" name="column"></el-tab-pane>
          <el-tab-pane label="文本" name="comment"></el-tab-pane>
          <el-tab-pane label="关系" name="relation"></el-tab-pane>
          <el-tab-pane label="图框" name="figure"></el-tab-pane>
          <el-tab-pane label="业务对象" name="businessobject"></el-tab-pane>
        </datablau-tabs>
        <ul style="position: relative;top: -20px;">
          <li class="set-tab" v-if="activeThemeTab === 'table'">
            <div class="set-item">
              <!-- <h2 class="set-title">表</h2> -->
              <ul class="set-content">
                <li class="set-line">
                  <!-- <h3 class="left">背景颜色</h3> -->
                  <div class="right style-box">
                    <el-color-picker  show-alpha v-model="formatThemeDataCopy.EntityBodyBackgroundColor" size="mini"></el-color-picker>
                    <span style="width:72px" class="label-disc middle-y">背景颜色</span>
                    <opacity-component class="middle-y" :rgba.sync="formatThemeDataCopy.EntityBodyBackgroundColor"></opacity-component>
                  </div>
                </li>
                <!-- <li class="set-line">
                  <h3 class="left">阴影大小</h3>
                  <div class="right">
                    width: <el-input-number :min="1" size="mini" v-model="formatThemeDataCopy.EntityShadowSize.width" style="width: 100px"></el-input-number>
                    height: <el-input-number :min="1" size="mini" v-model="formatThemeDataCopy.EntityShadowSize.height" style="width: 100px"></el-input-number>
                  </div>
                </li> -->
                <li class="set-line">
                  <!-- <h3 class="left">阴影颜色</h3> -->
                  <div class="right style-box">
                    <el-color-picker  show-alpha v-model="formatThemeDataCopy.EntityShadowColor" size="mini"></el-color-picker>
                    <span style="width:72px" class="label-disc middle-y">阴影颜色</span>
                    <opacity-component class="middle-y" :rgba.sync="formatThemeDataCopy.EntityShadowColor"></opacity-component>
                    <span style="width:48px;text-align:right" class="label-disc middle-y">width</span>
                    <el-input-number :min="0" size="mini" v-model="formatThemeDataCopy.EntityShadowSize.width" style="margin-right:20px;"></el-input-number>
                    height<el-input-number style="margin-left: 6px;" :min="0" size="mini" v-model="formatThemeDataCopy.EntityShadowSize.height"></el-input-number>
                  </div>
                </li>
              </ul>
            </div>
            <div class="set-item">
              <!-- <h2 class="set-title">表边框</h2> -->
              <ul class="set-content">
                <!-- <li class="set-line">
                  <h3 class="left">边框宽度</h3>
                  <div class="right"><el-input-number :min="1" v-model="formatThemeDataCopy.EntityBorderWidth" size="mini"></el-input-number></div>
                </li>
                <li class="set-line">
                  <h3 class="left">边框虚线</h3>
                  <div class="right" style="text-align: center;">
                    <el-checkbox size="mini" v-model="formatThemeDataCopy.IsEntityBorderDashed"></el-checkbox>
                    <el-select size="mini" v-model="formatThemeDataCopy.IsEntityBorderDashed">
                      <el-option
                        label="- - - - -"
                        :value="true">
                      </el-option>
                      <el-option
                        label="———"
                        :value="false">
                      </el-option>
                    </el-select>

                  </div>
                </li> -->
                <li class="set-line">
                  <!-- <h3 class="left">边框颜色</h3> -->
                  <div class="right style-box">
                    <el-color-picker  show-alpha v-model="formatThemeDataCopy.EntityBorderColor" size="mini"></el-color-picker>
                    <span style="width:72px" class="label-disc middle-y">边框颜色</span>
                    <opacity-component class="middle-y" :rgba.sync="formatThemeDataCopy.EntityBorderColor"></opacity-component>
                    <span style="text-align:right" class="label-disc middle-y">边框大小</span>
                    <el-input-number :min="1" v-model="formatThemeDataCopy.EntityBorderWidth" size="mini"></el-input-number>
                    <el-select style="margin-right:5px" size="mini" v-model="formatThemeDataCopy.IsEntityBorderDashed">
                      <el-option
                        label="- - - - -"
                        :value="true">
                      </el-option>
                      <el-option
                        label="———"
                        :value="false">
                      </el-option>
                    </el-select>
                    <span style="margin-left: 20px" class="label-disc middle-y">圆角弧度</span>
                    <el-input-number :min="0" :max="20" v-model="formatThemeDataCopy.EntityRoundingSize" size="mini"></el-input-number>
                  </div>
                </li>
                <!-- <li class="set-line">
                  <h3 class="left">圆角弧度</h3>
                  <div class="right"><el-input-number :min="1" v-model="formatThemeDataCopy.EntityRoundingSize" size="mini"></el-input-number></div>
                </li> -->
              </ul>
            </div>
            <div class="set-item">
              <!-- <h2 class="set-title">表头</h2> -->
              <ul class="set-content">
                <li class="set-line">
                  <!-- <h3 class="left">背景颜色</h3> -->
                  <div class="right style-box">
                    <el-color-picker  show-alpha v-model="formatThemeDataCopy.EntityHeaderBackgroundColor" size="mini"></el-color-picker>
                    <span style="width:72px" class="label-disc middle-y">表头背景</span>
                    <opacity-component class="middle-y" :rgba.sync="formatThemeDataCopy.EntityHeaderBackgroundColor"></opacity-component>
                  </div>
                </li>
                <!-- <li class="set-line">
                  <h3 class="left">文本对齐</h3>
                  <div class="right">
                    <el-select size="mini" style="width: 130px;" v-model="formatThemeDataCopy.EntityHeaderTextAlignment" placeholder="请选择">
                      <el-option :value="item.value" :key="item.value" :label="item.label" v-for="item in textAreaPosition"></el-option>
                    </el-select>
                  </div>
                </li> -->
                <li class="set-line">
                  <!-- <h3 class="left">文本颜色</h3> -->
                  <div class="right style-box">
                    <el-color-picker  show-alpha v-model="formatThemeDataCopy.EntityHeaderTextColor" size="mini"></el-color-picker>
                    <span style="width:72px" class="label-disc middle-y">表头文本颜色</span>
                    <opacity-component class="middle-y" :rgba.sync="formatThemeDataCopy.EntityHeaderTextColor"></opacity-component>
                    <span style="text-align:right" class="label-disc middle-y">表头字号</span>
                    <el-input-number :min="1"  v-model="formatThemeDataCopy.EntityHeaderTextFontSize" size="mini"></el-input-number>
                    <!--<el-input style="margin-right:5px" v-model="formatThemeDataCopy.EntityHeaderTextFontFamily" size="mini"></el-input>-->
                    <span style="margin-left: 20px;" class="label-disc middle-y">字体</span>
                    <el-select style="margin-right:5px" filterable  size="mini" v-model="formatThemeDataCopy.EntityHeaderTextFontFamily" placeholder="请选择">
                      <el-option :value="item" :key="item" :label="item" v-for="item in fontFamily"></el-option>
                    </el-select>
                    <span style="margin-left: 20px;" class="label-disc middle-y">文本对齐</span>
                    <el-select size="mini" v-model="formatThemeDataCopy.EntityHeaderTextAlignment" placeholder="请选择">
                      <el-option :value="item.value" :key="item.value" :label="item.label" v-for="item in textAreaPosition"></el-option>
                    </el-select>
                    <span class="label-disc middle-y" style="margin-left:20px">字体设置</span>
                    <!-- <el-select style="margin-right:5px"  size="mini" v-model="formatThemeDataCopy.EntityHeaderTextFontBoldItalic" placeholder="请选择">
                        <el-option :value="item.value" :key="item.value" :label="item.label" v-for="item in fontStyle"></el-option>
                    </el-select> -->
                    <!-- <el-radio-group v-model="formatThemeDataCopy.EntityHeaderTextFontBoldItalic">
                        <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="常规" placement="bottom">
                          <el-radio-button  label="">R</el-radio-button>
                        </el-tooltip>
                        <el-tooltip  :open-delay="900" :visible-arrow='false'  effect="dark" content="斜体" placement="bottom">
                          <el-radio-button  label="Italic"  style="font-style:italic">I</el-radio-button>
                        </el-tooltip>
                        <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="加粗" placement="bottom">
                          <el-radio-button class="bold"  label="Bold">B</el-radio-button>
                        </el-tooltip>
                        <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="加粗斜体" placement="bottom">
                          <el-radio-button   label="BoldItalic">BI</el-radio-button>
                        </el-tooltip>
                    </el-radio-group> -->
                    <el-checkbox-group @change="handleStyleListChange2($event,formatThemeDataCopy,'EntityHeaderTextFontBoldItalic')" v-model="styleSetting.checkList" >
                      <el-checkbox-button class="bold" label="Bold">B</el-checkbox-button>
                      <el-checkbox-button label="Italic" style="font-style:italic">I</el-checkbox-button>
                    </el-checkbox-group>
                    <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="下划线" placement="bottom">
                      <el-checkbox-button class="underline"  size="mini" v-model="formatThemeDataCopy.EntityHeaderTextFontUnderLine">U</el-checkbox-button>
                    </el-tooltip>
                    <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="删除线" placement="bottom">
                      <el-checkbox-button class="line-through"  size="mini" v-model="formatThemeDataCopy.EntityHeaderTextFontLineThrough">D</el-checkbox-button>
                    </el-tooltip>
                  </div>
                </li>
                <!-- <li class="set-line">
                  <h3 class="left" style="line-height: 70px;">文本字体</h3>
                  <div class="right" style="height: 70px;">
                    <div>
                      字体：<el-input style="width: 120px;" v-model="formatThemeDataCopy.EntityHeaderTextFontFamily" size="mini"></el-input>
                      字形：<el-select style="width: 120px;" size="mini" v-model="formatThemeDataCopy.EntityHeaderTextFontBoldItalic" placeholder="请选择">
                        <el-option :value="item.value" :key="item.value" :label="item.label" v-for="item in fontStyle"></el-option>
                      </el-select>
                    </div>
                    <div>
                      大小: <el-input-number :min="1" style="width: 100px;" v-model="formatThemeDataCopy.EntityHeaderTextFontSize" size="mini"></el-input-number>
                      <el-checkbox style="margin: 6px 5px 0;" size="mini" v-model="formatThemeDataCopy.EntityHeaderTextFontUnderLine">下划线：</el-checkbox>
                      <el-checkbox style="margin-top: 6px;" size="mini" v-model="formatThemeDataCopy.EntityHeaderTextFontLineThrough">删除线：</el-checkbox>
                    </div>
                  </div>
                </li> -->
                <li class="set-line">
                  <!-- <h3 class="left">选中时颜色</h3> -->
                  <div class="right style-box">
                    <el-color-picker  show-alpha v-model="formatThemeDataCopy.EntityHeaderSelectedColor" size="mini"></el-color-picker>
                    <span style="width:72px" class="label-disc middle-y">选中时颜色</span>
                    <opacity-component class="middle-y" :rgba.sync="formatThemeDataCopy.EntityHeaderSelectedColor"></opacity-component>
                  </div>
                </li>
              </ul>
            </div>
          </li>
          <li class="set-tab" v-if="activeThemeTab === 'column'">
            <div class="set-item">
              <h2 class="set-title">字段</h2>
              <ul class="set-content">
                <li class="set-line">
                  <!-- <h3 class="left">文本颜色</h3> -->
                  <div class="right style-box">
                    <el-color-picker show-alpha v-model="formatThemeDataCopy.AttributeTextColor" size="mini"></el-color-picker>
                    <span class="label-disc middle-y">文本颜色</span>
                    <opacity-component class="middle-y" :rgba.sync="formatThemeDataCopy.AttributeTextColor"></opacity-component>
                    <span class="label-disc middle-y">字体大小</span>
                    <el-input-number :min="1" v-model="formatThemeDataCopy.AttributeTextFontSize" size="mini"></el-input-number>
                    <!--<el-input style="margin-right:5px" v-model="formatThemeDataCopy.AttributeTextFontFamily" size="mini"></el-input>-->
                    <span style="margin-left: 20px" class="label-disc middle-y">字体</span>
                    <el-select style="margin-right:5px" filterable  size="mini" v-model="formatThemeDataCopy.AttributeTextFontFamily" placeholder="请选择">
                      <el-option :value="item" :key="item" :label="item" v-for="item in fontFamily"></el-option>
                    </el-select>
                    <span class="label-disc middle-y" style="margin-left:20px">字体设置</span>
                    <!-- <el-select style="margin-right:5px"  size="mini" v-model="formatThemeDataCopy.AttributeTextFontBoldItalic" placeholder="请选择">
                      <el-option :value="item.value" :key="item.value" :label="item.label" v-for="item in fontStyle"></el-option>
                    </el-select> -->
                    <!-- <el-radio-group v-model="formatThemeDataCopy.AttributeTextFontBoldItalic">
                        <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="常规" placement="bottom">
                          <el-radio-button  label="">R</el-radio-button>
                        </el-tooltip>
                        <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="斜体" placement="bottom">
                          <el-radio-button  label="Italic"  style="font-style:italic">I</el-radio-button>
                        </el-tooltip>
                        <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="加粗" placement="bottom">
                          <el-radio-button class="bold"  label="Bold">B</el-radio-button>
                        </el-tooltip>
                        <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="加粗斜体" placement="bottom">
                          <el-radio-button   label="BoldItalic">BI</el-radio-button>
                        </el-tooltip>
                    </el-radio-group> -->
                    <el-checkbox-group @change="handleStyleListChange2($event,formatThemeDataCopy,'AttributeTextFontBoldItalic')" v-model="styleSetting.checkList" >
                      <el-checkbox-button class="bold" label="Bold">B</el-checkbox-button>
                      <el-checkbox-button label="Italic" style="font-style:italic">I</el-checkbox-button>
                    </el-checkbox-group>
                    <!-- <el-checkbox style="margin: 6px 5px 0;" size="mini" v-model="formatThemeDataCopy.AttributeTextFontUnderLine">下划线：</el-checkbox> -->
                    <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="下划线" placement="bottom">
                      <el-checkbox-button class="underline"  size="mini" v-model="formatThemeDataCopy.AttributeTextFontUnderLine">U</el-checkbox-button>
                    </el-tooltip>
                    <!-- <el-checkbox style="margin-top: 6px;" size="mini" v-model="formatThemeDataCopy.AttributeTextFontLineThrough">删除线：</el-checkbox> -->
                    <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="删除线" placement="bottom">
                      <el-checkbox-button class="line-through"  size="mini" v-model="formatThemeDataCopy.AttributeTextFontLineThrough">D</el-checkbox-button>
                    </el-tooltip>
                  </div>
                </li>
                <!-- <li class="set-line">
                  <h3 class="left" style="line-height: 70px;">文本字体</h3>
                  <div class="right" style="height: 70px;">
                    <div>
                      字体：<el-input style="width: 120px;" v-model="formatThemeDataCopy.AttributeTextFontFamily" size="mini"></el-input>
                      字形：<el-select style="width: 120px;" size="mini" v-model="formatThemeDataCopy.AttributeTextFontBoldItalic" placeholder="请选择">
                      <el-option :value="item.value" :key="item.value" :label="item.label" v-for="item in fontStyle"></el-option>
                    </el-select>
                    </div>
                    <div>
                      大小: <el-input-number :min="1" style="width: 100px;" v-model="formatThemeDataCopy.AttributeTextFontSize" size="mini"></el-input-number>
                      <el-checkbox style="margin: 6px 5px 0;" size="mini" v-model="formatThemeDataCopy.AttributeTextFontUnderLine">下划线：</el-checkbox>
                      <el-checkbox style="margin-top: 6px;" size="mini" v-model="formatThemeDataCopy.AttributeTextFontLineThrough">删除线：</el-checkbox>
                    </div>
                  </div>
                </li> -->
              </ul>
            </div>
          </li>
          <li class="set-tab" v-if="activeThemeTab === 'comment'">
            <div class="set-item" :key="1">
              <h2 class="set-title">文本</h2>
              <ul class="set-content">
                <li class="set-line">
                  <!-- <h3 class="left">背景颜色</h3> -->
                  <div class="right style-box">
                    <el-color-picker show-alpha v-model="formatThemeDataCopy.CommentBackgroundColor" size="mini"></el-color-picker>
                    <span class="label-disc middle-y">背景颜色</span>
                    <opacity-component class="middle-y" :rgba.sync="formatThemeDataCopy.CommentBackgroundColor"></opacity-component>
                  </div>
                </li>
                <!-- <li class="set-line">
                  <h3 class="left">阴影大小</h3>
                  <div class="right">
                    width: <el-input-number :min="1" size="mini" v-model="formatThemeDataCopy.CommentShadowSize.width" style="width: 100px"></el-input-number>
                    height: <el-input-number :min="1" size="mini" v-model="formatThemeDataCopy.CommentShadowSize.height" style="width: 100px"></el-input-number>
                  </div>
                </li> -->
                <li class="set-line">
                  <!-- <h3 class="left">阴影颜色</h3> -->
                  <div class="right style-box">
                    <el-color-picker show-alpha v-model="formatThemeDataCopy.CommentShadowColor" size="mini"></el-color-picker>
                    <span class="label-disc middle-y">阴影颜色</span>
                    <opacity-component class="middle-y" :rgba.sync="formatThemeDataCopy.CommentShadowColor"></opacity-component>
                    <span style="width:48px;text-align:right" class="label-disc middle-y">width</span>
                    <el-input-number :min="0" size="mini" v-model="formatThemeDataCopy.CommentShadowSize.width" style="width: 100px;margin-right: 20px;"></el-input-number>
                    <span style="width:48px;text-align:right" class="label-disc middle-y">height</span>
                    <el-input-number :min="0" size="mini" v-model="formatThemeDataCopy.CommentShadowSize.height" style="width: 100px"></el-input-number>
                  </div>
                </li>
              </ul>
            </div>
            <div class="set-item" :key="2">
              <h2 class="set-title">文本边框</h2>
              <ul class="set-content">
                <!-- <li class="set-line">
                  <h3 class="left">边框宽度</h3>
                  <div class="right"><el-input-number :min="1" v-model="formatThemeDataCopy.CommentBorderWidth" size="mini"></el-input-number></div>
                </li>
                <li class="set-line">
                  <h3 class="left">边框虚线</h3>
                  <div class="right" style="text-align: center;"><el-checkbox size="mini" v-model="formatThemeDataCopy.IsCommentBorderDashed"></el-checkbox></div>
                </li> -->
                <li class="set-line">
                  <!-- <h3 class="left">边框颜色</h3> -->
                  <div class="right style-box">
                    <el-color-picker show-alpha v-model="formatThemeDataCopy.CommentBorderColor" size="mini"></el-color-picker>
                    <span class="label-disc middle-y">边框颜色</span>
                    <opacity-component class="middle-y" :rgba.sync="formatThemeDataCopy.CommentBorderColor"></opacity-component>
                    <span style="text-align:right" class="label-disc middle-y">边框大小</span>
                    <el-input-number :min="0" v-model="formatThemeDataCopy.CommentBorderWidth" size="mini"></el-input-number>
                    <el-select style="margin-right:5px" size="mini" v-model="formatThemeDataCopy.IsCommentBorderDashed">
                      <el-option
                        label="- - - - -"
                        :value="true">
                      </el-option>
                      <el-option
                        label="———"
                        :value="false">
                      </el-option>
                    </el-select>
                  </div>
                </li>
              </ul>
            </div>
            <div class="set-item">
              <h2 class="set-title">文本内容</h2>
              <ul class="set-content">
                <li class="set-line">
                  <!-- <h3 class="left">文本颜色</h3> -->
                  <div class="right style-box">
                    <el-color-picker show-alpha v-model="formatThemeDataCopy.CommentTextColor" size="mini"></el-color-picker>
                    <span class="label-disc middle-y">文本颜色</span>
                    <opacity-component class="middle-y" :rgba.sync="formatThemeDataCopy.CommentTextColor"></opacity-component>
                    <span class="label-disc middle-y">字体大小</span>
                    <el-input-number :min="1" style="width: 100px;" v-model="formatThemeDataCopy.CommentTextFontSize" size="mini"></el-input-number>
                    <span style="margin-left: 20px;" class="label-disc middle-y">字体</span>
                    <el-select style="margin-right:5px" filterable  size="mini" v-model="formatThemeDataCopy.CommentTextFontFamily" placeholder="请选择">
                      <el-option :value="item" :key="item" :label="item" v-for="item in fontFamily"></el-option>
                    </el-select>
                    <span class="label-disc middle-y" style="margin-left:20px">字体设置</span>
                    <!-- <el-select style="margin-right:5px"  size="mini" v-model="formatThemeDataCopy.CommentTextFontBoldItalic" placeholder="请选择">
                      <el-option :value="item.value" :key="item.value" :label="item.label" v-for="item in fontStyle"></el-option>
                    </el-select> -->
                    <!-- <el-radio-group v-model="formatThemeDataCopy.CommentTextFontBoldItalic">
                        <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="常规" placement="bottom">
                          <el-radio-button  label="">R</el-radio-button>
                        </el-tooltip>
                        <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="斜体" placement="bottom">
                          <el-radio-button  label="Italic"  style="font-style:italic">I</el-radio-button>
                        </el-tooltip>
                        <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="加粗" placement="bottom">
                          <el-radio-button class="bold"  label="Bold">B</el-radio-button>
                        </el-tooltip>
                        <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="加粗斜体" placement="bottom">
                          <el-radio-button   label="BoldItalic">BI</el-radio-button>
                        </el-tooltip>
                    </el-radio-group> -->
                    <el-checkbox-group @change="handleStyleListChange2($event,formatThemeDataCopy,'CommentTextFontBoldItalic')" v-model="styleSetting.checkList" >
                      <el-checkbox-button class="bold" label="Bold">B</el-checkbox-button>
                      <el-checkbox-button label="Italic" style="font-style:italic">I</el-checkbox-button>
                    </el-checkbox-group>
                    <!-- <el-checkbox style="margin: 6px 5px 0;" size="mini" v-model="formatThemeDataCopy.CommentTextFontUnderLine">下划线：</el-checkbox> -->
                    <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="下划线" placement="bottom">
                      <el-checkbox-button class="underline"  size="mini" v-model="formatThemeDataCopy.CommentTextFontUnderLine">U</el-checkbox-button>
                    </el-tooltip>
                    <!-- <el-checkbox style="margin-top: 6px;" size="mini" v-model="formatThemeDataCopy.CommentTextFontLineThrough">删除线：</el-checkbox> -->
                    <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="删除线" placement="bottom">
                      <el-checkbox-button class="line-through"  size="mini" v-model="formatThemeDataCopy.CommentTextFontLineThrough">D</el-checkbox-button>
                    </el-tooltip>
                  </div>
                </li>
                <!-- <li class="set-line">
                  <h3 class="left" style="line-height: 70px;">文本字体</h3>
                  <div class="right" style="height: 70px;">
                    <div>
                      字体：<el-input style="width: 120px;" v-model="formatThemeDataCopy.CommentTextFontFamily" size="mini"></el-input>
                      字形：<el-select style="width: 120px;" size="mini" v-model="formatThemeDataCopy.CommentTextFontBoldItalic" placeholder="请选择">
                      <el-option :value="item.value" :key="item.value" :label="item.label" v-for="item in fontStyle"></el-option>
                    </el-select>
                    </div>
                    <div>
                      大小: <el-input-number :min="1" style="width: 100px;" v-model="formatThemeDataCopy.CommentTextFontSize" size="mini"></el-input-number>
                      <el-checkbox style="margin: 6px 5px 0;" size="mini" v-model="formatThemeDataCopy.CommentTextFontUnderLine">下划线：</el-checkbox>
                      <el-checkbox style="margin-top: 6px;" size="mini" v-model="formatThemeDataCopy.CommentTextFontLineThrough">删除线：</el-checkbox>
                    </div>
                  </div>
                </li> -->
              </ul>
            </div>
          </li>
          <li class="set-tab" v-if="activeThemeTab === 'relation'">
            <div class="set-item">
              <h2 class="set-title">关系</h2>
              <ul class="set-content">
                <li class="set-line">
                  <!-- <h3 class="left">文本颜色</h3> -->
                  <div class="right style-box">
                    <el-color-picker show-alpha v-model="formatThemeDataCopy.RelationshipTextColor" size="mini"></el-color-picker>
                    <span class="label-disc middle-y">文本颜色</span>
                    <opacity-component class="middle-y" :rgba.sync="formatThemeDataCopy.RelationshipTextColor"></opacity-component>
                    <span class="label-disc middle-y">字体大小</span>
                    <el-input-number :min="1"  v-model="formatThemeDataCopy.RelationshipTextFontSize" size="mini"></el-input-number>
                    <!--<el-input style="margin-right:5px" v-model="formatThemeDataCopy.RelationshipTextFontFamily" size="mini"></el-input>-->
                    <span style="margin-left: 20px" class="label-disc middle-y">字体</span>
                    <el-select style="margin-right:5px" filterable  size="mini" v-model="formatThemeDataCopy.RelationshipTextFontFamily" placeholder="请选择">
                      <el-option :value="item" :key="item" :label="item" v-for="item in fontFamily"></el-option>
                    </el-select>
                    <span class="label-disc middle-y" style="margin-left:20px">字体设置</span>
                    <!-- <el-select style="margin-right:5px" size="mini" v-model="formatThemeDataCopy.RelationshipTextFontBoldItalic" placeholder="请选择">
                      <el-option :value="item.value" :key="item.value" :label="item.label" v-for="item in fontStyle"></el-option>
                    </el-select> -->
                    <!-- <el-radio-group v-model="formatThemeDataCopy.RelationshipTextFontBoldItalic">
                        <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="常规" placement="bottom">
                          <el-radio-button  label="">R</el-radio-button>
                        </el-tooltip>
                        <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="斜体" placement="bottom">
                          <el-radio-button  label="Italic"  style="font-style:italic">I</el-radio-button>
                        </el-tooltip>
                        <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="加粗" placement="bottom">
                          <el-radio-button class="bold"  label="Bold">B</el-radio-button>
                        </el-tooltip>
                        <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="加粗斜体" placement="bottom">
                          <el-radio-button   label="BoldItalic">BI</el-radio-button>
                        </el-tooltip>
                    </el-radio-group> -->
                    <el-checkbox-group @change="handleStyleListChange2($event,formatThemeDataCopy,'RelationshipTextFontBoldItalic', 'checkList')" v-model="styleSetting.checkList" >
                      <el-checkbox-button class="bold" label="Bold">B</el-checkbox-button>
                      <el-checkbox-button label="Italic" style="font-style:italic">I</el-checkbox-button>
                    </el-checkbox-group>
                  </div>
                </li>
                <!-- <li class="set-line">
                  <h3 class="left" style="line-height: 70px;">文本字体</h3>
                  <div class="right" style="height: 70px;">
                    <div>
                      字体：<el-input style="width: 120px;" v-model="formatThemeDataCopy.RelationshipTextFontFamily" size="mini"></el-input>
                      字形：<el-select style="width: 120px;" size="mini" v-model="formatThemeDataCopy.RelationshipTextFontBoldItalic" placeholder="请选择">
                      <el-option :value="item.value" :key="item.value" :label="item.label" v-for="item in fontStyle"></el-option>
                    </el-select>
                    </div>
                    <div> -->
                <!-- 大小: <el-input-number :min="1" style="width: 100px;" v-model="formatThemeDataCopy.RelationshipTextFontSize" size="mini"></el-input-number> -->
                <!--                    <el-checkbox style="margin: 6px 5px 0;" size="mini" v-model="formatThemeDataCopy.RelationshipTextFontUnderLine">下划线：</el-checkbox>-->
                <!--                    <el-checkbox style="margin-top: 6px;" size="mini" v-model="formatThemeDataCopy.RelationshipTextFontLineThrough">删除线：</el-checkbox>-->
                <!-- </div>
              </div>
            </li> -->
                <!-- <li class="set-line">
                  <h3 class="left">线条宽度</h3>
                  <div class="right"><el-input-number :min="1" v-model="formatThemeDataCopy.RelationshipLineWidth" size="mini"></el-input-number></div>
                </li> -->
                <li class="set-line">
                  <!-- <h3 class="left">线条颜色</h3> -->
                  <div class="right style-box">
                    <el-color-picker show-alpha v-model="formatThemeDataCopy.RelationshipLineColor" size="mini"></el-color-picker>
                    <span class="label-disc middle-y">线条颜色</span>
                    <opacity-component class="middle-y" :rgba.sync="formatThemeDataCopy.RelationshipLineColor"></opacity-component>
                    <span class="label-disc middle-y">线条宽度</span>
                    <el-input-number :min="1" v-model="formatThemeDataCopy.RelationshipLineWidth" size="mini"></el-input-number>
                  </div>
                </li>
              </ul>
            </div>
          </li>
          <li class="set-tab" v-if="activeThemeTab === 'figure'">
            <div class="set-item">
              <h2 class="set-title">图框</h2>
              <ul class="set-content">
                <li class="set-line">
                  <!-- <h3 class="left">背景颜色</h3> -->
                  <div class="right">
                    <el-color-picker show-alpha v-model="formatThemeDataCopy.FigureBackgroundColor" size="mini"></el-color-picker>
                    <span class="label-disc middle-y">背景颜色</span>
                    <opacity-component class="middle-y" :rgba.sync="formatThemeDataCopy.FigureBackgroundColor"></opacity-component>
                  </div>
                </li>
                <!-- <li class="set-line">
                  <h3 class="left">边框宽度</h3>
                  <div class="right"><el-input-number :min="1" v-model="formatThemeDataCopy.FigureBorderWidth" size="mini"></el-input-number></div>
                </li>
                <li class="set-line">
                  <h3 class="left">边框虚线</h3>
                  <div class="right" style="text-align: center;"><el-checkbox size="mini" v-model="formatThemeDataCopy.IsFigureBorderDashed"></el-checkbox></div>
                </li> -->
                <li class="set-line">
                  <!-- <h3 class="left">边框颜色</h3> -->
                  <div class="right style-box">
                    <el-color-picker show-alpha v-model="formatThemeDataCopy.FigureBorderColor" size="mini"></el-color-picker>
                    <span class="label-disc middle-y">边框颜色</span>
                    <opacity-component class="middle-y" :rgba.sync="formatThemeDataCopy.FigureBorderColor"></opacity-component>
                    <span style="width:48px;text-align:right" class="label-disc middle-y">边框宽度</span>
                    <el-input-number style="margin-left: 6px" :min="1" v-model="formatThemeDataCopy.FigureBorderWidth" size="mini"></el-input-number>
                    <el-select style="margin-left:6px" size="mini" v-model="formatThemeDataCopy.IsFigureBorderDashed">
                      <el-option
                        label="- - - - -"
                        :value="true">
                      </el-option>
                      <el-option
                        label="———"
                        :value="false">
                      </el-option>
                    </el-select>
                    <span style="margin-left: 20px;" class="label-disc middle-y">圆角弧度</span>
                    <el-input-number :min="0" v-model="formatThemeDataCopy.FigureRoundingSize" size="mini"></el-input-number>
                  </div>
                </li>
                <!-- <li class="set-line">
                  <h3 class="left">圆角弧度</h3>
                  <div class="right"><el-input-number :min="1" v-model="formatThemeDataCopy.FigureRoundingSize" size="mini"></el-input-number></div>
                </li> -->
              </ul>
            </div>
          </li>
          <li class="set-tab" v-if="activeThemeTab === 'businessobject'">
            <div class="set-item">
              <h2 class="set-title">业务对象</h2>
              <ul class="set-content">
                <li class="set-line">
                  <div class="right">
                    <el-color-picker show-alpha v-model="formatThemeDataCopy.BOBackgroundColor" size="mini"></el-color-picker>
                    <span class="label-disc middle-y">背景颜色</span>
                    <opacity-component class="middle-y" :rgba.sync="formatThemeDataCopy.BOBackgroundColor"></opacity-component>
                  </div>
                </li>
                <li class="set-line">
                  <!-- <h3 class="left">边框颜色</h3> -->
                  <div class="right style-box">
                    <el-color-picker show-alpha v-model="formatThemeDataCopy.BOBorderColor" size="mini"></el-color-picker>
                    <span class="label-disc middle-y">边框颜色</span>
                    <opacity-component class="middle-y" :rgba.sync="formatThemeDataCopy.BOBorderColor"></opacity-component>
                    <span style="width:48px;text-align:right" class="label-disc middle-y">边框宽度</span>
                    <el-input-number :min="1" v-model="formatThemeDataCopy.BOBorderWidth" size="mini"></el-input-number>
                    <el-select style="margin-left:6px" size="mini" v-model="formatThemeDataCopy.IsBOBorderDashed">
                      <el-option
                        label="- - - - -"
                        :value="true">
                      </el-option>
                      <el-option
                        label="———"
                        :value="false">
                      </el-option>
                    </el-select>
                    <span style="margin-left: 20px;" class="label-disc middle-y">圆角弧度</span>
                    <el-input-number :min="0" v-model="formatThemeDataCopy.BORoundingSize" size="mini"></el-input-number>
                  </div>
                </li>
                <li class="set-line">
                  <div class="right style-box">
                    <el-color-picker  show-alpha v-model="formatThemeDataCopy.BOTextColor" size="mini"></el-color-picker>
                    <span class="label-disc middle-y">文本颜色</span>
                    <opacity-component class="middle-y" :rgba.sync="formatThemeDataCopy.BOTextColor"></opacity-component>
                    <span style="text-align:right" class="label-disc middle-y">文本字号</span>
                    <el-input-number :min="1"  v-model="formatThemeDataCopy.BOTextFontSize" size="mini"></el-input-number>
                    <span style="margin-left: 20px;" class="label-disc middle-y">字体</span>
                    <el-select style="margin-right:5px" filterable  size="mini" v-model="formatThemeDataCopy.BOTextFontFamily" placeholder="请选择">
                      <el-option :value="item" :key="item" :label="item" v-for="item in fontFamily"></el-option>
                    </el-select>
                    <span style="margin-left: 20px;" class="label-disc middle-y">文本对齐</span>
                    <el-select size="mini" v-model="formatThemeDataCopy.BOTextAlignment" placeholder="请选择">
                      <el-option :value="item.value" :key="item.value" :label="item.label" v-for="item in textAreaPosition"></el-option>
                    </el-select>
                    <span class="label-disc middle-y" style="margin-left:20px">字体设置</span>
                    <el-checkbox-group @change="handleStyleListChange2($event,formatThemeDataCopy,'BOTextFontBoldItalic', 'boCheckList')" v-model="styleSetting.boCheckList" >
                      <el-checkbox-button class="bold" label="Bold">B</el-checkbox-button>
                      <el-checkbox-button label="Italic" style="font-style:italic">I</el-checkbox-button>
                    </el-checkbox-group>
                    <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="下划线" placement="bottom">
                      <el-checkbox-button class="underline"  size="mini" v-model="formatThemeDataCopy.BOTextFontUnderLine">U</el-checkbox-button>
                    </el-tooltip>
                    <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="删除线" placement="bottom">
                      <el-checkbox-button class="line-through"  size="mini" v-model="formatThemeDataCopy.BOTextFontLineThrough">D</el-checkbox-button>
                    </el-tooltip>
                  </div>
                </li>
              </ul>
            </div>
          </li>
        </ul>
        <!--<div slot="footer">
          <el-button @click="themeConfirm" size="mini">确定</el-button>
          <el-button @click="themeCancel" size="mini">取消</el-button>
        </div>-->
      </el-dialog>
      <el-dialog
        title="样式设置"
        :visible.sync="editStyleDialg"
        width="600px"
        append-to-body>
        <ul class="edit-style-dialog-content-wrapper">
          <li>样式：&nbsp;&nbsp;&nbsp;&nbsp;
            <el-select size="mini" placeholder="请选择" v-model="currentStyleRelatedShapeTemplate.StyleThemeRef">
              <template v-for="themeId in Object.keys(dataByType.theme)">
                <el-option v-if="!dataByType.theme[themeId].properties.deleted" :key="dataByType.theme[themeId].properties.Name" :value="dataByType.theme[themeId].properties.Id" :label="dataByType.theme[themeId].properties.Name" ></el-option>
              </template>
            </el-select>
          </li>
          <li>标题背景：
            <el-color-picker style="vertical-align: middle" show-alpha v-model="currentStyleRelatedShapeTemplate.StyleBackColor2" size="mini"></el-color-picker>
          </li>
          <li>背景颜色：
            <el-color-picker style="vertical-align: middle" show-alpha v-model="currentStyleRelatedShapeTemplate.StyleBackColor" size="mini"></el-color-picker>
          </li>
        </ul>
        <div style="text-align: right;margin-top: 5px;">
          <el-button type="primary" @click="resetStyleConfirm" size="mini">重置</el-button>
        </div>
        <div slot="footer">
          <el-button type="primary" @click="editStyleConfirm" size="mini">确定</el-button>
          <el-button @click="editStyleDialg = false" size="mini">取消</el-button>
        </div>
      </el-dialog>
      <dialog-com
        :visible.sync="editEntityDialog"
        :width="dialogWidth"
        custom-class="er-modify-dialog-wrapper col-dialog"
        :class="isFullScreen?'full-screen': ''"
        append-to-body
        :modal="false"
        :before-close="closeEntityDialog">
        <table-details
          :reNameColumnType="reNameColumnType"
          :editorType="editorType"
          :deliverNum="deliverNum"
          :TypeUniqueIdToColumnDefaultType="TypeUniqueIdToColumnDefaultType"
          :tableDialogKey="tableDialogKey"
          ref="tableDetailsEdit"
          :rawData="entityDialogData"
          :current-model="currentModel"
          :data-by-type="dataByType"
          :isLogicalModel="isLogicalModel"
          :isDesignModel="isDesignModel"
          :getTableHTMLFunction="getTableHTMLFunction"
          :startIdToEndIds="startIdToEndIds"
          :createDeepRelation="createDeepRelation"
          :calculateStartIdToEndIds="calculateStartIdToEndIds"
          :cellDialogData="cellDialogData"
          :currentStyleRelatedShapeTemplate="currentStyleRelatedShapeTemplate"
          :formatThemeTemplateData="formatThemeTemplateData"
          :currentId="currentId"
          :isCassandraOrMongoDB="isCassandraOrMongoDB"
          :isLogical="isLogical"
          :isConceptual="isConceptual"
          :getTableNameNamingMap="getTableNameNamingMap"
          :getColumnNameNamingMap="getColumnNameNamingMap"
          :getIndexNameNamingMap="getIndexNameNamingMap"
          :categoryOrder="categoryOrder"
          :isShowSchema="isShowSchema"
          @changeDialogWidth="changeDialogWidth"
          :LayerEdit="LayerEdit"
          v-if="graph"
          :graph="graph"
          :Changes="Changes"
          @openColumnDialog="openColumnDialog">
        </table-details>
      </dialog-com>
      <el-dialog
        :visible.sync="editViewDialog"
        :width="dialogWidth"
        custom-class="er-modify-dialog-wrapper col-dialog"
        :class="isFullScreen?'full-screen': ''"
        append-to-body
        :modal="false"
        :before-close="closeViewDialog">
        <view-details
          :reNameColumnType="reNameColumnType"
          :editorType="editorType"
          :deliverNum="deliverNum"
          :TypeUniqueIdToColumnDefaultType="TypeUniqueIdToColumnDefaultType"
          ref="viewDetailsEdit"
          :rawData="viewDialogData"
          :isDesignModel="isDesignModel"
          :current-model="currentModel"
          :data-by-type="dataByType"
          :isLogicalModel="isLogicalModel"
          :getViewHTMLFunction="getViewHTMLFunction"
          :cellDialogData="cellDialogData"
          :currentStyleRelatedShapeTemplate="currentStyleRelatedShapeTemplate"
          :formatThemeTemplateData="formatThemeTemplateData"
          :currentId="currentId"
          v-if="graph"
          :graph="graph"
          :Changes="Changes"
          :getTableNameNamingMap="getTableNameNamingMap"
          :getColumnNameNamingMap="getColumnNameNamingMap"
          :getIndexNameNamingMap="getIndexNameNamingMap"
          :categoryOrder="categoryOrder"
          :isShowSchema="isShowSchema"
          @openViewColumnDialog="openViewColumnDialog"
          @changeDialogWidth="changeDialogWidth">
        </view-details>
      </el-dialog>
      <el-dialog
        :visible.sync="editFigureDialog"
        width="600px"
        custom-class="er-modify-dialog-wrapper col-dialog"
        :class="isFullScreen?'full-screen': ''"
        append-to-body
        :modal="false"
        :before-close="closeFigureDialog">
        <div slot="title" class="header-wrapper"><h2 style="margin-left: 20px">图框</h2></div>
        <ul class="edit-style-dialog-content-wrapper">
          <li>样式：&nbsp;&nbsp;&nbsp;&nbsp;
            <el-select size="mini" placeholder="请选择" v-model="currentStyleRelatedShapeTemplate.StyleThemeRef">
              <template v-for="themeId in Object.keys(dataByType.theme)">
                <el-option v-if="!dataByType.theme[themeId].properties.deleted" :key="dataByType.theme[themeId].properties.Name" :value="dataByType.theme[themeId].properties.Id" :label="dataByType.theme[themeId].properties.Name" ></el-option>
              </template>
            </el-select>
          </li>
          <li class="style-box">
            <el-color-picker class="middle-y" show-alpha v-model="currentStyleRelatedShapeTemplate.StyleBackColor" size="mini"></el-color-picker>
            <span style="margin-left: 10px;padding-top: 3px;" class="label-disc middle-y">背景颜色</span>
            <opacity-component style="position: relative;top: 2px;" class="middle-y" :rgba.sync="currentStyleRelatedShapeTemplate.StyleBackColor"></opacity-component>
          </li>
        </ul>
        <div style="text-align: right;margin-top: 5px;">
          <el-button type="primary" @click="resetFigureStyleConfirm" size="mini">重置</el-button>
        </div>
      </el-dialog>
      <el-dialog
        :visible.sync="editCommentDialog"
        width="600px"
        custom-class="er-modify-dialog-wrapper col-dialog"
        :class="isFullScreen?'full-screen': ''"
        append-to-body
        :modal="false"
        :before-close="closeCommentDialog">
        <div slot="title" class="header-wrapper">
          <img style="margin-right: 5px;vertical-align: top;margin-left: 22px;position: relative;top: 1px;" :src="commentUsedImg" width="18" />
          <h2 style="padding-left: 0">文本</h2>
        </div>
        <div>
          <ul class="edit-style-dialog-content-wrapper">
            <li><div class="coment-label">文本内容</div>
              <el-input
                type="textarea"
                :autosize="{ minRows: 4, maxRows: 10 }"
                show-word-limit
                resize="none"
                style="width:500px;font-size: 12px;"
                v-model="commentDialogData"></el-input>
            </li>
            <li><div class="coment-label">样式</div>
              <el-select size="mini" placeholder="请选择" v-model="currentStyleRelatedShapeTemplate.StyleThemeRef">
                <template v-for="themeId in Object.keys(dataByType.theme)">
                  <el-option v-if="!dataByType.theme[themeId].properties.deleted" :key="dataByType.theme[themeId].properties.Name" :value="dataByType.theme[themeId].properties.Id" :label="dataByType.theme[themeId].properties.Name" ></el-option>
                </template>
              </el-select>
            </li>
            <li style="padding-left: 0" class="set-tab set-line style-box" >
              <el-color-picker style="vertical-align: middle;margin-right: 5px;" show-alpha v-model="currentStyleRelatedShapeTemplate.StyleTextColor" size="mini"></el-color-picker>
              <span class="label-disc middle-y">文本颜色</span>
              <opacity-component class="middle-y" :rgba.sync="currentStyleRelatedShapeTemplate.StyleTextColor"></opacity-component>
              字体<!--<el-input style="width: 100px;" v-model="currentStyleRelatedShapeTemplate.StyleFontFamily" size="mini"></el-input>-->
              <el-select style="width: 100px;margin-right:5px;margin-left:6px" filterable  size="mini" v-model="currentStyleRelatedShapeTemplate.StyleFontFamily" placeholder="请选择">
                <el-option :value="item" :key="item" :label="item" v-for="item in fontFamily"></el-option>
              </el-select>
              <!-- 字形：<el-select style="width: 100px;" size="mini" v-model="currentStyleRelatedShapeTemplate.StyleFontBoldItalic" placeholder="请选择">
              <el-option :value="item.value" :key="item.value" :label="item.label" v-for="item in fontStyle"></el-option>
            </el-select> -->
              <!-- <el-checkbox style="margin: 6px 5px 0;" size="mini" v-model="currentStyleRelatedShapeTemplate.StyleFontUnderLine">下划线：</el-checkbox>
              <el-checkbox style="margin-top: 6px;" size="mini" v-model="currentStyleRelatedShapeTemplate.StyleFontLineThrough">删除线：</el-checkbox> -->
              <span class="label-disc middle-y" style="margin-left:5px">字体设置</span>

              <el-checkbox-group style="display: inline-block;position: relative;bottom: 4px;margin-right: 3px;" @change="handleStyleListChange2($event,currentStyleRelatedShapeTemplate,'StyleFontBoldItalic')" v-model="styleSetting.checkList" >
                <el-checkbox-button class="bold" label="Bold">B</el-checkbox-button>
                <el-checkbox-button label="Italic" style="font-style:italic">I</el-checkbox-button>
              </el-checkbox-group>
              <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="下划线" placement="bottom">
                <el-checkbox-button class="underline"  size="mini" v-model="currentStyleRelatedShapeTemplate.StyleFontUnderLine">U</el-checkbox-button>
              </el-tooltip>
              <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="删除线" placement="bottom">
                <el-checkbox-button class="line-through"  size="mini" v-model="currentStyleRelatedShapeTemplate.StyleFontLineThrough">D</el-checkbox-button>
              </el-tooltip>

              <!--<el-radio-group v-model="currentStyleRelatedShapeTemplate.StyleFontBoldItalic">
                  <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="常规" placement="bottom">
                    <el-radio-button  label="">R</el-radio-button>
                  </el-tooltip>
                  <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="斜体" placement="bottom">
                    <el-radio-button  label="Italic"  style="font-style:italic">I</el-radio-button>
                  </el-tooltip>
                  <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="加粗" placement="bottom">
                    <el-radio-button class="bold"  label="Bold">B</el-radio-button>
                  </el-tooltip>
                  <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="加粗斜体" placement="bottom">
                    <el-radio-button   label="BoldItalic">BI</el-radio-button>
                  </el-tooltip>
              </el-radio-group>
              <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="下划线" placement="bottom">
                  <el-checkbox-button class="underline"  size="mini" v-model="currentStyleRelatedShapeTemplate.StyleFontUnderLine">U</el-checkbox-button>
              </el-tooltip>
              <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="删除线" placement="bottom">
                  <el-checkbox-button class="line-through"  size="mini" v-model="currentStyleRelatedShapeTemplate.StyleFontLineThrough">D</el-checkbox-button>
              </el-tooltip>-->
            </li>
            <!-- <li class="set-line">
              <div class="right" style="height: 70px;">
                <div>
                  字体：<el-input style="width: 120px;" v-model="currentStyleRelatedShapeTemplate.StyleFontFamily" size="mini"></el-input>
                  字形：<el-select style="width: 120px;" size="mini" v-model="currentStyleRelatedShapeTemplate.StyleFontBoldItalic" placeholder="请选择">
                  <el-option :value="item.value" :key="item.value" :label="item.label" v-for="item in fontStyle"></el-option>
                </el-select>
                </div>
                <div>
                  大小: <el-input-number :min="1" style="width: 100px;" v-model="currentStyleRelatedShapeTemplate.StyleFontSize" :precision="2" size="mini"></el-input-number>
                  <el-checkbox style="margin: 6px 5px 0;" size="mini" v-model="currentStyleRelatedShapeTemplate.StyleFontUnderLine">下划线：</el-checkbox>
                  <el-checkbox style="margin-top: 6px;" size="mini" v-model="currentStyleRelatedShapeTemplate.StyleFontLineThrough">删除线：</el-checkbox>
                </div>
              </div>
            </li> -->
          </ul>
          <div style="text-align: left;margin-top: 5px;">
            <el-button type="primary" @click="resetCommentStyleConfirm" size="mini">重置</el-button>
          </div>
        </div>
      </el-dialog>
      <el-dialog
        v-if="colDialogData"
        :visible.sync="colDialog"
        :width="colDialogWidth"
        custom-class="er-modify-dialog-wrapper col-dialog"
        :class="isFullScreen?'full-screen': ''"
        append-to-body
        :modal="false"
        :before-close="closeColDialog"
      >
        <div slot="title" class="header-wrapper">
          <img style="margin-right: 5px;vertical-align: middle;margin-left: 22px;position: relative;top: -1px;" :src="attributeImg" width="18" />
          <h2 style="padding-left: 0">{{isDesignModel? '属性':'字段'}}: {{currentColName}}</h2>
        </div>
        <col-details
          :reNameColumnType="reNameColumnType"
          :deliverNum="deliverNum"
          ref="colDetails"
          :LayerEdit="LayerEdit"
          :key="colKey"
          :rawData="colDialogData"
          :current-model="currentModel"
          :data-by-type="dataByType"
          :isLogicalModel="isLogicalModel"
          :isDesignModel="isDesignModel"
          :getTableHTMLFunction="getTableHTMLFunction"
          :cellDialogData="cellDialogData"
          :diagram-id="currentId"
          :format-theme-template-data="formatThemeTemplateData"
          v-if="graph"
          :Changes="Changes"
          :graph="graph"
          :startIdToEndIds="startIdToEndIds"
          :fontFamily="fontFamily"
          :categoryOrder="categoryOrder"
          :calculateStartIdToEndIds="calculateStartIdToEndIds"
          :createDeepRelation="createDeepRelation"
          :getColumnNameNamingMap="getColumnNameNamingMap"
          :formatTextFontSimpleBack="formatTextFontSimpleBack"
          @changeDialogWidth="changeColDialogWidth"
        >
        </col-details>
      </el-dialog>
      <el-dialog
        v-if="viewColDialogData"
        :visible.sync="viewColDialog"
        :width="colDialogWidth"
        custom-class="er-modify-dialog-wrapper col-dialog"
        :class="isFullScreen?'full-screen': ''"
        append-to-body
        :modal="false"
        :before-close="closeViewColDialog"
      >
        <div slot="title" class="header-wrapper">
          <img style="margin-right: 5px;vertical-align: middle;margin-left: 22px;position: relative;top: -1px;" :src="attributeImg" width="18" />
          <h2 style="padding-left: 0">字段: {{currentColName}}</h2>
        </div>
        <view-col-details
          :reNameColumnType="reNameColumnType"
          :deliverNum="deliverNum"
          :key="viewColKey"
          ref="viewColDetails"
          :rawData="viewColDialogData"
          :current-model="currentModel"
          :data-by-type="dataByType"
          :isLogicalModel="isLogicalModel"
          :getTableHTMLFunction="getTableHTMLFunction"
          :getViewHTMLFunction="getViewHTMLFunction"
          :createRelation="createRelation"
          :cellDialogData="cellDialogData"
          :diagramId="currentId"
          :fontFamily="fontFamily"
          :format-theme-template-data="formatThemeTemplateData"
          :getColumnNameNamingMap="getColumnNameNamingMap"
          v-if="graph"
          :Changes="Changes"
          :graph="graph"
          :categoryOrder="categoryOrder"
          :formatTextFontSimpleBack="formatTextFontSimpleBack"
          :getIndexNameNamingMap="getIndexNameNamingMap"
          @changeDialogWidth="changeColDialogWidth"
        >
        </view-col-details>
      </el-dialog>
      <el-dialog
        :visible.sync="diagramDialog"
        width="600px"
        custom-class="er-modify-dialog-wrapper col-dialog"
        :class="isFullScreen?'full-screen': ''"
        append-to-body
        :modal="false"
        :before-close="closeDiagramDialog"
      >
        <diagram-details
          :key="diagramKey"
          :dataByType="dataByType"
          ref="diagramDetails"
          :diagramCopy="diagramData"
          :diagrams="diagrams"
          :Changes="Changes"
          :currentModel="currentModel"
          :mapIdToDiagramData="mapIdToDiagramData"
          v-if="graph"
        >
        </diagram-details>
      </el-dialog>
      <el-dialog
        :visible.sync="modelDialog"
        width="600px"
        custom-class="er-modify-dialog-wrapper col-dialog"
        :class="isFullScreen?'full-screen': ''"
        append-to-body
        :modal="false"
        :before-close="closeModelDialog"
      >
        <model-details
          :key="modelKey"
          :dataByType="dataByType"
          ref="modelDetails"
          :modelData="modelData"
          :Changes="Changes"
          v-if="graph"
        >
        </model-details>
      </el-dialog>
      <datablau-dialog
        title="命名词典"
        custom-class="er-dictionary"
        append-to-body
        :visible.sync="dictionaryVisible"
        :height="'500px'"
      >
        <naming-standards
          @changeCategoryOrder="changeCategoryOrder"
          @closeNamingStandardDialog="dictionaryVisible=false"
        ></naming-standards>
      </datablau-dialog>
      <datablau-dialog
        title="命名设置"
        append-to-body
        :visible.sync="namingOptionVisible"
        width="880px"
        custom-class="naming-option-dialog"
        height="540px"
        no-padding
      >
        <div slot="title" class="naming-option-dialog-title">
          <div class="top-tips">
            <h2>命名设置</h2>
            <i class="iconfont icon-tips"></i>
            {{`命名标准，配置于当前模型[${currentModel.Name}]`}}
          </div>
        </div>
        <naming-option
          :getTableHTMLFunction="getTableHTMLFunction"
          :getViewHTMLFunction="getViewHTMLFunction"
          :getTableNameNamingMap="getTableNameNamingMap"
          :getColumnNameNamingMap="getColumnNameNamingMap"
          :getIndexNameNamingMap="getIndexNameNamingMap"
          :Changes="Changes"
          :graph="graph"
          :LayerEdit="LayerEdit"
          :key="namingOptionKey"
          :currentModelName="currentModel.Name"
          @closeNamingOptionDialog="namingOptionVisible = false"
          :dataByType="dataByType"></naming-option>
      </datablau-dialog>
      <el-dialog
        class="checkin-version-wrapper"
        custom-class="select-domain"
        title="从数据标准创建"
        append-to-body
        :visible.sync="domainListVisible"
        width="30%"
      >
        <el-checkbox-group v-model="checkedDomainList" style="overflow: auto;">
          <el-checkbox v-for="item in currentDomainList" :key="item.id" :label="item.id" style="display:block">
            {{item.chName}}
          </el-checkbox>
        </el-checkbox-group>

        <span slot="footer">
        <el-button type="primary" size="mini" @click="handleDomainCheckAll">选择全部</el-button>
        <el-button @click="domainListVisible = false" size="mini">取消</el-button>
        <el-button type="primary" @click="createColsByDomainList" size="mini">确定</el-button>
      </span>
      </el-dialog>

      <div class="model-graph-page">
        <el-dialog :title="dialog.title" width="600px" :visible.sync="dialog.visible" append-to-body>
          <el-table
            :data="dialog.data"
            class="datablau-table"
            :show-header="false">
            <el-table-column property="key" label="" width="100"></el-table-column>
            <el-table-column label="">
              <template slot-scope="scope">
                <span v-html="nl2br(scope.row.value)"></span>
              </template>
            </el-table-column>
          </el-table>
        </el-dialog>
        <div id="container" :class="{fixed:fixed, 'show-report': showReport}">
          <div v-clickoutside="handleClickOutside" id="consa-graph"></div>
          <!--<div id="loading-box" v-if="loading"><i class="el-icon-loading"></i></div>
          <div style="position:absolute;top:20px;left:20px;height: 40px;line-height: 40px;">
            <div style="float:left;background: #fff;border-radius: 4px;box-shadow: 0px 0px 10px rgba(123, 123, 123, 0.16);">
              <el-dropdown
                placement="bottom-start"
                @command="beforeHandleCommand">
                  <span class="el-dropdown-link">
                    <el-button-group>
                      <el-button
                        style="position:relative;top:2px;"
                        size="small"
                        title="显示格式"
                      >
                      <i class="icon--37--7"></i>
                      </el-button>
                    </el-button-group>
                  </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="dataType">
                    <el-checkbox :value="showDataType"></el-checkbox>
                    字段数据类型</el-dropdown-item>
                  <el-dropdown-item command="allColumn" divided>
                    <el-checkbox :value="showAllColumn"></el-checkbox>
                    显示所有字段
                  </el-dropdown-item>
                  <el-dropdown-item command="keyColumn">
                    <el-checkbox :value="showKeyColumn"></el-checkbox>
                    仅显示键字段</el-dropdown-item>
                  <el-dropdown-item command="noColumn">
                    <el-checkbox :value="showNoColumn"></el-checkbox>
                    仅显示表名</el-dropdown-item>
                  <el-dropdown-item divided v-if="!isDesignModel" command="logicalName">
                    <el-checkbox :value="showLogicalName"></el-checkbox>
                    业务名称</el-dropdown-item>
                  <el-dropdown-item v-if="!isDesignModel" command="physicalName">
                    <el-checkbox :value="showPhysicalName"></el-checkbox>
                    物理名称</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <el-button-group>
                <el-button
                  size="small"
                  style="position:relative;top:-2px;"
                  @click="changeFullScreen"
                  title="全屏显示"
                ><i :class="{'icon-42':!fixed,'icon-22':fixed}"></i></el-button>
                <el-button
                  @click="toggleShowOutline"
                  size="small"
                  style="position:relative;top:-2px;"
                  title="导航"
                >
                  <i class="icon-41"></i>
                </el-button>
              </el-button-group>
              <el-button-group>
                <el-button
                  size="small"
                  title="数据规范"
                  @click="handleDataReportChange"
                  style="position:relative;top:-2px;margin-left: 10px;"
                  class="data-standard">
                  <i class="icon-43"></i>
                </el-button>
                <el-button
                  size="small"
                  title="自动布局"
                  class="icon--38--3 space-white"
                  @click="doLayout"
                >
                </el-button>
                <el-button
                  size="small"
                  @click="exportGraph"
                  v-show="false"
                >
                  <i class="el-icon-download" style="font-weight:bold;font-size:14px;"></i>
                </el-button>
              </el-button-group>
            </div>
            <i style="position: absolute;right: 230px; top: 13px;z-index: 1;font-size: 16px;" class="el-icon-search"></i>
            <el-select
              v-model="value9"
              filterable
              remote
              reserve-keyword
              clearable
              placeholder="请输入关键词搜索表、视图、字段"
              :remote-method="remoteMethod"
              size="small"
              style="width:260px;margin-left:1em;position: relative;top: -1px;color: #20293B;"
              class="search-panel"
              @change="handleSelect"
            >
              <el-option
                v-for="item in options4"
                :key="item.label"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>-->
          <div class="warning-box" v-if="entityTotalCount >= 500">
            <i class="el-icon-warning"></i>
            当前图形数量已超500，受限于浏览器资源，建议到客户端编辑保存
            <!--<datablau-button
              @click="uglyHandleSave"
              type="normal"
            >保存</datablau-button>-->
          </div>
          <ul class="drag-box" :class="{'no-tool-selection': !toolSelection, 'disabled-edit': disabledEdit}" @contextmenu.prevent="handleRightClick" @mouseenter="handleTopTileChange(true)" @mouseleave="handleTopTileChange(false)">
            <slot name="header"></slot>
            <div class="menu-box" ref="menuBox" v-show="showMenuBox">
              <div class="item" @click="toolSelection = true,showMenuBox=false"><i v-show="toolSelection" class="el-icon-check"></i>图标和文字</div>
              <div class="item" @click="toolSelection = false,showMenuBox=false"><i v-show="!toolSelection" class="el-icon-check"></i>仅图标</div>
            </div>
            <li :title="toolSelection?'': '保存'" id="saveButton" @click="saveModel" class="right-line" :class="{unactive:!toolSelection}">
              <img :src="saveImg" draggable="false" alt="" />
              <p v-show="toolSelection" class="disc">保存</p>
            </li>
            <li :title="toolSelection?'': '撤销'" id="undoButton" :class="{disabled: undoDisabled,unactive:!toolSelection}" ><img width="25" :class="{'disabled-img':undoDisabled}" style="margin-right: 10px;"  :src="undoImg" draggable="false" alt="" /><p v-show="toolSelection" class="disc small">撤销</p></li>
            <li :title="toolSelection?'': '恢复'" id="redoButton" :class="{disabled: redoDisabled,unactive:!toolSelection}"  class="undo-class" ><img width="25" height="20" :class="{'disabled-img':redoDisabled}"  :src="redoImg" draggable="false" /><p v-show="toolSelection" class="disc small">恢复</p></li>
            <li :title="toolSelection?'': '历史记录'" class="undo-class right-line history" :class="{unactive:!toolSelection}"  style="width: 48px;padding-right: 11px;">
              <el-popover
                :visible-arrow='false'
                placement="bottom"
                width="300"
                trigger="click"
                class="history-class"
                :append-to-body="false"
              >
                <p class="title">
                  操作历史记录 <span class="sum">（共{{`${graph && graph.editor && graph.editor.undoManager.indexOfNextAdd}`}}条）</span>
                  <datablau-button class="redo-btn" @click="goHistoryBack(activeHistoryIndex + 1, true)" :disabled="activeHistoryIndex === -1 || (this.graph && this.graph.editor && this.graph.editor.undoManager && this.graph.editor.undoManager.indexOfNextAdd - activeHistoryIndex > 0)" type="secondary">恢复</datablau-button>
                  <datablau-button class="undo-btn" @click="goHistoryBack(activeHistoryIndex, false)" :disabled="activeHistoryIndex === -1 || (this.graph && this.graph.editor && this.graph.editor.undoManager && this.graph.editor.undoManager.indexOfNextAdd - activeHistoryIndex <= 0)" type="secondary">撤销</datablau-button>
                </p>
                <el-timeline style="max-height: 60vh;overflow: auto;" reverse>
                  <el-timeline-item
                    @click.native="setActiveIndex(index)"
                    v-for="(item, index) in historyList"
                    :class="{active: index === activeHistoryIndex, 'history-unused': index >= graph.editor.undoManager.indexOfNextAdd}"
                    :key="index"
                    :type="index >= graph.editor.undoManager.indexOfNextAdd ? 'info': 'primary'">
                    <ul>
                      <li :key="index" v-for="(change, index) in (item[0].changes? item[0].changes : item)">
                        <span v-if="change.type === 'modifySize'">
                          {{change.obj.name + operationMap[change.type] + ' {width:' + parseInt(change.obj.width) + ',height:' + parseInt(change.obj.height) + '}' }}
                        </span>
                        <span v-else-if="change.type === 'modifyPosition'">
                          {{change.obj.name + operationMap[change.type] + ' {x:' + parseInt(change.obj.x) + ',y:' + parseInt(change.obj.y) + '}' }}
                        </span>
                        <span v-else-if="change.type === 'modifyConnection'">
                          {{change.obj.name + operationMap[change.type] + ' start {x:' + parseInt(change.obj.start.x) + ',y:' + parseInt(change.obj.start.y) + '}' + ' end {x:' + parseInt(change.obj.end.x) + ',y:' + parseInt(change.obj.end.y) + '}' }}
                        </span>
                        <span v-else-if="change.type === 'modifyNamingOption'">
                          {{operationMap[change.type]}}
                        </span>
                        <span v-else-if="change.type === 'modifyNamingOptionAndApply'">
                          {{operationMap[change.type]}}
                        </span>
                        <span v-else-if="change.type === 'moveSelectCells'">
                          {{operationMap[change.type] + ' {x:' + parseInt(change.obj.delX) + ',y:' + parseInt(change.obj.delY) + '}' }}
                        </span>
                        <span v-else-if="change.obj">
                          {{(change.obj.pName ? change.obj.pName : '') + operationMap[change.type] + change.obj.name}}
                        </span>
                      </li>
                    </ul>
                  </el-timeline-item>
                </el-timeline>
                <div slot="reference">
                  <!--                  <img :src="saveImg" draggable="false" alt="" />-->
                  <span class="undo-wrapper" :class="{disabled: undoDisabled}" title=""><img width="25" style="position: relative;left:3px"  :src="historyImg" draggable="false" /></span>
                  <p v-show="toolSelection" class="disc small" style="position: relative;left:3px">历史记录</p>
                </div>
              </el-popover>
            </li>
            <transition name="fade">
              <li :title="toolSelection?'': '实体/表'" v-show="toolLv1" v-if="!isConceptual" @click="createTable" id="tableButton" class=" lv2" :class="{unactive:!toolSelection}"><img  :src="tableImg"  draggable alt="" /><p v-show="toolSelection" class="disc">实体/表</p></li>
            </transition>
            <transition name="fade">
              <li :title="toolSelection?'': '视图'" v-show="toolLv1" v-if="showViewButton" @click="createView" id="viewButton" :class="{unactive:!toolSelection}"><img  :src="viewImg" draggable alt="" /><p v-show="toolSelection" class="disc">视图</p></li>
            </transition>
            <transition name="fade">
              <li :title="toolSelection?'': '业务对象'" v-show="toolLv1" v-if="isConceptual || isLogical" @click="createBusiness" id="businessButton" style="width:48px" class=" lv2 history" :class="{unactive:!toolSelection}"><img  :src="businessImg" draggable alt="" /><p v-show="toolSelection" class="disc">业务对象</p></li>
            </transition>
            <transition name="fade">
              <li :title="toolSelection?'': '文本'" v-show="toolLv1" @click="createComment" id="commentButton" :class="{unactive:!toolSelection}"><img  :src="commentImg" draggable alt="" /><p v-show="toolSelection" class="disc">文本</p></li>
            </transition>
            <transition name="fade">
              <li :title="toolSelection?'': '图框'" v-show="toolLv1" @click="createFigure" id="figureButton" class="right-line" :class="{unactive:!toolSelection}"><img  :src="figureImg" draggable alt="" /><p v-show="toolSelection" class="disc">图框</p></li>
            </transition>
            <transition name="fade">
              <li :title="toolSelection?'': '标识'" v-if="diagram.children && diagram.children.filter(i => !i.properties.deleted).length >= 1" v-show="toolLv1" @click="relationClick" :class="{active: this.currentEdgeType === 'RelationalIdentifying',unactive:!toolSelection}" ><img class="relationButton"  :src="relationImg" draggable="false" alt="" /><p v-show="toolSelection" class="disc">标识</p></li>
              <li :title="toolSelection?'': '标识'" v-else style="cursor:not-allowed" class="grey" v-show="toolLv1" :class="{active: this.currentEdgeType === 'RelationalIdentifying',unactive:!toolSelection}" ><img class="relationButton"  :src="relationImgUnactive" draggable="false" alt="" /><p v-show="toolSelection" class="disc">标识</p></li>
            </transition>
            <transition name="fade">
              <li :title="toolSelection?'': '非标识'" v-if="diagram.children && diagram.children.filter(i => !i.properties.deleted).length >= 1" v-show="toolLv1" @click="relationClick1" class=" lv2" :class="{active: currentEdgeType === 'RelationalNonIdentifying',unactive:!toolSelection}" ><img class="relationButton1"  :src="relationImg1" draggable="false" alt="" /><p v-show="toolSelection" class="disc">非标识</p></li>
              <li :title="toolSelection?'': '非标识'" v-else style="cursor:not-allowed" v-show="toolLv1" class="grey lv2" :class="{active: currentEdgeType === 'RelationalNonIdentifying',unactive:!toolSelection}" ><img class="relationButton1"  :src="relationImgUnactive1" draggable="false" alt="" /><p v-show="toolSelection" class="disc">非标识</p></li>
            </transition>
            <transition name="fade">
              <li :title="toolSelection?'': 'Subtype'" v-if="diagram.children && diagram.children.filter(i => !i.properties.deleted).length >= 1  && (isLogical || isConceptual)" v-show="toolLv1" @click="relationClick5" :class="{active: this.currentEdgeType === 'RelationalSubtype',unactive:!toolSelection}" ><img class="relationButton5"  :src="relationImg5" draggable="false" alt="" /><p v-show="toolSelection" class="disc">Subtype</p></li>
              <li :title="toolSelection?'': 'Subtype'" v-else-if="(isLogical || isConceptual)" style="cursor:not-allowed" class="grey" v-show="toolLv1" :class="{active: this.currentEdgeType === 'RelationalSubtype',unactive:!toolSelection}" ><img class="relationButton5"  :src="relationImgUnactive5" draggable="false" alt="" /><p v-show="toolSelection" class="disc">Subtype</p></li>
            </transition>
            <transition name="fade">
              <li :title="toolSelection?'': '多对多'" v-if="diagram.children && diagram.children.filter(i => !i.properties.deleted).length >= 1 && (isLogical || isConceptual)" v-show="toolLv1" @click="relationClick2" :class="{active: currentEdgeType === 'RelationalManyToMany',unactive:!toolSelection}"><img class="relationButton2"  :src="relationImg2" draggable="false" alt="" /><p v-show="toolSelection" class="disc">多对多</p></li>
              <li :title="toolSelection?'': '多对多'" class="grey" v-else-if="(isLogical || isConceptual)" style="cursor:not-allowed" v-show="toolLv1" :class="{active: currentEdgeType === 'RelationalManyToMany',unactive:!toolSelection}"><img class="relationButton2"  :src="relationImgUnactive2" draggable="false" alt="" /><p v-show="toolSelection" class="disc">多对多</p></li>
            </transition>
            <transition name="fade">
              <li :title="toolSelection?'': '虚拟'" v-if="diagram.children && diagram.children.filter(i => !i.properties.deleted).length >= 1" v-show="toolLv1" @click="relationClick3" :class="{active: currentEdgeType === 'RelationalVirtual',unactive:!toolSelection}" ><img class="relationButton3"  :src="relationImg3" draggable="false" alt="" /><p v-show="toolSelection" class="disc">虚拟</p></li>
              <li :title="toolSelection?'': '虚拟'" class="grey" style="cursor:not-allowed" v-else v-show="toolLv1" :class="{active: currentEdgeType === 'RelationalVirtual',unactive:!toolSelection}" ><img class="relationButton3"  :src="relationImgUnactive3" draggable="false" alt="" /><p v-show="toolSelection" class="disc">虚拟</p></li>
            </transition>
            <transition name="fade">
              <li :title="toolSelection?'': '视图'" v-if="diagram.children && diagram.children.filter(i => !i.properties.deleted).length >= 1 && showViewButton" v-show="toolLv1" @click="relationClick4" :class="{active: currentEdgeType === 'RelationalView',unactive:!toolSelection}"  class="right-line"><img class="relationButton4" :src="relationImg4" draggable="false" alt="" /><p v-show="toolSelection" class="disc">视图</p></li>
              <li :title="toolSelection?'': '视图'" v-else-if="showViewButton" style="cursor:not-allowed" v-show="toolLv1" :class="{active: currentEdgeType === 'RelationalView',unactive:!toolSelection}"  class="grey right-line"><img class="relationButton4" :src="relationImgUnactive4" draggable="false" alt="" /><p v-show="toolSelection" class="disc">视图</p></li>
            </transition>
            <!--            <li title="Subtype" v-if="this.dataByType.model.TypeUniqueId === '025502f5-3820-4555-9d0f-bbb148840e9a'"><img style="width: 20px;" id="relationButton5" :src="relationImg4" draggable="false" alt="" /></li>-->
            <transition name="fade">
              <li :title="toolSelection?'': '筛选'" v-show="toolLv1" :class="{unactive:!toolSelection}">
                <el-dropdown
                  class="filter-drop"
                  :hide-on-click="false"
                  trigger="click"
                  placement="bottom-start"
                  @command="beforeHandleCommand"
                  ref="filterDropDown">
              <li class="el-dropdown-link right-line"  :class="{relative:!toolSelection}">
                <span >
                  <img style="display: inline-block;position: relative;left: 5px;" :src="showTypeImg" draggable="false" alt="" />
                  <i style="position: relative;left: 5px;" class="el-icon-arrow-down"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="dataType">
                    <el-checkbox :value="showDataType"></el-checkbox>
                    字段数据类型</el-dropdown-item>
                  <el-dropdown-item command="allColumn" divided>
                    <el-checkbox :value="showAllColumn"></el-checkbox>
                    显示所有字段
                  </el-dropdown-item>
                  <el-dropdown-item command="keyColumn">
                    <el-checkbox :value="showKeyColumn"></el-checkbox>
                    仅显示键字段</el-dropdown-item>
                  <el-dropdown-item command="noColumn">
                    <el-checkbox :value="showNoColumn"></el-checkbox>
                    仅显示表名</el-dropdown-item>
                  <el-dropdown-item divided command="logicalName">
                    <el-checkbox :value="showLogicalName"></el-checkbox>
                    业务名称</el-dropdown-item>
                  <el-dropdown-item command="physicalName">
                    <el-checkbox :value="showPhysicalName"></el-checkbox>
                    物理名称</el-dropdown-item>
                </el-dropdown-menu>
                <p v-show="toolSelection" class="disc">筛选</p>
              </li>
              </el-dropdown>
              </li>
            </transition>
            <transition name="fade">
              <div v-show="toolLv1" class="style-setting">
                <el-select ref="textFamilyRef" @change="handleTextFormChange" :disabled='currentStyle.StyleFontFamily === null' style="width: 100px" filterable  size="mini" v-model="currentStyle.StyleFontFamily" placeholder="选择字体">
                  <el-option :value="item" :key="item" :label="item" v-for="item in fontFamily"></el-option>
                </el-select>
                <el-select
                  ref="textSizeRef"
                  style="width:75px;margin-right:10px"
                  :disabled='currentStyle.StyleFontSize === null'
                  size="mini"
                  @change="handleTextFormChange"
                  v-model="currentStyle.StyleFontSize"
                  placeholder="字号"
                >
                  <el-option
                    v-for="item in fontSizes"
                    :key="item.value"
                    :label="item.value"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
                <div class="bg-color" :class="{disabled:currentStyle.StyleBackColor === null}">
                  <img width="19" :src="bgColorImg">
                  <i class="el-icon-arrow-down"></i>
                  <div class="bottom" :style="`background-color:${currentStyle.StyleBackColor}`"></div>
                </div>
                <el-color-picker ref="textColorRef" @change="handleBackColorChange" :disabled='currentStyle.StyleBackColor === null' style="position: relative;right: 24px;top: 3px;opacity: 0;margin-right: 15px;vertical-align: middle" show-alpha v-model="currentStyle.StyleBackColor" size="mini"></el-color-picker>
                <div class="text-tool set-tab">
                  <el-checkbox-group @change="handleStyleListChange" v-model="currentStyle.checkList" :disabled='currentStyle.checkList === null'>
                    <el-checkbox-button class="bold" label="Bold">B</el-checkbox-button>
                    <el-checkbox-button label="Italic" style="font-style:italic">I</el-checkbox-button>
                  </el-checkbox-group>
                  <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="下划线" placement="bottom">
                    <el-checkbox-button @change="handleTextFormChange" :disabled='currentStyle.StyleFontUnderLine === null' class="underline"  size="mini" v-model="currentStyle.StyleFontUnderLine">U</el-checkbox-button>
                  </el-tooltip>
                  <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="删除线" placement="bottom">
                    <el-checkbox-button @change="handleTextFormChange" :disabled='currentStyle.StyleFontLineThrough === null' class="line-through"  size="mini" v-model="currentStyle.StyleFontLineThrough">D</el-checkbox-button>
                  </el-tooltip>
                  <div class="text-color" :class="{disabled:currentStyle.StyleTextColor === null}">
                    A
                    <i class="el-icon-arrow-down"></i>
                    <div class="bottom" :style="`background-color:${currentStyle.StyleTextColor}`"></div>
                  </div>
                  <el-color-picker ref="textColorRef2" @change="handleTextFormChange" style="position: relative;opacity: 0;right: 34px;vertical-align: middle;margin-left: 10px;height:24px" show-alpha :disabled='currentStyle.StyleTextColor === null' v-model="currentStyle.StyleTextColor" size="mini"></el-color-picker>
                </div>
              </div>
            </transition>
            <transition name="fade">
              <li :title="toolSelection?'': '适应尺寸'" v-show="toolLv2" @click="multipleSelectResize(true,true)"  class="history first  lv2" style="width:48px" :class="{unactive:!toolSelection,disabled:!selectCells.length}"><img :src="selectCells.length ? adaptImg : adaptImg3" /><p v-show="toolSelection" class="disc">适应尺寸</p></li>
            </transition>
            <transition name="fade">
              <li :title="toolSelection?'': '适应高度'" v-show="toolLv2" @click="multipleSelectResize(false,true)" class="history  lv2" style="width:48px"  :class="{unactive:!toolSelection,disabled:!selectCells.length}"><img :src="selectCells.length ? adaptImg1 : adaptImg4" /><p v-show="toolSelection" class="disc">适应高度</p></li>
            </transition>
            <transition name="fade">
              <li :title="toolSelection?'': '适应宽度'" v-show="toolLv2" @click="multipleSelectResize(true,false)" class="history  lv2  right-line" style="width:48px" :class="{unactive:!toolSelection,disabled:!selectCells.length}"><img :src="selectCells.length ? adaptImg2 : adaptImg5" /><p v-show="toolSelection" class="disc">适应宽度</p></li>
            </transition>
            <transition name="fade">
              <li :title="toolSelection?'': '命名词典'" v-show="toolLv2" @click="dictionaryVisible = true" class="history  lv2" style="width:48px" :class="{unactive:!toolSelection}"><img :src="dictionaryImg" /><p v-show="toolSelection" class="disc">命名词典</p></li>
            </transition>
            <transition name="fade">
              <li :title="toolSelection?'': '命名设置'" v-show="toolLv2" @click="openNamingOptionDialog" class="history lv2 right-line" style="width:48px" :class="{unactive:!toolSelection}"><img :src="namingOptImg" /><p v-show="toolSelection" class="disc">命名设置</p></li>
            </transition>
            <transition name="fade">
              <li :title="toolSelection?'': 'UDP'" v-show="toolLv2" @click="openUDPSettingDialog" class="history lv2" style="width:48px" :class="{unactive:!toolSelection}"><img :src="udpImg" /><p v-show="toolSelection" class="disc">UDP</p></li>
            </transition>
            <transition name="fade">
              <li v-if="searchPanelExist" class="none-before" style="margin-left: 20px;height: 32px;">
                <div @click="searchChanged" class="search-btn" v-show="!showSearch">
                  <i class="iconfont icon-search"></i>
                </div>
                <div class="search-wrapper" v-show="showSearch">
                  <datablau-select
                    style="display: inline-block"
                    v-model="value9"
                    filterable
                    remote
                    reserve-keyword
                    clearable
                    placeholder="搜索表、视图、字段"
                    :remote-method="remoteMethod"
                    size="small"
                    class="search-panel"
                    @clear="clearSelect"
                    @change="handleSelect"
                    v-clickOutside="clickOutside"
                    is-icon="iconfont icon-search"
                  >
                    <el-option
                      v-for="item in options4"
                      :key="item.label"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </datablau-select>
                  <span class="hide-search-panel el-icon-arrow-right" @click="showSearch=false"></span>
                </div>
              </li>
            </transition>
            <div class="button-box">
              <div class="top-button"  @click="showNormal">通用工具栏</div>
              <div class="bottom-button"  @click="showExtend">扩展工具栏</div>
              <div class="text-wrapper1" v-if="toolLv1"  :class='{actived:toolLv1}' @click="showNormal">通用工具栏</div>
              <div class="text-wrapper2" v-if="!toolLv1" :class='{actived:!toolLv1}' @click="showExtend">扩展工具栏</div>
              <div class="bg-box" :class='{top:toolLv1,bottom:!toolLv1}'></div>
            </div>

          </ul>
          <div class="report-container" :class="{'show-outline': showOutline}">
            <!-- <el-table></el-table> -->
            <div class="report-data">
              <el-tabs v-model="currentReportType" @tab-click="handleReportTypeChange">
                <el-tab-pane name="ERROR">
                  <span slot="label"><span style="color:#D86344; margin-right: 5px;"><i class="el-icon-error"></i> </span>错误({{reportWrongData.length}})</span>
                </el-tab-pane>
                <el-tab-pane label="警告" name="WARNING">
                  <span slot="label"><span style="color:#E99929; margin-right: 5px;"><i class="el-icon-warning"></i></span> 警告({{reportWarningData.length}})</span>
                </el-tab-pane>
                <el-tab-pane label="提示" name="INFO">
                  <span slot="label"><span style="margin-right: 5px;margin-left: -40px;"><i class="el-icon-info" style="color:#4D82B8;"></i></span> 提示({{reportTipsData.length}})</span>
                </el-tab-pane>
              </el-tabs>
              <div class="tablbe-conta">
                <el-table
                  ref="table"
                  class="el-table"
                  :data="reportShowData"
                  :stripe="true"
                  :height="reportTableHeight"
                  header-row-class-name="table-head-row"
                  header-cell-class-name="table-header-cell"
                  :row-class-name="getTableRowClass"
                  cell-class-name="table-cell"
                  @row-click="handleRowClick"
                >
                  <el-table-column
                    label="序号"
                    type="index"
                    width="100"
                  ></el-table-column>
                  <el-table-column
                    prop="name"
                    label="类型"
                    width="100"
                  >
                    <template slot-scope="scope">
                      {{reportTypeMap[scope.row.l]}}
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="描述"
                    prop="m"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    prop="p"
                    label="对象"
                    show-overflow-tooltip
                  ></el-table-column>
                </el-table>
              </div>
            </div>
          </div>
          <div :class="['outline-container', {shrink: shrink}]" v-show="showOutline">
            <!-- <div class="navigator-header" @click="shrink = !shrink"><img :src="navigatorImg" alt="" /><span class="name">导航</span><div class="triangle"><span></span><span></span></div></div> -->
            <div class="navigator-header" :class="{'small-width': shrink}" @click="shrink = !shrink"><span class="name">导航栏</span><div class="icon-box"><i class="el-icon-arrow-left"></i><i class="el-icon-arrow-left"></i></div></div>
            <div id="graph-outline" class="graph-outline"></div>
            <div v-if="!shrink" class="bottom-line"></div>
            <div v-show="!shrink" class="none-before search-pn">
              <el-input-number :min="10" :max="500" :step="20" :controls="false" @change="sliderChange" ref="scaleInput1" v-model="scale"></el-input-number><span>%</span>
            </div>
            <div class="resize-wrapper">
              <div class="img-wrapper" style="margin-right: 15px;" @click="minView">
                <!--              <img :src="reduceImg" />-->
                <i class="el-icon-remove-outline"></i>
              </div>

              <el-slider class="slider-wrapper" :format-tooltip="formatTooltip" :min="10" :max="500" :step="20" v-model="scale" @change="sliderChange"></el-slider>
              <div class="img-wrapper" style="margin-left: 10px;" @click="maxView">
                <!--              <img :src="plusImg" />-->
                <i class="el-icon-circle-plus-outline"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="bottom-tool">
          <div class="none-before search-pn">
            <i class="el-icon-minus" @click="minView"></i>
            <el-input-number :min="10" :max="500" :step="20" :controls="false" @change="sliderChange" ref="scaleInput2" v-model="scale"></el-input-number><span class="percent2">%</span>
            <i class="el-icon-plus" @click="maxView"></i>
          </div>
          <div v-if="!disabledEdit" class="buttons">
            <div class="button-container">
              <datablau-button type="icon" class="iconfont" :class="isFullScreen?'icon-suoxiao':'icon-fangda1'" @click="toggleFullScreen"></datablau-button>
            </div>
          </div>
          <div class="total-count">
            当前数量：{{entityTotalCount}}
          </div>
          <div style="margin-right: 10px;">
            模型类型: {{modelType}}
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="editorType === 'table'" v-loading="loading.status" class="citic-card-tabs new-style model-graph-container">
      <datablau-dialog
        width="240"
        :title="$store.state.$v.dataEntity.viewDetails"
        append-to-body
        close-on-click-modal
        :visible.sync="viewDialog.visible"
      >
        <datablau-table
          class="datablau-table"
          :show-header="false"
          :data="[{key: $store.state.$v.tagMgr.name, value: viewDialog.data.Name}, {key: $store.state.$v.dataEntity.definition, value: viewDialog.data.Definition},{key: 'SQL', value: viewDialog.data.SQL}]">
          <el-table-column prop="key" :width="120"></el-table-column>
          <el-table-column prop="value">
            <template slot-scope="scope">
              <div v-html="scope.row.value"></div>
            </template>
          </el-table-column>
        </datablau-table>
        <el-button style="margin-top:1em;" size="small" @click="viewDialog.visible = false">
          {{ $store.state.$v.report.close }}
        </el-button>
      </datablau-dialog>
      <slot name="publish"></slot>
      <!--<div v-if="currentId !== 0 && showEREdit" class="edit-model-btn" @click.stop="goEditPage(currentModel)">
        <img :src="editImg"/>
        <span>编辑主题</span>
      </div>-->
      <datablau-tabs
        :type="from === 'tables' ? 'card' : ''"
        class="detail-wrapper "
        :style="from === 'graph' ? 'margin: 0 20px': ''"
        :class="{hideAfter:tables.length === 0 && from === 'tables','report-outer-tabs':from === 'tables'}"
        v-model="currentTab"
        @tab-remove="removeTab">

        <!--实体关系图-->
        <!--模型详情 实体/表 tab 不展示-->
        <el-tab-pane
          v-if="from !== 'tables'"
          :label="$store.state.$v.erGraph.erGraph"
          key="graph"
          name="graph"
        >
          <div class="model-graph-page">
            <el-dialog :title="dialog.title" width="600px" :visible.sync="dialog.visible" append-to-body>
              <el-table
                :data="dialog.data"
                class="datablau-table"
                :show-header="false">
                <el-table-column property="key" label="" width="100"></el-table-column>
                <el-table-column label="">
                  <template slot-scope="scope">
                    <span v-html="nl2br(scope.row.value)"></span>
                  </template>
                </el-table-column>
              </el-table>
            </el-dialog>
            <div id="container"
                 :class="{fixed:fixed, 'show-report': showReport}">
              <div id="consa-graph"></div>
              <div class="drap-box" :class="{fixed:fixed}">
                <datablau-button
                  style="min-width: auto;height: 30px;margin-left: 10px;"
                  type="secondary"
                  class="button-container iconfont"
                  :class="fixed ? 'icon-suoxiao' : 'icon-fangda1'"
                  @click="changeFullScreen"
                  :title="$store.state.$v.erGraph.fullScreen">
                </datablau-button>
                <datablau-select
                  v-model="value9"
                  filterable
                  remote
                  reserve-keyword
                  clearable
                  :placeholder="$store.state.$v.erGraph.tip"
                  :remote-method="remoteMethod"
                  size="small"
                  style="width:240px;height:30px;margin-left:10px;"
                  isIcon="iconfont icon-search"
                  class="search-panel"
                  @change="handleSelect"
                >
                  <el-option
                    v-for="item in options4"
                    :key="item.label"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </datablau-select>
                <datablau-button
                  type="secondary"
                  size="small"
                  style="height: 30px;margin-left: 10px;vertical-align: middle;line-height: 30px;"
                  :title="$store.state.$v.erGraph.dataRules"
                  @click="handleDataReportChange"
                  class="data-standard iconfont icon-menu-blsx">
                  数据规范
                </datablau-button>
                <el-dropdown
                  class="filter-drop"
                  :hide-on-click="false"
                  trigger="click"
                  placement="bottom-start"
                  @command="beforeHandleCommand"
                  ref="filterDropDown">
                  <div class="el-dropdown-link right-line" :class="{relative:!toolSelection1}">
                    <datablau-button
                      type="secondary"
                      style="height: 30px;margin-left: 10px;min-width: unset;"
                      size="small">
                      <img style="position: relative;top: -2px;" :src="showTypeImg" draggable="false" alt=""/>
                    </datablau-button>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="dataType">
                        <el-checkbox :value="showDataType"></el-checkbox>
                        字段数据类型
                      </el-dropdown-item>
                      <el-dropdown-item command="allColumn" divided>
                        <el-checkbox :value="showAllColumn"></el-checkbox>
                        显示所有字段
                      </el-dropdown-item>
                      <el-dropdown-item command="keyColumn">
                        <el-checkbox :value="showKeyColumn"></el-checkbox>
                        仅显示键字段</el-dropdown-item>
                      <el-dropdown-item command="noColumn">
                        <el-checkbox :value="showNoColumn"></el-checkbox>
                        仅显示表名</el-dropdown-item>
                      <el-dropdown-item divided command="logicalName">
                        <el-checkbox :value="showLogicalName"></el-checkbox>
                        业务名称</el-dropdown-item>
                      <el-dropdown-item command="physicalName">
                        <el-checkbox :value="showPhysicalName"></el-checkbox>
                        物理名称</el-dropdown-item>
                    </el-dropdown-menu>
                    <p v-show="toolSelection1" class="disc">筛选</p>
                  </div>
                </el-dropdown>
                <!--<datablau-button
                  size="small"
                  type="secondary"
                  class="icon--38--3"
                  style="margin-left: 20px;"
                  @click="doLayout"
                  tooltipContent="自动布局"
                >
                </datablau-button>-->
              </div>
              <div class="report-container" :class="{'show-outline': showOutline}">
                <!-- <el-table></el-table> -->
                <datablau-button @click="handleDataReportChange" style="float: right;margin-right: 20px;position: relative;z-index: 1;" type="icon" class="iconfont icon-false"></datablau-button>
                <div class="report-data">
                  <datablau-tabs v-model="currentReportType" @tab-click="handleReportTypeChange">
                    <el-tab-pane name="ERROR">
                      <span slot="label"><span style="color:#D86344; margin-right: 5px;"><i class="el-icon-error"></i> </span>{{$store.state.$v.erGraph.error}}({{reportWrongData.length}})</span>
                    </el-tab-pane>
                    <el-tab-pane label="警告" name="WARN">
                      <span slot="label"><span style="color:#E99929; margin-right: 5px;"><i class="el-icon-warning"></i></span> {{$store.state.$v.erGraph.warning}}({{reportWarningData.length}})</span>
                    </el-tab-pane>
                    <el-tab-pane label="提示" name="INFO">
                      <span slot="label"><span style="margin-right: 5px;"><i class="el-icon-info" style="color:#4D82B8;"></i></span> {{$store.state.$v.erGraph.tips}}({{reportTipsData.length}})</span>
                    </el-tab-pane>
                  </datablau-tabs>
                  <div class="tablbe-conta" v-loading="rulecheck">
                    <datablau-table
                      ref="table"
                      class="el-table"
                      :data="reportShowData"
                      :stripe="true"
                      :height="reportTableHeight"
                      header-row-class-name="table-head-row"
                      header-cell-class-name="table-header-cell"
                      :row-class-name="getTableRowClass"
                      cell-class-name="table-cell"
                      @row-click="handleRowClick"
                    >
                      <el-table-column
                        :label="$store.state.$v.erGraph.index"
                        type="index"
                        width="100"
                      ></el-table-column>
                      <el-table-column
                        prop="name"
                        :label="$store.state.$v.dataEntity.type"
                        width="100"
                      >
                        <template slot-scope="scope">
                          {{reportTypeMap[scope.row.l]}}
                        </template>
                      </el-table-column>
                      <el-table-column
                        :label="$store.state.$v.report.description"
                        prop="m"
                        show-overflow-tooltip
                      ></el-table-column>
                      <el-table-column
                        prop="p"
                        :label="$store.state.$v.erGraph.obj"
                        show-overflow-tooltip
                      ></el-table-column>
                    </datablau-table>
                  </div>
                </div>
              </div>
              <div :class="['outline-container', {shrink: shrink}, {'show-report': showReport}]" v-show="showOutline">
                <div class="navigator-header" :class="{'small-width': shrink}" @click="shrink = !shrink"><span class="name">导航栏</span><div class="icon-box"><i class="el-icon-arrow-left"></i><i class="el-icon-arrow-left"></i></div></div>
                <div id="graph-outline" class="graph-outline"></div>
                <div class="bottom-line"></div>
                <div v-show="!shrink" class="none-before search-pn">
                  <el-input-number :min="10" :max="1000" :step="50" :controls="false" @change="sliderChange" ref="scaleInput1" v-model="scale"></el-input-number><span>%</span>
                </div>
                <div class="resize-wrapper">
                  <div class="img-wrapper" style="margin-right: 10px;" @click="minView">
                    <!--              <img :src="reduceImg" />-->
                    <i class="el-icon-remove-outline"></i>
                  </div>

                  <el-slider class="slider-wrapper" :format-tooltip="formatTooltip" :min="10" :max="1000" :step="50"
                             v-model="scale" @change="sliderChange"></el-slider>
                  <div class="img-wrapper" style="margin-left: 10px;" @click="maxView">
                    <!--              <img :src="plusImg" />-->
                    <i class="el-icon-circle-plus-outline"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!--实体表-->
        <el-tab-pane
          v-show="showTabOfTables"
          v-if="currentPane === 'tables'"
          :label="$store.state.$v.dataEntity.entity"
          key="tables"
          name="tables"
        >
          <tables
            ref="partTables"
            v-if="dataReady"
            :from="from"
            :current-name="currentName"
            :current-model="currentModel"
            :data-by-type="dataByType"
            :current-id="currentId"
            :isLogicalModel="isLogicalModel"
            :isConceptual="isConceptual"
            :isCassandraOrMongoDB="isCassandraOrMongoDB"
            :diagramsLoading="diagramsLoading"
            @handleDialogData="showTabDetail"
            @handleDialogDataEdit="editTabDetail"
            @updateVersion="updateVersion"
            @showViewDetail="showViewDetail"
          ></tables>
        </el-tab-pane>
        <el-tab-pane
          v-else
          :label="isLogicalModel ? $store.state.$v.modelDetail.dataEntityList : $store.state.$v.modelDetail.tableList"
          key="tables"
          name="tables"
        >
          <tables
            ref="tables"
            v-if="dataReady"
            :from="from"
            :current-name="isLogicalModel ? $store.state.$v.modelDetail.dataEntityList : $store.state.$v.modelDetail.tableList"
            :current-model="currentModel"
            :data-by-type="dataByType"
            :current-id="currentId"
            :isLogicalModel="isLogicalModel"
            :isConceptual="isConceptual"
            :isCassandraOrMongoDB="isCassandraOrMongoDB"
            :diagramsLoading="diagramsLoading"
            @handleDialogData="showTabDetail"
            @handleDialogDataEdit="editTabDetail"
            @updateVersion="updateVersion"
            @showViewDetail="showViewDetail"
          ></tables>
        </el-tab-pane>
        <el-tab-pane
          v-for="(v,k) in tables"
          :label="tabLabelFormatter(v)"
          closable
          :key="'tableDetals'+k"
          :name="v.tableMsg.Id + ''">
          <table-details
            :loading="loading"
            :reNameColumnType="reNameColumnType"
            :editorType="editorType"
            :key="v.tableMsg.Id"
            :deliverNum="deliverNum"
            :TypeUniqueIdToColumnDefaultType="TypeUniqueIdToColumnDefaultType"
            :tableDialogKey="tableDialogKey"
            ref="tableDetailsEdit"
            :rawData="v"
            :current-model="currentModel"
            :data-by-type="dataByType"
            :isLogicalModel="isLogicalModel"
            :isDesignModel="isDesignModel"
            :getTableHTMLFunction="getTableHTMLFunction"
            :startIdToEndIds="startIdToEndIds"
            :createDeepRelation="createDeepRelation"
            :calculateStartIdToEndIds="calculateStartIdToEndIds"
            :cellDialogData="cellDialogData"
            :currentStyleRelatedShapeTemplate="currentStyleRelatedShapeTemplate"
            :formatThemeTemplateData="formatThemeTemplateData"
            :currentId="currentId"
            :isCassandraOrMongoDB="isCassandraOrMongoDB"
            :isLogical="isLogical"
            :isConceptual="isConceptual"
            :getTableNameNamingMap="getTableNameNamingMap"
            :getColumnNameNamingMap="getColumnNameNamingMap"
            :getIndexNameNamingMap="getIndexNameNamingMap"
            :categoryOrder="categoryOrder"
            :isShowSchema="isShowSchema"
            @changeDialogWidth="changeDialogWidth"
            :LayerEdit="LayerEdit"
            :graph="graph"
            :Changes="Changes"
            @openColumnDialog="openColumnDialog"
            @updateTabName="updateTabName"
            @updateVersion="updateVersion"
            @updateTableData="updateTableData"
            @handleDialogData="closeTableDetail">
          </table-details>
        </el-tab-pane>
        <el-tab-pane
          v-for="(v,k) in views"
          :label="tabLabelFormatter(v)"
          closable
          :key="'viewDetails' + k"
          :name="v.tableMsg.Id + ''">
          <view-details
            :loading="loading"
            :reNameColumnType="reNameColumnType"
            :editorType="editorType"
            :key="v.tableMsg.Id"
            :deliverNum="deliverNum"
            :TypeUniqueIdToColumnDefaultType="TypeUniqueIdToColumnDefaultType"
            ref="viewDetailsEdit"
            :rawData="v"
            :isDesignModel="isDesignModel"
            :current-model="currentModel"
            :data-by-type="dataByType"
            :isLogicalModel="isLogicalModel"
            :getViewHTMLFunction="getViewHTMLFunction"
            :cellDialogData="cellDialogData"
            :currentStyleRelatedShapeTemplate="currentStyleRelatedShapeTemplate"
            :formatThemeTemplateData="formatThemeTemplateData"
            :currentId="currentId"
            :graph="graph"
            :Changes="Changes"
            :getTableNameNamingMap="getTableNameNamingMap"
            :getColumnNameNamingMap="getColumnNameNamingMap"
            :getIndexNameNamingMap="getIndexNameNamingMap"
            :categoryOrder="categoryOrder"
            :isShowSchema="isShowSchema"
            @openViewColumnDialog="openViewColumnDialog"
            @changeDialogWidth="changeDialogWidth"
            @handleDialogData="closeTableDetail">
          </view-details>
        </el-tab-pane>
      </datablau-tabs>
    </div>
  </div>
</template>

<script>
import modelGraph from './modelGraphEdit.js'
export default modelGraph
</script>
<style lang="scss" scoped="scoped">
  @import './scoped';
  /deep/ .is-edit .el-table .cell{
    overflow: unset;
    & .el-form-item--mini .el-form-item__content {
      height: 30px;
      overflow: hidden;
    }
  }
  .top-tips {
    h2 {
      font-weight: normal;
      font-size: 16px;
      display: inline-block;
      margin-right: 6px;
    }
    color: #555;
    font-size: 12px;
    line-height: 50px;
    .iconfont {
      font-size: 14px;
    }
  }
  .model-graph-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    .outline-container {
      bottom: 32px;
      right: 32px;
    }
    #consa-graph {
      top: 40px;
      left: 0;
      right: 0;
      bottom: 20px;
      transform: translate3d(0, 0, 0);
    }
    #container {
      .drap-box {
        position: absolute;
        top: 5px;
        left: -10px;
        background: #fff;
        height: 30px;
        display: flex!important;
        align-items: center;
        /*border-bottom: 1px solid #efefef;*/
        /deep/ .el-select .el-input input {
          height: 30px;
        }
        &.fixed {
          top: 5px;
        }
      }
      &.fixed {
        top: 0;
        #consa-graph {
          top: 40px;
        }
      }
    }
  }
  .citic-card-tabs.new-style {
    .detail-wrapper.datablau-tabs {
      top: 0;
    }
    /deep/ .report-outer-tabs.datablau-tabs > .el-tabs {
      position: absolute;
      top: -5px;
      left: 2px;
      right: 0;
      bottom: 0;

      & > .el-tabs__header {
        padding-left: 8px;
        border-bottom: 1px solid  #EFEFEF;

        .el-tabs__nav > .el-tabs__item {
          border-left: 1px solid #ddd !important;
          font-size: 12px;
          border: none;
          border-left: none !important;
          height: 32px !important;
          line-height: 32px !important;
          margin-left: 0 !important;

          &.is-active {
            border-color: #409eff !important;
            border-top: 2px solid #409EFF;
            color: #409EFF !important;
            background: rgba(64, 158, 255, .1);
          }

          &:first-child {
            // padding-left: 20px;
            font-size: 14px;
            color: #555;
            line-height: 40px;
            // border: none !important;
            border-color: transparent !important;
            border-top: 2px solid transparent;
            vertical-align: baseline;
            margin-right: 1px;
            background:  none;

            // &:after {
            //   content: '/';
            //   margin-left: 5px;
            //   display: inline-block;
            //   color: #ddd;
            // }
          }

          & + .el-tabs__item {
            margin-left: 5px;
          }
        }
      }

      & > .el-tabs__content {
        position: absolute;
        top: 30px;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: auto;
      }
    }
    /deep/ .hideAfter.datablau-tabs {
      .el-tabs__item:first-child {
        color: #555 !important;
      }
      .el-tabs__item::after {
        display: none !important;
      }

      & > .el-tabs {
        & > .el-tabs__header {
          .el-tabs__nav > .el-tabs__item {
            &.is-active {
              color: #555!important;
            }
          }
        }
      }
    }
    /deep/ .hideTab.datablau-tabs {
      .el-tabs__nav > .el-tabs__item:first-child {
        color: #555 !important;

        &::after {
          display: none !important;
        }
      }
    }
    /deep/ .datablau-tabs.detail-wrapper .el-tabs {
      position: absolute;
      top: 0px;
      left: 0;
      right: 0;
      bottom: 0;
      .el-tabs__header {
        .el-tabs__nav > .el-tabs__item {
          font-size: 12px;
          line-height: 28px;
          height: 28px;

          .el-icon-close {
            top: -2px;
            font-size: 14px;
          }
        }
      }
      .el-tabs__content {
        position: absolute;
        top: 30px;
        left: 0;
        right: 0;
        bottom: 0;
      }
    }
  }
  .el-select-dropdown__item {
    padding-left: 10px;
    height: 30px;
    line-height: 30px;
    font-size: 12px;
  }
  .style-editor-wrapper .el-tabs /deep/ .el-tabs__item {
    font-size: 12px;
    color: #555;
  }
  /deep/ .el-dialog .el-textarea__inner {
    min-height: 10px !important;
    height: auto;
  }
  .el-dialog__wrapper:not(.checkin-version-wrapper) {
    transition-duration: .8s;
  }
  .dialog-fade-enter-active:not(.checkin-version-wrapper) {
    animation: none !important;
  }
  .dialog-fade-leave-active:not(.checkin-version-wrapper) {
    transition-duration: 0.8s !important;
    animation: none !important;
  }

  .dialog-fade-enter-active:not(.checkin-version-wrapper) /deep/ .el-dialog,
  .dialog-fade-leave-active:not(.checkin-version-wrapper) /deep/ .el-dialog{
    animation-fill-mode: forwards;
  }

  .dialog-fade-enter-active:not(.checkin-version-wrapper) /deep/ .el-dialog{
    animation-duration: .8s;
    animation-name: anim-open;
    animation-timing-function: cubic-bezier(0.6,0,0.4,1);
  }
  .dialog-fade-leave-active:not(.checkin-version-wrapper) /deep/ .el-dialog{
    animation-duration: .8s;
    animation-name: anim-close;
  }
  @keyframes anim-open {
    0% { right: -1000px; }
    100% { right: 0; }
  }
  @keyframes anim-close {
    0% { right: 0; }
    100% { right: -1000px; }
  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity .2s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
  /deep/ .el-timeline-item__timestamp.is-bottom {
    margin-top: 14px;
  }
  .filter-drop {
    .el-dropdown-link {
      width: 44px;
    }
  }
  .el-dropdown-menu {
    padding: 6px 0;
  }
  .el-dropdown-menu__item {
    padding: 0 10px;
  }
  .el-dropdown-menu__item--divided:before {
    display: none;
  }
  .el-dropdown-menu__item--divided {
    margin-top: 0;
  }
  .el-dropdown-menu__item {
    font-size: 12px;
  }
  #consa-graph {
    border:unset
  }
  /deep/ .el-checkbox-button:first-child .el-checkbox-button__inner {
    border-radius: unset;
  }
  .history-class {
    font-size: 12px;
    /deep/ .el-popover {
      padding: 16px 7px 5px 16px;
    }
    /deep/ .el-timeline {
      font-size: 12px;
      overflow-x: hidden!important;
      overflow-y: auto!important;
    }
    .title {
      position: relative;
      margin-bottom: 13px;
      color: #555;
      font-size: 14px;
      .sum {
        color: #777;
      }
      .undo-btn {
        position: absolute;
        top: -2px;
        right: 59px;
        min-width: 44px;
        box-sizing: border-box;
        height: 22px;
        line-height: 22px;
      }
      .redo-btn {
        position: absolute;
        top: -2px;
        right: 7px;
        min-width: 44px;
        box-sizing: border-box;
        height: 22px;
        line-height: 22px;
      }
    }
  }
  .el-timeline-item {
    /deep/ {
      .el-timeline-item__node--info {
        background-color: #fff;
        border: 1px solid #999999;
      }
      .el-timeline-item__node--normal {
        top: 3px;
        left: 3px;
        width: 8px;
        height: 8px;
      }
      .el-timeline-item__wrapper {
        left: 2px;
        top: -1px;
        padding-left: 16px;
        &:hover {
          span {
            color: #409EFF!important;
          }
        }
      }
      .el-timeline-item__tail {
        left: 6px;
        top: 3px;
      }
    }
    &:hover /deep/ .el-timeline-item__content span {
      color: #409EFF;
    }
    &.history-unused /deep/ .el-timeline-item__content span {
      color: #999;
    }
  }
  .active /deep/ {
    .el-timeline-item__content {
      color: #409EFF;
    }
    .el-timeline-item__node {
      background-color: #409EFF;
      border: 1px solid #409EFF;

      &:before {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        bottom: -4px;
        right: -4px;
        border: 1px solid #409EFF;
        border-radius: 50%;
      }
    }
  }
  /deep/ .el-timeline-item__tail {
    border-color: #dddddd;
    left: 6px;
    border-left: 1px solid #dddddd;
  }
  /deep/ .el-timeline-item__content {
    span {
      color: #555555;
      &:hover {
        color: #409EFF;
      }
    }
  }
  /deep/ .el-timeline-item__node--normal {
    left: 0;
  }
  .bottom-tool {
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
    height: 30px;
    background: #fafafa;
    padding: 0 20px;
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
    border-top: 1px solid #ddd;
    .buttons {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 15px;
      border-left: 1px solid #dddddd;
      border-right: 1px solid #dddddd;
      .button-container {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        .is-block.icon {
          color: #999;
        }
      }

    }
    .total-count {
      margin-right: 10px;
      font-size: 12px;
      font-weight: 400;
      color: #555555;
    }
    .el-icon-minus,.el-icon-plus {
       color: #555;
       cursor: pointer;
       &:hover {
         color: #409EFF;
       }
     }
     .percent2 {
      bottom: -1px;
     }
  }
  .switch-item {
      position: relative;
      width: 100%;
      height: 24px;
      line-height: 24px;
      padding-left: 24px;
      &:hover {
        background: rgba(64,158,255,0.10);
      }
       i {
        position: absolute;
        top: 5px;
        left: 5px;
      }

  }
  .switch-tool {
    position: absolute;
    top: 6px;
    right: 15px;
    font-size: 24px;
    cursor: pointer;
  }
  .style-setting {
    padding-top: 6px;
    margin-left: 20px;
    height: 100%;
    .el-checkbox-button, .el-checkbox-button__inner {
      margin-right: 6px;
    }
    /deep/ .el-checkbox-button__inner {
      color: #777;
    }
    .is-checked  /deep/ .el-checkbox-button__inner {
      color: #409EFF;
      background-color: unset;
      border-color: unset;
      box-shadow: unset;
    }
    .is-disabled  /deep/ .el-checkbox-button__inner {
      color: #C0C4CC;
    }
    /deep/ .el-select:nth-of-type(1) {
      .el-input__inner {
        border-radius: 2px 0px 0 2px;
      }
    }
    /deep/ .el-select:nth-of-type(2) {
      .el-input__inner {
        border-radius: 0px 2px 2px 0px;
      }
    }
    .el-checkbox-group {
      display: inline-block;
      position: relative;
      bottom: 4px;
    }
    .text-color {
      position: relative;
      top: 2.5px;
      display: inline-block;
      font-size: 14px;
      cursor: pointer;
      margin-left: 3px;
      color: #777;
      .el-icon-caret-bottom {
        color: #999999;
      }
      .bottom {
        width: 8px;
        height: 2px;
        position: relative;
        bottom: 3px;
      }
       &.disabled {
        color: #999;
        cursor:  not-allowed;
        opacity: 0.5;
        .bottom {
          background-color: unset !important;
        }
      }
    }
    .bg-color {
      display: inline-block;
      img {
        width: 19px;
        height: 19px;
      }
      .el-icon-caret-bottom {
        color: #999999;
      }
      .bottom {
        position: relative;
        bottom: 6px;
        width: 20px;
        height: 6px;
        border: 1px solid #999;
        background-color: #fff;
      }
      &.disabled {
        color: #999;
        cursor:  not-allowed;
        opacity: 0.5;
        .bottom {
          background-color: rgb(221,221,221) !important;
        }
      }
    }
    .text-tool.set-tab {
      padding-left: 0;
      position: relative;
      bottom: 4px;
    }
    /deep/ .el-input--mini .el-input__inner {
      height: 22px;
      border-radius: 0;
    }
    /deep/ .el-input__icon {
      line-height: 22px;
    }
    /deep/ .el-radio-button__inner,/deep/.el-checkbox-button__inner {
      font-size: 14px;
    }
    /deep/ .el-color-picker--mini .el-color-picker__trigger {
      width: 24px;
      height: 24px;
    }
    /deep/ .el-color-picker__mask {
      width: 24px;
      height: 23px;
    }

  }
  .undo-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    color:rgb(177,177,177);
    font-size: 20px;
    position: relative;
    &:before {
      content: '';
      position: absolute;
      top: -5px;
      left: -5px;
      right: -5px;
      bottom: -5px;
      z-index: -1
    }
    &:hover {
      color:#000;
    }
  }
  .drag-list {
    // width: 40px;
    div {
      margin: 10px;
      position: relative;
      cursor: pointer;
      img {
        display: inline-block;
        width: 20px;
      }
      &.active:before, &:hover:before {
        content: '';
        position: absolute;
        top: -5px;
        bottom: -5px;
        left: 10px;
        right: -5px;
        border-radius: 4px;
        background: #555;
        opacity: 0.1;
        z-index: -1;
      }
       &.history:hover:before {
        left: 4px;
      }
      &.history.lv2:hover:before {
        left: 1px;
      }
    }
  }
  .search-btn {
    // border: 1px solid #ddd;
    border-radius: 30px;
    font-size: 16px;
    & > i {
      color: #999;
      padding: 7px 10px;
    }
  }
  .active-history-item {
    color: #409EFF;
  }
  .history-item {
    display: inline-block;
    cursor: pointer;
    &:hover {
      color: #409EFF;
    }
  }
  .set-tab {
    // border: 2px solid rgb(166, 166, 166);
    padding-left: 10px;
    h2, h3 {
      font-weight: normal;
    }
    .set-item {
      font-size: 12px;
      .set-title {
        font-size: 12px;
        line-height: 20px;
        margin-bottom: 5px;
        font-weight: bold;
      }
      .set-line {
        display: flex;
        align-items: center;
        align-content: space-evenly;
        // border: 1px solid rgb(166, 166, 166);
        background: #fff;
        .el-input {
          width: 100px;
        }
        .left {
          line-height: 30px;
          font-size: 12px;
          flex: 1 1 100px;
          box-sizing: border-box;
          border-right: 1px solid rgb(166, 166, 166);
          background: rgb(240, 240, 240);
          padding: 2px 5px;
        }
        .right {
          display: flex;
          align-items: center;
          font-size: 12px;
          background: #fff;
          box-sizing: border-box;
          flex: 1 1 100px;
          padding: 2px 0;
          margin: 5px 0;
        }
      }
    }
    /deep/ {
       .el-checkbox-button__inner {
        padding: 5px;
        border: unset;
      }
      .underline {
        .el-checkbox-button__inner {
          text-decoration: underline;
        }
      }
      .line-through {
        .el-checkbox-button__inner {
          text-decoration: line-through;
        }
      }
      .el-checkbox-button:last-child .el-checkbox-button__inner {
        border-radius: 0;
      }
      .el-radio-button__inner {
        min-width: 20px;
        padding: 5px;
        border: unset;
        border-radius: 0 !important;
      }
      .bold {
        .el-radio-button__inner {
          font-weight: bold;
        }
      }
      .el-radio-button__orig-radio:checked + .el-radio-button__inner {
        background-color: #409EFF;
      }
    }
  }
  .search-wrapper {
    margin-left: -10px;
    position: relative;
    right: 230px;
    width: 276px;
    & > i {
      position: absolute;
      left: 8px;
      top: 7px;
      z-index: 1;
      font-size: 16px;
      color: #999;
    }
    .search-panel {
      /deep/ input {
        padding-left: 35px;
        height: 34px;
        width: 250px;
        line-height: 34px;
      }
    }
    .hide-search-panel {
      display: inline-block;
      margin-left: 5px;
      cursor: pointer;
      font-size: 14px;
      color: #999;
    }
  }

  .search-pn {
    margin-left: 20px;
    width: 86px;
    height: 23px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    & > i {
      flex: 0 0 auto;
      &:nth-child(2) {
        margin-left: 5px;
      }
    }
    & > span {
      position: relative;
      left: -3px;
      bottom: 1px;
      flex: 0 0 auto;
      color: #555;
    }
    .el-input-number {
      position: relative;
      top: -7px;
      margin-left: 5px;
      width: 25px;
      height: 100%;
      text-align: right;
    }
    /deep/ .el-input__inner {
      border: none;
      height: 100%;
      padding: 0;
      background: unset;
      color: #555;
    }
  }
  .outline-container {
    width:242px;
    height:234px;
    position: absolute;
    right: 12px;
    bottom: 12px;
    transition: all .2s;
    background: #ffffff;
    border: 1px solid #dddddd;
    border-radius: 2px;
    box-shadow: 0px 2px 6px 0px rgba(85,85,85,0.20);
    border-top: unset;
    .navigator-header {
      position: relative;
      z-index: 10;
      width: 240px;
      padding: 0 0 0 10px;
      line-height: 26px;
      color: #3A3E44;
      font-size: 12px;
      cursor: pointer;
      background: #f5f5f5;
      border: 1px solid rgba(0,0,0,0.15);
      border-radius: 2px 2px 0px 0px;
      &.small-width {
        width: 83px;
      }
      // opacity: 0.9;
      .name {
        margin-right: 5px;
        line-height: 26px;
        display: inline-block;
      }
      img {
        width: 8px;
        margin-right: 5px;
      }
      .triangle {
        margin-right: 10px;
        height: 26px;
        display: inline-block;
        vertical-align: middle;
        float: right;
        span {
          display: inline-block;
          width: 0;
          height: 0;
          border: 6px solid transparent;
          border-right-color: #969696;
          vertical-align: middle;
        }
        span:last-child {
          margin-left: -6px;
        }
      }
      .icon-box {
        margin-right: 10px;
        height: 26px;
        display: flex;
        justify-content: center;
        align-items: center;
        float: right;
        i:last-child {
          margin-left: -8px;
        }
      }
    }
    .bottom-line {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 26px;
      border-top: 1px solid rgba(0,0,0,0.15);
      background: #fff;
    }
    .resize-wrapper {
      position: absolute;
      bottom: -7px;
      left: 80px;
      right: 0px;
      font-size: 12px;
      & > .img-wrapper {
        position: relative;
        top: -2px;
        display: inline-block;
        vertical-align: middle;
        cursor: pointer;
        width: 10px;
        user-select: none;
        &:hover > i {
          color: #409eff;
        }
        img {
          width: 10px;
          vertical-align: middle;
        }
        i {
          font-size: 14px;
          vertical-align: middle;
        }
        &:before {
          position: absolute;
          content: '';
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
        }
      }
      .slider-wrapper {
        display: inline-block;
        width: 100px;
        vertical-align: middle;
      }
      .el-icon-remove-outline, .el-icon-circle-plus-outline{
        color: #999;
      }
    }
    &.shrink {
      width: 80px;
      height: 26px;
      overflow: hidden;
      .triangle {
        transform: rotate(180deg);
      }
      .resize-wrapper {
        display: none;
      }
    }
    /deep/ {
      .el-slider__runway {
        height: 4px;
        border-radius: 2px;
        background-color: #EAEAEA;
      }
      .el-slider__button {
        width: 14px;
        height: 14px;
        box-shadow: 0px 0px 6px rgba(31, 26, 47, 0.16);
        background-color: #409EFF;
        border: none;
      }
      .el-slider__button-wrapper {
        top: -16px;
      }
    }
    .search-pn {
      margin: 0;
      position: absolute;
      left: 10px;
      bottom: 1px;
      justify-content: unset;
      width: 56px;
      height: 20px;
      border: 1px solid #ddd;
      border-radius: 2px;
    }
    .el-input-number {
      margin-right: 5px;
      top: -11px;
    }
  }
  #container {
    /deep/ .el-button {
      padding-top: 9px;
      padding-bottom: 9px;
      font-size: 16px;
      border: none;
      border-radius: 4px;
      &:hover i:before, &:focus i:before {
        color: #4386F5;
      }
    }
    /deep/ .top-title-box .infomes-box .el-button {
      border-radius: 12px;
      border: unset;
      font-size: 12px;
      padding: 0;
  }
    overflow: visible;
    bottom: 30px;
  }
  .model-graph-container{
    #container {
      bottom: 0;
    }
  }
  .warning-box {
    position: absolute;
    padding: 0 20px;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    width: 566px;
    height: 50px;
    background: #ffeded;
    border: 1px solid rgba(255,75,83,0.51);
    border-radius: 2px;
    font-size: 16px;
    font-weight: 400;
    color: #ff4b53;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 999;
    .is-block.normal {
      background: unset;
      min-width: unset;
      width: 50px;
      height: 24px;
      line-height: 24px;
    }
  }
  .drag-box {
    &.disabled-edit {
      display: none;
    }
    position: absolute;
    top: -54px;
    left: -269px;
    height: 56px;
    background: #ffffff;
    box-shadow: 0px 2px 8px 0px rgba(0,0,0,0.10);
    right: 0;
    display: flex;
    align-items: center;
    /deep/ .el-header{
      position: absolute;
      top: -30px;
      left: -1px;
      right: 0;
    }
    &.no-tool-selection {
      & > li {
        width: 55px;
        height: 36px!important;
        img {
          width: 30px;
          height: 30px;
        }
        &.active:before, &:hover:before {
          width: 55px;
        }
      }
    }
    .disabled-img {
      opacity: 0.5;
    }
    .lv2 {
      img {
        display: block;
        margin: 0 auto;
        width: 21px;
        height: 21px;
      }
    }
    .none-before {
      position: absolute;
      right: 78px;
    }
    .button-box {
      position: absolute;
      right: 0;
      height: 100%;
      div {
        width: 90px;
        height: 27px;
        font-size: 12px;
        font-weight: normal;
        color: #999999;
        line-height: 27px;
        text-align: center;
        cursor: pointer;
      }
      .top-button {
        &:hover {
          color: #539FFD;
        }
        background: url('../../../../public/static/image/er/tool-bg/top.svg');
      }
      .bottom-button {
        &:hover {
          color: #539FFD;
        }
        position: relative;
        top: 2px;
        background: url('../../../../public/static/image/er/tool-bg/bottom.svg');
      }
      // .active {
      //   background:#fff;
      //   color: #4496ff;
      // }
      .text-wrapper1,.text-wrapper2{
        position: absolute;
        top:0;
        height: 27px;
        color: #999999;
        z-index: 1;
        &.actived {
          color: #4496ff;
        }
      }
      .text-wrapper2 {
        top: 29px;
      }
      .bg-box {
        position: absolute;
        top: 0;
        background: #fff;
        transition: top linear 0.2s;
        &.top {
          top:0
        }
        &.bottom {
          top: 29px;
        }
      }
    }
    .menu-box {
      padding-top: 5px;
      position: absolute;
      top: 48px;
      width: 110px;
      height: 60px;
      background: #ffffff;
      border: 1px solid #dddddd;
      border-radius: 2px;
      box-shadow: 0px 2px 6px 0px rgba(85,85,85,0.20);
      .item {
        position: relative;
        padding-left: 27px;
        width: 109px;
        height: 24px;
        line-height: 24px;
        font-size: 12px;
        font-weight: 400;
        color: #555555;
        &:hover {
          background: rgba(64,158,255,0.10);
        }
          i {
          position: absolute;
          top: 5px;
          left: 5px;
        }
      }
    }
    .disc {
      font-size: 12px;
      font-weight: normal;
      color: #777777;
      // transform: scale(0.9);
      text-align: center;
      padding-top: 4px;
    }
    .grey .disc {
      color: #ddd;
    }
    .exit-btn {
      height: 34px;
      .el-button {
        font-size: 12px!important;
        background: rgba(255, 255, 255, 0);
        border-radius: 15px!important;
        border: 1px solid #999!important;
        color: #555;
        &:hover {
          color: rgb(64, 158, 255);
          border-color: rgb(64, 158, 255)!important;
        }
      }
      position: absolute!important;
      right: 0;
      top: 9px;
    }
    .user-btn {
      display: flex;
      align-items: center;
      position: absolute!important;
      right: 110px;
      color: #555;
      img {
        width: 20px;
        margin-right: 10px;
      }
    }
    & > li.dictionary.first {
      &.active:before, &:hover:before {
        left: 20px;
      }
    }
    & > li {
      flex: 0 0 auto;
      opacity: 1;
      position: relative;
      box-sizing: content-box;
      width: 44px;
      height: 40px;
      cursor: pointer;
      margin: 0 5px;
      position: relative;
      &.disabled {
        cursor: not-allowed;
      }
      &:hover {
        i {
          color: #539FFD;
        }
      }
      &.big {
        padding: 0 20px;
      }
      img {
        display: block;
        margin: 0 auto;
      }
      &.unactive {
        height: 25px;
      }
      & > .unsave-num {
        position: absolute;
        top: -12px;
        right: -3px;
        font-size: 14px;
        color: red;
      }
      &.none-before:hover:before {
        display: none;
      }
      &.active:before, &:hover:before {
        content: '';
        position: absolute;
        top: -5px;
        bottom: -5px;
        left: 0px;
        border-radius: 4px;
        background: #555;
        opacity: 0.1;
        right: 0;
        width: 46px;
      }
      &.history {
        &.active:before, &:hover:before {
          width: 53px;
        }
      }
    }
    & > .right-line {
      padding-right: 10px;
      border-right: 1px solid #ddd;
    }
    & > li.right-line + li {
      // padding-left: 20px;
      &.active:before, &:hover:before {
        // left: 15px;
      }
    }
    .relative {
      position: relative;
      top: -2px;
    }
    li.undo-class {
      // padding-right: 10px;
    }
    img {
      position: relative;
      width: 20px;
      height: 20px;
      vertical-align: top;
      display: inline-block;
    }
    .el-timeline-item {
      position: relative;
      padding-bottom: 1px;
      overflow: hidden;
    }
  }
  .table-column-wrapper {
    margin-top: 10px;
    & > span {
      margin-right: 10px;
    }
    & > .el-input {
      margin-right: 10px;
      width: 200px;
    }
    .icon {
      font-size: 16px;
      cursor: pointer;
      margin-left: 10px;
    }
  }
  /deep/ .show {
    position: relative;
    &:before {
      content: '';
      position: absolute;
      left: 5px;
      right: 5px;
      top: 0;
      bottom: 0;
      background-color: rgba(142, 252, 0, 0.5);
      border-radius: 5px;
      border: 1px dashed grey;
    }
    &.child:before {
      background-color: rgba(135, 206, 235, 0.5);
    }
  }
  /deep/ .history-class:hover .el-collapse-item__arrow{
    transform: rotate(90deg);
  }
  .style-editor-wrapper /deep/ {
    .el-tabs__item {
      font-size: 12px;
    }
    .el-tabs__item.is-active {
      color: initial;
    }
  }
</style>
<style lang="scss">
  @import './graph';
  input::-webkit-input-placeholder {
      font-size: 12px;
  }
 .el-dialog__wrapper  .naming-option-dialog.el-dialog .el-dialog__body {
    .datablau-dialog-content {
      overflow: unset;
    }
 }
 .naming-option-dialog,.er-dictionary,.er-setting {
  width: 800px;
   .el-dialog__headerbtn {
    top: 15px;
   }
 }
  .style-box {
    .el-color-picker--mini {
      margin-right: 10px!important;
    }
    #opacity-component {
      margin-right: 20px!important;
    }
  }
  .edit-style-dialog-content-wrapper {
    text-align: left;
    li + li {
      margin-top: 10px;
    }
  }
  // .mxPopupMenuIcon img {
  //   width: 20px;
  //   height: auto;
  // }
  .pd-15 {
    padding: 0 7px;
  }
  .el-dialog__wrapper {
    overflow: hidden;
  }
  .full-screen .er-modify-dialog-wrapper {
    top: 56px;
  }
  .er-modify-dialog-wrapper {
    position: absolute;
    top: 86px;
    bottom: 0;
    right: 0;
    margin: 0!important;
    /*transition: all .4s;*/
    /*box-shadow: -8px -2px 8px 0 rgba(0,0,0,0.1) inset, 0 2px 8px 0 rgba(0,0,0,0.1);*/
    .el-checkbox-button {
       .el-checkbox-button__inner {
        color: #777;
      }
      &.is-checked {
        .el-checkbox-button__inner {
          color: #409EFF;
          background-color: unset;
          border-color: unset;
          box-shadow: unset;
        }
      }
      &.is-disabled {
        .el-checkbox-button__inner {
          color: #C0C4CC;
        }
      }
    }
  }
  .el-dialog__headerbtn {
    z-index: 2;
  }
  .svg-col:hover,
  .svg-col.active
  {
   background-color:  rgb(173,216,230)!important;
  }
  .drag-wrapper.el-popover {
    min-width: 60px;
    padding: 0px;
  }
  .red-bg-color {
    background: #F56C6C!important;
    border-color: #F56C6C!important;
  }
</style>
<style lang="scss">
  .subtype-shape {
    height: 100%;
  }
  .udp-class-title-hint {
    position: relative;
    display: inline-block;
    padding-left: 10px;
    font-size: 14px;
    font-weight: normal;
    color: #555;
    line-height: 14px;
    height: 14px;
    &:before {
      position: absolute;
      top: 1px;
      left: 0;
      width: 4px;
      height: 14px;
      content: "";
      background: #409eff;
      border-radius: 1px;
    }
  }
  .comment-top-right-corner {
    position: absolute;
    top: 0;
    left: calc(100% - 10px);
    width: 10px;
    height: 10px;
    background: transparent;
    border-bottom: 1px solid inherit;
    border-left: 1px solid inherit;
    border-top: none!important;
    border-right: none!important;
    & > span {
      position: absolute;
      content: '';
      width: 14px;
      height: 1px;
      top: 4px;
      left: -3px;
      border-top: 1px solid inherit;
      border-let: none!important;
      border-right: none!important;
      border-bottom: none!important;
      transform: rotate(45deg);
    }
  }
  .el-color-picker__panel .el-color-dropdown__link-btn {
    display: none;
  }
.select-domain .el-dialog__body {
  overflow-y: auto;
  height: 500px;
}
.er-dictionary {
  .completeSearch .el-input__icon.icon-search {
    line-height: 28px;
  }
}
.er-modify-dialog-wrapper {
  .el-checkbox__inner {
    border: 1px solid #999;
  }
  &.style-editor-wrapper {
      .el-select {
        width: 80px;
        height: 26px;
      }
      .el-input-number{
        margin-right:5px;
        width: 80px;
        .el-input-number__decrease,
        .el-input-number__increase {
          width: 20px;
        }
        .el-input__inner {
          padding-left: 20px;
          padding-right: 20px;
        }
      }
      .el-color-picker {
        vertical-align: middle;
        margin-right: 10px;
      }
    }
  .header-wrapper {
    margin: 5px 0 5px 0;
    padding: 12px 0 0;
    display: flex;
    // border-bottom: 1px solid #D8D8D8;
    h2 {
      flex: 1 1 auto;
      display: inline-block;
      font-weight: 500;
      font-size: 14px;
      line-height: 24px;
      color: #555;
      // margin-left: 20px;
      // border-left: 4px solid #409EFF;
      padding-left: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  & {
    .el-dialog__headerbtn {
          width: 30px;
          height: 30px;
          background-color:  #F5F5F5;
          border-radius: 50%;
          top: 5px;
          right: 15px;
    }
    .el-dialog__close {
      font-size: 18px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
  .el-dialog__header {
    padding: 0 0 20px;
  }
  .el-input__inner {
    border-radius: 2px;
    border: 1px solid #ddd;
  }
  .el-checkbox__label {
    font-size: 12px;
  }
}
</style>
<style lang="scss" scoped>
.er-modify-dialog-wrapper {
  .coment-label {
    padding-right: 10px;
    width:60px;
    display: inline-block;
    vertical-align: top;
    font-size: 12px;
    font-weight: 400;
    color: #555555;
    text-align: right;
    position: relative;
    top: 3px;
  }
  .label-disc {
      margin-right:10px;
      font-size: 12px;
      font-weight: 400;
      color: #555555;
    }
    .style-box  {
      position: relative;
      min-height: 42px;
      font-size: 12px;
      font-weight: 400;
      color: #555555;
    }
    .middle-y {
      display: inline-block;
      vertical-align: middle;
      height: 20px;
    }
}
</style>
