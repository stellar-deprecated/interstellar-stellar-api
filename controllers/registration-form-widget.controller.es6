import {Intent} from 'mcs-core';
import * as StellarWallet from 'stellar-wallet-js-sdk';
import * as nacl from 'tweetnacl'

class RegistrationFormWidgetController {
  constructor($q, $http, $scope, Sessions, IntentBroadcast, vcRecaptchaService) {
    this.$q = $q;
    this.$http = $http;
    this.$scope = $scope;
    this.Sessions = Sessions;
    this.IntentBroadcast = IntentBroadcast;
    this.vcRecaptchaService = vcRecaptchaService;

    this.errors = {};
    this.username = null;
    this.password = null;
    this.passwordConfirmation = null;
    this.recaptchaResponse = null;
    this.recaptchaKey = '6Ldj4PkSAAAAAL-kG23h3yRo0qSnO1BD3lr5zMEK';
  }

  onRecaptchaSuccess(response) {
    this.recaptchaResponse = response;
  }

  setRecaptchaWidgetId(recaptchaWidgetId) {
    this.recaptchaWidgetId = recaptchaWidgetId;
  }

  register() {
    return this.$q.when()
      .then(() => this._validateInput.call(this))
      .then(() => this._generateSigningKeys.call(this))
      .then(() => this._submitRegistration.call(this))
      .then(() => this._createWallet.call(this))
      .then(() => this._login.call(this))
      .then(() => {
        this.IntentBroadcast.sendBroadcast(
          new Intent(
            Intent.TYPES.SHOW_DASHBOARD
          )
        );
      });
  }

  _validateInput() {
    // Remove any previous error messages.
    this.errors.usernameErrors = [];
    this.errors.passwordErrors = [];
    this.errors.captchaErrors  = [];

    var validInput = true;

    if (!this.recaptchaResponse) {
      validInput = false;
      this.errors.captchaErrors.push("Invalid captcha");
    }

    if (!this.username) {
      validInput = false;
      this.errors.usernameErrors.push('The username field is required.');
    }

    if (!this.password) {
      validInput = false;
      this.errors.passwordErrors.push('The password field is required.');
    }

    if (this.password !== this.passwordConfirmation) {
      validInput = false;
      this.errors.passwordErrors.push('The passwords do not match.');
    }

    if (validInput) {
      return this.$q.when();
    } else {
      return this.$q.reject();
    }
  }

  _generateSigningKeys() {
    this.signingKeys = StellarWallet.util.generateKeyPair();
  }

  _submitRegistration() {
    var deferred = this.$q.defer();

    var params = {
      username: this.username,
      address: this.signingKeys.address,
      newAddress: this.signingKeys.newAddress,
      recaptchaResponse: this.recaptchaResponse
    };

    // Submit the registration data to the server.
    this.$http.post('https://api.stellar.org' + '/user/register', params)
      .success(response => {
        this.authToken = response.data.authToken;
        this.updateToken = response.data.updateToken;
        deferred.resolve();
      })
      .error(response => {
        this.showRegistrationErrors.call(this, response);
        deferred.reject();
      });

    return deferred.promise;
  }

  _createWallet() {
    var deferred = this.$q.defer();

    var keychainData = {
      authToken: this.authToken,
      updateToken: this.updateToken,
      signingKeys: this.signingKeys
    };

    var mainData = {
      username: this.username,
      server: 'https://wallet.stellar.org'
    };

    var proof = RegistrationFormWidgetController.usernameProof(this.signingKeys, this.username);

    StellarWallet.createWallet({
      server: 'https://wallet.stellar.org' + '/v2',
      username: this.username.toLowerCase()+'@stellar.org',
      password: this.password,
      publicKey: this.signingKeys.publicKey,
      keychainData: JSON.stringify(keychainData),
      mainData: JSON.stringify(mainData),
      usernameProof: proof
    }).then(wallet => {
      this.wallet = wallet;
      deferred.resolve();
    }).catch(e => {
      if (e.name === 'UsernameAlreadyTaken') {
        this.errors.usernameErrors.push('The username is taken.');
      } else if (e.name === 'InvalidUsername') {
        this.errors.usernameErrors.push('Username must start and end with a letter, and may contain ".", "_", or "-".');
      } else if (e.name === 'ConnectionError') {
        this.errors.usernameErrors.push('Connection error. Please try again later.');
      } else {
        this.errors.usernameErrors.push('Unknown error. Please try again later.');
      }

      this.vcRecaptchaService.reload(this.recaptchaWidgetId);

      // Release username
      this.$http.post('https://api.stellar.org' + "/failedRegistration", {
        username: this.username,
        updateToken: keychainData.updateToken
      });

      deferred.reject();
      throw e;
    }).finally(() => {
      this.$scope.$apply();
    });

    return deferred.promise;
  }

  _login() {
    let username = this.username;
    let address = this.signingKeys.address;
    let secret = this.signingKeys.secret;
    let data = JSON.parse(this.wallet.getKeychainData());
    let permanent = false;

    this.Sessions.createDefault({username, address, secret, data, permanent})
      .then(() => this.IntentBroadcast.sendBroadcast(new Intent(Intent.TYPES.SHOW_DASHBOARD)));
  }

  static usernameProof(signingKeys, username) {
    var claim = JSON.stringify({
      username: username,
      address: signingKeys.address
    });
    var signature = nacl.sign.detached(
      nacl.util.decodeUTF8(claim),
      nacl.util.decodeBase64(signingKeys.secretKey)
    );
    signature = nacl.util.encodeBase64(signature);
    return {
      claim: claim,
      publicKey: signingKeys.publicKey,
      signature: signature
    };
  }

  showRegistrationErrors(response) {
    this.vcRecaptchaService.reload(this.recaptchaWidgetId);

    if (response && response.status === "fail") {
      var field;
      switch (response.code) {
        case 'already_taken':
          field = response.data && response.data.field;
          if (field === 'username') {
            this.errors.usernameErrors.push('The username is taken');
          }
          break;
        case 'invalid':
          field = response.data && response.data.field;
          if (field === 'username') {
            this.errors.usernameErrors.push('Username must start and end with a letter, and may contain ".", "_", or "-".');
          }
          break;
        case 'captcha':
          this.errors.captchaErrors.push("Captcha incorrect. Do you wonder if you are a robot?");
          break;
        default:
        // TODO: generic error
      }
    } else {
      this.errors.usernameErrors.push('Registration error?');
    }
  }

}

RegistrationFormWidgetController.$inject = ["$q", "$http", "$scope", "mcs-stellard.Sessions", "mcs-core.IntentBroadcast", "vcRecaptchaService"];

module.exports = function(mod) {
  mod.controller("RegistrationFormWidgetController", RegistrationFormWidgetController);
};
