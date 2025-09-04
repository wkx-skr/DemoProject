<template>
  <div v-show="show" class="ddt-editor-wrapper" :class="isThemeBlack ? 'black-theme': 'white-theme'" ref="editorWrapper">
    <win-merge-page
      ref="winMergePages"
      dialogTitle="版本对比"
      :envType="envType"
      :leftType="leftType"
      :bar="false"
    >
    </win-merge-page>
    <datablau-dialog
        title="选择目录"
        :visible.sync="fileFormLog"
        :modal-append-to-body="true"
        size="s"
        :height="extensionFile.indexOf(fileForm.fileTypeId) !== -1? '450px' : programFlg ? '300px' : '200px'"
        @close="closeFileLog"
        :blackTheme="true"
    >
      <datablau-form size="small" :label-width="extensionFile.indexOf(fileForm.fileTypeId) !== -1? '100px' : '75px'" ref="fileFormCatalogue" :model="fileForm" :rules="formRules" >
        <el-form-item
          label="文件名"
          prop="newFileName"
          v-if="programFlg"
        >
          <datablau-input :themeBlack="true" style="width:100%" v-model="fileForm.newFileName" placeholder="请输入文件名"></datablau-input>
        </el-form-item>
        <el-form-item
          label="目录选择"
          prop="fileName">
          <datablau-cascader
            :options="catalogueData"
            v-model="fileForm.fileName"
            placeholder="请选择目录"
            ref="cascader"
            style="width: 100%;"
            :props="{ checkStrictly: true ,children: 'childList',label: 'name', value: 'id'}"
            @change="changeCascader"
            :themeBlack="true"
            clearable></datablau-cascader>
        </el-form-item>
        <el-form-item label="文件类型" prop="fileTypeId" v-if="programFlg">
          <datablau-select
            v-model="fileForm.fileTypeId"
            size="mini"
            clearable
            placeholder="请选择文件类型"
            style="width: 100%;"
            :themeBlack="true"
          >
            <el-option
              v-for="(v, key) in iconNameLIstfile"
              :key="key"
              :label="v.indexOf('tree') !== -1 ? v.substr(5).toLocaleUpperCase() : v.toLocaleUpperCase() "
              :value="key"
            >
              <div slot="default" style="display: inline-block;" class="defaultBox">
                <database-type
                  style="display: inline-block"
                  :size="24"
                  :value="v==='file' ? 'tree-file':v"
                  :hideLabel="true">
                </database-type>
                <span>{{ v.indexOf('tree') !== -1 ? v.substr(5).toLocaleUpperCase() : v.toLocaleUpperCase() }}</span>
              </div>
            </el-option>
          </datablau-select>
        </el-form-item>
        <div v-if="extensionFile.indexOf(fileForm.fileTypeId) !== -1">
          <el-form-item label="程序类型" prop="extension">
            <datablau-select
              v-model="fileForm.extension"
              size="mini"
              clearable
              style="width: 100%;"
              @change="getMainJars"
              :themeBlack="true"
            >
              <el-option
                v-for="(v, key) in extensionList"
                :key="v"
                :label="key"
                :value="v"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item label="主函数的Class" prop="mainClass" v-if="fileForm.extension && fileForm.extension.indexOf('java') !== -1 || fileForm.extension.indexOf('scala') !== -1">
            <datablau-input :themeBlack="true"  style="width:100%" v-model.trim="fileForm.mainClass"></datablau-input>
          </el-form-item>
          <el-form-item label="主程序包" prop="mainJar" v-if="fileForm.extension && fileForm.extension !== '.sql'">
            <datablau-select
              v-model="fileForm.mainJar"
              size="mini"
              clearable
              style="width: 100%;"
              :themeBlack="true"
            >
              <el-option
                v-for="item in mainJarList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </datablau-select>
          </el-form-item>
        </div>
      </datablau-form>
      <div slot="footer">
        <datablau-button :themeBlack="true"  type="important" @click="fileFormSub">
          确定
        </datablau-button>
        <datablau-button :themeBlack="true"  @click="closeFileLog">
          取消
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
        title="新建文件"
        :visible.sync="newFileModel"
        :modal-append-to-body="true"
        size="s"
        @close="newFileModelClose"
        :height="extensionFile.indexOf(type) !== -1? '350px' : '200px'"
        :blackTheme="true"
    >
    <datablau-form size="small" :label-width="extensionFile.indexOf(type) !== -1? '100px' : '75px'" @submit.native.prevent  ref="fileForm" :rules="rules" :model="formData">
      <el-form-item label="文件名" required>
        <datablau-input :themeBlack="true" style="width:100%" v-model.trim="newFileName" @keyup.enter.native="addNewFile('fileForm')"></datablau-input>
      </el-form-item>
      <template v-if="extensionFile.indexOf(type) !== -1">
        <el-form-item label="程序类型" prop="extension">
          <datablau-select
            v-model="formData.extension"
            size="mini"
            clearable
            style="width: 100%;"
            @change="getMainJars"
            :themeBlack="true"
          >
            <el-option
              v-for="(v, key) in extensionList"
              :key="v"
              :label="key"
              :value="v"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="主函数的Class" prop="mainClass" v-if="formData.extension.indexOf('java') !== -1 || formData.extension.indexOf('scala') !== -1">
          <datablau-input :themeBlack="true" style="width:100%" v-model.trim="formData.mainClass"></datablau-input>
        </el-form-item>
        <el-form-item label="主程序包" prop="mainJar" v-if="formData.extension && formData.extension !== '.sql'">
          <datablau-select
            v-model="formData.mainJar"
            size="mini"
            clearable
            style="width: 100%;"
            :themeBlack="true"
          >
            <el-option
              v-for="item in mainJarList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </datablau-select>
        </el-form-item>
      </template>
    </datablau-form>
      <div slot="footer">
        <datablau-button @click="newFileModelClose" type="normal" :themeBlack="true">
          取消
        </datablau-button>
        <datablau-button :themeBlack="true" type="important" :disabled="Boolean(!newFileName)" @click="addNewFile('fileForm')">
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
        title="上传"
        :visible.sync="uploadZip"
        :modal-append-to-body="true"
        height="300px"
        size="s"
        @close="upZipClose"
        :blackTheme="true"
    >
    <datablau-form size="small" label-width="75px" @submit.native.prevent>
      <el-form-item label="上传文件" required>
        <datablau-upload
          :isEdit="true"
          :drag="true"
          :action="action"
          :show-file-list="true"
          limitNum="1"
          :file-list="fileList"
          list-type="text"
          :auto-upload="false"
          :on-change="upChange"
          :accept="accept"
          :mini="true"
          :http-request="distribution"
          :themeBlack="true"
        >
          <i class="iconfont icon-upload"></i>
          <span>点击上传</span>
        </datablau-upload>
      </el-form-item>
      <el-form-item label="文件类型" required>
        <datablau-select
          v-model="fileTypeId"
          size="mini"
          clearable
          style="width: 100%;"
          :themeBlack="true"
        >
          <el-option
            v-for="(v, key) in iconNameLIstfile"
            :key="key"
            :label="v.indexOf('tree') !== -1 ? v.substr(5).toLocaleUpperCase() : v.toLocaleUpperCase() "
            :value="key"
          >
            <div slot="default" style="display: inline-block;" class="defaultBox">
              <database-type
                style="display: inline-block"
                :size="24"
                :value="v==='file' ? 'tree-file':v"
                :hideLabel="true">
              </database-type>
              <span>{{ v.indexOf('tree') !== -1 ? v.substr(5).toLocaleUpperCase() : v.toLocaleUpperCase() }}</span>
            </div>
          </el-option>
        </datablau-select>
      </el-form-item>
    </datablau-form>
      <div slot="footer">
        <datablau-button :themeBlack="true" @click="upZipClose">
          取消
        </datablau-button>
        <datablau-button :themeBlack="true" type="important" :disabled="Boolean(!fileTypeId || !fileList.length)" @click="distribution">
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
        title="新建文件"
        :visible.sync="newFileDomainModel"
        :modal-append-to-body="true"
        size="s"
        @close="fileNameMeth"
    >
      <datablau-form
          size="small"
          label-width="75px"
      >
        <el-form-item
            label="文件名"
            required
        >
          <el-input
              v-model.trim="newParam.fileName"
          ></el-input>
        </el-form-item>
        <el-form-item
            label="指标编码"
            required
        >
          <el-input
              v-model="newParam.domainCode"
          ></el-input>
        </el-form-item>
        <el-form-item
            label="备注"
        >
          <el-input
              type="textarea"
              v-model="newParam.comment"
          ></el-input>
        </el-form-item>
      </datablau-form>
      <div slot="footer">
        <datablau-button @click="fileNameMeth">
          取消
        </datablau-button>
        <datablau-button type="important" :disabled="Boolean(!(newParam.fileName&&newParam.domainCode))"
                         @click="addNewFileDomain">
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
        title="新建"
        :visible.sync="newDirModel"
        :modal-append-to-body="true"
        size="s"
        @close="newDirModelMeth"
        :blackTheme="true"
    >
    <datablau-form size="small" label-width="75px" @submit.native.prevent>
      <el-form-item
          label="文件夹名"
          required
      >
        <datablau-input :themeBlack="true" style="width:100%" v-model.trim="newDirName"  @keyup.enter.native="addNewDir"></datablau-input>
      </el-form-item>
    </datablau-form>
      <div slot="footer">
        <datablau-button @click="newDirModelMeth" type="normal" :themeBlack="true">
          取消
        </datablau-button>
        <datablau-button type="important" @click="addNewDir" :themeBlack="true">
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
        :title="logTil"
        :visible.sync="modifyDirModel"
        :modal-append-to-body="true"
        size="s"
        @close="modifyDirModelClose"
        :blackTheme="true"
    >
    <datablau-form size="small" label-width="75px" @submit.native.prevent>
        <el-form-item label="名称" required>
          <datablau-input :themeBlack="true" style="width:100%" v-model.trim="modifyDirName" @keyup.enter.native="modifyDirNameFunc"></datablau-input>
        </el-form-item>
    </datablau-form>
      <div slot="footer">
        <datablau-button :themeBlack="true" @click="modifyDirModelClose">
          取消
        </datablau-button>
        <datablau-button :themeBlack="true" type="important" @click="modifyDirNameFunc">
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
        title="文件历史版本"
        :visible.sync="versionHistoryModel"
        :modal-append-to-body="true"
        height="400px"
        size="l"
        :blackTheme="true"
    >
      <datablau-table
        @selection-change="handleSelectionChange"
        :data="versionHistoryList"
        row-key="id"
        width="100%"
        :data-selectable="true"
        :auto-hide-selection="false"
        ref="historyTable"
        :themeBlack="true"
      >
        <el-table-column
            prop="version"
            label="版本名称"
            show-overflow-tooltip>
        </el-table-column>
        <el-table-column
            prop="comments"
            label="变更描述"
            show-overflow-tooltip>
        </el-table-column>
        <el-table-column
            prop="updater"
            label="变更人"
            show-overflow-tooltip>
        </el-table-column>
        <el-table-column
            prop="updateTime"
            label="变更时间"
            show-overflow-tooltip>
          <template slot-scope="scope">
            {{ moment(scope.row.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column
            prop="content"
            label="变更内容"
            width="300">
          <template scope="{row}">
            <datablau-tooltip
              :content="row.content"
              placement="top"
              :disabled="Boolean(row.content.length < 100)"
              effect="dark">
              <span>{{row.content.length > 100 ? row.content.substr(0,100) : row.content}}</span>
            </datablau-tooltip>
          </template>
        </el-table-column>
      </datablau-table>
      <div slot="footer">
        <span style="float: left" class="difference">* 选择其中两个版本，进行差异对比。</span>
        <datablau-button :themeBlack="true" type="important" @click="difference" :disabled="Boolean(selectVersion.length<2)">版本对比</datablau-button>
        <datablau-button :themeBlack="true" @click="versionHistoryModel=false">{{ $store.state.$v.report.close }}</datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
        title="移动目录"
        :visible.sync="moveDirModel"
        :modal-append-to-body="true"
        size="s"
        :blackTheme="true"
    >
      <db-tree
          :key="chooseTreeId"
          :data="fileData"
          node-key="id"
          ref="fileDirTree"
          :default-expanded-keys="expandKeys"
          @node-click="nodeDirClick"
          @locked-node-click="nodeLockDirClick"
          v-loading="treeLoading"
          :props="defaultDirProps"
          :data-supervise="true"
          :data-icon-function="dataIconFunction"
          :data-locked-function="(data) => this.disabledDirIds.has(data.id)"
          :showLockedMessage="false"
          :themeBlack="true"
      ></db-tree>
      <div slot="footer">
        <datablau-button :themeBlack="true" type="important" @click="moveFileToDir" :disabled="Boolean(!chooseMoveDirId)">
          {{ $store.state.$v.dataEntity.ok }}
        </datablau-button>
        <datablau-button :themeBlack="true" @click="moveDirModel=false,chooseMoveDirId=null">取消</datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      append-to-body
      title="DDL脚本配置"
      width="900px"
      height="665"
      :visible.sync="showSettingDialog"
      :blackTheme="true"
    >
      <p style="margin-bottom:16px;display: inline-block;color:#bbbbbb">模型：【{{multipleSelection.name}}】</p>
      <p style="display: inline-block;color:#bbbbbb">
        <span v-if="multipleSelection.endVersion.version === multipleSelection.startVersion.version">版本：【{{ multipleSelection.startVersion.name}}】</span>
        <span style="margin-bottom:16px" v-else>版本：【{{ multipleSelection.startVersion.name}}】 和 【{{ multipleSelection.endVersion.name}}】</span>
      </p>
      <ddl-setting
        ref="ddlSetting"
        v-if="option"
        :default-option="option"
        :options="options"
        @close="showSettingDialog=false"
      ></ddl-setting>
      <span slot="footer">
        <div class="warn">
          <i class="iconfont icon-tips" style="margin-right:4px;font-size:14px"></i>选择一个版本产生CREATE脚本，两个版本产生ALTER脚本
        </div>
        <datablau-button type="cancel" :themeBlack="true" @click="showSettingDialog = false"> </datablau-button>
        <datablau-button type="important" :themeBlack="true" @click="saveOption" >
          保存配置
        </datablau-button>
        <!--v-if="multipleSelection.length === 1"-->
        <!--<datablau-button type="primary" @click="getScript" v-if="multipleSelection.endVersion.version === multipleSelection.startVersion.version">
          产生CREATE脚本
        </datablau-button>
        <datablau-button type="primary" @click="getScript" v-else>
          产生ALTER脚本
        </datablau-button>-->
    </span>
    </datablau-dialog>
    <datablau-dialog
        title="规则校验结果"
        :visible.sync="resultVisible"
        :modal-append-to-body="true"
        size="xl"
        height="500px"
    >
    <div style="position: absolute;
      top:10px;left:20px;right:20px;bottom:28px">
        <p v-if="!noDataResult">执行时间：{{ checkTime }}</p>
        <datablau-table
        v-if="!noDataResult"
          class="tableResultDetail"
          style="position: absolute;
          top:30px;left:0px;right:0px;bottom:0px"
          height="100%"
            :data="resultList">
          <el-table-column
              width="120"
              prop="ruleName"
              label="规则名称"
              show-overflow-tooltip>
          </el-table-column>
          <el-table-column
              width="120"
              prop="fileName"
              label="文件名"
              show-overflow-tooltip>
          </el-table-column>
          <el-table-column
              label="SQL语句">
              <template slot-scope="scope">
                <p v-for="(sql,index) in scope.row.sqlList" :key="index">{{ sql }}</p>
              </template>
          </el-table-column>
        </datablau-table>
        <div v-if="noDataResult" class="noDataResult">
          <datablau-icon :data-type="'no-result'" icon-type="svg" :size="100" ></datablau-icon>
          <p>暂无数据</p>
        </div>
    </div>
      <div slot="footer">
        <datablau-pagination
          @size-change="viewSizeChange"
          @current-change="viewCurrentChange"
          :current-page.sync="resultPage"
          :page-sizes="[20, 50, 100]"
          :page-size="resultSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="resultTotalItems"
          class="page"
          v-if="!noDataResult"
        ></datablau-pagination>
      </div>
    </datablau-dialog>
    <datablau-dialog
      append-to-body
      title="分支管理"
      :visible.sync="switchBranch"
      width="640px"
      :height="400"
      @close="delBranch"
      :blackTheme="true"
    >
      <datablau-input
        size="small"
        style="width:180px;margin-right:10px"
        placeholder="搜索分支名"
        v-model="searchBranchName"
        @keyup.enter.native="findBranch"
        :clearable="true"
        @change="keywordChange"
        :themeBlack="true"
      ></datablau-input>
      <datablau-tooltip
        content="刷新分支列表"
        placement="bottom"
        effect="dark"
      >
        <datablau-button type="icon" class="iconfont icon-refresh" @click="getBranchList"></datablau-button>
      </datablau-tooltip>
      <datablau-button :themeBlack="true" type="important" class="iconfont icon-tianjia" @click="addBranch" style="float: right"> 新建分支</datablau-button>
      <datablau-table
        v-loading="branchLoading"
        :element-loading-background="isThemeBlack && 'rgba(0,0,0,0.6)'"
        show-overflow-tooltip
        :single-select="true"
        :data="branchList"
        ref="branchTable"
        @selection-change="branchSelectList"
        :themeBlack="true"
      >
        <el-table-column
          prop="branch"
          label="分支名"
          show-overflow-tooltip
        >
          <template scope="{row}">
            <div v-if="row.newBranchName">
              <datablau-input
                size="small"
                style="width:120px;margin-right:10px"
                placeholder="输入新版本名"
                v-model="row.newBranchName"
                :clearable="true"
              ></datablau-input>
              <datablau-button type="text" @click="updateBranch(row)">保存</datablau-button>
              <datablau-button type="text" @click="cancelBranch(row)">取消</datablau-button>
            </div>
            <span v-else>{{row}}</span>
          </template>
        </el-table-column>
        <!--<el-table-column
          prop="status"
          label="状态"
          show-overflow-tooltip
        >
          <template scope="{row}">
            {{row.status == '0' ? '开发中' : row.status == '1' ? '待审批' : '已发布'}}
          </template>
        </el-table-column>-->
        <el-table-column
          prop="name"
          label="操作"
          show-overflow-tooltip
          width="80px"
        >
          <template scope="{row}">
            <!-- <datablau-button type="icon" class="iconfont icon-bianji" :disabled="row === 'master'" @click="modifyBranchName(row)"></datablau-button>-->
            <datablau-button type="icon" class="iconfont icon-delete" @click="deleteBranch(row)" :disabled="row === 'master'"></datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <div slot="footer">
        <datablau-button :themeBlack="true"  type="normal" @click="delBranch">
          取消
        </datablau-button>
        <datablau-button :themeBlack="true" type="important" :disabled="!branchSelect" @click="changeBranchClick">
          切换分支
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      title="新建分支"
      :visible.sync="newBranch"
      :blackTheme="true"
      width="30%">
      <div style="margin-bottom: 20px;color:#bbbbbb">新建分支时，若文件数量多，运行任务需要等待，请稍后尝试刷新查看内容，勿重复提交。</div>
      <datablau-form size="small" label-width="75px" @submit.native.prevent>
        <el-form-item label="版本名" required>
          <datablau-input :themeBlack="true" style="width: 80%" v-model.trim="newBranchName"  @keyup.enter.native="setNewBranch"></datablau-input>
        </el-form-item>
      </datablau-form>
      <span slot="footer" class="dialog-footer">
          <datablau-button :themeBlack="true" @click="newBranch = false">取 消</datablau-button>
          <datablau-button :themeBlack="true" type="important" @click="setNewBranch">确 定</datablau-button>
        </span>
    </datablau-dialog>
    <div class="header-wrapper" >
      <div class="header-wrapper-left"  :style="{width: hideTree ? '24px' : '240px'}">
        <div v-show="!hideTree" style="display: inline-block;">
          <h2 class="header-wrapper-title">D3</h2>
          <span></span>
          <h2 class="header-wrapper-name" >{{ projectName }}</h2>
        </div>
          <h2 v-show="hideTree" class="header-wrapper-title" style="margin-left:2px">D3</h2>
      </div>
      <div class="ruleButton"  :style="{left: ruleButtonLeft}" v-show=" currentFile.indexOf('file') === -1">
        <div class="ruleVerification">
          <!-- <datablau-button
            type="icon"
            tooltipContent="规则校验"
            :tooltipOptions="{openDelay: 500}"
            @click="allVerification"
            :disabled="Boolean(!auth['PROJECT_MANAGE']&&!auth.isAdmin) || currentFile.indexOf('procedure') !== -1"
          >
            <i class="iconfont icon-menu-jhrw"></i>
          </datablau-button>
          <datablau-button
            type="icon"
            tooltipContent="校验查看"
            :tooltipOptions="{openDelay: 500}"
            @click="viewResults"
            :disabled="Boolean(!auth['PROJECT_MANAGE']&&!auth.isAdmin)  || currentFile.indexOf('procedure') !== -1"
          >
            <i class="iconfont icon-wentiqingdan"></i>
          </datablau-button> -->
          <!--<datablau-button
            type="icon"
            tooltipContent="自动建模"
            :tooltipOptions="{openDelay: 500}"
            @click="automaticModeling"
            :disabled="Boolean(!auth['PROJECT_MANAGE']&&!auth.isAdmin)  || currentFile.indexOf('procedure') !== -1"
          >
            <i class="iconfont icon-menu-ysjgl"></i>
          </datablau-button>
          <datablau-button
            type="icon"
            tooltipContent="智能查询"
            :tooltipOptions="{openDelay: 500}"
            @click="intelligentQuery"
            :disabled="Boolean(!auth['PROJECT_MANAGE']&&!auth.isAdmin)  || currentFile.indexOf('procedure') !== -1"
          >
            <i class="iconfont icon-aisearch"></i>
          </datablau-button>-->

        </div>
      </div>
      <div class="rightPart">
        <div class="downlod-ddm">
            <datablau-tooltip :content="$v.pageHead.launch" :hide-after="1000" effect="dark">
              <div class="sign-in-ddm-wrapper">
                <span class="down-btn" @click="signInDDM" ><i class="img-workbench"></i></span>
              </div>
            </datablau-tooltip>
        </div>
        <div class="user-name">
        {{ $store.state.user.username }}
        </div>
      </div>
    </div>
    <div class="drag-container" :class="{'default-hidden': currentType !== 'file' && currentType !== 'script'}" ref="verticalTopDom">
      <div class="content-wrapper" :style="{width: (windowWidth - hintWidth) + 'px'}">
        <div class="left-wrapper" :style="{width: hideTree ? '24px' : '240px'}">
          <div v-show="editorTab === 'editor' && !hideTree" class="file-explorer-wrapper">
            <el-upload
                style="display: none;"
                ref="upload"
                action
                :http-request="httpRequest"
                :show-file-list="false"
                accept="aplication/zip"
            ></el-upload>
            <div style="display:flex;">
              <datablau-input :iconfont-state="true" clearable
              :smallDatablauInput="true"
              :themeBlack="true"
                              style="display: inline-block;width: 300px;flex: 1 1 auto;margin: 8px;" placeholder="搜索"
                              v-model="fileSearchQuery" @input="searchFile"></datablau-input>
              <!--<datablau-select v-model="statusFilter" style="display: inline-block;width: 200px;flex: 1 1 auto;" @change="searchFile" placeholder="请选择">
                <el-option
                  :key="-1"
                  :value="-1"
                  label="全部状态">
                </el-option>
                <el-option
                  v-for="key in statusMap"
                  :key="key"
                  :label="statusMap[key]"
                  :value="key">
                </el-option>
              </datablau-select>-->
            </div>
            <div class="file-tree-wrapper">
              <db-tree
                  ref="dataSandboxd"
                  :data="dataSandboxdTreeData"
                  node-key="id"
                  :data-supervise="true"
                  :props="{children: 'children', label: 'name'}"
                  :data-icon-function="dataSandIconFunction"
                  :default-expanded-keys="dependent"
                  @node-click="dataSandboxdNodeClick"
                  :data-options-function="dataSandboxdFunction"
                  class="dataSandboxd"
                  :themeBlack="true"
              ></db-tree>
              <model-tree
                v-if="this.auth.isAdmin || this.auth['MODEL_VIEW'] || this.auth['MODEL_EDIT']"
                  ref="modelCom"
                  :models="models"
                  :scriptList="scriptList"
                  :currentKey="currentKey"
                  @clearTreeActive="clearTreeActive"
                  @openModelData="openModelData"
                  @showDdlScript="showDdlScript"
                  @showDdlConfiguration="showDdlConfiguration"
                  @delModel="delModel"
                  @nodeExpand="nodeExpandModel"
                  @updateTabsData="updateTabsData"
                  @getTreeData="getTreeData"
                  @addScriptList="addScriptList"
                  @allowDropModel="allowDropModel"
              ></model-tree>
              <db-tree
                  v-if="this.auth.isAdmin || this.auth['PROCEDURE_VIEW'] || this.auth['PROCEDURE_EDIT']"
                  draggable
                  :data="fileData"
                  node-key="id"
                  ref="fileTree"
                  class="fileTree"
                  :default-expanded-keys="expandKeys"
                  :filter-node-method="filterNode"
                  @node-click="nodeClick"
                  @node-expand="nodeExpand"
                  @node-drop="handleDrop"
                  v-loading="treeLoading"
                  :props="defaultProps"
                  :data-supervise="true"
                  :data-icon-function="dataIconFunction"
                  :right-info-formatter="treeRightInfoFormatter"
                  :data-options-function="dataOptionsFunction"
                  :allow-drop="allowDrop"
                  :themeBlack="true"
              ></db-tree>
              <db-tree
                  v-if="this.auth.isAdmin || this.auth['WORKFLOW_MANAGEMENT']"
                  ref="workflowTree"
                  :data="dependenciesTreeData"
                  node-key="value"
                  :props="{children: 'children', label: 'name'}"
                  :data-icon-function="workflowIconFunction"
                  :default-expanded-keys="['dependent']"
                  @node-click="workflowNodeClick"
                  class="workflowTree"
                  :themeBlack="true"
              ></db-tree>
             <!-- <db-tree
                  ref="dataMigrationTree"
                  :data="dataMigrationTreeData"
                  node-key="value"
                  :props="{children: 'children', label: 'name'}"
                  :data-icon-function="dataMigrationFunction"
                  :default-expanded-keys="['dataMigration']"
                  @node-click="dataMigrationNodeClick"
                  class="workflowTree"
              ></db-tree>-->
            </div>
          </div>
          <div v-show="hideTree" class="hideTreeBox" @click="hideDirectoryTree">
            <i class="iconfont icon-menu-ztml"></i>
            <p style="    padding-left: 1px;
    padding-top: 2px;">目<br/>录</p>
          </div>
          <div class="hideDirectoryTree">
            <datablau-tooltip
                :content="hideTree ? '展开目录' : '隐藏目录'"
                placement="bottom"
                effect="dark"
              >
                <div class="iconhide" @click="hideDirectoryTree">
                  <i style="transform: rotate(180deg);margin-right: 2px;" class="iconfont icon-shouqi"></i>
                </div>
              </datablau-tooltip>
          </div>
        </div>
        <div class="resize-column-middle" v-show="!hideTree" :style="{left: hideTree ? '24px' : '240px'}"></div>
        <div class="content-edit-wrapper" :style="{left: hideTree ? '24px' : '240px'}">
          <div class="mask" v-show="mask"></div>

          <!--<div class="workflowDefinitionBtn" :style="{left: hideTree ? '30px' : '240px'}" v-if="currentFile === 'workflowDefinition' ">
            <datablau-radio
              v-model="radioValue"
              @change="radioValueChange"
              style="display: inline-block"
            >
              <el-radio v-for="(item,index) in envData" :key="index" :label="item.label">{{item.label}}</el-radio>
            </datablau-radio>
            <datablau-button
              style="display: inline-block;margin-right:20px"
              type="important"
              @click="exportWorkflow"
              :disabled="exportDisabled"
            >导出工作流</datablau-button>
            </div>-->
          <div class="edit-detail-wrapper" ref="edit-detail-wrapper">
            <div class="homePage" v-show="!homePageShow">
              <div class="logoText">欢迎访问Design & Development & Delivery</div>
              <div class="des">{{projectData && projectData.description}}</div>
              <div class="featureTab">
                <div @click="synchronization" class="tab" v-if="auth.isAdmin || auth['PROCEDURE_EDIT']">
                  <img src="@/assets/images/dataWarehouse/synchronization.svg" alt="" >创建数据同步
                </div>
                <div @click="dataModel" class="tab"  v-if="auth.isAdmin || auth['MODEL_EDIT']">
                  <img src="@/assets/images/dataWarehouse/dataModel.svg" alt="">创建数据模型
                </div>
                <div @click="program" class="tab" v-if="auth.isAdmin || auth['PROCEDURE_EDIT']">
                  <img src="@/assets/images/dataWarehouse/program.svg" alt="">创建开发程序
                </div>
               <!-- <datablau-tooltip
                  content="工作流正在准备中，请稍后再试"
                  placement="bottom"
                  effect="dark"
                  :disabled="!!workflowProjectCode"
                  v-if="auth.isAdmin || auth['WORKFLOW_MANAGEMENT']"
                >-->
                  <div @click="workflow" class="tab"  v-if="auth.isAdmin || auth['WORKFLOW_MANAGEMENT']">
                    <img src="@/assets/images/dataWarehouse/workflow.svg" alt="">创建工作流
                  </div>
                <!--</datablau-tooltip>-->
              </div>
            </div>
            <el-card shadow="hover" v-if="isShowMenu" :style="{position: 'fixed', left: menuX, top: menuY}" style="z-index: 111" class="cardBox">
              <div @click="handleMenuClick('all')">关闭所有</div>
              <div @click="handleMenuClick('other')">关闭其他</div>
            </el-card>
            <datablau-tabs
              v-model="currentFile"
              type="card"
              closable
              @tab-click="changeTab"
              @tab-remove="removeFile"
              :before-leave="beforeLeaveTab"
              v-contextmenu:menu="showMenuBox"
              :themeBlack="true"
            >
              <el-tab-pane
                v-for="item in models"
                :key="'model' + item.id"
                :label="item.name"
                :name="'model' + item.id"
              >
                <span slot="label">
                  <img style="width:14px;height:14px;margin-right:4px" src="../../../assets/images/modelTree/model1.svg" alt="">
                  {{item.name}}
                </span>
              </el-tab-pane>
              <el-tab-pane
                  v-for="item in tables"
                  :key="'table' + item.id"
                  :label="item.name"
                  :name="'table' + item.id"
              >
                <span slot="label">
                  <div style="display: inline-block;position:relative;top: 2px; margin-right: 5px">
                    <datablau-icon :data-type="'table'" icon-type="svg" :size="14" ></datablau-icon>
                  </div>
                  {{ item.name }}
                </span>
              </el-tab-pane>
              <el-tab-pane
                  v-for="item in scriptList"
                  :key="'script_' + item.id"
                  :label='item.history ?`模型"${item.modelName}"的历史版本${item.version}DDL脚本` : `模型"${item.modelName}"的 DDL 脚本`'
                  :name="'script_' + item.id"
              >
              </el-tab-pane>
              <el-tab-pane
                  v-for="item in editFiles"
                  :key="'file' + item.id"
                  :label="item.name"
                  :name="'file' + item.id"
              >
                <span :class="{changed:item.changed}" slot="label">
                  <img style="width:14px;height:14px;margin-right:4px" :src="getDataName(item)" alt="">

                  {{ item.name }}
                </span>
              </el-tab-pane>
              <el-tab-pane
                  v-for="item in procedureFile"
                  :key="'procedure' + item.id"
                  :label="item.name"
                  :name="'procedure' + item.id"
              >
                <span :class="{changed:item.changed}" slot="label">
                  <img style="width:14px;height:14px;margin-right:4px" :src="getDataName(item)" alt="">

                  {{ item.name }}
                </span>
              </el-tab-pane>
              <el-tab-pane
                  v-for="item in tableDetailList"
                  :key="'columnDetails' + item.id"
                  :label="item.name"
                  :name="'columnDetails' + item.id"
              >
                <span slot="label">
                  <div style="display: inline-block;position:relative;top: 2px; margin-right: 5px">
                    <datablau-icon :data-type="'table'" icon-type="svg" :size="14" ></datablau-icon>
                  </div>
                  {{ item.name }}
                </span>
              </el-tab-pane>
              <el-tab-pane
                  v-for="item in dataMigrationList"
                  :key="'dataMigration' + item.id"
                  :label='item.name'
                  :name="'dataMigration' + item.id"
              >
              <span slot="label">
                  <span class="tree-icon tree-migration"></span>
                  {{ item.name }}
                </span>
              </el-tab-pane>
              <el-tab-pane
                  v-for="item in dataSandboxdList"
                  :key="'dataSandboxd' + item.id"
                  :label='item.name'
                  :name="'dataSandboxd' + item.id"
              >
              <span slot="label">
                  <span class="iconfont icon-menu-xqgl"></span>
                  {{ item.name }}
                </span>
              </el-tab-pane>
              <el-tab-pane label="工作流定义" name="workflowDefinition" v-if="showWorkflowDefinition">
                <span slot="label">
                  <span><i class="iconfont icon-menu-lcgl" style="color:#35A397;margin-right:4px"></i>工作流定义</span>
                </span>
              </el-tab-pane>
              <el-tab-pane label="工作流实例" name="workflowInstance"  v-if="showWorkflowInstance">
                <span slot="label">
                  <span><i class="iconfont icon-menu-ywlc" style="color:#35A397;margin-right:4px"></i>工作流实例</span>
                </span>
              </el-tab-pane>
              <!-- <el-tab-pane label="数据迁移" name="dataMigration"  v-if="showDataMigration && addMigration">
              <el-tab-pane label="数据同步" name="dataMigration"  v-if="showDataMigration && addMigration">
                <span slot="label">
                  <span><i class="iconfont icon-menu-ywlc" style="color:#35A397;margin-right:4px"></i>{{codeTree.newFileName}}</span>
                </span>
              </el-tab-pane> -->
            </datablau-tabs>
            <!--<table-item :key="item.id" v-for="item in tables" :item="item">
            </table-item>-->
            <template v-for="item in models">
              <model-detail
                  :key="item.id"
                  :item="item"
                  ref="modelsDetail"
                  :projectName="projectName"
                  :modelTreeData="modelTreeData"
                  v-if="currentFile === 'model' + item.id"
                  :auth="auth"
                  @openTable="openTable"
                  @setNewFile="setNewFile"
              >
              </model-detail>
            </template>
            <template v-for="item in tables">
              <table-detail :key="item.id" :item="item" v-show="currentFile === 'table' + item.id"  :authPro="auth">
              </table-detail>
            </template>

            <div>
              <editor
                  v-for="item in editFiles" :key="item.id"
                  ref="editor"
                  :fileData="fileData"
                  v-show="currentFile === 'file' + item.id"
                  :item="item" :idToFileData="idToFileData" :path="path" :editFiles="editFiles"
                  :currentFile="currentFile" :isThemeBlack="isThemeBlack" :dataSourceId="dataSourceId"
                  :schemaNameOp="schemaNameOp"
                  @triggerNodeClick="triggerNodeClick"
                  @changeBottomCurrentTab="changeBottomCurrentTab"
                  :bottomDomHeightSave="bottomDomHeightSave"
                  @location="location"
                  @refreshTree="refreshTree"
                  :black="black"
                  :bottomDomDis="bottomDomDis"
                  :branchName="branchName || 'master'"
                  :hideTreeLeft="hideTree ? '6px' : '0px'"
                  :authPro="auth"
                  :typeEditor="'file'"
              ></editor>
            </div>
            <editor
                v-for="item in scriptList"
                :key="`script_${item.id}`"
                :typeEditor="'script'"
                :hideBtn="true"
                :bottomDomDis="bottomDomDis"
                ref="scriptEditor"
                :fileData="item.script"
                v-show="currentFile === 'script_' + item.id"
                :item="item"
                :isThemeBlack="isThemeBlack"
                :dataSourceId="dataSourceId"
                :schemaNameOp="schemaNameOp"
                @triggerNodeClick="triggerNodeClick"
                @changeBottomCurrentTab="changeBottomCurrentTab"
                :bottomDomHeightSave="bottomDomHeightSave"
                @location="location"
                :black="black"
                :idToFileData="idToFileData"
                :path="path"
                :editFiles="editFiles"
                :currentFile="currentFile"
                :branchName="branchName || 'master'"
                :authPro="auth"
            ></editor>
            <editor
             v-for="item in procedureFile"
             :key="item.id"
             :idToFileData="idToFileData"
             :editFiles="editFiles"
             ref="procedurEditor"
             v-show="currentFile === 'procedure' + item.id"
             :item="item"
             :currentFile="currentFile"
             :isThemeBlack="isThemeBlack" :dataSourceId="dataSourceId"
             :schemaNameOp="schemaNameOp"
             @changeBottomCurrentTab="changeBottomCurrentTab"
             :bottomDomHeightSave="bottomDomHeightSave"
             :black="black"
             :bottomDomDis="bottomDomDis"
             :hideTreeLeft="hideTree ? '6px' : '0px'"
             :authPro="auth"
             @closeFile="closeFile"
             :typeEditor="'procedure'"
            ></editor>
            <tableColumnDetail
              v-for="item in tableDetailList"
              :key="item.id"
              :item="item"
              v-show="currentFile === 'columnDetails' + item.id"
            ></tableColumnDetail>
            <div class="iframe-instance-container" v-if="dsId"
                 v-show="currentFile === 'workflowDefinition' || currentFile === 'workflowInstance'">
              <div class="iframe-instance" v-show="currentFile === 'workflowDefinition'" ref="workflowBox">
                <ds-iframe-container
                    id="workflowDefinition" :projectId="dsId" key="workflowDefinition"
                    pageType="workflowDefinition"
                    class="iframe-container"
                    ref="workflowDefinitionIframe"
                    :isThemeBlack="isThemeBlack"
                    :branchName="branchName"
                    :refreshWork="refreshWork"
                    :createDefinition="createDefinition"
                    :workflowCode="workflowCode"
                    @getExportCode="getExportCode"
                    @getDropEle="getDropEle"
                ></ds-iframe-container>
              </div>
              <div class="iframe-instance" v-show="currentFile === 'workflowInstance'">
                <ds-iframe-container
                  id="workflowInstance" :projectId="dsId" key="workflowInstance"
                  pageType="workflowInstance"
                  class="iframe-container"
                  ref="workflowInstance"
                  :refreshWork="refreshWork"
                  :isThemeBlack="isThemeBlack"
                  :branchName="branchName"
                ></ds-iframe-container>
              </div>
            </div>
            <div v-for="item in dataMigrationList" :key="`dataMigration${item.id}`">
              <data-migration
                :authPro="auth"
                :codeTree="codeTree" :migrationObj="migrationObj" :flagType="flagType"
                :key="`dataMigration${item.id}`"
                :gitPath="gitPath"
                v-if="currentFile === 'dataMigration' + item.id" :migrationId="migrationId"></data-migration>
            </div>
            <div v-for="item in dataSandboxdList" :key="`dataSandboxd${item.id}`">
              <data-sandboxd
              :fileData="fileData"
              :modelsList="models"
              :modelTreeData="modelTreeData"
              @closeCreate="closeCreate"
              @updateTree="updateTree"
              :item="item"
                :key="`dataSandboxd${item.id}`"
                v-if="currentFile === 'dataSandboxd' + item.id"
              :sandboxdData="sandboxdData"
              ></data-sandboxd>
            </div>
          </div>
          <div class="auth-manage-container" v-if="showAuthManageDialog">
            <div class="head-breadcrumb">
              <datablau-breadcrumb
                class="top-bread"
                :node-data="['权限管理']"
                :couldClick="false"
                @back="goBack"
              ></datablau-breadcrumb>
            </div>
            <div class="manage-container">
              <auth-manage
                  manage-type="category"
                  :categoryId="chosenCategoryId"
              ></auth-manage>
            </div>
          </div>
        </div>
      </div>
      <div class="resize-column-right" v-show="hintWidth !== 24"
           :style="{left: (windowWidth - hintWidth - 15) + 'px'}"></div>
      <operate-hint
          class="operator-hint-wrapper"
          @changeDialogWidth="changeHintWidth"
          @setNewFile="setNewFile"
          :editFiles="editFiles"
          :branchName="branchName || 'master'"
          :hintW="hintW"
          :style="{left: (windowWidth - hintWidth) + 'px'}"
          :testDataSource="(projectData || {}).testDataSource || null"
          :authPro="auth"
          @showProcedureFile="showProcedureFile"
      ></operate-hint>
    </div>
    <div
        class="middle-line"
        :class="{'default-hidden': (currentType !== 'file' || !bottomDraggable)}"
        ref="verticalMiddleDom"
    ></div>
    <div class="bottom-container" :class="{'default-hidden': currentType !== 'file'}" ref="verticalBottomDom"></div>
    <win-merge-page :dialogTitle="'配置比较结果'" ref="winMergePage" @set-value="setValue" :noWorkflow="false" :envType="radioValue" :evnDataValue="evnDataValue"></win-merge-page>
    <iframe :src="iframeSrc" style="display:none;"></iframe>
  </div>
</template>

<script>
import main from './main'
export default main
</script>

<style scoped lang="scss">
@import './main.scss';

</style>
<style lang="scss">
@import './conflict';
// @import './color.scss';
// 工作流
.workflowTree{
  .grey-tree.datablau-tree .iconfont.icon-liucheng{
  color: #35A397
 }
  .grey-tree.datablau-tree .iconfont{
    color: #888888;
  }
  .grey-tree.datablau-tree .el-tree-node.is-current > .el-tree-node__content{
    background-color: #409eff1a ;
    border-left: 2px solid #409EFF ;
    color: #409fff;
  }
  .grey-tree .el-tree-node__content{
    border-left: 2px solid transparent;
  }
}
// 开发程序，建模分析
.fileTree, .dataSandboxd{
  .grey-tree.datablau-tree .iconfont{
    color: #888888;
  }
  .grey-tree.datablau-tree .el-tree-node.is-current > .el-tree-node__content{
    background-color: #409eff1a ;
    border-left: 2px solid #409EFF ;
    color: #409fff;
  }
  .grey-tree .el-tree-node__content{
    border-left: 2px solid transparent;
  }
}
#context-menu .context-menu-style .context-option .label {
  color: #555;
}
.ddt-editor-wrapper {
  .label {
    color: inherit !important;
  }

  .el-loading-mask {
    background-color: rgba(0, 0, 0, .5) !important;
    color: #fff;
    // opacity: 0.9;
  }
  .white-theme {

  }
  .grey-tree .el-tree-node__content {
    height: 24px;
    line-height: 24px;
  }
  .oneline-eclipse {
    line-height: 24px!important;
  }
  .grey-tree.datablau-tree .el-tree-node.is-current > .el-tree-node__content .more {
    top: 2px!important;
  }
  .el-tree-node__content > .el-tree-node__expand-icon.el-icon-caret-right{
    line-height: 20px!important;
  }
  .el-input__inner:hover {
    border-color: #409EFF;
  }
  // .el-input--prefix .el-input__inner {
  //   border-color: #ddd!important;
  // ;
  // }
  .grey-tree.datablau-tree .el-tree-node__content:hover .more {
    top: 1px!important;
  }
  .el-tabs__nav-next, .el-tabs__nav-prev {
    z-index: 200;
    line-height: 28px;
  }
  .ant-dropdown-trigger > .anticon.anticon-down {
    display: none;
  }
  .el-tree-node:focus > .el-tree-node__content{
    background-color:rgba(64, 158, 255, 0.1)
  }
}
.tableResultDetail{
  // .el-table, .el-table__expanded-cell{
  //   background: #fffdff;
  // }
  // .el-table th.el-table__cell{
  //   background: #fffdff;
  // }
  // .el-table tr{
  //   background: #fffdff;
  // }
  .el-table td.el-table__cell, .el-table th.el-table__cell.is-leaf{
    border-bottom: 1px solid #E5E5E5;
  }
}
.noDataResult{
  display: flex;
  align-items: center;
  flex-direction: column;
  padding-top: 96px;
  p{
    padding-top:8px
  }
}
  .warn{
    position: absolute;
    bottom: 27px;
    color: #BBBBBB;
  }
  .point {
    position: relative;
    top: -3px;
    .el-badge__content.is-dot {
      width: 8px;
      height: 8px;
      right: -2px;
      top: 10px;
    }
  }
  .tipText{
    float: left;
    margin-top: 10px;
    color: #BBBBBB;
  }
.arrow{
  width: 16px;
  line-height: 40px;
  cursor: pointer;
  text-align: center;
  padding-left: 7px;
}
  .hideTreeBox{
    padding: 8px 5px 8px;
    cursor: pointer;
    &:hover{
      background: rgba(30, 110, 210, 0.4)
    }
  }
  .grey-tree.datablau-tree .iconfont {
    color: #87939A
  }
  .grey-tree.datablau-tree .iconfont.icon-modelanalyze {
    color: #FE8C35 !important;
  }
  .model-tree-wrapper .grey-tree.datablau-tree span.iconfont.icon-modelfile{
    color: rgb(64, 158, 255) !important
  }
  .fileTree .grey-tree.datablau-tree .iconfont.icon-code{
    color: #BB6CF9
  }
 .grey-tree.datablau-tree{
  color: #C6C6C6;
 }
 .grey-tree .el-tree-node__content:hover{
  background-color:rgba(64, 158, 255, 0.1)
 }
</style>
