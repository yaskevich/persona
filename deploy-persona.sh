pm2 delete persona
rm -rf persona
mkdir -p persona-build
cd persona-build
degit https://github.com/yaskevich/persona#main
cd front
npm install
npm run build
cd ../back
npm install
cd ../../
mv persona-build/back persona
mv persona-build/front/dist persona/public
rm -rf persona-build
cp persona.env persona/.env
cd persona
# # pm2-runtime ecosystem.config.js
pm2 start ecosystem.config.cjs
pm2 save


