pipeline {
	agent any

	tools {
		nodejs "NodeJS"
	}

	environment {
		NPM_Token = credentials("npm-token")
		DB_TYPE = "mariadb"
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

		stage("Build") {
		    steps {
		        echo 'Building Package'
		        sh "npm install"
		        echo 'Finished Building Package'
		    }
		}

		stage("Test") {
		    steps {
		        echo 'Extracting Sample Data'
		        sh '''
		            MYSQL_PWD="${DB_PASSWORD}" mysql -u "${DB_USERNAME}"  \
		                -h "${DB_HOST}" -P "${DB_PORT}" "${DB_NAME}" \
		                -e "SELECT * FROM Employee LIMIT 500;" --batch \
		                | tr '\t' ',' > /tmp/Employee.csv
                '''
                sh "head -2 /tmp/Employee.csv"
                echo 'Finished Extracting Sample Data'

                echo 'Generating the NestJS Application'
                sh '''
                    node bin/index.js NestJS generate /tmp/Employee.csv all \
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
		                export DB_TYPE="${DB_TYPE}"
		                export DB_HOST="${DB_HOST}"
		                export DB_PORT="${DB_PORT}"
		                export DB_USERNAME="${DB_USERNAME}"
		                export DB_PASSWORD="${DB_PASSWORD}"
		                export DB_NAME="${DB_NAME}"
		                node --require ts-node/register --test tests/*.controller.spec.ts
                    '''
		        }
		    }
		    post {
                always {
		            sh '''
		                rm -rf /tmp/jenkins-crud-test
		                rm -rf /tmp/Employee.csv
                    '''
		        }
		    }
		}

		stage("Publish to npm") {
		    when {
		        anyOf {
		            tag pattern: 'v\\d+\\.\\d+\\.\\d+', comparator: 'REGEXP'
		            expression { env.GIT_BRANCH == 'origin/master' }
		        }
		    }
		    steps {
		        sh '''
		            echo "//registry.npmjs.org/:_authToken=${NPM_Token}" > ~/.npmrc
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