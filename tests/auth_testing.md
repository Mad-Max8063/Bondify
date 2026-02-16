# Auth-Gated App Testing Playbook

## Step 1: Create Test User & Session
```bash
mongosh --eval "
use('miparada');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.usuarios.insertOne({
  userId: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  nombre: 'Test User',
  picture: 'https://via.placeholder.com/150',
  verificado: true,
  nivel: 5,
  puntos: 250,
  reportesEnviados: 15,
  created_at: new Date()
});
db.user_sessions.insertOne({
  userId: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Test Backend API
```bash
# Test auth endpoint
curl -X GET "http://localhost:8001/api/auth/me" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Test protected endpoints
curl -X GET "http://localhost:8001/api/reportes/cercanos?lat=-34.58&lng=-58.42" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Step 3: Browser Testing
```javascript
// Set cookie and navigate
await page.context.add_cookies([{
    "name": "session_token",
    "value": "YOUR_SESSION_TOKEN",
    "domain": "localhost",
    "path": "/",
    "httpOnly": true,
    "secure": false,
    "sameSite": "Lax"
}]);
await page.goto("http://localhost:3000");
```

## Checklist
- [ ] User document has userId field
- [ ] Session userId matches user's userId exactly
- [ ] All queries exclude MongoDB's _id
- [ ] API returns user data (not 401/404)
- [ ] Dashboard loads without redirect to login

## Success Indicators
✅ /api/auth/me returns user data
✅ App loads after login
✅ Reportes show "Usuario verificado" + nivel + cantidad de reportes
