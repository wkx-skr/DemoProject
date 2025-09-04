// 所有最底层页面的列表,
// group 字段 相当于 parent 字段
const This = {
	$t: (str) => `$t('ddm.${str}')`
}
const Menu = [
	// 工作台
	// 个人工作台
	{
		name: 'dashboard',
		label: '个人工作台', // 个人工作台
		index: '/main/dashboard',
		icon: 'iconfont icon-workbench',
		group: 'userPane',
		roles: []
	},
	// 个人资料
	{
		name: 'userInformation',
		label: '个人资料', // 个人资料
		index: '/main/userInformation',
		icon: 'iconfont icon-schema',
		group: 'myMaterial',
		roles: []
	},
	// 我的消息
	{
		name: 'myMessage',
		label: '收件箱', // 收件箱
		index: '/main/myMessage',
		icon: 'iconfont icon-menu-news',
		group: 'myMessage',
		roles: []
	},
	{
		name: 'myMessageSent',
		label: '发件箱', // 发件箱
		index: '/main/myMessageSent',
		icon: 'iconfont icon-menu-news',
		group: 'myMessage',
		roles: []
	},
	// 我的申请
	{
		name: 'myApply',
		label: '我的申请', // 我的申请
		index: '/main/myApply',
		icon: 'iconfont icon-menu-bwdsq',
		group: 'myApply',
		roles: []
	},
	// 办理事项
	{
		name: 'myTodo',
		label: '我的待办', // 我的待办
		index: '/main/myTodo',
		icon: 'iconfont icon-workbench',
		group: 'workflowMatters',
		roles: []
	},
	{
		name: 'myDone',
		label: '我的已办', // 我的已办
		index: '/main/myDone',
		icon: 'iconfont icon-workbench',
		group: 'workflowMatters',
		roles: []
	},
	{
		name: 'myReport',
		label: '我的报告', // 我的报告
		index: '/main/myReport',
		icon: 'iconfont icon-menu-zlbg',
		group: 'myReport',
		roles: []
	},

	// // 模型目录
	// {
	//   name: 'list',
	//   label: '模型目录', // 个人工作台
	//   index: '/main/list',
	//   icon: '',
	//   group: '',
	//   roles: []
	// },

	// 系统管理
	{
		name: 'tag',
		label: '标签管理', // 标签管理
		index: '/main/tag',
		icon: 'fa fa-tag',
		group: 'modelMgr',
		roles: ['ROLE_TAG_MANAGE_DDM']
	},
	{
		name: 'ddlSetting',
		label: 'DDL配置', // 'DDL配置',
		index: '/main/ddlSetting',
		icon: 'fa fa-list',
		group: 'modelMgr',
		roles: ['ROLE_DDL_MANAGE_DDM']
	},
	{
		name: 'udp',
		label: '自定义属性', // '自定义属性',
		index: '/main/udp',
		icon: 'fa fa-list',
		group: 'modelMgr',
		roles: ['ROLE_UDP_MANAGE_DDM']
	},
	{
		name: 'phases',
		label: '自定义状态', // '自定义状态',
		index: '/main/phases',
		icon: 'fa fa-file-code-o',
		group: 'modelMgr',
		roles: ['ROLE_PHASE_MANAGE_DDM']
	},
	{
		name: 'messageManage',
		label: '系统消息管理', // '系统消息管理',
		index: '/main/messageManage',
		icon: 'fa fa-file-code-o',
		group: 'modelMgr',
		roles: ['ROLE_SYSTEM_MESSAGE_DDM']
	},
	{
		name: 'datatypeMapping',
		label: '数据类型转换',
		index: '/main/datatypeMapping',
		icon: 'fa fa-file-code-o',
		group: 'modelMgr',
		roles: ['ROLE_DATA_TYPE_MANAGE_DDM']
	},
	{
		name: 'modelTemplate',
		label: '实体模板管理',
		index: '/main/modelTemplate',
		icon: 'fa fa-file-code-o',
		group: 'modelMgr',
		roles: ['ROLE_TEMPLATE_MANAGE_DDM']
	},
	{
		name: 'drive',
		label: '驱动管理', // '驱动管理',
		index: '/main/drive',
		icon: 'fa fa-file-code-o',
		group: 'modelMgr',
		roles: ['ROLE_DRIVER_MANAGE_DDM']
	},
	{
		label: '操作日志', // 操作日志
		name: 'log',
		index: '/main/log',
		icon: 'fa fa-level-up',
		group: 'modelMgr',
		roles: ['ROLE_OPS_LOG_MANAGE_DDM']
	},
	{
		label: '控制面板',
		name: 'configPane',
		index: '/main/configPane',
		icon: 'fa fa-level-up',
		group: 'modelMgr',
		roles: ['ROLE_CONTROL_MANAGE_DDM']
	},

	// {
	// 	label: '企业级模型地图',
	// 	name: 'architecture',
	// 	index: '/main/enterprise/architecture',
	// 	icon: 'fa fa-file-code-o',
	// 	group: 'enterprise',
	// 	roles: []
	// },
	// {
	// 	label: '模型分层',
	// 	name: 'modelLevel',
	// 	index: '/main/modelLevel',
	// 	icon: 'fa fa-file-code-o',
	// 	group: 'enterprise',
	// 	roles: []
	// },
	{
		label: '检查策略管理',
		name: 'ruleGroup',
		index: '/main/ruleGroup',
		group: 'rule',
		roles: ['ROLE_CHECK_STRATEGY_DDM']
	},
	{
		label: '模型检查规则', // '模型检查规则',
		name: 'modelRules',
		index: '/main/modelRules',
		group: 'rule',
		roles: ['ROLE_MODEL_CHECK_DDM']
	},
	{
		label: '内置检查规则',
		name: 'defaultRules',
		index: '/main/defaultRules',
		group: 'rule',
		roles: ['ROLE_SYSTEM_CHECK_DDM']
	},

	{
		label: '运营报告', // 运营报告
		name: 'report',
		index: '/main/report',
		group: 'operateMgr',
		roles: ['ROLE_OPS_REPORT_DDM']
	},
	{
		label: '主题',
		name: 'modelTheme',
		index: '/main/modelTheme',
		icon: 'fa fa-file-code-o',
		group: 'conceptModel',
		roles: []
	},
	{
		label: '业务对象',
		name: 'businessObj',
		index: '/main/businessObj',
		icon: 'fa fa-level-up',
		group: 'logicalModel',
		roles: []
	},
	{
		label: '业务领域',
		name: 'businessArea',
		index: '/main/businessArea/ConceptualBusinessDomain',
		icon: 'fa fa-level-up',
		group: 'conceptModel',
		roles: []
	},
	{
		label: '业务领域',
		name: 'businessArea',
		index: '/main/businessArea/LogicalBusinessDomain',
		icon: 'fa fa-level-up',
		group: 'logicalModel',
		roles: []
	},
	// 数据标准
	{
		label: '基础标准',
		name: 'dataStandardDdm',
		index: '/main/dataStandard',
		group: 'domain',
		roles: ['DATA_STANDARD_DELETE', 'DATA_STANDARD_IMPORT_STANDARDS', 'DATA_STANDARD_EXPORT', 'DATA_STANDARD_EXPORT_CHECKED', 'DATA_STANDARD_EXPAND', 'DATA_STANDARD_ADD', 'DATA_STANDARD_VIEW', 'DATA_STANDARD_RELEASE', 'DATA_STANDARD_UPDATA', 'DATA_STANDARD_SCRAP', 'DATA_STANDARD_EDIT', 'DATA_STANDARD_IMPORT_DIRECT', 'DATA_STANDARD_VIEW_ALL', 'DATA_STANDARD_VIEW_DELETE']
	},
	{
		label: '域标准',
		name: 'domainStandardDdm',
		index: '/main/domainStandard',
		group: 'domain',
		roles: ['DATA_STANDARD_FIELD_MANAGE', 'DATA_STANDARD_FIELD_VIEW']
	},
	{
		label: '标准代码',
		name: 'codeDdm',
		index: '/main/code',
		// icon: 'fa fa-level-up',
		group: 'domain',
		roles: ['STANDARD_CODE_DELETE', 'STANDARD_CODE_IMPORT_CODE', 'STANDARD_CODE_EXPORT', 'STANDARD_CODE_ADD', 'STANDARD_CODE_VIEW', 'STANDARD_CODE_RELEASE', 'STANDARD_CODE_UPDATA', 'STANDARD_CODE_SCRAP', 'STANDARD_CODE_EDIT', 'STANDARD_CODE_BATCH_EDIT', 'STANDARD_CODE_IMPORT_DIRECT', 'STANDARD_CODE_VIEW_ALL', 'STANDARD_CODE_EXPAND']
	},
	{
		label: '领域数据标准',
		name: 'dataStandardFieldDdm',
		index: '/main/dataStandardField',
		// icon: 'fa fa-level-up',
		group: 'domain',
		roles: ['DATA_STANDARD_CATEGORY_CREATE', 'DATA_STANDARD_CATEGORY_VIEW']
	},
	{
		label: '命名词典',
		name: 'glossaryDdm',
		index: '/main/glossary',
		// icon: 'fa fa-level-up',
		group: 'domain',
		roles: ['DICTIONARY_DELETE', 'DICTIONARY_EXPORT', 'DICTIONARY_IMPORT', 'DICTIONARY_VIEW', 'DICTIONARY_ADD', 'DICTIONARY_EDIT']
	},
	// 流程管理
	{
		label: '流程中心',
		name: 'processCenterDdm',
		index: '/main/processCenter',
		// icon: 'fa fa-level-up',
		group: 'process',
		roles: ['ROLE_PROCENTRE_MANAGE_DDM']
	},
	{
		label: '流程监控',
		name: 'allApplyDdm',
		index: '/main/allApply',
		// icon: 'fa fa-level-up',
		group: 'process',
		roles: ['ROLE_PROMONITOR_MANAGE_DDM']
	},
	// {
	// 	label: '监听器',
	// 	name: 'monitorDdm',
	// 	index: '/main/monitor',
	// 	// icon: 'fa fa-level-up',
	// 	group: 'process',
	// 	roles: ['ROLE_MONITOR_MANAGE_DDM']
	// },
	// 用户管理
	{
		label: '机构管理',
		name: 'organizationManageDdm',
		index: '/main/organizationManage',
		// icon: 'fa fa-level-up',
		group: 'user',
		roles: ['ROLE_ORGANIZATIONAL_MANAGE_DDM']
	},
	{
		label: '用户管理',
		name: 'userDdm',
		index: '/main/user',
		// icon: 'fa fa-level-up',
		group: 'user',
		roles: ['ROLE_USER_MANAGE_DDM']
	},
	{
		label: '角色管理',
		name: 'groupDdm',
		index: '/main/group',
		// icon: 'fa fa-level-up',
		group: 'user',
		roles: ['ROLE_GROUP_MANAGE_DDM']
	}
]

const groupNameMap = {
	userPane: '工作台',
	workflowMatters: '办理事项', // 办理事项
	myMessage: '我的消息', // 我的消息
	modelMgr: `系统管理`,
	ruleChecke: `模型检查规范`,
	operateMgr: `运营管理`,
	enterprise: '架构管理',
	conceptModel: '概念数据模型',
	logicalModel: '业务逻辑模型',
	domain: '数据标准',
	user: '用户管理',
	process: '流程管理',
	rule: '规则与策略',
	myApply: '我的申请',
	myMaterial: '个人资料',
	myReport: '我的报告'
}

Menu.push({
	label: '许可证管理', // 许可证管理
	name: 'license',
	index: '/main/license',
	group: 'operateMgr',
	roles: ['ROLE_LICENSE_MANAGE_DDM']
})
Menu.push({
	label: '在线编辑状态', // 在线编辑状态
	name: 'webLicense',
	index: '/main/webLicense',
	group: 'operateMgr',
	roles: ['ROLE_EDITING_STATUS_DDM']
})
const categoriesTree = {
	// 工作台
	userPane: {
		label: '工作台',
		groups: [
			'userPane',
			'myMaterial',
			'myMessage',
			'myApply',
			'workflowMatters',
			'myReport'
		],
		icon: ['icon-workbench', 'icon-schema', 'icon-menu-news', 'icon-menu-bwdsq', 'icon-menu-blsx', 'icon-menu-zlbg']
	},
	modelMgrList: {
		// 系统管理
		label: '系统管理',
		groups: ['operateMgr', 'modelMgr', 'process', 'rule', 'user'],
		icon: ['icon-shuju', 'icon-menu-xtgl', 'icon-menu-lcgl', 'icon-menu-gzgl', 'icon-manysee']
	},
	// enterpriseList: {
	// 	// 架构管理
	// 	label: '架构管理',
	// 	groups: ['enterprise'],
	// 	icon: ['icon-code']
	// },
	assetsList: {
		// 架构管理
		label: '架构管理',
		groups: ['conceptModel', 'logicalModel'],
		icon: ['icon-gainianmoxing', 'icon-yewumoxing']
	},
	domain: {
		label: '数据标准',
		groups: ['domain'],
		icon: ['icon-shujubiaozhun']
	}
}
let pageMap = {}
let pageTree = {
	"数据模型": {
		"数据模型": [
			'list',
			'modeledit'
		]
	},
}

let groupSubs = {}
for (let key in categoriesTree) {
	let cur = categoriesTree[key]
	pageTree[cur.label] = {}
	// console.log(cur.label, 'cur.label')

	let groups = categoriesTree[key].groups || []
	groups.forEach(item => {
		let curGroup = groupNameMap[item]
		groupSubs[curGroup] = []
		pageTree[cur.label][curGroup] = groupSubs[curGroup]
	})
}

Menu.forEach(item => {
	const removeDdmPage = [
		'processCenterDdm',
		'allApplyDdm',
		'monitorDdm',
		'organizationManageDdm',
		'userDdm',
		'groupDdm',
		'dataStandardDdm',
		'domainStandardDdm',
		'codeDdm',
		'dataStandardFieldDdm',
		'glossaryDdm'
	]
	let name = item.name
	let appName = 'ddm-app'
	if (item.group === 'domain') {
		appName = 'domain-app'
	} else if (item.group === 'user') {
		appName = 'base-app'
	} else if (item.group === 'process') {
		appName = 'base-app'
	}

	const obj = {
		name: name,
		label: item.label,
		vueRouter: item.index,
		appName: appName,
		licenseRequired: [],
		// accessRequired: [],
		// path: [categoriesTree[groupMap[item.group]].label, groupNameMap[item.group] || item.group]
	}
	if (removeDdmPage.includes(name)) {
		name = name.replace('Ddm', '')
		obj.name = name
	} else {
		pageMap[item.name] = obj;
	}

	(groupSubs[groupNameMap[item.group]] || []).push(obj.name)
})
pageMap.list = {
	name: "list",
	label: "数据模型",
	vueRouter: "/main/list",
	appName: "ddm-app",
	licenseRequired: [],
	// accessRequired: [],
	hideLeftNav: true,
	hidePageHeading: false,
	hide: false,
}

pageMap.modeledit = {
	name: "modeledit",
	label: "模型编辑",
	vueRouter: "/main/modeledit",
	appName: "ddm-app",
	licenseRequired: [],
	// accessRequired: [],
	hideLeftNav: true,
	hidePageHeading: true,
	hide: true,
}


const pageTreeOrder = ['工作台', '数据模型', '数据标准', '架构管理', '系统管理']
let pageTreeSort = {}
pageTreeOrder.forEach((item, index) => {
	pageTreeSort[item] = pageTree[item]
})
export default {
	ddmPageMap: pageMap,
	ddmPageTree: pageTreeSort
}
