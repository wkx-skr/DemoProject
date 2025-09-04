<template>
  <div id="jpa" v-loading="loading">
    <el-dialog
      append-to-body
      :title="`JPA class ${$store.state.$v.dataEntity.setting}`"
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
            v-if="modelAdmin"
          >
            {{$store.state.$v.dataEntity.entityModel}}
          </el-button>
          <el-button
            type="primary"
            size="small"
            @click="handleEditClick('jpaEntityKey')"
            v-if="modelAdmin"
          >
            {{$store.state.$v.dataEntity.complexModel}}
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
        <el-table-column prop="name" :label="$store.state.$v.report.version"></el-table-column>
        <el-table-column :label="$store.state.$v.report.publisher" prop="creator"></el-table-column>
        <el-table-column prop="timestamp" :label="$store.state.$v.report.time" :formatter="$timeFormatter"></el-table-column>
        <el-table-column prop="description" :label="$store.state.$v.report.description" show-overflow-tooltip></el-table-column>
      </el-table>
    </div>
    <div>
      <div class="footer-box">
        <el-input
          v-model="jpaPackageName"
          :placeholder="$store.state.$v.dataEntity.inputPakageName"
          size="small" >
        </el-input>
      </div>
      <el-button :disabled="isdisabledGenerate" type="primary" size="small" @click="getScript" >{{$store.state.$v.dataEntity.generateJPAclass}}</el-button>
      <el-button size="small" @click="callSetting" :disabled="!multipleSelection[0]"><i class="el-icon-setting"></i> {{$store.state.$v.dataEntity.option}}</el-button>

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
                <el-button size="mini" class="el-icon-download" @click="downloadScript"> {{$store.state.$v.dataEntity.output}}</el-button>
                <el-button size="mini" class="el-icon-document-copy" @click="copyScript"> {{$store.state.$v.dataEntity.copy}}</el-button>
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
      <el-table-column prop="errorMsg" :label="$store.state.$v.errMsg"></el-table-column>
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
            >{{$store.state.$v.dataEntity.save}}
          </el-button>
          <el-button
            @click="handleResetEditor"
            type="primary"
            size="mini"
            >{{$store.state.$v.dataEntity.resetModel}}
          </el-button>
          <!-- <el-button type="primary" size="mini">清空错误提示</el-button> -->
          <el-button type="" size="mini" @click="isRenderEditorPage = false">{{$store.state.$v.dataEntity.back}}</el-button>
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
<style lang="scss">
.el-button {
  span {
    font-family: Sansc;
  }
}
</style>
