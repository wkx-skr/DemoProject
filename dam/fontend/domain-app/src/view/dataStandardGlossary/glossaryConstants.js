import i18n from '@/next/i18n'
import Vue from 'vue'

export const columnDefs = (vThis, showOper = true) => {
  const arr = [
    {
      headerName: vThis.$t('domain.glossary.glossaryCName'),
      field: 'chName',
      tooltipField: 'chName',
      type: ['customCol'],
      customColName: 'chNameTableCol',
      minWidth: 120,
    },
    {
      headerName: vThis.$t('domain.glossary.domainCode'),
      field: 'domainCode',
      tooltipField: 'domainCode',
      type: ['customSortCol'],
      minWidth: 120,
    },
    {
      headerName: vThis.$t('domain.glossary.enName'),
      field: 'enName',
      tooltipField: 'enName',
      type: ['customSortCol'],
      minWidth: 120,
    },
    {
      headerName: vThis.$t('domain.glossary.glossaryAbbr'),
      field: 'abbr',
      tooltipField: 'abbr',
      type: ['customSortCol'],
      minWidth: 100,
    },
    {
      headerName: vThis.$t('domain.glossary.state'),
      field: 'state',
      // colId: 'state',
      tooltipField: 'state',
      customColName: 'custom-state',
      type: ['customCol'],
      // filterParams: {
      //   getFilterItem: vThis.getFilterItem,
      //   autoRefresh: true,
      // },
      minWidth: 80,
    },
    /*{
      headerName: vThis.$t('domain.glossary.managementDepartment'),
      field: 'managementDepartmentName',
      // valueFormatter: vThis.formatterTime,
      tooltipField: 'managementDepartment',
      // tooltipValueGetter: vThis.formatterTime,
      // type: ['customSortCol'],
      width: 100,
    },*/
    {
      headerName: vThis.$t('domain.glossary.firstPublish'),
      field: 'firstPublish',
      valueFormatter: vThis.formatterTime,
      // tooltipField: 'timestamp',
      tooltipValueGetter: vThis.formatterTime,
      type: ['customSortCol'],
      width: 150,
    },
    {
      headerName: vThis.$t('domain.glossary.modifyTime'),
      field: 'updateTime',
      valueFormatter: vThis.formatterTime,
      // tooltipField: 'timestamp',
      tooltipValueGetter: vThis.formatterTime,
      type: ['customSortCol'],
      width: 150,
    },
  ]
  if (showOper) {
    arr.push({
      headerName: vThis.$t('domain.common.operation'),
      width: 100,
      type: ['optionsWithContent'],
      cellRendererParams: {
        tabComponent: vThis,
        options: vThis.$auth?.DICTIONARY_EDIT
          ? [
              {
                name: 'edit',
                text: vThis.$t('domain.common.edit'),
                method: 'editGlossary',
                icon: 'iconfont icon-bianji',
                ifBtnShow: data => {
                  return vThis.hasAccess && data.state === 'D'
                },
              },
              {
                name: 'check',
                text: vThis.$t('domain.common.check'),
                method: 'showGlossaryDetail',
                icon: 'iconfont icon-see',
                ifBtnShow: data => {
                  return vThis.hasAccess && data.state !== 'D'
                },
              },
              {
                name: 'history',
                text: vThis.$t('domain.glossary.checkHistory'),
                method: 'showHistory',
                icon: 'iconfont icon-History',
              },
            ]
          : [
              {
                name: 'history',
                text: vThis.$t('domain.glossary.checkHistory'),
                method: 'showHistory',
                icon: 'iconfont icon-History',
              },
            ],
      },
    })
  }
  return arr
}

export const findByFoldId = (list, targetId, pathIds) => {
  if (!list || !list.length) {
    return
  }
  for (let i = 0; i < list.length; i++) {
    if (list[i].foldId === targetId) {
      pathIds.push(list[i].foldId)
      return list[i]
    }
    if (list[i].nodes && list[i].nodes.length) {
      pathIds.push(list[i].foldId)
      let result = findByFoldId(list[i].nodes, targetId, pathIds)
      if (result) {
        return result
      } else {
        pathIds.pop()
      }
    }
  }
}

export const stateOptions = vThis => {
  return [
    {
      label: vThis.$t('domain.common.all'),
      value: null,
    },
    {
      label: vThis.$t('domain.common.underReview'),
      value: 'C',
    },
    {
      label: vThis.$t('domain.common.pendingReview'),
      value: 'D',
    },
    {
      label: vThis.$t('domain.common.published'),
      value: 'A',
    },
    {
      label: vThis.$t('domain.common.obsolete'),
      value: 'X',
    },
    {
      label: '无状态',
      value: 'N',
    },
  ]
}
export const statusFormatter = status => {
  const param = {
    value: status,
  }
  switch (param.value) {
    case 'X':
      return Vue.prototype.$version.domain.status.deprecated
    case 'D':
      return i18n.t('domain.common.pendingReview')
    case 'C':
      return i18n.t('domain.common.underReview')
    case 'A':
      return Vue.prototype.$version.domain.status.adopted
  }
  return param.value
}
export const checkStatusFormatter = status => {
  const param = {
    value: status,
  }
  switch (param.value) {
    case 'UNPASS':
      return '未通过'
    case 'UNCHECK':
      return '未检查'
    case 'PASS':
      return '已通过'
    case 'SKIP':
      return '已跳过'
  }
  return param.value
}
export const getStatusColor = statue => {
  switch (statue) {
    case 'A':
      return '#5CB793'
    case 'D':
      return '#F79B3F'
    case 'C':
      return '#4386F5'
    case 'X':
      return '#AFB4BF'
  }
}
