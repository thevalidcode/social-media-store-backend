#!/bin/bash

echo "🔄 Building Prisma schema from individual model files..."

# Start with the base configuration
cat prisma/base.prisma > prisma/schema.prisma
echo "" >> prisma/schema.prisma

# Add all model files in alphabetical order
for file in prisma/models/*.prisma; do
    if [ -f "$file" ]; then
        echo "📁 Adding $(basename "$file")"
        cat "$file" >> prisma/schema.prisma
        echo "" >> prisma/schema.prisma
    fi
done

echo "✅ Schema built successfully!"
echo "📋 Validating schema..."

# Validate the generated schema
if DATABASE_URL="postgresql://user:password@localhost:5432/database" npx prisma validate --schema prisma/schema.prisma > /dev/null 2>&1; then
    echo "🚀 Schema is valid!"
else
    echo "❌ Schema validation failed. Please check your model files."
    exit 1
fi