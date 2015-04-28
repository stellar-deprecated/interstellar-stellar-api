import { Module, mod as mcsCore } from "mcs-core";

export const mod = new Module('mcs-stellar-api');

mod.controllers = require.context("./controllers", true);
mod.directives  = require.context("./directives", true);
mod.services    = require.context("./services", true);
mod.templates   = require.context("raw!./templates", true);

mod.define();
