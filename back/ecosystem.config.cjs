module.exports = {
  apps : [
      {
        name: "persona",
        script: "./index.js",
        watch: false,
        instance_var: 'INSTANCE_ID',
        env: {
            "NODE_ENV": "production"
        }
      }
  ]
}
