module.exports = {
  apps : [
      {
        name: "persona",
        script: "./index.js",
        watch: false,
        instance_var: 'INSTANCE_ID',
        env: {
            "PORT": 4000,
            "NODE_ENV": "production"
        }
      }
  ]
}