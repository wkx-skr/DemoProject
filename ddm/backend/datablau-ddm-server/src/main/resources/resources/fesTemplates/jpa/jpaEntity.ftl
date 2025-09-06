<#if options.package && params.packageName?? && params.packageName?trim?length gt 0>
package ${params.packageName};
</#if>
<#-- Import packages -->
<#if options.lombok>
    import lombok.Data;
</#if>
import javax.persistence.*;
<#if options.serializable>
import java.io.Serializable;
</#if>
<#list classInfo.importPackages as packageName>
import ${packageName};
</#list>

<#-- Annotation -->
<#if options.classComment>
/**
<#if classInfo.description??>
* @description ${classInfo.description}
</#if>
<#if classInfo.author?? && options.author>
* @author ${classInfo.author}
</#if>
* @date ${.now?string('yyyy-MM-dd')}
*/
</#if>
<#-- Class annotation -->
@Entity
<#if options.lombok>
@Data
</#if>
<#-- Table annotation -->
<#if options.tableAnnotation || options.uniqueLocationTable>
    <@Table/>
</#if>
<#-- Class definition -->
public class ${classInfo.className} <#if options.serializable>implements Serializable</#if> {

<#if options.serializable>
    private static final long serialVersionUID = 1L;

</#if>
<#-- Traversal field -->
<#list classInfo.fields as field>
<#-- Primary Key -->
    <#if field.primary && !field.foreignKey>
        <#if !classInfo.combinedPrimaryKey>
    @Id
            <@column field/>
    @GeneratedValue
        <#-- Composite keys -->
        <#else >
    @EmbeddedId
        </#if>
        <@fieldItem field/>
    <#-- Non-primary key -->
    <#else >
    <#-- General field -->
        <#if !field.foreignKey && !field.refField>
            <#if options.columnAnnotation>
                <@column field/>
            </#if>
            <@fieldItem field/>
        <#-- Relation field -->
        <#elseif options.relation>
        <#-- field.joinType: ${field.joinType} -->
            <#if field.joinType=="OneToOne" && field.refField && options.relationBidirectional >
                <@OneToOne field/>
            <#elseif field.joinType=="OneToMany" && field.refField && options.relationBidirectional>
                <@OneToMany field/>
            <#elseif field.joinType=="ManyToOne">
                <@ManyToOne field/>
            <#elseif field.joinType=="ManyToMany">
                <@ManyToMany field/>
            </#if>
        </#if>
    </#if>
</#list>
<#-- Custom method -->
<#if classInfo.functions??>
    <@methods/>
</#if>
<#-- get set method -->
<#if !options.lombok>
    <#list classInfo.fields as field>
        <@get field/>
        <@set field/>
    </#list>
</#if>
}

<#-- Component template definition -->

<#-- Table annotation -->
<#macro Table>
<#-- Ordinary non indexed table annotation -->
    <#if classInfo.allIndexes?size==0 || !options.generateIndex>
@Table(name = "${classInfo.tableName}")
    <#-- Annotation with index -->
    <#else>
@Table(name = "${classInfo.tableName}"<#rt>
    <#-- Define unique index -->
        <#if (classInfo.uniqueIndexes?size gt 0 && options.uniqueLocationTable) || hasConbinedUniqueIndex()>
            <#lt>,
            <#if classInfo.uniqueIndexes?size==1>
            <#-- size1 -->
                <#local index = classInfo.uniqueIndexes?first>
                <#if index.columnList?size gt 1 || options.uniqueLocationTable>
        uniqueConstraints = <@tableUniqueConstraint index/><#if classInfo.indexes?size gt 1>,</#if>
                </#if>
            <#elseif classInfo.uniqueIndexes?size gt 1>
            <#-- size gt 1 -->
                <#if classInfo.combinedUniqueIndexes?size gt 0 || options.uniqueLocationTable>
        uniqueConstraints = {
                    <#list classInfo.uniqueIndexes as index>
                        <#if index.columnList?size == 1 && !options.uniqueLocationTable>
                            <#continue >
                        </#if>
                    <@tableUniqueConstraint index/><#sep >,</#sep>
                    </#list>
                </#if>
        }<#rt>
            </#if>
        </#if>
    <#-- Define index -->
        <#if classInfo.indexes?size gt 0>
            <#lt>,
            <#if  classInfo.indexes?size==1>
                <#local index = classInfo.indexes?first>
        indexes = <@tableIndex index/>
            <#elseif classInfo.indexes?size gt 1>
        indexes = {
                <#list classInfo.indexes as index>
                    <@tableIndex index/><#sep >,</#sep>
                </#list>
        }
            </#if>
        </#if>
)
    </#if>
</#macro>

<#-- Is there a federated unique index -->
<#function hasConbinedUniqueIndex>
    <#list classInfo.uniqueIndexes as uniqueIndexe>
        <#if uniqueIndexe.columnList?size gt 1>
            <#return true>
        </#if>
    </#list>
    <#return false>
</#function>

<#-- Unique index in table annotation -->
<#macro tableUniqueConstraint index>
    <#if index.columnList?size==1>
@UniqueConstraint(name = "${index.name}", columnNames = "${index.columnList?first}")<#rt>
    <#elseif index.columnList?size gt 1>
@UniqueConstraint(name = "${index.name}", columnNames = {"${index.columnList?join('", "')}"})<#rt>
    </#if>
</#macro>

<#-- General index in table annotation -->
<#macro tableIndex index>
    @Index(name = "${index.name}", columnList = "${index.columnList?join(' ,')}")<#rt>
</#macro>

<#-- Column annotation -->
<#macro column field>
    <#if options.fieldComment>
        <#if field.getComment()??>
    @Comment("${field.getComment()}")
        </#if>
    </#if>
    @Column(name = "${field.columnName}"<#rt>
    <#if !field.nullable>, nullable = false</#if><#t>
    <#if options.uniqueLocationColumn && field.uniqueKey && !field.combinedIndex && options.generateIndex>
        <#t>, unique = true
    </#if><#t>
    <#if field.length??>, length = ${field.length}</#if> <#t>
    <#lt>)
</#macro>

<#-- field -->
<#macro fieldItem field>
    private ${getFieldType(field)} ${field.fieldName};

</#macro>

<#function getFieldType field>
    <#if !field.joinType?? || field.joinType=="OneToOne" || field.joinType=="ManyToOne">
        <#return field.fieldClassName>
    <#else >
        <#local container = "">
        <#if options.containerTypeList>
            <#local container = "List">
        <#elseif options.containerTypeSet>
            <#local container = "Set">
        <#else>
            <#local container = params.containerType>
        </#if>
        <#return "${container}<${field.fieldClassName}>">
    </#if>
</#function>
<#-- OneToOne -->
<#macro OneToOne field>
    <#if !field.mappedBy??>
    @OneToOne
        <@join field true/>
    <#elseif field.mappedBy??>
    @OneToOne(mappedBy = "${field.mappedBy}")
    <#elseif field.mapsId??>
    @OneToOne
    @MapsId("${field.mapsId}")
        <@joinColumn field=field></@joinColumn>
    </#if>
    <@fieldItem field/>
</#macro>

<#-- OneToMany -->
<#macro OneToMany field>
    <#if field.mappedBy??>
    @OneToMany(mappedBy = "${field.mappedBy}")
    </#if>
    <@fieldItem field/>
</#macro>

<#-- ManyToOne -->
<#macro ManyToOne field>
    <#if !field.mapsId??>
    @ManyToOne
    <#-- Non federated foreign key -->
        <@join field/>
        <@fieldItem field/>
    <#else>
    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("${field.mapsId}")
        <@joinColumn field=field></@joinColumn>
        <@fieldItem field/>
    </#if>
</#macro>

<#-- ManyToMany -->
<#macro ManyToMany field>
    <#local m2mJoinInfo = field.manyJoinInfo/>
    <#if !field.mappedBy??>
    @ManyToMany
    @JoinTable(name="${m2mJoinInfo.joinTable}",
        <#if m2mJoinInfo.joinColumns?size == 1>
            <#local joinColumn = m2mJoinInfo.joinColumns?first/>
            joinColumns=
            @JoinColumn(name = "${joinColumn.name}", referencedColumnName = "${joinColumn.refName}"),
        <#elseif m2mJoinInfo.joinColumns?size gt 1>
            joinColumns= {
            <#list m2mJoinInfo.joinColumns as joinColumn>
                @JoinColumn(name = "${joinColumn.name}", referencedColumnName = "${joinColumn.refName}")<#sep>,
            </#list>
            },
        </#if>
        <#if m2mJoinInfo.inverseJoinColumns?size == 1>
            <#local joinColumn = m2mJoinInfo.inverseJoinColumns?first/>
            inverseJoinColumns=
            @JoinColumn(name = "${joinColumn.name}", referencedColumnName = "${joinColumn.refName}")
        <#elseif m2mJoinInfo.inverseJoinColumns?size gt 1>
            inverseJoinColumns= {
            <#list m2mJoinInfo.inverseJoinColumns as joinColumn>
                @JoinColumn(name = "${joinColumn.name}", referencedColumnName = "${joinColumn.refName}")<#sep>,
            </#list>
            }
        </#if>
        )
        <@fieldItem field/>
    <#else>
        @ManyToMany(mappedBy="${field.mappedBy}")
        <@fieldItem field/>
    </#if>
</#macro>

<#-- Join -->
<#macro join field ref=false>
    <#if !field.combinedForeignKey>
        <@joinColumn field ref/>
    <#else >
        <@joinColumns field/>
    </#if>
</#macro>

<#-- @JoinColumn annotation -->
<#macro joinColumn field ref=false>
    <#if field.joinInfo?exists>
        <#assign joinInfo = field.joinInfo/>
        @JoinColumn(name = "${joinInfo.joinColumn}"<#if ref>, referencedColumnName = "${joinInfo.refColumn}"</#if>)
    </#if>
</#macro>
<#-- @joinColumns annotation -->
<#macro joinColumns field>
    @JoinColumns({
    <#list field.combinedJoinColumn as joinColumn>
        @JoinColumn(name="${joinColumn.joinColumn}", referencedColumnName="${joinColumn.refColumn}"),
    </#list>
    })
</#macro>

<#-- All custom methods -->
<#macro methods>
    <#list classInfo.functions as m>
        <@method m/>

    </#list>
</#macro>
<#-- Custom method -->
<#macro method m>
    <#local primaryType = ["byte","short","int","long","float","double","boolean","char"]/>
    <#if m.accessModifier??>public </#if>${ m.returnType!"void" } ${ m.name }(<@methodParams m/>) {
    <#if m.returnType?? && m.returnType != "void">
    <#-- Return value of basic type -->
        <#if primaryType?seq_contains(m.returnType)>
            <#if m.returnType=="boolean">
        return false;
            <#else>
        return 0;
            </#if>
        <#else>
        return null;
        </#if>
    </#if>
    }
</#macro>
<#-- Parameters of custom methods -->
<#macro methodParams m>
    <#list m.params as param>
${param.dataType!""} ${param.name}<#sep>, </#sep><#rt>
    </#list>
</#macro>

<#-- get method template -->
<#macro get field>
    <#if field.foreignKey || field.refField>
        <#local mto = options.relation && field.joinType=="ManyToOne">
        <#local mtm = options.relation && field.joinType=="ManyToMany" &&
        ((options.relationBidirectional && field.mappedBy??) || !field.mappedBy??)>
        <#local oto = options.relation && field.joinType=="OneToOne" && field.refField && options.relationBidirectional>
        <#local otm = options.relation && field.joinType=="OneToMany" && field.refField && options.relationBidirectional>
    </#if>
    <#if ((field.foreignKey || field.refField) && ( mto || mtm || oto || otm)) || (!field.foreignKey && !field.refField)>
        <#if options.nameStyleName == "camel">
    public ${getFieldType(field)} get${field.fieldName?cap_first}(){
        return ${field.fieldName};
    }
        <#else >
    public ${getFieldType(field)} get_${field.fieldName}(){
        return ${field.fieldName};
    }
        </#if>

    </#if>
</#macro>

<#-- set method template -->
<#macro set field>
    <#if field.foreignKey || field.refField>
        <#local mto = options.relation && field.joinType=="ManyToOne">
        <#local mtm = options.relation && field.joinType=="ManyToMany" &&
        ((options.relationBidirectional && field.mappedBy??) || !field.mappedBy??)>
        <#local oto = options.relation && field.joinType=="OneToOne" && field.refField && options.relationBidirectional>
        <#local otm = options.relation && field.joinType=="OneToMany" && field.refField && options.relationBidirectional>
    </#if>
    <#if ((field.foreignKey || field.refField) && ( mto || mtm || oto || otm)) || (!field.foreignKey && !field.refField)>
        <#local fieldName=field.fieldName>
        <#if options.nameStyleName == "camel">
    public void set${fieldName?cap_first}(${getFieldType(field)} ${fieldName}) {
        this.${fieldName} = ${fieldName};
    }
        <#else >
    public void set_${fieldName}(${getFieldType(field)} ${fieldName}) {
        this.${fieldName} = ${fieldName};
    }
        </#if>

    </#if>
</#macro>