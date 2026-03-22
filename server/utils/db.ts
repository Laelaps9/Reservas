import mysql from 'mysql2/promise'

export const db = mysql.createPool({
  host: 'localhost',
  user: 'user',
  password: 'reservas-secret',
  database: 'reservas'
})
