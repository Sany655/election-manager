const express = require('express');
const candidateRoutes = require('./routes/candidateRoutes');
const app = express();

app.use('/api/candidates', candidateRoutes);

const stack = app._router.stack;
const candRoute = stack.find(layer => layer.regexp.toString().includes('candidates'));

if (candRoute && candRoute.handle && candRoute.handle.stack) {
  candRoute.handle.stack.forEach(r => {
    if (r.route) {
      console.log(Object.keys(r.route.methods), r.route.path);
    }
  });
} else {
  console.log("No routes found in candidateRoutes!", candRoute);
}
