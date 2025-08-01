; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

[Setup]
AppName=KPA
AppVersion=1.6.1
DefaultDirName={autopf}\KPA
DefaultGroupName=KPA
; 输出安装包名称
OutputBaseFilename=KPA_Setup_v1.6.1
; 压缩方式
Compression=lzma
; 压缩级别
SolidCompression=yes
; 安装程序窗口标题
WindowVisible=True
LicenseFile=LICENSE

[Files]
Source: "dist\*.js"; DestDir: "{app}\dist"; Flags: ignoreversion
Source: "html\*"; DestDir: "{app}\html"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "server\index.exe"; DestDir: "{app}\server"; Flags: ignoreversion
Source: "sound\*"; DestDir: "{app}\sound"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "img\*"; DestDir: "{app}\img"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "css\*"; DestDir: "{app}\css"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "server\default.jsonc"; DestName: "config.jsonc"; DestDir: "{app}\server"; Flags: onlyifdoesntexist
; 可选：许可证文件
Source: "LICENSE"; DestDir: "{app}"
Source: "start.bat"; DestDir: "{app}"

[Tasks]
Name: "runapp"; Description: "启动 KPA/Launch KPA"; Flags: unchecked

[Run]
Filename: "{app}\start.bat"; Description: "启动 KPA"; Tasks: runapp