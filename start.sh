#!/data/data/com.termux/files/usr/bin/bash
cd ~/YouPI-PG
mkdir -p node_modules/@youpi
for pkg in packages/*; do ln -s $(pwd)/$pkg node_modules/@youpi/$(basename $pkg) 2>/dev/null; done
pkill -f "node scripts/dev.js" 2>/dev/null
node apps/bharatpe-observer.js > bharatpe.log 2>&1 &
nohup npm run dev > dev.log 2>&1 &
sleep 4
echo "=========================================="
echo "🚀 YOUPI-PG Chalu Ho Gaya Hai!"
echo "Admin Hub:   http://localhost:6001"
echo "Demo Store:  http://localhost:5000"
echo "Checkout:    http://localhost:7000"
echo "=========================================="
echo "🔑 Aapka Admin Token:"
cat data/.secrets/admin_api_token 2>/dev/null
echo ""
echo "=========================================="
