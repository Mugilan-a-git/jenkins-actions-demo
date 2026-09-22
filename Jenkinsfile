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
                bat 'call npm run build'
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
    }

    post {
        success {
            echo 'CI/CD pipeline completed successfully!'
            echo 'Electron release artifact created successfully!'
        }

        failure {
            echo 'CI/CD pipeline failed!'
        }
    }
}