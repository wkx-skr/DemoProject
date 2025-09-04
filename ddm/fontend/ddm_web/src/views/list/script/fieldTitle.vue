<template>
    <span class="label">
      <slot></slot>
    </span>
</template>
<style lang="scss" scoped>

  .label {
    border-left:4px solid #4386f5;
    padding-left:0.5em;
    font-size:14px;
    height:20px;
    line-height:20px;
    display:block;
    margin:1em 0 0.5em;
    font-weight: 500;
  }
</style>
