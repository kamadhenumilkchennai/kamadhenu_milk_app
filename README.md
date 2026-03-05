# milk_delivery_app
Milk for all, health for life.


npm i baseline-browser-mapping@latest -D

# Product Info
list of products:
{
  "Milk": {
    "500ml": rs. 45,
    "1L": rs. 85
  },
  "Ghee": {
    "500g": rs. 650,
    "1000g": rs. 1300
  },
  "Butter": {
    "500g": rs. 600,
    "1000g": rs. 1200
  },
  "Paneer": {
    "200g": rs.130
  },
  "CurdLassi": {
    "500ml": rs. 65
  },
  "GroundnutOil": {
    "1L": rs. 300
  },
  "CoconutOil": {
    "1L": rs. 350
  }
}

# deploy to expo
✅ SOLUTION 3 (Nuclear but works)

Recreate git metadata inside container:

rm -rf .git
git init
git config --global protocol.file.allow always
git config --global --add safe.directory /app/reactnative/milk_delivery_app
git add .
git commit -m "Fresh git repo for EAS"


Then:

eas build -p android --profile preview
   