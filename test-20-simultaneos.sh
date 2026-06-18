#!/bin/bash
BASE_URL="${1:-http://localhost:3000}"
echo "Probando 20 turnos simultaneos contra $BASE_URL"
echo "================================================"

# Generar cédulas ecuatorianas válidas con Node.js
CEDULAS=$(node -e "
function validCedula(n) {
  const base = '10' + String(n).padStart(7, '0');
  const coeffs = [2,1,2,1,2,1,2,1,2];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let prod = Number(base[i]) * coeffs[i];
    sum += prod >= 10 ? prod - 9 : prod;
  }
  const check = (10 - (sum % 10)) % 10;
  console.log(base + check);
}
for (let i = 1; i <= 20; i++) validCedula(i);
")

echo "Cédulas generadas:"
echo "$CEDULAS" | tr '\n' ' '
echo ""
echo ""

IDX=0
for CEDULA in $CEDULAS; do
  IDX=$((IDX + 1))
  i=$(printf "%02d" $IDX)
  TIMESTAMP=$(date +%s%N)
  TELEFONO="0999990${i}0"

  (
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/turno?action=asignar" \
      -H "Content-Type: application/json" \
      -H "X-Forwarded-For: 10.0.0.$IDX" \
      -d "{
        \"requestId\": \"test-$i-$TIMESTAMP\",
        \"nombres\": \"Test$IDX\",
        \"apellidos\": \"Usuario$IDX\",
        \"cedula\": \"$CEDULA\",
        \"email\": \"test$IDX@ejemplo.com\",
        \"telefono\": \"$TELEFONO\",
        \"servicio\": \"Prueba Concurrente\",
        \"modalidad\": \"En linea\",
        \"origen\": \"TEST\",
        \"pais\": \"Ecuador\",
        \"prefijoTelefonico\": \"+593\"
      }" 2>&1)

    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | head -n -1)

    echo "[req-$i] HTTP $HTTP_CODE | $BODY"
  ) &
done

wait
echo ""
echo "================================================"
echo " Todas las requests completadas"
echo " Revisa los turnos arriba y en Microsoft List"
echo "================================================"
