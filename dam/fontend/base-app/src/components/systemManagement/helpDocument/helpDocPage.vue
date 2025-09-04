<template>
  <!-- 文档标签内容需要修改: 1 将图表/流程图等word中的表格换成图片 2 h标签层级(调到最高级) 3 word文档中的代码修改样式 4 链接(a标签)指向调整  -->
  <div class="container help-doc">
    <p class="doc-title">中国人寿数据架构平台</p>
    <p class="info-title">{{ this.currentTitle }}</p>
    <h1>快速上手</h1>
    <h2>访问地址</h2>
    <p>在浏览器地址栏输入数据架构平台的URL，系统会显示下面的登陆界面：</p>

    <p>输入正确的用户名和密码，点击“登录”，进入数据架构平台主页面：</p>
    <p>
      Dashboard以展示的整体数据库血缘关系为主题，左侧是功能模块导航区，顶部提供各维度的统计信息，右侧展示模型差异和开发数据模型新版本信息。
    </p>

    <p>Tips:</p>
    <p>推荐使用的浏览器：Chrome</p>
    <h2>角色分类</h2>
    <p>本系统根据公司不同职能部门分为下面几类用户角色：</p>
    <ul>
      <li>
        <p>系统管理员：</p>
        <ul>
          <li>
            <p>负责配置系统名录；</p>
          </li>
          <li>
            <p>制定分配用户角色；</p>
          </li>
          <li>
            <p>创建管理用户；</p>
          </li>
          <li>
            <p>系统设置；</p>
          </li>
          <li>
            <p>Dashboard数据扫描任务；</p>
          </li>
        </ul>
      </li>
      <li>
        <p>数据库管理员（DBA）：</p>
        <ul>
          <li>
            <p>数据源添加及管理；</p>
          </li>
          <li>
            <p>技术质量规则定义以及数据质量任务后续的修复任务维护和管理；</p>
          </li>
          <li>
            <p>数据源更新扫描任务创建和管理，模型差异比较任务创建和管理；</p>
          </li>
        </ul>
      </li>
      <li>
        <p>普通用户：</p>
        <ul>
          <li>
            <p>查看生产模型管理和数字资产；</p>
          </li>
          <li>
            <p>查看数据质量修复任务；</p>
          </li>
          <li>
            <p>查看数据标准；</p>
          </li>
        </ul>
      </li>
      <li>
        <p>数据标准管理员：负责数据标准的创建及管理</p>
      </li>
      <li>
        <p>数据血缘管理员：数据流向管理，负责数据血缘导入和编辑</p>
      </li>
      <li>
        <p>数据质量管理员：负责数据业务质量规则的制定及管理</p>
      </li>
    </ul>
    <h1>系统管理员</h1>
    <h2>操作流程图</h2>

    <h2>系统名录管理</h2>
    <ol>
      <li>
        <ul>
          <li>
            通过左侧导航面板：系统管理-&gt;系统名录，打开“系统名录”管理页面，该页面提供“添加”和“删除”功能。
          </li>
        </ul>
      </li>
    </ol>

    <ul>
      <li>
        每条记录显示了该系统已添加的系统名录信息，操作列有“编辑”链接，点击“编辑”按钮，打开该系统名录的详细信息和数据源信息，进行编辑修改：
      </li>
    </ul>

    <ul>
      <li>
        <p>
          点击系统名录右上角的“添加系统”按钮，打开“添加系统”页面，填写如下必填项，点击“确定”按钮。
        </p>
      </li>
      <li>
        <p>系统名称</p>
      </li>
      <li>
        <p>系统简写</p>
      </li>
      <li>
        <p>IT部门</p>
      </li>
    </ul>

    <h2>
      <span id="_Ref520892721" class="anchor">
        <span id="_Toc520892912" class="anchor"></span>
      </span>
      角色管理
    </h2>
    <ul>
      <li>
        通过左侧导航面板：系统管理-&gt;角色管理，打开“角色”列表页面，该页面提供“添加”和“删除”功能。
      </li>
    </ul>
    <blockquote></blockquote>
    <ul>
      <li>
        每条记录显示了该系统已添加的角色信息，操作列有“编辑”链接，点击“编辑”按钮，打开该角色的详细信息和成员列表，进行编辑修改和添加成员：
      </li>
    </ul>
    <blockquote></blockquote>
    <ul>
      <li>
        点击权限后侧的下拉箭头，列出该系统支持的权限列表，支持为当前角色添加一个或多个对应的权限：
      </li>
    </ul>

    <h2>用户管理</h2>
    <ul>
      <li>
        <p>
          通过左侧导航面板：系统管理-&gt;用户管理，打开“用户”列表页面，该页面提供“添加”和“删除”功能。
        </p>
      </li>
      <li>
        <p>
          每条记录显示了该系统已添加的用户信息，操作列有“编辑”链接，点击“编辑”按钮，展示该用户的账号设置和信息设置，进行编辑修改和管理系统和修改密码的功能：
        </p>
      </li>
      <li>
        <p>
          点击“添加”按钮，打开“新建用户”页面，填写下列必填项，点击“确定”按钮。
        </p>
        <ul>
          <li>
            <p>登陆名</p>
          </li>
          <li>
            <p>密码</p>
          </li>
          <li>
            <p>姓名</p>
          </li>
          <li>
            <p>Email</p>
          </li>
          <li>
            <p>电话号码</p>
          </li>
        </ul>
      </li>
    </ul>
    <h2>
      <span id="_&#x7CFB;&#x7EDF;&#x8BBE;&#x7F6E;" class="anchor">
        <span id="_Toc520892914" class="anchor"></span>
      </span>
      系统设置
    </h2>
    <ul>
      <li>
        <p>
          通过左侧导航面板：系统管理-&gt;系统设置，打开“系统设置”页面，该页面提供“设置邮件”和“参数列表”管理功能。
        </p>
        <ul>
          <li>
            <p>
              设置邮件：点击“设置邮件”Tab，填写邮件服务器，端口，用户名，发件人和密码，设置完成
            </p>
          </li>
          <li>
            <p>参数列表：点击“参数列表”Tab，支持添加，删除功能。</p>
          </li>
          <li>
            <p>参数列表：选中参数，点击“查看”显示选中参数的详细信息：</p>
          </li>
        </ul>
      </li>
    </ul>
    <h2>Dashboards数据扫描任务</h2>
    <ul>
      <li>
        <p>
          通过左侧导航面板：系统管理-&gt;系统任务，打开“系统任务”页面，查看Dashboard数据扫描任务，支持编辑操作。
        </p>
      </li>
      <li>
        <p>
          点击“编辑“按钮，弹出Dashboard数据扫描任务页面，提供查看和编辑功能。
        </p>
      </li>
    </ul>
    <h1>数据库管理员（DBA）</h1>
    <h2>操作流程图</h2>

    <h2>数据源管理</h2>
    <ul>
      <li>
        通过左侧导航面板：数据模型-&gt;数据源，打开“数据源”列表页面，该页面提供“添加新数据源”和“删除”功能。
      </li>
    </ul>

    <ul>
      <li>
        <p>
          每条记录显示了该系统已添加的数据源信息，操作列有“检测”，“编辑”，“更新任务”，“比较任务”，“导出元数据”，“更新元数据”链接，点击“编辑”按钮，展示该用户的账号设置和信息设置，进行编辑修改和管理系统和修改密码的功能：
        </p>
        <ul>
          <li>
            <p>检测：检测该数据源连接状态</p>
          </li>
          <li>
            <p>编辑：提供修改数据源信息</p>
          </li>
        </ul>
      </li>
    </ul>

    <ul>
      <li>导出元数据：下载选中的元数据或者是下载全部元数据。</li>
    </ul>

    <ul>
      <li>
        <p>更新元数据：通过元数据的编辑模板，更新相关元数据</p>
      </li>
      <li>
        <p>更新任务：管理更新任务</p>
      </li>
      <li>
        <p>比较任务：管理比较任务</p>
      </li>
      <li>
        <p>
          1.3点击“添加数据源”按钮，打开“新建用户”页面，填写下列必填项，点击“测试”按钮，测试通过后获取数据库列表供用户选择，点击“确认”按钮。
        </p>
      </li>
      <li>
        <p>所属系统</p>
      </li>
      <li>
        <p>用户名</p>
      </li>
      <li>
        <p>密码</p>
      </li>
    </ul>
    <h2>技术质量规则</h2>
    <ul>
      <li>
        <p>
          点击左侧导航面板的数据质量-&gt;技术质量规则，打开技术质量规则页面，如图7-2-1所示。
        </p>
      </li>
      <li>
        <p>技术质量规则支持模糊搜索。</p>
      </li>
      <li>
        <p>选择查看“未发布”和“已发布”来查看不同状态的技术质量规则。</p>
      </li>
    </ul>

    <blockquote>
      <p>图7-2-1</p>
    </blockquote>
    <ul>
      <li>
        点击页面右上角的“添加规则”按钮创建技术规则如图7-2-2所示，其中规则名称，所属业务规则，规则类型，所属系统，最大错误数，发布状态和内容是必选项。
      </li>
    </ul>
    <p>规则类型包括：SQL，正则表达式，Groovy</p>
    <p>SQL：SQL语句</p>
    <p>正则表达式：</p>
    <p>Groovy：</p>

    <h2>检查任务</h2>
    <ul>
      <li>
        点击左侧导航面板的数据质量-&gt;检查任务，打开检查任务页面，如图7-3-1所示。
      </li>
    </ul>
    <blockquote>
      <p>图7-3-1</p>
    </blockquote>
    <ul>
      <li>
        <p>检查任务支持模糊搜索。</p>
      </li>
      <li>
        <p>操作列包含编辑，查看结果和开始任务的操作项。</p>
      </li>
      <li>
        <p>编辑与添加任务的功能相同。如图7-3-2所示。</p>
      </li>
      <li>
        <p>
          查看结果通过报表的形式，对任务执行结果进行直观的展示，如图7-3-4所示。
        </p>
      </li>
      <li>
        <p>开始任务：实时执行任务。</p>
      </li>
    </ul>

    <p>图7-3-4</p>
    <ul>
      <li>
        点击页面右上角的“添加任务”按钮添加检测任务，其中任务名称，调度任务，运行时刻，所属系统，数据源，负责人是必选项。如图7-3-2所示。
      </li>
    </ul>

    <p>图7-3-2</p>
    <ul>
      <li>
        <p>开启/关闭创建修复任务：执行任务后是否自动创建修复任务。</p>
      </li>
      <li>
        <p>开启/关闭发送邮件功能：是否将检测结果发送到制定收件人。</p>
      </li>
      <li>
        <p>添加收件人按钮：可以添加收件人地址。</p>
      </li>
      <li>
        <p>点击“删除”按钮可以删除已添加的收件人。</p>
      </li>
      <li>
        <p>点击“选择质量规则”按钮，选定质量规则，如图7-3-3所示。</p>
      </li>
    </ul>

    <h2>
      <span id="_&#x4FEE;&#x590D;&#x4EFB;&#x52A1;" class="anchor">
        <span id="_Toc520892921" class="anchor"></span>
      </span>
      修复任务
    </h2>
    <ul>
      <li>
        点击左侧导航面板的数据质量-&gt;修复任务，打开修复任务页面，如图7-4-1所示。
      </li>
    </ul>
    <p>质量修复任务面板，可添加问题任务，进行编辑查看和下载结果</p>

    <h2>模型差异比较任务</h2>
    <ul>
      <li>
        通过左侧导航面板：系统管理-&gt;系统任务，打开“系统任务”页面，查看数据源更新扫描任务，支持编辑操作。
      </li>
    </ul>

    <h2>数据源更新扫描任务</h2>
    <ul>
      <li>
        通过左侧导航面板：系统管理-&gt;系统任务，打开“系统任务”页面，查看数据源更新扫描任务，支持编辑操作。
      </li>
    </ul>

    <ul>
      <li>
        点击任务操作列的“编辑“按钮，弹出元数据扫描任务页面，提供查看和编辑功能。
      </li>
    </ul>

    <h1>普通用户</h1>
    <h2>操作流程图</h2>

    <h2>生产模型</h2>
    <ol>
      <li>
        <ul>
          <li>
            1.1 通过左侧导航面板：数据模型-&gt;生产模型，打开生产模型页面：
          </li>
        </ul>
      </li>
    </ol>

    <blockquote>
      <p>生产模型页面又分为二级目录：</p>
      <p>
        第一级是数据源树形目录，提供数据源列表，通过选择一个数据源，查看该数据源的下一级Table列表
      </p>
      <p>第二级：Table列表目录，提供数据查询，差异报告和变更历史三个视图，</p>
    </blockquote>
    <ul>
      <li>数据查询</li>
    </ul>
    <blockquote>
      <p>在数据查询视图选择一个具体的table，查看最右侧的表信息面板</p>
      <p>表信息面板包含表结构概要，表字段，关联及血缘信息</p>
    </blockquote>
    <ul>
      <li>差异报告</li>
    </ul>
    <p>
      通过为该数据源绑定开发模型，查看当前数据源版本与基线模型的差异报告，如图5-1-2所示。
    </p>

    <blockquote>
      <p>图5-1-2</p>
    </blockquote>
    <ul>
      <li>变更历史</li>
    </ul>
    <p>列出该数据源的变更历史，如图5-1-3所示。</p>

    <blockquote>
      <p>图5-1-3</p>
    </blockquote>
    <p>Tips：</p>
    <p>
      点击“数据源选择”右侧的下拉箭头打开下拉列表，包含数据集，数据项，标签选项，选择对应的选项切换右侧的显示对象。如图5-1-4所示。
    </p>

    <p>图5-1-4</p>
    <h2>开发模型</h2>
    <ul>
      <li>
        点击左侧导航面板的数据模型-&gt;开发模型，打开开发模型页面，如图5-2-1所示。
      </li>
    </ul>

    <p>图5-2-1</p>
    <p>
      中间的树形目录机构提供搜索功能可以快速定位到数据源的模型，右侧面板提供选中模型的详情，版本和报告。
    </p>
    <p>开发模型的版本信息，如图5-2-2所示。</p>
    <p>
      开发模型的报表，如图5-2-3所示。报表包含了该模型应用公共标准，自定义标准和未应用标准的统计数据
    </p>

    <p>图 5-2-2</p>

    <blockquote>
      <p>图 5-2-3</p>
    </blockquote>
    <h2>模型差异比较任务</h2>
    <ul>
      <li>
        通过左侧导航面板：系统管理-&gt;系统任务，打开“系统任务”页面，查看数据源更新扫描任务，支持编辑操作。
      </li>
    </ul>

    <h2>查看数据标准</h2>
    <p>
      详情请参见数据标准管理的
      <a @click="gotoPage('pageDoc5_1')">
        <em>查看数据标准</em>
      </a>
      的部分。
    </p>
    <h2>查看数据质量修复任务</h2>
    <p>
      详情请参见数据质量修复任务中的
      <a @click="gotoPage('pageDoc3_5')">
        <em>查看数据质量修复任务</em>
      </a>
      的部分。
    </p>
    <h1>数据标准管理员</h1>
    <h2>
      <span class="5-1"></span>
      标准管理
    </h2>
    <ol>
      <li>
        <ul>
          <li>点击左侧导航面板的数据标准-&gt;标准管理，打开标准管理页面：</li>
        </ul>
      </li>
    </ol>
    <blockquote></blockquote>
    <p>
      可以添加单个也可批量导入多个数据标准，批量导入时需下载模板，并填写好内容后进行导入。
    </p>

    <p>
      基础数据标准的树形结构上包括公共信息和客户信息两类，点击公共信息展开下一级数据标准目录及主体域，通过对不同数据标准进行分类，对主题域进行梳理。
    </p>
    <p>左侧的树形结构上方有“已发布”，“待审核”和“开发中”三种状态。</p>
    <ul>
      <li>
        <p>“开发中”：查看各业务部门提交的数据标准</p>
      </li>
      <li>
        <p>“待审核”：查看等待审核的数据标准</p>
      </li>
      <li>
        <p>“已发布”：查看通过审核已经发布的数据标准</p>
      </li>
    </ul>
    <p>
      通过父节点一级级展开到叶子节点，可以看到右侧的信息面板，包含基本信息和引用两个tab页面：
    </p>
    <p>基本信息包含标准信息，业务信息，管理信息和技术信息：</p>
    <p>标准信息包含下列信息：</p>
    <ul>
      <li>
        <p>标准编码</p>
      </li>
      <li>
        <p>中文名称</p>
      </li>
      <li>
        <p>英文名称</p>
      </li>
      <li>
        <p>引用代码：点击代码链接查看标准代码的列表，如图4-1-2 所示</p>
      </li>
      <li>
        <p>描述</p>
      </li>
    </ul>
    <p>业务信息包含下列信息：</p>
    <ul>
      <li>
        <p>业务定义</p>
      </li>
      <li>
        <p>业务规则</p>
      </li>
      <li>
        <p>业务计算规则</p>
      </li>
      <li>
        <p>质量控制规则</p>
      </li>
      <li>
        <p>列外情况</p>
      </li>
      <li>
        <p>同义词</p>
      </li>
      <li>
        <p>信息类型</p>
      </li>
      <li>
        <p>规则来源类型</p>
      </li>
      <li>
        <p>规则来源信息</p>
      </li>
    </ul>
    <p>管理信息包含下列信息：</p>
    <ul>
      <li>
        <p>数据来源</p>
      </li>
      <li>
        <p>系统控制点</p>
      </li>
      <li>
        <p>系统控制要求</p>
      </li>
    </ul>
    <p>技术信息是指该标准映射到数据库内的下列信息：</p>
    <ul>
      <li>
        <p>数据类型</p>
      </li>
      <li>
        <p>数据长度</p>
      </li>
      <li>
        <p>数据精度</p>
      </li>
      <li>
        <p>约束</p>
      </li>
      <li>
        <p>缺省值</p>
      </li>
    </ul>
    <p>引用tab页面中列出该数据标准被引用的记录，如图4-1-3所示</p>

    <blockquote>
      <p>图4-1-2</p>
    </blockquote>

    <blockquote>
      <p>图4-1-3</p>
    </blockquote>
    <h2>代码管理</h2>
    <ul>
      <li>通过点击左侧导航面板的数据标准-&gt;代码管理，打开代码管理页面。</li>
    </ul>
    <p>
      代码管理页面有一个树形结构，通过父节点展开到叶子节点打开右侧的代码管理面板。
    </p>
    <p>
      代码管理面板显示当前选中代码类型的代码编号和代码名称及该代码的编码规则：
    </p>
    <ul>
      <li>
        <p>编码取值</p>
      </li>
      <li>
        <p>编码名称</p>
      </li>
      <li>
        <p>编码含义</p>
      </li>
    </ul>

    <h1>数据血缘管理员</h1>
    <h2>地图概览</h2>
    <ol>
      <li>
        <ul>
          <li>点击左侧导航面板的数据地图-&gt;地图概览，打开数据地图页面：</li>
        </ul>
      </li>
    </ol>

    <h2>数据地图</h2>
    <ul>
      <li>点击左侧导航面板的数据地图-&gt;血缘关系，打开数据地图页面</li>
    </ul>
    <p>
      查看血缘管理面板，可导入血缘文件进行更新及分析查看。导入的文件需根据血缘模板进行填写。
    </p>
    <ul>
      <li>
        点击“导入血缘文件”后，下拉菜单选择文件类型，再选择文件，填写描述后提交
      </li>
    </ul>

    <p>
      选择要查看的文件，点击查看后打开新页面即为血缘关联图，字段可选择显示/隐藏，单击选择字段可查看关联表之间的联系。
    </p>

    <ul>
      <li>点击更新按钮，添加“.dtsx”文件为此条血缘数据更新。</li>
    </ul>

    <h1>数据质量管理员</h1>
    <h2>业务质量规则</h2>
    <ol>
      <li>
        <ul>
          <li>
            点击左侧导航面板的数据质量-&gt;业务质量规则，打开质量业务规则页面。
          </li>
        </ul>
        <!-- -->
        <ul>
          <li>
            <p>
              数据目录下拉框包括客户类，技术类和销售类，对业务质量规则进行过滤。
            </p>
          </li>
          <li>
            <p>业务质量规则支持模糊搜索。</p>
          </li>
          <li>
            <p>选择查看“未发布”和“已发布”来查看不同状态的业务质量规则。</p>
          </li>
        </ul>
      </li>
    </ol>

    <ul>
      <li>
        点击页面右上角的“添加规则”按钮创建业务规则。其中规则名称，规则类型和发布状态是必选项。
      </li>
    </ul>

    <h1>附录教程：</h1>
    <h2>Groovy使用实例</h2>
    <ol>
      <li>
        创建技术质量规则：“规则编写方式”选择“Groovy”-&gt;“内容”贴入Groovy代码-&gt;“调用函数”中填写对应的函数名称；填写内容如下图所示：
      </li>
    </ol>

    <ol>
      <li>添加检测任务的时候选择刚创建的数据质量规则</li>
    </ol>

    <ol>
      <li>执行该检测任务，查看结果</li>
    </ol>
    <p>Tips：</p>
    <p>Groovy常用代码：</p>
    <blockquote>
      <pre class="code language-groovy">
        import groovy.sql.GroovyRowResult
        import groovy.sql.Sql

        def executeQulityRuleXXX() {

            // datasource变量已经定义在上下文中,为质量检测任务中制定的数据源
            //def datasource = Sql.newInstance("jdbc:mysql://localhost:3306/sakila", "root", "root", "com.mysql.jdbc.Driver")

            // 需要返回List&lt;List&lt;Object&gt;&gt;作为检测出的问题数据
            def list = []

            // 第一行表示问题数据的元数据/表头
            def colMeta = ["id","ProductCode"]
            list.add(colMeta)

        //   若只需要执行一条sql语句可以:
        //    datasource.eachRow("select * from country") {
        //
        //        row -&gt;
        //            def value = []
        //            value.add(row.getAt(0))
        //            value.add(row.getAt(1))
        //            list.add(value)
        //    }

        //   若只需要执行一段事务可以:
        //    try {
        //        datasource.withTransaction {
        //            //正确语句
        //            datasource.execute("DELETE FROM COUNTRY WHERE COUNTRY = 'test'")
        //            datasource.execute("DELETE FROM COUNTRY WHERE COUNTRY = 'test2'")
        //            datasource.executeInsert("INSERT INTO country(country) VALUES('test')")
        //            datasource.executeInsert("INSERT INTO country(country) VALUES('test2')")
        //        }
        //    } catch (ignore) {
        //        println(ignore.message)
        //    }

            // 规则:个人险种表【LCProduct】中的产品编码【ProductCode】对应险种定义表【LMProduct】的 产品编码【ProductCode】。
            // 以下将输出不对应的ProductCode
            List&lt;GroovyRowResult&gt; rows1 = datasource.rows("SELECT DISTINCT ProductCode FROM LCProduct");
            List&lt;GroovyRowResult&gt; rows2 = datasource.rows("SELECT DISTINCT ProductCode FROM ProductCode");

            int cnt = 0;
            rows1.removeAll(rows2);
            rows1.each{
                row -&gt;
                    cnt++
                    def value = []
                    value.add(cnt)
                    value.add(row.getAt(0))
                    list.add(value)
            }

            return list
        }

      </pre>
    </blockquote>
    <h2>参数相关的操作</h2>
    <p>参数使用操作流程图：</p>
    <p>
      添加系统参数请参看
      <a @click="gotoPage('pageDoc2_5')">
        <em>系统参数设置</em>
      </a>
      部分
    </p>
    <p>参数在技术质量规则中的应用实例：</p>
    <ol>
      <li>
        用户在系统设置中新添加一个名为“CountNum”的系统参数，CountNum的具体信息如下：
      </li>
    </ol>
    <blockquote>
      <p>点击“测试”，就可以看到当前参数的返回值</p>
    </blockquote>
    <ol>
      <li>
        用户在创建技术质量规则的时候调用CountNum,调用方法是
        <span style="color: #ee7f49; font-weight: 500">
          ParseError: KaTeX parse error: Expected 'EOF', got '\[' at position 1:
          \̲[̲\#参数名\#
        </span>
        ]
      </li>
    </ol>
    <blockquote></blockquote>
    <ol>
      <li>
        用户使用该技术质量规则来执行质量检查任务，点击“开始任务”，任务执行完成后点击“查看结果”。
      </li>
    </ol>
    <blockquote></blockquote>
    <ol>
      <li>
        执行上一步的质量检查任务后，系统会自动生成下面的修复任务列表，查看具体的修复任务，点击“下载结果”，就可以看到运行这个检查任务后的结果。
      </li>
    </ol>
    <blockquote></blockquote>
  </div>
</template>

<script>
import helpDocPage from './helpDocPage.js'
export default helpDocPage
</script>
<style lang="scss" scoped>
@import './helpDocPage.scss';
</style>
