let registrationFormWidget = function () {
  return {
    restrict: "E",
    transclude: true,
    templateUrl: "mcs-stellar-api/registration-form-widget"
  }
};

module.exports = function(mod) {
  mod.directive("registrationForm", registrationFormWidget);
};
