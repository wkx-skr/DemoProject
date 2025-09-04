#role.csv
内置权限，每个权限有唯一的编码，不可重复。

#role_api.csv
权限与api接口映射关系。

每个权限需要配置可以访问的后台api，不然调用api的话会报错没有权限。
api路径上有参数的需要是原始url，例如：/datablau_jobs/{jobId}/enable。