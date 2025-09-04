export default {
  'Table': {
    disc: '表相关选项',
    opts: {
      'DROP TABLE': '携带删除表语句',
      'CREATE TABLE': '携带创建表语句部分，默认必须勾选',
      'With CHECK CONSTRAIT': '带检查选项约束',
      'With Suffix Configuration': '带后缀配置',
      'With INSERT SQL Transformation': '生成insert语句',
      'With Comment': {
        disc: '携带表的注释语句',
        opts: {
          'With Ch Name': '注释语句需包含表的中文名称',
          'With En Name': '注释语句需包含表的英文名称',
          'With Definition': '注释语句需包含表的定义/描述信息'
        }
      },
      'Partition': {
        disc: '表分区信息',
        opts: {
          'With PARTITION': '携带表的分区信息描述'
        }
      },
      // 'Physical Storage': {
      //   disc: '表的存储相关属性、如表空间等'
      // },
      'PhysicalStorage': {
        disc: '表的存储相关属性、如表空间等'
      }
    }
  },
  'Column': {
    disc: '字段相关选项',
    opts: {
      'With CHECK CONSTRAINT': '附带字段的约束检查项 如:是否允许为空',
      'Default Value': '携带字段默认值',
      'Auto Increment': '携带字段是否为自增字段的描述',
      'With Comment': {
        disc: '携带字段的注释语句',
        opts: {
          'With Ch Name': '注释语句需包含字段的中文名称',
          'With En Name': '注释语句需包含字段的英文名称',
          'With Definition': '注释语句需包含字段的定义/描述信息',
          'With Data Standard Code': '注释语句需包含字段的对应数据标准编码'
        }
      }
    }
  },
  'Key/Index': {
    disc: '主外键以及索引选项',
    opts: {
      'Primary Key': {
        disc: '主键选项',
        opts: {
          'CREATE Format': '尽可能地在create table语句中创建主键等约束。若不支持则在alter语句中创建',
          'ALTER Format': '在alter语句中创建主键等约束'
        }
      },
      'Foreign Key': {
        disc: '外键选项',
        opts: {
          'CREATE Format': '尽可能地在create table语句中创建外键等约束。若不支持则在alter语句中创建',
          'ALTER Format': '在alter语句中创建外键等约束'
        }
      },
      'Unique Key': {
        disc: '唯一键索引',
        opts: {
          'CREATE Format': '尽可能地在create table语句中创建唯一键等约束。若不支持则在alter语句中创建',
          'ALTER Format': '在alter语句中创建唯一键等约束'
        }
      },
      'Non-Unique Key': '为非唯一键创建索引(create index)'
    }
  },
  'View': {
    disc: '视图相关选项',
    opts: {
      'DROP VIEW': "携带删除视图语句，如：DROP VIEW IF EXIST 'XXXX'",
      'CREATE VIEW': '携带创建视图语句部分'
    }
  },
  'Database Object': {
    disc: '数据库对象信息'
  },
  'Option': {
    disc: '其他选项信息',
    opts: {
      'With Delimiter': '对象名(表名分段名等)将使用定界符何能是双引号/中括号等)标记。 一般用于区分大小写，使用特殊字符命名等',
      'With Owner': '语句中有表/视图时，将同时指出其所居对象(schema/数据库)',
      'With System Call ReOrg': 'System call reorg 语句,DB2重新组织元数据时使用',
      'With Constraint Name': '产生约束(主健约束/唯一键约束等)时指出其约束名',
      'With LiquiBase ChangeSet': '携带 Liquibase数据库版本管理工具变更集',
      'With Idempotency Script': '携带幂等脚本',
      'Remove Tab': '用空格代替生产语句中的制表符',
      'With Datatype Check': '检查数据类型并去除无效的长度和精度信息'

    }
  }
}
