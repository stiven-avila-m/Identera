#!/usr/bin/env zsh
# deploy-lambda.sh
# Empaqueta y sube el código de una Lambda directamente a AWS.
# Uso: ./deploy-lambda.sh <nombre-dominio>
#   Ej: ./deploy-lambda.sh validaciones
#       ./deploy-lambda.sh usuarios
#       ./deploy-lambda.sh qr
#       ./deploy-lambda.sh carnets
#       ./deploy-lambda.sh all   ← despliega las 4

set -e

HANDLERS_DIR="$(cd "$(dirname "$0")" && pwd)/backend/handlers"
FUNCTION_PREFIX="identera-lambda"

deploy_one() {
  local domain=$1
  local fn_name="${FUNCTION_PREFIX}-${domain}"
  local src="${HANDLERS_DIR}/${domain}"
  local shared="${HANDLERS_DIR}/shared"
  local tmp_dir
  tmp_dir=$(mktemp -d)
  local zip_file="${tmp_dir}/function.zip"

  echo ""
  echo "📦 Empaquetando ${fn_name}..."

  # Copiar código del handler y shared/
  cp -r "${src}/." "${tmp_dir}/"
  cp -r "${shared}" "${tmp_dir}/shared"

  # Instalar dependencias de producción
  (cd "${tmp_dir}" && npm install --omit=dev --silent)

  # Crear ZIP (excluye el propio zip si existiera)
  (cd "${tmp_dir}" && zip -r "${zip_file}" . -x "*.DS_Store" -x "function.zip" > /dev/null)

  echo "🚀 Subiendo a ${fn_name}..."
  aws lambda update-function-code \
    --function-name "${fn_name}" \
    --zip-file "fileb://${zip_file}" \
    --region us-east-1 \
    --output json | python3 -c "
import sys, json
d = json.load(sys.stdin)
size_kb = d['CodeSize'] // 1024
print(f'  ✅ {d[\"FunctionName\"]} — {size_kb} KB subidos')
" 2>/dev/null || echo "  ✅ ${fn_name} actualizada"

  # Limpiar temporales
  rm -rf "${tmp_dir}"
}

# Parsear argumento
TARGET="${1:-all}"

if [[ "$TARGET" == "all" ]]; then
  for d in validaciones usuarios qr carnets; do
    deploy_one "$d"
  done
else
  deploy_one "$TARGET"
fi

echo ""
echo "✨ Deploy completado."
