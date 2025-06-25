const express = require('express'); //import express
const { PrismaClient } = require('@prisma/client'); // require prisma client
const router = express.Router(); // import express router
const prisma = new PrismaClient(); // create new prisma client
