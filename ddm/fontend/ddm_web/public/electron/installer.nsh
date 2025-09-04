!macro preInit
    SetRegView 64
    WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Program Files\DDMOnline"
    WriteRegExpandStr HkCU "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Program Files\DDMOnline"
    SetRegView 32
    WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Program Files\DDMOnline"
    WriteRegExpandStr HkCU "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Program Files\DDMOnline"
!macroend
