import mysql from 'mysql2/promise'

export const b = mysql.createPool({
  host: 'localhost',
  user: 'user',
  password: 'reservas-secret',
  database: 'reservas'
})
