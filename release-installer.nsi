Unicode true
Name "AMAN ERP"
OutFile "release-fullscreen\AMAN ERP Setup.exe"
InstallDir "$PROGRAMFILES64\AMAN ERP"
InstallDirRegKey HKLM "Software\AMAN ERP" "Install_Dir"
RequestExecutionLevel admin
SetCompressor zlib
CRCCheck off
Icon "assets\aman-erp.ico"

!include "MUI2.nsh"
!define MUI_ABORTWARNING
!define MUI_ICON "assets\aman-erp.ico"
!define MUI_UNICON "assets\aman-erp.ico"
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "Arabic"
!insertmacro MUI_LANGUAGE "English"

Section "AMAN ERP" SecMain
  SetOutPath "$INSTDIR"
  File "assets\aman-erp.ico"
  File /r /x "apple" /x "android" /x "ios" /x "macos" /x "linux" /x "*.h" /x "*.hpp" /x "*.cpp" /x "*.mm" "release-fullscreen\win-unpacked\*"
  WriteRegStr HKLM "Software\AMAN ERP" "Install_Dir" "$INSTDIR"
  WriteUninstaller "$INSTDIR\Uninstall AMAN ERP.exe"
  CreateDirectory "$SMPROGRAMS\AMAN ERP"
  CreateShortCut "$SMPROGRAMS\AMAN ERP\AMAN ERP.lnk" "$INSTDIR\AMAN ERP.exe" "" "$INSTDIR\aman-erp.ico" 0
  CreateShortCut "$DESKTOP\AMAN ERP.lnk" "$INSTDIR\AMAN ERP.exe" "" "$INSTDIR\aman-erp.ico" 0
SectionEnd

Section "Uninstall"
  Delete "$DESKTOP\AMAN ERP.lnk"
  Delete "$SMPROGRAMS\AMAN ERP\AMAN ERP.lnk"
  RMDir "$SMPROGRAMS\AMAN ERP"
  DeleteRegKey HKLM "Software\AMAN ERP"
  RMDir /r "$INSTDIR"
SectionEnd
