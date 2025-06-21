var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = process.env.client_ID;
const client = new OAuth2Client(CLIENT_ID);
const { body, validationResult } = require('express-validator');
