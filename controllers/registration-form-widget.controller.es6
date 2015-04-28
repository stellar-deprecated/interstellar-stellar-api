export class RegistrationFormWidgetController {
  constructor(sessions) {
    //
  }
}

RegistrationFormWidgetController.$inject = ["mcs-stellard.Sessions"];

module.exports = function(mod) {
  mod.controller("RegistrationFormWidgetController", RegistrationFormWidgetController);
};