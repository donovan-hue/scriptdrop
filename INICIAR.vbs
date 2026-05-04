Set objShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Cambiar a la carpeta del proyecto
strPath = fso.GetParentFolderName(WScript.ScriptFullName)
objShell.CurrentDirectory = strPath

' Mostrar mensaje de inicio
objShell.Popup "SUPER-APP v1.0.0" & vbCrLf & vbCrLf & "Iniciando proyecto..." & vbCrLf & vbCrLf & "Se abrirán 2 ventanas.", 0, "Super-App", 64

' Ejecutar el archivo BAT en minimizado
objShell.Run "cmd /c INICIAR.bat", 1, False

' Abrir navegador en 5 segundos
WScript.Sleep 5000
objShell.Run "start http://localhost:3000", 0, False
