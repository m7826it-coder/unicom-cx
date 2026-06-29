set -e

echo "📦 تثبيت تبعيات Backend..."
cd backend
npm install

echo "🔨 بناء Backend..."
npm run build

echo "📦 تثبيت تبعيات Frontend..."
cd ../frontend
npm install

echo "🔨 بناء Frontend..."
npm run build

echo ""
echo "✅ Build complete. Ready to deploy."
echo ""
echo "   Backend:  cd backend && npm start"
echo "   Frontend: cd frontend && npm start"
echo ""
echo "   أو استخدم منصات النشر:"
echo "   - Backend  → Render"
echo "   - Frontend → Vercel"