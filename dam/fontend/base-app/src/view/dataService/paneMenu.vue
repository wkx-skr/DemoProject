<template>
  <div class="citic-form">
    <choose-tag
      :oldChoosedIds="choosedTags"
      @addTag="handleAddTag"
      ref="addTag"
    ></choose-tag>
    <div v-if="typeId !== $commentPreCode.Service" class="title">目录设置</div>
    <el-form
      v-if="typeId !== $commentPreCode.Service"
      size="mini"
      style="margin-bottom: 3em"
      label-width="10em"
      label-position="right"
    >
      <el-form-item
        v-for="(menu, index) in menus"
        :key="index"
        label="数据域目录"
      >
        <el-cascader
          :options="options"
          :props="defaultProps"
          v-model="menus[index]"
          :change-on-select="true"
          @focus="handleFocus(index)"
          @change="handleChange(index)"
        ></el-cascader>
        <el-button
          type="text"
          @click="removeMenu(index)"
          v-if="menus.length > 1"
        >
          删除目录
        </el-button>
        <el-button
          v-if="index === menus.length - 1"
          type="text"
          @click="appendMenu(index)"
        >
          添加目录
        </el-button>
      </el-form-item>
      <!--<el-form-item
        label="数据安全目录"
        disabled
      >
        <el-cascader
          :options="[]"
          :props="defaultProps"
          v-model="catalogArr"
          :change-on-select="true"
          @change="handleChange">
        </el-cascader>
      </el-form-item>-->
    </el-form>
    <div class="title">标签设置</div>
    <el-form size="mini" label-width="10em" label-position="right">
      <el-form-item label="标签">
        <el-tag
          type="danger"
          closable
          @close="removeTag([t.tagId])"
          style="margin-right: 1em; background: #fdeeef; color: #d20a10"
          size="small"
          v-for="t in tagsBefore"
          :key="t.tagId"
        >
          {{ t.name }}
        </el-tag>
        <el-button @click="editTags" class="el-icon-plus">选择标签</el-button>
        <i class="el-icon-info"></i>
      </el-form-item>
      <!--<el-form-item
        label=""
        style="margin-top:3em;"
      >
        <el-button type="primary" type="primary">保存设置</el-button>
      </el-form-item>-->
    </el-form>
  </div>
</template>
<script>
import paneMenu from './paneMenu.js'
export default paneMenu
</script>
