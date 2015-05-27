require('angular-recaptcha');
import {Module} from "mcs-core";

const mod = new Module('mcs-stellar-api');

mod.use('vcRecaptcha');

mod.controllers = require.context("./controllers", true);
mod.directives  = require.context("./directives", true);
mod.services    = require.context("./services", true);
mod.templates   = require.context("raw!./templates", true);

mod.define();
export default mod;
