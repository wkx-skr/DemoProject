// Vue.directive("tableFit", {
//     //指令所在组件的 VNode 及其子 VNode 全部更新后调用。
//     componentUpdated(el, binding, vnode) {
//      setTimeout(() => {
//       adjustColumnWidth(el, vnode);
//      }, 0)
//     },
//    });

   const tableFit = {
    updated(el, binding, vnode) {
        setTimeout(() => {
            adjustColumnWidth(el, vnode);
        }, 0)
    },
   }
    
   function adjustColumnWidth(table, vnode) {
    //中文和全角正则
    const CN = new RegExp("[\u4E00-\u9FA5]|[^\uFF00-\uFFFF]");
    const NUM = new RegExp("[0-9]");
    //中文字体的像素宽度比例
    const CN_RATE = 1.1
    //数字字体的像素宽度比例
    const NUM_RATE = 0.65
    //其他字体的像素宽度比例
    const OTHER_RATE = 0.5
     
    const columns = vnode.child.columns.slice()
    //el-table通过colgroup标签设置html宽度
    const colgroup = table.querySelector("colgroup");
    const colDefs = [...colgroup.querySelectorAll("col")];
    //忽略 设置了宽度 序号 多选框 的列
    //判断gutter是否已存在
    const gutter = colgroup.querySelector(`col[name=gutter]`)
    const gutterx = colgroup.querySelector(`col[name=gutterx]`)
    let except = 0
    if (gutter || gutterx) {
     //删除gutter
     colDefs.pop()
    }
    //若有序号 多选框则删除
    except = colDefs.length - columns.length
    colDefs.splice(0, except)
    for (let i = columns.length - 1; i >= 0; i--) {
     if (columns[i].width) {
      colDefs.splice(i, 1)
      columns.splice(i, 1)
     }
    }
    
    //设置每列宽度
    colDefs.forEach((col, index) => {
     //colgroup中 和 表头标签的class名相同 通过class寻找相同列
     const clsName = col.getAttribute("name");
     const cells = [
      ...table.querySelectorAll(`.el-table__body-wrapper td.${clsName}`),
      ...table.querySelectorAll(`th.${clsName}`),
     ];
     const widthList = cells.map((el) => {
      const cell = el.querySelector(".cell")
      if (cell) {
       let fontSize = parseInt(window.getComputedStyle(cell,null).fontSize)
       fontSize = fontSize ? fontSize : 14
       let width = 0
       //计算每个字符的宽度
       for(let str of cell.innerText) {
        if(CN.test(str)) {
         width += fontSize * CN_RATE
        }else if(NUM.test(str)) {
         width += fontSize * NUM_RATE
        }else {
         width += fontSize * OTHER_RATE
        }
       }
       return Math.ceil(width)
      } else {
       return 0
      }
     });
      
     //取一列中的最大宽度
     const max = Math.max(...widthList);
     if (max !== 0) {
      //在表格数据中设置minWidth 防止尺寸变化重新计算原来的宽度
      //20 + 2  20 是cell类的padding 2 是给予额外空间
      columns[index].minWidth = max + 22
      table.querySelectorAll(`col[name=${clsName}]`).forEach((el) => {
       el.setAttribute("width", max + 22);
      });
     }
    });
    
    //设置完后调用el-table方法更新布局
    vnode.child.doLayout()
    
    tableRevise(table)
   }


   //修正el-table错位
function tableRevise(table) {
    const tableWrapper = table.querySelector('.el-table__body-wrapper')
    const tableBody = table.querySelector('.el-table__body')
    const colgroup = table.querySelector("colgroup");
    /**
     * (以下数值为滚动条高度，可以自己根据情况通过class重新修改)
     */
    //内容大于容器时
    if (tableBody.clientWidth > tableWrapper.offsetWidth) {
      
     //设置x轴滚动
     tableWrapper.style.overflowX = 'auto'
     //解决固定列错位 （没有错位的可以忽略以下内容）
     let fixedWrap = table.querySelectorAll('.el-table .el-table__fixed-body-wrapper')
     if (fixedWrap.length > 0) {
      fixedWrap.forEach(item => {
       item.style.paddingBottom = 8 + 'px'
      })
     }
     //解决固定列覆盖滚动条
     let fixed_left = table.querySelector('.el-table .el-table__fixed')
     let fixed_right = table.querySelector('.el-table .el-table__fixed-right')
     if (fixed_left) {
      fixed_left.style.height = 'calc(100% - 8px)'
     }
     if (fixed_right) {
      fixed_right.style.height = 'calc(100% - 8px)'
     }
     //解决表头偏移
     //没有原生的gutter时自己新增一个
     const gutter = colgroup.querySelector(`col[name=gutter]`)
     const gutterx = colgroup.querySelector(`col[name=gutterx]`)
     if (!gutter && !gutterx) {
      let col = document.createElement('col')
      col.setAttribute('name', 'gutterx')
      col.setAttribute('width', '8')
      colgroup.appendChild(col)
     }
    }
   }

   export default tableFit