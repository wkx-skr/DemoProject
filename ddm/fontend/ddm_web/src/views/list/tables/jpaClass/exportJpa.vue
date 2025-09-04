<template>
  <div id="jpa">
    <datablau-dialog
      append-to-body
      :title="`JPA class ${$store.state.$v.dataEntity.setting}`"
      width="900px"
      height="665"
      :visible.sync="showSettingDialog"
      custom-class="jpasetting setting"
    >
      <jpa-setting
        ref="jpaSetting"
        v-if="option"
        :default-option="option"
        :options="options"
        height="538"
        @close="showSettingDialog=false"
      ></jpa-setting>
      <span slot="footer">
        <datablau-button
          style="float:left"
          @click="handleEditClick('jpaEntity')"
          v-if="modelAdmin"
        >{{ $store.state.$v.dataEntity.entityModel }}</datablau-button>
        <datablau-button
          style="float:left"
          @click="handleEditClick('jpaEntityKey')"
          v-if="modelAdmin"
        >{{ $store.state.$v.dataEntity.complexModel }}</datablau-button>
        <datablau-input
          style="float:left;margin-left:10px"
          v-model="jpaPackageName"
          :placeholder="$store.state.$v.dataEntity.inputPakageName"
          size="small">
        </datablau-input>
        <datablau-button type="cancel" @click="showSettingDialog = false">
        </datablau-button>
        <datablau-button type="normal" @click="saveOption" v-if="modelAdmin">
          保存配置
        </datablau-button>
        <datablau-button type="primary" @click="getScript">
          生成JPA class脚本
        </datablau-button>
    </span>
    </datablau-dialog>
    <!-- <div class="table-box">
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
      <p>分类：Java</p>
      <p>框架：JPA Class</p>
    </div> -->
    <div>
      <!-- <div style="display: inline-block;width:250px;margin:15px 10px 15px 0;">
        <datablau-input
          style="width:100%"
          v-model="jpaPackageName"
          :placeholder="$store.state.$v.dataEntity.inputPakageName"
          size="small" >
        </datablau-input>
      </div>
      <datablau-button  type="important" size="small" @click="getScript" >{{$store.state.$v.dataEntity.generateJPAclass}}</datablau-button>
      <datablau-button type="secondary" size="small" @click="callSetting"><i class="el-icon-setting"></i> {{$store.state.$v.dataEntity.option}}</datablau-button> -->

      <!-- <br><br>{{scriptTitle}} -->
    </div>
      <datablau-table
            v-show="unassociationTableList.length > 0"
            :data="unassociationTableList"
            :row-class-name="tableRowClassName"
            :row-key="getRowKey"
            :expand-row-keys="currentExpandKey"
            @row-click="handleClick"
            @expand-change="handleExpanChange"
            :class="{'jpaTable':typeDataWareHouse}"
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
        </datablau-table>
    <el-collapse v-show="showAssociation" v-model="activeName" accordion>
      <el-collapse-item
        v-show="associationTableList.length > 0"
        :title="`${$store.state.$v.dataEntity.connetionTable}(${associationTableList.length})`"
        name="0">
          <el-table
            :data="associationTableList"
            :row-class-name="tableRowClassName"
            :row-key="getRowKey2"
            :expand-row-keys="currentExpandKey2"
            @row-click="handleClick2"
            @expand-change="handleExpanChange"
            class="datablau-table">
            <el-table-column type="expand">
              <template slot-scope="props">
                <div class="java-container">
                    <datablau-button type="secondary" size="mini" class="el-icon-download" @click="downloadScript"> {{$store.state.$v.dataEntity.output}}</datablau-button>
                    <datablau-button type="secondary" size="mini" class="el-icon-document-copy" @click="copyScript"> {{$store.state.$v.dataEntity.copy}}</datablau-button>
                  <div class="java-content">
                    <pre><code class="language-java"><p v-html="props.row.content"></p></code></pre>
                  </div>
                    <!-- <el-button size="mini" class="el-icon-download" @click="downloadScript"> 导出</el-button>
                    <el-button size="mini" class="el-icon-document-copy" @click="copyScript"> 拷贝到剪贴板</el-button> -->
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="className" label="className"></el-table-column>
            <el-table-column prop="tableName" label="tableName"></el-table-column>
          </el-table>
      </el-collapse-item>
      <!-- <el-collapse-item
        v-show="unassociationTableList.length > 0"
        :title="`非关联的表(${unassociationTableList.length})`"
        name="1"> -->
             <!-- <el-table
            v-show="unassociationTableList.length > 0"
            :data="unassociationTableList"
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
        </el-table> -->
      <!-- </el-collapse-item> -->
    </el-collapse>
    <el-table v-show="errClassList.length > 0" :data="errClassList" >
      <el-table-column prop="tableName" label="tableName"></el-table-column>
      <el-table-column prop="errorMsg" :label="$store.state.$v.errMsg"></el-table-column>
    </el-table>

    <!-- <el-table
        v-show="classList.length > 0"
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
              <div class="java-content">
                <pre><code class="language-java"><p v-html="props.row.content"></p></code></pre>
              </div>
                <el-button size="mini" class="el-icon-download" @click="downloadScript"> 导出</el-button>
                <el-button size="mini" class="el-icon-document-copy" @click="copyScript"> 拷贝到剪贴板</el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="className" label="className"></el-table-column>
        <el-table-column prop="tableName" label="tableName"></el-table-column>
    </el-table> -->
     <div
      class="editor-page"
      v-if="isRenderEditorPage"
       >
       <div class="button-box">
          <datablau-button
            @click="saveFesTemplate()"
            type="important"
            size="mini"
            >{{$store.state.$v.dataEntity.save}}
          </datablau-button>
          <datablau-button
            @click="handleResetEditor"
            type="important"
            size="mini"
            >{{$store.state.$v.dataEntity.resetModel}}
          </datablau-button>
          <!-- <el-button type="primary" size="mini">清空错误提示</el-button> -->
          <datablau-button type="secondary" size="mini" @click="isRenderEditorPage = false">{{$store.state.$v.dataEntity.back}}</datablau-button>
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
#jpa .editor-page {
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
.java-container {
   padding-top:4px;
  .language-java {
    height: 380px;
  }
  height: 422px;
}
.table-box {
  height:50px;
  p {
    padding-top: 6px;
    font-size: 14px;
  }
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
.table-jpa-model-button-box {
  position: absolute;
    right: 120px;
    bottom: 10px;
}
</style>
<style lang="scss">
.el-button {
  span {
    font-family: Sansc;
  }
}
.jpaTable{
  .el-table, .el-table__expanded-cell{
      background: #fffdff;
    }
    .el-table th.el-table__cell{
      background: #fffdff;
    }
    .el-table tr{
      background: #fffdff;
    }
    .el-table td.el-table__cell, .el-table th.el-table__cell.is-leaf{
      border-bottom: 1px solid #E5E5E5;
    }
}
</style>
