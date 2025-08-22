@echo off
echo Building SkinCare WAR file for Tomcat deployment...
echo.

REM Create necessary directories
if not exist "build" mkdir build
if not exist "build\WEB-INF" mkdir build\WEB-INF
if not exist "build\WEB-INF\classes" mkdir build\WEB-INF\classes
if not exist "build\WEB-INF\lib" mkdir build\WEB-INF\lib

REM Copy web.xml and spring-servlet.xml
echo Copying configuration files...
copy "src\main\webapp\WEB-INF\web.xml" "build\WEB-INF\"
copy "src\main\webapp\WEB-INF\spring-servlet.xml" "build\WEB-INF\"

REM Copy static resources (HTML, CSS, JS, images)
echo Copying static resources...
copy "*.html" "build\" 2>nul
copy "*.css" "build\" 2>nul
copy "*.js" "build\" 2>nul
if exist "Pics" xcopy "Pics" "build\Pics\" /E /I /Y
if exist "dist" xcopy "dist" "build\dist\" /E /I /Y

REM Download MySQL Connector if not exists
if not exist "mysql-connector-j-8.2.0.jar" (
    echo Downloading MySQL Connector...
    powershell -Command "Invoke-WebRequest -Uri 'https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/8.2.0/mysql-connector-j-8.2.0.jar' -OutFile 'mysql-connector-j-8.2.0.jar'"
)

REM Copy MySQL connector to lib
if exist "mysql-connector-j-8.2.0.jar" (
    copy "mysql-connector-j-8.2.0.jar" "build\WEB-INF\lib\"
    echo MySQL connector copied to lib directory
) else (
    echo WARNING: MySQL connector not found. Please download mysql-connector-j-8.2.0.jar manually
)

REM Download Jakarta Servlet API if not exists
if not exist "jakarta.servlet-api-6.0.0.jar" (
    echo Downloading Jakarta Servlet API...
    powershell -Command "Invoke-WebRequest -Uri 'https://repo1.maven.org/maven2/jakarta/servlet/jakarta.servlet-api/6.0.0/jakarta.servlet-api-6.0.0.jar' -OutFile 'jakarta.servlet-api-6.0.0.jar'"
)

REM Compile Java sources
echo Compiling Java sources...
if exist "jakarta.servlet-api-6.0.0.jar" (
    javac -cp "jakarta.servlet-api-6.0.0.jar;mysql-connector-j-8.2.0.jar" -d "build\WEB-INF\classes" src\main\java\com\skincare\*.java src\main\java\com\skincare\dao\*.java src\main\java\com\skincare\model\*.java src\main\java\com\skincare\servlet\*.java src\main\java\com\skincare\config\*.java src\main\java\com\skincare\controller\*.java
) else (
    echo ERROR: Jakarta Servlet API not found. Cannot compile Java sources.
    pause
    exit /b 1
)

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Compilation failed!
    pause
    exit /b 1
)

echo Java compilation successful!

REM Create WAR file
echo Creating WAR file...
cd build
jar -cvf ..\skincare.war *
cd ..

if exist "skincare.war" (
    echo.
    echo ========================================
    echo WAR file created successfully!
    echo File: skincare.war
    echo Size: 
    dir skincare.war | findstr skincare.war
    echo.
    echo To deploy:
    echo 1. Copy skincare.war to your Tomcat webapps directory
    echo 2. Start Tomcat
    echo 3. Access at: http://localhost:8080/skincare/
    echo ========================================
) else (
    echo ERROR: Failed to create WAR file
    pause
    exit /b 1
)

echo.
echo Build complete!
pause