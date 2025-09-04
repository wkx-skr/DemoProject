import Vue from 'vue'
const This = Vue.prototype
export default {
  getBranchNameByBm(bm) {
    // 支持获取单个或多个bm的名字
    if (!bm) return
    const nameList = []
    bm.toString()
      .split(',')
      .forEach(e => {
        if (!This.$BranchDto.filter(e5 => e5.bm === e).length) {
          // 机构已经被删除或传进来的已经是机构名，原样返回
          nameList.push(e)
        } else if (!e.pbm) {
          // 根机构, 返机构名称
          nameList.push(This.$BranchDto.filter(e6 => e6.bm === e)[0].fullName)
        } else {
          // 普通机构，返机构名称同时带上上级机构名称
          nameList.push(
            [
              This.$BranchDto.filter(
                e3 => e3.bm === This.$BranchDto.filter(e2 => e2.bm === e)[0].pbm
              )[0].fullName,
              This.$BranchDto.filter(e4 => e4.bm === e)[0].fullName,
            ].join('/')
          )
        }
      })
    return nameList.toString()
  },
}
