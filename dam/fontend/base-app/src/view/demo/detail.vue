<template>
  <div>
    <el-form
      class="page-form"
      label-position="right"
      label-width="100px"
      v-model="content"
      size="small"
    ></el-form>
    <div class="page-btn-group left-bottom">
      <el-button size="small" type="primary" @click="confirm">确 定</el-button>
      <el-button size="small" class="white-btn" @click="remove">
        {{ $t('common.button.cancel') }}
      </el-button>
    </div>
  </div>
</template>

<script>
import detail from './detail.js'
export default detail
</script>

<style lang="scss" scoped="scoped"></style>
