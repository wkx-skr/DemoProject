<template>
  <div id="jpa" v-loading="loading">
    <el-dialog
      append-to-body
      title="JPA class配置"
      width="600px"
      :visible.sync="showSettingDialog"
    >
      <jpa-setting
        v-if="option"
        :default-option="option"
        :options="options"
        @close="showSettingDialog=false"
        @submit="updateData"
      ></jpa-setting>
      <div class="version-jpa-model-button-box">
          <el-button
            type="primary"
            size="small"
            @click="handleEditClick('jpaEntity')"
          >
            修改类实体模板
          </el-button>
          <el-button
            type="primary"
            size="small"
            @click="handleEditClick('jpaEntityKey')"
          >
            修改复合主键模板
          </el-button>
      </div>
    </el-dialog>
    <div class="table-box">
      <el-table
        ref="multipleTable"
        :data="tableData"
        height="100%"
        row-class-name="row-can-click"
        @row-click="toggleSelection"
        @selection-change="handleSelectionChange"
        class="datablau-table">
        <el-table-column type="selection"></el-table-column>
        <el-table-column prop="name" label="版本"></el-table-column>
        <el-table-column label="发布者" prop="creator"></el-table-column>
        <el-table-column prop="timestamp" label="时间" :formatter="$timeFormatter"></el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip></el-table-column>
      </el-table>
    </div>
    <div>
      <div class="footer-box">
        <el-input
          v-model="jpaPackageName"
          placeholder="输入包名"
          size="small" >
        </el-input>
      </div>
      <el-button :disabled="isdisabledGenerate" type="primary" size="small" @click="getScript" >生成JPA class</el-button>

      <el-button size="small" @click="callSetting"><i class="el-icon-setting"></i> 选项</el-button>

      <!-- <br><br>{{scriptTitle}} -->
    </div>
    <el-table
        v-show="classList.length > 0 &&  errClassList.length === 0"
        ref="classList"
        :data="classList"
        :row-class-name="tableRowClassName"
        :row-key="getRowKey"
        :expand-row-keys="currentExpandKey"
        @row-click="handleClick"
        @expand-change="handleExpanChange"
        class="datablau-table">
        <el-table-column type="expand">
          <template slot-scope="props">
            <div class="java-container">
                <el-button size="mini" class="el-icon-download" @click="downloadScript"> 导出</el-button>
                <el-button size="mini" class="el-icon-document-copy" @click="copyScript"> 拷贝到剪贴板</el-button>
              <div class="java-content">
                <pre><code class="language-java"><p v-html="props.row.content"></p></code></pre>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="className" label="className"></el-table-column>
        <el-table-column prop="tableName" label="tableName"></el-table-column>
    </el-table>
    <el-table v-show="errClassList.length > 0" :data="errClassList" >
      <el-table-column prop="tableName" label="tableName"></el-table-column>
      <el-table-column prop="errorMsg" label="错误提示"></el-table-column>
    </el-table>
     <div
      v-loading="isEditorLoading"
      class="editor-page"
      v-if="isRenderEditorPage"
       >
       <div class="button-box">
          <el-button
            @click="saveFesTemplate()"
            type="primary"
            size="mini"
            >保存
          </el-button>
          <el-button
            @click="handleResetEditor"
            type="primary"
            size="mini"
            >恢复默认模板
          </el-button>
          <!-- <el-button type="primary" size="mini">清空错误提示</el-button> -->
          <el-button type="" size="mini" @click="isRenderEditorPage = false">返回</el-button>
          <p class="error-tips">{{editorErrorMsg}}</p>
       </div>
       <div
          v-if="isRenderEditor"
          class="editor-box">
          <monaco-editor
            ref="JPAeditor"
            :codes='jpaEntityCodes'
            @onCodeChange='onJpaEntityCodeChange'
            :errors='jpaEntityErrors'
            language='java'
          ></monaco-editor>
       </div>
    </div>
  </div>
</template>

<script>
import exportJPA from './exportJpa.js'
export default exportJPA
</script>

<style lang='scss' scoped>

#jpa{
  .editor-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #fff;
    z-index: 2100;
    .editor-box {
      box-sizing: border-box;
      height: 100%;
    }
    .button-box {
      box-sizing: border-box;
      padding-left: 50px;
      padding-top: 11px;
      height: 82px;
    }
    .error-tips {
      padding-top: 10px;
      height: 32px;
      color: red;
    }
  }
  .footer-box {
    width: 250px;
    margin: 15px 0;
    margin-right: 20px;
    display: inline-block;
  }
}
.java-container {
  padding-top:4px;
  .language-java {
    height: 380px;
  }
  height: 422px;
}
.table-box {
  min-height:100px;
  height:300px;
  max-height:300px;
}
thead {
    .el-table-column--selection {
        .cell {
            display: none;
        }
 }
}
pre {
  height:300px;
  overflow:auto;
}
</style>
<style>
.version-jpa-model-button-box {
    position: absolute;
    right: 125px;
    bottom: 10px;
}
</style>
