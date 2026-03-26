pipeline {
	agent any

	tools {
		nodejs "NodeJS-25.8.2"
	}

	environment {
		NPM_Token = credentials("npm-token")
		DB_TYPE = "MariaDB"
		DB_HOST = "192.168.1.116"
		DB_PORT = "3306"
		DB_USERNAME = credentials("db-username")
		DB_PASSWORD = credentials("db-password")
		DB_NAME = "Employee"
	}

	options{
		timeout(time: 15, unit: "MINUTES")
		disableConcurrentBuilds()
	}

	stages {
		stage("Checkout") {
			steps {
				echo 'Checking Github Repository'
				checkout scm
				echo 'Finished checking Github Repository'
			}
		}

		stage("Install Denpendencies"){
			steps {
				echo 'Performing App Repository Update'
				sh "apt-get update || sudo apt-get update"
				echo "Finished Performing App Repository Update"

			    echo 'Installing System Dependency'
			    sh "apt-get install -y mysql-client || sudo apt-get install -y mysql-client"
			    echo 'Finished Installing System Dependency'
			}
		}

		stage("Verify and Install NPM Packages"){
		    steps {
                echo "Verifying Installation"
                sh "node --version"
                sh "npm --version"

                echo "Installing NPM Packages"
                sh "npm ci"
            }
		}

		stage("Build") {
		    steps {
		        echo 'Building Package'
		        sh "npm run build"
		        echo 'Finished Building Package'
		    }
		}

		stage("Integration Test") {
		    steps {
		        echo 'Extracting Sample Data'
		        sh '''
		            MYSQL_PWD="${DB_PASSWORD}" mysql -u "${DB_USERNAME}"  \
		                -h "${DB_HOST}" -P "${DB_PORT}" "${DB_NAME}" \
		                -e "SELECT * FROM EMPLOYEE LIMIT 500;" --batch \
		                | sed 's/\\t/./g' > /tmp/jenkins-employee.csv
                '''
                echo 'Finished Extracting Sample Data'

                echo 'Generating the NestJS Application'
                sh '''
                    node bin/index.js NestJS generate /tmp/jenkins-employee.csv all \
                        --directory /tmp/jenkins-crud-test
                '''

                dir("/tmp/jenkins-crud-test") {
                    sh "npm install"
                }
                echo 'Finished Generating the NestJS Application'

		        echo "Performing Integration Testing"

		        dir("/tmp/jenkins-crud-test") {
		            sh "node --require ts-node/register --test tests/*.service.spec.ts"
		        }

		        dir("/tmp/jenkins-crud-test") {
		            sh '''
		                DB_TYPE = "${DB_TYPE}" \
		                DB_HOST = "${DB_HOST}" \
		                DB_PORT = "${DB_PORT}" \
		                DB_USERNAME = "${DB_USERNAME}" \
		                DB_PASSWORD = "${DB_PASSWORD}" \
		                DB_NAME = "${DB_NAME}"
		                node --require ts-node/register --test test/*.controller.spec.ts
                    '''
		        }
		    }
		    post {
		        success {
		            sh '''
		                rm -rf /tmp/jenkins-crud-test
		                rm -rf /tmp/jenkins-employee.csv
                    '''
		        }
		    }
		}

		stage("Publish to npm") {
		    when {
		        anyOf {
		            tag pattern: 'v\\d+\\.\\d+\\.\\d+', comparator: 'REGEXP'
		            branch 'main'
		        }
		    }
		    steps {
		        sh '''
		            echo "Publishing to NPM"
		            npm publish --access public
		        '''
		    }
		}
	}

	post {
	    success {
            cleanWs()
            echo "✅ Build #${env.BUILD_NUMBER} passed"
        }
        failure {
            echo "❌ Build #${env.BUILD_NUMBER} failed"
        }
	}
}