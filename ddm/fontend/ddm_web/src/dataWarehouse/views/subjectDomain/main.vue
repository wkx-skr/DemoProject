<template>
    <div>
        <datablau-dialog
            title="新建"
            :visible.sync="newSubject"
            :modal-append-to-body="true"
            size="s"
            @close="closeDialog"
        >
            <datablau-form :model="formSubject" size="small" label-width="75px">
                <el-form-item label="名称" required>
                    <datablau-input style="width:100%" v-model.trim="formSubject.newName"></datablau-input>
                </el-form-item>
                <el-form-item label="描述" >
                    <datablau-input style="width:100%" v-model="formSubject.content" ></datablau-input>
                </el-form-item>
            </datablau-form>
            <div slot="footer">
                <datablau-button @click="closeDialog">
                取消
                </datablau-button>
                <datablau-button v-if="defaultNode ===false" type="important" :disabled="formSubject.newName===''" @click="addNewSubject">
                确定
                </datablau-button>
                <datablau-button v-else type="important" :disabled="formSubject.newName===''" @click="createDefaultNode">
                确定
                </datablau-button>
            </div>
        </datablau-dialog>
        <div class="tree-subject">
            <div class="en-tree-box">
                <datablau-input
                maxlength="100"
                style="
                    width: 260px;
                    margin: 10px;
                    position: relative;
                    top: -1px;
                    display: inline-block;
                "
                :iconfont-state="true"
                v-model="keyword"
                clearable
                :placeholder="$t('quality.page.qualityAssurance.placeholderTree')"
                ></datablau-input>
                <!-- <el-tooltip
                class="item"
                effect="dark"
                content="新建"
                placement="top"
                >
                <i
                    class="iconfont icon-tianjia"
                    style="
                    padding-top: 10px;
                    line-height: 34px;
                    color: grey;
                    cursor: pointer;
                    "
                    @click="addSubject"
                ></i>
                </el-tooltip> -->
            </div>
            <div class="tree-box" v-if="initialization === false" >
                <datablau-tree
                style="position: relative"
                :show-checkbox="false"
                ref="mainTree"
                :data="treeData"
                :key="treeKey"
                :expand-on-click-node="false"
                default-expand-all
                :props="defaultProps"
                @node-click="handleNodeClick"
                @node-drop="handleDrop"
                :filter-node-method="filterNode"
                :draggable="true"
                check-strictly
                node-key="id"
                :data-supervise="true"
                :data-options-function="dataOptionsFunction"
                :useDefaultSort="false"
                ></datablau-tree>
            </div>
            <div class="fieldEmpty" v-else>
                <datablau-icon
                :data-type="'no-result'"
                :icon-type="'svg'"
                :size="80"
                class="icon"
                ></datablau-icon>
                <p>
                <datablau-button type="important" @click="addDefault">
                    添加目录
                </datablau-button>
                </p>
            </div>
        </div>
        <div class="folder-line"></div>
        <div class="content-detail" v-if="contentData">
            <div class="detail-header">
                <h2 v-if="editState === false">{{ contentData.name }}</h2>
                <datablau-input
                v-else
                v-model="contentData.name"
                ></datablau-input>
                <div class="editBtn">
                    <datablau-button
                    type="important"
                    @click="editDetail"
                    v-if="editState === false"
                    >编辑</datablau-button>
                    <div v-else>
                    <datablau-button
                    type="cancel"
                    @click="cancelEdit"
                    ></datablau-button>
                    <datablau-button
                    type="important"
                    @click="addNewSubject('edit')"
                    >保存</datablau-button>
                    </div>
                </div>
            </div>
            <div class="content">
                <mavon-editor
                  :defaultOpen="'preview'"
                  v-if="editState === false"
                  :toolbarsFlag="false"
                  :editable="false"
                  :scrollStyle="true"
                  :subfield="false"
                  :toolbars="toolbars"
                  :style="{minHeight: '60px',maxHeight: mavonEditorHeight + 'px',boxShadow: 'none'}"
                  v-model="contentData.content"
                  :placeholder="$t('meta.DS.tableDetail.startEdit')"
                />
                <mavon-editor
                  :style="{height: mavonEditorHeight + 'px', minWidth: '600px'}"
                  v-else
                  :toolbars="toolbars"
                  v-model="contentData.content"
                  :placeholder="$t('meta.DS.tableDetail.startEdit')"
                />
            </div>
        </div>
    </div>
  </template>

<script>
import subject from './main.js'
export default subject
</script>
<style lang="scss" scoped>
.tree-subject {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 280px;
    background-color: var(--white-grey-bgc);
    border-right: none;
    // border: 1px solid var(--border-color-lighter);
    border-left: none;
    .tree-box {
        position: absolute;
        top: 52px;
        right: 0;
        bottom: 50px;
        // border-top: 1px solid #E6E6E6;
        left: 0;
        overflow: auto;
    }
}
.fieldEmpty{
    position: absolute;
    z-index: 999;
    top: 38%;
    right: 0;
    left: 0px;
    .icon{
      display: block;
      margin: 0 auto;
    }
    p{
      text-align: center;
      padding-top: 10px;
    }
  }
.folder-line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 280px;
    z-index: 2;
    width: 1px;
    cursor: e-resize !important;
    background-color: #e0e0e0;
}
.content-detail{
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 280px;
    background: #fff;
    padding: 0 20px;
    .detail-header{
        padding-top: 20px;
        h2{
            display: inline-block;
        }
        .editBtn{
            float: right;
        }
    }
    .content{
        padding-top: 16px;
        font-size: 14px;
    }
}
  </style>
