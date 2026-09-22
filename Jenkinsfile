pipeline {
    agent any

    environment {
        DEPLOY_DIR = 'C:\\DataSwitch\\Jenkins\\deployment'
        APP_NAME = 'Jenkins Demo App'
    }

    stages {

stage('Build Information') {
    steps {
        bat 'call npm pkg get version'
        echo "Application: ${APP_NAME}"
        echo "Environment: ${params.ENVIRONMENT}"
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

        stage('Build') {
            steps {
                bat 'call npm run build'
            }
        }

        stage('Archive Artifact') {
            steps {
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }

        stage('Deploy') {
            steps {
                bat '''
                    if exist "%DEPLOY_DIR%" rmdir /s /q "%DEPLOY_DIR%"
                    mkdir "%DEPLOY_DIR%"
                    xcopy "dist\\*" "%DEPLOY_DIR%\\" /E /I /Y
                '''
            }
        }
    }

    post {
        success {
            echo 'CI/CD pipeline completed successfully!'
        }

        failure {
            echo 'CI/CD pipeline failed!'
        }
    }
}