"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const csrf = require("csurf");

const {asyncMiddleware} = require("../middleware");
const {post, get, getFullReport, getLatestBreaches} = require("../controllers/scan");


const router = express.Router();
const urlEncodedParser = bodyParser.urlencoded({ extended: false });
const csrfProtection = csrf();

router.post("/", urlEncodedParser, csrfProtection, asyncMiddleware(post));
router.get("/", get);
router.get("/full_report", getFullReport);
router.get("/latest_breaches", getLatestBreaches);

module.exports = router;
