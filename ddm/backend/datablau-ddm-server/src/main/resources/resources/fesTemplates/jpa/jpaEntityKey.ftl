<#if params.packageName??>package ${params.packageName};</#if>

<#if options.lombok>
import lombok.Data;
</#if>
import javax.persistence.*;
<#if options.serializable>
import java.io.Serializable;
</#if>

<#if options.classComment>
/**
<#if classInfo.description??>
 * @description ${classInfo.description}
</#if>
<#if params.author??>
 * @author ${params.author}
</#if>
 * @date ${.now?string('yyyy-MM-dd')}
 */
</#if>
@Embeddable
<#if options.lombok>
@Data
</#if>
public class ${classInfo.className} <#if options.serializable>implements Serializable</#if>  {
<#if options.serializable>
    private static final long serialVersionUID=1L;

</#if>
<#list classInfo.fields as field>
    <#if options.columnAnnotation>@Column(name = "${field.columnName}")</#if>
    private ${field.fieldClassName} ${field.fieldName};

</#list>
<#if !options.lombok>
    <#list classInfo.fields as field>
        <@get typeName=field.fieldClassName fieldName=field.fieldName/>
        <@set typeName=field.fieldClassName fieldName=field.fieldName/>
    </#list>
</#if>
}

<#-- get -->
<#macro get typeName fieldName>
    <#if options.nameStyleName == "camel">
    public ${typeName} get${fieldName?cap_first}(){
        return ${fieldName};
    }
    <#else >
    public ${typeName} get_${fieldName}(){
        return ${fieldName};
    }
    </#if>
</#macro>
<#-- set -->
<#macro set typeName fieldName>
    <#if options.nameStyleName == "camel">
    public void set${fieldName?cap_first}(${typeName} ${fieldName}) {
        this.${fieldName} = ${fieldName};
    }
    <#else >
    public void set_${fieldName}(${typeName} ${fieldName}) {
        this.${fieldName} = ${fieldName};
    }
    </#if>
</#macro>