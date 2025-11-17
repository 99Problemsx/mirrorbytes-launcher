; NSIS Installer Customization for Mirrorbytes Studio
; This file is included in the NSIS installer script

!macro customHeader
  !system "echo '' > ${BUILD_RESOURCES_DIR}/customHeader"
!macroend

!macro customInstall
  ; Create app data directory
  CreateDirectory "$APPDATA\Mirrorbytes Studio"
  
  ; Create game directories
  CreateDirectory "$LOCALAPPDATA\Pokemon Illusion"
  CreateDirectory "$LOCALAPPDATA\Zorua The Divine Deception"
!macroend

!macro customUnInstall
  ; Ask user if they want to keep save files
  MessageBox MB_YESNO "Do you want to keep your game save files and settings?" IDYES KeepData
    RMDir /r "$APPDATA\Mirrorbytes Studio"
    RMDir /r "$LOCALAPPDATA\Pokemon Illusion"
    RMDir /r "$LOCALAPPDATA\Zorua The Divine Deception"
  KeepData:
!macroend

!macro customInit
  ; Check if already installed
  ReadRegStr $R0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "UninstallString"
  StrCmp $R0 "" done
  
  MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION \
    "Mirrorbytes Studio is already installed.$\n$\nClick OK to remove the previous version or Cancel to cancel this upgrade." \
    IDOK uninst
  Abort
  
  uninst:
    ClearErrors
    ExecWait '$R0 _?=$INSTDIR'
    IfErrors no_remove_uninstaller done
    
    no_remove_uninstaller:
  
  done:
!macroend
