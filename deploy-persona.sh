SCRIPT=$(basename "$0")
[[ $SCRIPT =~ ([^-]*)-(.*)\.sh ]]
NAME=${BASH_REMATCH[2]}
# echo "${NAME}"

if [[ -z "$NAME" ]]; then
    echo 'Project name is empty. Quitting'
    exit
fi

if [ ! -f $NAME.env ]; then
    echo "ENV file '$NAME.env'was not found. Quitting..."
    exit
fi

# echo "Project name is '$NAME'"

pm2 delete $NAME
rm -rf $NAME
git clone https://github.com/yaskevich/persona $NAME --depth 1
cd $NAME
hash=`git rev-parse --short HEAD`
# echo $hash
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
rm -rf .git front back
cp ../$NAME.env .env
printf "\nCOMMIT=%s" $hash >> .env
pm2 start ecosystem.config.cjs
pm2 save
