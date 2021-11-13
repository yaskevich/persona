pm2 delete persona
rm -rf persona
git clone https://github.com/yaskevich/persona  --depth 1
cd persona
hash=`git rev-parse --short HEAD`
# echo $hash
rm -rf .git
cd front
npm install
npm run build
mv dist ../public
cd ../back
npm install
rm ../* 2>/dev/null
rm ../.* 2>/dev/null
cd ../
mv back/* .
rm -rf front back
cp ../persona.env .env
printf "\nCOMMIT=%s" $hash >> .env
pm2 start ecosystem.config.cjs
pm2 save


