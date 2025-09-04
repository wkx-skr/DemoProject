
let html = `<img src="./static/libs/fake/guanwang_black.png" alt="" style="min-width: 160px;height: 50px;margin: 0 15px;"><div class="db-menus">`
// sessionStorage.setItem('menuList', '元数据,数据标准,数据质量,数据资产,数据安全,安全网关,系统管理')
const menuList = sessionStorage.getItem('menuList')
if (!location.href.includes('lineageDemo') && menuList) {
  $('#pre-fake-heading').attr('id', 'fake-heading')
  const list = menuList.split(',')
  list.forEach(m => {
    html += `<div class="item">${m}</div>`
  })
  html += `</div><div style="float: right;display:inline-block;"><img src="./static/libs/fake/topRight.png" style="height: 47px;" alt=""></div>`
  document.getElementById('fake-heading').innerHTML = html
}

