const vThis = window.vueThis;
const _this = vThis.$mainVue;
let __this = null;
let currentCategoryId = null;
const checkDomainCodeConflicts = (rule, value, callback) => {
  if (__this.domainId && !__this.isDerive && __this.contentStatus !== 'addField') {
    callback()
    return
  }
  if (!value) {
    callback(new Error(_this.$t('domain.common.itemRequiredInput', {
      name: _this.$t('domain.domain.domainPropCode'),
    })))
  } else {
    _this.$http.post(_this.$domain_url + `/domains/domain/checkDomainCodeConflicts?domainCode=${encodeURIComponent(value)}`).then(res => {
      if (res.data) {
        callback(new Error(_this.$t('domain.domain.domainCodeExists')))
      } else {
        callback()
      }
    }).catch(e => {
      _this.$showFailure(e)
    })
  }
}
const checkBusinessNameConflicts = (rule, value, callback) => {
  const { description, businessRule } = __this.detail
  if (!value) {
    callback(new Error('请输入中文名称'));
    /*callback(new Error(_this.$t('domain.common.itemRequiredInput', {
      name: _this.$t('domain.domain.cName'),
    })))*/
  } else if(value === description || value === businessRule){
    callback(new Error('中文名称不能与业务定义或业务规则相同'))
  } else if (!/^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(value)) {
    callback(new Error('中文名称只能包含中文、字母和数字，不能包含特殊字符'));
  } else if (value.length > 15) {
    callback(new Error('中文名称长度不能超过15位'));
  } else if (!__this.isDerive && __this.contentStatus !== 'addField' && value && __this && __this.detailInitial && __this.detailInitial.chineseName === value) {
    callback()
  } else {
    _this.$plainRequest.post(_this.$domain_url + `/domains/domain/checkBusinessNameConflicts?categoryId=${currentCategoryId}`, value).then(res => {
      if (res.data) {
        callback(new Error(_this.$t('domain.domain.domainBusinessNameExists')))
      } else {
        callback()
      }
    }).catch(e => {
      _this.$showFailure(e)
    })
  }
}
export default {
  domainCode: ({categoryId, elThis}) => {
    currentCategoryId = categoryId;
    __this = elThis;
    return [
      {
        required: true,
        trigger: 'blur',
        validator: checkDomainCodeConflicts,
      },
    ]
  },
  chineseName: ({categoryId, elThis}) => {
    currentCategoryId = categoryId;
    __this = elThis;
    return [
      {
        required: true,
        trigger: 'blur',
        validator: checkBusinessNameConflicts
      },
    ]
  }
}
