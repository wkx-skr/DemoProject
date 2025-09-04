<template>
  <div class="check-password-box" >
    <div class="reset-password-box" :style="{width:boxWidth,color:password.length===0?'#555':'#ff314b'}">
      <h5 style="color: #555">新密码需包含以下：</h5>
      <div :class="{ 'col-66bf16': has8 }">
        <div v-if='password.length==0' class="point"></div>
        <div v-else-if="has8" class="right-icon">
          <i class="iconfont icon-right"></i>
        </div>
        <div v-else class="false-icon">
          <i class="iconfont icon-false" style="color:#ff314b"></i>
        </div>
        
        包含至少8个字符
      </div>
      <div :class="{ 'col-66bf16': hasAlapha }">
        <div v-if='password.length==0' class="point"></div>
        <div v-else-if="hasAlapha" class="right-icon">
          <i class="iconfont icon-right"></i>
        </div>
        <div v-else class="false-icon">
          <i class="iconfont icon-false" style="color:#ff314b"></i>
        </div>
        包含小写字母(a-z)和大写字母(A-Z)
      </div>
      <div :class="{ 'col-66bf16': hasNumAndPunc }">
        <div v-if='password.length==0' class="point"></div>
        <div v-else-if="hasNumAndPunc" class="right-icon">
          <i class="iconfont icon-right"></i>
        </div>
        <div v-else class="false-icon">
          <i class="iconfont icon-false" style="color:#ff314b"></i>
        </div>
        至少包含一个数字(0-9)和一个特殊符号
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'checkPasswordBox',
  props:{
    password: {
      type: String,
    },
    boxWidth:{
      type:String,
      default:'320px'
    }
  },
  computed: {
    has8() {
      if (this.password && this.password.length > 7) {
        return true
      }
      return false
    },
    hasAlapha() {
      if (/^(?=.*[a-z])(?=.*[A-Z])/.test(this.password)) {
        return true
      }
      return false
    },
    hasNumAndPunc() {
      if (
        /^(?=.*\d)(?=.*[~!@#$%^&*()（）_+`\-={}:";'<>?,.\/])/.test(
          this.password
        )
      ) {
        return true
      }
      return false
    },
    abcd(){
      alert(321)
    }
  },
}
</script>

<style lang='scss'>
.check-password-box {
  .reset-password-box {
    &:focus{
      border:1px solid red;
    }
    background: #f5f5f5;
    padding: 5px 10px 10px;
    .col-66bf16 {
      color: #66bf16;
    }
    i {
      color: #66bf16;
      transform: translateY(2px);
    }
    .false-icon{
     color:#ff314b;
     display: inline-block;
     transform: translateY(2px);
    }
    .right-icon{
      display: inline-block;
      transform: translateY(2px);
    }
  }
  .point {
    transform: translateY(-2px);
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #555555;
    margin-right: 8px;
  }
}
</style>