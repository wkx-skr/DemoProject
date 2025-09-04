package com.datablau.project.util;

public final class UserRights {
    public static final String OR = " or ";
    public static final String AND = " and ";
    //role
    public static final String HAS_SUPERUSER_ROLE = " hasRole('ROLE_SUPERUSER')" ;

    public static final String HAS_BASE_USER_MANAGE_ROLE = HAS_SUPERUSER_ROLE + OR + " hasRole('BASE_USER_MANAGE') ";

    public static final String HAS_BASE_TASK_SCHEDULER_MANAGE_ROLE = HAS_SUPERUSER_ROLE + OR + " hasRole('BASE_TASK_SCHEDULER_MANAGE') ";

    public static final String HAS_BASE_PLUGIN_MANAGE_ROLE = HAS_SUPERUSER_ROLE + OR + " hasRole('BASE_PLUGIN_MANAGE') ";

    public static final String HAS_BASE_USER_GROUP_MANAGE_ROLE = HAS_SUPERUSER_ROLE + OR + " hasRole('BASE_USER_GROUP_MANAGE') ";

    public static final String HAS_BASE_TIME_TEMPLATES_MANAGE_ROLE = HAS_SUPERUSER_ROLE + OR + " hasRole('BASE_TIME_TEMPLATES_MANAGE') ";

    public static final String HAS_BASE_SYSTEM_CALL_MANAGE_ROLE = HAS_SUPERUSER_ROLE + OR + " hasRole('BASE_SYSTEM_CALL_MANAGE') ";

    public static final String HAS_BASE_TAG_VIEW_ROLE = HAS_SUPERUSER_ROLE + OR + " hasRole('BASE_TAG_VIEW') ";

    public static final String HAS_BASE_TASK_MONITOR_MANAGE_ROLE = HAS_SUPERUSER_ROLE + OR + " hasRole('BASE_TASK_MONITOR_MANAGE') ";

    public static final String HAS_BASE_TAG_EDIT_ROLE = HAS_SUPERUSER_ROLE + OR + " hasRole('BASE_TAG_EDIT') ";

    public static final String HAS_BASE_DATASOURCE_MANAGE_ROLE = HAS_SUPERUSER_ROLE + OR + " hasRole('BASE_DATASOURCE_MANAGE') ";

    public static final String HAS_BASE_TAG_DELETE_ROLE = HAS_SUPERUSER_ROLE + OR + " hasRole('BASE_TAG_DELETE') ";

    public static final String HAS_BASE_EMAIL_MANAGE_ROLE = HAS_SUPERUSER_ROLE + OR + " hasRole('BASE_EMAIL_MANAGE') ";

    public static final String HAS_BASE_TASK_FILE_MANAGE_ROLE = HAS_SUPERUSER_ROLE + OR + " hasRole('BASE_TASK_FILE_MANAGE') ";

    public static final String HAS_BASE_ROLE_MANAGE_ROLE = HAS_SUPERUSER_ROLE + OR + " hasRole('BASE_ROLE_MANAGE') ";

    public static final String HAS_BASE_TAG_ADD_ROLE = HAS_SUPERUSER_ROLE + OR + " hasRole('BASE_TAG_ADD') ";

    public static final String HAS_BASE_SYSTEM_MANAGE_ROLE = HAS_SUPERUSER_ROLE + OR + " hasRole('BASE_SYSTEM_MANAGE') ";

    public static final String HAS_BASE_ORGANIZATION_MANAGE_ROLE = HAS_SUPERUSER_ROLE + OR + " hasRole('BASE_ORGANIZATION_MANAGE') ";

    public static final String HAS_BASE_WORKFLOW_CENTER_MANAGE_ROLE = HAS_SUPERUSER_ROLE + OR + " hasRole('BASE_WORKFLOW_CENTER_MANAGE') ";

    public static final String HAS_BASE_WORKFLOW_MONITOR_MANAGE_ROLE = HAS_SUPERUSER_ROLE + OR + " hasRole('BASE_WORKFLOW_MONITOR_MANAGE') ";

    public static final String HAS_BASE_DRIVER_MANAGE_ROLE = HAS_SUPERUSER_ROLE + OR + " hasRole('BASE_DRIVER_MANAGE') ";

    public static final String HAS_BASE_LICENSE_MANAGE_ROLE = HAS_SUPERUSER_ROLE + OR + " hasRole('BASE_LICENSE_MANAGE') ";

    public static final String HAS_BASE_CONTROL_PANEL_MANAGE_ROLE = HAS_SUPERUSER_ROLE + OR + " hasRole('BASE_CONTROL_PANEL_MANAGE') ";







}
