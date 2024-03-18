function calcularRegresionLineal (datos) {
  const n = datos.length
  const newData = datos.reverse()
  const mean = newData.reduce((a, b) => a + b, 0) / n
  const stdDev = Math.sqrt(newData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n)

  // Normalizar los datos
  const normalizedData = newData.map(value => (value - mean) / stdDev)

  // Calcular la suma de x, y, x^2, y^2 y xy
  let sumX = 0; let sumY = 0; let sumX2 = 0; let sumY2 = 0; let sumXY = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += normalizedData[i]
    sumX2 += i * i
    sumY2 += normalizedData[i] * normalizedData[i]
    sumXY += i * normalizedData[i]
  }

  // Calcular los coeficientes de la regresión lineal
  const pendiente = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const interseccion = (sumY - pendiente * sumX) / n

  // Calcular el ángulo de inclinación
  const anguloRadianes = Math.atan(pendiente)
  const anguloGrados = anguloRadianes * (180 / Math.PI)

  return { pendiente, interseccion, anguloGrados }
}
