#!/bin/bash

OLD_REPO="https://raw.githubusercontent.com/tclaret/phenakistoscope-simulator/main/images"
NEW_REPO="https://raw.githubusercontent.com/tclaret/phenaki-lab/main/img"

echo "Checking OLD repository images..."
for img in "WomanChoppingTree.jpg" "Dancing.jpg" "Jongleur.png" "a_cheval.png" "McLean_1.png" "Gernamy_1949_R_Balzer.png" "AEO175939_PhenakistoscopeGiroux60.jpg" "AEO185553_PhenakistiscopeDisc_ManInBlueAndRed.jpg" "medium_1990_5036_3369.jpg" "medium_a001813b.jpg" "tumblr_obd6fhGFSZ1r9jbwno1_500.png" "tumblr_oc1czn99ZM1r9jbwno1_500.png" "Phantasmascope_faces.png" "722a6790240569.5e126845d9b56.png" "fantascope-disc-1833.png"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$OLD_REPO/$img")
  if [ "$STATUS" = "200" ]; then
    echo "✓ $img"
  else
    echo "✗ $img (HTTP $STATUS)"
  fi
done

echo ""
echo "Checking NEW repository images..."
for img in "a_face__.jpg" "culbute.jpg" "Grenouille__.jpg" "oh_soccer.jpg" "un_grand_un_petit.jpg" "autre_culbutte.jpg" "dancing_.jpg" "il_pompe_de_leau.jpg" "porceline.jpg" "volants_.png" "ce_qui.jpg" "des_anges.jpg" "moulin_.jpg" "rats__.jpg" "corde_a_denser_.jpg" "ecureuil.jpg" "noel_noel.jpg" "tirreur_.jpg" "c_pastel.jpg" "geometrique.jpg" "nuages_en_scie.jpg" "tons_pastels.jpg" "DesOuaisaux.png" "feels_like_flying.png" "GrosMeusieur.png" "Jongle_avec_les_otaries.png"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$NEW_REPO/$img")
  if [ "$STATUS" = "200" ]; then
    echo "✓ $img"
  else
    echo "✗ $img (HTTP $STATUS)"
  fi
done
