require('angular-recaptcha');
import {Module} from "interstellar-core";
import interstellarSessions from "interstellar-sessions";

const mod = new Module('interstellar-stellar-api');
export default mod;

mod.use('vcRecaptcha');
mod.use(interstellarSessions);

mod.controllers = require.context("./controllers", true);
mod.directives  = require.context("./directives", true);
mod.services    = require.context("./services", true);
mod.templates   = require.context("raw!./templates", true);

mod.define();
