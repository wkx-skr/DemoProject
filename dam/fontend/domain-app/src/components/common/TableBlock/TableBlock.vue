<template>
  <div class="block">
    <h2 class="t_name">t_user</h2>
    <div class="t_column">
      <div style="position: absolute; left: 5px; top: 0">
        <i class="fa fa-key fa-lg pk"></i>
      </div>
      <ul class="clear-fix">
        <li>
          <span class="column-name">cno:</span>
          <span class="column-type">varchar(20)</span>
        </li>
        <li class="related">
          <span class="column-name">cno:</span>
          <span class="column-type">varchar(20)</span>
        </li>
        <li>
          <span class="column-name">cno:</span>
          <span class="column-type">varchar(20)</span>
        </li>
        <li>
          <span class="column-name">cno:</span>
          <span class="column-type">varchar(20)</span>
        </li>
        <li>
          <span class="column-name">cno:</span>
          <span class="column-type">varchar(20)</span>
        </li>
        <li>
          <span class="column-name">cno:</span>
          <span class="column-type">varchar(20)</span>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
export default {}
</script>
<style scoped lang="scss">
.pk {
  color: #ffd83b;
}
.block {
  width: 200px;
  border-radius: 20px;
  .t_name {
    text-align: center;
    color: #333333;
    height: 35px;
    line-height: 35px;
    background: linear-gradient(to top, #4bbbdc, #58c0df);
    border-radius: 20px 20px 0 0;
  }
  .t_column {
    position: relative;
    background-color: #fff;
    border-radius: 0 0 20px 20px;
    border: 1px solid #b3b3b3;
    border-top: none;
    ul {
      li {
        font-size: 14px;
        margin-bottom: 5px;
        text-align: center;
        color: #8391a5;
      }
      .related {
        color: black;
        font-weight: bold;
      }
    }
  }
}
</style>
