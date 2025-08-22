# PowerShell script to build SkinCare WAR file
Write-Host "Building SkinCare WAR file for Tomcat deployment..." -ForegroundColor Green
Write-Host ""

# Create necessary directories
$buildDir = "build"
$webInfDir = "$buildDir\WEB-INF"
$classesDir = "$webInfDir\classes"
$libDir = "$webInfDir\lib"

Write-Host "Creating build directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $buildDir | Out-Null
New-Item -ItemType Directory -Force -Path $webInfDir | Out-Null
New-Item -ItemType Directory -Force -Path $classesDir | Out-Null
New-Item -ItemType Directory -Force -Path $libDir | Out-Null

# Copy web.xml and spring-servlet.xml
Write-Host "Copying configuration files..." -ForegroundColor Yellow
Copy-Item "src\main\webapp\WEB-INF\web.xml" "$webInfDir\" -Force
Copy-Item "src\main\webapp\WEB-INF\spring-servlet.xml" "$webInfDir\" -Force

# Copy static resources
Write-Host "Copying static resources..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Filter "*.html" | Copy-Item -Destination $buildDir -Force
Get-ChildItem -Path "." -Filter "*.css" | Copy-Item -Destination $buildDir -Force
Get-ChildItem -Path "." -Filter "*.js" | Copy-Item -Destination $buildDir -Force

if (Test-Path "Pics") {
    Copy-Item "Pics" "$buildDir\Pics" -Recurse -Force
}

if (Test-Path "dist") {
    Copy-Item "dist" "$buildDir\dist" -Recurse -Force
}

# Download MySQL Connector if not exists
$mysqlJar = "mysql-connector-j-8.2.0.jar"
if (-not (Test-Path $mysqlJar)) {
    Write-Host "Downloading MySQL Connector..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri "https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/8.2.0/mysql-connector-j-8.2.0.jar" -OutFile $mysqlJar
        Write-Host "MySQL Connector downloaded successfully" -ForegroundColor Green
    } catch {
        Write-Host "Failed to download MySQL Connector: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Copy MySQL connector to lib
if (Test-Path $mysqlJar) {
    Copy-Item $mysqlJar "$libDir\" -Force
    Write-Host "MySQL connector copied to lib directory" -ForegroundColor Green
} else {
    Write-Host "WARNING: MySQL connector not found. Please download mysql-connector-j-8.2.0.jar manually" -ForegroundColor Red
}

# Download Jakarta Servlet API if not exists
$servletJar = "jakarta.servlet-api-6.0.0.jar"
if (-not (Test-Path $servletJar)) {
    Write-Host "Downloading Jakarta Servlet API..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri "https://repo1.maven.org/maven2/jakarta/servlet/jakarta.servlet-api/6.0.0/jakarta.servlet-api-6.0.0.jar" -OutFile $servletJar
        Write-Host "Jakarta Servlet API downloaded successfully" -ForegroundColor Green
    } catch {
        Write-Host "Failed to download Jakarta Servlet API: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Compile Java sources
Write-Host "Compiling Java sources..." -ForegroundColor Yellow
if (Test-Path $servletJar) {
    $classpath = "$servletJar;$mysqlJar"
    $javaFiles = @(
        "src\main\java\com\skincare\*.java",
        "src\main\java\com\skincare\dao\*.java",
        "src\main\java\com\skincare\model\*.java",
        "src\main\java\com\skincare\servlet\*.java",
        "src\main\java\com\skincare\config\*.java",
        "src\main\java\com\skincare\controller\*.java"
    )
    
    $allJavaFiles = @()
    foreach ($pattern in $javaFiles) {
        $files = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue
        $allJavaFiles += $files.FullName
    }
    
    if ($allJavaFiles.Count -gt 0) {
        $javaFilesString = $allJavaFiles -join " "
        $compileCommand = "javac -cp `"$classpath`" -d `"$classesDir`" $javaFilesString"
        
        Write-Host "Executing: $compileCommand" -ForegroundColor Cyan
        $result = cmd /c $compileCommand 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Java compilation successful!" -ForegroundColor Green
        } else {
            Write-Host "ERROR: Compilation failed!" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "No Java files found to compile" -ForegroundColor Yellow
    }
} else {
    Write-Host "ERROR: Jakarta Servlet API not found. Cannot compile Java sources." -ForegroundColor Red
    exit 1
}

# Create WAR file
Write-Host "Creating WAR file..." -ForegroundColor Yellow
Set-Location $buildDir
$warResult = jar -cvf "..\skincare.war" *
Set-Location ..

if (Test-Path "skincare.war") {
    $warSize = (Get-Item "skincare.war").Length
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "WAR file created successfully!" -ForegroundColor Green
    Write-Host "File: skincare.war" -ForegroundColor Green
    Write-Host "Size: $([math]::Round($warSize/1KB, 2)) KB" -ForegroundColor Green
    Write-Host ""
    Write-Host "To deploy:" -ForegroundColor Yellow
    Write-Host "1. Copy skincare.war to your Tomcat webapps directory" -ForegroundColor Yellow
    Write-Host "2. Start Tomcat" -ForegroundColor Yellow
    Write-Host "3. Access at: http://localhost:8080/skincare/" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host "ERROR: Failed to create WAR file" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Build complete!" -ForegroundColor Green