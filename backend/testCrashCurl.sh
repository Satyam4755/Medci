#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:5006/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Upload Test Trace","email":"uploadtest-'$(date +%s)'@example.com","password":"password123","role":"Doctor"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Got token: $TOKEN"

curl -v -X PUT http://localhost:5006/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Upload Test Updated" \
  -F "qualification=" \
  -F "experience=" \
  -F "feeMin=" \
  -F "feeMax=" \
  -F "clinicName=" \
  -F "clinicLocation=" \
  -F "medicalRegistrationNumber=" \
  -F "consultationMode[]=Video"
