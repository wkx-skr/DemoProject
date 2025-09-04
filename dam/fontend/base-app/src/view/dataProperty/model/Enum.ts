// public static final long pMaxValue             = 80010048;  最大出现次数；
// public static final long pRange                = 80010049;  值域；
// public static final long pConstraintName = 80600118;  约束
enum Props {
  Range = '80010049', // 值域
  ConstraintName = '80600118', // 约束
  MaxValue = '80010048', // 最大出现次数

  // TypeId 对应的属性的值，通过这个值可以判断对象的类型
  ObjectType = '90002016', // 对象
  AggregationType = '90002024', //
  PropertyType = '90002032', // 属性
  AssociationType = '90002048', // 关联

  Name = '90000003',
  TypeId = '90000001',
  OwnerRef = '90000010',
  OwneeRef = '90000011',

  DefaultValue = '80100034', //默认值 System.String
  DataScale = '80100032', //长度 System.Int32
  DataPrecision = '80000107', //精度 System.Int32
  IsRequired = '90000026', //是否必填 System.Boolean
  IsArray = '90000020', //是否数组 System.Boolean
  IsReference = '90000014', //是否引用其他对象 System.Boolean
  Reference  = '80500060',  //引用对象 System.Int32
  Label = '80000021', //控件 System.String
  Catalog = '80010076', //分组名： Datablau.LDM.Catalog
  OrderNumber = '80010108' //显示顺序号：System.Int32
}

export { Props }
