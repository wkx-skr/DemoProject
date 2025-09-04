<template>
  <div>
    <el-select
      :style="'width:' + width"
      v-model="tuAcctList"
      multiple
      :placeholder="placeholder"
    >
      <el-option
        :style="'width:' + width"
        v-for="item in valueList"
        :key="item.username"
        :label="item.username"
        :value="item.username"
      ></el-option>
    </el-select>
    <span
      class="el-icon-circle-plus-outline"
      style="transform: scale(1.5); margin-left: 10px; opacity: 0.4"
      @click="addUser()"
    ></span>
  </div>
</template>

<script>
export default {
  name: 'sqySelect',
  props: ['plist', 'width', 'placeholder'],
  data() {
    return {
      tuAcctList: [],
      valueList: [],
    }
  },
  mounted() {
    this.valueList = this.plist || []
  },
  methods: {
    addUser() {
      this.$utils.staffSelect.open().then(res => {
        res.forEach(e => {
          const obj = {
            // tuAcct: e.tuAcct,
            // tuCname: e.tuCname,
            username: e.username,
          }
          if (
            !this.valueList
              .map(e => JSON.stringify(e))
              .includes(JSON.stringify(obj))
          ) {
            this.valueList.push(obj)
          }
          if (!this.tuAcctList.includes(obj.username)) {
            this.tuAcctList.push(obj.username)
          }
        })
      })
    },
  },
  watch: {
    tuAcctList(val) {
      this.$emit('valueChange', val)
    },
    plist() {
      this.valueList = _.cloneDeep(this.plist)
      this.tuAcctList = _.cloneDeep(this.plist.map(e => e.tuAcct))
    },
  },
}
</script>

<style scoped>
span:hover {
  cursor: pointer;
}
</style>
