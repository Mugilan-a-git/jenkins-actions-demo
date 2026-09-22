pipeline {
    agent any

    environment {
        APP_NAME = 'Jenkins Demo App'
        DEPLOY_DIR = 'C:\\DataSwitch\\Jenkins\\deployment'
    }

    stages {

        stage('Build Information') {
            steps {
                bat 'call npm pkg get version'

                echo "Application: ${APP_NAME}"
                echo "Jenkins Build Number: ${BUILD_NUMBER}"
                echo "Git Commit: ${GIT_COMMIT}"
            }
        }

        stage('Create Release Tag') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'github-mugilan-ssh',
                        keyFileVariable: 'SSH_KEY'
                    )
                ]) {
                    bat '''
                        for /f "delims=" %%V in ('npm pkg get version') do set "APP_VERSION=%%~V"
                        set "RELEASE_TAG=v%APP_VERSION%"

                        echo Application Version: %APP_VERSION%
                        echo Release Tag: %RELEASE_TAG%

                        set GIT_SSH_COMMAND=ssh -i "%SSH_KEY%" -o StrictHostKeyChecking=no

                        git fetch --tags origin

                        git rev-parse "%RELEASE_TAG%" >nul 2>&1

                        if errorlevel 1 (
                            echo Creating tag %RELEASE_TAG%
                            git tag %RELEASE_TAG%
                            git push origin %RELEASE_TAG%
                        ) else (
                            echo Tag %RELEASE_TAG% already exists. Skipping tag creation.
                        )
                    '''
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'call npm install'
            }
        }

        stage('Test') {
            steps {
                bat 'call npm test'
            }
        }

        stage('Build React + Electron') {
            steps {
                bat '''
                    if exist "dist_electron\\*" (
                        echo Cleaning previous Electron build...
                        rmdir /s /q "dist_electron"
                    )

                    call npm run build
                '''
            }
        }

        stage('Archive Electron Release') {
            steps {
                archiveArtifacts artifacts: 'dist_electron/**',
                                 fingerprint: true
            }
        }

        stage('Deploy Installer') {
            steps {
                bat '''
                    if exist "%DEPLOY_DIR%" rmdir /s /q "%DEPLOY_DIR%"
                    mkdir "%DEPLOY_DIR%"

                    xcopy "dist_electron\\*" "%DEPLOY_DIR%\\" /E /I /Y
                '''
            }
        }

        stage('Publish GitHub Release') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'github-release-token',
                        variable: 'GH_TOKEN'
                    )
                ]) {
                    bat '''
                        set EP_DRAFT=false
                        set EP_PRE_RELEASE=false
                        call npx electron-builder --publish always
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'CI/CD pipeline completed successfully!'
            echo 'GitHub Release published successfully!'
        }

        failure {
            echo 'CI/CD pipeline failed!'
        }
    }
}