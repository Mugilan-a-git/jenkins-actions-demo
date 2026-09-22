pipeline {
    agent any

    stages {

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
                    if exist "C:\\DataSwitch\\Jenkins\\deployment" rmdir /s /q "C:\\DataSwitch\\Jenkins\\deployment"
                    mkdir "C:\\DataSwitch\\Jenkins\\deployment"
                    xcopy "dist\\*" "C:\\DataSwitch\\Jenkins\\deployment\\" /E /I /Y
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