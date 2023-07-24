module.exports = {
    apps: [
        {
            name: 'app',
            script: './bin/www',
            instances: 0,
            exec_mode: 'cluster',
            wait_ready: false,
            listen_timeout: 50000,
            kill_timeout: 5000,
            env: {
                "NODE_ENV": "development",
                "PORT": 3000
            },
            env_production: {
                "NODE_ENV": "production",
                "PORT": 8080
            },
        }
    ]
  }
