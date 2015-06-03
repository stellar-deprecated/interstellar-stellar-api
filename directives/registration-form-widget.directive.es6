let registrationFormWidget = function () {
  return {
    restrict: "E",
    transclude: true,
    templateUrl: "interstellar-stellar-api/registration-form-widget"
  }
};

module.exports = function(mod) {
  mod.directive("registrationForm", registrationFormWidget);
};
